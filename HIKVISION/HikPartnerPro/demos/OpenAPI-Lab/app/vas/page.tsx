import { ModulePage } from "@/components/ModulePage";

export default function Page() {
  return (
    <ModulePage
      slug="vas"
      extra={
        <div className="note" style={{ marginBottom: 18 }}>
          Eliminado en 2.15.500: POST /api/hpcgw/v1/site/health/report. Usa este activador de paquete
          O&amp;M y el tablero de Dispositivos (healthStatus).
        </div>
      }
    />
  );
}
