import type { Response } from "express";
import type { CredentialsRequest } from "../middleware/credentialsExtractor.js";
import { hikClient } from "../services/hikClient.js";
import {
  sandboxAccessLevels,
  sandboxAddAccessLevel,
  sandboxAddGroup,
  sandboxAddPerson,
  sandboxCertificateRecords,
  sandboxDeleteGroup,
  sandboxDeletePerson,
  sandboxGroups,
  sandboxOk,
  sandboxPersons,
  sandboxRemoteControl,
  sandboxTimeCard,
} from "../services/sandboxData.js";

function wantsSandbox(payload: Record<string, unknown> | undefined): boolean {
  return payload?.sandboxMode === true;
}

async function proxyOrSandbox(
  req: CredentialsRequest,
  res: Response,
  path: string,
  body: unknown,
  sandboxFactory: () => unknown,
  sourceFile: string
): Promise<void> {
  if (wantsSandbox(req.hikPayload)) {
    const data = sandboxFactory();
    res.json({
      debug: {
        verb: "MOCK",
        targetUrl: `sandbox://${path}`,
        requestPayload: body,
        responseBody: data,
        sourceFile,
      },
      data,
    });
    return;
  }

  const result = await hikClient.proxyPost(req.hikCredentials!, path, body, {
    sourceFile,
  });
  res.json(result);
}

export async function proxyHik(req: CredentialsRequest, res: Response): Promise<void> {
  const payload = req.hikPayload ?? {};
  const path = String(payload.path ?? "");
  if (!path.startsWith("/api/hccgw/")) {
    res.status(400).json({ error: "path inválido; debe iniciar con /api/hccgw/" });
    return;
  }
  const body = (payload.body as Record<string, unknown>) ?? {};
  await proxyOrSandbox(req, res, path, body, () => sandboxOk({ path }), "proxyController.ts");
}

export async function searchGroups(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/groups/search",
    body,
    sandboxGroups,
    "personController.ts"
  );
}

export async function addGroup(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/groups/add",
    body,
    () => sandboxAddGroup(body),
    "personController.ts"
  );
}

export async function deleteGroup(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/groups/delete",
    body,
    () => sandboxDeleteGroup(body),
    "personController.ts"
  );
}

export async function listPersons(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/list",
    body,
    sandboxPersons,
    "personController.ts"
  );
}

export async function addPerson(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/add",
    body,
    () => sandboxAddPerson(body),
    "personController.ts"
  );
}

export async function quickAddPerson(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/quick/add",
    body,
    () => sandboxAddPerson(body),
    "personController.ts"
  );
}

export async function deletePerson(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/delete",
    body,
    () => sandboxDeletePerson(body),
    "personController.ts"
  );
}

export async function personPhoto(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/photo",
    body,
    () => sandboxOk(),
    "personController.ts"
  );
}

export async function updatePin(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/updatepincode",
    body,
    () => sandboxOk(),
    "personController.ts"
  );
}

export async function personQr(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/qrcode",
    body,
    () => sandboxOk({ qrCode: "SANDBOX-QR-DEMO" }),
    "personController.ts"
  );
}

export async function cardCollect(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/cardcollect",
    body,
    () => sandboxOk({ cardNo: "12345678" }),
    "personController.ts"
  );
}

export async function fingerCollect(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/fingercollect",
    body,
    () => sandboxOk({ fingerData: "sandbox" }),
    "personController.ts"
  );
}

export async function updateCards(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/updatecards",
    body,
    () => sandboxOk(),
    "personController.ts"
  );
}

export async function updateFingers(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/person/v1/persons/updatefingers",
    body,
    () => sandboxOk(),
    "personController.ts"
  );
}

export async function listAccessLevels(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/acspm/v1/accesslevel/list",
    body,
    sandboxAccessLevels,
    "accessController.ts"
  );
}

export async function addAccessLevel(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/acspm/v1/access/level/add",
    body,
    () => sandboxAddAccessLevel(body),
    "accessController.ts"
  );
}

export async function listScheduleTemplates(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/acspm/v1/template/list",
    body,
    () => ({
      errorCode: "0",
      data: {
        templateResponse: {
          pageIndex: 1,
          pageSize: 1,
          totalNum: 1,
          templateList: [{ id: "tpl-1", name: "Horario laboral", remark: "Lunes–Viernes" }],
        },
      },
    }),
    "accessController.ts"
  );
}

export async function assignAccessLevel(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/acspm/v1/accesslevel/person/add",
    body,
    () => sandboxOk(),
    "accessController.ts"
  );
}

export async function removeAccessLevel(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/acspm/v1/accesslevel/person/delete",
    body,
    () => sandboxOk(),
    "accessController.ts"
  );
}

export async function remoteDoorControl(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/acs/v1/remote/control",
    body,
    () => sandboxRemoteControl(body),
    "doorController.ts"
  );
}

export async function searchCertificateRecords(
  req: CredentialsRequest,
  res: Response
): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/acs/v1/event/certificaterecords/search",
    body,
    sandboxCertificateRecords,
    "recordsController.ts"
  );
}

export async function searchTimeCard(req: CredentialsRequest, res: Response): Promise<void> {
  const body = { ...(req.hikPayload ?? {}) };
  delete body.sandboxMode;
  await proxyOrSandbox(
    req,
    res,
    "/api/hccgw/attendance/v1/report/totaltimecard/list",
    body,
    sandboxTimeCard,
    "reportController.ts"
  );
}

import { eventsWorker } from "../workers/eventsWorker.js";

export async function startEvents(req: CredentialsRequest, res: Response): Promise<void> {
  const sandboxMode = Boolean(req.hikPayload?.sandboxMode);
  await eventsWorker.start(req.hikCredentials!, sandboxMode);
  res.json({
    data: { ok: true, running: true, sandboxMode },
    debug: {
      verb: "LOCAL",
      targetUrl: "eventsWorker.start",
      requestPayload: { sandboxMode },
      responseBody: { ok: true },
      sourceFile: "eventsController.ts",
    },
  });
}

export async function stopEvents(_req: CredentialsRequest, res: Response): Promise<void> {
  eventsWorker.stop();
  res.json({ data: { ok: true, running: false } });
}

export function eventsStatus(_req: CredentialsRequest, res: Response): void {
  res.json({
    data: {
      running: eventsWorker.isRunning(),
      sandboxMode: eventsWorker.getMode().sandboxMode,
    },
  });
}
