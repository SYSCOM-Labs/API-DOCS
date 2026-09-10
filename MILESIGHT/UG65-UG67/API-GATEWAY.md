# Milesight UG65 — API HTTP del gateway (backend CGI + REST del NS)

> Versión del documento: V1.0 — Septiembre 2026 · Fuente del fabricante: *UG65 HTTP & API / Integration Guide* (verificado contra firmware **60.0.0.49**)
> Producto: Gateway LoRaWAN Milesight UG65 (CGI de la Web GUI + REST estilo ChirpStack del Network Server embebido)

---

## Información Legal

- Esta es una **guía de referencia e integración** derivada del material público del fabricante (espejo local en [`docs/llms/`](./docs/llms/)). Muestra cómo operar el gateway UG65 por su **API HTTP**: el backend **CGI** (todo lo de la Web GUI) y el **REST** estilo ChirpStack del Network Server embebido.
- **Todos los valores de ejemplo son ilustrativos** — IPs, DevEUI, tokens y llaves sirven para mostrar el formato. Adáptalos a tu instalación.
- Los comportamientos pueden variar según la **versión de firmware**. Las verificaciones citadas aquí corresponden al firmware **60.0.0.49**. Para valores definitivos, consulta siempre el documento oficial de tu firmware.
- El producto se proporciona "TAL CUAL". Ni Milesight ni SYSCOM serán responsables de daños derivados del uso de esta documentación.

---

## Tabla de Contenidos

