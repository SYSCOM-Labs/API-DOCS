# Hik-Connect for Teams (HikCentral Connect) — OpenAPI V2.15.0

> Versión del documento: V2.15.0 — Marzo 2026  
> Producto: Hik-Connect for Teams / HikCentral Connect

---

## Información Legal

- Este documento incluye instrucciones para el uso y gestión del Producto. Todas las imágenes, gráficos, ilustraciones e información son únicamente para fines descriptivos y explicativos. Hikvision no otorga garantías, expresas ni implícitas, salvo que se acuerde lo contrario por escrito.
- Ninguna parte de este documento puede ser extractada, copiada, traducida ni modificada, total o parcialmente, por ningún medio sin autorización escrita.
- **AVISO LEGAL:** El producto se proporciona "TAL CUAL" y "CON TODOS SUS DEFECTOS Y ERRORES". En ningún caso Hikvision ni SYSCOM serán responsable de daños especiales, consecuentes, incidentales o indirectos.
- Usted es responsable de usar este producto conforme a la legislación aplicable y de manera que no infrinja los derechos de terceros.

---

## Demos Disponibles

| Demo | Descripción |
| ---- | ----------- |
| [Video en vivo](./demos/video/README.md) | Autenticación, exploración de cámaras y reproducción de video en vivo con EZUIKit |

---

## Tabla de Contenidos

