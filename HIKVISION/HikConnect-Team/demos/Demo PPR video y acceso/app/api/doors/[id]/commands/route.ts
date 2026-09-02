import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { remoteDoorControl, type DoorAction } from "@/lib/hct/access";
import { audit } from "@/lib/audit";
import { isDryRun } from "@/lib/settings";
import { config } from "@/lib/config";
import { HctError } from "@/lib/hct/client";

const ACTIONS: DoorAction[] = ["unlock", "lock", "remain_unlock", "remain_lock"];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (session.role !== "operator") {
    return NextResponse.json({ error: "Se requiere rol operator" }, { status: 403 });
  }

  const { id } = await params;

  let action: DoorAction = "unlock";
  let reason = "";
  try {
    const body = (await request.json()) as { action?: DoorAction; reason?: string };
    if (body.action && ACTIONS.includes(body.action)) action = body.action;
    reason = body.reason?.trim() ?? "";
  } catch {
    // body vacio: usa defaults
  }
  if (!reason) {
    return NextResponse.json({ error: "El motivo (reason) es obligatorio" }, { status: 400 });
  }

  const dryRun = await isDryRun();
  if (config.mode === "mock" || dryRun) {
    await audit({
      actor: session.username,
      action,
      resource: id,
      reason,
      result: config.mode === "mock" ? "mock" : "dry-run",
      at: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, simulated: true });
  }

  try {
    await remoteDoorControl(id, action);
    await audit({ actor: session.username, action, resource: id, reason, result: "ok", at: new Date().toISOString() });
    return NextResponse.json({ ok: true, simulated: false });
  } catch (e) {
    const message = e instanceof HctError ? `${e.errorCode}: ${e.message}` : "Error en comando de puerta";
    await audit({ actor: session.username, action, resource: id, reason, result: message, at: new Date().toISOString() });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
