/**
 * Datos mock para modo sandbox (demo sin tenant).
 * El estado vive en memoria para que altas y bajas se reflejen en la UI.
 */
import { isoWithOffset } from "./recordsFeedService.js";

interface SandboxGroup {
  id: string;
  name: string;
  personCount: number;
}

interface SandboxPerson {
  personId: string;
  personCode: string;
  firstName: string;
  lastName: string;
  gender?: number;
  groupId: string;
  groupName: string;
}

let groups: SandboxGroup[] = [
  { id: "grp-1", name: "Administración", personCount: 2 },
  { id: "grp-2", name: "Operaciones", personCount: 2 },
];

let persons: SandboxPerson[] = [
  {
    personId: "p-1",
    personCode: "E001",
    firstName: "Ana",
    lastName: "García",
    groupId: "grp-1",
    groupName: "Administración",
  },
  {
    personId: "p-2",
    personCode: "E002",
    firstName: "Pedro",
    lastName: "Hernández",
    groupId: "grp-1",
    groupName: "Administración",
  },
  {
    personId: "p-3",
    personCode: "E003",
    firstName: "María",
    lastName: "López",
    groupId: "grp-2",
    groupName: "Operaciones",
  },
  {
    personId: "p-4",
    personCode: "E004",
    firstName: "Carlos",
    lastName: "Ruiz",
    groupId: "grp-2",
    groupName: "Operaciones",
  },
];

interface SandboxAccessLevel {
  id: string;
  name: string;
  remark: string;
}

let accessLevels: SandboxAccessLevel[] = [
  { id: "al-1", name: "Acceso general", remark: "Lunes–Viernes" },
  { id: "al-2", name: "Acceso 24h", remark: "Sin restricción" },
];

function syncCounts(): void {
  for (const g of groups) {
    g.personCount = persons.filter((p) => p.groupId === g.id).length;
  }
}

export function sandboxGroups() {
  syncCounts();
  // Contenedor del ejemplo oficial (§7.1): personGroupList con groupId/groupName.
  return {
    errorCode: "0",
    data: {
      totalNum: groups.length,
      personGroupList: groups.map((g) => ({
        groupId: g.id,
        groupName: g.name,
        personCount: g.personCount,
        parentId: "",
        groupFullPath: g.name,
      })),
    },
  };
}

export function sandboxAddGroup(body: Record<string, unknown>) {
  const id = `grp-${Date.now()}`;
  groups = [
    ...groups,
    { id, name: String(body.groupName ?? "Nuevo departamento"), personCount: 0 },
  ];
  return { errorCode: "0", data: { groupId: id } };
}

export function sandboxDeleteGroup(body: Record<string, unknown>) {
  const groupId = String(body.groupId ?? "");
  groups = groups.filter((g) => g.id !== groupId);
  persons = persons.filter((p) => p.groupId !== groupId);
  return { errorCode: "0", data: {} };
}

export function sandboxPersons() {
  return {
    errorCode: "0",
    data: { totalNum: persons.length, personList: persons },
  };
}

export function sandboxAddPerson(body: Record<string, unknown>) {
  const info = (body.personInfo as Record<string, unknown>) ?? body;
  const groupId = String(info.groupId ?? groups[0]?.id ?? "grp-1");
  const personId = `p-${Date.now()}`;
  const personCode = String(info.personCode ?? personId);
  persons = [
    ...persons,
    {
      personId,
      personCode,
      firstName: String(info.firstName ?? "Demo"),
      lastName: String(info.lastName ?? ""),
      gender: Number(info.gender ?? 1),
      groupId,
      groupName: groups.find((g) => g.id === groupId)?.name ?? "—",
    },
  ];
  syncCounts();
  return { errorCode: "0", data: { personId, personCode } };
}

