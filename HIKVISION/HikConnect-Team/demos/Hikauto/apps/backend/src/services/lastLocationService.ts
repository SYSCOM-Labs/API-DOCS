import type { HikCredentials, ParsedGpsUpdate } from "../types/hik.types.js";
import { probeOnboardMqListening } from "./mqTelemetryService.js";
import { lastGpsStore } from "./lastGpsStore.js";
import { telemetryWorker } from "../workers/telemetryWorker.js";
import { mqLog } from "../utils/mqLogger.js";
import {
  expandWatchIdentifiers,
  filterAndNormalizeGps,
  type VehicleIdentity,
} from "../utils/vehicleIdentity.js";

const DOC_NOTE =
  "OpenAPI V2.15.0 no expone un GET de «última posición». Solo Msg330001 vía rawmsg MQ (§4.4). " +
  "El mapa del portal usa estado interno; aquí se escucha la cola por unos segundos y se cachea lo recibido.";

export interface MqLocationDiagnostic {
  subscribeErrorCode: string;
  pollErrorCode: string;
  waitSeconds: number;
  pollAttempts: number;
  gpsFromAnySerial: number;
  usedTelemetryWorker?: boolean;
}

export interface LastLocationFetchResult {
  locations: ParsedGpsUpdate[];
  source: "cache" | "mq" | "mixed";
  mqEventCount: number;
  mqGpsCount: number;
  docNote: string;
  verdict: string;
  mqDiagnostic?: MqLocationDiagnostic;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForStoreGps(
  deviceSerials: string[],
  waitSeconds: number
): Promise<{ gps: ParsedGpsUpdate[]; waitedMs: number }> {
  const maxMs = waitSeconds * 1000;
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const found =
      deviceSerials.length > 0
        ? lastGpsStore.getForSerials(deviceSerials)
        : lastGpsStore.getAll();
    if (found.length > 0) {
      return { gps: found, waitedMs: Date.now() - start };
    }
    await sleep(500);
  }
  const final =
    deviceSerials.length > 0
      ? lastGpsStore.getForSerials(deviceSerials)
      : lastGpsStore.getAll();
  return { gps: final, waitedMs: Date.now() - start };
}

export async function fetchLastLocations(
  credentials: HikCredentials,
  deviceSerials: string[],
  options: {
    refresh?: boolean;
    waitSeconds?: number;
    vehicleRegistry?: VehicleIdentity[];
  } = {}
): Promise<LastLocationFetchResult> {
  const waitSeconds = options.waitSeconds ?? 30;
  const vehicleRegistry = options.vehicleRegistry ?? [];
  const watchIds =
    deviceSerials.length > 0
      ? expandWatchIdentifiers(deviceSerials, vehicleRegistry)
      : [];
  let mqEventCount = 0;
  let mqGpsCount = 0;
  let source: "cache" | "mq" | "mixed" = "cache";
  let mqDiagnostic: MqLocationDiagnostic | undefined;

  if (options.refresh) {
    const workerActive = telemetryWorker.isRunning() && !telemetryWorker.getMode().sandboxMode;

    if (workerActive) {
      mqLog("last-locations/reuse-worker", { waitSeconds, deviceSerials });
      const { gps, waitedMs } = await waitForStoreGps(deviceSerials, waitSeconds);
      mqGpsCount = gps.length;
      mqDiagnostic = {
        subscribeErrorCode: "0",
        pollErrorCode: "0",
        waitSeconds: Math.round(waitedMs / 1000),
        pollAttempts: Math.ceil(waitedMs / 500),
        gpsFromAnySerial: gps.length,
        usedTelemetryWorker: true,
      };
      if (gps.length > 0) {
        lastGpsStore.upsertMany(gps);
        source = "mq";
      }
    } else {
      mqLog("last-locations/listen", { waitSeconds, deviceSerials });
      const listen = await probeOnboardMqListening(credentials, waitSeconds, {
        mode: "onboard-full",
        queue: "rawmsg",
      });
      mqEventCount = listen.totalEvents;
      mqGpsCount = listen.allGps.length;
      mqDiagnostic = {
        subscribeErrorCode: listen.subscribe.errorCode,
        pollErrorCode: listen.lastPoll.errorCode,
        waitSeconds: listen.waitSeconds,
        pollAttempts: listen.pollAttempts,
        gpsFromAnySerial: listen.allGps.length,
        usedTelemetryWorker: false,
      };
      const filtered =
        deviceSerials.length > 0
          ? filterAndNormalizeGps(listen.allGps, watchIds, vehicleRegistry)
          : listen.allGps;
      if (filtered.length > 0) {
        lastGpsStore.upsertMany(filtered);
        source = lastGpsStore.getAll().length > filtered.length ? "mixed" : "mq";
      }
    }
  }

  const locations =
    deviceSerials.length > 0
      ? lastGpsStore.getForSerials(deviceSerials)
      : lastGpsStore.getAll();

  const verdict = buildVerdict(
    locations.length,
    mqDiagnostic,
    mqEventCount,
    deviceSerials
  );

  return {
    locations,
    source,
    mqEventCount,
    mqGpsCount,
    docNote: DOC_NOTE,
    verdict,
    mqDiagnostic,
  };
}

function buildVerdict(
  locationCount: number,
  mq: MqLocationDiagnostic | undefined,
  mqEventCount: number,
  serials: string[]
): string {
  if (locationCount > 0) {
    return `OK — ${locationCount} marcador(es) en mapa.`;
  }
  if (!mq) {
    return "Sin cache local. Pulsa «Obtener última ubicación» para escuchar MQ.";
  }
  if (mq.usedTelemetryWorker) {
    return (
      `Telemetría activa: tras ${mq.waitSeconds}s en cache del worker, sin Msg330001 para ${serials.join(", ") || "flota"}. ` +
      "Revisa la consola del backend ([hik-mq]) y el panel Diagnóstico."
    );
  }
  if (mq.subscribeErrorCode !== "0") {
    return `Error API: mq/subscribe errorCode=${mq.subscribeErrorCode}. Revisa permisos OpenAPI.`;
  }
  if (mq.pollErrorCode !== "0") {
    return `Error API: mq/messages errorCode=${mq.pollErrorCode}.`;
  }
  if (mqEventCount === 0) {
    return (
      `Tras ${mq.waitSeconds}s (${mq.pollAttempts} polls): cola MQ vacía para ${serials.join(", ") || "flota"}. ` +
      "Hik-Connect no entrega Msg330001 a OpenAPI (el portal usa otro servicio). " +
      "Revisa consola [hik-mq] en la terminal del backend."
    );
  }
  if (mq.gpsFromAnySerial === 0) {
    return `Llegaron ${mqEventCount} evento(s) MQ pero ninguno Msg330001 con GPS parseable.`;
  }
  return "Hay GPS en MQ de otros seriales, no de tu flota.";
}
