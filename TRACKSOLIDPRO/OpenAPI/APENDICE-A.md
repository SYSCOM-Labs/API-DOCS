> ← Volver a la [Documentación de la API (TrackSolid Pro OpenAPI)](README.md) · [Historial de Actualizaciones](HISTORIAL-ACTUALIZACIONES.md)

# Apéndice A — Diccionarios de Datos

Referencia rápida de constantes, enumeraciones, códigos y límites de la **Open API de TrackSolid Pro V2.7.14**. Todos los valores provienen del *Open API Specification* oficial.

---

## A.1 Conexión y nodos regionales

| Nodo | URL base | Protocolo |
| ---- | -------- | --------- |
| TS | `http://open.10000track.com/route/rest` | HTTP |
| TSP HK (Hong Kong) | `https://hk-open.tracksolidpro.com/route/rest` | HTTPS |
| TSP EU (Europa) | `https://eu-open.tracksolidpro.com/route/rest` | HTTPS |
| TSP US (Estados Unidos) | `https://us-open.tracksolidpro.com/route/rest` | HTTPS |

| Aspecto | Valor |
| ------- | ----- |
| Método HTTP | `POST` (todas las interfaces) |
| Selección de interfaz | Parámetro común `method` |
| Codificación | UTF-8 |
| `Content-Type` | `application/json; charset=utf-8` por defecto |
| Zona horaria | UTC (GMT+0) |
| Formato de fecha/hora | `yyyy-MM-dd HH:mm:ss` |
| Formato de respuesta | JSON (`format=json`) |

---

## A.2 Parámetros comunes

| Parámetro | Tipo | Obligatorio | Descripción | Default |
| --------- | ---- | ----------- | ----------- | ------- |
| `method` | string | Sí | Nombre de la interfaz (`jimi.*`) | — |
| `timestamp` | string | Sí | `yyyy-MM-dd HH:mm:ss` en UTC, tolerancia ±10 min | — |
| `app_key` | string | Sí | appKey emitido por JIMI | — |
| `sign` | string | Sí | Firma MD5 (32 hex, mayúsculas) | — |
| `sign_method` | string | Opcional | Método de firma: `md5` | `md5` |
| `v` | string | Opcional | Versión: `0.9` (sin verificación de firma) · `1.0` (verifica firma) | `1.0` |
| `format` | string | Opcional | Formato de respuesta | `json` |

**Firma (`sign`)**: ordenar parámetros por nombre (comunes + privados, sin `sign` ni valores de tipo byte) → concatenar `nombre+valor` sin `=` ni comas → `MD5(appSecret + cadena + appSecret)` en UTF-8 → salida hexadecimal de 32 caracteres en **MAYÚSCULAS**.

---

## A.3 Token de acceso

| Aspecto | Valor |
| ------- | ----- |
| Obtención | `jimi.oauth.token.get` con `user_id` + `user_pwd_md5` (MD5 en minúsculas) |
| Renovación | `jimi.oauth.token.refresh` con `access_token` + `refresh_token` |
| Vigencia (`expires_in`) | 60–7200 segundos (~2 h típico) |
| Regla de uso | Almacenar localmente y reutilizar; no solicitar uno por petición (error `1006`) |

---

## A.4 Códigos de resultado generales

| code | Descripción |
| ---- | ----------- |
| `-1` | El sistema está ocupado |
| `0` | Éxito |
| `1001` | Error de parámetro (faltan obligatorios o formato erróneo); ver la descripción de cada interfaz |
| `1002` | Usuario/dispositivo ilegal (no pertenece a la cuenta ni a subcuentas propias) |
| `1003` | Operación repetida |
| `1004` | Acceso ilegal, ¡excepción de token! (token inválido o inexistente) |
| `1005` | Acceso ilegal, ¡el acceso de IP excede el límite! |
| `1006` | Acceso ilegal, ¡peticiones demasiado frecuentes! |
| `1007` | Acceso ilegal, ¡método de petición erróneo! |
| `1008` | Acceso ilegal, ¡entrada anormal! |
| `1100` | Excepción de negocio (reportes, geocercas de plataforma, bind/unbind, grupos) |
| `1112` | El dispositivo ya existe (transferencia de dispositivos) |
| `1114` | El nombre de la geocerca ya existe (geocercas de plataforma) |
| `12001` | Falló la creación de la cuenta de plataforma |
| `12002` | Falló la transferencia de dispositivo |
| `12003` | Falló la creación de la geocerca |
| `12004` | Falló la eliminación de la geocerca |
| `12005` | Falló el envío del comando |

