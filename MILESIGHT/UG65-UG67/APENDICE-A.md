> ← Volver a la [Documentación de la API (UG65/UG67)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice A — Endpoints y Diccionarios de Datos

Tablas de referencia rápida para la API REST de los gateways Milesight UG65/UG67. Los valores provienen del documento oficial del fabricante (*Milesight UG6x API Documentation*, abril 2021).

Las secciones [A.6](#a6-sesión-cgi-y-límite-de-velocidad) en adelante cubren la superficie más amplia del gateway (backend CGI + REST extendido del NS), derivada del *UG65 HTTP & API / Integration Guide* del fabricante (verificado contra firmware 60.0.0.49).

---

### A.1 Resumen de endpoints

URL base: `https://{gatewayIP}:8080/api` — todas las rutas (salvo login) requieren `Authorization: Bearer <jwt>`.

| # | Método | Ruta | Propósito |
| - | ------ | ---- | --------- |
| 1 | `POST` | `/api/internal/login` | Autenticación; devuelve el JWT. |
| 2 | `PUT` | `/api/users/{username}/password` | Cambiar la contraseña de un usuario. |
| 3 | `GET` | `/api/applications?limit=&offset=` | Listar aplicaciones (paginado). |
| 4 | `GET` | `/api/applications/{name}` | Consultar una aplicación por nombre. |
| 5 | `GET` | `/api/devices?limit=&offset=` | Listar dispositivos (paginado). |
| 6 | `GET` | `/api/devices/{devName}` | Consultar un dispositivo por nombre. |
| 7 | `GET` | `/api/urpackets` | **HTTP Streaming** de uplinks de todos los dispositivos. |
| 8 | `GET` | `/api/devices/{devEUI}/data` | Último uplink de un dispositivo (`payloadJSON`). |
| 9 | `GET` | `/api/devices/{devEUI}/queue` | Consultar la cola de downlink de un dispositivo. |
| 10 | `POST` | `/api/devices/{devEUI}/queue` | Encolar un downlink. |
| 11 | `DELETE` | `/api/devices/{devEUI}/queue` | Vaciar la cola de downlink de un dispositivo. |

---

### A.2 Autenticación y ciclo de vida del token

| Concepto | Valor |
| -------- | ----- |
| Usuario / contraseña por defecto | `apiuser` / `password` |
| Transporte | HTTPS, puerto `8080`, certificado autofirmado |
| Header de autorización | `Authorization: Bearer <jwt>` |
| **Vigencia del token** | **24 horas** (después hay que repetir el login) |
| Respuesta de login exitosa | HTTP 200 + `{"jwt": "…"}` |
| Respuesta de login fallida | `{"error": "…"}` |

---

### A.3 Formato de respuesta y errores

| Situación | Forma |
| --------- | ----- |
| Éxito | HTTP 200 + cuerpo JSON del recurso (`{}` si no hay contenido). |
| Error | HTTP 200 con cuerpo `{"error": "<mensaje>", "code": <n>}`. |

Error documentado por el fabricante:

| `code` | Cuándo ocurre | Respuesta típica |
| ------ | ------------- | ---------------- |
| `13` | Encolar downlink a un dispositivo **no activado** (aún no hace Join). | `{"error": "enqueue downlink payload error: get next downlink fcnt for deveui error: rpc error: code = NotFound desc = object does not exist", "code": 13}` |

> **Nota:** no confiar únicamente en el código HTTP: los errores de negocio llegan con HTTP 200 y hay que inspeccionar el cuerpo.

---

### A.4 Diccionario de campos

#### A.4.1 Dispositivo (`/api/devices`)

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `devEUI` | string | Device EUI (hex). |
| `name` | string | Nombre del dispositivo. |
| `applicationID` / `appName` | string | Aplicación a la que pertenece. |
| `description` | string | Descripción. |
| `profileName` | string | Perfil asignado. |
| `fCntUp` / `fCntDown` | string | Contadores de tramas uplink / downlink. |
| `appKey` | string | Application Key. |
| `devAddr` | string | Device Address (vacío si no está activado). |
| `appSKey` / `nwkSKey` | string | Llaves de sesión (vacías si no está activado). |
| `lastSeenAt` | string | Último paquete recibido (`-` si nunca). |

#### A.4.2 Aplicación (`/api/applications`)

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `id` / `name` / `description` | string | Identidad de la aplicación. |
| `payloadCodec` | string | Codec de payload configurado. |
| `payloadDecoderScript` | string | Función JS `Decode(fPort, bytes)` → objeto. |
| `payloadEncoderScript` | string | Función JS `Encode(fPort, obj)` → arreglo de bytes. |

#### A.4.3 Elemento de cola de downlink (`/api/devices/{devEUI}/queue`)

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `devEUI` | string | DevEUI del dispositivo (hex). |
| `confirmed` | boolean | Downlink confirmado (requiere ACK). |
| `fPort` | string | FPort a usar (debe ser > 0). |
| `data` | string | Payload en Base64 (texto plano; el LoRa Server lo cifra). |
| `jsonObject` | string | Objeto a codificar por el codec de la aplicación; al usarlo puedes omitir `data`. |
| `reference` | string | Referencia arbitraria devuelta en la notificación ACK (opcional). |
| `fCnt` | int | Contador de downlink asignado (presente en la consulta de cola). |

#### A.4.4 Paquete de uplink en streaming (`/api/urpackets`)

| Campo | Descripción |
| ----- | ----------- |
| `devEUI` / `devAddr` / `appEUI` | Identidad del dispositivo emisor. |
| `fCnt` / `fPort` / `size` | Contador, puerto y tamaño del payload. |
| `payloadBase64` / `payloadHex` | Payload en Base64 y hexadecimal. |
| `frequency` / `modulation` / `bandwidth` / `spreadFactor` / `dataRate` / `bitRate` / `codeRate` | Parámetros de radio. |
| `rssi` / `loraSNR` | Calidad de señal. |
| `gatewayMac` / `time` / `timestamp` / `timeSinceGPSEpoch` | Gateway receptor y marcas de tiempo. |
| `type` / `adr` / `adrAckReq` / `ack` / `mic` / `enqueue` / `classType` / `power` / `immediately` | Metadatos LoRaWAN de la trama. |

---

### A.5 Notas de transporte

- **HTTPS estricto:** la API no responde por HTTP plano; siempre `https://` y puerto `8080`.
- **Certificado autofirmado:** los ejemplos del fabricante usan `curl --insecure`. Para producción, instala un certificado válido en el gateway o configura el *trust store* de tu cliente.
- **Streaming:** `/api/urpackets` mantiene la conexión abierta indefinidamente; configura tu cliente sin *timeout* de lectura total y con reconexión automática.
- **Alcance de la API:** solo consulta y encolado. El alta/baja de aplicaciones y dispositivos se realiza desde la interfaz web del gateway.

### A.6 Sesión CGI y límite de velocidad

La superficie HTTP más amplia del gateway UG65 —todo lo que la Web GUI puede hacer, más el REST extendido del NS— se opera por el backend **CGI** (`POST /cgi`). Referencia completa en la guía [API-GATEWAY](./API-GATEWAY.md).

| Concepto | Valor |
| -------- | ----- |
| Login | `POST /cgi` con `core=user`, `function=login`; contraseña en AES-128-CBC(PKCS7)→Base64 con clave/IV fijos del firmware |
| Header de sesión CGI | `Authorization: Bearer login=<usuario>;<td>` (donde `<td>` viene de la respuesta de login) |
| Vigencia de sesión CGI | `ystimeout` segundos (típico 3600). Sesión inválida: `{"status":-2,"result":[-32001,"Session not found"]}` |
| Rate limit | Espacia llamadas CGI ≥ 500 ms; ráfagas devuelven `503` |
| Clave/IV AES de login | Clave `1111111111111111`, IV `2222222222222222` (16 bytes ASCII cada una, fijos en el firmware) |

#### A.6.1 Mapa `core` / `base` de los módulos de la Web GUI

| Módulo de UI | core | base(s) |
| ------------ | ---- | ------- |
| Estado | `yruo_status` | `summary`, `yruo_celluar`, `yruo_status_network`, `yruo_status_route`, `yruo_status_dhcp` |
| Estado inalámbrico | `yruo_wifi_status` | `yruo_wifi_status` |
| Estado VPN | `yruo_vpn_status` | `yruo_vpn_status` |
| Packet Forward (NS/general) | `yruo_loragw` | `ns_general`, `general_conf`, `radios`, `advanced`, `custom`, `recv` |
| Servidor BACnet | `yruo_bacnet` | `server`, `get_notification` |
| Config WiFi | `yruo_wifi` | `yruo_wifi` |
| Config celular | `yruo_cell` | `yruo_cell` |
| Interfaces de red | `yruo_wan` / `yruo_lan` / `yruo_bridge` / `yruo_port` / `yruo_loopback` / `yruo_dhcpserver` | mismos |
| Firewall | `yruo_firewall_security` / `..._acl` / `..._dmz` / `..._mac_binding` / `..._port_mapping` / `..._policy` | mismos |
| DDNS | `yruo_ddns` | `yruo_ddns` |
| Link failover | `yruo_if_backup` | `yruo_if_backup` |
| VPN | `yruo_vpn_*` + `yruo_wireguard` | por tipo |
| Sistema | `yruo_system` | `general`, `time` |
| Usuario / HTTP API | `yruo_usermanagement` | `security`, `user_list`, `api_user_list` |
| AAA | `yruo_aaa` | mismos |
| SNMP | `yruo_snmp` | `system`, `view`, `vacm`, `trap`, `mib` |
| Eventos | `yruo_events` | `event_list` |
| Herramientas de mantenimiento | `yruo_tools` | `ping`, `traceroute`, `tcpdump`, `qxdm` |
| Log | `yruo_log` | `system_log` |
| Upgrade | `yruo_upgrade` | `upgrade` |
| Tareas programadas | `yruo_schedule` | `schedule` |
| Nube / API | `yruo_cloud`, `yruo_httpapi` | `cloud_manage`/`auto_provision`, `httpapi` |

#### A.6.2 Endpoints REST adicionales del NS (no documentados en el PDF)

Verificación de firmware 60.0.0.49:

| Endpoint | Nota |
| -------- | ---- |
| `GET /api/urdevices` | **Lectura agregada de un golpe**: `{devTotalCount, deviceResult, appTotalCount, appResult, pfTotalCount, profileResult}`. Úsala para verificar creates/deletes. |
| `GET /api/urdevices/:devEUI` | **405** (no disponible); usa la lectura agregada y filtra por `devEUI`. |
| `POST /api/urdevices` | Creación OTAA; inmutable ante duplicados (responde **409 Conflict** si el DevEUI ya existe). |
| `GET/POST /api/urapplications`, `PUT/DELETE /api/urapplications/:id` | Administración de applications; integraciones en `:id/integrations/mqtt` o `/http`. |
| `GET /api/urprofiles`, `POST /api/urprofiles/lns` | Perfiles de dispositivo/servicio (región, clase, retardos RX). |
| `GET /api/multicast-groups` | Multicast Class C. |
| `GET /api/fuota/task`, `/official/*` | FUOTA. |
| `GET /api/network-server/settings` | Configuración general del NS. |

---

> ← Volver a la [Documentación de la API (UG65/UG67)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)
