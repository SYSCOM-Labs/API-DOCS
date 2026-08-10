# Milesight SG50 / UG63 — API MQTT del Network Server embebido

> Versión del documento: Julio 2025 · Firmware aplicable: **64.0.0.3-r2** (UG63) / **50.0.0.4-r2** (SG50)
> Producto: Gateways LoRaWAN Milesight SG50 (alimentación solar) y UG63, con Network Server (NS) embebido

---

## Información Legal

- Esta es una **guía de referencia e integración** basada en el documento oficial del fabricante *MQTT API Specification — SG50/UG63* (incluido en [`docs/`](./docs/)). Muestra cómo integrar los gateways Milesight SG50/UG63 con una plataforma de terceros usando la API **MQTT** de su Network Server embebido.
- **Todos los valores de ejemplo son ilustrativos** — DevEUI, AppKey, direcciones IP y topics sirven únicamente para mostrar el formato de los mensajes. Adáptalos a tu propia instalación.
- Los comportamientos pueden variar según la **versión de firmware** del gateway. Para valores y comportamientos definitivos, **consulta siempre el documento oficial que corresponda a tu firmware**.
- El producto se proporciona "TAL CUAL". En ningún caso Milesight ni SYSCOM serán responsables de daños especiales, consecuentes, incidentales o indirectos derivados del uso de esta documentación.

---

## Tabla de Contenidos

