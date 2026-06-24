/** Mensaje amigable listando campos obligatorios faltantes. */
export function missingFieldsMessage(missing: string[]): string {
  if (missing.length === 0) return "";
  if (missing.length === 1) return `Falta completar: ${missing[0]}.`;
  return `Faltan completar: ${missing.join(", ")}.`;
}

export function isPlausibleGroupId(groupId: string): boolean {
  const t = groupId.trim();
  return t.length >= 10 && /^\d+$/.test(t);
}
