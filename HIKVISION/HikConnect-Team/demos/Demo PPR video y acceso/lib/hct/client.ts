import { schedule } from "./rateLimit";
import { getHctToken } from "./token";
import { getHctHost } from "@/lib/settings";

export class HctError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = "HctError";
  }
}

interface Options {
  method?: "GET" | "POST";
  body?: unknown;
}

// Cliente base del OpenAPI. Reglas:
// - header Token (no Authorization Bearer)
// - exito funcional = errorCode === "0" aunque HTTP sea 200
// - toda llamada pasa por la cola de 5 req/s
export async function hctFetch<T = unknown>(path: string, options: Options = {}): Promise<T> {
  const { method = "POST", body } = options;
  return schedule(async () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    headers.Token = await getHctToken();
    const host = await getHctHost();

    const res = await fetch(`${host}/api/hccgw${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      // Sin timeout, una conexion colgada de HCT deja la cola de rate-limit
      // trabada para siempre y cualquier 'use cache' en llenado muere con
      // "Filling a cache during prerender timed out" (USE_CACHE_TIMEOUT).
      signal: AbortSignal.timeout(15000),
    });

    const json = (await res.json().catch(() => null)) as {
      errorCode?: string;
      message?: string;
      data?: unknown;
    } | null;

    if (!res.ok) throw new HctError(`HTTP_${res.status}`, `${method} ${path} -> HTTP ${res.status}`);
    if (!json || json.errorCode !== "0") {
      throw new HctError(json?.errorCode ?? "UNKNOWN", json?.message ?? "Respuesta HCT sin errorCode 0");
    }
    return json.data as T;
  });
}
