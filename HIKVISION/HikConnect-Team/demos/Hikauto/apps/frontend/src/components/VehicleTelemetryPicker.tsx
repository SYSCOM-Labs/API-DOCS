import { useEffect, useRef, useState } from "react";
import { apiPost } from "../api/client";
import type { DiscoveredVehicle, ProxyDebugInfo } from "../types";
import { btnGhost, btnSecondary, selectClass } from "./ui/classes";

interface VehicleTelemetryPickerProps {
  vehicles: DiscoveredVehicle[];
  selectedSerials: string[];
  onChange: (serials: string[]) => void;
  credentialsEnvelope: Record<string, string>;
  isConfigured: boolean;
  onHud?: (label: string, debug?: ProxyDebugInfo) => void;
  activeVehicleSerial?: string;
}

function vehicleLabel(v: DiscoveredVehicle): string {
  const plate = v.licensePlateNo || v.name || v.deviceSerial;
  return `${plate} · ${v.deviceSerial}${v.online === "1" ? " · online" : ""}`;
}

function OnlineBadge({ online }: { online?: string }) {
  const isOn = online === "1";
  return (
    <span
      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
        isOn ? "bg-emerald-100 text-emerald-700" : "bg-neutral-200 text-ink-tertiary"
      }`}
    >
      {isOn ? "On" : "Off"}
    </span>
  );
}

export function VehicleTelemetryPicker({
  vehicles,
  selectedSerials,
  onChange,
  credentialsEnvelope,
  isConfigured,
  onHud,
  activeVehicleSerial,
}: VehicleTelemetryPickerProps) {
  const [open, setOpen] = useState(false);
  const [accOnline, setAccOnline] = useState<Record<string, number>>({});
  const [accLoading, setAccLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function toggleSerial(serial: string) {
    if (selectedSerials.includes(serial)) {
      onChange(selectedSerials.filter((s) => s !== serial));
    } else {
      onChange([...selectedSerials, serial]);
    }
  }

  function selectOnlyOnline() {
    const online = vehicles.filter((v) => v.online === "1").map((v) => v.deviceSerial);
    onChange(online.length ? online : vehicles.map((v) => v.deviceSerial));
  }

  function selectActive() {
    if (activeVehicleSerial) onChange([activeVehicleSerial]);
  }

  function selectFromDropdown(serial: string) {
    onChange([serial]);
    setOpen(false);
  }

  async function refreshAcc() {
    if (!isConfigured || vehicles.length === 0) return;
    setAccLoading(true);
    try {
      const serials = vehicles.map((v) => v.deviceSerial).join(",");
      const res = await apiPost<{
        data?: { accStatusInfos?: Array<{ idOrDeviceSerial: string; accStatus: number }> };
      }>("/api/fleet/vehicles/acc-status", credentialsEnvelope, { deviceSerials: serials });
      if (res.debug) onHud?.("ACC (telemetría)", res.debug);
      const infos =
        (res.data as { data?: { accStatusInfos?: Array<{ idOrDeviceSerial: string; accStatus: number }> } })
          ?.data?.accStatusInfos ?? [];
      const next: Record<string, number> = {};
      for (const row of infos) next[row.idOrDeviceSerial] = row.accStatus;
      setAccOnline(next);
    } finally {
      setAccLoading(false);
    }
  }

  if (vehicles.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">
        No hay vehículos en inventario. Sincroniza la plataforma primero.
      </p>
    );
  }

  const primarySerial = selectedSerials[0] ?? activeVehicleSerial ?? vehicles[0]?.deviceSerial;
  const summary =
    selectedSerials.length === 0
      ? "Selecciona vehículo(s)…"
      : selectedSerials.length === 1
        ? vehicleLabel(vehicles.find((v) => v.deviceSerial === selectedSerials[0]) ?? vehicles[0])
        : `${selectedSerials.length} vehículos seleccionados`;

  return (
    <div ref={rootRef} className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[min(100%,280px)] flex-1">
          <p className="section-label mb-1.5">Vehículos a rastrear</p>

          {vehicles.length === 1 ? (
            <select
              className={`${selectClass} !mt-0`}
              value={primarySerial}
              onChange={(e) => onChange([e.target.value])}
            >
              {vehicles.map((v) => (
                <option key={v.vehicleId} value={v.deviceSerial}>
                  {vehicleLabel(v)}
                </option>
              ))}
            </select>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`${selectClass} !mt-0 flex w-full items-center justify-between gap-2 text-left`}
                aria-expanded={open}
                aria-haspopup="listbox"
              >
                <span className="truncate">{summary}</span>
                <span className="shrink-0 text-xs text-ink-tertiary">{open ? "▲" : "▼"}</span>
              </button>

              {open && (
                <div
                  className="absolute left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-xl border border-black/[0.08] bg-white py-1 shadow-lg"
                  role="listbox"
                >
                  {vehicles.map((v) => {
                    const checked = selectedSerials.includes(v.deviceSerial);
                    const acc = accOnline[v.deviceSerial];
                    const accOn = acc === 1;
                    return (
                      <label
                        key={v.vehicleId}
                        className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/[0.03]"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSerial(v.deviceSerial)}
                          className="h-3.5 w-3.5 rounded border-neutral-300 text-accent focus:ring-accent/30"
                        />
                        <span className="min-w-0 flex-1 truncate font-medium text-ink">
                          {v.licensePlateNo || v.name || v.deviceSerial}
                        </span>
                        <OnlineBadge online={v.online} />
                        {acc !== undefined && (
                          <span
                            className={`rounded px-1.5 text-[10px] ${
                              accOn ? "bg-sky-100 text-sky-800" : "bg-neutral-100 text-ink-tertiary"
                            }`}
                          >
                            ACC {accOn ? "ON" : "OFF"}
                          </span>
                        )}
                      </label>
                    );
                  })}
                  <div className="border-t border-black/[0.06] px-3 py-2">
                    <p className="mb-1.5 text-[10px] uppercase tracking-wide text-ink-tertiary">
                      Selección rápida
                    </p>
                    <select
                      className="w-full rounded-lg border border-black/[0.08] bg-white px-2 py-1.5 text-xs"
                      value={primarySerial}
                      onChange={(e) => selectFromDropdown(e.target.value)}
                    >
                      {vehicles.map((v) => (
                        <option key={v.vehicleId} value={v.deviceSerial}>
                          {vehicleLabel(v)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 pb-0.5">
          <button type="button" className={btnGhost} onClick={selectActive} disabled={!activeVehicleSerial}>
            Activo
          </button>
          <button type="button" className={btnGhost} onClick={selectOnlyOnline}>
            Online
          </button>
          {isConfigured && (
            <button
              type="button"
              className={btnSecondary}
              onClick={() => void refreshAcc()}
              disabled={accLoading}
            >
              {accLoading ? "ACC…" : "ACC"}
            </button>
          )}
        </div>
      </div>

      {selectedSerials.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedSerials.map((serial) => {
            const v = vehicles.find((x) => x.deviceSerial === serial);
            const label = v?.licensePlateNo || v?.name || serial;
            return (
              <button
                key={serial}
                type="button"
                onClick={() => toggleSerial(serial)}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-ink-secondary hover:bg-neutral-200"
                title={`Quitar ${serial}`}
              >
                {label}
                <span aria-hidden>×</span>
              </button>
            );
          })}
        </div>
      )}

      {selectedSerials.length === 0 && (
        <p className="text-sm text-red-600">Selecciona al menos un vehículo para ver el mapa.</p>
      )}
    </div>
  );
}
