import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getHctKeys } from "@/lib/settings";
import { config } from "@/lib/config";
import { LogoutButton } from "./LogoutButton";

export async function Nav() {
  const session = await getSession();
  if (!session) return null;

  // Aviso persistente si esta maquina no tiene claves del OpenAPI (modo live).
  let keysMissing = false;
  if (config.mode === "live") {
    try {
      await getHctKeys();
    } catch {
      keysMissing = true;
    }
  }

  return (
    <nav className="nav">
      <Link href="/" className="brand">
        SYSCOM <span>POC</span>
      </Link>
      <Link href="/cameras">Cámaras</Link>
      <Link href="/doors">Puertas</Link>
      <Link href="/persons">Personas</Link>
      <Link href="/levels">Niveles</Link>
      <Link href="/events">Marcaciones</Link>
      {session.role === "operator" && <Link href="/settings">Configuración</Link>}
      {keysMissing && (
        <Link href="/" className="badge warn">
          Sin claves API
        </Link>
      )}
      <div className="spacer" />
      <span className="user">
        {session.username} · {session.role}
      </span>
      <LogoutButton />
    </nav>
  );
}
