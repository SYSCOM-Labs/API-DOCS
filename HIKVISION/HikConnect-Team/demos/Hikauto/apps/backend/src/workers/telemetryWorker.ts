/**
 * Worker de telemetría: suscripción MQ + polling cada 500 ms.
 * Modo real → Hik rawmsg; modo sandbox → GPS simulado sin red.
 */
import type { HikCredentials, MqEvent, MqSubscribeMode } from "../types/hik.types.js";
import { MsgType } from "../types/hik.types.js";
import {
  pollOnboardMq,
  subscribeOnboardMq,
  type MqSubscribeOptions,
} from "../services/mqTelemetryService.js";
import { parseMqEvents } from "../utils/gpsParser.js";
import {
  expandWatchIdentifiers,
  filterAndNormalizeGps,
  matchesVehicleWatch,
  resolveCanonicalSerial,
  type VehicleIdentity,
} from "../utils/vehicleIdentity.js";
import { lastGpsStore } from "../services/lastGpsStore.js";
import { telemetryHub } from "../websocket/telemetryHub.js";
import { mqWarn } from "../utils/mqLogger.js";

const SOURCE = "apps/backend/src/workers/telemetryWorker.ts";
const POLL_INTERVAL_MS = 500;
const BURST_POLLS_ON_START = 6;

/** Ruta simulada en Chihuahua (cerca del dashcam CH3807848 / ejemplo Postman adaptado). */
const SANDBOX_ROUTE: Array<{ lat: number; lng: number }> = [
  { lat: 28.628561, lng: -106.070414 },
  { lat: 28.62915, lng: -106.06972 },
  { lat: 28.62988, lng: -106.07005 },
  { lat: 28.63042, lng: -106.0711 },
  { lat: 28.62995, lng: -106.0722 },
  { lat: 28.6289, lng: -106.07255 },
  { lat: 28.62785, lng: -106.0718 },
  { lat: 28.6274, lng: -106.0706 },
  { lat: 28.62795, lng: -106.0695 },
  { lat: 28.628561, lng: -106.070414 },
];

const SANDBOX_DEVICES = ["K70728087", "DEMO-SERIAL-01"];

/**
 * Motor dual de telemetría: polling MQ real vs simulación sandbox.
 * Controlado por sandboxMode desde el frontend (Settings).
 */
class TelemetryWorker {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private sandboxMode = false;
  private credentials: HikCredentials | null = null;
  private watchedSerials: string[] = [];
  private watchIdentifiers: string[] = [];
  private vehicleRegistry: VehicleIdentity[] = [];
  private routeIndex = 0;
  private tickCount = 0;
  private emptyPolls = 0;
  private totalGpsEmitted = 0;
  private subscribeMode: MqSubscribeMode = "onboard-full";
  private mqQueue: MqSubscribeOptions["queue"] = "rawmsg";

  isRunning(): boolean {
    return this.intervalId !== null;
  }

  getMode(): { sandboxMode: boolean } {
    return { sandboxMode: this.sandboxMode };
  }

  /**
   * Inicia el worker. En modo real suscribe MQ antes del polling.
   */
  async start(
    credentials: HikCredentials,
    sandboxMode: boolean,
    deviceSerials?: string[],
    options?: MqSubscribeOptions & { vehicleRegistry?: VehicleIdentity[] }
  ): Promise<void> {
    this.stop();

    this.credentials = credentials;
    this.sandboxMode = sandboxMode;
    this.subscribeMode = options?.mode ?? "onboard-full";
    this.mqQueue = options?.queue ?? "rawmsg";
    this.vehicleRegistry = options?.vehicleRegistry ?? [];
    this.watchedSerials = sandboxMode
      ? deviceSerials?.length
        ? deviceSerials
        : SANDBOX_DEVICES
      : deviceSerials?.length
        ? deviceSerials
        : [];
    this.watchIdentifiers = sandboxMode
      ? this.watchedSerials
      : this.watchedSerials.length
        ? expandWatchIdentifiers(this.watchedSerials, this.vehicleRegistry)
        : [];
    this.routeIndex = 0;
    this.tickCount = 0;
    this.emptyPolls = 0;
    this.totalGpsEmitted = 0;

    if (!sandboxMode) {
      const sub = await subscribeOnboardMq(credentials, {
        mode: this.subscribeMode,
        queue: this.mqQueue,
      });
      telemetryHub.broadcast({
        type: "debug",
        payload: {
          action: "mq/subscribe",
          errorCode: sub.errorCode,
          subscribeMode: sub.subscribeMode,
          queue: sub.queue,
          debug: sub.debug,
        },
      });
      if (sub.errorCode !== "0") {
        throw new Error(
          `mq/subscribe falló (errorCode=${sub.errorCode}, modo=${sub.subscribeMode}). OPEN000010 = parámetros inválidos. Revisa Code HUD.`
        );
      }

      for (let i = 0; i < BURST_POLLS_ON_START; i++) {
        await this.runRealTick(credentials, true);
      }
    }

    this.intervalId = setInterval(() => {
      void this.tick();
    }, POLL_INTERVAL_MS);

    telemetryHub.broadcast({
      type: "status",
      payload: {
        running: true,
        sandboxMode,
        message: sandboxMode
          ? "Telemetría sandbox activa (sin red Hikvision)"
          : `Telemetría real (${this.mqQueue}): polling ${POLL_INTERVAL_MS}ms · rastreo: ${this.watchedSerials.join(", ") || "toda la flota"} · alias MQ: ${this.watchIdentifiers.slice(0, 4).join(", ")}${this.watchIdentifiers.length > 4 ? "…" : ""}`,
      },
    });
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    telemetryHub.broadcast({
      type: "status",
      payload: {
        running: false,
        sandboxMode: this.sandboxMode,
        message: "Telemetría detenida",
      },
    });
  }

