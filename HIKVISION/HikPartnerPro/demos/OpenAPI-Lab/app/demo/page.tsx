"use client";

import { useMemo, useState } from "react";
import { useMqMonitor } from "@/hooks/useMqMonitor";
import { hppCall } from "@/lib/client";
import { categoryLabel, useDevices, type HppDevice } from "@/lib/devices";
import { extractIsapiFilePaths, type EventSeverity, type HppEvent } from "@/lib/events";
import { useSites } from "@/lib/sites";

type SiteSummary = {
  key: string;
  name: string;
  devices: HppDevice[];
  online: number;
  offline: number;
  unknown: number;
  faults: number;
  events: number;
  criticalEvents: number;
  score: number;
};

const severityLabels: Record<"all" | EventSeverity, string> = {
  all: "Todos",
  critical: "Críticos",
  warning: "Advertencias",
  ok: "Recuperación",
  info: "Informativos",
};

function siteKey(device: HppDevice) {
  return device.siteID || device.siteName || "__unassigned";
}

function healthLabel(device: HppDevice) {
  if (device.healthStatus === "fault") return "Falla";
  if (device.deviceOnlineStatus === 0) return "Desconectado";
  if (device.deviceOnlineStatus === 1) return "Operativo";
  return "Estado desconocido";
}

