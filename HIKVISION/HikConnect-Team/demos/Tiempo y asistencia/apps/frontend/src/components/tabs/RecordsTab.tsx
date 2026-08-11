import { useState } from "react";
import { apiPost } from "../../api/client";
import type { ProxyDebugInfo } from "../../types";
import { isoWithOffset, readHik } from "../../lib/normalize";
import { ApiNote } from "../ui/ApiNote";
import { btnPrimary, inputClass } from "../ui/classes";

interface Props {
  credentialsEnvelope: Record<string, string>;
  sandboxMode: boolean;
  onHud: (label: string, debug?: ProxyDebugInfo) => void;
}

interface RecordRow {
  recordGuid?: string;
  elementId?: string;
  elementName?: string;
  eventType?: number;
  swipeAuthResult?: number;
  personInfo?: {
    personId?: string;
    firstName?: string;
    lastName?: string;
    personCode?: string;
    id?: string;
    baseInfo?: {
      personId?: string;
      firstName?: string;
      lastName?: string;
      personCode?: string;
    };
  };
  // Compatibilidad con la forma resumida de §6.2.
  personId?: string;
  personName?: string;
  certType?: string;
  occurTime?: string;
  result?: number;
  deviceName?: string;
}

function recordPerson(row: RecordRow): string {
  const info = row.personInfo?.baseInfo ?? row.personInfo;
  return (
    row.personName ||
    [info?.firstName, info?.lastName].filter(Boolean).join(" ").trim() ||
    row.personId ||
    info?.personId ||
    row.personInfo?.id ||
    "—"
  );
}

function recordResult(row: RecordRow): string {
  const value = row.swipeAuthResult ?? row.result;
  if (value === 1) return "Correcto";
  if (value === 2 || value === 0) return "Rechazado";
  return "—";
}

export function RecordsTab({ credentialsEnvelope, sandboxMode, onHud }: Props) {
  const [personName, setPersonName] = useState("");
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    setBusy(true);
    setError("");
    const end = new Date();
    const begin = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    try {
      const allRows: RecordRow[] = [];
      const pageSize = 200;
      let pageIndex = 1;
      let total: number | undefined;

      do {
        const res = await apiPost("/api/attendance/records/search", credentialsEnvelope, {
          sandboxMode,
          pageIndex,
          pageSize,
          searchCriteria: {
            beginTime: isoWithOffset(begin),
            endTime: isoWithOffset(end),
            type: 0,
            swipeAuthResult: 0,
            searchType: 0,
            temperatureStatus: 0,
            maskStatus: 0,
            ...(personName.trim()
              ? { personCondition: { personName: personName.trim() } }
              : {}),
          },
        });
        if (res.debug) onHud(`Marcajes · página ${pageIndex}`, res.debug);

        const { errorCode, payload } = readHik<{
          total?: number;
          recordList?: RecordRow[];
        }>(res);
        if (errorCode !== "0") {
          setRows([]);
          setError(`La API respondió errorCode=${errorCode}. Revisa el Inspector API.`);
          return;
        }
        const page = payload?.recordList ?? [];
        allRows.push(...page);
        total = payload?.total;
        if (!page.length || page.length < pageSize || (total !== undefined && allRows.length >= total)) {
          break;
        }
        pageIndex += 1;
      } while (pageIndex <= 100);

      setRows(allRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Marcajes</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Eventos face/card/fingerprint ·{" "}
          <span className="endpoint-badge">acs/v1/event/certificaterecords/search</span>
        </p>
      </div>

      <ApiNote tone="tip" title="Marcajes vs reporte de asistencia">
        <p>
          Esta consulta lista cada autenticación (éxito o rechazo). Es la fuente fiable cuando el
          time card calculado está vacío porque aún no hay turno.
        </p>
        <p>
          No es lo mismo que el reporte de asistencia: aquí no hay retardo, falta ni horas
          trabajadas; solo el evento crudo de persona + puerta + hora.
        </p>
      </ApiNote>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          Nombre (opcional)
          <input
            className={inputClass}
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            placeholder="Búsqueda difusa"
          />
        </label>
        <button type="button" className={btnPrimary} disabled={busy} onClick={() => void search()}>
          {busy ? "Buscando…" : "Buscar últimos 7 días"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="content-card overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/[0.06] text-xs text-ink-tertiary">
            <tr>
              <th className="px-4 py-3">Hora</th>
              <th className="px-4 py-3">Persona</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Dispositivo</th>
              <th className="px-4 py-3">Resultado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-black/[0.04]">
                <td className="px-4 py-2.5 font-mono text-xs">{r.occurTime ?? "—"}</td>
                <td className="px-4 py-2.5">{recordPerson(r)}</td>
                <td className="px-4 py-2.5">{r.eventType ?? r.certType ?? "—"}</td>
                <td className="px-4 py-2.5">{r.elementName ?? r.deviceName ?? "—"}</td>
                <td className="px-4 py-2.5">{recordResult(r)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-secondary">
                  Sin resultados. Pulsa buscar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
