import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { mergeConfig, publicConfig } from '../src/config.js';
import {
  ClipError,
  captureClip,
  clipSlice,
  clipWindow,
  fitSlice,
  clipsToDrop,
  hevcWarning,
  parseChannels,
  rewritePlaybackUri,
  searchStampToCompact,
  segmentsForWindow,
  sniffContainer,
  trackIdForChannel,
} from '../src/clip.js';
import { createServer as createTcpServer } from 'node:net';
import { transcodeArgs } from '../src/media.js';
import { digestResponse, isapiCall, parseDigestChallenge } from '../src/isapi.js';
import { createApp } from '../src/server.js';

const LONG_URI = 'rtsp://10.0.0.8/Streaming/tracks/101/?starttime=20261123T080000Z&endtime=20261123T100000Z&name=ch01&size=999';

test('el canal 8 del NVR es la pista 801', () => {
  assert.equal(trackIdForChannel(1), 101);
  assert.equal(trackIdForChannel(8), 801);
  assert.equal(trackIdForChannel(8, 'sub'), 802);
  assert.throws(() => trackIdForChannel(0), /Canal/);
});

test('resta el retroceso a la hora local del grabador', () => {
  const window = clipWindow('2026-11-23T09:02:30-06:00', 45);
  assert.equal(window.start.search, '2026-11-23T09:01:45Z');
  assert.equal(window.end.search, '2026-11-23T09:02:30Z');
  assert.equal(window.start.compact, '20261123T090145Z');
  assert.equal(window.end.compact, '20261123T090230Z');
  assert.equal(clipWindow('2026-11-23T09:02:30-06:00', 30).start.search, '2026-11-23T09:02:00Z');
  assert.equal(clipWindow('2026-11-23T09:02:30-06:00', 60).start.search, '2026-11-23T09:01:30Z');
});

test('la ventana cruza la medianoche en la hora del equipo', () => {
  const window = clipWindow('2026-11-24T00:00:10-06:00', 30);
  assert.equal(window.start.search, '2026-11-23T23:59:40Z');
  assert.equal(window.end.search, '2026-11-24T00:00:10Z');
});

test('el retroceso admite 15, 30, 45 o 60 segundos', () => {
  const window = clipWindow('2026-11-23T09:02:30Z', 15);
  assert.equal(window.start.search, '2026-11-23T09:02:15Z');
  assert.equal(window.end.search, '2026-11-23T09:02:30Z');
  assert.throws(() => clipWindow('2026-11-23T09:02:30Z', 20), /15, 30, 45 o 60/);
});

test('el playbackURI descarga por tiempo, no el archivo entero por nombre', () => {
  const uri = rewritePlaybackUri(`${LONG_URI}&streamform=rtp`, '20261123T090145Z', '20261123T090230Z');
  assert.equal(
    uri,
    'rtsp://10.0.0.8/Streaming/tracks/101/?starttime=20261123T090145Z&endtime=20261123T090230Z&streamform=rtp',
  );
  assert.doesNotMatch(uri, /name=|size=/);
  assert.throws(() => rewritePlaybackUri('rtsp://10.0.0.8/Streaming/tracks/101/', '20261123T090145Z', '20261123T090230Z'), /starttime/);
});

test('compacta la marca que devuelve la búsqueda', () => {
  assert.equal(searchStampToCompact('2026-11-23T09:01:45Z'), '20261123T090145Z');
});

test('un tramo que cae entre dos segmentos se parte en el corte', () => {
  const pieces = segmentsForWindow([
    { start: '2026-11-23T09:00:00Z', end: '2026-11-23T09:02:00Z', uri: 'rtsp://a' },
    { start: '2026-11-23T09:02:00Z', end: '2026-11-23T09:10:00Z', uri: 'rtsp://b' },
  ], '2026-11-23T09:01:45Z', '2026-11-23T09:02:30Z');
  assert.deepEqual(pieces.map((p) => [p.uri, p.start, p.end]), [
    ['rtsp://a', '2026-11-23T09:01:45Z', '2026-11-23T09:02:00Z'],
    ['rtsp://b', '2026-11-23T09:02:00Z', '2026-11-23T09:02:30Z'],
  ]);
  assert.deepEqual(clipSlice(pieces[0].start, pieces[0].end), { durationSec: 15 });
});

