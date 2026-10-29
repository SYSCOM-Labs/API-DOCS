> ← [Documentación Hik-Partner Pro](README.md) · [Apéndice A](APENDICE-A.md) · [Apéndice B](APENDICE-B.md) · [Apéndice C](APENDICE-C.md) · [OpenAPI Lab](demos/OpenAPI-Lab/README.md)

### 1.4 Historial de Actualizaciones

Traducción de la sección 1.2 *Update History* de la *Hik-Partner Pro OpenAPI Developer Guide V2.15.500*.

> **Notas:**
> - El PDF fecha la versión V2.15.500 en **agosto de 2026**, mientras que el nombre del archivo indica el **2026-09-04** (`Hik-Partner Pro OpenAPI Developer Guide_V2.15.500_20260904.pdf`). Aquí se respeta la fecha que declara el PDF.
> - Varias entradas antiguas hacen referencia a APIs que ya fueron retiradas; el PDF dejó esas referencias vacías. Cuando la ruta se puede identificar con la lista de APIs retiradas de V2.15.500, se indica junto con la versión en que se retiró. Cuando no es posible (APIs de personas y de cloud attendance), se marca como "(API retirada; el PDF ya no indica la ruta)".

#### V2.15.500 — Agosto 2026

1. Se retiraron 4 APIs relacionadas con el servicio de monitoreo de salud, la gestión de dispositivos y la gestión de video: `POST /api/hpcgw/v1/site/health/report`, `POST /api/hpcgw/v1/device/iot/ability/query`, `POST /api/hpcgw/v1/device/iot/add/result` y `POST /api/hpcgw/v1/video/by/time`.
2. Se actualizó el método para solicitar una API Key.
3. Se categorizó el módulo de Referencia de API.
4. Se agregó la descripción de capacidades de aplicaciones típicas como gestión de sitios, gestión de dispositivos, servicio ARC, servicios de valor agregado, audio y video, y gestión de instaladores.
5. Se agregaron tipos de dispositivo (`deviceCategory`) y subtipos de dispositivo (`deviceSubCategory`) en `POST /api/hpcgw/v1/device/list`.

#### V2.15.0 — Febrero 2026

1. Se retiraron la aplicación típica y las APIs de cloud attendance (asistencia en la nube).
2. Se agregó una API para crear un team site: `POST /api/hpcgw/v1/site/team/add`.
3. Se agregó una API para buscar team sites: `POST /api/hpcgw/v1/site/team/search`.
4. Se agregó una API para editar un team site: `POST /api/hpcgw/v1/site/team/{id}/modify`.
5. Se agregó una API para hacer el handover de un team site: `POST /api/hpcgw/v1/site/team/handover`.
6. Se agregó una API para eliminar un team site: `POST /api/hpcgw/v1/site/team/{id}/delete`.

#### V2.14.0 — Octubre 2025

1. Se agregó una aplicación típica: Envío de Mensajes por Webhook.
   - Se agregó una API para obtener la configuración de envío de mensajes: `POST /api/hpcgw/webhook/v1/config/query`.
   - Se agregó una API para guardar la configuración de envío de mensajes: `POST /api/hpcgw/webhook/v1/config/save`.
   - Se agregó una API para eliminar la configuración de envío de mensajes: `POST /api/hpcgw/webhook/v1/config/delete`.
2. Se eliminó el campo `picUrl` de los parámetros de respuesta de `POST /api/hpcgw/v1/device/camera/list`.
3. Se eliminó el campo `X-Username` de los parámetros de solicitud de `PUT /api/hpcgw/v2/device/transparent/otap/multi/prop/get`.
4. Se amplió el header de solicitud de `PUT /api/hpcgw/v2/device/transparent/otap/multi/prop/put`: se agregó el campo `X-UserType` (tipo de usuario de los dispositivos AX PRO).
5. Se amplió la información del evento CID `JSON_EventNotificationAlert_cidEvent`: se agregó el campo `standardCode` (código estándar del evento CID).

#### V2.13.0 — Mayo 2025

