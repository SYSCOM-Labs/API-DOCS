"use client";

import { useEffect, useRef, useState } from "react";
import { ModulePage } from "@/components/ModulePage";
import { hppCall, hppUpload } from "@/lib/client";

function HotSpareExtras() {
  const [uuid, setUuid] = useState("");
  const [auto, setAuto] = useState(false);
  const [log, setLog] = useState("Heartbeat parado");
  const [fileOut, setFileOut] = useState("");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  function start() {
    if (!uuid) return;
    setAuto(true);
    const beat = async () => {
      const res = await hppCall({ path: "/api/hpcgw/v1/hotspare/heartbeat", body: { uuid } });
      setLog(`${new Date().toLocaleTimeString()} ${JSON.stringify(res.result)}`);
    };
    void beat();
    timer.current = window.setInterval(() => void beat(), 60_000);
  }

  function stop() {
    setAuto(false);
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
    setLog("Heartbeat parado");
  }

  return (
    <>
      <section className="neu" style={{ marginBottom: 18 }}>
        <h3>Heartbeat automático (cliente)</h3>
        <p className="desc">Cada 60 s llama a hotspare/heartbeat. No hay proceso en servidor.</p>
        <label className="label">
          UUID
          <input className="field" value={uuid} onChange={(e) => setUuid(e.target.value)} />
        </label>
        <div className="btn-row">
          <button className="btn primary" disabled={auto} onClick={start}>
            Iniciar
          </button>
          <button className="btn" onClick={stop}>
            Parar
          </button>
          <span className="chip">{auto ? "activo" : "idle"}</span>
        </div>
        <pre className="result">{log}</pre>
      </section>
      <section className="neu" style={{ marginBottom: 18 }}>
        <h3>Subir archivo backup (≤ 2 MB)</h3>
        <label className="label">
          file
          <input
            className="field"
            type="file"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const form = new FormData();
              form.set("path", "/api/hpcgw/v1/hotspare/file/upload");
              form.set("file", file);
              const res = await hppUpload(form);
              setFileOut(JSON.stringify(res, null, 2));
            }}
          />
        </label>
        {fileOut && <pre className="result">{fileOut}</pre>}
      </section>
    </>
  );
}

export default function Page() {
  return <ModulePage slug="hotspare" extra={<HotSpareExtras />} />;
}
