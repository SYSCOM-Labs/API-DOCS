import type { ProxyResponse } from "../types";

async function parseProxyResponse<T>(res: Response): Promise<ProxyResponse<T>> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(
      res.status >= 500
        ? `Error del servidor (HTTP ${res.status}). Revisa la terminal del backend.`
        : "Respuesta vacía. ¿Está corriendo el backend en :4000?"
    );
  }
  try {
    return JSON.parse(text) as ProxyResponse<T>;
  } catch {
    throw new Error(`Respuesta no válida (HTTP ${res.status}).`);
  }
}

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
    throw new Error("No se pudo contactar al backend. Ejecuta «npm run dev» en la raíz.");
  }
  return parseProxyResponse<T>(res);
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch("/health");
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}
