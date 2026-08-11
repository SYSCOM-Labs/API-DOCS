import { useState } from "react";
import { apiPost } from "../../api/client";
import type { PlatformSnapshot, ProxyDebugInfo } from "../../types";
import { readHik } from "../../lib/normalize";
import { ApiNote } from "../ui/ApiNote";
import { btnPrimary, btnSecondary, selectClass } from "../ui/classes";

interface Props {
  credentialsEnvelope: Record<string, string>;
  sandboxMode: boolean;
  platform: PlatformSnapshot | null;
  onHud: (label: string, debug?: ProxyDebugInfo) => void;
}

/** RemoteControl.actionType (§6.1 y anexo RemoteControl). */
const ACTIONS = [
  { type: 1, label: "Abrir puerta" },
  { type: 2, label: "Bloquear" },
  { type: 3, label: "Mantener abierta" },
  { type: 4, label: "Mantener bloqueada" },
] as const;

interface OperationResult {
  elementId?: string;
  elementName?: string;
  areaName?: string;
  errorCode?: string;
}

export function DoorsTab({ credentialsEnvelope, sandboxMode, platform, onHud }: Props) {
  const doors = platform?.doors ?? [];
  const [doorId, setDoorId] = useState(doors[0]?.id ?? "");
  const [direction, setDirection] = useState(0);
  const [msg, setMsg] = useState("");
  const [msgIsError, setMsgIsError] = useState(false);
  const [busy, setBusy] = useState(false);

  const control = async (actionType: number) => {
    // elementlist vacío significa «todas las puertas»: nunca se envía sin selección.
    if (!doorId) return;
    setBusy(true);
    setMsg("");
    setMsgIsError(false);
    const label = ACTIONS.find((a) => a.type === actionType)?.label ?? "Comando";
    try {
      const res = await apiPost("/api/attendance/doors/remote-control", credentialsEnvelope, {
        sandboxMode,
        remoteControl: {
          actionType,
          // elementlist es String[] de IDs de puerta, no objetos.
          elementlist: [doorId],
          direction,
          areaId: "-1",
          depthTraversal: 1,
        },
      });
      if (res.debug) onHud(`${label} (remote/control)`, res.debug);

      const { errorCode, payload } = readHik<{ operationResult?: OperationResult[] }>(res);
      if (errorCode !== "0") {
        setMsgIsError(true);
        setMsg(`La plataforma rechazó el comando. errorCode=${errorCode}`);
        return;
      }

      // El resultado por puerta trae su propio errorCode; sin él no hay confirmación real.
      const results = payload?.operationResult ?? [];
      const failed = results.filter((r) => r.errorCode && r.errorCode !== "0");
      if (failed.length) {
        setMsgIsError(true);
        setMsg(
          `${label} falló en ${failed
            .map((r) => `${r.elementName || r.elementId}: ${r.errorCode}`)
            .join(", ")}`
        );
        return;
      }
      if (!results.length) {
        setMsg(
          `${label}: la plataforma aceptó la petición pero no devolvió operationResult. Revisa el Inspector API.`
        );
        return;
      }
      setMsg(`${label}: confirmado por la plataforma (${results.length} puerta/s).`);
    } catch (e) {
      setMsgIsError(true);
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Puertas</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Control remoto · <span className="endpoint-badge">acs/v1/remote/control</span>
        </p>
      </div>

      <ApiNote tone="portal" title="Puertas y dispositivos se dan de alta en el portal">
        <p>
          La API abre puertas ya existentes; no crea el inventario ACS. En Hik-Connect: agregar
          dispositivo de control de acceso, asociarlo al área y sincronizar puertas. Luego
          reconecta o vuelve a descubrir la plataforma.
        </p>
        <p>
          La apertura remota no sustituye un marcaje de asistencia: no genera por sí sola un
          registro de time card.
        </p>
      </ApiNote>

      <div className="content-card max-w-lg space-y-4">
        <label className="block text-sm">
          Puerta
          <select className={selectClass} value={doorId} onChange={(e) => setDoorId(e.target.value)}>
            {doors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.deviceSerial ? `(${d.deviceSerial})` : ""}
              </option>
            ))}
          </select>
        </label>
        {!doors.length && (
          <p className="text-sm text-ink-secondary">
            No hay puertas descubiertas. Verifica dispositivos ACS en el tenant.
          </p>
        )}
        <label className="block text-sm">
          Dirección
          <select
            className={selectClass}
            value={direction}
            onChange={(e) => setDirection(Number(e.target.value))}
          >
            <option value={0}>Entrada</option>
            <option value={1}>Salida</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action.type}
              type="button"
              className={action.type === 1 ? btnPrimary : btnSecondary}
              disabled={busy || !doorId}
              onClick={() => void control(action.type)}
            >
              {busy ? "Enviando…" : action.label}
            </button>
          ))}
        </div>
        {msg && (
          <p className={`text-sm ${msgIsError ? "text-red-600" : "text-ink-secondary"}`}>{msg}</p>
        )}
      </div>

      <div className="content-card">
        <p className="section-label mb-2">Inventario</p>
        <ul className="space-y-2 text-sm">
          {doors.map((d) => (
            <li key={d.id}>
              <span className="font-medium">{d.name}</span>
              <span className="text-ink-tertiary"> · {d.areaName || "—"} · id {d.id}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
