import { useState, useEffect } from "react";
import { apiPost } from "../../api/client";
import { GUIDES } from "../../content/guides";
import { GuidePanel, FormField } from "../GuidePanel";
import { FormAlert } from "../ui/FormAlert";
import { isPlausibleGroupId, missingFieldsMessage } from "../ui/formValidation";
import type { FleetTabProps } from "./types";
import { btnPrimary, inputClass } from "../ui/classes";

export function DispatchDriverTab({
  credentialsEnvelope,
  isConfigured,
  platform,
  selectedVehicle,
  onHud,
}: FleetTabProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [driverCode, setDriverCode] = useState("");
  const [gender, setGender] = useState(0);
  const [groupId, setGroupId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photoData, setPhotoData] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [driverId, setDriverId] = useState("");
  const [dispatchIds, setDispatchIds] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!platform) return;
    const defaultGroup =
      platform.driverGroups[0]?.groupId ?? platform.drivers[0]?.groupId ?? "";
    if (defaultGroup) setGroupId(defaultGroup);
    if (platform.drivers[0]) {
      setDriverId(platform.drivers[0].driverId);
      setDispatchIds(platform.drivers.map((d) => d.driverId).join(","));
    }
  }, [platform]);

  function validateDriver(): string {
    const missing: string[] = [];
    if (!isConfigured) return "Conecta con API Key y Secret antes de enviar.";
    if (!firstName.trim() && !lastName.trim()) missing.push("Nombre (firstName o lastName)");
    if (!driverCode.trim()) missing.push("Código de conductor (driverCode)");
    if (!groupId.trim()) missing.push("Grupo (groupId)");
    else if (!isPlausibleGroupId(groupId))
      missing.push("Grupo válido (groupId numérico largo del portal Hik)");
    if (!photoData) missing.push("Foto de rostro (JPG)");
    return missingFieldsMessage(missing);
  }

  async function addDriver(e: React.FormEvent) {
    e.preventDefault();
    const err = validateDriver();
    if (err) {
      setMsg(err);
      return;
    }
    const relateVehicleIds = selectedVehicle ? [selectedVehicle.vehicleId] : [];
    const res = await apiPost("/api/fleet/drivers/add", credentialsEnvelope, {
      firstName,
      lastName,
      driverCode,
      gender,
      groupId,
      phone,
      email,
      photoData,
      relateVehicleIds,
    });
    if (res.debug) onHud("Agregar conductor", res.debug);
    const id = (res.data as { data?: { driverId?: string } })?.data?.driverId;
    if (id) {
      setDriverId(id);
      setDispatchIds(id);
      setMsg(`Conductor creado. driverId=${id}`);
    } else {
      setMsg(res.error ?? "Revisa el Inspector API para el errorCode.");
    }
  }

  async function dispatchFace(e: React.FormEvent) {
    e.preventDefault();
    if (!isConfigured) {
      setMsg("Conecta con credenciales reales.");
      return;
    }
    const ids = dispatchIds.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      setMsg("Falta completar: al menos un driverId para despacho facial.");
      return;
    }
    const res = await apiPost("/api/fleet/drivers/face-dispatch", credentialsEnvelope, {
      driverIds: ids,
    });
    if (res.debug) onHud("Despacho facial", res.debug);
    const guid = (res.data as { data?: { guid?: string } })?.data?.guid;
    setMsg(
      res.error ??
        (guid
          ? `Despacho iniciado. guid=${guid}`
          : "Despacho enviado — proceso asíncrono en Hik-Connect.")
    );
  }

  function onPhotoFile(file: File | null) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMsg("La foto supera 5 MB. Usa una imagen JPG más pequeña.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setPhotoPreview(dataUrl);
      setPhotoData(dataUrl.split(",")[1] ?? "");
      setMsg("");
    };
    reader.readAsDataURL(file);
  }

  const isErrorMsg =
    msg.includes("Falta") ||
    msg.includes("Faltan") ||
    msg.includes("errorCode") ||
    msg.includes("Conecta");

  return (
    <div>
      <GuidePanel guide={GUIDES.drivers} />

      {platform && platform.driverGroups.length === 0 && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Crea un grupo de conductores en el portal Hik-Connect y pulsa «Sincronizar» para autocompletar
          el groupId.
        </p>
      )}

      <form onSubmit={addDriver} className="content-card mb-6 space-y-3">
        <h3 className="font-medium text-ink">Registrar conductor</h3>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="Nombre" hint="firstName">
            <input className={inputClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormField>
          <FormField label="Apellido" hint="lastName">
            <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Código de conductor" hint="driverCode — único en tu flota">
          <input className={inputClass} value={driverCode} onChange={(e) => setDriverCode(e.target.value)} />
        </FormField>
        <FormField label="Grupo" hint="groupId del portal Hik-Connect">
          {platform && platform.driverGroups.length > 0 ? (
            <select
              className={inputClass}
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              {platform.driverGroups.map((g) => (
                <option key={g.groupId} value={g.groupId}>
                  {g.groupName} — {g.groupId}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputClass}
              placeholder="ID numérico largo del grupo"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            />
          )}
        </FormField>
        <FormField label="Género" hint="gender: 0=desconocido · 1=masc · 2=fem">
          <select className={inputClass} value={gender} onChange={(e) => setGender(Number(e.target.value))}>
            <option value={0}>Desconocido</option>
            <option value={1}>Masculino</option>
            <option value={2}>Femenino</option>
          </select>
        </FormField>
        <FormField label="Teléfono / Email" hint="Opcionales — el email debe ser único">
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} placeholder="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className={inputClass} placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </FormField>
        <FormField label="Foto de rostro" hint="Obligatoria · JPG ≤ 5 MB">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            className="mt-1 text-xs"
            onChange={(e) => onPhotoFile(e.target.files?.[0] ?? null)}
          />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Vista previa"
              className="mt-3 h-24 w-24 rounded-xl border border-black/[0.08] object-cover"
            />
          )}
        </FormField>
        {selectedVehicle && (
          <p className="text-xs text-ink-tertiary">
            Se vinculará a: <span className="font-mono">{selectedVehicle.licensePlateNo}</span>
          </p>
        )}
        <button type="submit" className={btnPrimary}>
          Registrar conductor
        </button>
      </form>

      <form onSubmit={dispatchFace} className="content-card space-y-3">
        <h3 className="font-medium text-ink">Despacho facial</h3>
        <FormField label="IDs de conductor" hint="driverIds — separados por coma">
          <input
            className={`${inputClass} font-mono text-xs`}
            value={dispatchIds}
            onChange={(e) => setDispatchIds(e.target.value)}
            placeholder="521728422020533248"
          />
        </FormField>
        <button type="submit" className={btnPrimary}>
          Despachar rostros
        </button>
        {driverId && (
          <p className="text-xs text-emerald-600">Último driverId registrado: {driverId}</p>
        )}
      </form>

      <div className="mt-4">
        <FormAlert message={msg} variant={isErrorMsg ? "error" : "info"} />
      </div>
    </div>
  );
}
