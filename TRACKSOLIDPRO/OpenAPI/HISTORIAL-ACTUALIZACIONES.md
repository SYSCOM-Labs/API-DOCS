> ← Volver a la [Documentación de la API (TrackSolid Pro OpenAPI)](README.md) · [Apéndice A](APENDICE-A.md)

## Historial de Actualizaciones

### V1.0 — Septiembre 2026

Publicación inicial de la guía de integración de la **Open API de TrackSolid Pro** para distribuidores e integradores (plataformas propias, CRM, ERP y aplicaciones a la medida). Basada en el *Open API Specification V2.7.14* de Shenzhen Jimi Software Co., Ltd. Incluye:

1. **Descripción general** de la plataforma y el modelo de integración (servidor del distribuidor → servidor de JIMI, endpoint único `/route/rest` con parámetro `method`).
2. **Conceptos clave** e identificadores (`appKey`/`appSecret`, `accessToken`/`refreshToken`, `target`, `imei`, `deviceGroupId`, `fence_id`, nodos regionales).
3. **Conexión y autenticación:** URL base por nodo (TS, TSP HK, TSP EU, TSP US), parámetros comunes, **firma MD5** paso a paso con ejemplo y código Java de referencia, ciclo de vida del token (60–7200 s) y renovación.
4. **Referencia de API** con los 53 métodos activos organizados en familias:
   - **Autenticación:** `jimi.oauth.token.get`, `jimi.oauth.token.refresh`
   - **Cuentas:** `jimi.user.child.list/create/del/move/update`, `jimi.open.device.bind/unbind`
   - **Dispositivos y grupos:** `jimi.user.device.list`, `jimi.track.device.detail`, `jimi.user.device.expiration.update`, `jimi.open.device.update`, `jimi.open.device.move`, `jimi.device.group.create/update/delete/list`
   - **Ubicación y recorridos:** `jimi.user.device.location.list`, `jimi.device.location.get`, `jimi.device.location.URL.share`, `jimi.device.track.list`, `jimi.device.location.getTagMsg`, `jimi.lbs.address.get`
   - **Reportes:** `jimi.device.track.mileage`, `jimi.device.alarm.list`, `jimi.open.platform.report.parking`, `jimi.open.device.rfid.list`, `jimi.open.platform.report.trips`, `jimi.open.platform.fence.duration`, `jimi.device.obd.list`, `jimi.device.obd.fault`
   - **Geocercas:** `jimi.open.device.fence.create/delete` (por dispositivo) y `jimi.open.platform.fence.create/update/delete/bind/list/detail` (de plataforma)
   - **Comandos:** `jimi.open.instruction.list/send/result/raw.send`, `jimi.device.meida.cmd.send`
   - **Multimedia y video:** `jimi.device.media.URL`, `jimi.device.live.page.url`, `jimi.device.history.file.list`, `jimi.device.history.cmd.send`, `jimi.device.jimi.media.URL`, `jimi.open.video.rtmp.url`
   - **Push servidor a servidor:** `jimi.push.device.alarm`, `jimi.open.instruction.raw.receive`
   - **Deprecadas:** `jimi.scooter.instruction.send`, `jimi.scooter.device.detail`
5. **Formato de respuesta y códigos:** estructura `{code, message, result, data}`, códigos generales (`-1`, `0`, `1XXX`, `1100`, `1112`, `1114`, `12001`–`12005`) y códigos por operación (cuentas 213–217, transferencias 218–220, geocercas 41001–41004, comandos 225–252).
6. **Ejemplo completo end-to-end** (token → listar dispositivos → ubicación → renovar token) con la cadena de firma detallada.
7. **Buenas prácticas**, **solución de problemas** y **checklist de integración**.
8. **Apéndice A** con diccionarios de datos (nodos, parámetros comunes, token, códigos, enumeraciones, límites y el catálogo completo de tipos de alarma numéricos y de plataforma).
9. **llms.txt** y **llms-full.txt** para agentes de IA.

> Documento educativo basado en el *Open API Specification V2.7.14*. Todos los valores son ficticios. Para parámetros y comportamientos exactos, consulta siempre el manual oficial (carpeta [docs/](./docs/)) que corresponda a tu versión y nodo.

---

## Historial del documento original (fabricante)

Versiones del *Open API Specification* de Shenzhen Jimi Software Co., Ltd.:

| Versión | Fecha | Autor | Cambios |
| ------- | ----- | ----- | ------- |
| V1.0 | 2017/03/29 | Yao Jianping | Liberación inicial |
| V1.1 | 2017/04/18 | Yao Jianping | Se modifican las descripciones de parámetros de las interfaces |
| V1.2 | 2017/04/27 | Yao Jianping | Se unifican las URL de las interfaces; se mejoran las descripciones de atributos de retorno; se agregan ejemplos de retorno |
| V1.2 | 2017/05/09 | Yao Jianping | Se agregan atributos de voltaje de alimentación externa en 7.8 y 7.9; se agrega tipo de API en el capítulo 6; se elimina la interfaz de push de alarmas; se agrega 7.17 |
| V1.3 | 2017/06/15 | Yao Jianping | Se modifica 7.5: se agregan `refreshToken` y `time` al JSON de retorno; se agrega 7.6 (renovar accessToken); se agrega 7.7 (crear subcuenta); se agrega 7.19 (mapa de ubicación de dispositivo) |
| V1.4 | 2017/07/20 | Yao Jianping | Se modifica 4: se agregan los códigos de error; se modifica 7.3: se agrega el parámetro general `v` (versión 0.9); se modifica 7.7: se agrega el atributo de tipo de usuario; se agrega transferencia de dispositivos en 7.20 |
| V1.5 | 2017-07-31 | Yao Jianping | Se agregan API 7.21, 7.22 y 7.23 |
| V1.6 | 2017-10-24 | Jeff Wang | Se mejora la legibilidad del documento |
| V1.6.1 | 2018-04-22 | Jeff Wang | Se agrega el campo `distance` a `jimi.device.location.get` |
| V1.6.2 | 2018-09-08 | Jeff Wang | Se agrega el parámetro `device_status` a `jimi.open.device.update` para habilitar/deshabilitar dispositivos |
| V1.6.3 | 2018-09-10 | Jeff Wang | Se agrega la interfaz `jimi.track.device.detail` |
| V1.6.4 | 2018-10-02 | Jeff Wang | Se agregan interfaces de crear y eliminar cuenta |
| V1.6.5 | 2018-12-06 | Jeff Wang | Se agrega la interfaz de URL para compartir ubicación; se agrega la interfaz de mover cuenta; se agregan campos adicionales a la interfaz de información de dispositivo; se agrega la interfaz de actualizar fecha de expiración de usuario |
| V1.6.6 | 2018-03-08 | Jeff Wang | Se agrega la interfaz de kilometraje |
| V1.6.7 | 2019-04-24 | Jeff Wang | Se agrega la URL de página de video en vivo DVR; se agrega la lista de alarmas |
| V2.1 | 2019-05-15 | Jeff Wang | Se agrega soporte de API para Scooter |
| V2.2 | 2019-06-20 | Jeff Wang | Se agregan interfaces de URL de foto y video de cámara |
| V2.3 | 2019-11-07 | Jeff Wang | Se agrega interfaz de envío/recepción de comandos crudos |
| V2.4 | 2020-02-11 | Zou Zeliang | Se agrega interfaz de instrucciones de foto o video de cámara |
| V2.5 | 2020-07-28 | dengjie | Se agrega la interfaz de URL RTMP de video |
| V2.5 | 2020-12-09 | chenkuan | Se agregan campos de temperatura y sensor de combustible a la interfaz de datos en tiempo real del dispositivo |
| V2.6 | 2021-01-28 | chenkuan | Se agrega la API 7.38 |
| V2.7 | 2021-04-09 | darcy | Se agregan atributos opcionales (`machineName`) de alias de modelo; interfaces modificadas: `jimi.user.device.list` (7.11) y `jimi.track.device.detail` (7.12) |
| V2.7.1 | 2022-07-04 | Lin Wen Jun | Se agrega la API `jimi.user.child.update` |
| V2.7.2 | 2023-01-10 | Li Qinye | Se agregan las API: 7.40 datos de estacionamiento/ralentí, 7.41 crear geocerca de plataforma, 7.42 editar geocerca de plataforma, 7.43 eliminar geocerca de plataforma, 7.44 dispositivos relacionados con geocerca. Se agrega el parámetro `currentMileage` a `jimi.track.device.detail` |
| V2.7.3 | 2023-02-15 | Li Qinye | APIs deprecadas: 7.33 enviar comando (dispositivo scooter), 7.34 obtener detalle de scooter |
| V2.7.4 | 2023-04-07 | Li Qinye | Se agrega la API 7.14 (ubicación de dispositivo(s)); se agregan los parámetros `gpsNum`, `currentMileage`, `trackerOil` |
| V2.7.5 | 2023-05-24 | Li Qinye | Se agrega la API 7.17 (datos de kilometraje de dispositivos); se agrega el parámetro `totalMileage` |
| V2.7.6 | 2023-07-20 | Li Qinye | Se agrega la API 7.45 (listar geocercas de plataforma de una cuenta) |
| V2.7.7 | 2024-04-17 | Li Qinye | Se agregan las API 7.46 (mover dispositivos) y 7.47 (información de reportes RFID) |
| V2.7.8 | 2024-06-07 | Li Qinye | Se actualizan algunos campos. Se agregan las API: 7.48 consultar información de una cerca, 7.49 vincular usuario de app, 7.50 desvincular usuario de app, 7.51 reporte de viajes de dispositivos, 7.52 datos de entrada y salida de geocerca |
| V2.7.9 | 2024-06-25 | Li Qinye | 7.18 obtener recorrido del dispositivo: se agregan los campos `mileage` y estado de ACC |
| V2.7.10 | 2024-08-01 | Li Qinye | Se agregan las API 7.53 (datos OBD de dispositivos) y 7.54 (fallas OBD de dispositivos) |
| V2.7.11 | 2024-08-13 | Li Qinye | 7.32 lista de alarmas de dispositivo: se agregan los campos `imeis`, `page_no`, `page_size` |
| V2.7.12 | 2024-12-05 | Li Qinye | 7.53 datos OBD: se agrega el campo `vin` |
| V2.7.13 | 2024-12-25 | Li Qinye | Se agrega la API 7.55 (ubicación de dispositivo TAG). 7.12 detalle de dispositivo / 7.14 ubicación de dispositivo(s): se agregan los campos `account` y `customerName` |
| V2.7.14 | 2025-01-08 | Chen HaiHong | Se agregan las API: 7.56 crear grupo de dispositivos, 7.57 editar grupo, 7.58 eliminar grupo, 7.59 listar grupos. Actualización de campos: 7.11 lista de dispositivos / 7.12 detalle de dispositivo agregan `deviceGroupId` y `deviceGroup`; 7.19 actualizar vehículo por IMEI agrega `deviceGroupId` |

> **Nota:** el PDF original registra la fecha de la V2.7.14 como «2024-01-08», pero esa entrada es posterior a V2.7.13 (2024-12-25) y el documento se generó el 2025-01-09; se interpreta como **2025-01-08**.

---

> ← Volver a la [Documentación de la API (TrackSolid Pro OpenAPI)](README.md) · [Apéndice A](APENDICE-A.md)
