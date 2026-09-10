# EG71 HTTP & API Guide

Two HTTP surfaces are available on the gateway. Both are reachable on the gateway IP (HTTP or HTTPS as configured). Endpoints in this guide were verified against firmware **71.0.0.2/71.0.0.3**; the response fields below match the live device.

| Surface | Base path | Auth | Use for |
|---|---|---|---|
| CGI backend | `POST /cgi` | `Authorization: Bearer login=<user>;<td>` | Network, VPN, Firewall, System, LoRa radio, Platform, App settings |
| REST API backend | `/api/*` | `Authorization: Bearer <JWT>` | Device/equipment management, codec library, data forwarding, LoRaWAN NS, access networks |

Rules of thumb:
- **Config pages** (Network/System/Platform/App) → CGI.
- **Data Services** (devices, codecs, forwarding) → REST.
- Device & forwarding **object counts** are always derived from real data; don't hard-code them.
- Success envelope is `{errCode: 0, errMsg: "success", ...}` for REST and `{status: 0, result:[...]}` for CGI.
- **Rate limit**: CGI backend spaces requests ≥ **500 ms**; burst faster returns `503 Service Temporarily Unavailable`.

## 1. Authentication

### 1.1 CGI login (Web/GUI sessions)

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

Password is AES-128-CBC encrypted (PKCS7) then Base64. The firmware ships with a **fixed key and IV** (identical on every device, also embedded in the Web UI JS) — key `4829173051647823`, IV `7603912845091736`, each 16 ASCII bytes. On success:

```json
{ "status": 0,
  "result": [{ "ysrole": 4, "ystimeout": 3600, "ysexpires": 3599,
               "username": "admin", "td": "<hash>" }] }
```

`td` becomes the CGI token: subsequent `/cgi` calls carry `Authorization: Bearer login=admin;<td>`. `ysrole`: 4 = admin. The CGI session expires after `ystimeout` seconds (3600 typical) — an expired session answers `{"status":-32001,"errMsg":"Session not found"}`; re-login. Failure returns `status: -2` with `chance` (remaining attempts) / `locktime`.

### 1.2 REST/JWT login

```
POST /api/internal/login
```

```json
{ "username": "admin", "password": "<AES-128-CBC(Base64)>" }
```

Response `{ "jwt": "eyJ..." }` (claims `aud/iss = lora-app-server`, `sub = user`, ~24 h). Use it as `Authorization: Bearer <jwt>` on `/api/*`.

### 1.3 Session check & logout

```
POST /islogin                       # -> {status:0, result:[{login:"true", ysrole:4, ...}]}
POST /logout
```

### 1.4 Browser token storage

Web UI stores: `token` (JWT), `cgi_token` (`login=admin;<td>`), `EG7X.lang`, `EG7X.theme` in localStorage. An API client keeps the two bearer tokens the same way.

### 1.5 Page initialization (what the UI calls every page switch)

| Request | Purpose |
|---|---|
| `POST /islogin` | session + device info |
| `POST /cgi` `yruo_usermanagement:security` | permission |
| `POST /cgi` `yruo_usermanagement:check_pass` | default-password check |
| `POST /cgi` `yruo_wizard:yruo_wizard` | wizard state |
| `POST /cgi` `yruo_system:general` | base system config |
| `GET /api/general-info/interface/with-access-info` | interface map |
| `POST /cgi` `yruo_status:dashboard` | dashboard state |

## 2. CGI request / response envelope

```json
{ "execute": 1, "core": "<core>", "function": "get|set|add|del|order|apply",
  "values": [{ "base": "<base>", "index": <row>, "value": { ...fields } }], "id": 1 }
```

```json
{ "id": 1, "model": "EG71", "pn": "<24-char part number>", "oem": "0000",
  "rtver": "71.0.0.x", "status": 0, "result": [{ "get": [...], "grey": 0 }] }
```

`core`/`base` below are the exact names the Web UI sends. For config writes, most pages first `get`, then `set` on the same `core:base`, then `yruo_apply:apply` (returns `{reboot: 0}` unless a reboot is needed).

