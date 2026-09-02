import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { config } from "@/lib/config";

// Ajustes editables en caliente (sin reiniciar el dev server). Viven en
// data/settings.json (gitignored). Lo que este archivo no defina cae al
// default de .env.local.
const FILE = path.join(process.cwd(), "data", "settings.json");

export interface RuntimeSettings {
  // true = comandos de puerta solo se auditan (simulados); false = se envian a HCT
  dryRun?: boolean;
  // Credenciales del OpenAPI capturadas desde /settings
  hctHost?: string;
  hctAppKey?: string;
  hctSecretKey?: string;
}

export async function getRuntimeSettings(): Promise<RuntimeSettings> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as RuntimeSettings;
  } catch {
    return {};
  }
}

async function writeSettings(settings: RuntimeSettings): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(settings, null, 2), "utf8");
}

// --- dry-run ---

export async function setDryRunOverride(value: boolean): Promise<void> {
  const settings = await getRuntimeSettings();
  settings.dryRun = value;
  await writeSettings(settings);
}

export async function isDryRun(): Promise<boolean> {
  const settings = await getRuntimeSettings();
  return settings.dryRun ?? config.dryRun;
}

// --- claves HCT ---

export interface HctKeys {
  appKey: string;
  secretKey: string;
  source: "settings" | "env";
}

// Fallback por campo: se puede editar solo la AppKey en /settings y la
// SecretKey sigue viniendo de .env.local.
export async function getHctKeys(): Promise<HctKeys> {
  const settings = await getRuntimeSettings();
  const appKey = settings.hctAppKey ?? process.env.HCT_APP_KEY ?? "";
  const secretKey = settings.hctSecretKey ?? process.env.HCT_SECRET_KEY ?? "";
  if (!appKey || !secretKey) {
    throw new Error(
      "Faltan credenciales del OpenAPI: captura HCT_APP_KEY/HCT_SECRET_KEY en /settings o .env.local",
    );
  }
  const source = settings.hctAppKey || settings.hctSecretKey ? "settings" : "env";
  return { appKey, secretKey, source };
}

export async function getHctHost(): Promise<string> {
  const settings = await getRuntimeSettings();
  return (settings.hctHost ?? config.hct.host).replace(/\/$/, "");
}

export async function setHctField(
  field: "host" | "appKey" | "secretKey",
  value: string,
): Promise<void> {
  const settings = await getRuntimeSettings();
  if (field === "host") settings.hctHost = value.replace(/\/$/, "");
  if (field === "appKey") settings.hctAppKey = value;
  if (field === "secretKey") settings.hctSecretKey = value;
  await writeSettings(settings);
}

export async function setHctKeys(appKey: string, secretKey: string): Promise<void> {
  const settings = await getRuntimeSettings();
  settings.hctAppKey = appKey;
  settings.hctSecretKey = secretKey;
  await writeSettings(settings);
}
