import type { Response } from "express";
import type { CredentialsRequest } from "../middleware/credentialsExtractor.js";
import { discoverPlatform, sandboxDiscovery } from "../services/discoveryService.js";

export async function discoverAttendance(req: CredentialsRequest, res: Response): Promise<void> {
  const payload = req.hikPayload ?? {};
  if (payload.sandboxMode === true) {
    res.json({
      debug: {
        verb: "MOCK",
        targetUrl: "sandbox://discover",
        requestPayload: null,
        responseBody: sandboxDiscovery(),
        sourceFile: "discoveryController.ts",
      },
      data: sandboxDiscovery(),
    });
    return;
  }

  const credentials = req.hikCredentials!;
  try {
    const snapshot = await discoverPlatform(credentials);
    res.json({
      debug: {
        verb: "POST",
        targetUrl: "multi",
        requestPayload: {},
        responseBody: { calls: snapshot.calls, summary: snapshot.summary },
        sourceFile: "apps/backend/src/controllers/discoveryController.ts",
      },
      data: snapshot,
    });
  } catch (e) {
    res.status(502).json({
      error: e instanceof Error ? e.message : "Error al descubrir plataforma",
    });
  }
}
