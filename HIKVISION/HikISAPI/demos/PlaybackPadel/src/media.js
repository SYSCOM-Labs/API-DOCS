import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ClipError, fitSlice, hevcWarning, sniffContainer } from './clip.js';

let ffmpegPromise;

export function ffmpegAvailable() {
  if (!ffmpegPromise) {
    ffmpegPromise = new Promise((resolve) => {
      const child = spawn('ffmpeg', ['-version'], { windowsHide: true, stdio: 'ignore' });
      child.on('error', () => resolve(false));
      child.on('exit', (code) => resolve(code === 0));
    });
  }
  return ffmpegPromise;
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args, { windowsHide: true });
    let tail = '';
    child.stderr.on('data', (chunk) => {
      tail = (tail + chunk).slice(-4000);
    });
    child.on('error', () => reject(new ClipError('No hay ffmpeg para convertir el clip.', 'CONTAINER')));
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      const lines = tail.split(/\r?\n/).filter((line) => line.trim() && !line.startsWith('[libx264'));
      console.error(`ffmpeg salió con código ${code}:\n${lines.slice(-8).join('\n')}`);
      reject(new ClipError('No se pudo convertir el clip a MP4.', 'CONTAINER'));
    });
  });
}

function ffmpegPath(file) {
  return file.replace(/\\/g, '/').replace(/'/g, "'\\''");
}

const LIGHT_BYTES = 12 * 1024 * 1024;

// Solo video: el audio del NVR llega como "mp2" con 0 canales y datos que no
// decodifican; con él ffmpeg aborta (código 69) aunque el video esté bien.
export function transcodeArgs(input, dest, slice) {
  const args = ['-y', '-i', input];
  if (slice) args.push('-ss', slice.offsetSec.toFixed(3), '-t', slice.durationSec.toFixed(3));
  args.push(
    '-map', '0:v:0', '-an',
    '-vf', "scale=-2:'min(720,ih)'",
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '28',
    '-movflags', '+faststart',
    dest,
  );
  return args;
}

function transcodeLight(input, dest, slice) {
  return runFfmpeg(transcodeArgs(input, dest, slice));
}

function probeDuration(file) {
  return new Promise((resolve) => {
    const child = spawn('ffprobe', [
      '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
    ], { windowsHide: true });
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk; });
    child.on('error', () => resolve(null));
    child.on('exit', (code) => {
      if (code !== 0) resolve(null);
      else {
        const value = Number(String(out).trim());
        resolve(Number.isFinite(value) ? value : null);
      }
    });
  });
}

export async function materializeClip(parts, destPath, slices = []) {
  const singleLight = parts.length === 1
    && !slices[0]
    && sniffContainer(parts[0]) === 'mp4'
    && parts[0].length <= LIGHT_BYTES
    && !hevcWarning(parts[0]);
  if (singleLight) {
    await writeFile(destPath, parts[0]);
    return parts[0];
  }
  if (!(await ffmpegAvailable())) {
    if (parts.length === 1 && sniffContainer(parts[0]) === 'mp4') {
      await writeFile(destPath, parts[0]);
      return parts[0];
    }
    throw new ClipError('El grabador no entregó un MP4 ligero y no hay ffmpeg para bajarle la calidad.', 'CONTAINER');
  }
  const dir = await mkdtemp(join(tmpdir(), 'padel-clip-'));
  try {
    const ready = [];
    for (let i = 0; i < parts.length; i += 1) {
      const raw = join(dir, `p${i}.bin`);
      const file = join(dir, `p${i}.mp4`);
      await writeFile(raw, parts[i]);
      const cut = slices[i] ? fitSlice(slices[i], await probeDuration(raw)) : null;
      if (!cut && sniffContainer(parts[i]) === 'mp4' && parts[i].length <= LIGHT_BYTES && !hevcWarning(parts[i])) {
        await writeFile(file, parts[i]);
      } else {
        await transcodeLight(raw, file, cut);
      }
      ready.push(file);
    }
    if (ready.length === 1) {
      const bytes = await readFile(ready[0]);
      await writeFile(destPath, bytes);
      return bytes;
    }
    const list = join(dir, 'list.txt');
    const body = ready.map((file) => `file '${ffmpegPath(file)}'`).join('\n');
    await writeFile(list, body);
    await runFfmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', destPath]);
    return readFile(destPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
