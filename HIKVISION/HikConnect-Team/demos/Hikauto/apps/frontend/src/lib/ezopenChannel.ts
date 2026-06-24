import type { PlatformSnapshot } from "../types";

/** Ajusta el número de canal en URLs ezopen (ej. …/CH3807848/1.live → …/5.live). */
export function applyEzopenChannel(url: string, channel: number): string {
  if (!url || channel < 1) return url;
  return url.replace(/\/(\d+)\.(live|hd\.live|rec|hd\.rec)/i, `/${channel}.$2`);
}

export function formatChannelLabel(channelNo: string | number): string {
  return `CH${channelNo}`;
}

export function camerasForDevice(
  platform: PlatformSnapshot | null,
  deviceSerial: string
): Array<{ id: string; name: string; channelNo: string }> {
  if (!platform || !deviceSerial) return [];
  return platform.cameras
    .filter((c) => c.deviceSerial === deviceSerial)
    .sort((a, b) => Number(a.channelNo) - Number(b.channelNo));
}

export function resolveCameraResource(
  platform: PlatformSnapshot | null,
  deviceSerial: string,
  channel: number
): string {
  const match = camerasForDevice(platform, deviceSerial).find(
    (c) => Number(c.channelNo) === channel
  );
  return match?.id ?? "";
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
