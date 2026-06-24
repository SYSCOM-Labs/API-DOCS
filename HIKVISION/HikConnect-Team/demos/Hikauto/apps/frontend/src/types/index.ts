/** Credenciales persistidas en localStorage del navegador. */
export interface StoredCredentials {
  serverAddress: string;
  /** Account — API Key (AK) */
  appKey: string;
  /** Password — API Secret (SK) */
  secretKey: string;
  sandboxMode: boolean;
  /** Sesión conectada a Hik-Connect (descubrimiento completado). */
  connected: boolean;
}

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

export interface PlatformSnapshot {
  areaDomain: string;
  userId: string;
  areas: { id: string; name: string }[];
  vehicles: DiscoveredVehicle[];
  cameras: { id: string; name: string; deviceSerial: string; channelNo: string }[];
  drivers: {
    driverId: string;
    driverName: string;
    driverCode: string;
    groupId: string;
    groupName: string;
    relatedVehicleIds: string[];
  }[];
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

export interface HudEntry {
  id: string;
  timestamp: Date;
  label: string;
  debug?: ProxyDebugInfo;
  extra?: unknown;
}

export interface GpsMarker {
  deviceSerial: string;
  licensePlate: string;
  lat: number;
  lng: number;
  speedKmh: number;
  directionDeg: number;
  lastUpdate: string;
}

export interface GpsTrailPoint {
  lat: number;
  lng: number;
  time: string;
}

export interface MqDiagnostics {
  updatedAt: string;
  phase?: string;
  errorCode?: string;
  eventCount?: number;
  remainingNumber?: number;
  summary?: {
    total: number;
    msgTypes: Record<string, number>;
    deviceSerials: string[];
    gpsCandidates: number;
    unparsedGps: number;
  };
  gpsParsed?: number;
  alarmsParsed?: number;
  watchedSerials?: string[];
  totalGpsEmitted?: number;
  sampleGps?: {
    deviceSerial: string;
    lat: number;
    lng: number;
    speedKmh: number;
  };
}

export interface MqProbeResult {
  subscribeErrorCode: string;
  pollErrorCode: string;
  eventCount: number;
  remainingNumber: number;
  summary?: MqDiagnostics["summary"];
  gps: Array<{ deviceSerial: string; lat: number; lng: number; speedKmh: number; msgType?: string }>;
  listenSeconds?: number;
  pollAttempts?: number;
  subscribeMode?: string;
  mqQueue?: string;
  allMsgTypes?: Record<string, number>;
  eventsWithGpsBlock?: number;
  hint: string;
}

export interface DsmAlarmEntry {
  deviceSerial: string;
  label: string;
  occurrenceTime: string;
}

declare global {
  interface Window {
    EZUIKit: {
      EZUIKitPlayer: new (config: {
        id: string;
        url: string;
        accessToken?: string;
        template?: string;
        plugin?: string[];
        width?: number;
        height?: number;
        env?: { domain?: string };
        handleError?: (err: unknown) => void;
      }) => EzUIKitPlayerInstance;
    };
  }
}

export interface EzUIKitPlayerInstance {
  play: () => void;
  stop: () => void;
  openSound: () => void;
  closeSound: () => void;
  startTalk?: () => void;
  stopTalk?: () => void;
  destroy: () => void;
  changePlayUrl?: (opts: { type: string; url: string }) => void;
}