1. Se agregó una API para subir un archivo de audio: `POST /api/hpcgw/v1/audio/file/upload`.
2. Se agregó una API para aplicar el archivo de audio a un dispositivo: `POST /api/hpcgw/v1/audio/file/add`.
3. Se agregó una API para obtener los archivos de audio del dispositivo: `POST /api/hpcgw/v1/audio/file/list/get`.
4. Se agregó una API para eliminar archivos de audio: `POST /api/hpcgw/v1/audio/file/del`.
5. Se agregó una API para el cut-in de audio (inserción de audio) con un archivo: `POST /api/hpcgw/v1/audio/inter/cut`.
6. Se agregaron dos códigos de error: `VMS022554` (los recursos físicos no existen) y `VMS050034` (no se encontró el dispositivo vinculado). Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

#### V2.11.800 — Febrero 2025

1. Se ampliaron los parámetros de respuesta de `POST /api/hpcgw/v1/device/list`.
2. Se agregaron 11 APIs transmitidas mediante el protocolo OTAP: `GET/PUT/POST/DELETE /api/hpcgw/v2/device/transparent/{otap uri}`.
   - Obtener propiedad: `GET /api/hpcgw/v2/device/transparent/otap/prop`;
   - Configurar propiedad: `PUT /api/hpcgw/v2/device/transparent/otap/prop`;
   - Obtener propiedad directamente del dispositivo: `GET /api/hpcgw/v2/device/transparent/otap/direct`;
   - Configurar propiedad directamente en el dispositivo: `PUT /api/hpcgw/v2/device/transparent/otap/direct`;
   - Ejecutar operaciones en el dispositivo: `PUT /api/hpcgw/v2/device/transparent/otap/action`;
   - Buscar la definición del modelo de objeto: `POST /api/hpcgw/v2/device/transparent/otap/product/profile`;
   - Obtener propiedades en lote: `POST /api/hpcgw/v2/device/transparent/otap/multi/prop/get/by/shadow`;
   - Configurar propiedades en lote: `PUT /api/hpcgw/v2/device/transparent/otap/multi/prop/put/by/shadow`;
   - Obtener propiedades en lote directamente del dispositivo: `PUT /api/hpcgw/v2/device/transparent/otap/multi/prop/get`;
   - Configurar propiedades en lote directamente en el dispositivo: `PUT /api/hpcgw/v2/device/transparent/otap/multi/prop/put`;
   - Obtener datos de la lista OTAP: `GET /api/hpcgw/v2/device/transparent/api/service/device/otap/table/list?pageIndex=%s&pageSize=%s`.
3. Se agregaron 6 APIs relacionadas con dispositivos:
   - Buscar el código PIN del dispositivo: `POST /api/hpcgw/v1/device/pincode/query`;
   - Actualizar el firmware del dispositivo: `POST /api/hpcgw/v1/device/upgrade`;
   - Obtener el progreso de actualización del dispositivo: `POST /api/hpcgw/v1/device/upgrade/progress`;
   - Verificar si se admite la capacidad de agregar dispositivos de modelo de objeto: `POST /api/hpcgw/v1/device/iot/ability/query` — retirada en V2.15.500;
   - Buscar el estado de alta del dispositivo de modelo de objeto: `POST /api/hpcgw/v1/device/iot/add/result` — retirada en V2.15.500;
   - Despertar una cámara solar: `POST /api/hpcgw/v1/device/camera/wakeUp`.
4. APIs relacionadas con el servicio ARC:
   - Se ampliaron los parámetros de solicitud de `POST /api/hpcgw/v1/arcservice/device/list`;
   - Se agregó la API para editar la lista de eventos ARC del dispositivo: `POST /api/hpcgw/v1/arcservice/event/type/update`;
   - Se agregó la API para editar el número de cuenta del dispositivo: `POST /api/hpcgw/v1/arcservice/account/number/update`.
