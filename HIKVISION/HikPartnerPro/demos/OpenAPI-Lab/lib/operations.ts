export type FieldType = "text" | "number" | "boolean" | "json" | "textarea";

export type OpField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
};

export type Operation = {
  id: string;
  title: string;
  description: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  pathParams?: string[];
  fields?: OpField[];
  defaultBody?: unknown;
  dangerous?: boolean;
  extraHeaders?: OpField[];
  rawBody?: boolean;
  contentType?: string;
};

export type ModuleDef = {
  slug: string;
  title: string;
  blurb: string;
  ops: Operation[];
};

const json = (name: string, label: string, placeholder: string, required = true): OpField => ({
  name,
  label,
  type: "json",
  required,
  placeholder,
});

export const modules: ModuleDef[] = [
  {
    slug: "sitios",
    title: "Sitios",
    blurb: "CRUD de sitios, compartición, handover a clientes y team sites. Los dispositivos viven siempre dentro de un sitio.",
    ops: [
      {
        id: "site-search",
        title: "Buscar sitios",
        description: "POST /api/hpcgw/v1/site/search",
        method: "POST",
        path: "/api/hpcgw/v1/site/search",
        fields: [
          { name: "search", label: "Búsqueda", type: "text" },
          { name: "page", label: "Página", type: "number", placeholder: "0" },
          { name: "pageSize", label: "Tamaño", type: "number", placeholder: "20" },
        ],
      },
      {
        id: "site-add",
        title: "Crear sitio",
        description: "POST /api/hpcgw/v1/site/add",
        method: "POST",
        path: "/api/hpcgw/v1/site/add",
        fields: [
          { name: "name", label: "Nombre", type: "text", required: true },
          { name: "timeZone", label: "Zona horaria (A.3)", type: "number", required: true, placeholder: "222" },
          { name: "timeSync", label: "Sincronizar hora", type: "boolean" },
          { name: "siteState", label: "Estado/región", type: "text" },
          { name: "siteCity", label: "Ciudad", type: "text" },
          { name: "siteStreet", label: "Calle", type: "text" },
          { name: "location", label: "Dirección", type: "text" },
        ],
      },
      {
        id: "site-update",
        title: "Editar sitio",
        description: "POST /api/hpcgw/v1/site/{id}/update",
        method: "POST",
        path: "/api/hpcgw/v1/site/{id}/update",
        pathParams: ["id"],
        fields: [
          { name: "name", label: "Nombre", type: "text", required: true },
          { name: "siteState", label: "Estado/región", type: "text" },
          { name: "siteCity", label: "Ciudad", type: "text" },
          { name: "siteStreet", label: "Calle", type: "text" },
          { name: "location", label: "Dirección", type: "text" },
        ],
      },
      {
        id: "site-delete",
        title: "Eliminar sitio",
        description: "Borra el sitio y todos sus dispositivos.",
        method: "POST",
        path: "/api/hpcgw/v1/site/{id}/delete",
        pathParams: ["id"],
        dangerous: true,
      },
      {
        id: "site-share",
        title: "Compartir sitio",
        description: "POST /api/hpcgw/v1/site/share",
        method: "POST",
        path: "/api/hpcgw/v1/site/share",
        fields: [
          { name: "email", label: "Email empleado", type: "text", required: true },
          { name: "siteId", label: "Site ID", type: "text", required: true },
          { name: "applyTimeType", label: "Duración (-1 permanente, 0=1h…)", type: "number", placeholder: "-1" },
          { name: "describe", label: "Nota", type: "text" },
        ],
      },
      {
        id: "site-share-cancel",
        title: "Cancelar compartición",
        description: "POST /api/hpcgw/v1/site/share/cancel/{id}",
        method: "POST",
        path: "/api/hpcgw/v1/site/share/cancel/{id}",
        pathParams: ["id"],
        dangerous: true,
      },
      {
        id: "site-assign",
        title: "Asignar managers",
        description: "POST /api/hpcgw/v2/site/assign — sustituye managers previos.",
        method: "POST",
        path: "/api/hpcgw/v2/site/assign",
        fields: [
          json(
            "siteIds",
            "siteIds (array)",
            '["aaaa","bbbb"]',
          ),
          json(
            "installerPermissionTimes",
            "installerPermissionTimes",
            '[{"installerId":"xxxx","expiredDurationTime":-1}]',
          ),
        ],
      },
      {
        id: "site-managers",
        title: "Listar managers",
        description: "POST /api/hpcgw/v1/site/sitemanagers",
        method: "POST",
        path: "/api/hpcgw/v1/site/sitemanagers",
        fields: [{ name: "siteId", label: "Site ID", type: "text", required: true }],
      },
      {
        id: "site-handover-share",
        title: "Handover por sharing",
        description: "POST /api/hpcgw/v2/site/handover/share",
        method: "POST",
        path: "/api/hpcgw/v2/site/handover/share",
        fields: [
          { name: "siteId", label: "Site ID", type: "text", required: true },
          json("batchHcAccount", "batchHcAccount", '[{"hcAccount":"user@example.com","type":0}]'),
          json(
            "userSharePermission",
            "userSharePermission",
            '[{"deviceSerial":"ABC","otherPermissionDetails":[{"permission":1,"channelNo":["-1"]}]}]',
          ),
          { name: "remark", label: "Observación", type: "text", required: false },
        ],
      },
      {
        id: "site-customer-list",
        title: "Clientes de handover",
        description: "POST /api/hpcgw/v2/site/customer/list",
        method: "POST",
        path: "/api/hpcgw/v2/site/customer/list",
        fields: [{ name: "siteId", label: "Site ID", type: "text", required: true }],
      },
      {
        id: "site-customer-detail",
        title: "Detalle de cliente",
        description: "POST /api/hpcgw/v1/site/customer/detail",
        method: "POST",
        path: "/api/hpcgw/v1/site/customer/detail",
        fields: [
          { name: "siteId", label: "Site ID", type: "text", required: true },
          { name: "hcAccount", label: "Cuenta cliente", type: "text", required: true },
          { name: "type", label: "Tipo (0 email, 1 teléfono)", type: "number", placeholder: "0" },
        ],
      },
      {
        id: "site-customer-account",
        title: "Actualizar cuenta cliente",
        description: "POST /api/hpcgw/v1/site/customer/account/update",
        method: "POST",
        path: "/api/hpcgw/v1/site/customer/account/update",
        fields: [json("body", "Cuerpo JSON", '{"siteId":"","hcAccount":"","type":0}', true)],
        rawBody: true,
      },
      {
        id: "site-customer-devices",
        title: "Permisos de dispositivos del cliente",
        description: "POST /api/hpcgw/v1/site/customer/devices/update",
        method: "POST",
        path: "/api/hpcgw/v1/site/customer/devices/update",
        fields: [
          json(
            "body",
            "Cuerpo JSON",
            '{"siteId":"aaaaa","sharedHc":{"hcAccount":"user@example.com","type":0,"shareDevices":[]}}',
            true,
          ),
        ],
        rawBody: true,
      },
      {
        id: "site-customer-cancel",
        title: "Cancelar sharing de cliente",
        description: "POST /api/hpcgw/v1/site/customer/cancle (ortografía de la API)",
        method: "POST",
        path: "/api/hpcgw/v1/site/customer/cancle",
        dangerous: true,
        fields: [
          { name: "siteId", label: "Site ID", type: "text", required: true },
          { name: "hcAccount", label: "Cuenta", type: "text", required: true },
          { name: "type", label: "Tipo 0/1", type: "number", placeholder: "0" },
        ],
      },
      {
        id: "team-add",
        title: "Crear team site",
        description: "POST /api/hpcgw/v1/site/team/add — activa serverType o no se podrán añadir dispositivos.",
        method: "POST",
        path: "/api/hpcgw/v1/site/team/add",
        fields: [
          { name: "systemName", label: "Nombre", type: "text", required: true },
          { name: "timezone", label: "Timezone", type: "number", required: true, placeholder: "26" },
          { name: "syncTimezone", label: "Sync TZ (1/0)", type: "number", placeholder: "1" },
          json("serverType", "serverType", "[0,2]"),
          { name: "systemScene", label: "Escena", type: "number", placeholder: "9" },
          { name: "city", label: "Ciudad", type: "text" },
          { name: "state", label: "Estado", type: "text" },
          { name: "street", label: "Calle", type: "text" },
          { name: "location", label: "Dirección", type: "text" },
          { name: "description", label: "Descripción", type: "text" },
        ],
      },
      {
        id: "team-search",
        title: "Buscar team sites",
        description: "POST /api/hpcgw/v1/site/team/search",
        method: "POST",
        path: "/api/hpcgw/v1/site/team/search",
        fields: [
          { name: "search", label: "Búsqueda", type: "text" },
          { name: "page", label: "Página", type: "number", placeholder: "1" },
          { name: "pageSize", label: "Tamaño", type: "number", placeholder: "20" },
        ],
      },
      {
        id: "team-modify",
        title: "Editar team site",
        description: "POST /api/hpcgw/v1/site/team/{id}/modify",
        method: "POST",
        path: "/api/hpcgw/v1/site/team/{id}/modify",
        pathParams: ["id"],
        fields: [
          { name: "systemName", label: "Nombre", type: "text", required: true },
          { name: "timezone", label: "Timezone", type: "number" },
          { name: "description", label: "Descripción", type: "text" },
        ],
      },
      {
        id: "team-handover",
        title: "Handover team site",
        description: "POST /api/hpcgw/v1/site/team/handover",
        method: "POST",
        path: "/api/hpcgw/v1/site/team/handover",
        fields: [json("body", "Cuerpo JSON", '{"systemId":"","targetAccount":""}', true)],
        rawBody: true,
      },
      {
        id: "team-delete",
        title: "Eliminar team site",
        description: "POST /api/hpcgw/v1/site/team/{id}/delete",
        method: "POST",
        path: "/api/hpcgw/v1/site/team/{id}/delete",
        pathParams: ["id"],
        dangerous: true,
      },
    ],
  },
  {
    slug: "dispositivos",
    title: "Dispositivos",
    blurb: "Ciclo de vida: alta, listado (healthStatus), canales, cloud, PIN, firmware y wake-up solar.",
    ops: [
      {
        id: "dev-list",
        title: "Listar dispositivos",
        description: "POST /api/hpcgw/v1/device/list — incluye healthStatus, categoría y online.",
        method: "POST",
        path: "/api/hpcgw/v1/device/list",
        fields: [
          { name: "page", label: "Página", type: "number", placeholder: "1" },
          { name: "pageSize", label: "Tamaño", type: "number", placeholder: "20" },
          { name: "siteId", label: "Site ID", type: "text" },
          { name: "deviceSerial", label: "Serial", type: "text" },
        ],
      },
      {
        id: "dev-add",
        title: "Añadir dispositivos",
        description: "POST /api/hpcgw/v2/device/add",
        method: "POST",
        path: "/api/hpcgw/v2/device/add",
        fields: [
          { name: "siteId", label: "Site ID", type: "text", required: true },
          json("deviceList", "deviceList", '[{"deviceSerial":"abc","validateCode":"def","extendInfo":""}]'),
        ],
      },
      {
        id: "dev-update",
        title: "Editar dispositivo",
        description: "POST /api/hpcgw/v1/device/update",
        method: "POST",
        path: "/api/hpcgw/v1/device/update",
        fields: [
          { name: "deviceId", label: "Device ID", type: "text", required: true },
          { name: "deviceName", label: "Nombre", type: "text", required: true },
          { name: "extendInfo", label: "extendInfo", type: "text" },
        ],
      },
      {
        id: "dev-delete",
        title: "Eliminar dispositivo",
        description: "POST /api/hpcgw/v1/device/delete",
        method: "POST",
        path: "/api/hpcgw/v1/device/delete",
        dangerous: true,
        fields: [{ name: "id", label: "Device ID", type: "text", required: true }],
      },
      {
        id: "dev-cameras",
        title: "Canales / cámaras",
        description: "POST /api/hpcgw/v1/device/camera/list",
        method: "POST",
        path: "/api/hpcgw/v1/device/camera/list",
        fields: [{ name: "deviceSerial", label: "Serial", type: "text", required: true }],
      },
      {
        id: "dev-cloud",
        title: "Permiso cloud del usuario final",
        description: "POST /api/hpcgw/v1/device/cloud/enable",
        method: "POST",
        path: "/api/hpcgw/v1/device/cloud/enable",
        fields: [
          { name: "siteId", label: "Site ID", type: "text", required: true },
          { name: "cloudEnable", label: "Habilitar", type: "boolean" },
        ],
      },
      {
        id: "dev-pin",
        title: "Consultar PIN",
        description: "Máx. 100 consultas / dispositivo / 24 h.",
        method: "POST",
        path: "/api/hpcgw/v1/device/pincode/query",
        fields: [{ name: "deviceSerial", label: "Serial", type: "text", required: true }],
      },
      {
        id: "dev-up-state",
        title: "¿Hay firmware nuevo?",
        description: "POST /api/hpcgw/v1/device/upgrade/state",
        method: "POST",
        path: "/api/hpcgw/v1/device/upgrade/state",
        fields: [{ name: "deviceSerial", label: "Serial", type: "text", required: true }],
      },
      {
        id: "dev-upgrade",
        title: "Lanzar upgrade",
        description: "AX gen1: username/password. Otros paneles: pinCode.",
        method: "POST",
        path: "/api/hpcgw/v1/device/upgrade",
        dangerous: true,
        fields: [
          { name: "deviceSerial", label: "Serial", type: "text", required: true },
          { name: "pinCode", label: "PIN", type: "text" },
          { name: "username", label: "Usuario", type: "text" },
          { name: "password", label: "Password", type: "text" },
        ],
      },
      {
        id: "dev-up-progress",
        title: "Progreso de upgrade",
        description: "POST /api/hpcgw/v1/device/upgrade/progress",
        method: "POST",
        path: "/api/hpcgw/v1/device/upgrade/progress",
        fields: [{ name: "deviceSerial", label: "Serial", type: "text", required: true }],
      },
      {
        id: "dev-wakeup",
        title: "Despertar cámara solar",
        description: "POST /api/hpcgw/v1/device/camera/wakeUp",
        method: "POST",
        path: "/api/hpcgw/v1/device/camera/wakeUp",
        fields: [{ name: "deviceSerial", label: "Serial", type: "text", required: true }],
      },
    ],
  },
  {
    slug: "alarmas",
    title: "Eventos y alarmas",
    blurb: "Suscripción MQ, long-poll, ACK, fotos y armado/desarmado. Canal principal de prueba en Vercel.",
    ops: [
      {
        id: "mq-sub",
        title: "Suscribir / desuscribir",
        description: "subType 1=alta, 0=baja. subMode all | list.",
        method: "POST",
        path: "/api/hpcgw/v1/mq/subscribe",
        fields: [
          {
            name: "subType",
            label: "Acción de suscripción",
            type: "number",
            required: true,
            placeholder: "1",
            options: [
              { value: "1", label: "1 · Suscribir" },
              { value: "0", label: "0 · Cancelar suscripción" },
            ],
          },
          {
            name: "subMode",
            label: "Alcance",
            type: "text",
            required: true,
            placeholder: "all",
            options: [
              { value: "all", label: "all · Todos los dispositivos" },
              { value: "list", label: "list · Solo los seleccionados" },
            ],
          },
          {
            ...json("deviceSerialList", "Dispositivos (solo si alcance=list)", "[]", false),
            hint: "Elige uno o varios equipos desde el inventario. Se ignora cuando el alcance es all.",
          },
        ],
      },
      {
        id: "mq-msg",
        title: "Poll único de mensajes",
        description: "Long poll ~20 s. El muro automático está arriba en esta página.",
        method: "POST",
        path: "/api/hpcgw/v1/mq/messages",
      },
      {
        id: "mq-offset",
        title: "ACK (offset)",
        description: "Confirma batchId o se reenvía el lote.",
        method: "POST",
        path: "/api/hpcgw/v1/mq/offset",
        fields: [{ name: "batchId", label: "batchId", type: "text", required: true }],
      },
      {
        id: "alarm-pic",
        title: "URL de foto de alarma",
        description: "Para paths que empiezan por ISAPI_FILES.",
        method: "POST",
        path: "/api/hpcgw/v1/alarm/pictureurl",
        fields: [{ name: "filePath", label: "filePath", type: "textarea", required: true }],
      },
      {
        id: "def-set",
        title: "Armar / desarmar",
        description: "DEVICE_DEFENCE | MUTE_DEFENCE | DISARM",
        method: "POST",
        path: "/api/hpcgw/device/v1/defence/set",
        dangerous: true,
        fields: [
          {
            ...json("deviceSerials", "Dispositivos", "[]"),
            hint: "Selecciona uno o varios paneles compatibles.",
          },
          {
            name: "defenceMode",
            label: "Modo",
            type: "text",
            required: true,
            placeholder: "DEVICE_DEFENCE",
            options: [
              { value: "DEVICE_DEFENCE", label: "Armar" },
              { value: "MUTE_DEFENCE", label: "Armar en silencio" },
              { value: "DISARM", label: "Desarmar" },
            ],
          },
          { name: "waitResult", label: "Esperar resultado", type: "boolean" },
        ],
      },
      {
        id: "def-get",
        title: "Consultar defensa",
        description: "POST /api/hpcgw/device/v1/defence/get",
        method: "POST",
        path: "/api/hpcgw/device/v1/defence/get",
        fields: [{
          ...json("deviceSerials", "Dispositivos", "[]"),
          hint: "Selecciona uno o varios paneles para consultar su estado.",
        }],
      },
    ],
  },
  {
    slug: "webhook",
    title: "Webhook",
    blurb: "Configuración push HTTPS. Sin almacenamiento no hay inbox en vivo: usa el módulo de alarmas (MQ).",
    ops: [
      {
        id: "wh-query",
        title: "Consultar config",
        description: "POST /api/hpcgw/webhook/v1/config/query",
        method: "POST",
        path: "/api/hpcgw/webhook/v1/config/query",
      },
      {
        id: "wh-save",
        title: "Guardar config",
        description: "Callback HTTPS, timeout 5 s, 2xx. Puede cortar el polling MQ.",
        method: "POST",
        path: "/api/hpcgw/webhook/v1/config/save",
        dangerous: true,
        fields: [
          { name: "callbackUrl", label: "callbackUrl HTTPS", type: "text", required: true },
          { name: "retryTimes", label: "Reintentos", type: "number", placeholder: "3" },
          { name: "retryDelay", label: "Delay ms", type: "number", placeholder: "1000" },
          { name: "signSecret", label: "signSecret (8-32)", type: "text" },
        ],
      },
      {
        id: "wh-del",
        title: "Borrar config",
        description: "POST /api/hpcgw/webhook/v1/config/delete",
        method: "POST",
        path: "/api/hpcgw/webhook/v1/config/delete",
        dangerous: true,
      },
    ],
  },
  {
    slug: "arc",
    title: "ARC",
    blurb: "Servicio de central receptora. Usa ARC ID/Key (equivalen a API Key) en Conexión.",
    ops: [
      {
        id: "arc-list",
        title: "Dispositivos ARC",
        description: "POST /api/hpcgw/v1/arcservice/device/list",
        method: "POST",
        path: "/api/hpcgw/v1/arcservice/device/list",
        fields: [
          { name: "page", label: "Página", type: "number", placeholder: "1" },
          { name: "pageSize", label: "Tamaño", type: "number", placeholder: "20" },
        ],
      },
      {
        id: "arc-enable",
        title: "Habilitar ARC en dispositivo",
        description: "POST /api/hpcgw/v1/arcservice/device/enable",
        method: "POST",
        path: "/api/hpcgw/v1/arcservice/device/enable",
        fields: [json("body", "Cuerpo JSON", '{"deviceSerial":""}', true)],
        rawBody: true,
      },
      {
        id: "arc-disable",
        title: "Deshabilitar ARC",
        description: "POST /api/hpcgw/v1/arcservice/device/disable",
        method: "POST",
        path: "/api/hpcgw/v1/arcservice/device/disable",
        dangerous: true,
        fields: [json("body", "Cuerpo JSON", '{"deviceSerial":""}', true)],
        rawBody: true,
      },
      {
        id: "arc-events",
        title: "Tipos de evento ARC",
        description: "POST /api/hpcgw/v1/arcservice/event/type/update",
        method: "POST",
        path: "/api/hpcgw/v1/arcservice/event/type/update",
        fields: [json("body", "Cuerpo JSON", '{"deviceSerial":"","eventTypes":[]}', true)],
        rawBody: true,
      },
      {
        id: "arc-account",
        title: "Número de cuenta ARC",
        description: "POST /api/hpcgw/v1/arcservice/account/number/update",
        method: "POST",
        path: "/api/hpcgw/v1/arcservice/account/number/update",
        fields: [json("body", "Cuerpo JSON", '{"deviceSerial":"","accountNumber":""}', true)],
        rawBody: true,
      },
      {
        id: "arc-site",
        title: "Info de sitio ARC",
        description: "GET /api/hpcgw/v1/arcservice/site/{id}/info",
        method: "GET",
        path: "/api/hpcgw/v1/arcservice/site/{id}/info",
        pathParams: ["id"],
      },
    ],
  },
  {
    slug: "audio",
    title: "Audio (IP Speaker)",
    blurb: "Altavoces tipo 12 / subtipo 19. Sube MP3/WAV/AAC ≤ 10 MB, aplícalo y haz cut-in o TTS.",
    ops: [
      {
        id: "audio-add",
        title: "Aplicar audio al dispositivo",
        description: "Tras el upload de esta página.",
        method: "POST",
        path: "/api/hpcgw/v1/audio/file/add",
        fields: [
          { name: "deviceSerial", label: "Serial", type: "text", required: true },
          json(
            "customAudioInfo",
            "customAudioInfo",
            '{"customAudioName":"aviso","audioFileFormat":"mp3","customAudioURL":"","uuid":""}',
          ),
        ],
      },
      {
        id: "audio-list",
        title: "Listar audios del dispositivo",
        description: "POST /api/hpcgw/v1/audio/file/list/get",
        method: "POST",
        path: "/api/hpcgw/v1/audio/file/list/get",
        fields: [{ name: "deviceSerial", label: "Serial", type: "text", required: true }],
      },
      {
        id: "audio-del",
        title: "Borrar audios",
        description: "POST /api/hpcgw/v1/audio/file/del",
        method: "POST",
        path: "/api/hpcgw/v1/audio/file/del",
        dangerous: true,
        fields: [json("body", "Cuerpo JSON", '{"deviceSerial":"","customAudioIDList":[1]}', true)],
        rawBody: true,
      },
      {
        id: "audio-cut",
        title: "Cut-in / TTS",
        description: "POST /api/hpcgw/v1/audio/inter/cut",
        method: "POST",
        path: "/api/hpcgw/v1/audio/inter/cut",
        fields: [json(
          "body",
          "Cuerpo JSON",
          '{"deviceSerial":"","audioLevel":10,"enabled":true,"playMode":"order","audioVolume":80,"playAudioList":[{"audioSource":"customAudio","customAudioID":1}]}',
          true,
        )],
        rawBody: true,
      },
    ],
  },
  {
    slug: "vas",
    title: "VAS / salud",
    blurb: "El informe site/health/report se eliminó en 2.15.500. Queda activar el paquete O&M y el campo healthStatus.",
    ops: [
      {
        id: "vas-active",
        title: "Activar paquete health monitoring",
        description: "POST /api/hpcgw/v1/vas/opspack/active",
        method: "POST",
        path: "/api/hpcgw/v1/vas/opspack/active",
        fields: [json("body", "Cuerpo JSON", '{"deviceSerial":""}', true)],
        rawBody: true,
      },
    ],
  },
  {
    slug: "hotspare",
    title: "Hot spare",
    blurb: "Host y hasta 3 spares. Heartbeat cada minuto desde esta página (timer en el cliente).",
    ops: [
      {
        id: "hs-add",
        title: "Configurar host/spare",
        description: "type 0=host, 1-3=spares. Configura host primero.",
        method: "POST",
        path: "/api/hpcgw/v1/hotspare/add",
        fields: [
          { name: "uuid", label: "UUID", type: "text", required: true },
          { name: "type", label: "type", type: "number", required: true, placeholder: "0" },
        ],
      },
      {
        id: "hs-get",
        title: "Consultar hot spare",
        description: "POST /api/hpcgw/v1/hotspare/get",
        method: "POST",
        path: "/api/hpcgw/v1/hotspare/get",
      },
      {
        id: "hs-hb",
        title: "Heartbeat puntual",
        description: "El auto-heartbeat está arriba.",
        method: "POST",
        path: "/api/hpcgw/v1/hotspare/heartbeat",
        fields: [{ name: "uuid", label: "UUID", type: "text", required: true }],
      },
      {
        id: "hs-files",
        title: "Listar archivos backup",
        description: "POST /api/hpcgw/v1/hotspare/file/get",
        method: "POST",
        path: "/api/hpcgw/v1/hotspare/file/get",
      },
      {
        id: "hs-dl",
        title: "URL de descarga",
        description: "POST /api/hpcgw/v1/hotspare/file/downloadurl",
        method: "POST",
        path: "/api/hpcgw/v1/hotspare/file/downloadurl",
        fields: [{ name: "key", label: "key", type: "text", required: true }],
      },
      {
        id: "hs-file-del",
        title: "Borrar archivo backup",
        description: "POST /api/hpcgw/v1/hotspare/file/delete",
        method: "POST",
        path: "/api/hpcgw/v1/hotspare/file/delete",
        dangerous: true,
        fields: [{ name: "key", label: "key", type: "text", required: true }],
      },
      {
        id: "hs-del",
        title: "Borrar config hot spare",
        description: "deleteMode all | list",
        method: "POST",
        path: "/api/hpcgw/v1/hotspare/delete",
        dangerous: true,
        fields: [
          { name: "deleteMode", label: "deleteMode", type: "text", required: true, placeholder: "list" },
          json("list", "list de UUIDs", '["e7c0cee2-74a0-473f-802e-1afbb33d5303"]', false),
        ],
      },
    ],
  },
  {
    slug: "instaladores",
    title: "Instaladores",
    blurb: "Empleados de la cuenta. El installerId se usa al asignar managers de sitio.",
    ops: [
      {
        id: "inst-search",
        title: "Buscar instaladores",
        description: "POST /api/hpcgw/v1/installers/search",
        method: "POST",
        path: "/api/hpcgw/v1/installers/search",
        fields: [
          { name: "search", label: "Nombre / email / teléfono", type: "text" },
          { name: "page", label: "Página", type: "number", placeholder: "1" },
          { name: "pageSize", label: "Tamaño", type: "number", placeholder: "20" },
        ],
      },
    ],
  },
];

export function moduleBySlug(slug: string) {
  return modules.find((m) => m.slug === slug);
}
