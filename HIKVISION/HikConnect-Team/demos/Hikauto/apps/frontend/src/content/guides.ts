/**
 * Contenido pedagógico del playground: explicaciones alineadas al PDF V2.15.0
 * y a la colección Postman local. Texto en español para desarrolladores open-source.
 */

export interface GuideStep {
  title: string;
  detail: string;
}

export interface DataHint {
  field: string;
  where: string;
}

export interface SectionGuide {
  id: string;
  title: string;
  summary: string;
  howItWorks: string;
  prerequisites: string[];
  steps: GuideStep[];
  dataHints: DataHint[];
  apiLocal: string;
  apiHik: string;
  sourceFile: string;
}

export const CREDENTIALS_GUIDE: SectionGuide = {
  id: "credentials",
  title: "Paso 0 — Configurar credenciales",
  summary:
    "Antes de llamar a la API real necesitas appKey, secretKey y la URL de tu tenant Hik-Connect for Teams.",
  howItWorks:
    "El playground guarda las credenciales solo en localStorage de tu navegador. Cada petición al proxy local incluye un sobre _credentials; el backend obtiene el token (POST token/get), cachea accessToken y areaDomain, y reenvía la llamada a Hik-Connect.",
  prerequisites: [
    "Cuenta de desarrollador en Hik-Connect for Teams con OpenAPI habilitado.",
    "Acceso al portal donde se generan appKey (AK) y secretKey (SK).",
  ],
  steps: [
    {
      title: "Obtén appKey y secretKey",
      detail:
        "En el portal de desarrollo de Hik-Connect for Teams, crea o abre tu aplicación OpenAPI. Copia el appKey (AK) y el secretKey (SK). No los compartas ni los subas a Git.",
    },
    {
      title: "Identifica serverAddress",
      detail:
        "Es la URL base de tu región, por ejemplo https://ius.hikcentralconnect.com. Aparece en la documentación de tu tenant o en la variable {{host}} de la colección Postman incluida en el repo.",
    },
    {
      title: "Pega los tres valores en Configuración",
      detail:
        "Clic en el botón «Configuración» (arriba a la derecha). Los valores se guardan automáticamente en localStorage.",
    },
    {
      title: "Elige modo Sandbox o Real",
      detail:
        "Sandbox: telemetría simulada sin red Hikvision (ideal para aprender la UI). Real: requiere credenciales válidas y llama a los servidores oficiales.",
    },
  ],
  dataHints: [
    { field: "serverAddress", where: "Portal Hik-Connect / Postman variable {{host}}" },
    { field: "appKey", where: "Portal desarrollador → aplicación OpenAPI → AK" },
    { field: "secretKey", where: "Portal desarrollador → aplicación OpenAPI → SK" },
  ],
  apiLocal: "— (credenciales en localStorage)",
  apiHik: "POST /api/hccgw/platform/v1/token/get",
  sourceFile: "apps/backend/src/services/hikAuth.ts",
};

