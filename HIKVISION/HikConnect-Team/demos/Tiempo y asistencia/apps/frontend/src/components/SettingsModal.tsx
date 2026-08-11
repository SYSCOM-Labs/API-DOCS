import { useState } from "react";
import type { StoredCredentials } from "../types";
import { btnPrimary, btnSecondary, inputClass } from "./ui/classes";

interface Props {
  open: boolean;
  credentials: StoredCredentials;
  onSave: (partial: Partial<StoredCredentials>) => void;
  onClose: () => void;
}

export function SettingsModal({ open, credentials, onSave, onClose }: Props) {
  const [draft, setDraft] = useState(credentials);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="content-card w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold text-ink">Configuración</h2>
        <label className="block">
          <span className="text-sm font-medium">Server address</span>
          <input
            className={inputClass}
            value={draft.serverAddress}
            onChange={(e) => setDraft({ ...draft, serverAddress: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">API Key</span>
          <input
            className={inputClass}
            value={draft.appKey}
            onChange={(e) => setDraft({ ...draft, appKey: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">API Secret</span>
          <input
            type="password"
            className={inputClass}
            value={draft.secretKey}
            onChange={(e) => setDraft({ ...draft, secretKey: e.target.value })}
          />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecondary} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={btnPrimary}
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