- [Capítulo 1 — Descripción General](#capítulo-1--descripción-general)
- [Capítulo 2 — Conexión y Topics de Datos](#capítulo-2--conexión-y-topics-de-datos)
- [Capítulo 3 — Datos Publicados por el Gateway](#capítulo-3--datos-publicados-por-el-gateway)
- [Capítulo 4 — Downlink Data (Plataforma → Gateway)](#capítulo-4--downlink-data-plataforma--gateway)
- [Capítulo 5 — Request y Response: Administración del Network Server](#capítulo-5--request-y-response-administración-del-network-server)
- [Capítulo 6 — Buenas Prácticas](#capítulo-6--buenas-prácticas)
- [Capítulo 7 — Solución de Problemas](#capítulo-7--solución-de-problemas)
- [Capítulo 8 — Checklist de Integración](#capítulo-8--checklist-de-integración)
- [Apéndice A — Códigos y Ajustes Regionales](./APENDICE-A.md)
- [Historial de Actualizaciones](./HISTORIAL-ACTUALIZACIONES.md)

---

## Capítulo 1 — Descripción General

### 1.1 ¿Qué es y para qué sirve?

Los gateways **SG50** y **UG63** incluyen un **Network Server (NS) LoRaWAN embebido**: los dispositivos finales (sensores) se registran directamente en el gateway, sin necesidad de un servidor LoRaWAN externo como ChirpStack o TTN.

La **API MQTT** es la vía de integración con plataformas de terceros. Sobre mensajes **JSON** transportados por MQTT te permite:

- **Recibir datos de uplink** de todos los dispositivos de una aplicación.
- **Enviar downlinks** (comandos) a los dispositivos.
- Recibir **notificaciones Join** (un dispositivo se unió a la red) y **ACK** (acuse de un downlink confirmado).
- Recibir **información del gateway** (modelo, firmware, red, batería en el SG50) de forma periódica.
- **Administrar el NS embebido** —alta, baja, modificación y consulta de dispositivos, y consulta de información del gateway— mediante un patrón *request/response* sobre MQTT.

### 1.2 Modelo de comunicación

```
┌──────────────┐   uplink / join / ACK / gateway info / response   ┌────────┐   subscribe   ┌──────────────┐
│   Gateway    │ ─────────────────────────────────────────────────► │ Broker │ ◄──────────── │  Tu          │
│ (NS embebido)│ ◄───────────────────────────────────────────────── │ MQTT   │ ────────────► │  plataforma  │
└──────────────┘        downlink / request (tú publicas)            └────────┘   publish     └──────────────┘
```

- **Requisito previo:** en la interfaz web del gateway, habilita una **integración MQTT dentro de una aplicación** del Network Server (*Network Server → Application → Data Topic*) y configura los topics de datos que necesites.
- Todos los mensajes entre el NS embebido y el broker MQTT se transmiten en **formato JSON**.

---

## Capítulo 2 — Conexión y Topics de Datos

### 2.1 Los topics los defines tú

A diferencia de otras APIs LoRaWAN, **los topics no son fijos**: en la integración MQTT de la aplicación hay un campo de topic configurable para cada tipo de dato. La pantalla del gateway ofrece estas 7 entradas:

| Tipo de dato | Dirección | Cuándo se publica |
| ------------ | --------- | ----------------- |
| **Uplink data** | Gateway → plataforma | Al recibirse uplink de un dispositivo (*publish as updated*). |
| **Downlink data** | Plataforma → gateway | Cuando tu plataforma publica un downlink. |
| **Join notification** | Gateway → plataforma | Cuando el gateway envía el *join accept* a un dispositivo. |
| **ACK notification** | Gateway → plataforma | Cuando llega el acuse de un downlink confirmado. |
| **Gateway Info** | Gateway → plataforma | **Periódico** (campo *Period*; p. ej. `64800` s en la UI por defecto). |
| **Request data** | Plataforma → gateway | Cuando tu plataforma publica un request de administración. |
| **Response data** | Gateway → plataforma | Respuesta al request anterior. |

Cada entrada permite además configurar **QoS** (QoS 0 por defecto) y, en los topics que publica el gateway, la bandera **Retain**.

> **Nota:** configura y suscríbete solo a los topics que necesites. Si tu plataforma no envía downlinks ni administra dispositivos, basta con los topics de uplink (y opcionalmente Join/ACK/Gateway Info).

### 2.2 Comodín `$deveui`

Los topics de tipo dispositivo (uplink, downlink, Join y ACK) aceptan el **comodín `$deveui`** al configurarse en el gateway. El gateway sustituye `$deveui` por el DevEUI real de cada dispositivo al publicar o al esperar el mensaje.

Ejemplo de configuración del topic de downlink:

```
milesight/downlink/$deveui
```

Para enviar un downlink al dispositivo `24E124136A456465`, tu plataforma publica en:

```
milesight/downlink/24E124136A456465
```

> **Notas:**
> - El comodín `$deveui` está disponible a partir del firmware **64.0.0.3-r2 / 50.0.0.4-r2**. En firmware anterior, los topics no admiten comodín (recibes todos los dispositivos en un único topic).
> - Los ejemplos de esta guía usan el prefijo `milesight/…` por convención del documento del fabricante; puedes usar el prefijo que prefieras, siempre que coincida con lo configurado en el gateway.

---

## Capítulo 3 — Datos Publicados por el Gateway

### 3.1 Uplink Data

Al suscribirte al topic de uplink recibes los datos de todos los dispositivos de la aplicación (o de uno específico si configuraste `$deveui`).

Ejemplo de mensaje recibido:

```json
{
  "applicationID": "3",
  "applicationName": "test",
  "data": "/wv//wEB/xZnB+CUI3cIAf8JAhD/CgEG/w8A",
  "devEUI": "24e124707e094237",
  "deviceName": "AM300",
  "fCnt": 1,
  "fPort": 85,
  "rxInfo": [
    {
      "altitude": "-",
      "latitude": "-",
      "longitude": "-",
      "loRaSNR": 6.19,
      "mac": "24e124fffefa0fa8",
      "name": "Local_Gateway",
      "rssi": -49,
      "time": "2025-04-12T02:56:19"
    }
  ],
  "time": "2025-04-12T02:56:19",
  "txInfo": {
    "frequency": 904700000,
    "adr": true,
    "codeRate": "4/5",
    "dataRate": {
      "modulation": "LORA",
      "bandwidth": 125,
      "spreadFactor": 8
    }
  }
}
```

Parámetros:

| Nombre | Descripción |
| ------ | ----------- |
| `applicationID` | ID de la aplicación. |
| `applicationName` | Nombre de la aplicación. |
| `data` | Payload del paquete (**formato Base64**). |
| `devEUI` | Device EUI. |
| `deviceName` | Nombre del dispositivo. |
| `fCnt` | Contador de tramas (frame counter). |
| `fPort` | Puerto de aplicación del dispositivo. |
| `rxInfo` | Información de recepción (una entrada por gateway que escuchó el paquete). |
| `rxInfo[].altitude` / `latitude` / `longitude` | Posición del gateway (**solo SG50**). |
| `rxInfo[].loRaSNR` | Relación señal-ruido. |
| `rxInfo[].mac` | Dirección MAC del gateway. |
| `rxInfo[].name` | Nombre del gateway. |
| `rxInfo[].rssi` | Intensidad de señal (dBm). |
| `rxInfo[].time` | Hora en que el gateway recibió el paquete. |
| `time` | Hora de recepción del paquete. |
| `txInfo.frequency` | Frecuencia de recepción (Hz). |
| `txInfo.adr` | Estado de ADR del dispositivo. |
| `txInfo.codeRate` | Tasa de código. |
| `txInfo.dataRate.modulation` | Modulación (LORA). |
| `txInfo.dataRate.bandwidth` | Ancho de banda de transmisión. |
| `txInfo.dataRate.spreadFactor` | Factor de propagación (spreading factor). |

> **Nota:** el payload `data` llega **cifrado/codificado en Base64** tal como lo envió el dispositivo; su interpretación (decodificador de payload) es responsabilidad de tu plataforma.

### 3.2 Join Notification

El gateway publica este mensaje cuando envía el *join accept* que admite a un dispositivo en la red.

```json
{
  "applicationID": "3",
  "applicationName": "test",
  "deviceName": "AM300",
  "devEUI": "24e124707e094237",
  "devAddr": "06b18ccf",
  "time": "2025-04-12T02:56:18"
}
```

| Nombre | Descripción |
| ------ | ----------- |
| `applicationID` / `applicationName` | Aplicación a la que pertenece el dispositivo. |
| `deviceName` / `devEUI` | Identidad del dispositivo. |
| `devAddr` | Device Address asignada. |
| `time` | Hora en que se envió el *join accept*. |

### 3.3 ACK Notification

Al enviar downlinks **confirmados**, el gateway publica el acuse del dispositivo en este topic.

```json
{
  "applicationID": "3",
  "applicationName": "test",
  "deviceName": "AM300",
  "devEUI": "24e124707e094237",
  "acknowledged": true,
  "fCnt": 2,
  "time": "2025-04-12T02:56:18"
}
```

| Nombre | Descripción |
| ------ | ----------- |
| `acknowledged` | Si el dispositivo recibió el downlink. |
| `fCnt` | Contador de tramas. |
| `time` | Hora del acuse. |
| (demás) | Mismos campos de identificación que Join Notification. |

### 3.4 Gateway Info

Publicación **periódica** con la ficha del gateway: identidad, firmware y estado de red (y en el SG50, GPS y batería solar).

```json
{
  "tunnel_support": true,
  "device_info": {
    "model": "UG63-L08GL-868M",
    "region": "EU868",
    "eui": "24E124FFFEF9A1E2",
    "gateway_id": "24E124FFFEF9A1E2",
    "firmware_version": "64.0.0.3-r1",
    "hardware_version": "V1.1",
    "cpu_tempeture": "53.3°",
    "profile_version": "v1.1",
    "tsl_version": "v1.0"
  },
  "network_info": {
    "modem_version": "EG912UGLAAR03A09M08_01.200.01.200",
    "cellular_ip": "-",
    "imei": "869487060869384",
    "iccid": "-",
    "link": 1,
    "cellular_status": 0,
    "modem_status": 0,
    "wan_type": 1,
    "wan_status": 1,
    "wan_ip": "192.168.45.196",
    "wan_mac": "24:e1:24:f9:a1:e2"
  }
}
```

| Nombre | Descripción |
| ------ | ----------- |
| `tunnel_support` | Si el gateway soporta acceso remoto. |
| `device_info.model` | Modelo del equipo. |
| `device_info.region` | Región de frecuencia LoRaWAN. |
| `device_info.eui` / `gateway_id` | EUI / ID del gateway. |
| `device_info.firmware_version` / `hardware_version` | Versiones de firmware y hardware. |
| `device_info.cpu_tempeture` | Temperatura de CPU (°C). *(nombre del campo tal como lo publica el firmware)*. |
| `device_info.profile_version` / `tsl_version` | Versiones de perfil y TSL. |
| `device_info.gps` | Coordenadas (**solo SG50**). |
| `device_info.status` | `0`: operación normal, `1`: modo sleep (**solo SG50**). |
| `battery_info` | Información de la batería interna (**solo SG50**). |
| `battery_info.battery_temperature` | Temperatura de batería (°C). |
| `battery_info.solar_status` | `0`: inactivo, `1`: activo. |
| `battery_info.battery_level` | Nivel de carga (%). |
| `battery_info.battery_status` | `0`: desconocido, `1`: cargando, `2`: descargando, `3`: carga completa, `4`: carga anormal. |
| `network_info.modem_version` | Firmware del módulo celular. |
| `network_info.cellular_ip` | IP de la red celular. |
| `network_info.imei` / `iccid` | IMEI del módulo celular / ICCID de la SIM. |
| `network_info.link` | `1`: WAN, `2`: celular (**solo UG63**). |
| `network_info.cellular_status` | `0`: desconectado, `1`: conectado (**solo UG63**). |
| `network_info.modem_status` | `0`: sin SIM, `1`: SIM con error, `2`: error de PIN, `3`: PIN requerido, `4`: PUK requerido, `5`: sin señal, `6`: listo, `7`: caído, `8`: sin celular (**solo UG63**). |
| `network_info.wan_type` | `0`: cliente DHCP, `1`: IP estática (**solo UG63**). |
| `network_info.wan_status` | `0`: desconectado, `1`: conectado (**solo UG63**). |
| `network_info.wan_ip` / `wan_mac` | IP / MAC del puerto WAN (**solo UG63**). |

> **Nota:** los campos marcados **solo SG50** o **solo UG63** no aparecen en el otro modelo. Tu parser debe tolerar su ausencia.

---

## Capítulo 4 — Downlink Data (Plataforma → Gateway)

Para enviar un comando a un dispositivo, publica en el topic de downlink (con el DevEUI real si usaste el comodín `$deveui`).

Ejemplo de publicación a `milesight/downlink/24E124136A456465`:

```json
{
  "confirmed": true,
  "fPort": 85,
  "data": "/xD/"
}
```

| Nombre | Tipo | Requerido | Descripción |
| ------ | ---- | --------- | ----------- |
| `confirmed` | bool | Sí | Si el downlink requiere confirmación del dispositivo (ver [ACK Notification](#33-ack-notification)). |
| `fPort` | int | Sí | Puerto de aplicación del dispositivo. |
| `data` | string | Sí | Comando de downlink (**formato Base64**). |

---

## Capítulo 5 — Request y Response: Administración del Network Server

El gateway expone una **API pseudo-REST sobre MQTT** para configurar el NS embebido: publicas un **request** en el topic *Request data* y recibes la **respuesta** en el topic *Response data*.

> **Nota:** suscríbete al topic *Response data* **antes** de publicar el request, o perderás la respuesta.

### 5.1 Formato de los mensajes

Request:

```json
{
  "id": "123",
  "method": "GET",
  "url": "/ns/device/add",
  "body": {
  }
}
```

Response:

```json
{
  "id": "123",
  "method": "GET",
  "url": "/ns/device/add",
  "body": {
    "code": 200,
    "error": ""
  }
}
```

| Campo | Descripción |
| ----- | ----------- |
| `id` | Valor arbitrario definido por ti; la respuesta lo repite. **Úsalo para correlacionar request ↔ response.** |
| `method` | `GET`, `POST`, `PUT` o `DELETE`, según la operación. |
| `url` | Ruta de la operación (tabla siguiente). |
| `body` | Contenido; obligatorio en `POST` y `PUT`. |

Operaciones disponibles:

| # | Operación | Method | URL |
| - | --------- | ------ | --- |
| 5.2 | Agregar dispositivo | `POST` | `/ns/device/add` |
| 5.3 | Eliminar dispositivo(s) | `DELETE` | `/ns/device` |
| 5.4 | Consultar dispositivos | `GET` | `/ns/device?search=&limit=&offset=&applicationId=` |
| 5.5 | Modificar dispositivo | `PUT` | `/ns/device/{devEUI}` |
| 5.6 | Consultar información del gateway | `GET` | `/gatewayinfo` |

Los códigos de resultado (`200`, `20101001`…) están en el [Apéndice A](./APENDICE-A.md).

---

### 5.2 Agregar dispositivo — `POST /ns/device/add`

Request:

```json
{
  "id": "1",
  "method": "POST",
  "url": "/ns/device/add",
  "body": {
    "name": "EM300",
    "description": "em300",
    "devEUI": "24E124136A456465",
    "classMode": "Class A",
    "netAccess": "OTAA",
    "appKey": "5572404c696e6b4c6f52613230313823",
    "devAddr": "",
    "nwkSKey": "5572404c696e6b4c6f52613230313823",
    "appSKey": "5572404c696e6b4c6f52613230313823",
    "fCntUp": 0,
    "fCntDown": 0,
    "fPort": 1,
    "skipFCntCheck": false
  }
}
```

Response (éxito):

```json
{
  "id": "1",
  "method": "POST",
  "url": "/ns/device/add",
  "body": { "code": 200, "error": "" }
}
```

Parámetros del `body`:

| Nombre | Tipo y rango | Default | Requerido | Descripción |
| ------ | ------------ | ------- | --------- | ----------- |
| `name` | string (64) | devEUI | Sí | Nombre único en la lista de dispositivos. |
| `description` | string (1024) | — | Sí | Descripción del dispositivo. |
| `applicationID` | string | — | No | ID de una aplicación existente. |
| `devEUI` | string 16 (HEX) | — | Sí | Device EUI; debe ser único. |
| `classMode` | string | — | Sí | `Class A` o `Class C`. |
| `netAccess` | string | — | Sí | `OTAA` o `ABP`. |
| `appKey` | string 32 (HEX) | `5572404c696e6b4c6f52613230313823` | No | Necesario cuando el tipo de unión es **OTAA**. |
| `devAddr` | string 8 (HEX) | — | Sí | Necesario cuando el tipo de unión es **ABP**. |
| `nwkSKey` | string 32 (HEX) | `5572404c696e6b4c6f52613230313823` | No | Necesario cuando el tipo de unión es **ABP**. |
| `appSKey` | string 32 (HEX) | `5572404c696e6b4c6f52613230313823` | No | Necesario cuando el tipo de unión es **ABP**. |
| `fCntUp` | uint 0–4294967295 | `0` | No | Se agrega cuando el tipo de unión es ABP. |
| `fCntDown` | uint 0–4294967295 | `0` | No | Se agrega cuando el tipo de unión es ABP. |
| `fPort` | int 1–223 | `1` | Sí | Puerto de aplicación del dispositivo. |
| `skipFCntCheck` | bool | `false` | Sí | Validación del contador de tramas. |

---

### 5.3 Eliminar dispositivo(s) — `DELETE /ns/device`

Elimina uno o varios dispositivos por su DevEUI.

Request:

```json
{
  "id": "1",
  "method": "DELETE",
  "url": "/ns/device",
  "body": {
    "ids": ["24E124136A456465", "24E124136A456069"]
  }
}
```

Response (éxito):

```json
{
  "id": "1",
  "method": "DELETE",
  "url": "/ns/device",
  "body": { "code": 200, "error": "" }
}
```

---

### 5.4 Consultar dispositivos — `GET /ns/device`

Consulta con paginación y filtro opcional por aplicación. Tres formas de uso:

```json
{ "id": "1", "method": "GET", "url": "/ns/device?search=&limit=100&offset=0" }
```

```json
{ "id": "2", "method": "GET", "url": "/ns/device?search=&limit=10&offset=0&applicationId=1" }
```

```json
{ "id": "3", "method": "GET", "url": "/ns/device?search=24E124136A456465&limit=10&offset=0" }
```

Parámetros de la query:

| Nombre | Tipo | Default | Requerido | Descripción |
| ------ | ---- | ------- | --------- | ----------- |
| `search` | string | — | No | DevEUI o nombre de dispositivo a buscar; vacío busca todos. |
| `limit` | int | `10` | No | Cantidad máxima de dispositivos a consultar. |
| `offset` | int | `0` | No | Desde qué dispositivo consultar. |
| `applicationId` | int | `0` | No | Consulta los dispositivos de esta aplicación; `0` consulta todos. |

Response:

```json
{
  "id": "1",
  "method": "GET",
  "url": "/ns/device?search=&limit=100&offset=0",
  "body": {
    "total": 2,
    "result": [
      {
        "name": "EM300",
        "description": "em300",
        "devEUI": "24E124136A456465",
        "appEUI": "",
        "classMode": "Class A",
        "netAccess": "OTAA",
        "fPort": 1,
        "skipFCntCheck": false,
        "devAddr": "",
        "appKey": "5572404c696e6b4c6f52613230313823",
        "nwkSKey": "",
        "appSKey": "",
        "fCntUp": 0,
        "fCntDown": 0,
        "active": 0,
        "applicationId": "3",
        "applicationName": "test",
        "createTime": "2025-04-12 13:22:06+0800",
        "lastTime": "",
        "channelsConfiguredFlag": 0,
        "rx2ConfiguredFlag": 0,
        "newChannelsConfiguredFlag": 0
      },
      {
        "name": "AM300",
        "description": "",
        "devEUI": "24e124707E094237",
        "appEUI": "24e124c0002a0001",
        "classMode": "Class A",
        "netAccess": "OTAA",
        "fPort": 85,
        "skipFCntCheck": false,
        "devAddr": "06b18ccf",
        "appKey": "5572404c696e6b4c6f52613230313822",
        "nwkSKey": "cb6125fde2cc1894e5984db1016b1cda",
        "appSKey": "eda3215c1a9c34ca6bc8ec76373e9da4",
        "fCntUp": 32,
        "fCntDown": 32,
        "active": 1,
        "applicationId": "3",
        "applicationName": "test",
        "createTime": "2025-04-10 13:29:42+0800",
        "lastTime": "59 seconds ago",
        "channelsConfiguredFlag": 1,
        "rx2ConfiguredFlag": 0,
        "newChannelsConfiguredFlag": 0
      }
    ],
    "deviceMax": 20
  }
}
```

Campos de respuesta:

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `total` | string | Cantidad de dispositivos de la consulta. |
| `result` | array | Resultado de la consulta. |
| `result[].name` / `description` | string | Nombre y descripción del dispositivo. |
| `result[].devEUI` / `appEUI` | string | Device EUI / App EUI. |
| `result[].classMode` | string | Clase del dispositivo. |
| `result[].netAccess` | string | Tipo de unión (OTAA/ABP). |
| `result[].fPort` | int | Puerto de aplicación. |
| `result[].skipFCntCheck` | bool | Validación del contador de tramas. |
| `result[].devAddr` | string | Device Address. |
| `result[].appKey` / `nwkSKey` / `appSKey` | string | Llaves del dispositivo. |
| `result[].fCntUp` / `fCntDown` | int | Contadores de tramas uplink / downlink. |
| `result[].active` | int | `1`: activado, `0`: desactivado. |
| `result[].applicationId` / `applicationName` | string | Aplicación a la que pertenece. |
| `result[].createTime` | string | Fecha de creación del dispositivo. |
| `result[].lastTime` | string | Última vez que se recibió algo del dispositivo. |
| `deviceMax` | int | Número máximo de dispositivos soportado por el gateway. |

---

### 5.5 Modificar dispositivo — `PUT /ns/device/{devEUI}`

> **Nota:** antes de modificar un dispositivo, **consúltalo primero** (§5.4). El request de modificación exige campos que solo obtienes de la consulta, como `createTime`.

Request:

```json
{
  "id": "1",
  "method": "PUT",
  "url": "/ns/device/24E124136A456465",
  "body": {
    "name": "EM300",
    "description": "em300",
    "devEUI": "24E124136A456465",
    "classMode": "Class A",
    "netAccess": "OTAA",
    "appKey": "5572404c696e6b4c6f52613230313823",
    "devAddr": "",
    "nwkSKey": "5572404c696e6b4c6f52613230313823",
    "appSKey": "5572404c696e6b4c6f52613230313823",
    "fCntUp": 0,
    "fCntDown": 0,
    "fPort": 1,
    "skipFCntCheck": false,
    "createTime": "2025-04-12 13:22:06+0800"
  }
}
```

Response (éxito):

```json
{
  "id": "1",
  "method": "PUT",
  "url": "/ns/device/24E124136A456465",
  "body": { "code": 200, "error": "" }
}
```

Los parámetros son los mismos de [Agregar dispositivo](#52-agregar-dispositivo--post-nsdeviceadd), con estas diferencias:

| Nombre | Requerido | Descripción |
| ------ | --------- | ----------- |
| `name` | No | Nombre único en la lista de dispositivos. |
| `description` | No | Descripción. |
| `createTime` | **Sí** | Fecha de creación del dispositivo (obtenida de la consulta). |
| (demás) | igual que en alta | — |

---

### 5.6 Consultar información del gateway — `GET /gatewayinfo`

Devuelve la misma estructura descrita en [Gateway Info](#34-gateway-info) (§3.4), pero bajo demanda en lugar de esperar la publicación periódica.

Request:

```json
{ "id": "1", "method": "GET", "url": "/gatewayinfo" }
```

Response:

```json
{
  "id": "1",
  "method": "GET",
  "url": "/gatewayinfo",
  "body": {
  }
}
```

---

## Capítulo 6 — Buenas Prácticas

- **Suscríbete al topic de respuesta antes de publicar requests.** MQTT no reenvía mensajes pasados (salvo *retained*); si publicas el request antes de suscribirte, la respuesta se pierde.
- **Genera un `id` único por request** y úsalo como clave de correlación. En un sistema con varios procesos publicando, es la única forma de emparejar cada response con su request.
- **Decide OTAA o ABP antes del alta.** Con OTAA solo necesitas `appKey`; con ABP debes generar `devAddr`, `nwkSKey` y `appSKey` (y opcionalmente los contadores). Enviar llaves de ABP en un alta OTAA es inofensivo pero innecesario.
- **Consulta antes de modificar.** `PUT /ns/device/{devEUI}` exige `createTime`; obténlo con un `GET` previo y reenvía el objeto completo con solo los campos modificados.
- **Respeta `deviceMax`.** El gateway tiene un límite de dispositivos (visible en la consulta). Si recibes el código `20101003`, el NS está lleno.
- **Usa `confirmed: true` solo cuando lo necesites.** El downlink confirmado te da visibilidad vía ACK, pero consume más aire y batería del dispositivo.
- **Tolera campos ausentes.** El JSON de Gateway Info cambia entre SG50 y UG63 (GPS/batería vs. WAN/celular); parsea de forma defensiva.
- **Verifica el firmware si planeas usar `$deveui`.** El comodín requiere la revisión `-r2` (ver [Historial](./HISTORIAL-ACTUALIZACIONES.md)).

---

## Capítulo 7 — Solución de Problemas

| Síntoma | Causa probable / solución |
| ------- | ------------------------- |
| No llega ningún mensaje | La integración MQTT no está habilitada **dentro de la aplicación** del NS, o el topic configurado no coincide con el suscrito. Verifica broker, credenciales y nombre de topic en la UI del gateway. |
| Recibo datos de todos los dispositivos y esperaba solo uno | Configura el comodín `$deveui` en el topic (requiere firmware `-r2`). |
| Mi downlink no hace nada | Verifica que publicas en el topic de **Downlink data** con el DevEUI real (no el literal `$deveui`), y que `fPort` coincide con el que escucha el dispositivo. |
| No recibo respuesta a mis requests | No estabas suscrito al topic *Response data* al momento de publicar, o el `url` del request llegó vacío (`20101004`). |
| `20101001` — Parameter Error | Falta un campo requerido o un valor fuera de rango (revisa longitudes HEX de `devEUI`/llaves y rangos de `fPort`). |
| `20101002` — devEUI exist | Ya existe un dispositivo con ese DevEUI; elimínalo o modifícalo en lugar de darlo de alta. |
| `20101003` — Device number max | El NS llegó a su máximo de dispositivos (`deviceMax`). |
| `20101004` — URI is null | El request se publicó sin `url` o con `url` vacía. |
| Gateway Info sin GPS/batería (o sin WAN/celular) | Son campos exclusivos por modelo: GPS/batería solo en SG50; WAN/celular solo en UG63. |

---

## Capítulo 8 — Checklist de Integración

- [ ] Confirmar modelo (SG50 o UG63) y firmware (`-r2` si necesitas comodín `$deveui`).
- [ ] Crear/habilitar la aplicación en el NS embebido y su **integración MQTT**.
- [ ] Configurar los topics de datos necesarios (uplink, downlink, Join, ACK, Gateway Info, Request/Response) con QoS acorde.
- [ ] Suscribir la plataforma a los topics gateway → plataforma (incluido *Response data*) antes de operar.
- [ ] Implementar correlación de requests por `id` y manejo de códigos de retorno ([Apéndice A](./APENDICE-A.md)).
- [ ] Dar de alta un dispositivo de prueba (§5.2) y validar uplink end-to-end.
- [ ] Probar un downlink confirmado y su ACK (Capítulo 4 + §3.3).

---

> *Documento educativo basado en la especificación oficial del fabricante. Para parámetros y comportamientos exactos, consulta siempre el documento oficial en [`docs/`](./docs/) que corresponda a tu firmware.*

---

## Navegación

| Sección | Enlace |
| ------- | ------ |
| Apéndice A — códigos y ajustes regionales | [APENDICE-A.md](./APENDICE-A.md) |
| Historial de actualizaciones | [HISTORIAL-ACTUALIZACIONES.md](./HISTORIAL-ACTUALIZACIONES.md) |
| MILESIGHT — índice de plataformas | [../README.md](../README.md) |
| Índice de marcas | [../../README.md](../../README.md) |
