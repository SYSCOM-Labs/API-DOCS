### 1.4 Historial de Actualizaciones

#### V2.15.0 — Febrero 2026

1. **Nueva aplicación típica:** Envío de Mensajes por Webhook
  - `POST /api/hccgw/webhook/v1/config/query` — Obtener configuración de envío de mensajes
  - `POST /api/hccgw/webhook/v1/config/save` — Guardar configuración de envío de mensajes
  - `POST /api/hccgw/webhook/v1/config/delete` — Eliminar configuración de envío de mensajes
2. **Nuevas APIs relacionadas con BI:**
  - `POST /api/hccgw/bi/v1/anpr/passing/record/search` — Buscar registros de vehículos en tránsito
  - `POST /api/hccgw/bi/v1/anpr/barrierGate/control` — Controlar barrera vehicular
  - `POST /api/hccgw/bi/v1/store/report/peopleflow` — Buscar datos de tráfico de clientes
3. **Nuevas APIs relacionadas con nivel de acceso:**
  - `POST /api/hccgw/acspm/v1/template/list` — Obtener lista de plantillas de horario
  - `POST /api/hccgw/acspm/v1/access/level/add` — Agregar nivel de acceso
  - `POST /api/hccgw/acspm/v1/access/level/update` — Editar nivel de acceso
  - `POST /api/hccgw/acspm/v1/access/level/{id}/delete` — Eliminar nivel de acceso
  - `POST /api/hccgw/acspm/v1/access/level/delete` — Eliminar niveles de acceso en lote
  - `POST /api/hccgw/acspm/v1/access/level/{id}/res/add` — Agregar recursos al nivel de acceso
  - `POST /api/hccgw/acspm/v1/access/level/{id}/res/delete` — Eliminar recursos del nivel de acceso
4. **Tipo de Alarma Extendido:** Se agregó evento de reconocimiento facial (código: `10018`)
5. `**AlarmFileExtendInfo` Extendido:** Se agregaron los campos `humanId`, `humanName`, `similarity`, `fileType`, `faceLibName`, `faceLibThreshold`
6. `**DataBean` Extendido:** Se agregó el objeto `flowRelatedInfo`

#### V2.14.0 — Octubre 2025

1. Se renombró el campo `areaID` → `areaId` en `POST /api/hccgw/resource/v1/devices/get`
2. Se cambió el tipo de dato de `areaID` a `string` en `POST /api/hccgw/alarm/v1/alarmlog`
3. Se agregó el tipo de protocolo HLS a `POST /api/hccgw/video/v1/live/address/get`
4. Se agregó tipo de búsqueda a `POST /api/hccgw/acs/v1/event/certificaterecords/search`
5. Nuevas APIs relacionadas con Personas:
  - `POST /api/hccgw/person/v1/groups/add` — Agregar departamento
  - `POST /api/hccgw/person/v1/groups/update` — Editar departamento
  - `POST /api/hccgw/person/v1/groups/delete` — Eliminar departamento
6. Se eliminaron las APIs V2 de suscripción a alarmas
7. Se agregaron Código de País/Región y Marca de Vehículo al diccionario de datos

#### V2.13.0 — Mayo 2025

1. `POST /api/hccgw/alarm/v1/voltagesetting/set` — Establecer umbral de batería baja para cámaras solares
2. `POST /api/hccgw/video/v1/video/device/wakeup` — Despertar cámara solar
3. **Nuevos Servicios de Mantenimiento:**
  - `POST /api/hccgw/maintain/v1/offline/info/list` — Buscar recursos sin conexión
  - `POST /api/hccgw/maintenance/v1/list/device/detail` — Obtener estado de mantenimiento de dispositivo

#### V2.11.800 — Febrero 2025

1. Servicios de Video Extendidos:
  - Ampliado `POST /api/hccgw/video/v1/live/address/get`
  - `POST /api/hccgw/video/v1/record/element/search` — Buscar segmentos de reproducción
  - `POST /api/hccgw/video/v1/video/save` — Activar grabación MP4
  - `POST /api/hccgw/video/v1/video/download/url` — Obtener URL de descarga de grabación
2. Nuevas APIs de Conductor para Monitoreo a Bordo (10 nuevas APIs):
  - Búsqueda en lote, agregar, editar, eliminar en lote conductores
  - Búsqueda en lote, agregar, editar, eliminar en lote grupos de conductores
  - Aplicar fotografías de rostro de conductor y consultar estado de distribución

#### V2.11.0 — Noviembre 2024

1. `POST /api/hccgw/proxy/v1/isapi/proxypass` — Transmisión transparente de protocolo ISAPI
2. `POST /api/hccgw/person/v1/persons/qrcode` — Obtener código QR de persona
3. `POST /api/hccgw/resource/v1/accstatus/search` — Obtener estado ACC del vehículo
4. Nuevas APIs V2 de Suscripción a Alarmas (eliminadas posteriormente en 2.14.0)

#### V6.2.1 — Abril 2024

1. Se amplió `AlarmMsg` con `ANPRInfo`, `PictureInfo`, `PlateRect`
2. Se agregaron Capacidades de Asistencia: `POST /api/hccgw/attendance/v1/report/totaltimecard/list`

#### V6.2.0 — Marzo 2024

1. Se ampliaron las Capacidades de Gestión de Personas (12 nuevas APIs)
2. Se ampliaron las Capacidades de Control de Acceso (6 nuevas APIs)
3. Se agregaron aplicaciones típicas: Agregar Residente, Actualizar Residente, Agregar Pase Temporal

#### V6.0.200 — Noviembre 2023

1. Se amplió la respuesta con `isEncrypted` para APIs de captura/miniatura

#### V1.2.1 — Marzo 2023

1. Se agregó límite de frecuencia de solicitudes (máximo 5 solicitudes/segundo)
2. Nuevas APIs para monitoreo a bordo, estado de entrada de alarma, proxy ISAPI, información de puertas

#### V1.2 — Diciembre 2022

Se agregaron servicios relacionados con mensajes, servicios de videoportero y servicios de control de acceso.

#### V1.1 — Agosto 2022

Lanzamiento inicial.
