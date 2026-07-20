> ← Volver a la [Documentación de la API (Hik DeviceGateway)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice A — Apéndices

Este apéndice reúne los diccionarios de datos, la descripción de los objetos JSON y los códigos de estado/error empleados por la API REST de **Hik DeviceGateway (HikGateway)**. Los nombres de campos, objetos y valores enumerados se conservan en inglés (tal como los devuelve el dispositivo) y se muestran en `código en línea`; las descripciones están en español.

Salvo que se indique lo contrario, todos los mensajes de solicitud y respuesta se transmiten en formato JSON (`?format=json`). Los nodos hoja (sin sub-nodos) usan `lowerCamelCase` y los nodos no hoja usan `UpperCamelCase`.

---

### A.1 Diccionario de Datos

#### A.1.1 Tipos de Protocolo (`protocolType`)

Protocolo mediante el cual el dispositivo se conecta al gateway. Se usa en `DeviceInList`, `SearchDescription` y `SearchResult`.

| Enumeración | Descripción |
| ----------- | ----------- |
| `ehome`     | ISUP (Intelligent Security Uplink Protocol), versión clásica. |
| `ehomeV5`   | ISUP 5.0. Requiere `EhomeKey`. Solo estos dispositivos admiten reproducción/descarga por tiempo. |
| `ISAPI`     | Intelligent Security API (conexión directa por IP/puerto con usuario y contraseña). |

> **Nota:** La guía V1.8.0 enumera únicamente estos tres valores para `protocolType`. Respete la grafía exacta (`ISAPI` en mayúsculas, `ehomeV5` en camelCase).

#### A.1.2 Tipos de Dispositivo

Existen dos campos distintos según el contexto:

**`devType`** — tipo de dispositivo al **agregarlo** (`DeviceInList`) o **filtrarlo** (`SearchDescription`).

| Enumeración     | Descripción                  |
| --------------- | ---------------------------- |
| `encodingDev`   | Dispositivo de codificación (cámara, NVR, DVR, etc.). |
| `AccessControl` | Dispositivo de control de acceso. |

**`deviceType`** — tipo **reportado** por el dispositivo (solo lectura, en `DeviceInfo`/`DeviceInfoList`/`SearchResult`).

| Enumeración | Descripción |
| ----------- | ----------- |
| `IPCamera`  | Cámara IP |
| `IPDome`    | Domo IP |
| `DVR`       | Videograbador digital |
| `HybirdNVR` | NVR híbrido |
| `NVR`       | Videograbador de red |
| `DVS`       | Servidor de video digital |
| `IPZoom`    | Cámara con zoom |
| `CVR`       | Grabador de video centralizado |
| `Gateway`   | Gateway |
| `SecurityCP`| Panel de control de seguridad |
| `ACS`       | Sistema de control de acceso |

#### A.1.3 Estado de Dispositivo (`devStatus`)

| Enumeración | Descripción |
| ----------- | ----------- |
| `online`    | En línea |
| `offline`   | Sin conexión |
| `sleep`     | En reposo (suspendido) |

> **Nota:** En `SearchResult`, cuando `devStatus` es `offline`, el campo `offlineHint` indica el motivo: `0` (esperando conexión al gateway), `1` (clave ISUP 5.0 incorrecta), `2` (versión ISUP no coincide), `3` (excepción de red).

#### A.1.4 Tipos de Stream y Métodos

**`streamType`** — tipo de flujo solicitado (`StreamInfo`).

| Enumeración | Descripción |
| ----------- | ----------- |
| `main`      | Flujo principal (main stream) |
| `sub`       | Flujo secundario (sub-stream) |
| `third`     | Tercer flujo |

**`method`** — modo de transmisión (`StreamInfo`).

| Enumeración   | Descripción |
| ------------- | ----------- |
| `preview`     | Vista en vivo (live view) |
| `playback`    | Reproducción |
| `twoWayAudio` | Audio bidireccional |

#### A.1.5 Comandos de Puerta (`cmd`)

Valores admitidos por el control remoto de puerta (`RemoteControlDoor`; capacidad declarada en `AccessControlCap`).

| Enumeración          | Descripción |
| -------------------- | ----------- |
| `open`               | Abrir la puerta |
| `close`              | Cerrar la puerta |
| `alwaysOpen`         | Mantener siempre abierta |
| `alwaysClose`        | Mantener siempre cerrada |
| `visitorCallLadder`  | Llamada de ascensor por visitante |
| `householdCallLadder`| Llamada de ascensor por residente |

#### A.1.6 Modos de Grabación

Se usa en `Track` (`DefaultRecordingMode`) y en las acciones de programación (`ActionRecordingMode`).

| Enumeración | Descripción |
| ----------- | ----------- |
| `CMR`       | Grabación continua (Continuous Mode Recording) |
| `MOTION`    | Grabación por detección de movimiento |
| `EDR`       | Grabación por evento (Event Driven Recording) |
| `NONE`      | Sin grabación |

#### A.1.7 Modos de Suscripción de Eventos

**Ámbito de suscripción — `eventMode` en `SubscribeDeviceMgmt`:**

| Enumeración | Descripción |
| ----------- | ----------- |
| `device`    | Armar (suscribir) dispositivos específicos indicados en `DevEventList`. |
| `all`       | Armar todos los dispositivos agregados. Con este valor, los dispositivos añadidos posteriormente se suscriben de forma automática. |

**Modo de carga de eventos — `uploadMode` (en `SubscribeDevEvent`) y `eventMode` (en `HttpHostNotificationList/SubscribeEvent`):**

| Enumeración | Descripción |
| ----------- | ----------- |
| `all`       | Cargar todos los eventos/alarmas del dispositivo. |
| `list`      | Cargar solo los tipos indicados en `minorEvent` (lista separada por comas). |

#### A.1.8 Tipos de Tarjeta (`cardType`)

| Enumeración      | Descripción |
| ---------------- | ----------- |
| `normalCard`     | Tarjeta normal (valor por defecto) |
| `patrolCard`     | Tarjeta de patrulla |
| `hijackCard`     | Tarjeta de coacción |
| `superCard`      | Tarjeta maestra (super) |
| `dismissingCard` | Tarjeta de descarte |
| `emergencyCard`  | Tarjeta de emergencia (asigna permiso temporal; no abre puerta) |

> **Nota:** En los eventos históricos (`AcsEvent`), `cardType` es un entero: `1`-normal, `2`-deshabilitada, `3`-lista de bloqueo, `4`-patrulla, `5`-coacción, `6`-super, `7`-visitante, `8`-descarte.

#### A.1.9 Tipos de Huella (`fingerType`)

| Enumeración    | Descripción |
| -------------- | ----------- |
| `normalFP`     | Huella normal |
| `hijackFP`     | Huella de coacción |
| `patrolFP`     | Huella de patrulla |
| `superFP`      | Huella maestra (super) |
| `dismissingFP` | Huella de descarte |

#### A.1.10 Tipos de Persona (`userType`)

| Enumeración | Descripción |
| ----------- | ----------- |
| `normal`    | Residente / persona normal (valor por defecto) |
| `visitor`   | Visitante |
| `blackList` | Persona en lista de bloqueo |

#### A.1.11 Tipos de Contenido y Metadatos de Búsqueda de Video

En `CMSearchDescription`/`CMSearchResult`, el `contentType` admite `video`. El `metadataDescriptor` identifica el tipo de grabación buscada:

| Enumeración (`metadataDescriptor`)              | Descripción |
| ----------------------------------------------- | ----------- |
| `recordType.meta.hikvision.com`                 | Todas las grabaciones de video |
| `recordType.meta.hikvision.com/CMR`             | Grabación continua (programada) |
| `recordType.meta.hikvision.com/MOTION`          | Detección de movimiento |
| `recordType.meta.hikvision.com/ALARM`           | Disparo por alarma |
| `recordType.meta.hikvision.com/EDR`             | Alarma o movimiento |
| `recordType.meta.hikvision.com/ALARMANDMOTION`  | Alarma y movimiento |

---

### A.2 Formato de Fecha/Hora

La API de Hik DeviceGateway adopta el estándar **ISO 8601** (`YYYY-MM-DDThh:mm:ss.sTZD`). El desfase horario (offset) puede indicarse de forma explícita, mediante `Z` (UTC) o expresarse como hora local del dispositivo.

| Valor | Ejemplo | Descripción |
| ----- | ------- | ----------- |
| Hora local del dispositivo | `2017-08-01T17:30:08` | Sin sufijo de zona; se interpreta como hora local (`timeType`: `local`). |
| Hora con offset (UTC) | `2017-08-01T17:30:08+08:00` | Fecha/hora con desfase respecto a UTC (`timeType`: `UTC`). |
| Hora en UTC (sufijo Z) | `2018-03-07T16:00:00Z` | Fecha/hora en UTC; la `Z` equivale a `+00:00`. |
| Ejemplo con offset cero | `2021-10-26T10:21:44+00:00` | Formato usado por el endpoint de ajuste de hora del dispositivo. |

**Cadena de zona horaria (TZ):** el endpoint de zona horaria (`/ISAPI/System/time/timeZone`) usa un formato de texto plano de tipo POSIX con reglas de horario de verano (DST):

| Valor | Ejemplo | Descripción |
| ----- | ------- | ----------- |
| Cadena TZ | `CST+0:00:00DST01:00:00,M5.3.0/02:00:00,M4.2.0/03:00:00` | Nombre de la zona, desfase estándar, y reglas de inicio/fin del horario de verano en formato `Mmes.semana.día/hora`. |

---

### A.3 Descripción de Objetos

> **Alcance:** El PDF oficial V1.8.0 define alrededor de 144 objetos JSON (Apéndice A del documento del fabricante). Aquí se documentan los más usados y sus campos principales. Los objetos `JSON_EventNotificationAlert_*` (A.31 a A.72 del PDF) son los payloads de notificación de eventos/alarmas específicos de cada dispositivo (detección de rostro, cruce de línea, GPS, ADAS, etc.) y **no se detallan en este apéndice**. Para el detalle exhaustivo de cualquier objeto consulte el PDF oficial en `docs/`.

#### Tabla general (resumen)

Objetos núcleo (excluye los ~42 payloads de evento `EventNotificationAlert_*`):

| Objeto | Descripción breve |
| ------ | ----------------- |
| `AccessControlCap` | Capacidad de control de acceso (límites y valores admitidos). |
| `AcsEvent` | Resultados de la búsqueda de eventos históricos de acceso. |
| `AcsEventCond` | Condiciones de búsqueda de eventos históricos de acceso. |
| `AcsWorkStatus` | Estado de trabajo del dispositivo de control de acceso. |
| `autoPanData` | Parámetros de paneo automático (velocidad de auto-escaneo). |
| `Cap_CaptureFingerPrint` | Capacidad de recolección de huella. |
| `Cap_FingerPrintCfg` | Capacidad de configuración de huella. |
| `Cap_FingerPrintDelete` | Capacidad de eliminación de huella. |
| `CaptureFingerPrint` | Datos de huella recolectada (Base64). |
| `CaptureFingerPrintCond` | Condiciones de recolección de huella. |
| `CardInfo` | Información de tarjeta. |
| `CardInfoCount` | Número total de tarjetas. |
| `CardInfoDelCond` | Condiciones para eliminar tarjetas. |
| `CardInfoSearch` | Resultados de búsqueda de tarjetas. |
| `CardInfoSearchCond` | Condiciones de búsqueda de tarjetas. |
| `CardReaderCfg` | Parámetros de un lector de huella y tarjeta. |
| `channelNameOverlay` | Superposición del nombre de canal (OSD). |
| `CMSearchDescription` | Condiciones de búsqueda de archivos de video (playback). |
| `CMSearchResult` | Resultados de búsqueda de archivos de video (playback). |
| `Color` | Parámetros de imagen (brillo, contraste, saturación, matiz). |
| `DateTimeOverlay` | Superposición de fecha/hora (OSD). |
| `DelDevList` | Lista de dispositivos a eliminar / resultado del borrado. |
| `DeviceInfo` | Información del dispositivo. |
| `DeviceInfoList` | Lista de información de dispositivos. |
| `DeviceInList` | Lista de parámetros de entrada al agregar dispositivos. |
| `DeviceOutList` | Lista de parámetros de salida al agregar dispositivos. |
| `DevIndexList` | Lista de índices (UUID) de dispositivos. |
| `DoorParam` | Parámetros de puerta. |
| `downloadRequest` | Solicitud de descarga de video (URI de playback). |
| `Edit_UserInfo` | Información de una persona (edición individual). |
| `Edit_DeviceInfo` | Información del dispositivo a editar. |
| `EventTrigger` | Configuración de disparador de evento. |
| `ErrorList` | Lista de errores. |
| `FaceInfo` | Información de rostro (admite carga de imagen binaria). |
| `FaceInfoCount` | Número de registros de rostro. |
| `FaceInfoDelCond` | Condiciones para eliminar registros de rostro. |
| `FaceInfoSearch` | Resultados de búsqueda de registros de rostro. |
| `FaceInfoSearchCond` | Condiciones de búsqueda de registros de rostro. |
| `FaceRecognizeMode` | Modo de reconocimiento facial. |
| `FingerPrintCfg` | Parámetros de huella. |
| `FingerPrintCond` | Condiciones de búsqueda de huella. |
| `FingerPrintDelete` | Condiciones para eliminar huella. |
| `FingerPrintDeleteProcess` | Progreso de eliminación de huella. |
| `FingerPrintInfo` | Resultados de búsqueda de huella. |
| `FingerPrintModify` | Parámetros de huella a editar. |
| `FingerPrintStatus` | Progreso de aplicación de parámetros de huella. |
| `FocusData` | Parámetros de enfoque. |
| `FPID` | Datos de imagen de rostro. |
| `HttpHostNotification` | Parámetros de un servidor de escucha de alarmas. |
| `HttpHostNotificationList` | Parámetros de todos los servidores de escucha de alarmas. |
| `IOPortData` | Información de entrada/salida de alarma. |
| `IOPortList` | Lista de entradas/salidas de alarma. |
| `IPAddress` | Información de dirección IP. |
| `IrisData` | Datos de iris. |
| `MaskInfo` | Información de imagen de rostro agregada. |
| `MediaAccessInfo` | URL de acceso al flujo de medios. |
| `MotionDetection` | Parámetros de detección de movimiento. |
| `MotionDetectionScheduleList` | Programación de detección de movimiento. |
| `NetworkInterface` | Información de interfaz de red. |
| `NetworkInterfaceList` | Lista de interfaces de red. |
| `PictureData` | Información de imagen capturada. |
| `PictureUploadData` | Imagen de rostro a agregar a la biblioteca de rostros. |
| `Position3D` | Posición 3D (control PTZ por coordenadas). |
| `PTZAux` | Funciones auxiliares PTZ. |
| `PTZData` | Datos de control PTZ (pan, tilt, zoom). |
| `PTZPreset` | Preajuste PTZ. |
| `RemoteControlDoor` | Parámetros de control remoto de puerta. |
| `ResponseStatus` | Información y estado de respuesta (ver A.4). |
| `ResponseStatus_AuthenticationFailed` | Respuesta devuelta al fallar la autenticación. |
| `Schedule` | Programación de alarma. |
| `SearchDescription` | Condiciones de búsqueda de la lista de canales/dispositivos. |
| `SearchResult` | Resultados de búsqueda de dispositivos. |
| `StreamInfo` | Solicitud de información de flujo. |
| `StreamingChannel` | Parámetros del canal de transmisión (codificación). |
| `SubscribeDevEvent` | Tipos de evento/alarma a suscribir de un dispositivo. |
| `SubscribeDeviceMgmt` | Condiciones de suscripción de eventos/alarmas. |
| `SubscribeDeviceMgmtRsp` | Resultado de la suscripción (ID de suscripción). |
| `SubscribeQueryStatusList` | Estado de las suscripciones. |
| `TamperDetection` | Parámetros de detección de sabotaje de video. |
| `TamperDetectionScheduleList` | Programación de detección de sabotaje. |
| `TextOverlay` | Superposición de texto (OSD). |
| `TextOverlayList` | Lista de superposiciones de texto. |
| `Time` | Parámetros de sincronización de hora. |
| `Track` | Programación de grabación (track). |
| `TrackList` | Lista de tracks de grabación. |
| `TwoWayAudioChannel` | Parámetros de un canal de audio bidireccional. |
| `UpgradeParams` | Parámetros de actualización del dispositivo. |
| `UserInfo` | Información de persona(s) (alta en lote, arreglo). |
| `UserInfoCount` | Cantidad de personas. |
| `UserInfoDetail` | Información de persona (modo de borrado). |
| `UserInfoDetailDeleteProcess` | Progreso de búsqueda o borrado de persona. |
| `UserInfoOutList` | Lista de resultados por persona (con código de estado). |
| `UserInfoSearch` | Resultados de búsqueda de detalles de persona. |
| `UserInfoSearchCond` | Condiciones de búsqueda de detalles de persona. |
| `UserRightHolidayGroupCfg` | Grupo de festivos de permisos de persona. |
| `UserRightHolidayPlanCfg` | Programa de festivos de permisos de persona. |
| `UserRightPlanTemplate` | Plantilla de programación de permisos de persona. |
| `UserRightWeekPlanCfg` | Programación semanal de permisos de persona. |
| `VideoInputChannel` | Parámetros del canal de entrada de video. |
| `VideoInputChannelLst` | Lista de canales de entrada de video. |
| `videolossScheduleList` | Programación de armado de pérdida de video. |
| `VideoOverlay` | Parámetros OSD. |

#### Objetos clave — detalle de campos

##### `DeviceInList` / `Device`

Parámetros para dar de alta uno o varios dispositivos (`/ISAPI/ContentMgmt/DeviceMgmt/addDevice`). `DeviceInList` es un arreglo de objetos `Device`.

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `protocolType` | string | Sí | Tipo de protocolo: `ehome` (ISUP), `ehomeV5` (ISUP 5.0), `ISAPI`. |
| `EhomeParams.EhomeID` | string | Dependiente | ID ISUP. Válido con `ehome`/`ehomeV5`. Máx. 31 caracteres. |
| `EhomeParams.EhomeKey` | string | Dependiente | Clave ISUP. Válido solo con `ehomeV5`. Máx. 32 bytes. |
| `ISAPIParams.addressingFormatType` | string | No | Tipo de dirección: `IPV4Address`. Válido con `ISAPI`. |
| `ISAPIParams.address` | string | Sí (ISAPI) | Dirección del dispositivo. |
| `ISAPIParams.portNo` | int | Sí (ISAPI) | Puerto del dispositivo. Rango `[1,65535]`. |
| `ISAPIParams.userName` | string | Sí (ISAPI) | Usuario. Máx. 32 caracteres. |
| `ISAPIParams.password` | string | Sí (ISAPI) | Contraseña. |
| `devName` | string | No | Nombre del dispositivo. Máx. 32 caracteres. |
| `devType` | string | Sí | Tipo: `encodingDev` (codificación), `AccessControl` (control de acceso). |

##### `DeviceInfo`

Información del dispositivo. La mayoría de los campos son de solo lectura y son inválidos al invocar la URL con método PUT.

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `deviceName` | string | Sí | Nombre del dispositivo. |
| `deviceID` | string | Sí (solo lectura) | Índice del dispositivo (UUID). |
| `deviceDescription` | string | No | Descripción. |
| `model` | string | Sí (solo lectura) | Modelo. |
| `serialNumber` | string | Sí (solo lectura) | Número de serie. |
| `macAddress` | string | Sí (solo lectura) | Dirección MAC. |
| `firmwareVersion` | string | Sí (solo lectura) | Versión de firmware. |
| `firmwareReleasedDate` | string | No (solo lectura) | Fecha de liberación del firmware. |
| `deviceType` | string | Sí (solo lectura) | Tipo reportado (ver A.1.2): `IPCamera`, `NVR`, `DVR`, `Gateway`, `ACS`, etc. |
| `bootVersion`, `hardwareVersion`, `encoderVersion`, `decoderVersion`, `softwareVersion` | string | No (solo lectura) | Versiones de arranque, hardware, codificador, decodificador y software. |
| `telecontrolID` | int | No (solo lectura) | Tipo de dispositivo digital. |
| `operationSystem` | string | No (solo lectura) | Información del sistema operativo. |
| `devType` | int | No (solo lectura) | Valor entero del tipo de dispositivo. |

##### `SearchDescription`

Condiciones de búsqueda de la lista de canales/dispositivos (`/ISAPI/ContentMgmt/DeviceMgmt/deviceList`).

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `position` | int | Sí | Índice de inicio; comienza en `0`. |
| `maxResult` | int | Sí | Máximo de resultados por búsqueda. |
| `Filter.key` | string | No | Búsqueda difusa (modelo / nombre / ID de cuenta). Máx. 64 bytes. |
| `Filter.devType` | string | No | `encodingDev`, `AccessControl`. |
| `Filter.protocolType` | string[] | Sí | Arreglo: `["ehome","ehomeV5","ISAPI"]`. |
| `Filter.devStatus` | string[] | No | Arreglo: `["online","offline","sleep"]`. |
| `Filter.ISAPIUserBound` | bool[] | No | Si el canal está vinculado a usuario ISAPI. |
| `Filter.ISAPIPortBound` | bool[] | No | Si el canal está vinculado a puerto ISAPI. |
| `Filter.EhomeParams.EhomeID` | string | No | Búsqueda por número de dispositivo (palabra completa). Máx. 31 bytes. |
| `Filter.devIndex` | string | No | Búsqueda por UUID del dispositivo (palabra completa). |

##### `CMSearchDescription`

Condiciones de búsqueda de archivos de video para reproducción (`/ISAPI/ContentMgmt/search`).

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `searchID` | string | Sí | ID de búsqueda (para acelerar búsquedas sucesivas del mismo solicitante). |
| `trackIDList[].trackID` | int | Sí | Canal + tipo de flujo, p. ej. `101` (main del canal 1), `202` (sub del canal 2). Solo el primer `trackID` surte efecto. |
| `timeSpanList[].timeSpan.startTime` | string | Sí | Hora de inicio del rango (ISO 8601). |
| `timeSpanList[].timeSpan.endTime` | string | Sí | Hora de fin del rango (ISO 8601). |
| `contentTypeList[].contentType` | string | No | Tipo de archivo: `video`. |
| `maxResults` | int | Sí | Máximo de respuestas; hasta `40`. |
| `searchResultPostion` | int | Sí | Posición del resultado (índice dinámico para la siguiente búsqueda). |
| `metadataList[].metadataDescriptor` | string | Sí | Tipo de grabación (ver A.1.11). |

##### `CMSearchResult`

Resultados de la búsqueda de archivos de video.

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `searchID` | string | Sí | ID de búsqueda. |
| `responseStatus` | bool | Sí | Si se devuelve el estado de respuesta. |
| `responseStatusStrg` | string | Sí | Detalle del estado: `OK`. |
| `numOfMatches` | int | Sí | Número de resultados coincidentes. |
| `matchList[].searchMatchItem.sourceID` | string | Sí | ID de origen. |
| `matchList[].searchMatchItem.trackID` | int | Sí | Canal + tipo de flujo. |
| `matchList[].searchMatchItem.timeSpan.startTime` / `.endTime` | string | Sí | Rango de tiempo del segmento. |
| `mediaSegmentDescriptor.contenType` | string | Sí | Tipo de archivo: `video`. |
| `mediaSegmentDescriptor.codecType` | string | Sí | Modo de codificación, p. ej. `MPEG4-SP`. |
| `mediaSegmentDescriptor.rateType` | string | No | Tasa de bits, p. ej. `3Mbps`. |
| `mediaSegmentDescriptor.playbackURI` | string | — | URI de reproducción (RTSP). |
| `mediaSegmentDescriptor.lockStatus` | string | No | Estado de bloqueo: `lock`, `unlock`. |
| `mediaSegmentDescriptor.remainLockTime` | int | — | Tiempo de bloqueo restante (válido si `lockStatus` = `lock`; `0` = permanente). |
| `metadataMatches.metadataDescriptor` | string | Sí | Descriptor de metadatos (ver A.1.11). |

##### `UserInfo` / `Edit_UserInfo`

Información de persona. `UserInfo` (alta) usa un **arreglo** `[{ ... }]`; `Edit_UserInfo` (edición) usa un **objeto** único `{ ... }`. Se muestran los campos del mensaje avanzado.

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `employeeNo` | string | Sí | ID de empleado (ID de persona). La longitud depende de la capacidad del dispositivo. |
| `name` | string | No | Nombre de la persona. |
| `userType` | string | No | `normal` (por defecto), `visitor`, `blackList`. |
| `Valid.enable` | bool | No | Habilitar periodo de vigencia: `false` (siempre vigente), `true` (por defecto). |
| `Valid.beginTime` | string | Sí | Inicio de la vigencia (ISO 8601). Mínimo `1970-01-01T00:00:00`. |
| `Valid.endTime` | string | Sí | Fin de la vigencia (ISO 8601). Máximo `2037-12-31T23:59:59`. |
| `Valid.timeType` | string | No | `local` (hora local del dispositivo), `UTC`. |
| `doorRight` | string | No | IDs de puerta/cerradura con permiso otorgado, separados por comas. Por defecto `1`. |
| `RightPlan[].doorNo` | int | No | ID de puerta/cerradura. Por defecto `1`. |
| `RightPlan[].planTemplateNo` | string | No | Número de plantilla de programación. Por defecto `1`. |
| `password` | string | No | Contraseña. |
| `localUIRight` | bool | No | Si la persona tiene permiso para la interfaz local del dispositivo. |

##### `CardInfo`

Información de tarjeta (mensaje avanzado).

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `employeeNo` | string | Sí | ID de empleado (ID de persona). |
| `cardNo` | string | Sí | Número de tarjeta. |
| `cardType` | string | No | `normalCard` (por defecto), `patrolCard`, `hijackCard`, `superCard`, `dismissingCard`, `emergencyCard`. Si el nodo no existe, se asume tarjeta normal. |

##### `AcsEventCond`

Condiciones de búsqueda de eventos históricos de acceso (`/ISAPI/AccessControl/AcsEvent`).

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `searchID` | string | Sí | ID de búsqueda. |
| `searchResultPosition` | int32 | Sí | Posición final del resultado en la lista (para paginar). |
| `maxResults` | int32 | Sí | Máximo de resultados (limitado por la capacidad del dispositivo). |
| `major` | int | No | Tipo mayor del evento (`0` = todos, por defecto). |
| `minor` | int | No | Tipo menor del evento (`0` = todos, por defecto). |
| `startTime` | string | No | Hora de inicio (UTC), p. ej. `2016-12-12T17:30:08+08:00`. |
| `endTime` | string | No | Hora de fin (UTC). |
| `cardNo` | string | No | Número de tarjeta. |
| `name` | string | No | Nombre del titular de la tarjeta. |
| `picEnable` | bool | No | Si el evento incluye imagen: `false` (no), `true` (sí). |
| `employeeNoString` | string | No | ID de empleado (ID de persona). |

> **Nota:** Los valores de `major`/`minor` se definen en el apéndice "Major & Minor Types of Access Control Event" del PDF oficial.

##### `AcsEvent`

Resultados de la búsqueda de eventos históricos de acceso.

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `searchID` | string | Sí | ID de búsqueda. |
| `responseStatusStrg` | string | Sí | Estado: `OK` (búsqueda finalizada), `MORE` (en curso), `NO MATCH` (sin coincidencias). |
| `numOfMatches` | int32 | Sí | Número de registros devueltos en esta consulta. |
| `totalMatches` | int32 | Sí | Total de registros coincidentes. |
| `deviceSerial` | string | No | Número de serie del dispositivo. |
| `MatchList[].major` | int | Sí | Tipo mayor del evento (`0` = todos). |
| `MatchList[].minor` | int | Sí | Tipo menor del evento (`0` = todos). |
| `MatchList[].time` | string | Sí | Fecha/hora del evento (UTC). |
| `MatchList[].cardNo` | string | No | Número de tarjeta. |
| `MatchList[].cardType` | int | No | Tipo de tarjeta (ver A.1.8). |
| `MatchList[].name` | string | No | Nombre del titular. |
| `MatchList[].employeeNoString` | string | No | ID de empleado (ID de persona). |
| `MatchList[].doorNo` | int | No | Número de puerta. |
| `MatchList[].pictureURL` | string | No | URL de la imagen asociada. |

> **Nota:** `MatchList` solo se devuelve cuando `totalMatches` es mayor que `0`. El objeto incluye numerosos campos opcionales adicionales (lector, canal, temperatura, mascarilla, etc.); consulte el PDF para el detalle completo.

##### `DoorParam`

Parámetros de puerta (`/ISAPI/AccessControl/Door/param/<doorID>`).

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `doorName` | string | No | Nombre de la puerta. |

##### `StreamInfo`

Solicitud de flujo de medios (`/ISAPI/System/streamMedia`).

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `id` | string | Sí | Número de canal de transmisión. |
| `streamType` | string | Sí | `main`, `sub`, `third`. |
| `method` | string | Sí | `preview`, `playback`, `twoWayAudio`. |
| `PlayBackParams.startTime` | string | Dependiente | Hora de inicio (ISO 8601). Válido solo con `method` = `playback`. |
| `PlayBackParams.endTime` | string | Dependiente | Hora de fin (ISO 8601). Válido solo con `method` = `playback`. |

> **Nota:** La respuesta a la solicitud de flujo devuelve `MediaAccessInfo.URL`, la URL (RTSP) por la cual se obtiene el flujo de medios.

---

### A.4 Códigos de Estado y Error

Toda operación por HTTP devuelve un objeto `ResponseStatus` (`JSON_ResponseStatus`). Cuando la operación es correcta, `statusCode` vale `1`. Cuando ocurre un error de URL sobre HTTP, se devuelve `ResponseStatus` con el código de error; si el error ocurre sobre RTSP, se devuelve directamente el código de estado correspondiente (RFC 2326). En operaciones por lotes, si algunas fallan, se devuelve tanto `ResponseStatus` como un mensaje con el detalle de las fallas.

#### Estructura de `ResponseStatus`

| Campo | Tipo | Requerido | Descripción |
| ----- | ---- | --------- | ----------- |
| `requestURL` | string | No | URL de la solicitud. |
| `statusCode` | int | Sí | Código de estado (ver tabla). `1` = correcto. |
| `statusString` | string | Sí | Descripción del estado. |
| `subStatusCode` | string | Sí | Sub-código de estado. |
| `errorCode` | int | Dependiente | Código de error correspondiente a `subStatusCode`. Requerido cuando `statusCode` ≠ `1`. |
| `errorMsg` | string | Dependiente | Descripción del error. Requerido cuando `statusCode` ≠ `1`. |
| `rebootRequired` | int | No | Si se requiere reinicio: `1` (sí, reiniciar para aplicar), otros valores (no). Puede omitirse si no aplica. |

#### Códigos de estado (`statusCode`)

La clasificación se basa en los códigos de estado de HTTP. Se predefinen 7 categorías; cada una contiene múltiples sub-códigos.

| `statusCode` | Descripción |
| ------------ | ----------- |
| `1` | OK (operación correcta) |
| `2` | Dispositivo ocupado (Device Busy) |
| `3` | Error de dispositivo (Device Error) |
| `4` | Operación inválida (Invalid Operation) |
| `5` | Formato de mensaje inválido (Invalid Message Format) |
| `6` | Contenido de mensaje inválido (Invalid Message Content) |
| `7` | Se requiere reinicio (Reboot Required) |

#### Sub-códigos de estado y códigos de error

Lista de `subStatusCode`/`errorCode` comunes (Apéndice D del PDF oficial). El `errorCode` se expresa en hexadecimal.

**`statusCode` = 1 (OK)**

| `subStatusCode` | `errorCode` | Descripción / Sugerencia |
| --------------- | ----------- | ------------------------ |
| `ok` | `0x1` | Operación completada. |
| `riskPassword` | `0x10000002` | Contraseña de riesgo (débil); se recomienda cambiarla. |

**`statusCode` = 2 (Dispositivo ocupado)**

| `subStatusCode` | `errorCode` | Descripción / Sugerencia |
| --------------- | ----------- | ------------------------ |
| `noMemory` | `0x20000001` | Memoria insuficiente; reintente más tarde. |
| `upgrading` | `0x20000003` | Dispositivo en actualización; espere a que finalice. |
| `networkError` | `0x20000009` | Error de red; verifique la conectividad. |

**`statusCode` = 3 (Error de dispositivo)**

| `subStatusCode` | `errorCode` | Descripción / Sugerencia |
| --------------- | ----------- | ------------------------ |
| `deviceError` | `0x30000001` | Error de hardware del dispositivo. |
| `createSocketError` | `0x30000004` | Fallo al crear el socket. |
| `sendRequestError` | `0x30000006` | Fallo al enviar la solicitud. |
| `passwordDecodeError` | `0x30000008` | Fallo al descifrar la contraseña. |
| `passwordEncryptError` | `0x30000009` | Fallo al cifrar la contraseña. |
| `pictureUploadFailed` | `0x3000000B` | Fallo al subir la imagen. |
| `uninitialized` | `0x3000000C` | No inicializado. |
| `connecteDatabaseError` | `0x3000000E` | Fallo al conectar con la base de datos. |
| `internalError` | `0x30000014` | Error interno. |

**`statusCode` = 4 (Operación inválida)**

| `subStatusCode` | `errorCode` | Descripción / Sugerencia |
| --------------- | ----------- | ------------------------ |
| `notSupport` | `0x40000001` | No soportado. |
| `lowPrivilege` | `0x40000002` | Sin permiso. |
| `badAuthorization` | `0x40000003` | Fallo de autenticación; verifique credenciales. |
| `methodNotAllowed` | `0x40000004` | Método HTTP inválido. |
| `notActivated` | `0x40000007` | Dispositivo no activado. |
| `hasActivated` | `0x40000008` | Dispositivo ya activado. |
| `invalidContent` | `0x4000000A` | Contenido de mensaje inválido. |
| `maxSessionUserLink` | `0x4000000B` | No pueden iniciar sesión más usuarios. |
| `loginPasswordError` | `0x4000000C` | Contraseña incorrecta. |
| `MgmtLokedError` | `0x4000000D` | Fallo al iniciar sesión en la plataforma; IP bloqueada. |
| `interfaceOperationError` | `0x40001002` | Operación fallida. |
| `openFileError` | `0x40001014` | Fallo al abrir el archivo. |
| `taskPacking` | `0x40001034` | El recurso ya está ocupado. |
| `taskNoRecFile` | `0x40001039` | El archivo de video no existe. |
| `updateLangUnmatched` | `0x40001042` | El idioma del paquete de actualización no coincide. |
| `userMaxNum` | `0x40001047` | No se pueden agregar más usuarios. |
| `monitorNodeOverLimit` | `0x4000104D` | No se pueden agregar más cámaras. |
| `deviceExist` | `0x40001054` | El dispositivo ya está agregado. |
| `pwdErrorLoginFailed` | `0x40001055` | Inicio de sesión fallido; verifique usuario y contraseña. |
| `setArmingError` | `0x40001083` | Fallo al configurar el armado. |
| `taskModifyFailed` | `0x400010B1` | Fallo al editar la tarea. |
| `getDeviceInfoFailed` | `0x400010BC` | Fallo al obtener la información del dispositivo. |
| `noDiskSpace` | `0x400010E6` | Espacio en disco insuficiente. |
| `cannotSameAsOldPassword` | `0x400010E8` | La nueva contraseña debe ser distinta de la anterior. |
| `originalPassError` | `0x400010E9` | Contraseña anterior incorrecta. |
| `writeFileError` | `0x400010EA` | Fallo al escribir el archivo. |
| `accessFileDirectoryFailed` | `0x40001104` | Fallo al acceder a la ruta del archivo. |
| `unKnownErrorCode` | `0x4000111D` | Código de error desconocido. |
| `deviceVervisionNotMatch` | `0x40001128` | La versión del dispositivo no coincide. |
| `theSessionIdDoesNotExist` | `0x40001135` | El ID de sesión no existe. |
| `theCameraIdDoesNotExist` | `0x40001137` | El ID de cámara no existe. |
| `theDeviceIdDoesNotExist` | `0x4000113B` | El ID de dispositivo no existe. |
| `gettingResourceNodeInformationFailed` | `0x40001176` | Fallo al obtener la información del nodo de recurso. |
| `noMoreTasksCanBeAdded` | `0x4000118A` | No se pueden agregar más tareas. |
| `theZoneAlreadyExists` | `0x40001388` | La zona ya existe. |
| `thePartitionAlreadyExists` | `0x40001389` | La partición (área) ya existe. |
| `thePartitionRelatedZone` | `0x4000138A` | La partición está vinculada a zonas; cancele la vinculación para eliminarla. |

**`statusCode` = 5 (Formato de mensaje inválido)**

| `subStatusCode` | `errorCode` | Descripción / Sugerencia |
| --------------- | ----------- | ------------------------ |
| `badJsonFormat` | `0x50000002` | Formato JSON inválido. |
| `badURLFormat` | `0x50000003` | Formato de URL inválido. |

**`statusCode` = 6 (Contenido de mensaje inválido)**

| `subStatusCode` | `errorCode` | Descripción / Sugerencia |
| --------------- | ----------- | ------------------------ |
| `badParameters` | `0x60000001` | Parámetro incorrecto. |
| `badXmlContent` | `0x60000003` | Contenido XML incorrecto. |
| `badPort` | `0x6000000B` | Conflicto de número de puerto. |
| `portError` | `0x6000000C` | Número de puerto inválido. |
| `badVersion` | `0x6000000F` | La versión no coincide. |
| `requestMemoryNULL` | `0x6000003F` | No se solicitó memoria. |
| `tokenTimeout` | `0x600000040` | El token expiró. |
| `passworLlenNoMoreThan16` | `0x6000005F` | La contraseña admite hasta 16 caracteres. |
| `eventCodeExist` | `0x60000060` | El código de evento ya existe. |
| `diskError` | `0x60001009` | Error de disco duro. |

**`statusCode` = 7 (Se requiere reinicio)**

| `subStatusCode` | `errorCode` | Descripción / Sugerencia |
| --------------- | ----------- | ------------------------ |
| `rebootRequired` | `0x70000001` | Reinicie el dispositivo para aplicar los cambios. |

> **Notas:**
> - Algunos errores propios del alta/borrado por lotes se devuelven como `subStatusCode` dentro de `DeviceOutList`/`DelDevList`: `badParameters` (parámetros incorrectos), `monitorNodeOverLimit` (no caben más dispositivos), `noMemory` (memoria insuficiente), `deviceExist` (el dispositivo ya existe) y `theDeviceIdDoesNotExist` (el ID no existe).
> - Al cambiar el modo de reconocimiento facial (`FaceRecognizeMode`) es necesario reiniciar; de lo contrario se devuelve `errorCode` `7` con `subStatusCode` `autoReboot`.

#### Respuesta al fallar la autenticación (`ResponseStatus_AuthenticationFailed`)

Cuando la autenticación falla, el objeto `ResponseStatus` incorpora campos adicionales de bloqueo:

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `lockStatus` | string | Estado de bloqueo: `unlock`, `lock`. |
| `retryTimes` | int | Intentos de autenticación restantes. |
| `resLockTime` | int | Tiempo de bloqueo restante (segundos). |

Ejemplo:

```json
{
    "requestURL": "/ISAPI/Streaming/channels/1",
    "statusCode": 4,
    "statusString": "Invalid Operation",
    "subStatusCode": "badAuthorization",
    "errorCode": 1073741827,
    "errorMsg": "authentication failed",
    "lockStatus": "unlock",
    "retryTimes": 5,
    "resLockTime": 30
}
```

> **Nota:** `errorCode` `1073741827` es la representación decimal de `0x40000003`.
