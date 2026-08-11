import { useCallback, useState } from "react";
import type { HudEntry, ProxyDebugInfo } from "../types";

export function useCodeHud() {
  const [entries, setEntries] = useState<HudEntry[]>([]);

  const pushEntry = useCallback((label: string, debug?: ProxyDebugInfo) => {
    setEntries((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        label,
        at: new Date().toLocaleTimeString(),
        debug,
      },
      ...prev,
    ].slice(0, 40));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, pushEntry, clear };
}
