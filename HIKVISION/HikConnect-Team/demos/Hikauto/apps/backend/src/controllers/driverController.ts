import type { Response } from "express";
import type { CredentialsRequest } from "../middleware/credentialsExtractor.js";
import { formatHikApiError, isPlausibleDriverGroupId } from "../lib/hikErrorHints.js";
import { hikClient } from "../services/hikClient.js";
import type { HikApiResponse } from "../types/hik.types.js";

const SOURCE = "apps/backend/src/controllers/driverController.ts";

/** Límite de photoData en bytes (PDF §5.9.7: max 5 MB Base64 decodificado). */
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Estima tamaño decodificado de una cadena Base64 sin materializar el buffer completo.
 */
function estimateBase64DecodedSize(base64: string): number {
  const cleaned = base64.replace(/^data:image\/\w+;base64,/, "");
  const padding = cleaned.endsWith("==") ? 2 : cleaned.endsWith("=") ? 1 : 0;
  return Math.floor((cleaned.length * 3) / 4) - padding;
}

/**
 * Registro de conductor con metadatos biométricos (photoData Base64).
 */
export async function addDriver(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const p = req.hikPayload ?? {};

    if (!p.driverCode || !p.groupId || p.gender === undefined) {
      res.status(400).json({
        error: "Campos requeridos: driverCode, groupId, gender (0/1/2).",
      });
      return;
    }

    if (!p.firstName && !p.lastName) {
      res.status(400).json({
        error: "PDF §5.9.7: configure al menos firstName o lastName.",
      });
      return;
    }

    const gender = Number(p.gender);
    if (gender !== 0 && gender !== 1 && gender !== 2) {
      res.status(400).json({ error: "gender inválido: 0=desconocido, 1=masc, 2=fem." });
      return;
    }

    if (!p.photoData || typeof p.photoData !== "string" || p.photoData.trim().length < 100) {
      res.status(400).json({
        error:
          "photoData obligatorio: sube una foto JPG con rostro (Base64, máx. 5 MB). Sin foto Hik rechaza o no puede despachar biometría.",
      });
      return;
    }

    if (!isPlausibleDriverGroupId(String(p.groupId))) {
      res.status(400).json({
        error:
          "groupId inválido. Obtén el ID real en Hik-Connect → Monitoreo a bordo → Grupos de conductores (número largo, ej. 381019761120777216). No uses «1» ni texto inventado.",
      });
      return;
    }

    if (p.photoData && typeof p.photoData === "string") {
      const size = estimateBase64DecodedSize(p.photoData);
      if (size > MAX_PHOTO_BYTES) {
        res.status(400).json({ error: "photoData excede el máximo de 5 MB." });
        return;
      }
    }

    const hikBody = {
      firstName: p.firstName ?? "",
      lastName: p.lastName ?? "",
      driverCode: String(p.driverCode),
      gender,
      groupId: String(p.groupId),
      phone: p.phone ?? "",
      email: p.email ?? "",
      description: p.description ?? "",
      relateVehicleIds: Array.isArray(p.relateVehicleIds) ? p.relateVehicleIds : [],
      driverLicenseInfo: p.driverLicenseInfo ?? {
        licenseNo: "",
        validTime: "",
        imageData: "",
      },
      photoData: p.photoData ?? "",
    };

    const result = await hikClient.proxyPost<HikApiResponse<{ driverId?: string }>>(
      req.hikCredentials!,
      "/api/hccgw/vehicle/v1/driver/add",
      hikBody,
      { sourceFile: SOURCE }
    );

    const hik = result.data as HikApiResponse<{ driverId?: string }> | undefined;
    const apiError = formatHikApiError(hik?.errorCode, hik?.message ?? hik?.Message);

    res.json({
      ...result,
      ...(apiError ? { error: apiError } : {}),
    });
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error al agregar conductor",
      debug: { sourceFile: SOURCE },
    });
  }
}

/**
 * Despacho facial: sincroniza credenciales biométricas al almacenamiento del dashcam onboard.
 * Proceso asíncrono en plataforma Hik; puede devolver data.guid para consultar estado.
 */
export async function dispatchDriverFace(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const p = req.hikPayload ?? {};
    const driverIds = p.driverIds;

    if (!Array.isArray(driverIds) || driverIds.length === 0) {
      res.status(400).json({ error: "driverIds debe ser un array no vacío de IDs de conductor." });
      return;
    }

    const result = await hikClient.proxyPost<HikApiResponse>(
      req.hikCredentials!,
      "/api/hccgw/vehicle/v1/driverFace/distribution",
      { driverIds },
      { sourceFile: SOURCE }
    );

    const hik = result.data as HikApiResponse | undefined;
    const apiError = formatHikApiError(hik?.errorCode, hik?.message ?? hik?.Message);

    res.json({
      ...result,
      ...(apiError ? { error: apiError } : {}),
    });
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error en despacho facial",
      debug: { sourceFile: SOURCE },
    });
  }
}

/**
 * Consulta opcional del estado de aplicación facial tras recibir guid del distribution.
 */
export async function queryFaceStatus(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const guid = req.hikPayload?.guid;
    if (!guid) {
      res.status(400).json({ error: "guid requerido para status/query." });
      return;
    }

    const result = await hikClient.proxyPost(
      req.hikCredentials!,
      "/api/hccgw/vehicle/v1/driverFace/status/query",
      { guid },
      { sourceFile: SOURCE }
    );

    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error al consultar estado facial",
      debug: { sourceFile: SOURCE },
    });
  }
}
