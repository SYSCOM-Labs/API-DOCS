import { cacheLife, cacheTag } from "next/cache";
import { hctFetch } from "./client";
import { mockPersonGroups, mockPersons } from "@/lib/mock/fixtures";
import type { Paged, Person, PersonGroup } from "./types";

// --- Grupos (departamentos) ---

interface HctGroupNode {
  groupId?: string;
  id?: string;
  groupName?: string;
  name?: string;
  personCount?: number;
  groupFullPath?: string;
}

interface HctGroupSearch {
  totalNum?: number;
  groupList?: HctGroupNode[];
  personGroupList?: HctGroupNode[];
}

function normalizeGroup(node: HctGroupNode): PersonGroup {
  return {
    id: node.groupId ?? node.id ?? "",
    name: node.groupName ?? node.name ?? "Sin nombre",
    personCount: node.personCount ?? 0,
    fullPath: node.groupFullPath ?? "",
  };
}

export async function getPersonGroups(mode: string): Promise<PersonGroup[]> {
  if (mode === "mock") return getPersonGroupsMock();
  const data = await hctFetch<HctGroupSearch>("/person/v1/groups/search", {
    body: { pageIndex: 1, pageSize: 100 },
  });
  const nodes = data.groupList ?? data.personGroupList ?? [];
  return nodes.map(normalizeGroup).filter((g) => g.id);
}

async function getPersonGroupsMock(): Promise<PersonGroup[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("persons");
  return mockPersonGroups;
}

// --- Personas ---

interface HctPersonInfo {
  personId?: string;
  personCode?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  startDate?: number | string;
  endDate?: number | string;
}

interface HctPersonNode {
  // El API real envuelve cada persona en personInfo (la doc lo muestra plano).
  personInfo?: HctPersonInfo;
  pinCode?: string;
}

interface HctPersonPage {
  totalNum?: number;
  personList?: HctPersonNode[];
}

function normalizeDate(v: number | string | undefined): string {
  if (v === undefined || v === "") return "";
  const n = Number(v);
  if (Number.isFinite(n) && n > 1e12) return new Date(n).toISOString();
  return String(v);
}

function normalizePerson(node: HctPersonNode): Person {
  const info = node.personInfo ?? (node as unknown as HctPersonInfo);
  return {
    id: info.personId ?? "",
    code: info.personCode ?? "",
    firstName: info.firstName ?? "",
    lastName: info.lastName ?? "",
    phone: info.phone ?? "",
    email: info.email ?? "",
    startDate: normalizeDate(info.startDate),
    endDate: normalizeDate(info.endDate),
    hasPin: Boolean(node.pinCode),
  };
}

export async function getPersons(
  mode: string,
  pageIndex: number,
  pageSize: number,
  name = "",
): Promise<Paged<Person>> {
  if (mode === "mock") {
    const q = name.trim().toLowerCase();
    const all = q
      ? mockPersons.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q))
      : mockPersons;
    const start = (pageIndex - 1) * pageSize;
    return { items: all.slice(start, start + pageSize), total: all.length, pageIndex, pageSize };
  }
  const data = await hctFetch<HctPersonPage>("/person/v1/persons/list", {
    body: {
      pageIndex,
      pageSize: Math.min(pageSize, 100),
      ...(name.trim() ? { filter: { name: name.trim() } } : {}),
    },
  });
  return {
    items: (data.personList ?? []).map(normalizePerson).filter((p) => p.id),
    total: data.totalNum ?? 0,
    pageIndex,
    pageSize,
  };
}

// --- Mutaciones (sin cache; el caller revalida el tag "persons") ---

export async function addPersonGroup(groupName: string): Promise<string> {
  // La doc dice que devuelve `id`; el API real devuelve `groupId`.
  const data = await hctFetch<{ id?: string; groupId?: string }>("/person/v1/groups/add", {
    body: { groupName },
  });
  return data?.groupId ?? data?.id ?? "";
}

export async function deletePersonGroup(groupId: string): Promise<void> {
  await hctFetch("/person/v1/groups/delete", { body: { groupId } });
}

export interface NewPerson {
  groupId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export async function addPerson(input: NewPerson): Promise<{ personId: string; personCode: string }> {
  const data = await hctFetch<{ personId?: string; personCode?: string }>("/person/v1/persons/add", {
    body: {
      groupId: input.groupId,
      firstName: input.firstName,
      lastName: input.lastName,
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.email ? { email: input.email } : {}),
    },
  });
  return { personId: data?.personId ?? "", personCode: data?.personCode ?? "" };
}

export async function deletePerson(personId: string): Promise<void> {
  await hctFetch("/person/v1/persons/delete", { body: { personId } });
}

// cardList completo: sin nodo = borra TODAS las tarjetas de la persona.
export async function setPersonCard(personId: string, cardNo: string): Promise<void> {
  await hctFetch("/person/v1/persons/updatecards", {
    body: { personId, cardList: [{ cardNo }] },
  });
}

// pinCode de 4-8 digitos; omitir el nodo borra el PIN.
export async function setPersonPin(personId: string, pinCode: string): Promise<void> {
  await hctFetch("/person/v1/persons/updatepincode", {
    body: { personId, pinCode },
  });
}
