import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getPersonGroups, getPersons } from "@/lib/hct/persons";
import { getAccessLevels } from "@/lib/hct/accessLevels";
import { HctError } from "@/lib/hct/client";
import { config } from "@/lib/config";
import { RequireKeys } from "@/components/RequireKeys";
import { GroupManager } from "@/components/GroupManager";
import { PersonManager } from "@/components/PersonManager";

async function PersonsContent() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isOperator = session.role === "operator";

  let groups, persons, levels;
  try {
    [groups, persons, levels] = await Promise.all([
      getPersonGroups(config.mode),
      getPersons(config.mode, 1, 100),
      getAccessLevels(config.mode),
    ]);
  } catch (e) {
    const message =
      e instanceof HctError
        ? `${e.errorCode}: ${e.message}`
        : e instanceof Error
          ? e.message
          : "Error consultando HCT";
    return <div className="alert error">{message}</div>;
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Grupos (departamentos)</h3>
        <p className="meta" style={{ marginBottom: 12 }}>
          Toda persona pertenece a un grupo. Crear/eliminar grupos es operador y queda en audit
          log.
        </p>
        <GroupManager groups={groups} isOperator={isOperator} />
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 8 }}>Personas</h3>
        <p className="meta" style={{ marginBottom: 12 }}>
          Alta de personas en un grupo, credenciales (tarjeta, PIN) y asignación de nivel de
          acceso. La foto facial y la huella se capturan desde dispositivo físico (ver nota
          abajo).
        </p>
        <PersonManager persons={persons.items} groups={groups} levels={levels} isOperator={isOperator} />
        {persons.total > persons.items.length && (
          <p className="mono" style={{ marginTop: 8 }}>
            Mostrando {persons.items.length} de {persons.total}
          </p>
        )}
      </div>
    </>
  );
}

export default function PersonsPage() {
  return (
    <>
      <h1 className="page-title">Personas</h1>
      <p className="page-sub">
        Grupos, personas y credenciales · OpenAPI person/v1 + acspm/v1
      </p>
      <Suspense fallback={<div className="spinner" />}>
        <RequireKeys>
          <PersonsContent />
        </RequireKeys>
      </Suspense>
    </>
  );
}
