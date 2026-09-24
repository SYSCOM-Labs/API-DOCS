import type { PageGuide as PageGuideData } from "@/lib/guides";

export function PageGuide({ guide }: { guide?: PageGuideData }) {
  if (!guide) return null;

  return (
    <details className="page-guide" open>
      <summary>
        <span className="guide-icon">?</span>
        <span>
          <strong>{guide.title}</strong>
          <small>Qué hace, para qué sirve y cómo empezar</small>
        </span>
        <span className="guide-toggle">Ocultar / mostrar</span>
      </summary>
      <div className="guide-body">
        <div className="guide-purpose">
          <span className="eyebrow">Propósito</span>
          <p>{guide.purpose}</p>
          <div className="guide-use-cases">
            {guide.uses.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div>
          <span className="eyebrow">Cómo usarlo</span>
          <ol className="guide-steps">
            {guide.steps.map((step, index) => (
              <li key={step}><span>{index + 1}</span>{step}</li>
            ))}
          </ol>
        </div>
        {guide.warning && (
          <div className="guide-warning">
            <strong>Ten en cuenta</strong>
            <span>{guide.warning}</span>
          </div>
        )}
      </div>
    </details>
  );
}
