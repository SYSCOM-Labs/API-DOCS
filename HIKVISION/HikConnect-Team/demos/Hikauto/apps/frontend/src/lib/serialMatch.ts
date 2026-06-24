export function normalizeSerial(serial: string): string {
  return serial.trim().toUpperCase();
}

export function serialInWatchList(serial: string, watched: string[]): boolean {
  if (watched.length === 0) return true;
  const norm = normalizeSerial(serial);
  return watched.some((w) => normalizeSerial(w) === norm);
}
