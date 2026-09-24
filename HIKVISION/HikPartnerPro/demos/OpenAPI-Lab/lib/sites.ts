"use client";

import { useCallback, useEffect, useState } from "react";
import { hppCall } from "@/lib/client";

export type HppSite = {
  id?: string;
  name?: string;
  siteName?: string;
  siteState?: string;
  siteCity?: string;
};

type SiteFetch = { sites: HppSite[]; error: string };
let pending: Promise<SiteFetch> | null = null;

export function fetchSites(force = false): Promise<SiteFetch> {
  if (!pending || force) {
    pending = hppCall({
      path: "/api/hpcgw/v1/site/search",
      body: { page: 0, pageSize: 100 },
    })
      .then((response) => {
        const result = response.result as {
          errorCode?: string;
          message?: string;
          data?: { rows?: HppSite[]; list?: HppSite[] };
        } | undefined;
        if (result?.errorCode === "0") {
          return { sites: result.data?.rows ?? result.data?.list ?? [], error: "" };
        }
        return {
          sites: [],
          error: result?.message ?? result?.errorCode ?? response.message ?? "No se pudieron cargar los sitios",
        };
      })
      .catch(() => ({ sites: [], error: "Error de red al consultar sitios" }));
  }
  return pending;
}

export function useSites() {
  const [sites, setSites] = useState<HppSite[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    const result = await fetchSites(force);
    setSites(result.sites);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { sites, error, loading, reload: () => load(true) };
}
