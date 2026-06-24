import { btnGhost } from "./ui/classes";

export type DeskTabId = "platform" | "vehicles" | "drivers" | "acc" | "stream" | "telemetry";

const ITEMS: { id: DeskTabId; label: string; short: string; endpoint: string }[] = [
  { id: "platform", label: "Plataforma", short: "P", endpoint: "GET /areas" },
  { id: "vehicles", label: "Vehículos", short: "V", endpoint: "POST /vehicles/add" },
  { id: "drivers", label: "Conductores", short: "C", endpoint: "POST /driver/add" },
  { id: "acc", label: "Ignición ACC", short: "A", endpoint: "POST /accstatus" },
  { id: "stream", label: "Video", short: "▶", endpoint: "POST /video/live" },
  { id: "telemetry", label: "Telemetría", short: "G", endpoint: "POST /mq/subscribe" },
];

interface SidebarNavProps {
  activeTab: DeskTabId;
  onSelect: (id: DeskTabId) => void;
  compact: boolean;
  onToggleCompact: () => void;
}

export function SidebarNav({ activeTab, onSelect, compact, onToggleCompact }: SidebarNavProps) {
  return (
    <nav
      className={`sidebar-shell hidden shrink-0 flex-col border-r border-black/[0.06] bg-surface-sidebar md:flex ${
        compact ? "w-[52px]" : "w-56"
      }`}
    >
      <div className={`flex items-center ${compact ? "justify-center p-2" : "justify-between px-4 py-3"}`}>
        {!compact && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary">
            Endpoints
          </p>
        )}
        <button
          type="button"
          onClick={onToggleCompact}
          className={`${btnGhost} !px-2`}
          title={compact ? "Expandir menú" : "Compactar menú"}
          aria-label={compact ? "Expandir menú" : "Compactar menú"}
        >
          {compact ? "»" : "«"}
        </button>
      </div>

      <ul className={`flex-1 space-y-0.5 ${compact ? "px-1.5" : "px-3"}`}>
        {ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              title={compact ? item.label : undefined}
              onClick={() => onSelect(item.id)}
              className={`sidebar-nav-item ${compact ? "sidebar-nav-item-compact" : ""} ${
                activeTab === item.id ? "sidebar-nav-item-active" : "sidebar-nav-item-idle"
              }`}
            >
              {compact ? (
                <span className="text-sm font-semibold">{item.short}</span>
              ) : (
                <>
                  <span className="text-sm font-medium">{item.label}</span>
                  <span
                    className={`mt-0.5 font-mono text-[10px] ${
                      activeTab === item.id ? "text-white/70" : "text-ink-tertiary"
                    }`}
                  >
                    {item.endpoint}
                  </span>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export { ITEMS as NAV_ITEMS };