### CGI core/base map (config modules)

| Page | core | base(s) |
|---|---|---|
| Dashboard status | `yruo_status` | `dashboard` (60+ fields) |
| Ethernet drawer | `yruo_status` | `yruo_ethernet` |
| Ethernet WAN/LAN/Bridge/Port/DHCP | `yruo_wan` / `yruo_lan` / `yruo_bridge` / `yruo_port` / `yruo_dhcpserver` | same as core |
| Wireless | `yruo_wifi` / `yruo_scan` | `yruo_wifi` / `yruo_scan` |
| Cellular | `yruo_cell` | `yruo_cell` |
| LoRaWAN radio | `yruo_loragw` | `ns_general`, `radios`, `advanced`, `radios_spectral_scan` |
| RS485 (REST) | — | see §3.3 |
| Firewall | `yruo_firewall_security/acl/dmz/mac_binding/port_mapping` | same as core |
| DDNS | `yruo_ddns` | `yruo_ddns` |
| Link failover | `yruo_if_backup` | `yruo_if_backup` |
| OpenVPN client/server | `yruo_vpn_openvpn_client` / `..._server` | same |
| IPsec / L2TP / PPTP / WireGuard | `yruo_vpn_ipsec` / `yruo_vpn_l2tp` / `yruo_vpn_pptp` / `yruo_wireguard` | same |
| VPN certs/status | `yruo_vpn_certificate` / `yruo_vpn_status` | same |
| System general/time | `yruo_system` | `general`, `time` |
| NFC | `yruo_nfc_mng` | `nfc` |
| Users/security | `yruo_usermanagement` | `security`, `user_list` |
| SMTP/email | `yruo_system` | `smtp`, `email`; `yruo_phone:yruo_phone` for SMS |
| Cloud platform | `yruo_cloud` | `cloud_manage`, `auto_provision` |
| SNMP | `yruo_snmp` | `system`, `view`, `vacm`, `trap`, `mib` |
| Events | `yruo_events` | `event_list` |
| Schedule | `yruo_schedule` | `schedule` |
| Maintenance tools | `yruo_tools` | `ping`, `traceroute`, `tcpdump`, `qxdm` (start/poll `is_finish`/stop) |
| Python | `yruo_python` | `status`, `python_sdk`, `appmanager`, `python_apps` |
| Node-RED | `yruo_loragw` | `node_red`, `node_red_ssl` |
| Log | `yruo_log` | `system_log` |
| Upgrade | `yruo_upgrade` | `upgrade` |
| Apply | `yruo_apply` | (check/apply for pending config) |

Example — read radio config:

```
POST /cgi
{"execute":1,"core":"yruo_loragw","function":"get","values":[{"base":"radios"}],"id":1}
```

Example — set hostname:

```
POST /cgi
{"execute":1,"core":"yruo_system","function":"set",
 "values":[{"base":"general","index":0,"value":{"hostname":"my-eg71"}}],"id":9}
```

### 2.1 Maintenance tools pattern (ping / traceroute / tcpdump / QXDM)

`start` → poll the same core/base for an `is_finish` flag (fields like result lines) → `stop`. Tcpdump/QXDM use `get → tcpdump_start → tcpdump_stop`.

## 3. REST `/api/*` reference

All REST responses wrap business data as `{ errCode: 0, errMsg: "success", ... }`.

**Verify every create/update with a follow-up read — success codes alone are not reliable** (both behaviors verified on 71.0.0.3):

- Device-create endpoints return a success-shaped envelope even when **nothing is saved** if the request body lacks `"isSave": true`. The tell is `deviceId: "0"` in the response — `{"errCode":0,"errMsg":"success","deviceId":"0"}` on `.../device/bacnet/create`, `{"errCode":200,"errMsg":"","deviceId":"0"}` on `/api/urdevices`. Include `"isSave": true` and confirm the record shows up in a list/read.
- Some failures return bare numeric `errCode`s with no explanatory `errMsg`. Semantics are not documented; treat them as "not applied", resolve the underlying condition, then confirm state with a GET.

