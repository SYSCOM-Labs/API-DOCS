import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16: activa Cache Components; PPR queda habilitado por defecto.
  cacheComponents: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Requeridos por EZUIKit/JSDecoder: el decoder WASM usa SharedArrayBuffer.
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
