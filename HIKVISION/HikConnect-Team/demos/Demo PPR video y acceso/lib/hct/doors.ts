import { cacheLife, cacheTag } from "next/cache";
import { config } from "@/lib/config";
import { hctFetch } from "./client";
import { mockDoors } from "@/lib/mock/fixtures";
import type { Door } from "./types";

interface HctDoorNode {
  id?: string;
  name?: string;
  online?: string;
  area?: { name?: string };
  device?: {
    devInfo?: { serialNo?: string };
    channelInfo?: { no?: string };
  };
}

interface HctDoorPage {
  totalCount?: number;
  door?: HctDoorNode[];
}

function normalize(node: HctDoorNode): Door {
  return {
    id: node.id ?? "",
    name: node.name ?? "Sin nombre",
    online: node.online === "1",
    area: node.area?.name ?? "",
    serial: node.device?.devInfo?.serialNo ?? "",
    channel: node.device?.channelInfo?.no ?? "1",
  };
}

async function fetchAllDoors(): Promise<Door[]> {
  const pageSize = 500;
  const body = (pageIndex: number) => ({
    pageIndex,
    pageSize,
    filter: { areaID: "-1", includeSubArea: "1", deviceID: "", deviceSerialNo: "" },
  });
  const first = await hctFetch<HctDoorPage>("/resource/v1/areas/doors/get", { body: body(1) });
  const total = first.totalCount ?? 0;
  const nodes = [...(first.door ?? [])];
  for (let page = 2; page <= Math.ceil(total / pageSize); page++) {
    const next = await hctFetch<HctDoorPage>("/resource/v1/areas/doors/get", { body: body(page) });
    nodes.push(...(next.door ?? []));
  }
  return nodes.map(normalize).filter((d) => d.id);
}

export async function getDoors(mode: string): Promise<Door[]> {
  if (mode === "mock") return getDoorsMock();
  return fetchAllDoors();
}

async function getDoorsMock(): Promise<Door[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("doors");
  return mockDoors;
}
