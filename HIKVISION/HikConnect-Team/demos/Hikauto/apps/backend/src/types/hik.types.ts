/**
 * Tipos derivados del PDF V2.15.0 y ejemplos de la colección Postman local.
 * No inventar campos: cada interfaz refleja el contrato oficial de Hik-Connect.
 */

/** Credenciales que el frontend inyecta en cada petición al proxy local. */
export interface HikCredentials {
  serverAddress: string;
  appKey: string;
  secretKey: string;
}

/** Respuesta de POST /api/hccgw/platform/v1/token/get (PDF §5.1.1). */
export interface TokenData {
  accessToken: string;
  expireTime: number;
  userId: string;
  areaDomain: string;
}

export interface HikApiResponse<T = unknown> {
  errorCode: string;
  data?: T;
  message?: string;
  Message?: string;
}

/** vehicleType: 0=others, 1=car, 2=truck, 3=bus (PDF §5.9.1). */
export enum VehicleType {
  Others = 0,
  Car = 1,
  Truck = 2,
  Bus = 3,
}

/** gender: 0=unknown, 1=male, 2=female (PDF §5.9.7). */
export enum Gender {
  Unknown = 0,
  Male = 1,
  Female = 2,
}

/** accStatus: -1=unknown, 0=ACC off, 1=ACC on (PDF §5.9.5). */
export enum AccStatus {
  Unknown = -1,
  Off = 0,
  On = 1,
}

/** Tipos de mensaje MQ de monitoreo a bordo (PDF §A.1.6). */
export enum MsgType {
  GpsReport = "Msg330001",
  /** Reporte GPS complementario (Postman §4.1 subscribe). */
  GpsReportAlt = "Msg330002",
  Smoking = "Msg330501",
  FatigueDriving = "Msg330503",
}

/**
 * Modo de suscripción rawmsg (PDF §5.4.1):
 * - default: Msg330001/002 + DSM fumar/fatiga (comportamiento original).
 * - all: msgType omitido → Hik suscribe todos los tipos de mensaje.
 * - onboard-full: todos los Msg33* onboard del apéndice A.1.6.
 */
export type MqSubscribeMode = "default" | "all" | "onboard-full";

/** Cola MQ: rawmsg (onboard §5.4) o combine V2 (changelog 2.11.0, experimental). */
export type MqQueueApi = "rawmsg" | "combine";

/** Todos los Msg33* onboard documentados en PDF §A.1.6 (On-Board Monitoring). */
export const ONBOARD_ALL_MSG_TYPES: readonly string[] = [
  "Msg330001",
  "Msg330002",
  "Msg330101",
  "Msg330102",
  "Msg330201",
  "Msg330202",
  "Msg330203",
  "Msg330204",
  "Msg330205",
  "Msg330301",
  "Msg330401",
  "Msg330402",
  "Msg330403",
  "Msg330404",
  "Msg330405",
  "Msg330406",
  "Msg330407",
  "Msg330408",
  "Msg330501",
  "Msg330502",
  "Msg330503",
  "Msg330504",
  "Msg330505",
  "Msg330506",
  "Msg330507",
  "Msg330508",
  "Msg330509",
  "Msg330510",
  "Msg335000",
  "Msg335001",
] as const;

export interface VehicleAddRequest {
  areaId: string;
  licensePlateNo: string;
  vehicleType: VehicleType;
  deviceSerial: string;
  driverFirstName?: string;
  driverLastName?: string;
  driverPhoneNo?: string;
  pictureKey?: string;
  extend?: string;
}

export interface AccStatusSearchRequest {
  deviceSerials?: string;
  vehicleIds?: string;
}

export interface AccStatusInfo {
  idOrDeviceSerial: string;
  accStatus: AccStatus;
}

export interface DriverLicenseAddInfo {
  licenseNo?: string;
  validTime?: string;
  imageData?: string;
}

export interface DriverAddRequest {
  firstName?: string;
  lastName?: string;
  driverCode: string;
  gender: Gender;
  groupId: string;
  phone?: string;
  email?: string;
  description?: string;
  relateVehicleIds?: string[];
  driverLicenseInfo?: DriverLicenseAddInfo;
  photoData?: string;
}

export interface DriverFaceDistributionRequest {
  driverIds: string[];
}

export interface GpsInfo {
  ew: string;
  lng: string;
  ns: string;
  lat: string;
  direction: number;
  height?: number;
  speed: number;
}

export interface VehicleRelatedInfo {
  gpsInfo?: GpsInfo;
  vehicleInfo?: {
    licensePlate?: string;
    driverName?: string;
    driverPhone?: string;
    id?: string;
    speedLimit?: number;
  };
}

export interface MqEventBasicInfo {
  occurrenceTime: string;
  systemId?: string;
  msgType: string;
  resource?: { id: string; name: string; areaName?: string };
  device?: { id: string; name: string; category: string };
}

export interface MqEvent {
  basicInfo: MqEventBasicInfo;
  data?: { vehicleRelatedInfo?: VehicleRelatedInfo };
  uuid?: string;
}

export interface MqMessagesResponse {
  batchId?: string;
  remainingNumber?: number;
  event?: MqEvent[];
}

/** GPS normalizado para el frontend y el mapa Leaflet. */
export interface ParsedGpsUpdate {
  deviceSerial: string;
  /** Valor crudo de basicInfo.device.name en el evento MQ. */
  mqDeviceName?: string;
  resourceName?: string;
  licensePlate: string;
  lat: number;
  lng: number;
  speedKmh: number;
  directionDeg: number;
  occurrenceTime: string;
  msgType: string;
}

/** Alarma DSM normalizada. */
export interface ParsedDsmAlarm {
  deviceSerial: string;
  licensePlate: string;
  msgType: string;
  eventCode: string;
  label: string;
  occurrenceTime: string;
  lat?: number;
  lng?: number;
}

/** Envelope de debug para el Code HUD del frontend. */
export interface ProxyDebugEnvelope<T = unknown> {
  debug: {
    verb: string;
    targetUrl: string;
    requestPayload: unknown;
    responseBody: unknown;
    sourceFile: string;
  };
  data: T;
}

export interface StreamTokenData {
  appKey: string;
  appToken: string;
  streamAreaDomain: string;
  expireTime: string;
}

export interface LiveAddressRequest {
  type: string;
  deviceSerial: string;
  resourceId?: string;
  code?: string;
  protocol?: number;
  quality?: string;
}

export interface LiveAddressData {
  id: string;
  url: string;
  expireTime?: number;
}

export interface TelemetryStartRequest {
  sandboxMode: boolean;
  deviceSerials?: string[];
}
