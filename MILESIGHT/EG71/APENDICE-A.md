> ← Volver a la [Descripción general de la plataforma (EG71)](README.md) · [Guía de integración por API](API-GATEWAY.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice A — Endpoints, errCodes y mapa core/base

Tablas de referencia rápida para la API HTTP del gateway Milesight EG71. Los valores provienen del *EG71 HTTP & API / Integration Guide* del fabricante (verificado contra firmware 71.0.0.2/71.0.0.3). La referencia completa de campos está en la [Guía de integración por API](./API-GATEWAY.md).

---

### A.1 Resumen de superficies

| Superficie | Ruta base | Autenticación | Para qué |
| ---------- | --------- | ------------- | -------- |
| Backend CGI | `POST /cgi` | `Authorization: Bearer login=<usuario>;<td>` | Network, VPN, Firewall, System, radio LoRa, Platform, Apps |
| API REST | `/api/*` | `Authorization: Bearer <jwt>` | Device/equipment management, codec library, data forwarding, LoRaWAN NS, access networks |
| Sesión | `POST /islogin`, `POST /logout` | bearer | Verificación de estado de sesión |

---

### A.2 Autenticación y ciclo de vida de la sesión

| Concepto | Valor |
| -------- | ----- |
| Login CGI | `POST /cgi` con `core=user`, `function=login`; contraseña en AES-128-CBC(PKCS7)→Base64 |
| Login REST | `POST /api/internal/login` → `{"jwt":"..."}` (vigencia ~24 h) |
| Header de sesión CGI | `Authorization: Bearer login=<usuario>;<td>` |
| Header REST | `Authorization: Bearer <jwt>` |
| Vigencia de sesión CGI | `ystimeout` segundos (típico 3600). Sesión inválida: `{"status":-32001,"errMsg":"Session not found"}` |
| Rate limit CGI | Espacia llamadas ≥ 500 ms; ráfagas devuelven `503` |
| Clave/IV AES de login | Clave `4829173051647823`, IV `7603912845091736` (16 bytes ASCII cada una, fijos en el firmware) |
| Cuenta API dedicada | `System > User > API Key Management` crea API keys con alcance (solo lectura / lectura-escritura, expiración) para uso máquina-a-máquina |

---

### A.3 Catálogo de endpoints REST

#### A.3.1 Equipment Data (gestión de dispositivos)

| Método y ruta | Propósito |
| ------------- | --------- |
| `POST /api/dsdevices/device` | Lista de dispositivos (paginada, con filtros) |
| `GET /api/dsdevices/device/io` | Lista de dispositivos I/O |
| `PUT /api/dsdevices/device/io/update/:id` · `PUT .../copy/:id` | Editar / copiar dispositivo I/O |
| `POST /api/urdevices` | Crear dispositivo LoRaWAN (OTAA/ABP; requiere `"isSave": true`) |
| `GET /api/urdevices/simple/:id` | Leer dispositivo LoRaWAN por id numérico |
| `POST /api/urdevices/:devEUI/queue` | Downlink LoRaWAN |
| `POST /api/dsdevices/device/{bacnet,modbus,knx}/create` | Crear dispositivo de protocolo |
| `PUT /api/dsdevices/device/{...}/update/:id` | Actualizar dispositivo de protocolo |
| `GET /api/dsdevices/device/{...}/:id` | Leer dispositivo de protocolo |
| `GET /api/dsdevices/objects/:deviceId` | Objetos de un dispositivo |
| `POST /api/dsdevices/objects/create` | Crear objetos (en lote desde codec) |
| `PUT /api/dsdevices/objects/update/:id` | Actualizar objeto |
| `POST /api/dsdevices/objects/delete` · `.../enable` · `.../copy` | Borrar / habilitar / copiar objetos |
| `GET /api/dsdevices/objects/{bacnet,modbus,knx}/:deviceId` | Objetos por protocolo |
| `POST /api/dsdevices/objects/read-write` | Leer/escribir valor de objeto |
| `GET /api/dsdevices/objects/read-status/:objectId` | Estado de lectura de objeto |
| `GET /api/dsdevices/objects/addlist/:deviceId` | Objetos disponibles desde codec (LoRaWAN) |

#### A.3.2 Descubrimiento BACnet/IP (scan)

| Método y ruta | Propósito |
| ------------- | --------- |
| `POST /api/dsdevices/bacnet/scan/config` | Armar e iniciar scan (`accessNetworkId`, `minInstanceId`, `maxInstanceId`) |
| `GET /api/dsdevices/bacnet/scan/devices/list` | Resultados del descubrimiento (llevan `address` real) |
| `POST /api/dsdevices/bacnet/scan/stop` | Detener scan (su `deviceList` es eco del rango, no el resultado) |
| `POST /api/dsdevices/bacnet/scan/single` | Scan de un dispositivo (semántica no reproducible por API) |
| `POST /api/dsdevices/bacnet/scan/objects/list` | Objetos de un dispositivo escaneado |
| `POST /api/dsdevices/objects/bacnet/scan/create` | Crear dispositivo desde entrada de scan |

#### A.3.3 Access Networks

| Método y ruta | Propósito |
| ------------- | --------- |
| `GET/POST /api/access-network` | Listar / crear access networks |
| `DELETE /api/access-network/:id` | Borrar (⚠️ cascada: elimina dispositivos y objetos) |
| `GET /api/access-network/{bacnet,modbus,knx}/simple/:id` | Detalle por protocolo |
| `PUT /api/access-network/bacnet/:id` | Actualizar BACnet IP |
| `GET/POST /api/access-network/rs485` | Configuración de puertos RS485 |

Límites por tipo: LoRaWAN 1, BACnet IP 3, BACnet MS/TP 2, Modbus TCP 4, Modbus RTU 2, Modbus RTU over TCP 4, KNX 1.

#### A.3.4 Data Forwarding

| Método y ruta | Propósito |
| ------------- | --------- |
| `GET /api/dsforward` | Reglas de forwarding |
| `POST /api/dsforward/mqtt` · `PUT /api/dsforward/mqtt/:id` | Crear / actualizar regla MQTT |
| `PUT /api/dsforward/mqtt/connect/:id` | Conectar / desconectar regla MQTT |
| `POST /api/dsforward/http` · `PUT /api/dsforward/http/:id` | Crear / actualizar regla HTTP |
| `POST /api/protocol/modbus_server/add` · `/set` · `/del` | Servidor Modbus |
| `POST /api/protocol/modbus_object/{add,set,get,del,getall,switch}` | Objetos Modbus |
| `POST /api/protocol/bacnet_server/add` · `/set` · `/del` | Servidor BACnet |
| `POST /api/protocol/bacnet_object/*` (+ `delNc`) | Objetos BACnet |
| `POST /api/dsforward/objects/add|delete|enable|addlist` | Objetos de forwarding |
| `GET/POST /api/dsforward/devices/*` | Dispositivos de forwarding |

Límites de reglas: HTTP 10, MQTT 10, Modbus 15, BACnet 4.

#### A.3.5 Codecs y NS LoRaWAN

| Método y ruta | Propósito |
| ------------- | --------- |
| `GET /api/payloadcodecs-short` | Lista ligera de codecs |
| `GET/PUT/DELETE /api/payloadcodecs/:id` · `POST /api/payloadcodecs` | CRUD de codecs |
| `POST /api/payloadcodecs-test` · `POST /api/payloadcodecs-import` (ZIP) | Probar / importar codecs |
| `GET /api/payloadcodecs/:devEUI/device` | Codec de un dispositivo |
| `GET/POST /api/gateways` | Gateways LoRaWAN |
| `GET/POST /api/urprofiles` | Perfiles de dispositivo/servicio |
| `GET /api/multicast-groups` · `POST /:id/queue` | Multicast Class C |
| `GET /api/fuota/task|devices|official` | FUOTA |
| `POST /api/dataflow/list` · `GET /api/dataflow/detail` · `POST /api/dataflow/clear` | Visor de data flow |

#### A.3.6 Misceláneo

| Método y ruta | Propósito |
| ------------- | --------- |
| `GET/POST /api/internal/login` | JWT |
| `GET /api/general-info/interface/with-access-info` | Mapa de interfaces |

---

### A.4 errCodes observados

| errCode | Dónde se vio | Lectura |
| ------- | ------------ | ------- |
| `0` + `errMsg: "success"` | la mayoría de reads/creates REST | OK — pero relee tras escrituras (trampa `isSave`) |
| `200` + `errMsg: ""` | `POST /api/urdevices` | petición aceptada — si guardó depende de `deviceId` en la misma respuesta (`"0"` = no guardó) |
| `10010011` / `10010008` | create/rebind de access-network | fallo no estructurado (contextos de conflicto de puerto observados) |
| `10020001` | polling de scan BACnet | `"not bacnet scan is running"` |
| `10020002` | polling de scan BACnet | `"bacnet scan is already running"` |

---

### A.5 Mapa `core` / `base` de los módulos CGI

| Página | core | base(s) |
| ------ | ---- | ------- |
| Dashboard | `yruo_status` | `dashboard` (60+ campos) |
| Cajón Ethernet | `yruo_status` | `yruo_ethernet` |
| Ethernet WAN/LAN/Bridge/Port/DHCP | `yruo_wan` / `yruo_lan` / `yruo_bridge` / `yruo_port` / `yruo_dhcpserver` | mismos |
| Wireless | `yruo_wifi` / `yruo_scan` | `yruo_wifi` / `yruo_scan` |
| Celular | `yruo_cell` | `yruo_cell` |
| Radio LoRaWAN | `yruo_loragw` | `ns_general`, `radios`, `advanced`, `radios_spectral_scan` |
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
| Herramientas de mantenimiento | `yruo_tools` | `ping`, `traceroute`, `tcpdump`, `qxdm` |
| Python | `yruo_python` | `status`, `python_sdk`, `appmanager`, `python_apps` |
| Node-RED | `yruo_loragw` | `node_red`, `node_red_ssl` |
| Log | `yruo_log` | `system_log` |
| Upgrade | `yruo_upgrade` | `upgrade` |
| Apply | `yruo_apply` | (check/apply de config pendiente) |

---

### A.6 Mapas de tipos del visor de data flow

`deviceType`: `0=LoRaWAN Node, 1=LoRaWAN Multicast, 2=BACnet MSTP, 3=BACnet IP, 4=KNX TP, 5=Modbus TCP, 6=Modbus RTU over TCP, 7=Modbus RTU`

`dataType`: `0=RX, 1=TX, 2=JnAcc, 3=JnReq, 4=UpUnc, 5=UpCnf, 6=DnUnc, 7=DnCnf, 8=ACK`

---

> ← Volver a la [Descripción general de la plataforma (EG71)](README.md) · [Guía de integración por API](API-GATEWAY.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)
