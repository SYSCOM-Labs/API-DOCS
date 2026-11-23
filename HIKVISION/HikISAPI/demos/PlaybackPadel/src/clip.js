import { randomUUID } from 'node:crypto';

export class ClipError extends Error {
  constructor(message, code = 'CLIP') {
    super(message);
    this.name = 'ClipError';
    this.code = code;
  }
}

export const LOOKBACK_SECONDS = [15, 30, 45, 60];
const LOOKBACKS = new Set(LOOKBACK_SECONDS);
const COMPACT = /^\d{8}T\d{6}Z$/;

export function trackIdForChannel(channelId, stream = 'main') {
  const n = Number(channelId);
  if (!Number.isInteger(n) || n < 1 || n > 512) {
    throw new ClipError('Canal fuera de rango (1-512).', 'CHANNEL');
  }
  // NVR: canal N, flujo principal N*100+1 (el 8 es 801). El secundario es +2
  // y pesa mucho menos: un tramo de 30 s del principal puede pasar de 200 MB.
  return n * 100 + (stream === 'sub' ? 2 : 1);
}

export function parseDeviceOffset(localTime) {
  const raw = String(localTime ?? '').trim();
  const match = /(Z|([+-])(\d{2}):?(\d{2}))$/.exec(raw);
  if (!match || !Number.isFinite(Date.parse(raw))) return null;
  if (match[1] === 'Z') return 0;
  const sign = match[2] === '-' ? -1 : 1;
  return sign * (Number(match[3]) * 60 + Number(match[4]));
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDevice(ms, offsetMinutes) {
  const shifted = new Date(ms + offsetMinutes * 60_000);
  const y = shifted.getUTCFullYear();
  const mo = pad(shifted.getUTCMonth() + 1);
  const d = pad(shifted.getUTCDate());
  const h = pad(shifted.getUTCHours());
  const mi = pad(shifted.getUTCMinutes());
  const s = pad(shifted.getUTCSeconds());
  return {
    search: `${y}-${mo}-${d}T${h}:${mi}:${s}Z`,
    compact: `${y}${mo}${d}T${h}${mi}${s}Z`,
  };
}

export function clipWindow(localTime, lookbackSec) {
  const lookback = Number(lookbackSec);
  if (!LOOKBACKS.has(lookback)) {
    throw new ClipError('El retroceso solo puede ser 15, 30, 45 o 60 segundos.', 'LOOKBACK');
  }
  const offset = parseDeviceOffset(localTime);
  if (offset === null) {
    throw new ClipError('El reloj del grabador no trae una hora local usable.', 'CLOCK');
  }
  const endMs = Date.parse(localTime);
  return {
    lookbackSec: lookback,
    offsetMinutes: offset,
    start: formatDevice(endMs - lookback * 1000, offset),
    end: formatDevice(endMs, offset),
  };
}

export function rewritePlaybackUri(uri, startCompact, endCompact) {
  const raw = String(uri ?? '');
  if (!/[?&]starttime=/i.test(raw) || !/[?&]endtime=/i.test(raw)) {
    throw new ClipError('El playbackURI no trae starttime y endtime.', 'URI');
  }
  if (!COMPACT.test(startCompact) || !COMPACT.test(endCompact)) {
    throw new ClipError('Las marcas de tiempo del clip no tienen el formato del grabador.', 'URI');
  }
  const [base, query = ''] = raw.split('?');
  // Con name o size el equipo descarga por nombre: el archivo entero desde que
  // empezó a grabar (679 MB medidos para un tramo de 15 s). Sin ellos, por tiempo.
  const kept = query.split('&').filter((pair) => {
    const key = pair.split('=')[0].toLowerCase();
    return pair && !['starttime', 'endtime', 'name', 'size'].includes(key);
  });
  return `${base}?${[`starttime=${startCompact}`, `endtime=${endCompact}`, ...kept].join('&')}`;
}

export function searchStampToCompact(stamp) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/.exec(String(stamp).trim());
  if (!match) throw new ClipError('Marca de tiempo ilegible.', 'TIME');
  return `${match[1]}${match[2]}${match[3]}T${match[4]}${match[5]}${match[6]}Z`;
}

