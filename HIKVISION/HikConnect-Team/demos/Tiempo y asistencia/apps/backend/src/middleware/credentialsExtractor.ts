import type { Request, Response, NextFunction } from "express";
import type { HikCredentials } from "../types/hik.types.js";

export interface CredentialsRequest extends Request {
  hikCredentials?: HikCredentials;
  hikPayload?: Record<string, unknown>;
}

const CREDENTIALS_KEY = "_credentials";

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
        "Faltan credenciales. Configure serverAddress, appKey y secretKey en Configuración.",
    });
    return;
  }

  req.hikCredentials = {
    serverAddress: String(rawCreds.serverAddress).replace(/\/$/, ""),
    appKey: String(rawCreds.appKey),
    secretKey: String(rawCreds.secretKey),
  };

  const { [CREDENTIALS_KEY]: _, ...rest } = body;
  req.hikPayload = rest as Record<string, unknown>;
  next();
}

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
    req.hikCredentials = {
      serverAddress: rawCreds?.serverAddress
        ? String(rawCreds.serverAddress).replace(/\/$/, "")
        : "https://sandbox.local",
      appKey: rawCreds?.appKey ? String(rawCreds.appKey) : "sandbox",
      secretKey: rawCreds?.secretKey ? String(rawCreds.secretKey) : "sandbox",
    };
    next();
    return;
  }

  if (!rawCreds?.serverAddress || !rawCreds?.appKey || !rawCreds?.secretKey) {
    res.status(400).json({ error: "Modo real requiere credenciales completas." });
    return;
  }

  req.hikCredentials = {
    serverAddress: String(rawCreds.serverAddress).replace(/\/$/, ""),
    appKey: String(rawCreds.appKey),
    secretKey: String(rawCreds.secretKey),
  };
  next();
}