---

## A.5 Códigos de error por operación

### Creación de cuenta

| Código | Descripción |
| ------ | ----------- |
| 213 | La cuenta ya existe |
| 214 | La cuenta no existe |
| 215 | Error de tipo de usuario: 1) tipo vacío; 2) tipo inexistente; 3) sin permiso para crear ese tipo de usuario |
| 217 | El usuario destino no existe |

### Transferencia de dispositivos

| Código | Descripción |
| ------ | ----------- |
| 218 | El usuario solo puede transferir/vender dispositivos a una subcuenta |
| 219 | La lista de IMEI es ilegal |
| 220 | El número de IMEI excede el límite |

### Geocercas (por dispositivo)

| Código | Descripción |
| ------ | ----------- |
| 41001 | Se excedió el número máximo de geocercas soportadas |
| 41002 | El nombre de la cerca ya existe |
| 41003 | El dispositivo no está en línea |
| 41004 | Falló la operación de geocerca |

### Comandos (también usados por multimedia e historia de video)

| Código | Descripción |
| ------ | ----------- |
| 225 | Timeout |
| 226 | Error de parámetro |
| 227 | El comando no se ejecutó correctamente |
| 228 | El dispositivo no está en línea |
| 229 | Error de red, error de conexión, etc. |
| 238 | Dispositivo interrumpido |
| 240 | Error de formato de datos |
| 243 | No soportado por el dispositivo |
| 252 | El dispositivo está ocupado |

### Vinculación de usuario de app (`jimi.open.device.bind` / `unbind`)

| Código | Descripción |
| ------ | ----------- |
| 0 | Correcto |
| 10 | bind: el dispositivo ya está vinculado a un usuario · unbind: el dispositivo no está vinculado a este usuario |
| 1001 | Parámetros ilegales |
| 1002 | Usuario o dispositivo incorrecto (ver `message`) |
| 1100 | Excepción de negocio |

---

## A.6 Enumeraciones y constantes

### Tipos de cuenta

**`type` (respuesta de `jimi.user.child.list`)**

| Valor | Descripción |
| ----- | ----------- |
| 3 | Usuario de app |
| 8 | Distribuidor |
| 9 | Usuario ordinario |
| 10 | Distribuidor ordinario |
| 11 | Ventas |

**`account_type` (parámetro de `jimi.user.child.create`)**

| Valor | Descripción |
| ----- | ----------- |
| 1 | Distribuidor |
| 2 | Usuario final |
| 3 | Ventas |

### Permisos de cuenta (`permissions`, 6 dígitos)

Cadena de 6 dígitos `0`/`1` (0 = deshabilitado, 1 = habilitado), en este orden:

| Posición | Permiso |
| -------- | ------- |
| 1 | Web Login |
| 2 | App Login |
| 3 | Send Command |
| 4 | Set Working Mode |
| 5 | Edit by Web |
| 6 | Edit by App |

Ejemplo: `111000` habilita Web Login, App Login y Send Command.

### Estado del dispositivo

| Campo | Valores |
| ----- | ------- |
| `status` (ubicación) | `0` offline · `1` online |
| `status` / `device_status` (detalle, update) | `0` deshabilitado · `1` habilitado |
| `enabledFlag` | `0` no disponible · `1` disponible |
| `activationFlag` | `0` no activado · `1` activado |
| `expireFlag` | `0` expirado · `1` no expirado |
| `accStatus` | `0`/`OFF` ACC apagado · `1`/`ON` ACC encendido |
| `ignition` | `ON` ACC ON · `OFF` ACC OFF |

### Tipo de posicionamiento

| Campo | Valores |
| ----- | ------- |
| `posType` (ubicación, string) | `GPS`, `LBS`, `WIFI`, `BEACON` |
| `posType` (track/video, numérico) | `1` GPS · `2` LBS · `3` WIFI |
| `positionType` (TAG) | `GPS`, `LBS`, `WIFI`, `BEACON` |

### Nivel de señal GSM (`gpsSignal`)

| Valor | Descripción |
| ----- | ----------- |
| 0 | Sin señal |
| 1 | Extremadamente débil |
| 2 | Débil |
| 3 | Fuerte |
| 4 | Extremadamente fuerte |