export const GUIDES: Record<string, SectionGuide> = {
  vehicles: {
    id: "vehicles",
    title: "Agregar vehículo (provisionamiento 1:1)",
    summary:
      "Registra un activo de flota vinculado a un único dashcam móvil. Un deviceSerial no puede asociarse a varios vehículos (PDF §1.2.9).",
    howItWorks:
      "El formulario envía POST al proxy local /api/fleet/vehicles/add. El backend traduce a POST .../areas/vehicles/add en {areaDomain} con header Token. Si errorCode es \"0\", la plataforma devuelve el vehicle id en data.id.",
    prerequisites: [
      "Credenciales configuradas (Configuración).",
      "Dashcam ya añadido en Hik-Connect y su número de serie (deviceSerial).",
      "areaId del área donde importarás el vehículo.",
    ],
    steps: [
      {
        title: "Obtén el areaId",
        detail:
          "En Hik-Connect for Teams → Recursos → Áreas, selecciona el área destino. El ID suele obtenerse vía API areas/get o desde la URL/detalle del recurso en el portal. También puedes usar Postman §2.x (búsqueda de áreas).",
      },
      {
        title: "Anota el deviceSerial del dashcam",
        detail:
          "Es el número de serie físico del dispositivo onboard (ej. J091122). Lo ves en el portal bajo Dispositivos móviles / On-board devices, o en la etiqueta del hardware.",
      },
      {
        title: "Completa placa y tipo de vehículo",
        detail:
          "licensePlateNo: matrícula o nombre visible. vehicleType: 0=otros, 1=auto, 2=camión, 3=bus (PDF §5.9.1).",
      },
      {
        title: "Envía y revisa el Code HUD",
        detail:
          "Tras «Agregar vehículo», el panel derecho muestra la URL gateway exacta, el JSON enviado, la respuesta y el archivo backend que procesó la petición.",
      },
    ],
    dataHints: [
      { field: "areaId", where: "Portal → Áreas, o API resource/v1/areas" },
      { field: "deviceSerial", where: "Portal → Dispositivo onboard → Serial No." },
      { field: "licensePlateNo", where: "Lo defines tú (identificador del vehículo)" },
      { field: "vehicleType", where: "Enumeración PDF: 0–3" },
    ],
    apiLocal: "POST /api/fleet/vehicles/add",
    apiHik: "POST /api/hccgw/resource/v1/areas/vehicles/add",
    sourceFile: "apps/backend/src/controllers/fleetController.ts",
  },

  drivers: {
    id: "drivers",
    title: "Conductores y despacho facial",
    summary:
      "Registra un conductor con foto Base64 y luego sincroniza su rostro al almacenamiento del dashcam vinculado.",
    howItWorks:
      "Paso 1: driver/add crea el perfil y devuelve driverId. Paso 2: driverFace/distribution envía driverIds[]; la plataforma aplica la biometría de forma asíncrona al hardware onboard.",
    prerequisites: [
      "Credenciales configuradas.",
      "groupId de un grupo de conductores existente.",
      "Opcional: relateVehicleIds si quieres vincular vehículos (PDF §5.9.7).",
      "Foto JPG ≤ 5 MB en Base64 para photoData.",
    ],
    steps: [
      {
        title: "Obtén groupId",
        detail:
          "En Hik-Connect → Monitoreo a bordo → Grupos de conductores, o vía API driverGroup. El groupId es un string UUID devuelto por la plataforma.",
      },
      {
        title: "Prepara driverCode y datos personales",
        detail:
          "driverCode: código interno del conductor. gender: 0=desconocido, 1=masc, 2=fem. Al menos firstName o lastName es obligatorio según PDF §5.9.7.",
      },
      {
        title: "Sube foto de rostro",
        detail:
          "Selecciona una imagen JPG (máx. 5 MB). Es obligatoria para el reconocimiento facial en el dashcam.",
      },
      {
        title: "Registra y copia el driverId",
        detail:
          "Tras «Registrar conductor», la respuesta incluye data.driverId. Se rellena automáticamente en el paso 2.",
      },
      {
        title: "Despacha rostros al dashcam",
        detail:
          "«Despachar rostros» llama driverFace/distribution. Si la respuesta trae data.guid, el estado final se consulta con driverFace/status/query (opcional).",
      },
    ],
    dataHints: [
      { field: "groupId", where: "Portal → Grupos de conductores / API driverGroup" },
      { field: "driverCode", where: "Código interno que tú asignas" },
      { field: "photoData", where: "Archivo JPG local → Base64 en el formulario" },
      { field: "driverIds", where: "Respuesta de driver/add → data.driverId" },
    ],
    apiLocal: "POST /api/fleet/drivers/add → POST /api/fleet/drivers/face-dispatch",
    apiHik:
      "POST .../vehicle/v1/driver/add → POST .../vehicle/v1/driverFace/distribution",
    sourceFile: "apps/backend/src/controllers/driverController.ts",
  },

  acc: {
    id: "acc",
    title: "Estado ACC (ignición del vehículo)",
    summary:
      "Consulta si el motor está encendido (ACC ON), apagado (ACC OFF) o sin reporte de telemetría (-1).",
    howItWorks:
      "Envías deviceSerials como cadena CSV. El proxy llama accstatus/search. Cada elemento en accStatusInfos trae idOrDeviceSerial y accStatus: 1=encendido, 0=apagado, -1=desconocido.",
    prerequisites: [
      "Credenciales configuradas.",
      "Seriales de dashcams ya vinculados a vehículos.",
    ],
    steps: [
      {
        title: "Reúne los deviceSerials",
        detail:
          "Lista separada por comas, sin espacios extra: CA5565496,K70728087. Los mismos seriales que usaste al agregar vehículos.",
      },
      {
        title: "Consulta ACC",
        detail:
          "Pulsa «Consultar ACC». Los badges de color muestran el estado por dispositivo.",
      },
      {
        title: "Respeta la frecuencia en producción",
        detail:
          "El PDF §5.9.5 recomienda no consultar más a menudo que cada 2 minutos en entornos reales para no saturar la plataforma.",
      },
    ],
    dataHints: [
      {
        field: "deviceSerials",
        where: "Portal → Dispositivo onboard, o respuesta al agregar vehículo",
      },
    ],
    apiLocal: "POST /api/fleet/vehicles/acc-status",
    apiHik: "POST /api/hccgw/resource/v1/accstatus/search",
    sourceFile: "apps/backend/src/controllers/fleetController.ts",
  },

  stream: {
    id: "stream",
    title: "Video en vivo y audio bidireccional",
    summary:
      "Obtiene URL EZOPEN y reproduce el stream del dashcam con el JSSDK de Hik/EZVIZ.",
    howItWorks:
      "Primero streamtoken/get (credenciales JSSDK). Luego live/address/get con type \"1\", deviceSerial, resourceId del canal y cameraChannel en la URL ezopen (…/5.live). Audio bidireccional: solo canal 1 (PDF §1.2.9).",
    prerequisites: [
      "Credenciales configuradas.",
      "deviceSerial del dashcam online.",
      "Navegador con acceso al CDN ezuikit (incluido en index.html).",
    ],
    steps: [
      {
        title: "Introduce deviceSerial",
        detail: "Serial del dashcam cuya cámara quieres ver en vivo.",
      },
      {
        title: "Canal CH5 (OSD del dashcam)",
        detail:
          "Si el OSD muestra CH5 (AE-DI5052-G40), usa cameraChannel=5. El resourceId debe ser el de ese canal. La URL ezopen debe terminar en /5.live.",
      },
      {
        title: "Code de encriptación (opcional)",
        detail:
          "Campo Opt. en el PDF. Solo si el dispositivo tiene encriptación activa; déjalo vacío si el stream ya funciona.",
      },
      {
        title: "Inicia Live Stream",
        detail:
          "Obtiene appToken + URL ezopen://.... Revisa en el Code HUD las dos llamadas (stream token + live address).",
      },
      {
        title: "Activa Two-Way Audio (opcional)",
        detail:
          "Solo con canal 1. Usa el micrófono del navegador según permisos del JSSDK.",
      },
    ],
    dataHints: [
      { field: "deviceSerial", where: "Portal → Dispositivo onboard" },
      { field: "resourceId", where: "Opcional: ID cámara desde areas/cameras/get" },
      { field: "code", where: "Opcional (PDF) — solo dispositivos con streamEncryptEnable" },
      { field: "cameraChannel", where: "OSD CH5 → 5; etiqueta CH{n} en selector" },
    ],
    apiLocal: "GET /api/fleet/stream/token + POST /api/fleet/live/address",
    apiHik:
      "GET .../streamtoken/get + POST .../video/v1/live/address/get",
    sourceFile: "apps/backend/src/controllers/videoController.ts",
  },

  telemetry: {
    id: "telemetry",
    title: "GPS en tiempo real vía cola MQ (Msg330001)",
    summary:
      "Única vía OpenAPI para posición: subscribe → poll → complete. El OSD del video no alimenta esta cola.",
    howItWorks:
      "Modo Real: mq/subscribe (Msg330001, 330002, 330501, 330503) → polling 500 ms → messages/complete → WebSocket. Modo Sandbox: ruta simulada sin red. speed: cm/h → km/h; direction normalizado 0–360°.",
    prerequisites: [
      "Modo Real: dashcam con GPS habilitado y subida a la nube en Hik-Connect (no basta el OSD del stream).",
      "Permisos OpenAPI de mensajería onboard en tu cuenta Teams.",
    ],
    steps: [
      {
        title: "Última ubicación en mapa",
        detail:
          "V2.15.0 no expone GET de posición (solo rawmsg MQ §4.4). «Obtener última ubicación» escucha Msg330001 ~30s y muestra un carrito en Leaflet; se cachea en sesión.",
      },
      {
        title: "Iniciar telemetría",
        detail:
          "Worker con ráfaga inicial de polls y diagnóstico en vivo. WebSocket ws://hostname:4000/ws/telemetry.",
      },
      {
        title: "Mapa y rastro",
        detail:
          "Marcador actual + línea azul con los últimos 80 puntos por serial. Centro por defecto cerca de tu OSD de referencia (Chihuahua).",
      },
      {
        title: "Si sigue en 0 puntos",
        detail:
          "Revisa panel Diagnóstico: subscribe errorCode, eventCount, msgTypes. Compara con Postman §4.1 usando las mismas credenciales.",
      },
    ],
    dataHints: [
      { field: "deviceSerial", where: "basicInfo.device.name en cada evento MQ" },
      { field: "gpsInfo.lat/lng", where: "data.vehicleRelatedInfo.gpsInfo (hemisferio ns/ew)" },
      { field: "sandboxMode", where: "Solo pantalla de login sin credenciales (sin GPS simulado en mapa)" },
    ],
    apiLocal: "POST /api/telemetry/probe | /start + POST /api/fleet/vehicles/last-locations",
    apiHik:
      "POST .../mq/subscribe → .../mq/messages → .../mq/messages/complete",
    sourceFile: "apps/backend/src/services/mqTelemetryService.ts",
  },
};

export const HUD_GUIDE = {
  title: "Code HUD — Consola del desarrollador",
  summary:
    "Panel derecho: cada acción deja rastro técnico para aprender la integración OpenAPI.",
  bullets: [
    "Verbo HTTP y URL completa del gateway Hik-Connect.",
    "JSON exacto del request enviado por el proxy.",
    "JSON literal de la respuesta (errorCode, data, etc.).",
    "Ruta del script backend que manejó la operación — ábrelo en el repo para leer comentarios.",
  ],
};
