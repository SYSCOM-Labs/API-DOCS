import { useCallback, useState } from "react";
import { usePlatform } from "./hooks/usePlatform";
import { useCodeHud } from "./hooks/useCodeHud";
import { ConnectScreen } from "./components/ConnectScreen";
import { SettingsModal } from "./components/SettingsModal";
import { CodeHudPanel } from "./components/CodeHudPanel";
import { SidebarNav } from "./components/SidebarNav";
import { DashboardTab } from "./components/tabs/DashboardTab";
import { PlatformTab } from "./components/tabs/PlatformTab";
import { PersonsTab } from "./components/tabs/PersonsTab";
import { AccessTab } from "./components/tabs/AccessTab";
import { DoorsTab } from "./components/tabs/DoorsTab";
import { RecordsTab } from "./components/tabs/RecordsTab";
import { TimecardTab } from "./components/tabs/TimecardTab";
import { EventsTab } from "./components/tabs/EventsTab";
import { btnGhost } from "./components/ui/classes";
import type { DeskTabId } from "./types";

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
    platform,
    discovering,
    discoverError,
    discover,
    connectSandbox,
    disconnect,
  } = usePlatform(onHud);

  const [tab, setTab] = useState<DeskTabId>("dashboard");
  const [hudOpen, setHudOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  return (
    <div className="flex h-screen flex-col bg-surface">
      <header className="app-header">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-tertiary">
            SYSCOM · Hik-Connect Teams
          </p>
          <h1 className="text-base font-semibold text-ink">Tiempo y Asistencia</h1>
        </div>
        <div className="flex items-center gap-2">
          {credentials.sandboxMode && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
              Sandbox
            </span>
          )}
          <button type="button" className={btnGhost} onClick={() => setHudOpen((v) => !v)}>
            Inspector API
          </button>
          <button type="button" className={btnGhost} onClick={() => setSettingsOpen(true)}>
            Configuración
          </button>
          <button type="button" className={btnGhost} onClick={disconnect}>
            Desconectar
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <SidebarNav active={tab} onSelect={setTab} />
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          {tab === "dashboard" && (
            <DashboardTab
              credentialsEnvelope={credentialsEnvelope}
              sandboxMode={credentials.sandboxMode}
              platform={platform}
              onHud={onHud}
            />
          )}
          {tab === "platform" && <PlatformTab platform={platform} />}
          {tab === "persons" && (
            <PersonsTab
              credentialsEnvelope={credentialsEnvelope}
              sandboxMode={credentials.sandboxMode}
              platform={platform}
              onHud={onHud}
            />
          )}
          {tab === "access" && (
            <AccessTab
              credentialsEnvelope={credentialsEnvelope}
              sandboxMode={credentials.sandboxMode}
              platform={platform}
              onHud={onHud}
            />
          )}
          {tab === "doors" && (
            <DoorsTab
              credentialsEnvelope={credentialsEnvelope}
              sandboxMode={credentials.sandboxMode}
              platform={platform}
              onHud={onHud}
            />
          )}
          {tab === "records" && (
            <RecordsTab
              credentialsEnvelope={credentialsEnvelope}
              sandboxMode={credentials.sandboxMode}
              onHud={onHud}
            />
          )}
          {tab === "timecard" && (
            <TimecardTab
              credentialsEnvelope={credentialsEnvelope}
              sandboxMode={credentials.sandboxMode}
              platform={platform}
              onHud={onHud}
            />
          )}
          {tab === "events" && (
            <EventsTab
              credentialsEnvelope={credentialsEnvelope}
              sandboxMode={credentials.sandboxMode}
              connected={credentials.connected}
              onHud={onHud}
            />
          )}
        </main>
        {hudOpen && (
          <CodeHudPanel entries={entries} onClear={clear} onClose={() => setHudOpen(false)} />
        )}
      </div>

      <SettingsModal
        open={settingsOpen}
        credentials={credentials}
        onSave={setCredentials}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