test('si llega más video del pedido se queda con el final', () => {
  assert.deepEqual(clipSlice('2026-11-23T09:58:58Z', '2026-11-23T09:59:13Z'), { durationSec: 15 });
  assert.deepEqual(fitSlice({ durationSec: 15 }, 160), { offsetSec: 145, durationSec: 15 });
  assert.equal(fitSlice({ durationSec: 15 }, 15.2), null);
  assert.equal(fitSlice({ durationSec: 15 }, null), null);
});

test('reconoce MP4 y AVI, y deja pasar el contenedor provisional', () => {
  const mp4 = Buffer.concat([Buffer.alloc(4), Buffer.from('ftypisom')]);
  assert.equal(sniffContainer(mp4), 'mp4');
  assert.equal(sniffContainer(Buffer.from('RIFF....AVI ')), 'avi');
  assert.equal(sniffContainer(Buffer.from('IMKH')), null);
  assert.equal(hevcWarning(Buffer.from('....hvc1....')), 'Este clip es H.265 y este navegador no lo reproduce.');
  assert.equal(hevcWarning(Buffer.from('....avc1....')), null);
});

test('conserva las 20 jugadas más nuevas', () => {
  const entries = Array.from({ length: 21 }, (_, i) => ({ id: `c${i}.mp4`, mtimeMs: i }));
  assert.deepEqual(clipsToDrop(entries, 20), ['c0.mp4']);
});

test('lee los canales del XML del grabador', () => {
  const xml = `
    <InputProxyChannelList>
      <InputProxyChannel><id>2</id><name>Fondo</name></InputProxyChannel>
      <InputProxyChannel><id>4</id><name></name></InputProxyChannel>
    </InputProxyChannelList>`;
  assert.deepEqual(parseChannels(xml), [
    { id: 2, name: 'Fondo' },
    { id: 4, name: 'Canal 4' },
  ]);
});

test('captureClip pide solo la ventana, con la pista del canal', async () => {
  const calls = [];
  const call = async (method, path, opts = {}) => {
    calls.push({ method, path, body: opts.body ? String(opts.body) : '' });
    if (path === '/ISAPI/System/time') {
      return Buffer.from('<Time><localTime>2026-11-23T09:02:30-06:00</localTime></Time>');
    }
    if (path.startsWith('/ISAPI/ContentMgmt/search')) {
      return Buffer.from(`
        <CMSearchResult>
          <responseStatus>true</responseStatus>
          <numOfMatches>1</numOfMatches>
          <matchList>
            <searchMatchItem>
              <timeSpan>
                <startTime>2026-11-23T08:00:00Z</startTime>
                <endTime>2026-11-23T10:00:00Z</endTime>
              </timeSpan>
              <mediaSegmentDescriptor>
                <playbackURI>rtsp://10.0.0.8/Streaming/tracks/801/?starttime=20261123T080000Z&amp;endtime=20261123T100000Z&amp;name=ch01&amp;size=999</playbackURI>
              </mediaSegmentDescriptor>
            </searchMatchItem>
          </matchList>
        </CMSearchResult>`);
    }
    return Buffer.concat([Buffer.alloc(4), Buffer.from('ftypisom')]);
  };
  const phases = [];
  const out = await captureClip({ channel: 8, lookbackSec: 45, call, onPhase: (p) => phases.push(p) });
  assert.deepEqual(phases, ['clock', 'search', 'download']);
  assert.equal(calls[1].method, 'POST');
  assert.match(calls[1].path, /TimeType=local/);
  assert.match(calls[1].body, /<trackID>802<\/trackID>/);
  assert.match(calls[1].body, /<searchResultPostion>0<\/searchResultPostion>/);
  assert.match(calls[2].body, /starttime=20261123T090145Z/);
  assert.match(calls[2].body, /endtime=20261123T090230Z/);
  assert.doesNotMatch(calls[2].body, /name=|size=/);
  assert.equal(out.parts.length, 1);
  assert.equal(sniffContainer(out.parts[0]), 'mp4');
});

