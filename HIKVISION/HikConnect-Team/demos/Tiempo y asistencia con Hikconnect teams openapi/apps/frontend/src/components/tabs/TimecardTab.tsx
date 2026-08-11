import { useEffect, useState } from "react";
import { apiPost } from "../../api/client";
import type { PlatformSnapshot, ProxyDebugInfo } from "../../types";
import { ATTENDANCE_STATUS } from "../../types";
import { isoWithOffset, normalizeTimeCard, readHik } from "../../lib/normalize";
import { ApiNote } from "../ui/ApiNote";
import { btnPrimary, inputClass, selectClass } from "../ui/classes";

interface Props {
  credentialsEnvelope: Record<string, string>;
  sandboxMode: boolean;
  platform: PlatformSnapshot | null;
  onHud: (label: string, debug?: ProxyDebugInfo) => void;
}

interface Row {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  personCode?: string;
  groupName?: string;
  fullPath?: string;
  date?: string;
  timetableName?: string;
  checkInTime?: string;
  checkOutTime?: string;
  clockInTime?: string;
  clockOutTime?: string;
  clockInDevice?: string;
  attendanceStatus?: number;
  workDuration?: string;
  lateDuration?: string;
  earlyDuration?: string;
  overtimeDuration?: string;
  leaveDuration?: string;
  absenceDuration?: string;
  /** Marcajes del día cuando la fila se reconstruye desde certificate records. */
  records?: string[];
  weekday?: number;
}

interface CertificateRecord {
  occurTime?: string;
  personInfo?: {
    personId?: string;
    firstName?: string;
    lastName?: string;
    personCode?: string;
    groupId?: string;
    fullPath?: string;
    baseInfo?: {
      personId?: string;
      firstName?: string;
      lastName?: string;
      personCode?: string;
    };
  };
  personId?: string;
  personName?: string;
}

const WEEKDAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

/** yyyy-MM-dd (valor de un <input type="date">) → ISO 8601 con offset local. */
function dayBoundary(day: string, edge: "start" | "end"): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  if (edge === "start") date.setHours(0, 0, 0, 0);
  else date.setHours(23, 59, 59, 0);
  return isoWithOffset(date);
}

function toInputDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function TimecardTab({ credentialsEnvelope, sandboxMode, platform, onHud }: Props) {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [from, setFrom] = useState(toInputDate(monthStart));
  const [to, setTo] = useState(toInputDate(today));
  const [personName, setPersonName] = useState("");
  const [personCode, setPersonCode] = useState("");
  // Sin filtro de departamento la API usa los permitidos por la cuenta (§6.3).
  const [groupId, setGroupId] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgIsError, setMsgIsError] = useState(false);
  const [searched, setSearched] = useState(false);
  const [fromRecords, setFromRecords] = useState(false);

  /**
   * Reproduce la vista "Time Card" del portal: un renglón por persona y día con
   * la lista de marcajes, usando certificate records como fuente.
   */
  const buildFromRecords = async (): Promise<Row[]> => {
    const grouped = new Map<string, Row>();
    const pageSize = 200;
    let pageIndex = 1;

    while (pageIndex <= 50) {
      const res = await apiPost("/api/attendance/records/search", credentialsEnvelope, {
        sandboxMode,
        pageIndex,
        pageSize,
        searchCriteria: {
          beginTime: dayBoundary(from, "start"),
          endTime: dayBoundary(to, "end"),
          type: 0,
          swipeAuthResult: 0,
          searchType: 0,
          ...(personName.trim() ? { personCondition: { personName: personName.trim() } } : {}),
        },
      });
      if (res.debug) onHud(`Tarjeta desde marcajes · página ${pageIndex}`, res.debug);

      const { errorCode, payload } = readHik<{
        total?: number;
        recordList?: CertificateRecord[];
      }>(res);
      if (errorCode !== "0") {
        setMsgIsError(true);
        setMsg(`Los marcajes respondieron errorCode=${errorCode}.`);
        return [];
      }

      const page = payload?.recordList ?? [];
      for (const record of page) {
        const info = record.personInfo?.baseInfo ?? record.personInfo;
        const code = info?.personCode ?? "";
        // El filtro personCode del reporte es difuso; se replica aquí.
        if (personCode.trim() && !code.includes(personCode.trim())) continue;

        const occur = record.occurTime ?? "";
        const date = occur.slice(0, 10);
        if (!date) continue;
        const time = occur.slice(11, 16);
        const personId = info?.personId ?? record.personId ?? record.personName ?? "?";
        const key = `${personId}|${date}`;

        const existing = grouped.get(key);
        if (existing) {
          if (time && !existing.records?.includes(time)) existing.records?.push(time);
          continue;
        }

        const parsed = new Date(`${date}T00:00:00`);
        grouped.set(key, {
          firstName: info?.firstName,
          lastName: info?.lastName,
          fullName:
            record.personName ??
            [info?.firstName, info?.lastName].filter(Boolean).join(" ").trim(),
          personCode: code,
          groupName: record.personInfo?.fullPath,
          date: date.replace(/-/g, "/"),
          weekday: Number.isNaN(parsed.getTime()) ? undefined : parsed.getDay(),
          records: time ? [time] : [],
        });
      }

      if (!page.length || page.length < pageSize) break;
      pageIndex += 1;
    }

    for (const row of grouped.values()) row.records?.sort();
    return [...grouped.values()].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  };

  const search = async () => {
    setBusy(true);
    setMsg("");
    setMsgIsError(false);
    try {
      if (!from || !to || from > to) {
        setRows([]);
        setMsgIsError(true);
        setMsg("El rango de fechas no es válido.");
        return;
      }
      const personGroupIds = groupId ? [groupId] : [];
      const basePayload = {
        sandboxMode,
        pageSize: 200,
        beginTime: dayBoundary(from, "start"),
        endTime: dayBoundary(to, "end"),
        ...(personName.trim() ? { personName: personName.trim() } : {}),
        ...(personCode.trim() ? { personCode: personCode.trim() } : {}),
        ...(personGroupIds.length ? { personGroupIds } : {}),
        dateFormat: "yyyy/MM/dd",
        timeFormat: "HH:mm",
        durationFormat: "HH:MM",
      };
      const list: Row[] = [];
      let pageIndex = 1;
      let moreData = 0;
      do {
        const res = await apiPost("/api/attendance/report/timecard", credentialsEnvelope, {
          ...basePayload,
          pageIndex,
        });
        if (res.debug) onHud(`Reporte time card · página ${pageIndex}`, res.debug);

        const { errorCode, payload } = readHik(res);
        if (errorCode !== "0") {
          setRows([]);
          setMsgIsError(true);
          setMsg(`La API respondió errorCode=${errorCode}. Revisa el Inspector API.`);
          return;
        }

        const page = normalizeTimeCard<Row>(payload).map((row) => ({
          ...row,
          // El resumen antiguo usa checkIn/checkOut; el esquema actual añade clockIn/clockOut.
          clockInTime: row.clockInTime ?? row.checkInTime,
          clockOutTime: row.clockOutTime ?? row.checkOutTime,
        }));
        list.push(...page);
        const pagePayload = payload as { moreData?: number } | undefined;
        moreData = Number(pagePayload?.moreData ?? 0);
        pageIndex += 1;
      } while (moreData === 1 && pageIndex <= 100);

      if (list.length) {
        setRows(list);
        setFromRecords(false);
        setMsg(`${list.length} registro(s) del reporte de asistencia.`);
        return;
      }

      // Sin turno asignado el reporte calculado viene vacío: se reconstruye la
      // tarjeta desde los marcajes, igual que la vista "Time Card" del portal.
      const rebuilt = await buildFromRecords();
      setRows(rebuilt);
      setFromRecords(true);
      setMsg(
        rebuilt.length
          ? `El reporte calculado vino vacío (sin turno asignado). Se reconstruyeron ` +
              `${rebuilt.length} día(s) a partir de los marcajes.`
          : "Sin datos: ni el reporte de asistencia ni los marcajes devolvieron registros en ese rango."
      );
    } catch (e) {
      setMsgIsError(true);
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxMode]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Reporte time card</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Normal · retardo · falta · salida temprana · overtime ·{" "}
          <span className="endpoint-badge">attendance/v1/report/totaltimecard/list</span>
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          Desde
          <input
            type="date"
            className={inputClass}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Hasta
          <input
            type="date"
            className={inputClass}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Nombre
          <input
            className={inputClass}
            placeholder="Búsqueda parcial"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          N.º empleado
          <input
            className={inputClass}
            placeholder="Búsqueda parcial"
            value={personCode}
            onChange={(e) => setPersonCode(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Departamento
          <select
            className={selectClass}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <option value="">Todos los permitidos por la cuenta</option>
            {(platform?.personGroups ?? []).map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className={btnPrimary} disabled={busy} onClick={() => void search()}>
          {busy ? "Consultando…" : "Consultar"}
        </button>
      </div>

      {msg && (
        <p className={`text-sm ${msgIsError ? "text-red-600" : "text-ink-secondary"}`}>{msg}</p>
      )}

      <ApiNote tone="portal" title="El time card calculado exige turno en Hik-Connect" defaultOpen>
        <p>
          <strong>Attendance → Schedule</strong> asigna el horario a personas o departamentos. El
          endpoint <span className="endpoint-badge">attendance/v1/report/totaltimecard/list</span>{" "}
          no lee ese calendario: entrega el <strong>resultado calculado</strong> del día (estado,
          retardo, horas) cuando ya hay marcajes contra el turno.
        </p>
        <p>
          Si el reporte calculado viene vacío, esta pestaña reconstruye la tarjeta desde{" "}
          <span className="endpoint-badge">certificaterecords/search</span> (lista de marcajes por
          día), comportamiento equivalente a la exportación Time Card del portal cuando solo
          muestra la columna Records.
        </p>
      </ApiNote>

      {fromRecords && rows.length > 0 && (
        <ApiNote tone="tip" title="Vista reconstruida desde marcajes" defaultOpen>
          <p>
            Vista agrupada por persona y día a partir de marcajes reales. Las columnas de turno,
            estado y duraciones quedan vacías porque la plataforma solo las calcula con un turno
            asignado.
          </p>
        </ApiNote>
      )}

      <div className="content-card overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/[0.06] text-xs text-ink-tertiary">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Persona</th>
              {fromRecords ? (
                <>
                  <th className="px-4 py-3">Día</th>
                  <th className="px-4 py-3">Marcajes</th>
                  <th className="px-4 py-3">Primero / Último</th>
                  <th className="px-4 py-3">Total</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3">Turno</th>
                  <th className="px-4 py-3">In / Out</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Trabajo</th>
                  <th className="px-4 py-3">Retardo</th>
                  <th className="px-4 py-3">Temprano</th>
                  <th className="px-4 py-3">OT</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-black/[0.04]">
                <td className="px-4 py-2.5">{r.date ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <div>
                    {r.fullName || [r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}
                  </div>
                  <div className="text-[11px] text-ink-tertiary">
                    {[r.personCode, r.groupName ?? r.fullPath].filter(Boolean).join(" · ") || "—"}
                  </div>
                </td>
                {fromRecords ? (
                  <>
                    <td className="px-4 py-2.5 text-xs">
                      {r.weekday === undefined ? "—" : WEEKDAY_NAMES[r.weekday]}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] leading-relaxed">
                      {r.records?.join("; ") || "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {r.records?.length
                        ? `${r.records[0]} / ${r.records[r.records.length - 1]}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5">{r.records?.length ?? 0}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2.5 text-xs">{r.timetableName ?? "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {r.clockInTime || "—"} / {r.clockOutTime || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {ATTENDANCE_STATUS[r.attendanceStatus ?? 0] ?? r.attendanceStatus ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">{r.workDuration ?? "—"}</td>
                    <td className="px-4 py-2.5">{r.lateDuration ?? "—"}</td>
                    <td className="px-4 py-2.5">{r.earlyDuration ?? "—"}</td>
                    <td className="px-4 py-2.5">{r.overtimeDuration ?? "—"}</td>
                  </>
                )}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-ink-secondary">
                  {busy
                    ? "Consultando…"
                    : searched
                      ? "Sin registros en el rango seleccionado."
                      : "Ejecuta la consulta."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
