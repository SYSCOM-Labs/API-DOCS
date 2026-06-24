import type { Response } from "express";
import type { CredentialsRequest } from "../middleware/credentialsExtractor.js";
import type {
  MqQueueApi,
  MqSubscribeMode,
  ParsedDsmAlarm,
  ParsedGpsUpdate,
} from "../types/hik.types.js";
import {
  probeOnboardMq,
  probeOnboardMqListening,
  type MqPollResult,
  type MqSubscribeOptions,
} from "../services/mqTelemetryService.js";
import { telemetryWorker } from "../workers/telemetryWorker.js";
import type { VehicleIdentity } from "../utils/vehicleIdentity.js";

const SOURCE = "apps/backend/src/controllers/telemetryController.ts";

function parseSubscribeMode(raw: unknown): MqSubscribeMode {
  if (raw === "default" || raw === "all" || raw === "onboard-full") return raw;
  return "onboard-full";
}

function parseMqQueue(raw: unknown): MqQueueApi {
  return raw === "combine" ? "combine" : "rawmsg";
}

function parseMqOptions(payload: Record<string, unknown>): MqSubscribeOptions {
  return {
    mode: parseSubscribeMode(payload.subscribeMode),
    queue: parseMqQueue(payload.mqQueue),
  };
}

function parseVehicleRegistry(payload: Record<string, unknown>): VehicleIdentity[] {
  if (!Array.isArray(payload.vehicleRegistry)) return [];
  return (payload.vehicleRegistry as Record<string, unknown>[])
    .map((v) => ({
      deviceSerial: String(v.deviceSerial ?? ""),
      name: String(v.name ?? ""),
      licensePlateNo: String(v.licensePlateNo ?? v.licensePlate ?? ""),
      vehicleId: v.vehicleId ? String(v.vehicleId) : undefined,
    }))
    .filter((v) => v.deviceSerial);
}

/**
 * Inicia telemetría GPS/DSM. sandboxMode=true omite red Hikvision.
 */
export async function startTelemetry(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const payload = req.hikPayload ?? {};
    const sandboxMode = Boolean(payload.sandboxMode);
    const deviceSerials = Array.isArray(payload.deviceSerials)
      ? (payload.deviceSerials as string[])
      : undefined;
    const mqOptions = parseMqOptions(payload);

    await telemetryWorker.start(req.hikCredentials!, sandboxMode, deviceSerials, {
      ...mqOptions,
      vehicleRegistry: parseVehicleRegistry(payload),
    });

    res.json({
      debug: {
        verb: "POST",
        targetUrl: "local:/api/telemetry/start",
        requestPayload: { sandboxMode, deviceSerials, ...mqOptions },
        responseBody: { running: true, sandboxMode, ...mqOptions },
        sourceFile: SOURCE,
      },
      data: { running: true, sandboxMode, ...mqOptions },
    });
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error al iniciar telemetría",
      debug: { sourceFile: SOURCE },
    });
  }
}

export function stopTelemetry(_req: CredentialsRequest, res: Response): void {
  telemetryWorker.stop();
  res.json({
    debug: {
      verb: "POST",
      targetUrl: "local:/api/telemetry/stop",
      requestPayload: null,
      responseBody: { running: false },
      sourceFile: SOURCE,
    },
    data: { running: false },
  });
}

export function telemetryStatus(_req: CredentialsRequest, res: Response): void {
  res.json({
    data: {
      running: telemetryWorker.isRunning(),
      ...telemetryWorker.getMode(),
    },
  });
}

/**
 * Sonda MQ: subscribe + poll(s). subscribeMode=all omite msgType (PDF §5.4.1).
 */
