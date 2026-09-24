export type HppCallResponse = {
  httpStatus?: number;
  result?: unknown;
  errorCode?: string;
  message?: string;
};

export async function hppCall(input: {
  method?: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  contentType?: string;
  timeoutMs?: number;
}): Promise<HppCallResponse> {
  const res = await fetch("/api/hpp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await res.json()) as HppCallResponse;
}

export async function hppUpload(form: FormData): Promise<HppCallResponse> {
  const res = await fetch("/api/hpp/upload", { method: "POST", body: form });
  return (await res.json()) as HppCallResponse;
}

export type SessionInfo = {
  connected: boolean;
  areaDomain?: string;
  expireTime?: number;
  appKeyMasked?: string;
  message?: string;
  errorCode?: string;
};

export async function loadSession(): Promise<SessionInfo> {
  const res = await fetch("/api/session", { cache: "no-store" });
  return (await res.json()) as SessionInfo;
}