- [Capítulo 1 — Descripción General](#capítulo-1--descripción-general)
- [Capítulo 2 — Primeros Pasos](#capítulo-2--primeros-pasos)
- [Capítulo 3 — Resumen del Protocolo](#capítulo-3--resumen-del-protocolo)
- [Capítulo 4 — Aplicaciones Típicas](#capítulo-4--aplicaciones-típicas)
- [Capítulo 5 — Referencia de API](#capítulo-5--referencia-de-api)
- [Apéndice A — Apéndices](#apéndice-a--apéndices)

---

## Capítulo 1 — Descripción General

### 1.1 Introducción

Hik-Connect for Teams (HikCentral Connect) es la plataforma VSaaS (Video Security as a Service) de Hikvision para la gestión unificada de seguridad. Proporciona capacidades abiertas y APIs para la gestión de cuentas de usuario, recursos y alarmas/eventos. Los fabricantes y desarrolladores de terceros pueden utilizar estas APIs para integrar rápidamente diferentes aplicaciones.

**Requisitos previos antes de comenzar la integración:**

- Dominar uno o varios lenguajes de programación como Java o C++.
- Tener conocimientos básicos de seguridad de video (cámaras, control PTZ, alarmas).

**Orden de lectura recomendado:**

1. Revisar los Términos y Definiciones.
2. Estudiar las Capacidades Abiertas.
3. Revisar los flujos de llamadas a la API en Aplicaciones Típicas.
4. Verificar las APIs necesarias para su servicio.
5. Estudiar el Resumen del Protocolo (reglas de llamada, autenticación, reglas de respuesta).
6. Consultar la Referencia de API para los parámetros de solicitud/respuesta.

---

### 1.2 Capacidades Abiertas

#### 1.2.1 Capacidades del Sistema

Servicios relacionados con las operaciones de la plataforma e inicio de sesión:

- Autenticación de inicio de sesión
- Obtención de información de la plataforma y del usuario
- Obtención del token de streaming
- Obtención de información del paquete de servicios

#### 1.2.2 Capacidades de Alarma

Servicios relacionados con la gestión de alarmas:

- Obtención de reglas de alarma
- Edición de reglas de alarma
- Suscripción a eventos
- Obtención de mensajes de alarma

> **Notas:**
>
> - Después de llamar a `POST /api/hccgw/alarm/v1/mq/messages` y confirmar la recepción mediante `POST /api/hccgw/alarm/v1/mq/messages/complete`, no podrá recuperar el mismo mensaje nuevamente.
> - Los mensajes se almacenan durante **3 días** de forma predeterminada.
> - Intervalo de sondeo recomendado: cada **500 ms**.

#### 1.2.3 Capacidades de Recursos

Servicios relacionados con la información de dispositivos:

- Información de áreas
- Información de cámaras
- Información de entradas/salidas de alarma

#### 1.2.4 Capacidades de Video

Servicios que incluyen:

- Obtención de plantillas de programación de grabación
- Obtención de direcciones de reproducción
- Reproducción de video sin plugin (compatible en Singapur, Norteamérica, Sudamérica y Europa — **no** en India ni Rusia)

#### 1.2.5 Capacidades de Mensajes

Servicios que incluyen:

- Suscripción a mensajes
- Cancelación de suscripción a mensajes
- Obtención de mensajes

#### 1.2.6 Capacidades de Gestión de Personas

Servicios que incluyen:

- Obtención de lista de departamentos
- Agregar/eliminar personas
- Actualizar información básica de personas
- Consultar información de una sola persona
- Buscar lista de personas
- Registrar/actualizar huellas dactilares
- Registrar/actualizar tarjetas
- Actualizar código PIN
- Actualizar fotografías de rostro
- Agregar personas rápidamente

#### 1.2.7 Capacidades de Videoportero

Servicios que incluyen:

- Gestión de edificios/habitaciones
- Gestión de residentes
- Gestión de pases temporales
- Gestión de llamadas

#### 1.2.8 Capacidades de Control de Acceso

Servicios que incluyen:

- Apertura remota de puertas
- Obtención de información de cifrado Bluetooth
- Búsqueda de registros de pasos de tarjeta
- Aplicación del nivel de acceso de una persona

#### 1.2.9 Capacidades de Monitoreo a Bordo

Servicios que incluyen:

- Gestión de dispositivos a bordo y vehículos vinculados
- Suscripción y obtención de alarmas y mensajes
- Vista en vivo, reproducción y audio bidireccional sin plugin (mediante JSSDK)

> **Notas:**
>
> - Cada dispositivo a bordo y cada vehículo tienen una correspondencia uno a uno.
> - Mensajes = información sin procesar cargada por el dispositivo; Alarmas = mensajes procesados por reglas de alarma en la plataforma.
> - Para audio bidireccional con dispositivos a bordo, ingrese `1` como número de canal de cámara.

#### 1.2.10 Capacidades de Asistencia

Servicios que incluyen:

- Búsqueda de datos del informe de Total de Tarjeta de Tiempo

---

### 1.3 Términos y Definiciones


| Término               | Descripción                                                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| OpenAPI               | APIs de acceso público que proporcionan a los desarrolladores acceso programático a software propietario o servicios web. |
| Hik-Connect for Teams | Una plataforma de gestión de seguridad de video (VSaaS).                                                                  |
| Método HTTP           | GET (obtener recursos), PUT (establecer/actualizar recursos), POST (agregar/buscar recursos), DELETE (eliminar recursos). |
| header                | Datos suplementarios al inicio de un bloque de datos de solicitud, en pares clave-valor. Ej.: `Accept: text/plain`.       |
| path                  | Ruta de solicitud HTTP que sigue al nombre de dominio/IP. Ej.: `/artemis/api`.                                            |
| query                 | Parámetros en la dirección de solicitud. Ej.: `?a=b&c=d`.                                                                 |
| bodyForm              | Parámetros en pares clave-valor en el cuerpo de la solicitud (método POST).                                               |
| AK                    | Clave de Acceso (appKey) — se usa junto con SK para cifrar la firma.                                                      |
| SK                    | Clave de Acceso Secreta (appSecret) — se usa junto con AK para la autenticación.                                          |
| Mensaje               | Contenido cargado activamente por el dispositivo cuando no hay fuente de activación externa.                              |
| Alarma                | Contenido cargado por el dispositivo cuando se activan las reglas de alarma configuradas.                                 |


---

### 1.4 Historial de Actualizaciones

El listado por versión se mantiene en [HISTORIAL-ACTUALIZACIONES.md](HISTORIAL-ACTUALIZACIONES.md).

---

## Capítulo 2 — Primeros Pasos

### Paso 1 — Obtener la dirección del servidor y registrar una cuenta


| País/Región      | Dirección del Servidor               |
| ---------------- | ------------------------------------ |
| Rusia            | `https://hikcentralconnectru.com`    |
| Singapur / India | `https://isgp.hikcentralconnect.com` |
| Europa           | `https://ieu.hikcentralconnect.com`  |
| Sudamérica       | `https://isa.hikcentralconnect.com`  |
| Norteamérica     | `https://ius.hikcentralconnect.com`  |


### Paso 2 — Obtener AK y SK

Consulte el procedimiento detallado para generar su AK y SK en este artículo de soporte:  
[HikConnect Teams — Generar AppKey y SecretKey para integración](https://soporte.syscom.mx/es/articles/13430554-hikconnect-teams-generar-appkey-secretkey-para-integracion).

Guarde sus claves de forma segura; si alguna se ve comprometida, contacte al soporte para reemplazarla.

### Paso 3 — Solicitar un token

Llame a `POST /api/hccgw/platform/v1/token/get` usando su AK y SK para obtener un token de autenticación.

### Paso 4 — Llamar a otras APIs

Use el token y los parámetros requeridos para todas las llamadas API posteriores.

---

## Capítulo 3 — Resumen del Protocolo

### 3.1 Reglas de API


| Regla                       | Detalles                                                      |
| --------------------------- | ------------------------------------------------------------- |
| Protocolo de Transmisión    | HTTPS                                                         |
| Formato de URL de Solicitud | `https://{hostname}:{port}/{uri}`                             |
| Métodos de Solicitud        | POST / GET                                                    |
| Formato de Datos            | JSON (`application/json` como `Content-Type`)                 |
| Codificación de Caracteres  | UTF-8                                                         |
| Autenticación de Seguridad  | Basada en AK/SK (se requiere token antes de las llamadas API) |
| Control de Permisos         | Solo se pueden llamar APIs con permiso de llamada             |
| Requisito de Certificado    | Actualmente no requerido                                      |
| Frecuencia de Solicitudes   | Máximo **5 solicitudes por segundo**                          |


### 3.2 Firma y Autenticación

La autenticación se basa en AK/SK. Pasos:

1. Generar AK y SK en la cuenta de HikConnect Team.
2. Llamar a `POST /api/hccgw/platform/v1/token/get` con AK y SK.
3. Recibir un `accessToken` válido por **7 días**. Llamar repetidamente a la API de inicio de sesión dentro de este período actualiza el token de vuelta a 7 días.
4. Pasar el token en el encabezado `Token` para todas las llamadas API posteriores.

**Ejemplo de Encabezado de Solicitud:**

```
Accept: application/json, text/plain, */*
Accept-Encoding: gzip, deflate, br
Content-Type: application/json;charset=utf-8
Token: hcc.vh5hb9q495qjjei71g3pdmrjslo5wyti
```

### 3.3 Reglas de Respuesta

Todas las respuestas usan formato JSON, codificación UTF-8, con nombres de parámetros en camelCase.

**Estructura de respuesta:**

```json
{
  "errorCode": "0",
  "message": "Descripción del error (solo en caso de falla)",
  "data": { ... }
}
```

- `errorCode: "0"` = éxito
- Cualquier otro valor = falla (consulte [Códigos de Estado y Error](#a4-códigos-de-estado-y-error))

**Ejemplo de éxito:**

```json
{
  "data": {
    "accessToken": "hcc.vh5hb9q495qjjei71g3pdmrjslo5wyti",
    "expireTime": 1655193135,
    "userId": "8a7485aa7f209dd5017f2141adff0019"
  },
  "errorCode": "0"
}
```

**Ejemplo de falla:**

```json
{
  "message": "SECRET_KEY_NOT_EQUALS{OPEN300002}",
  "errorCode": "OPEN300002"
}
```

---

## Capítulo 4 — Aplicaciones Típicas

### 4.1 Gestionar Recursos

Proporciona un conjunto completo de APIs para gestionar recursos (dispositivos, áreas, cámaras, entradas de alarma, salidas de alarma).

- **APIs de recursos físicos:** Obtener información del dispositivo (recurso único o todos los recursos).
- **APIs de recursos lógicos:** Obtener información del sitio, área raíz, organizaciones subordinadas, detalles de área única/todas, información de cámaras.

### 4.2 Suscribirse y Obtener Alarmas

Conjunto completo de APIs para suscripción y recuperación de alarmas.

**Flujo:**

1. Obtener token (AK + SK).
2. Suscribirse: `POST /api/hccgw/alarm/v1/mq/subscribe`
3. Sondear alarmas: `POST /api/hccgw/alarm/v1/mq/messages` (intervalo recomendado: 500 ms)
4. Confirmar recepción: `POST /api/hccgw/alarm/v1/mq/messages/complete`

> **Notas:**
>
> - Las suscripciones se cancelan automáticamente si los mensajes no se consultan dentro de **2 días**.
> - Si la misma alarma se carga por segunda vez, incluirá archivos adjuntos (imágenes/videos).

### 4.3 Configurar Reglas de Alarma

Secuencia: Obtener token → Agregar/editar reglas de alarma → Configurar vinculación → Ver registros de alarma.

### 4.4 Suscribirse y Obtener Mensajes

Similar al flujo de alarmas, pero para mensajes sin procesar de dispositivos.

**Flujo:**

1. Obtener token.
2. Suscribirse: `POST /api/hccgw/rawmsg/v1/mq/subscribe`
3. Sondear mensajes: `POST /api/hccgw/rawmsg/v1/mq/messages` (intervalo recomendado: 500 ms)
4. Confirmar: `POST /api/hccgw/rawmsg/v1/mq/messages/complete`

> Las suscripciones se cancelan automáticamente si los mensajes no se reciben dentro de **2 días**.

### 4.5 Iniciar Vista en Vivo / Reproducción Sin Plugin

1. Obtener token.
2. Obtener token de streaming: `GET /api/hccgw/platform/v1/streamtoken/get`
3. Obtener dirección de vista en vivo o reproducción.
4. Usar el kit de herramientas JSSDK de Hik-Connect para la reproducción de video sin plugin.

### 4.6 Recibir Eventos de Videoportero

1. Obtener token.
2. Suscribirse a eventos de videoportero (Msg140001): `POST /api/hccgw/rawmsg/v1/mq/subscribe`
3. Cuando un dispositivo llama, la plataforma envía mensajes de evento al servicio OpenAPI.
4. Sondear mensajes de videoportero: `POST /api/hccgw/rawmsg/v1/mq/messages`
5. Usar JSSDK para vista en vivo y videoportero sin plugin.
6. Responder a llamadas: `POST /api/hccgw/devcall/v1/call/receive`
7. Abrir puerta de forma remota: `POST /api/hccgw/acs/v1/remote/control`

### 4.7 Obtener Lista de Departamentos

Llame a `POST /api/hccgw/person/v1/groups/search` para recuperar la lista de departamentos (grupos de personas).

### 4.8 Abrir Puerta vía Bluetooth

1. Obtener token.
2. Obtener clave de cifrado Bluetooth: `GET /api/hccgw/acs/v1/encryptinfo/get` (clave única y permanente).
3. Usar el SDK de Bluetooth con la clave de cifrado para abrir puertas mediante dispositivos de control de acceso / videoportero.

### 4.9 Gestionar Monitoreo a Bordo

1. Agregar dispositivos a bordo (vincular a vehículos existentes o agregar nuevos): `POST /api/hccgw/resource/v1/devices/add`
  - El dispositivo y el vehículo deben estar en la misma área.
  - Todos los recursos lógicos de los dispositivos a bordo se importan al área del vehículo.
2. Cargar fotografías del vehículo: `POST /api/hccgw/resource/v1/picture/uploadparam/get`
3. Eliminar un vehículo también elimina su área asociada.

> **Límites del paquete gratuito:** 10 vehículos, 8 canales de cámara, funciones limitadas.

### 4.10 Agregar Persona

1. Obtener token.
2. Obtener lista de departamentos: `POST /api/hccgw/person/v1/groups/search`
3. Agregar persona: `POST /api/hccgw/person/v1/persons/add`
4. (Opcional) Agregar credenciales:
  - Actualizar fotografía: `POST /api/hccgw/person/v1/persons/photo`
  - Actualizar PIN: `POST /api/hccgw/person/v1/persons/updatepinecode`
  - Actualizar huella dactilar/tarjeta: consulte [4.12 Actualizar Información de Huella Dactilar/Tarjeta](#412-actualizar-información-de-huella-dactilartzjeta)
5. (Opcional) Aplicar nivel de acceso: consulte [4.11 Aplicar Nivel de Acceso](#411-aplicar-nivel-de-acceso)

> Agregar rápido (una sola llamada para persona + rostro + PIN): `POST /api/hccgw/person/v1/persons/quick/add`

### 4.11 Aplicar Nivel de Acceso

1. Crear grupos de acceso en la plataforma.
2. Obtener token.
3. Obtener información de grupo de acceso: `POST /api/hccgw/acspm/v1/accesslevel/list`
4. Obtener información de persona: `POST /api/hccgw/person/v1/persons/list`
5. Asignar nivel de acceso: `POST /api/hccgw/acspm/v1/accesslevel/person/add`
  Eliminar nivel de acceso: `POST /api/hccgw/acspm/v1/accesslevel/person/delete`
   Modificar nivel de acceso: `POST /api/hccgw/acspm/v1/accesslevel/person/modify`
6. Ver información de aplicación: `POST /api/hccgw/acspm/v1/maintain/overview/person/{id}/elementdetail`
7. Después de la vinculación, las actualizaciones de información de persona y credenciales se sincronizan automáticamente con el dispositivo.

### 4.12 Actualizar Información de Huella Dactilar/Tarjeta

1. Obtener token.
2. Registrar huella dactilar (debe hacerse desde el dispositivo): `POST /api/hccgw/person/v1/persons/fingercollect`
  Registrar tarjeta: `POST /api/hccgw/person/v1/persons/cardcollect`
3. Actualizar huella dactilar: `POST /api/hccgw/person/v1/persons/updatefingers`
  Actualizar tarjeta: `POST /api/hccgw/person/v1/persons/updatecards`

> Para tarjetas con números de tarjeta visibles, no se requiere registro desde el dispositivo.

### 4.13 Agregar Pase Temporal

1. Obtener token.
2. Obtener lista de niveles de acceso: `POST /api/hccgw/acspm/v1/accesslevel/list`
3. Agregar pase temporal: `POST /api/hccgw/vims/v1/tempauth/add`

> **Tipos de Código QR:**
>
> - **Código QR dinámico:** Válido por 60 segundos desde su obtención. Actualizar mediante `POST /api/hccgw/vims/v1/tempauth/get`. El código anterior queda inválido cuando se usa uno nuevo.
> - **Código QR estático:** Válido durante todo el período del pase temporal.

### 4.14 Agregar Residente

1. Obtener token.
2. Obtener lista de habitaciones: `POST /api/hccgw/vims/v1/room/search` (la información de habitaciones debe agregarse primero mediante la plataforma HCC/HCT)
3. (Opcional) Obtener lista de niveles de acceso: `POST /api/hccgw/acspm/v1/accesslevel/list`
4. Agregar residente: `POST /api/hccgw/vims/v1/person/add`
5. Agregar credenciales (mismos protocolos que para personas): fotografía, huella dactilar, tarjeta, PIN.

### 4.15 Actualizar Residente

1. Obtener token.
2. (Opcional) Obtener lista de habitaciones: `POST /api/hccgw/vims/v1/room/search`
3. (Opcional) Obtener lista de niveles de acceso: `POST /api/hccgw/acspm/v1/accesslevel/list`
4. Obtener información del residente: `POST /api/hccgw/vims/v1/person/search`
5. Actualizar residente: `POST /api/hccgw/vims/v1/person/update`

> Si un residente tiene 2 habitaciones, ambas deben ingresarse en la solicitud de actualización, o la habitación omitida será eliminada.

### 4.16 Buscar Datos de Asistencia

1. Obtener token.
2. (Opcional) Buscar registros de pase de tarjeta: `POST /api/hccgw/acs/v1/event/certificaterecords/search`
3. Buscar resultados de asistencia: `POST /api/hccgw/attendance/v1/report/totaltimecard/list`

### 4.17 Envío de Mensajes por Webhook

**Requisito previo:** Se requiere cuenta de la plataforma Open API.

El sistema soporta dos modos de mensajes (elija uno):

- **Sondeo** (recuperación activa de mensajes — comportamiento original)
- **Webhook** (entrega de mensajes basada en push)

> Después de configurar Webhook, las APIs de sondeo pueden dejar de recibir mensajes. Contacte al soporte técnico para cambiar de modo.

#### Flujo de Integración Webhook

1. Crear configuración de Webhook: `POST /api/hccgw/webhook/v1/config/save`
2. Suscribirse a eventos: `POST /api/hccgw/rawmsg/v1/mq/subscribe` o `POST /api/hccgw/alarm/v1/mq/subscribe`
3. Recibir notificaciones push en su endpoint de Webhook.
  - Devolver HTTP 2XX para éxito; no 2XX = falla. Tiempo de espera: **5 segundos**.

#### Control de Seguridad

> **Nota:** Las URLs de callback deben usar HTTPS.

**1. Verificación de Firma de URL de Callback:**
Al crear un Webhook, OpenAPI primero envía una solicitud HTTPS GET para verificar la URL con los encabezados:

- `X-Hook-Batch-Id` (cadena aleatoria)
- `X-Hook-Timestamp` (marca de tiempo de la solicitud)

La respuesta debe contener un encabezado `X-Hook-Signature` válido.

**2. Verificación de Firma de Mensaje Push:**


| Encabezado HTTP    | Descripción                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `X-Hook-Batch-Id`  | Coincide con el `batchId` en el cuerpo de la solicitud                                      |
| `X-Hook-Signature` | Firma digital (formato: `algoritmo=firma`, ej.: `sha256=ede4cd6ad2e2b76b...`)               |
| `X-Hook-Timestamp` | Marca de tiempo de la solicitud (el receptor debe validar; desviación máxima: **1 minuto**) |


**Algoritmo X-Hook-Signature:**

1. Concatenar: `timestamp.batchId`
2. Generar MAC usando HMAC-SHA256 con `signSecret`
3. Codificar el MAC en hexadecimal
4. Agregar el prefijo `sha256=`

**Demo de Firma en Java:**

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class SignatureDemo {
    private static final String HASH_ALGORITHM = "HmacSHA256";

    public static String generateSignature(String secret, String timestamp, String batchId) throws Exception {
        String message = timestamp + "." + batchId;
        Mac mac = Mac.getInstance(HASH_ALGORITHM);
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HASH_ALGORITHM);
        mac.init(secretKey);
        byte[] rawMac = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : rawMac) {
            hexString.append(String.format("%02x", b));
        }
        return "sha256=" + hexString.toString();
    }
}
```

**Ejemplo de Mensaje de Alarma (push por Webhook):**

```json
{
  "batchId": "10c317bdcd3542d6887b157f9861d5a8",
  "list": [
    {
      "systemId": "9cc1f14f6bcd4f8a8e72ab1f757a47eb",
      "guid": "2200252220dc4f34b0fa41c550a8a7da",
      "msgType": "1",
      "alarmState": "1",
      "alarmMainCategory": "alarmCategoryMaintenance",
      "alarmSubCategory": "alarmSubCategoryCamera",
      "timeInfo": {
        "startTime": "2025-11-05T09:27:24Z",
        "endTime": "2025-11-05T09:27:24Z"
      },
      "eventSource": {
        "eventType": "10000",
        "sourceID": "21d5785794af49bb8ae0acb97eae4068",
        "sourceName": "Camera 01",
        "sourceType": "camera",
        "areaID": "9cc1f14f6bcd4f8a5572ab1f757a47eb_r"
      },
      "type": "alarm"
    }
  ]
}
```

---

## Capítulo 5 — Referencia de API

> Nota: No todas las APIs listadas están disponibles de forma universal — la disponibilidad depende de las capacidades del dispositivo. Consulte la lista de APIs disponibles para su Portal de Hik-Connect for Teams en el entorno de desarrollo.

---

### 5.1 Servicios Relacionados con el Sistema

#### 5.1.1 Obtener Token

`POST /api/hccgw/platform/v1/token/get`

Obtener el token de autenticación usando AK (appKey) y SK (secretKey).

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo   | Ubicación | Descripción                 |
| ------------ | --------- | ------ | --------- | --------------------------- |
| Content-Type | Requerido | String | Header    | Debe ser `application/json` |
| appKey       | Requerido | String | Body      | AK — máximo 64 caracteres   |
| secretKey    | Requerido | String | Body      | SK — máximo 64 caracteres   |

**Ejemplo de Solicitud:**

```json
{
  "appKey": "cewm9w0qjhv3i290uufnyxzp25l6ym7e",
  "secretKey": "s77w0ckmlyetp2lhfqw8p8zgm23pkpw7"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "accessToken": "hcc.vh5hb9q495qjjei71g3pdmrjslo5wyti",
    "expireTime": 1655193135,
    "userId": "8a7485aa7f209dd5017f2141adff0019",
    "areaDomain": "https://isgp.hikcentralconnect.com"
  },
  "errorCode": "0"
}
```

---

#### 5.1.2 Información de la Plataforma

`GET /api/hccgw/platform/v1/systemproperties`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "systemGUID": "fe436da09dca4e46996c1178f06c7911"
  },
  "errorCode": "0"
}
```

---

#### 5.1.3 Paquete de servicios

`GET /api/hccgw/platform/v1/servicepackage`

Consulta el resumen y el detalle de los paquetes de servicio contratados (vídeo, vehículo, detección de alarmas, etc.).

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |

**Ejemplo de Respuesta (estructura simplificada):**

```json
{
  "data": {
    "packageOverview": {
      "servicePackageOverview": [
        {
          "serviceType": "serviceVideo",
          "packageType": "3",
          "usingAmount": "0",
          "remainingAmount": "408",
          "totalAmount": "408",
          "lastExpiredTime": "1720046881661",
          "packageStatus": 0
        }
      ]
    },
    "packageDetails": {
      "servicePackage": [
        {
          "serviceType": "serviceVideo",
          "packageType": "1",
          "activationTime": "1704322081661",
          "expiredTime": "1720046881661"
        }
      ]
    }
  },
  "errorCode": "0"
}
```

---

#### 5.1.4 Token de Streaming

`GET /api/hccgw/platform/v1/streamtoken/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "appKey": "ceec5568a64916c72dbeb75f2c6bb3ef",
    "appToken": "at.5rmgt7658l535evhapzn3h4b370yxhft-4u9zipalvq-14f9b7j-vuvcag8hn",
    "streamAreaDomain": "https://isgpopen.ezvizlife.com",
    "expireTime": "1655719632454"
  },
  "errorCode": "0"
}
```

---

#### 5.1.5 Lista de Usuarios

`POST /api/hccgw/platform/v1/users/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página actual      |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–200) |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "totalCount": 5,
    "pageIndex": 1,
    "pageSize": 20,
    "user": [
      { "id": "8a7485aa7f209dd5017f2141adff0019", "name": "admin" }
    ]
  },
  "errorCode": "0"
}
```

---

### 5.2 Servicios Relacionados con Recursos

#### 5.2.1 Recursos Físicos

##### Obtener Lista de Dispositivos

`POST /api/hccgw/resource/v1/devices/get`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo    | Ubicación | Descripción                                       |
| ------------------ | --------- | ------- | --------- | ------------------------------------------------- |
| Token              | Requerido | String  | Header    | Máximo 64 caracteres                              |
| pageIndex          | Requerido | Integer | Body      | Página actual                                     |
| pageSize           | Requerido | Integer | Body      | Registros por página (1–500)                      |
| areaId             | Opcional  | String  | Body      | Filtrar por ID de área                            |
| deviceCategory     | Opcional  | String  | Body      | Categoría del dispositivo                         |
| filter.matchKey    | Opcional  | String  | Body      | Búsqueda difusa por nombre/serie/versión          |
| filter.jobNumber   | Opcional  | String  | Body      | Número de orden de trabajo (máximo 128 caracteres) |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "areaId": "area_001",
  "deviceCategory": "encodingDevice"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 2,
    "pageIndex": 1,
    "pageSize": 20,
    "deviceList": [
      {
        "deviceId": "device_001",
        "name": "Camera-01",
        "deviceSerial": "FK4599010",
        "onlineStatus": 1,
        "deviceCategory": "encodingDevice"
      }
    ]
  },
  "errorCode": "0"
}
```

---

##### Agregar Dispositivo

`POST /api/hccgw/resource/v1/devices/add`

**Parámetros de Solicitud:**

| Parámetro           | Requerido | Tipo   | Ubicación | Descripción                                          |
| ------------------- | --------- | ------ | --------- | ---------------------------------------------------- |
| Token               | Requerido | String | Header    | Máximo 64 caracteres                                 |
| deviceCategory      | Requerido | String | Body      | Categoría: `encodingDevice`, `onBoardDevice`, etc.   |
| deviceInfo.name     | Requerido | String | Body      | Nombre del dispositivo                               |
| deviceInfo.ezvizSerialNo   | Requerido | String | Body | Número de serie del dispositivo              |
| deviceInfo.ezvizVerifyCode | Requerido | String | Body | Código de verificación del dispositivo       |
| importToArea.areaID | Opcional  | String | Body      | ID del área destino                                  |
| importToArea.enable | Opcional  | String | Body      | `1` = importar automáticamente                       |
| timeZone.id         | Requerido | String | Body      | ID de zona horaria                                   |
| vehicleInfo         | Opcional  | Object | Body      | Requerido si es dispositivo a bordo                  |

**Ejemplo de Solicitud:**

```json
{
  "deviceCategory": "encodingDevice",
  "deviceInfo": {
    "name": "Camera-Entrada",
    "ezvizSerialNo": "G81652987",
    "ezvizVerifyCode": "hcc12345"
  },
  "importToArea": { "areaID": "area_001", "enable": "1" },
  "timeZone": { "id": "26", "applyToDevice": "1" }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "deviceId": "device_abc123"
  },
  "errorCode": "0"
}
```

---

##### Actualizar dispositivo

`POST /api/hccgw/resource/v1/devices/update`

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo   | Ubicación | Descripción                                |
| ---------------- | --------- | ------ | --------- | ------------------------------------------ |
| Token            | Requerido | String | Header    | Máximo 64 caracteres                       |
| deviceInfo.id    | Requerido | String | Body      | ID del dispositivo                         |
| deviceInfo.name  | Opcional  | String | Body      | Nombre del dispositivo                     |
| deviceInfo.userName | Opcional | String | Body   | Usuario (p. ej. acceso al equipo)        |
| deviceInfo.password | Opcional | String | Body   | Contraseña del dispositivo               |
| timeZone.id      | Opcional  | String | Body      | ID de zona horaria                         |
| timeZone.applyToDevice | Opcional | String | Body | `1` = aplicar al dispositivo               |

**Ejemplo de Solicitud:**

```json
{
  "deviceInfo": {
    "id": "4606458718594636bb0487029f759684",
    "name": "NVR_test221",
    "userName": "admin",
    "password": "Abc12345"
  },
  "timeZone": {
    "id": "19",
    "applyToDevice": "1"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### Detalle del dispositivo

`POST /api/hccgw/resource/v1/devicedetail/get`

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo   | Ubicación | Descripción                 |
| --------------- | --------- | ------ | --------- | --------------------------- |
| Token           | Requerido | String | Header    | Máximo 64 caracteres        |
| deviceSerialNo  | Requerido | String | Body      | Número de serie del equipo  |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerialNo": "F74021782"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "device": {
      "baseInfo": {
        "id": "8a7483198eeab0b6018eee0f42c4011c",
        "name": "NVR",
        "category": "encodingDevice",
        "serialNo": "F74021782"
      }
    }
  },
  "errorCode": "0"
}
```

---

##### Eliminar Dispositivo

`POST /api/hccgw/resource/v1/devices/delete`

**Parámetros de Solicitud:**

| Parámetro      | Requerido | Tipo     | Ubicación | Descripción                              |
| -------------- | --------- | -------- | --------- | ---------------------------------------- |
| Token          | Requerido | String   | Header    | Máximo 64 caracteres                     |
| deviceID       | Requerido | String[] | Body      | Lista de IDs de dispositivo a eliminar   |
| deviceCategory | Requerido | String   | Body      | Categoría del dispositivo                |
| deleteVehicle  | Opcional  | Integer  | Body      | `1` = eliminar vehículo vinculado también |

**Ejemplo de Solicitud:**

```json
{
  "deviceID": ["device_001", "device_002"],
  "deviceCategory": "encodingDevice",
  "deleteVehicle": 0
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### Refrescar Estado del Dispositivo

`POST /api/hccgw/resource/v1/device/{deviceId}/refresh`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción              |
| --------- | --------- | ------ | --------- | ------------------------ |
| Token     | Requerido | String | Header    | Máximo 64 caracteres     |
| deviceId  | Requerido | String | URL       | ID del dispositivo       |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### Capturar Imagen de Cámara

`POST /api/hccgw/resource/v1/device/capturePic`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                  |
| --------- | --------- | ------ | --------- | ---------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres         |
| cameraId  | Requerido | String | Body      | ID de la cámara              |
| fileName  | Opcional  | String | Body      | Nombre del archivo de imagen |

**Ejemplo de Solicitud:**

```json
{
  "cameraId": "camera_001",
  "fileName": "capture_20240101"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "picUrl": "https://storage.example.com/captures/capture_20240101.jpg"
  },
  "errorCode": "0"
}
```

---

#### 5.2.2 Recursos Lógicos

##### Agregar área

`POST /api/hccgw/resource/v1/areas/add`

**Parámetros de Solicitud:**

| Parámetro      | Requerido | Tipo   | Ubicación | Descripción                                      |
| -------------- | --------- | ------ | --------- | ------------------------------------------------ |
| Token          | Requerido | String | Header    | Máximo 64 caracteres                             |
| parentAreaID   | Requerido | String | Body      | ID del área padre; use `-1` para raíz            |
| areaName       | Requerido | String | Body      | Nombre del área                                  |

**Ejemplo de Solicitud:**

```json
{
  "parentAreaID": "-1",
  "areaName": "Area de prueba"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "areaID": "c2e639b8ff704b03a9412b8e6a3c8fbe"
  },
  "errorCode": "0"
}
```

---

##### Obtener lista de áreas

`POST /api/hccgw/resource/v1/areas/get`

**Parámetros de Solicitud:**

| Parámetro                  | Requerido | Tipo    | Ubicación | Descripción                         |
| -------------------------- | --------- | ------- | --------- | ----------------------------------- |
| Token                      | Requerido | String  | Header    | Máximo 64 caracteres                |
| pageIndex                  | Requerido | Integer | Body      | Número de página                    |
| pageSize                   | Requerido | Integer | Body      | Registros por página                |
| filter.parentAreaID        | Opcional  | String  | Body      | Filtrar por área padre              |
| filter.includeSubArea      | Opcional  | Integer | Body      | Incluir subáreas (`1` = sí)         |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 10,
  "filter": {
    "parentAreaID": "-1",
    "includeSubArea": 1
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "totalCount": 2,
    "pageIndex": 1,
    "pageSize": 200,
    "area": [{ "id": "area_001", "name": "Planta Baja", "parentAreaID": "-1", "existSubArea": "1", "type": 1 }]
  },
  "errorCode": "0"
}
```

---

##### Detalle de Área

`POST /api/hccgw/resource/v1/areadetail/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |
| areaId    | Requerido | String | Body      | ID del área          |

**Ejemplo de Solicitud:**

```json
{
  "areaId": "area_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "areaInfo": {
      "id": "area_001",
      "name": "Planta Baja",
      "parentId": "root",
      "level": 1
    }
  },
  "errorCode": "0"
}
```

---

##### Agregar recursos a un área

`POST /api/hccgw/resource/v1/areas/resources/add`

Asocia canales de dispositivo (p. ej. entrada de alarma) a un área.

**Parámetros de Solicitud:**

| Parámetro                    | Requerido | Tipo   | Ubicación | Descripción                                  |
| ---------------------------- | --------- | ------ | --------- | -------------------------------------------- |
| Token                        | Requerido | String | Header    | Máximo 64 caracteres                         |
| areaID                       | Requerido | String | Body      | ID del área                                  |
| devChannel                   | Requerido | Array  | Body      | Lista de recursos a vincular                 |
| devChannel[].resourceName    | Requerido | String | Body      | Nombre del recurso                           |
| devChannel[].resourceType  | Requerido | String | Body      | Tipo de recurso (p. ej. `alarmInput`)        |
| devChannel[].channelID     | Requerido | String | Body      | ID del canal en el dispositivo               |

**Ejemplo de Solicitud:**

```json
{
  "areaID": "1d3797d6f5c84b4c9720f2d1453b3516",
  "devChannel": [
    {
      "resourceName": "D 201",
      "resourceType": "alarmInput",
      "channelID": "564138cd313d41dab82b41e73757edaa"
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### Cámaras de un Área

`POST /api/hccgw/resource/v1/areas/cameras/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–500) |
| filter.areaId | Requerido | String | Body     | ID del área (dentro de objeto `filter`) |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 200,
  "filter": {
    "areaId": "area_001"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 3,
    "camera": [
      {
        "cameraId": "cam_001",
        "cameraName": "Cámara Entrada",
        "deviceSerial": "FK4599010",
        "channelNo": 1,
        "status": 1
      }
    ]
  },
  "errorCode": "0"
}
```

---

##### Thumbnail de Cámara

`POST /api/hccgw/resource/v1/areas/cameras/thumbnail/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |
| cameraId  | Requerido | String | Body      | ID de la cámara      |

**Ejemplo de Solicitud:**

```json
{
  "cameraId": "cam_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pictureUrl": "https://storage.example.com/thumbnails/cam_001.jpg"
  },
  "errorCode": "0"
}
```

---

##### Entradas de Alarma de un Área

`POST /api/hccgw/resource/v1/areas/alarminputs/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| areaId    | Requerido | String  | Body      | ID del área                  |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–500) |

**Ejemplo de Solicitud:**

```json
{
  "areaId": "area_001",
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 2,
    "alarmInputList": [
      { "alarmInputId": "ai_001", "name": "Sensor Puerta", "status": 0 }
    ]
  },
  "errorCode": "0"
}
```

---

##### Salidas de Alarma de un Área

`POST /api/hccgw/resource/v1/areas/alarmoutputs/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| areaId    | Requerido | String  | Body      | ID del área                  |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–500) |

