"use client";

import { useEffect, useState } from "react";
import { ModulePage } from "@/components/ModulePage";
import { fetchDevices } from "@/lib/devices";

type DeviceRow = {
  id?: string;
  deviceName?: string;
  deviceSerial?: string;
  deviceOnlineStatus?: number;
  healthStatus?: string;
  deviceCategory?: number;
  deviceSubCategory?: number;
  siteName?: string;
  deviceType?: string;
};

function DeviceBoard() {
  const [rows, setRows] = useState<DeviceRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setBusy(true);
    setErr("");
    try {
      const result = await fetchDevices(true);
      if (result.error) {
        setErr(result.error);
        setRows([]);
      } else {
        setRows(result.devices);
      }
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="neu" style={{ marginBottom: 18 }}>
      <h3>Tablero de salud</h3>
      <p className="desc">
        Se carga automáticamente desde <code>device/list</code>. Usa Recargar para actualizar
        online/offline y healthStatus; la API de informe de sitio fue eliminada en 2.15.500.
      </p>
      <div className="btn-row">
        <button className="btn primary" disabled={busy} onClick={load}>
          {busy ? "Cargando…" : "Recargar dispositivos"}
        </button>
      </div>
      {err && <pre className="result">{err}</pre>}
      <div className="grid cards" style={{ marginTop: 16 }}>
        {rows.map((d) => (
          <div key={d.id ?? d.deviceSerial} className="neu inset device-card">
            <div className="name">{d.deviceName || d.deviceSerial}</div>
            <div className="desc" style={{ marginBottom: 0 }}>
              {d.deviceSerial} · {d.deviceType} · {d.siteName}
            </div>
            <div className="meta">
              <span className={`chip ${d.deviceOnlineStatus === 1 ? "ok" : "bad"}`}>
                {d.deviceOnlineStatus === 1 ? "online" : d.deviceOnlineStatus === 0 ? "offline" : "unknown"}
              </span>
              <span className={`chip ${d.healthStatus === "fault" ? "bad" : "ok"}`}>
                salud: {d.healthStatus || "n/d"}
              </span>
              <span className="chip">cat {d.deviceCategory}/{d.deviceSubCategory}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Page() {
  return <ModulePage slug="dispositivos" extra={<DeviceBoard />} />;
}
