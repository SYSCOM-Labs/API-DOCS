import type { Response } from "express";
import type { CredentialsRequest } from "../middleware/credentialsExtractor.js";
import { hikClient } from "../services/hikClient.js";

const SOURCE = "apps/backend/src/controllers/videoController.ts";

/** Canal en URL ezopen: …/SERIAL/5.live */
function applyEzopenChannel(url: string, channel: number): string {
  if (!url || channel < 1) return url;
  return url.replace(/\/(\d+)\.(live|hd\.live|rec|hd\.rec)/i, `/${channel}.$2`);
}

/**
 * Proxy de GET streamtoken/get para el JSSDK de video en vivo y audio bidireccional.
 * PDF §5.1.4: appToken válido ~7 días; usado por ezuikit-js en el frontend.
 */
export async function getStreamToken(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const result = await hikClient.proxyGet(
      req.hikCredentials!,
      "/api/hccgw/platform/v1/streamtoken/get",
      { sourceFile: SOURCE }
    );
    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error al obtener stream token",
      debug: { sourceFile: SOURCE },
    });
  }
}

/**
 * Obtiene URL EZOPEN/RTMP para live view del dashcam móvil.
 * type "1" = live view; protocol 1 = EZOPEN (PDF §5.5).
 */
export async function getLiveAddress(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const p = req.hikPayload ?? {};
    if (!p.deviceSerial) {
      res.status(400).json({ error: "deviceSerial requerido." });
      return;
    }

    const hikBody: Record<string, unknown> = {
      type: String(p.type ?? "1"),
      deviceSerial: String(p.deviceSerial),
      resourceId: p.resourceId ?? "",
      protocol: p.protocol ?? 1,
      quality: p.quality ?? "1",
    };
    if (p.code && String(p.code).trim()) {
      hikBody.code = String(p.code).trim();
    }

    const cameraChannel = Number(p.cameraChannel ?? 0);

    const result = await hikClient.proxyPost(
      req.hikCredentials!,
      "/api/hccgw/video/v1/live/address/get",
      hikBody,
      { sourceFile: SOURCE }
    );

    const hikData = result.data as { errorCode?: string; data?: { url?: string; id?: string } };
    if (cameraChannel > 0 && hikData?.data?.url) {
      hikData.data.url = applyEzopenChannel(hikData.data.url, cameraChannel);
    }

    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error al obtener URL de live",
      debug: { sourceFile: SOURCE },
    });
  }
}
