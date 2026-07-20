/**
 * Servidor proxy para el demo de Hik DeviceGateway (HikGateway)
 * ------------------------------------------------------------------
 * El navegador no puede llamar directamente a la API del gateway:
 *   1. La API usa autenticación HTTP Digest (challenge-response), que
 *      fetch/XHR no resuelven cómodamente desde el front.
 *   2. El gateway suele exponerse por HTTP (o HTTPS con certificado
 *      autofirmado) en una IP/host on-premise, lo que provoca bloqueos
 *      por CORS y por contenido mixto.
 *
 * Este proxy recibe { url, method, headers, body, auth:{user,password} },
 * resuelve el handshake Digest MD5 contra el gateway y devuelve la
 * respuesta al front.
 *
 * Uso:
 *   npm install
 *   ALLOWED_GATEWAYS=mi-gateway.midominio.com npm start   →  http://localhost:3000
 *
 * NOTA: este archivo comparte su lógica de seguridad (ALLOWED_GATEWAYS +
 * isAllowedUrl) con worker.js. Si cambias una, cambia la otra.
 */

const express = require('express');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(express.static(path.join(__dirname)));

// ─────────────────────────────────────────────────────────────
// Seguridad: lista blanca de gateways permitidos (anti-SSRF)
// A diferencia de un servicio cloud con dominios fijos, el gateway es
// on-premise y su host lo define el usuario. Define ALLOWED_GATEWAYS
// (lista separada por comas) para restringir a qué hosts puede llamar
// el proxy. Si se deja vacío, se permite cualquier host (solo demo).
// ─────────────────────────────────────────────────────────────
const ALLOWED_GATEWAYS = (process.env.ALLOWED_GATEWAYS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

function isAllowedUrl(url) {
    try {
        const { hostname } = new URL(url);
        if (ALLOWED_GATEWAYS.length === 0) return true; // modo abierto (solo demo)
        const host = hostname.toLowerCase();
        return ALLOWED_GATEWAYS.some((d) => host === d || host.endsWith(`.${d}`));
    } catch {
        return false;
    }
}

// Agente HTTPS que omite verificación de certificado (solo para demo:
// los gateways on-premise suelen usar certificados autofirmados).
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// ─────────────────────────────────────────────────────────────
// Autenticación HTTP Digest (RFC 2617), algoritmo MD5
// ─────────────────────────────────────────────────────────────
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');

function parseDigestChallenge(header) {
    // header = 'Digest qop="auth", realm="...", nonce="...", opaque="..."'
    const out = {};
    const body = header.replace(/^Digest\s+/i, '');
    const re = /(\w+)=(?:"([^"]*)"|([^,]*))/g;
    let m;
    while ((m = re.exec(body)) !== null) {
        out[m[1]] = m[2] !== undefined ? m[2] : (m[3] || '').trim();
    }
    return out;
}

function buildDigestHeader({ user, password, method, uri, challenge }) {
    const realm = challenge.realm || '';
    const nonce = challenge.nonce || '';
    const opaque = challenge.opaque;
    const algorithm = (challenge.algorithm || 'MD5').toUpperCase();
    // qop puede venir como "auth" o "auth,auth-int": elegimos auth
    const qop = challenge.qop
        ? challenge.qop.split(',').map((s) => s.trim()).includes('auth')
            ? 'auth'
            : challenge.qop.split(',')[0].trim()
        : null;

    const ha1 = md5(`${user}:${realm}:${password}`);
    const ha2 = md5(`${method.toUpperCase()}:${uri}`);

    let response;
    let header;
    if (qop) {
        const nc = '00000001';
        const cnonce = crypto.randomBytes(8).toString('hex');
        response = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
        header =
            `Digest username="${user}", realm="${realm}", nonce="${nonce}", ` +
            `uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", ` +
            `response="${response}", algorithm=${algorithm}`;
    } else {
        response = md5(`${ha1}:${nonce}:${ha2}`);
        header =
            `Digest username="${user}", realm="${realm}", nonce="${nonce}", ` +
            `uri="${uri}", response="${response}", algorithm=${algorithm}`;
    }
    if (opaque) header += `, opaque="${opaque}"`;
    return header;
}

