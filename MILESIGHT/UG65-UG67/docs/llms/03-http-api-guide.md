# UG65 HTTP & API Guide

The UG65 gateway serves an HTTP interface at `http://<gateway-ip>` (HTTPS with a self-signed certificate on recent firmware; plain HTTP redirects to it). Most configuration goes through the CGI endpoint `POST /cgi`; the embedded LoRaWAN Network Server also exposes a ChirpStack-style `/api/*` surface. All behaviors below were verified against firmware **60.0.0.49** on a live device.

| Surface | Base path | Auth | Use for |
|---|---|---|---|
| CGI backend | `POST /cgi` | `Authorization: Bearer login=<username>;<td>` | All Web GUI functions: status, packet-forward, NS settings, protocol servers, network, system, maintenance, apps |
| REST API | `/api/*` | `Authorization: Bearer <JWT>` (from `/api/internal/login`) | ChirpStack-style NS: devices, applications, integrations, codecs, profiles, FUOTA, multicast, gateways, packets, BACnet objects |
| Session | `POST /islogin`, `POST /logout` | bearer | login-state check |

Conventions:

- CGI response envelope: `{id, model:"UG65", pn, oem, rtver, status, result:[...]}`; success `status:0`. An invalid/expired CGI session answers `{"status":-2,"result":[-32001,"Session not found"]}` — re-login.
- REST responses are per-endpoint: business endpoints answer `{"code":200,"error":""}`-style; list endpoints return Milesight-wrapped JSON (see §3.1); auth failures are HTTP 401 with `{"error":"authentication failed: ...","code":16}`.
- **Rate limit**: keep CGI calls spaced ≥ 500 ms; bursts return `503`.
- Username/password are never sent in plaintext — both backends expect **AES-128-CBC (PKCS7) → Base64** (§1).
- The CGI session expires after `ystimeout` seconds (3600 typical; the login response carries `ystimeout`/`ysexpires`).

## 1. Authentication

### 1.1 CGI login (Web GUI)

```
POST /cgi   Content-Type: application/json
```

```json
{
  "id": "1", "execute": 1, "core": "user", "function": "login",
  "values": [{ "username": "admin", "password": "<AES-128-CBC Base64>", "base": "web_login" }]
}
```

The firmware ships with a **fixed key and IV** (identical on every device, also embedded in the Web UI JS): key `1111111111111111`, IV `2222222222222222`, 16 ASCII bytes each, AES-128-CBC with PKCS7 padding, then Base64. Login failure returns `status:-2` with `result[0].chance` (remaining attempts) / `locktime` (seconds).

Success:

```json
{ "id":"1", "model":"UG65", "pn":"...", "rtver":"60.0.0.49", "status":0,
  "result": [{ "ysrole":4, "ystimeout":3600, "ysexpires":3599, "username":"admin", "td":"<hash>" }] }
```

`td` forms the CGI session: send `Authorization: Bearer login=admin;<td>` on every subsequent `/cgi` call. `ysrole`: 4 = admin.

### 1.2 REST login (ChirpStack-style)

```
POST /api/internal/login   {"username":"admin","password":"<AES-128-CBC Base64>"}
→ {"jwt":"eyJ..."}
```

Use `Authorization: Bearer <jwt>` on `/api/*`. The JWT carries ChirpStack claims (`aud`/`iss` = the embedded NS identity, `sub` = user, `username`).

### 1.3 Session check & logout

```
POST /islogin   → {status:0, result:[{login:"true", ysrole:4, ...}]}
POST /logout
```

### 1.4 The HTTP API account

`System > User > HTTP API` manages a dedicated API account: Type `1` Synchronize (uses the Web GUI account — no separate credentials) or `2` Separate (its own `username`/`password`). Type 2 saves via CGI on `yruo_usermanagement:api_user_list` with `function: add` (create) / `set` (update, includes `old_username`) / `delete`. This is the recommended credential for third-party scripts instead of the admin account; it logs in through the same `/cgi` and `/api/internal/login` endpoints.

