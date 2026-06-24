/**
 * Punto de entrada del frontend.
 * Orquesta credenciales, descubrimiento de plataforma, telemetría WebSocket y mapa Leaflet.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePlatform } from "./hooks/usePlatform";
import { useCodeHud } from "./hooks/useCodeHud";
import { useTelemetryWs } from "./hooks/useTelemetryWs";
import { useLastLocations } from "./hooks/useLastLocations";
import { apiPost } from "./api/client";
import { ConnectScreen } from "./components/ConnectScreen";
import { SettingsModal } from "./components/SettingsModal";
import { CodeHudPanel } from "./components/CodeHudPanel";
import { TestingDesk } from "./components/TestingDesk";
import type { DeskTabId } from "./components/SidebarNav";
import { btnGhost } from "./components/ui/classes";
import type { DiscoveredVehicle, GpsMarker } from "./types";
import { serialInWatchList } from "./lib/serialMatch";
import { toVehicleRegistry } from "./lib/vehicleIdentity";

/** Selección inicial de vehículos para telemetría: activo → online → primero de la flota. */
function pickDefaultTelemetrySerials(
  vehicles: DiscoveredVehicle[] | undefined,
  selected: DiscoveredVehicle | null
): string[] {
  if (!vehicles?.length) return [];
  if (selected?.deviceSerial) return [selected.deviceSerial];
  const online = vehicles.filter((v) => v.online === "1").map((v) => v.deviceSerial);
  if (online.length) return online;
  return [vehicles[0].deviceSerial];
}

function filterBySerials<T>(record: Record<string, T>, serials: string[]): Record<string, T> {
  if (!serials.length) return {};
  return Object.fromEntries(
    Object.entries(record).filter(([s]) => serialInWatchList(s, serials))
  );
}

