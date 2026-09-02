import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getDoors } from "@/lib/hct/doors";
import { config } from "@/lib/config";
import { refreshDoors } from "@/app/actions";
import { DoorActions } from "@/components/DoorActions";
import { CameraFilters, type FilterValues } from "@/components/CameraFilters";
import { HctError } from "@/lib/hct/client";
import { RequireKeys } from "@/components/RequireKeys";
import { DeviceForm } from "@/components/DeviceForm";
import type { Door } from "@/lib/hct/types";

function applyFilters(doors: Door[], f: FilterValues): Door[] {
  const q = f.q.trim().toLowerCase();
  return doors.filter((d) => {
    if (q && !d.name.toLowerCase().includes(q) && !d.serial.toLowerCase().includes(q)) return false;
    if (f.area && d.area !== f.area) return false;
    if (f.status === "online" && !d.online) return false;
    if (f.status === "offline" && d.online) return false;
    return true;
  });
}

async function DoorList({ filters }: { filters: FilterValues }) {
  const session = await getSession();
  if (!session) redirect("/login");

  let doors: Door[];
  try {
    doors = await getDoors(config.mode);
  } catch (e) {
    const message =
      e instanceof HctError
        ? `${e.errorCode}: ${e.message}`
        : e instanceof Error
          ? e.message
          : "Error consultando HCT";
    return <div className="alert error">{message}</div>;
  }

  const isOperator = session.role === "operator";
  const areas = [...new Set(doors.map((d) => d.area).filter(Boolean))].sort();
  const filtered = applyFilters(doors, filters);

  return (
    <>
      <CameraFilters areas={areas} values={filters} withEncryption={false} />

      <div className="row" style={{ marginBottom: 16 }}>
        <span className="badge ok">{filtered.length} de {doors.length} puertas</span>
        <span className="badge ok">{doors.filter((d) => d.online).length} en línea</span>
        <span className="mono">cache: 'use cache' + cacheTag("doors")</span>
        <form action={refreshDoors}>
          <button className="btn ghost sm" type="submit">Actualizar inventario</button>
        </form>
        {isOperator && <DeviceForm defaultCategory="accessControllerDevice" />}
      </div>

      {!isOperator && (
        <div className="alert info">Rol viewer: solo lectura. Los comandos requieren rol operator.</div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Puerta</th>
            <th>Área</th>
            <th>Estado</th>
            <th>Dispositivo</th>
            {isOperator && <th>Comandos</th>}
          </tr>
        </thead>
        <tbody>
          {filtered.map((d) => {
            return (
              <tr key={d.id}>
                <td>
                  <Link href={`/doors/${d.id}`}>{d.name}</Link>
                </td>
                <td>{d.area || "—"}</td>
                <td>
                  <span className={`badge ${d.online ? "ok" : "off"}`}>
                    {d.online ? "En línea" : "Fuera"}
                  </span>
                </td>
                <td className="mono">{d.serial} · ch {d.channel}</td>
                {isOperator && (
                  <td>
                    <DoorActions doorId={d.id} doorName={d.name} />
                  </td>
                )}
              </tr>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={isOperator ? 5 : 4} className="mono">
                Ninguna puerta coincide con los filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

async function DoorsResolver({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const filters: FilterValues = {
    q: one(sp.q),
    area: one(sp.area),
    status: one(sp.status),
    enc: "",
  };
  return <DoorList filters={filters} />;
}

export default function DoorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <h1 className="page-title">Puertas</h1>
      <p className="page-sub">
        Control de acceso · los comandos exigen motivo y quedan en audit log
      </p>
      <Suspense fallback={<div className="spinner" />}>
        <RequireKeys>
          <DoorsResolver searchParams={searchParams} />
        </RequireKeys>
      </Suspense>
    </>
  );
}
