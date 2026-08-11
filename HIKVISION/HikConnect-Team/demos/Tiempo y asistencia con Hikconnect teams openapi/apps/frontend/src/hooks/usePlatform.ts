import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlatformSnapshot, ProxyDebugInfo, StoredCredentials } from "../types";
import { apiPost, checkBackendHealth } from "../api/client";

const STORAGE_KEY = "hikAttendancePlayground.credentials";
const PLATFORM_KEY = "hikAttendancePlayground.platform";

const DEFAULTS: StoredCredentials = {
  serverAddress: "https://ius.hikcentralconnect.com",
  appKey: "",
  secretKey: "",
  sandboxMode: false,
  connected: false,
};

export function usePlatform(onHud?: (label: string, debug?: ProxyDebugInfo) => void) {
  const [credentials, setCredentialsState] = useState<StoredCredentials>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return DEFAULTS;
  });

  const [platform, setPlatform] = useState<PlatformSnapshot | null>(() => {
    try {
      const raw = sessionStorage.getItem(PLATFORM_KEY);
      if (raw) return JSON.parse(raw) as PlatformSnapshot;
    } catch {
      /* ignore */
    }
    return null;
  });

  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    if (platform) sessionStorage.setItem(PLATFORM_KEY, JSON.stringify(platform));
    else sessionStorage.removeItem(PLATFORM_KEY);
  }, [platform]);

  const setCredentials = useCallback((partial: Partial<StoredCredentials>) => {
    setCredentialsState((prev) => ({ ...prev, ...partial }));
  }, []);

  const credentialsEnvelope = useMemo(
    () => ({
      serverAddress: credentials.serverAddress,
      appKey: credentials.appKey,
      secretKey: credentials.secretKey,
    }),
    [credentials.serverAddress, credentials.appKey, credentials.secretKey]
  );

  const isConfigured =
    Boolean(credentials.serverAddress) &&
    Boolean(credentials.appKey) &&
    Boolean(credentials.secretKey);

  const discover = useCallback(async () => {
    if (!isConfigured) {
      setDiscoverError("Ingresa API Key y API Secret.");
      return false;
    }
    setDiscovering(true);
    setDiscoverError("");
    try {
      const healthy = await checkBackendHealth();
      if (!healthy) {
        setDiscoverError("El backend no está activo. Ejecuta: npm run dev");
        setDiscovering(false);
        return false;
      }
      const res = await apiPost<PlatformSnapshot>("/api/attendance/discover", credentialsEnvelope, {});
      if (res.debug) onHud?.("Descubrimiento de plataforma", res.debug);
      if (res.error || !res.data) {
        setDiscoverError(res.error ?? "No se pudo leer el inventario.");
        setDiscovering(false);
        return false;
      }
      setPlatform(res.data);
      setCredentials({ connected: true, sandboxMode: false });
      setDiscovering(false);
      return true;
    } catch (e) {
      setDiscoverError(e instanceof Error ? e.message : "Error de red");
      setDiscovering(false);
      return false;
    }
  }, [credentialsEnvelope, isConfigured, onHud, setCredentials]);

  const connectSandbox = useCallback(() => {
    setDiscovering(true);
    setDiscoverError("");
    void (async () => {
      try {
        await checkBackendHealth();
        const res = await apiPost<PlatformSnapshot>(
          "/api/attendance/discover",
          { serverAddress: "https://sandbox.local", appKey: "sandbox", secretKey: "sandbox" },
          { sandboxMode: true }
        );
        if (res.debug) onHud?.("Sandbox — descubrimiento", res.debug);
        if (res.data) {
          setPlatform(res.data);
          setCredentials({
            connected: true,
            sandboxMode: true,
            serverAddress: credentials.serverAddress || DEFAULTS.serverAddress,
            appKey: credentials.appKey || "sandbox",
            secretKey: credentials.secretKey || "sandbox",
          });
        }
      } catch (e) {
        setDiscoverError(e instanceof Error ? e.message : "Error sandbox");
      } finally {
        setDiscovering(false);
      }
    })();
  }, [credentials.appKey, credentials.secretKey, credentials.serverAddress, onHud, setCredentials]);

  const disconnect = useCallback(() => {
    setPlatform(null);
    setCredentials({ connected: false, sandboxMode: false });
  }, [setCredentials]);

  return {
    credentials,
    setCredentials,
    credentialsEnvelope,
    isConfigured,
    platform,
    discovering,
    discoverError,
    discover,
    connectSandbox,
    disconnect,
  };
}
