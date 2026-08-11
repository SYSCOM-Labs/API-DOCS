import type { HikCredentials, MqEvent } from "../types/hik.types.js";
import {
  MQ_CHANNELS,
  pollChannel,
  subscribeChannel,
  type MqChannel,
} from "../services/mqEventsService.js";
import { pollRecentRecords, type CertificateRecord } from "../services/recordsFeedService.js";
import { eventsHub } from "../websocket/eventsHub.js";

const POLL_INTERVAL_MS = 500;
/** Los certificate records se consultan cada ~4 s (8 ticks) para no saturar la API. */
const RECORDS_EVERY_TICKS = 8;
const RECORDS_WINDOW_MIN = 15;

const SANDBOX_NAMES = ["Ana García", "Pedro Hernández", "María López", "Carlos Ruiz"];
const SANDBOX_MSG = ["Msg110013", "Msg110003", "Msg110005", "Msg110023"];

class EventsWorker {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private sandboxMode = false;
  private credentials: HikCredentials | null = null;
  private tick = 0;
  /** Canales cuya suscripción respondió errorCode 0. */
  private activeChannels: MqChannel[] = [];
  /** Claves de records ya emitidos, para no repetirlos en cada sondeo. */
  private seenRecords = new Set<string>();
  /** UUID de mensajes MQ ya emitidos; protege ante reentrega del mismo batch. */
  private seenMqEvents = new Set<string>();
  private recordsFallbackFailed = false;

  isRunning(): boolean {
    return this.intervalId !== null;
  }

  getMode(): { sandboxMode: boolean } {
    return { sandboxMode: this.sandboxMode };
  }

  private status(message: string): void {
    eventsHub.broadcast({
      type: "status",
      payload: { running: this.isRunning(), sandboxMode: this.sandboxMode, message },
    });
  }

  async start(credentials: HikCredentials, sandboxMode: boolean): Promise<void> {
    this.stop();
    this.credentials = credentials;
    this.sandboxMode = sandboxMode;
    this.tick = 0;
    this.activeChannels = [];
    this.seenRecords.clear();
    this.seenMqEvents.clear();
    this.recordsFallbackFailed = false;

    if (sandboxMode) {
      this.intervalId = setInterval(() => void this.tickOnce(), POLL_INTERVAL_MS);
      this.status("Eventos sandbox simulados");
      return;
    }

    const results = await Promise.all(
      MQ_CHANNELS.map((channel) => subscribeChannel(credentials, channel))
    );

    for (const result of results) {
      if (result.errorCode === "0") this.activeChannels.push(result.channel);
      else eventsHub.broadcast({ type: "debug", payload: result.debug });
    }

    this.intervalId = setInterval(() => void this.tickOnce(), POLL_INTERVAL_MS);

    const summary = results.map((r) => `${r.channel}=${r.errorCode}`).join(", ");
    this.status(
      this.activeChannels.length
        ? `Suscrito a ${this.activeChannels.join(", ")} (${summary}); respaldo por marcajes activo`
        : `Ninguna cola aceptó la suscripción (${summary}); se usará el respaldo por marcajes`
    );
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    eventsHub.broadcast({
      type: "status",
      payload: { running: false, sandboxMode: this.sandboxMode, message: "Feed detenido" },
    });
  }

  private async tickOnce(): Promise<void> {
    this.tick += 1;
    if (this.sandboxMode) {
      this.emitSandboxEvent();
      return;
    }
    if (!this.credentials) return;

    await this.pollQueues();

    if (this.tick % RECORDS_EVERY_TICKS === 0 && !this.recordsFallbackFailed) {
      await this.pollRecordsFallback();
    }
  }

  private emitSandboxEvent(): void {
    if (this.tick % 8 !== 0) return;
    const idx = Math.floor(Math.random() * SANDBOX_NAMES.length);
    const event: MqEvent = {
      uuid: `sandbox-${Date.now()}`,
      basicInfo: {
        occurrenceTime: new Date().toISOString(),
        msgType: SANDBOX_MSG[idx],
        person: { name: SANDBOX_NAMES[idx], personCode: `E00${idx + 1}` },
        device: { name: "Terminal Facial Entrada", serialNo: "ACS-DEMO-001" },
        resource: { name: "Puerta principal" },
      },
    };
    eventsHub.broadcast({ type: "event", payload: { ...event, channel: "sandbox" } });
  }

