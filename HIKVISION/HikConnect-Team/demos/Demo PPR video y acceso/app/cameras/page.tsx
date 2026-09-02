import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getCamerasWithEncryption } from "@/lib/hct/cameras";
import { config } from "@/lib/config";
import { refreshCameras } from "@/app/actions";
import { HctError } from "@/lib/hct/client";
import { CameraFilters, type FilterValues } from "@/components/CameraFilters";
import { SyncEncryptionButton } from "@/components/SyncEncryptionButton";
import { RequireKeys } from "@/components/RequireKeys";
import { DeviceForm } from "@/components/DeviceForm";
import type { Camera } from "@/lib/hct/types";

function applyFilters(cameras: Camera[], f: FilterValues): Camera[] {
  const q = f.q.trim().toLowerCase();
  return cameras.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q) && !c.serial.toLowerCase().includes(q)) return false;
    if (f.area && c.area !== f.area) return false;
    if (f.status === "online" && !c.online) return false;
    if (f.status === "offline" && c.online) return false;
    if (f.enc === "plain" && c.encrypted !== false) return false;
    if (f.enc === "encrypted" && c.encrypted !== true) return false;
    if (f.enc === "unknown" && c.encrypted !== null && c.encrypted !== undefined) return false;
    return true;
  });
}

function EncryptionBadge({ encrypted }: { encrypted?: boolean | null }) {
  if (encrypted === true) return <span className="badge warn">Cifrada</span>;
  if (encrypted === false) return <span className="badge ok">Sin cifrar</span>;
  return <span className="badge off">Cifrado ?</span>;
}

async function CameraList({ filters }: { filters: FilterValues }) {
  const session = await getSession();
  if (!session) redirect("/login");

  let cameras: Camera[];
  try {
    cameras = await getCamerasWithEncryption(config.mode);
  } catch (e) {
    const message =
      e instanceof HctError
        ? `${e.errorCode}: ${e.message}`
        : e instanceof Error
          ? e.message
          : "Error consultando HCT";
    return <div className="alert error">{message}</div>;
  }

  const areas = [...new Set(cameras.map((c) => c.area).filter(Boolean))].sort();
  const filtered = applyFilters(cameras, filters);
  const plain = cameras.filter((c) => c.encrypted === false).length;
  const encrypted = cameras.filter((c) => c.encrypted === true).length;
  const unknown = cameras.length - plain - encrypted;

  return (
    <>
      <CameraFilters areas={areas} values={filters} />

      <div className="row" style={{ marginBottom: 16 }}>
        <span className="badge ok">{filtered.length} de {cameras.length} cámaras</span>
        <span className="badge ok">{plain} sin cifrar</span>
        <span className="badge warn">{encrypted} cifradas</span>
        <span className="badge off">{unknown} sin dato</span>
        <span className="mono">cache: 'use cache' + cacheTag("cameras")</span>
        <form action={refreshCameras}>
          <button className="btn ghost sm" type="submit">Actualizar inventario</button>
        </form>
        <SyncEncryptionButton />
        {session.role === "operator" && <DeviceForm defaultCategory="encodingDevice" />}
      </div>

      {unknown > 0 && (
        <div className="alert info">
          El listado de HCT no incluye el flag de cifrado: se obtiene por dispositivo con
          "Sincronizar cifrado" (lotes de 50, ~10 s cada uno, sin saturar el límite de 5 req/s).
          Filtra por "Sin cifrar" para encontrar cámaras cuyo live no pide código.
        </div>
      )}

      <div className="grid">
        {filtered.map((c) => (
          <Link key={c.id} href={`/cameras/${c.id}`} className="card" style={{ display: "block" }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h3>{c.name}</h3>
              <span className={`badge ${c.online ? "ok" : "off"}`}>{c.online ? "En línea" : "Fuera"}</span>
            </div>
            <div className="meta">{c.area || "Sin área"}</div>
            <div className="mono">serial {c.serial} · canal {c.channel}</div>
            <div style={{ marginTop: 8 }}>
              <EncryptionBadge encrypted={c.encrypted} />
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="card mono">Ninguna cámara coincide con los filtros.</div>
        )}
      </div>
    </>
  );
}

async function CamerasResolver({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const filters: FilterValues = {
    q: one(sp.q),
    area: one(sp.area),
    status: one(sp.status),
    enc: one(sp.enc),
  };
  return <CameraList filters={filters} />;
}

export default function CamerasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <h1 className="page-title">Cámaras</h1>
      <p className="page-sub">Inventario SYSCOM vía Hik-Connect for Teams</p>
      <Suspense fallback={<div className="spinner" />}>
        <RequireKeys>
          <CamerasResolver searchParams={searchParams} />
        </RequireKeys>
      </Suspense>
    </>
  );
}
