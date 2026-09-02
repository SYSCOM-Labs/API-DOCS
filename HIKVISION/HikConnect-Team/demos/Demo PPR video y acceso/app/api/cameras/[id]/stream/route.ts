import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createStreamSession } from "@/lib/hct/streams";
import { config } from "@/lib/config";
import { HctError } from "@/lib/hct/client";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  let code: string | undefined;
  try {
    const body = (await request.json()) as { code?: string };
    code = body.code?.trim() || undefined;
  } catch {
    // body vacio es valido
  }

  try {
    const streamSession = await createStreamSession(config.mode, id, code);
    // Ojo: el codigo NO se guarda aqui. HCT acepta cualquier codigo y devuelve
    // la URL igual (el codigo va embebido en el ezopen://); si es incorrecto la
    // reproduccion falla en el player. El codigo se guarda solo cuando el player
    // confirma reproduccion real (POST /api/cameras/[id]/code).
    return NextResponse.json(streamSession);
  } catch (e) {
    if (e instanceof HctError && e.errorCode === "EVZ60019") {
      return NextResponse.json(
        { error: "DEVICE_CODE_REQUIRED", message: "El stream está cifrado: captura el código de verificación del dispositivo." },
        { status: 409 },
      );
    }
    const message = e instanceof Error ? e.message : "Error creando sesión de stream";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
