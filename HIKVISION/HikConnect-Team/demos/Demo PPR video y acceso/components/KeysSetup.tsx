"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveHctKeys } from "@/app/settings/actions";

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
        Este navegador aún no tiene credenciales de Hik-Connect for Teams. Captura la{" "}
        <strong>AppKey</strong> y <strong>SecretKey</strong> de tu aplicación. Se guardan en una
        cookie de <em>este dispositivo</em> (cifrada, 180 días). Otro equipo, otro navegador o
        borrar las cookies del sitio las vuelve a pedir. No se guardan en el servidor ni en git.
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