### Tipos de alarma de geocerca (`alert_type`)

| Valor | Descripción |
| ----- | ----------- |
| `in` | Entrar a la cerca |
| `out` | Salir de la cerca |
| `stayTimeIn` | No entrar a la cerca por más de N días (requiere `stay_time_in`) |
| `stayTimeOut` | No salir de la cerca por más de N días (requiere `stay_time_out`) |

Varios tipos se combinan separándolos por coma. En geocercas **por dispositivo** (`alarm_type`): `in` / `out` / `in,out`.

### Íconos de vehículo (`vehicle_icon` / `vehicleIcon`)

| Clave | Descripción | Clave | Descripción |
| ----- | ----------- | ----- | ----------- |
| `automobile` | Automóvil | `schoolBus` | Autobús escolar |
| `bus` | Autobús | `excavator` | Excavadora |
| `per` | Persona | `ship` | Barco |
| `mtc` | Motocicleta | `tricycle` | Triciclo |
| `truck` | Camión | `policeMtc` | Motocicleta de policía |
| `taxi` | Taxi | `tractor` | Tractor |
| `plane` | Avión | `policeCar` | Patrulla |
| `cow` | Vaca (ganado) | `other` | Otro |

### Multimedia (`camera`, `media_type` / `mediaType`)

| Campo | Valores |
| ----- | ------- |
| `camera` (solicitud) | `1` frontal · `2` interior · `3` ambas (con `mediaType=1`, solo `1` o `2`) |
| `camera` (respuesta) | `0` cámara frontal · `1` cámara interior |
| `media_type` / `mediaType` | `1` foto · `2` video · `3` ambos (en `jimi.device.meida.cmd.send` solo `1` o `2`) |
| `type` (`jimi.device.live.page.url`) | `1` video en tiempo real · `2` video histórico |
| `voice` | `0` sin audio · `1` con audio (default) |
| `type` (`jimi.device.history.file.list`) | `1` upload · `2` query |
| `type` (`jimi.device.history.cmd.send`) | `1` fragmento completo · `2` fragmento de evento |

### Reportes

| Campo | Valores |
| ----- | ------- |
| `acc_type` (`report.parking`) | `on` datos de ralentí (idling) · `off` datos de estacionamiento (parking) |
| `type` (`report.trips`) | `day` itinerario agrupado por día · `list` detalle de itinerarios |
| `cleanBindFlag` (`device.move`) | `1` limpiar datos · `0` no limpiar datos |
| `update_result` | `0` éxito · `1` fallo |
| `isExecute` (resultado de comando) | `0` ejecución fallida · `1` exitosa · `3` por enviar · `4` cancelado |
| `isOffLine` | `0` online · `1` offline |

---

## A.7 Límites y cuotas

| Operación | Límite |
| --------- | ------ |
| `jimi.device.location.get` (IMEI por llamada) | 100 |
| `jimi.device.alarm.list` (rango / filas / IMEI) | 1 mes / 1000 filas / 100 IMEI |
| `jimi.device.track.list` (rango) | Máximo 7 días, dentro de los últimos 3 meses; 1 IMEI por llamada |
| `jimi.open.device.rfid.list` (rango / IMEI / RFID) | 1 mes por llamada / 100 / 100 |
| `jimi.device.obd.list` y `jimi.device.obd.fault` (rango / IMEI) | 31 días por llamada / 100 |
| `jimi.lbs.address.get` (cuota) | 10 llamadas/día/dispositivo (total de dispositivos de la cuenta, incluye subcuentas) |
| `jimi.lbs.address.get` (grupos LBS) | Máximo 7 grupos `(mcc,mnc,lac,cell,rssi)` |
| Geocerca por dispositivo (`radius`) | 1–9999 (unidad: 100 m) |
| Geocerca de plataforma (`radius`) | 200–5000 m |
| Geocerca por dispositivo (`zoom_level`) | 3–19 |
| `jimi.open.platform.fence.list` (`page_size`) | 1–50 (default 10) |
| `jimi.user.child.create` (`account_id`) | 3–30 caracteres (`a-Z`, `0-9`, `_@.`) |

---

## A.8 Tipos de alarma (`alertTypeId`)

Las alarmas que el **dispositivo** reporta activamente usan un **ID numérico**; las alarmas generadas por **lógica de plataforma** usan **texto en inglés**.

