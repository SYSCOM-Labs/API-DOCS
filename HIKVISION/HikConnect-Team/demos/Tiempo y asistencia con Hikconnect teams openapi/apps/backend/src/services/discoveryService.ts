import { hikClient } from "./hikClient.js";
import { hikAuthService } from "./hikAuth.js";
import type { HikCredentials, HikApiResponse } from "../types/hik.types.js";

export interface DiscoveredArea {
  id: string;
  name: string;
}

export interface DiscoveredDevice {
  id: string;
  name: string;
  category: string;
  serialNo: string;
  onlineStatus: string;
  version?: string;
}

export interface DiscoveredDoor {
  id: string;
  name: string;
  deviceSerial?: string;
  areaName?: string;
  online?: string;
}

export interface DiscoveredPersonGroup {
  id: string;
  name: string;
  personCount?: number;
}

export interface PlatformDiscoveryResult {
  areaDomain: string;
  userId: string;
  areas: DiscoveredArea[];
  devices: DiscoveredDevice[];
  doors: DiscoveredDoor[];
  personGroups: DiscoveredPersonGroup[];
  summary: {
    areaCount: number;
    deviceCount: number;
    acsDeviceCount: number;
    doorCount: number;
    onlineDeviceCount: number;
    groupCount: number;
  };
  calls: Array<{ label: string; path: string; errorCode: string }>;
}

const META = { sourceFile: "apps/backend/src/services/discoveryService.ts" };

function isAcsCategory(category: string | undefined): boolean {
  const c = (category ?? "").toLowerCase();
  return (
    c.includes("access") ||
    c === "accesscontrollerdevice" ||
    c.includes("acs") ||
    c.includes("door")
  );
}

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

  const [areasData, devicesData, doorsData, groupsData] = await Promise.all([
    call<{ area?: Array<{ id: string; name: string }> }>(
      "Áreas",
      "/api/hccgw/resource/v1/areas/get",
      { pageIndex: 1, pageSize: 100, filter: { parentAreaID: "-1", includeSubArea: 1 } }
    ),
    call<{
      device?: Array<{
        id?: string;
        name?: string;
        category?: string;
        serialNo?: string;
        onlineStatus?: string | number;
        version?: string;
        baseInfo?: {
          id?: string;
          name?: string;
          category?: string;
          serialNo?: string;
          onlineStatus?: string | number;
          version?: string;
        };
      }>;
    }>("Dispositivos", "/api/hccgw/resource/v1/devices/get", {
      pageIndex: 1,
      pageSize: 500,
    }),
    call<{
      doorList?: Array<{
        id?: string;
        name?: string;
        deviceSerial?: string;
        areaName?: string;
        online?: string;
        doorInfo?: { id?: string; name?: string };
      }>;
      door?: Array<{
        id?: string;
        name?: string;
        deviceSerial?: string;
        areaName?: string;
        online?: string;
        doorInfo?: { id?: string; name?: string };
      }>;
    }>("Puertas", "/api/hccgw/resource/v1/areas/doors/get", {
      pageIndex: 1,
      pageSize: 200,
      filter: {
        areaID: "-1",
        includeSubArea: "1",
        deviceID: "",
        deviceSerialNo: "",
      },
    }),
    // Ojo: groupIdList anula parentGroupId/groupName (§7.1), por eso no se envía.
    call<{
      personGroupList?: Array<{ groupId?: string; groupName?: string; personCount?: number }>;
      groupList?: Array<{ id?: string; name?: string; personCount?: number }>;
      totalNum?: number;
    }>("Grupos de personas", "/api/hccgw/person/v1/groups/search", {
      parentGroupId: "",
      groupName: "",
    }),
  ]);

  const areas: DiscoveredArea[] = (areasData?.area ?? []).map((a) => ({
    id: a.id,
    name: a.name,
  }));

  const devices: DiscoveredDevice[] = (devicesData?.device ?? []).map((d) => {
    const base = d.baseInfo ?? d;
    return {
      id: String(base.id ?? d.id ?? ""),
      name: String(base.name ?? d.name ?? "Sin nombre"),
      category: String(base.category ?? d.category ?? ""),
      serialNo: String(base.serialNo ?? d.serialNo ?? ""),
      onlineStatus: String(base.onlineStatus ?? d.onlineStatus ?? "0"),
      version: base.version ?? d.version,
    };
  });

  const rawDoors = doorsData?.doorList ?? doorsData?.door ?? [];
  const doors: DiscoveredDoor[] = rawDoors.map((door) => ({
    id: String(door.id ?? door.doorInfo?.id ?? ""),
    name: String(door.name ?? door.doorInfo?.name ?? "Puerta"),
    deviceSerial: door.deviceSerial,
    areaName: door.areaName,
    online: door.online,
  }));

  // El ejemplo oficial devuelve personGroupList (groupId/groupName); el texto menciona groupList (id/name).
  const rawGroups: Array<{
    id?: string;
    name?: string;
    groupId?: string;
    groupName?: string;
    personCount?: number;
  }> = groupsData?.personGroupList ?? groupsData?.groupList ?? [];

  const personGroups: DiscoveredPersonGroup[] = rawGroups
    .map((g) => ({
      id: String(g.groupId ?? g.id ?? ""),
      name: String(g.groupName ?? g.name ?? "Sin nombre"),
      personCount: g.personCount,
    }))
    .filter((g) => g.id !== "");

  const acsDevices = devices.filter((d) => isAcsCategory(d.category));
  const onlineDeviceCount = devices.filter(
    (d) => d.onlineStatus === "1" || d.onlineStatus === "online"
  ).length;

  return {
    areaDomain: session.areaDomain,
    userId: session.userId,
    areas,
    devices,
    doors,
    personGroups,
    summary: {
      areaCount: areas.length,
      deviceCount: devices.length,
      acsDeviceCount: acsDevices.length,
      doorCount: doors.length,
      onlineDeviceCount,
      groupCount: personGroups.length,
    },
    calls,
  };
}

