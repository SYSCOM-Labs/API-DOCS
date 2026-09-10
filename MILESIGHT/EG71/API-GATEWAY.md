# Milesight EG71 — Guía de integración por API (HTTP completo)

> Versión del documento: V1.0 — Septiembre 2026 · Fuente del fabricante: *EG71 HTTP & API / Integration Guide* (verificado contra firmware **71.0.0.2/71.0.0.3**)
> Producto: Gateway LoRaWAN Milesight EG71 (building IoT: LoRaWAN + BAS fieldbus + I/O)

---

## Información Legal

- Esta es una **guía de referencia e integración** derivada del material público del fabricante (espejo local en [`docs/llms/`](./docs/llms/)). Muestra cómo operar el gateway EG71 por su **API HTTP**: el backend **CGI** (configuración de red/sistema) y el **REST** (Data Services: dispositivos, codecs, forwarding, NS LoRaWAN).
- **Todos los valores de ejemplo son ilustrativos** — IPs, DevEUI, tokens, instancias BACnet y llaves sirven para mostrar el formato. Adáptalos a tu instalación.
- Los comportamientos pueden variar según la **versión de firmware**. Las verificaciones citadas corresponden a **71.0.0.2/71.0.0.3**. Para valores definitivos, consulta siempre el documento oficial de tu firmware.
- El producto se proporciona "TAL CUAL". Ni Milesight ni SYSCOM serán responsables de daños derivados del uso de esta documentación.

---

## Tabla de Contenidos

