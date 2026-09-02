import { hctFetch } from "./client";
import { mockEvents } from "@/lib/mock/fixtures";
import type { AccessEvent, Paged } from "./types";

interface HctRecord {
  personId?: string;
  personName?: string;
  certType?: string;
  occurTime?: string;
  result?: string;
  doorName?: string;
  elementName?: string;
  cardNo?: string;
}

interface HctRecordPage {
  totalNum?: number;
  totalCount?: number;
  recordList?: HctRecord[];
}

const METHODS: Record<string, string> = {
  card: "Tarjeta",
  face: "Rostro",
  fingerprint: "Huella",
};

function normalize(node: HctRecord, index: number): AccessEvent {
  return {
    id: `${node.occurTime ?? ""}-${index}`,
    personName: node.personName || node.cardNo || "Desconocido",
    doorName: node.doorName ?? node.elementName ?? "",
    method: METHODS[(node.certType ?? "").toLowerCase()] ?? node.certType ?? "Otro",
    result: node.result === "1" || (node.result ?? "").toLowerCase() === "success" ? "Éxito" : node.result ?? "",
    time: node.occurTime ?? "",
  };
}

// Dinamico a proposito: las marcaciones cambian constantemente.
// elementId filtra por punto de acceso (searchCriteria.elementIDs del OpenAPI).
export async function getAccessEvents(
  mode: string,
  pageIndex: number,
  pageSize: number,
  elementId?: string,
): Promise<Paged<AccessEvent>> {
  if (mode === "mock") {
    const start = (pageIndex - 1) * pageSize;
    return {
      items: mockEvents.slice(start, start + pageSize),
      total: mockEvents.length,
      pageIndex,
      pageSize,
    };
  }

  const end = new Date();
  const begin = new Date(end.getTime() - 48 * 3600 * 1000);
  const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "+00:00");

  const data = await hctFetch<HctRecordPage>("/acs/v1/event/certificaterecords/search", {
    body: {
      pageIndex,
      pageSize: Math.min(pageSize, 200),
      searchCriteria: {
        beginTime: iso(begin),
        endTime: iso(end),
        type: 0,
        swipeAuthResult: 0,
        searchType: 0,
        ...(elementId ? { elementIDs: elementId } : {}),
      },
    },
  });

  const records = data.recordList ?? [];
  return {
    items: records.map(normalize),
    total: data.totalNum ?? data.totalCount ?? records.length,
    pageIndex,
    pageSize,
  };
}
