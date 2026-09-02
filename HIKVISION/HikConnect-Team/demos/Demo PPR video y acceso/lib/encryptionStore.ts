import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "encryption.json");

export interface EncryptionInfo {
  encrypted: boolean;
  at: string;
}

export type EncryptionMap = Record<string, EncryptionInfo>;

export async function readEncryptionMap(): Promise<EncryptionMap> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as EncryptionMap;
  } catch {
    return {};
  }
}

export async function writeEncryptionMap(map: EncryptionMap): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(map, null, 2), "utf8");
}
