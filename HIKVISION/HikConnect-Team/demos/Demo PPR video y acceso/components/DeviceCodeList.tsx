"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeDeviceCode } from "@/app/settings/actions";

function mask(code: string): string {
  if (code.length <= 2) return "••••";
  return `${code[0]}••••${code[code.length - 1]}`;
}

// Lista los codigos de verificacion guardados en data/device-codes.json con
// opcion de borrarlos (la camara vuelve a pedir codigo al abrir el live).
export function DeviceCodeList({ codes }: { codes: Record<string, string> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const serials = Object.keys(codes).sort();

  if (serials.length === 0) {
    return <p className="mono">Ningún código guardado todavía en esta computadora.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Serial del dispositivo</th>
          <th>Código</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {serials.map((serial) => (
          <tr key={serial}>
            <td className="mono">{serial}</td>
            <td className="mono">{mask(codes[serial])}</td>
            <td>
              <button
                className="btn ghost sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await removeDeviceCode(serial);
                    router.refresh();
                  })
                }
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