export function asDeviceStamp(raw) {
  const match = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/.exec(String(raw ?? '').trim());
  if (!match) throw new ClipError('Marca de tiempo ilegible.', 'TIME');
  // El firmware etiqueta con dígitos de su reloj local y una Z que no es UTC.
  return `${match[1]}Z`;
}

export function segmentsForWindow(items, windowStart, windowEnd) {
  const pieces = [];
  for (const item of items) {
    if (!(item.start < windowEnd && item.end > windowStart)) continue;
    const start = item.start > windowStart ? item.start : windowStart;
    const end = item.end < windowEnd ? item.end : windowEnd;
    if (start >= end) continue;
    pieces.push({ uri: item.uri, start, end });
  }
  return pieces;
}

export function clipSlice(windowStart, windowEnd) {
  const start = Date.parse(windowStart);
  const end = Date.parse(windowEnd);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new ClipError('No se pudo acotar el tramo.', 'TIME');
  }
  return { durationSec: (end - start) / 1000 };
}

export function fitSlice(slice, mediaDuration) {
  const span = Number(slice?.durationSec);
  const media = Number(mediaDuration);
  if (!Number.isFinite(span) || span <= 0 || !Number.isFinite(media) || media <= 0) return null;
  if (media <= span + 1.5) return null;
  // Lo que sobra va delante (keyframe previo o archivo entero): el tramo pedido
  // termina donde termina lo descargado.
  return { offsetSec: media - span, durationSec: span };
}

export function sniffContainer(buf) {
  const bytes = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  const head = bytes.subarray(0, 64);
  if (head.length >= 4 && head.subarray(0, 4).toString('latin1') === 'RIFF') return 'avi';
  if (head.toString('latin1').includes('ftyp')) return 'mp4';
  return null;
}

export function hevcWarning(buf) {
  const bytes = Buffer.isBuffer(buf) ? buf : Buffer.from(buf ?? '');
  const span = 1024 * 1024;
  const head = bytes.subarray(0, Math.min(bytes.length, span)).toString('latin1');
  const tail = bytes.length > span ? bytes.subarray(bytes.length - span).toString('latin1') : '';
  const slice = head + tail;
  if (slice.includes('hvc1') || slice.includes('hev1')) {
    return 'Este clip es H.265 y este navegador no lo reproduce.';
  }
  return null;
}

export function clipsToDrop(entries, keep = 20) {
  const sorted = [...entries].sort((a, b) => b.mtimeMs - a.mtimeMs || String(b.id).localeCompare(String(a.id)));
  return sorted.slice(Math.max(0, keep)).map((entry) => entry.id);
}

export function labelFromCompact(compact) {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(String(compact ?? ''));
  if (!match) return '';
  return `${match[3]}/${match[2]} ${match[4]}:${match[5]}`;
}

