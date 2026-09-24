import type { HppSession } from "./session";

const TOKEN_URL = "https://api.hik-partner.com/api/hpcgw/v1/token/get";

export type HppEnvelope = {
  errorCode?: string;
  message?: string;
  data?: unknown;
  [key: string]: unknown;
};

function cleanDomain(domain: string) {
  return domain.replace(/\s+/g, "").replace(/\/+$/, "");
}

export async function fetchToken(appKey: string, secretKey: string) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ appKey, secretKey }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as HppEnvelope & {
    data?: { accessToken?: string; expireTime?: number; areaDomain?: string };
    accessToken?: string;
    expireTime?: number;
    areaDomain?: string;
  };

  const data = json.data ?? json;
  const accessToken = data.accessToken;
  const expireTime = data.expireTime;
  const areaDomain = data.areaDomain ? cleanDomain(data.areaDomain) : "";

  if (!accessToken || !areaDomain) {
    return {
      ok: false as const,
      errorCode: String(json.errorCode ?? res.status),
      message: json.message ?? "No se pudo obtener el token",
      raw: json,
    };
  }

  return {
    ok: true as const,
    accessToken,
    expireTime: Number(expireTime),
    areaDomain,
    errorCode: String(json.errorCode ?? "0"),
    raw: json,
  };
}

export function tokenExpired(expireTime: number) {
  return !expireTime || Date.now() > expireTime - 60_000;
}

export async function callHpp(options: {
  session: HppSession;
  method: string;
  path: string;
  body?: unknown;
  extraHeaders?: Record<string, string>;
  contentType?: string;
  timeoutMs?: number;
}): Promise<{ status: number; json: HppEnvelope | string; session: HppSession }> {
  let session = options.session;
  if (tokenExpired(session.expireTime)) {
    const refreshed = await fetchToken(session.appKey, session.secretKey);
    if (refreshed.ok) {
      session = {
        ...session,
        accessToken: refreshed.accessToken,
        expireTime: refreshed.expireTime,
        areaDomain: refreshed.areaDomain,
      };
    }
  }

  const run = async (current: HppSession) => {
    const url = `${cleanDomain(current.areaDomain)}${options.path.startsWith("/") ? options.path : `/${options.path}`}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${current.accessToken}`,
      ...(options.extraHeaders ?? {}),
    };
    const contentType = options.contentType ?? "application/json";
    if (!headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = contentType;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 55_000);
    try {
      const init: RequestInit = {
        method: options.method,
        headers,
        cache: "no-store",
        signal: controller.signal,
      };
      if (options.method !== "GET" && options.method !== "HEAD" && options.body !== undefined) {
        init.body =
          typeof options.body === "string"
            ? options.body
            : contentType.includes("xml")
              ? String(options.body)
              : JSON.stringify(options.body);
      }
      const res = await fetch(url, init);
      const text = await res.text();
      let parsed: HppEnvelope | string = text;
      try {
        parsed = JSON.parse(text) as HppEnvelope;
      } catch {
        parsed = text;
      }
      return { status: res.status, json: parsed };
    } finally {
      clearTimeout(timer);
    }
  };

  let result = await run(session);
  const code =
    typeof result.json === "object" && result.json
      ? String((result.json as HppEnvelope).errorCode ?? "")
      : "";
  if (code === "LAP500004") {
    const refreshed = await fetchToken(session.appKey, session.secretKey);
    if (refreshed.ok) {
      session = {
        ...session,
        accessToken: refreshed.accessToken,
        expireTime: refreshed.expireTime,
        areaDomain: refreshed.areaDomain,
      };
      result = await run(session);
    }
  }
  return { ...result, session };
}

export async function uploadHpp(options: {
  session: HppSession;
  path: string;
  form: FormData;
  extraHeaders?: Record<string, string>;
}) {
  let session = options.session;
  if (tokenExpired(session.expireTime)) {
    const refreshed = await fetchToken(session.appKey, session.secretKey);
    if (refreshed.ok) {
      session = {
        ...session,
        accessToken: refreshed.accessToken,
        expireTime: refreshed.expireTime,
        areaDomain: refreshed.areaDomain,
      };
    }
  }

  const url = `${cleanDomain(session.areaDomain)}${options.path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...(options.extraHeaders ?? {}),
    },
    body: options.form,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as HppEnvelope;
  return { status: res.status, json, session };
}
