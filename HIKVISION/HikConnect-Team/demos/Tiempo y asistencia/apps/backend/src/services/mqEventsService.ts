import type { HikApiResponse, HikCredentials, MqEvent } from "../types/hik.types.js";
import { hikClient } from "./hikClient.js";

const SOURCE = "apps/backend/src/services/mqEventsService.ts";

/**
 * La plataforma expone tres colas distintas y no todas los tenants entregan los
 * eventos ACS por la misma (§5 rawmsg, §4 alarm, §16.4 combine). El demo se
 * suscribe a todas y muestra lo que llegue, indicando el canal de origen.
 */
export type MqChannel = "rawmsg" | "alarm" | "combine";

export const MQ_CHANNELS: readonly MqChannel[] = ["rawmsg", "alarm", "combine"];

interface MqPayload {
  batchId?: string;
  remainingNumber?: number;
  event?: MqEvent[];
  messages?: MqEvent[];
}

export interface MqSubscribeResult {
  channel: MqChannel;
  errorCode: string;
  debug: unknown;
}

export interface MqPollResult {
  channel: MqChannel;
  errorCode: string;
  events: MqEvent[];
  remainingNumber: number;
  debug: unknown;
}

function subscribeBody(channel: MqChannel): Record<string, unknown> {
  // alarm usa subscribeMode (0 = todos los tipos); rawmsg/combine usan msgType vacío = todos.
  if (channel === "alarm") return { subscribeType: 1, subscribeMode: 0 };
  return { subscribeType: 1, msgType: [] };
}

export async function subscribeChannel(
  credentials: HikCredentials,
  channel: MqChannel
): Promise<MqSubscribeResult> {
  const res = await hikClient.proxyPost<HikApiResponse>(
    credentials,
    `/api/hccgw/${channel}/v1/mq/subscribe`,
    subscribeBody(channel),
    { sourceFile: SOURCE }
  );
  return {
    channel,
    errorCode: (res.data as HikApiResponse)?.errorCode ?? "?",
    debug: res.debug,
  };
}

export async function pollChannel(
  credentials: HikCredentials,
  channel: MqChannel
): Promise<MqPollResult> {
  const res = await hikClient.proxyPost<HikApiResponse<MqPayload>>(
    credentials,
    `/api/hccgw/${channel}/v1/mq/messages`,
    channel === "alarm" ? { maxNumberPerTime: 300 } : {},
    { sourceFile: SOURCE }
  );

  const payload = res.data as HikApiResponse<MqPayload> | undefined;
  const data = payload?.data;
  // rawmsg/combine devuelven data.event[]; alarm devuelve data.messages[].
  const events = data?.event ?? data?.messages ?? [];
  const batchId = data?.batchId;

  if (batchId && events.length > 0) {
    await hikClient.proxyPost(
      credentials,
      `/api/hccgw/${channel}/v1/mq/messages/complete`,
      { batchId },
      { sourceFile: SOURCE }
    );
  }

  return {
    channel,
    errorCode: payload?.errorCode ?? "?",
    events,
    remainingNumber: data?.remainingNumber ?? 0,
    debug: res.debug,
  };
}
