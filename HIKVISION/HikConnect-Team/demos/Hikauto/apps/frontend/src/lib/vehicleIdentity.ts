import { normalizeSerial } from "./serialMatch";

export interface VehicleIdentity {
  deviceSerial: string;
  name: string;
  licensePlateNo: string;
  vehicleId?: string;
}

export function toVehicleRegistry(
  vehicles: Array<{
    deviceSerial: string;
    name: string;
    licensePlateNo: string;
    vehicleId?: string;
  }>
): VehicleIdentity[] {
  return vehicles.map((v) => ({
    deviceSerial: v.deviceSerial,
    name: v.name,
    licensePlateNo: v.licensePlateNo,
    vehicleId: v.vehicleId,
  }));
}

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
      for (const s of [v.deviceSerial, v.name, v.licensePlateNo]) {
        if (s?.trim()) out.add(s.trim());
      }
    } else if (serial.trim()) {
      out.add(serial.trim());
    }
  }
  return [...out];
}