- [Sección 1 — Descripción General](#sección-1--descripción-general)
- [Sección 2 — Autenticación](#sección-2--autenticación)
- [Sección 3 — Referencia CGI (core/base)](#sección-3--referencia-cgi-corebase)
- [Sección 4 — Referencia REST `/api/*` (NS embebido)](#sección-4--referencia-rest-api-ns-embebido)
- [Sección 5 — Integraciones (MQTT/HTTP/BACnet/Modbus/Node-RED)](#sección-5--integraciones-mqthttpbacnetmodbusnode-red)
- [Sección 6 — Ejemplos de extremo a extremo](#sección-6--ejemplos-de-extremo-a-extremo)
- [Sección 7 — Buenas Prácticas y Notas Operativas](#sección-7--buenas-prácticas-y-notas-operativas)
- [Sección 8 — Solución de Problemas](#sección-8--solución-de-problemas)

---

## Sección 1 — Descripción General

### 1.1 ¿Qué es y para qué sirve?

El **UG65** es un gateway LoRaWAN de interior (IP65) con concentrador de 8 canales (half/full-duplex), Network Server embebido y conectividad a nubes/plataformas por MQTT(S), HTTP(S), BACnet/IP, BACnet/SC y Modbus. Su interfaz HTTP expone dos superficies:

| Superficie | Ruta base | Autenticación | Para qué |
| ---------- | --------- | ------------- | -------- |
| **Backend CGI** | `POST /cgi` | `Authorization: Bearer login=<usuario>;<td>` | Todas las funciones de la Web GUI: estado, packet-forward, configuración del NS, servidores de protocolo, red, sistema, mantenimiento, apps |
| **API REST** | `/api/*` | `Authorization: Bearer <jwt>` | NS estilo ChirpStack: dispositivos, applications, integraciones, codecs, perfiles, FUOTA, multicast, gateways, paquetes, objetos BACnet |
| Sesiones | `POST /islogin`, `POST /logout` | bearer | Verificación de estado de sesión |

Reglas generales:

- El gateway sirve HTTP en `http://<ip-gateway>` redirigiendo a HTTPS autofirmado en firmware reciente. Usa `curl -k` en pruebas.
- **Sobreescritos CGI**: `{id, model:"UG65", pn, oem, rtver, status, result:[...]}`; éxito `status:0`. Sesión inválida: `{"status":-2,"result":[-32001,"Session not found"]}` — vuelve a hacer login.
- **Respuestas REST**: los endpoints de negocio responden al estilo `{"code":200,"error":""}`; los listados usan envoltura Milesight (`{totalCount, result:[...]}`); fallos de auth → HTTP 401 con `{"error":"…","code":16}`.
- **Límite de velocidad**: espacia las llamadas CGI ≥ 500 ms; ráfagas devuelven `503`.
- Usuario/contraseña **nunca van en claro**: ambos backends esperan **AES-128-CBC (PKCS7) → Base64** (Sección 2).

---

## Sección 2 — Autenticación

### 2.1 Login CGI (Web GUI)

```
POST /cgi   Content-Type: application/json
```

```json
{
  "id": "1", "execute": 1, "core": "user", "function": "login",
  "values": [{ "username": "admin", "password": "<AES-128-CBC Base64>", "base": "web_login" }]
}
```

> **Notas:**
> - El firmware usa **clave e IV fijos** (idénticos en todas las unidades, embebidos también en el JS de la Web UI): clave `1111111111111111`, IV `2222222222222222`, 16 bytes ASCII cada uno, AES-128-CBC con PKCS7, luego Base64. Esto **no aporta seguridad por sí mismo**; la contraseña de la cuenta sigue siendo el secreto.
> - Un login fallido responde `status:-2` con `result[0].chance` (intentos restantes) / `locktime` (segundos).

Éxito:

```json
{ "id":"1", "model":"UG65", "pn":"...", "rtver":"60.0.0.49", "status":0,
  "result": [{ "ysrole":4, "ystimeout":3600, "ysexpires":3599, "username":"admin", "td":"<hash>" }] }
```

`td` forma la sesión CGI: envía `Authorization: Bearer login=admin;<td>` en cada llamada `/cgi` posterior. `ysrole`: 4 = admin. La sesión CGI expira tras `ystimeout` segundos (3600 típico).

### 2.2 Login REST (estilo ChirpStack)

```
POST /api/internal/login   {"username":"admin","password":"<AES-128-CBC Base64>"}
→ {"jwt":"eyJ..."}
```

Usa `Authorization: Bearer <jwt>` en `/api/*`. El JWT lleva claims estándar (`aud`/`iss` = identidad del NS embebido, `sub` = usuario).

### 2.3 Verificación de sesión y logout

```
POST /islogin   → {status:0, result:[{login:"true", ysrole:4, ...}]}
POST /logout
```

### 2.4 Cuenta HTTP API

`System > User > HTTP API` gestiona una cuenta dedicada para scripts: Tipo `1` *Synchronize* (reusa la cuenta Web — sin credenciales separadas) o `2` *Separate* (con su propio usuario/contraseña). El tipo 2 se guarda vía CGI en `yruo_usermanagement:api_user_list` con `function: add` (crear) / `set` (actualizar, incluye `old_username`) / `delete`. Es la **credencial recomendada** para scripts de terceros en lugar de la cuenta admin; entra por el mismo `/cgi` y `/api/internal/login`.

---

## Sección 3 — Referencia CGI (core/base)

El front-end llama a `POST /cgi` con `{id, execute:1, core, function, values:[{base, index, value}]}`. La función es `get` / `add` / `set` / `delete` / `order`; las páginas de configuración típicamente leen, escriben y releen. Los nombres `core/base` son exactamente los que envía la UI (capturados de dispositivos reales).

| Módulo de UI | core | base(s) |
| ------------ | ---- | ------- |
| Estado | `yruo_status` | `summary`, `yruo_celluar`, `yruo_status_network`, `yruo_status_route`, `yruo_status_dhcp` |
| Estado inalámbrico | `yruo_wifi_status` | `yruo_wifi_status` |
| Estado VPN | `yruo_vpn_status` | `yruo_vpn_status` |
| Packet Forward (NS/general) | `yruo_loragw` | `ns_general`, `general_conf`, `radios`, `advanced`, `custom`, `recv` (tráfico) |
| Servidor BACnet | `yruo_bacnet` | `server`, `get_notification` |
| Config WiFi | `yruo_wifi` | `yruo_wifi` |
| Config celular | `yruo_cell` | `yruo_cell` |
| Industrial (variante) | `yruo_industrial_*`, `yruo_io_*`, `yruo_bluetooth_*`, `yruo_industrial_gps_status` | por página |
| Interfaces de red | `yruo_wan` / `yruo_lan` / `yruo_bridge` / `yruo_port` / `yruo_loopback` / `yruo_dhcpserver` | mismos |
| DHCP relay | `yruo_dhcprelay` | `yruo_dhcprelay` |
| Firewall | `yruo_firewall_security` / `..._acl` / `..._dmz` / `..._mac_binding` / `..._port_mapping` / `..._policy` | mismos |
| DDNS | `yruo_ddns` | `yruo_ddns` |
| Link failover | `yruo_if_backup` | `yruo_if_backup` |
| VPN | `yruo_vpn_*` + `yruo_wireguard` | por tipo |
| Proxy | `yruo_proxy` | `yruo_proxy` |
| QoS | `yruo_qos_download` / `yruo_qos_upload` | mismos |
| Routing | `yruo_routefilter` / `yruo_routeospf` / `yruo_routerip` / `yruo_routestatic` | mismos |
| Sistema | `yruo_system` | `general`, `time` |
| Usuario / HTTP API | `yruo_usermanagement` | `security`, `user_list`, `api_user_list` |
| AAA | `yruo_aaa` | mismos |
| SNMP | `yruo_snmp` | `system`, `view`, `vacm`, `trap`, `mib` |
| Acceso remoto | `yruo_remote` | mismos |
| Eventos | `yruo_events` | `event_list` |
| Herramientas de mantenimiento | `yruo_tools` | `ping`, `traceroute`, `tcpdump`, `qxdm` (inicio/poll `is_finish`/stop) |
| Log | `yruo_log` | `system_log` |
| Upgrade | `yruo_upgrade` | `upgrade` |
| Tareas programadas | `yruo_schedule` | `schedule` |
| Almacenamiento | `yruo_storage` | mismos |
| Escaneo | `yruo_scan` | `yruo_scan` |
| Nube / API | `yruo_cloud`, `yruo_httpapi` | `cloud_manage`/`auto_provision`, `httpapi` |
| Modbus master (variante industrial) | `yruo_modbus_*` | por página |

---

## Sección 4 — Referencia REST `/api/*` (NS embebido)

### 4.1 Lectura agregada de dispositivos/applications/perfiles

`GET /api/urdevices` (sin cuerpo) es la **lectura agregada de un golpe**: devuelve `{devTotalCount, deviceResult:[...], appTotalCount, appResult:[...], pfTotalCount, profileResult:[...]}` en una sola respuesta. Úsala para enumerar dispositivos y para **verificar que un create/delete surtió efecto** — la lectura individual por DevEUI no funciona.

> **Nota:** `GET /api/urdevices/:devEUI` devuelve **405** (method not allowed) aunque aparezca en referencias antiguas — lee la lista agregada y filtra por `devEUI` del lado cliente.

Otros listados: `GET /api/urapplications`, `GET /api/urprofiles`, `GET /api/payloadcodecs`, `GET /api/multicast-groups`, `GET /api/gateways` — con envoltura Milesight `{totalCount, result:[...]}`.

### 4.2 Creación / modificación de recursos — contrato de respuesta

- Éxito de negocio: `{"code":200,"error":""}`.
- **Un create solo se confirma releyendo** la lista agregada (§4.1): un HTTP `code:200` se ha observado tanto para creates reales como (con errores de campo) para peticiones que no guardaron nada, y recrear un `devEUI` existente responde **HTTP 409 Conflict**. Trata 409 como "ya existe", no como un error a reintentar ciegamente.

Creación de dispositivo (OTAA):

```json
POST /api/urdevices
{ "applicationID": "1", "name": "em300-th", "devEUI": "24E124136F488888",
  "appKey": "<AppKey hex de 16 bytes>", "deviceProfileID": "<uuid desde /api/urprofiles>",
  "skipFCntCheck": true, "referenceAltitude": 0, "description": "…" }
```

Borrado: `DELETE /api/urdevices/:devEUI` (respuesta vacía — verifica por la lista agregada).

### 4.3 Applications e integraciones (MQTT / HTTP push)

Una application agrupa dispositivos; cada una puede tener **integraciones** que empujan eventos del NS (`uplink`, `join`, `ack`, `error`, `status`, `location`) a tu broker/endpoint:

| Operación | Petición |
| --------- | -------- |
| Leer integración | `GET /api/urapplications/:id/integrations/mqtt` (404 = no configurada) |
| Crear/actualizar | `PUT /api/urapplications/:id/integrations/mqtt` (variante HTTP: `.../integrations/http`) |
| Borrar | `DELETE /api/urapplications/:id/integrations/mqtt` |

El esquema MQTT almacenado es **plano** (verificado con la Web UI):

```json
PUT /api/urapplications/1/integrations/mqtt
{
  "id": "1", "mode": 0, "platformUrl": "", "advanced": false,
  "host": "broker.example.com", "port": 1883, "clientID": "ug65-client",
  "useAuth": true, "username": "user", "password": "pass",
  "useTLS": false, "TLSMode": 0, "sslSecurity": false,
  "connectTimeout": 30, "keepAliveInterval": 60, "retransmissionEnabled": false,
  "uplinkTopic": "site/ug65-1/$devEUI", "upQoS": 0, "uplinkRetain": false,
  "joinTopic": "site/ug65-1/join", "joinQoS": 0, "joinRetain": false,
  "downlinkTopic": "", "downlinkQoS": 0,
  "mcDownlinkTopic": "", "mcDownlinkQoS": 0,
  "customData": "{...plantilla JSON del payload...}"
}
```

Notas de campos:

- `$devEUI` en plantillas de topic se sustituye por dispositivo. **Un `uplinkTopic` vacío significa que no se publica nada.**
- `customData` es una plantilla JSON del payload publicado; si no la envías el gateway guarda una por defecto — relee la integración con `GET .../integrations/mqtt` para ver la forma exacta almacenada.
- La integración HTTP usa el mismo patrón en `.../integrations/http` (URL, headers, TLS en lugar de campos de broker).

### 4.4 Referencia de endpoints

| Método y ruta | Notas |
| ------------- | ----- |
| `GET/POST /api/internal/login` | JWT |
| `GET /api/network-server/settings` | Configuración general del NS |
| Dispositivos | `GET /api/urdevices` (agregada, §4.1), `POST /api/urdevices` (creación), `DELETE /api/urdevices/:devEUI`, `POST /api/urdevices/:devEUI/queue` (downlink) |
| Applications | `GET/POST /api/urapplications`, `PUT/DELETE /api/urapplications/:id`, integraciones por §4.3 |
| Codecs | `GET /api/payloadcodecs`, `GET/PUT/DELETE /api/payloadcodecs/:id`, `POST /api/payloadcodecs`, `GET /api/payloadcodecs/:devEUI/device` |
| Perfiles | `GET/POST /api/urprofiles`, `PUT/DELETE /api/urprofiles/:id`, `POST /api/urprofiles/lns` |
| Gateways | `GET/POST /api/gateways`, `PUT/DELETE /api/gateways/:mac` |
| Multicast | `GET /api/multicast-groups`, `GET /api/multicast-groups/:id`, endpoints de dispositivos bajo `:id/*`, `GET .../queue` |
| FUOTA | `GET /api/fuota/task`, `/task/payloadsize`, `/task/delete`, `/task/retry`, `/devices`, `/official/firmware`, `/official/models` |
| Visor de paquetes | `GET /api/urpackets`, `DELETE /api/urpackets` |
| BACnet (servidor/objeto) | `GET /api/bacnet/get|getAll|add|set|del|server` |
| Actility | `GET /api/msactility` (estado Thingpark) |
| Misceláneo | `GET /api/urdevicesall/export` |

### 4.5 Modelo de objetos del NS LoRaWAN

`/api/urapplications` = applications; integraciones (§4.3) empujan eventos de dispositivos. `/api/urdevices` = dispositivos con `appKey`/`appSKey`/`nwkSKey` para OTAA/ABP y sincronización de contadores `fCntUp`/`fCntDown`. `/api/urprofiles` = perfiles de dispositivo/servicio (región, clase, retardos RX). Multicast vía `/api/multicast-groups`. La decodificación de payload sigue el codec configurado en la application o dispositivo (`payloadCodecID`).

---

## Sección 5 — Integraciones (MQTT/HTTP/BACnet/Modbus/Node-RED)

### 5.1 Conectar un sensor LoRaWAN y enviar sus datos

1. En **Network Server > Payload Codecs** elige (o importa) el decodificador del modelo, o define uno con el editor JSON.
2. **Network Server > Applications** → agrega una application; opcionalmente agrega una **integración** (HTTP o MQTT) para empujar eventos a tu servidor.
3. **Network Server > Device** → registra el sensor (OTAA o ABP), asigna su device-profile y codec, y guarda.
4. **Status** o **Network Server > Packets** lo mostrarán uniéndose y enviando uplinks.
5. Para más de una red, agrega destinos en **Packet Forward > General** — el gateway puede reenviar a múltiples servidores UDP (p. ej. NS embebido + ChirpStack/TTN externo).

### 5.2 Publicar datos de dispositivos a nube / BMS

- **Integraciones MQTT/HTTP por application**: elige broker o URL, define topic/headers, y el NS embebido empuja eventos JSON (`uplink`, `join`, `ack`, `error`, `status`, `location`). Al scriptar la integración por API: el esquema almacenado es plano y tiene trampas (un `uplinkTopic` vacío no publica nada) — lee §4.3 primero.
- **Servidor BACnet/IP y BACnet/SC**: desde **Protocol > BACnet Server** crea un servidor y mapea los objetos de dispositivo legibles/escribibles; un BMS “polls” o se suscribe (COV) al gateway como dispositivo BACnet. El UG65 es **servidor BACnet** (el BMS lo lee) — a diferencia del EG71, el UG65 estándar no tiene adquisición de bus de campo, así que no hay flujo de descubrimiento de dispositivos.
- **Servidor Modbus** análogo en `Protocol > Modbus Server`. Para esclavos Modbus RTU por RS485 en variantes industriales usa **Industrial > Modbus master/serial**.
- **Forwarding HTTP(S) estilo webhook** de payloads de uplink a endpoints arbitrarios, disponible también en la configuración de destinos del packet forward.

### 5.3 Downlink / control

- Encola downlink desde la Web UI (device → queue, o FUOTA para firmware).
- Grupos Class C: usa **Network Server > Multicast** para difundir a muchos receptores.
- Downlink REST: `POST /api/urdevices/:devEUI/queue`.

### 5.4 Red y gestión remota

- **Network > Interfaces** — WAN/LAN, DHCP, cliente/AP inalámbrico, celular (en modelos LTE).
- **Link failover** bajo Network > Backup para mantener el uplink vivo vía WAN/celular.
- VPN (OpenVPN/IPsec/WireGuard/…) desde **Network > VPN** para un túnel de regreso al NOC.
- Restringe exposición con **Network > Firewall**, SNMP (**System > SNMP**, v1/v2c/v3) y acceso remoto (**System > Remote**).
- **System > Events** → reglas de notificación (e-mail/SNMP) ante eventos de sistema/celular/red.

### 5.5 Flota y escala / edge

- Registra varios gateways en un **Gateway Fleet** para que perfiles y codecs se propaguen a todos los miembros.
- Upgrades por **Maintenance > Upgrade** localmente o por la flota; tareas programadas por **Maintenance > Schedule**.
- **Node-RED** y **Python SDK** (App) extienden el gateway localmente (parseo de payloads, serial/Modbus, REST local).

---

## Sección 6 — Ejemplos de extremo a extremo

### 6.1 Shell (openssl + curl)

```sh
# 0) cifra la contraseña como espera el firmware (AES-128-CBC, clave/IV fijos)
ENC=$(printf '%s' 'password2' | openssl enc -aes-128-cbc -K 31313131313131313131313131313131 \
      -iv 32323232323232323232323232323232 -base64)
# (-K/-iv toman hex: clave '1111...' = 0x31 repetido; IV '2222...' = 0x32 repetido)

# 1) login CGI → td
curl -sk https://<gateway>/cgi -H 'Content-Type: application/json' \
  -d "{\"id\":\"1\",\"execute\":1,\"core\":\"user\",\"function\":\"login\",
       \"values\":[{\"username\":\"admin\",\"password\":\"$ENC\",\"base\":\"web_login\"}]}"

# 2) leer radios (espacia llamadas CGI ≥500 ms)
curl -sk https://<gateway>/cgi -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer login=admin;<td>' \
  -d '{"id":"2","execute":1,"core":"yruo_loragw","function":"get","values":[{"base":"radios"}]}'

# 3) login REST + lista agregada de dispositivos
curl -sk https://<gateway>/api/internal/login -H 'Content-Type: application/json' \
  -d "{\"username\":\"admin\",\"password\":\"$ENC\"}"
curl -sk https://<gateway>/api/urdevices -H "Authorization: Bearer <jwt>"
```

### 6.2 Node.js (cifrado de contraseña equivalente)

```js
import crypto from 'node:crypto';
const encrypt = pw => {
  const c = crypto.createCipheriv('aes-128-cbc', '1111111111111111', '2222222222222222');
  return Buffer.concat([c.update(pw, 'utf8'), c.final()]).toString('base64');
};
```

---

## Sección 7 — Buenas Prácticas y Notas Operativas

- La cuenta **HTTP API** (§2.4), no la contraseña Web admin, es la credencial pensada para software.
- La clave/IV AES de login son fijas en el firmware; no aportan seguridad por sí mismos — la contraseña de la cuenta es el secreto.
- **Verifica cada escritura releyendo** vía la lista agregada (§4.1): `DELETE` devuelve cuerpo vacío y un `code:200` no garantiza el estado esperado (409 en duplicados).
- Comportamiento por endpoint puede variar entre versiones puntuales: verifica el `core`/`base` exacto de tu firmware abriendo la página en la UI y observando las peticiones, o leyendo el objeto almacenado (su eco es el esquema).
- Espacia llamadas CGI ≥ 500 ms.
- Usa `reference` en downlinks para correlacionar ACKs.

---

## Sección 8 — Solución de Problemas

| Síntoma | Causa probable / solución |
| ------- | ------------------------- |
| `Session not found` (`status:-2` / `-32001`) | Sesión CGI vencida (`ystimeout`). Repite el login. |
| `503` en ráfagas CGI | Rate limit: espacia ≥ 500 ms. |
| `GET /api/urdevices/:devEUI` → 405 | No disponible; usa la lectura agregada `GET /api/urdevices` y filtra por `devEUI`. |
| Create parece funcionar pero no guarda nada | Confirma releyendo la lista agregada; un `code:200` no garantiza persistencia. |
| `409 Conflict` al recrear un dispositivo | Ya existe; trátalo como "presente", no como error a reintentar. |
| Login falla con `chance`/`locktime` | Cuenta bloqueada temporalmente; espera `locktime` segundos. |

---

> *Documento educativo derivado del material oficial del fabricante. Para parámetros y comportamientos exactos, consulta el espejo local [`docs/llms/`](./docs/llms/) y tu firmware específico.*

---

## Navegación

| Sección | Enlace |
| ------- | ------ |
| Documentación de la API REST (NS embebido) | [README.md](./README.md) |
| Apéndice A — endpoints y diccionarios | [APENDICE-A.md](./APENDICE-A.md) |
| Historial de actualizaciones | [HISTORIAL-ACTUALIZACIONES.md](./HISTORIAL-ACTUALIZACIONES.md) |
| MILESIGHT — índice de plataformas | [../README.md](../README.md) |
| Índice de marcas | [../../README.md](../../README.md) |
