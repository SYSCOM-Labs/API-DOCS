/**
 * Tipos del playground de Tiempo y Asistencia — Hik-Connect OpenAPI V2.15.0.
 * No inventar campos: solo contratos documentados en llms-full.txt.
 */

export interface HikCredentials {
  serverAddress: string;
  appKey: string;
  secretKey: string;
}

export interface TokenData {
  accessToken: string;
  expireTime: number;
  userId: string;
  areaDomain: string;
}

export interface HikApiResponse<T = unknown> {
  errorCode: string;
  data?: T;
  message?: string;
  Message?: string;
}

export interface ProxyDebugEnvelope<T = unknown> {
  debug: {
    verb: string;
    targetUrl: string;
    requestPayload: unknown;
    responseBody: unknown;
    sourceFile: string;
  };
  data: T;
}

/** Tipos de mensaje ACS relevantes para eventos en vivo (Apéndice A.1). */
export const ACS_MSG_TYPES: readonly string[] = [
  "Msg110001",
  "Msg110002",
  "Msg110003",
  "Msg110004",
  "Msg110005",
  "Msg110008",
  "Msg110009",
  "Msg110010",
  "Msg110013",
  "Msg110018",
  "Msg110020",
  "Msg110023",
  "Msg110507",
  "Msg110514",
  "Msg110515",
  "Msg110516",
  "Msg110521",
  "Msg110524",
  "Msg110525",
] as const;

export interface MqEventBasicInfo {
  occurrenceTime?: string;
  systemId?: string;
  msgType?: string;
  resource?: { id?: string; name?: string; areaName?: string };
  device?: { id?: string; name?: string; category?: string; serialNo?: string };
  person?: { id?: string; name?: string; personCode?: string };
}

export interface MqEvent {
  basicInfo?: MqEventBasicInfo;
  data?: Record<string, unknown>;
  uuid?: string;
}

export interface MqMessagesResponse {
  batchId?: string;
  remainingNumber?: number;
  event?: MqEvent[];
}

/** attendanceStatus del time card: 1 normal … 6 leave */
export type AttendanceStatusCode = 1 | 2 | 3 | 4 | 5 | 6;
