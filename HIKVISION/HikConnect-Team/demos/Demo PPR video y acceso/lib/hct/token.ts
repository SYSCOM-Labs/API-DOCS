import { getHctHost, getHctKeys } from "@/lib/settings";

// Token OpenAPI HCT (7 dias). Se guarda en memoria de proceso, NUNCA en
// 'use cache' ni en logs. Se renueva 5 minutos antes de expirar.
interface TokenState {
  token: string;
  expiresAtMs: number;
  appKey: string;
}

let state: TokenState | null = null;

function normalizeExpire(expireTime: unknown): number {
  const n = Number(expireTime);
  if (!Number.isFinite(n) || n <= 0) return Date.now() + 6 * 24 * 3600 * 1000;
  // La guia muestra epoch en segundos; streamtoken lo muestra en ms.
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
  state = {
    token: json.data.accessToken,
    expiresAtMs: normalizeExpire(json.data.expireTime),
    appKey: keys.appKey,
  };
  return state.token;
}

export async function getHctToken(): Promise<string> {
  // Si las claves cambiaron en /settings, el token viejo ya no sirve.
  const keys = await getHctKeys();
  if (state && state.appKey === keys.appKey && Date.now() < state.expiresAtMs - 5 * 60 * 1000) {
    return state.token;
  }
  // Sin dedupe de "inflight": esa promesa vivia a nivel modulo y un 'use cache'
  // que la espera durante prerender se cuelga (USE_CACHE_TIMEOUT). En frio puede
  // haber 2-3 token/get paralelos; el rate limiter los espacia y el ultimo gana.
  try {
    return await requestToken();
  } catch {
    // Un reintento cubre transitorios: conexion fria o timeout del primer
    // token/get justo despues de capturar las claves.
    return requestToken();
  }
}
