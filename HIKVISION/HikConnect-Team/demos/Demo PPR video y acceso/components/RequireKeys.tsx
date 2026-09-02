import { getHctKeys } from "@/lib/settings";
import { KeysSetup } from "@/components/KeysSetup";
import { config } from "@/lib/config";

// Gate de credenciales: en modo live sin claves configuradas en esta maquina,
// muestra la captura en lugar del contenido. Importante porque el inventario
// cacheado ('use cache') se serviria igual aunque ya no haya claves.
export async function RequireKeys({ children }: { children: React.ReactNode }) {
  if (config.mode === "live") {
    try {
      await getHctKeys();
    } catch {
      return <KeysSetup />;
    }
  }
  return <>{children}</>;
}
