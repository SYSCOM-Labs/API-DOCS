"use client";

import { useState } from "react";
import { SerialField } from "@/components/DevicePicker";
import { ISAPI_TEMPLATES, OTAP_TEMPLATES } from "@/lib/catalog";
import { hppCall } from "@/lib/client";

export default function TransparentePage() {
  const [serial, setSerial] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userlevel, setUserlevel] = useState("0");
  const [method, setMethod] = useState("GET");
  const [uri, setUri] = useState("/ISAPI/System/deviceInfo");
  const [mode, setMode] = useState<"isapi" | "otap">("isapi");
  const [body, setBody] = useState("");
  const [contentType, setContentType] = useState("application/xml");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);

  function applyIsapi(t: (typeof ISAPI_TEMPLATES)[number]) {
    setMode("isapi");
    setMethod(t.method);
    setUri(t.uri);
    setBody(t.body);
    setContentType(t.contentType);
  }

  function applyOtap(t: (typeof OTAP_TEMPLATES)[number]) {
    setMode("otap");
    setMethod(t.method);
    setUri(t.uri);
    setBody(t.body);
    setContentType("application/json");
  }

  async function send() {
    setBusy(true);
    const prefix =
      mode === "isapi" ? "/api/hpcgw/v1/device/transparent" : "/api/hpcgw/v2/device/transparent";
    const path = `${prefix}${uri.startsWith("/") ? uri : `/${uri}`}`;
    const headers: Record<string, string> = { "X-Devserial": serial };
    if (username) headers["X-Username"] = username;
    if (password) headers["X-Password"] = password;
    if (userlevel) headers["X-Userlevel"] = userlevel;
    const res = await hppCall({
      method,
      path,
      body: method === "GET" || method === "DELETE" ? undefined : body,
      headers,
      contentType,
    });
    setOut(typeof res.result === "string" ? res.result : JSON.stringify(res, null, 2));
    setBusy(false);
  }

  return (
    <>
      <header className="page-head">
        <h2>ISAPI / OTAP transparente</h2>
        <p>
          Cabeceras X-Devserial, X-Username, X-Password, X-Userlevel (0 installer, 1 admin). Plantillas del
          apéndice A.5 y OTAP v2.
        </p>
      </header>
      <section className="neu" style={{ marginBottom: 18 }}>
        <h3>Consola</h3>
        <label className="label">
          Serial (X-Devserial)
          <SerialField value={serial} onChange={setSerial} />
        </label>
        <div className="grid two">
          <label className="label">
            X-Username
            <input className="field" value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="label">
            X-Password
            <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        </div>
        <label className="label">
          X-Userlevel
          <select className="field" value={userlevel} onChange={(e) => setUserlevel(e.target.value)}>
            <option value="0">0 · Instalador</option>
            <option value="1">1 · Administrador del dispositivo</option>
          </select>
        </label>
        <div className="grid two">
          <label className="label">
            Método
            <select className="field" value={method} onChange={(e) => setMethod(e.target.value)}>
              {["GET", "POST", "PUT", "DELETE"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="label">
            Protocolo
            <select className="field" value={mode} onChange={(e) => setMode(e.target.value as "isapi" | "otap")}>
              <option value="isapi">ISAPI v1</option>
              <option value="otap">OTAP v2</option>
            </select>
          </label>
        </div>
        <label className="label">
          URI
          <input className="field" value={uri} onChange={(e) => setUri(e.target.value)} />
        </label>
        <label className="label">
          Content-Type
          <input className="field" value={contentType} onChange={(e) => setContentType(e.target.value)} />
        </label>
        <label className="label">
          Body
          <textarea className="field" value={body} onChange={(e) => setBody(e.target.value)} />
        </label>
        <div className="btn-row">
          <button className="btn primary" disabled={busy || !serial} onClick={() => void send()}>
            {busy ? "Enviando…" : "Transmitir"}
          </button>
        </div>
        {out && <pre className="result">{out}</pre>}
      </section>
      <div className="grid two">
        <section className="neu">
          <h3>Plantillas ISAPI A.5</h3>
          <p className="desc">Selecciona una para rellenar método, URI, Content-Type y body automáticamente.</p>
          <div className="btn-row">
            {ISAPI_TEMPLATES.map((t) => (
              <button key={t.name} className="btn" onClick={() => applyIsapi(t)}>
                {t.name}
              </button>
            ))}
          </div>
        </section>
        <section className="neu">
          <h3>Plantillas OTAP</h3>
          <p className="desc">Acciones y propiedades estructuradas para dispositivos compatibles con OTAP v2.</p>
          <div className="btn-row">
            {OTAP_TEMPLATES.map((t) => (
              <button key={t.name} className="btn" onClick={() => applyOtap(t)}>
                {t.name}
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