function download(name: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ControlTowerPage() {
  const { devices, error: deviceError, loading: devicesLoading, reload: reloadDevices } = useDevices();
  const { sites, error: siteError, loading: sitesLoading, reload: reloadSites } = useSites();
  const [selectedSite, setSelectedSite] = useState("all");
  const [deviceSearch, setDeviceSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<"all" | EventSeverity>("all");
  const [selectedEvent, setSelectedEvent] = useState<HppEvent | null>(null);
  const [pictureResults, setPictureResults] = useState<Record<string, { url?: string; encrypt?: boolean; error?: string }>>({});
  const [pictureLoading, setPictureLoading] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const siteOptions = useMemo(() => {
    const values = new Map<string, string>();
    sites.forEach((site) => {
      const key = site.id ?? site.name ?? site.siteName;
      if (key) values.set(key, site.name ?? site.siteName ?? key);
    });
    devices.forEach((device) => {
      const key = siteKey(device);
      if (!values.has(key)) values.set(key, device.siteName ?? (key === "__unassigned" ? "Sin sitio" : key));
    });
    return [...values.entries()].map(([key, name]) => ({ key, name }));
  }, [devices, sites]);

  const devicesInScope = useMemo(
    () => selectedSite === "all" ? devices : devices.filter((device) => siteKey(device) === selectedSite),
    [devices, selectedSite],
  );
  const serialsInScope = useMemo(
    () => devicesInScope.map((device) => device.deviceSerial).filter((serial): serial is string => Boolean(serial)),
    [devicesInScope],
  );
  const monitor = useMqMonitor({
    scope: selectedSite === "all" ? "all" : "list",
    serials: serialsInScope,
    maxEvents: 500,
  });

  const deviceBySerial = useMemo(
    () => new Map(devices.map((device) => [device.deviceSerial, device])),
    [devices],
  );

  const summaries = useMemo<SiteSummary[]>(() => {
    return siteOptions.map((site) => {
      const rows = devices.filter((device) => siteKey(device) === site.key);
      const serialSet = new Set(rows.map((device) => device.deviceSerial));
      const relatedEvents = monitor.events.filter((event) => serialSet.has(event.serial));
      const online = rows.filter((device) => device.deviceOnlineStatus === 1).length;
      const offline = rows.filter((device) => device.deviceOnlineStatus === 0).length;
      const unknown = rows.length - online - offline;
      const faults = rows.filter((device) => device.healthStatus === "fault").length;
      const criticalEvents = relatedEvents.filter((event) => ["critical", "warning"].includes(event.severity)).length;
      const score = rows.length ? Math.round((online / rows.length) * 100) : 0;
      return {
        key: site.key,
        name: site.name,
        devices: rows,
        online,
        offline,
        unknown,
        faults,
        events: relatedEvents.length,
        criticalEvents,
        score,
      };
    }).sort((a, b) => {
      const riskA = a.offline * 10 + a.faults * 20 + a.criticalEvents * 3;
      const riskB = b.offline * 10 + b.faults * 20 + b.criticalEvents * 3;
      return riskB - riskA || a.name.localeCompare(b.name);
    });
  }, [devices, monitor.events, siteOptions]);

  const scopedEvents = useMemo(() => {
    const serialSet = new Set(serialsInScope);
    return monitor.events.filter((event) => (
      (selectedSite === "all" || serialSet.has(event.serial)) &&
      (eventFilter === "all" || event.severity === eventFilter)
    ));
  }, [eventFilter, monitor.events, selectedSite, serialsInScope]);

  const visibleDevices = useMemo(() => {
    const term = deviceSearch.trim().toLowerCase();
    if (!term) return devicesInScope;
    return devicesInScope.filter((device) =>
      [device.deviceName, device.deviceSerial, device.deviceType, device.siteName]
        .some((value) => value?.toLowerCase().includes(term)),
    );
  }, [deviceSearch, devicesInScope]);

  const online = devicesInScope.filter((device) => device.deviceOnlineStatus === 1).length;
  const offline = devicesInScope.filter((device) => device.deviceOnlineStatus === 0).length;
  const faults = devicesInScope.filter((device) => device.healthStatus === "fault").length;
  const operational = devicesInScope.length ? Math.round((online / devicesInScope.length) * 100) : 0;
  const sitesAtRisk = summaries.filter((site) => site.offline || site.faults || site.criticalEvents).length;

  async function refresh() {
    setRefreshing(true);
    await Promise.all([reloadDevices(), reloadSites()]);
    setRefreshing(false);
  }

  function exportJson() {
    const report = {
      generatedAt: new Date().toISOString(),
      scope: selectedSite,
      summary: { total: devicesInScope.length, online, offline, faults, operational },
      devices: devicesInScope,
      events: scopedEvents,
    };
    download(`hpp-control-tower-${Date.now()}.json`, JSON.stringify(report, null, 2), "application/json");
  }

  function exportCsv() {
    const headers = [
      "tipoRegistro", "sitio", "nombre", "serial", "modelo", "onlineStatus", "healthStatus",
      "evento", "severidad", "fecha",
    ];
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
    const deviceRows = devicesInScope.map((device) => [
      "dispositivo", device.siteName, device.deviceName, device.deviceSerial, device.deviceType,
      device.deviceOnlineStatus, device.healthStatus, "", "", "",
    ]);
    const eventRows = scopedEvents.map((event) => {
      const device = deviceBySerial.get(event.serial);
      return [
        "evento", device?.siteName, device?.deviceName, event.serial, device?.deviceType,
        device?.deviceOnlineStatus, device?.healthStatus, event.type, event.severity, event.receivedAt,
      ];
    });
    download(
      `hpp-torre-control-${Date.now()}.csv`,
      [headers, ...deviceRows, ...eventRows].map((row) => row.map(escape).join(",")).join("\n"),
      "text/csv;charset=utf-8",
    );
  }

  async function resolvePicture(filePath: string) {
    setPictureLoading(filePath);
    const response = await hppCall({
      path: "/api/hpcgw/v1/alarm/pictureurl",
      body: { filePath },
    });
    const result = response.result as {
      errorCode?: string;
      message?: string;
      data?: { pictureUrl?: string; encrypt?: boolean };
    } | undefined;
    setPictureResults((previous) => ({
      ...previous,
      [filePath]: result?.errorCode === "0"
        ? { url: result.data?.pictureUrl, encrypt: result.data?.encrypt }
        : { error: result?.message ?? result?.errorCode ?? response.message ?? "No se pudo resolver la imagen" },
    }));
    setPictureLoading("");
  }

  const dataLoading = devicesLoading || sitesLoading || refreshing;
  const scopeName = selectedSite === "all"
    ? "Todas las instalaciones"
    : siteOptions.find((site) => site.key === selectedSite)?.name ?? selectedSite;

  return (
    <>
      <header className="page-head tower-head">
        <div>
          <span className="eyebrow">Demo práctica para integradores</span>
          <h2>Torre de control</h2>
          <p>Supervisa disponibilidad, salud y eventos por instalación sin ejecutar acciones destructivas.</p>
        </div>
        <div className="btn-row">
          <button className="btn" disabled={dataLoading} onClick={() => void refresh()}>
            {dataLoading ? "Actualizando…" : "Actualizar inventario"}
          </button>
          <button
            className="btn primary"
            disabled={monitor.running || !devicesInScope.length}
            onClick={() => void monitor.start()}
          >
            Iniciar monitoreo
          </button>
          <button className="btn danger" disabled={!monitor.running} onClick={() => void monitor.stop()}>
            Detener
          </button>
        </div>
      </header>

      <section className="neu tower-scope">
        <label className="label">
          Instalación supervisada
          <select
            className="field"
            value={selectedSite}
            disabled={monitor.running}
            onChange={(event) => {
              setSelectedSite(event.target.value);
              monitor.clear();
              setSelectedEvent(null);
            }}
          >
            <option value="all">Todas las instalaciones</option>
            {siteOptions.map((site) => <option key={site.key} value={site.key}>{site.name}</option>)}
          </select>
        </label>
        <div className="tower-monitor-status">
          <span className={`live-dot ${monitor.running ? "active" : ""}`} />
          <span>
            <strong>{scopeName}</strong>
            <small>{monitor.status}</small>
          </span>
        </div>
        <div className="tower-export">
          <button className="btn" disabled={!devicesInScope.length} onClick={exportCsv}>Exportar CSV</button>
          <button className="btn" disabled={!devicesInScope.length} onClick={exportJson}>Exportar JSON</button>
        </div>
      </section>

      {(deviceError || siteError) && (
        <div className="note error">{deviceError || siteError}</div>
      )}

      <section className="metric-grid tower-metrics">
        <article className="neu metric">
          <span>Disponibilidad</span>
          <strong className={devicesInScope.length ? (operational < 80 ? "text-danger" : "text-ok") : ""}>
            {devicesInScope.length ? `${operational}%` : "—"}
          </strong>
          <small>{online} de {devicesInScope.length} en línea</small>
        </article>
        <article className="neu metric">
          <span>Desconectados</span>
          <strong className={offline ? "text-danger" : ""}>{offline}</strong>
          <small>requieren revisión</small>
        </article>
        <article className="neu metric">
          <span>Fallas de salud</span>
          <strong className={faults ? "text-danger" : ""}>{faults}</strong>
          <small>healthStatus=fault</small>
        </article>
        <article className="neu metric">
          <span>Sitios con riesgo</span>
          <strong className={sitesAtRisk ? "text-danger" : ""}>{sitesAtRisk}</strong>
          <small>de {summaries.length} instalaciones</small>
        </article>
      </section>

      <div className="tower-layout">
        <section className="neu tower-sites">
          <div className="section-title">
            <div>
              <h3>Prioridad de atención</h3>
              <p className="desc">Ordenada por equipos offline, fallas y eventos críticos de esta sesión.</p>
            </div>
            <span className="chip">{summaries.length} sitio(s)</span>
          </div>
          <div className="site-health-list">
            {!summaries.length && <div className="empty-state">No hay sitios en la cuenta.</div>}
            {summaries.map((site) => (
              <button
                key={site.key}
                className={selectedSite === site.key ? "active" : ""}
                disabled={monitor.running}
                onClick={() => setSelectedSite(site.key)}
              >
                <span className={`health-score ${site.score < 80 ? "bad" : site.score < 100 ? "warn" : "ok"}`}>
                  {site.score}%
                </span>
                <span>
                  <strong>{site.name}</strong>
                  <small>{site.devices.length} equipos · {site.offline} offline · {site.faults} fallas</small>
                </span>
                <span className="site-alert-count">{site.criticalEvents || "—"}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="neu tower-events">
          <div className="section-title">
            <div>
              <h3>Eventos en vivo</h3>
              <p className="desc">Actividad confirmada con ACK; solo se conserva en esta pestaña.</p>
            </div>
            <button className="btn" disabled={!monitor.events.length} onClick={monitor.clear}>
              Limpiar ({monitor.events.length})
            </button>
          </div>
          <div className="event-filters tower-event-filters">
            {(Object.keys(severityLabels) as Array<"all" | EventSeverity>).map((severity) => (
              <button
                key={severity}
                className={eventFilter === severity ? "active" : ""}
                onClick={() => setEventFilter(severity)}
              >
                {severityLabels[severity]}
              </button>
            ))}
          </div>
          <div className="event-list tower-event-list">
            {!scopedEvents.length && (
              <div className="empty-state">
                <strong>{monitor.running ? "Esperando actividad" : "Monitor detenido"}</strong>
                <span>
                  {monitor.events.length
                    ? "No hay eventos que coincidan con el sitio o severidad."
                    : "Inicia el monitoreo para construir la línea temporal."}
                </span>
              </div>
            )}
            {scopedEvents.map((event) => {
              const device = deviceBySerial.get(event.serial);
              return (
                <button
                  className={`tower-event ${event.severity}`}
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setPictureResults({});
                  }}
                >
                  <span className="event-icon">{event.severity === "critical" ? "!" : "•"}</span>
                  <span>
                    <strong>{event.label}</strong>
                    <small>
                      {device?.deviceName ?? event.serial} · {device?.siteName ?? "Sitio n/d"}
                    </small>
                  </span>
                  <time>{new Date(event.receivedAt).toLocaleTimeString()}</time>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <section className="neu tower-inventory">
        <div className="section-title">
          <div>
            <h3>Inventario en alcance</h3>
            <p className="desc">Equipos incluidos en las métricas y en la suscripción seleccionada.</p>
          </div>
          <input
            className="field"
            placeholder="Buscar nombre, serial o modelo"
            value={deviceSearch}
            onChange={(event) => setDeviceSearch(event.target.value)}
          />
        </div>
        <div className="tower-device-grid">
          {!visibleDevices.length && <div className="empty-state">No hay dispositivos que coincidan.</div>}
          {visibleDevices.map((device) => (
            <article className="tower-device" key={device.id ?? device.deviceSerial}>
              <span className={`device-dot ${device.deviceOnlineStatus === 1 ? "online" : "offline"}`} />
              <span>
                <strong>{device.deviceName ?? device.deviceSerial}</strong>
                <small>{device.deviceSerial} · {device.deviceType ?? "modelo n/d"}</small>
              </span>
              <span className={`chip ${device.deviceOnlineStatus === 1 && device.healthStatus !== "fault" ? "ok" : "bad"}`}>
                {healthLabel(device)}
              </span>
              <small className="tower-device-category">{categoryLabel(device)}</small>
            </article>
          ))}
        </div>
      </section>

      {selectedEvent && (() => {
        const device = deviceBySerial.get(selectedEvent.serial);
        const filePaths = extractIsapiFilePaths(selectedEvent.data);
        return (
          <div className="incident-backdrop" role="presentation" onMouseDown={() => setSelectedEvent(null)}>
            <aside
              className="tower-incident"
              role="dialog"
              aria-modal="true"
              aria-label={`Incidente ${selectedEvent.label}`}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header>
                <div>
                  <span className={`chip ${selectedEvent.severity === "ok" ? "ok" : selectedEvent.severity === "info" ? "" : "bad"}`}>
                    {severityLabels[selectedEvent.severity]}
                  </span>
                  <h3>{selectedEvent.label}</h3>
                  <p className="desc">
                    {device?.deviceName ?? selectedEvent.serial} · {device?.siteName ?? "Sitio n/d"}
                  </p>
                </div>
                <button className="btn" onClick={() => setSelectedEvent(null)}>Cerrar</button>
              </header>

              <dl className="incident-facts">
                <div><dt>Serial</dt><dd>{selectedEvent.serial}</dd></div>
                <div><dt>Formato</dt><dd>{selectedEvent.format}</dd></div>
                <div><dt>Recibido</dt><dd>{new Date(selectedEvent.receivedAt).toLocaleString()}</dd></div>
                <div><dt>Modelo</dt><dd>{device?.deviceType ?? "n/d"}</dd></div>
              </dl>

              {filePaths.length > 0 && (
                <section className="incident-pictures">
                  <h4>Evidencia adjunta</h4>
                  {filePaths.map((filePath) => {
                    const picture = pictureResults[filePath];
                    return (
                      <div key={filePath} className="incident-picture">
                        <code>{filePath}</code>
                        {!picture && (
                          <button
                            className="btn primary"
                            disabled={pictureLoading === filePath}
                            onClick={() => void resolvePicture(filePath)}
                          >
                            {pictureLoading === filePath ? "Resolviendo…" : "Obtener imagen"}
                          </button>
                        )}
                        {picture?.error && <span className="text-danger">{picture.error}</span>}
                        {picture?.url && (
                          <>
                            {picture.encrypt
                              ? <div className="note">La imagen está cifrada; la URL se obtuvo, pero requiere descifrado según la guía HPP.</div>
                              : <img src={picture.url} alt={`Evidencia de ${selectedEvent.label}`} />}
                            <a className="btn" href={picture.url} target="_blank" rel="noreferrer">Abrir URL temporal</a>
                          </>
                        )}
                      </div>
                    );
                  })}
                </section>
              )}

              <details className="incident-payload" open={!filePaths.length}>
                <summary>Payload técnico</summary>
                <pre className="result">
                  {typeof selectedEvent.data === "string"
                    ? selectedEvent.data
                    : JSON.stringify(selectedEvent.data, null, 2)}
                </pre>
              </details>
            </aside>
          </div>
        );
      })()}
    </>
  );
}
