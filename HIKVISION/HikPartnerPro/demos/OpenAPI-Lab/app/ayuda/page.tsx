import Link from "next/link";

const sections = [
  {
    title: "1. Conexión",
    purpose: "Abre una sesión temporal contra Hik-Partner Pro.",
    steps: [
      "Obtén API Key y API Secret en Hik-Partner Pro: Site & Device → My Service → API Integration.",
      "Pégalos en Conexión. El servidor solicita un accessToken y el areaDomain regional.",
      "Las credenciales quedan en una cookie httpOnly de tu navegador durante siete días. No hay base de datos.",
      "Usa Cerrar sesión al terminar, sobre todo en un equipo compartido.",
    ],
    link: ["/", "Abrir Conexión"],
  },
  {
    title: "2. Torre de control",
    purpose: "Ejemplo práctico de supervisión para un integrador, organizado por instalación.",
    steps: [
      "Carga automáticamente sitios y dispositivos y calcula disponibilidad, desconectados y fallas.",
      "Selecciona Todos los sitios o una instalación concreta; la suscripción MQ usa el mismo alcance.",
      "Los sitios con más riesgo aparecen primero para orientar la atención del operador.",
      "Abre un evento para revisar el payload y resolver imágenes ISAPI_FILES cuando existan.",
      "Exporta la fotografía actual de inventario y eventos a JSON o CSV; nada se guarda en el servidor.",
    ],
    link: ["/demo", "Abrir Torre de control"],
  },
  {
    title: "3. Dashboard",
    purpose: "Es la vista principal para operar: combina inventario, salud y todos los eventos.",
    steps: [
      "Actualizar estado consulta hasta 100 dispositivos y resume cuántos están en línea o con falla.",
      "Iniciar monitoreo suscribe todos los dispositivos y mantiene un long-poll de aproximadamente 20 segundos.",
      "Cada lote recibido se confirma automáticamente con mq/offset para evitar eventos duplicados.",
      "Los filtros separan eventos críticos, recuperaciones y actividad informativa.",
      "Los eventos viven solo en memoria: al cerrar o recargar la pestaña desaparecen.",
    ],
    link: ["/dashboard", "Abrir Dashboard"],
  },
  {
    title: "4. Sitios y dispositivos",
    purpose: "Gestiona el inventario de la cuenta y consulta su estado.",
    steps: [
      "Un dispositivo debe pertenecer a un sitio. Crea primero el sitio y después registra el serial.",
      "El tablero de dispositivos muestra online/offline y healthStatus cuando HPP lo entrega.",
      "Las operaciones de eliminar, handover, upgrade o cambio de permisos afectan la cuenta real y piden confirmación.",
      "Usa equipos y sitios de laboratorio; esta aplicación no simula las respuestas.",
    ],
    link: ["/dispositivos", "Ver dispositivos"],
  },
  {
    title: "5. Alarmas y eventos",
    purpose: "Recibe el flujo original y permite acciones específicas de seguridad.",
    steps: [
      "El Dashboard es la vista recomendada para observar todo. Alarmas conserva herramientas avanzadas.",
      "En Alarmas elige Todos los dispositivos o una selección del inventario antes de iniciar el muro.",
      "Puedes armar, armar en silencio o desarmar paneles compatibles.",
      "Para adjuntos ISAPI_FILES, pega filePath y solicita una URL temporal de la imagen.",
      "No abras Dashboard y Alarmas monitoreando a la vez: ambos consumen la misma cola de la cuenta.",
    ],
    link: ["/alarmas", "Herramientas de alarmas"],
  },
  {
    title: "6. Audio",
    purpose: "Administra archivos y ordena su reproducción en altavoces IP Hikvision.",
    steps: [
      "Solo aplica a dispositivos category 12 / subcategory 19 (IP Speaker).",
      "Vista previa reproduce el archivo local en este navegador; todavía no lo envía al dispositivo.",
      "Subir coloca el archivo en el almacenamiento temporal de HPP y devuelve URL + UUID.",
      "El paso 2 lista tus equipos: marca uno o varios altavoces en vez de escribir el serial a mano.",
      "Aplicar audio registra ese archivo en cada altavoz marcado y le asigna un customAudioID propio.",
      "Reproducir en altavoz usa audio/inter/cut: es una orden remota; el sonido sale del altavoz, no del navegador.",
      "Como el customAudioID cambia por equipo, la biblioteca y su botón de reproducir trabajan sobre un altavoz a la vez.",
      "TTS no depende de IDs, así que puede emitirse en todos los altavoces seleccionados de una sola vez.",
      "La lista de reproducción encadena archivos y TTS; order reproduce una vez y loop repite durante el tiempo elegido.",
    ],
    link: ["/audio", "Abrir Audio"],
  },
  {
    title: "7. Webhook, ARC y herramientas avanzadas",
    purpose: "Funciones especializadas para integradores.",
    steps: [
      "Webhook permite configurar el callback, pero este lab sin almacenamiento no puede conservar su inbox.",
      "ARC requiere conectar con ARC ID/Key en lugar de API Key/Secret.",
      "ISAPI/OTAP transmite comandos directos al equipo; úsalo solo si conoces la URI y el modelo.",
      "Hot spare, VAS y firmware pueden modificar servicios o configuración real.",
    ],
    link: ["/cobertura", "Ver cobertura completa"],
  },
];

export default function HelpPage() {
  return (
    <>
      <header className="page-head">
        <span className="eyebrow">Guía de operación</span>
        <h2>Ayuda</h2>
        <p>
          Este laboratorio es un panel operativo sobre el OpenAPI de Hik-Partner Pro. No emula
          equipos: cada acción se ejecuta contra la cuenta conectada.
        </p>
      </header>

      <section className="neu help-intro">
        <h3>Flujo recomendado</h3>
        <ol className="flow-steps">
          <li><span>1</span>Conecta las credenciales</li>
          <li><span>2</span>Abre Torre de control</li>
          <li><span>3</span>Elige una instalación</li>
          <li><span>4</span>Inicia el monitor</li>
          <li><span>5</span>Investiga o actúa desde cada módulo</li>
        </ol>
        <div className="note">
          Seguridad: las claves están en una cookie httpOnly, pero el navegador las envía al proxy
          en cada llamada. Usa HTTPS, no compartas el equipo y cierra sesión al finalizar.
        </div>
      </section>

      <div className="help-grid">
        {sections.map((section) => (
          <article className="neu help-card" key={section.title}>
            <h3>{section.title}</h3>
            <p className="help-purpose">{section.purpose}</p>
            <ol>
              {section.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <Link className="btn" href={section.link[0]}>{section.link[1]}</Link>
          </article>
        ))}
      </div>
    </>
  );
}
