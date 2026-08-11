import type { WebSocket } from "ws";

export type EventsWsMessage =
  | { type: "event"; payload: unknown; debug?: unknown }
  | { type: "status"; payload: { running: boolean; sandboxMode: boolean; message: string } }
  | { type: "debug"; payload: unknown };

class EventsHub {
  private clients = new Set<WebSocket>();

  addClient(ws: WebSocket): void {
    this.clients.add(ws);
    ws.on("close", () => this.clients.delete(ws));
    ws.on("error", () => this.clients.delete(ws));
  }

  broadcast(message: EventsWsMessage): void {
    const data = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === 1) client.send(data);
    }
  }

  clientCount(): number {
    return this.clients.size;
  }
}

export const eventsHub = new EventsHub();
