"use client";

import { useCallback, useEffect, useState } from "react";
import { hppCall } from "@/lib/client";

export type HppDevice = {
  id?: string;
  deviceName?: string;
  deviceSerial?: string;
  deviceOnlineStatus?: number;
  healthStatus?: string;
  deviceCategory?: number;
  deviceSubCategory?: number;
  deviceType?: string;
  deviceVersion?: string;
  siteID?: string;
  siteName?: string;
};

export type DeviceFetch = { devices: HppDevice[]; error: string };

let pending: Promise<DeviceFetch> | null = null;

export function isSpeaker(device: HppDevice) {
  return device.deviceCategory === 12 && device.deviceSubCategory === 19;
}

/** Tipos de device/list según la documentación V2.15.500. */
const CATEGORIES: Record<number, string> = {
  1: "IPC",
  2: "NVR",
  3: "AlarmHost",
  4: "Intercom",
  5: "AccessControl",
  7: "IPDome",
  8: "Doorbell",
  9: "StorageBox",
  10: "thermalCamera",
  11: "Switch",
  12: "Otros (radar, altavoz de red)",
};

const SUBCATEGORIES: Record<number, string> = {
  0: "desconocido",
  1: "NVR",
  2: "DVR",
  3: "AX2",
  4: "AX Hub",
  5: "AX Hybrid",
  6: "panic alarm station",
  7: "box panic alarm station",
  8: "pole panic alarm station",
  9: "MinMoe",
  10: "AX Hybrid Pro",
  11: "cámara solar",
  12: "door station",
  13: "radar de caídas",
  14: "AxECO",
  15: "SwitchNet",
  16: "SwitchAC",
  17: "SwitchAP",
  18: "SIGN RADAR",
  19: "IP SPEAKER",
  20: "NVS",
  21: "SwitchRouter",
  23: "Interactive Screen",
  24: "Information Publish",
  25: "LEDDeviceCard",
  26: "NetworkAmplifier",
  27: "Bridge",
  28: "IndoorUnit",
};

export function categoryLabel(device: HppDevice) {
  const { deviceCategory: cat, deviceSubCategory: sub } = device;
  if (cat === undefined) return "categoría n/d";
  const main = CATEGORIES[cat] ?? `categoría ${cat}`;
  const detail = sub === undefined ? undefined : SUBCATEGORIES[sub] ?? `subtipo ${sub}`;
  return `${cat}/${sub ?? "?"} ${main}${detail ? ` · ${detail}` : ""}`;
}

export function fetchDevices(force = false): Promise<DeviceFetch> {
  if (!pending || force) {
    pending = (async () => {
      try {
        const first = await hppCall({
          path: "/api/hpcgw/v1/device/list",
          body: { page: 1, pageSize: 100 },
        });
        const response = first;
        const result = response.result as {
          errorCode?: string;
          message?: string;
          data?: { rows?: HppDevice[]; totalPage?: number };
        } | undefined;
        if (result?.errorCode === "0") {
          const devices = [...(result.data?.rows ?? [])];
          const totalPage = Math.min(result.data?.totalPage ?? 1, 50);
          for (let page = 2; page <= totalPage; page += 1) {
            const next = await hppCall({
              path: "/api/hpcgw/v1/device/list",
              body: { page, pageSize: 100 },
            });
            const nextResult = next.result as {
              errorCode?: string;
              data?: { rows?: HppDevice[] };
            } | undefined;
            if (nextResult?.errorCode !== "0") break;
            devices.push(...(nextResult.data?.rows ?? []));
          }
          return { devices, error: "" };
        }
        const detail =
          result?.message ?? result?.errorCode ?? response.message ?? response.errorCode;
        return { devices: [], error: detail ?? "No se pudo leer el inventario" };
      } catch {
        return { devices: [], error: "Error de red al consultar dispositivos" };
      }
    })();
  }
  return pending;
}

/** Inventario compartido: una sola llamada a device/list por carga de página. */
export function useDevices() {
  const [devices, setDevices] = useState<HppDevice[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    const result = await fetchDevices(force);
    setDevices(result.devices);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { devices, error, loading, reload: () => load(true) };
}
