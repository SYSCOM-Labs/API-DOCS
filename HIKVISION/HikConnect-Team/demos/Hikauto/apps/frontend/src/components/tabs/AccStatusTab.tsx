import { useState, useEffect } from "react";
import { apiPost } from "../../api/client";
import { GUIDES } from "../../content/guides";
import { GuidePanel, FormField } from "../GuidePanel";
import type { FleetTabProps } from "./types";
import { btnPrimary, inputClass } from "../ui/classes";

function accBadge(status: number) {
  if (status === 1) return { text: "Encendido", cls: "bg-emerald-50 text-emerald-700" };
  if (status === 0) return { text: "Apagado", cls: "bg-neutral-100 text-ink-secondary" };
  return { text: "Sin reporte", cls: "bg-amber-50 text-amber-700" };
}

/** Tab: consulta ACC por deviceSerials CSV (PDF §5.9.5). */
export function AccStatusTab({
  credentialsEnvelope,
  isConfigured,
  platform,
  selectedVehicle,
  onHud,
}: FleetTabProps) {
  const [serials, setSerials] = useState("");
  const [rows, setRows] = useState<Array<{ idOrDeviceSerial: string; accStatus: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (platform?.deviceSerialsCsv) {
      setSerials(platform.deviceSerialsCsv);
    } else if (selectedVehicle?.deviceSerial) {
      setSerials(selectedVehicle.deviceSerial);
    }
  }, [platform, selectedVehicle]);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!isConfigured) {
      setMessage("Conecta con Account y Password.");
      return;
    }
    setLoading(true);
    setMessage("");
    const res = await apiPost<{
      data?: { accStatusInfos?: Array<{ idOrDeviceSerial: string; accStatus: number }> };
    }>("/api/fleet/vehicles/acc-status", credentialsEnvelope, { deviceSerials: serials });
    setLoading(false);
    if (res.debug) onHud("Consultar ACC", res.debug);
    const infos =
      (res.data as { data?: { accStatusInfos?: typeof rows } })?.data?.accStatusInfos ?? [];
    setRows(infos);
    if (infos.length === 0)
      setMessage("Sin resultados. Verifica seriales CSV y que el vehículo esté vinculado.");
    else setMessage(`${infos.length} dispositivo(s) consultado(s).`);
  }

  return (
    <div>
      <GuidePanel guide={GUIDES.acc} />

      {platform?.deviceSerialsCsv && (
        <p className="mb-3 text-sm text-ink-secondary">
          Autocompletado con {platform.summary.vehicleCount} serial(es).
        </p>
      )}

      <form onSubmit={handleCheck} className="space-y-3 text-sm">
        <FormField
          label="deviceSerials (CSV)"
          hint="Separados por coma — cargados desde inventario"
        >
          <input
            className={inputClass}
            placeholder="CA5565496,K70728087"
            value={serials}
            onChange={(e) => setSerials(e.target.value)}
            required
          />
        </FormField>

        <button
          type="submit"
          disabled={loading || !isConfigured}
          className={btnPrimary}
        >
          {loading ? "Consultando…" : "Consultar ACC"}
        </button>
        {message && <p className="text-xs text-slate-400">{message}</p>}
      </form>

      {rows.length > 0 && (
        <ul className="mt-4 space-y-2">
          {rows.map((r) => {
            const b = accBadge(r.accStatus);
            return (
              <li
                key={r.idOrDeviceSerial}
                className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-sm"
              >
                <span className="font-mono">{r.idOrDeviceSerial}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${b.cls}`}>{b.text}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