/** Inventario ficticio para modo sandbox (sin llamadas Hik). */
export function sandboxDiscovery(): PlatformDiscoveryResult {
  return {
    areaDomain: "https://sandbox.local",
    userId: "sandbox-user",
    areas: [
      { id: "area-demo-1", name: "Oficina SYSCOM Demo" },
      { id: "area-demo-2", name: "Planta / Acceso principal" },
    ],
    devices: [
      {
        id: "dev-acs-1",
        name: "Terminal Facial Entrada",
        category: "accessControllerDevice",
        serialNo: "ACS-DEMO-001",
        onlineStatus: "1",
        version: "V1.0.0",
      },
      {
        id: "dev-acs-2",
        name: "Lector Tarjeta Salida",
        category: "accessControllerDevice",
        serialNo: "ACS-DEMO-002",
        onlineStatus: "1",
      },
    ],
    doors: [
      {
        id: "door-1",
        name: "Puerta principal",
        deviceSerial: "ACS-DEMO-001",
        areaName: "Oficina SYSCOM Demo",
        online: "1",
      },
      {
        id: "door-2",
        name: "Acceso almacén",
        deviceSerial: "ACS-DEMO-002",
        areaName: "Planta / Acceso principal",
        online: "1",
      },
    ],
    personGroups: [
      { id: "grp-1", name: "Administración", personCount: 4 },
      { id: "grp-2", name: "Operaciones", personCount: 8 },
    ],
    summary: {
      areaCount: 2,
      deviceCount: 2,
      acsDeviceCount: 2,
      doorCount: 2,
      onlineDeviceCount: 2,
      groupCount: 2,
    },
    calls: [{ label: "Sandbox", path: "(mock)", errorCode: "0" }],
  };
}
