import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, open, readdir, readFile, stat, unlink } from 'node:fs/promises';
import { createServer } from 'node:http';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  ClipError,
  captureClip,
  clipMeta,
  clipsToDrop,
  hevcWarning,
  labelFromCompact,
  parseChannels,
  parseDeviceInfo,
} from './clip.js';
import { accessRequired, loadConfig, publicConfig, saveConfig, mergeConfig } from './config.js';
import { isapiCall } from './isapi.js';
import { materializeClip } from './media.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const publicDir = join(root, 'public');
const PHASE = { clock: 'Reloj', search: 'Buscando', download: 'Descargando' };
const STATIC = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/app.css': ['app.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
};

async function readEdges(file, size) {
  const span = Math.min(size, 1024 * 1024);
  const handle = await open(file, 'r');
  try {
    const head = Buffer.alloc(span);
    await handle.read(head, 0, span, 0);
    if (size <= span) return head;
    const tail = Buffer.alloc(span);
    await handle.read(tail, 0, span, size - span);
    return Buffer.concat([head, tail]);
  } finally {
    await handle.close();
  }
}

function sameSecret(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function readCookie(req, name) {
  const header = req.headers.cookie ?? '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1_000_000) {
        reject(new ClipError('La petición es demasiado grande.', 'BODY'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new ClipError('El JSON no se entiende.', 'BODY'));
      }
    });
    req.on('error', reject);
  });
}

function safeMessage(err) {
  return err instanceof ClipError ? err.message : 'No se pudo completar.';
}

