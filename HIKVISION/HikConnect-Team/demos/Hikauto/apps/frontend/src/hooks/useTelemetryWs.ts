/**
 * Suscripción WebSocket al hub de telemetría del backend.
 * Acumula marcadores GPS, rutas y alarmas; filtra por vehículos seleccionados.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { DsmAlarmEntry, GpsMarker, MqDiagnostics, ProxyDebugInfo } from "../types";
import { subscribeTelemetry } from "../lib/telemetrySocket";
import { serialInWatchList } from "../lib/serialMatch";

const MAX_TRAIL_POINTS = 80;
const GPS_HUD_EVERY_N = 10;

interface UseTelemetryWsOptions {
  onHudEntry?: (label: string, debug?: ProxyDebugInfo, extra?: unknown) => void;
  /** Si true, ignora GPS/alarmas generados por telemetryWorker en modo sandbox. */
  ignoreSandbox?: boolean;
  /** Solo acumula GPS/alarmas de estos seriales (mapa estable). */
  filterSerials?: string[];
}

function isSandboxDebug(debug?: ProxyDebugInfo): boolean {
  return Boolean(
    debug && typeof debug === "object" && "sandbox" in debug && (debug as { sandbox?: boolean }).sandbox
  );
}

/**
 * Suscripción al hub de telemetría (conexión WS compartida, sin reconexiones duplicadas).
 */
export function useTelemetryWs({
  onHudEntry,
  ignoreSandbox = false,
  filterSerials = [],
}: UseTelemetryWsOptions = {}) {
  const filterRef = useRef(filterSerials);
  filterRef.current = filterSerials;
  const [connected, setConnected] = useState(false);
  const [markers, setMarkers] = useState<Record<string, GpsMarker>>({});
  const [trails, setTrails] = useState<Record<string, Array<{ lat: number; lng: number }>>>({});
  const [alarms, setAlarms] = useState<DsmAlarmEntry[]>([]);
  const [statusMessage, setStatusMessage] = useState("Conectando…");
  const [gpsCount, setGpsCount] = useState(0);
  const [mqDiag, setMqDiag] = useState<MqDiagnostics | null>(null);
  const gpsHudCounter = useRef(0);

  const clearTelemetry = useCallback(() => {
    setMarkers({});
    setTrails({});
    setAlarms([]);
    setGpsCount(0);
  }, []);

  useEffect(() => {
    if (!filterSerials.length) return;
    setMarkers((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([s]) => serialInWatchList(s, filterSerials))
      )
    );
    setTrails((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([s]) => serialInWatchList(s, filterSerials))
      )
    );
    setAlarms((prev) => prev.filter((a) => serialInWatchList(a.deviceSerial, filterSerials)));
  }, [filterSerials.join(",")]);

  useEffect(() => {
    return subscribeTelemetry(
      (msg) => {
        if (ignoreSandbox && isSandboxDebug(msg.debug)) return;

        if (msg.type === "gps") {
          const p = msg.payload;
          const serial = String(p.deviceSerial);
          const allowed = filterRef.current;
          if (allowed.length > 0 && !serialInWatchList(serial, allowed)) return;
          const lat = Number(p.lat);
          const lng = Number(p.lng);
          setGpsCount((c) => c + 1);
          setMarkers((prev) => ({
            ...prev,
            [serial]: {
              deviceSerial: serial,
              licensePlate: String(p.licensePlate ?? ""),
              lat,
              lng,
              speedKmh: Number(p.speedKmh),
              directionDeg: Number(p.directionDeg),
              lastUpdate: String(p.occurrenceTime),
            },
          }));
          setTrails((prev) => {
            const chain = [...(prev[serial] ?? []), { lat, lng }];
            return {
              ...prev,
              [serial]: chain.length > MAX_TRAIL_POINTS ? chain.slice(-MAX_TRAIL_POINTS) : chain,
            };
          });

          gpsHudCounter.current += 1;
          if (gpsHudCounter.current % GPS_HUD_EVERY_N === 1) {
            onHudEntry?.("Telemetría GPS (Msg330001)", msg.debug, p);
          }
        }

        if (msg.type === "alarm") {
          const p = msg.payload;
          const serial = String(p.deviceSerial);
          const allowed = filterRef.current;
          if (allowed.length > 0 && !serialInWatchList(serial, allowed)) return;
          setAlarms((prev) =>
            [
              {
                deviceSerial: String(p.deviceSerial),
                label: String(p.label),
                occurrenceTime: String(p.occurrenceTime),
              },
              ...prev,
            ].slice(0, 20)
          );
          onHudEntry?.(`Alarma DSM (${String(p.msgType)})`, msg.debug, p);
        }

        if (msg.type === "status") {
          setStatusMessage(String(msg.payload.message ?? ""));
        }

        if (msg.type === "diag") {
          const p = msg.payload;
          setMqDiag({
            updatedAt: new Date().toISOString(),
            phase: String(p.phase ?? ""),
            errorCode: String(p.errorCode ?? ""),
            eventCount: Number(p.eventCount ?? 0),
            remainingNumber: Number(p.remainingNumber ?? 0),
            summary: p.summary as MqDiagnostics["summary"],
            gpsParsed: Number(p.gpsParsed ?? 0),
            alarmsParsed: Number(p.alarmsParsed ?? 0),
            watchedSerials: Array.isArray(p.watchedSerials)
              ? (p.watchedSerials as string[])
              : undefined,
            totalGpsEmitted: Number(p.totalGpsEmitted ?? 0),
            sampleGps: p.sampleGps as MqDiagnostics["sampleGps"],
          });
        }

        if (msg.type === "debug") {
          onHudEntry?.("Debug MQ", undefined, msg.payload);
        }
      },
      (isConnected) => {
        setConnected(isConnected);
        if (!isConnected) setStatusMessage("Reconectando WebSocket…");
      }
    );
  }, [onHudEntry, ignoreSandbox]);

  return { connected, markers, trails, alarms, statusMessage, gpsCount, mqDiag, clearTelemetry };
}
