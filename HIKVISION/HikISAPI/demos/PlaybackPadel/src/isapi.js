import { createHash, randomBytes } from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';
import { ClipError } from './clip.js';

const md5 = (value) => createHash('md5').update(value, 'utf8').digest('hex');
const MAX_BYTES = 200 * 1024 * 1024;

export function digestResponse(input) {
  const ha1 = md5(`${input.user}:${input.realm}:${input.pass}`);
  const ha2 = md5(`${input.method.toUpperCase()}:${input.uri}`);
  return input.qop
    ? md5(`${ha1}:${input.nonce}:${input.nc}:${input.cnonce}:${input.qop}:${ha2}`)
    : md5(`${ha1}:${input.nonce}:${ha2}`);
}

export function parseDigestChallenge(header) {
  if (!header || !/^digest\s/i.test(String(header).trim())) return null;
  const out = {};
  const body = String(header).trim().replace(/^digest\s+/i, '');
  for (const match of body.matchAll(/([a-zA-Z]+)=("([^"]*)"|([^,\s]*))/g)) {
    out[match[1].toLowerCase()] = match[3] ?? match[4] ?? '';
  }
  if (!out.realm || !out.nonce) return null;
  let qop;
  if (out.qop) {
    const modes = out.qop.split(',').map((item) => item.trim()).filter(Boolean);
    qop = modes.includes('auth') ? 'auth' : modes[0];
  }
  return {
    realm: out.realm,
    nonce: out.nonce,
    opaque: out.opaque,
    algorithm: out.algorithm,
    qop,
  };
}

export function buildAuthorization(user, pass, method, uri, challenge) {
  const algorithm = (challenge.algorithm || 'MD5').toUpperCase();
  if (algorithm !== 'MD5') throw new ClipError('Este grabador no ofrece Digest MD5.', 'AUTH');
  if (challenge.qop && challenge.qop !== 'auth') {
    throw new ClipError('Este grabador pide un Digest que este panel no habla.', 'AUTH');
  }
  const nc = '00000001';
  const cnonce = randomBytes(8).toString('hex');
  const response = digestResponse({
    user,
    pass,
    realm: challenge.realm,
    nonce: challenge.nonce,
    method,
    uri,
    qop: challenge.qop ? 'auth' : undefined,
    nc,
    cnonce,
  });
  const parts = [
    `username="${user}"`,
    `realm="${challenge.realm}"`,
    `nonce="${challenge.nonce}"`,
    `uri="${uri}"`,
  ];
  if (challenge.qop) parts.push('qop=auth', `nc=${nc}`, `cnonce="${cnonce}"`);
  parts.push(`response="${response}"`);
  if (challenge.opaque) parts.push(`opaque="${challenge.opaque}"`);
  if (challenge.algorithm) parts.push(`algorithm=${challenge.algorithm}`);
  return `Digest ${parts.join(', ')}`;
}

function headerValue(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value ?? null;
}

function statusText(body) {
  const text = Buffer.isBuffer(body) ? body.toString('utf8') : '';
  if (!text.startsWith('<')) return '';
  const match = /<statusString>([^<]*)<\/statusString>/i.exec(text);
  return match ? match[1].trim() : '';
}

function rawRequest(device, { method, path, headers, body, timeoutMs }) {
  const lib = device.https ? https : http;
  const options = {
    host: device.host,
    port: device.port || (device.https ? 443 : 80),
    method,
    path,
    headers,
    timeout: timeoutMs,
  };
  if (device.https) options.rejectUnauthorized = false;
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      reject(err instanceof ClipError ? err : new ClipError('No hay respuesta del grabador.', 'NETWORK'));
    };
    const req = lib.request(options, (res) => {
      const chunks = [];
      let total = 0;
      const declared = Number(res.headers['content-length']);
      const expected = Number.isInteger(declared) && declared >= 0 ? declared : null;
      if (expected !== null && expected > MAX_BYTES) {
        req.destroy(new ClipError('El clip supera el tope de 200 MB.', 'SIZE'));
        return;
      }
      res.on('data', (chunk) => {
        total += chunk.length;
        if (total > MAX_BYTES) {
          req.destroy(new ClipError('El clip supera el tope de 200 MB.', 'SIZE'));
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => {
        if (settled) return;
        settled = true;
        const all = Buffer.concat(chunks);
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: expected === null ? all : all.subarray(0, expected),
        });
      });
    });
    req.on('error', fail);
    req.on('timeout', () => {
      req.destroy(new ClipError('El grabador no respondió a tiempo.', 'TIMEOUT'));
    });
    if (body) req.write(body);
    req.end();
  });
}

function parseHead(text) {
  const [statusLine, ...lines] = text.split('\r\n');
  const status = Number(/^HTTP\/\d(?:\.\d)?\s+(\d{3})/.exec(statusLine)?.[1] ?? 0);
  const headers = {};
  for (const line of lines) {
    const at = line.indexOf(':');
    if (at < 1) continue;
    const key = line.slice(0, at).trim().toLowerCase();
    const value = line.slice(at + 1).trim();
    headers[key] = headers[key] ? `${headers[key]}, ${value}` : value;
  }
  return { status, headers };
}