export async function createApp(options = {}) {
  const dataDir = options.dataDir ?? join(root, 'data');
  const clipsDir = options.clipsDir ?? join(dataDir, 'clips');
  const configPath = join(dataDir, 'config.json');
  await mkdir(clipsDir, { recursive: true });
  let config = await loadConfig(configPath);
  const applied = { listen: config.listen, port: config.port };
  const sessions = new Set();
  const jobs = new Map();
  const byCourt = new Map();

  async function defaultCapture({ recorder, channel, lookbackSec, onPhase }) {
    if (!recorder.host || !recorder.user || !recorder.password) {
      throw new ClipError('Falta la IP, el usuario o la contraseña del grabador.', 'CONFIG');
    }
    const call = (method, path, opts = {}) => isapiCall(recorder, method, path, opts);
    return captureClip({ channel, lookbackSec, call, onPhase });
  }

  const capture = options.capture ?? defaultCapture;

  function authorized(req) {
    if (!accessRequired(config)) return true;
    const header = req.headers['x-access-code'];
    if (typeof header === 'string' && sameSecret(header, config.accessCode)) return true;
    const token = readCookie(req, 'pp_session');
    return Boolean(token && sessions.has(token));
  }

  function deny(req, res) {
    if (authorized(req)) return false;
    sendJson(res, 401, { message: 'Código de acceso.' });
    return true;
  }

  async function listClips() {
    const names = await readdir(clipsDir);
    const clips = [];
    for (const name of names) {
      const meta = clipMeta(name);
      if (!meta) continue;
      const file = join(clipsDir, name);
      const info = await stat(file);
      let warning = null;
      try {
        warning = hevcWarning(await readEdges(file, info.size));
      } catch {
        warning = null;
      }
      clips.push({
        id: name,
        courtId: meta.courtId,
        url: `/clips/${encodeURIComponent(name)}`,
        label: meta.label,
        mtimeMs: info.mtimeMs,
        warning,
      });
    }
    clips.sort((a, b) => b.mtimeMs - a.mtimeMs);
    return clips.map(({ mtimeMs, ...clip }) => clip);
  }

  async function pruneClips() {
    const names = await readdir(clipsDir);
    const entries = [];
    for (const name of names) {
      if (!name.endsWith('.mp4')) continue;
      const info = await stat(join(clipsDir, name));
      entries.push({ id: name, mtimeMs: info.mtimeMs });
    }
    await Promise.all(clipsToDrop(entries, 20).map((name) => unlink(join(clipsDir, name)).catch(() => {})));
  }

  async function storeClip(courtId, captured) {
    const filename = `${courtId}__${captured.window.start.compact}-${Date.now()}.mp4`;
    const target = join(clipsDir, filename);
    const bytes = await materializeClip(captured.parts, target, captured.slices);
    await pruneClips();
    return {
      id: filename,
      courtId,
      url: `/clips/${encodeURIComponent(filename)}`,
      label: labelFromCompact(captured.window.start.compact),
      warning: hevcWarning(bytes),
    };
  }

  async function runJob(job, court) {
    try {
      const captured = await capture({
        recorder: config.recorder,
        channel: court.channel,
        lookbackSec: config.lookbackSec,
        onPhase: (phase) => {
          job.phase = phase;
          job.message = PHASE[phase] || phase;
        },
      });
      job.clip = await storeClip(court.id, captured);
      job.phase = 'ready';
      job.message = 'Listo';
    } catch (err) {
      job.phase = 'error';
      job.message = safeMessage(err);
    } finally {
      if (byCourt.get(court.id) === job) byCourt.delete(court.id);
    }
  }

  async function serveClip(req, res, filename) {
    let name = filename;
    try {
      name = decodeURIComponent(filename);
    } catch {
      sendJson(res, 404, { message: 'Clip no encontrado.' });
      return;
    }
    if (!clipMeta(name)) {
      sendJson(res, 404, { message: 'Clip no encontrado.' });
      return;
    }
    const file = join(clipsDir, name);
    const rel = relative(clipsDir, file);
    if (rel.startsWith('..') || isAbsolute(rel)) {
      sendJson(res, 404, { message: 'Clip no encontrado.' });
      return;
    }
    let info;
    try {
      info = await stat(file);
    } catch {
      sendJson(res, 404, { message: 'Clip no encontrado.' });
      return;
    }
    const size = info.size;
    res.setHeader('content-type', 'video/mp4');
    res.setHeader('accept-ranges', 'bytes');
    res.setHeader('cache-control', 'private, max-age=3600');
    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, { 'content-length': size });
      createReadStream(file).pipe(res);
      return;
    }
    const match = /^bytes=(\d+)-(\d*)$/.exec(range);
    if (!match) {
      res.writeHead(416, { 'content-range': `bytes */${size}` });
      res.end();
      return;
    }
    const start = Number(match[1]);
    const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (start >= size || end < start) {
      res.writeHead(416, { 'content-range': `bytes */${size}` });
      res.end();
      return;
    }
    res.writeHead(206, {
      'content-range': `bytes ${start}-${end}/${size}`,
      'content-length': end - start + 1,
    });
    createReadStream(file, { start, end }).pipe(res);
  }

  async function handle(req, res) {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    const path = decodeURIComponent(url.pathname);

    if (req.method === 'GET' && path.startsWith('/assets/')) {
      const name = path.slice('/assets/'.length);
      if (!/^[\w.-]+$/.test(name)) {
        sendJson(res, 404, { message: 'No encontrado.' });
        return;
      }
      const type = name.endsWith('.webp') ? 'image/webp'
        : name.endsWith('.png') ? 'image/png'
          : name.endsWith('.svg') ? 'image/svg+xml'
            : '';
      if (!type) {
        sendJson(res, 404, { message: 'No encontrado.' });
        return;
      }
      try {
        const body = await readFile(join(publicDir, 'assets', name));
        res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' });
        res.end(body);
      } catch {
        sendJson(res, 404, { message: 'No encontrado.' });
      }
      return;
    }

    if (req.method === 'GET' && STATIC[path]) {
      const [file, type] = STATIC[path];
      const body = await readFile(join(publicDir, file));
      res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' });
      res.end(body);
      return;
    }

    if (req.method === 'GET' && path === '/api/session') {
      sendJson(res, 200, { required: accessRequired(config), ok: authorized(req) });
      return;
    }

    if (req.method === 'POST' && path === '/api/session') {
      const body = await readJson(req);
      if (!accessRequired(config)) {
        sendJson(res, 200, { ok: true, required: false });
        return;
      }
      if (!sameSecret(body.code ?? '', config.accessCode)) {
        sendJson(res, 401, { message: 'Código incorrecto.' });
        return;
      }
      const token = randomBytes(24).toString('hex');
      sessions.add(token);
      res.setHeader('set-cookie', 'pp_session=' + token + '; HttpOnly; SameSite=Strict; Path=/');
      sendJson(res, 200, { ok: true, required: true });
      return;
    }

    if (req.method === 'POST' && path.startsWith('/api/courts/') && path.endsWith('/clip')) {
      if (deny(req, res)) return;
      const id = path.slice('/api/courts/'.length, -'/clip'.length);
      const court = config.courts.find((item) => item.id === id);
      if (!court) {
        sendJson(res, 404, { message: 'Esa cancha no está.' });
        return;
      }
      const existing = byCourt.get(id);
      if (existing && existing.phase !== 'ready' && existing.phase !== 'error') {
        sendJson(res, 202, { jobId: existing.id });
        return;
      }
      const job = { id: randomBytes(12).toString('hex'), courtId: id, phase: 'clock', message: 'Reloj', clip: null };
      jobs.set(job.id, job);
      byCourt.set(id, job);
      void runJob(job, court);
      sendJson(res, 202, { jobId: job.id });
      return;
    }

    if (path.startsWith('/api/') && deny(req, res)) return;
    if (path.startsWith('/clips/') && deny(req, res)) return;

    if (req.method === 'GET' && path === '/api/config') {
      sendJson(res, 200, publicConfig(config, applied));
      return;
    }

    if (req.method === 'PUT' && path === '/api/config') {
      const body = await readJson(req);
      config = mergeConfig(config, body);
      await saveConfig(configPath, config);
      sendJson(res, 200, publicConfig(config, applied));
      return;
    }

    if (req.method === 'POST' && path === '/api/test') {
      const body = await readJson(req);
      const draft = {
        host: String(body.recorder?.host ?? config.recorder.host ?? '').trim(),
        port: Number(body.recorder?.port ?? config.recorder.port ?? 80),
        user: String(body.recorder?.user ?? config.recorder.user ?? '').trim(),
        password: body.recorder?.password ? String(body.recorder.password) : config.recorder.password,
        https: Boolean(body.recorder?.https),
      };
      if (!draft.host || !draft.user || !draft.password) {
        sendJson(res, 400, { message: 'Falta la IP, el usuario o la contraseña.' });
        return;
      }
      try {
        const info = parseDeviceInfo(await isapiCall(draft, 'GET', '/ISAPI/System/deviceInfo'));
        const channels = parseChannels(await isapiCall(draft, 'GET', '/ISAPI/ContentMgmt/InputProxy/channels'));
        sendJson(res, 200, { ok: true, model: info.model, name: info.name, channels });
      } catch (err) {
        sendJson(res, 200, { ok: false, message: safeMessage(err) });
      }
      return;
    }

    if (req.method === 'GET' && path === '/api/clips') {
      sendJson(res, 200, { clips: await listClips() });
      return;
    }

    if (req.method === 'GET' && path.startsWith('/api/jobs/')) {
      const job = jobs.get(path.slice('/api/jobs/'.length));
      if (!job) {
        sendJson(res, 404, { message: 'Esa jugada ya no está.' });
        return;
      }
      sendJson(res, 200, { id: job.id, phase: job.phase, message: job.message, clip: job.clip });
      return;
    }

    if (req.method === 'GET' && path.startsWith('/clips/')) {
      await serveClip(req, res, path.slice('/clips/'.length));
      return;
    }

    sendJson(res, 404, { message: 'No encontrado.' });
  }

  const server = createServer((req, res) => {
    handle(req, res).catch((err) => {
      if (res.headersSent) return;
      const status = err instanceof ClipError ? 400 : 500;
      sendJson(res, status, { message: safeMessage(err) });
    });
  });

  return { server, configPath, getConfig: () => config };
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return pathToFileURL(resolve(entry)).href === import.meta.url;
}

if (isDirectRun()) {
  const app = await createApp();
  const current = app.getConfig();
  app.server.listen(current.port, current.listen, () => {
    const host = current.listen === '0.0.0.0' ? '127.0.0.1' : current.listen;
    console.log(`PlaybackPadel en http://${host}:${current.port}`);
  });
}
