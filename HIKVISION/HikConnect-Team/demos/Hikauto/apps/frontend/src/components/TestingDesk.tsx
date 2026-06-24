import { useState, useEffect, useCallback, useRef } from "react";
import { AddVehicleTab } from "./tabs/AddVehicleTab";
import { DispatchDriverTab } from "./tabs/DispatchDriverTab";
import { AccStatusTab } from "./tabs/AccStatusTab";
import { LiveStreamTab } from "./tabs/LiveStreamTab";
import { PlatformOverview } from "./tabs/PlatformOverview";
import { FleetMap } from "../map/FleetMap";
import { GuidePanel } from "./GuidePanel";
import { VehicleTelemetryPicker } from "./VehicleTelemetryPicker";
import { SidebarNav, type DeskTabId } from "./SidebarNav";
import { apiPost } from "../api/client";
import { GUIDES } from "../content/guides";
import { btnDestructive, btnPrimary, btnSecondary } from "./ui/classes";
import { toVehicleRegistry } from "../lib/vehicleIdentity";
import type {
  ProxyDebugInfo,
  GpsMarker,
  DsmAlarmEntry,
  StoredCredentials,
  PlatformSnapshot,
  DiscoveredVehicle,
  MqDiagnostics,
  MqProbeResult,
} from "../types";

type TabId = DeskTabId;

const NAV = [
  { id: "platform" as const, label: "Plataforma", endpoint: "GET /areas, /vehicles" },
  { id: "vehicles" as const, label: "Vehículos", endpoint: "POST /vehicles/add" },
  { id: "drivers" as const, label: "Conductores", endpoint: "POST /driver/add" },
  { id: "acc" as const, label: "Ignición ACC", endpoint: "POST /accstatus/search" },
  { id: "stream" as const, label: "Video en vivo", endpoint: "POST /video/live" },
  { id: "telemetry" as const, label: "Telemetría GPS", endpoint: "POST /mq/subscribe" },
];

const LS_NAV_COMPACT = "hikFleet.sidebarCompact";

export interface TestingDeskProps {
  credentials: StoredCredentials;
  credentialsEnvelope: Record<string, string>;
  isConfigured: boolean;
  platform: PlatformSnapshot | null;
  selectedVehicle: DiscoveredVehicle | null;
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onRediscover: () => void;
  discovering: boolean;
  onHud: (label: string, debug?: ProxyDebugInfo) => void;
  markers: Record<string, GpsMarker>;
  trails: Record<string, Array<{ lat: number; lng: number }>>;
  alarms: DsmAlarmEntry[];
  mqDiag: MqDiagnostics | null;
  telemetryStatus: string;
  telemetryWsConnected: boolean;
  telemetryGpsCount: number;
  telemetryRunning: boolean;
  onTelemetryRunningChange: (v: boolean) => void;
  onClearTelemetry: () => void;
  staleMapSerials: Set<string>;
  lastLocationStatus: string;
  lastLocationLoading: boolean;
  locationVerdict: string;
  mapMarkerCount: number;
  mapFocusSerial?: string;
  telemetrySerials: string[];
  onTelemetrySerialsChange: (serials: string[]) => void;
  onFetchLastLocations: (refresh: boolean, waitSeconds?: number) => void;
  onActiveTabChange?: (tab: TabId) => void;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-neutral-300"}`}
    />
  );
}