5. Se agregó la API para activar el paquete de mantenimiento (O&M) del dispositivo: `POST /api/hpcgw/v1/vas/opspack/active`.
6. Se ampliaron [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error), [A.4 Detalles de Eventos](APENDICE-A.md#a4-detalles-de-eventos), etc.

#### V2.0.0 — Marzo 2024

1. Se agregaron aplicaciones típicas para dispositivos hot spare: Hot Spare.
   - Se agregó el flujo de llamadas para las funciones del equipo principal: Flujo de Llamadas para Hot Spare (Principal);
   - Se agregó el flujo de llamadas para las funciones del equipo de respaldo: Flujo de Llamadas para Hot Spare (Respaldo).
2. Se agregaron APIs para operar dispositivos hot spare:
   - API para agregar y configurar un dispositivo hot spare: `POST /api/hpcgw/v1/hotspare/add`;
   - API para buscar la información de dispositivos hot spare: `POST /api/hpcgw/v1/hotspare/get`;
   - API para eliminar dispositivos hot spare: `POST /api/hpcgw/v1/hotspare/delete`;
   - API para verificar, mediante heartbeat (latido), si el equipo principal está desconectado: `POST /api/hpcgw/v1/hotspare/heartbeat`;
   - API para subir un archivo hot spare: `POST /api/hpcgw/v1/hotspare/file/upload`;
   - API para obtener la URL de descarga de un archivo hot spare: `POST /api/hpcgw/v1/hotspare/file/downloadurl`;
   - API para buscar los archivos hot spare subidos: `POST /api/hpcgw/v1/hotspare/file/get`;
   - API para eliminar un archivo hot spare: `POST /api/hpcgw/v1/hotspare/file/delete`.
3. Se agregaron códigos de estado/error para dispositivos hot spare (`LAP026338`, `LAP026339`, `LAP026341`, `LAP026342` y `LAP068001`). Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

#### V1.9 — Septiembre 2023

1. Se agregó una API para obtener la lista de administradores del sitio: `POST /api/hpcgw/v1/site/sitemanagers`.
2. Se agregó una API para hacer el handover de sitios por compartición: `POST /api/hpcgw/v2/site/handover/share`.
3. Se agregó una API para buscar la lista de usuarios finales del handover por compartición: `POST /api/hpcgw/v2/site/customer/list`.
4. Se agregó una API para buscar la información de un usuario final del handover por compartición: `POST /api/hpcgw/v1/site/customer/detail`.
5. Se agregó una API para modificar la información de la cuenta del usuario final: `POST /api/hpcgw/v1/site/customer/account/update`.
6. Se agregó una API para modificar los permisos de dispositivos de los usuarios finales: `POST /api/hpcgw/v1/site/customer/devices/update`.
7. Se agregó una API para cancelar la compartición con el usuario final: `POST /api/hpcgw/v1/site/customer/cancle`.
8. Se agregó una API para obtener el reporte de monitoreo de salud del sitio: `POST /api/hpcgw/v1/site/health/report` — retirada en V2.15.500.
9. Se agregó una API para obtener la información de archivos almacenados por tiempo: `POST /api/hpcgw/v1/video/by/time` — retirada en V2.15.500.
10. Se agregaron valores para el parámetro de respuesta `deviceSubCategory`: `POST /api/hpcgw/v1/device/list` y `POST /api/hpcgw/v1/arcservice/device/list`.
11. Se agregaron 4 códigos de error: `LAP008127`, `LAP064001`, `LAP064003` y `LAP064007`. Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

#### V1.8.2 — Julio 2023

1. Se actualizó la API para asignar un solo administrador del sitio, que ahora asigna varios administradores: `POST /api/hpcgw/v2/site/assign`. Se agregaron dos parámetros de solicitud, `installerPermissionTimes` y `expiredDurationTime`, y se amplió el mensaje de solicitud.

#### V1.8.1 — Junio 2023

1. Se amplió el mensaje de respuesta de la API `POST /api/hpcgw/v1/site/search`: se agregaron dos nodos, `siteDeliveryStatus` y `cloudEnable`.

#### V1.8.0 — Mayo 2023

1. Se agregó una API para buscar la lista de empleados: `POST /api/hpcgw/v1/installers/search`.
2. Se agregó una API para asignar el administrador del sitio: `POST /api/hpcgw/v2/site/assign`.
3. Se amplió el mensaje de solicitud de la API `GET/PUT/POST/DELETE /api/hpcgw/v1/device/transparent/{isapi uri}`: se agregó el nodo `X-Userlevel`.
4. Se agregó una API para habilitar/deshabilitar el permiso de operación de dispositivos de los usuarios finales: `POST /api/hpcgw/v1/device/cloud/enable`.
5. Se agregaron 2 códigos de error: `LAP008044` y `LAP008077`. Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).
6. Se agregó un mensaje con la información de alarma de dispositivo agregado: `JSON_EventNotificationAlert_deviceadded`.

