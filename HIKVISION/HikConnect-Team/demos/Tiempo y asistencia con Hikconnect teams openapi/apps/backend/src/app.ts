import express from "express";
import cors from "cors";
import {
  credentialsExtractor,
  credentialsExtractorOptional,
} from "./middleware/credentialsExtractor.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { discoverAttendance } from "./controllers/discoveryController.js";
import {
  addAccessLevel,
  addGroup,
  addPerson,
  assignAccessLevel,
  cardCollect,
  deleteGroup,
  deletePerson,
  eventsStatus,
  fingerCollect,
  listAccessLevels,
  listPersons,
  listScheduleTemplates,
  personPhoto,
  personQr,
  proxyHik,
  quickAddPerson,
  remoteDoorControl,
  removeAccessLevel,
  searchCertificateRecords,
  searchGroups,
  searchTimeCard,
  startEvents,
  stopEvents,
  updateCards,
  updateFingers,
  updatePin,
} from "./controllers/attendanceController.js";

export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    })
  );
  app.use(express.json({ limit: "15mb" }));

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
    res.json({ ok: true, service: "hikconnect-attendance-playground", version: "2.15.0" });
  });

  const api = express.Router();

  api.post("/discover", credentialsExtractorOptional, asyncHandler(discoverAttendance));
  api.post("/proxy", credentialsExtractorOptional, asyncHandler(proxyHik));

  api.post("/groups/search", credentialsExtractorOptional, asyncHandler(searchGroups));
  api.post("/groups/add", credentialsExtractorOptional, asyncHandler(addGroup));
  api.post("/groups/delete", credentialsExtractorOptional, asyncHandler(deleteGroup));

  api.post("/persons/list", credentialsExtractorOptional, asyncHandler(listPersons));
  api.post("/persons/add", credentialsExtractorOptional, asyncHandler(addPerson));
  api.post("/persons/quick-add", credentialsExtractorOptional, asyncHandler(quickAddPerson));
  api.post("/persons/delete", credentialsExtractorOptional, asyncHandler(deletePerson));
  api.post("/persons/photo", credentialsExtractorOptional, asyncHandler(personPhoto));
  api.post("/persons/pin", credentialsExtractorOptional, asyncHandler(updatePin));
  api.post("/persons/qrcode", credentialsExtractorOptional, asyncHandler(personQr));
  api.post("/persons/card-collect", credentialsExtractorOptional, asyncHandler(cardCollect));
  api.post("/persons/finger-collect", credentialsExtractorOptional, asyncHandler(fingerCollect));
  api.post("/persons/update-cards", credentialsExtractorOptional, asyncHandler(updateCards));
  api.post("/persons/update-fingers", credentialsExtractorOptional, asyncHandler(updateFingers));

  api.post("/access-levels/list", credentialsExtractorOptional, asyncHandler(listAccessLevels));
  api.post("/access-levels/add", credentialsExtractorOptional, asyncHandler(addAccessLevel));
  api.post("/access-levels/templates", credentialsExtractorOptional, asyncHandler(listScheduleTemplates));
  api.post("/access-levels/assign", credentialsExtractorOptional, asyncHandler(assignAccessLevel));
  api.post("/access-levels/remove", credentialsExtractorOptional, asyncHandler(removeAccessLevel));

  api.post("/doors/remote-control", credentialsExtractorOptional, asyncHandler(remoteDoorControl));
  api.post("/records/search", credentialsExtractorOptional, asyncHandler(searchCertificateRecords));
  api.post("/report/timecard", credentialsExtractorOptional, asyncHandler(searchTimeCard));

  api.post("/events/start", credentialsExtractorOptional, asyncHandler(startEvents));
  api.post("/events/stop", credentialsExtractorOptional, asyncHandler(stopEvents));
  api.post("/events/status", credentialsExtractorOptional, eventsStatus);

  app.use("/api/attendance", api);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("[backend] error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "Error interno" });
      }
    }
  );

  return app;
}
