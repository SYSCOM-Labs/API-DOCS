/**
 * Emparejamiento entre inventario Hik (serialNo) e identidad en eventos MQ (device.name).
 * En muchos tenants el MQ usa nombres como "Unidad 351" en lugar del serial del dashcam.
 */
import { normalizeSerial } from "./serialMatch.js";

export interface VehicleIdentity {
  deviceSerial: string;
  name: string;
  licensePlateNo: string;
  vehicleId?: string;
}

function addAlias(set: Set<string>, value?: string): void {
  const v = value?.trim();
  if (v) set.add(v);
}

/** Alias MQ (device.name, placa, nombre flota) para cada vehículo seleccionado. */
export function expandWatchIdentifiers(
  selectedSerials: string[],
  vehicles: VehicleIdentity[]
): string[] {
  const out = new Set<string>();
  for (const serial of selectedSerials) {
    const v = vehicles.find(
      (x) => normalizeSerial(x.deviceSerial) === normalizeSerial(serial)
    );
    if (v) {
      addAlias(out, v.deviceSerial);
      addAlias(out, v.name);
      addAlias(out, v.licensePlateNo);
    } else {
      addAlias(out, serial);
    }
  }
  return [...out];
}

function identityAliases(v: VehicleIdentity): string[] {
  return [v.deviceSerial, v.name, v.licensePlateNo].filter((s) => s?.trim()) as string[];
}

function candidateMatchesVehicle(
  candidates: string[],
  v: VehicleIdentity
): boolean {
  const aliases = identityAliases(v).map(normalizeSerial);
  return candidates.some((c) => aliases.includes(normalizeSerial(c)));
}

/** Resuelve device.name del MQ al serialNo canónico del inventario. */
export function resolveCanonicalSerial(
  mqDeviceName: string,
  licensePlate: string | undefined,
  resourceName: string | undefined,
  vehicles: VehicleIdentity[]
): string {
  const candidates = [mqDeviceName, licensePlate, resourceName].filter(
    (s) => s?.trim()
  ) as string[];

  for (const v of vehicles) {
    if (candidateMatchesVehicle(candidates, v)) return v.deviceSerial;
  }
  return mqDeviceName;
}

export function matchesVehicleWatch(
  mqDeviceName: string,
  licensePlate: string | undefined,
  resourceName: string | undefined,
  watchIdentifiers: string[],
  vehicles: VehicleIdentity[]
): boolean {
  if (watchIdentifiers.length === 0) return true;

  const candidates = [mqDeviceName, licensePlate, resourceName].filter(
    (s) => s?.trim()
  ) as string[];

  for (const w of watchIdentifiers) {
    if (candidates.some((c) => normalizeSerial(c) === normalizeSerial(w))) return true;

    const v = vehicles.find(
      (x) => normalizeSerial(x.deviceSerial) === normalizeSerial(w)
    );
    if (v && candidateMatchesVehicle(candidates, v)) return true;

    const byName = vehicles.find(
      (x) =>
        normalizeSerial(x.name) === normalizeSerial(w) ||
        normalizeSerial(x.licensePlateNo) === normalizeSerial(w)
    );
    if (byName && candidateMatchesVehicle(candidates, byName)) return true;
  }
  return false;
}

/** Filtra GPS ya parseados y normaliza deviceSerial al serialNo del inventario. */
export function filterAndNormalizeGps<T extends {
  deviceSerial: string;
  licensePlate: string;
  mqDeviceName?: string;
  resourceName?: string;
}>(
  items: T[],
  watchIdentifiers: string[],
  vehicles: VehicleIdentity[]
): Array<T & { deviceSerial: string }> {
  const out: Array<T & { deviceSerial: string }> = [];
  for (const g of items) {
    const mqName = g.mqDeviceName ?? g.deviceSerial;
    if (!matchesVehicleWatch(mqName, g.licensePlate, g.resourceName, watchIdentifiers, vehicles)) {
      continue;
    }
    out.push({
      ...g,
      deviceSerial: resolveCanonicalSerial(
        mqName,
        g.licensePlate,
        g.resourceName,
        vehicles
      ),
    });
  }
  return out;
}
