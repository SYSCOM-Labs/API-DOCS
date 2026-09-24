"use client";

import { useMemo, useState } from "react";
import { DeviceIdField, MultiSerialField, SerialField } from "@/components/DevicePicker";
import { MultiSiteField, SiteField } from "@/components/SiteField";
import type { Operation } from "@/lib/operations";
import { hppCall } from "@/lib/client";
import { explainError } from "@/lib/errors";

function parseMaybeJson(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }
  return trimmed;
}

export function OperationCard({ op }: { op: Operation }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<string>("");
  const [ok, setOk] = useState<boolean | null>(null);
  const [diagnosis, setDiagnosis] = useState("");

  const path = useMemo(() => {
    let p = op.path;
    for (const key of op.pathParams ?? []) {
      p = p.replace(`{${key}}`, encodeURIComponent(pathValues[key] || ""));
    }
    return p;
  }, [op.path, op.pathParams, pathValues]);
  const descriptionIsOnlyEndpoint =
    op.description.trim() === `${op.method} ${op.path}` ||
    op.description.trim() === op.path;

  async function run() {
    if (op.dangerous && !window.confirm(`¿Ejecutar ${op.title}? Es una operación sensible.`)) return;
    setBusy(true);
    setOut("");
    try {
      let body: unknown = undefined;
      if (op.rawBody) {
        const raw = values.body ?? "";
        body = raw.trim() ? JSON.parse(raw) : {};
      } else if (op.fields?.length) {
        const obj: Record<string, unknown> = {};
        for (const field of op.fields) {
          const raw =
            values[field.name] ??
            (field.type === "boolean" ? "true" : field.placeholder ?? "");
          if (raw === "") continue;
          if (field.type === "number") obj[field.name] = Number(raw);
          else if (field.type === "boolean") obj[field.name] = raw === "true";
          else if (field.type === "json") obj[field.name] = parseMaybeJson(raw);
          else obj[field.name] = raw;
        }
        body = obj;
      }

      const res = await hppCall({
        method: op.method,
        path,
        body: op.method === "GET" ? undefined : body,
        contentType: op.contentType,
      });
      const result = res.result as { errorCode?: string } | undefined;
      const code = result?.errorCode ?? res.errorCode;
      setOk(String(result?.errorCode ?? "") === "0" || res.httpStatus === 200);
      setDiagnosis(code && code !== "0" ? `${code} · ${explainError(code)}` : "");
      setOut(JSON.stringify(res, null, 2));
    } catch (error) {
      setOk(false);
      setDiagnosis("");
      setOut(error instanceof Error ? error.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="neu">
      <div className="operation-head">
        <div>
          <h3>{op.title}</h3>
          {!descriptionIsOnlyEndpoint && <p className="desc">{op.description}</p>}
        </div>
        <span className={`method-badge ${op.method.toLowerCase()}`}>{op.method}</span>
      </div>
      <code className="operation-path">{op.path}</code>
      {(op.pathParams ?? []).map((param) => (
        <label key={param} className="label">
          Path {param} <span className="required-mark">obligatorio</span>
          {param === "deviceSerial" ? (
            <SerialField
              value={pathValues[param] ?? ""}
              onChange={(serial) => setPathValues((s) => ({ ...s, [param]: serial }))}
            />
          ) : param === "id" && op.path.includes("/site/") ? (
            <SiteField
              value={pathValues[param] ?? ""}
              onChange={(siteId) => setPathValues((s) => ({ ...s, [param]: siteId }))}
            />
          ) : (
            <input
              className="field"
              value={pathValues[param] ?? ""}
              onChange={(e) => setPathValues((s) => ({ ...s, [param]: e.target.value }))}
            />
          )}
        </label>
      ))}
      {(op.fields ?? []).map((field) => (
        <label key={field.name} className="label">
          <span className="field-label">
            {field.label}
            {field.required && <span className="required-mark">obligatorio</span>}
          </span>
          {field.options ? (
            <select
              className="field"
              value={values[field.name] ?? field.placeholder ?? field.options[0]?.value ?? ""}
              onChange={(e) => setValues((s) => ({ ...s, [field.name]: e.target.value }))}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : field.type === "boolean" ? (
            <select
              className="field"
              value={values[field.name] ?? "true"}
              onChange={(e) => setValues((s) => ({ ...s, [field.name]: e.target.value }))}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : field.type === "text" && field.name === "deviceSerial" ? (
            <SerialField
              value={values[field.name] ?? ""}
              onChange={(serial) => setValues((s) => ({ ...s, [field.name]: serial }))}
              placeholder={field.placeholder}
            />
          ) : field.type === "text" && field.name === "siteId" ? (
            <SiteField
              value={values[field.name] ?? ""}
              onChange={(siteId) => setValues((s) => ({ ...s, [field.name]: siteId }))}
              placeholder={field.placeholder}
            />
          ) : field.type === "text" && field.name === "id" && op.id === "dev-delete" ? (
            <DeviceIdField
              value={values[field.name] ?? ""}
              onChange={(id) => setValues((s) => ({ ...s, [field.name]: id }))}
            />
          ) : field.type === "json" && field.name === "siteIds" ? (
            <MultiSiteField
              value={values[field.name] ?? field.placeholder ?? "[]"}
              onChange={(json) => setValues((s) => ({ ...s, [field.name]: json }))}
            />
          ) : field.type === "json" && ["deviceSerials", "deviceSerialList"].includes(field.name) ? (
            <MultiSerialField
              value={values[field.name] ?? field.placeholder ?? "[]"}
              onChange={(json) => setValues((s) => ({ ...s, [field.name]: json }))}
            />
          ) : field.type === "json" || field.type === "textarea" ? (
            <textarea
              className="field"
              placeholder={field.placeholder}
              value={values[field.name] ?? field.placeholder ?? ""}
              onChange={(e) => setValues((s) => ({ ...s, [field.name]: e.target.value }))}
            />
          ) : (
            <input
              className="field"
              type={field.type === "number" ? "number" : "text"}
              placeholder={field.placeholder}
              value={values[field.name] ?? ""}
              onChange={(e) => setValues((s) => ({ ...s, [field.name]: e.target.value }))}
            />
          )}
          {field.hint && <small className="field-hint">{field.hint}</small>}
        </label>
      ))}
      <div className="btn-row">
        <button className={`btn ${op.dangerous ? "danger" : "primary"}`} disabled={busy} onClick={run}>
          {busy ? "Llamando…" : "Probar API"}
        </button>
        {ok === true && <span className="chip ok">errorCode 0</span>}
        {ok === false && <span className="chip bad">falló</span>}
      </div>
      {diagnosis && <p className="desc op-diagnosis">{diagnosis}</p>}
      {out && <pre className="result">{out}</pre>}
    </article>
  );
}

export function OpsGrid({ ops }: { ops: Operation[] }) {
  return (
    <div className="grid two">
      {ops.map((op) => (
        <OperationCard key={op.id} op={op} />
      ))}
    </div>
  );
}
