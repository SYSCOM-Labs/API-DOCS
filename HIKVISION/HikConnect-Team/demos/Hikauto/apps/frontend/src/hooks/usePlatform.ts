import { useCallback, useEffect, useMemo, useState } from "react";
import type { StoredCredentials, PlatformSnapshot, ProxyDebugInfo } from "../types";
import { apiPost, checkBackendHealth } from "../api/client";

const STORAGE_KEY = "hikFleetPlayground.credentials";
const PLATFORM_KEY = "hikFleetPlayground.platform";

const DEFAULTS: StoredCredentials = {
  serverAddress: "https://ius.hikcentralconnect.com",
  appKey: "",
  secretKey: "",
  sandboxMode: false,
  connected: false,
};

/**
 * Credenciales + descubrimiento automático de la plataforma tras conectar.
 */
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
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    if (platform) sessionStorage.setItem(PLATFORM_KEY, JSON.stringify(platform));
    else sessionStorage.removeItem(PLATFORM_KEY);
  }, [platform]);

  useEffect(() => {
    if (platform?.vehicles.length && !selectedVehicleId) {
      setSelectedVehicleId(platform.vehicles[0].vehicleId);
    }
  }, [platform, selectedVehicleId]);

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

  const selectedVehicle =
    platform?.vehicles.find((v) => v.vehicleId === selectedVehicleId) ??
    platform?.vehicles[0] ??
    null;

  const discover = useCallback(async () => {
    if (!isConfigured) {
      setDiscoverError("Ingresa Account (API Key) y Password (API Secret).");
      return false;
    }
    setDiscovering(true);
    setDiscoverError("");
    try {
      const healthy = await checkBackendHealth();
      if (!healthy) {
        setDiscoverError(
          "El backend no está activo. En la raíz del proyecto ejecuta: npm run dev"
        );
        setDiscovering(false);
        return false;
      }

      const res = await apiPost<PlatformSnapshot>(
        "/api/fleet/discover",
        credentialsEnvelope,
        {}
      );
      if (res.debug) onHud?.("Descubrimiento de plataforma", res.debug);
      const snapshot = res.data as PlatformSnapshot | undefined;
      if (res.error || !snapshot) {
        setDiscoverError(res.error ?? "No se pudo leer el inventario de la cuenta.");
        setDiscovering(false);
        return false;
      }
      setPlatform(snapshot);
      setCredentials({ connected: true, sandboxMode: false });
      if (snapshot.vehicles[0]) setSelectedVehicleId(snapshot.vehicles[0].vehicleId);
      setDiscovering(false);
      return true;
    } catch (e) {
      setDiscoverError(e instanceof Error ? e.message : "Error de red al conectar.");
      setDiscovering(false);
      return false;
    }
  }, [credentialsEnvelope, isConfigured, onHud, setCredentials]);

  /** Tras recargar la página, re-sincroniza inventario si ya estaba conectado. */
  useEffect(() => {
    if (
      credentials.connected &&
      !credentials.sandboxMode &&
      isConfigured &&
      !platform &&
      !discovering
    ) {
      void discover();
    }
  }, [credentials.connected, credentials.sandboxMode, isConfigured, platform, discovering, discover]);

  const connectSandbox = useCallback(() => {
    setPlatform(null);
    setCredentials({ connected: true, sandboxMode: true });
    setDiscoverError("");
  }, [setCredentials]);

  const disconnect = useCallback(() => {
    setPlatform(null);
    setCredentials({ connected: false, sandboxMode: false });
    setSelectedVehicleId("");
    sessionStorage.removeItem(PLATFORM_KEY);
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
    selectedVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
  };
}