**Ejemplo de Solicitud:**

```json
{
  "areaId": "area_001",
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 1,
    "alarmOutputList": [
      { "alarmOutputId": "ao_001", "name": "Sirena", "status": 0 }
    ]
  },
  "errorCode": "0"
}
```

---

##### Controlar salida de alarma

`POST /api/hccgw/resource/v1/areas/alarmoutputs/control`

**Parámetros de Solicitud:**

| Parámetro                         | Requerido | Tipo    | Ubicación | Descripción                    |
| --------------------------------- | --------- | ------- | --------- | ------------------------------ |
| Token                             | Requerido | String  | Header    | Máximo 64 caracteres           |
| alarmOutputOperation              | Requerido | Array   | Body      | Operaciones sobre salidas      |
| alarmOutputOperation[].alarmOutputID | Requerido | String | Body   | ID de la salida de alarma      |
| alarmOutputOperation[].operation  | Requerido | Integer | Body      | Operación (p. ej. `1` = activar) |

**Ejemplo de Solicitud:**

```json
{
  "alarmOutputOperation": [
    {
      "alarmOutputID": "b58a0172ab504c9f98060456a3c7069f",
      "operation": 1
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "alarmOutputOperation": [
      {
        "alarmOutputID": "b58a0172ab504c9f98060456a3c7069f",
        "alarmOutputState": 1,
        "errorCode": "0"
      }
    ]
  },
  "errorCode": "0"
}
```

---

##### Estado de salidas de alarma

`POST /api/hccgw/resource/v1/areas/alarmoutputs/status/get`

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo     | Ubicación | Descripción                |
| --------------- | --------- | -------- | --------- | -------------------------- |
| Token           | Requerido | String   | Header    | Máximo 64 caracteres       |
| alarmOutputID   | Requerido | String[] | Body      | IDs de salidas de alarma   |

**Ejemplo de Solicitud:**

```json
{
  "alarmOutputID": ["b58a0172ab504c9f98060456a3c7069f"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "alarmOutput": [
      { "id": "b58a0172ab504c9f98060456a3c7069f", "status": 1 }
    ]
  },
  "errorCode": "0"
}
```

---

##### Puertas de un Área