function dechunk(buf) {
  const parts = [];
  let at = 0;
  while (at < buf.length) {
    const eol = buf.indexOf('\r\n', at);
    if (eol < 0) break;
    const size = parseInt(buf.subarray(at, eol).toString('latin1'), 16);
    if (!Number.isFinite(size) || size === 0) break;
    parts.push(buf.subarray(eol + 2, eol + 2 + size));
    at = eol + 2 + size + 2;
  }
  return Buffer.concat(parts);
}

// La descarga del NVR declara Content-Length y, con Connection: close, manda
// 64 bytes de relleno detrás. El parser de Node lo da por error y se pierde el
// final del video, así que esta ruta lee el socket a mano y corta en esa longitud.
function socketRequest(device, { method, path, headers, body, timeoutMs }) {
  const port = device.port || (device.https ? 443 : 80);
  return new Promise((resolve, reject) => {
    const socket = device.https
      ? tls.connect({ host: device.host, port, rejectUnauthorized: false })
      : net.connect({ host: device.host, port });
    let settled = false;
    let head = null;
    let expected = null;
    let chunked = false;
    let pending = Buffer.alloc(0);
    const chunks = [];
    let total = 0;
    const settle = (fn, value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      fn(value);
    };
    const finishBody = () => {
      const all = Buffer.concat(chunks);
      const payload = chunked ? dechunk(all) : expected === null ? all : all.subarray(0, expected);
      settle(resolve, { status: head.status, headers: head.headers, body: payload });
    };
    const take = (chunk) => {
      total += chunk.length;
      if (total > MAX_BYTES) {
        settle(reject, new ClipError('El clip supera el tope de 200 MB.', 'SIZE'));
        return;
      }
      chunks.push(chunk);
      if (expected !== null && total >= expected) finishBody();
    };
    socket.setTimeout(timeoutMs, () => {
      settle(reject, new ClipError('El grabador no respondió a tiempo.', 'TIMEOUT'));
    });
    socket.on('error', () => settle(reject, new ClipError('No hay respuesta del grabador.', 'NETWORK')));
    socket.on('data', (chunk) => {
      if (settled) return;
      if (head) {
        take(chunk);
        return;
      }
      pending = Buffer.concat([pending, chunk]);
      const end = pending.indexOf('\r\n\r\n');
      if (end < 0) {
        if (pending.length > 64 * 1024) settle(reject, new ClipError('Respuesta ilegible del grabador.', 'NETWORK'));
        return;
      }
      head = parseHead(pending.subarray(0, end).toString('latin1'));
      chunked = /chunked/i.test(head.headers['transfer-encoding'] ?? '');
      const declared = Number(head.headers['content-length']);
      expected = !chunked && Number.isInteger(declared) && declared >= 0 ? declared : null;
      if (expected !== null && expected > MAX_BYTES) {
        settle(reject, new ClipError('El clip supera el tope de 200 MB.', 'SIZE'));
        return;
      }
      const rest = pending.subarray(end + 4);
      pending = Buffer.alloc(0);
      if (expected === 0) finishBody();
      else if (rest.length) take(rest);
    });
    socket.on('end', () => {
      if (settled) return;
      if (!head) settle(reject, new ClipError('No hay respuesta del grabador.', 'NETWORK'));
      else finishBody();
    });
    const lines = [`${method} ${path} HTTP/1.1`, `Host: ${device.host}:${port}`];
    for (const [key, value] of Object.entries(headers)) lines.push(`${key}: ${value}`);
    lines.push('Connection: close');
    socket.write(`${lines.join('\r\n')}\r\n\r\n`);
    if (body) socket.write(body);
  });
}

function finish(res) {
  if (res.status === 403) throw new ClipError('El usuario no tiene permiso para este video.', 'PERM');
  if (res.status < 200 || res.status >= 300) {
    const why = statusText(res.body);
    throw new ClipError(why ? `El grabador respondió: ${why}.` : `El grabador respondió ${res.status}.`, 'HTTP');
  }
  return res.body;
}

export async function isapiCall(device, method, path, opts = {}) {
  const uri = path.startsWith('/ISAPI') ? path : `/ISAPI${path}`;
  const timeoutMs = opts.timeoutMs ?? (uri.includes('/download') ? 120_000 : 15_000);
  const body = opts.body == null ? null : Buffer.from(String(opts.body));
  const headers = { 'user-agent': 'PlaybackPadel' };
  if (body) {
    headers['content-type'] = 'application/xml; charset=utf-8';
    headers['content-length'] = String(body.length);
  }
  const transport = opts.transport ?? ((request) => (
    uri.startsWith('/ISAPI/ContentMgmt/download') ? socketRequest(device, request) : rawRequest(device, request)
  ));
  const first = await transport({ method, path: uri, headers, body, timeoutMs });
  if (first.status !== 401) return finish(first);
  const challenge = parseDigestChallenge(headerValue(first.headers['www-authenticate']));
  if (!challenge) throw new ClipError('El grabador no ofreció Digest MD5.', 'AUTH');
  const second = await transport({
    method,
    path: uri,
    headers: {
      ...headers,
      authorization: buildAuthorization(device.user, device.password, method, uri, challenge),
    },
    body,
    timeoutMs,
  });
  if (second.status === 401) throw new ClipError('El grabador rechazó el usuario o la contraseña.', 'AUTH');
  return finish(second);
}
