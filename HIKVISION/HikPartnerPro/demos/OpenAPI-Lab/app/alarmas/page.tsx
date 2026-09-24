"use client";

import { useState } from "react";
import { DevicePicker } from "@/components/DevicePicker";
import { ModulePage } from "@/components/ModulePage";
import { useMqMonitor } from "@/hooks/useMqMonitor";
import { hppCall } from "@/lib/client";

function AlarmWall() {
  const [picturePath, setPicturePath] = useState("");
  const [pictureOut, setPictureOut] = useState("");
  const [scope, setScope] = useState<"all" | "list">("all");
  const [selectedSerials, setSelectedSerials] = useState<string[]>([]);
  const monitor = useMqMonitor({ scope, serials: selectedSerials, maxEvents: 80 });

  return (
    <>
      <section className="neu" style={{ marginBottom: 18 }}>
        <div className="section-title">
          <div>
            <h3>Muro de alarmas</h3>
            <p className="desc">
              Elige si HPP debe enviar eventos de toda la cuenta o solo de equipos concretos.
            </p>
          </div>
          <span className={`chip ${monitor.running ? "ok" : ""}`}>{monitor.running ? "escuchando" : "detenido"}</span>
        </div>
        <div className="scope-picker">
          <button
            className={scope === "all" ? "active" : ""}
            disabled={monitor.running}
            onClick={() => {
              setScope("all");
              monitor.clear();
            }}
          >
            <strong>Todos los dispositivos</strong>
            <span>Recomendado para el centro de monitoreo</span>
          </button>
          <button
            className={scope === "list" ? "active" : ""}
            disabled={monitor.running}
            onClick={() => {
              setScope("list");
              monitor.clear();
            }}
          >
            <strong>Elegir dispositivos</strong>
            <span>Pruebas dirigidas o investigación puntual</span>
          </button>
        </div>
        {scope === "list" && (
          <DevicePicker
            selected={selectedSerials}
            onChange={setSelectedSerials}
            hint="La suscripción se limitará a estos seriales. Puedes elegir uno o varios."
          />
        )}
        <p className="desc">
          Alcance actual: <strong>{scope === "all" ? "todos los dispositivos" : `${selectedSerials.length} seleccionado(s)`}</strong>.
          Long-poll desde este navegador; caché de plataforma ~2 h.
        </p>
        <div className="btn-row">
          <button
            className="btn primary"
            disabled={monitor.running || (scope === "list" && !selectedSerials.length)}
            onClick={() => void monitor.start()}
          >
            Iniciar muro
          </button>
          <button className="btn danger" disabled={!monitor.running} onClick={() => void monitor.stop()}>
            Detener
          </button>
          <button className="btn" disabled={!monitor.events.length} onClick={monitor.clear}>
            Limpiar ({monitor.events.length})
          </button>
          <span className="chip">{monitor.status}</span>
        </div>
        <div className="alarm-wall" style={{ marginTop: 14 }}>
          {monitor.events.length === 0 && <div className="note">Aún no hay eventos en esta pestaña.</div>}
          {monitor.events.map((item) => (
            <article key={item.id} className="alarm">
              <header>
                <span className="type">{item.label}</span>
                <span>{new Date(item.receivedAt).toLocaleTimeString()}</span>
              </header>
              <div className="serial">
                {item.serial} · {item.format}
              </div>
              <pre className="result">
                {typeof item.data === "string" ? item.data : JSON.stringify(item.data, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      </section>
      <section className="neu" style={{ marginBottom: 18 }}>
        <h3>Resolver foto ISAPI_FILES</h3>
        <p className="desc">
          Úsalo cuando el payload de una alarma contenga un <code>filePath</code> que empiece por
          ISAPI_FILES. HPP devolverá una URL temporal para visualizar o descargar la imagen.
        </p>
        <label className="label">
          filePath
          <textarea className="field" value={picturePath} onChange={(e) => setPicturePath(e.target.value)} />
        </label>
        <div className="btn-row">
          <button
            className="btn primary"
            onClick={async () => {
              const res = await hppCall({
                path: "/api/hpcgw/v1/alarm/pictureurl",
                body: { filePath: picturePath },
              });
              setPictureOut(JSON.stringify(res, null, 2));
            }}
          >
            Obtener URL
          </button>
        </div>
        {pictureOut && <pre className="result">{pictureOut}</pre>}
      </section>
    </>
  );
}

export default function Page() {
  return <ModulePage slug="alarmas" extra={<AlarmWall />} />;
}