export default function App() {
  const { entries, pushEntry, clear } = useCodeHud();
  const onHud = useCallback(
    (label: string, debug?: Parameters<typeof pushEntry>[1]) => {
      pushEntry(label, debug);
    },
    [pushEntry]
  );

  const {
    credentials,
    setCredentials,
    credentialsEnvelope,
    isConfigured,
    platform,
    discovering,
    discoverError,
    discover,
    connectSandbox,
    disconnect,
    selectedVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
  } = usePlatform(onHud);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hudOpen, setHudOpen] = useState(true);
  const [telemetryRunning, setTelemetryRunning] = useState(false);
  const [telemetrySerials, setTelemetrySerials] = useState<string[]>([]);
  const telemetrySerialsTouched = useRef(false);

  useEffect(() => {
    if (!platform?.vehicles.length) {
      setTelemetrySerials([]);
      telemetrySerialsTouched.current = false;
      return;
    }
    setTelemetrySerials((prev) => {
      const fleet = new Set(platform.vehicles.map((v) => v.deviceSerial));
      const stillValid = prev.filter((s) => fleet.has(s));
      if (stillValid.length) return stillValid;
      telemetrySerialsTouched.current = false;
      return pickDefaultTelemetrySerials(platform.vehicles, selectedVehicle);
    });
  }, [platform, selectedVehicle?.deviceSerial]);

  const onTelemetrySerialsChange = useCallback((serials: string[]) => {
    telemetrySerialsTouched.current = true;
    setTelemetrySerials(serials);
  }, []);

  const {
    markers,
    trails,
    alarms,
    statusMessage,
    connected: telemetryWsConnected,
    gpsCount: telemetryGpsCount,
    mqDiag,
    clearTelemetry,
  } = useTelemetryWs({
    onHudEntry: (label, debug, extra) => pushEntry(label, debug, extra),
    ignoreSandbox: isConfigured && !credentials.sandboxMode,
    filterSerials: telemetrySerials,
  });

  const sandboxCleanupDone = useRef(false);

  useEffect(() => {
    if (!isConfigured || sandboxCleanupDone.current) return;
    sandboxCleanupDone.current = true;
    void apiPost("/api/telemetry/stop", credentialsEnvelope, { sandboxMode: true }).catch(
      () => undefined
    );
  }, [isConfigured, credentialsEnvelope]);

  useEffect(() => {
    if (!isConfigured || !credentials.connected || !credentials.sandboxMode) return;
    setCredentials({ sandboxMode: false });
    void apiPost("/api/telemetry/stop", credentialsEnvelope, { sandboxMode: true }).catch(
      () => undefined
    );
    clearTelemetry();
    setTelemetryRunning(false);
  }, [
    isConfigured,
    credentials.connected,
    credentials.sandboxMode,
    credentialsEnvelope,
    setCredentials,
    clearTelemetry,
  ]);

  const {
    lastLocationMarkers,
    loading: lastLocationLoading,
    status: lastLocationStatus,
    verdict: locationVerdict,
    fetchLocations,
  } = useLastLocations({
    credentialsEnvelope,
    deviceSerials: telemetrySerials,
    vehicleRegistry: platform ? toVehicleRegistry(platform.vehicles) : [],
    enabled:
      credentials.connected && !credentials.sandboxMode && telemetrySerials.length > 0,
    onHud,
  });

  const mapMarkers = useMemo(() => {
    const merged: Record<string, GpsMarker> = { ...lastLocationMarkers, ...markers };
    return filterBySerials(merged, telemetrySerials);
  }, [lastLocationMarkers, markers, telemetrySerials]);

  const mapTrails = useMemo(() => {
    const serials = new Set(Object.keys(mapMarkers));
    return Object.fromEntries(
      Object.entries(trails).filter(([serial]) => serials.has(serial))
    );
  }, [trails, mapMarkers]);

  const staleMapSerials = useMemo(
    () =>
      new Set(
        Object.keys(lastLocationMarkers).filter(
          (serial) =>
            serialInWatchList(serial, telemetrySerials) && !(serial in markers)
        )
      ),
    [lastLocationMarkers, markers, telemetrySerials]
  );

  const filteredAlarms = useMemo(
    () =>
      telemetrySerials.length
        ? alarms.filter((a) => serialInWatchList(a.deviceSerial, telemetrySerials))
        : alarms,
    [alarms, telemetrySerials]
  );

  const mapFocusSerial = telemetrySerials[0] ?? selectedVehicle?.deviceSerial;

  useEffect(() => {
    document.querySelectorAll('[id$="-wrap-popup-custom"]').forEach((el) => el.remove());
    document.querySelectorAll('[id$="-wrap-popup-custom-mask"]').forEach((el) => el.remove());
  }, []);

  const onActiveTabChange = useCallback((tab: DeskTabId) => {
    if (tab === "telemetry") setHudOpen(false);
  }, []);

  if (!credentials.connected) {
    return (
      <ConnectScreen
        credentials={credentials}
        onSave={setCredentials}
        onConnect={discover}
        onSandbox={connectSandbox}
        discovering={discovering}
        error={discoverError}
      />
    );
  }

  const subtitle = credentials.sandboxMode
    ? "Modo exploración"
    : platform
      ? `${platform.summary.vehicleCount} vehículo${platform.summary.vehicleCount !== 1 ? "s" : ""}`
      : "Conectado";

  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="app-header">
        <div>
          <h1 className="text-[15px] font-semibold tracking-tight text-ink">Fleet API Playground</h1>
          <p className="text-xs text-ink-secondary">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setHudOpen((v) => !v)}
            className={`${btnGhost} ${hudOpen ? "bg-black/[0.06] text-ink" : ""}`}
          >
            API {entries.length > 0 && `(${entries.length})`}
          </button>
          {!credentials.sandboxMode && (
            <button
              type="button"
              onClick={() => void discover()}
              disabled={discovering}
              className={btnGhost}
            >
              {discovering ? "…" : "Sincronizar"}
            </button>
          )}
          <button type="button" onClick={() => setSettingsOpen(true)} className={btnGhost}>
            Cuenta
          </button>
          <button type="button" onClick={disconnect} className={btnGhost}>
            Salir
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <TestingDesk
          credentials={credentials}
          credentialsEnvelope={credentialsEnvelope}
          isConfigured={isConfigured}
          platform={platform}
          selectedVehicle={selectedVehicle}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={setSelectedVehicleId}
          onRediscover={() => void discover()}
          discovering={discovering}
          onHud={onHud}
          markers={mapMarkers}
          staleMapSerials={staleMapSerials}
          trails={mapTrails}
          alarms={filteredAlarms}
          mqDiag={mqDiag}
          lastLocationStatus={lastLocationStatus}
          lastLocationLoading={lastLocationLoading}
          locationVerdict={locationVerdict}
          mapMarkerCount={Object.keys(mapMarkers).length}
          mapFocusSerial={mapFocusSerial}
          telemetrySerials={telemetrySerials}
          onTelemetrySerialsChange={onTelemetrySerialsChange}
          onFetchLastLocations={(refresh, waitSeconds) =>
            void fetchLocations(refresh, waitSeconds)
          }
          telemetryStatus={statusMessage}
          telemetryWsConnected={telemetryWsConnected}
          telemetryGpsCount={telemetryGpsCount}
          telemetryRunning={telemetryRunning}
          onTelemetryRunningChange={setTelemetryRunning}
          onClearTelemetry={clearTelemetry}
          onActiveTabChange={onActiveTabChange}
        />

        {hudOpen && (
          <aside className="hidden w-[min(420px,38vw)] shrink-0 border-l border-black/[0.06] bg-surface-raised lg:block">
            <CodeHudPanel entries={entries} onClear={clear} onClose={() => setHudOpen(false)} />
          </aside>
        )}
      </div>

      {hudOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setHudOpen(false)}>
          <aside
            className="absolute inset-y-0 right-0 w-full max-w-md bg-surface-raised shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <CodeHudPanel entries={entries} onClear={clear} onClose={() => setHudOpen(false)} />
          </aside>
        </div>
      )}

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        credentials={credentials}
        onSave={setCredentials}
        onReconnect={() => void discover()}
        discovering={discovering}
      />
    </div>
  );
}
