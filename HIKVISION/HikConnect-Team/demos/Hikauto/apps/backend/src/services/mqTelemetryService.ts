import type {
  HikApiResponse,
  HikCredentials,
  MqEvent,
  MqMessagesResponse,
  MqQueueApi,
  MqSubscribeMode,
} from "../types/hik.types.js";
import { MsgType, ONBOARD_ALL_MSG_TYPES } from "../types/hik.types.js";
import { hikClient } from "./hikClient.js";
import { withMqLock } from "./mqLock.js";
import { parseMqEvents, summarizeMqBatch } from "../utils/gpsParser.js";
import { mqLog, mqWarn } from "../utils/mqLogger.js";

const SOURCE = "apps/backend/src/services/mqTelemetryService.ts";

const DEFAULT_MSG_TYPES = [
  MsgType.GpsReport,
  MsgType.GpsReportAlt,
  MsgType.Smoking,
  MsgType.FatigueDriving,
];

export interface MqSubscribeOptions {
  mode?: MqSubscribeMode;
  queue?: MqQueueApi;
}

export interface MqSubscribeResult {
  errorCode: string;
  debug: unknown;
  subscribeMode: MqSubscribeMode;
  queue: MqQueueApi;
}

export interface MqPollResult {
  errorCode: string;
  events: MqEvent[];
  batchId?: string;
  remainingNumber: number;
  debug: unknown;
  summary: ReturnType<typeof summarizeMqBatch>;
  parsed: ReturnType<typeof parseMqEvents>;
  queue: MqQueueApi;
}

function mqPath(queue: MqQueueApi, suffix: "subscribe" | "messages" | "messages/complete"): string {
  return `/api/hccgw/${queue}/v1/mq/${suffix}`;
}

function buildSubscribeBody(mode: MqSubscribeMode): Record<string, unknown> {
  if (mode === "all") {
    /** PDF §5.4.1: array vacío = todos los tipos (omitir msgType → OPEN000010 en producción). */
    return { subscribeType: 1, msgType: [] };
  }
  if (mode === "onboard-full") {
    return { subscribeType: 1, msgType: [...ONBOARD_ALL_MSG_TYPES] };
  }
  return { subscribeType: 1, msgType: DEFAULT_MSG_TYPES };
}

const SUBSCRIBE_FALLBACK: Record<MqSubscribeMode, MqSubscribeMode[]> = {
  all: ["all", "onboard-full", "default"],
  "onboard-full": ["onboard-full", "default"],
  default: ["default"],
};

function extractEvents(data: MqMessagesResponse | undefined): MqEvent[] {
  if (!data) return [];
  if (Array.isArray(data.event) && data.event.length > 0) return data.event;
  const combine = (data as { combineEvent?: MqEvent[] }).combineEvent;
  if (Array.isArray(combine) && combine.length > 0) return combine;
  return data.event ?? [];
}

async function subscribeOnboardMqUnsafe(
  credentials: HikCredentials,
  options: MqSubscribeOptions = {}
): Promise<MqSubscribeResult> {
  const requestedMode = options.mode ?? "onboard-full";
  const queue = options.queue ?? "rawmsg";
  const modesToTry = SUBSCRIBE_FALLBACK[requestedMode];

  let lastErrorCode = "?";
  let lastDebug: unknown;

  for (let i = 0; i < modesToTry.length; i++) {
    const tryMode = modesToTry[i];
    const body = buildSubscribeBody(tryMode);

    mqLog("subscribe/start", { requestedMode, tryMode, queue, body });

    const result = await hikClient.proxyPost(
      credentials,
      mqPath(queue, "subscribe"),
      body,
      { sourceFile: SOURCE }
    );

    const errorCode = (result.data as HikApiResponse)?.errorCode ?? "?";
    lastErrorCode = errorCode;
    lastDebug = result.debug;

    mqLog("subscribe/done", { requestedMode, tryMode, queue, errorCode });

    if (errorCode === "0") {
      if (tryMode !== requestedMode) {
        mqWarn("subscribe/fallback-ok", { requestedMode, usedMode: tryMode });
      }
      return {
        errorCode,
        debug: result.debug,
        subscribeMode: tryMode,
        queue,
      };
    }

    const canRetry =
      errorCode === "OPEN000010" && i < modesToTry.length - 1;
    if (canRetry) {
      mqWarn("subscribe/fallback-retry", {
        failedMode: tryMode,
        errorCode,
        nextMode: modesToTry[i + 1],
      });
      continue;
    }

    break;
  }

  return {
    errorCode: lastErrorCode,
    debug: lastDebug,
    subscribeMode: requestedMode,
    queue,
  };
}

