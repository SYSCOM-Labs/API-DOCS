import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getHctHost, getHctKeys, getRuntimeSettings, isDryRun } from "@/lib/settings";
import { readDeviceCodes } from "@/lib/deviceCodes";
import { readEncryptionMap } from "@/lib/encryptionStore";
import { config } from "@/lib/config";
import { DryRunToggle } from "@/components/DryRunToggle";
import { DeviceCodeList } from "@/components/DeviceCodeList";
import { ForgetKeysButton } from "@/components/ForgetKeysButton";
import { EditableValue } from "@/components/EditableValue";

function mask(secret: string): string {
  if (!secret) return "(vacío)";
  if (secret.length <= 6) return "••••••";
  return `${secret.slice(0, 4)}••••${secret.slice(-2)}`;
}

function Row({ label, value, children }: { label: string; value?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <tr>
      <td style={{ width: 220 }}>{label}</td>
      <td className="mono">{value}</td>
      <td className="meta">{children}</td>
    </tr>
  );
}

async function SettingsContent() {
  // Lee archivos locales (settings, codigos, cifrado): pagina dinamica por diseño.
  await connection();
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "operator") {
    return (
      <>
        <h1 className="page-title">Configuración</h1>
        <div className="alert info">La configuración requiere rol operator.</div>
      </>
    );
  }

  const [dryRun, runtime, codes, encMap] = await Promise.all([
    isDryRun(),
    getRuntimeSettings(),
    readDeviceCodes(),
    readEncryptionMap(),
  ]);
  const encValues = Object.values(encMap);
  const encCount = encValues.filter((v) => v.encrypted).length;

  let hctKeys: { appKey: string; secretKey: string; source: "cookie" | "settings" | "env" } | null = null;
  try {
    hctKeys = await getHctKeys();
  } catch {
    // sin claves en ningun lado: se capturan con clic sobre "(sin configurar)"
  }
  const hctHost = await getHctHost();

  return (
    <>
      <h1 className="page-title">Configuración</h1>
      <p className="page-sub">
        Qué es cada cosa y dónde se cambia. Los secretos nunca se muestran completos.
      </p>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Comandos de puerta</h3>
        <p className="meta" style={{ marginBottom: 12 }}>
          Decide si los comandos (abrir, bloquear, etc.) se envían de verdad a Hik-Connect o solo
          se simulan. <strong>Simulados</strong>: el comando queda en el audit log pero no toca el
          tenant — ideal para demos sin riesgo. <strong>Reales</strong>: la puerta abre de verdad.
          Se cambia al instante, sin reiniciar, y cada cambio queda auditado.
          {runtime.dryRun === undefined
            ? " Valor actual heredado de POC_DRY_RUN en .env.local."
            : " Valor actual definido aquí (override de .env.local)."}
        </p>
        <div className="row">
          <span className={`badge ${dryRun ? "ok" : "warn"}`}>
            {dryRun ? "Actual: SIMULADOS" : "Actual: REALES"}
          </span>
          <DryRunToggle enabled={dryRun} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Modo de operación</h3>
        <table className="table">
          <tbody>
            <Row label="POC_MODE" value={config.mode}>
              <strong>live</strong>: consulta el tenant real de SYSCOM vía OpenAPI.{" "}
              <strong>mock</strong>: usa datos de ejemplo locales, sin tocar Hik-Connect. Se cambia
              en .env.local y requiere reiniciar el servidor.
            </Row>
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Credenciales del OpenAPI (Hik-Connect for Teams)</h3>
        <p className="meta" style={{ marginBottom: 12 }}>
          Con ellas se obtiene el accessToken (válido 7 días) para todas las llamadas.{" "}
          <strong>Clic en cualquier valor para editarlo</strong> (Enter guarda, Esc cancela). Se
          guardan en una cookie cifrada de <em>este navegador</em> (hasta 180 días): otro
          dispositivo o borrar las cookies del sitio las vuelve a pedir. No se escriben en el
          servidor ni en git. El servidor solo las usa en memoria para llamar al OpenAPI.
        </p>
        <table className="table">
          <tbody>
            <Row label="HCT_HOST" value={<EditableValue field="host" display={hctHost} />}>
              Servidor centralizado del OpenAPI.
            </Row>
            <Row
              label="HCT_APP_KEY"
              value={
                <EditableValue
                  field="appKey"
                  secret
                  display={hctKeys ? mask(hctKeys.appKey) : "(sin configurar)"}
                />
              }
            >
              Identificador público de la aplicación.
            </Row>
            <Row
              label="HCT_SECRET_KEY"
              value={
                <EditableValue
                  field="secretKey"
                  secret
                  display={hctKeys ? mask(hctKeys.secretKey) : "(sin configurar)"}
                />
              }
            >
              Secreto de la aplicación. No se muestra completo. Vive en cookie de este navegador.
            </Row>
          </tbody>
        </table>
        {hctKeys && (
          <div style={{ marginTop: 12 }}>
            <ForgetKeysButton />
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Usuarios del demo</h3>
        <p className="meta" style={{ marginBottom: 12 }}>
          El demo usa dos usuarios fijos. Ojo: el OpenAPI de Hik-Connect for Teams es a nivel{" "}
          <strong>plataforma</strong> (AppKey/SecretKey), no por usuario final — si un cliente
          necesita permisos por usuario, los implementa en su propio desarrollo (su backend/BFF),
          no en Teams. Aquí los roles solo demuestran cómo se vería esa capa.
        </p>
        <table className="table">
          <tbody>
            <Row label="admin" value="admin">
              Rol operator: puede ver todo, ejecutar comandos de puerta y cambiar esta
              configuración. Contraseña en POC_ADMIN_PASSWORD (.env.local).
            </Row>
            <Row label="visor" value="visor">
              Rol viewer: solo lectura (inventario, video y marcaciones; sin comandos ni
              configuración). Contraseña en POC_VIEWER_PASSWORD (.env.local).
            </Row>
            <Row label="SESSION_SECRET" value={mask(config.sessionSecret)}>
              Clave con la que se firman las cookies de sesión (JWT HMAC-SHA256). Se cambia en
              .env.local; cambiarla invalida todas las sesiones activas.
            </Row>
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Códigos de verificación de cámaras</h3>
        <p className="meta" style={{ marginBottom: 12 }}>
          Los streams cifrados piden el código de verificación configurado en cada dispositivo. Al
          capturarlo una vez se guarda en <span className="mono">data/device-codes.json</span>{" "}
          (archivo local de esta computadora, no se sube a git) y no se vuelve a pedir. El código
          solo se guarda si el video reproduce de verdad. Eliminarlo aquí hace que la cámara lo
          vuelva a pedir.
        </p>
        <DeviceCodeList codes={codes} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Datos locales</h3>
        <table className="table">
          <tbody>
            <Row label="data/encryption.json" value={`${encValues.length} dispositivos · ${encCount} cifrados`}>
              Mapa de cifrado por serial. Se llena con el botón "Sincronizar cifrado" del listado de
              cámaras (lotes de 50, respetando el límite de 5 req/s del OpenAPI).
            </Row>
            <Row label="data/audit.jsonl" value="append-only">
              Bitácora de todo lo sensible: comandos de puerta (con motivo), códigos guardados o
              eliminados y cambios de configuración.
            </Row>
            <Row label="CAMERA_ALLOWLIST" value={config.cameraAllowlist.length > 0 ? `${config.cameraAllowlist.length} cámaras` : "(vacía = todas)"}>
              Si se define en .env.local, limita qué cámaras son visibles en la POC. Vacía muestra
              todo el inventario.
            </Row>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="spinner" />}>
      <SettingsContent />
    </Suspense>
  );
}
