"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveHctField } from "@/app/settings/actions";

// Valor editable inline: se ve como texto (enmascarado si es secreto) y al
// hacer clic se convierte en cuadro de texto. Enter guarda, Esc cancela.
// En secretos el input arranca vacio (nunca se revela el valor actual).
export function EditableValue({
  field,
  display,
  secret = false,
}: {
  field: "host" | "appKey" | "secretKey";
  display: string;
  secret?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function save() {
    if (!value.trim()) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      try {
        await saveHctField(field, value);
        setEditing(false);
        setValue("");
        setMessage("Guardado");
        router.refresh();
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Error");
      }
    });
  }

  if (!editing) {
    return (
      <span className="row" style={{ gap: 8 }}>
        <button
          type="button"
          className="editable-value mono"
          title="Clic para editar"
          onClick={() => {
            setEditing(true);
            setValue(secret ? "" : display);
            setMessage("");
          }}
        >
          {display}
        </button>
        {message && <span className="badge ok">{message}</span>}
      </span>
    );
  }

  return (
    <span className="row" style={{ gap: 8 }}>
      <input
        className="input mono"
        style={{ maxWidth: 340, margin: 0 }}
        type={secret ? "password" : "text"}
        placeholder={secret ? "Nuevo valor…" : ""}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
          if (e.key === "Escape") setEditing(false);
        }}
        autoFocus
        disabled={pending}
        autoComplete="off"
      />
      <button type="button" className="btn sm" onClick={save} disabled={pending}>
        {pending ? "…" : "Guardar"}
      </button>
      <button type="button" className="btn ghost sm" onClick={() => setEditing(false)} disabled={pending}>
        Cancelar
      </button>
      {message && <span className="mono">{message}</span>}
    </span>
  );
}
