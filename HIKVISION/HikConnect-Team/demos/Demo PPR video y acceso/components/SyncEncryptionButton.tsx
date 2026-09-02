"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncEncryption } from "@/app/actions";
import type { SyncResult } from "@/lib/hct/encryption";

// Corre un lote de sincronizacion de cifrado (devicedetail/get por serial).
// Con 3,105 camaras y 5 req/s, un lote de 50 tarda ~10 s y no satura HCT.
export function SyncEncryptionButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncResult | null>(null);

  return (
    <span className="row">
      <button
        className="btn ghost sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setResult(await syncEncryption());
            router.refresh();
          })
        }
      >
        {pending ? "Sincronizando…" : "Sincronizar cifrado (lote de 50)"}
      </button>
      {result && (
        <span className="mono">
          lote: {result.checked} · pendientes: {result.remaining} · dispositivos: {result.total}
        </span>
      )}
    </span>
  );
}
