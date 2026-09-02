import { cacheLife, cacheTag } from "next/cache";
import { hctFetch } from "./client";
import { mockAccessLevels, mockPlatformUsers } from "@/lib/mock/fixtures";
import type { AccessLevel, PlatformUser } from "./types";

// --- Niveles de acceso (acspm) ---

interface HctLevelNode {
  id?: string;
  name?: string;
  remark?: string;
  associateResList?: unknown[];
}

interface HctLevelPage {
  accessLevelResponse?: {
    totalNum?: number;
    accessLevelList?: HctLevelNode[];
  };
}

export async function getAccessLevels(mode: string): Promise<AccessLevel[]> {
  if (mode === "mock") return getAccessLevelsMock();
  const data = await hctFetch<HctLevelPage>("/acspm/v1/accesslevel/list", {
    body: {
      accessLevelSearchRequest: {
        pageIndex: 1,
        pageSize: 100,
        searchCriteria: { accessLevelName: "", associateResInfoList: [] },
      },
    },
  });
  const nodes = data.accessLevelResponse?.accessLevelList ?? [];
  return nodes
    .map((n) => ({
      id: n.id ?? "",
      name: n.name ?? "Sin nombre",
      remark: n.remark ?? "",
      resourceCount: n.associateResList?.length ?? 0,
    }))
    .filter((l) => l.id);
}

async function getAccessLevelsMock(): Promise<AccessLevel[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("accessLevels");
  return mockAccessLevels;
}

// El ejemplo oficial solo manda personId + accessLevelIdList (la tabla marca
// mas campos como requeridos pero el request example es el minimal).
export async function assignAccessLevel(personId: string, accessLevelId: string): Promise<void> {
  await hctFetch("/acspm/v1/accesslevel/person/add", {
    body: { personList: [{ personId, accessLevelIdList: [accessLevelId] }] },
  });
}

export async function unassignAccessLevel(personId: string, accessLevelId: string): Promise<void> {
  await hctFetch("/acspm/v1/accesslevel/person/delete", {
    body: { personList: [{ personId, accessLevelIdList: [accessLevelId] }] },
  });
}

// --- Usuarios de plataforma (solo lectura: se crean en la consola web HCT) ---

interface HctUserPage {
  totalCount?: number;
  user?: { id?: string; name?: string }[];
}

export async function getPlatformUsers(mode: string): Promise<PlatformUser[]> {
  if (mode === "mock") return getPlatformUsersMock();
  const data = await hctFetch<HctUserPage>("/platform/v1/users/get", {
    method: "POST",
    body: { pageIndex: 1, pageSize: 100 },
  });
  return (data.user ?? [])
    .map((u) => ({ id: u.id ?? "", name: u.name ?? "" }))
    .filter((u) => u.id);
}

async function getPlatformUsersMock(): Promise<PlatformUser[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("platformUsers");
  return mockPlatformUsers;
}
