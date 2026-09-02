import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAccessLevels, getPlatformUsers } from "@/lib/hct/accessLevels";
import { HctError } from "@/lib/hct/client";
import { config } from "@/lib/config";
import { RequireKeys } from "@/components/RequireKeys";

async function LevelsContent() {
  const session = await getSession();
  if (!session) redirect("/login");

  let levels, users;
  try {
    [levels, users] = await Promise.all([
      getAccessLevels(config.mode),
      getPlatformUsers(config.mode),
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
        <h3 style={{ marginBottom: 8 }}>Niveles de acceso</h3>
        <p className="meta" style={{ marginBottom: 12 }}>
          Un nivel agrupa puertas + horario. Se asignan a personas desde la página Personas. La
          creación de niveles con horarios complejos se recomienda en la consola web de HCT (el
          OpenAPI la expone pero con una estructura de horarios verbosa).
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Nivel</th>
              <th>Observaciones</th>
              <th>Recursos (puertas)</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((l) => (
              <tr key={l.id}>
                <td>{l.name}</td>
                <td className="meta">{l.remark || "—"}</td>
                <td>{l.resourceCount}</td>
              </tr>
            ))}
            {levels.length === 0 && (
              <tr>
                <td colSpan={3} className="mono">
                  Sin niveles de acceso en el tenant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Usuarios de plataforma</h3>
        <p className="meta" style={{ marginBottom: 12 }}>
          Usuarios de la consola Hik-Connect for Teams (operadores de la plataforma, no personas
          con credencial). El OpenAPI solo permite <strong>listarlos</strong>.
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td className="mono">{u.id}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={2} className="mono">
                  Sin usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 8 }}>Lo que el OpenAPI NO expone (y por qué)</h3>
        <table className="table">
          <tbody>
            <tr>
              <td style={{ width: 280 }}>Crear/editar usuarios de plataforma</td>
              <td className="meta">
                Solo existe <span className="mono">users/get</span> (listar). La administración de
                operadores se hace en la consola web de HCT — la API es para integrar capacidades,
                no para administrar la consola.
              </td>
            </tr>
            <tr>
              <td>Permisos por usuario final (RBAC)</td>
              <td className="meta">
                El OpenAPI opera a nivel plataforma con AppKey/SecretKey. Los permisos por usuario
                final se implementan en el desarrollo del cliente (su backend/BFF), no en Teams.
              </td>
            </tr>
            <tr>
              <td>Enrolamiento biométrico remoto</td>
              <td className="meta">
                <span className="mono">fingercollect</span> / <span className="mono">cardcollect</span>{" "}
                existen, pero ordenan la captura a un <strong>dispositivo físico en línea</strong>:
                no se puede enrolar huella/tarjeta sin hardware presente. La foto facial sí se sube
                por API (<span className="mono">persons/photo</span>, Base64).
              </td>
            </tr>
            <tr>
              <td>Estado de hoja de puerta (abierta/cerrada)</td>
              <td className="meta">
                El inventario reporta conectividad (online/offline), no la posición física de la
                hoja. Eso llega como evento de alarma (MQ/webhook), no como consulta.
              </td>
            </tr>
            <tr>
              <td>RTSP / WebRTC directo</td>
              <td className="meta">
                El video live es EZOPEN (SDK propietario), HLS o RTMP. No hay RTSP ni WebRTC
                nativos expuestos por el OpenAPI.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function LevelsPage() {
  return (
    <>
      <h1 className="page-title">Niveles de acceso</h1>
      <p className="page-sub">
        Permisos de acceso, usuarios de plataforma y límites del OpenAPI
      </p>
      <Suspense fallback={<div className="spinner" />}>
        <RequireKeys>
          <LevelsContent />
        </RequireKeys>
      </Suspense>
    </>
  );
}