### A.8.1 IDs numéricos (reportados por el dispositivo)

| ID | Alarma | ID | Alarma |
| -- | ------ | -- | ------ |
| 1 | SOS alert | 92 | Low Temperature Alert (terminal) |
| 2 | Power cut off alert | 100 | Cancel Notification for Temperature Alert |
| 3 | Vibration alert | 101 | Cancel Notification for Collision Alert |
| 4 | Enter geo-fence (terminal) | 113 | Increase in oil level |
| 5 | Exit geo-fence (terminal) | 114 | Install alert |
| 6 | Overspeed alert (terminal) | 115 | Oil Sense Timeout |
| 9 | Displacement alert (terminal) | 119 | High voltage at ADC1 |
| 10 | Enter GPS blind zone alert | 120 | Low voltage at ADC1 |
| 11 | Exit GPS blind zone alert | 126 | High humidity |
| 12 | Booting notification | 127 | Low humidity |
| 13 | GPS first fix notification | 128 | DVR vibration alert |
| 14 | Low external power alert | 135 | Overspeed alert (DVR) |
| 15 | Low power protection alert | 136 | Power off alert (DVR) |
| 16 | SIM card change alert | 138 | Immobilization ON |
| 17 | Power off alert | 139 | Immobilization OFF |
| 18 | Airplane mode after low power protection | 140 | Close eyes Alert |
| 19 | Disassembly alert | 141 | Switch Land Transport Mode Alarm |
| 20 | Door detection alert | 142 | Environmental Anomaly Alarm |
| 21 | Battery low power shutdown | 143 | Distraction Alert |
| 22 | Voice alarm | 144 | Sudden Acceleration Alert (DVR) |
| 24 | Cover Move Alert | 145 | Sudden Deceleration Alert (DVR) |
| 25 | Internal low battery alert | 146 | Sharp Turn Alert (DVR) |
| 28 | Door open alert | 147 | Collision Alert (DVR) |
| 29 | Door close alert | 148 | No Face Alert |
| 35 | Fall Alert | 149 | Switch Ocean Transport Mode Alarm |
| 36 | Plug in charger | 150 | Switch Static Transport Mode Alarm |
| 39 | Unauthorized Open Alert | 151 | Phone Calling Alert |
| 40 | Initiative Offline (Power Off) Alert | 154 | Smoking Alert |
| 41 | Sudden Acceleration Alert | 160 | Yawn Alert |
| 42 | Sharp Turn Left Alert | 163 | Head lowered |
| 43 | Sharp Turn Right Alert | 165 | RFID reporting event |
| 44 | Collision Alert | 168 | Engine failure |
| 45 | Vehicle Turn Over Alarm | 169 | Undervoltage |
| 48 | Sudden Deceleration Alert | 170 | Drinking |
| 50 | Device Pull Out Alarm | 171 | Light detected alert |
| 55 | Collision Alert | 172 | Bluetooth MAC searched |
| 58 | Cancel Notification for Unauthorized Open Alert | 173 | Bluetooth MAC lost |
| 71 | Fatigue driving alert | 191 | Device Plug-out Alert |
| 76 | Sharp turn alarm | 197 | Engine ON |
| 77 | Abrupt lane switching alarm | 198 | Engine OFF |
| 78 | Vehicle stability | 199 | Overtime driving alert |
| 79 | Vehicle angle abnormality | 202 | Overspeed warning |
| 80 | Door close alert | 203 | Overtime parking warning |
| 81 | Door open alert | 204 | Forward collision warning |
| 82 | Temperature Alert | 205 | Lane departure warning |
| 83 | Stealing oil alarm | 206 | Vehicle too close warning |
| 86 | Start charging | 207 | Pedestrian collision warning |
| 87 | Stop charging / remove charger | 208 | DMS fatigue warning |
| 89 | Full of reminders | 224 | Device Plug-in Alert |
| 90 | Low battery alert | 227 | Overheating |
| 91 | High Temperature Alert (terminal) | 230 | INPUT1 was activated |
| | | 231 | INPUT1 was deactivated |
| | | 232 | INPUT2 was activated |
| | | 233 | INPUT2 was deactivated |
| | | 254 | Ignition on |
| | | 256 | Fence entry alarm (Bluetooth) |
| | | 257 | Exit fence alarm (Bluetooth) |
| | | 258 | Fence entry alarm (WIFI) |
| | | 259 | Exit fence alarm (WIFI) |
| | | 260 | Long periods of stillness |
| | | 261 | Start exercise reminder |
| | | 262 | Stop exercise reminder |
| | | 263 | LTE Jamming Detected |
| | | 266 | LTE Jamming Ended |
| | | 267 | GPS Jamming Detected |
| | | 268 | GPS Jamming Ended |

