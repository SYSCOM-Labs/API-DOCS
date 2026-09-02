"use server";

import { getSession } from "@/lib/auth/session";
import { setDryRunOverride, setHctField, setHctKeys } from "@/lib/settings";
import { deleteDeviceCode } from "@/lib/deviceCodes";
import { audit } from "@/lib/audit";

async function requireOperator() {
  const session = await getSession();
  if (!session || session.role !== "operator") {
    throw new Error("Se requiere rol operator");
  }
  return session;
}

export async function setDryRun(enabled: boolean) {
  const session = await requireOperator();
  await setDryRunOverride(enabled);
  await audit({
    actor: session.username,
    action: "set_dry_run",
    resource: "settings",
    result: enabled ? "dry-run ON (comandos simulados)" : "dry-run OFF (comandos reales)",
    at: new Date().toISOString(),
  });
}

export async function removeDeviceCode(serial: string) {
  const session = await requireOperator();
  await deleteDeviceCode(serial);
  await audit({
    actor: session.username,
    action: "delete_device_code",
    resource: serial,
    result: "ok (desde configuración)",
    at: new Date().toISOString(),
  });
}

export async function saveHctField(field: "host" | "appKey" | "secretKey", value: string) {
  const session = await requireOperator();
  const v = value.trim();
  if (!v) throw new Error("El valor no puede estar vacío");
  if (field === "host" && !/^https:\/\/.+/.test(v)) {
    throw new Error("El host debe ser una URL https://");
  }
  await setHctField(field, v);
  await audit({
    actor: session.username,
    action: "save_hct_field",
    resource: field,
    result: field === "secretKey" ? "actualizada" : v.slice(0, 12) + (v.length > 12 ? "…" : ""),
    at: new Date().toISOString(),
  });
}

// Captura inicial de claves (dashboard cuando no hay ninguna configurada).
export async function saveHctKeys(appKey: string, secretKey: string) {
  const session = await requireOperator();
  if (!appKey.trim() || !secretKey.trim()) {
    throw new Error("AppKey y SecretKey son obligatorias");
  }
  await setHctKeys(appKey.trim(), secretKey.trim());
  await audit({
    actor: session.username,
    action: "save_hct_keys",
    resource: "settings",
    result: `appKey ${appKey.trim().slice(0, 4)}…`,
    at: new Date().toISOString(),
  });
}
