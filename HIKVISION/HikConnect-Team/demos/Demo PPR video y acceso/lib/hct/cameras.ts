import { cacheLife, cacheTag } from "next/cache";
import { config } from "@/lib/config";
import { hctFetch } from "./client";
import { mockCameras } from "@/lib/mock/fixtures";
import { readEncryptionMap } from "@/lib/encryptionStore";
import type { Camera } from "./types";

interface HctCameraNode {
  id?: string;
  name?: string;
  online?: string;
  area?: { name?: string };
  device?: {
    devInfo?: { serialNo?: string };
    channelInfo?: { no?: string };
  };
}

interface HctCameraPage {
  totalCount?: number;
  camera?: HctCameraNode[];
}

function normalize(node: HctCameraNode): Camera {
  return {
    id: node.id ?? "",
    name: node.name ?? "Sin nombre",
    online: node.online === "1",
    area: node.area?.name ?? "",
    serial: node.device?.devInfo?.serialNo ?? "",
    channel: node.device?.channelInfo?.no ?? "1",
  };
}

async function fetchAllCameras(): Promise<Camera[]> {
  const pageSize = 500;
  const first = await hctFetch<HctCameraPage>("/resource/v1/areas/cameras/get", {
    body: {
      pageIndex: 1,
      pageSize,
      filter: { areaID: "-1", includeSubArea: "1", deviceID: "", deviceSerialNo: "", cameraID: [] },
    },
  });
  const total = first.totalCount ?? 0;
  const nodes = [...(first.camera ?? [])];
  const pages = Math.ceil(total / pageSize);
  for (let page = 2; page <= pages; page++) {
    const next = await hctFetch<HctCameraPage>("/resource/v1/areas/cameras/get", {
      body: {
        pageIndex: page,
        pageSize,
        filter: { areaID: "-1", includeSubArea: "1", deviceID: "", deviceSerialNo: "", cameraID: [] },
      },
    });
    nodes.push(...(next.camera ?? []));
  }
  let cameras = nodes.map(normalize).filter((c) => c.id);
  if (config.cameraAllowlist.length > 0) {
    cameras = cameras.filter((c) => config.cameraAllowlist.includes(c.id));
  }
  return cameras;
}

// Mock si entra a 'use cache' (sin cookies). Live lee las claves del navegador
// y no puede cachearse de forma global: cada visitante trae su propio tenant.
export async function getCameras(mode: string): Promise<Camera[]> {
  if (mode === "mock") return getCamerasMock();
  return fetchAllCameras();
}

async function getCamerasMock(): Promise<Camera[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cameras");
  return mockCameras;
}

export async function getCamera(mode: string, id: string): Promise<Camera | null> {
  const cameras = await getCameras(mode);
  return cameras.find((c) => c.id === id) ?? null;
}

// Mezcla el inventario con el mapa de cifrado local. Va cacheada con el mismo
// tag "cameras": si no, el archivo puede cambiar entre el render del servidor y
// la hidratacion del cliente y React truena con hydration mismatch en los badges.
// La accion syncEncryption revalida el tag tras escribir el archivo.
export async function getCamerasWithEncryption(mode: string): Promise<Camera[]> {
  if (mode === "mock") return getCamerasWithEncryptionMock();
  const [cameras, map] = await Promise.all([getCameras(mode), readEncryptionMap()]);
  return cameras.map((c) => ({
    ...c,
    encrypted: map[c.serial]?.encrypted ?? c.encrypted ?? null,
  }));
}

async function getCamerasWithEncryptionMock(): Promise<Camera[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cameras");
  const [cameras, map] = await Promise.all([getCameras("mock"), readEncryptionMap()]);
  return cameras.map((c) => ({
    ...c,
    encrypted: map[c.serial]?.encrypted ?? c.encrypted ?? null,
  }));
}
