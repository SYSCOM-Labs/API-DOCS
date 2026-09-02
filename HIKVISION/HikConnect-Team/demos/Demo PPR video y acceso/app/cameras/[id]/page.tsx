import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getCamerasWithEncryption } from "@/lib/hct/cameras";
import { createStreamSession } from "@/lib/hct/streams";
import { getDeviceCode } from "@/lib/deviceCodes";
import { HctError } from "@/lib/hct/client";
import { config } from "@/lib/config";
import { EzopenPlayer } from "@/components/EzopenPlayer";
import { LiveWithCode } from "@/components/LiveWithCode";
import { LiveAuto } from "@/components/LiveAuto";
import { RequireKeys } from "@/components/RequireKeys";

async function LiveSection({
  id,
  serial,
  encrypted,
}: {
  id: string;
  serial: string;
  encrypted?: boolean | null;
}) {
  // La sesion de stream es secreta y de corta vida: nunca debe intentarse
  // durante el prerender (ademas ahi un llenado frio del cache de inventario
  // puede exceder el deadline y tumbar la pagina con USE_CACHE_TIMEOUT).
  await connection();

  // Si ya sabemos que el stream esta cifrado y no hay codigo guardado en esta
  // computadora, pedirlo directo: no intentar primero y mostrar un error.
  let withCode = false;
  if (encrypted === true) {
    const stored = (await getDeviceCode(serial)) ?? config.deviceCodes()[serial];
    if (!stored) return <LiveWithCode cameraId={id} />;
    withCode = true;
  }
  try {
    const session = await createStreamSession(config.mode, id);
    // Con codigo guardado: si falla la reproduccion, LiveAuto lo borra y pide uno nuevo.
    if (withCode) return <LiveAuto session={session} cameraId={id} />;
    return <EzopenPlayer session={session} />;
  } catch (e) {
    if (e instanceof HctError && e.errorCode === "EVZ60019") {
      return <LiveWithCode cameraId={id} />;
    }
    const message = e instanceof Error ? e.message : "Error creando sesión de stream";
    return <div className="alert error">{message}</div>;
  }
}

async function CameraDetail({ id }: { id: string }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const camera = (await getCamerasWithEncryption(config.mode)).find((c) => c.id === id);
  if (!camera) {
    return <div className="alert error">Cámara no encontrada (o fuera de la allowlist).</div>;
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 20 }}>{camera.name}</h3>
          <span className="row">
            {camera.encrypted === true && <span className="badge warn">Stream cifrado · pide código</span>}
            {camera.encrypted === false && <span className="badge ok">Sin cifrar</span>}
            <span className={`badge ${camera.online ? "ok" : "off"}`}>
              {camera.online ? "En línea" : "Fuera de línea"}
            </span>
          </span>
        </div>
        <div className="meta">{camera.area || "Sin área"}</div>
        <div className="mono">
          id {camera.id} · serial {camera.serial} · canal {camera.channel}
        </div>
      </div>
      <Suspense fallback={<div className="player-box"><div className="spinner" /></div>}>
        <LiveSection id={id} serial={camera.serial} encrypted={camera.encrypted} />
      </Suspense>
    </>
  );
}

async function CameraResolver({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CameraDetail id={id} />;
}

export default function CameraPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <p style={{ marginTop: 24 }}>
        <Link href="/cameras">← Cámaras</Link>
      </p>
      <Suspense fallback={<div className="spinner" />}>
        <RequireKeys>
          <CameraResolver params={params} />
        </RequireKeys>
      </Suspense>
    </>
  );
}