  private async pollQueues(): Promise<void> {
    if (!this.credentials || !this.activeChannels.length) return;

    // Una cola por tick: con tres canales evita superar el límite recomendado de 5 req/s.
    const channel = this.activeChannels[(this.tick - 1) % this.activeChannels.length];
    try {
      const poll = await pollChannel(this.credentials, channel);
      if (poll.errorCode !== "0") {
        if (this.tick <= this.activeChannels.length * 2) {
          this.status(`Sondeo ${channel} errorCode=${poll.errorCode}`);
          eventsHub.broadcast({ type: "debug", payload: poll.debug });
        }
        return;
      }
      for (const event of poll.events) {
        const key = mqEventKey(event, channel);
        if (this.seenMqEvents.has(key)) continue;
        this.seenMqEvents.add(key);
        eventsHub.broadcast({
          type: "event",
          payload: { ...(event as Record<string, unknown>), channel },
          debug: this.tick <= 2 ? poll.debug : undefined,
        });
      }
    } catch (err) {
      console.error(`[eventsWorker] ${channel}`, err);
    }
  }

  private async pollRecordsFallback(): Promise<void> {
    if (!this.credentials) return;
    try {
      const poll = await pollRecentRecords(this.credentials, RECORDS_WINDOW_MIN);

      if (poll.errorCode !== "0") {
        this.recordsFallbackFailed = true;
        this.status(`Respaldo por marcajes errorCode=${poll.errorCode} (revisa el Inspector API)`);
        eventsHub.broadcast({ type: "debug", payload: poll.debug });
        return;
      }

      const sortedRecords = [...poll.records].sort((a, b) =>
        String(b.occurTime ?? "").localeCompare(String(a.occurTime ?? ""))
      );
      const fresh = sortedRecords.filter((record) => !this.seenRecords.has(recordKey(record)));

      // El primer sondeo carga el histórico reciente para que el visor no arranque vacío.
      const seeding = this.seenRecords.size === 0;
      for (const record of sortedRecords) this.seenRecords.add(recordKey(record));

      const recordsToEmit = seeding ? sortedRecords.slice(0, 50) : fresh;
      for (const record of recordsToEmit) {
        const person = recordPerson(record);
        eventsHub.broadcast({
          type: "event",
          payload: {
            uuid: recordKey(record),
            channel: "certificaterecords",
            basicInfo: {
              occurrenceTime: record.occurTime,
              msgType: String(record.eventType ?? record.certType ?? "record"),
              person,
              device: { name: record.deviceName },
              resource: { name: record.elementName },
            },
            data: record,
          },
        });
      }

      if (seeding) {
        this.status(
          `Visor cargado: ${recordsToEmit.length} marcaje(s) de los últimos ${RECORDS_WINDOW_MIN} min.`
        );
        return;
      }

      if (this.tick % (RECORDS_EVERY_TICKS * 5) === 0) {
        this.status(
          this.activeChannels.length
            ? `Escuchando ${this.activeChannels.join(", ")} + marcajes…`
            : "Escuchando marcajes (certificate records)…"
        );
      }
    } catch (err) {
      console.error("[eventsWorker] records", err);
    }
  }
}

function recordKey(record: CertificateRecord): string {
  const person = recordPerson(record);
  return (
    record.recordGuid ??
    `${person.personId ?? "?"}|${record.occurTime ?? "?"}|${
      record.eventType ?? record.certType ?? "?"
    }|${
      record.elementId ?? record.deviceName ?? "?"
    }`
  );
}

function mqEventKey(event: MqEvent, channel: MqChannel): string {
  const raw = event as unknown as Record<string, unknown>;
  const basic = (raw.basicInfo ?? {}) as Record<string, unknown>;
  return String(
    raw.uuid ??
      `${channel}|${basic.occurrenceTime ?? "?"}|${basic.msgType ?? "?"}|${
        JSON.stringify(basic.resource ?? {})
      }`
  );
}

function recordPerson(record: CertificateRecord): {
  name: string;
  personId?: string;
  personCode?: string;
} {
  const info = record.personInfo?.baseInfo ?? record.personInfo;
  return {
    name:
      record.personName ??
      [info?.firstName, info?.lastName].filter(Boolean).join(" ").trim() ??
      "",
    personId: record.personId ?? info?.personId ?? record.personInfo?.id,
    personCode: info?.personCode,
  };
}

export const eventsWorker = new EventsWorker();
