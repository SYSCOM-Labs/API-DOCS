import type { WebSocket } from "ws";

/** Tipos de mensaje broadcast al frontend vía WebSocket. */
export type TelemetryWsMessage =
  | { type: "gps"; payload: unknown; debug?: unknown }
  | { type: "alarm"; payload: unknown; debug?: unknown }
  | { type: "status"; payload: { running: boolean; sandboxMode: boolean; message: string } }
  | { type: "debug"; payload: unknown }
  | { type: "diag"; payload: Record<string, unknown> };

/**
 * Hub WebSocket para telemetría en tiempo real.
 * Desacopla telemetryWorker del transporte hacia el mapa Leaflet y el Code HUD.
 */
class TelemetryHub {
  private clients = new Set<WebSocket>();

  addClient(ws: WebSocket): void {
    this.clients.add(ws);
    ws.on("close", () => this.clients.delete(ws));
    ws.on("error", () => this.clients.delete(ws));
  }

  broadcast(message: TelemetryWsMessage): void {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === 1) {
        client.send(data);
      }
    }
  }

  clientCount(): number {
    return this.clients.size;
  }
}

export const telemetryHub = new TelemetryHub();
