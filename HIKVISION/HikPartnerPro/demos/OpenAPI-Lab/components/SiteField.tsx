"use client";

import { useSites } from "@/lib/sites";

export function SiteField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (siteId: string) => void;
  placeholder?: string;
}) {
  const { sites, loading, error } = useSites();

  return (
    <div className="site-field">
      <input
        className="field"
        value={value}
        placeholder={placeholder ?? "ID del sitio"}
        onChange={(event) => onChange(event.target.value)}
      />
      <select
        className="field"
        value={sites.some((site) => site.id === value) ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        title={error || "Seleccionar un sitio de la cuenta"}
      >
        <option value="">
          {loading ? "Cargando sitios…" : error ? "No se pudieron cargar" : `Sitios (${sites.length})`}
        </option>
        {sites.map((site) => (
          <option key={site.id} value={site.id ?? ""}>
            {site.name ?? site.siteName ?? site.id} · {site.siteCity ?? site.siteState ?? site.id}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MultiSiteField({
  value,
  onChange,
}: {
  value: string;
  onChange: (json: string) => void;
}) {
  const { sites, loading } = useSites();
  let selected: string[] = [];
  try {
    const parsed = JSON.parse(value || "[]");
    if (Array.isArray(parsed)) selected = parsed.filter((item): item is string => typeof item === "string");
  } catch {
    // Permite corregir JSON manualmente.
  }

  function toggle(id: string) {
    const next = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    onChange(JSON.stringify(next));
  }

  return (
    <div className="multi-serial-field">
      <textarea className="field" value={value} onChange={(event) => onChange(event.target.value)} />
      <details>
        <summary>
          Elegir sitios
          <span>{selected.length ? `${selected.length} seleccionado(s)` : "ninguno"}</span>
        </summary>
        <div className="site-option-list">
          {loading && <div className="empty-state compact">Cargando sitios…</div>}
          {sites.map((site) => {
            const id = site.id ?? "";
            return (
              <button
                type="button"
                key={id}
                className={selected.includes(id) ? "active" : ""}
                onClick={() => toggle(id)}
              >
                <strong>{site.name ?? site.siteName ?? id}</strong>
                <small>{id}</small>
                <span>{selected.includes(id) ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      </details>
    </div>
  );
}