## 2. CGI core/base reference (Web UI modules)

The front-end calls `POST /cgi` with `{id, execute:1, core, function, values:[{base, index, value}]}`. Function is `get` / `add` / `set` / `delete` / `order`; config pages typically read, write, then re-read. The core/base names below are exactly what the shipped UI sends (captured from real devices).

| UI module | core | base(s) |
|---|---|---|
| Status | `yruo_status` | `summary`, `yruo_celluar`, `yruo_status_network`, `yruo_status_route`, `yruo_status_dhcp` |
| Wireless status | `yruo_wifi_status` | `yruo_wifi_status` |
| VPN status | `yruo_vpn_status` | `yruo_vpn_status` |
| Packet Forward (NS/general) | `yruo_loragw` | `ns_general`, `general_conf`, `radios`, `advanced`, `custom`, `recv` (traffic) |
| BACnet server | `yruo_bacnet` | `server`, `get_notification` |
| Wireless config | `yruo_wifi` | `yruo_wifi` |
| Cellular config | `yruo_cell` | `yruo_cell` |
| Industrial (IO/serial/GPS/Bluetooth, variant) | `yruo_industrial_*`, `yruo_io_*`, `yruo_bluetooth_*`, `yruo_bluetooth_status`, `yruo_industrial_gps_status` | matching per page |
| Network interfaces | `yruo_wan` / `yruo_lan` / `yruo_bridge` / `yruo_port` / `yruo_loopback` / `yruo_dhcpserver` | same as core |
| DHCP relay | `yruo_dhcprelay` | `yruo_dhcprelay` |
| Firewall | `yruo_firewall_security` / `..._acl` / `..._dmz` / `..._mac_binding` / `..._port_mapping` / `..._policy` | same |
| DDNS | `yruo_ddns` | `yruo_ddns` |
| Link failover | `yruo_if_backup` | `yruo_if_backup` |
| VPN | `yruo_vpn_*` + `yruo_wireguard` | matching |
| Proxy | `yruo_proxy` | `yruo_proxy` |
| QoS | `yruo_qos_download` / `yruo_qos_upload` | matching |
| Routing | `yruo_routefilter` / `yruo_routeospf` / `yruo_routerip` / `yruo_routestatic` | matching |
| System | `yruo_system` | `general`, `time` |
| User / HTTP API account | `yruo_usermanagement` | `security`, `user_list`, `api_user_list` |
| AAA | `yruo_aaa` | matching |
| SNMP | `yruo_snmp` | `system`, `view`, `vacm`, `trap`, `mib` |
| Remote | `yruo_remote` | matching |
| Events | `yruo_events` | `event_list` |
| Maintenance tools | `yruo_tools` | `ping`, `traceroute`, `tcpdump`, `qxdm` (start/poll `is_finish`/stop) |
| Log | `yruo_log` | `system_log` |
| Upgrade | `yruo_upgrade` | `upgrade` |
| Schedule | `yruo_schedule` | `schedule` |
| Storage | `yruo_storage` | matching |
| Scan | `yruo_scan` | `yruo_scan` |
| Cloud / API | `yruo_cloud`, `yruo_httpapi` | `cloud_manage`/`auto_provision`, `httpapi` |
| Modbus master (industrial variant) | `yruo_modbus_*` | matching |

## 3. REST `/api/*` reference (embedded NS)

### 3.1 Reading devices/applications/profiles — the aggregate list endpoint

`GET /api/urdevices` (no body) is the **one-shot aggregate read**: it returns `{devTotalCount, deviceResult:[...], appTotalCount, appResult:[...], pfTotalCount, profileResult:[...]}` in a single response. Use it to enumerate devices and to **verify that a create/delete took effect** — the per-device read below does not work.

⚠️ `GET /api/urdevices/:devEUI` returns **405** (method not allowed) despite appearing in older references — read the aggregate list and filter by `devEUI` client-side instead.

