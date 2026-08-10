# Milesight UG65 / UG67 — API REST del Network Server embebido

> Versión del documento: Abril 2021 · Documento del fabricante: *Milesight UG6x API Documentation*
> Producto: Gateways LoRaWAN Milesight UG65 y UG67, con Network Server (NS) embebido

---

## Información Legal

- Esta es una **guía de referencia e integración** basada en el documento oficial del fabricante *Milesight UG6x API Documentation* (incluido en [`docs/`](./docs/)). Muestra cómo integrar los gateways Milesight UG65/UG67 con una plataforma de terceros usando la API **REST** de su Network Server embebido.
- **Todos los valores de ejemplo son ilustrativos** — direcciones IP, DevEUI, tokens JWT y llaves sirven únicamente para mostrar el formato de las peticiones. Adáptalos a tu propia instalación.
- Los comportamientos pueden variar según la **versión de firmware** del gateway. Para valores y comportamientos definitivos, **consulta siempre el documento oficial que corresponda a tu firmware**.
- El producto se proporciona "TAL CUAL". En ningún caso Milesight ni SYSCOM serán responsables de daños especiales, consecuentes, incidentales o indirectos derivados del uso de esta documentación.

---

## Tabla de Contenidos

- [Capítulo 1 — Descripción General](#capítulo-1--descripción-general)
- [Capítulo 2 — Autenticación](#capítulo-2--autenticación)
- [Capítulo 3 — Applications](#capítulo-3--applications)
- [Capítulo 4 — Devices](#capítulo-4--devices)
- [Capítulo 5 — Datos de Uplink](#capítulo-5--datos-de-uplink)
- [Capítulo 6 — Cola de Downlink](#capítulo-6--cola-de-downlink)
- [Capítulo 7 — Buenas Prácticas](#capítulo-7--buenas-prácticas)
- [Capítulo 8 — Solución de Problemas](#capítulo-8--solución-de-problemas)
- [Capítulo 9 — Checklist de Integración](#capítulo-9--checklist-de-integración)
- [Apéndice A — Endpoints y Diccionarios](./APENDICE-A.md)
- [Historial de Actualizaciones](./HISTORIAL-ACTUALIZACIONES.md)

---

## Capítulo 1 — Descripción General

### 1.1 ¿Qué es y para qué sirve?

Los gateways **UG65** y **UG67** incluyen un **Network Server (NS) LoRaWAN embebido**: los dispositivos finales se registran directamente en el gateway. Su **API REST** permite a plataformas de terceros:

- **Consultar aplicaciones** y sus decodificadores/codificadores de payload.
- **Consultar dispositivos** dados de alta en el NS.
- **Recibir datos de uplink**, tanto en tiempo real (HTTP Streaming) como por dispositivo.
- **Encolar, consultar y vaciar downlinks** hacia los dispositivos.

### 1.2 URL base y transporte

Todas las llamadas cuelgan de:

```
https://{gatewayIP}:8080/api
```

- **HTTPS únicamente**, puerto `8080`. El gateway usa un certificado autofirmado: los ejemplos del fabricante usan `curl --insecure`. En producción, instala un certificado válido o configura tu cliente para confiar en el del gateway.
- Peticiones y respuestas en **JSON** (`Content-Type: application/json`, `Accept: application/json`).
- Autenticación por **token JWT** enviado como `Authorization: Bearer <jwt>` (ver [Capítulo 2](#capítulo-2--autenticación)).

> **Nota:** esta API es de **solo consulta y encolado** —no expone alta/baja de dispositivos ni de aplicaciones; esa administración se hace desde la interfaz web del gateway. (Para administración del NS por API, consulta la plataforma [SG50/UG63 — API MQTT](../SG50-UG63/README.md).)

---

## Capítulo 2 — Autenticación

### 2.1 Login — `POST /api/internal/login`

Autentica con el usuario y contraseña de la API del gateway y devuelve un **JWT** para las peticiones siguientes.

| Parámetro | Tipo | Descripción | Default |
| --------- | ---- | ----------- | ------- |
| `username` | string | Usuario de la API del gateway. | `apiuser` |
| `password` | string | Contraseña de la API del gateway. | `password` |

```bash
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' \
  -d '{"password": "password", "username": "apiuser"}' --insecure \
  https://192.168.23.164:8080/api/internal/login
```

Respuesta:

```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJsb3JhLWFwcC1zZXJ2ZXIiLCJleHA..."
}
```

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `jwt` | string | Token para las peticiones siguientes (`Authorization: Bearer <jwt>`). |
| `error` | string | Código de error (solo si la petición falla). |

> **Notas:**
> - **El token es válido por 24 horas.** Vencido el plazo, repite el login.
> - Las credenciales por defecto (`apiuser` / `password`) deben **cambiarse** en la primera puesta en marcha (§2.2).

### 2.2 Cambiar contraseña de usuario — `PUT /api/users/{username}/password`

| Parámetro | Importancia | Tipo | Descripción |
| --------- | ----------- | ---- | ----------- |
| `username` (ruta) | Requerido | string | Nombre del usuario cuya contraseña se actualiza. |
| `password` (cuerpo) | Requerido | string | Nueva contraseña. |

```bash
curl -X PUT --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  -d '{"password":"123456"}' --insecure \
  https://192.168.23.164:8080/api/users/apiuser/password
```

Respuesta (éxito, HTTP 200):

```json
{}
```

---

## Capítulo 3 — Applications

Una *application* agrupa dispositivos y define su **codec de payload** (funciones JavaScript `Decode`/`Encode`).

### 3.1 Listar aplicaciones — `GET /api/applications`

| Parámetro | Importancia | Tipo | Descripción |
| --------- | ----------- | ---- | ----------- |
| `limit` | Requerido | string | Número máximo de aplicaciones a devolver. |
| `offset` | Requerido | string | Desplazamiento en el resultado (paginación). |

```bash
curl -X GET --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  --insecure 'https://192.168.23.164:8080/api/applications?limit=10&offset=0'
```

Respuesta:

```json
{
  "apps": [
    {
      "id": "1",
      "name": "test",
      "description": "test",
      "payloadCodec": "",
      "payloadEncoderScript": "// Encode encodes the given object into an array of bytes.\nfunction Encode(fPort, obj) {\n  return [];\n}",
      "payloadDecoderScript": "// Decode decodes an array of bytes into an object.\nfunction Decode(fPort, bytes) {\n  return {};\n}"
    }
  ],
  "totalCount": "2"
}
```

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `apps[].id` | string | ID de la aplicación. |
| `apps[].name` | string | Nombre de la aplicación. |
| `apps[].description` | string | Descripción. |
| `apps[].payloadCodec` | string | Codec de payload configurado. |
| `apps[].payloadDecoderScript` | string | Función JavaScript decodificadora. |
| `apps[].payloadEncoderScript` | string | Función JavaScript codificadora. |
| `totalCount` | string | Total de aplicaciones creadas. |

### 3.2 Consultar aplicación por nombre — `GET /api/applications/{name}`

| Parámetro | Importancia | Tipo | Descripción |
| --------- | ----------- | ---- | ----------- |
| `name` (ruta) | Requerido | string | Nombre de la aplicación. |

```bash
curl -X GET --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  --insecure https://192.168.23.164:8080/api/applications/test
```

La respuesta es un único objeto aplicación con los mismos campos de §3.1 (`id`, `name`, `description`, `payloadCodec`, `payloadDecoderScript`, `payloadEncoderScript`).

---

## Capítulo 4 — Devices

### 4.1 Listar dispositivos — `GET /api/devices`

| Parámetro | Importancia | Tipo | Descripción |
| --------- | ----------- | ---- | ----------- |
| `limit` | Requerido | string | Número máximo de dispositivos a devolver. |
| `offset` | Requerido | string | Desplazamiento en el resultado (paginación). |

```bash
curl -X GET --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  --insecure 'https://192.168.23.164:8080/api/devices?limit=100&offset=0'
```

Respuesta:

```json
{
  "devices": [
    {
      "devEUI": "24e1245657899999",
      "name": "EM500-udl",
      "applicationID": "1",
      "appName": "test",
      "description": "nancy",
      "profileName": "test",
      "fCntUp": 0,
      "fCntDown": 0,
      "appKey": "5572404c696e6b4c6f52613230313823",
      "devAddr": "",
      "appSKey": "",
      "nwkSKey": "",
      "lastSeenAt": "-"
    },
    {
      "devEUI": "24e124136a473211",
      "name": "EM300-TH",
      "applicationID": "1",
      "appName": "test",
      "description": "nancy",
      "profileName": "test",
      "fCntUp": 10,
      "fCntDown": 4,
      "appKey": "5572404c696e6b4c6f52613230313823",
      "devAddr": "062a4663",
      "appSKey": "3498d0023ed43b589a687f80ce4bbbe0",
      "nwkSKey": "2664d201f258808f7c9b97ac24b18b87",
      "lastSeenAt": "3 hours ago"
    }
  ],
  "totalCount": "2"
}
```

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `devEUI` | string | Device EUI. |
| `name` | string | Nombre del dispositivo. |
| `applicationID` / `appName` | string | Aplicación a la que pertenece. |
| `description` | string | Descripción. |
| `profileName` | string | Nombre del perfil asignado. |
| `fCntUp` / `fCntDown` | string | Contadores de tramas uplink / downlink. |
| `appKey` | string | Application Key. |
| `devAddr` | string | Device Address (vacío si no está activado). |
| `appSKey` / `nwkSKey` | string | Llaves de sesión (vacías si no está activado). |
| `lastSeenAt` | string | Hora del último paquete transmitido (`-` si nunca). |
| `totalCount` | string | Total de dispositivos. |

> **Nota:** un dispositivo con `devAddr`, `appSKey` y `nwkSKey` vacíos **aún no se ha unido** a la red — dato clave antes de encolar downlinks (ver [Capítulo 6](#capítulo-6--cola-de-downlink)).

### 4.2 Consultar dispositivo por nombre — `GET /api/devices/{devName}`

| Parámetro | Importancia | Tipo | Descripción |
| --------- | ----------- | ---- | ----------- |
| `devName` (ruta) | Requerido | string | Nombre del dispositivo. |

```bash
curl -X GET --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  --insecure https://192.168.23.164:8080/api/devices/EM300-TH
```

La respuesta es un único objeto dispositivo con los mismos campos de §4.1.

---

## Capítulo 5 — Datos de Uplink

### 5.1 Stream de uplink de todos los dispositivos — `GET /api/urpackets`

Devuelve un **HTTP Streaming**: la conexión queda abierta y el gateway va entregando un objeto JSON por cada paquete de uplink recibido, en tiempo real.

```bash
curl -X GET --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  --insecure https://192.168.23.164:8080/api/urpackets
```

Ejemplo de elemento recibido en el stream:

```json
{
  "result": {
    "frequency": 904700000,
    "power": "-",
    "immediately": "-",
    "dataRate": "SF7BW125",
    "modulation": "LORA",
    "bandwidth": 125,
    "spreadFactor": 7,
    "bitRate": 0,
    "codeRate": "4/5",
    "gatewayMac": "24E124FFFEF1B88E",
    "timeSinceGPSEpoch": "365358h11m20.702s",
    "timestamp": 3440432671,
    "rssi": "-59",
    "loraSNR": "14.0",
    "devEUI": "24E124412B221912",
    "time": "2021-09-10T14:11:02+08:00",
    "type": "UpCnf",
    "fCnt": 8166,
    "devAddr": "06555C1C",
    "adr": "true",
    "adrAckReq": "false",
    "ack": "false",
    "mic": "3e7bf86e",
    "appEUI": "24E124C0002A0001",
    "fPort": "85",
    "size": "6",
    "payloadBase64": "AwAABAAA",
    "payloadHex": "030000040000",
    "enqueue": false,
    "classType": "Class A"
  }
}
```

Campos destacados del paquete:

| Campo | Descripción |
| ----- | ----------- |
| `devEUI` / `devAddr` / `appEUI` | Identidad del dispositivo emisor. |
| `fCnt` / `fPort` | Contador de trama y puerto de aplicación. |
| `payloadBase64` / `payloadHex` | Payload en Base64 y en hexadecimal. |
| `frequency` / `dataRate` / `spreadFactor` / `bandwidth` | Parámetros de radio del paquete. |
| `rssi` / `loraSNR` | Calidad de señal. |
| `gatewayMac` | Gateway que recibió el paquete. |
| `type` | Tipo de trama (p. ej. `UpCnf` = uplink confirmado). |
| `classType` | Clase LoRaWAN del dispositivo. |

> **Nota:** al ser streaming, usa un cliente HTTP que procese la respuesta de forma incremental (línea a línea); no esperes a que "termine" la respuesta.

### 5.2 Uplink de un dispositivo específico — `GET /api/devices/{devEUI}/data`

| Parámetro | Importancia | Tipo | Descripción |
| --------- | ----------- | ---- | ----------- |
| `devEUI` (ruta) | Requerido | string | DevEUI codificado en hexadecimal. |

```bash
curl -X GET --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  --insecure https://192.168.23.164:8080/api/devices/24e124136a473211/data
```

Respuesta:

```json
{
  "result": {
    "type": "uplink",
    "payloadJSON": "{\"applicationID\":\"1\",\"applicationName\":\"test\",\"data\":\"A2cXAQRoAAUAAA==\",\"devEUI\":\"24e124136a473211\",\"deviceName\":\"EM300-TH\",\"fCnt\":4,\"fPort\":85,\"rxInfo\":[...],\"time\":\"2021-04-13T13:16:23.36554Z\",\"txInfo\":{...}}"
  }
}
```

> **Gotcha común:** `payloadJSON` es un **string con JSON escapado**, no un objeto — requiere un segundo `JSON.parse`. Su estructura interna (`applicationID`, `data`, `devEUI`, `fCnt`, `fPort`, `rxInfo`, `txInfo`) es la misma que usa la [API MQTT de SG50/UG63](../SG50-UG63/README.md#31-uplink-data), útil si migras entre plataformas.

---

## Capítulo 6 — Cola de Downlink

Los downlinks se **encolan** por dispositivo; el NS los entrega en la siguiente ventana de recepción (Class A).

### 6.1 Consultar la cola — `GET /api/devices/{devEUI}/queue`

| Parámetro | Importancia | Tipo | Descripción |
| --------- | ----------- | ---- | ----------- |
| `devEUI` (ruta) | Requerido | string | EUI del dispositivo. |

```bash
curl -X GET --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  --insecure https://192.168.23.164:8080/api/devices/24e124136a473211/queue
```

Respuesta:

```json
{
  "items": [
    {
      "devEUI": "24e124136a473211",
      "reference": "",
      "confirmed": true,
      "fPort": 85,
      "data": "/wMEEA==",
      "fCnt": 1
    }
  ]
}
```

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `confirmed` | boolean | Si el payload se envía como downlink confirmado. |
| `data` | string | Datos en Base64 (texto plano; el LoRa Server los cifra). |
| `devEUI` | string | DevEUI del dispositivo (hex). |
| `fPort` | string | FPort a usar (debe ser > 0). |
| `jsonObject` | string | Objeto decodificado; cuando el codec de la aplicación está configurado, puedes enviar `jsonObject` y omitir `data`. |
| `reference` | string | Referencia arbitraria, usada en la notificación ACK (opcional). |
| `fCnt` | int | Contador de downlink asignado. |

### 6.2 Encolar un downlink — `POST /api/devices/{devEUI}/queue`

| Parámetro | Importancia | Tipo | Descripción |
| --------- | ----------- | ---- | ----------- |
| `confirmed` | Requerido | boolean | Si el payload se envía como downlink confirmado. |
| `data` | Requerido | string | Datos en Base64 (texto plano; el LoRa Server los cifra). |
| `devEUI` | Requerido | string | DevEUI del dispositivo (hex). |
| `fPort` | Requerido | string | FPort a usar (debe ser > 0). |
| `jsonObject` | Opcional | string | Objeto a codificar por el codec de la aplicación; al usarlo puedes omitir `data`. |
| `reference` | Opcional | string | Referencia arbitraria, devuelta en la notificación ACK. |

```bash
curl -X POST --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  -d '{"confirmed":false,"data":"UwEAAAEAAGQ=","devEUI":"24e124136a473211","fPort":85}' \
  --insecure https://192.168.23.164:8080/api/devices/24e124136a473211/queue
```

Respuesta (éxito, HTTP 200):

```json
{}
```

> **Nota:** si el dispositivo **no está activado**, la API responde con error de negocio (HTTP 200 con cuerpo de error):
>
> ```json
> {
>   "error": "enqueue downlink payload error: get next downlink fcnt for deveui error: rpc error: code = NotFound desc = object does not exist",
>   "code": 13
> }
> ```
>
> Solución: espera a que el dispositivo complete el Join (verifica `devAddr`/`lastSeenAt` en [§4.1](#41-listar-dispositivos--get-apidevices)).

### 6.3 Vaciar la cola — `DELETE /api/devices/{devEUI}/queue`

Elimina **todos** los downlinks encolados del dispositivo.

| Parámetro | Importancia | Tipo | Descripción |
| --------- | ----------- | ---- | ----------- |
| `devEUI` (ruta) | Requerido | string | DevEUI codificado en hexadecimal. |

```bash
curl -X DELETE --header 'Accept: application/json' --header 'Authorization: Bearer <jwt>' \
  --insecure https://192.168.23.164:8080/api/devices/24e124136a473211/queue
```

Respuesta (éxito, HTTP 200):

```json
{}
```

---

## Capítulo 7 — Buenas Prácticas

- **Cambia las credenciales por defecto** (`apiuser`/`password`) en la primera puesta en marcha y guarda el JWT fuera del código fuente.
- **Maneja la expiración de 24 h:** ante un `401`, repite el login y reintenta la petición una vez. Programar un *re-login* periódico (p. ej. cada 12 h) evita depender del error.
- **Pagina con `limit`/`offset`** en lugar de pedir todo el catálogo de una vez en gateways con muchos dispositivos.
- **Para monitoreo continuo usa `/api/urpackets`** (streaming) en lugar de consultar `/api/devices/{devEUI}/data` en bucle; para consultas puntuales de un dispositivo, lo contrario.
- **Verifica la activación antes de encolar:** un dispositivo sin `devAddr`/`lastSeenAt` aún no se unió y el encolado fallará con `code: 13`.
- **Usa `reference` en los downlinks** cuando necesites correlacionar ACKs con tu lógica de negocio.
- **Confirma solo lo indispensable:** `confirmed: true` te da ACK pero consume más aire y batería del dispositivo.
- **Haz doble `JSON.parse` en `payloadJSON`** (§5.2) — es un string, no un objeto.

---

## Capítulo 8 — Solución de Problemas

| Síntoma | Causa probable / solución |
| ------- | ------------------------- |
| `curl` falla con error de certificado | El gateway usa certificado autofirmado. Usa `--insecure` en pruebas; en producción instala un certificado válido. |
| `401` / peticiones rechazadas tras horas de funcionar | El JWT venció (vigencia de 24 h). Repite el login. |
| `code: 13` — `object does not exist` al encolar | El dispositivo no está activado (no ha hecho Join). Espera su activación y reintenta. |
| `/api/urpackets` "se queda colgado" | Es el comportamiento esperado: es HTTP Streaming. Procesa la respuesta incrementalmente. |
| No puedo parsear la respuesta de `.../data` | `payloadJSON` es un string con JSON escapado; aplica un segundo `JSON.parse`. |
| Puerto 8080 inalcanzable | Verifica que usas **HTTPS** (no HTTP) y que tu red permite el puerto 8080 hacia el gateway. |

---

## Capítulo 9 — Checklist de Integración

- [ ] Confirmar modelo (UG65 o UG67), firmware y alcanzabilidad de `https://<ip>:8080`.
- [ ] Cambiar la contraseña por defecto del usuario de API.
- [ ] Implementar login + almacenamiento de JWT y estrategia de renovación (24 h).
- [ ] Validar consultas de aplicaciones y dispositivos con paginación.
- [ ] Implementar recepción de uplink (streaming `/api/urpackets` o consulta por dispositivo) con parseo de `payloadBase64`/`payloadJSON`.
- [ ] Implementar encolado de downlink con manejo del error `code: 13` y, si aplica, vaciado de cola.
- [ ] Probar el flujo completo con un dispositivo real activado.

---

> *Documento educativo basado en la especificación oficial del fabricante. Para parámetros y comportamientos exactos, consulta siempre el documento oficial en [`docs/`](./docs/) correspondiente a tu firmware.*

---

## Navegación

| Sección | Enlace |
| ------- | ------ |
| Apéndice A — endpoints y diccionarios | [APENDICE-A.md](./APENDICE-A.md) |
| Historial de actualizaciones | [HISTORIAL-ACTUALIZACIONES.md](./HISTORIAL-ACTUALIZACIONES.md) |
| MILESIGHT — índice de plataformas | [../README.md](../README.md) |
| Índice de marcas | [../../README.md](../../README.md) |
