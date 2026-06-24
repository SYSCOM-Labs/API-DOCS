/**
 * Parser de coordenadas GPS desde eventos MQ (OpenAPI §A.3.100).
 * Extrae lat/lng, velocidad (cm/h → km/h) y rumbo desde vehicleRelatedInfo.gpsInfo.
 */
import type {
  MqEvent,
  ParsedDsmAlarm,
  ParsedGpsUpdate,
  GpsInfo,
} from "../types/hik.types.js";
import { MsgType } from "../types/hik.types.js";

/** Códigos de evento DSM según PDF §A.1.4 (On-Board Monitoring). */
const DSM_EVENT_CODES: Record<string, { code: string; label: string }> = {
  [MsgType.Smoking]: { code: "100359", label: "Conducción fumando (Driver Smoking)" },
  [MsgType.FatigueDriving]: {
    code: "100361",
    label: "Conducción fatigada (Fatigue Driving)",
  },
};

/**
 * Convierte speed de cm/h (PDF §A.3.100) a km/h para visualización humana.
 * 1 km/h = 100 000 cm/h.
 */
export function speedCmHToKmh(speedCmH: number): number {
  return Math.round((speedCmH / 100_000) * 100) / 100;
}

/**
 * Normaliza direction a grados 0–360 desde el norte (sentido horario).
 * Los ejemplos oficiales a veces traen valores crudos > 360 (ej. 32759); se asume centésimas de grado.
 */
export function normalizeDirection(raw: number): number {
  if (raw <= 360) return raw;
  const asDegrees = raw / 100;
  return Math.round(asDegrees % 360);
}

/** Parsea lat/lng con signo según hemisferio ew/ns del payload Hik. */
export function parseCoordinate(value: string, hemisphere: string, negative: string): number {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 0;
  return hemisphere === negative ? -Math.abs(num) : Math.abs(num);
}

export function parseGpsInfo(gps: GpsInfo): { lat: number; lng: number; speedKmh: number; directionDeg: number } {
  const lat = parseCoordinate(gps.lat, gps.ns, "S");
  const lng = parseCoordinate(gps.lng, gps.ew, "W");
  return {
    lat,
    lng,
    speedKmh: speedCmHToKmh(gps.speed),
    directionDeg: normalizeDirection(gps.direction),
  };
}

function buildGpsUpdate(event: MqEvent, gps: GpsInfo): ParsedGpsUpdate {
  const parsed = parseGpsInfo(gps);
  const mqName = event.basicInfo.device?.name ?? "unknown";
  return {
    deviceSerial: mqName,
    mqDeviceName: mqName,
    resourceName: event.basicInfo.resource?.name ?? "",
    licensePlate:
      event.data?.vehicleRelatedInfo?.vehicleInfo?.licensePlate ??
      event.basicInfo.resource?.name ??
      "",
    lat: parsed.lat,
    lng: parsed.lng,
    speedKmh: parsed.speedKmh,
    directionDeg: parsed.directionDeg,
    occurrenceTime: event.basicInfo.occurrenceTime,
    msgType: event.basicInfo.msgType,
  };
}

/**
 * Extrae GPS de cualquier evento MQ que traiga vehicleRelatedInfo.gpsInfo
 * (Msg330001 oficial, pero alarmas ADAS/DSM suelen adjuntar el mismo bloque).
 */
export function parseGpsEvent(event: MqEvent): ParsedGpsUpdate | null {
  const gps = event.data?.vehicleRelatedInfo?.gpsInfo;
  if (!gps?.lat || !gps?.lng) return null;
  return buildGpsUpdate(event, gps);
}

/**
 * Extrae alarma DSM (Msg330501 fumar, Msg330503 fatiga) de un evento MQ.
 */
export function parseDsmEvent(event: MqEvent): ParsedDsmAlarm | null {
  const meta = DSM_EVENT_CODES[event.basicInfo.msgType];
  if (!meta) return null;

  const gps = event.data?.vehicleRelatedInfo?.gpsInfo;
  let lat: number | undefined;
  let lng: number | undefined;
  if (gps) {
    const p = parseGpsInfo(gps);
    lat = p.lat;
    lng = p.lng;
  }

  return {
    deviceSerial: event.basicInfo.device?.name ?? "unknown",
    licensePlate:
      event.data?.vehicleRelatedInfo?.vehicleInfo?.licensePlate ??
      event.basicInfo.resource?.name ??
      "",
    msgType: event.basicInfo.msgType,
    eventCode: meta.code,
    label: meta.label,
    occurrenceTime: event.basicInfo.occurrenceTime,
    lat,
    lng,
  };
}

export function parseMqEvents(events: MqEvent[]): {
  gps: ParsedGpsUpdate[];
  alarms: ParsedDsmAlarm[];
} {
  const gps: ParsedGpsUpdate[] = [];
  const alarms: ParsedDsmAlarm[] = [];
  const gpsSerials = new Set<string>();

  for (const ev of events) {
    const g = parseGpsEvent(ev);
    if (g) {
      const key = `${g.deviceSerial}:${g.occurrenceTime}:${g.msgType}`;
      if (!gpsSerials.has(key)) {
        gpsSerials.add(key);
        gps.push(g);
      }
    }
    const a = parseDsmEvent(ev);
    if (a) alarms.push(a);
  }

  return { gps, alarms };
}

/** Resumen de un lote MQ para el panel de diagnóstico GPS. */
export function summarizeMqBatch(events: MqEvent[]): {
  total: number;
  msgTypes: Record<string, number>;
  deviceSerials: string[];
  gpsCandidates: number;
  unparsedGps: number;
  eventsWithGpsBlock: number;
} {
  const msgTypes: Record<string, number> = {};
  const serials = new Set<string>();
  let gpsCandidates = 0;
  let unparsedGps = 0;
  let eventsWithGpsBlock = 0;

  for (const ev of events) {
    const mt = ev.basicInfo?.msgType ?? "unknown";
    msgTypes[mt] = (msgTypes[mt] ?? 0) + 1;
    const serial = ev.basicInfo?.device?.name;
    if (serial) serials.add(serial);

    const gps = ev.data?.vehicleRelatedInfo?.gpsInfo;
    if (gps) {
      eventsWithGpsBlock++;
      if (mt === MsgType.GpsReport || mt === MsgType.GpsReportAlt) {
        gpsCandidates++;
        if (!gps.lat || !gps.lng) unparsedGps++;
      }
    }
  }

  return {
    total: events.length,
    msgTypes,
    deviceSerials: [...serials],
    gpsCandidates,
    unparsedGps,
    eventsWithGpsBlock,
  };
}
