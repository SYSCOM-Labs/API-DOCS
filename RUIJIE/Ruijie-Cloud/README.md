# Ruijie Cloud — API REST de gestión de redes en la nube

> Versión del documento: V1.0 — Julio 2026  
> Producto: Ruijie Cloud (plataforma de gestión de redes de Ruijie/Reyee)  
> Basado en: *Ruijie Cloud API Reference Manual V2.0.3*

---

## Información Legal

- Esta es una **guía de referencia e integración**. Muestra cómo conectar una plataforma de terceros (MSP, CRM, ERP o una aplicación propia) con **Ruijie Cloud** usando su API REST para gestionar dispositivos, redes WiFi, usuarios, vouchers y monitoreo de tráfico.
- **Todos los valores del documento son ficticios** — `appid`, `secret`, tokens, seriales (`sn`), IDs de grupo, SSID y contraseñas sirven únicamente para ilustrar el formato de las peticiones. Adáptalos a tu propia cuenta e instalación.
- El esquema de seguridad, los nombres exactos de parámetros y los comportamientos varían según la **versión de la API y la región de tu cuenta**. Para valores y comportamientos definitivos, **consulta siempre el manual oficial (*Ruijie Cloud API Reference Manual*) que corresponda a tu versión**.
- El producto se proporciona "TAL CUAL". En ningún caso Ruijie Networks ni SYSCOM serán responsables de daños especiales, consecuentes, incidentales o indirectos derivados del uso de esta documentación.

---

## Tabla de Contenidos

