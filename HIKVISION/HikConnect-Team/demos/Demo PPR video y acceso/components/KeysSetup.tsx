"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveHctKeys } from "@/app/settings/actions";

// Captura inicial de las credenciales del OpenAPI. Aparece en el dashboard
// cuando la maquina no tiene claves (ni en data/settings.json ni en
// .env.local). Se guardan locales (data/settings.json, gitignored).
export function KeysSetup() {
  const router = useRouter();
  const [appKey, setAppKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h3 style={{ marginBottom: 8 }}>Configura las claves del OpenAPI</h3>
      <p className="meta" style={{ marginBottom: 16 }}>
        Esta computadora aún no tiene credenciales de Hik-Connect for Teams. Captura la{" "}
        <strong>AppKey</strong> y <strong>SecretKey</strong> de la aplicación (se guardan solo
        aquí, en data/settings.json — nunca se suben a git). Después puedes cambiarlas en
        Configuración.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          startTransition(async () => {
            try {
              await saveHctKeys(appKey, secretKey);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error guardando");
            }
          });
        }}
      >
        <label htmlFor="appKey">AppKey</label>
        <input
          id="appKey"
          className="input mono"
          value={appKey}
          onChange={(e) => setAppKey(e.target.value)}
          autoComplete="off"
          required
        />
        <label htmlFor="secretKey">SecretKey</label>
        <input
          id="secretKey"
          className="input mono"
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          autoComplete="off"
          required
        />
        {error && <div className="alert error">{error}</div>}
        <div style={{ marginTop: 16 }}>
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Guardando…" : "Guardar y continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}
