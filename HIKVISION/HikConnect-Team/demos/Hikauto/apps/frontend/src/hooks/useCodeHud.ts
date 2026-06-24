import { useCallback, useState } from "react";
import type { HudEntry, ProxyDebugInfo } from "../types";

/**
 * Acumula entradas del Code HUD (panel derecho) para cada operación del playground.
 */
export function useCodeHud() {
  const [entries, setEntries] = useState<HudEntry[]>([]);

  const pushEntry = useCallback(
    (label: string, debug?: ProxyDebugInfo, extra?: unknown) => {
      setEntries((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date(),
          label,
          debug,
          extra,
        },
        ...prev.slice(0, 99),
      ]);
    },
    []
  );

  const clear = useCallback(() => setEntries([]), []);

  return { entries, pushEntry, clear };
}