// Realiza una petición HTTP/HTTPS y devuelve { statusCode, headers, body(Buffer) }
function rawRequest(urlObj, { method, headers, bodyBuffer }) {
    return new Promise((resolve, reject) => {
        const isHttps = urlObj.protocol === 'https:';
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method,
            headers,
            agent: isHttps ? httpsAgent : undefined,
            timeout: 25000,
        };
        const lib = isHttps ? https : http;
        const req = lib.request(options, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () =>
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: Buffer.concat(chunks),
                })
            );
        });
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Tiempo de espera agotado (25 s)'));
        });
        req.on('error', reject);
        if (bodyBuffer && method !== 'GET' && method !== 'HEAD') req.write(bodyBuffer);
        req.end();
    });
}

app.post('/proxy', async (req, res) => {
    const { url, method = 'GET', headers = {}, body, auth } = req.body || {};

    if (!url) return res.status(400).json({ message: 'Falta el parámetro url' });
    if (!isAllowedUrl(url)) {
        let host = '';
        try { host = new URL(url).hostname; } catch {}
        return res.status(403).json({ message: `Host no permitido: ${host}` });
    }

    let urlObj;
    try { urlObj = new URL(url); } catch { return res.status(400).json({ message: 'URL inválida' }); }

    const upMethod = method.toUpperCase();
    const uri = urlObj.pathname + urlObj.search;

    // Cuerpo: objeto → JSON; string → texto plano; nada → sin cuerpo
    let bodyBuffer;
    let contentType = headers['Content-Type'] || headers['content-type'];
    if (body !== undefined && body !== null && upMethod !== 'GET') {
        if (typeof body === 'string') {
            bodyBuffer = Buffer.from(body, 'utf8');
            if (!contentType) contentType = 'text/plain';
        } else {
            bodyBuffer = Buffer.from(JSON.stringify(body), 'utf8');
            if (!contentType) contentType = 'application/json';
        }
    }

    const baseHeaders = { Accept: 'application/json', ...headers };
    if (contentType) baseHeaders['Content-Type'] = contentType;
    if (bodyBuffer) baseHeaders['Content-Length'] = bodyBuffer.length;

    const tag = `[${upMethod}] ${urlObj.pathname}`;
    console.log(`\n→ ${tag}`);

    try {
        // 1er intento (dispara el reto 401 Digest)
        let first = await rawRequest(urlObj, { method: upMethod, headers: baseHeaders, bodyBuffer });

        let final = first;
        const wwwAuth = first.headers['www-authenticate'];
        if (first.statusCode === 401 && wwwAuth && /digest/i.test(wwwAuth) && auth && auth.user) {
            const challenge = parseDigestChallenge(wwwAuth);
            const authHeader = buildDigestHeader({
                user: auth.user,
                password: auth.password || '',
                method: upMethod,
                uri,
                challenge,
            });
            // 2do intento con Authorization: Digest
            final = await rawRequest(urlObj, {
                method: upMethod,
                headers: { ...baseHeaders, Authorization: authHeader },
                bodyBuffer,
            });
        }

        console.log(`← ${tag} — HTTP ${final.statusCode} — ${final.body.length} bytes`);

        const resType = final.headers['content-type'] || '';
        res.status(final.statusCode);
        // Imágenes/binarios: reenviar tal cual (captura, descarga de foto)
        if (/^image\//i.test(resType) || /octet-stream/i.test(resType)) {
            res.type(resType);
            return res.send(final.body);
        }
        const text = final.body.toString('utf8');
        try {
            return res.json(JSON.parse(text));
        } catch {
            return res.type(resType || 'text/plain').send(text);
        }
    } catch (e) {
        console.log(`← ${tag} — ERROR: ${e.message}`);
        if (!res.headersSent) res.status(502).json({ message: `Error de proxy: ${e.message}` });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n  Hik DeviceGateway — Demo`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  URL:  http://localhost:${PORT}`);
    console.log(
        `  Gateways permitidos: ${ALLOWED_GATEWAYS.length ? ALLOWED_GATEWAYS.join(', ') : '(cualquiera — modo abierto, solo demo)'}`
    );
    console.log(`  Ctrl+C para detener\n`);
});
