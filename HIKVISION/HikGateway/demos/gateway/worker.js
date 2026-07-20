/**
 * Cloudflare Worker — Demo de Hik DeviceGateway (HikGateway)
 * ------------------------------------------------------------------
 * Sirve los archivos estáticos del demo y actúa como proxy hacia el
 * gateway, resolviendo el handshake HTTP Digest (MD5) del lado servidor.
 *
 * A diferencia de Node, el runtime de Workers NO permite desactivar la
 * verificación TLS ni ofrece MD5 en Web Crypto, por eso:
 *   - La ruta Cloudflare requiere que el gateway use HTTP o HTTPS válido.
 *   - Se incluye una implementación de MD5 en JS puro (más abajo).
 *
 * Despliegue:
 *   npx wrangler deploy
 *   npx wrangler secret put ... / var ALLOWED_GATEWAYS en wrangler.toml
 *
 * NOTA: comparte su lógica de seguridad (ALLOWED_GATEWAYS + isAllowedUrl)
 * con server.js. Si cambias una, cambia la otra.
 */

// ─────────────────────────────────────────────────────────────
// Seguridad: lista blanca de gateways permitidos (anti-SSRF).
// Se lee de env.ALLOWED_GATEWAYS (lista separada por comas). Vacío =
// se permite cualquier host (solo demo).
// ─────────────────────────────────────────────────────────────
function allowedList(env) {
    return (env.ALLOWED_GATEWAYS || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

function isAllowedUrl(url, env) {
    try {
        const { hostname } = new URL(url);
        const list = allowedList(env);
        if (list.length === 0) return true; // modo abierto (solo demo)
        const host = hostname.toLowerCase();
        return list.some((d) => host === d || host.endsWith(`.${d}`));
    } catch {
        return false;
    }
}

// ─────────────────────────────────────────────────────────────
// Autenticación HTTP Digest (RFC 2617), algoritmo MD5
// ─────────────────────────────────────────────────────────────
function parseDigestChallenge(header) {
    const out = {};
    const body = header.replace(/^Digest\s+/i, '');
    const re = /(\w+)=(?:"([^"]*)"|([^,]*))/g;
    let m;
    while ((m = re.exec(body)) !== null) {
        out[m[1]] = m[2] !== undefined ? m[2] : (m[3] || '').trim();
    }
    return out;
}

function randomCnonce() {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function buildDigestHeader({ user, password, method, uri, challenge }) {
    const realm = challenge.realm || '';
    const nonce = challenge.nonce || '';
    const opaque = challenge.opaque;
    const algorithm = (challenge.algorithm || 'MD5').toUpperCase();
    const qop = challenge.qop
        ? challenge.qop.split(',').map((s) => s.trim()).includes('auth')
            ? 'auth'
            : challenge.qop.split(',')[0].trim()
        : null;

    const ha1 = md5(`${user}:${realm}:${password}`);
    const ha2 = md5(`${method.toUpperCase()}:${uri}`);

    let header;
    if (qop) {
        const nc = '00000001';
        const cnonce = randomCnonce();
        const response = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
        header =
            `Digest username="${user}", realm="${realm}", nonce="${nonce}", ` +
            `uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", ` +
            `response="${response}", algorithm=${algorithm}`;
    } else {
        const response = md5(`${ha1}:${nonce}:${ha2}`);
        header =
            `Digest username="${user}", realm="${realm}", nonce="${nonce}", ` +
            `uri="${uri}", response="${response}", algorithm=${algorithm}`;
    }
    if (opaque) header += `, opaque="${opaque}"`;
    return header;
}

async function handleProxy(request, env) {
    let payload;
    try {
        payload = await request.json();
    } catch {
        return Response.json({ message: 'Body JSON inválido' }, { status: 400 });
    }

    const { url, method = 'GET', headers = {}, body, auth } = payload;

    if (!url) return Response.json({ message: 'Falta el parámetro url' }, { status: 400 });
    if (!isAllowedUrl(url, env)) {
        let host = '';
        try { host = new URL(url).hostname; } catch {}
        return Response.json({ message: `Host no permitido: ${host}` }, { status: 403 });
    }

    let urlObj;
    try { urlObj = new URL(url); } catch { return Response.json({ message: 'URL inválida' }, { status: 400 }); }

    const upMethod = method.toUpperCase();
    const uri = urlObj.pathname + urlObj.search;

    // Cuerpo: objeto → JSON; string → texto plano; nada → sin cuerpo
    let bodyStr;
    let contentType = headers['Content-Type'] || headers['content-type'];
    if (body !== undefined && body !== null && upMethod !== 'GET') {
        if (typeof body === 'string') {
            bodyStr = body;
            if (!contentType) contentType = 'text/plain';
        } else {
            bodyStr = JSON.stringify(body);
            if (!contentType) contentType = 'application/json';
        }
    }

    function buildHeaders(extra) {
        const h = new Headers({ Accept: 'application/json', ...headers, ...extra });
        if (contentType) h.set('Content-Type', contentType);
        h.delete('host'); // Cloudflare no permite reenviar host
        return h;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
        const baseInit = {
            method: upMethod,
            body: bodyStr,
            signal: controller.signal,
            redirect: 'manual',
        };

        // 1er intento (dispara el reto 401 Digest)
        let resp = await fetch(url, { ...baseInit, headers: buildHeaders() });

        const wwwAuth = resp.headers.get('www-authenticate');
        if (resp.status === 401 && wwwAuth && /digest/i.test(wwwAuth) && auth && auth.user) {
            const challenge = parseDigestChallenge(wwwAuth);
            const authHeader = buildDigestHeader({
                user: auth.user,
                password: auth.password || '',
                method: upMethod,
                uri,
                challenge,
            });
            resp = await fetch(url, { ...baseInit, headers: buildHeaders({ Authorization: authHeader }) });
        }

        clearTimeout(timeout);

        const resType = resp.headers.get('content-type') || '';
        if (/^image\//i.test(resType) || /octet-stream/i.test(resType)) {
            const buf = await resp.arrayBuffer();
            return new Response(buf, { status: resp.status, headers: { 'Content-Type': resType } });
        }
        const text = await resp.text();
        try {
            return Response.json(JSON.parse(text), { status: resp.status });
        } catch {
            return new Response(text, { status: resp.status, headers: { 'Content-Type': resType || 'text/plain' } });
        }
    } catch (e) {
        clearTimeout(timeout);
        if (e.name === 'AbortError') {
            return Response.json({ message: 'Tiempo de espera agotado (25 s)' }, { status: 504 });
        }
        return Response.json({ message: `Error de proxy: ${e.message}` }, { status: 502 });
    }
}

export default {
    async fetch(request, env) {
        const { pathname } = new URL(request.url);
        if (pathname === '/proxy' && request.method === 'POST') {
            return handleProxy(request, env);
        }
        return env.ASSETS.fetch(request);
    },
};

// ═════════════════════════════════════════════════════════════
// MD5 en JavaScript puro (blueimp-md5, licencia MIT).
// Necesario porque Web Crypto (crypto.subtle) no ofrece MD5.
// ═════════════════════════════════════════════════════════════
function md5(string) {
    function safeAdd(x, y) {
        const lsw = (x & 0xffff) + (y & 0xffff);
        const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
    }
    function rol(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
    function cmn(q, a, b, x, s, t) { return safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }
    function binlMD5(x, len) {
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
        for (let i = 0; i < x.length; i += 16) {
            const olda = a, oldb = b, oldc = c, oldd = d;
            a = ff(a, b, c, d, x[i], 7, -680876936);
            d = ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = ff(c, d, a, b, x[i + 10], 17, -42063);
            b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = gg(b, c, d, a, x[i], 20, -373897302);
            a = gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = hh(a, b, c, d, x[i + 5], 4, -378558);
            d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = hh(d, a, b, c, x[i], 11, -358537222);
            c = hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = ii(a, b, c, d, x[i], 6, -198630844);
            d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = ii(b, c, d, a, x[i + 9], 21, -343485551);
            a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd);
        }
        return [a, b, c, d];
    }
    function binl2rstr(input) {
        let output = '';
        const len = input.length * 32;
        for (let i = 0; i < len; i += 8) output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff);
        return output;
    }
    function rstr2binl(input) {
        const output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (let i = 0; i < output.length; i += 1) output[i] = 0;
        const len = input.length * 8;
        for (let i = 0; i < len; i += 8) output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32);
        return output;
    }
    function rstr2hex(input) {
        const hexTab = '0123456789abcdef';
        let output = '';
        for (let i = 0; i < input.length; i += 1) {
            const x = input.charCodeAt(i);
            output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
        }
        return output;
    }
    const utf8 = unescape(encodeURIComponent(string));
    return rstr2hex(binl2rstr(binlMD5(rstr2binl(utf8), utf8.length * 8)));
}
