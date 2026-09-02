import { getCameras } from "./cameras";
import { hctFetch } from "./client";
import { readEncryptionMap, writeEncryptionMap } from "@/lib/encryptionStore";

interface DeviceDetail {
  device?: { baseInfo?: { streamEncryptEnable?: string } };
}

export interface SyncResult {
  checked: number;
  remaining: number;
  total: number;
}

// El listado de camaras NO trae flag de cifrado; el dato vive por dispositivo
// en devicedetail/get (baseInfo.streamEncryptEnable). Se sincroniza por lotes
// para respetar el limite de 5 req/s y se persiste en data/encryption.json.
export async function syncEncryptionBatch(mode: string, limit = 50): Promise<SyncResult> {
  const cameras = await getCameras(mode);
  const serials = [...new Set(cameras.map((c) => c.serial).filter(Boolean))];

  if (mode === "mock") {
    return { checked: 0, remaining: 0, total: serials.length };
  }

  const map = await readEncryptionMap();
  const pending = serials.filter((s) => !(s in map));
  const batch = pending.slice(0, limit);

  for (const serial of batch) {
    try {
      const detail = await hctFetch<DeviceDetail>("/resource/v1/devicedetail/get", {
        body: { deviceSerialNo: serial },
      });
      map[serial] = {
        encrypted: detail.device?.baseInfo?.streamEncryptEnable === "1",
        at: new Date().toISOString(),
      };
    } catch {
      // Si un dispositivo falla, no se guarda: se reintenta en el siguiente lote.
    }
  }

  await writeEncryptionMap(map);
  return { checked: batch.length, remaining: pending.length - batch.length, total: serials.length };
}
