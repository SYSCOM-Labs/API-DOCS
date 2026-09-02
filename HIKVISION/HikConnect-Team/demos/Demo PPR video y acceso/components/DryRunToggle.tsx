"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setDryRun } from "@/app/settings/actions";

// Interruptor en caliente del modo simulacion: escribe data/settings.json y
// aplica sin reiniciar. ON = los comandos de puerta solo se auditan;
// OFF = se envian de verdad al tenant de Hik-Connect.
export function DryRunToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <span className="row">
      <button
        className={enabled ? "btn sm" : "btn ghost sm"}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await setDryRun(true);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error");
            }
          })
        }
      >
        Simulados (seguro)
      </button>
      <button
        className={!enabled ? "btn sm" : "btn ghost sm"}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await setDryRun(false);
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Error");
            }
          })
        }
      >
        Reales (abren puertas)
      </button>
      {error && <span className="mono">{error}</span>}
    </span>
  );
}
