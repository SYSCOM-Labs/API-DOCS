import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { config } from "@/lib/config";
import { clearHctCookie, readHctCookie, writeHctCookie } from "@/lib/hctCookie";

// Ajustes de servidor (dry-run) en data/settings.json. Las claves HCT ya no
// se escriben aqui: viven en una cookie de este navegador (lib/hctCookie.ts).
const FILE = path.join(process.cwd(), "data", "settings.json");

export interface RuntimeSettings {
  dryRun?: boolean;
  // Legacy: si un settings.json viejo aun tiene claves, se leen como fallback.
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

export async function setDryRunOverride(value: boolean): Promise<void> {
  const settings = await getRuntimeSettings();
  settings.dryRun = value;
  await writeSettings(settings);
}

export async function isDryRun(): Promise<boolean> {
  const settings = await getRuntimeSettings();
  return settings.dryRun ?? config.dryRun;
}

export interface HctKeys {
  appKey: string;
  secretKey: string;
  source: "cookie" | "settings" | "env";
}

export async function getHctKeys(): Promise<HctKeys> {
  const fromCookie = await readHctCookie();
  if (fromCookie?.appKey && fromCookie.secretKey) {
    return { appKey: fromCookie.appKey, secretKey: fromCookie.secretKey, source: "cookie" };
  }

  const settings = await getRuntimeSettings();
  const appKey = settings.hctAppKey ?? process.env.HCT_APP_KEY ?? "";
  const secretKey = settings.hctSecretKey ?? process.env.HCT_SECRET_KEY ?? "";
  if (!appKey || !secretKey) {
    throw new Error(
      "Faltan credenciales del OpenAPI: captura AppKey y SecretKey en este navegador.",
    );
  }
  const source = settings.hctAppKey || settings.hctSecretKey ? "settings" : "env";
  return { appKey, secretKey, source };
}

export async function getHctHost(): Promise<string> {
  const fromCookie = await readHctCookie();
  if (fromCookie?.host) return fromCookie.host.replace(/\/$/, "");
  const settings = await getRuntimeSettings();
  return (settings.hctHost ?? config.hct.host).replace(/\/$/, "");
}

async function currentCredsOrEmpty(): Promise<{ host?: string; appKey: string; secretKey: string }> {
  try {
    const keys = await getHctKeys();
    const host = await getHctHost();
    return { host, appKey: keys.appKey, secretKey: keys.secretKey };
  } catch {
    const host = await getHctHost();
    return { host, appKey: "", secretKey: "" };
  }
}

export async function setHctField(
  field: "host" | "appKey" | "secretKey",
  value: string,
): Promise<void> {
  const current = await currentCredsOrEmpty();
  if (field === "host") current.host = value.replace(/\/$/, "");
  if (field === "appKey") current.appKey = value;
  if (field === "secretKey") current.secretKey = value;
  if (!current.appKey || !current.secretKey) {
    throw new Error("AppKey y SecretKey son obligatorias");
  }
  await writeHctCookie({
    host: current.host,
    appKey: current.appKey,
    secretKey: current.secretKey,
  });
}

export async function setHctKeys(appKey: string, secretKey: string): Promise<void> {
  const host = await getHctHost();
  await writeHctCookie({ host, appKey, secretKey });
}

export async function forgetHctKeys(): Promise<void> {
  await clearHctCookie();
}
