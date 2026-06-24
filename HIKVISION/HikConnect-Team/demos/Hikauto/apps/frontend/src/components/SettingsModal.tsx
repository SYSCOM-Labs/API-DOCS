import type { StoredCredentials } from "../types";

import { CREDENTIALS_GUIDE } from "../content/guides";

import { GuidePanel } from "./GuidePanel";

import { btnPrimary, btnSecondary } from "./ui/classes";



interface SettingsModalProps {

  open: boolean;

  onClose: () => void;

  credentials: StoredCredentials;

  onSave: (partial: Partial<StoredCredentials>) => void;

  onReconnect?: () => void;

  discovering?: boolean;

}



export function SettingsModal({

  open,

  onClose,

  credentials,

  onSave,

  onReconnect,

  discovering,

}: SettingsModalProps) {

  if (!open) return null;



  const ready =

    Boolean(credentials.serverAddress) &&

    Boolean(credentials.appKey) &&

    Boolean(credentials.secretKey);



  const inputClass =

    "mt-1.5 w-full rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-sm">

      <div className="my-4 w-full max-w-lg content-card shadow-panel">

        <h2 className="text-lg font-semibold text-ink">Cuenta</h2>

        <p className="mt-1 text-sm text-ink-secondary">

          Credenciales guardadas solo en tu navegador.

        </p>



        <div className="mt-5">

          <GuidePanel guide={CREDENTIALS_GUIDE} />

        </div>



        <div className="mt-5 space-y-4 text-sm">

          <label className="block">

            <span className="font-medium text-ink">serverAddress</span>

            <input

              className={inputClass}

              value={credentials.serverAddress}

              onChange={(e) => onSave({ serverAddress: e.target.value })}

              placeholder="https://ius.hikcentralconnect.com"

            />

          </label>



          <label className="block">

            <span className="font-medium text-ink">API Key</span>

            <input

              className={inputClass}

              value={credentials.appKey}

              onChange={(e) => onSave({ appKey: e.target.value })}

              autoComplete="off"

            />

          </label>



          <label className="block">

            <span className="font-medium text-ink">API Secret</span>

            <input

              type="password"

              className={inputClass}

              value={credentials.secretKey}

              onChange={(e) => onSave({ secretKey: e.target.value })}

              autoComplete="off"

            />

          </label>

        </div>



        <div className="mt-6 flex items-center justify-between gap-2">

          <span className={`text-xs ${ready ? "text-emerald-600" : "text-ink-tertiary"}`}>

            {ready ? "Completo" : "Incompleto"}

          </span>

          <div className="flex gap-2">

            {onReconnect && ready && !credentials.sandboxMode && (

              <button

                type="button"

                onClick={onReconnect}

                disabled={discovering}

                className={btnSecondary}

              >

                {discovering ? "…" : "Sincronizar"}

              </button>

            )}

            <button type="button" onClick={onClose} className={btnPrimary}>

              Guardar

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