function TelemetryPanel({
  credentials,
  credentialsEnvelope,
  isConfigured,
  platform,
  selectedVehicle,
  markers,
  trails,
  staleMapSerials,
  alarms,
  mqDiag,
  telemetryStatus,
  telemetryWsConnected,
  telemetryGpsCount,
  telemetryRunning,
  onTelemetryRunningChange,
  onClearTelemetry,
  lastLocationStatus,
  lastLocationLoading,
  locationVerdict,
  mapMarkerCount,
  mapFocusSerial,
  telemetrySerials,
  onTelemetrySerialsChange,
  onFetchLastLocations,
  onHud,
  navCompact,
}: Pick<
  TestingDeskProps,
  | "credentials"
  | "credentialsEnvelope"
  | "isConfigured"
  | "platform"
  | "selectedVehicle"
  | "markers"
  | "trails"
  | "staleMapSerials"
  | "alarms"
  | "mqDiag"
  | "telemetryStatus"
  | "telemetryWsConnected"
  | "telemetryGpsCount"
  | "telemetryRunning"
  | "onTelemetryRunningChange"
  | "onClearTelemetry"
  | "lastLocationStatus"
  | "lastLocationLoading"
  | "locationVerdict"
  | "mapMarkerCount"
  | "mapFocusSerial"
  | "telemetrySerials"
  | "onTelemetrySerialsChange"
  | "onFetchLastLocations"
  | "onHud"
> & { navCompact: boolean }) {
  const [telemetryError, setTelemetryError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [probeResult, setProbeResult] = useState<MqProbeResult | null>(null);
  const [probing, setProbing] = useState(false);

  async function toggleTelemetry() {
    setTelemetryError("");
    if (!telemetryWsConnected) {
      setTelemetryError("WebSocket desconectado. Reinicia el servidor y recarga.");
      return;
    }
    if (!isConfigured) {
      setTelemetryError("Conecta con credenciales reales primero.");
      return;
    }
    if (telemetrySerials.length === 0) {
      setTelemetryError("Selecciona al menos un vehículo en la lista de arriba.");
      return;
    }

    if (telemetryRunning) {
      const res = await apiPost("/api/telemetry/stop", credentialsEnvelope, { sandboxMode: false });
      if (res.debug) onHud("Detener telemetría", res.debug);
      onClearTelemetry();
      onTelemetryRunningChange(false);
      return;
    }

    try {
      const res = await apiPost("/api/telemetry/start", credentialsEnvelope, {
        sandboxMode: false,
        subscribeMode: "onboard-full",
        mqQueue: "rawmsg",
        deviceSerials: telemetrySerials,
        vehicleRegistry: platform ? toVehicleRegistry(platform.vehicles) : [],
      });
      if (res.debug) onHud("Iniciar telemetría", res.debug);
      if (res.error) {
        setTelemetryError(res.error);
        onTelemetryRunningChange(false);
        return;
      }
      onTelemetryRunningChange(true);
    } catch (e) {
      setTelemetryError(e instanceof Error ? e.message : "Error al iniciar telemetría");
      onTelemetryRunningChange(false);
    }
  }

  async function probeMq(
    waitSeconds = 0,
    options: { subscribeMode?: string; mqQueue?: string } = {}
  ) {
    if (credentials.sandboxMode) return;
    if (waitSeconds > 0 && telemetryRunning) {
      setTelemetryError("Detén la telemetría antes de escuchar la cola MQ.");
      return;
    }
    setProbing(true);
    setProbeResult(null);
    setTelemetryError("");
    try {
      const res = await apiPost<MqProbeResult>("/api/telemetry/probe", credentialsEnvelope, {
        subscribeMode: options.subscribeMode ?? "onboard-full",
        mqQueue: options.mqQueue ?? "rawmsg",
        ...(waitSeconds > 0 ? { waitSeconds } : {}),
      });
      const label = waitSeconds > 0 ? `Sonda MQ (${waitSeconds}s)` : "Sonda MQ";
      if (res.debug) onHud(label, res.debug);
      if (res.error) {
        setTelemetryError(res.error);
        return;
      }
      if (res.data) setProbeResult(res.data);
    } catch (e) {
      setTelemetryError(e instanceof Error ? e.message : "Error en sonda MQ");
    } finally {
      setProbing(false);
    }
  }

  return (
    <div className={`space-y-5 ${navCompact ? "telemetry-layout-compact" : "space-y-6"}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-label">Telemetría</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">GPS en vivo</h2>
          {!navCompact && (
            <p className="mt-1 text-sm text-ink-secondary">
              Elige vehículos y observa el mapa a pantalla amplia.
            </p>
          )}
        </div>
      </header>

      <GuidePanel guide={GUIDES.telemetry} defaultOpen={false} />

      {platform && platform.vehicles.length > 0 && (
        <div className="rounded-xl border border-black/[0.06] bg-surface-raised px-4 py-3">
          <VehicleTelemetryPicker
            vehicles={platform.vehicles}
            selectedSerials={telemetrySerials}
            onChange={onTelemetrySerialsChange}
            credentialsEnvelope={credentialsEnvelope}
            isConfigured={isConfigured}
            onHud={onHud}
            activeVehicleSerial={selectedVehicle?.deviceSerial}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-ink-secondary">
        <span className="flex items-center gap-2">
          <StatusDot ok={telemetryWsConnected} /> WebSocket
        </span>
        <span className="flex items-center gap-2">
          <StatusDot ok={telemetryRunning} /> Polling MQ
        </span>
        <span>
          GPS recibidos: <strong className="text-ink">{telemetryGpsCount}</strong>
        </span>
        {telemetrySerials.length > 0 && (
          <span>
            Rastreando:{" "}
            <strong className="font-mono text-xs text-ink">{telemetrySerials.join(", ")}</strong>
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void toggleTelemetry()}
          disabled={!isConfigured || !telemetryWsConnected || telemetrySerials.length === 0}
          className={telemetryRunning ? btnDestructive : btnPrimary}
        >
          {telemetryRunning ? "Detener" : "Iniciar telemetría"}
        </button>
        {isConfigured && (
          <button
            type="button"
            onClick={() => onFetchLastLocations(true, 30)}
            disabled={lastLocationLoading || telemetrySerials.length === 0}
            className={btnSecondary}
          >
            {lastLocationLoading ? "Buscando…" : "Última ubicación"}
          </button>
        )}
      </div>

      {telemetryError && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{telemetryError}</p>
      )}

      {telemetryStatus && (
        <p className="rounded-xl bg-neutral-50 px-4 py-2.5 text-sm text-ink-secondary">
          {telemetryStatus}
        </p>
      )}

      {mqDiag && telemetryRunning && (
        <p className="text-xs text-ink-tertiary">
          MQ · eventos: {mqDiag.eventCount ?? 0} · GPS emitidos: {mqDiag.totalGpsEmitted ?? 0}
          {mqDiag.watchedSerials?.length
            ? ` · worker: ${mqDiag.watchedSerials.join(", ")}`
            : ""}
        </p>
      )}

      {(locationVerdict || lastLocationStatus) && isConfigured && mapMarkerCount === 0 && (
        <p className="text-sm text-ink-secondary">{locationVerdict || lastLocationStatus}</p>
      )}

      <FleetMap
        markers={markers}
        trails={trails}
        staleSerials={staleMapSerials}
        focusSerial={mapFocusSerial}
        height={navCompact ? "calc(100vh - 11rem)" : "420px"}
        emptyHint={
          mapMarkerCount === 0 && isConfigured
            ? locationVerdict ||
              "Sin GPS para los vehículos seleccionados. Inicia telemetría o espera Msg330001."
            : undefined
        }
      />

      {!navCompact && alarms.length > 0 && (
        <div className="content-card">
          <p className="section-label">Alarmas DSM</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {alarms.map((a, i) => (
              <li key={`${a.occurrenceTime}-${i}`} className="text-ink-secondary">
                {a.label} · {a.deviceSerial}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!navCompact && isConfigured && (
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-accent hover:underline"
          >
            {showAdvanced ? "Ocultar diagnóstico MQ" : "Diagnóstico MQ avanzado"}
          </button>

          {showAdvanced && (
            <div className="content-card mt-4 space-y-4 text-sm">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void probeMq()}
                  disabled={probing}
                  className={btnSecondary}
                >
                  {probing ? "…" : "Poll instantáneo"}
                </button>
                <button
                  type="button"
                  onClick={() => void probeMq(60)}
                  disabled={probing}
                  className={btnSecondary}
                >
                  Escuchar 60s
                </button>
              </div>

              {probeResult && (
                <dl className="grid gap-2 text-xs text-ink-secondary sm:grid-cols-2">
                  <div>
                    subscribe:{" "}
                    <span className="font-mono text-ink">{probeResult.subscribeErrorCode}</span>
                  </div>
                  <div>
                    eventos: <span className="font-mono text-ink">{probeResult.eventCount}</span>
                  </div>
                  <div className="sm:col-span-2">{probeResult.hint}</div>
                </dl>
              )}

              {mqDiag && (
                <dl className="grid gap-2 text-xs text-ink-secondary sm:grid-cols-2">
                  <div>
                    Último poll:{" "}
                    <span className="text-ink">
                      {new Date(mqDiag.updatedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>
                    eventos: <span className="text-ink">{mqDiag.eventCount ?? 0}</span>
                  </div>
                  <div>
                    cola pendiente:{" "}
                    <span className="text-ink">{mqDiag.remainingNumber ?? 0}</span>
                  </div>
                  <div>
                    GPS parseados: <span className="text-ink">{mqDiag.gpsParsed ?? 0}</span>
                  </div>
                </dl>
              )}

              {telemetryStatus && <p className="text-xs text-ink-tertiary">{telemetryStatus}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TestingDesk(props: TestingDeskProps) {
  const [activeTab, setActiveTab] = useState<TabId>("platform");
  const [navCompact, setNavCompact] = useState(
    () => localStorage.getItem(LS_NAV_COMPACT) !== "0"
  );
  const prevTab = useRef<TabId>("platform");

  const activeNav = NAV.find((n) => n.id === activeTab)!;
  const isTelemetryWide = activeTab === "telemetry" && navCompact;

  const toggleNavCompact = useCallback(() => {
    setNavCompact((v) => {
      const next = !v;
      localStorage.setItem(LS_NAV_COMPACT, next ? "1" : "0");
      return next;
    });
  }, []);

  useEffect(() => {
    props.onActiveTabChange?.(activeTab);
  }, [activeTab, props.onActiveTabChange]);

  useEffect(() => {
    if (activeTab === "telemetry" && prevTab.current !== "telemetry") {
      setNavCompact(true);
      localStorage.setItem(LS_NAV_COMPACT, "1");
    }
    prevTab.current = activeTab;
  }, [activeTab]);

  const tabProps = {
    credentialsEnvelope: props.credentialsEnvelope,
    isConfigured: props.isConfigured,
    sandboxMode: props.credentials.sandboxMode,
    platform: props.platform,
    selectedVehicle: props.selectedVehicle,
    onHud: props.onHud,
  };

  return (
    <div className="flex min-h-0 flex-1">
      <SidebarNav
        activeTab={activeTab}
        onSelect={setActiveTab}
        compact={navCompact}
        onToggleCompact={toggleNavCompact}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex gap-1 overflow-x-auto border-b border-black/[0.06] p-2 md:hidden">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${
                activeTab === item.id
                  ? "bg-accent text-white"
                  : "bg-black/[0.04] text-ink-secondary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div
          className={`flex-1 overflow-y-auto ${
            isTelemetryWide ? "px-4 py-5 md:px-6" : "px-6 py-8 md:px-10"
          }`}
        >
          <div className={`mx-auto ${isTelemetryWide ? "max-w-none" : "max-w-2xl"}`}>
            {activeTab !== "telemetry" && activeTab !== "platform" && (
              <header className="mb-6">
                <p className="section-label">{activeNav.label}</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                  {activeNav.label}
                </h2>
                <p className="endpoint-badge mt-2">{activeNav.endpoint}</p>
              </header>
            )}

            {activeTab === "platform" && (
              <PlatformOverview
                platform={props.platform}
                sandboxMode={props.credentials.sandboxMode}
                selectedVehicleId={props.selectedVehicleId}
                onSelectVehicle={props.onSelectVehicle}
                onRediscover={props.onRediscover}
                discovering={props.discovering}
              />
            )}
            {activeTab === "vehicles" && <AddVehicleTab {...tabProps} />}
            {activeTab === "drivers" && <DispatchDriverTab {...tabProps} />}
            {activeTab === "acc" && <AccStatusTab {...tabProps} />}
            {activeTab === "stream" && <LiveStreamTab {...tabProps} />}
            {activeTab === "telemetry" && (
              <TelemetryPanel {...props} navCompact={navCompact} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
