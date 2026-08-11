import { useCallback, useEffect, useRef, useState } from "react";

export interface LiveEventItem {
  id: string;
  at: string;
  msgType: string;
  msgLabel: string;
  channel: string;
  personName: string;
  deviceName: string;
  resourceName: string;
  raw: unknown;
}

interface StatusPayload {
  running: boolean;
  sandboxMode: boolean;
  message: string;
}

/** A.1.6 Authentication Event: etiquetas legibles de los msgType ACS. */
const MSG_LABELS: Record<string, string> = {
  Msg110001: "Acceso: tarjeta + huella",
  Msg110002: "Acceso: tarjeta + huella + PIN",
  Msg110003: "Acceso por tarjeta",
  Msg110004: "Acceso: tarjeta + PIN",
  Msg110005: "Acceso por huella",
  Msg110006: "Acceso: huella + PIN",
  Msg110008: "Acceso: rostro + huella",
  Msg110009: "Acceso: rostro + PIN",
  Msg110010: "Acceso: rostro + tarjeta",
  Msg110011: "Acceso: rostro + PIN + huella",
  Msg110012: "Acceso: rostro + tarjeta + huella",
  Msg110013: "Acceso por rostro",
  Msg110018: "Acceso: autenticación combinada",
  Msg110019: "Temperatura corporal medida",
  Msg110020: "Acceso por contraseña",
  Msg110023: "Acceso por código QR",
  Msg110024: "Acceso por llavero",
};

/** APENDICE-A §A.1.4 — Card Swiping. */
const RECORD_TYPE_LABELS: Record<string, string> = {
  "80001": "Tarjeta",
  "80002": "Tarjeta",
  "80003": "Huella",
  "80004": "Huella",
  "80005": "PIN",
  "80006": "PIN",
  "80007": "Rostro",
  "80008": "Rostro",
  "80072": "Rostro + tarjeta",
  "80073": "Rostro + tarjeta",
  "80075": "Rostro + PIN",
  "80076": "Rostro + PIN",
  "80078": "Tarjeta + PIN",
  "80079": "Tarjeta + PIN",
  "80081": "Huella + tarjeta",
  "80082": "Huella + tarjeta",
  "80084": "Huella + PIN",
  "80085": "Huella + PIN",
  "100571": "Código QR",
  "100572": "Código QR",
  "100574": "Código QR",
};

/** Busca la primera clave que exista (en cualquier nivel) y devuelve su valor string. */
function deepFind(obj: unknown, keys: string[], depth = 0): string | undefined {
  if (!obj || typeof obj !== "object" || depth > 6) return undefined;
  const record = obj as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  for (const value of Object.values(record)) {
    const found = deepFind(value, keys, depth + 1);
    if (found) return found;
  }
  return undefined;
}

export function useEventsWs(enabled: boolean) {
  const [events, setEvents] = useState<LiveEventItem[]>([]);
  const [status, setStatus] = useState<StatusPayload>({
    running: false,
    sandboxMode: false,
    message: "",
  });
  const wsRef = useRef<WebSocket | null>(null);

  const clear = useCallback(() => setEvents([]), []);

  useEffect(() => {
    if (!enabled) return;

    let closedByUs = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const proto = window.location.protocol === "https:" ? "wss" : "ws";
      const ws = new WebSocket(`${proto}://${window.location.host}/ws/events`);
      wsRef.current = ws;

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data as string) as {
            type: string;
            payload: Record<string, unknown>;
          };
          if (data.type === "status") {
            setStatus(data.payload as unknown as StatusPayload);
          }
          if (data.type === "event") {
            const payload = data.payload as Record<string, unknown>;
            const basic = (payload.basicInfo ?? {}) as Record<string, unknown>;
            const recordData = (payload.data ?? {}) as Record<string, unknown>;
            const msgType = String(basic.msgType ?? deepFind(payload, ["msgType"]) ?? "—");
            const channel = String(payload.channel ?? "—");
            const rawRecordResult = recordData.swipeAuthResult ?? recordData.result;
            const recordResult =
              typeof rawRecordResult === "number"
                ? rawRecordResult
                : typeof rawRecordResult === "string"
                  ? Number(rawRecordResult)
                  : undefined;
            const recordLabel =
              channel === "certificaterecords"
                ? `${recordResult === 1 ? "Marcaje correcto" : recordResult === 0 || recordResult === 2 ? "Marcaje rechazado" : "Marcaje"}${
                    RECORD_TYPE_LABELS[msgType] ? ` · ${RECORD_TYPE_LABELS[msgType]}` : ""
                  }`
                : undefined;
            const basicPerson = (basic.person ?? {}) as Record<string, unknown>;
            const basicPersonName =
              typeof basicPerson.name === "string"
                ? basicPerson.name
                : typeof basicPerson.personName === "string"
                  ? basicPerson.personName
                  : [basicPerson.firstName, basicPerson.lastName]
                      .filter((value): value is string => typeof value === "string" && !!value)
                      .join(" ");
            // Nunca buscar la clave genérica "name" en todo el payload: podría ser la puerta.
            const personName =
              basicPersonName ||
              deepFind(recordData, ["personName", "employeeName"]) ||
              [deepFind(recordData, ["firstName"]), deepFind(recordData, ["lastName"])]
                .filter(Boolean)
                .join(" ");
            const deviceName =
              deepFind(basic.device, ["name", "serialNo", "deviceName"]) ??
              deepFind(payload, ["deviceName", "devName"]) ??
              "";
            const resourceName =
              deepFind(basic.resource, ["name", "areaName"]) ??
              deepFind(payload, ["resourceName", "doorName", "elementName"]) ??
              "";
            const id = String(payload.uuid ?? `${Date.now()}-${Math.random()}`);
            setEvents((prev) => {
              if (prev.some((event) => event.id === id)) return prev;
              return [
                {
                  id,
                  at: String(
                    basic.occurrenceTime ??
                      deepFind(payload, ["occurrenceTime", "occurTime", "recordTime"]) ??
                      new Date().toISOString()
                  ),
                  msgType,
                  msgLabel: recordLabel ?? MSG_LABELS[msgType] ?? "Evento",
                  channel,
                  personName: personName || "—",
                  deviceName: deviceName || "—",
                  resourceName: resourceName || "—",
                  raw: payload,
                },
                ...prev,
              ].slice(0, 100);
            });
          }
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        if (closedByUs) return;
        // Reconecta: si el backend reinicia, el feed no debe quedar mudo para siempre.
        reconnectTimer = setTimeout(connect, 1500);
      };
    };

    connect();

    return () => {
      closedByUs = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled]);

  return { events, status, clear };
}
