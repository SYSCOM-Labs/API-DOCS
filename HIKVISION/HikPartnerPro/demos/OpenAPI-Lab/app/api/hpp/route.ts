import { NextResponse } from "next/server";
import { callHpp } from "@/lib/hpp";
import { readSession, writeSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ errorCode: "NO_SESSION", message: "Sin sesión. Conecta API Key." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as {
    method?: string;
    path?: string;
    body?: unknown;
    headers?: Record<string, string>;
    contentType?: string;
    timeoutMs?: number;
  };

  const method = (payload.method ?? "POST").toUpperCase();
  const path = payload.path ?? "";
  if (!path.startsWith("/api/hpcgw")) {
    return NextResponse.json({ errorCode: "BAD_PATH", message: "Ruta no permitida" }, { status: 400 });
  }

  try {
    const result = await callHpp({
      session,
      method,
      path,
      body: payload.body,
      extraHeaders: payload.headers,
      contentType: payload.contentType,
      timeoutMs: payload.timeoutMs ?? (path.includes("/mq/messages") ? 25_000 : 55_000),
    });
    if (
      result.session.accessToken !== session.accessToken ||
      result.session.expireTime !== session.expireTime
    ) {
      await writeSession(result.session);
    }
    return NextResponse.json({
      httpStatus: result.status,
      result: result.json,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de red";
    return NextResponse.json(
      { errorCode: "PROXY_ERROR", message },
      { status: 502 },
    );
  }
}
