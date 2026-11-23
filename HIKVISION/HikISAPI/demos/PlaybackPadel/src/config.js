import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { ClipError, LOOKBACK_SECONDS } from './clip.js';

export const DEFAULT_CONFIG = {
  listen: '127.0.0.1',
  port: 8787,
  lookbackSec: 45,
  accessCode: '',
  recorder: { host: '', port: 80, user: '', password: '', https: false },
  courts: [{ id: 'cancha-1', name: 'Cancha 1', channel: 1 }],
};

const COURT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HOST = /^(?:(?:\d{1,3}\.){3}\d{1,3}|[a-zA-Z0-9.-]+)$/;

export function accessRequired(config) {
  const host = String(config.listen || '').trim().toLowerCase();
  return host !== '127.0.0.1' && host !== '::1' && host !== 'localhost';
}

function portOrThrow(value, label) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ClipError(`${label} no es válido.`, 'CONFIG');
  }
  return port;
}

export function mergeConfig(prev, input) {
  const base = prev ?? DEFAULT_CONFIG;
  const listen = String(input.listen ?? base.listen ?? '127.0.0.1').trim();
  const listenOk = listen === '127.0.0.1'
    || listen === '0.0.0.0'
    || listen === 'localhost'
    || listen === '::1'
    || /^(?:\d{1,3}\.){3}\d{1,3}$/.test(listen);
  if (!listenOk) throw new ClipError('La dirección de escucha no es válida.', 'CONFIG');

  const lookbackSec = Number(input.lookbackSec ?? base.lookbackSec);
  if (!LOOKBACK_SECONDS.includes(lookbackSec)) {
    throw new ClipError('El retroceso solo puede ser 15, 30, 45 o 60 segundos.', 'CONFIG');
  }

  const rec = input.recorder ?? {};
  const host = String(rec.host ?? '').trim();
  if (host && !HOST.test(host)) throw new ClipError('La IP del grabador no es válida.', 'CONFIG');
  const password = typeof rec.password === 'string' && rec.password.length > 0
    ? rec.password
    : (base.recorder?.password ?? '');
  const accessCode = typeof input.accessCode === 'string' && input.accessCode.length > 0
    ? input.accessCode
    : (base.accessCode ?? '');

  const courtsIn = Array.isArray(input.courts) ? input.courts : [];
  if (!courtsIn.length) throw new ClipError('Hace falta al menos una cancha.', 'CONFIG');
  const seen = new Set();
  const courts = courtsIn.map((court) => {
    const id = String(court.id ?? '').trim();
    const name = String(court.name ?? '').trim();
    const channel = Number(court.channel);
    if (!COURT_ID.test(id)) {
      throw new ClipError('El identificador de la cancha solo admite minúsculas y guiones.', 'CONFIG');
    }
    if (seen.has(id)) throw new ClipError('Hay dos canchas con el mismo identificador.', 'CONFIG');
    seen.add(id);
    if (!name || name.length > 40) throw new ClipError('Cada cancha necesita un nombre corto.', 'CONFIG');
    if (!Number.isInteger(channel) || channel < 1 || channel > 512) {
      throw new ClipError(`El canal de ${name} no es válido.`, 'CONFIG');
    }
    return { id, name, channel };
  });

  const next = {
    listen,
    port: portOrThrow(input.port ?? base.port, 'El puerto del panel'),
    lookbackSec,
    accessCode,
    recorder: {
      host,
      port: portOrThrow(rec.port ?? 80, 'El puerto del grabador'),
      user: String(rec.user ?? '').trim(),
      password,
      https: Boolean(rec.https),
    },
    courts,
  };
  if (accessRequired(next) && !next.accessCode) {
    throw new ClipError('Para abrirlo en la red hace falta un código de acceso.', 'CONFIG');
  }
  return next;
}

export function publicConfig(config, applied) {
  return {
    listen: config.listen,
    port: config.port,
    lookbackSec: config.lookbackSec,
    recorder: {
      host: config.recorder.host,
      port: config.recorder.port,
      user: config.recorder.user,
      https: Boolean(config.recorder.https),
      hasPassword: Boolean(config.recorder.password),
    },
    access: {
      required: accessRequired(config),
      hasCode: Boolean(config.accessCode),
    },
    courts: config.courts.map(({ id, name, channel }) => ({ id, name, channel })),
    restartNeeded: applied.listen !== config.listen || Number(applied.port) !== Number(config.port),
  };
}

export async function loadConfig(file) {
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    return mergeConfig(structuredClone(DEFAULT_CONFIG), parsed);
  } catch (err) {
    if (err && err.code === 'ENOENT') return structuredClone(DEFAULT_CONFIG);
    throw err;
  }
}

export async function saveConfig(file, config) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
}
