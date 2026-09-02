"use server";

import { revalidateTag } from "next/cache";
import { syncEncryptionBatch } from "@/lib/hct/encryption";
import { config } from "@/lib/config";

export async function refreshCameras() {
  revalidateTag("cameras", "max");
}

export async function refreshDoors() {
  revalidateTag("doors", "max");
}

export async function syncEncryption() {
  const result = await syncEncryptionBatch(config.mode, 50);
  // El archivo de cifrado cambio: refrescar la vista mezclada (mismo tag "cameras")
  revalidateTag("cameras", "max");
  return result;
}
