import type { HudEntry } from "../types";
import { btnGhost } from "./ui/classes";

interface Props {
  entries: HudEntry[];
  onClear: () => void;
  onClose: () => void;
}

export function CodeHudPanel({ entries, onClear, onClose }: Props) {
  return (
    <aside className="flex h-full w-[420px] shrink-0 flex-col border-l border-black/[0.06] bg-surface-raised shadow-panel">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink">Inspector API</p>
          <p className="text-[11px] text-ink-tertiary">Request / response crudo</p>
        </div>
        <div className="flex gap-1">
          <button type="button" className={btnGhost} onClick={onClear}>
            Limpiar
          </button>
          <button type="button" className={btnGhost} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {entries.length === 0 && (
          <p className="text-sm text-ink-secondary">Aún no hay llamadas. Ejecuta una acción.</p>
        )}
        {entries.map((e) => (
          <div key={e.id} className="hud-entry">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-sans text-xs font-semibold text-ink">{e.label}</span>
              <span className="text-[10px] text-ink-tertiary">{e.at}</span>
            </div>
            {e.debug && (
              <>
                <p className="text-[11px] text-accent">
                  {e.debug.verb} {e.debug.targetUrl}
                </p>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10px] text-ink-secondary">
                  {JSON.stringify(
                    {
                      request: e.debug.requestPayload,
                      response: e.debug.responseBody,
                      source: e.debug.sourceFile,
                    },
                    null,
                    2
                  )}
                </pre>
              </>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