export function sandboxDeletePerson(body: Record<string, unknown>) {
  const ids = String(body.personId ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  persons = persons.filter((p) => !ids.includes(p.personId));
  syncCounts();
  return { errorCode: "0", data: {} };
}

export function sandboxAccessLevels() {
  // Contenedor del ejemplo oficial (§14.8): data.accessLevelResponse.accessLevelList
  return {
    errorCode: "0",
    data: {
      accessLevelResponse: {
        pageIndex: 1,
        pageSize: accessLevels.length,
        totalNum: accessLevels.length,
        accessLevelList: accessLevels,
      },
    },
  };
}

export function sandboxAddAccessLevel(body: Record<string, unknown>) {
  const info = (body.accessLevel as Record<string, unknown>) ?? {};
  const level: SandboxAccessLevel = {
    id: `al-${Date.now()}`,
    name: String(info.name ?? "Nuevo nivel"),
    remark: String(info.remark ?? ""),
  };
  accessLevels = [...accessLevels, level];
  return { errorCode: "0", data: { accessLevel: level } };
}

/** Devuelve operationResult por puerta, como RemoteControlResponse. */
export function sandboxRemoteControl(body: Record<string, unknown>) {
  const control = (body.remoteControl as Record<string, unknown>) ?? {};
  const ids = Array.isArray(control.elementlist) ? (control.elementlist as unknown[]) : [];
  return {
    errorCode: "0",
    data: {
      operationResult: ids.map((id) => ({
        elementId: String(id),
        elementName: `Puerta ${String(id)}`,
        areaId: "area-1",
        areaName: "Sede principal",
        errorCode: "0",
      })),
    },
  };
}

export function sandboxCertificateRecords() {
  const now = new Date();
  // Offset local, como exige §6.2 (no UTC con Z).
  const iso = (minsAgo: number) => isoWithOffset(new Date(now.getTime() - minsAgo * 60_000));
  const sample = persons.slice(0, 3);
  return {
    errorCode: "0",
    data: {
      recordList: sample.map((p, i) => ({
        personId: p.personId,
        personName: `${p.firstName} ${p.lastName}`.trim(),
        certType: i % 2 === 0 ? "face" : "card",
        occurTime: iso(35 - i * 10),
        result: 1,
        deviceName: i % 2 === 0 ? "Terminal Facial Entrada" : "Lector Tarjeta Salida",
      })),
    },
  };
}

export function sandboxTimeCard() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "/");
  const presets = [
    {
      attendanceStatus: 1,
      clockInTime: "08:55",
      clockOutTime: "18:05",
      workDuration: "09:10",
      lateDuration: "00:00",
      earlyDuration: "00:00",
      absenceDuration: "00:00",
      overtimeDuration: "00:05",
    },
    {
      attendanceStatus: 4,
      clockInTime: "09:18",
      clockOutTime: "17:40",
      workDuration: "08:22",
      lateDuration: "00:18",
      earlyDuration: "00:20",
      absenceDuration: "00:00",
      overtimeDuration: "00:00",
    },
    {
      attendanceStatus: 1,
      clockInTime: "07:58",
      clockOutTime: "",
      workDuration: "—",
      lateDuration: "00:00",
      earlyDuration: "00:00",
      absenceDuration: "00:00",
      overtimeDuration: "00:00",
    },
    {
      attendanceStatus: 5,
      clockInTime: "",
      clockOutTime: "",
      workDuration: "00:00",
      lateDuration: "00:00",
      earlyDuration: "00:00",
      absenceDuration: "08:00",
      overtimeDuration: "00:00",
    },
  ];

  // Campos del ejemplo oficial (§6.3): fullPath y timetableName, no groupName.
  const reportDataList = persons.map((p, i) => ({
    firstName: p.firstName,
    lastName: p.lastName,
    fullName: `${p.firstName} ${p.lastName}`.trim(),
    personCode: p.personCode,
    fullPath: p.groupName,
    date: today,
    weekday: new Date().getDay(),
    timetableName: "Turno oficina 09:00–18:00",
    checkInTime: "09:00",
    checkOutTime: "18:00",
    clockInDevice: "Terminal Facial Entrada",
    clockOutDevice: "Terminal Facial Entrada",
    leaveDuration: "00:00",
    ...presets[i % presets.length],
  }));
  return {
    errorCode: "0",
    data: {
      pageIndex: 1,
      pageSize: reportDataList.length,
      moreData: 0,
      // Nombre oficial del ejemplo de respuesta en llms-full §6.3
      reportDataList,
    },
  };
}

export function sandboxOk(extra?: Record<string, unknown>) {
  return { errorCode: "0", data: { ok: true, ...extra } };
}
