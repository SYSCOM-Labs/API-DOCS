export interface Camera {
  id: string;
  name: string;
  online: boolean;
  area: string;
  serial: string;
  channel: string;
  // true = stream cifrado (pide code), false = sin cifrar, null = sin dato aun
  encrypted?: boolean | null;
}

export interface Door {
  id: string;
  name: string;
  online: boolean;
  area: string;
  serial: string;
  channel: string;
}

export interface AccessEvent {
  id: string;
  personName: string;
  doorName: string;
  method: string;
  result: string;
  time: string;
}

export interface StreamSession {
  url: string;
  accessToken: string;
  domain: string;
  template: "pcLive" | "pcRec";
  mock: boolean;
  cameraId: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

export interface PersonGroup {
  id: string;
  name: string;
  personCount: number;
  fullPath: string;
}

export interface Person {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  startDate: string;
  endDate: string;
  hasPin?: boolean;
}

export interface AccessLevel {
  id: string;
  name: string;
  remark: string;
  resourceCount: number;
}

export interface PlatformUser {
  id: string;
  name: string;
}