`POST /api/hccgw/resource/v1/areas/doors/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| areaId    | Requerido | String  | Body      | ID del área                  |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–500) |

**Ejemplo de Solicitud:**

```json
{
  "areaId": "area_001",
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 2,
    "doorList": [
      { "doorId": "door_001", "name": "Puerta Principal", "deviceSerial": "FK001" }
    ]
  },
  "errorCode": "0"
}
```

---

##### Agregar Vehículo

`POST /api/hccgw/resource/v1/areas/vehicles/add`

**Parámetros de Solicitud:**

| Parámetro            | Requerido | Tipo   | Ubicación | Descripción                        |
| -------------------- | --------- | ------ | --------- | ---------------------------------- |
| Token                | Requerido | String | Header    | Máximo 64 caracteres               |
| vehicleInfo.plateNo  | Requerido | String | Body      | Número de placa del vehículo       |
| vehicleInfo.areaId   | Requerido | String | Body      | ID del área a la que pertenece     |
| vehicleInfo.brand    | Opcional  | String | Body      | Marca del vehículo                 |
| vehicleInfo.color    | Opcional  | String | Body      | Color del vehículo                 |

**Ejemplo de Solicitud:**

```json
{
  "vehicleInfo": {
    "plateNo": "ABC-1234",
    "areaId": "area_001",
    "brand": "Toyota",
    "color": "Blanco"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "vehicleId": "vehicle_001"
  },
  "errorCode": "0"
}
```

---

##### Actualizar Vehículo

`POST /api/hccgw/resource/v1/areas/vehicles/{id}/update`

**Parámetros de Solicitud:**

| Parámetro           | Requerido | Tipo   | Ubicación | Descripción                  |
| ------------------- | --------- | ------ | --------- | ---------------------------- |
| Token               | Requerido | String | Header    | Máximo 64 caracteres         |
| id                  | Requerido | String | URL       | ID del vehículo              |
| vehicleInfo.plateNo | Opcional  | String | Body      | Número de placa              |
| vehicleInfo.brand   | Opcional  | String | Body      | Marca del vehículo           |
| vehicleInfo.color   | Opcional  | String | Body      | Color del vehículo           |

**Ejemplo de Solicitud:**

```json
{
  "vehicleInfo": {
    "plateNo": "XYZ-5678",
    "brand": "Honda"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### Buscar Vehículos

`POST /api/hccgw/resource/v1/areas/vehicles/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–500) |
| areaId    | Opcional  | String  | Body      | Filtrar por área             |
| plateNo   | Opcional  | String  | Body      | Filtrar por placa            |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "plateNo": "ABC"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 1,
    "vehicleList": [
      { "vehicleId": "vehicle_001", "plateNo": "ABC-1234", "areaId": "area_001" }
    ]
  },
  "errorCode": "0"
}
```

---

##### Eliminar Recursos de Área

`POST /api/hccgw/resource/v1/areas/resources/delete`

**Parámetros de Solicitud:**

| Parámetro      | Requerido | Tipo     | Ubicación | Descripción                     |
| -------------- | --------- | -------- | --------- | ------------------------------- |
| Token          | Requerido | String   | Header    | Máximo 64 caracteres            |
| resourceIdList | Requerido | String[] | Body      | Lista de IDs de recursos a eliminar |

**Ejemplo de Solicitud:**

```json
{
  "resourceIdList": ["res_001", "res_002"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### URL para Subir Imagen

`POST /api/hccgw/resource/v1/picture/uploadparam/get`

**Parámetros de Solicitud:**

| Parámetro   | Requerido | Tipo   | Ubicación | Descripción                                              |
| ----------- | --------- | ------ | --------- | -------------------------------------------------------- |
| Token       | Requerido | String | Header    | Máximo 64 caracteres                                     |
| pictureType | Requerido | String | Body      | Tipo de imagen: `vehicle`, `person`, `driverFace`, etc.  |

**Ejemplo de Solicitud:**

```json
{
  "pictureType": "vehicle"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "uploadUrl": "https://storage.example.com/upload",
    "accessKey": "key_xxxx",
    "pictureId": "pic_001"
  },
  "errorCode": "0"
}
```

---

##### Lista de zonas horarias

`POST /api/hccgw/resource/v1/timezone/get`

Obtiene la lista de zonas horarias disponibles y el ID de zona horaria del sistema.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "timeZone": [
      {
        "id": "19",
        "standardName": "Central Asia Standard Time",
        "displayName": "(UTC+06:00) Astana",
        "bias": -360
      }
    ],
    "systemTimeZoneID": "30"
  },
  "errorCode": "0"
}
```

---

##### Estado ACC de Vehículo

`POST /api/hccgw/resource/v1/accstatus/search`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |
| vehicleId | Requerido | String | Body      | ID del vehículo      |

**Ejemplo de Solicitud:**

```json
{
  "vehicleId": "vehicle_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "vehicleId": "vehicle_001",
    "accStatus": 1,
    "lastUpdateTime": "2024-01-01T10:00:00+08:00"
  },
  "errorCode": "0"
}
```

---

##### Estado de entradas de alarma

`POST /api/hccgw/resource/v1/areas/alarminputs/status/get`

**Parámetros de Solicitud:**

| Parámetro      | Requerido | Tipo     | Ubicación | Descripción                          |
| -------------- | --------- | -------- | --------- | ------------------------------------ |
| Token          | Requerido | String   | Header    | Máximo 64 caracteres                 |
| alarmInputID   | Requerido | String[] | Body      | IDs de entradas de alarma a consultar |

**Ejemplo de Solicitud:**

```json
{
  "alarmInputID": [
    "2c0a4ab9a2504de4842d95435f3a8620",
    "b35b8e9a9326418ca2198ed45709b5bd"
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "alarmInput": [
      { "id": "0da41f0ac59c4debade796914f874148", "status": 2, "errorCode": "0" },
      { "id": "3d75a50c0ae84fc99c19581ef82d1b29", "status": 1, "errorCode": "0" }
    ]
  },
  "errorCode": "0"
}
```


---

### 5.3 Servicios Relacionados con Alarmas

#### 5.3.1 Suscribirse a Alarmas

`POST /api/hccgw/alarm/v1/mq/subscribe`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo      | Ubicación | Descripción                                      |
| ------------- | --------- | --------- | --------- | ------------------------------------------------ |
| Token         | Requerido | String    | Header    | Máximo 64 caracteres                             |
| subscribeType | Requerido | Integer   | Body      | `0` = cancelar suscripción, `1` = suscribir      |
| subscribeMode | Requerido | Integer   | Body      | `0` = todos los tipos, `1` = por tipo específico |
| eventType     | Opcional  | Integer[] | Body      | Tipos de eventos (cuando subscribeMode = 1)      |

**Ejemplo de Solicitud:**

```json
{
  "subscribeType": 1,
  "subscribeMode": 1,
  "eventType": [0, 1]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.3.2 Obtener Mensajes de Alarma

`POST /api/hccgw/alarm/v1/mq/messages`

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo    | Ubicación | Descripción                                       |
| ---------------- | --------- | ------- | --------- | ------------------------------------------------- |
| Token            | Requerido | String  | Header    | Máximo 64 caracteres                              |
| maxNumberPerTime | Opcional  | Integer | Body      | Mensajes por solicitud: 100, 200, 300, 400 o 500  |

**Ejemplo de Solicitud:**

```json
{
  "maxNumberPerTime": 100
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "batchId": "batch_abc123",
    "remainingNumber": 5,
    "alarmMsg": [
      {
        "alarmId": "alarm_001",
        "eventType": 1,
        "deviceSerial": "FK4599010",
        "cameraId": "cam_001",
        "alarmTime": "2024-01-01T10:00:00+08:00",
        "picUrl": "https://storage.example.com/alarm/pic.jpg"
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.3.3 Confirmar Alarmas Recibidas

`POST /api/hccgw/alarm/v1/mq/messages/complete`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                                     |
| --------- | --------- | ------ | --------- | ----------------------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                            |
| batchId   | Requerido | String | Body      | ID de lote devuelto por la llamada de mensajes  |

**Ejemplo de Solicitud:**

```json
{
  "batchId": "batch_abc123"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.3.4 Agregar Regla de Alarma

`POST /api/hccgw/alarm/v1/alarmrules/add`

**Parámetros de Solicitud:**

| Parámetro               | Requerido | Tipo     | Ubicación | Descripción                                  |
| ----------------------- | --------- | -------- | --------- | -------------------------------------------- |
| Token                   | Requerido | String   | Header    | Máximo 64 caracteres                         |
| alarmRuleInfo.name      | Requerido | String   | Body      | Nombre de la regla de alarma                 |
| alarmRuleInfo.resourceId | Requerido | String  | Body      | ID del recurso (cámara, entrada de alarma)   |
| alarmRuleInfo.eventType | Requerido | Integer  | Body      | Tipo de evento de alarma                     |
| alarmRuleInfo.enable    | Opcional  | Integer  | Body      | `1` = habilitado (predeterminado)            |

**Ejemplo de Solicitud:**

```json
{
  "alarmRuleInfo": {
    "name": "Detección Movimiento Entrada",
    "resourceId": "cam_001",
    "eventType": 1,
    "enable": 1
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "alarmRuleId": "rule_001"
  },
  "errorCode": "0"
}
```

---

#### 5.3.5 Actualizar Regla de Alarma

`POST /api/hccgw/alarm/v1/alarmrules/update`

**Parámetros de Solicitud:**

| Parámetro               | Requerido | Tipo    | Ubicación | Descripción                     |
| ----------------------- | --------- | ------- | --------- | ------------------------------- |
| Token                   | Requerido | String  | Header    | Máximo 64 caracteres            |
| alarmRuleInfo.id        | Requerido | String  | Body      | ID de la regla de alarma        |
| alarmRuleInfo.name      | Opcional  | String  | Body      | Nombre de la regla              |
| alarmRuleInfo.enable    | Opcional  | Integer | Body      | `1` = habilitar, `0` = deshabilitar |

**Ejemplo de Solicitud:**

```json
{
  "alarmRuleInfo": {
    "id": "rule_001",
    "name": "Detección Movimiento Actualizada",
    "enable": 0
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.3.6 Buscar Reglas de Alarma

`POST /api/hccgw/alarm/v1/alarmrules/search`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–100) |
| name      | Opcional  | String  | Body      | Filtrar por nombre de regla  |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "name": "Movimiento"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 1,
    "alarmRuleList": [
      {
        "id": "rule_001",
        "name": "Detección Movimiento Entrada",
        "resourceId": "cam_001",
        "eventType": 1,
        "enable": 1
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.3.7 Logs de Alarma

`POST /api/hccgw/alarm/v1/alarmlog`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                              |
| --------- | --------- | ------- | --------- | ---------------------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres                     |
| pageIndex | Requerido | Integer | Body      | Número de página                         |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–100)             |
| beginTime | Requerido | String  | Body      | Tiempo de inicio (ISO 8601)              |
| endTime   | Requerido | String  | Body      | Tiempo de fin (ISO 8601)                 |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "beginTime": "2024-01-01T00:00:00+08:00",
  "endTime": "2024-01-31T23:59:59+08:00"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 10,
    "alarmLogList": [
      {
        "alarmId": "alarm_001",
        "alarmName": "Detección Movimiento",
        "alarmTime": "2024-01-15T09:30:00+08:00",
        "deviceSerial": "FK4599010",
        "cameraId": "cam_001"
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.3.8 Umbral de Voltaje para Cámaras Solares

`POST /api/hccgw/alarm/v1/voltagesetting/set`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción                             |
| ------------- | --------- | ------- | --------- | --------------------------------------- |
| Token         | Requerido | String  | Header    | Máximo 64 caracteres                    |
| cameraId      | Requerido | String  | Body      | ID de la cámara solar                   |
| voltageValue  | Requerido | Integer | Body      | Umbral de voltaje mínimo (en milivoltios) |

**Ejemplo de Solicitud:**

```json
{
  "cameraId": "cam_solar_001",
  "voltageValue": 3600
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.3.9 Agregar Configuración de Linkage

`POST /api/hccgw/alarm/v1/alarmrules/alinklinkage/add`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo   | Ubicación | Descripción                          |
| ------------------ | --------- | ------ | --------- | ------------------------------------ |
| Token              | Requerido | String | Header    | Máximo 64 caracteres                 |
| alarmRuleId        | Requerido | String | Body      | ID de la regla de alarma             |
| alinkLinkageInfo   | Requerido | Object | Body      | Configuración de acción de linkage   |

**Ejemplo de Solicitud:**

```json
{
  "alarmRuleId": "rule_001",
  "alinkLinkageInfo": {
    "linkageType": 1,
    "targetDeviceId": "door_001"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "linkageId": "linkage_001"
  },
  "errorCode": "0"
}
```

---

#### 5.3.10 Actualizar Configuración de Linkage

`POST /api/hccgw/alarm/v1/alarmrules/alinklinkage/update`

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo   | Ubicación | Descripción                         |
| ---------------- | --------- | ------ | --------- | ----------------------------------- |
| Token            | Requerido | String | Header    | Máximo 64 caracteres                |
| alarmRuleId      | Requerido | String | Body      | ID de la regla de alarma            |
| alinkLinkageInfo | Requerido | Object | Body      | Nueva configuración de linkage      |

**Ejemplo de Solicitud:**

```json
{
  "alarmRuleId": "rule_001",
  "alinkLinkageInfo": {
    "linkageType": 2,
    "targetDeviceId": "door_002"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

### 5.4 Servicios Relacionados con Mensajes

#### 5.4.1 Suscribirse a Mensajes de Dispositivo (rawmsg)

`POST /api/hccgw/rawmsg/v1/mq/subscribe`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción                                 |
| ------------- | --------- | ------- | --------- | ------------------------------------------- |
| Token         | Requerido | String  | Header    | Máximo 64 caracteres                        |
| subscribeType | Requerido | Integer | Body      | `0` = cancelar suscripción, `1` = suscribir |

**Ejemplo de Solicitud:**

```json
{
  "subscribeType": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.4.2 Obtener Mensajes de Dispositivo

`POST /api/hccgw/rawmsg/v1/mq/messages`

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo    | Ubicación | Descripción                                      |
| ---------------- | --------- | ------- | --------- | ------------------------------------------------ |
| Token            | Requerido | String  | Header    | Máximo 64 caracteres                             |
| maxNumberPerTime | Opcional  | Integer | Body      | Mensajes por solicitud: 100, 200, 300, 400 o 500 |

**Ejemplo de Solicitud:**

```json
{
  "maxNumberPerTime": 100
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "batchId": "batch_rawmsg_001",
    "remainingNumber": 3,
    "messages": [
      {
        "msgId": "msg_001",
        "deviceSerial": "FK4599010",
        "msgType": "GPS",
        "msgContent": "lat=19.4326,lng=-99.1332",
        "msgTime": "2024-01-01T10:00:00+08:00"
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.4.3 Confirmar Mensajes de Dispositivo

`POST /api/hccgw/rawmsg/v1/mq/messages/complete`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                                      |
| --------- | --------- | ------ | --------- | ------------------------------------------------ |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                             |
| batchId   | Requerido | String | Body      | ID de lote devuelto por la llamada de mensajes   |

**Ejemplo de Solicitud:**

```json
{
  "batchId": "batch_rawmsg_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.4.4 Suscribirse a Mensajes Combinados (alarmas + dispositivo)

`POST /api/hccgw/combine/v1/mq/subscribe`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción                                 |
| ------------- | --------- | ------- | --------- | ------------------------------------------- |
| Token         | Requerido | String  | Header    | Máximo 64 caracteres                        |
| subscribeType | Requerido | Integer | Body      | `0` = cancelar suscripción, `1` = suscribir |

**Ejemplo de Solicitud:**

```json
{
  "subscribeType": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.4.5 Obtener Mensajes Combinados

`POST /api/hccgw/combine/v1/mq/messages`

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo    | Ubicación | Descripción                                      |
| ---------------- | --------- | ------- | --------- | ------------------------------------------------ |
| Token            | Requerido | String  | Header    | Máximo 64 caracteres                             |
| maxNumberPerTime | Opcional  | Integer | Body      | Mensajes por solicitud: 100, 200, 300, 400 o 500 |

**Ejemplo de Solicitud:**

```json
{
  "maxNumberPerTime": 200
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "batchId": "batch_combine_001",
    "remainingNumber": 0,
    "messages": [
      {
        "msgId": "msg_001",
        "msgType": "alarm",
        "deviceSerial": "FK4599010",
        "msgTime": "2024-01-01T10:00:00+08:00"
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.4.6 Confirmar Mensajes Combinados

`POST /api/hccgw/combine/v1/mq/messages/complete`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                                    |
| --------- | --------- | ------ | --------- | ---------------------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                           |
| batchId   | Requerido | String | Body      | ID de lote devuelto por la llamada de mensajes |

**Ejemplo de Solicitud:**

```json
{
  "batchId": "batch_combine_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

### 5.5 Servicios Relacionados con Video

#### 5.5.1 Calendarios de grabación

`POST /api/hccgw/video/v1/recordsettings/get`

Obtiene la configuración de grabación local y en nube asociada a una o más cámaras.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo     | Ubicación | Descripción           |
| --------- | --------- | -------- | --------- | --------------------- |
| Token     | Requerido | String   | Header    | Máximo 64 caracteres  |
| cameraId  | Requerido | String[] | Body      | IDs de cámara         |

**Ejemplo de Solicitud:**

```json
{
  "cameraId": ["2aeec98c14a4427f9ace6c48e91ab4cc"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "recordSetting": [
      {
        "cameraID": "2aeec98c14a4427f9ace6c48e91ab4cc",
        "enableLocalStorage": 1,
        "localStorage": {
          "scheduleTemplateId": "1",
          "recordingStreamType": 1,
          "postRecordTime": 10,
          "anr": 0,
          "storageTime": 0
        },
        "enableCloudStorage": 0,
        "cloudStorage": {}
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.5.2 URL de Vista en Vivo

`POST /api/hccgw/video/v1/live/address/get`

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo    | Ubicación | Descripción                              |
| ---------- | --------- | ------- | --------- | ---------------------------------------- |
| Token      | Requerido | String  | Header    | Máximo 64 caracteres                           |
| cameraId      | Requerido | String  | Body      | ID de la cámara (`id` del objeto cámara)            |
| resourceId    | Requerido | String  | Body      | Mismo valor que `cameraId`                          |
| deviceSerial  | Requerido | String  | Body      | Número de serie del dispositivo (`device.devInfo.serialNo`) |
| streamType    | Opcional  | Integer | Body      | `1` = principal, `2` = sub (predeterminado: 1)      |

**Ejemplo de Solicitud:**

```json
{
  "cameraId": "cam_001",
  "resourceId": "cam_001",
  "deviceSerial": "GG42XXXXXXX",
  "streamType": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "url": "https://stream.example.com/live/cam_001.m3u8",
    "expireTime": 1655719632454
  },
  "errorCode": "0"
}
```

---

#### 5.5.3 Buscar Segmentos de Grabación

`POST /api/hccgw/video/v1/record/element/search`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| cameraId  | Requerido | String  | Body      | ID de la cámara              |
| startTime | Requerido | String  | Body      | Tiempo de inicio (ISO 8601)  |
| endTime   | Requerido | String  | Body      | Tiempo de fin (ISO 8601)     |
| pageIndex | Opcional  | Integer | Body      | Número de página             |
| pageSize  | Opcional  | Integer | Body      | Registros por página         |

**Ejemplo de Solicitud:**

```json
{
  "cameraId": "cam_001",
  "startTime": "2024-01-01T00:00:00+08:00",
  "endTime": "2024-01-01T23:59:59+08:00",
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 5,
    "recordList": [
      {
        "recordId": "rec_001",
        "startTime": "2024-01-01T09:00:00+08:00",
        "endTime": "2024-01-01T09:30:00+08:00",
        "size": 102400
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.5.4 Activar Grabación MP4

`POST /api/hccgw/video/v1/video/save`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                  |
| --------- | --------- | ------ | --------- | ---------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres         |
| cameraId  | Requerido | String | Body      | ID de la cámara              |
| startTime | Requerido | String | Body      | Tiempo de inicio (ISO 8601)  |
| endTime   | Requerido | String | Body      | Tiempo de fin (ISO 8601)     |

**Ejemplo de Solicitud:**

```json
{
  "cameraId": "cam_001",
  "startTime": "2024-01-01T09:00:00+08:00",
  "endTime": "2024-01-01T09:05:00+08:00"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "videoId": "video_task_001"
  },
  "errorCode": "0"
}
```

---

#### 5.5.5 URL de Descarga de Grabación

`POST /api/hccgw/video/v1/video/download/url`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                              |
| --------- | --------- | ------ | --------- | ---------------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                     |
| videoId   | Requerido | String | Body      | ID de la tarea de grabación              |

**Ejemplo de Solicitud:**

```json
{
  "videoId": "video_task_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "status": 2,
    "downloadUrl": "https://storage.example.com/video/video_task_001.mp4",
    "expireTime": 1655719632454
  },
  "errorCode": "0"
}
```

---

#### 5.5.6 Despertar Cámara Solar

`POST /api/hccgw/video/v1/video/device/wakeup`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo   | Ubicación | Descripción                     |
| ------------ | --------- | ------ | --------- | ------------------------------- |
| Token        | Requerido | String | Header    | Máximo 64 caracteres            |
| deviceSerial | Requerido | String | Body      | Número de serie del dispositivo |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "FK4599010"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.5.7 ISAPI Proxy de Video

`POST /api/hccgw/video/v1/isapi/proxypass`

**Parámetros de Solicitud:**

| Parámetro   | Requerido | Tipo   | Ubicación | Descripción                           |
| ----------- | --------- | ------ | --------- | ------------------------------------- |
| Token       | Requerido | String | Header    | Máximo 64 caracteres                  |
| url         | Requerido | String | Body      | URL ISAPI relativa                    |
| requestType | Requerido | String | Body      | `GET` o `PUT`                         |
| requestData | Opcional  | String | Body      | Datos XML de la solicitud ISAPI       |

**Ejemplo de Solicitud:**

```json
{
  "url": "/ISAPI/System/time",
  "requestType": "GET"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "responseData": "<?xml version=\"1.0\"?><Time><localTime>2024-01-01T10:00:00</localTime></Time>"
  },
  "errorCode": "0"
}
```


---

### 5.6 Servicios de Videoportero

#### 5.6.1 Buscar Edificios

`POST /api/hccgw/vims/v1/build/search`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–100) |
| name      | Opcional  | String  | Body      | Filtrar por nombre           |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 2,
    "buildingList": [
      { "buildingId": "bld_001", "name": "Torre A", "areaId": "area_001" }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.6.2 Buscar Habitaciones

`POST /api/hccgw/vims/v1/room/search`

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo    | Ubicación | Descripción                  |
| ---------- | --------- | ------- | --------- | ---------------------------- |
| Token      | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex  | Requerido | Integer | Body      | Número de página             |
| pageSize   | Requerido | Integer | Body      | Registros por página (1–100) |
| buildingId | Opcional  | String  | Body      | Filtrar por edificio         |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "buildingId": "bld_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 5,
    "roomList": [
      { "roomId": "room_101", "roomName": "101", "buildingId": "bld_001", "floor": 1 }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.6.3 Buscar Residentes

`POST /api/hccgw/vims/v1/person/search`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–100) |
| roomId    | Opcional  | String  | Body      | Filtrar por habitación       |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "roomId": "room_101"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 2,
    "personList": [
      { "personId": "res_001", "personName": "Juan García", "phone": "+521234567890", "roomId": "room_101" }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.6.4 Agregar Residente

`POST /api/hccgw/vims/v1/person/add`

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo   | Ubicación | Descripción                            |
| ---------- | --------- | ------ | --------- | -------------------------------------- |
| Token      | Requerido | String | Header    | Máximo 64 caracteres                   |
| personName | Requerido | String | Body      | Nombre del residente                   |
| roomId     | Requerido | String | Body      | ID de la habitación                    |
| phone      | Opcional  | String | Body      | Número de teléfono                     |
| certNo     | Opcional  | String | Body      | Número de documento de identidad       |
| certType   | Opcional  | Integer | Body     | Tipo de documento (`1` = ID, `2` = pasaporte) |

**Ejemplo de Solicitud:**

```json
{
  "personName": "María López",
  "roomId": "room_101",
  "phone": "+521234567890",
  "certNo": "XAXX010101000",
  "certType": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "personId": "res_002"
  },
  "errorCode": "0"
}
```

---

#### 5.6.5 Actualizar Residente

`POST /api/hccgw/vims/v1/person/update`

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo   | Ubicación | Descripción              |
| ---------- | --------- | ------ | --------- | ------------------------ |
| Token      | Requerido | String | Header    | Máximo 64 caracteres     |
| personId   | Requerido | String | Body      | ID del residente         |
| personName | Opcional  | String | Body      | Nombre del residente     |
| phone      | Opcional  | String | Body      | Número de teléfono       |

**Ejemplo de Solicitud:**

```json
{
  "personId": "res_002",
  "personName": "María López Actualizada",
  "phone": "+529876543210"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.6.6 Eliminar Residente

`POST /api/hccgw/vims/v1/person/delete`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |
| personId  | Requerido | String | Body      | ID del residente     |

**Ejemplo de Solicitud:**

```json
{
  "personId": "res_002"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.6.7 Obtener Pase Temporal

`POST /api/hccgw/vims/v1/tempauth/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción           |
| --------- | --------- | ------ | --------- | --------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres  |
| personId  | Requerido | String | Body      | ID del residente      |

**Ejemplo de Solicitud:**

```json
{
  "personId": "res_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "authCode": "AUTH20240101001",
    "qrCodeUrl": "https://qr.example.com/AUTH20240101001.png",
    "expireTime": "2024-01-02T23:59:59+08:00"
  },
  "errorCode": "0"
}
```

---

#### 5.6.8 Listar pases temporales

`POST /api/hccgw/vims/v1/tempauth/list`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–100) |
| personId  | Opcional  | String  | Body      | Filtrar por residente        |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 1,
    "tempAuthList": [
      { "authId": "auth_001", "personId": "res_001", "beginTime": "2024-01-01T00:00:00+08:00", "endTime": "2024-01-07T23:59:59+08:00" }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.6.9 Agregar Pase Temporal

`POST /api/hccgw/vims/v1/tempauth/add`

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo    | Ubicación | Descripción                            |
| ---------- | --------- | ------- | --------- | -------------------------------------- |
| Token      | Requerido | String  | Header    | Máximo 64 caracteres                   |
| personId   | Requerido | String  | Body      | ID del residente                       |
| beginTime  | Requerido | String  | Body      | Inicio de validez (ISO 8601)           |
| endTime    | Requerido | String  | Body      | Fin de validez (ISO 8601)              |
| entryMode  | Opcional  | Integer | Body      | Modo de entrada (`1` = QR, `2` = PIN)  |

**Ejemplo de Solicitud:**

```json
{
  "personId": "res_001",
  "beginTime": "2024-01-01T00:00:00+08:00",
  "endTime": "2024-01-07T23:59:59+08:00",
  "entryMode": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "authId": "auth_002"
  },
  "errorCode": "0"
}
```

---

#### 5.6.10 Actualizar Pase Temporal

`POST /api/hccgw/vims/v1/tempauth/update`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                  |
| --------- | --------- | ------ | --------- | ---------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres         |
| authId    | Requerido | String | Body      | ID del pase temporal         |
| beginTime | Opcional  | String | Body      | Nuevo inicio de validez      |
| endTime   | Opcional  | String | Body      | Nuevo fin de validez         |

**Ejemplo de Solicitud:**

```json
{
  "authId": "auth_002",
  "endTime": "2024-01-14T23:59:59+08:00"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.6.11 Responder Llamada de Videoportero

`POST /api/hccgw/devcall/v1/call/receive`

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo    | Ubicación | Descripción                              |
| ---------- | --------- | ------- | --------- | ---------------------------------------- |
| Token      | Requerido | String  | Header    | Máximo 64 caracteres                     |
| callId     | Requerido | String  | Body      | ID de la llamada entrante                |
| actionType | Requerido | Integer | Body      | `1` = contestar, `2` = rechazar, `3` = abrir puerta |

**Ejemplo de Solicitud:**

```json
{
  "callId": "call_abc123",
  "actionType": 3
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

### 5.7 Servicios de Control de Acceso

#### 5.7.1 Control Remoto de Puerta

`POST /api/hccgw/acs/v1/remote/control`

**Parámetros de Solicitud:**

| Parámetro   | Requerido | Tipo    | Ubicación | Descripción                              |
| ----------- | --------- | ------- | --------- | ---------------------------------------- |
| Token       | Requerido | String  | Header    | Máximo 64 caracteres                     |
| doorId      | Requerido | String  | Body      | ID de la puerta                          |
| controlType | Requerido | Integer | Body      | `1` = abrir, `2` = cerrar, `3` = mantener abierto |

**Ejemplo de Solicitud:**

```json
{
  "doorId": "door_001",
  "controlType": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.7.2 Información de Cifrado Bluetooth

`GET /api/hccgw/acs/v1/encryptinfo/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "encryptKey": "abc123def456",
    "encryptType": "AES128"
  },
  "errorCode": "0"
}
```

---

#### 5.7.3 Registros de Acceso

`POST /api/hccgw/acs/v1/event/certificaterecords/search`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–100) |
| startTime | Requerido | String  | Body      | Tiempo de inicio (ISO 8601)  |
| endTime   | Requerido | String  | Body      | Tiempo de fin (ISO 8601)     |
| doorId    | Opcional  | String  | Body      | Filtrar por puerta           |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "startTime": "2024-01-01T00:00:00+08:00",
  "endTime": "2024-01-31T23:59:59+08:00"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 50,
    "recordList": [
      {
        "recordId": "rec_001",
        "personId": "person_001",
        "personName": "Juan García",
        "doorId": "door_001",
        "accessTime": "2024-01-15T08:30:00+08:00",
        "cardNo": "1234567890"
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.7.4 Lista de Niveles de Acceso

`POST /api/hccgw/acspm/v1/accesslevel/list`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–100) |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 3,
    "accessLevelList": [
      { "accessLevelId": "level_001", "name": "Empleados", "doorCount": 5 }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.7.5 Detalle de Nivel de Acceso por Persona

`POST /api/hccgw/acspm/v1/maintain/overview/person/{id}/elementdetail`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |
| id        | Requerido | String | URL       | ID de la persona     |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "personId": "person_001",
    "accessLevelList": [
      { "accessLevelId": "level_001", "name": "Empleados", "applyStatus": 2 }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.7.6 Asignar Nivel de Acceso a Persona

`POST /api/hccgw/acspm/v1/accesslevel/person/add`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción               |
| ------------- | --------- | ------ | --------- | ------------------------- |
| Token         | Requerido | String | Header    | Máximo 64 caracteres      |
| personId      | Requerido | String | Body      | ID de la persona          |
| accessLevelId | Requerido | String | Body      | ID del nivel de acceso    |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_001",
  "accessLevelId": "level_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.7.7 Quitar Nivel de Acceso de Persona

`POST /api/hccgw/acspm/v1/accesslevel/person/delete`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción            |
| ------------- | --------- | ------ | --------- | ---------------------- |
| Token         | Requerido | String | Header    | Máximo 64 caracteres   |
| personId      | Requerido | String | Body      | ID de la persona       |
| accessLevelId | Requerido | String | Body      | ID del nivel de acceso |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_001",
  "accessLevelId": "level_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.7.8 Modificar Nivel de Acceso de Persona

`POST /api/hccgw/acspm/v1/accesslevel/person/modify`

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo   | Ubicación | Descripción                    |
| ---------------- | --------- | ------ | --------- | ------------------------------ |
| Token            | Requerido | String | Header    | Máximo 64 caracteres           |
| personId         | Requerido | String | Body      | ID de la persona               |
| oldAccessLevelId | Requerido | String | Body      | ID del nivel de acceso actual  |
| newAccessLevelId | Requerido | String | Body      | ID del nuevo nivel de acceso   |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_001",
  "oldAccessLevelId": "level_001",
  "newAccessLevelId": "level_002"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```


---

### 5.8 Servicios Relacionados con Personas

#### 5.8.1 Buscar Grupos/Departamentos

`POST /api/hccgw/person/v1/groups/search`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Número de página             |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–100) |
| name      | Opcional  | String  | Body      | Filtrar por nombre           |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 3,
    "groupList": [
      { "groupId": "group_001", "groupName": "Empleados", "parentGroupId": "root", "personCount": 15 }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.8.2 Agregar Grupo

`POST /api/hccgw/person/v1/groups/add`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción                |
| ------------- | --------- | ------ | --------- | -------------------------- |
| Token         | Requerido | String | Header    | Máximo 64 caracteres       |
| groupName     | Requerido | String | Body      | Nombre del grupo           |
| parentGroupId | Opcional  | String | Body      | ID del grupo padre         |

**Ejemplo de Solicitud:**

```json
{
  "groupName": "Seguridad",
  "parentGroupId": "root"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "groupId": "group_004"
  },
  "errorCode": "0"
}
```

---

#### 5.8.3 Actualizar Grupo

`POST /api/hccgw/person/v1/groups/update`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |
| groupId   | Requerido | String | Body      | ID del grupo         |
| groupName | Requerido | String | Body      | Nuevo nombre         |

**Ejemplo de Solicitud:**

```json
{
  "groupId": "group_004",
  "groupName": "Seguridad y Vigilancia"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.8.4 Eliminar Grupo

`POST /api/hccgw/person/v1/groups/delete`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |
| groupId   | Requerido | String | Body      | ID del grupo         |

**Ejemplo de Solicitud:**

```json
{
  "groupId": "group_004"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.8.5 Agregar Persona

`POST /api/hccgw/person/v1/persons/add`

**Parámetros de Solicitud:**

| Parámetro               | Requerido | Tipo   | Ubicación | Descripción                         |
| ----------------------- | --------- | ------ | --------- | ----------------------------------- |
| Token                   | Requerido | String | Header    | Máximo 64 caracteres                |
| personInfo.firstName    | Requerido | String | Body      | Primer nombre (máximo 64 caracteres) |
| personInfo.lastName     | Requerido | String | Body      | Apellido (máximo 64 caracteres)     |
| personInfo.gender       | Opcional  | Integer | Body     | `1` = masculino, `2` = femenino     |
| personInfo.personCode   | Opcional  | String | Body      | Número de empleado                  |
| personInfo.groupId      | Requerido | String | Body      | ID del grupo/departamento           |
| personInfo.phone        | Opcional  | String | Body      | Teléfono                            |
| personInfo.email        | Opcional  | String | Body      | Correo electrónico                  |

**Ejemplo de Solicitud:**

```json
{
  "personInfo": {
    "firstName": "Carlos",
    "lastName": "Ramírez",
    "gender": 1,
    "personCode": "EMP001",
    "groupId": "group_001",
    "phone": "+521234567890"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "personId": "person_100"
  },
  "errorCode": "0"
}
```

---

#### 5.8.6 Actualizar Persona

`POST /api/hccgw/person/v1/persons/update`

**Parámetros de Solicitud:**

| Parámetro             | Requerido | Tipo   | Ubicación | Descripción                   |
| --------------------- | --------- | ------ | --------- | ----------------------------- |
| Token                 | Requerido | String | Header    | Máximo 64 caracteres          |
| personInfo.personId   | Requerido | String | Body      | ID de la persona              |
| personInfo.firstName  | Opcional  | String | Body      | Primer nombre                 |
| personInfo.lastName   | Opcional  | String | Body      | Apellido                      |
| personInfo.phone      | Opcional  | String | Body      | Teléfono                      |

**Ejemplo de Solicitud:**

```json
{
  "personInfo": {
    "personId": "person_100",
    "phone": "+529876543210"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.8.7 Actualizar Foto de Persona

`POST /api/hccgw/person/v1/persons/photo`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                        |
| --------- | --------- | ------ | --------- | ---------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres               |
| personId  | Requerido | String | Body      | ID de la persona                   |
| faceData  | Requerido | String | Body      | Imagen en base64 (JPG, máx. 200KB) |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "faceData": "/9j/4AAQSkZJRgABAQAA..."
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.8.8 Recolectar Huella desde Dispositivo

`POST /api/hccgw/person/v1/persons/fingercollect`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                           |
| --------- | --------- | ------ | --------- | ------------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                  |
| personId  | Requerido | String | Body      | ID de la persona                      |
| deviceId  | Requerido | String | Body      | ID del dispositivo para la recolección |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "deviceId": "device_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "taskId": "task_finger_001"
  },
  "errorCode": "0"
}
```

---

#### 5.8.9 Actualizar Huellas de Persona

`POST /api/hccgw/person/v1/persons/updatefingers`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo     | Ubicación | Descripción                       |
| ------------------ | --------- | -------- | --------- | --------------------------------- |
| Token              | Requerido | String   | Header    | Máximo 64 caracteres              |
| personId           | Requerido | String   | Body      | ID de la persona                  |
| fingerInfo         | Requerido | Object[] | Body      | Lista de huellas dactilares       |
| fingerInfo.fingerNo | Requerido | Integer | Body      | Número de dedo (0–9)             |
| fingerInfo.fingerData | Requerido | String | Body     | Datos de huella en base64         |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "fingerInfo": [
    { "fingerNo": 0, "fingerData": "base64encodeddata..." }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.8.10 Recolectar Tarjeta desde Dispositivo

`POST /api/hccgw/person/v1/persons/cardcollect`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                           |
| --------- | --------- | ------ | --------- | ------------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                  |
| personId  | Requerido | String | Body      | ID de la persona                      |
| deviceId  | Requerido | String | Body      | ID del dispositivo para la recolección |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "deviceId": "device_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "taskId": "task_card_001"
  },
  "errorCode": "0"
}
```

---

#### 5.8.11 Actualizar Tarjetas de Persona

`POST /api/hccgw/person/v1/persons/updatecards`

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo     | Ubicación | Descripción                   |
| ---------------- | --------- | -------- | --------- | ----------------------------- |
| Token            | Requerido | String   | Header    | Máximo 64 caracteres          |
| personId         | Requerido | String   | Body      | ID de la persona              |
| cardInfo         | Requerido | Object[] | Body      | Lista de tarjetas             |
| cardInfo.cardNo  | Requerido | String   | Body      | Número de tarjeta             |
| cardInfo.cardType | Opcional | Integer  | Body      | Tipo de tarjeta               |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "cardInfo": [
    { "cardNo": "1234567890", "cardType": 1 }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.8.12 Actualizar PIN de Persona

`POST /api/hccgw/person/v1/persons/updatepinecode`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                   |
| --------- | --------- | ------ | --------- | ----------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres          |
| personId  | Requerido | String | Body      | ID de la persona              |
| pinCode   | Requerido | String | Body      | Nuevo código PIN (4–8 dígitos) |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "pinCode": "1234"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.8.13 Obtener Información de Persona

`POST /api/hccgw/person/v1/persons/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |
| personId  | Requerido | String | Body      | ID de la persona     |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "personInfo": {
      "personId": "person_100",
      "firstName": "Carlos",
      "lastName": "Ramírez",
      "gender": 1,
      "personCode": "EMP001",
      "groupId": "group_001",
      "phone": "+529876543210"
    }
  },
  "errorCode": "0"
}
```

---

#### 5.8.14 Eliminar Persona

`POST /api/hccgw/person/v1/persons/delete`

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo     | Ubicación | Descripción                    |
| ---------- | --------- | -------- | --------- | ------------------------------ |
| Token      | Requerido | String   | Header    | Máximo 64 caracteres           |
| personIds  | Requerido | String[] | Body      | Lista de IDs de personas       |

**Ejemplo de Solicitud:**

```json
{
  "personIds": ["person_100", "person_101"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.8.15 Agregar Persona Rápido (con credenciales)

`POST /api/hccgw/person/v1/persons/quick/add`

**Parámetros de Solicitud:**

| Parámetro               | Requerido | Tipo   | Ubicación | Descripción                        |
| ----------------------- | --------- | ------ | --------- | ---------------------------------- |
| Token                   | Requerido | String | Header    | Máximo 64 caracteres               |
| personInfo.firstName    | Requerido | String | Body      | Primer nombre                      |
| personInfo.lastName     | Requerido | String | Body      | Apellido                           |
| personInfo.groupId      | Requerido | String | Body      | ID del grupo/departamento          |
| personInfo.faceData     | Opcional  | String | Body      | Foto en base64                     |
| personInfo.pinCode      | Opcional  | String | Body      | Código PIN                         |
| personInfo.cardInfo     | Opcional  | Object[] | Body    | Lista de tarjetas                  |

**Ejemplo de Solicitud:**

```json
{
  "personInfo": {
    "firstName": "Ana",
    "lastName": "Torres",
    "groupId": "group_001",
    "faceData": "/9j/4AAQSkZJRgABAQAA...",
    "pinCode": "5678",
    "cardInfo": [{ "cardNo": "9876543210" }]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "personId": "person_102"
  },
  "errorCode": "0"
}
```

---

#### 5.8.16 Listar Personas

`POST /api/hccgw/person/v1/persons/list`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo    | Ubicación | Descripción                  |
| ------------ | --------- | ------- | --------- | ---------------------------- |
| Token        | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex    | Requerido | Integer | Body      | Número de página             |
| pageSize     | Requerido | Integer | Body      | Registros por página (1–100) |
| groupId      | Opcional  | String  | Body      | Filtrar por grupo            |
| personName   | Opcional  | String  | Body      | Filtrar por nombre           |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "groupId": "group_001"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "total": 15,
    "personList": [
      { "personId": "person_100", "firstName": "Carlos", "lastName": "Ramírez", "groupId": "group_001" }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.8.17 QR de Persona

`POST /api/hccgw/person/v1/persons/qrcode`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |
| personId  | Requerido | String | Body      | ID de la persona     |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "qrCodeUrl": "https://qr.example.com/person_100.png"
  },
  "errorCode": "0"
}
```


---

### 5.9 Servicios de Monitoreo a Bordo

#### 5.9.1 Buscar Conductores

`POST /api/hccgw/vehicle/v1/driver/batchquery`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo     | Ubicación | Descripción              |
| ------------- | --------- | -------- | --------- | ------------------------ |
| Token         | Requerido | String   | Header    | Máximo 64 caracteres     |
| driverIdList  | Requerido | String[] | Body      | Lista de IDs de conductores |

**Ejemplo de Solicitud:**

```json
{
  "driverIdList": ["driver_001", "driver_002"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": [
    {
      "driverId": "driver_001",
      "firstName": "Pedro",
      "lastName": "González",
      "driverCode": "DRV001",
      "phone": "+521234567890",
      "groupId": "driverGroup_001"
    }
  ],
  "errorCode": "0"
}
```

---

#### 5.9.2 Agregar Conductor

`POST /api/hccgw/vehicle/v1/driver/add`

**Parámetros de Solicitud:**

| Parámetro                        | Requerido | Tipo     | Ubicación | Descripción                      |
| -------------------------------- | --------- | -------- | --------- | -------------------------------- |
| Token                            | Requerido | String   | Header    | Máximo 64 caracteres             |
| firstName                        | Requerido | String   | Body      | Primer nombre                    |
| lastName                         | Requerido | String   | Body      | Apellido                         |
| driverCode                       | Opcional  | String   | Body      | Código de conductor              |
| gender                           | Opcional  | Integer  | Body      | `1` = masculino, `2` = femenino  |
| groupId                          | Opcional  | String   | Body      | ID del grupo de conductores      |
| phone                            | Opcional  | String   | Body      | Teléfono                         |
| email                            | Opcional  | String   | Body      | Correo electrónico               |
| relateVehicleIds                 | Opcional  | String[] | Body      | IDs de vehículos vinculados      |
| driverLicenseInfo.licenseNo      | Opcional  | String   | Body      | Número de licencia               |
| driverLicenseInfo.validTime      | Opcional  | String   | Body      | Fecha de vencimiento de licencia |
| photoData                        | Opcional  | String   | Body      | Foto en base64                   |

**Ejemplo de Solicitud:**

```json
{
  "firstName": "Pedro",
  "lastName": "González",
  "driverCode": "DRV001",
  "gender": 1,
  "groupId": "driverGroup_001",
  "phone": "+521234567890",
  "relateVehicleIds": ["vehicle_001"],
  "driverLicenseInfo": {
    "licenseNo": "LIC123456",
    "validTime": "2026-12-31"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "driverId": "driver_001"
  },
  "errorCode": "0"
}
```

---

#### 5.9.3 Actualizar Conductor

`POST /api/hccgw/vehicle/v1/driver/update`

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo   | Ubicación | Descripción                           |
| ---------- | --------- | ------ | --------- | ------------------------------------- |
| Token      | Requerido | String | Header    | Máximo 64 caracteres                  |
| driverId   | Requerido | String | Body      | ID del conductor                      |
| firstName  | Opcional  | String | Body      | Primer nombre                         |
| lastName   | Opcional  | String | Body      | Apellido                              |
| phone      | Opcional  | String | Body      | Teléfono                              |

**Ejemplo de Solicitud:**

```json
{
  "driverId": "driver_001",
  "phone": "+529876543210"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.9.4 Eliminar Conductores en Lote

`POST /api/hccgw/vehicle/v1/driver/batchdel`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo     | Ubicación | Descripción                   |
| ------------ | --------- | -------- | --------- | ----------------------------- |
| Token        | Requerido | String   | Header    | Máximo 64 caracteres          |
| driverIdList | Requerido | String[] | Body      | Lista de IDs de conductores   |

**Ejemplo de Solicitud:**

```json
{
  "driverIdList": ["driver_001", "driver_002"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.9.5 Buscar Grupos de Conductores

`POST /api/hccgw/vehicle/v1/driverGroup/batchquery`

**Parámetros de Solicitud:**

| Parámetro         | Requerido | Tipo     | Ubicación | Descripción                        |
| ----------------- | --------- | -------- | --------- | ---------------------------------- |
| Token             | Requerido | String   | Header    | Máximo 64 caracteres               |
| driverGroupIdList | Requerido | String[] | Body      | Lista de IDs de grupos de conductores |

**Ejemplo de Solicitud:**

```json
{
  "driverGroupIdList": ["driverGroup_001"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": [
    {
      "groupId": "driverGroup_001",
      "groupName": "Conductores Zona Norte",
      "areaId": "area_001",
      "areaName": "Zona Norte",
      "peopleCount": 5
    }
  ],
  "errorCode": "0"
}
```

---

#### 5.9.6 Agregar Grupo de Conductores

`POST /api/hccgw/vehicle/v1/driverGroup/add`

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo   | Ubicación | Descripción                    |
| --------------- | --------- | ------ | --------- | ------------------------------ |
| Token           | Requerido | String | Header    | Máximo 64 caracteres           |
| driverGroupName | Requerido | String | Body      | Nombre del grupo (único)       |
| relatedAreaId   | Requerido | String | Body      | ID del área vinculada          |

**Ejemplo de Solicitud:**

```json
{
  "driverGroupName": "Conductores Zona Sur",
  "relatedAreaId": "area_002"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "id": "driverGroup_002"
  },
  "errorCode": "0"
}
```

---

#### 5.9.7 Actualizar Grupo de Conductores

`POST /api/hccgw/vehicle/v1/driverGroup/update`

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo   | Ubicación | Descripción                  |
| --------------- | --------- | ------ | --------- | ---------------------------- |
| Token           | Requerido | String | Header    | Máximo 64 caracteres         |
| id              | Requerido | String | Body      | ID del grupo de conductores  |
| driverGroupName | Requerido | String | Body      | Nuevo nombre del grupo       |
| relatedAreaId   | Requerido | String | Body      | ID del área vinculada        |

**Ejemplo de Solicitud:**

```json
{
  "id": "driverGroup_002",
  "driverGroupName": "Conductores Zona Sur Actualizado",
  "relatedAreaId": "area_002"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.9.8 Eliminar Grupos de Conductores

`POST /api/hccgw/vehicle/v1/driverGroup/batchdel`

**Parámetros de Solicitud:**

| Parámetro         | Requerido | Tipo     | Ubicación | Descripción                           |
| ----------------- | --------- | -------- | --------- | ------------------------------------- |
| Token             | Requerido | String   | Header    | Máximo 64 caracteres                  |
| driverGroupIdList | Requerido | String[] | Body      | Lista de IDs de grupos de conductores |

**Ejemplo de Solicitud:**

```json
{
  "driverGroupIdList": ["driverGroup_002"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.9.9 Aplicar Foto de Conductor a Dispositivo

`POST /api/hccgw/vehicle/v1/driverFace/distribution`

Proceso asíncrono. Si devuelve `GUID`, úselo con `driverFace/status/query` para conocer el resultado.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo     | Ubicación | Descripción                |
| --------- | --------- | -------- | --------- | -------------------------- |
| Token     | Requerido | String   | Header    | Máximo 64 caracteres       |
| driverIds | Requerido | String[] | Body      | Lista de IDs de conductores |

**Ejemplo de Solicitud:**

```json
{
  "driverIds": ["driver_001", "driver_002"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "guid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  "errorCode": "0"
}
```

---

#### 5.9.10 Estado de Distribución de Fotos de Conductor

`POST /api/hccgw/vehicle/v1/driverFace/status/query`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                      |
| --------- | --------- | ------ | --------- | -------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres             |
| guid      | Requerido | String | Body      | GUID de la tarea de distribución |

**Ejemplo de Solicitud:**

```json
{
  "guid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "totalCount": 2,
    "successCount": 2,
    "distributionFailedStatus": []
  },
  "errorCode": "0"
}
```

---

### 5.10 Servicios de Asistencia

#### 5.10.1 Reporte de Total Time Card

`POST /api/hccgw/attendance/v1/report/totaltimecard/list`

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo     | Ubicación | Descripción                                             |
| --------------- | --------- | -------- | --------- | ------------------------------------------------------- |
| Token           | Requerido | String   | Header    | Máximo 64 caracteres                                    |
| pageIndex       | Opcional  | Integer  | Body      | Número de página                                        |
| pageSize        | Opcional  | Integer  | Body      | Registros por página (1–200, predeterminado: 20)        |
| beginTime       | Requerido | String   | Body      | Inicio del período (ISO 8601, ej. `2024-01-01T00:00:00+08:00`) |
| endTime         | Requerido | String   | Body      | Fin del período (ISO 8601)                              |
| personName      | Opcional  | String   | Body      | Filtrar por nombre (búsqueda difusa)                    |
| personCode      | Opcional  | String   | Body      | Filtrar por número de empleado                          |
| personGroupIds  | Opcional  | String[] | Body      | Filtrar por grupos/departamentos                        |
| dateFormat      | Opcional  | String   | Body      | Formato de fecha (predeterminado: `yyyy/MM/dd`)         |
| timeFormat      | Opcional  | String   | Body      | Formato de hora (predeterminado: `HH:mm`)               |
| durationFormat  | Opcional  | String   | Body      | Formato de duración (predeterminado: `HH:MM`)           |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "beginTime": "2024-01-01T00:00:00+08:00",
  "endTime": "2024-01-31T23:59:59+08:00",
  "personName": "Carlos",
  "personGroupIds": [],
  "dateFormat": "yyyy/MM/dd",
  "timeFormat": "HH:mm",
  "durationFormat": "HH:MM"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "data": {
    "pageIndex": 1,
    "pageSize": 20,
    "moreData": 0,
    "reportDataList": [
      {
        "firstName": "Carlos",
        "lastName": "Ramírez",
        "fullName": "Carlos Ramírez",
        "personCode": "EMP001",
        "fullPath": "Empresa/Empleados",
        "date": "2024/01/15",
        "weekday": 1,
        "timetableName": "Turno Regular",
        "checkInDate": "2024/01/15",
        "checkInTime": "09:00",
        "checkOutDate": "2024/01/15",
        "checkOutTime": "18:00",
        "attendanceStatus": 1,
        "workDuration": "09:00",
        "absenceDuration": "00:00",
        "lateDuration": "00:00",
        "earlyDuration": "00:00",
        "overtimeDuration": "00:00"
      }
    ]
  }
}
```

---

### 5.11 Servicios de Mantenimiento

#### 5.11.1 Recursos Offline en Período

`POST /api/hccgw/maintain/v1/offline/info/list`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                                                        |
| --------- | --------- | ------- | --------- | ------------------------------------------------------------------ |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres                                               |
| areaId    | Opcional  | String  | Body      | ID del área (raíz cuando está vacío)                               |
| startTime | Requerido | Long    | Body      | Tiempo de inicio (UTC en milisegundos)                             |
| endTime   | Requerido | Long    | Body      | Tiempo de fin (UTC en milisegundos)                                |
| orderBy   | Opcional  | Integer | Body      | Ordenar: `0` = por ID (predeterminado), `1` = veces offline, `2` = duración offline |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–100)                                       |
| page      | Requerido | Integer | Body      | Número de página (inicia en 1)                                     |
| queryType | Requerido | Integer | Body      | `0` = recursos físicos, `1` = recursos lógicos                     |

**Ejemplo de Solicitud:**

```json
{
  "areaId": "area_001",
  "startTime": 1739796526000,
  "endTime": 1739882926000,
  "orderBy": 1,
  "pageSize": 50,
  "page": 1,
  "queryType": 0
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "page": 1,
    "pageSize": 50,
    "total": 100,
    "rows": [
      {
        "id": "fjewiafew453215423j54kk325",
        "name": "Camera-01",
        "deviceSerial": "FK4599010",
        "areaId": "adeb59a933ea400e885e1c71384f2efd",
        "areaName": "Zona Norte",
        "resourceType": 1002,
        "offlineCount": 1,
        "offlineDuration": 17459610
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.11.2 Detalle de Estado de Mantenimiento

`POST /api/hccgw/maintenance/v1/list/device/detail`

**Parámetros de Solicitud:**

| Parámetro      | Requerido | Tipo      | Ubicación | Descripción                                                                       |
| -------------- | --------- | --------- | --------- | --------------------------------------------------------------------------------- |
| Token          | Requerido | String    | Header    | Máximo 64 caracteres                                                              |
| page           | Requerido | Number    | Body      | Número de página (predeterminado: 1)                                              |
| pageSize       | Opcional  | Number    | Body      | Registros por página (predeterminado: 10)                                         |
| areaId         | Opcional  | String    | Body      | ID del área (predeterminado: -1 sin dispositivos)                                 |
| includeSubArea | Opcional  | String    | Body      | `0` = no incluir subáreas, `1` = incluir                                          |
| exceptions     | Opcional  | Number[]  | Body      | Filtrar por excepción: `0` = todas, `1` = offline, `2` = disco, `3` = grabación   |
| filterName     | Opcional  | String    | Body      | Buscar por nombre, serie, versión o área                                          |
| deviceCategory | Requerido | Number    | Body      | Tipo de dispositivo: `2001` = dispositivo de codificación                         |

**Ejemplo de Solicitud:**

```json
{
  "page": 1,
  "pageSize": 10,
  "areaId": "001",
  "includeSubArea": "1",
  "exceptions": [1, 2],
  "filterName": "Camera",
  "deviceCategory": 2001
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "page": 1,
    "pageSize": 10,
    "totalNum": 100,
    "totalPage": 10,
    "hasNext": true,
    "devices": [
      {
        "id": "device_001",
        "name": "Camera-01",
        "deviceSerial": "FK4599010",
        "areaId": "area_001",
        "areaName": "Zona Norte",
        "resourceType": 2001,
        "offlineCount": 0,
        "offlineDuration": 0
      }
    ]
  },
  "errorCode": "0"
}
```

---

### 5.12 Relacionados con BI

#### 5.12.1 Buscar Registros ANPR (Placas)

`POST /api/hccgw/bi/v1/anpr/passing/record/search`

Frecuencia de consulta recomendada: 3 a 5 segundos.

**Parámetros de Solicitud:**

| Parámetro      | Requerido | Tipo      | Ubicación | Descripción                                         |
| -------------- | --------- | --------- | --------- | --------------------------------------------------- |
| Token          | Requerido | String    | Header    | Máximo 64 caracteres                                |
| allCamera      | Requerido | Boolean   | Body      | `true` = todas las cámaras                          |
| cameraIdList   | Opcional  | String[]  | Body      | IDs de cámaras (si `allCamera` = false)             |
| timeType       | Requerido | Integer   | Body      | `0` = hora del cliente, `1` = hora del dispositivo  |
| startTime      | Requerido | String    | Body      | Inicio (ISO 8601, ej. `2024-08-21T00:00:00+08:00`)  |
| endTime        | Requerido | String    | Body      | Fin (ISO 8601)                                      |
| licensePlate   | Opcional  | String    | Body      | Filtrar por número de placa (máx. 512 caracteres)   |
| personName     | Opcional  | String    | Body      | Filtrar por nombre del propietario                  |
| vehileModel    | Opcional  | Integer[] | Body      | Tipo de vehículo (1=bus, 3=sedan, 11=suv, etc.)     |
| brand          | Opcional  | Integer[] | Body      | Marca del vehículo                                  |
| color          | Opcional  | Integer   | Body      | Color (1=blanco, 2=plata, 5=negro, 7=azul, etc.)    |
| speedRangeStart | Opcional | Integer   | Body      | Velocidad mínima (km/h, rango: 0–1000)              |
| speedRangeEnd  | Opcional  | Integer   | Body      | Velocidad máxima (km/h, rango: 0–1000)              |
| direction      | Opcional  | Integer   | Body      | Dirección: `-1`=desconocido, `0`=inverso, `1`=avance |
| pageSize       | Opcional  | Integer   | Body      | Registros por página (predeterminado: 20)            |
| searchAfter    | Opcional  | Object[]  | Body      | Paginación: usar `nextSearchAfter` de la respuesta   |

**Ejemplo de Solicitud:**

```json
{
  "allCamera": false,
  "cameraIdList": ["cam_001"],
  "timeType": 0,
  "startTime": "2024-08-21T00:00:00+08:00",
  "endTime": "2024-10-21T00:00:00+08:00",
  "licensePlate": "ABC-123",
  "pageSize": 20,
  "searchAfter": [{}]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "rows": [
      {
        "id": "id_ebd543dee041",
        "areaId": "areaId_f426aee6795b",
        "areaName": "Zona de Acceso",
        "brand": 0,
        "cameraId": "cameraId_b9f4057e503d",
        "cameraName": "Cámara Entrada",
        "carColor": 1,
        "carUrl": "https://storage.example.com/car.jpg",
        "licensePlateUrl": "https://storage.example.com/plate.jpg",
        "dateTime": "2024-08-21T09:30:00+08:00",
        "licensePlate": "ABC-1234",
        "personName": "Juan García",
        "speed": 30,
        "vehileModel": 3,
        "direction": 1
      }
    ],
    "total": 1,
    "totalPage": 1,
    "page": 1,
    "pageSize": 20,
    "nextSearchAfter": [{}]
  },
  "errorCode": "0"
}
```

---

#### 5.12.2 Control de Barrera Vehicular

`POST /api/hccgw/bi/v1/anpr/barrierGate/control`

**Parámetros de Solicitud:**

| Parámetro   | Requerido | Tipo    | Ubicación | Descripción                                                                   |
| ----------- | --------- | ------- | --------- | ----------------------------------------------------------------------------- |
| Token       | Requerido | String  | Header    | Máximo 64 caracteres                                                          |
| cameraId    | Requerido | String  | Body      | ID de la cámara ANPR                                                          |
| controlMode | Requerido | Integer | Body      | `1`=abrir, `2`=cerrar, `3`=mantener abierto, `4`=deshabilitar mantener abierto |

**Ejemplo de Solicitud:**

```json
{
  "cameraId": "cam_anpr_001",
  "controlMode": 1
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.12.3 Flujo de Personas en Tienda

`POST /api/hccgw/bi/v1/store/report/peopleflow`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo          | Ubicación | Descripción                                                   |
| ------------- | --------- | ------------- | --------- | ------------------------------------------------------------- |
| Token         | Requerido | String        | Header    | Máximo 64 caracteres                                          |
| startTime     | Requerido | String        | Body      | Tiempo de inicio (formato: `yyyy-MM-dd HH:mm:ss`)             |
| endTime       | Requerido | String        | Body      | Tiempo de fin (formato: `yyyy-MM-dd HH:mm:ss`)                |
| storeAreaIds  | Requerido | List<String>  | Body      | Lista de IDs de áreas de tienda (máximo 16)                   |
| statisticType | Requerido | Integer       | Body      | `1` = por hora, `2` = por día                                 |
| resourceType  | Requerido | Integer       | Body      | `0` = cámara, `1` = entrada/salida, `2` = tienda              |
| timeType      | Requerido | Integer       | Body      | `0` = tiempo de almacenamiento, `1` = tiempo de carga al dispositivo |

**Ejemplo de Solicitud:**

```json
{
  "startTime": "2024-01-01 00:00:00",
  "endTime": "2024-01-01 23:59:59",
  "storeAreaIds": ["storeArea_001"],
  "statisticType": 1,
  "resourceType": 0,
  "timeType": 0
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "data": {
    "statisticType": "1",
    "storeDatas": [
      {
        "cameraId": "cam_001",
        "storeAreaId": "storeArea_001",
        "countingDatas": [
          {
            "startTime": "2024-01-01 09:00:00",
            "endTime": "2024-01-01 10:00:00",
            "enterCount": 25,
            "exitCount": 20,
            "passCount": 5,
            "updateTime": "2024-01-01 10:01:00"
          }
        ]
      }
    ]
  }
}
```

---

### 5.13 Relacionados con Webhook

#### 5.13.1 Consultar Configuración de Webhook

`POST /api/hccgw/webhook/v1/config/query`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo   | Ubicación | Descripción                               |
| ------------ | --------- | ------ | --------- | ----------------------------------------- |
| Content-Type | Requerido | String | Header    | `application/json`                        |
| Token        | Requerido | String | Header    | Máximo 64 caracteres                      |

*No requiere cuerpo de solicitud.*

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "callbackUrl": "https://mi-servidor.com/webhook",
    "retryTimes": 3,
    "retryDelay": 1000
  },
  "errorCode": "0"
}
```

---

#### 5.13.2 Guardar Configuración de Webhook

`POST /api/hccgw/webhook/v1/config/save`

> Nota: Solo se permite una configuración de Webhook por cuenta. La URL de callback debe soportar HTTPS.

**Parámetros de Solicitud:**

| Parámetro   | Requerido | Tipo    | Ubicación | Descripción                                                              |
| ----------- | --------- | ------- | --------- | ------------------------------------------------------------------------ |
| Content-Type | Requerido | String | Header    | `application/json`                                                       |
| Token       | Requerido | String  | Header    | Máximo 64 caracteres                                                     |
| callbackUrl | Requerido | String  | Body      | URL HTTPS de callback (máximo 256 caracteres, debe soportar GET y POST)  |
| retryTimes  | Opcional  | Integer | Body      | Intentos de reenvío (rango: -1 a 5, predeterminado: 3; -1 = ilimitado por 2 horas) |
| retryDelay  | Opcional  | Long    | Body      | Intervalo entre reintentos (milisegundos)                                |
| signSecret  | Opcional  | String  | Body      | Clave secreta para firma (8–32 caracteres, alfanumérico; usa SK si está vacío) |

**Ejemplo de Solicitud:**

```json
{
  "callbackUrl": "https://mi-servidor.com/webhook",
  "retryTimes": 3,
  "retryDelay": 1000,
  "signSecret": "MiClaveSecreta01"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.13.3 Eliminar Configuración de Webhook

`POST /api/hccgw/webhook/v1/config/delete`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo   | Ubicación | Descripción        |
| ------------ | --------- | ------ | --------- | ------------------ |
| Content-Type | Requerido | String | Header    | `application/json` |
| Token        | Requerido | String | Header    | Máximo 64 caracteres |

*No requiere cuerpo de solicitud.*

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

### 5.14 Relacionados con Nivel de Acceso

#### 5.14.1 Lista de Plantillas de Horario

`POST /api/hccgw/acspm/v1/template/list`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo    | Ubicación | Descripción                              |
| ------------ | --------- | ------- | --------- | ---------------------------------------- |
| Token        | Requerido | String  | Header    | Máximo 64 caracteres                     |
| Content-Type | Requerido | String  | Header    | `application/json`                       |
| X-TenantId   | Requerido | String  | Header    | ID del tenant (máximo 64 caracteres)     |
| X-UserId     | Requerido | String  | Header    | ID del usuario (máximo 64 caracteres)    |
| pageIndex    | Opcional  | Integer | Body      | Número de página (predeterminado: 1)     |
| pageSize     | Opcional  | Integer | Body      | Registros por página (devuelve todos si está vacío) |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "Ok",
  "data": {
    "templateResponse": {
      "pageIndex": 1,
      "pageSize": 20,
      "totalNum": 2,
      "templateList": [
        {
          "id": "645993118512059392",
          "name": "schedule01",
          "remark": "",
          "weekSchedule": {
            "timeSettingList": [
              { "dayIndex": 1, "timeSpanList": [{ "beginTime": "03:00:00", "endTime": "18:30:00" }] },
              { "dayIndex": 0, "timeSpanList": [{ "beginTime": "09:30:00", "endTime": "12:00:00" }] }
            ]
          },
          "holidayScheduleList": [
            { "id": "132", "name": "Holiday01", "timeSpanList": [{ "beginTime": "05:00:00", "endTime": "20:00:00" }] }
          ]
        }
      ]
    }
  }
}
```

---

#### 5.14.2 Agregar Nivel de Acceso

`POST /api/hccgw/acspm/v1/access/level/add`

**Parámetros de Solicitud:**

| Parámetro                       | Requerido | Tipo     | Ubicación | Descripción                                    |
| ------------------------------- | --------- | -------- | --------- | ---------------------------------------------- |
| Token                           | Requerido | String   | Header    | Máximo 64 caracteres                           |
| Content-Type                    | Requerido | String   | Header    | `application/json`                             |
| accessLevel.name                | Requerido | String   | Body      | Nombre del nivel (máximo 64 caracteres)        |
| accessLevel.remark              | Opcional  | String   | Body      | Observación (máximo 128 caracteres)            |
| accessLevel.timeSchedule.id     | Requerido | String   | Body      | ID de la plantilla de horario                  |
| accessLevel.associateResList    | Requerido | Object[] | Body      | Lista de recursos vinculados                   |
| accessLevel.associateResList.id | Requerido | String   | Body      | ID del recurso (puerta) a vincular             |

**Ejemplo de Solicitud:**

```json
{
  "accessLevel": {
    "name": "Acceso Empleados",
    "remark": "Nivel para empleados regulares",
    "timeSchedule": { "id": "645993118512059392" },
    "associateResList": [
      { "id": "res_001" },
      { "id": "res_002" }
    ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "accessLevel": {
      "id": "access_level_001",
      "name": "Acceso Empleados",
      "remark": "Nivel para empleados regulares",
      "areaInfo": { "id": "area_001", "name": "Empresa" },
      "timeSchedule": { "id": "645993118512059392", "name": "schedule01" },
      "associateResList": [
        { "id": "res_001", "name": "Puerta Principal", "type": 1 },
        { "id": "res_002", "name": "Puerta Trasera", "type": 1 }
      ]
    }
  },
  "errorCode": "0"
}
```

---

#### 5.14.3 Editar Nivel de Acceso

`POST /api/hccgw/acspm/v1/access/level/update`

> Nota: Incluir siempre el mensaje completo. Si el nivel tiene 10 recursos y solo se edita el nombre, incluir también los 10 recursos. Enviar lista vacía eliminará el nivel.

**Parámetros de Solicitud:**

| Parámetro                       | Requerido | Tipo     | Ubicación | Descripción                             |
| ------------------------------- | --------- | -------- | --------- | --------------------------------------- |
| Token                           | Requerido | String   | Header    | Máximo 64 caracteres                    |
| Content-Type                    | Requerido | String   | Header    | `application/json`                      |
| accessLevel.id                  | Requerido | String   | Body      | ID del nivel de acceso                  |
| accessLevel.name                | Opcional  | String   | Body      | Nuevo nombre (máximo 64 caracteres)     |
| accessLevel.remark              | Opcional  | String   | Body      | Nueva observación                       |
| accessLevel.timeSchedule.id     | Requerido | String   | Body      | ID de la plantilla de horario           |
| accessLevel.associateResList    | Requerido | Object[] | Body      | Lista completa de recursos vinculados   |
| accessLevel.associateResList.id | Requerido | String   | Body      | ID del recurso                          |

**Ejemplo de Solicitud:**

```json
{
  "accessLevel": {
    "id": "64316317089415848",
    "name": "Acceso Empleados Actualizado",
    "remark": "",
    "timeSchedule": { "id": "1" },
    "associateResList": [
      { "id": "58077d70228446ddb23e143d202254c5" }
    ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "OK"
}
```

---

#### 5.14.4 Eliminar Nivel de Acceso por ID

`POST /api/hccgw/acspm/v1/access/level/{id}/delete`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo   | Ubicación | Descripción                      |
| ------------ | --------- | ------ | --------- | -------------------------------- |
| Token        | Requerido | String | Header    | Máximo 64 caracteres             |
| Content-Type | Requerido | String | Header    | `application/json`               |
| id           | Requerido | String | URL       | ID del nivel de acceso (no vacío) |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "Ok"
}
```

---

#### 5.14.5 Agregar Recursos a Nivel de Acceso

`POST /api/hccgw/acspm/v1/access/level/{id}/res/add`

**Parámetros de Solicitud:**

| Parámetro              | Requerido | Tipo     | Ubicación | Descripción                      |
| ---------------------- | --------- | -------- | --------- | -------------------------------- |
| Token                  | Requerido | String   | Header    | Máximo 64 caracteres             |
| Content-Type           | Requerido | String   | Header    | `application/json`               |
| id                     | Requerido | String   | URL       | ID del nivel de acceso           |
| associateResList       | Requerido | Object[] | Body      | Lista de recursos a agregar      |
| associateResList[].id  | Requerido | String   | Body      | ID del recurso a vincular        |

**Ejemplo de Solicitud:**

```json
{
  "associateResList": [
    { "id": "res_001" },
    { "id": "res_002" }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "data": {
    "resFailedList": []
  }
}
```

*(Si algún recurso falla: `resFailedList` contendrá `{id, name, errorCode}`)*

---

#### 5.14.6 Eliminar Recursos de Nivel de Acceso

`POST /api/hccgw/acspm/v1/access/level/{id}/res/delete`

> Nota: Si se eliminan todos los recursos, el nivel de acceso se elimina automáticamente. Enviar lista vacía no tiene efecto.

**Parámetros de Solicitud:**

| Parámetro              | Requerido | Tipo     | Ubicación | Descripción                         |
| ---------------------- | --------- | -------- | --------- | ----------------------------------- |
| Token                  | Requerido | String   | Header    | Máximo 64 caracteres                |
| Content-Type           | Requerido | String   | Header    | `application/json`                  |
| id                     | Requerido | String   | URL       | ID del nivel de acceso              |
| associateResList       | Requerido | Object[] | Body      | Lista de recursos a eliminar        |
| associateResList[].id  | Requerido | String   | Body      | ID del recurso vinculado a eliminar |

**Ejemplo de Solicitud:**

```json
{
  "associateResList": [
    { "id": "res_001" },
    { "id": "res_002" }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "data": {
    "resFailedList": [
      { "id": "res_001", "name": "Puerta Principal", "errorCode": "LAP000100" }
    ]
  }
}
```

---

#### 5.14.7 Eliminar Niveles de Acceso en Lote

`POST /api/hccgw/acspm/v1/access/level/delete`

> Nota: IDs inexistentes no afectan el resultado. Si `accessLevelIdList` está vacío, se eliminan todos los niveles.

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo     | Ubicación | Descripción                                              |
| ------------------ | --------- | -------- | --------- | -------------------------------------------------------- |
| Token              | Requerido | String   | Header    | Máximo 64 caracteres                                     |
| Content-Type       | Requerido | String   | Header    | `application/json`                                       |
| accessLevelIdList  | Requerido | String[] | Body      | Lista de IDs de niveles a eliminar (vacío = eliminar todos) |

**Ejemplo de Solicitud:**

```json
{
  "accessLevelIdList": ["access_level_001", "access_level_002"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "data": {
    "accessLevelFailedList": []
  }
}
```


---

## Apéndice A — Apéndices

El contenido completo (A.1–A.4: diccionario de datos, formatos de fecha/hora, descripción de objetos y códigos de error) está en [APENDICE-A.md](APENDICE-A.md).

---