| Observed response | Where seen | Reading |
|---|---|---|
| `errCode: 0, errMsg: "success"` | most REST reads/creates | OK — but re-read after writes (see the `isSave` trap above) |
| `errCode: 200, errMsg: ""` | `POST /api/urdevices` | request accepted — whether it stored depends on `deviceId` in the same response (`"0"` = nothing saved, a real id = stored) |
| `errCode: 10010011 / 10010008` | access-network create/rebind | unstructured failure (port-conflict contexts observed) |
| `errCode: 10020001 / 10020002` | BACnet device-scan polling | unstructured scan-state codes |

### 3.1 Equipment Data (device management)

| Method & path | Notes |
|---|---|
| `POST /api/dsdevices/device` | device list (paged); filters `protocolType[]/deviceType[]/deviceNameOrEui/status`, `page/pageSize/orderBy`; returns `id, name, deviceEui, protocolType, deviceType, status, objectCount, signal, accessNetworkId, payloadCodecID` |
| `GET /api/dsdevices/device/io` | I/O device list (UI/DI/AO/DO; front-end paged) |
| `PUT /api/dsdevices/device/io/update/:id` · `PUT .../copy/:id` | edit / copy I/O device |
| LoRaWAN devices | `POST /api/urdevices` (create OTAA/ABP), `GET /api/urdevices/simple/:id` (read by numeric device id from the device list — `GET /api/urdevices/:devEUI` returns **405**), `POST /api/urdevices/:devEUI/queue` (downlink write) |
| BACnet / Modbus / KNX devices | `POST /api/dsdevices/device/{bacnet,modbus,knx}/create`, `PUT /api/dsdevices/device/{...}/update/:id`, `GET /api/dsdevices/device/{...}/:id` |
| Device objects (common) | `GET /api/dsdevices/objects/:deviceId`, `POST /api/dsdevices/objects/create`, `PUT /api/dsdevices/objects/update/:id`, `POST /api/dsdevices/objects/delete`, `POST /api/dsdevices/objects/enable`, `POST /api/dsdevices/objects/copy` |
| Protocol object lists | `GET /api/dsdevices/objects/{bacnet,modbus,knx}/:deviceId`, `POST .../pc-create`, `PUT /api/dsdevices/objects/{bacnet,modbus,knx}/:objectId`, `POST .../read-write` |
| Object add-from-codec lists | `GET /api/dsdevices/objects/addlist/:deviceId` (LoRaWAN), `.../addlist/{bacnet,modbus,knx}/:deviceId` |
| Object read/write + poll | `POST /api/dsdevices/objects/read-write`, `GET /api/dsdevices/objects/read-status/:objectId`, `GET .../{protocol}/simple/:objectId` |

Key object fields by protocol: LoRaWAN (`enable, name, type, instanceId, currentValue, gradient/offset, unitId`); BACnet (`+interval, polarity, inactiveText/activeText, releaseDefault, stateText, cov`); Modbus (`registerType: coil/discrete/holding/input, registerAddress 0-65535, dataType: INT16..64/UINT/Float/Flag, registerNumber auto`); KNX (`groupAddress m/n/s, dataPoint, flag 1..3, interval`).

#### 3.1.1 Create examples (request bodies verified on 71.0.0.3)

Device creates need `"isSave": true` (see the warning atop §3). A BACnet/IP device carries **no** IP/port fields — the gateway learns the device address from BACnet discovery traffic:

```json
POST /api/dsdevices/device/bacnet/create
{ "name": "bacnet-controller", "deviceId": "575", "protocolType": "bacnet ip",
  "accessNetworkId": "9", "payloadCodecID": "0", "description": "VAV controller 575",
  "isSave": true }
```

LoRaWAN OTAA device (`profileID` from `/api/urprofiles`; with a matching `payloadCodecID` its objects can be created in bulk afterwards):

