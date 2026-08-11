import type { ReactNode } from "react";
import type { PlatformSnapshot } from "../../types";
import { ApiNote } from "../ui/ApiNote";

interface Props {
  platform: PlatformSnapshot | null;
}

export function PlatformTab({ platform }: Props) {
  if (!platform) {
    return <p className="text-sm text-ink-secondary">Conecta primero para ver el inventario.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ink">Plataforma</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Inventario descubierto · <span className="endpoint-badge">{platform.areaDomain}</span>
        </p>
      </div>

      <ApiNote tone="portal" title="El inventario se crea en Hik-Connect, no en esta demo">
        <p>
          Áreas, dispositivos ACS y puertas se configuran en el portal (o se agregan por APIs de
          recursos fuera del alcance de esta demo de asistencia). Aquí solo se <strong>descubren</strong>{" "}
          y se muestran para operar encima de ellos.
        </p>
      </ApiNote>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Áreas" badge="resource/v1/areas/get">
          <ul className="space-y-2">
            {platform.areas.map((a) => (
              <li key={a.id} className="flex justify-between text-sm">
                <span>{a.name}</span>
                <span className="font-mono text-[11px] text-ink-tertiary">{a.id.slice(0, 8)}…</span>
              </li>
            ))}
            {!platform.areas.length && <Empty />}
          </ul>
        </Section>

        <Section title="Dispositivos" badge="resource/v1/devices/get">
          <ul className="space-y-2">
            {platform.devices.map((d) => (
              <li key={d.id || d.serialNo} className="text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{d.name}</span>
                  <OnlineBadge online={d.onlineStatus === "1" || d.onlineStatus === "online"} />
                </div>
                <p className="text-[11px] text-ink-tertiary">
                  {d.category || "—"} · {d.serialNo || "sin serial"}
                </p>
              </li>
            ))}
            {!platform.devices.length && <Empty />}
          </ul>
        </Section>

        <Section title="Puertas" badge="resource/v1/areas/doors/get">
          <ul className="space-y-2">
            {platform.doors.map((d) => (
              <li key={d.id} className="text-sm">
                <span className="font-medium">{d.name}</span>
                <p className="text-[11px] text-ink-tertiary">
                  {d.areaName || "—"} · {d.deviceSerial || "—"}
                </p>
              </li>
            ))}
            {!platform.doors.length && <Empty />}
          </ul>
        </Section>

        <Section title="Departamentos" badge="person/v1/groups/search">
          <ul className="space-y-2">
            {platform.personGroups.map((g) => (
              <li key={g.id} className="flex justify-between text-sm">
                <span>{g.name}</span>
                <span className="text-ink-tertiary">{g.personCount ?? 0} pers.</span>
              </li>
            ))}
            {!platform.personGroups.length && <Empty />}
          </ul>
        </Section>
      </div>

      <div className="content-card">
        <p className="section-label mb-3">Llamadas de descubrimiento</p>
        <ul className="space-y-1 font-mono text-[11px]">
          {platform.calls.map((c, i) => (
            <li key={i} className="flex justify-between gap-2">
              <span>
                {c.label}: {c.path}
              </span>
              <span className={c.errorCode === "0" ? "text-emerald-600" : "text-red-600"}>
                {c.errorCode}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="content-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-ink">{title}</h3>
        <span className="endpoint-badge">{badge}</span>
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-ink-secondary">Sin datos</p>;
}

function OnlineBadge({ online }: { online: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
        online ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-ink-tertiary"
      }`}
    >
      {online ? "Online" : "Offline"}
    </span>
  );
}
