> ← Volver a la [Documentación de la API (Ruijie Cloud)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice A — Diccionarios de Datos

Tablas de referencia rápida para la API REST de Ruijie Cloud. Todos los valores son ficticios; los códigos y comportamientos exactos dependen de tu versión de la API y de la región de tu cuenta.

---

### A.1 Conexión

| Aspecto | Valor |
| ------- | ----- |
| URL base | `https://cloud-as.ruijienetworks.com` (varía según región) |
| Protocolo | HTTPS (RESTful) |
| Codificación | UTF-8 |
| `Content-Type` | `application/json` |
| Métodos HTTP | `GET`, `POST`, `PUT`, `DELETE` |
| Autenticación | `access_token` como parámetro de query en cada llamada |

---

### A.2 Endpoints por familia

| Familia | Acción | Método | Ruta |
| ------- | ------ | ------ | ---- |
| Auth/Cuenta | Obtener token | `POST` | `/service/api/oauth20/client/access_token` |
| | Refrescar token | `GET` | `/service/api/token/refresh` |
| | Info de cuenta | `GET` | `/service/api/org/account/info` |
| Grupos | Árbol de grupos | `GET` | `/service/api/group/single/tree` |
| | Crear grupo | `POST` | `/service/api/open/v1/group` |
| Dispositivos | Listar dispositivos | `GET` | `/service/api/maint/devices` |
| | Estado de dispositivo | `GET` | `/service/api/device/{sn}` |
| | CPU / memoria | `GET` | `/logbizagent/logbiz/api/sys/current_performance` |
| | Puertos de switch | `GET` | `/service/api/conf/switch/device/{sn}/ports` |
| | PoE por puerto | `GET` | `/service/api/conf/switch/device/{sn}/poe/info` |
| | PoE total | `GET` | `/service/api/conf/switch/device/{sn}/poe/pwr` |
| | Puertos de gateway | `GET` | `/service/api/gateway/intf/info/{sn}` |
| | Logs de eventos | `GET` | `/service/api/open/v1/dev/{sn}/devicemgtlogs` |
| | Tráfico 24 h | `POST` | `/logbizagent/logbiz/api/flow/show/hour` |
| WiFi | Crear/actualizar WiFi | `POST` | `/service/api/open/v1/wifi` |
| Usuarios/Vouchers | Grupos de usuarios | `GET` | `/service/api/intl/usergroup/list/{groupId}` |
| | Crear cuenta | `POST` | `/service/api/open/auth/account/create/{groupId}` |
| | Listar cuentas | `GET` | `/service/api/open/auth/account/getList/{groupId}` |
| | Actualizar cuenta | `POST` | `/service/api/open/auth/account/update/{groupId}` |
| | Eliminar cuenta | `DELETE` | `/service/api/open/auth/account/delete/{groupId}` |
| | Restablecer cuenta | `POST` | `/service/api/open/auth/account/reset/{groupId}` |
| | Resumen de estado | `GET` | `/service/api/open/auth/account/getStatusSummary/{groupId}` |
| | Crear vouchers | `POST` | `/service/api/open/auth/voucher/create/{groupId}` |
| | Voucher personalizado | `POST` | `/service/api/open/auth/voucher/customerCreate/{groupId}/{code}` |
| | Listar vouchers | `GET` | `/service/api/open/auth/voucher/getList/{groupId}` |
| Monitoreo | Clientes conectados | `GET` | `/service/api/open/v1/dev/user/current-user` |
| | Historial de clientes | `POST` | `/logbizagent/logbiz/api/sta/sta_users` |
| | Tráfico por aplicación | `GET` | `/service/api/open/v1/dev/eg/appflow/data-minute/appgroup` |
| | Tendencia tráfico de puerto | `GET` | `/service/api/open/v1/dev/peekflow/intf/trend` |

---

### A.3 Ciclo de vida del token

| Aspecto | Valor / comportamiento |
| ------- | ---------------------- |
| Token fijo de autenticación | `d63dss0a81e4415a889ac5b78fsc904a` (público, va en el query del endpoint de login; **no** es el `accessToken`) |
| Expiración absoluta | 30 días desde su creación |
| Expiración por inactividad | 30 minutos sin uso |
| Keep-alive recomendado | Una llamada al menos cada 25 minutos |
| Refresco | `GET /service/api/token/refresh?appid=&secret=&access_token=` |
| Token expirado (`code` 4) | El refresco no aplica: **reautenticar** con el POST de `access_token` |
| Refresh tokens OAuth2 estándar | No se usan |

---

### A.4 Convención de códigos de respuesta

Estructura de respuesta: `{ "code": <int>, "msg": <string>, "data": <objeto|lista> }`.

| Rango de `code` | Significado |
| --------------- | ----------- |
| `0` | Éxito. |
| Positivo (`> 0`) | Error de lógica de negocio. |
| `-50 ≤ code ≤ -1` | Error de autorización / verificación. |
| `code < -50` | Error interno del servidor. |

---

### A.5 Códigos de error

| `code` | Mensaje | Causa | Solución |
| ------ | ------- | ----- | -------- |
| `0` | `OK.` | Éxito | — |
| `1` | `Appid is invalid` | `appid` no válido | Verificar en el portal |
| `2` | `Parameter invalid` | Parámetros incorrectos | Revisar el formato |
| `3` | `Token is invalid` | Token mal formado | Solicitar uno nuevo |
| `4` | `Token is overdued` | Token expirado | Reautenticar |
| `5` | `Unauthorized` | Sin permisos | Verificar permisos |
| `7` | `Timeout` | Timeout del servidor | Reintentar con backoff |
| `25` | `running` | API en ejecución | Esperar y reintentar |
| `1009` | `Login failed` | Fallo de inicio de sesión | Verificar credenciales |
| `-1002` | `Internal error` | Error interno del servidor | Reportar a soporte |

---

### A.6 Modos de cifrado WiFi (`encryptionMode`)

| Modo | Descripción |
| ---- | ----------- |
| `open` | Abierta (sin contraseña). |
| `wpa-psk` | WPA Personal (legacy). |
| `wpa_wpa2-psk` | WPA/WPA2 mixto. ✅ Recomendado para compatibilidad. |
| `wpa2-psk` | Solo WPA2. |
| `wpa2-psk_wpa3-sae` | Transición WPA2 → WPA3. |
| `wpa3-sae` | Solo WPA3 (más seguro). |
| `owe` | Enhanced Open (OWE). |
| `Dot1x` | WPA2 Enterprise (802.1X / RADIUS). |
| `wpa2-ppsk` | Private Pre-Shared Key. |

---

### A.7 Jerarquía de grupos (`depth` / `type`)

| Nivel | Descripción |
| ----- | ----------- |
| `LOCATION` | Ubicación / región de nivel superior. |
| `BUILDING` | Sitio o edificio dentro de una ubicación. |
| `DEVICE` | Nivel de dispositivo dentro de un sitio. |

Jerarquía: `LOCATION → BUILDING → DEVICE`.

---

### A.8 Granularidad de datos de tráfico

| Rango consultado | Resolución de los puntos |
| ---------------- | ------------------------ |
| `< 2 días` | cada 5 minutos |
| `2 – 10 días` | cada 30 minutos |
| `> 10 días` | cada 2 horas |

---

### A.9 Límites y restricciones

| Límite | Valor |
| ------ | ----- |
| Vouchers por llamada | Máximo **500** (dividir en varias llamadas para más). |
| Tasa de llamadas sugerida | Evitar superar ~10–20 llamadas/segundo. |
| Backoff | Exponencial ante `code` 7 (`Timeout`). |
| Paginación | Obligatoria en todos los listados. |
| Tipos de dispositivo | Un `common_type` por llamada (`AP`, `Switch`, `Gateway`). |

---

### A.10 Campos de respuesta clave

**Estado de dispositivo (`device/{sn}`):**

| Campo | Descripción |
| ----- | ----------- |
| `onlineStatus` | `ON` \| `OFF` \| `NEVER_ONLINE`. |

**Rendimiento (`current_performance`):**

| Campo | Descripción |
| ----- | ----------- |
| `cpuRate` | Uso de CPU (%). |
| `memoryRate` | Uso de memoria (%). |
| `memoryFree` | Memoria libre. |
| `flashRate` | Uso de almacenamiento flash (%). |
| `flashFree` | Flash libre. |

**Clientes conectados (`current-user`):**

| Campo | Descripción |
| ----- | ----------- |
| `mac` / `ip` | Identidad de red del cliente. |
| `userName` | Usuario autenticado (si aplica). |
| `onlineTime` | Tiempo/inicio de conexión. |
| `flowUp` / `flowDown` | Tráfico de subida / bajada. |
| `rssi` | Nivel de señal. |
| `band` | Banda (2.4/5 GHz). |
| `ssid` | Red a la que está conectado. |
| `staOs` | Sistema operativo del cliente. |

**Vouchers:**

| Campo | Descripción |
| ----- | ----------- |
| `codeNo` | Código generado del voucher. |
| `expiryTime` | Fecha de expiración. |

---

### A.11 Glosario de identificadores

| Identificador | Descripción |
| ------------- | ----------- |
| `appid` | Identificador de la aplicación de terceros. |
| `secret` | Secreto de la aplicación (sensible). |
| `accessToken` / `access_token` | Token temporal de acceso. En la respuesta llega como `accessToken`; se envía en las llamadas como parámetro `access_token`. |
| `groupId` / `group_id` | Identificador de grupo/sitio. |
| `pGroupId` | Grupo padre al crear un grupo. |
| `sn` | Número de serie del dispositivo. |
| `common_type` | Tipo de dispositivo: `AP`, `Switch`, `Gateway`. |
| `ssidName` | Nombre de la red WiFi. |
| `relatedRadio` | Radios donde se emite el SSID (p. ej. `"1,2"`). |
| `userGroupId` | Grupo de usuarios para cuentas/vouchers. |
| `profile` | UUID del perfil de acceso aplicado a los vouchers. |
| `codeNo` | Código de un voucher. |
| `staType` | Tipo de consulta de clientes: `currentUser` \| `onofflineUserHistory`. |
| `intfName` / `intf_name` | Nombre de la interfaz/puerto (p. ej. `Gi0/1`). |

---

> ← Volver a la [Documentación de la API (Ruijie Cloud)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)