#### V1.7.0 — Abril 2023

1. Se agregó una API para obtener el estado de actualización del dispositivo: `POST /api/hpcgw/v1/device/upgrade/state`.
2. Se agregó la opción de información de huella dactilar al parámetro de respuesta `subStatus` de una API de personas (API retirada; el PDF ya no indica la ruta).
3. APIs de sincronización de personas (API retirada; el PDF ya no indica la ruta):
   - Se agregó una API para sincronizar la información de personas del dispositivo a la plataforma;
   - Se agregó una API para buscar el progreso de sincronización de la información de personas;
   - Se agregó una API para buscar los detalles de sincronización de personas.
4. Se agregaron 2 códigos de error: `LAP020047` y `LAP030069`. Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

#### V1.6.0 — Noviembre 2022

1. Se actualizaron las notas sobre la aplicación típica de eventos y alarmas (ver la aplicación típica Eventos y Alarmas).
2. Se agregaron dos diagramas de flujo para aplicar información de personas al dispositivo y eliminarla del dispositivo, y se actualizaron las notas sobre la eliminación de personas (sección retirada; el PDF ya no indica la referencia).
3. Se ampliaron los mensajes de respuesta de las APIs `POST /api/hpcgw/v1/site/search` y `GET /api/hpcgw/v1/arcservice/site/{id}/info`: se agregaron nodos relacionados con la compartición de sitios.
4. Se agregaron dos APIs para compartir un sitio y cancelar la compartición: `POST /api/hpcgw/v1/site/share` y `POST /api/hpcgw/v1/site/share/cancel/{id}`.
5. Se agregaron notas sobre la aplicación de información de personas en dos APIs (API retirada; el PDF ya no indica la ruta).
6. Se amplió el mensaje de respuesta de una API de personas (API retirada; el PDF ya no indica la ruta): se agregaron dos nodos, `subStatus` y `error`, al nodo `deviceLists` de `personAuthorities` de `data`.
7. Se agregaron ocho códigos de error: `LAP008081`, `LAP008082`, `LAP008087`, `LAP008092`, `LAP008093`, `LAP008099`, `LAP008103` y `LAP008104`. Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

#### V1.5.0 — Septiembre 2022

