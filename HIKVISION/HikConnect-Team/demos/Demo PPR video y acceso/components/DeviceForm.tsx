"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addDeviceAction } from "@/app/persons/actions";

// Alta de dispositivo en el tenant: serial + codigo de verificacion (el que
// trae la etiqueta del equipo). encodingDevice = camara/NVR;
// accessControllerDevice = controlador de acceso.
export function DeviceForm({ defaultCategory }: { defaultCategory: "encodingDevice" | "accessControllerDevice" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [serial, setSerial] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button className="btn ghost sm" onClick={() => setOpen(true)}>
        + Agregar dispositivo
      </button>
    );
  }

  return (
    <form
      className="card"
      style={{ marginBottom: 16 }}
      onSubmit={(e) => {
        e.preventDefault();
        setMessage("");
        startTransition(async () => {
          try {
            await addDeviceAction({
              name: name.trim(),
              serial: serial.trim(),
              verifyCode: verifyCode.trim(),
              category,
            });
            setMessage("Dispositivo agregado. Puede tardar unos segundos en aparecer en línea.");
            setName("");
            setSerial("");
            setVerifyCode("");
            router.refresh();
          } catch (err) {
            setMessage(err instanceof Error ? err.message : "Error");
          }
        });
      }}
    >
      <div className="row">
        <input
          className="input"
          style={{ maxWidth: 180 }}
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input mono"
          style={{ maxWidth: 160 }}
          placeholder="Serial (etiqueta)"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          required
        />
        <input
          className="input mono"
          style={{ maxWidth: 160 }}
          placeholder="Código de verificación"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value)}
          required
        />
        <select
          className="input"
          style={{ maxWidth: 190 }}
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
        >
          <option value="encodingDevice">Video (cámara/NVR)</option>
          <option value="accessControllerDevice">Control de acceso</option>
        </select>
        <button className="btn sm" type="submit" disabled={pending}>
          {pending ? "Agregando…" : "Agregar"}
        </button>
        <button type="button" className="btn ghost sm" onClick={() => setOpen(false)} disabled={pending}>
          Cancelar
        </button>
      </div>
      {message && <p className="mono" style={{ marginTop: 8 }}>{message}</p>}
    </form>
  );
}