  private async tick(): Promise<void> {
    if (this.sandboxMode) {
      this.runSandboxTick();
      return;
    }
    if (this.credentials) {
      await this.runRealTick(this.credentials);
    }
  }

  /** Modo real: poll mq/messages y confirmar batchId. */
  private async runRealTick(credentials: HikCredentials, burst = false): Promise<void> {
    try {
      const poll = await pollOnboardMq(credentials, this.mqQueue);
      const { errorCode, events, remainingNumber, summary, parsed } = poll;

      if (errorCode !== "0") {
        telemetryHub.broadcast({
          type: "status",
          payload: {
            running: true,
            sandboxMode: false,
            message: `MQ errorCode=${errorCode} — revisa panel diagnóstico`,
          },
        });
        this.broadcastDiag({
          phase: burst ? "burst" : "poll",
          errorCode,
          eventCount: events.length,
          remainingNumber,
          summary,
          gpsParsed: parsed.gps.length,
          alarmsParsed: parsed.alarms.length,
          watchedSerials: this.watchedSerials,
          totalGpsEmitted: this.totalGpsEmitted,
        });
        return;
      }

      if (events.length > 0) {
        this.emptyPolls = 0;
        this.emitParsedEvents(events, poll.debug);
        this.broadcastDiag({
          phase: burst ? "burst" : "poll",
          errorCode,
          eventCount: events.length,
          remainingNumber,
          summary,
          gpsParsed: parsed.gps.length,
          alarmsParsed: parsed.alarms.length,
          watchedSerials: this.watchedSerials,
          totalGpsEmitted: this.totalGpsEmitted,
          sampleGps: parsed.gps[0],
        });
      } else {
        this.emptyPolls++;
        const showStatus = burst || this.emptyPolls % 20 === 1;
        if (showStatus) {
          const msg =
            remainingNumber > 0
              ? `Cola MQ: ${remainingNumber} mensaje(s) pendiente(s) — procesando…`
              : this.totalGpsEmitted > 0
                ? `Esperando próximo evento… (${this.totalGpsEmitted} GPS emitidos; este poll vacío)`
                : "Sin eventos en este poll. La cola MQ se vacía tras cada lectura; los GPS llegan en ráfagas.";
          telemetryHub.broadcast({
            type: "status",
            payload: {
              running: true,
              sandboxMode: false,
              message: msg,
            },
          });
        }
        if (burst || this.emptyPolls % 10 === 1) {
          this.broadcastDiag({
            phase: burst ? "burst" : "poll",
            errorCode,
            eventCount: 0,
            remainingNumber,
            summary,
            gpsParsed: 0,
            alarmsParsed: 0,
            watchedSerials: this.watchedSerials,
            totalGpsEmitted: this.totalGpsEmitted,
          });
        }
      }
    } catch (err) {
      telemetryHub.broadcast({
        type: "status",
        payload: {
          running: true,
          sandboxMode: false,
          message: `Error MQ: ${err instanceof Error ? err.message : "desconocido"}`,
        },
      });
    }
  }

  private broadcastDiag(payload: Record<string, unknown>): void {
    telemetryHub.broadcast({ type: "diag", payload });
  }

