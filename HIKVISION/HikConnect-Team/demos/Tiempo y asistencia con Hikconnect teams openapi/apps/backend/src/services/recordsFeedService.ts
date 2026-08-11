import type { HikApiResponse, HikCredentials } from "../types/hik.types.js";
import { hikClient } from "./hikClient.js";

const SOURCE = "apps/backend/src/services/recordsFeedService.ts";

export interface CertificateRecord {
  recordGuid?: string;
  elementId?: string;
  elementName?: string;
  occurTime?: string;
  eventType?: number;
  swipeAuthResult?: number;
  personInfo?: {
    personId?: string;
    groupId?: string;
    firstName?: string;
    lastName?: string;
    personCode?: string;
    id?: string;
    baseInfo?: {
      personId?: string;
      firstName?: string;
      lastName?: string;
      personCode?: string;
    };
  };
  // Compatibilidad con respuestas resumidas o antiguas.
  personId?: string;
  personName?: string;
  certType?: string;
  result?: number;
  deviceName?: string;
}

export interface RecordsPollResult {
  errorCode: string;
  records: CertificateRecord[];
  debug: unknown;
}

/** ISO 8601 con offset local, formato exigido por beginTime/endTime (§6.2). */
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

/**
 * Respaldo del feed en vivo: si el tenant no entrega los marcajes por MQ, se
 * consultan los certificate records recientes. swipeAuthResult 0 = todos, para
 * incluir también los intentos fallidos.
 */
export async function pollRecentRecords(
  credentials: HikCredentials,
  windowMinutes: number
): Promise<RecordsPollResult> {
  const end = new Date();
  const begin = new Date(end.getTime() - windowMinutes * 60_000);

  const res = await hikClient.proxyPost<HikApiResponse<{ recordList?: CertificateRecord[] }>>(
    credentials,
    "/api/hccgw/acs/v1/event/certificaterecords/search",
    {
      pageIndex: 1,
      pageSize: 50,
      searchCriteria: {
        beginTime: isoWithOffset(begin),
        endTime: isoWithOffset(end),
        type: 0,
        swipeAuthResult: 0,
        searchType: 0,
      },
    },
    { sourceFile: SOURCE }
  );

  const payload = res.data as HikApiResponse<{ recordList?: CertificateRecord[] }> | undefined;
  return {
    errorCode: payload?.errorCode ?? "?",
    records: payload?.data?.recordList ?? [],
    debug: res.debug,
  };
}
