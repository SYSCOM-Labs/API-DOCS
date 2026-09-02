import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCameras } from "@/lib/hct/cameras";
import { config } from "@/lib/config";
import { HctError } from "@/lib/hct/client";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  try {
    const cameras = await getCameras(config.mode);
    return NextResponse.json({ items: cameras, total: cameras.length });
  } catch (e) {
    const message = e instanceof HctError ? `${e.errorCode}: ${e.message}` : "Error consultando cámaras";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
