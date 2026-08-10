> ← Volver a la [Documentación de la API (UG65/UG67)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice A — Endpoints y Diccionarios de Datos

Tablas de referencia rápida para la API REST de los gateways Milesight UG65/UG67. Los valores provienen del documento oficial del fabricante (*Milesight UG6x API Documentation*, abril 2021).

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

---

> ← Volver a la [Documentación de la API (UG65/UG67)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)
