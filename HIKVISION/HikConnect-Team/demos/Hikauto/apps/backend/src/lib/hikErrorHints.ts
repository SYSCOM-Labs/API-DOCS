/**
 * Códigos internos Hik (PDF V2.15.0, Apéndice A.4) embebidos en message como {CCF038052}.
 */
const INTERNAL_CODES: Record<string, string> = {
  CCF038009:
    "No se pudo agregar el conductor. Revisa: groupId real del portal (ID largo, no «1» ni texto inventado), driverCode único, y foto JPG con rostro frontal claro.",
  CCF038052:
    "El email ya está registrado en la plataforma. Usa otro email o edita el conductor existente.",
  CCF021103: "El nombre del área ya existe.",
  CCF021307: "El dispositivo no existe.",
  CCF000004: "Error de base de datos en Hik-Connect.",
  CCF000005: "Sin permiso para esta operación.",
  VMS003001: "Este email ya está registrado en la plataforma.",
  VMS038009:
    "Fallo al agregar persona — groupId o driverCode inválido/duplicado, o foto sin rostro detectable.",
  VMS038026: "El email ya existe en la plataforma.",
  EVZ20007: "Dispositivo offline — revisa la conexión de red.",
  EVZ20010: "Código de verificación del dispositivo incorrecto.",
  EVZ20013: "El dispositivo ya fue agregado por otra cuenta.",
  EVZ20014: "Número de serie del dispositivo incorrecto.",
};

/** Extrae códigos tipo CCF038052 del mensaje de Hik. */
export function extractInternalCodes(message: string): string[] {
  const matches = message.match(/\{([A-Z0-9]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/[{}]/g, ""));
}

/**
 * Devuelve texto legible para desarrolladores cuando Hik devuelve OPEN010001 u otros
 * con detalle interno en message.
 */
export function decodeHikErrorMessage(message?: string): string | undefined {
  if (!message) return undefined;
  const codes = extractInternalCodes(message);
  const hints = codes
    .map((c) => INTERNAL_CODES[c])
    .filter((h): h is string => Boolean(h));
  if (hints.length > 0) return hints.join(" ");
  return undefined;
}

export function formatHikApiError(
  errorCode?: string,
  message?: string
): string | undefined {
  if (!errorCode || errorCode === "0") return undefined;
  const decoded = decodeHikErrorMessage(message);
  if (decoded) return `errorCode ${errorCode}: ${decoded}`;
  if (message) return `errorCode ${errorCode}: ${message}`;
  return `errorCode ${errorCode}`;
}

/** groupId de Hik-Connect suele ser un ID numérico largo (≥10 dígitos). */
export function isPlausibleDriverGroupId(groupId: string): boolean {
  const trimmed = groupId.trim();
  if (!trimmed) return false;
  if (trimmed === "1" || trimmed.length < 10) return false;
  return /^\d+$/.test(trimmed);
}
