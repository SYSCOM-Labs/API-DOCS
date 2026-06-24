import { useState } from "react";

import type { SectionGuide } from "../content/guides";



interface GuidePanelProps {

  guide: SectionGuide;

  defaultOpen?: boolean;

}



/** Guía colapsable — visible solo cuando el desarrollador la necesita. */

export function GuidePanel({ guide, defaultOpen = false }: GuidePanelProps) {

  const [open, setOpen] = useState(defaultOpen);



  if (!open) {

    return (

      <button

        type="button"

        onClick={() => setOpen(true)}

        className="text-sm text-accent hover:underline"

      >

        Ver guía · {guide.title}

      </button>

    );

  }



  return (

    <aside className="content-card text-sm">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="section-label">Guía</p>

          <h3 className="mt-1 font-semibold text-ink">{guide.title}</h3>

          <p className="mt-2 text-ink-secondary leading-relaxed">{guide.summary}</p>

        </div>

        <button

          type="button"

          onClick={() => setOpen(false)}

          className="shrink-0 text-xs text-ink-tertiary hover:text-ink"

        >

          Cerrar

        </button>

      </div>



      <div className="mt-5 space-y-4 border-t border-black/[0.06] pt-5">

        <p className="text-ink-secondary leading-relaxed">{guide.howItWorks}</p>



        <ol className="guide-steps space-y-3">

          {guide.steps.map((step, i) => (

            <li key={step.title} className="flex gap-3">

              <span className="guide-step-num">{i + 1}</span>

              <div>

                <p className="font-medium text-ink">{step.title}</p>

                <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">

                  {step.detail}

                </p>

              </div>

            </li>

          ))}

        </ol>



        <div className="rounded-xl bg-neutral-50 px-3 py-2 font-mono text-[11px] text-ink-tertiary">

          <div>{guide.apiHik}</div>

          <div className="mt-0.5 text-accent/80">{guide.sourceFile}</div>

        </div>

      </div>

    </aside>

  );

}



interface FormFieldProps {

  label: string;

  hint?: string;

  children: React.ReactNode;

}



export function FormField({ label, hint, children }: FormFieldProps) {

  return (

    <label className="block">

      <span className="text-sm font-medium text-ink">{label}</span>

      {hint && <p className="mb-1.5 text-xs text-ink-tertiary">{hint}</p>}

      {children}

    </label>

  );

}

