import type { DeskTabId } from "../types";

const TABS: Array<{ id: DeskTabId; title: string; subtitle: string }> = [
  { id: "dashboard", title: "Dashboard", subtitle: "KPIs del día" },
  { id: "platform", title: "Plataforma", subtitle: "Áreas · ACS · puertas" },
  { id: "persons", title: "Personas", subtitle: "Grupos y credenciales" },
  { id: "access", title: "Niveles", subtitle: "Asignación de acceso" },
  { id: "doors", title: "Puertas", subtitle: "Apertura remota" },
  { id: "records", title: "Marcajes", subtitle: "Certificate records" },
  { id: "timecard", title: "Time card", subtitle: "Reporte asistencia" },
  { id: "events", title: "Eventos", subtitle: "Feed en vivo MQ" },
];

interface Props {
  active: DeskTabId;
  onSelect: (id: DeskTabId) => void;
}

export function SidebarNav({ active, onSelect }: Props) {
  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-black/[0.06] bg-surface-sidebar p-3">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : "sidebar-nav-item-idle"}`}
            onClick={() => onSelect(tab.id)}
          >
            <span className="text-sm font-medium">{tab.title}</span>
            <span className={`text-[11px] ${isActive ? "text-white/80" : "text-ink-tertiary"}`}>
              {tab.subtitle}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
