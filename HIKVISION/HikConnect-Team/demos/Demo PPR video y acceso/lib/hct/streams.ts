import { config } from "@/lib/config";
import { hctFetch } from "./client";
import { getCamera } from "./cameras";
import { getDeviceCode } from "@/lib/deviceCodes";
import { mockStreamSession } from "@/lib/mock/fixtures";
import type { StreamSession } from "./types";

interface StreamTokenData {
  appToken?: string;
  streamAreaDomain?: string;
}

interface LiveAddressData {
  url?: string;
  playUrl?: string;
}

// Sin 'use cache': la sesion de stream es secreta, de corta vida y por request.
export async function createStreamSession(
  mode: string,
  cameraId: string,
  code?: string,
): Promise<StreamSession> {
  if (mode === "mock") return mockStreamSession(cameraId);

  const camera = await getCamera(mode, cameraId);
  if (!camera) throw new Error("Camara no encontrada o fuera de allowlist");

  // Prioridad: codigo explicito > data/device-codes.json (local) > .env.local (fallback)
  const effectiveCode =
    code ?? (await getDeviceCode(camera.serial)) ?? config.deviceCodes()[camera.serial];

  const [streamToken, live] = await Promise.all([
    hctFetch<StreamTokenData>("/platform/v1/streamtoken/get", { method: "GET" }),
    hctFetch<LiveAddressData>("/video/v1/live/address/get", {
      body: {
        resourceId: camera.id,
        deviceSerial: camera.serial,
        type: "1",
        protocol: 1,
        quality: "1",
        ...(effectiveCode ? { code: effectiveCode } : {}),
      },
    }),
  ]);

  // La doc dice "playUrl" pero el API real devuelve "url" (verificado en vivo).
  const playUrl = live.url ?? live.playUrl;
  if (!playUrl || !streamToken.appToken || !streamToken.streamAreaDomain) {
    const keys = [...Object.keys(live), ...Object.keys(streamToken)].join(",");
    throw new Error(`HCT no devolvio url/appToken/streamAreaDomain (campos recibidos: ${keys})`);
  }

  return {
    url: playUrl,
    accessToken: streamToken.appToken,
    domain: streamToken.streamAreaDomain,
    template: playUrl.includes(".rec") ? "pcRec" : "pcLive",
    mock: false,
    cameraId,
  };
}
