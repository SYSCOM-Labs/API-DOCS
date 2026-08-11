import { useEffect, useMemo, useState } from "react";
import { apiPost } from "../../api/client";
import type { PlatformSnapshot, ProxyDebugInfo } from "../../types";
import { ATTENDANCE_STATUS } from "../../types";
import { isoWithOffset, normalizeTimeCard, readHik } from "../../lib/normalize";
import { ApiNote } from "../ui/ApiNote";
import { btnSecondary } from "../ui/classes";

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
  attendanceStatus?: number;
  workDuration?: string;
  lateDuration?: string;
  earlyDuration?: string;
  overtimeDuration?: string;
  timetableName?: string;
  clockInTime?: string;
  clockOutTime?: string;
}

interface ProbeState {
  rangeLabel: string;
  beginTime: string;
  endTime: string;
  reportCount: number;
  punchCount: number | null;
  errorCode: string;
  groupIdsSent: number;
}

/** §6.3 exige ISO con offset local (2024-01-01T00:00:00+08:00), no toISOString(). */
function dayRangeIso(): { beginTime: string; endTime: string; rangeLabel: string } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  const label = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  return {
    beginTime: isoWithOffset(start),
    endTime: isoWithOffset(end),
    rangeLabel: label,
  };
}

export function DashboardTab({ credentialsEnvelope, sandboxMode, platform, onHud }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [probe, setProbe] = useState<ProbeState | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const range = dayRangeIso();
      // Enviar los grupos descubiertos para acotar el reporte a los departamentos visibles.
      const personGroupIds = (platform?.personGroups ?? []).map((g) => g.id).filter(Boolean);

      const res = await apiPost("/api/attendance/report/timecard", credentialsEnvelope, {
        sandboxMode,
        pageIndex: 1,
        pageSize: 200,
        beginTime: range.beginTime,
        endTime: range.endTime,
        ...(personGroupIds.length ? { personGroupIds } : {}),
        dateFormat: "yyyy/MM/dd",
        timeFormat: "HH:mm",
        durationFormat: "HH:MM",
      });
      if (res.debug) onHud("Dashboard — time card del día", res.debug);

      const { errorCode, payload } = readHik(res);
      if (errorCode !== "0") {
        setRows([]);
        setProbe({
          rangeLabel: range.rangeLabel,
          beginTime: range.beginTime,
          endTime: range.endTime,
          reportCount: 0,
          punchCount: null,
          errorCode,
          groupIdsSent: personGroupIds.length,
        });
        setError(`La API respondió errorCode=${errorCode}. Revisa el Inspector API.`);
        return;
      }

      const list = normalizeTimeCard<Row>(payload).map((row) => ({
        ...row,
        clockInTime: row.clockInTime ?? (row as { checkInTime?: string }).checkInTime,
        clockOutTime: row.clockOutTime ?? (row as { checkOutTime?: string }).checkOutTime,
      }));
      setRows(list);

      // Si el reporte viene vacío, contamos marcajes del día para diagnosticar.
      let punchCount: number | null = null;
      if (!list.length) {
        const punches = await apiPost("/api/attendance/records/search", credentialsEnvelope, {
          sandboxMode,
          pageIndex: 1,
          pageSize: 200,
          searchCriteria: {
            beginTime: range.beginTime,
            endTime: range.endTime,
            type: 0,
            swipeAuthResult: 0,
            searchType: 0,
          },
        });
        if (punches.debug) onHud("Dashboard — marcajes del día (diagnóstico)", punches.debug);
        const punchHik = readHik<{ total?: number; recordList?: unknown[] }>(punches);
        punchCount =
          punchHik.errorCode === "0"
            ? punchHik.payload?.total ?? punchHik.payload?.recordList?.length ?? 0
            : null;
      }

      setProbe({
        rangeLabel: range.rangeLabel,
        beginTime: range.beginTime,
        endTime: range.endTime,
        reportCount: list.length,
        punchCount,
        errorCode: "0",
        groupIdsSent: personGroupIds.length,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandboxMode, credentialsEnvelope.appKey, platform?.personGroups?.length]);

  const kpis = useMemo(() => {
    const counts = { normal: 0, late: 0, early: 0, absent: 0, leave: 0, overtime: 0 };
    for (const r of rows) {
      const s = r.attendanceStatus ?? 0;
      if (s === 1) counts.normal += 1;
      if (s === 2 || s === 4) counts.late += 1;
      if (s === 3 || s === 4) counts.early += 1;
      if (s === 5) counts.absent += 1;
      if (s === 6) counts.leave += 1;
      if ((r.overtimeDuration ?? "00:00") !== "00:00" && r.overtimeDuration) counts.overtime += 1;
    }
    return counts;
  }, [rows]);

  const cards = [
    { label: "Normal", value: kpis.normal, tone: "bg-emerald-50 text-emerald-800" },
    { label: "Retardos", value: kpis.late, tone: "bg-amber-50 text-amber-800" },
    { label: "Salida temprana", value: kpis.early, tone: "bg-orange-50 text-orange-800" },
    { label: "Faltas", value: kpis.absent, tone: "bg-red-50 text-red-800" },
    { label: "Permisos", value: kpis.leave, tone: "bg-sky-50 text-sky-800" },
    { label: "Con overtime", value: kpis.overtime, tone: "bg-violet-50 text-violet-800" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-ink">Dashboard del día</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Reporte calculado{" "}
            <span className="endpoint-badge">attendance/v1/report/totaltimecard/list</span>
            {probe ? ` · ${probe.rangeLabel}` : ""}
          </p>
        </div>
        <button type="button" className={btnSecondary} disabled={loading} onClick={() => void load()}>
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {platform && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Áreas" value={platform.summary.areaCount} />
          <Stat label="Dispositivos ACS" value={platform.summary.acsDeviceCount} />
          <Stat label="Puertas" value={platform.summary.doorCount} />
          <Stat label="Online" value={platform.summary.onlineDeviceCount} />
        </div>
      )}

      {probe && probe.errorCode === "0" && probe.reportCount === 0 && (
        <ApiNote tone="api" title="Diagnóstico: reporte vacío" defaultOpen>
          <p>
            <code className="text-[11px]">totaltimecard/list</code> respondió{" "}
            <strong>errorCode=0</strong> con <strong>0 filas</strong> para {probe.rangeLabel}.
            Departamentos enviados: {probe.groupIdsSent || "ninguno (sin filtro de grupo)"}.
          </p>
          {probe.punchCount !== null && probe.punchCount > 0 ? (
            <p>
              Hay <strong>{probe.punchCount} marcaje(s)</strong> hoy en{" "}
              <span className="endpoint-badge">certificaterecords</span>, pero el reporte calculado
              no devolvió filas. Suele indicar que el turno de asistencia aún no está alineado con
              el cálculo del día (Schedule en el portal, o retardo de cálculo tras los marcajes).
            </p>
          ) : probe.punchCount === 0 ? (
            <p>
              Tampoco hay marcajes hoy en certificate records. El Schedule solo asigna horario; sin
              autenticación en el dispositivo el reporte del día queda vacío (salvo faltas al
              cierre, según la política del tenant).
            </p>
          ) : (
            <p>No se pudo consultar marcajes para comparar. Ver detalle en el Inspector API.</p>
          )}
        </ApiNote>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-2xl p-4 ${c.tone}`}>
            <p className="text-xs font-medium opacity-80">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="content-card overflow-x-auto p-0">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-black/[0.06] text-xs text-ink-tertiary">
            <tr>
              <th className="px-4 py-3">Persona</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Turno</th>
              <th className="px-4 py-3">In / Out</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Trabajo</th>
              <th className="px-4 py-3">Retardo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-black/[0.04]">
                <td className="px-4 py-2.5">
                  {r.fullName || [r.firstName, r.lastName].filter(Boolean).join(" ") || "—"}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs">{r.personCode ?? "—"}</td>
                <td className="px-4 py-2.5 text-xs">{r.timetableName ?? "—"}</td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  {r.clockInTime || "—"} / {r.clockOutTime || "—"}
                </td>
                <td className="px-4 py-2.5">
                  {ATTENDANCE_STATUS[r.attendanceStatus ?? 0] ?? r.attendanceStatus ?? "—"}
                </td>
                <td className="px-4 py-2.5">{r.workDuration ?? "—"}</td>
                <td className="px-4 py-2.5">{r.lateDuration ?? "—"}</td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-secondary">
                  Sin filas en el reporte calculado de hoy. Usa el diagnóstico de arriba y el
                  Inspector API.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="content-card py-4">
      <p className="text-xs text-ink-tertiary">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
