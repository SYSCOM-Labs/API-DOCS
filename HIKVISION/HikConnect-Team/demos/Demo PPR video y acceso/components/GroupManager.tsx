"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addGroup, removeGroup } from "@/app/persons/actions";
import type { PersonGroup } from "@/lib/hct/types";

export function GroupManager({
  groups,
  isOperator,
}: {
  groups: PersonGroup[];
  isOperator: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<unknown>) {
    setMessage("");
    startTransition(async () => {
      try {
        await fn();
        router.refresh();
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Error");
      }
    });
  }

  return (
    <>
      <table className="table" style={{ marginBottom: isOperator ? 12 : 0 }}>
        <thead>
          <tr>
            <th>Grupo</th>
            <th>Ruta</th>
            <th>Personas</th>
            {isOperator && <th></th>}
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id}>
              <td>{g.name}</td>
              <td className="mono">{g.fullPath || "—"}</td>
              <td>{g.personCount}</td>
              {isOperator && (
                <td>
                  <button
                    className="btn ghost sm"
                    disabled={pending}
                    onClick={() => {
                      if (confirm(`¿Eliminar el grupo "${g.name}"?`)) {
                        run(() => removeGroup(g.id, g.name));
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
          {groups.length === 0 && (
            <tr>
              <td colSpan={isOperator ? 4 : 3} className="mono">
                Sin grupos en el tenant.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isOperator && (
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              await addGroup(name);
              setName("");
            });
          }}
        >
          <input
            className="input"
            style={{ maxWidth: 240 }}
            placeholder="Nombre del nuevo grupo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button className="btn sm" type="submit" disabled={pending}>
            Crear grupo
          </button>
          {message && <span className="mono">{message}</span>}
        </form>
      )}
      {!isOperator && message && <p className="mono">{message}</p>}
      {isOperator && message && !name && <p className="mono">{message}</p>}
    </>
  );
}
