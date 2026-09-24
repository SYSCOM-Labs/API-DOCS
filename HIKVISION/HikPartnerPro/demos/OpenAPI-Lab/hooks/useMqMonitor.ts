"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hppCall, type HppCallResponse } from "@/lib/client";
import { toHppEvent, type HppEvent, type HppMqRow } from "@/lib/events";

type Scope = "all" | "list";

type Subscription = {
  scope: Scope;
  serials: string[];
};

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export function useMqMonitor({
  scope = "all",
  serials = [],
  maxEvents = 200,
}: {
  scope?: Scope;
  serials?: string[];
  maxEvents?: number;
}) {
  const [events, setEvents] = useState<HppEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState("Monitor detenido");
  const stopRef = useRef(true);
  const mountedRef = useRef(true);
  const activeRef = useRef<Subscription | null>(null);
  const serialKey = serials.join("\u0000");
  const stableSerials = useMemo(() => serialKey ? serialKey.split("\u0000") : [], [serialKey]);

  const subscriptionBody = useCallback((subType: 0 | 1, subscription: Subscription) => ({
    subType,
    subMode: subscription.scope,
    ...(subscription.scope === "list" ? { deviceSerialList: subscription.serials } : {}),
  }), []);

  const unsubscribe = useCallback(async (subscription: Subscription | null) => {
    if (!subscription) return;
    await hppCall({
      path: "/api/hpcgw/v1/mq/subscribe",
      body: subscriptionBody(0, subscription),
    }).catch(() => undefined);
  }, [subscriptionBody]);

  const stop = useCallback(async () => {
    stopRef.current = true;
    const active = activeRef.current;
    activeRef.current = null;
    if (mountedRef.current) {
      setRunning(false);
      setStatus("Deteniendo y cancelando suscripción…");
    }
    await unsubscribe(active);
    if (mountedRef.current) setStatus("Monitor y suscripción detenidos");
  }, [unsubscribe]);

  const start = useCallback(async () => {
    if (!stopRef.current || activeRef.current) return;
    if (scope === "list" && !stableSerials.length) {
      setStatus("Selecciona al menos un dispositivo");
      return;
    }

    const subscription: Subscription = { scope, serials: stableSerials };
    stopRef.current = false;
    activeRef.current = subscription;
    setRunning(true);
    setStatus(
      scope === "all"
        ? "Suscribiendo todos los dispositivos…"
        : `Suscribiendo ${stableSerials.length} dispositivo(s)…`,
    );

    const response = await hppCall({
      path: "/api/hpcgw/v1/mq/subscribe",
      body: subscriptionBody(1, subscription),
    });
    const subscribeResult = response.result as { errorCode?: string; message?: string } | undefined;
    if (subscribeResult?.errorCode !== "0") {
      stopRef.current = true;
      activeRef.current = null;
      if (mountedRef.current) {
        setRunning(false);
        setStatus(`No se pudo suscribir: ${subscribeResult?.message ?? subscribeResult?.errorCode ?? "error"}`);
      }
      return;
    }

    while (!stopRef.current && mountedRef.current) {
      setStatus("Escuchando eventos de HPP…");
      const poll = await hppCall({
        path: "/api/hpcgw/v1/mq/messages",
        timeoutMs: 25_000,
      }).catch((): HppCallResponse => ({ errorCode: "NETWORK_ERROR", message: "Error de red" }));
      if (stopRef.current || !mountedRef.current) break;

      const result = poll.result as {
        errorCode?: string;
        message?: string;
        data?: { batchId?: string; list?: HppMqRow[] };
      } | undefined;
      const topLevelCode = poll.errorCode;
      const code = result?.errorCode ?? topLevelCode;
      if (code && code !== "0") {
        setStatus(`Error ${code}: ${result?.message ?? poll.message ?? "reintentando"}`);
        await wait(2_000);
        continue;
      }

      const rows = result?.data?.list ?? [];
      const batchId = result?.data?.batchId;
      if (rows.length) {
        const incoming = rows.map((row, index) => toHppEvent(row, batchId, index));
        setEvents((previous) => [...incoming, ...previous].slice(0, maxEvents));
        if (batchId) {
          await hppCall({
            path: "/api/hpcgw/v1/mq/offset",
            body: { batchId },
          });
        }
        setStatus(`${rows.length} evento(s) recibido(s) y confirmados`);
      } else {
        setStatus("Sin eventos nuevos; escuchando…");
      }
    }

    if (mountedRef.current) {
      setRunning(false);
      if (activeRef.current) setStatus("Monitor detenido");
    }
  }, [maxEvents, scope, stableSerials, subscriptionBody]);

  const clear = useCallback(() => setEvents([]), []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopRef.current = true;
      const active = activeRef.current;
      activeRef.current = null;
      void unsubscribe(active);
    };
  }, [unsubscribe]);

  return { events, running, status, start, stop, clear, setEvents };
}
