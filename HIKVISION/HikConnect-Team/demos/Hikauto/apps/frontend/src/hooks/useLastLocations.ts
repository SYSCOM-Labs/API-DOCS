/**
 * Última ubicación conocida: cache local + escucha MQ opcional.
 * OpenAPI no expone GET de posición; solo Msg330001 vía cola rawmsg.
 */
import { useEffect, useRef, useState } from "react";
import { apiPost } from "../api/client";
import type { GpsMarker, ProxyDebugInfo } from "../types";

const LS_PREFIX = "hikFleet.lastGps.";

export interface LastLocationResult {
  locations: Array<{
    deviceSerial: string;
    licensePlate: string;
    lat: number;
    lng: number;
    speedKmh: number;
    directionDeg: number;
    occurrenceTime: string;
  }>;
  source: "cache" | "mq" | "mixed";
  mqEventCount: number;
  mqGpsCount: number;
  docNote: string;
  verdict: string;
  mqDiagnostic?: {
    subscribeErrorCode: string;
    pollErrorCode: string;
    waitSeconds: number;
    pollAttempts: number;
    gpsFromAnySerial: number;
  };
}

function toMarker(loc: LastLocationResult["locations"][0]): GpsMarker {
  return {
    deviceSerial: loc.deviceSerial,
    licensePlate: loc.licensePlate,
    lat: loc.lat,
    lng: loc.lng,
    speedKmh: loc.speedKmh,
    directionDeg: loc.directionDeg,
    lastUpdate: loc.occurrenceTime,
  };
}

function loadCachedFromStorage(serials: string[]): Record<string, GpsMarker> {
  const out: Record<string, GpsMarker> = {};
  for (const serial of serials) {
    try {
      const raw = localStorage.getItem(`${LS_PREFIX}${serial}`);
      if (raw) out[serial] = JSON.parse(raw) as GpsMarker;
    } catch {
      /* ignore */
    }
  }
  return out;
}

function saveToStorage(markers: Record<string, GpsMarker>): void {
  for (const [serial, m] of Object.entries(markers)) {
    localStorage.setItem(`${LS_PREFIX}${serial}`, JSON.stringify(m));
  }
}

interface UseLastLocationsOptions {
  credentialsEnvelope: Record<string, string>;
  deviceSerials: string[];
  vehicleRegistry?: Array<{
    deviceSerial: string;
    name: string;
    licensePlateNo: string;
    vehicleId?: string;
  }>;
  enabled: boolean;
  onHud?: (label: string, debug?: ProxyDebugInfo) => void;
}

export function useLastLocations({
  credentialsEnvelope,
  deviceSerials,
  vehicleRegistry = [],
  enabled,
  onHud,
}: UseLastLocationsOptions) {
  const [markers, setMarkers] = useState<Record<string, GpsMarker>>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [verdict, setVerdict] = useState("");
  const [lastResult, setLastResult] = useState<LastLocationResult | null>(null);
  const autoFetched = useRef(false);
  const fetchInFlight = useRef(false);

  useEffect(() => {
    if (!enabled || deviceSerials.length === 0) return;
    autoFetched.current = false;
    setMarkers((prev) => ({ ...loadCachedFromStorage(deviceSerials), ...prev }));
  }, [enabled, deviceSerials.join(",")]);

  async function fetchLocations(refresh: boolean, waitSeconds = 30) {
    if (!enabled || deviceSerials.length === 0) return;
    if (fetchInFlight.current) return;
    fetchInFlight.current = true;
    setLoading(true);
    setStatus(refresh ? `Escuchando MQ ${waitSeconds}s…` : "Leyendo cache…");
    try {
      const res = await apiPost<LastLocationResult>(
        "/api/fleet/vehicles/last-locations",
        credentialsEnvelope,
        { deviceSerials, refresh, waitSeconds, vehicleRegistry }
      );
      if (res.debug) {
        onHud?.(refresh ? "Última ubicación (MQ)" : "Última ubicación (cache)", res.debug);
      }
      if (res.error) {
        setStatus(res.error);
        setVerdict(`Error: ${res.error}`);
        return;
      }
      const data = res.data;
      if (!data) {
        setVerdict("Respuesta vacía del backend.");
        return;
      }
      setLastResult(data);
      setVerdict(data.verdict || "");

      if (data.locations?.length) {
        const next: Record<string, GpsMarker> = {};
        for (const loc of data.locations) {
          next[loc.deviceSerial] = toMarker(loc);
        }
        setMarkers((prev) => {
          const merged = { ...prev, ...next };
          saveToStorage(merged);
          return merged;
        });
        setStatus(
          `${data.locations.length} vehículo(s) · fuente: ${data.source}${
            refresh ? ` · eventos MQ: ${data.mqEventCount}` : ""
          }`
        );
      } else {
        setStatus(data.verdict || "Sin ubicaciones.");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al obtener ubicación";
      setStatus(msg);
      setVerdict(msg);
    } finally {
      setLoading(false);
      fetchInFlight.current = false;
    }
  }

  useEffect(() => {
    if (!enabled || deviceSerials.length === 0 || autoFetched.current) return;
    autoFetched.current = true;
    void fetchLocations(false);
  }, [enabled, deviceSerials.join(",")]);

  return { lastLocationMarkers: markers, loading, status, verdict, lastResult, fetchLocations };
}
