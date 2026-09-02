"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addPersonAction,
  assignLevel,
  removePerson,
  setCard,
  setPin,
} from "@/app/persons/actions";
import type { AccessLevel, Person, PersonGroup } from "@/lib/hct/types";

// Alta de persona + acciones por fila (tarjeta, PIN, nivel de acceso, borrar).
// Tarjeta/PIN se piden con prompt para no inflar la tabla; todo queda auditado.
export function PersonManager({
  persons,
  groups,
  levels,
  isOperator,
}: {
  persons: Person[];
  groups: PersonGroup[];
  levels: AccessLevel[];
  isOperator: boolean;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
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

  const fullName = (p: Person) => `${p.firstName} ${p.lastName}`.trim();

  return (
    <>
      <table className="table" style={{ marginBottom: isOperator ? 12 : 0 }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Email</th>
            <th>Vigencia</th>
            {isOperator && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {persons.map((p) => (
            <tr key={p.id}>
              <td>
                {fullName(p)}
                {p.hasPin && (
                  <span className="badge ok" style={{ marginLeft: 6 }}>PIN</span>
                )}
              </td>
              <td className="mono">{p.code || "—"}</td>
              <td>{p.email || "—"}</td>
              <td className="mono">
                {p.endDate ? p.endDate.slice(0, 10) : "—"}
              </td>
              {isOperator && (
                <td>
                  <span className="row" style={{ gap: 6 }}>
                    <button
                      className="btn ghost sm"
                      disabled={pending}
                      onClick={() => {
                        const card = prompt(`Número de tarjeta para ${fullName(p)}:`);
                        if (card) run(() => setCard(p.id, fullName(p), card));
                      }}
                    >
                      Tarjeta
                    </button>
                    <button
                      className="btn ghost sm"
                      disabled={pending}
                      onClick={() => {
                        const pin = prompt(`PIN (4-8 dígitos) para ${fullName(p)}:`);
                        if (pin) run(() => setPin(p.id, fullName(p), pin));
                      }}
                    >
                      PIN
                    </button>
                    <select
                      className="input"
                      style={{ maxWidth: 170, margin: 0 }}
                      disabled={pending || levels.length === 0}
                      value=""
                      onChange={(e) => {
                        const lvl = levels.find((l) => l.id === e.target.value);
                        if (lvl) run(() => assignLevel(p.id, fullName(p), lvl.id, lvl.name));
                      }}
                    >
                      <option value="">Asignar nivel…</option>
                      {levels.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn ghost sm"
                      disabled={pending}
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${fullName(p)}?`)) {
                          run(() => removePerson(p.id, fullName(p)));
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </span>
                </td>
              )}
            </tr>
          ))}
          {persons.length === 0 && (
            <tr>
              <td colSpan={isOperator ? 5 : 4} className="mono">
                Sin personas.
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
              await addPersonAction({
                groupId,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim() || undefined,
              });
              setFirstName("");
              setLastName("");
              setEmail("");
            });
          }}
        >
          <input
            className="input"
            style={{ maxWidth: 160 }}
            placeholder="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            className="input"
            style={{ maxWidth: 160 }}
            placeholder="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            className="input"
            style={{ maxWidth: 200 }}
            type="email"
            placeholder="Email (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="input"
            style={{ maxWidth: 180 }}
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            required
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <button className="btn sm" type="submit" disabled={pending || groups.length === 0}>
            Agregar persona
          </button>
        </form>
      )}
      {message && <p className="mono" style={{ marginTop: 8 }}>{message}</p>}
    </>
  );
}