- [Capítulo 1 — Descripción General](#capítulo-1--descripción-general)
- [Capítulo 2 — Conceptos Clave](#capítulo-2--conceptos-clave)
- [Capítulo 3 — Conexión y Autenticación](#capítulo-3--conexión-y-autenticación)
- [Capítulo 4 — Referencia de API](#capítulo-4--referencia-de-api)
- [Capítulo 5 — Formato de Respuesta y Códigos](#capítulo-5--formato-de-respuesta-y-códigos)
- [Capítulo 6 — Ejemplo Completo End-to-End](#capítulo-6--ejemplo-completo-end-to-end)
- [Capítulo 7 — Buenas Prácticas](#capítulo-7--buenas-prácticas)
- [Capítulo 8 — Solución de Problemas](#capítulo-8--solución-de-problemas)
- [Capítulo 9 — Checklist de Integración](#capítulo-9--checklist-de-integración)
- [Apéndice A — Diccionarios de Datos](./APENDICE-A.md)
- [Historial de Actualizaciones](./HISTORIAL-ACTUALIZACIONES.md)

---

## Capítulo 1 — Descripción General

### 1.1 ¿Qué es y para qué sirve?

**Ruijie Cloud** es la plataforma de gestión de redes en la nube de Ruijie Networks (incluye la línea **Reyee** para PyME). Desde un solo panel administra switches, puntos de acceso (AP) WiFi, gateways y routers desplegados en múltiples sitios, con provisión *zero-touch*, monitoreo, autenticación de usuarios y portales cautivos.

La **API REST de Ruijie Cloud** expone esas mismas capacidades para que una plataforma de terceros —un MSP que administra redes de muchos clientes, un CRM/ERP, o una aplicación a la medida— se integre con el ecosistema sin usar la interfaz web.

### 1.2 Capacidades de la API

La API te permite, entre otras cosas:

- Consultar la **jerarquía de grupos** (sitios) y **crear** nuevos grupos.
- Listar **dispositivos** (AP, Switch, Gateway) y consultar su **estado, CPU/memoria, puertos, PoE** y logs de eventos.
- **Crear y actualizar redes WiFi** (SSID, cifrado, radios).
- Gestionar **cuentas de usuario y vouchers** para portales cautivos (crear, listar, actualizar, eliminar, restablecer).
- Consultar **clientes conectados**, historial de conexiones y **tráfico** por dispositivo, puerto y aplicación.

### 1.3 Modelo de integración

La integración es **petición REST sobre HTTPS** con cuerpo JSON. El flujo es:

1. **Autenticarse** con `appid` + `secret` para obtener un `accessToken`.
2. **Incluir `access_token`** como parámetro de query en cada llamada posterior.
3. **Mantener vivo** el token (llamadas periódicas) o reautenticar cuando expire.

```
 ┌──────────────┐   1. POST access_token (appid+secret)   ┌───────────────────┐
 │  Tu sistema  │ ───────────────────────────────────────►│    Ruijie Cloud   │
 │ (MSP/ERP/…)  │ ◄─────────────────────────────────────── │  cloud-as.ruijie… │
 └──────────────┘   2. accessToken → llamadas con token    └───────────────────┘
```

---

## Capítulo 2 — Conceptos Clave

| Concepto | Identificador | Descripción |
| -------- | ------------- | ----------- |
| **Aplicación** | `appid` / `secret` | Credenciales de la app de terceros. El `secret` es sensible: nunca lo expongas. |
| **Token de acceso** | `accessToken` / `access_token` | Credencial temporal que autoriza cada llamada. Viaja como parámetro de query. |
| **Grupo / Sitio** | `groupId` / `group_id` | Nodo de la jerarquía de red. La jerarquía es `LOCATION → BUILDING → DEVICE`. |
| **Dispositivo** | `sn` | Número de serie de un AP, Switch o Gateway. Es la clave para consultar estado, puertos, PoE, etc. |
| **Tipo de dispositivo** | `common_type` | `AP`, `Switch` o `Gateway`. No se pueden listar todos los tipos en una sola llamada. |
| **WiFi / SSID** | `ssidName` | Red inalámbrica publicada por los AP de un grupo. |
| **Cuenta / Voucher** | `codeNo` | Credenciales de acceso para portal cautivo (usuario o cupón de un solo uso). |

> **Nota:** consulta el glosario completo de identificadores, enumeraciones y códigos en el [Apéndice A](./APENDICE-A.md).

---

## Capítulo 3 — Conexión y Autenticación

### 3.1 URL base y formato

Todas las llamadas se hacen sobre HTTPS contra la URL base:

```
https://cloud-as.ruijienetworks.com
```

| Aspecto | Valor |
| ------- | ----- |
| Protocolo | HTTPS (RESTful) |
| Codificación | UTF-8 |
| `Content-Type` | `application/json` |
| Métodos HTTP | `GET`, `POST`, `PUT`, `DELETE` |

> **Nota regional.** La URL base puede variar según la región/datacenter donde esté registrada tu cuenta. Confirma el host correcto en tu portal de Ruijie Cloud antes de integrar.

### 3.2 Obtener el token de acceso

Autentícate enviando tu `appid` y `secret` en el cuerpo. La URL lleva un **token fijo público** (`token=...`) que **no** debe confundirse con el `accessToken` que recibes en la respuesta.

```bash
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/oauth20/client/access_token?token=d63dss0a81e4415a889ac5b78fsc904a' \
  -H 'Content-Type: application/json' \
  -d '{
    "appid": "TuAppId123",
    "secret": "TuSecret456"
  }'
```

Respuesta:

```json
{
  "code": 0,
  "msg": "OK.",
  "accessToken": "jJVmxTfIVok7D0ol5z9Q6oCMkHJPEERl"
}
```

> **Notas:**
> - El parámetro de query `token=d63dss0a81e4415a889ac5b78fsc904a` es un valor **fijo y público** requerido por el endpoint de autenticación. El **`accessToken` de la respuesta** es tu credencial real.
> - Ruijie Cloud **no** usa *refresh tokens* separados como el OAuth2 estándar.

### 3.3 Usar el token en cada llamada

Incluye el token como parámetro de query `access_token={token}` en **todas** las solicitudes posteriores:

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/org/account/info?access_token=jJVmxTfIVok7D0ol5z9Q6oCMkHJPEERl'
```

### 3.4 Ciclo de vida y refresco del token

| Aspecto | Comportamiento |
| ------- | -------------- |
| **Expiración** | 30 días desde su creación **o** 30 minutos de inactividad (lo que ocurra primero). |
| **Keep-alive** | Haz al menos una llamada cada **25 minutos** para conservar la vigencia por inactividad. |
| **Refresco** | `GET /service/api/token/refresh?appid={appid}&secret={secret}&access_token={token}`. |
| **Token expirado (`code` 4)** | El refresco **no** aplica: debes **reautenticarte** con el endpoint POST de §3.2. |

```bash
# Refrescar (mientras el token siga vigente)
curl 'https://cloud-as.ruijienetworks.com/service/api/token/refresh?appid=TuAppId123&secret=TuSecret456&access_token=jJVmxTfIVok7D0ol5z9Q6oCMkHJPEERl'
```

---

## Capítulo 4 — Referencia de API

> En todos los ejemplos el `access_token` viaja como parámetro de query. Los valores (`sn`, `groupId`, tokens, SSID…) son ficticios.

### 4.0 Índice de endpoints

| Familia | Acción | Método | Ruta |
| ------- | ------ | ------ | ---- |
| **Auth/Cuenta** | Obtener token | `POST` | `/service/api/oauth20/client/access_token` |
| | Refrescar token | `GET` | `/service/api/token/refresh` |
| | Info de cuenta | `GET` | `/service/api/org/account/info` |
| **Grupos** | Árbol de grupos | `GET` | `/service/api/group/single/tree` |
| | Crear grupo | `POST` | `/service/api/open/v1/group` |
| **Dispositivos** | Listar dispositivos | `GET` | `/service/api/maint/devices` |
| | Estado de dispositivo | `GET` | `/service/api/device/{sn}` |
| | CPU / memoria | `GET` | `/logbizagent/logbiz/api/sys/current_performance` |
| | Puertos de switch | `GET` | `/service/api/conf/switch/device/{sn}/ports` |
| | Info PoE (por puerto) | `GET` | `/service/api/conf/switch/device/{sn}/poe/info` |
| | Consumo PoE (total) | `GET` | `/service/api/conf/switch/device/{sn}/poe/pwr` |
| | Puertos de gateway | `GET` | `/service/api/gateway/intf/info/{sn}` |
| | Logs de eventos | `GET` | `/service/api/open/v1/dev/{sn}/devicemgtlogs` |
| | Tráfico 24 h | `POST` | `/logbizagent/logbiz/api/flow/show/hour` |
| **WiFi** | Crear/actualizar WiFi | `POST` | `/service/api/open/v1/wifi` |
| **Usuarios/Vouchers** | Listar grupos de usuarios | `GET` | `/service/api/intl/usergroup/list/{groupId}` |
| | Crear cuenta | `POST` | `/service/api/open/auth/account/create/{groupId}` |
| | Listar cuentas | `GET` | `/service/api/open/auth/account/getList/{groupId}` |
| | Actualizar cuenta | `POST` | `/service/api/open/auth/account/update/{groupId}` |
| | Eliminar cuenta | `DELETE` | `/service/api/open/auth/account/delete/{groupId}` |
| | Restablecer cuenta | `POST` | `/service/api/open/auth/account/reset/{groupId}` |
| | Resumen de estado | `GET` | `/service/api/open/auth/account/getStatusSummary/{groupId}` |
| | Crear vouchers | `POST` | `/service/api/open/auth/voucher/create/{groupId}` |
| | Voucher personalizado | `POST` | `/service/api/open/auth/voucher/customerCreate/{groupId}/{code}` |
| | Listar vouchers | `GET` | `/service/api/open/auth/voucher/getList/{groupId}` |
| **Monitoreo** | Clientes conectados | `GET` | `/service/api/open/v1/dev/user/current-user` |
| | Historial de clientes | `POST` | `/logbizagent/logbiz/api/sta/sta_users` |
| | Tráfico por aplicación | `GET` | `/service/api/open/v1/dev/eg/appflow/data-minute/appgroup` |
| | Tendencia tráfico de puerto | `GET` | `/service/api/open/v1/dev/peekflow/intf/trend` |

---

### 4.1 Cuenta — `org/account/info`

Devuelve la información de la cuenta/organización asociada al token.

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/org/account/info?access_token={token}'
```

---

### 4.2 Grupos

#### Árbol de grupos — `group/single/tree`

Devuelve la jerarquía de grupos hasta la profundidad indicada. `depth` acepta `LOCATION`, `BUILDING` o `DEVICE`.

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/group/single/tree?depth=BUILDING&access_token={token}'
```

#### Crear grupo — `open/v1/group`

```bash
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/open/v1/group?access_token={token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "pGroupId": 9391895,
    "name": "Sucursal_Norte",
    "type": "BUILDING",
    "timezone": "America/Mexico_City",
    "description": "Red WiFi Sucursal Norte",
    "latitude": 19.4326,
    "longitude": -99.1332,
    "businessType": "ENET"
  }'
```

| Campo | Descripción |
| ----- | ----------- |
| `pGroupId` | ID del grupo padre bajo el cual se crea. |
| `name` | Nombre del grupo. |
| `type` | Nivel en la jerarquía: `LOCATION`, `BUILDING` o `DEVICE`. |
| `timezone` | Zona horaria IANA (p. ej. `America/Mexico_City`). |
| `latitude` / `longitude` | Ubicación geográfica (opcional). |
| `businessType` | Tipo de negocio de la red (p. ej. `ENET`). |

---

### 4.3 Dispositivos

#### Listar dispositivos — `maint/devices`

Lista dispositivos de un grupo **por tipo**. Debes hacer una llamada por cada `common_type` (`AP`, `Switch`, `Gateway`).

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/maint/devices?access_token={token}&common_type=AP&group_id=9391895&page=1&per_page=50'
```

| Parámetro | Descripción |
| --------- | ----------- |
| `common_type` | `AP` \| `Switch` \| `Gateway`. |
| `group_id` | Grupo a consultar. |
| `page` / `per_page` | Paginación. |

#### Estado de dispositivo — `device/{sn}`

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/device/G1AB12345678?access_token={token}'
```

Campo clave de respuesta: `onlineStatus` → `ON` \| `OFF` \| `NEVER_ONLINE`.

#### CPU y memoria — `current_performance`

```bash
curl 'https://cloud-as.ruijienetworks.com/logbizagent/logbiz/api/sys/current_performance?access_token={token}&sn=G1AB12345678'
```

Campos: `cpuRate` (%), `memoryRate` (%), `memoryFree`, `flashRate`, `flashFree`.

#### Puertos de switch — `conf/switch/device/{sn}/ports`

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/conf/switch/device/G1AB12345678/ports?page_size=50&page_index=1&access_token={token}'
```

#### PoE — `poe/info` y `poe/pwr`

```bash
# Info PoE por puerto
curl 'https://cloud-as.ruijienetworks.com/service/api/conf/switch/device/G1AB12345678/poe/info?access_token={token}'

# Consumo PoE total del switch
curl 'https://cloud-as.ruijienetworks.com/service/api/conf/switch/device/G1AB12345678/poe/pwr?access_token={token}'
```

#### Puertos de gateway — `gateway/intf/info/{sn}`

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/gateway/intf/info/G1AB12345678?access_token={token}'
```

#### Logs de eventos — `dev/{sn}/devicemgtlogs`

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/open/v1/dev/G1AB12345678/devicemgtlogs?access_token={token}&log_type=ALL&startTime=2026-07-20%2000:00:00&endTime=2026-07-21%2000:00:00'
```

#### Tráfico 24 h — `flow/show/hour`

```bash
curl -X POST 'https://cloud-as.ruijienetworks.com/logbizagent/logbiz/api/flow/show/hour?access_token={token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "sn": "G1AB12345678",
    "startDate": "2026-07-20 00:00:00",
    "endDate": "2026-07-21 00:00:00"
  }'
```

---

### 4.4 WiFi — `open/v1/wifi`

Crea o actualiza una red inalámbrica en un grupo.

```bash
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/open/v1/wifi?access_token={token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "groupId": 9391895,
    "wifiGrpSsid": true,
    "wirelessConfEntity": {
      "ssidName": "MiWiFi_Empresarial",
      "relatedRadio": "1,2",
      "enable": true,
      "encryptionMode": "wpa_wpa2-psk",
      "password": "MiPassword123",
      "authEnable": false,
      "axMode": true,
      "wm": true,
      "l2iso": false
    }
  }'
```

| Campo | Descripción |
| ----- | ----------- |
| `groupId` | Grupo donde se publica el SSID. |
| `wifiGrpSsid` | Si el SSID se aplica a nivel de grupo. |
| `ssidName` | Nombre de la red. |
| `relatedRadio` | Radios donde se emite (`"1,2"` = 2.4 GHz + 5 GHz). |
| `encryptionMode` | Modo de cifrado (ver [Apéndice A §A.6](./APENDICE-A.md)). |
| `password` | Contraseña (según el modo de cifrado). |
| `authEnable` | Habilita autenticación/portal cautivo. |
| `axMode` | Habilita Wi-Fi 6 (802.11ax). |
| `wm` | Optimización WMM/multimedia. |
| `l2iso` | Aislamiento de clientes en capa 2. |

---

### 4.5 Usuarios y Vouchers

Todos los endpoints reciben `{groupId}` en la ruta.

#### Grupos de usuarios — `usergroup/list/{groupId}`

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/intl/usergroup/list/9391895?pageIndex=1&pageSize=20&access_token={token}'
```

#### Cuentas — crear / listar / actualizar / eliminar / restablecer

```bash
# Crear cuenta
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/open/auth/account/create/9391895?access_token={token}' \
  -H 'Content-Type: application/json' -d '{ ... }'

# Listar cuentas
curl 'https://cloud-as.ruijienetworks.com/service/api/open/auth/account/getList/9391895?access_token={token}'

# Actualizar cuenta
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/open/auth/account/update/9391895?access_token={token}' \
  -H 'Content-Type: application/json' -d '{ ... }'

# Eliminar cuenta
curl -X DELETE 'https://cloud-as.ruijienetworks.com/service/api/open/auth/account/delete/9391895?access_token={token}'

# Restablecer cuenta
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/open/auth/account/reset/9391895?access_token={token}'

# Resumen del estado de cuentas
curl 'https://cloud-as.ruijienetworks.com/service/api/open/auth/account/getStatusSummary/9391895?access_token={token}'
```

#### Vouchers — crear / personalizado / listar

```bash
# Crear vouchers (máx. 500 por llamada)
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/open/auth/voucher/create/9391895?access_token={token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "quantity": 50,
    "profile": "uuid-del-perfil",
    "userGroupId": 123,
    "comment": "Vouchers para evento"
  }'

# Voucher con código personalizado
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/open/auth/voucher/customerCreate/9391895/MICODIGO2026?access_token={token}'

# Listar vouchers
curl 'https://cloud-as.ruijienetworks.com/service/api/open/auth/voucher/getList/9391895?access_token={token}'
```

> **Notas:** máximo **500 vouchers por llamada**. Para generar más, haz múltiples llamadas. Cada voucher devuelve `codeNo` (el código) y `expiryTime` (fecha de expiración).

---

### 4.6 Monitoreo y estadísticas

#### Clientes conectados — `dev/user/current-user`

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/open/v1/dev/user/current-user?group_id=9391895&access_token={token}'
```

Campos por cliente: `mac`, `ip`, `onlineTime`, `userName`, `flowUp`/`flowDown`, `rssi`, `band`, `ssid`, `staOs`.

#### Historial de clientes — `sta/sta_users`

```bash
curl -X POST 'https://cloud-as.ruijienetworks.com/logbizagent/logbiz/api/sta/sta_users?access_token={token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "groupId": 9391895,
    "staType": "onofflineUserHistory",
    "pageSize": 20,
    "pageIndex": 1
  }'
```

`staType`: `currentUser` (en línea) \| `onofflineUserHistory` (historial de conexiones/desconexiones).

#### Tráfico por aplicación — `appflow/data-minute/appgroup`

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/open/v1/dev/eg/appflow/data-minute/appgroup?group_id=9391895&sn=G1AB12345678&intfName=Gi0/1&start_time=...&end_time=...&access_token={token}'
```

#### Tendencia de tráfico por puerto — `peekflow/intf/trend`

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/open/v1/dev/peekflow/intf/trend?intf_name=Gi0/1&sn=G1AB12345678&start_time=...&end_time=...&access_token={token}'
```

> **Granularidad de datos de tráfico** según el rango consultado: `< 2 días` → cada 5 min · `2–10 días` → cada 30 min · `> 10 días` → cada 2 h.

---

## Capítulo 5 — Formato de Respuesta y Códigos

### 5.1 Estructura general

Todas las respuestas siguen la forma:

```json
{
  "code": 0,
  "msg": "OK.",
  "data": {}
}
```

### 5.2 Interpretación de `code`

| Rango de `code` | Significado |
| --------------- | ----------- |
| `0` | Éxito. |
| Positivo (`> 0`) | **Error de lógica de negocio** (parámetro inválido, sin permisos, etc.). |
| `-50 ≤ code ≤ -1` | **Error de autorización / verificación.** |
| `code < -50` | **Error interno del servidor.** |

### 5.3 Códigos de error frecuentes

| `code` | Mensaje | Causa | Solución |
| ------ | ------- | ----- | -------- |
| `0` | `OK.` | Éxito | — |
| `1` | `Appid is invalid` | `appid` no válido | Verificar en el portal |
| `2` | `Parameter invalid` | Parámetros incorrectos | Revisar el formato del payload |
| `3` | `Token is invalid` | Token mal formado | Solicitar uno nuevo |
| `4` | `Token is overdued` | Token expirado | **Reautenticar** (no basta refrescar) |
| `5` | `Unauthorized` | Sin permisos | Verificar permisos de la app |
| `7` | `Timeout` | Timeout del servidor | Reintentar con backoff |
| `25` | `running` | La API sigue ejecutándose | Esperar y reintentar |
| `1009` | `Login failed` | Fallo de inicio de sesión | Verificar credenciales |
| `-1002` | `Internal error` | Error interno del servidor | Reportar a soporte |

> Ver la tabla completa en el [Apéndice A §A.5](./APENDICE-A.md).

---

## Capítulo 6 — Ejemplo Completo End-to-End

**Escenario:** dar de alta una sucursal nueva y publicar su red WiFi.

**Paso 1 — obtener token.**

```bash
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/oauth20/client/access_token?token=d63dss0a81e4415a889ac5b78fsc904a' \
  -H 'Content-Type: application/json' \
  -d '{ "appid": "TuAppId123", "secret": "TuSecret456" }'
# -> { "code": 0, "accessToken": "jJVmxTfIVok7D0ol5z9Q6oCMkHJPEERl" }
```

**Paso 2 — ubicar el grupo raíz** (para colgar de él la nueva sucursal).

```bash
curl 'https://cloud-as.ruijienetworks.com/service/api/group/single/tree?depth=BUILDING&access_token={token}'
# -> data.groupId = 9391895
```

**Paso 3 — crear el grupo de la sucursal.**

```bash
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/open/v1/group?access_token={token}' \
  -H 'Content-Type: application/json' \
  -d '{ "pGroupId": 9391895, "name": "Sucursal_Norte", "type": "BUILDING", "timezone": "America/Mexico_City" }'
# -> data.groupId = 9391900
```

**Paso 4 — publicar la red WiFi en la sucursal.**

```bash
curl -X POST 'https://cloud-as.ruijienetworks.com/service/api/open/v1/wifi?access_token={token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "groupId": 9391900,
    "wifiGrpSsid": true,
    "wirelessConfEntity": {
      "ssidName": "SucursalNorte_WiFi",
      "relatedRadio": "1,2", "enable": true,
      "encryptionMode": "wpa_wpa2-psk", "password": "ClaveSegura2026!",
      "axMode": true, "wm": true, "l2iso": false
    }
  }'
# -> { "code": 0, "msg": "OK." }
```

**Paso 5 — verificar dispositivos y clientes.**

```bash
# APs del grupo
curl 'https://cloud-as.ruijienetworks.com/service/api/maint/devices?access_token={token}&common_type=AP&group_id=9391900&page=1&per_page=50'
# Clientes conectados
curl 'https://cloud-as.ruijienetworks.com/service/api/open/v1/dev/user/current-user?group_id=9391900&access_token={token}'
```

### 6.1 Cliente Python de referencia

```python
import requests

BASE = "https://cloud-as.ruijienetworks.com"
APPID = "tu_app_id"
SECRET = "tu_secret"

# 1. Obtener token
r = requests.post(
    f"{BASE}/service/api/oauth20/client/access_token?token=d63dss0a81e4415a889ac5b78fsc904a",
    json={"appid": APPID, "secret": SECRET})
token = r.json()["accessToken"]

# 2. Obtener grupo raíz
r = requests.get(f"{BASE}/service/api/group/single/tree",
                 params={"depth": "BUILDING", "access_token": token})
root_id = r.json()["data"]["groupId"]

# 3. Crear nuevo grupo
r = requests.post(f"{BASE}/service/api/open/v1/group",
                  params={"access_token": token},
                  json={"pGroupId": root_id, "name": "Sucursal_Norte",
                        "type": "BUILDING", "timezone": "America/Mexico_City"})
gid = r.json()["data"]["groupId"]

# 4. Crear WiFi
r = requests.post(f"{BASE}/service/api/open/v1/wifi",
                  params={"access_token": token},
                  json={"groupId": gid, "wifiGrpSsid": True,
                        "wirelessConfEntity": {
                            "ssidName": "SucursalNorte_WiFi",
                            "relatedRadio": "1,2", "enable": True,
                            "encryptionMode": "wpa_wpa2-psk",
                            "password": "ClaveSegura2026!",
                            "axMode": True, "wm": True, "l2iso": False}})
print(r.json())
```

```python
# Monitorear dispositivos y su rendimiento
r = requests.get(f"{BASE}/service/api/maint/devices",
                 params={"access_token": token, "common_type": "AP",
                         "group_id": gid, "page": "1", "per_page": "50"})

for dev in r.json().get("data", {}).get("list", []):
    sn = dev["sn"]
    status = requests.get(f"{BASE}/service/api/device/{sn}",
                          params={"access_token": token}).json()
    perf = requests.get(f"{BASE}/logbizagent/logbiz/api/sys/current_performance",
                        params={"access_token": token, "sn": sn}).json()
    print(f"AP {sn}: {status['data']['onlineStatus']} | CPU: {perf['data']['cpuRate']}%")
```

```python
# Generar vouchers para un evento (máx. 500 por llamada)
GROUP_ID = gid
r = requests.post(f"{BASE}/service/api/open/auth/voucher/create/{GROUP_ID}",
                  params={"access_token": token},
                  json={"quantity": 100, "profile": "uuid-perfil",
                        "userGroupId": 123, "comment": "Conferencia 2026"})

for v in r.json().get("data", []):
    print(f"Código: {v['codeNo']} | Expira: {v['expiryTime']}")
```

---

## Capítulo 7 — Buenas Prácticas

- **Protege el `secret`.** Guárdalo en variables de entorno o un gestor de secretos; nunca lo incrustes en el front ni en repositorios. Trata el `accessToken` con el mismo cuidado.
- **Mantén el token vivo.** Programa una llamada ligera (p. ej. `org/account/info`) cada **~25 minutos** para no perder el token por inactividad, y renuévalo antes de los 30 días.
- **Reautentica ante `code` 4.** Si una llamada devuelve token expirado, vuelve a autenticarte con el POST de `access_token` (el refresh no sirve si ya expiró) y reintenta la llamada original una sola vez.
- **Backoff exponencial ante `code` 7 (`Timeout`) y `25` (`running`).** Reintenta con espera creciente; no martillees el servidor.
- **Respeta la paginación.** Todos los listados (dispositivos, cuentas, vouchers, historial) paginan. Itera `page`/`per_page` (o `pageIndex`/`pageSize`) hasta agotar los resultados; no asumas que caben en una página.
- **Un tipo de dispositivo por llamada.** `maint/devices` no lista todos los tipos juntos: haz llamadas separadas para `AP`, `Switch` y `Gateway`.
- **HTTPS siempre.** No uses HTTP inseguro para transportar credenciales.
- **Lotes de vouchers.** No pidas más de 500 por llamada; divide en varias peticiones y consolida los `codeNo`.

---

## Capítulo 8 — Solución de Problemas

| Síntoma | Causa probable / solución |
| ------- | ------------------------- |
| `code: 1` (`Appid is invalid`) | El `appid` no corresponde a la cuenta/región. Verifícalo en el portal. |
| `code: 4` (`Token is overdued`) | Token expirado. **Reautentica** con el POST de `access_token`; el refresh no aplica. |
| `code: 5` (`Unauthorized`) | La app no tiene permiso para ese recurso/grupo. Revisa los permisos de la aplicación. |
| `code: 7` (`Timeout`) | Timeout del servidor. Reintenta con backoff exponencial. |
| `code: 25` (`running`) | La operación sigue en curso. Espera y vuelve a consultar. |
| El listado de dispositivos parece incompleto | Estás filtrando por un solo `common_type` **o** ignorando la paginación. Consulta `AP`, `Switch` y `Gateway` por separado y recorre todas las páginas. |
| Faltan datos de tráfico en rangos amplios | La granularidad baja al crecer el rango (5 min → 30 min → 2 h). Ajusta tu resolución esperada al rango consultado. |
| El token muere antes de los 30 días | Es la expiración por **inactividad** (30 min). Implementa el keep-alive de ~25 min. |

---

## Capítulo 9 — Checklist de Integración

- [ ] Confirmar la **URL base/región** correcta de tu cuenta de Ruijie Cloud.
- [ ] Obtener `appid` y `secret` desde el portal y guardarlos de forma segura.
- [ ] Implementar el flujo de **autenticación** y almacenar el `accessToken`.
- [ ] Añadir **keep-alive (~25 min)** y **reautenticación** automática ante `code` 4.
- [ ] Implementar cliente REST con **timeouts** y **backoff** ante `code` 7/25.
- [ ] Manejar **paginación** en todos los listados.
- [ ] Consultar dispositivos por **tipo** (`AP`, `Switch`, `Gateway`) por separado.
- [ ] Probar el flujo completo (Capítulo 6) contra un grupo real de pruebas.

---

> *Documento educativo basado en el* Ruijie Cloud API Reference Manual V2.0.3*. Todos los valores son ficticios. Para parámetros y comportamientos exactos, consulta siempre el manual oficial que corresponda a tu versión y región.*

---

## Navegación

| Sección | Enlace |
| ------- | ------ |
| Apéndice A — diccionarios de datos | [APENDICE-A.md](./APENDICE-A.md) |
| Historial de actualizaciones | [HISTORIAL-ACTUALIZACIONES.md](./HISTORIAL-ACTUALIZACIONES.md) |
| RUIJIE — índice de plataformas | [../README.md](../README.md) |
| Índice de marcas | [../../README.md](../../README.md) |
