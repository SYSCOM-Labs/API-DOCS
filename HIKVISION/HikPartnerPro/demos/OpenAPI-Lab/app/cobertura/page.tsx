import { CHECKLIST } from "@/lib/catalog";

export default function Page() {
  return (
    <>
      <header className="page-head">
        <h2>Cobertura OpenAPI V2.15.500</h2>
        <p>
          Inventario de capacidades de la guía frente a este lab. Nada se persiste en servidor; las
          pruebas viven en tu sesión de cookies.
        </p>
      </header>
      <div className="grid two">
        {CHECKLIST.map((block) => (
          <section key={block.group} className="neu">
            <h3>{block.group}</h3>
            {block.items.map((item) => (
              <div className="check-item" key={item.api}>
                <div>
                  <div>{item.api}</div>
                  <div className="desc" style={{ margin: 0 }}>
                    {item.where}
                    {"note" in item && item.note ? ` · ${item.note}` : ""}
                  </div>
                </div>
                <span className={`chip ${item.status === "in" ? "ok" : "warn"}`}>
                  {item.status === "in" ? "en el lab" : "fuera"}
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
