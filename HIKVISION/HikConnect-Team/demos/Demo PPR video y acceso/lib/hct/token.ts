import { getHctHost, getHctKeys } from "@/lib/settings";

// Token OpenAPI HCT (7 dias). Mapa por AppKey: en un hosting compartido cada
// navegador trae sus propias claves; no reutilizar el token de otro tenant.
interface TokenState {
  token: string;
  expiresAtMs: number;
}

const tokens = new Map<string, TokenState>();

function normalizeExpire(expireTime: unknown): number {
  const n = Number(expireTime);
  if (!Number.isFinite(n) || n <= 0) return Date.now() + 6 * 24 * 3600 * 1000;
  return n > 1e12 ? n : n * 1000;
}

async function requestToken(): Promise<string> {
  const keys = await getHctKeys();
  const host = await getHctHost();
  const res = await fetch(`${host}/api/hccgw/platform/v1/token/get`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appKey: keys.appKey, secretKey: keys.secretKey }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const json = (await res.json().catch(() => null)) as {
    errorCode?: string;
    message?: string;
    data?: { accessToken?: string; expireTime?: unknown };
  } | null;
  if (!res.ok) throw new Error(`token/get HTTP ${res.status}`);
  if (!json || json.errorCode !== "0" || !json.data?.accessToken) {
    throw new Error(`token/get fallo: ${json?.errorCode ?? "?"} ${json?.message ?? ""}`);
  }
  const state: TokenState = {
    token: json.data.accessToken,
    expiresAtMs: normalizeExpire(json.data.expireTime),
  };
  tokens.set(keys.appKey, state);
  return state.token;
}

export async function getHctToken(): Promise<string> {
  const keys = await getHctKeys();
  const state = tokens.get(keys.appKey);
  if (state && Date.now() < state.expiresAtMs - 5 * 60 * 1000) {
    return state.token;
  }
  try {
    return await requestToken();
  } catch {
    return requestToken();
  }
}