export async function probeTelemetryMq(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const payload = req.hikPayload ?? {};
    const waitSeconds = Number(payload.waitSeconds ?? 0);
    const mqOptions = parseMqOptions(payload);
    const useListen = waitSeconds > 0;

    if (useListen) {
      const result = await probeOnboardMqListening(
        req.hikCredentials!,
        waitSeconds,
        mqOptions
      );
      const { subscribe, lastPoll, allGps, allAlarms, pollAttempts, waitSeconds: waited, allMsgTypes } =
        result;

      res.json({
        debug: {
          verb: "POST",
          targetUrl: "local:/api/telemetry/probe",
          requestPayload: { waitSeconds: waited, ...mqOptions },
          responseBody: {
            subscribeErrorCode: subscribe.errorCode,
            pollErrorCode: lastPoll.errorCode,
            pollAttempts,
            totalEvents: result.totalEvents,
            gpsParsed: allGps.length,
            allMsgTypes,
            ...mqOptions,
          },
          sourceFile: SOURCE,
        },
        data: buildProbeData(subscribe.errorCode, lastPoll, allGps, allAlarms, {
          listenSeconds: waited,
          pollAttempts,
          totalEvents: result.totalEvents,
          subscribeMode: subscribe.subscribeMode,
          mqQueue: subscribe.queue,
          allMsgTypes,
        }),
      });
      return;
    }

    const result = await probeOnboardMq(req.hikCredentials!, mqOptions);
    const { subscribe, poll } = result;

    res.json({
      debug: {
        verb: "POST",
        targetUrl: "local:/api/telemetry/probe",
        requestPayload: mqOptions,
        responseBody: {
          subscribeErrorCode: subscribe.errorCode,
          pollErrorCode: poll.errorCode,
          eventCount: poll.events.length,
          remainingNumber: poll.remainingNumber,
          summary: poll.summary,
          gpsParsed: poll.parsed.gps.length,
          ...mqOptions,
        },
        sourceFile: SOURCE,
      },
      data: buildProbeData(subscribe.errorCode, poll, poll.parsed.gps, poll.parsed.alarms, {
        subscribeMode: subscribe.subscribeMode,
        mqQueue: subscribe.queue,
        allMsgTypes: poll.summary.msgTypes,
      }),
    });
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error en sonda MQ",
      debug: { sourceFile: SOURCE },
    });
  }
}

function buildProbeData(
  subscribeErrorCode: string,
  poll: MqPollResult,
  gps: ParsedGpsUpdate[],
  alarms: ParsedDsmAlarm[],
  extra?: {
    listenSeconds?: number;
    pollAttempts?: number;
    totalEvents?: number;
    subscribeMode?: MqSubscribeMode;
    mqQueue?: MqQueueApi;
    allMsgTypes?: Record<string, number>;
  }
) {
  const eventCount = extra?.totalEvents ?? poll.events.length;
  const gpsBlock = poll.summary.eventsWithGpsBlock ?? 0;
  return {
    subscribeErrorCode,
    pollErrorCode: poll.errorCode,
    eventCount,
    remainingNumber: poll.remainingNumber,
    batchId: poll.batchId,
    summary: poll.summary,
    gps,
    alarms,
    listenSeconds: extra?.listenSeconds,
    pollAttempts: extra?.pollAttempts,
    subscribeMode: extra?.subscribeMode,
    mqQueue: extra?.mqQueue ?? poll.queue,
    allMsgTypes: extra?.allMsgTypes ?? poll.summary.msgTypes,
    eventsWithGpsBlock: gpsBlock,
    hint: buildProbeHint(eventCount, gps.length, gpsBlock, extra?.listenSeconds, extra?.allMsgTypes),
  };
}

function buildProbeHint(
  eventCount: number,
  gpsCount: number,
  gpsBlockCount: number,
  listenSeconds?: number,
  allMsgTypes?: Record<string, number>
): string {
  if (gpsCount > 0) return "GPS recibido (Msg330001 u otro evento con gpsInfo).";
  if (eventCount > 0 && gpsBlockCount > 0) {
    return `Hay ${eventCount} evento(s) con bloque gpsInfo pero no parseable — revisa consola [hik-mq]. Tipos: ${formatMsgTypes(allMsgTypes)}`;
  }
  if (eventCount > 0) {
    return `Hay ${eventCount} evento(s) MQ sin gpsInfo. Tipos vistos: ${formatMsgTypes(allMsgTypes)}. GPS oficial = Msg330001 (PDF §A.1.6).`;
  }
  const waited = listenSeconds
    ? ` Tras ${listenSeconds}s sin eventos,`
    : " En un poll instantáneo,";
  return (
    `${waited} cola vacía incluso con subscribeMode=all. El portal usa estado interno; OpenAPI MQ no recibe nada nuevo para tu appKey/serial. Escala con Hikvision.`
  );
}

function formatMsgTypes(types?: Record<string, number>): string {
  if (!types || !Object.keys(types).length) return "ninguno";
  return Object.entries(types)
    .map(([k, v]) => `${k}×${v}`)
    .join(", ");
}