1. Se cambió el nombre del producto de Hik-ProConnect a Hik-Partner Pro.
2. Se amplió el mensaje de respuesta de la API `POST /api/hpcgw/v1/mq/messages`: se agregó el subnodo `deviceSerial` (número de serie del dispositivo) al nodo `list` del nodo `data`.
3. Se amplió el mensaje de solicitud de dos APIs de personas (API retirada; el PDF ya no indica la ruta): se agregó el nodo `cardNo` (número de tarjeta).
4. Se agregó el código de error `LAP500007` (el número de llamadas excede el límite). Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).
5. Se agregó el tipo de evento `voiceTalkEvent` (evento de intercomunicación). Ver [A.4 Detalles de Eventos](APENDICE-A.md#a4-detalles-de-eventos).
6. Se amplió el mensaje de detalles del evento CID `JSON_EventNotificationAlert_cidEvent`: se agregaron tres subnodos a `CIDEvent`: `evttype` (tipo de evento), `isTalk` (si está en modo de audio bidireccional) y `media` (verificación de video doble).
7. Se amplió el mensaje de información de alarma de revisión de video `JSON_EventNotificationAlert_Linkage`:
   - Se agregó el nodo `media` (cámara derecha/izquierda);
   - Se agregaron dos subnodos al nodo `pictureList`: `id` (ID de la imagen) y `url` (URL para descargar la imagen).

#### V1.4.0 — Junio 2022

1. Se agregó el nodo `<channelID>` al nodo `<EventNotificationAlert version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">` de los mensajes `XML_EventNotificationAlert_regionEntrance` y `XML_EventNotificationAlert_regionExiting`.

#### V1.3.0 — Mayo 2022

1. Se agregó el nodo `temp` al nodo `CIDEvent`. Ver `JSON_EventNotificationAlert_cidEvent`.
2. Se agregó el nodo `deviceSerial` a `JSON_EventNotificationAlert_ACSEvent`.

#### V1.2.0 — Enero 2022

1. Se agregó una API para obtener la URL de descarga de una imagen relacionada con una alarma: `POST /api/hpcgw/v1/alarm/pictureurl`.
2. Se agregaron 46 códigos de error. Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

#### V1.1.0 — Diciembre 2021

1. Se agregaron las APIs del sistema de cloud attendance (asistencia en la nube) — retiradas en V2.15.0.
2. Se agregó un mensaje de alarma para eventos de control de acceso: `JSON_EventNotificationAlert_ACSEvent`.
3. Se agregaron URIs que se transmiten mediante `GET/PUT/POST/DELETE /api/hpcgw/v1/device/transparent/{isapi uri}`:
   - Buscar información de personas: `POST /ISAPI/AccessControl/UserInfo/Search?format=json`;
   - Buscar eventos de control de acceso: `POST /ISAPI/AccessControl/AcsEvent?format=json`;
   - Editar la información del dispositivo: `PUT /ISAPI/System/deviceInfo`;
   - Administrar todos los presets configurados: `POST /ISAPI/PTZCtrl/channels/<ID>/presets`;
   - Eliminar todos los presets: `DELETE /ISAPI/PTZCtrl/channels/<ID>/presets`;
   - Obtener un preset: `GET /ISAPI/PTZCtrl/channels/<ID>/presets/<ID>`;
   - Buscar el estado de las particiones según condiciones: `POST /ISAPI/SecurityCP/status/zones?format=json`;
   - Obtener o configurar los parámetros de hora del dispositivo: `PUT /ISAPI/System/time`;
   - Obtener o configurar todos los canales digitales: `PUT /ISAPI/ContentMgmt/InputProxy/channels`;
   - Crear canales digitales: `POST /ISAPI/ContentMgmt/InputProxy/channels`.

#### V1.0.0 — Agosto 2021

1. Documento nuevo.
---

### Laboratorio SYSCOM

#### V2.15.500 — base del laboratorio SYSCOM

Cubierto en el OpenAPI Lab:

- Token regional (`token/get` + `areaDomain`)
- Sitios, compartición, managers, handover, team sites
- Dispositivos, cámaras, nube, PIN, upgrade, wake-up
- MQ subscribe / messages / offset, pictureurl, defence
- Webhook config
- ARC
- Audio file + inter/cut (IP Speaker)
- VAS opspack
- Hot spare
- Installers search
- Reenvío ISAPI / OTAP

Retirado o fuera de REST (no implementar contra hpcgw):

- `site/health/report`
- `device/iot/ability/query` y `iot/add/result`
- `video/by/time`
- Cloud attendance
- Live / playback / two-way (HPNetSDK)

#### Laboratorio — septiembre 2026

1. Laboratorio Next.js con proxy de cookies `httpOnly` y formularios por módulo.
2. **Torre de control** (`/demo`): alcance todos/sitio, métricas, ranking, MQ, evidencia, export JSON/CSV.
3. Audio: selector de altavoces, volumen por barra en el payload de cut, playlist, stop, biblioteca al elegir equipo.
4. MQ compartido con unsubscribe al detener.
5. Paleta alineada a marca HikPartner (rojo de marca vs verde/ámbar/rojo semánticos).