Other list endpoints: `GET /api/urapplications`, `GET /api/urprofiles`, `GET /api/payloadcodecs`, `GET /api/multicast-groups`, `GET /api/gateways` — Milesight-wrapped as `{totalCount, result:[...]}`.

### 3.2 Creating / changing resources — response contract

- Business success answers `{"code":200,"error":""}`.
- **A create is only confirmed by reading it back** through the aggregate list (§3.1): an HTTP success with `code:200` has been observed both for real creates and (with other field errors) for requests that stored nothing, and re-creating an existing `devEUI` answers **HTTP 409 Conflict**. Treat 409 as "already exists", not as an error to retry blindly.

Device create (OTAA):

```json
POST /api/urdevices
{ "applicationID": "1", "name": "em300-th", "devEUI": "24E124136F488888",
  "appKey": "<16-byte hex AppKey>", "deviceProfileID": "<uuid from /api/urprofiles>",
  "skipFCntCheck": true, "referenceAltitude": 0, "description": "..." }
```

Delete: `DELETE /api/urdevices/:devEUI` (empty response — verify via the aggregate list).

### 3.3 Applications and their integrations (MQTT / HTTP push)

An application groups devices; each application can have **integrations** that push NS events (`uplink`, `join`, `ack`, `error`, `status`, `location`) to your broker/endpoint:

| Operation | Request |
|---|---|
| Read integration | `GET /api/urapplications/:id/integrations/mqtt` (404 = none configured) |
| Create/update | `PUT /api/urapplications/:id/integrations/mqtt` (same body; HTTP variant `.../integrations/http`) |
| Delete | `DELETE /api/urapplications/:id/integrations/mqtt` |

The stored MQTT integration schema is **flat** (verified against the shipped Web UI, fields match its requests):

```json
PUT /api/urapplications/1/integrations/mqtt
{
  "id": "1", "mode": 0, "platformUrl": "", "advanced": false,
  "host": "broker.example.com", "port": 1883, "clientID": "ug65-client",
  "useAuth": true, "username": "user", "password": "pass",
  "useTLS": false, "TLSMode": 0, "sslSecurity": false,
  "CACert": "", "CAName": "", "TLSCert": "", "certName": "", "TLSKey": "", "keyName": "",
  "connectTimeout": 30, "keepAliveInterval": 60, "retransmissionEnabled": false,
  "uplinkTopic": "site/ug65-1/$devEUI", "upQoS": 0, "uplinkRetain": false,
  "joinTopic": "site/ug65-1/join", "joinQoS": 0, "joinRetain": false,
  "ackTopic": "", "ackQoS": 0, "ackRetain": false,
  "errorTopic": "", "errorQoS": 0, "errorRetain": false,
  "downlinkTopic": "", "downlinkQoS": 0,
  "mcDownlinkTopic": "", "mcDownlinkQoS": 0,
  "requestTopic": "", "requestQoS": 0,
  "responseTopic": "", "responseQoS": 0, "responseRetain": false,
  "lastWillEnable": false, "lastWillTopic": "", "lastWillQoS": 0,
  "lastWillRetain": false, "lastWillPayload": "",
  "customData": "{...JSON payload template...}"
}
```

Field notes:

- `$devEUI` in topic templates is substituted per device. **An empty `uplinkTopic` means nothing is published.**
- `customData` is a JSON template for the published payload; if you don't send one the gateway stores a default — read back the integration with `GET .../integrations/mqtt` to see the exact stored shape, and treat that echo as the schema.
- The HTTP integration uses the same pattern at `.../integrations/http` (URL, headers, TLS instead of broker fields).

### 3.4 Endpoint reference

