"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DoorCommand = "unlock" | "lock" | "remain_unlock" | "remain_lock";

const LABELS: Record<DoorCommand, string> = {
  unlock: "Abrir",
  lock: "Bloquear",
  remain_unlock: "Dejar abierta",
  remain_lock: "Dejar bloqueada",
};

// full=false: acciones rapidas para el listado (abrir/bloquear).
// full=true: las 4 acciones del OpenAPI para la pagina de detalle.
export function DoorActions({
  doorId,
  doorName,
  full = false,
}: {
  doorId: string;
  doorName: string;
  full?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function send(action: DoorCommand) {
    const reason = window.prompt(`Motivo para "${LABELS[action]}" en "${doorName}":`);
    if (!reason) return;
    setBusy(true);
    setMessage("");
    const res = await fetch(`/api/doors/${doorId}/commands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string; simulated?: boolean } | null;
    setBusy(false);
    if (!res.ok) {
      setMessage(data?.error ?? "Error en el comando");
      return;
    }
    setMessage(data?.simulated ? "Comando simulado (dry-run/mock) y auditado" : "Comando enviado");
    router.refresh();
  }

  const actions: DoorCommand[] = full
    ? ["unlock", "remain_unlock", "lock", "remain_lock"]
    : ["unlock", "lock"];

  return (
    <span className="row">
      {actions.map((a, i) => (
        <button
          key={a}
          className={i === 0 ? "btn sm" : "btn ghost sm"}
          disabled={busy}
          onClick={() => send(a)}
        >
          {LABELS[a]}
        </button>
      ))}
      {message && <span className="mono">{message}</span>}
    </span>
  );
}
