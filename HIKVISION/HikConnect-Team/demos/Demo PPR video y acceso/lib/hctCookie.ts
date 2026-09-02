import { cookies } from "next/headers";
import crypto from "crypto";
import { config } from "@/lib/config";

// Credenciales del OpenAPI por navegador (no por servidor).
// Cookie httpOnly cifrada: este dispositivo las recuerda; otro equipo o borrar
// las cookies del sitio las vuelve a pedir. El servidor solo las usa en memoria
// para hablar con HCT; no las escribe a disco.
export const HCT_COOKIE = "poc_hct";
const MAX_AGE = 60 * 60 * 24 * 180; // 180 dias

export interface HctCreds {
  host?: string;
  appKey: string;
  secretKey: string;
}

function keyMaterial(): Buffer {
  return crypto.scryptSync(config.sessionSecret, "poc-hct-creds", 32);
}

function seal(creds: HctCreds): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyMaterial(), iv);
  const plain = Buffer.from(JSON.stringify(creds), "utf8");
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

function unseal(token: string): HctCreds | null {
  try {
    const buf = Buffer.from(token, "base64url");
    if (buf.length < 29) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", keyMaterial(), iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(enc), decipher.final()]);
    const parsed = JSON.parse(plain.toString("utf8")) as HctCreds;
    if (!parsed?.appKey || !parsed?.secretKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function readHctCookie(): Promise<HctCreds | null> {
  const jar = await cookies();
  const raw = jar.get(HCT_COOKIE)?.value;
  if (!raw) return null;
  return unseal(raw);
}

export async function writeHctCookie(creds: HctCreds): Promise<void> {
  const jar = await cookies();
  jar.set(HCT_COOKIE, seal(creds), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearHctCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(HCT_COOKIE);
}