export function clipMeta(filename) {
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)__(\d{8}T\d{6}Z)-\d+\.mp4$/.exec(filename);
  if (!match) return null;
  return { courtId: match[1], compact: match[2], label: labelFromCompact(match[2]) };
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function unescapeXml(value) {
  return String(value)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function toText(body) {
  return Buffer.isBuffer(body) ? body.toString('utf8') : String(body ?? '');
}

function firstTag(xml, tag) {
  const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i').exec(xml);
  return match ? match[1].trim() : '';
}

export function parseLocalTime(body) {
  const value = firstTag(toText(body), 'localTime');
  if (!value) throw new ClipError('El grabador no devolvió la hora local.', 'CLOCK');
  return value;
}

export function parseSearch(body) {
  const text = toText(body);
  if (firstTag(text, 'responseStatus') !== 'true') {
    const why = firstTag(text, 'responseStatusStrg') || firstTag(text, 'statusString') || 'sin detalle';
    throw new ClipError(`El grabador rechazó la búsqueda (${why}).`, 'SEARCH');
  }
  const items = [];
  for (const block of text.split(/<searchMatchItem\b[^>]*>/i).slice(1)) {
    const inner = block.split(/<\/searchMatchItem>/i)[0];
    const uri = firstTag(inner, 'playbackURI');
    const start = firstTag(inner, 'startTime');
    const end = firstTag(inner, 'endTime');
    if (!uri || !start || !end) continue;
    items.push({
      uri: unescapeXml(uri),
      start: asDeviceStamp(start),
      end: asDeviceStamp(end),
    });
  }
  return items;
}

export function parseChannels(body) {
  const text = toText(body);
  const channels = [];
  for (const block of text.split(/<InputProxyChannel\b[^>]*>/i).slice(1)) {
    const inner = block.split(/<\/InputProxyChannel>/i)[0];
    const id = Number(firstTag(inner, 'id'));
    if (!Number.isInteger(id) || id < 1) continue;
    const name = firstTag(inner, 'name');
    channels.push({ id, name: name || `Canal ${id}` });
  }
  return channels;
}

export function parseDeviceInfo(body) {
  const text = toText(body);
  return {
    model: firstTag(text, 'model') || '',
    name: firstTag(text, 'deviceName') || '',
  };
}

export function searchXml(trackId, startSearch, endSearch) {
  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<CMSearchDescription>',
    `  <searchID>${randomUUID()}</searchID>`,
    '  <trackIDList>',
    `    <trackID>${trackId}</trackID>`,
    '  </trackIDList>',
    '  <timeSpanList>',
    '    <timeSpan>',
    `      <startTime>${xmlEscape(startSearch)}</startTime>`,
    `      <endTime>${xmlEscape(endSearch)}</endTime>`,
    '    </timeSpan>',
    '  </timeSpanList>',
    '  <maxResults>40</maxResults>',
    `  <searchResultPostion>0</searchResultPostion>`,
    '  <metadataList>',
    '    <metadataDescriptor>//recordType.meta.std-cgi.com</metadataDescriptor>',
    '  </metadataList>',
    '</CMSearchDescription>',
  ].join('\n');
}

export function downloadXml(playbackUri) {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<downloadRequest version="1.0" xmlns="http://www.isapi.org/ver20/XMLSchema">',
    `  <playbackURI>${xmlEscape(playbackUri)}</playbackURI>`,
    '</downloadRequest>',
  ].join('\n');
}

async function searchPieces(call, trackId, window) {
  const resultBody = await call('POST', '/ISAPI/ContentMgmt/search?TimeType=local', {
    body: searchXml(trackId, window.start.search, window.end.search),
  });
  return segmentsForWindow(parseSearch(resultBody), window.start.search, window.end.search);
}

export async function captureClip({ channel, lookbackSec, call, onPhase }) {
  const phase = typeof onPhase === 'function' ? onPhase : () => {};
  phase('clock');
  const localTime = parseLocalTime(await call('GET', '/ISAPI/System/time'));
  const window = clipWindow(localTime, lookbackSec);
  phase('search');
  const mainId = trackIdForChannel(channel);
  const subId = trackIdForChannel(channel, 'sub');
  let trackId = subId;
  let pieces = [];
  try {
    pieces = await searchPieces(call, subId, window);
  } catch (err) {
    // En este firmware una pista secundaria no grabada no viene vacía:
    // el POST responde 400 "Invalid XML Content". Eso no invalida la principal.
    if (!(err instanceof ClipError) || err.code !== 'HTTP') throw err;
  }
  if (!pieces.length) {
    trackId = mainId;
    pieces = await searchPieces(call, mainId, window);
  }
  if (!pieces.length) throw new ClipError('Sin grabación en ese tramo.', 'NO_RECORDING');
  phase('download');
  const parts = [];
  const slices = [];
  for (const piece of pieces) {
    const uri = rewritePlaybackUri(piece.uri, searchStampToCompact(piece.start), searchStampToCompact(piece.end));
    const bytes = Buffer.from(await call('POST', '/ISAPI/ContentMgmt/download', {
      body: downloadXml(uri),
      timeoutMs: 120_000,
    }));
    if (bytes.length && (bytes[0] === 0x3c || bytes[0] === 0x7b)) {
      const why = firstTag(bytes.toString('utf8'), 'statusString') || 'el archivo no es video';
      throw new ClipError(`El grabador no entregó el clip (${why}).`, 'DOWNLOAD');
    }
    parts.push(bytes);
    slices.push(clipSlice(piece.start, piece.end));
  }
  return { parts, slices, window, trackId };
}
