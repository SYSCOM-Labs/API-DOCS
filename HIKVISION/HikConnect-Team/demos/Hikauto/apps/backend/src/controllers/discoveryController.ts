import type { Response } from "express";
import type { CredentialsRequest } from "../middleware/credentialsExtractor.js";
import { discoverPlatform } from "../services/discoveryService.js";

const SOURCE = "apps/backend/src/controllers/discoveryController.ts";

/**
 * Consulta en paralelo áreas, vehículos, cámaras y conductores de la cuenta conectada.
 * El frontend usa esta respuesta para autocompletar todos los formularios del demo.
 */
export async function discoverFleet(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const result = await discoverPlatform(req.hikCredentials!);
    res.json({
      debug: {
        verb: "POST",
        targetUrl: "local:/api/fleet/discover (múltiples APIs Hik)",
        requestPayload: { action: "platform_discovery" },
        responseBody: { errorCode: "0", summary: result.summary },
        sourceFile: SOURCE,
      },
      data: result,
    });
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error al descubrir plataforma",
      debug: { sourceFile: SOURCE },
    });
  }
}