| Method & path | Notes |
|---|---|
| `GET/POST /api/internal/login` | JWT |
| `GET /api/network-server/settings` | NS general settings |
| Devices | `GET /api/urdevices` (aggregate, §3.1), `POST /api/urdevices` (create), `DELETE /api/urdevices/:devEUI`, `POST /api/urdevices/:devEUI/queue` (downlink) |
| Applications | `GET/POST /api/urapplications`, `PUT/DELETE /api/urapplications/:id`, integrations per §3.3 |
| Codecs | `GET /api/payloadcodecs`, `GET/PUT/DELETE /api/payloadcodecs/:id`, `POST /api/payloadcodecs`, `GET /api/payloadcodecs/:devEUI/device`, `GET /api/payloadcodecs-setting` |
| Profiles | `GET/POST /api/urprofiles`, `PUT/DELETE /api/urprofiles/:id`, `POST /api/urprofiles/lns` |
| Gateways | `GET/POST /api/gateways`, `PUT/DELETE /api/gateways/:mac` |
| Multicast | `GET /api/multicast-groups`, `GET /api/multicast-groups/:id`, device endpoints under `:id/*`, `GET .../queue` |
| FUOTA | `GET /api/fuota/task`, `/task/payloadsize`, `/task/delete`, `/task/retry`, `/devices`, `/devices/firmware`, `/official/firmware`, `/official/models` |
| Packet viewer | `GET /api/urpackets`, `DELETE /api/urpackets` |
| BACnet (server/object) | `GET /api/bacnet/get|getAll|add|set|del|server` |
| Actility | `GET /api/msactility` (Thingpark integration state) |
| Misc | `GET /api/urdevicesall/export` |

### 3.5 LoRaWAN NS object model

`/api/urapplications` = applications; integrations (§3.3) push device events out. `/api/urdevices` = devices with `appKey`/`appSKey`/`nwkSKey` for OTAA/ABP and `fCntUp`/`fCntDown` counter sync. `/api/urprofiles` = device/service profiles (region, class, RX delays). Multicast via `/api/multicast-groups`. Payload decoding follows the codec set on the application or device (`payloadCodecID`).

## 4. End-to-end example

```sh
# 0) encrypt a password the way the firmware expects (AES-128-CBC, fixed key/IV)
ENC=$(printf '%s' 'password2' | openssl enc -aes-128-cbc -K 31313131313131313131313131313131 \
      -iv 32323232323232323232323232323232 -base64)
# (-K/-iv take hex: key '1111...' = 0x31 repeated; IV '2222...' = 0x32 repeated)

# 1) CGI login → td
curl -sk https://<gw>/cgi -H 'Content-Type: application/json' \
  -d "{\"id\":\"1\",\"execute\":1,\"core\":\"user\",\"function\":\"login\",\
       \"values\":[{\"username\":\"admin\",\"password\":\"$ENC\",\"base\":\"web_login\"}]}"

# 2) read radio settings (space CGI calls ≥500 ms)
curl -sk https://<gw>/cgi -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer login=admin;<td>' \
  -d '{"id":"2","execute":1,"core":"yruo_loragw","function":"get","values":[{"base":"radios"}]}'

# 3) REST login + aggregate device list
curl -sk https://<gw>/api/internal/login -H 'Content-Type: application/json' \
  -d "{\"username\":\"admin\",\"password\":\"$ENC\"}"
curl -sk https://<gw>/api/urdevices -H "Authorization: Bearer <jwt>"
```

```js
// node equivalent of the password encryption
import crypto from 'node:crypto';
const encrypt = pw => {
  const c = crypto.createCipheriv('aes-128-cbc', '1111111111111111', '2222222222222222');
  return Buffer.concat([c.update(pw, 'utf8'), c.final()]).toString('base64');
};
```

## 5. Notes for automation / AI agents

- The HTTP API **account** (§1.4), not the admin Web password, is the intended credential for software.
- The AES key/IV above are fixed in the firmware and are the supported way to talk to both login endpoints; they provide no security by themselves — account passwords are the secret.
- Verify every write by reading back through the aggregate list (§3.1); `DELETE` returns an empty body and `code:200`-style responses do not guarantee the state you expect (409 on duplicates).
- Endpoint behavior can vary by dot-version: verify the exact `core`/`base` for your firmware by opening the page in the UI and watching requests, or by reading the stored object back (its echo is the schema).
