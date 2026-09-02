import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCamera } from "@/lib/hct/cameras";
import { deleteDeviceCode, saveDeviceCode } from "@/lib/deviceCodes";
import { audit } from "@/lib/audit";
import { config } from "@/lib/config";

// POST: guardar un codigo YA VERIFICADO (el player confirmo reproduccion real).
// HCT acepta cualquier codigo al crear la sesion, asi que solo el primer frame
// exitoso prueba que el codigo es correcto.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  let code = "";
  try {
    const body = (await request.json()) as { code?: string };
    code = body.code?.trim() ?? "";
  } catch {
    // body invalido
  }
  if (!code) return NextResponse.json({ error: "code requerido" }, { status: 400 });

  const camera = await getCamera(config.mode, id);
  if (!camera) return NextResponse.json({ error: "Cámara no encontrada" }, { status: 404 });

  await saveDeviceCode(camera.serial, code);
  await audit({
    actor: session.username,
    action: "save_device_code",
    resource: camera.serial,
    result: "ok",
    at: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}

// DELETE: el codigo guardado fallo al reproducir (rotado o incorrecto): borrarlo
// para que la UI vuelva a pedirlo.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const camera = await getCamera(config.mode, id);
  if (!camera) return NextResponse.json({ error: "Cámara no encontrada" }, { status: 404 });

  await deleteDeviceCode(camera.serial);
  await audit({
    actor: session.username,
    action: "delete_device_code",
    resource: camera.serial,
    result: "ok",
    at: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}
