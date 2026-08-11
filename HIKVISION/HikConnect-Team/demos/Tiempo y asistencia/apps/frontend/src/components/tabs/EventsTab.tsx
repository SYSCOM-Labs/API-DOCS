import { useEffect, useMemo, useState } from "react";
import { apiPost } from "../../api/client";
import { useEventsWs } from "../../hooks/useEventsWs";
import type { ProxyDebugInfo } from "../../types";
import { ApiNote } from "../ui/ApiNote";
import {
  btnPrimary,
  btnSecondary,
  btnDestructive,
  inputClass,
  selectClass,
} from "../ui/classes";

interface Props {
  credentialsEnvelope: Record<string, string>;
  sandboxMode: boolean;
  connected: boolean;
  onHud: (label: string, debug?: ProxyDebugInfo) => void;
}

export function EventsTab({ credentialsEnvelope, sandboxMode, connected, onHud }: Props) {
  const [listening, setListening] = useState(false);
  const { events, status, clear } = useEventsWs(connected);
  const [busy, setBusy] = useState(false);
  const [personFilter, setPersonFilter] = useState("");
  const [doorFilter, setDoorFilter] = useState("");

  // Nunca conservar eventos simulados al cambiar entre sandbox y credenciales reales.
  useEffect(() => {
    clear();
  }, [sandboxMode, clear]);

  const doors = useMemo(
    () =>
      [...new Set(events.map((event) => event.resourceName).filter((name) => name !== "—"))].sort(),
    [events]
  );
  const visibleEvents = useMemo(() => {
    const person = personFilter.trim().toLocaleLowerCase();
    return events.filter(
      (event) =>
        (!person || event.personName.toLocaleLowerCase().includes(person)) &&
        (!doorFilter || event.resourceName === doorFilter)
    );
  }, [events, personFilter, doorFilter]);

  const start = async () => {
    setBusy(true);
    clear();
    try {
      const res = await apiPost("/api/attendance/events/start", credentialsEnvelope, {
        sandboxMode,
      });
      if (res.debug) onHud("Iniciar feed MQ", res.debug);
      setListening(true);
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      const res = await apiPost("/api/attendance/events/stop", credentialsEnvelope, {
        sandboxMode,
      });
      if (res.debug) onHud("Detener feed MQ", res.debug);
      setListening(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Visor de marcajes y eventos</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Marcajes por persona y puerta ·{" "}
          <span className="endpoint-badge">acs/v1/event/certificaterecords/search</span>
          {" · "}
          <span className="endpoint-badge">*/v1/mq/subscribe|messages</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={btnPrimary} disabled={busy} onClick={() => void start()}>
          {busy ? "…" : "Iniciar visor"}
        </button>
        <button type="button" className={btnSecondary} disabled={busy} onClick={() => void stop()}>
          Detener
        </button>
        <button type="button" className={btnDestructive} onClick={clear}>
          Limpiar lista
        </button>
        <span className="text-sm text-ink-secondary">
          {status.message || (listening || status.running ? "Escuchando…" : "Detenido")}
          {status.sandboxMode ? " · sandbox" : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          Persona
          <input
            className={inputClass}
            value={personFilter}
            onChange={(event) => setPersonFilter(event.target.value)}
            placeholder="Filtrar nombre"
          />
        </label>
        <label className="block text-sm">
          Puerta
          <select
            className={selectClass}
            value={doorFilter}
            onChange={(event) => setDoorFilter(event.target.value)}
          >
            <option value="">Todas las puertas</option>
            {doors.map((door) => (
              <option key={door} value={door}>
                {door}
              </option>
            ))}
          </select>
        </label>
        <span className="pb-2 text-xs text-ink-tertiary">
          {visibleEvents.length} de {events.length} evento(s)
        </span>
      </div>

      <ApiNote tone="api" title="Qué puede y qué no puede el feed en vivo" defaultOpen>
        <p>
          El <strong>webhook</strong> (push) necesita una URL pública alcanzable por Hik-Connect;
          en local no aplica. Este demo usa <strong>polling</strong> de las colas MQ (
          <span className="endpoint-badge">rawmsg</span>,{" "}
          <span className="endpoint-badge">alarm</span>,{" "}
          <span className="endpoint-badge">combine</span>) y, como respaldo, consulta marcajes
          recientes con <span className="endpoint-badge">certificaterecords/search</span>.
        </p>
        <p>
          No todos los tenants publican eventos ACS en la cola MQ. Si el estado dice «suscrito» pero
          no llegan mensajes, el respaldo por marcajes es el canal fiable.
        </p>
        <p>
          Cada marcaje relaciona <strong>persona + puerta</strong>, no departamento. Filtrar por
          «entrada a un grupo» no existe en la API de eventos.
        </p>
      </ApiNote>

      <div className="content-card max-h-[480px] overflow-y-auto p-0">
        <ul className="divide-y divide-black/[0.04]">
          {visibleEvents.map((e) => (
            <li key={e.id} className="px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {e.personName}
                  <span className="ml-2 text-[12px] font-normal text-ink-secondary">
                    {e.msgLabel}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-ink-tertiary">
                  {e.channel} · {e.msgType}
                </span>
              </div>
              <p className="text-[12px] text-ink-secondary">
                {e.deviceName} · {e.resourceName}
              </p>
              <p className="font-mono text-[10px] text-ink-tertiary">{e.at}</p>
              <details className="mt-1">
                <summary className="cursor-pointer text-[11px] text-ink-tertiary">
                  Ver payload
                </summary>
                <pre className="mt-1 max-h-56 overflow-auto rounded-lg bg-black/[0.04] p-2 text-[10px] leading-tight">
                  {JSON.stringify(e.raw, null, 2)}
                </pre>
              </details>
            </li>
          ))}
          {!visibleEvents.length && (
            <li className="px-4 py-10 text-center text-ink-secondary">
              {events.length
                ? "Ningún evento coincide con los filtros."
                : "Sin eventos todavía. Inicia el visor y genera un marcaje en el dispositivo."}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
