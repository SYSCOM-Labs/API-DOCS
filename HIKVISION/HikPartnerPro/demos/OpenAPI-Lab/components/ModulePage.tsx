import { OpsGrid } from "@/components/OperationCard";
import { moduleBySlug } from "@/lib/operations";

export function ModulePage({ slug, extra }: { slug: string; extra?: React.ReactNode }) {
  const mod = moduleBySlug(slug);
  if (!mod) return <p>Módulo no encontrado.</p>;
  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Módulo OpenAPI</span>
        <h2>{mod.title}</h2>
        <p>{mod.blurb}</p>
      </header>
      {extra}
      <div className="module-actions-head">
        <div>
          <h3>Acciones disponibles</h3>
          <p className="desc">
            Cada tarjeta explica la acción, completa el endpoint y muestra la respuesta exacta de HPP.
            Los campos obligatorios están marcados; los seriales se pueden elegir del inventario.
          </p>
        </div>
        <span className="chip">{mod.ops.length} operación(es)</span>
      </div>
      <OpsGrid ops={mod.ops} />
    </>
  );
}
