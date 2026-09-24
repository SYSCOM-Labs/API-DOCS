import { EVENT_TYPES } from "@/lib/catalog";

export type EventSeverity = "critical" | "warning" | "ok" | "info";

export type HppEvent = {
  id: string;
  batchId?: string;
  serial: string;
  format: string;
  type: string;
  label: string;
  severity: EventSeverity;
  receivedAt: string;
  data: unknown;
};

export type HppMqRow = {
  deviceSerial?: string;
  formatType?: string;
  alarmData?: unknown;
};

export function extractEventType(data: unknown): string {
  if (data && typeof data === "object" && "eventType" in data) {
    return String((data as { eventType?: string }).eventType ?? "unknown");
  }
  if (typeof data === "string") {
    return (
      data.match(/<eventType>([^<]+)<\/eventType>/i)?.[1] ??
      data.match(/"eventType"\s*:\s*"([^"]+)"/)?.[1] ??
      "raw"
    );
  }
  return "unknown";
}

export function eventTypeLabel(type: string): string {
  return EVENT_TYPES.find((item) => item.type.toLowerCase() === type.toLowerCase())?.label ?? type;
}

export function eventSeverity(type: string): EventSeverity {
  const value = type.toLowerCase();
  if (/(intrusion|field|line|tamper|shelter|panic|fire|alarm)/.test(value)) return "critical";
  if (/(offline|error|full|loss|exception|deleted)/.test(value)) return "warning";
  if (/(online|recover|added)/.test(value)) return "ok";
  return "info";
}

export function toHppEvent(row: HppMqRow, batchId: string | undefined, index: number): HppEvent {
  const type = extractEventType(row.alarmData);
  return {
    id: `${batchId ?? Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    batchId,
    serial: row.deviceSerial ?? "Sin serial",
    format: row.formatType ?? "—",
    type,
    label: eventTypeLabel(type),
    severity: eventSeverity(type),
    receivedAt: new Date().toISOString(),
    data: row.alarmData,
  };
}

/** Extrae rutas ISAPI_FILES tanto de objetos JSON como de payloads XML/JSON serializados. */
export function extractIsapiFilePaths(data: unknown): string[] {
  const paths = new Set<string>();

  function visit(value: unknown) {
    if (typeof value === "string") {
      if (value.includes("ISAPI_FILES")) {
        const matches = value.match(/ISAPI_FILES[^"'<>\s,}\\\]]+/g) ?? [];
        matches.forEach((match) => paths.add(match));
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, entry]) => {
        if (/filePath/i.test(key) && typeof entry === "string" && entry.includes("ISAPI_FILES")) {
          paths.add(entry);
        } else {
          visit(entry);
        }
      });
    }
  }

  visit(data);
  return [...paths];
}
