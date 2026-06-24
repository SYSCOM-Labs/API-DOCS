import type { HudEntry } from "../types";

import { btnGhost } from "./ui/classes";



interface CodeHudPanelProps {

  entries: HudEntry[];

  onClear: () => void;

  onClose?: () => void;

}



function JsonBlock({ label, data }: { label: string; data: unknown }) {

  return (

    <div className="mt-2">

      <div className="text-[10px] font-medium uppercase tracking-wide text-ink-tertiary">

        {label}

      </div>

      <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-neutral-900 p-3 text-[11px] leading-relaxed text-emerald-300">

        {JSON.stringify(data, null, 2)}

      </pre>

    </div>

  );

}



/** Panel lateral: request/response de cada llamada API. */

export function CodeHudPanel({ entries, onClear, onClose }: CodeHudPanelProps) {

  return (

    <div className="flex h-full flex-col">

      <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">

        <div>

          <h2 className="text-sm font-semibold text-ink">Inspector API</h2>

          <p className="text-xs text-ink-secondary">Request, response y código fuente</p>

        </div>

        <div className="flex gap-1">

          <button type="button" onClick={onClear} className={btnGhost}>

            Limpiar

          </button>

          {onClose && (

            <button type="button" onClick={onClose} className={`${btnGhost} lg:hidden`}>

              Cerrar

            </button>

          )}

        </div>

      </div>



      <div className="flex-1 overflow-y-auto p-5">

        {entries.length === 0 && (

          <div className="flex h-full flex-col items-center justify-center px-4 text-center">

            <p className="text-sm text-ink-secondary">Sin llamadas aún</p>

            <p className="mt-2 max-w-xs text-xs leading-relaxed text-ink-tertiary">

              Cada acción en el panel principal aparecerá aquí con el payload completo y la

              respuesta de Hik-Connect.

            </p>

          </div>

        )}



        {entries.map((entry) => (

          <div key={entry.id} className="hud-entry">

            <div className="flex justify-between gap-2">

              <span className="font-semibold text-ink">{entry.label}</span>

              <span className="shrink-0 text-ink-tertiary">

                {entry.timestamp.toLocaleTimeString()}

              </span>

            </div>



            {entry.debug && (

              <>

                <div className="mt-2 break-all text-[11px]">

                  <span className="rounded bg-accent/10 px-1.5 py-0.5 font-semibold text-accent">

                    {entry.debug.verb}

                  </span>{" "}

                  <span className="text-ink-secondary">{entry.debug.targetUrl}</span>

                </div>

                <JsonBlock label="Request" data={entry.debug.requestPayload} />

                <JsonBlock label="Response" data={entry.debug.responseBody} />

                <div className="hud-source">

                  {entry.debug.sourceFile}

                </div>

              </>

            )}



            {entry.extra !== undefined && !entry.debug && (

              <JsonBlock label="Evento" data={entry.extra} />

            )}

          </div>

        ))}

      </div>

    </div>

  );

}

