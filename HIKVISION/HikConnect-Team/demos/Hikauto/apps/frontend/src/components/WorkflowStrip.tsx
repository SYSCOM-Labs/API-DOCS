import { GUIDES } from "../content/guides";

interface WorkflowStripProps {
  activeTab: string;
  isConfigured: boolean;
}

const TAB_ORDER = ["platform", "vehicles", "drivers", "acc", "stream", "telemetry"] as const;

const TAB_LABELS: Record<string, string> = {
  platform: "0. Plataforma",
  vehicles: "1. Vehículo",
  drivers: "2. Conductor",
  acc: "3. ACC",
  stream: "4. Video",
  telemetry: "5. GPS",
};

/**
 * Franja superior con flujo recomendado de aprendizaje/prueba.
 */
export function WorkflowStrip({ activeTab, isConfigured }: WorkflowStripProps) {
  const activeIndex = TAB_ORDER.indexOf(activeTab as (typeof TAB_ORDER)[number]);

  return (
    <div className="border-b border-slate-800 bg-slate-900/50 px-4 py-2">
      <p className="mb-2 text-[11px] text-slate-500">
        Flujo sugerido: conectar cuenta → inventario → vehículo → conductor → ACC → video → telemetría
        {!isConfigured && (
          <span className="ml-2 text-amber-400">· Conecta Account + Password o usa Sandbox</span>
        )}
      </p>
      <div className="flex flex-wrap gap-1">
        {TAB_ORDER.map((id, i) => {
          const done = activeIndex >= 0 && i < activeIndex;
          const current = id === activeTab;
          return (
            <span
              key={id}
              className={`rounded px-2 py-0.5 text-[10px] ${
                current
                  ? "bg-hik-blue text-white"
                  : done
                    ? "bg-emerald-900/50 text-emerald-300"
                    : "bg-slate-800 text-slate-500"
              }`}
            >
              {TAB_LABELS[id]}
            </span>
          );
        })}
      </div>
      {GUIDES[activeTab] && (
        <p className="mt-2 text-xs text-slate-400">{GUIDES[activeTab].summary}</p>
      )}
      {activeTab === "platform" && (
        <p className="mt-2 text-xs text-slate-400">
          Inventario de tu cuenta Hik-Connect: áreas, vehículos, cámaras y conductores para autocompletar el demo.
        </p>
      )}
    </div>
  );
}
