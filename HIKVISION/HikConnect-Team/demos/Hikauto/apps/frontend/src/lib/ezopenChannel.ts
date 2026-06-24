import type { PlatformSnapshot } from "../types";
import { normalizeSerial } from "./serialMatch";

export type DeviceCamera = {
  id: string;
  name: string;
  channelNo: string;
};

/** Ajusta el número de canal en URLs ezopen (ej. …/CH3807848/1.live → …/5.live). */
export function applyEzopenChannel(url: string, channel: number): string {
  if (!url || channel < 1) return url;
  return url.replace(/\/(\d+)\.(live|hd\.live|rec|hd\.rec)/i, `/${channel}.$2`);
}

export function formatChannelLabel(channelNo: string | number): string {
  return `CH${channelNo}`;
}

export function formatCameraOptionLabel(camera: DeviceCamera): string {
  const label = formatChannelLabel(camera.channelNo);
  return camera.name ? `${label} — ${camera.name}` : label;
}

export function camerasForDevice(
  platform: PlatformSnapshot | null,
  deviceSerial: string
): DeviceCamera[] {
  if (!platform || !deviceSerial) return [];
  const serial = normalizeSerial(deviceSerial);
  return platform.cameras
    .filter((c) => normalizeSerial(c.deviceSerial) === serial)
    .sort((a, b) => Number(a.channelNo) - Number(b.channelNo));
}

export function findCameraById(
  platform: PlatformSnapshot | null,
  deviceSerial: string,
  cameraId: string
): DeviceCamera | undefined {
  if (!cameraId) return undefined;
  return camerasForDevice(platform, deviceSerial).find((c) => c.id === cameraId);
}

export function findCameraByChannel(
  platform: PlatformSnapshot | null,
  deviceSerial: string,
  channel: number
): DeviceCamera | undefined {
  if (channel < 1) return undefined;
  return camerasForDevice(platform, deviceSerial).find(
    (c) => Number(c.channelNo) === channel
  );
}

export function resolveCameraResource(
  platform: PlatformSnapshot | null,
  deviceSerial: string,
  channel: number
): string {
  return findCameraByChannel(platform, deviceSerial, channel)?.id ?? "";
}

/** Canal por defecto: 5 si existe (OSD típico AE-DI), si no el primero del inventario. */
export function defaultCameraChannel(
  platform: PlatformSnapshot | null,
  deviceSerial: string,
  fallback = 1
): number {
  const list = camerasForDevice(platform, deviceSerial);
  if (list.some((c) => c.channelNo === "5")) return 5;
  if (list.length > 0) return Number(list[0].channelNo) || fallback;
  return fallback;
}
