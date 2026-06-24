import express from "express";
import cors from "cors";
import { credentialsExtractor, credentialsFromQuery, credentialsExtractorOptional } from "./middleware/credentialsExtractor.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { addVehicle, getAccStatus, getLastLocations } from "./controllers/fleetController.js";
import {
  addDriver,
  dispatchDriverFace,
  queryFaceStatus,
} from "./controllers/driverController.js";
import { getStreamToken, getLiveAddress } from "./controllers/videoController.js";
import {
  startTelemetry,
  stopTelemetry,
  telemetryStatus,
  probeTelemetryMq,
} from "./controllers/telemetryController.js";
import { discoverFleet } from "./controllers/discoveryController.js";

/**
 * Aplicación Express del proxy local.
 * Todas las rutas /api/fleet/* reenvían a Hik-Connect con credenciales dinámicas del frontend.
 */
export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    })
  );
  app.use(express.json({ limit: "10mb" }));

  app.use((req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
      const ms = Date.now() - started;
      if (ms > 3000 || res.statusCode >= 400) {
        console.log(`[backend] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
      }
    });
    next();
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "hikconnect-fleet-playground", version: "2.15.0" });
  });

  /** Flota, conductores, video y descubrimiento → ver README.md */
  const fleetRouter = express.Router();
  fleetRouter.post("/vehicles/add", credentialsExtractor, asyncHandler(addVehicle));
  fleetRouter.post("/vehicles/acc-status", credentialsExtractor, asyncHandler(getAccStatus));
  fleetRouter.post("/vehicles/last-locations", credentialsExtractor, asyncHandler(getLastLocations));
  fleetRouter.post("/drivers/add", credentialsExtractor, asyncHandler(addDriver));
  fleetRouter.post("/drivers/face-dispatch", credentialsExtractor, asyncHandler(dispatchDriverFace));
  fleetRouter.post("/drivers/face-status", credentialsExtractor, asyncHandler(queryFaceStatus));
  fleetRouter.get("/stream/token", credentialsFromQuery, asyncHandler(getStreamToken));
  fleetRouter.post("/live/address", credentialsExtractor, asyncHandler(getLiveAddress));
  fleetRouter.post("/discover", credentialsExtractor, asyncHandler(discoverFleet));

  app.use("/api/fleet", fleetRouter);

  /** Worker MQ + sonda diagnóstica → WebSocket /ws/telemetry */
  const telemetryRouter = express.Router();
  telemetryRouter.post("/start", credentialsExtractorOptional, asyncHandler(startTelemetry));
  telemetryRouter.post("/stop", credentialsExtractorOptional, stopTelemetry);
  telemetryRouter.post("/probe", credentialsExtractor, asyncHandler(probeTelemetryMq));
  telemetryRouter.post("/status", credentialsExtractor, telemetryStatus);

  app.use("/api/telemetry", telemetryRouter);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("[backend] error no capturado:", err);
      if (!res.headersSent) {
        res.status(500).json({
          error: err.message || "Error interno del servidor",
          debug: { sourceFile: "apps/backend/src/app.ts" },
        });
      }
    }
  );

  return app;
}
