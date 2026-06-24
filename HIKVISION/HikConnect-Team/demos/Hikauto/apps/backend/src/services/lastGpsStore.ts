import type { ParsedGpsUpdate } from "../types/hik.types.js";

/** Última posición conocida por serial (cache en memoria del backend). */
class LastGpsStore {
  private bySerial = new Map<string, ParsedGpsUpdate>();

  upsert(update: ParsedGpsUpdate): void {
    this.bySerial.set(update.deviceSerial, update);
  }

  upsertMany(updates: ParsedGpsUpdate[]): void {
    for (const u of updates) this.upsert(u);
  }

  get(deviceSerial: string): ParsedGpsUpdate | undefined {
    return this.bySerial.get(deviceSerial);
  }

  getForSerials(serials: string[]): ParsedGpsUpdate[] {
    return serials
      .map((s) => this.bySerial.get(s))
      .filter((u): u is ParsedGpsUpdate => Boolean(u));
  }

  getAll(): ParsedGpsUpdate[] {
    return [...this.bySerial.values()];
  }
}

export const lastGpsStore = new LastGpsStore();
