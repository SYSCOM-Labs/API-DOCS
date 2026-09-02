import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAccessEvents } from "@/lib/hct/events";
import { config } from "@/lib/config";
import { HctError } from "@/lib/hct/client";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(request.url);
  const pageIndex = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));

  try {
    const page = await getAccessEvents(config.mode, pageIndex, pageSize);
    return NextResponse.json(page);
  } catch (e) {
    const message = e instanceof HctError ? `${e.errorCode}: ${e.message}` : "Error consultando marcaciones";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