```json
POST /api/urdevices
{ "name": "em300-th", "devEUI": "24E124136F499999", "appKey": "<16-byte hex AppKey>",
  "profileID": "<uuid from /api/urprofiles>", "payloadCodecID": "30",
  "supportsJoin": true, "skipFCntCheck": true, "fCntUp": 0, "fCntDown": 0, "fPort": 1,
  "isDefaultAppKey": false, "timeoutEnable": false, "timeout": "1440",
  "deviceType": "EM300-TH", "protocolType": "lorawan", "accessNetworkId": "1",
  "appName": "", "mbMode": "", "mbFramePort": "0", "mbTcpPort": "0",
  "description": "...", "isSave": true }
```

Objects — per-protocol create (BACnet shown; `interval` = value poll period in seconds), or bulk-create from a codec's object list:

```json
POST /api/dsdevices/objects/bacnet/create
{ "name": "ROOM_TEMP", "type": "Analog-Value", "instanceId": 0,
  "description": "...", "interval": 60, "unitId": "95", "deviceId": 39 }

POST /api/dsdevices/objects/create
{ "deviceId": 37, "objectIdList": [701, 702, 703] }
```

The bulk `objectIdList` ids come from `GET /api/dsdevices/objects/addlist/:deviceId`; objects created this way arrive already enabled, and a BACnet object's `currentValue` starts updating on the next poll cycle.

#### 3.1.2 BACnet/IP discovery (scan) — verified workflow

The gateway discovers BACnet devices by broadcasting Who-Is on the access network's UDP port; devices answer with I-Am and the gateway learns their addresses. API flow (verified end-to-end on 71.0.0.3 against a live device):

| Step | Request | Notes |
|---|---|---|
| 1. Configure & start | `POST /api/dsdevices/bacnet/scan/config` with `{"accessNetworkId":9,"minInstanceId":575,"maxInstanceId":575}` | arms **and starts** the scan; response `{errCode:0, result:{hasScan:true, lastScanTime:"..."}}` |
| 2. Poll results | `GET /api/dsdevices/bacnet/scan/devices/list?page=1&pageSize=2000&deviceOrderName=bacnet_network_device_id&deviceOrderType=asc&accessNetworkId=9` | rows carry the **real address** and are the authoritative discovery result: `{"deviceId":"16","deviceName":"LLMSTEST-BAC0","instanceId":575,"select":true,"address":"192.168.44.114","hasScanObject":false,"objectCount":"0"}` — `deviceId` here is the scan-entry id, **not** the id of a created device |
| 3. Stop | `POST /api/dsdevices/bacnet/scan/stop` with `{}` | ⚠️ the `deviceList` inside the **stop response is an echo of the configured instance range, not the discovery result** (it always lists `minInstanceId..maxInstanceId` even when nothing was found). Judge discovery by the devices/list rows, which carry `address` |

Scan-state errors are numeric but do carry text: `10020001 "not bacnet scan is running"`, `10020002 "bacnet scan is already running"`.

Three further scan endpoints exist for the Web UI's per-device object reading — `POST /api/dsdevices/bacnet/scan/single`, `POST /api/dsdevices/bacnet/scan/objects/list` (`{accessNetworkId, deviceId, page, pageSize}`), and `POST /api/dsdevices/objects/bacnet/scan/create` (create a device from a scan entry). Their full request semantics were not reliably reproducible via API; when scripting, prefer reading addresses from the discovery list and creating devices explicitly via `.../device/bacnet/create` (§3.1.1).

### 3.2 Access Networks

`GET/POST /api/access-network`, `DELETE /api/access-network/:id`, per-protocol detail `GET /api/access-network/{bacnet,modbus,knx}/simple/:id`, per-protocol update `PUT /api/access-network/bacnet/:id`. LoRaWAN is the only type whose config lives in CGI (`yruo_loragw:ns_general` → `channel_plan`, `region_freq`), not this API.

Max instances per type: LoRaWAN 1, BACnet IP 3, BACnet MS/TP 2, Modbus TCP 4, Modbus RTU 2, Modbus RTU over TCP 4, KNX 1.