- [Sección 1 — Descripción General](#sección-1--descripción-general)
- [Sección 2 — Autenticación](#sección-2--autenticación)
- [Sección 3 — Referencia CGI (core/base)](#sección-3--referencia-cgi-corebase)
- [Sección 4 — Referencia REST `/api/*`](#sección-4--referencia-rest-api)
- [Sección 5 — Guía de integración por flujo](#sección-5--guía-de-integración-por-flujo)
- [Sección 6 — Ejemplos de extremo a extremo](#sección-6--ejemplos-de-extremo-a-extremo)
- [Sección 7 — Buenas Prácticas y Notas Operativas](#sección-7--buenas-prácticas-y-notas-operativas)
- [Sección 8 — Solución de Problemas](#sección-8--solución-de-problemas)

---

## Sección 1 — Descripción General

### 1.1 Dos superficies HTTP

| Superficie | Ruta base | Autenticación | Para qué |
| ---------- | --------- | ------------- | -------- |
| **Backend CGI** | `POST /cgi` | `Authorization: Bearer login=<usuario>;<td>` | Network, VPN, Firewall, System, radio LoRa, Platform, Apps |
| **API REST** | `/api/*` | `Authorization: Bearer <jwt>` | Device/equipment management, codec library, data forwarding, LoRaWAN NS, access networks |

Reglas de uso:

- **Páginas de configuración** (Network/System/Platform/App) → CGI.
- **Data Services** (dispositivos, codecs, forwarding) → REST.
- Los **conteos de objetos y dispositivos siempre se derivan de datos reales**; no los hardcodées.
- Envoltura de éxito `{errCode: 0, errMsg: "success", ...}` para REST y `{status: 0, result:[...]}` para CGI.
- **Límite de velocidad**: CGI ≥ 500 ms entre llamadas; ráfagas devuelven `503`.

---

## Sección 2 — Autenticación

### 2.1 Login CGI (sesiones Web/GUI)

```
POST /cgi
Content-Type: application/json
```

```json
{
  "execute": 1,
  "core": "user",
  "function": "login",
  "values": [{ "username": "admin", "password": "<AES-128-CBC(Base64)>" }],
  "id": 5
}
```

> **Notas:**
> - La contraseña va cifrada con AES-128-CBC (PKCS7) y luego Base64. El firmware usa **clave e IV fijos** (idénticos en todas las unidades, embebidos también en el JS de la Web UI): clave `4829173051647823`, IV `7603912845091736`, 16 bytes ASCII cada uno. Esto **no aporta seguridad por sí mismo**; la contraseña de la cuenta sigue siendo el secreto.
> - Un login fallido responde `status:-2` con `chance` (intentos restantes) / `locktime` (segundos).

Éxito:

```json
{ "status": 0,
  "result": [{ "ysrole": 4, "ystimeout": 3600, "ysexpires": 3599,
               "username": "admin", "td": "<hash>" }] }
```

`td` se convierte en el token CGI: las llamadas `/cgi` posteriores llevan `Authorization: Bearer login=admin;<td>`. `ysrole`: 4 = admin. La sesión CGI expira tras `ystimeout` segundos (3600 típico) — una sesión vencida responde `{"status":-32001,"errMsg":"Session not found"}`; vuelve a hacer login.

### 2.2 Login REST/JWT

```
POST /api/internal/login
```

```json
{ "username": "admin", "password": "<AES-128-CBC(Base64)>" }
```

Respuesta `{ "jwt": "eyJ..." }` (claims `aud/iss = lora-app-server`, `sub = user`, ~24 h). Úsalo como `Authorization: Bearer <jwt>` en `/api/*`.

### 2.3 Verificación de sesión y logout

```
POST /islogin   → {status:0, result:[{login:"true", ysrole:4, ...}]}
POST /logout
```

### 2.4 Almacenamiento de tokens en el navegador

La Web UI guarda en localStorage: `token` (JWT), `cgi_token` (`login=admin;<td>`), `EG7X.lang`, `EG7X.theme`. Un cliente API conserva los dos bearer tokens del mismo modo.

### 2.5 Inicialización de página (lo que la UI llama en cada cambio de página)

| Petición | Propósito |
| -------- | --------- |
| `POST /islogin` | sesión + info del dispositivo |
| `POST /cgi` `yruo_usermanagement:security` | permisos |
| `POST /cgi` `yruo_usermanagement:check_pass` | chequeo de contraseña por defecto |
| `POST /cgi` `yruo_wizard:yruo_wizard` | estado del wizard |
| `POST /cgi` `yruo_system:general` | config base del sistema |
| `GET /api/general-info/interface/with-access-info` | mapa de interfaces |
| `POST /cgi` `yruo_status:dashboard` | estado del dashboard |

---

## Sección 3 — Referencia CGI (core/base)

Sobreescrito de petición:

```json
{ "execute": 1, "core": "<core>", "function": "get|set|add|del|order|apply",
  "values": [{ "base": "<base>", "index": <fila>, "value": { ...campos } }], "id": 1 }
```

Sobreescrito de respuesta:

```json
{ "id": 1, "model": "EG71", "pn": "<24 caracteres>", "oem": "0000",
  "rtver": "71.0.0.x", "status": 0, "result": [{ "get": [...], "grey": 0 }] }
```

Los `core`/`base` son exactamente los que envía la Web UI. Para escrituras de configuración, la mayoría de las páginas primero `get`, luego `set` en el mismo `core:base`, y luego `yruo_apply:apply` (devuelve `{reboot: 0}` salvo que requiera reinicio).

### Mapa `core`/`base` (módulos de configuración)

| Página | core | base(s) |
| ------ | ---- | ------- |
| Dashboard | `yruo_status` | `dashboard` (60+ campos) |
| Cajón Ethernet | `yruo_status` | `yruo_ethernet` |
| Ethernet WAN/LAN/Bridge/Port/DHCP | `yruo_wan` / `yruo_lan` / `yruo_bridge` / `yruo_port` / `yruo_dhcpserver` | mismos |
| Wireless | `yruo_wifi` / `yruo_scan` | `yruo_wifi` / `yruo_scan` |
| Celular | `yruo_cell` | `yruo_cell` |
| Radio LoRaWAN | `yruo_loragw` | `ns_general`, `radios`, `advanced`, `radios_spectral_scan` |
| RS485 (REST) | — | ver §4.3 |
| Firewall | `yruo_firewall_security/acl/dmz/mac_binding/port_mapping` | mismos |
| DDNS | `yruo_ddns` | `yruo_ddns` |
| Link failover | `yruo_if_backup` | `yruo_if_backup` |
| OpenVPN client/server | `yruo_vpn_openvpn_client` / `..._server` | mismos |
| IPsec / L2TP / PPTP / WireGuard | `yruo_vpn_ipsec` / `yruo_vpn_l2tp` / `yruo_vpn_pptp` / `yruo_wireguard` | mismos |
| Certificados/estado VPN | `yruo_vpn_certificate` / `yruo_vpn_status` | mismos |
| Sistema general/hora | `yruo_system` | `general`, `time` |
| NFC | `yruo_nfc_mng` | `nfc` |
| Usuarios/seguridad | `yruo_usermanagement` | `security`, `user_list` |
| SMTP/e-mail | `yruo_system` | `smtp`, `email`; `yruo_phone:yruo_phone` para SMS |
| Plataforma nube | `yruo_cloud` | `cloud_manage`, `auto_provision` |
| SNMP | `yruo_snmp` | `system`, `view`, `vacm`, `trap`, `mib` |
| Eventos | `yruo_events` | `event_list` |
| Tareas programadas | `yruo_schedule` | `schedule` |
| Herramientas de mantenimiento | `yruo_tools` | `ping`, `traceroute`, `tcpdump`, `qxdm` (inicio/poll `is_finish`/stop) |
| Python | `yruo_python` | `status`, `python_sdk`, `appmanager`, `python_apps` |
| Node-RED | `yruo_loragw` | `node_red`, `node_red_ssl` |
| Log | `yruo_log` | `system_log` |
| Upgrade | `yruo_upgrade` | `upgrade` |
| Apply | `yruo_apply` | (check/apply de config pendiente) |

Ejemplo — leer config de radio:

```
POST /cgi
{"execute":1,"core":"yruo_loragw","function":"get","values":[{"base":"radios"}],"id":1}
```

Ejemplo — establecer hostname:

```
POST /cgi
{"execute":1,"core":"yruo_system","function":"set",
 "values":[{"base":"general","index":0,"value":{"hostname":"my-eg71"}}],"id":9}
```

### 3.1 Patrón de herramientas de mantenimiento (ping / traceroute / tcpdump / QXDM)

`start` → polling del mismo `core/base` por un flag `is_finish` (con líneas de resultado) → `stop`. Tcpdump/QXDM usan `get → tcpdump_start → tcpdump_stop`.

---

## Sección 4 — Referencia REST `/api/*`

Todas las respuestas REST envuelven los datos de negocio como `{ errCode: 0, errMsg: "success", ... }`.

> **Verifica cada create/update con una lectura posterior — los códigos de éxito por sí solos no son confiables** (ambos comportamientos verificados en 71.0.0.3):
>
> - Los endpoints de creación de dispositivos devuelven un sobre de éxito incluso cuando **no se guarda nada** si el cuerpo no lleva `"isSave": true`. La señal es `deviceId: "0"` en la respuesta — `{"errCode":0,"errMsg":"success","deviceId":"0"}` en `.../device/bacnet/create`, `{"errCode":200,"errMsg":"","deviceId":"0"}` en `/api/urdevices`. Incluye `"isSave": true` y confirma que el registro aparece en un listado/lectura.
> - Algunos fallos devuelven `errCode` numéricos pelados sin `errMsg` explicativo. La semántica no está documentada; trátalos como "no aplicado", resuelve la condición subyacente y confirma el estado con un GET.

| Respuesta observada | Dónde se vio | Lectura |
| ------------------- | ------------ | ------- |
| `errCode: 0, errMsg: "success"` | la mayoría de reads/creates REST | OK — pero relee tras escrituras (trampa `isSave`) |
| `errCode: 200, errMsg: ""` | `POST /api/urdevices` | petición aceptada — si guardó depende de `deviceId` en la misma respuesta (`"0"` = no guardó, un id real = guardó) |
| `errCode: 10010011 / 10010008` | create/rebind de access-network | fallo no estructurado (contextos de conflicto de puerto observados) |
| `errCode: 10020001 / 10020002` | polling de scan de dispositivos BACnet | códigos de estado de scan no estructurados |

### 4.1 Equipment Data (gestión de dispositivos)

| Método y ruta | Notas |
| ------------- | ----- |
| `POST /api/dsdevices/device` | lista de dispositivos (paginada); filtros `protocolType[]/deviceType[]/deviceNameOrEui/status`, `page/pageSize/orderBy`; devuelve `id, name, deviceEui, protocolType, deviceType, status, objectCount, signal, accessNetworkId, payloadCodecID` |
| `GET /api/dsdevices/device/io` | lista de dispositivos I/O (UI/DI/AO/DO; paginada en front-end) |
| `PUT /api/dsdevices/device/io/update/:id` · `PUT .../copy/:id` | editar / copiar dispositivo I/O |
| Dispositivos LoRaWAN | `POST /api/urdevices` (crear OTAA/ABP), `GET /api/urdevices/simple/:id` (leer por id numérico de la lista — `GET /api/urdevices/:devEUI` devuelve **405**), `POST /api/urdevices/:devEUI/queue` (escritura downlink) |
| Dispositivos BACnet / Modbus / KNX | `POST /api/dsdevices/device/{bacnet,modbus,knx}/create`, `PUT /api/dsdevices/device/{...}/update/:id`, `GET /api/dsdevices/device/{...}/:id` |
| Objetos de dispositivo (comunes) | `GET /api/dsdevices/objects/:deviceId`, `POST /api/dsdevices/objects/create`, `PUT /api/dsdevices/objects/update/:id`, `POST /api/dsdevices/objects/delete`, `POST /api/dsdevices/objects/enable`, `POST /api/dsdevices/objects/copy` |
| Listas de objetos por protocolo | `GET /api/dsdevices/objects/{bacnet,modbus,knx}/:deviceId`, `POST .../pc-create`, `PUT /api/dsdevices/objects/{bacnet,modbus,knx}/:objectId`, `POST .../read-write` |
| Objetos desde codec | `GET /api/dsdevices/objects/addlist/:deviceId` (LoRaWAN), `.../addlist/{bacnet,modbus,knx}/:deviceId` |
| Lectura/escritura + poll de objetos | `POST /api/dsdevices/objects/read-write`, `GET /api/dsdevices/objects/read-status/:objectId`, `GET .../{protocol}/simple/:objectId` |

Campos clave de objetos por protocolo: LoRaWAN (`enable, name, type, instanceId, currentValue, gradient/offset, unitId`); BACnet (`+interval, polarity, inactiveText/activeText, releaseDefault, stateText, cov`); Modbus (`registerType: coil/discrete/holding/input, registerAddress 0-65535, dataType: INT16..64/UINT/Float/Flag, registerNumber auto`); KNX (`groupAddress m/n/s, dataPoint, flag 1..3, interval`).

#### 4.1.1 Ejemplos de creación (cuerpos verificados en 71.0.0.3)

Los creates de dispositivo necesitan `"isSave": true` (ver la advertencia al inicio de §4). Un dispositivo BACnet/IP **no lleva campos IP/puerto** — el gateway aprende la dirección del dispositivo por tráfico de descubrimiento BACnet:

```json
POST /api/dsdevices/device/bacnet/create
{ "name": "bacnet-controller", "deviceId": "575", "protocolType": "bacnet ip",
  "accessNetworkId": "9", "payloadCodecID": "0", "description": "VAV controller 575",
  "isSave": true }
```

Dispositivo LoRaWAN OTAA (`profileID` desde `/api/urprofiles`; con un `payloadCodecID` coincidente sus objetos pueden crearse en lote después):

```json
POST /api/urdevices
{ "name": "em300-th", "devEUI": "24E124136F499999", "appKey": "<AppKey hex de 16 bytes>",
  "profileID": "<uuid desde /api/urprofiles>", "payloadCodecID": "30",
  "supportsJoin": true, "skipFCntCheck": true, "fCntUp": 0, "fCntDown": 0, "fPort": 1,
  "isDefaultAppKey": false, "timeoutEnable": false, "timeout": "1440",
  "deviceType": "EM300-TH", "protocolType": "lorawan", "accessNetworkId": "1",
  "appName": "", "mbMode": "", "mbFramePort": "0", "mbTcpPort": "0",
  "description": "...", "isSave": true }
```

Objetos — creación por protocolo (BACnet mostrado; `interval` = período de poll en segundos), o creación en lote desde la lista de objetos de un codec:

```json
POST /api/dsdevices/objects/bacnet/create
{ "name": "ROOM_TEMP", "type": "Analog-Value", "instanceId": 0,
  "description": "...", "interval": 60, "unitId": "95", "deviceId": 39 }

POST /api/dsdevices/objects/create
{ "deviceId": 37, "objectIdList": [701, 702, 703] }
```

Los ids de `objectIdList` vienen de `GET /api/dsdevices/objects/addlist/:deviceId`; los objetos creados así llegan ya habilitados, y el `currentValue` de un objeto BACnet se actualiza en el siguiente ciclo de poll.

#### 4.1.2 Descubrimiento BACnet/IP (scan) — flujo verificado

El gateway descubre dispositivos BACnet transmitiendo Who-Is en el puerto UDP del access network; los dispositivos responden con I-Am y el gateway aprende sus direcciones. Flujo de API (verificado de extremo a extremo en 71.0.0.3 contra un dispositivo real):

| Paso | Petición | Notas |
| ---- | -------- | ----- |
| 1. Configurar e iniciar | `POST /api/dsdevices/bacnet/scan/config` con `{"accessNetworkId":9,"minInstanceId":575,"maxInstanceId":575}` | arma **e inicia** el scan; respuesta `{errCode:0, result:{hasScan:true, lastScanTime:"..."}}` |
| 2. Polling de resultados | `GET /api/dsdevices/bacnet/scan/devices/list?page=1&pageSize=2000&deviceOrderName=bacnet_network_device_id&deviceOrderType=asc&accessNetworkId=9` | las filas llevan la **dirección real** y son el resultado autoritativo del descubrimiento: `{"deviceId":"16","deviceName":"LLMSTEST-BAC0","instanceId":575,"select":true,"address":"192.168.44.114","hasScanObject":false,"objectCount":"0"}` — `deviceId` aquí es el id de la entrada de scan, **no** el id de un dispositivo creado |
| 3. Detener | `POST /api/dsdevices/bacnet/scan/stop` con `{}` | ⚠️ el `deviceList` dentro de la **respuesta de stop es un eco del rango de instancias configurado, no el resultado del descubrimiento** (siempre lista `minInstanceId..maxInstanceId` aunque no se haya encontrado nada). Juzga el descubrimiento por las filas de devices/list, que llevan `address` |

Errores de estado de scan: `10020001 "not bacnet scan is running"`, `10020002 "bacnet scan is already running"`.

Existen tres endpoints de scan adicionales para la lectura de objetos por dispositivo de la Web UI — `POST /api/dsdevices/bacnet/scan/single`, `POST /api/dsdevices/bacnet/scan/objects/list` (`{accessNetworkId, deviceId, page, pageSize}`), y `POST /api/dsdevices/objects/bacnet/scan/create` (crear un dispositivo desde una entrada de scan). Su semántica completa no fue reproducible por API; al scriptar, prefiere leer direcciones de la lista de descubrimiento y crear dispositivos explícitamente vía `.../device/bacnet/create` (§4.1.1).

### 4.2 Access Networks

`GET/POST /api/access-network`, `DELETE /api/access-network/:id`, detalle por protocolo `GET /api/access-network/{bacnet,modbus,knx}/simple/:id`, actualización por protocolo `PUT /api/access-network/bacnet/:id`. LoRaWAN es el único tipo cuya config vive en CGI (`yruo_loragw:ns_general` → `channel_plan`, `region_freq`), no en esta API.

Máximo de instancias por tipo: LoRaWAN 1, BACnet IP 3, BACnet MS/TP 2, Modbus TCP 4, Modbus RTU 2, Modbus RTU over TCP 4, KNX 1.

Cuerpo BACnet IP (verificado; `deviceId` es el **propio** número de instancia de dispositivo BACnet del gateway, `udpPort` es el puerto UDP que el **propio gateway** bindea en `interface`):

```json
POST /api/access-network/bacnet                  // actualización con PUT /api/access-network/bacnet/:id
{ "type": "bacnet ip", "interface": "eth1", "deviceId": 1390425, "udpPort": 47808,
  "timeout": 1000, "retry": 2, "keepAliveInterval": 60,
  "name": "BACnetIP_1", "mac": 0, "maxMaster": 0, "maxInfoFrames": 0 }
```

Dos comportamientos que conviene tratar como minas (ambos observados en pruebas en vivo):

- **La propiedad del puerto es exclusiva y pegajosa.** Si otro servicio del gateway ya ocupa el puerto — el servidor BACnet integrado bindea 47808 por defecto; contenedores de terceros pueden ocupar otros — el access network no puede levantarse, y recrearlo contra un puerto aún ocupado sigue fallando hasta que lo que lo ocupa se elimina. Dale a cada access network BACnet IP su propio puerto libre.
- **El borrado hace cascada.** `DELETE /api/access-network/:id` borra cada dispositivo **y todos sus objetos** bajo ese access network, sin deshacer.

### 4.3 RS485

`GET /api/access-network/rs485` y `POST /api/access-network/rs485`. El cuerpo va indexado por nombre de puerto (`rs485-1`, `rs485-2`) con `{baudRate, dataBits, stopBits, parity}`.

### 4.4 Data Forwarding

| Método y ruta | Notas |
| ------------- | ----- |
| `GET /api/dsforward` | reglas de forwarding (cada una tiene `objectCount/deviceCount`) |
| MQTT | `POST /api/dsforward/mqtt`, `PUT /api/dsforward/mqtt/:id`, `PUT /api/dsforward/mqtt/connect/:id` (conectar/desconectar — forma del cuerpo en §4.4.1) |
| HTTP | `POST /api/dsforward/http`, `PUT /api/dsforward/http/:id` |
| Servidor Modbus | `POST /api/protocol/modbus_server/add`, `/set`, `/del`; objetos `POST /api/protocol/modbus_object/{add,set,get,del,getall,switch}` |
| Servidor BACnet | `POST /api/protocol/bacnet_server/add`, `/set`, `/del`; objetos `POST /api/protocol/bacnet_object/*` (+ `delNc`) |
| Objetos de forwarding | `POST /api/dsforward/objects/add|delete|enable|addlist`, `GET/POST /api/dsforward/devices/*` |
| Límites | HTTP 10, MQTT 10, Modbus 15, BACnet 4 reglas |

Campos de formulario: **HTTP** `name, urlArray[], headers, tlsMode, useTLS, tlsRootCertName, tlsClientCertName/KeyName, enable`; **MQTT** — ver §4.4.1, el esquema de topics necesita cuidado; **Modbus** `name, ipAddr, ipPort, interface, slaveId, enable`; **BACnet** `name, ipPort, interface, deviceId, deviceName, bbmdEnable/Type/Ip/Port/Bdt/ToLive, globalObjects...`.

#### 4.4.1 Reglas MQTT — el esquema almacenado es plano (importante)

La API almacena los topics MQTT como **campos planos**. **No** envíes la estructura `topicArray` de la Web UI: la API la ignora silenciosamente, aún responde `errCode: 0`, y la regla conecta con un `uplinkTopic` vacío — el gateway no publica nada aunque los dispositivos tengan valores. `GET /api/dsforward/mqtt/:id` devuelve el esquema almacenado autoritativo; ante la duda, haz GET de una regla existente y trata ese eco como el esquema.

```json
PUT /api/dsforward/mqtt/:id            // POST /api/dsforward/mqtt crea una regla
{
  "forwardId": 8, "enable": true, "name": "my-rule",
  "server": "broker.example.com", "port": 1883, "clientID": "eg71-client",
  "connectTimeout": 30, "keepAliveInterval": 60, "dataRetransmission": false,
  "userCredentials": false, "userName": "", "password": "",
  "useTLS": false, "tlsMode": 0, "tlsInsecure": false,
  "tlsRootCert": "", "tlsRootCertName": "",
  "tlsClientCert": "", "tlsClientCertName": "", "tlsClientKey": "", "tlsClientKeyName": "",
  "metadataEnable": true,   "metadataDetails": ["deviceName", "deviceID", "objectName"],
  "globalObjectEnable": true, "globalObjectDetails": ["Frequency", "RSSI", "SNR", "DataRate", "FrameCount"],
  "uplinkTopic": "site/floor1/$devEUI", "uplinkQoS": 0, "uplinkRetain": false,
  "downlinkTopic": "site/floor1/$devEUI/downlink", "downlinkQoS": 0,
  "mcDownlinkTopic": "", "mcDownlinkQoS": 0,
  "onlineTopic": "site/online", "onlineQoS": 0, "onlineRetain": false,
  "offlineTopic": "site/offline", "offlineQoS": 0, "offlineRetain": false,
  "ackTopic": "", "ackQoS": 0, "ackRetain": false,
  "errorTopic": "", "errorQoS": 0, "errorRetain": false,
  "requestTopic": "", "requestQoS": 0,
  "responseTopic": "", "responseQoS": 0, "responseRetain": false,
  "willFunction": false, "willSubject": "", "willQoS": 0, "willRetentionFlag": false, "willMessages": "",
  "payloadFormat": 1
}
```

Notas de campos (verificadas de extremo a extremo en 71.0.0.3, hasta mensajes en un broker público):

- **Plantilla de topic**: `$devEUI` se sustituye por dispositivo; un dispositivo sin devEUI (p. ej. BACnet) recurre a su **nombre de dispositivo**. Un `uplinkTopic` vacío significa que nunca se publica nada.
- **`metadataDetails`** construye el bloque `metadata` por mensaje — claves verificadas: `deviceName`, `deviceID`, `objectName`.
- **`globalObjectDetails`** añade metadatos de radio a mensajes LoRaWAN — claves verificadas: `Frequency`, `RSSI`, `SNR`, `DataRate`, `FrameCount`. Las claves `DeviceEUI`/`FPort` ofrecidas como defaults de UI son **rechazadas** por la API con `invalid global object key`.
- **Conectar / desconectar**: `PUT /api/dsforward/mqtt/connect/:id` con cuerpo `{"forwardId": <id>, "connectAction": true | false}` (POST no se acepta; `connectStatus` en la respuesta refleja el resultado).
- **Payload de uplink** (`payloadFormat: 1`) — un mensaje por valor de objeto, topic = plantilla tras sustitución:

```json
site/floor1/bacnet-controller {"gatewaySN":"6438F153XXXX0000","info":{"objectID":275,"objectValue":21.8},"metadata":{"deviceID":39,"deviceName":"bacnet-controller","objectName":"ROOM_TEMP"}}
```

### 4.5 Data Parsing Library (codecs)

`GET /api/payloadcodecs-short` (lista ligera), `GET/PUT/DELETE /api/payloadcodecs/:id`, `POST /api/payloadcodecs`, `POST /api/payloadcodecs-test`, `POST /api/payloadcodecs-import` (ZIP), `GET /api/dsdevices/export/file/:fileToken`, `POST /api/payloadcodecs-upgrade`, `GET /api/payloadcodecs/:devEUI/device`.

### 4.6 Recursos del LoRaWAN Network Server

`/api/gateways` (mac/name/lat/lon/alt), `/api/urprofiles` (profileID/name/joinType/classType/channelPlan/region), `/api/multicast-groups` (+ `POST /:id/queue` downlink), `/api/fuota/task|devices|official`, `/api/dataflow/list|detail|clear`.

### 4.7 Visor de data flow

`POST /api/dataflow/list` (paginado) con mapa `deviceType` `0=LoRaWAN Node, 1=LoRaWAN Multicast, 2=BACnet MSTP, 3=BACnet IP, 4=KNX TP, 5=Modbus TCP, 6=Modbus RTU over TCP, 7=Modbus RTU` y mapa `dataType` `0=RX,1=TX,2=JnAcc,3=JnReq,4=UpUnc,5=UpCnf,6=DnUnc,7=DnCnf,8=ACK`.

---

## Sección 5 — Guía de integración por flujo

### 5.1 Conectar un dispositivo final (sensor / medidor) y ver sus datos

1. En la **Data Parsing Library** elige o importa un codec para el modelo del sensor, o crea uno personalizado (codec JSON: define `value_type`, length, unit, scale por campo; BOOL/ENUM/TEXT, bytes; downlink vía `raw_downlink`).
2. En **Data Services > Equipment Data > Access Network** asegúrate de que existe el access network correspondiente: LoRaWAN, BACnet IP/MS-TP, Modbus TCP/RTU/RTU-over-TCP, KNX TP. (El baud/parity de RS485 vive en **Network > Interfaces > RS485**.)
3. Agrega el dispositivo (manual, scan o importación en lote). Los dispositivos de protocolo pueden auto-generar sus objetos desde el codec/perfil de protocolo.
4. Abre el dispositivo → lista de objetos; habilita y opcionalmente escala linealmente (`gradient`/`offset`) cada objeto, define su instancia BACnet/Modbus/KNX, unidad, intervalo de poll.
5. Observa valores en vivo en **Data Flow**, o escribe/lee un objeto con las acciones de la fila.

### 5.2 Dispositivos de campo BACnet/IP — prerrequisitos

Cinco condiciones, verificadas de extremo a extremo en firmware 71.0.0.3 (descubrimiento → valores en vivo → forwarding MQTT):

1. **Access network primero.** Crea el access network BACnet IP y binde a la interfaz que mira a los dispositivos. Su `udpPort` lo bindea el propio gateway — si otro servicio del gateway ya ocupa ese puerto (el servidor BACnet integrado usa 47808 por defecto), el access network no puede levantarse; dale a cada access network BACnet IP su propio puerto libre.
2. **Mismo dominio de broadcast.** El descubrimiento viaja en broadcasts BACnet/IP (Who-Is / I-Am) dentro del segmento L2 de la interfaz bindeada; tras el descubrimiento el gateway hace poll a cada dispositivo por **unicast** a la dirección aprendida de su I-Am. No hay configuración IP/puerto por dispositivo — el gateway aprende la dirección de cada dispositivo de sus respuestas.
3. **Lado del dispositivo.** El dispositivo debe responder broadcasts en el puerto UDP del access network y correr en un **host separado** del gateway. Un simulador BACnet bindeado a una dirección específica, o corriendo en el propio host del gateway (incluido en su Docker), no será descubierto — bindealo a todas las interfaces (`0.0.0.0:<puerto>`) en su propio host.
4. **Objetos y polling.** Tras agregar el dispositivo, crea sus objetos y define el `interval` de poll (por defecto 60 s). `currentValue` se refresca una vez por ciclo — la lista de objetos muestra el contador de actualización para confirmar que los valores están vivos.
5. **El borrado es destructivo.** Borrar un access network borra cada dispositivo bajo él **junto con todos sus objetos** — no hay deshacer.

### 5.3 Reenviar datos a una nube / BMS

- **MQTT**: crea una regla de forwarding MQTT (host/puerto del broker, client ID, user/pass, keepalive), luego mapea dispositivos/objetos al payload. El gateway publica actualizaciones de valor y confirma escrituras. TLS y certificados de cliente soportados. (¿Scriptar la regla por API? Lee §4.4.1 primero — el esquema de topics almacenado difiere del formulario de la Web UI.)
- **HTTP**: crea una regla de forwarding HTTP con una o más URLs destino, headers personalizados y ajustes TLS. Elige el formato de cuerpo JSON que espera la plataforma (habilita "customized data format" donde aplique).
- **BACnet/IP o Modbus TCP**: habilita el servidor integrado, elige la interfaz, luego expone los objetos de dispositivo seleccionados como objetos BACnet / registros Modbus. BBMD (broadcast management) configurable para redes enrutadas.
- **Platform (nube)**: conecta a Milesight Development Platform o DeviceHub v2 desde la página **Platform**, o a un NS de terceros (TTN, ChirpStack, Actility…) deshabilitando el NS embebido y apuntando el gateway a él como packet forwarder.

### 5.4 Conectar a un BMS (Niagara / Tridium y similares)

- **El BMS lee del gateway** — la dirección habitual de supervisión. Habilita el **servidor BACnet/IP** integrado (Data Services: interfaz, puerto UDP, instancia y nombre de dispositivo BACnet), luego expone los objetos de dispositivo que necesites. Un JACE/Supervisor Niagara descubre el gateway con su driver BACnet/IP estándar y lee esos objetos como cualquier otro dispositivo BACnet. Habilita **BBMD** solo cuando el BMS y el gateway están en redes enrutadas distintas. Para un BMS centrado en Modbus, usa el **servidor Modbus TCP** integrado del mismo modo.
- **Bus de campo hacia el BMS vía el gateway** — los dispositivos de campo BACnet/Modbus/KNX son recolectados por el gateway (ver los prerrequisitos BACnet/IP de arriba), luego reenviados por MQTT/HTTP al head end; las escrituras de control fluyen de vuelta por escrituras de objetos.
- Los objetos siguen el modelo estándar de objetos BACnet (Analog Value / Analog Input / Binary I/O, …), así que no se necesita mapeo propietario del lado del BMS. La certificación BACnet BTL aún estaba pendiente al momento del datasheet — ver el overview del producto.

### 5.5 Downlink / control

- Escribe un valor de objeto de dispositivo (write/relay/queue) desde la Web UI o API (cola downlink LoRaWAN vía `POST /api/urdevices/:devEUI/queue`; escrituras BACnet/Modbus vía `POST /api/dsdevices/objects/read-write`).
- Multicast: programa `POST /api/multicast-groups/:id/queue` para grupos Class-C.
- FUOTA: crea tareas de actualización de firmware para modelos de dispositivo soportados desde `Equipment Data > LoRaWAN Configuration > FUOTA`.

### 5.6 Edge computing

- **Node-RED**: habilita desde **App > Node-RED**, luego abre `/node-red` en el gateway. Los flows pueden consumir y republicar el JSON reenviado.
- **Python SDK**: instala desde **App > Python**, escribe scripts (p. ej. poll de un registro Modbus y push a un webhook).
- **Docker**: el EG71 soporta contenedores Docker para servicios personalizados en el gateway.

### 5.7 Red y acceso remoto

- Configura WAN (DHCP/estático/PPPoE), subred LAN + servidor DHCP, Wi-Fi AP/cliente y modo bridge en **Network > Interfaces**.
- Para uplinks resilientes configura **Link failover** (WAN + celular + prioridades).
- Abre una **VPN** (OpenVPN client/server, IPsec, WireGuard, L2TP, PPTP) para que un NOC remoto alcance el gateway.
- Restringe acceso vía **Firewall** (nivel de seguridad, ACL, DMZ, port mapping) y comunidades/usuarios SNMP.
- Alerta ante eventos (enlace caído, corte celular, dispositivo offline) con reglas de notificación de **System > Events** entregadas a grupos de e-mail/SMS.

### 5.8 Plataforma y flota

- Registra el gateway en una flota para que una consola central Milesight/DeviceHub gestione muchos gateways (flota = un conjunto de perfiles y codecs empujados a los miembros).
- Gestiona usuarios (admin lectura-escritura / solo lectura), API keys, y habilita el servicio remoto solo cuando se necesite.

---

## Sección 6 — Ejemplos de extremo a extremo

### 6.1 Node.js (fetch)

```js
// 1) login JWT
import crypto from 'node:crypto';
const encrypt = pw => {                                  // AES-128-CBC (PKCS7 auto), clave/IV fijos del firmware
  const c = crypto.createCipheriv('aes-128-cbc', '4829173051647823', '7603912845091736');
  return Buffer.concat([c.update(pw, 'utf8'), c.final()]).toString('base64');
};
const r1 = await fetch('http://<gateway>/api/internal/login', {method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({username:'admin', password: encrypt(pw)})});
const { jwt } = await r1.json();

// 2) listar dispositivos
const r2 = await fetch('http://<gateway>/api/dsdevices/device', {method:'POST',
  headers:{'Content-Type':'application/json', Authorization:`Bearer ${jwt}`},
  body: JSON.stringify({page:1, pageSize:10})});
const list = await r2.json();            // { errCode:0, deviceResult:[...], devTotalCount }

// 3) lectura de config CGI (espacia llamadas CGI ≥500 ms)
const enc = btoa(`login=admin;${td}`);   // td de un login /cgi previo
const r3 = await fetch('http://<gateway>/cgi', {method:'POST', headers:{'Content-Type':'application/json',
  Authorization:`Bearer login=admin;${td}`},
  body: JSON.stringify({execute:1, core:'yruo_loragw', function:'get', values:[{base:'radios'}], id:1})});
const cfg = await r3.json();             // { status:0, result:[{ get:[...] }] }
```

---

## Sección 7 — Buenas Prácticas y Notas Operativas

- Nunca envíes contraseñas en claro; la API de login espera la forma AES-CBC+Base64 usada por la Web UI.
- Las respuestas CGI embeben el `model`/`pn`/`rtver` del dispositivo; un front end o agente debe leer el valor que necesita en lugar de asumir un número de parte fijo.
- Algunas configs `core:base` (p. ej. Ethernet WAN) requieren un paso **apply**; verifica el campo `reboot` devuelto antes de considerar un cambio comprometido.
- API keys: el EG71 soporta API keys con alcance (solo lectura / lectura-escritura, expiración) creadas desde `System > User > API Key Management` para uso máquina-a-máquina en lugar de la contraseña admin.
- Verifica cada create/update con una lectura posterior — incluye `"isSave": true` en creates de dispositivos y confirma que aparecen en listados.

---

## Sección 8 — Solución de Problemas

| Síntoma | Causa probable / solución |
| ------- | ------------------------- |
| `Session not found` (`status:-32001`) | Sesión CGI vencida (`ystimeout`). Repite el login. |
| `503` en ráfagas CGI | Rate limit: espacia ≥ 500 ms. |
| Create de dispositivo parece funcionar pero no guarda | Falta `"isSave": true` en el cuerpo; la respuesta lleva `deviceId: "0"`. Reenvía con `isSave:true` y confirma con una lectura. |
| `GET /api/urdevices/:devEUI` → 405 | No disponible; usa `GET /api/urdevices/simple/:id` (id numérico de la lista) o la lista agregada y filtra por `devEUI`. |
| Access network BACnet no levanta | Conflicto de puerto: el servidor BACnet integrado bindea 47808 por defecto. Usa un puerto libre distinto. |
| Scan BACnet "no encuentra nada" | Juzga por `GET .../scan/devices/list` (lleva `address`), no por la respuesta de `scan/stop` (eco del rango configurado). |
| Regla MQTT conecta pero no publica | `uplinkTopic` vacío, o enviaste `topicArray` (la API lo ignora). Usa el esquema plano de §4.4.1. |
| Borrado de access network "rompió todo" | El borrado hace cascada: elimina dispositivos y objetos bajo él. No hay deshacer. |

---

> *Documento educativo derivado del material oficial del fabricante. Para parámetros y comportamientos exactos, consulta el espejo local [`docs/llms/`](./docs/llms/) y tu firmware específico.*

---

## Navegación

| Sección | Enlace |
| ------- | ------ |
| Descripción general de la plataforma | [README.md](./README.md) |
| Apéndice A — endpoints, errCodes y mapa core/base | [APENDICE-A.md](./APENDICE-A.md) |
| Historial de actualizaciones | [HISTORIAL-ACTUALIZACIONES.md](./HISTORIAL-ACTUALIZACIONES.md) |
| MILESIGHT — índice de plataformas | [../README.md](../README.md) |
| Índice de marcas | [../../README.md](../../README.md) |
