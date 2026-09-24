"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMqMonitor } from "@/hooks/useMqMonitor";
import { fetchDevices } from "@/lib/devices";

type Device = {
  id?: string;
  deviceName?: string;
  deviceSerial?: string;
  deviceOnlineStatus?: number;
  healthStatus?: string;
  siteName?: string;
  deviceType?: string;
};

export default function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filter, setFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const monitor = useMqMonitor({ scope: "all", maxEvents: 200 });

  useEffect(() => {
    void refreshDevices();
  }, []);

  const latestEventId = monitor.events[0]?.id;
  useEffect(() => {
    if (latestEventId) void refreshDevices();
  }, [latestEventId]);

  async function refreshDevices() {
    setLoading(true);
    try {
      const result = await fetchDevices(true);
      if (!result.error) setDevices(result.devices);
    } finally {
      setLoading(false);
    }
  }

  const visibleEvents = useMemo(
    () => monitor.events.filter((item) => (
      (
        filter === "all" ||
        item.severity === filter ||
        (filter === "critical" && item.severity === "warning")
      ) &&
      (deviceFilter === "all" || item.serial === deviceFilter)
    )),
    [monitor.events, filter, deviceFilter],
  );
  const online = devices.filter((item) => item.deviceOnlineStatus === 1).length;
  const faults = devices.filter((item) => item.healthStatus === "fault").length;
  const critical = monitor.events.filter((item) => ["critical", "warning"].includes(item.severity)).length;

  return (
    <>
      <header className="page-head dashboard-head">
        <div>
          <span className="eyebrow">Centro operativo</span>
          <h2>Dashboard unificado</h2>
          <p>Estado de la instalación y eventos de todos los dispositivos en una sola vista.</p>
        </div>
        <div className="btn-row">
          <button className="btn" disabled={loading} onClick={() => void refreshDevices()}>
            {loading ? "Actualizando…" : "Actualizar estado"}
          </button>
          <button className="btn primary" disabled={monitor.running} onClick={() => void monitor.start()}>
            Iniciar monitoreo
          </button>
          <button className="btn danger" disabled={!monitor.running} onClick={() => void monitor.stop()}>
            Detener
          </button>
        </div>
      </header>

      <div className="dashboard-status">
        <span className={`live-dot ${monitor.running ? "active" : ""}`} />
        {monitor.status}
        <span className="dashboard-memory">Los eventos se conservan solo en esta pestaña.</span>
      </div>

      <section className="metric-grid">
        <article className="neu metric">
          <span>Dispositivos</span>
          <strong>{devices.length}</strong>
          <small>{online} en línea</small>
        </article>
        <article className="neu metric">
          <span>Salud</span>
          <strong className={faults ? "text-danger" : "text-ok"}>{faults}</strong>
          <small>con falla reportada</small>
        </article>
        <article className="neu metric">
          <span>Eventos</span>
          <strong>{monitor.events.length}</strong>
          <small>en esta sesión</small>
        </article>
        <article className="neu metric">
          <span>Críticos</span>
          <strong className={critical ? "text-danger" : ""}>{critical}</strong>
          <small>requieren revisión</small>
        </article>
      </section>

      <div className="dashboard-layout">
        <section className="neu event-console">
          <div className="section-title">
            <div>
              <h3>Actividad en vivo</h3>
              <p className="desc">MQ long-poll unifica alarmas, fallas y cambios de estado.</p>
            </div>
            <div className="event-filters">
              {[
                ["all", "Todos"],
                ["critical", "Críticos"],
                ["ok", "Recuperación"],
                ["info", "Otros"],
              ].map(([value, label]) => (
                <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="event-device-filter">
            <span>Mostrar eventos de</span>
            <select className="field" value={deviceFilter} onChange={(event) => setDeviceFilter(event.target.value)}>
              <option value="all">Todos los dispositivos</option>
              {devices.map((device) => (
                <option key={device.id ?? device.deviceSerial} value={device.deviceSerial}>
                  {device.deviceName ?? device.deviceSerial} · {device.deviceSerial}
                </option>
              ))}
            </select>
          </label>
          <div className="event-list">
            {!visibleEvents.length && (
              <div className="empty-state">
                <strong>Sin actividad</strong>
                <span>
              {monitor.events.length
                    ? "No hay eventos que coincidan con los filtros actuales."
                    : "Inicia el monitoreo para recibir eventos de todos los dispositivos."}
                </span>
              </div>
            )}
            {visibleEvents.map((item) => (
              <details className={`event-row ${item.severity}`} key={item.id}>
                <summary>
                  <span className="event-icon">{item.severity === "critical" ? "!" : "•"}</span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.serial} · {item.format}</small>
                  </span>
                  <time>{new Date(item.receivedAt).toLocaleTimeString()}</time>
                </summary>
                <pre className="result">
                  {typeof item.data === "string" ? item.data : JSON.stringify(item.data, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </section>

        <aside className="dashboard-side">
          <section className="neu">
            <div className="section-title">
              <h3>Dispositivos</h3>
              <Link href="/dispositivos">Administrar</Link>
            </div>
            <div className="compact-devices">
              {!devices.length && <p className="desc">Pulsa “Actualizar estado” para cargar el inventario.</p>}
              {devices.slice(0, 12).map((device) => (
                <div key={device.id ?? device.deviceSerial}>
                  <span className={`device-dot ${device.deviceOnlineStatus === 1 ? "online" : "offline"}`} />
                  <span>
                    <strong>{device.deviceName ?? device.deviceSerial}</strong>
                    <small>{device.siteName ?? "Sin sitio"} · {device.healthStatus ?? "salud n/d"}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>
          <section className="neu quick-links">
            <h3>Acciones rápidas</h3>
            <Link href="/demo">Abrir demo Torre de control</Link>
            <Link href="/alarmas">Defensa y fotos de alarma</Link>
            <Link href="/audio">Emitir audio o TTS</Link>
            <Link href="/sitios">Gestionar sitios</Link>
            <Link href="/ayuda">Cómo funciona el lab</Link>
          </section>
        </aside>
      </div>
    </>
  );
}