test('si el grabador rechaza el flujo secundario usa el principal', async () => {
  const calls = [];
  const call = async (method, path, opts = {}) => {
    calls.push({ path, body: opts.body ? String(opts.body) : '' });
    if (path === '/ISAPI/System/time') {
      return Buffer.from('<Time><localTime>2026-11-23T09:02:30-06:00</localTime></Time>');
    }
    if (path.startsWith('/ISAPI/ContentMgmt/search')) {
      if (String(opts.body).includes('<trackID>102</trackID>')) {
        throw new ClipError('El grabador respondió: Invalid XML Content.', 'HTTP');
      }
      return Buffer.from(`
        <CMSearchResult>
          <responseStatus>true</responseStatus>
          <matchList>
            <searchMatchItem>
              <timeSpan>
                <startTime>2026-11-23T09:00:00Z</startTime>
                <endTime>2026-11-23T09:02:30Z</endTime>
              </timeSpan>
              <mediaSegmentDescriptor>
                <playbackURI>rtsp://10.0.0.8/Streaming/tracks/101/?starttime=20261123T090000Z&amp;endtime=20261123T090230Z&amp;name=ch01&amp;size=999</playbackURI>
              </mediaSegmentDescriptor>
            </searchMatchItem>
          </matchList>
        </CMSearchResult>`);
    }
    return Buffer.concat([Buffer.alloc(4), Buffer.from('ftypisom')]);
  };
  const out = await captureClip({ channel: 1, lookbackSec: 30, call });
  assert.equal(out.trackId, 101);
  assert.equal(calls.filter((item) => item.path.includes('/search')).length, 2);
  assert.match(calls.at(-1).body, /Streaming\/tracks\/101\//);
  assert.doesNotMatch(calls.at(-1).body, /name=|size=/);
});

test('un fallo de red al buscar no se convierte en sin grabación', async () => {
  const call = async (_method, path) => {
    if (path === '/ISAPI/System/time') {
      return Buffer.from('<Time><localTime>2026-11-23T09:02:30Z</localTime></Time>');
    }
    throw new ClipError('No hay respuesta del grabador.', 'NETWORK');
  };
  await assert.rejects(
    () => captureClip({ channel: 1, lookbackSec: 30, call }),
    /No hay respuesta del grabador/,
  );
});

test('sin segmento avisa que no hay grabación', async () => {
  const call = async (_method, path) => {
    if (path === '/ISAPI/System/time') return Buffer.from('<Time><localTime>2026-11-23T09:02:30Z</localTime></Time>');
    return Buffer.from('<CMSearchResult><responseStatus>true</responseStatus><numOfMatches>0</numOfMatches></CMSearchResult>');
  };
  await assert.rejects(
    () => captureClip({ channel: 1, lookbackSec: 45, call }),
    /Sin grabación en ese tramo/,
  );
});

test('la descarga se queda con el Content-Length aunque el NVR mande relleno', async () => {
  const video = Buffer.from('\x00\x00\x01\xbavideo-ps', 'latin1');
  const server = createTcpServer((socket) => {
    socket.once('data', () => {
      socket.write(`HTTP/1.1 200 OK\r\nConnection: close\r\nContent-Type: Opaque/data\r\nContent-Length: ${video.length}\r\n\r\n`);
      socket.write(video);
      socket.end(Buffer.alloc(64, 0xcf));
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const body = await isapiCall(
      { host: '127.0.0.1', port: server.address().port, user: 'u', password: 'p' },
      'POST',
      '/ISAPI/ContentMgmt/download',
      { body: '<downloadRequest/>' },
    );
    assert.deepEqual(body, video);
  } finally {
    server.close();
  }
});

test('la conversión descarta el audio roto del NVR y recorta el final', () => {
  const args = transcodeArgs('in.bin', 'out.mp4', { offsetSec: 1.282, durationSec: 15 });
  assert.deepEqual(args.slice(args.indexOf('-map'), args.indexOf('-map') + 3), ['-map', '0:v:0', '-an']);
  assert.equal(args.includes('-c:a'), false);
  assert.deepEqual(args.slice(args.indexOf('-ss'), args.indexOf('-ss') + 4), ['-ss', '1.282', '-t', '15.000']);
  assert.ok(args.indexOf('-ss') > args.indexOf('-i'));
  assert.equal(args.at(-1), 'out.mp4');
});

test('Digest MD5 coincide con el vector del RFC', () => {
  assert.equal(digestResponse({
    user: 'Mufasa',
    pass: 'Circle Of Life',
    realm: 'testrealm@host.com',
    nonce: 'dcd98b7102dd2f0e8b11d0f600bfb0c093',
    method: 'GET',
    uri: '/dir/index.html',
  }), '670fd8c2df070c60b045671b8b24ff02');
  assert.equal(digestResponse({
    user: 'Mufasa',
    pass: 'Circle Of Life',
    realm: 'testrealm@host.com',
    nonce: 'dcd98b7102dd2f0e8b11d0f600bfb0c093',
    method: 'GET',
    uri: '/dir/index.html',
    qop: 'auth',
    nc: '00000001',
    cnonce: '0a4f113b',
  }), '6629fae49393a05397450978507c4ef1');
  const parsed = parseDigestChallenge('Digest realm="testrealm@host.com", qop="auth", nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093"');
  assert.equal(parsed.realm, 'testrealm@host.com');
  assert.equal(parsed.qop, 'auth');
  assert.equal(parseDigestChallenge('Basic realm="x"'), null);
});

test('guardar la contraseña en blanco no la borra y el panel no la devuelve', () => {
  const prev = {
    listen: '127.0.0.1',
    port: 8787,
    lookbackSec: 45,
    accessCode: 'pista',
    recorder: { host: '10.0.0.8', port: 80, user: 'admin', password: 's3cret-nvr', https: false },
    courts: [{ id: 'cancha-1', name: 'Cancha 1', channel: 1 }],
  };
  const next = mergeConfig(prev, {
    listen: '127.0.0.1',
    port: 8787,
    lookbackSec: 30,
    accessCode: '',
    recorder: { host: '10.0.0.8', port: 80, user: 'admin', password: '', https: false },
    courts: [{ id: 'cancha-1', name: 'Central', channel: 3 }],
  });
  assert.equal(next.recorder.password, 's3cret-nvr');
  assert.equal(next.accessCode, 'pista');
  assert.equal(next.lookbackSec, 30);
  assert.equal(next.courts[0].channel, 3);
  const pub = JSON.stringify(publicConfig(next, { listen: '127.0.0.1', port: 8787 }));
  assert.equal(pub.includes('s3cret-nvr'), false);
  assert.equal(pub.includes('pista'), false);
  assert.equal(JSON.parse(pub).recorder.hasPassword, true);
});

test('abrirlo en la red exige código', () => {
  const prev = {
    listen: '127.0.0.1',
    port: 8787,
    lookbackSec: 45,
    accessCode: '',
    recorder: { host: '', port: 80, user: '', password: '', https: false },
    courts: [{ id: 'cancha-1', name: 'Cancha 1', channel: 1 }],
  };
  assert.throws(() => mergeConfig(prev, { ...publicShape(prev), listen: '0.0.0.0', accessCode: '' }), /código de acceso/);
});

test('el panel arranca, guarda y una segunda pulsación no dispara otra descarga', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'playback-padel-'));
  let release;
  const held = new Promise((resolve) => { release = resolve; });
  let calls = 0;
  const mp4 = Buffer.concat([Buffer.alloc(4), Buffer.from('ftypisom')]);
  const app = await createApp({
    dataDir: dir,
    capture: async ({ onPhase }) => {
      calls += 1;
      onPhase('clock');
      onPhase('search');
      onPhase('download');
      await held;
      return {
        parts: [mp4],
        window: { start: { compact: '20261123T090145Z', search: '2026-11-23T09:01:45Z' }, end: { compact: '20261123T090230Z', search: '2026-11-23T09:02:30Z' } },
        trackId: 101,
      };
    },
  });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const port = app.server.address().port;
  try {
    const home = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Última jugada/);
    const saved = await fetch(`http://127.0.0.1:${port}/api/config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        listen: '127.0.0.1',
        port: 8787,
        lookbackSec: 45,
        accessCode: '',
        recorder: { host: '10.0.0.8', port: 80, user: 'admin', password: 's3cret-nvr', https: false },
        courts: [{ id: 'cancha-1', name: 'Cancha 1', channel: 1 }],
      }),
    });
    assert.equal(saved.status, 200);
    const again = await fetch(`http://127.0.0.1:${port}/api/config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        listen: '127.0.0.1',
        port: 8787,
        lookbackSec: 45,
        accessCode: '',
        recorder: { host: '10.0.0.8', port: 80, user: 'admin', password: '', https: false },
        courts: [{ id: 'cancha-1', name: 'Cancha 1', channel: 1 }],
      }),
    });
    const body = await again.json();
    assert.equal(body.recorder.hasPassword, true);
    assert.equal(JSON.stringify(body).includes('s3cret-nvr'), false);

    const first = fetch(`http://127.0.0.1:${port}/api/courts/cancha-1/clip`, { method: 'POST' });
    const second = fetch(`http://127.0.0.1:${port}/api/courts/cancha-1/clip`, { method: 'POST' });
    const [a, b] = await Promise.all([first, second]);
    const ja = await a.json();
    const jb = await b.json();
    assert.equal(ja.jobId, jb.jobId);
    assert.equal(calls, 1);
    release();
    const job = await waitJob(port, ja.jobId);
    assert.equal(job.phase, 'ready');
    assert.match(job.clip.url, /^\/clips\/cancha-1__/);
  } finally {
    release();
    await new Promise((resolve) => app.server.close(resolve));
    await rm(dir, { recursive: true, force: true });
  }
});