### A.8.2 Tipos de texto (generados por plataforma)

| alertTypeId | Descripción | alertTypeId | Descripción |
| ----------- | ----------- | ----------- | ----------- |
| `ACC_OFF` | ACC OFF | `laneshift` | Route Deviation Alert |
| `ACC_ON` | ACC ON | `low_temp_alarm` | Low Temperature Alert (platform) |
| `burglarStatus_0` | Disarm | `mileageAlarm` | Maintenance alert |
| `burglarStatus_1` | Arm | `obd` | OBD alert |
| `burglarStatus_2` | Alert | `offline` | Offline alert |
| `carFault` | Vehicle fault alert | `other` | Other alerts |
| `displacementAlarm` | Night Driving Alert | `out` | Exit geo-fence |
| `DMSAlert` | DMS Alert | `overSpeed` | Overspeed alert (platform) |
| `drivingBehaviorAlert` | Driving Behavior Alert | `sensitiveAreasFence` | Sensitive areas fence |
| `drivingBehaviorAlertDVR` | Driving Behavior Alert (DVR) | `statusLeftFrontDoors_0` | Left front door close |
| `fenceOverspeed` | Fence Overspeed alert | `statusLeftFrontDoors_1` | Left front door open |
| `geozone` | Geo-fence alert | `statusLeftFrontWindows_0` | Left front window close |
| `high_temp_alarm` | High Temperature Alert (platform) | `statusLeftFrontWindows_1` | Left front window open |
| `in` | Enter geo-fence | `statusLeftRearWindows_0` | Left rear door close *(así en el original)* |
| `stayAlert` | Parking alert | `statusLeftRearWindows_1` | Left rear door open *(así en el original)* |
| `stayAlertOn` | Idling alert | `statusRightFrontDoors_0` | Right front door close |
| `stayTimeIn` | Long time not enter the Geo-fence | `statusRightFrontDoors_1` | Right front door open |
| `stayTimeOut` | Long time not exit the Geo-fence | `statusRightFrontWindows_0` | Right front window close |
| `ubiAcce` | Harsh acceleration | `statusRightFrontWindows_1` | Right front window open |
| `ubiColl` | Collision | `statusRightRearDoors_0` | Right rear door close |
| `ubiDece` | Harsh braking | `statusRightRearDoors_1` | Right rear door open |
| `ubiLane` | Sudden lane change | `statusRightRearWindows_0` | Right rear window close |
| `ubiRoll` | Rollover | `statusRightRearWindows_1` | Right rear window open |
| `ubiSatt` | Roll and pitch | `statusTrunk_0` | Trunk close |
| `ubiStab` | Skidding | `statusTrunk_1` | Trunk open |
| `ubiTurn` | Harsh cornering | | |

---

## A.9 Notas de fidelidad al manual oficial

Las siguientes particularidades del *Open API Specification V2.7.14* se transcriben tal cual; tenlas en cuenta al integrar:

1. **§7.42 (Edit platform Geo-fence):** el manual indica `method=jimi.open.platform.fence.create` (igual que la creación). Es un error de transcripción del fabricante; ver §4.6.4 del README.
2. **§7.30:** el método se escribe `jimi.device.meida.cmd.send` ("meida"), tal como aparece en el documento oficial.
3. **§7.49 / §7.50 (bind/unbind app user):** la descripción del parámetro `imei` dice "The account to which the geofences belong" en el original; el parámetro es el IMEI del dispositivo.
4. **§7.55 (TAG):** la descripción del campo `directions` dice "Number of satellites" en el original.
5. **Algunos mensajes `message` de éxito son genéricos** (p. ej. "Vehicle information modification successful" en operaciones que no son de vehículos). Valida siempre el `code`, no el texto.
6. **§7.51 (trips report):** el manual no incluye ejemplo de respuesta correcta (indica "暂缺", pendiente).

> ← Volver a la [Documentación de la API (TrackSolid Pro OpenAPI)](README.md) · [Historial de Actualizaciones](HISTORIAL-ACTUALIZACIONES.md)
