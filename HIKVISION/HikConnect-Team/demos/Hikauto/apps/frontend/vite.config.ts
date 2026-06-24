import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite dev :5173 — proxy /api y /health hacia Express :4000.
 * Timeout alto para sondas MQ de hasta 60 s.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        timeout: 180_000,
        proxyTimeout: 180_000,
      },
      "/health": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
