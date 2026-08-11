/**
 * Normalización de respuestas Hik-Connect.
 *
 * Los ejemplos de respuesta de llms-full.txt no siempre coinciden con el texto
 * resumido de cada sección, así que cada lectura acepta ambos contenedores:
 *   - groups/search  → data.personGroupList (groupId/groupName) | data.groupList (id/name)
 *   - groups/add     → data.groupId | data.id
 *   - accesslevel/list → data.accessLevelResponse.accessLevelList | data.accessLevelList
 *   - totaltimecard  → data.reportDataList | data.reportData
 */
import type { ProxyResponse } from "../types";

export interface GroupItem {
  id: string;
  name: string;
  personCount?: number;
}

export interface PersonItem {
  personId?: string;
  personCode?: string;
  firstName?: string;
  lastName?: string;
  gender?: number;
  groupId?: string;
  groupName?: string;
  fullPath?: string;
  /** Nombre ya resuelto para mostrar; vacío si la respuesta no trae ninguno. */
  displayName: string;
}

export interface AccessLevelItem {
  id: string;
  name: string;
  remark?: string;
}

/** El proxy local devuelve la respuesta cruda de Hik en `data`: { errorCode, data }. */
export function readHik<T>(res: ProxyResponse | null): { errorCode: string; payload?: T } {
  const raw = res?.data as { errorCode?: string; data?: T } | undefined;
  return { errorCode: raw?.errorCode ?? "?", payload: raw?.data };
}

type RawGroup = {
  id?: string;
  name?: string;
  groupId?: string;
  groupName?: string;
  personCount?: number;
};

export function normalizeGroups(payload: unknown): GroupItem[] {
  const data = payload as
    | { personGroupList?: RawGroup[]; groupList?: RawGroup[] }
    | undefined;
  const raw = data?.personGroupList ?? data?.groupList ?? [];
  return raw
    .map((g) => ({
      id: String(g.groupId ?? g.id ?? ""),
      name: String(g.groupName ?? g.name ?? "Sin nombre"),
      personCount: g.personCount,
    }))
    .filter((g) => g.id !== "");
}

export function normalizeGroupId(payload: unknown): string {
  const data = payload as { groupId?: string; id?: string } | undefined;
  return String(data?.groupId ?? data?.id ?? "");
}

type RawPerson = Record<string, unknown> & {
  personBaseInfo?: Record<string, unknown>;
  personInfo?: Record<string, unknown>;
};

/**
 * §7.16 documenta los campos (personId, personCode, firstName, lastName…) pero su
 * ejemplo de respuesta está vacío, y otros endpoints de persona anidan los mismos
 * datos en personBaseInfo/personInfo. Se aplanan las variantes antes de leer.
 */
export function normalizePersons(payload: unknown): PersonItem[] {
  const data = payload as Record<string, unknown> | undefined;
  const raw = (data?.personList ??
    data?.personInfoList ??
    data?.list ??
    data?.rows ??
    []) as RawPerson[];

  if (!Array.isArray(raw)) return [];

  return raw.map((item) => {
    const flat: Record<string, unknown> = {
      ...item,
      ...(item.personBaseInfo ?? {}),
      ...(item.personInfo ?? {}),
    };
    const str = (key: string) => {
      const v = flat[key];
      return v === undefined || v === null ? undefined : String(v);
    };

    const firstName = str("firstName");
    const lastName = str("lastName");
    const joined = [firstName, lastName].filter(Boolean).join(" ").trim();

    return {
      personId: str("personId") ?? str("id"),
      personCode: str("personCode"),
      firstName,
      lastName,
      gender: flat.gender === undefined ? undefined : Number(flat.gender),
      groupId: str("groupId"),
      groupName: str("groupName"),
      fullPath: str("groupFullPath") ?? str("fullPath"),
      displayName: joined || str("personName") || str("name") || "",
    };
  });
}

type RawAccessLevel = {
  id?: string;
  name?: string;
  levelId?: string;
  levelName?: string;
  remark?: string;
};

export function normalizeAccessLevels(payload: unknown): AccessLevelItem[] {
  const data = payload as
    | {
        accessLevelResponse?: { accessLevelList?: RawAccessLevel[] };
        accessLevelList?: RawAccessLevel[];
      }
    | undefined;
  const raw = data?.accessLevelResponse?.accessLevelList ?? data?.accessLevelList ?? [];
  return raw
    .map((l) => ({
      id: String(l.id ?? l.levelId ?? ""),
      name: String(l.name ?? l.levelName ?? "Sin nombre"),
      remark: l.remark,
    }))
    .filter((l) => l.id !== "");
}

export function normalizeTimeCard<T>(payload: unknown): T[] {
  const data = payload as { reportDataList?: T[]; reportData?: T[] } | undefined;
  return data?.reportDataList ?? data?.reportData ?? [];
}

/** ISO 8601 con offset local, formato exigido por startDate/endDate y clientLocalTime. */
export function isoWithOffset(date: Date): string {
  const pad = (n: number) => String(Math.floor(Math.abs(n))).padStart(2, "0");
  const tz = -date.getTimezoneOffset();
  const sign = tz >= 0 ? "+" : "-";
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(tz / 60)}:${pad(tz % 60)}`
  );
}
