"use client";

import { useState } from "react";
import { loadSession, type SessionInfo } from "@/lib/client";
import { hppCall } from "@/lib/client";

export default function HomePage() {
  const [appKey, setAppKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [ping, setPing] = useState("");

  async function connect() {
    setBusy(true);
    setPing("");
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appKey, secretKey }),
      });
      const json = (await res.json()) as SessionInfo;
      setInfo(json);
      setSecretKey("");
      if (json.connected) {
        window.dispatchEvent(new Event("hpp-session"));
        const search = await hppCall({
          path: "/api/hpcgw/v1/site/search",
          body: { page: 0, pageSize: 5 },
        });
        setPing(JSON.stringify(search, null, 2));
      }
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/session", { method: "DELETE" });
    setInfo(await loadSession());
    setPing("");
    window.dispatchEvent(new Event("hpp-session"));
  }

  return (
    <>
      <header className="page-head">
        <h2>Conexión</h2>
        <p>
          Pega el API Key y Secret de Hik-Partner Pro. Se guardan solo en cookies httpOnly de este
          navegador; el servidor de Vercel no persiste nada. En otro dispositivo hay que volver a
          conectar.
        </p>
      </header>
      <div className="grid two">
        <section className="neu">
          <h3>Developer account</h3>
          <p className="desc">
            hik-partner.com → Site & Device → My Service → API Integration. El token dura ~7 días
            (LAP500004 = renovar).
          </p>
          <label className="label">
            appKey / ARC ID
            <input className="field" value={appKey} onChange={(e) => setAppKey(e.target.value)} autoComplete="off" />
          </label>
          <label className="label">
            secretKey / ARC Key
            <input
              className="field"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="btn-row">
            <button className="btn primary" disabled={busy} onClick={connect}>
              {busy ? "Obteniendo token…" : "Conectar"}
            </button>
            <button className="btn" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
          {info && (
            <p className="desc" style={{ marginTop: 14 }}>
              {info.connected ? (
                <>
                  Conectado · {info.appKeyMasked}
                  <br />
                  {info.areaDomain}
                  <br />
                  Caduca: {info.expireTime ? new Date(info.expireTime).toLocaleString() : "—"}
                </>
              ) : (
                <>
                  Falló: {info.errorCode} {info.message}
                </>
              )}
            </p>
          )}
        </section>
        <section className="neu">
          <h3>Ping site/search</h3>
          <p className="desc">Tras conectar se llama a la API de sitios para validar areaDomain.</p>
          <pre className="result">{ping || "Sin llamada todavía."}</pre>
        </section>
      </div>
    </>
  );
}
