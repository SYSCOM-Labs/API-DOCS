"use client";

import { useMemo, useState } from "react";
import { categoryLabel, useDevices, type HppDevice } from "@/lib/devices";

export { isSpeaker } from "@/lib/devices";
export type { HppDevice };

export function DevicePicker({
  selected,
  onChange,
  multiple = true,
  compatibleOnly,
  compatibleLabel = "Solo compatibles",
  isCompatible,
  hint,
}: {
  selected: string[];
  onChange: (serials: string[]) => void;
  multiple?: boolean;
  compatibleOnly?: boolean;
  compatibleLabel?: string;
  isCompatible?: (device: HppDevice) => boolean;
  hint?: string;
}) {
  const { devices, error, loading, reload } = useDevices();
  const [search, setSearch] = useState("");
  const [onlyCompatible, setOnlyCompatible] = useState(Boolean(compatibleOnly));
  const [manual, setManual] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return devices.filter((device) => {
      if (onlyCompatible && isCompatible && !isCompatible(device)) return false;
      if (!term) return true;
      return [device.deviceName, device.deviceSerial, device.siteName, device.deviceType]
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [devices, search, onlyCompatible, isCompatible]);

  function toggle(serial: string) {
    if (!serial) return;
    if (!multiple) {
      onChange(selected.includes(serial) ? [] : [serial]);
      return;
    }
    onChange(
      selected.includes(serial)
        ? selected.filter((item) => item !== serial)
        : [...selected, serial],
    );
  }

  function addManual() {
    const serial = manual.trim();
    if (!serial || selected.includes(serial)) return;
    onChange(multiple ? [...selected, serial] : [serial]);
    setManual("");
  }

  return (
    <div className="picker">
      <div className="picker-head">
        <input
          className="field"
          placeholder="Buscar por nombre, serial o sitio"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="btn" disabled={loading} onClick={() => void reload()}>
          {loading ? "Cargando…" : "Recargar"}
        </button>
      </div>

      {isCompatible && (
        <label className="picker-filter">
          <input
            type="checkbox"
            checked={onlyCompatible}
            onChange={(event) => setOnlyCompatible(event.target.checked)}
          />
          {compatibleLabel}
        </label>
      )}

      {selected.length > 0 && (
        <div className="picker-chips">
          {selected.map((serial) => (
            <button key={serial} className="picker-chip" onClick={() => toggle(serial)}>
              {serial}
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="picker-list">
        {error && <div className="empty-state compact">{error}</div>}
        {!error && !visible.length && (
          <div className="empty-state compact">
            {loading ? "Consultando inventario…" : "Sin dispositivos que coincidan."}
          </div>
        )}
        {visible.map((device) => {
          const serial = device.deviceSerial ?? "";
          const active = selected.includes(serial);
          const compatible = !isCompatible || isCompatible(device);
          return (
            <button
              key={device.id ?? serial}
              className={`picker-option ${active ? "active" : ""}`}
              onClick={() => toggle(serial)}
            >
              <span className={`device-dot ${device.deviceOnlineStatus === 1 ? "online" : "offline"}`} />
              <span>
                <strong>{device.deviceName || serial}</strong>
                <small>
                  {serial} · {device.deviceType ?? "modelo n/d"} · {categoryLabel(device)}
                  {compatible ? "" : " · no compatible"}
                </small>
              </span>
              <span className="picker-mark">{active ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>

      <div className="picker-manual">
        <input
          className="field"
          placeholder="Añadir serial manualmente"
          value={manual}
          onChange={(event) => setManual(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addManual();
            }
          }}
        />
        <button className="btn" disabled={!manual.trim()} onClick={addManual}>
          Añadir
        </button>
      </div>

      {hint && <p className="desc picker-hint">{hint}</p>}
    </div>
  );
}

/** Campo de serial con desplegable del inventario, con escritura manual siempre disponible. */
export function SerialField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (serial: string) => void;
  placeholder?: string;
}) {
  const { devices, loading } = useDevices();
  return (
    <div className="serial-field">
      <input
        className="field"
        value={value}
        placeholder={placeholder ?? "Serial del dispositivo"}
        onChange={(event) => onChange(event.target.value)}
      />
      <select
        className="field"
        value={devices.some((device) => device.deviceSerial === value) ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{loading ? "Cargando…" : `Inventario (${devices.length})`}</option>
        {devices.map((device) => (
          <option key={device.id ?? device.deviceSerial} value={device.deviceSerial ?? ""}>
            {device.deviceName || device.deviceSerial} · {device.deviceSerial}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Campo de ID interno (no serial), usado por operaciones como device/delete. */
export function DeviceIdField({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { devices, loading } = useDevices();
  return (
    <div className="serial-field">
      <input
        className="field"
        value={value}
        placeholder="ID interno del dispositivo"
        onChange={(event) => onChange(event.target.value)}
      />
      <select
        className="field"
        value={devices.some((device) => device.id === value) ? value : ""}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{loading ? "Cargando…" : `Inventario (${devices.length})`}</option>
        {devices.map((device) => (
          <option key={device.id ?? device.deviceSerial} value={device.id ?? ""}>
            {device.deviceName || device.deviceSerial} · {device.deviceSerial}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Selector múltiple que mantiene el valor como JSON para operaciones deviceSerialList/deviceSerials. */
export function MultiSerialField({
  value,
  onChange,
}: {
  value: string;
  onChange: (json: string) => void;
}) {
  let selected: string[] = [];
  try {
    const parsed = JSON.parse(value || "[]");
    if (Array.isArray(parsed)) selected = parsed.filter((item): item is string => typeof item === "string");
  } catch {
    // Conserva la edición manual inválida hasta que el usuario use el selector.
  }

  return (
    <div className="multi-serial-field">
      <textarea
        className="field"
        value={value}
        placeholder='["SERIAL1","SERIAL2"]'
        onChange={(event) => onChange(event.target.value)}
      />
      <details>
        <summary>
          Elegir del inventario
          <span>{selected.length ? `${selected.length} seleccionado(s)` : "ninguno"}</span>
        </summary>
        <DevicePicker
          selected={selected}
          onChange={(serials) => onChange(JSON.stringify(serials))}
          hint="Puedes elegir uno, varios o limpiar la selección. El JSON se completa automáticamente."
        />
      </details>
    </div>
  );
}
