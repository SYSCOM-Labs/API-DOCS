import type { PlatformSnapshot, DiscoveredVehicle, ProxyDebugInfo } from "../../types";

/** Props comunes de pestañas con autocompletado desde plataforma. */
export interface FleetTabProps {
  credentialsEnvelope: Record<string, string>;
  isConfigured: boolean;
  sandboxMode: boolean;
  platform: PlatformSnapshot | null;
  selectedVehicle: DiscoveredVehicle | null;
  onHud: (label: string, debug?: ProxyDebugInfo) => void;
}
