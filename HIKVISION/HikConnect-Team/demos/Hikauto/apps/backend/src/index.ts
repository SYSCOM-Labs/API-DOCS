import http from "http";
import { WebSocketServer } from "ws";
import { createApp } from "./app.js";
import { telemetryHub } from "./websocket/telemetryHub.js";
import { telemetryWorker } from "./workers/telemetryWorker.js";

const PORT = Number(process.env.PORT ?? 4000);

const app = createApp();
const server = http.createServer(app);

/** WebSocket en /ws/telemetry para stream GPS/alarmas al frontend. */
const wss = new WebSocketServer({ server, path: "/ws/telemetry" });

wss.on("connection", (ws) => {
  telemetryHub.addClient(ws);
  ws.send(
    JSON.stringify({
      type: "status",
      payload: {
        running: telemetryWorker.isRunning(),
        sandboxMode: telemetryWorker.getMode().sandboxMode,
        message: telemetryWorker.isRunning()
          ? "Telemetría en curso"
          : "Listo — pulsa «Iniciar telemetría» en la pestaña Telemetría",
      },
    })
  );
});

server.listen(PORT, () => {
  console.log(`[backend] Proxy Hik-Connect escuchando en http://localhost:${PORT}`);
  console.log(`[backend] WebSocket telemetría: ws://localhost:${PORT}/ws/telemetry`);
  console.log(`[backend] Logs MQ detallados: activos (desactivar con MQ_DEBUG=0)`);
});

process.on("unhandledRejection", (reason) => {
  console.error("[backend] unhandledRejection:", reason);
});