async function pollOnboardMqUnsafe(
  credentials: HikCredentials,
  queue: MqQueueApi = "rawmsg"
): Promise<MqPollResult> {
  const result = await hikClient.proxyPost<HikApiResponse<MqMessagesResponse>>(
    credentials,
    mqPath(queue, "messages"),
    {},
    { sourceFile: SOURCE }
  );

  const errorCode = (result.data as HikApiResponse)?.errorCode ?? "?";
  const events = extractEvents(result.data?.data);
  const batchId = result.data?.data?.batchId;
  const remainingNumber = result.data?.data?.remainingNumber ?? 0;
  const summary = summarizeMqBatch(events);
  const parsed = parseMqEvents(events);

  if (batchId && errorCode === "0") {
    await hikClient.proxyPost(
      credentials,
      mqPath(queue, "messages/complete"),
      { batchId },
      { sourceFile: SOURCE }
    );
  }

  mqLog("poll", {
    queue,
    errorCode,
    eventCount: events.length,
    remainingNumber,
    gpsParsed: parsed.gps.length,
    msgTypes: summary.msgTypes,
    serials: summary.deviceSerials,
    eventsWithGpsBlock: summary.eventsWithGpsBlock,
  });

  if (events.length > 0 && parsed.gps.length === 0 && summary.eventsWithGpsBlock > 0) {
    mqWarn("poll/gps-block-unparsed", {
      eventsWithGpsBlock: summary.eventsWithGpsBlock,
      msgTypes: summary.msgTypes,
    });
  }

  if (events.length > 0 && parsed.gps.length === 0 && summary.eventsWithGpsBlock === 0) {
    mqWarn("poll/events-no-gps-block", { msgTypes: summary.msgTypes });
  }

  return {
    errorCode,
    events,
    batchId,
    remainingNumber,
    debug: result.debug,
    summary,
    parsed,
    queue,
  };
}

/** Suscripción a la cola MQ (Postman §4.1.1 / PDF §5.4.1). */
export async function subscribeOnboardMq(
  credentials: HikCredentials,
  options: MqSubscribeOptions = {}
): Promise<MqSubscribeResult> {
  return withMqLock("subscribe", () => subscribeOnboardMqUnsafe(credentials, options));
}

/** Un ciclo poll + confirmación (Postman §4.1.2 / §4.1.3). */
export async function pollOnboardMq(
  credentials: HikCredentials,
  queue: MqQueueApi = "rawmsg"
): Promise<MqPollResult> {
  return withMqLock("poll", () => pollOnboardMqUnsafe(credentials, queue));
}

export interface MqProbeOptions extends MqSubscribeOptions {
  waitSeconds?: number;
}

/** Sonda única: subscribe + un poll (diagnóstico sin iniciar el worker). */
export async function probeOnboardMq(
  credentials: HikCredentials,
  options: MqProbeOptions = {}
): Promise<{
  subscribe: MqSubscribeResult;
  poll: MqPollResult;
}> {
  return withMqLock("probe-instant", async () => {
    mqLog("probe/instant/start", {
      mode: options.mode,
      queue: options.queue,
      waitSeconds: options.waitSeconds,
    });
    const subscribe = await subscribeOnboardMqUnsafe(credentials, options);
    const poll = await pollOnboardMqUnsafe(credentials, options.queue ?? "rawmsg");
    mqLog("probe/instant/done", {
      subscribeErrorCode: subscribe.errorCode,
      pollErrorCode: poll.errorCode,
      eventCount: poll.events.length,
      subscribeMode: subscribe.subscribeMode,
      queue: subscribe.queue,
    });
    return { subscribe, poll };
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Sonda con escucha prolongada: subscribe + polls cada 500 ms.
 */
export async function probeOnboardMqListening(
  credentials: HikCredentials,
  waitSeconds = 60,
  options: MqSubscribeOptions = {}
): Promise<{
  subscribe: MqSubscribeResult;
  pollAttempts: number;
  waitSeconds: number;
  lastPoll: MqPollResult;
  totalEvents: number;
  allGps: ReturnType<typeof parseMqEvents>["gps"];
  allAlarms: ReturnType<typeof parseMqEvents>["alarms"];
  allMsgTypes: Record<string, number>;
}> {
  const capped = Math.min(Math.max(waitSeconds, 5), 120);
  const queue = options.queue ?? "rawmsg";

  return withMqLock("probe-listen", async () => {
    mqLog("probe/listen/start", { waitSeconds: capped, ...options, queue });
    const subscribe = await subscribeOnboardMqUnsafe(credentials, options);
    const allGps: ReturnType<typeof parseMqEvents>["gps"] = [];
    const allAlarms: ReturnType<typeof parseMqEvents>["alarms"] = [];
    const allMsgTypes: Record<string, number> = {};
    let lastPoll: MqPollResult | null = null;
    let totalEvents = 0;

    const attempts = Math.ceil((capped * 1000) / 500);
    for (let i = 0; i < attempts; i++) {
      const poll = await pollOnboardMqUnsafe(credentials, queue);
      lastPoll = poll;
      totalEvents += poll.events.length;
      for (const [mt, n] of Object.entries(poll.summary.msgTypes)) {
        allMsgTypes[mt] = (allMsgTypes[mt] ?? 0) + n;
      }
      for (const g of poll.parsed.gps) allGps.push(g);
      for (const a of poll.parsed.alarms) allAlarms.push(a);
      if (poll.errorCode !== "0") {
        mqWarn("probe/listen/poll-error", { attempt: i + 1, errorCode: poll.errorCode });
        break;
      }
      if (i < attempts - 1) await sleep(500);
    }

    mqLog("probe/listen/done", {
      subscribeErrorCode: subscribe.errorCode,
      subscribeMode: subscribe.subscribeMode,
      queue,
      pollAttempts: attempts,
      totalEvents,
      gpsCount: allGps.length,
      allMsgTypes,
      serials: [...new Set(allGps.map((g) => g.deviceSerial))],
    });

    return {
      subscribe,
      pollAttempts: attempts,
      waitSeconds: capped,
      lastPoll: lastPoll!,
      totalEvents,
      allGps,
      allAlarms,
      allMsgTypes,
    };
  });
}
