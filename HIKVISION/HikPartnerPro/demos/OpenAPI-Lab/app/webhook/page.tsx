import { ModulePage } from "@/components/ModulePage";

function LimitNote() {
  return (
    <div className="note" style={{ marginBottom: 18 }}>
      HPP hace POST al callback HTTPS (cabeceras X-Hook-Batch-Id, X-Hook-Timestamp, X-Hook-Signature,
      timeout 5 s, respuesta 2xx). Ese POST no es tu navegador, así que <strong>no se puede dejar el
      evento en tus cookies</strong>. Este lab no tiene base de datos: no hay inbox en vivo. Prueba
      eventos en <strong>Alarmas</strong> (MQ). Activar webhook puede dejar de entregar el polling.
    </div>
  );
}

export default function Page() {
  return <ModulePage slug="webhook" extra={<LimitNote />} />;
}
