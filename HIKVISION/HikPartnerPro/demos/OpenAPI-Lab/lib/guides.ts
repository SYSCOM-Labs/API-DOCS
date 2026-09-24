export type PageGuide = {
  title: string;
  purpose: string;
  uses: string[];
  steps: string[];
  warning?: string;
};

export const PAGE_GUIDES: Record<string, PageGuide> = {
  "/": {
    title: "Conecta el laboratorio con tu cuenta",
    purpose: "Crea una sesión temporal para que el resto de módulos pueda llamar al OpenAPI regional de Hik-Partner Pro.",
    uses: ["Validar credenciales", "Obtener token", "Detectar areaDomain"],
    steps: ["Pega AppKey y SecretKey", "Pulsa Conectar", "Comprueba que site/search responde"],
    warning: "Las credenciales quedan en una cookie httpOnly de este navegador. Cierra sesión en equipos compartidos.",
  },
  "/dashboard": {
    title: "Vista operativa de toda la instalación",
    purpose: "Resume conectividad, salud y eventos recientes para detectar rápidamente equipos fuera de línea o alarmas activas.",
    uses: ["Supervisión diaria", "Triage de fallos", "Eventos en tiempo real"],
    steps: ["Actualiza el inventario", "Inicia el monitoreo", "Filtra los eventos por severidad"],
    warning: "Dashboard y Alarmas consumen la misma cola MQ. No mantengas ambos monitores activos al mismo tiempo.",
  },
  "/demo": {
    title: "Supervisa instalaciones como un integrador",
    purpose: "Convierte inventario, salud y eventos MQ en una vista operativa por sitio para priorizar incidencias reales.",
    uses: ["NOC ligero", "Estado por sitio", "Triage de incidentes", "Evidencia de alarma"],
    steps: ["Selecciona una instalación", "Revisa disponibilidad y fallas", "Inicia MQ y abre los eventos relevantes"],
    warning: "Es una demo efímera: requiere la pestaña abierta, no sustituye un backend 24/7 y comparte la cola MQ con Dashboard y Alarmas.",
  },
  "/sitios": {
    title: "Organiza instalaciones y permisos",
    purpose: "Los sitios agrupan dispositivos, zona horaria, ubicación, responsables y accesos de cliente.",
    uses: ["Alta de instalaciones", "Compartir acceso", "Handover a clientes", "Team sites"],
    steps: ["Busca el sitio antes de crearlo", "Crea o modifica sus datos", "Asigna responsables o comparte acceso"],
    warning: "Eliminar un sitio puede afectar a todos sus dispositivos. Usa datos de laboratorio para operaciones destructivas.",
  },
  "/dispositivos": {
    title: "Inventario y mantenimiento de equipos",
    purpose: "Consulta qué equipos pertenecen a la cuenta, su sitio, conectividad, salud, canales y firmware.",
    uses: ["Estado online/offline", "Diagnóstico", "Firmware", "PIN y canales"],
    steps: ["Revisa el tablero automático", "Selecciona un equipo del inventario", "Ejecuta solo la acción necesaria"],
    warning: "Upgrade, eliminación y wake-up actúan sobre el equipo real.",
  },
  "/alarmas": {
    title: "Recibe y administra eventos",
    purpose: "Escucha la cola MQ de todos los equipos o de una selección, confirma lotes y resuelve imágenes adjuntas.",
    uses: ["Muro de alarmas", "Filtrar por equipos", "Armar/desarmar", "Obtener fotos"],
    steps: ["Elige Todos o Selección", "Inicia el muro", "Investiga el payload y confirma acciones"],
    warning: "La suscripción cambia para toda la AppKey. Abrir otro consumidor MQ puede repartir o consumir los mismos lotes.",
  },
  "/webhook": {
    title: "Entrega push a tu backend",
    purpose: "Configura una URL HTTPS para que HPP envíe eventos sin mantener long-polling desde el navegador.",
    uses: ["Integración backend", "Automatizaciones", "Recepción server-to-server"],
    steps: ["Consulta la configuración actual", "Registra un callback HTTPS", "Valida firma y responde 2xx en menos de 5 s"],
    warning: "Este laboratorio no almacena los POST entrantes. Al habilitar webhook, el polling MQ puede dejar de recibir eventos.",
  },
  "/arc": {
    title: "Integra una central receptora de alarmas",
    purpose: "Habilita dispositivos para ARC y consulta los sitios y equipos asociados al servicio.",
    uses: ["Alta ARC", "Inventario monitoreado", "Desactivar servicio"],
    steps: ["Conecta con ARC ID/Key", "Lista equipos habilitados", "Habilita o deshabilita los necesarios"],
    warning: "ARC usa credenciales y permisos propios; una AppKey de instalador puede no tener acceso.",
  },
  "/transparente": {
    title: "Envía comandos directos ISAPI u OTAP",
    purpose: "Accede a funciones del firmware que no tienen una operación REST dedicada, como PTZ, zonas o información del equipo.",
    uses: ["Diagnóstico avanzado", "PTZ", "Paneles de alarma", "Propiedades OTAP"],
    steps: ["Selecciona el dispositivo", "Carga una plantilla", "Revisa URI, método y body antes de transmitir"],
    warning: "Es una consola avanzada: un PUT o DELETE incorrecto puede cambiar la configuración real del equipo.",
  },
  "/audio": {
    title: "Emite archivos, TTS y playlists",
    purpose: "Administra la biblioteca de altavoces IP y envía avisos individuales, listas ordenadas o bucles.",
    uses: ["Avisos operativos", "TTS", "Playlist", "Emisión a varios altavoces"],
    steps: ["Selecciona altavoces 12/19", "Sube y aplica el archivo", "Ajusta volumen y reproduce o crea una lista"],
    warning: "Los customAudioID son propios de cada altavoz; una playlist con archivos se ejecuta sobre un equipo a la vez.",
  },
  "/vas": {
    title: "Activa servicios de valor añadido",
    purpose: "Activa paquetes de mantenimiento para habilitar capacidades O&M compatibles con el dispositivo.",
    uses: ["Paquete anual", "Mantenimiento", "O&M"],
    steps: ["Selecciona el dispositivo", "Indica tipo y cantidad cuando corresponda", "Confirma la activación"],
    warning: "La activación puede consumir una licencia o paquete comercial real.",
  },
  "/hotspare": {
    title: "Mantén un equipo de respaldo",
    purpose: "Registra host y spare, envía heartbeat y transfiere archivos de configuración para recuperación.",
    uses: ["Alta disponibilidad", "Backup de configuración", "Detección de host caído"],
    steps: ["Registra la identidad hot spare", "Mantén heartbeat cada 60 s", "Sube o descarga el archivo de backup"],
    warning: "El heartbeat automático solo vive mientras esta pestaña permanece abierta.",
  },
  "/instaladores": {
    title: "Localiza personal instalador",
    purpose: "Busca empleados instaladores por nombre, correo o teléfono para asignaciones y soporte.",
    uses: ["Buscar responsables", "Asignar managers", "Verificar cuentas"],
    steps: ["Introduce un criterio", "Ejecuta la búsqueda", "Usa el ID devuelto en las operaciones de sitio"],
  },
  "/vsaas": {
    title: "Alcance de vídeo y audio bidireccional",
    purpose: "Aclara qué capacidades requieren HPNetSDK: live view, playback, descarga y two-way audio.",
    uses: ["Planificar integración nativa", "Distinguir REST de SDK", "VSaaS"],
    steps: ["Confirma el caso de uso", "Solicita credenciales VSaaS", "Integra HPNetSDK en un cliente o bridge"],
    warning: "Estas funciones no pueden implementarse únicamente con Route Handlers de Vercel.",
  },
  "/cobertura": {
    title: "Comprueba qué cubre el laboratorio",
    purpose: "Compara los módulos del OpenAPI V2.15.500 con lo implementado y señala capacidades eliminadas o externas.",
    uses: ["Auditoría técnica", "Planificación", "Detectar límites"],
    steps: ["Busca el módulo", "Comprueba si está en el lab", "Abre la sección indicada o revisa la nota de exclusión"],
  },
  "/ayuda": {
    title: "Guía completa de operación",
    purpose: "Explica el recorrido recomendado, seguridad, límites de Vercel y relación entre los módulos.",
    uses: ["Primeros pasos", "Resolver dudas", "Flujo recomendado"],
    steps: ["Conecta la cuenta", "Revisa Dashboard", "Abre el módulo específico para investigar o actuar"],
  },
};
