import type { ProxyDebugInfo } from "../types";

export type TelemetryWsMessage = {
  type: string;
  payload: Record<string, unknown>;
  debug?: ProxyDebugInfo;
};

type Listener = (msg: TelemetryWsMessage) => void;

/** Una sola conexión WS para toda la app (evita errores por StrictMode / reconexiones). */
let sharedWs: WebSocket | null = null;
let reconnectTimer: number | null = null;
let reconnectAttempt = 0;
const listeners = new Set<Listener>();
const statusListeners = new Set<(connected: boolean) => void>();

function wsUrl(): string {
  if (import.meta.env.DEV) {
    return `ws://${window.location.hostname}:4000/ws/telemetry`;
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/telemetry`;
}

function notifyStatus(connected: boolean): void {
  statusListeners.forEach((fn) => fn(connected));
}

function dispatch(msg: TelemetryWsMessage): void {
  listeners.forEach((fn) => fn(msg));
}

function scheduleReconnect(): void {
  if (reconnectTimer !== null) return;
  const delay = Math.min(1000 * 2 ** reconnectAttempt, 15000);
  reconnectAttempt++;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectShared();
  }, delay);
}

function connectShared(): void {
  if (
    sharedWs?.readyState === WebSocket.OPEN ||
    sharedWs?.readyState === WebSocket.CONNECTING
  ) {
    return;
  }

  if (sharedWs) {
    sharedWs.onclose = null;
    sharedWs.onerror = null;
    sharedWs.close();
    sharedWs = null;
  }

  const ws = new WebSocket(wsUrl());

  ws.onopen = () => {
    reconnectAttempt = 0;
    notifyStatus(true);
  };

  ws.onmessage = (ev) => {
    try {
      dispatch(JSON.parse(ev.data as string) as TelemetryWsMessage);
    } catch {
      /* ignorar */
    }
  };

  ws.onerror = () => {
    /* onclose hará el reconnect */
  };

  ws.onclose = () => {
    sharedWs = null;
    notifyStatus(false);
    if (listeners.size > 0) scheduleReconnect();
  };

  sharedWs = ws;
}

export function subscribeTelemetry(
  onMessage: Listener,
  onStatus: (connected: boolean) => void
): () => void {
  listeners.add(onMessage);
  statusListeners.add(onStatus);
  connectShared();
  onStatus(sharedWs?.readyState === WebSocket.OPEN);

  return () => {
    listeners.delete(onMessage);
    statusListeners.delete(onStatus);
  };
}
