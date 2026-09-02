export type PocMode = "live" | "mock";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno ${name}. Revisa .env.local`);
  return v;
}

export const config = {
  mode: (process.env.POC_MODE ?? "mock") as PocMode,
  dryRun: (process.env.POC_DRY_RUN ?? "true") === "true",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-only-secret-cambiar",
  adminPassword: process.env.POC_ADMIN_PASSWORD ?? "admin",
  viewerPassword: process.env.POC_VIEWER_PASSWORD ?? "visor",
  hct: {
    host: (process.env.HCT_HOST ?? "https://ius.hikcentralconnect.com").replace(/\/$/, ""),
    get appKey() {
      return required("HCT_APP_KEY");
    },
    get secretKey() {
      return required("HCT_SECRET_KEY");
    },
  },
  cameraAllowlist: (process.env.CAMERA_ALLOWLIST ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  deviceCodes(): Record<string, string> {
    try {
      return JSON.parse(process.env.HCT_DEVICE_CODES_JSON ?? "{}") as Record<string, string>;
    } catch {
      return {};
    }
  },
};
