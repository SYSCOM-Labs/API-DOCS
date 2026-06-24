import { hikClient } from "./hikClient.js";
import { hikAuthService } from "./hikAuth.js";
import type { HikCredentials, HikApiResponse } from "../types/hik.types.js";

/** Vehículo normalizado para autocompletado en el frontend. */
export interface DiscoveredVehicle {
  vehicleId: string;
  name: string;
  licensePlateNo: string;
  vehicleType: number;
  deviceSerial: string;
  deviceId: string;
  areaId: string;
  areaName: string;
  online: string;
  cameraId: string;
  cameraChannelNo: string;
}

export interface DiscoveredArea {
  id: string;
  name: string;
}

export interface DiscoveredCamera {
  id: string;
  name: string;
  deviceSerial: string;
  channelNo: string;
}

export interface DiscoveredDriver {
  driverId: string;
  driverName: string;
  driverCode: string;
  groupId: string;
  groupName: string;
  relatedVehicleIds: string[];
}

export interface PlatformDiscoveryResult {
  areaDomain: string;
  userId: string;
  areas: DiscoveredArea[];
  vehicles: DiscoveredVehicle[];
  cameras: DiscoveredCamera[];
  drivers: DiscoveredDriver[];
  driverGroups: { groupId: string; groupName: string }[];
  deviceSerialsCsv: string;
  summary: {
    areaCount: number;
    vehicleCount: number;
    cameraCount: number;
    driverCount: number;
    onlineVehicleCount: number;
  };
  calls: Array<{ label: string; path: string; errorCode: string }>;
}

const META = { sourceFile: "apps/backend/src/services/discoveryService.ts" };

/**
 * Tras token/get, ejecuta consultas de inventario para poblar el demo automáticamente.
 */
