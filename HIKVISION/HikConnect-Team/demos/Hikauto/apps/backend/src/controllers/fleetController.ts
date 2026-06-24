import type { Response } from "express";
import type { CredentialsRequest } from "../middleware/credentialsExtractor.js";
import { hikClient } from "../services/hikClient.js";
import { VehicleType } from "../types/hik.types.js";
import { fetchLastLocations } from "../services/lastLocationService.js";
import type { VehicleIdentity } from "../utils/vehicleIdentity.js";

const SOURCE = "apps/backend/src/controllers/fleetController.ts";

/**
 * Controlador de activos de flota e ignición ACC.
 * Regla arquitectónica 1:1 (PDF §1.2.9): un deviceSerial de dashcam ↔ un perfil de vehículo único.
 */
export async function addVehicle(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const payload = req.hikPayload ?? {};
    const { areaId, licensePlateNo, vehicleType, deviceSerial } = payload;

    if (!areaId || !licensePlateNo || vehicleType === undefined || !deviceSerial) {
      res.status(400).json({
        error:
          "Campos requeridos: areaId, licensePlateNo, vehicleType (0-3), deviceSerial (vinculación 1:1 con dashcam).",
      });
      return;
    }

    const vt = Number(vehicleType);
    if (![VehicleType.Others, VehicleType.Car, VehicleType.Truck, VehicleType.Bus].includes(vt as VehicleType)) {
      res.status(400).json({
        error: "vehicleType inválido. Use: 0=otros, 1=auto, 2=camión, 3=bus.",
      });
      return;
    }

    const hikBody = {
      areaId: String(areaId),
      licensePlateNo: String(licensePlateNo),
      vehicleType: vt,
      deviceSerial: String(deviceSerial),
      driverFirstName: payload.driverFirstName ?? "",
      driverLastName: payload.driverLastName ?? "",
      driverPhoneNo: payload.driverPhoneNo ?? "",
      pictureKey: payload.pictureKey ?? "",
      extend: payload.extend ?? "",
    };

    const result = await hikClient.proxyPost(
      req.hikCredentials!,
      "/api/hccgw/resource/v1/areas/vehicles/add",
      hikBody,
      { sourceFile: SOURCE }
    );

    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error al agregar vehículo",
      debug: { sourceFile: SOURCE },
    });
  }
}

/**
 * Consulta estado ACC (ignición) por seriales de dispositivo onboard.
 * PDF §5.9.5: deviceSerials es string CSV; accStatus 1=ON, 0=OFF, -1=sin reporte.
 */
export async function getAccStatus(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const payload = req.hikPayload ?? {};
    const { deviceSerials, vehicleIds } = payload;

    if (!deviceSerials && !vehicleIds) {
      res.status(400).json({
        error: "Se requiere deviceSerials (CSV) o vehicleIds según PDF §5.9.5.",
      });
      return;
    }

    const hikBody: Record<string, string> = {};
    if (deviceSerials) {
      // Aceptar array del frontend y convertir a CSV como exige la API
      hikBody.deviceSerials = Array.isArray(deviceSerials)
        ? (deviceSerials as string[]).join(",")
        : String(deviceSerials);
    }
    if (vehicleIds) {
      hikBody.vehicleIds = Array.isArray(vehicleIds)
        ? (vehicleIds as string[]).join(",")
        : String(vehicleIds);
    }

    const result = await hikClient.proxyPost(
      req.hikCredentials!,
      "/api/hccgw/resource/v1/accstatus/search",
      hikBody,
      { sourceFile: SOURCE }
    );

    res.json(result);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error al consultar ACC",
      debug: { sourceFile: SOURCE },
    });
  }
}

/** Etiquetas legibles para accStatus en la UI. */
export function accStatusLabel(status: number): string {
  switch (status) {
    case 1:
      return "ACC On / Motor Encendido";
    case 0:
      return "ACC Off / Motor Apagado";
    case -1:
    default:
      return "Unknown / Sin Reporte de Telemetría";
  }
}

/**
 * Últimas posiciones GPS cacheadas + opcional escucha MQ (única vía documentada en V2.15.0).
 */
export async function getLastLocations(req: CredentialsRequest, res: Response): Promise<void> {
  try {
    const payload = req.hikPayload ?? {};
    const deviceSerials = Array.isArray(payload.deviceSerials)
      ? (payload.deviceSerials as string[])
      : [];
    const refresh = Boolean(payload.refresh);
    const waitSeconds = Number(payload.waitSeconds ?? 30);
    const vehicleRegistry: VehicleIdentity[] = Array.isArray(payload.vehicleRegistry)
      ? (payload.vehicleRegistry as Record<string, unknown>[])
          .map((v) => ({
            deviceSerial: String(v.deviceSerial ?? ""),
            name: String(v.name ?? ""),
            licensePlateNo: String(v.licensePlateNo ?? v.licensePlate ?? ""),
            vehicleId: v.vehicleId ? String(v.vehicleId) : undefined,
          }))
          .filter((v) => v.deviceSerial)
      : [];

    const result = await fetchLastLocations(req.hikCredentials!, deviceSerials, {
      refresh,
      waitSeconds,
      vehicleRegistry,
    });

    res.json({
      debug: {
        verb: "POST",
        targetUrl: "local:/api/fleet/vehicles/last-locations",
        requestPayload: { deviceSerials, refresh, waitSeconds },
        responseBody: {
          count: result.locations.length,
          source: result.source,
          mqEventCount: result.mqEventCount,
        },
        sourceFile: SOURCE,
      },
      data: result,
    });
  } catch (err) {
    console.error("[backend] getLastLocations:", err);
    res.status(502).json({
      error: err instanceof Error ? err.message : "Error al obtener últimas ubicaciones",
      debug: { sourceFile: SOURCE },
    });
  }
}
