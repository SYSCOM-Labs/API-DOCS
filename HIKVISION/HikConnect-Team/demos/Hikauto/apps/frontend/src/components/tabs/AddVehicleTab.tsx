import { useState, useEffect } from "react";
import { apiPost } from "../../api/client";
import { GUIDES } from "../../content/guides";
import { GuidePanel, FormField } from "../GuidePanel";
import { FormAlert } from "../ui/FormAlert";
import { missingFieldsMessage } from "../ui/formValidation";
import type { FleetTabProps } from "./types";
import { btnPrimary, inputClass } from "../ui/classes";

/** Tab: provisionar vehículo 1:1 con deviceSerial (PDF §5.9.1). */
export function AddVehicleTab({
  credentialsEnvelope,
  isConfigured,
  platform,
  selectedVehicle,
  onHud,
}: FleetTabProps) {
  const [areaId, setAreaId] = useState("");
  const [licensePlateNo, setLicensePlateNo] = useState("");
  const [vehicleType, setVehicleType] = useState(1);
  const [deviceSerial, setDeviceSerial] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!platform) return;
    setAreaId(selectedVehicle?.areaId ?? platform.areas[0]?.id ?? "");
    if (selectedVehicle) {
      setVehicleType(selectedVehicle.vehicleType || 1);
    }
  }, [platform, selectedVehicle]);

  function validate(): string {
    const missing: string[] = [];
    if (!isConfigured) return "Conecta con API Key y Secret antes de enviar.";
    if (!areaId.trim()) missing.push("Área (areaId)");
    if (!licensePlateNo.trim()) missing.push("Matrícula (licensePlateNo)");
    if (!deviceSerial.trim()) missing.push("Serial del dashcam (deviceSerial)");
    return missingFieldsMessage(missing);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage(err);
      return;
    }
    setLoading(true);
    setMessage("");
    const res = await apiPost("/api/fleet/vehicles/add", credentialsEnvelope, {
      areaId,
      licensePlateNo,
      vehicleType,
      deviceSerial,
    });
    setLoading(false);
    if (res.debug) onHud("Agregar vehículo", res.debug);
    const code = (res.data as { errorCode?: string })?.errorCode;
    if (res.error) setMessage(res.error);
    else if (code === "0")
      setMessage("Vehículo agregado correctamente. Revisa el Inspector API para el vehicleId.");
    else setMessage(`Respuesta Hik: errorCode=${code ?? "?"}`);
  }

  return (
    <div>
      <GuidePanel guide={GUIDES.vehicles} />

      {platform && platform.vehicles.length > 0 && selectedVehicle && (
        <p className="mb-4 text-sm text-ink-secondary">
          Vehículo activo: <span className="font-mono text-ink">{selectedVehicle.deviceSerial}</span>
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <FormField label="Área" hint="areaId — autocompletado desde tu cuenta">
          {platform && platform.areas.length > 0 ? (
            <select
              className={inputClass}
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
            >
              {platform.areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.id}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputClass}
              placeholder="ID del área en Hik-Connect"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
            />
          )}
        </FormField>

        <FormField label="Matrícula" hint="licensePlateNo — nombre visible del vehículo">
          <input
            className={inputClass}
            placeholder={selectedVehicle?.licensePlateNo ?? "ej. ABC-1234"}
            value={licensePlateNo}
            onChange={(e) => setLicensePlateNo(e.target.value)}
          />
        </FormField>

        <FormField label="Tipo de vehículo" hint="vehicleType: 0=otros · 1=auto · 2=camión · 3=bus">
          <select
            className={inputClass}
            value={vehicleType}
            onChange={(e) => setVehicleType(Number(e.target.value))}
          >
            <option value={0}>0 — Otros</option>
            <option value={1}>1 — Auto</option>
            <option value={2}>2 — Camión</option>
            <option value={3}>3 — Bus</option>
          </select>
        </FormField>

        <FormField
          label="Serial del dashcam"
          hint="deviceSerial — un serial libre, relación 1:1 con el vehículo"
        >
          <input
            className={inputClass}
            placeholder="ej. CH3807848"
            value={deviceSerial}
            onChange={(e) => setDeviceSerial(e.target.value)}
          />
        </FormField>

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "Enviando…" : "Agregar vehículo"}
        </button>
        <FormAlert message={message} />
      </form>
    </div>
  );
}
