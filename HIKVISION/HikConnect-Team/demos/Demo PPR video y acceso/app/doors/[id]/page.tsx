import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDoors } from "@/lib/hct/doors";
import { getAccessEvents } from "@/lib/hct/events";
import { HctError } from "@/lib/hct/client";
import { config } from "@/lib/config";
import { DoorActions } from "@/components/DoorActions";
import { RequireKeys } from "@/components/RequireKeys";
import type { Door } from "@/lib/hct/types";

async function DoorEvents({ door }: { door: Door }) {
  try {
    // En live filtra server-side por punto de acceso (elementIDs); en mock por nombre.
    const paged = await getAccessEvents(config.mode, 1, 10, door.id);
    const items =
      config.mode === "mock" ? paged.items.filter((e) => e.doorName === door.name) : paged.items;

    if (items.length === 0) {
      return <div className="card mono">Sin marcaciones en las últimas 48 h.</div>;
    }
    return (
      <table className="table">
        <thead>
          <tr>
            <th>Persona</th>
            <th>Método</th>
            <th>Resultado</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id}>
              <td>{e.personName}</td>
              <td>{e.method}</td>
              <td>
                <span className={`badge ${e.result === "Éxito" ? "ok" : "warn"}`}>{e.result || "—"}</span>
              </td>
              <td className="mono">{e.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } catch (e) {
    const message = e instanceof HctError ? `${e.errorCode}: ${e.message}` : "Error consultando marcaciones";
    return <div className="alert error">{message}</div>;
  }
}

async function DoorDetail({ id }: { id: string }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const door = (await getDoors(config.mode)).find((d) => d.id === id);
  if (!door) {
    return <div className="alert error">Puerta no encontrada.</div>;
  }

  const isOperator = session.role === "operator";

  return (
    <>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 20 }}>{door.name}</h3>
          <span className={`badge ${door.online ? "ok" : "off"}`}>
            {door.online ? "En línea" : "Fuera de línea"}
          </span>
        </div>
        <div className="meta">{door.area || "Sin área"}</div>
        <div className="mono">
          id {door.id} · serial {door.serial} · canal {door.channel}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Comandos remotos</h3>
        {isOperator ? (
          <>
            <p className="meta" style={{ marginBottom: 12 }}>
              Cada comando exige motivo y queda en el audit log. "Abrir" es un pulso; "Dejar
              abierta/bloqueada" mantiene el estado hasta nuevo comando.
            </p>
            <DoorActions doorId={door.id} doorName={door.name} full />
          </>
        ) : (
          <div className="alert info">Rol viewer: solo lectura. Los comandos requieren rol operator.</div>
        )}
      </div>

      <h3 style={{ marginBottom: 12 }}>Marcaciones recientes (48 h)</h3>
      <Suspense fallback={<div className="card"><div className="spinner" /></div>}>
        <DoorEvents door={door} />
      </Suspense>
    </>
  );
}

async function DoorResolver({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DoorDetail id={id} />;
}

export default function DoorPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <p style={{ marginTop: 24 }}>
        <Link href="/doors">← Puertas</Link>
      </p>
      <Suspense fallback={<div className="spinner" />}>
        <RequireKeys>
          <DoorResolver params={params} />
        </RequireKeys>
      </Suspense>
    </>
  );
}
