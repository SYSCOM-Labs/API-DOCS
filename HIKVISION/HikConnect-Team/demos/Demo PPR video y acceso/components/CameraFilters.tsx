"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface FilterValues {
  q: string;
  area: string;
  status: string;
  enc: string;
}

// Barra de filtros: escribe en la URL (searchParams) para que el filtrado
// ocurra server-side sobre el inventario cacheado y la URL sea compartible.
// withEncryption=false la reutiliza la pagina de puertas (sin filtro de cifrado).
export function CameraFilters({
  areas,
  values,
  withEncryption = true,
}: {
  areas: string[];
  values: FilterValues;
  withEncryption?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(values.q);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(next: Partial<FilterValues>) {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...values, q, ...next };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    if (q === values.q) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push({ q }), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="row">
        <input
          className="input"
          style={{ maxWidth: 280 }}
          placeholder="Buscar por nombre o serial…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input"
          style={{ maxWidth: 200 }}
          value={values.area}
          onChange={(e) => push({ area: e.target.value })}
        >
          <option value="">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          className="input"
          style={{ maxWidth: 160 }}
          value={values.status}
          onChange={(e) => push({ status: e.target.value })}
        >
          <option value="">Estado: todos</option>
          <option value="online">En línea</option>
          <option value="offline">Fuera de línea</option>
        </select>
        {withEncryption && (
          <select
            className="input"
            style={{ maxWidth: 200 }}
            value={values.enc}
            onChange={(e) => push({ enc: e.target.value })}
          >
            <option value="">Cifrado: todos</option>
            <option value="plain">Sin cifrar (live sin código)</option>
            <option value="encrypted">Cifradas (piden código)</option>
            <option value="unknown">Sin dato de cifrado</option>
          </select>
        )}
      </div>
    </div>
  );
}
