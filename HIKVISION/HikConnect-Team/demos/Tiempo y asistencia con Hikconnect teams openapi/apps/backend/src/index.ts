import http from "http";
import { WebSocketServer } from "ws";
import { createApp } from "./app.js";
import { eventsHub } from "./websocket/eventsHub.js";
import { eventsWorker } from "./workers/eventsWorker.js";

const PORT = Number(process.env.PORT ?? 4000);

const app = createApp();
const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: "/ws/events" });

wss.on("connection", (ws) => {
  eventsHub.addClient(ws);
  ws.send(
    JSON.stringify({
      type: "status",
      payload: {
        running: eventsWorker.isRunning(),
        sandboxMode: eventsWorker.getMode().sandboxMode,
        message: eventsWorker.isRunning()
          ? "Eventos en curso"
          : "Listo — inicia el feed en la pestaña Eventos",
      },
    })
  );
});

server.listen(PORT, () => {
  console.log(`[backend] Proxy Tiempo y Asistencia en http://localhost:${PORT}`);
  console.log(`[backend] WebSocket eventos: ws://localhost:${PORT}/ws/events`);
});

process.on("unhandledRejection", (reason) => {
  console.error("[backend] unhandledRejection:", reason);
});
