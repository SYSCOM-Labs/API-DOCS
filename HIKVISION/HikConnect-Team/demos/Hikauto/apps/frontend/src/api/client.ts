/**
 * Cliente HTTP al proxy local (Express :4000).
 * Todas las peticiones incluyen `_credentials` en el body; Vite reenvía /api → backend.
 */
import type { ProxyResponse } from "../types";

async function parseProxyResponse<T>(res: Response): Promise<ProxyResponse<T>> {
  const text = await res.text();

  if (!text.trim()) {
    if (res.status === 502 || res.status === 503 || res.status === 500) {
      throw new Error(
        res.status === 500
          ? `Error interno del servidor (HTTP 500). Revisa la terminal del backend — busca [hik-mq] o [backend].`
          : "El backend no respondió. Ejecuta «npm run dev» en la raíz del proyecto (puerto 4000)."
      );
    }
    throw new Error(
      `Respuesta vacía del servidor (HTTP ${res.status}). ¿Está corriendo el backend en http://localhost:4000?`
    );
  }

  try {
    return JSON.parse(text) as ProxyResponse<T>;
  } catch {
    throw new Error(
      `Respuesta no válida del servidor (HTTP ${res.status}). Reinicia «npm run dev» y vuelve a intentar.`
    );
  }
}

/**
 * Cliente HTTP al proxy local. Todas las rutas incluyen _credentials en el body.
 */
export async function apiPost<T>(
  path: string,
  credentialsEnvelope: Record<string, string>,
  payload: Record<string, unknown> = {}
): Promise<ProxyResponse<T>> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _credentials: credentialsEnvelope, ...payload }),
    });
  } catch {
    throw new Error(
      "No se pudo contactar al backend. Inicia el proyecto con «npm run dev» (frontend :5173 + backend :4000)."
    );
  }
  return parseProxyResponse<T>(res);
}

export async function apiGet<T>(
  path: string,
  credentialsEnvelope: Record<string, string>
): Promise<ProxyResponse<T>> {
  const q = encodeURIComponent(JSON.stringify(credentialsEnvelope));
  let res: Response;
  try {
    res = await fetch(`${path}?_credentials=${q}`);
  } catch {
    throw new Error(
      "No se pudo contactar al backend. Inicia el proyecto con «npm run dev»."
    );
  }
  return parseProxyResponse<T>(res);
}

/** Comprueba que el proxy local esté activo antes de conectar a Hik-Connect. */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch("/health");
    if (!res.ok) return false;
    const text = await res.text();
    if (!text.trim()) return false;
    const data = JSON.parse(text) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}
