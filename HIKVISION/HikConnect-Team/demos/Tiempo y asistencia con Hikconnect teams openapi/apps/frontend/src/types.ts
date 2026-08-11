export interface StoredCredentials {
  serverAddress: string;
  appKey: string;
  secretKey: string;
  sandboxMode: boolean;
  connected: boolean;
}

export interface ProxyDebugInfo {
  verb: string;
  targetUrl: string;
  requestPayload: unknown;
  responseBody: unknown;
  sourceFile: string;
}

export interface ProxyResponse<T = unknown> {
  debug?: ProxyDebugInfo;
  data?: T;
  error?: string;
}

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

export interface PlatformSnapshot {
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

export interface HudEntry {
  id: string;
  label: string;
  at: string;
  debug?: ProxyDebugInfo;
}

export type DeskTabId =
  | "dashboard"
  | "platform"
  | "persons"
  | "access"
  | "doors"
  | "records"
  | "timecard"
  | "events";

export const ATTENDANCE_STATUS: Record<number, string> = {
  1: "Normal",
  2: "Retardo",
  3: "Salida temprana",
  4: "Retardo + salida temprana",
  5: "Falta",
  6: "Permiso / leave",
};
