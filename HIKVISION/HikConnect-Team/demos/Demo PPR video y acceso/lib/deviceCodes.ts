import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

// Codigos de verificacion de dispositivo (stream cifrado). Se guardan FUERA de
// .env.local en data/device-codes.json: la carpeta data/ esta en .gitignore, asi
// el repo sube a GitHub sin claves y cada computadora genera su propio archivo
// la primera vez que se captura un codigo.
const FILE = path.join(process.cwd(), "data", "device-codes.json");

export async function readDeviceCodes(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export async function getDeviceCode(serial: string): Promise<string | undefined> {
  const map = await readDeviceCodes();
  return map[serial];
}

export async function saveDeviceCode(serial: string, code: string): Promise<void> {
  const map = await readDeviceCodes();
  map[serial] = code;
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(map, null, 2), "utf8");
}

export async function deleteDeviceCode(serial: string): Promise<void> {
  const map = await readDeviceCodes();
  if (!(serial in map)) return;
  delete map[serial];
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(map, null, 2), "utf8");
}