test('un clon sin config.json se configura entero desde el panel', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'playback-padel-clone-'));
  const app = await createApp({ dataDir: dir });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const port = app.server.address().port;
  try {
    const fresh = await fetch(`http://127.0.0.1:${port}/api/config`);
    const empty = await fresh.json();
    assert.equal(empty.recorder.host, '');
    assert.equal(empty.recorder.user, '');
    assert.equal(empty.recorder.hasPassword, false);
    assert.equal(empty.lookbackSec, 45);
    assert.equal(empty.courts.length, 1);
    assert.equal(empty.courts[0].name, 'Cancha 1');

    const saved = await fetch(`http://127.0.0.1:${port}/api/config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        listen: '127.0.0.1',
        port: 8787,
        lookbackSec: 30,
        accessCode: '',
        recorder: { host: '10.0.0.8', port: 80, user: 'admin', password: 'clave-local', https: false },
        courts: [
          { id: 'cancha-1', name: 'Central', channel: 2 },
          { id: 'cancha-2', name: 'Fondo', channel: 4 },
        ],
      }),
    });
    const body = await saved.json();
    assert.equal(saved.status, 200);
    assert.equal(body.recorder.host, '10.0.0.8');
    assert.equal(body.recorder.hasPassword, true);
    assert.equal(body.lookbackSec, 30);
    assert.equal(body.courts[1].name, 'Fondo');
    assert.equal(JSON.stringify(body).includes('clave-local'), false);

    const stored = await readFile(join(dir, 'config.json'), 'utf8');
    assert.match(stored, /clave-local/);
  } finally {
    await new Promise((resolve) => app.server.close(resolve));
    await rm(dir, { recursive: true, force: true });
  }
});

function publicShape(prev) {
  return {
    listen: prev.listen,
    port: prev.port,
    lookbackSec: prev.lookbackSec,
    accessCode: '',
    recorder: { ...prev.recorder, password: '' },
    courts: prev.courts,
  };
}

async function waitJob(port, jobId) {
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`http://127.0.0.1:${port}/api/jobs/${jobId}`);
    const job = await res.json();
    if (job.phase === 'ready' || job.phase === 'error') return job;
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error('el trabajo no terminó');
}