export async function discoverPlatform(
  credentials: HikCredentials
): Promise<PlatformDiscoveryResult> {
  const session = await hikAuthService.getValidSession(credentials);
  const calls: PlatformDiscoveryResult["calls"] = [];

  async function call<T>(label: string, path: string, body: unknown): Promise<T | null> {
    const res = await hikClient.proxyPost<HikApiResponse<T>>(credentials, path, body, META);
    const errorCode = (res.data as HikApiResponse)?.errorCode ?? "?";
    calls.push({ label, path, errorCode });
    if (errorCode !== "0") return null;
    return (res.data as HikApiResponse<T>).data ?? null;
  }

  const [areasData, vehiclesData, camerasData, devicesData, driversData, driverGroupsData] =
    await Promise.all([
    call<{ area?: Array<{ id: string; name: string }> }>(
      "Áreas",
      "/api/hccgw/resource/v1/areas/get",
      { pageIndex: 1, pageSize: 100, filter: { parentAreaID: "-1", includeSubArea: 1 } }
    ),
    call<{
      vehicle?: Array<{
        id: string;
        name: string;
        online: string;
        area?: { id?: string; name?: string };
        device?: {
          devInfo?: { id?: string; serialNo?: string };
          channelInfo?: { id?: string; no?: string };
        };
        vehicleInfo?: { licensePlateNo?: string; vehicleType?: number };
      }>;
    }>("Vehículos onboard", "/api/hccgw/resource/v1/areas/vehicles/get", {
      pageIndex: 1,
      pageSize: 100,
      filter: { areaID: "-1", includeSubArea: "1", vehicleID: [] },
    }),
    call<{
      camera?: Array<{
        id: string;
        name: string;
        device?: { devInfo?: { serialNo?: string }; channelInfo?: { no?: string } };
      }>;
    }>("Cámaras", "/api/hccgw/resource/v1/areas/cameras/get", {
      pageIndex: 1,
      pageSize: 200,
      filter: { areaID: "-1", includeSubArea: "1", deviceID: "", deviceSerialNo: "" },
    }),
    call<{
      device?: Array<{
        baseInfo?: { serialNo?: string };
        cameraChannel?: Array<{
          id: string;
          name: string;
          no?: string;
          online?: string;
        }>;
      }>;
    }>("Dispositivos (canales)", "/api/hccgw/resource/v1/devices/get", {
      pageIndex: 1,
      pageSize: 500,
    }),
    call<{
      drivers?: Array<{
        driverId: string;
        driverName?: string;
        driverCode?: string;
        driverGroupId?: string;
        driverGroupName?: string;
        relatedVehicles?: Array<{ vehicleId?: string }>;
      }>;
    }>("Conductores", "/api/hccgw/vehicle/v1/driver/batchquery", {
      groupId: "",
      driverIds: [],
      distributionStatus: -1,
      fuzzySearch: "",
      relatedVehicle: -1,
      pageIndex: 1,
      pageSize: 100,
    }),
    call<{
      driverGroup?: Array<{ groupId?: string; groupName?: string }>;
      groups?: Array<{ groupId?: string; groupName?: string }>;
    }>("Grupos conductores", "/api/hccgw/vehicle/v1/driverGroup/batchquery", {
      pageIndex: 1,
      pageSize: 100,
    }),
  ]);

  const areas: DiscoveredArea[] = (areasData?.area ?? []).map((a) => ({
    id: a.id,
    name: a.name,
  }));

  const camerasFromAreas: DiscoveredCamera[] = (camerasData?.camera ?? [])
    .filter((c) => c.device?.devInfo?.serialNo)
    .map((c) => ({
      id: c.id,
      name: c.name,
      deviceSerial: c.device!.devInfo!.serialNo!,
      channelNo: c.device?.channelInfo?.no ?? "1",
    }));

  const camerasFromDevices: DiscoveredCamera[] = (devicesData?.device ?? []).flatMap((d) => {
    const serial = d.baseInfo?.serialNo;
    if (!serial) return [];
    return (d.cameraChannel ?? []).map((ch) => ({
      id: ch.id,
      name: ch.name,
      deviceSerial: serial,
      channelNo: ch.no ?? "1",
    }));
  });

  const cameraKey = (c: DiscoveredCamera) => `${c.deviceSerial}:${c.channelNo}`;
  const cameraMap = new Map<string, DiscoveredCamera>();
  for (const c of [...camerasFromAreas, ...camerasFromDevices]) {
    cameraMap.set(cameraKey(c), c);
  }
  const cameras = [...cameraMap.values()].sort(
    (a, b) =>
      a.deviceSerial.localeCompare(b.deviceSerial) ||
      Number(a.channelNo) - Number(b.channelNo)
  );

  function pickVehicleCamera(serial: string): DiscoveredCamera | undefined {
    const forDevice = cameras.filter((c) => c.deviceSerial === serial);
    return (
      forDevice.find((c) => c.channelNo === "5") ??
      forDevice.find((c) => c.channelNo === "1") ??
      forDevice[0]
    );
  }

  const vehicles: DiscoveredVehicle[] = (vehiclesData?.vehicle ?? [])
    .filter((v) => v.device?.devInfo?.serialNo)
    .map((v) => {
      const serial = v.device!.devInfo!.serialNo!;
      const cam = pickVehicleCamera(serial);
      return {
        vehicleId: v.id,
        name: v.name,
        licensePlateNo: v.vehicleInfo?.licensePlateNo ?? v.name,
        vehicleType: v.vehicleInfo?.vehicleType ?? 0,
        deviceSerial: serial,
        deviceId: v.device!.devInfo!.id ?? "",
        areaId: v.area?.id ?? areas[0]?.id ?? "",
        areaName: v.area?.name ?? "",
        online: v.online ?? "0",
        cameraId: cam?.id ?? v.device?.channelInfo?.id ?? "",
        cameraChannelNo: cam?.channelNo ?? v.device?.channelInfo?.no ?? "1",
      };
    });

  const drivers: DiscoveredDriver[] = (driversData?.drivers ?? []).map((d) => ({
    driverId: d.driverId,
    driverName: d.driverName ?? "",
    driverCode: d.driverCode ?? "",
    groupId: d.driverGroupId ?? "",
    groupName: d.driverGroupName ?? "",
    relatedVehicleIds: (d.relatedVehicles ?? [])
      .map((rv) => rv.vehicleId)
      .filter((id): id is string => Boolean(id)),
  }));

  const groupMap = new Map<string, string>();
  for (const d of drivers) {
    if (d.groupId) groupMap.set(d.groupId, d.groupName || d.groupId);
  }
  const groupsFromApi =
    driverGroupsData?.driverGroup ?? driverGroupsData?.groups ?? [];
  for (const g of groupsFromApi) {
    if (g.groupId) groupMap.set(g.groupId, g.groupName || g.groupId);
  }

  const serials = vehicles.map((v) => v.deviceSerial).filter(Boolean);

  return {
    areaDomain: session.areaDomain,
    userId: session.userId,
    areas,
    vehicles,
    cameras,
    drivers,
    driverGroups: [...groupMap.entries()].map(([groupId, groupName]) => ({
      groupId,
      groupName,
    })),
    deviceSerialsCsv: serials.join(","),
    summary: {
      areaCount: areas.length,
      vehicleCount: vehicles.length,
      cameraCount: cameras.length,
      driverCount: drivers.length,
      onlineVehicleCount: vehicles.filter((v) => v.online === "1").length,
    },
    calls,
  };
}
