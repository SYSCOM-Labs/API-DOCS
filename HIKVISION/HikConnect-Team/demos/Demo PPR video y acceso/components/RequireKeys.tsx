import { getHctKeys } from "@/lib/settings";
import { KeysSetup } from "@/components/KeysSetup";
import { config } from "@/lib/config";

// Gate de credenciales: en modo live sin cookie de claves en este navegador,
// muestra la captura en lugar del contenido.
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
