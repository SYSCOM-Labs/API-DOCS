"use server";

import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  addPerson,
  addPersonGroup,
  deletePerson,
  deletePersonGroup,
  setPersonCard,
  setPersonPin,
  type NewPerson,
} from "@/lib/hct/persons";
import { assignAccessLevel, unassignAccessLevel } from "@/lib/hct/accessLevels";
import { addDevice, deleteDevice, type NewDevice } from "@/lib/hct/devices";
import { audit } from "@/lib/audit";
import { config } from "@/lib/config";

async function requireOperator() {
  const session = await getSession();
  if (!session || session.role !== "operator") {
    throw new Error("Se requiere rol operator");
  }
  return session.username;
}

// En mock las mutaciones no tocan HCT: solo se auditan como simuladas.
async function auditMutation(
  actor: string,
  action: string,
  resource: string,
  detail: string,
  fn: () => Promise<unknown>,
) {
  if (config.mode === "mock") {
    await audit({ actor, action, resource, result: `mock: ${detail}`, at: new Date().toISOString() });
    return { simulated: true };
  }
  await fn();
  await audit({ actor, action, resource, result: detail, at: new Date().toISOString() });
  return { simulated: false };
}

export async function addGroup(name: string) {
  const actor = await requireOperator();
  if (!name.trim()) throw new Error("Nombre de grupo requerido");
  const result = await auditMutation(actor, "add_group", name.trim(), "creado", () =>
    addPersonGroup(name.trim()),
  );
  revalidateTag("persons", "max");
  return result;
}

export async function removeGroup(groupId: string, name: string) {
  const actor = await requireOperator();
  const result = await auditMutation(actor, "delete_group", name, "eliminado", () =>
    deletePersonGroup(groupId),
  );
  revalidateTag("persons", "max");
  return result;
}

export async function addPersonAction(input: NewPerson) {
  const actor = await requireOperator();
  if (!input.firstName.trim()) throw new Error("Nombre requerido");
  if (!input.groupId) throw new Error("Grupo requerido");
  const result = await auditMutation(
    actor,
    "add_person",
    `${input.firstName} ${input.lastName}`.trim(),
    "creada",
    () => addPerson(input),
  );
  revalidateTag("persons", "max");
  return result;
}

export async function removePerson(personId: string, name: string) {
  const actor = await requireOperator();
  const result = await auditMutation(actor, "delete_person", name, "eliminada", () =>
    deletePerson(personId),
  );
  revalidateTag("persons", "max");
  return result;
}

export async function setCard(personId: string, name: string, cardNo: string) {
  const actor = await requireOperator();
  if (!/^\d{1,20}$/.test(cardNo.trim())) throw new Error("Tarjeta: hasta 20 dígitos");
  return auditMutation(actor, "set_card", name, `tarjeta ${cardNo.trim()}`, () =>
    setPersonCard(personId, cardNo.trim()),
  );
}

export async function setPin(personId: string, name: string, pinCode: string) {
  const actor = await requireOperator();
  if (!/^\d{4,8}$/.test(pinCode.trim())) throw new Error("PIN: 4 a 8 dígitos");
  return auditMutation(actor, "set_pin", name, "PIN actualizado", () =>
    setPersonPin(personId, pinCode.trim()),
  );
}

export async function assignLevel(personId: string, name: string, levelId: string, levelName: string) {
  const actor = await requireOperator();
  const result = await auditMutation(actor, "assign_level", name, `nivel ${levelName}`, () =>
    assignAccessLevel(personId, levelId),
  );
  revalidateTag("accessLevels", "max");
  return result;
}

export async function unassignLevel(personId: string, name: string, levelId: string, levelName: string) {
  const actor = await requireOperator();
  const result = await auditMutation(actor, "unassign_level", name, `nivel ${levelName} retirado`, () =>
    unassignAccessLevel(personId, levelId),
  );
  revalidateTag("accessLevels", "max");
  return result;
}

export async function addDeviceAction(input: NewDevice) {
  const actor = await requireOperator();
  if (!input.name.trim() || !input.serial.trim() || !input.verifyCode.trim()) {
    throw new Error("Nombre, serial y código de verificación son requeridos");
  }
  if (config.mode === "mock") {
    await audit({
      actor,
      action: "add_device",
      resource: input.serial,
      result: `mock: ${input.category}`,
      at: new Date().toISOString(),
    });
    return { simulated: true, succeeded: 1, failed: 0 };
  }
  const res = await addDevice(input);
  await audit({
    actor,
    action: "add_device",
    resource: input.serial,
    result:
      res.failed > 0
        ? `falló (${res.errorCode ?? "?"})`
        : `agregado como ${input.category}`,
    at: new Date().toISOString(),
  });
  if (res.failed > 0) {
    throw new Error(`HCT rechazó el alta: ${res.errorCode ?? "error desconocido"} (verifica serial y código)`);
  }
  revalidateTag("cameras", "max");
  revalidateTag("doors", "max");
  return { simulated: false, ...res };
}

export async function removeDeviceAction(deviceId: string, category: string, name: string) {
  const actor = await requireOperator();
  const result = await auditMutation(actor, "delete_device", name, `eliminado (${category})`, () =>
    deleteDevice(deviceId, category),
  );
  revalidateTag("cameras", "max");
  revalidateTag("doors", "max");
  return result;
}
