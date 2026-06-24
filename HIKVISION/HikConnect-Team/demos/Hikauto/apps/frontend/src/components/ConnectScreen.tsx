import { useState } from "react";

import type { StoredCredentials } from "../types";

import { btnPrimary, btnSecondary } from "./ui/classes";



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

      <div className="w-full max-w-[400px]">

        <div className="mb-10 text-center">

          <h1 className="text-2xl font-semibold tracking-tight text-ink">Fleet API Playground</h1>

          <p className="mt-2 text-sm text-ink-secondary">

            Aprende los endpoints de onboarding con dispositivos Hik-Connect.

          </p>

        </div>



        <div className="content-card space-y-5">

          <label className="block">

            <span className="text-sm font-medium text-ink">API Key</span>

            <input

              className="mt-1.5 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"

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

              className="mt-1.5 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"

              value={credentials.secretKey}

              onChange={(e) => onSave({ secretKey: e.target.value })}

              placeholder="secretKey"

              autoComplete="off"

            />

          </label>



          <button

            type="button"

            onClick={() => setShowAdvanced(!showAdvanced)}

            className="text-xs text-accent hover:underline"

          >

            {showAdvanced ? "Ocultar opciones" : "Opciones avanzadas"}

          </button>



          {showAdvanced && (

            <label className="block">

              <span className="text-sm text-ink-secondary">serverAddress</span>

              <input

                className="mt-1.5 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"

                value={credentials.serverAddress}

                onChange={(e) => onSave({ serverAddress: e.target.value })}

              />

            </label>

          )}



          {error && (

            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">{error}</p>

          )}



          <button

            type="button"

            disabled={discovering || !credentials.appKey || !credentials.secretKey}

            onClick={() => void onConnect()}

            className={`${btnPrimary} w-full`}

          >

            {discovering ? "Conectando…" : "Conectar"}

          </button>



          <button type="button" onClick={onSandbox} className={`${btnSecondary} w-full`}>

            Explorar sin credenciales

          </button>

        </div>



        <p className="mt-6 text-center text-xs leading-relaxed text-ink-tertiary">

          OpenAPI V2.15.0 · Las credenciales se guardan solo en tu navegador.

        </p>

      </div>

    </div>

  );

}