  /** Modo sandbox: genera progresión GPS y alarmas DSM aleatorias con forma MQ oficial. */
  private runSandboxTick(): void {
    this.tickCount++;
    const deviceSerial =
      this.watchedSerials[this.tickCount % this.watchedSerials.length] ?? SANDBOX_DEVICES[0];
    const wp = SANDBOX_ROUTE[this.routeIndex % SANDBOX_ROUTE.length];
    this.routeIndex++;

    const speedRaw = 450000 + Math.floor(Math.random() * 200000);
    const directionRaw = (this.routeIndex * 30) % 360;

    const gpsEvent: MqEvent = {
      basicInfo: {
        occurrenceTime: new Date().toISOString().replace("T", " ").slice(0, 19),
        msgType: MsgType.GpsReport,
        resource: { id: "sandbox-res", name: "DEMO-001", areaName: "Sandbox" },
        device: { id: "sandbox-dev", name: deviceSerial, category: "mobileDevice" },
      },
      data: {
        vehicleRelatedInfo: {
          gpsInfo: {
            ew: wp.lng < 0 ? "W" : "E",
            lng: String(Math.abs(wp.lng)),
            ns: "N",
            lat: String(wp.lat),
            direction: directionRaw,
            height: 1200,
            speed: speedRaw,
          },
          vehicleInfo: {
            licensePlate: "DEMO-001",
            driverName: "Sandbox Driver",
            id: "sandbox-vehicle",
          },
        },
      },
    };

    this.emitParsedEvents([gpsEvent]);

    if (Math.random() < 0.05) {
      const alarmType =
        Math.random() < 0.5 ? MsgType.Smoking : MsgType.FatigueDriving;
      const alarmEvent: MqEvent = {
        basicInfo: {
          occurrenceTime: new Date().toISOString().replace("T", " ").slice(0, 19),
          msgType: alarmType,
          resource: { id: "sandbox-res", name: "DEMO-001" },
          device: { id: "sandbox-dev", name: deviceSerial, category: "mobileDevice" },
        },
        data: {
          vehicleRelatedInfo: {
            gpsInfo: gpsEvent.data!.vehicleRelatedInfo!.gpsInfo,
            vehicleInfo: { licensePlate: "DEMO-001" },
          },
        },
      };
      this.emitParsedEvents([alarmEvent]);
    }
  }

  private emitParsedEvents(events: MqEvent[], debug?: unknown): void {
    const { gps, alarms } = parseMqEvents(events);
    const watch = this.sandboxMode ? this.watchedSerials : this.watchIdentifiers;
    const registry = this.vehicleRegistry;

    const gpsOut = this.sandboxMode
      ? gps
      : watch.length === 0
        ? gps.map((g) => ({
            ...g,
            deviceSerial: resolveCanonicalSerial(
              g.mqDeviceName ?? g.deviceSerial,
              g.licensePlate,
              g.resourceName,
              registry
            ),
          }))
        : filterAndNormalizeGps(gps, watch, registry);

    if (!this.sandboxMode && gps.length > 0 && gpsOut.length === 0) {
      mqWarn("filter/dropped-all-gps", {
        parsed: gps.length,
        mqNames: gps.map((g) => g.mqDeviceName ?? g.deviceSerial),
        watchIdentifiers: watch,
        watchedSerials: this.watchedSerials,
      });
    }

    for (const g of gpsOut) {
      this.totalGpsEmitted++;
      lastGpsStore.upsert(g);
      telemetryHub.broadcast({
        type: "gps",
        payload: g,
        debug: debug
          ? { sourceFile: SOURCE, ...(typeof debug === "object" ? debug : {}) }
          : { sourceFile: SOURCE, sandbox: this.sandboxMode },
      });
    }

    for (const a of alarms) {
      if (
        !this.sandboxMode &&
        watch.length > 0 &&
        !matchesVehicleWatch(
          a.deviceSerial,
          a.licensePlate,
          undefined,
          watch,
          registry
        )
      ) {
        continue;
      }
      const canonical = this.sandboxMode
        ? a.deviceSerial
        : resolveCanonicalSerial(a.deviceSerial, a.licensePlate, undefined, registry);
      telemetryHub.broadcast({
        type: "alarm",
        payload: { ...a, deviceSerial: canonical },
        debug: { sourceFile: SOURCE, sandbox: this.sandboxMode },
      });
    }
  }
}

export const telemetryWorker = new TelemetryWorker();