BACnet IP body (verified; `deviceId` is the gateway's **own** BACnet device instance number, `udpPort` is the UDP port the **gateway itself** binds on `interface`):

```json
POST /api/access-network/bacnet                  // update with PUT /api/access-network/bacnet/:id
{ "type": "bacnet ip", "interface": "eth1", "deviceId": 1390425, "udpPort": 47808,
  "timeout": 1000, "retry": 2, "keepAliveInterval": 60,
  "name": "BACnetIP_1", "mac": 0, "maxMaster": 0, "maxInfoFrames": 0 }
```

Two behaviors worth treating as landmines (both hit during live testing):

- **Port ownership is exclusive and sticky.** If another service on the gateway holds the port — the built-in BACnet server binds 47808 by default; third-party containers may hold others — the access network cannot come up, and re-creating it against a still-held port keeps failing until whatever holds the port is removed. Give each BACnet IP access network its own free port.
- **Delete cascades.** `DELETE /api/access-network/:id` deletes every device **and all its objects** under that access network, with no undo.

### 3.3 RS485

`GET /api/access-network/rs485` and `POST /api/access-network/rs485`. Body is keyed by port name (`rs485-1`, `rs485-2`) with `{baudRate, dataBits, stopBits, parity}`.

### 3.4 Data Forwarding

| Method & path | Notes |
|---|---|
| `GET /api/dsforward` | forwarding rules (each has `objectCount/deviceCount`) |
| MQTT | `POST /api/dsforward/mqtt`, `PUT /api/dsforward/mqtt/:id`, `PUT /api/dsforward/mqtt/connect/:id` (connect/disconnect — body shape in §3.4.1) |
| HTTP | `POST /api/dsforward/http`, `PUT /api/dsforward/http/:id` |
| Modbus server | `POST /api/protocol/modbus_server/add`, `/set`, `/del`; objects `POST /api/protocol/modbus_object/{add,set,get,del,getall,switch}` |
| BACnet server | `POST /api/protocol/bacnet_server/add`, `/set`, `/del`; objects `POST /api/protocol/bacnet_object/*` (+ `delNc`) |
| Forwarding objects | `POST /api/dsforward/objects/add|delete|enable|addlist`, `GET/POST /api/dsforward/devices/*` |
| Limits | HTTP 10, MQTT 10, Modbus 15, BACnet 4 rules |

Form fields: **HTTP** `name, urlArray[], headers, tlsMode, useTLS, tlsRootCertName, tlsClientCertName/KeyName, enable`; **MQTT** — see §3.4.1, the topic schema needs care; **Modbus** `name, ipAddr, ipPort, interface, slaveId, enable`; **BACnet** `name, ipPort, interface, deviceId, deviceName, bbmdEnable/Type/Ip/Port/Bdt/ToLive, globalObjects...`.

#### 3.4.1 MQTT rules — the stored schema is flat (important)

The API stores MQTT topics as **flat fields**. Do **not** send the Web UI's `topicArray` structure: the API silently ignores it, still answers `errCode: 0`, and the rule then connects with an empty `uplinkTopic` — the gateway publishes nothing even though devices have values. `GET /api/dsforward/mqtt/:id` returns the authoritative stored schema; when in doubt, GET an existing rule and treat that echo as the schema.

```json
PUT /api/dsforward/mqtt/:id            // POST /api/dsforward/mqtt creates a rule
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

Field notes (verified end-to-end on 71.0.0.3, up to messages on a public broker):

- **Topic template**: `$devEUI` is substituted per device; a device without a devEUI (e.g. BACnet) falls back to its **device name**. An empty `uplinkTopic` means nothing is ever published.
- **`metadataDetails`** builds the per-message `metadata` block — verified keys: `deviceName`, `deviceID`, `objectName`.
- **`globalObjectDetails`** appends radio metadata to LoRaWAN messages — verified keys: `Frequency`, `RSSI`, `SNR`, `DataRate`, `FrameCount`. The `DeviceEUI`/`FPort` keys offered as UI defaults are **rejected** by the API with `invalid global object key`.
- **Connect / disconnect**: `PUT /api/dsforward/mqtt/connect/:id` with body `{"forwardId": <id>, "connectAction": true | false}` (POST is not accepted; `connectStatus` in the response reflects the outcome).
- **Uplink payload** (`payloadFormat: 1`) — one message per object value, topic = template after substitution:

```json
site/floor1/bacnet-controller {"gatewaySN":"6438F153XXXX0000","info":{"objectID":275,"objectValue":21.8},"metadata":{"deviceID":39,"deviceName":"bacnet-controller","objectName":"ROOM_TEMP"}}
```

### 3.5 Data Parsing Library (codecs)

`GET /api/payloadcodecs-short` (light list), `GET/PUT/DELETE /api/payloadcodecs/:id`, `POST /api/payloadcodecs`, `POST /api/payloadcodecs-test`, `POST /api/payloadcodecs-import` (ZIP), `GET /api/dsdevices/export/file/:fileToken`, `POST /api/payloadcodecs-upgrade`, `GET /api/payloadcodecs/:devEUI/device`.

### 3.6 LoRaWAN Network Server resources

`/api/gateways` (mac/name/lat/lon/alt), `/api/urprofiles` (profileID/name/joinType/classType/channelPlan/region), `/api/multicast-groups` (+ `POST /:id/queue` downlink), `/api/fuota/task|devices|official`, `/api/dataflow/list|detail|clear`.

### 3.7 Data flow viewer

`POST /api/dataflow/list` (paged) with `deviceType` map `0=LoRaWAN Node, 1=LoRaWAN Multicast, 2=BACnet MSTP, 3=BACnet IP, 4=KNX TP, 5=Modbus TCP, 6=Modbus RTU over TCP, 7=Modbus RTU` and `dataType` map `0=RX,1=TX,2=JnAcc,3=JnReq,4=UpUnc,5=UpCnf,6=DnUnc,7=DnCnf,8=ACK`.

## 4. End-to-end example (Node fetch)

```js
// 1) JWT login
import crypto from 'node:crypto';
const encrypt = pw => {                                  // AES-128-CBC (PKCS7 auto), fixed firmware key/IV
  const c = crypto.createCipheriv('aes-128-cbc', '4829173051647823', '7603912845091736');
  return Buffer.concat([c.update(pw, 'utf8'), c.final()]).toString('base64');
};
const r1 = await fetch('http://<gw>/api/internal/login', {method:'POST', headers:{'Content-Type':'application/json'},
  body: JSON.stringify({username:'admin', password: encrypt(pw)})});
const { jwt } = await r1.json();

// 2) list devices
const r2 = await fetch('http://<gw>/api/dsdevices/device', {method:'POST',
  headers:{'Content-Type':'application/json', Authorization:`Bearer ${jwt}`},
  body: JSON.stringify({page:1, pageSize:10})});
const list = await r2.json();            // { errCode:0, deviceResult:[...], devTotalCount }

// 3) CGI config read (space CGI calls ≥500 ms)
const enc = btoa(`login=admin;${td}`);   // td from a /cgi login first
const r3 = await fetch('http://<gw>/cgi', {method:'POST', headers:{'Content-Type':'application/json',
  Authorization:`Bearer login=admin;${td}`},
  body: JSON.stringify({execute:1, core:'yruo_loragw', function:'get', values:[{base:'radios'}], id:1})});
const cfg = await r3.json();             // { status:0, result:[{ get:[...] }] }
```

## 5. Security & operational notes

- Never send plaintext passwords; the login API expects the AES-CBC+Base64 form used by the Web UI.
- CGI responses embed the device `model`/`pn`/`rtver`; a front end or agent should read the value it needs rather than assuming a fixed part number.
- Some `core:base` configs (e.g. Ethernet WAN) require an **apply** step; verify the returned `reboot` field before considering a change committed.
- API keys: EG71 supports scoped API keys (read-only / read-write, expiry) created from `System > User > API Key Management` for machine-to-machine use instead of the admin password.