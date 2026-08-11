import { useState } from "react";
import type { StoredCredentials } from "../types";
import { ApiNote } from "./ui/ApiNote";
import { btnPrimary, btnSecondary, inputClass } from "./ui/classes";

interface ConnectScreenProps {
  credentials: StoredCredentials;
  onSave: (partial: Partial<StoredCredentials>) => void;
  onConnect: () => Promise<boolean>;
  onSandbox: () => void;
  discovering: boolean;
  error: string;
}

export function ConnectScreen({
  credentials,
  onSave,
  onConnect,
  onSandbox,
  discovering,
  error,
}: ConnectScreenProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-10 text-center">
          <p className="section-label mb-2">SYSCOM · Hik-Connect Teams</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Tiempo y Asistencia
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Playground OpenAPI V2.15.0 — personas, acceso, marcajes y reportes.
          </p>
        </div>

        <div className="content-card space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-ink">API Key</span>
            <input
              className={inputClass}
              value={credentials.appKey}
              onChange={(e) => onSave({ appKey: e.target.value })}
              placeholder="appKey"
              autoComplete="off"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">API Secret</span>
            <input
              type="password"
              className={inputClass}
              value={credentials.secretKey}
              onChange={(e) => onSave({ secretKey: e.target.value })}
              placeholder="secretKey"
              autoComplete="off"
            />
          </label>

          <button
            type="button"
            className="text-xs text-accent"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Ocultar región" : "Cambiar región / serverAddress"}
          </button>

          {showAdvanced && (
            <label className="block">
              <span className="text-sm font-medium text-ink">Server address</span>
              <input
                className={inputClass}
                value={credentials.serverAddress}
                onChange={(e) => onSave({ serverAddress: e.target.value })}
                placeholder="https://ius.hikcentralconnect.com"
              />
              <p className="mt-1 text-[11px] text-ink-tertiary">
                NA: ius · SA: isa · EU: ieu · SG: isgp
              </p>
            </label>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="button"
            className={`${btnPrimary} w-full`}
            disabled={discovering}
            onClick={() => void onConnect()}
          >
            {discovering ? "Conectando…" : "Conectar a Hik-Connect"}
          </button>

          <button
            type="button"
            className={`${btnSecondary} w-full`}
            disabled={discovering}
            onClick={onSandbox}
          >
            Entrar en modo Sandbox
          </button>

          <p className="text-center text-[11px] text-ink-tertiary">
            Las credenciales solo viven en este navegador (localStorage). Nunca se suben al
            repositorio.
          </p>
        </div>

        <div className="mt-4">
          <ApiNote tone="portal" title="Requisitos en Hik-Connect for Teams">
            <ul className="list-disc space-y-1 pl-5">
              <li>Dispositivos ACS online y puertas asociadas.</li>
              <li>Plantillas horarias de acceso (solo se listan por API).</li>
              <li>Turnos de asistencia para KPIs, retardo y falta.</li>
              <li>AppKey y Secret del tenant (administrador en Hik-Connect for Teams).</li>
            </ul>
            <p className="text-[12px] opacity-80">
              Sandbox simula datos sin tenant real; no sustituye la validación con dispositivo ACS.
            </p>
          </ApiNote>
        </div>
      </div>
    </div>
  );
}
