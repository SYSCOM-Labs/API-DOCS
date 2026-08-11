import { useId, useState, type ReactNode } from "react";

export type ApiNoteTone = "portal" | "api" | "tip";

interface Props {
  tone?: ApiNoteTone;
  title: string;
  /** Si true, arranca expandido. */
  defaultOpen?: boolean;
  children: ReactNode;
}

const TONE: Record<
  ApiNoteTone,
  { badge: string; shell: string; label: string }
> = {
  portal: {
    badge: "Portal Hik-Connect",
    label: "Configurar en portal",
    shell: "border-amber-200/90 bg-amber-50/70 text-amber-950",
  },
  api: {
    badge: "Límite de la API",
    label: "No disponible vía OpenAPI",
    shell: "border-sky-200/90 bg-sky-50/70 text-sky-950",
  },
  tip: {
    badge: "Nota de demo",
    label: "Cómo usar este apartado",
    shell: "border-black/[0.08] bg-white text-ink",
  },
};

/**
 * Nota interactiva plegable para aclarar qué se hace en el portal Hik-Connect
 * y qué no expone la OpenAPI. Pensada para demos con clientes SYSCOM.
 */
export function ApiNote({ tone = "portal", title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const style = TONE[tone];

  return (
    <div className={`rounded-2xl border px-4 py-3 ${style.shell}`}>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="min-w-0">
          <span className="inline-flex rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
            {style.badge}
          </span>
          <span className="mt-1.5 block text-sm font-semibold">{title}</span>
          {!open && <span className="mt-0.5 block text-[11px] opacity-70">{style.label}</span>}
        </span>
        <span className="mt-0.5 shrink-0 text-xs font-medium opacity-70">
          {open ? "Ocultar" : "Ver detalle"}
        </span>
      </button>
      {open && (
        <div id={panelId} className="mt-3 space-y-2 text-sm leading-relaxed opacity-95">
          {children}
        </div>
      )}
    </div>
  );
}
