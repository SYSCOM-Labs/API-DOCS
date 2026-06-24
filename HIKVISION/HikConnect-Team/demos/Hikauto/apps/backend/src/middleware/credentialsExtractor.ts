import type { Request, Response, NextFunction } from "express";
import type { HikCredentials } from "../types/hik.types.js";

/**
 * Extiende Request de Express para adjuntar credenciales Hik extraídas del body.
 * El frontend envía `_credentials` en cada petición; nunca se persisten en disco.
 */
export interface CredentialsRequest extends Request {
  hikCredentials?: HikCredentials;
  /** Body sin el sobre _credentials, listo para reenviar a Hik-Connect. */
  hikPayload?: Record<string, unknown>;
}

const CREDENTIALS_KEY = "_credentials";

/**
 * Middleware que separa `_credentials` del resto del body.
 * Valida que existan serverAddress, appKey y secretKey antes de llegar a los controllers.
 */
export function credentialsExtractor(
  req: CredentialsRequest,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as Record<string, unknown> | undefined;

  if (!body || typeof body !== "object") {
    res.status(400).json({
      error: "Se requiere un body JSON con _credentials y los parámetros de la operación.",
    });
    return;
  }

  const rawCreds = body[CREDENTIALS_KEY] as Partial<HikCredentials> | undefined;
  if (!rawCreds?.serverAddress || !rawCreds?.appKey || !rawCreds?.secretKey) {
    res.status(400).json({
      error:
        "Faltan credenciales. Configure serverAddress, appKey y secretKey en el modal de Configuración.",
    });
    return;
  }

  // Normalizar serverAddress: quitar barra final para evitar URLs duplicadas
  const serverAddress = String(rawCreds.serverAddress).replace(/\/$/, "");

  req.hikCredentials = {
    serverAddress,
    appKey: String(rawCreds.appKey),
    secretKey: String(rawCreds.secretKey),
  };

  const { [CREDENTIALS_KEY]: _, ...rest } = body;
  req.hikPayload = rest as Record<string, unknown>;
  next();
}

/**
 * Para telemetría sandbox: credenciales opcionales (no hay llamadas a Hikvision).
 * En modo real, sigue siendo obligatorio configurar appKey/secretKey.
 */
export function credentialsExtractorOptional(
  req: CredentialsRequest,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as Record<string, unknown> | undefined;
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Body JSON requerido." });
    return;
  }

  const sandboxMode = Boolean(body.sandboxMode);
  const rawCreds = body[CREDENTIALS_KEY] as Partial<HikCredentials> | undefined;

  const { [CREDENTIALS_KEY]: _, ...rest } = body;
  req.hikPayload = rest as Record<string, unknown>;

  if (sandboxMode) {
    if (rawCreds?.serverAddress && rawCreds?.appKey && rawCreds?.secretKey) {
      req.hikCredentials = {
        serverAddress: String(rawCreds.serverAddress).replace(/\/$/, ""),
        appKey: String(rawCreds.appKey),
        secretKey: String(rawCreds.secretKey),
      };
    } else {
      req.hikCredentials = {
        serverAddress: "https://sandbox.local",
        appKey: "sandbox",
        secretKey: "sandbox",
      };
    }
    next();
    return;
  }

  if (!rawCreds?.serverAddress || !rawCreds?.appKey || !rawCreds?.secretKey) {
    res.status(400).json({
      error: "Modo real requiere credenciales completas en _credentials.",
    });
    return;
  }

  req.hikCredentials = {
    serverAddress: String(rawCreds.serverAddress).replace(/\/$/, ""),
    appKey: String(rawCreds.appKey),
    secretKey: String(rawCreds.secretKey),
  };
  next();
}

/**
 * Variante para GET con credenciales en query string (stream token).
 * Formato: ?_credentials=encodeURIComponent(JSON.stringify({...}))
 */
export function credentialsFromQuery(
  req: CredentialsRequest,
  res: Response,
  next: NextFunction
): void {
  const raw = req.query._credentials;
  if (typeof raw !== "string") {
    res.status(400).json({ error: "Query _credentials requerida para esta ruta." });
    return;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<HikCredentials>;
    if (!parsed.serverAddress || !parsed.appKey || !parsed.secretKey) {
      throw new Error("Campos incompletos");
    }
    req.hikCredentials = {
      serverAddress: String(parsed.serverAddress).replace(/\/$/, ""),
      appKey: String(parsed.appKey),
      secretKey: String(parsed.secretKey),
    };
    next();
  } catch {
    res.status(400).json({ error: "_credentials inválidas en query string." });
  }
}
