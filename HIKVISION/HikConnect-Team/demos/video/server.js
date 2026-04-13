/**
 * Servidor proxy para HikConnect OpenAPI Demo
 * Resuelve restricciones CORS al redirigir las solicitudes al servidor HikConnect.
 *
 * Uso:
 *   npm install
 *   npm start  →  http://localhost:3000
 */

const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname)));

// Dominios permitidos para el proxy (seguridad)
const ALLOWED_DOMAINS = [
    'hikcentralconnect.com',
    'hikcentralconnectru.com',
    'ezvizlife.com',
];

function isAllowedUrl(url) {
    try {
        const { hostname } = new URL(url);
        return ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
    } catch {
        return false;
    }
}

// Agente HTTPS que omite verificación de certificado (solo para demo)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.post('/proxy', (req, res) => {
    const { url, method = 'POST', headers = {}, body } = req.body;

    if (!url) {
        return res.status(400).json({ message: 'Falta el parámetro url' });
    }
    if (!isAllowedUrl(url)) {
        return res.status(403).json({ message: `Dominio no permitido: ${new URL(url).hostname}` });
    }

    let urlObj;
    try {
        urlObj = new URL(url);
    } catch {
        return res.status(400).json({ message: 'URL inválida' });
    }

    const isHttps = urlObj.protocol === 'https:';
    const port = urlObj.port || (isHttps ? 443 : 80);

    const bodyStr = (body && method.toUpperCase() !== 'GET') ? JSON.stringify(body) : '';

    const reqHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
    };
    if (bodyStr) reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr);

    const options = {
        hostname: urlObj.hostname,
        port,
        path: urlObj.pathname + urlObj.search,
        method: method.toUpperCase(),
        headers: reqHeaders,
        agent: isHttps ? httpsAgent : undefined,
        timeout: 20000,
    };

    const protocol = isHttps ? https : http;

    const tag = `[${method.toUpperCase()}] ${urlObj.pathname}`;
    console.log(`\n→ ${tag}`);
    if (bodyStr) console.log('  body:', bodyStr);

    const proxyReq = protocol.request(options, (proxyRes) => {
        let data = '';
        proxyRes.on('data', chunk => (data += chunk));
        proxyRes.on('end', () => {
            console.log(`← ${tag} — HTTP ${proxyRes.statusCode} — ${data.length} bytes`);
            try {
                const parsed = JSON.parse(data);
                if (parsed.errorCode && parsed.errorCode !== '0' && parsed.errorCode !== 0) {
                    console.log('  ⚠ errorCode:', parsed.errorCode, '|', parsed.errorMsg ?? parsed.message ?? '');
                }
                res.status(proxyRes.statusCode).json(parsed);
            } catch {
                console.log('  (respuesta no-JSON)');
                res.status(proxyRes.statusCode).type('text').send(data);
            }
        });
    });

    proxyReq.on('timeout', () => {
        proxyReq.destroy();
        console.log(`← ${tag} — TIMEOUT`);
        if (!res.headersSent) res.status(504).json({ message: 'Tiempo de espera agotado (20 s)' });
    });

    proxyReq.on('error', (e) => {
        console.log(`← ${tag} — ERROR: ${e.message}`);
        if (!res.headersSent) res.status(502).json({ message: `Error de proxy: ${e.message}` });
    });

    if (bodyStr) proxyReq.write(bodyStr);
    proxyReq.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n  HikConnect OpenAPI Demo`);
    console.log(`  ─────────────────────────────────────`);
    console.log(`  URL:  http://localhost:${PORT}`);
    console.log(`  Ctrl+C para detener\n`);
});
