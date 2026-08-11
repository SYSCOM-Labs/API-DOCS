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
| [Hikauto — Fleet Playground](./demos/Hikauto/README.md) | Monitoreo a bordo: flota, conductores, ACC, telemetría GPS (MQ), mapa Leaflet y video EZUIKit |
| [Tiempo y asistencia](./demos/Tiempo%20y%20asistencia%20con%20Hikconnect%20teams%20openapi/README.md) | Personas, credenciales, niveles de acceso, puertas, marcajes, time card y eventos MQ (OpenAPI V2.15.0) |

---

## Skill para agentes

| Skill | Descripción |
| ----- | ----------- |
| [Hik-Connect Team Skill](../HikConnect-Team-Skill/README.md) | Envuelve esta OpenAPI para que un agente automatice gestión de recursos, control de acceso, capturas, streaming de video y alarmas. Incluye guía de instalación, configuración de credenciales y requisitos. |

---

## Contexto para agentes de IA

Además de este README, la plataforma incluye dos archivos pensados para que un modelo de lenguaje consuma la API sin inventar endpoints. Siguen la convención [llms.txt](https://llmstxt.org/) y se dividen en enrutador y referencia:

| Archivo | Tamaño | Para qué sirve |
| ------- | ------ | -------------- |
| [llms.txt](./llms.txt) | ~16 KB | **Enrutador de capacidades.** Reglas críticas, mapeo de regiones, flujo de autenticación, 13 áreas de capacidad y reglas de decisión del tipo "si el usuario pide X → lee la sección Y". Es el archivo que debe leerse primero. |
| [llms-full.txt](./llms-full.txt) | ~346 KB | **Referencia completa.** Los 115 endpoints con sus parámetros y ejemplos de solicitud **y respuesta**, las guías de integración de video (JSDecoder SDK para web, Mobile SDK HPNetSDK para Android/iOS, HLS/RTMP) y los apéndices A.1–A.4 (diccionario de datos, formatos, objetos y códigos de error). |

> **Notas:**
> - Ambos archivos derivan del mismo PDF oficial que este README (*Hik-Connect for Teams OpenAPI Developer Guide* V2.15.0, 2026-03-06), así que las tres fuentes describen la misma versión de la API.
> - Están traducidos al español, igual que el resto del repositorio. Los identificadores técnicos —rutas de endpoint, nombres de campo JSON, valores de enumeración y códigos de error— se conservan sin traducir porque son los literales que espera la API.
> - `llms.txt` referencia a `llms-full.txt` por nombre de archivo, sin ruta. Si mueves uno, mueve el otro a la misma carpeta.
> - Si actualizas la versión de la API, actualiza los tres archivos a la vez para que no se desincronicen.

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

- **Inicio de sesión:** autorización de inicio de sesión y obtención de token
- **Operaciones:**
  - Obtención de información de la plataforma
  - Obtención de información de uso del paquete de servicios
  - Obtención del token de streaming
  - Obtención de la lista de usuarios

#### 1.2.2 Capacidades de Alarma

Servicios relacionados con la gestión de alarmas:

- **Suscripción a Eventos:**
  - Suscripción a alarmas
  - Obtención de información de alarma
  - Confirmación de recepción de alarmas
- **Reglas de Alarma:**
  - Obtención de regla de alarma
  - Configuración de regla de alarma
  - Edición de regla de alarma
  - Obtención de lista de prioridades de alarma
  - Obtención de plantilla de horario de armado
  - Configuración de la acción de vinculación de alarma

> **Notas:**
>
> - Después de llamar a `POST /api/hccgw/alarm/v1/mq/messages` y confirmar la recepción mediante `POST /api/hccgw/alarm/v1/mq/messages/complete`, no podrá recuperar el mismo mensaje nuevamente.
> - Los mensajes se almacenan durante **3 días** de forma predeterminada.
> - Intervalo de sondeo recomendado: cada **500 ms**.

#### 1.2.3 Capacidades de Recursos

Servicios relacionados con la información de dispositivos:

- **Recursos físicos** (dispositivos de codificación, videoportero, control de acceso, dispositivos a bordo):
  - Agregar dispositivo
  - Editar información de dispositivo
  - Obtener detalles de dispositivo
  - Obtener lista de dispositivos
  - Eliminar dispositivo
- **Recursos lógicos:**
  - Información de áreas (obtener área, obtener detalles de área, agregar área)
  - Elementos: agregar recurso al área, obtener cámara, controlar salida de alarma, obtener recurso de salida de alarma, obtener estado de salida de alarma, obtener miniatura de cámara, agregar/editar/buscar vehículo vinculado a dispositivo a bordo, obtener información de puerta
  - Obtener lista de zonas horarias

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
- Confirmación de recepción de mensajes (acknowledge)

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

- **Edificios/Habitaciones:** buscar edificio, buscar habitación
- **Residentes:** buscar residente, agregar residente, editar información de residente, eliminar residente
- **Pase Temporal:** obtener pase temporal, buscar pase temporal, agregar pase temporal, actualizar pase temporal, editar pase temporal
- **Llamadas:** obtener registro de llamada, responder a llamada

#### 1.2.8 Capacidades de Control de Acceso

Servicios que incluyen:

- Apertura remota de puertas
- Obtención de información de cifrado Bluetooth del sistema
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
4. Reproducir el video según el cliente: en web, usar el kit de herramientas JSSDK (JSDecoder) de Hik-Connect; en apps móviles Android/iOS, usar el **Mobile SDK (HPNetSDK)** — ver [§5.5.2](#552-obtener-dirección-de-vista-en-vivo--reproducción).

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
  - Actualizar PIN: `POST /api/hccgw/person/v1/persons/updatepincode`
  - Actualizar huella dactilar/tarjeta: consulte [4.12 Actualizar Información de Huella Dactilar/Tarjeta](#412-actualizar-información-de-huella-dactilartarjeta)
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

> Las alarmas son el contenido cargado por el dispositivo cuando se activan las reglas de alarma configuradas.

#### 5.3.1 Suscribirse a Alarmas

`POST /api/hccgw/alarm/v1/mq/subscribe`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo      | Ubicación | Descripción                                                  |
| ------------- | --------- | --------- | --------- | ------------------------------------------------------------ |
| Token         | Requerido | String    | Header    | Máximo 64 caracteres                                         |
| subscribeType | Requerido | Integer   | Body      | `0` = cancelar suscripción, `1` = suscribir                  |
| subscribeMode | Requerido | Integer   | Body      | `0` = suscribir a todos los tipos, `1` = suscribir por tipo  |
| eventType     | Opcional  | Integer[] | Body      | Tipos de eventos de alarma. Ver [Apéndice A.1.4 Tipo de Alarma](APENDICE-A.md#a14-tipo-de-alarma) |

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

| Parámetro        | Requerido | Tipo    | Ubicación | Descripción                                                                  |
| ---------------- | --------- | ------- | --------- | ---------------------------------------------------------------------------- |
| Token            | Requerido | String  | Header    | Máximo 64 caracteres                                                         |
| maxNumberPerTime | Opcional  | Integer | Body      | Volumen de información por solicitud: `100`, `200`, `300` (predeterminado), `400`, `500` |

**Ejemplo de Solicitud:**

```json
{
  "maxNumberPerTime": 100
}
```

**Parámetros de Respuesta:**

| Parámetro        | Requerido | Tipo      | Descripción                                                                                              |
| ---------------- | --------- | --------- | -------------------------------------------------------------------------------------------------------- |
| errorCode        | Requerido | String    | Código de estado o error (0 = éxito)                                                                     |
| data             | Requerido | Object    | Contiene `batchId`, `remainingNumber`, `alarmMsg[]`                                                      |
| data.batchId     | Requerido | String    | ID del lote de procesamiento de información                                                              |
| data.remainingNumber | Requerido | Long  | Total de alarmas restantes                                                                               |
| data.alarmMsg    | —         | Object[]  | Información del evento. Ver objeto [AlarmMsg](APENDICE-A.md#a320-alarmmsg) en el apéndice                |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "batchId": "0730b5d3664040f33fe8bfd4eb6b886b88f10040e489a0d54c00e41546a6a9b2946cbcd91f0a6eca6ec6cddf4511a78f",
    "remainingNumber": 13445,
    "alarmMsg": [
      {
        "systemId": "f718f3013b5a4fb38e573043afe28683",
        "guid": "18892bc026ddddd",
        "msgType": "1",
        "alarmState": "1",
        "alarmMainCategory": "alarmCategoryVideo",
        "alarmSubCategory": "alarmSubCategoryCamera",
        "timeInfo": {
          "startTime": "2023-04-13T08:56:40Z",
          "endTime": "2023-04-13T08:56:55Z"
        },
        "eventSource": {
          "eventType": "100657",
          "sourceID": "780e25f5f72b4592a2e5c2deae38726f",
          "sourceName": "IPCamera 01",
          "sourceType": "camera"
        }
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.3.3 Confirmar Alarmas Recibidas

`POST /api/hccgw/alarm/v1/mq/messages/complete`

Confirma que las alarmas se recibieron especificando el `batchId`.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                                              |
| --------- | --------- | ------ | --------- | -------------------------------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                                     |
| batchId   | Requerido | String | Body      | ID de lote devuelto al obtener la lista de eventos (máx 256) |

**Ejemplo de Solicitud:**

```json
{
  "batchId": "5a32fddc6f5c01e067f7abdfe5348a6c98f64d1fe196b9d54c45b01b50a3a7b5946dbcd91f0a6eca6ec6cddf4511a78f"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.3.4 Configurar Regla de Alarma

`POST /api/hccgw/alarm/v1/alarmrules/add`

**Parámetros de Solicitud:**

| Parámetro                  | Requerido | Tipo        | Ubicación | Descripción                                                                          |
| -------------------------- | --------- | ----------- | --------- | ------------------------------------------------------------------------------------ |
| Token                      | Requerido | String      | Header    | Máximo 64 caracteres                                                                 |
| alarmRule                  | Requerido | Object[]    | Body      | Información de la(s) regla(s) de alarma                                              |
| alarmRule[].name           | Requerido | String      | Body      | Nombre de la regla (máx 255)                                                         |
| alarmRule[].alarmMainCategory | Opcional | String   | Body      | Categoría principal (máx 64). Ver [Apéndice A.1.1](APENDICE-A.md#a11-categoría-de-alarma) |
| alarmRule[].alarmSubCategory | Opcional | String    | Body      | Subcategoría (máx 64)                                                                |
| alarmRule[].description    | Opcional  | String      | Body      | Descripción (máx 128)                                                                |
| alarmRule[].color          | Opcional  | String      | Body      | Color de la regla (máx 64, p. ej. `#fff0000`)                                        |
| alarmRule[].notification   | Opcional  | Notification | Body     | Configuración de notificación                                                        |
| alarmRule[].schedule       | Opcional  | Schedule    | Body      | Plantilla de armado                                                                  |
| alarmRule[].priority       | Opcional  | Priority    | Body      | Prioridad de alarma                                                                  |
| alarmRule[].ignoreRecurring | Opcional | IgnoreRecurring | Body  | Ventana de auto-cierre de alarma                                                     |
| alarmRule[].eventSource    | Requerido | EventSource | Body      | Fuente del evento (con `sourceType`, `eventType`, `sourceID`, `sourceName`)          |

**Ejemplo de Solicitud:**

```json
{
  "alarmRule": [
    {
      "name": "fjx-test",
      "color": "#fff0000",
      "alarmMainCategory": "alarmCategoryVideo",
      "alarmSubCategory": "alarmSubCategoryCamera",
      "description": "fjx-test",
      "enable": 1,
      "priority": { "id": "2f87acf0985e431d852bbaed10aba040" },
      "notification": {
        "enable": 1,
        "recipients": [
          { "userID": "8a7485aa7f209dd5017f2141adff0019", "userName": "hccdd2 uat6" }
        ]
      },
      "schedule": {
        "type": "1",
        "timeSchedule": { "id": "161a03299fd94914b89accdf0844b0e6" }
      },
      "ignoreRecurring": { "enable": "1", "timeValue": "15" },
      "eventSource": {
        "sourceType": "camera",
        "eventType": 10102,
        "sourceID": "6a95b98ae34e4eac88f3af8a286bf47c",
        "sourceName": "5546G0_191 Camera 01"
      }
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "data": {
    "alarmRule": [
      { "name": "fjx-test", "errorCode": "", "id": "1658413372250656768" }
    ]
  }
}
```

---

#### 5.3.5 Obtener Reglas de Alarma

`POST /api/hccgw/alarm/v1/alarmrules/get`

**Parámetros de Solicitud:**

| Parámetro                     | Requerido | Tipo      | Ubicación | Descripción                                                       |
| ----------------------------- | --------- | --------- | --------- | ----------------------------------------------------------------- |
| Token                         | Requerido | String    | Header    | Máximo 64 caracteres                                              |
| pageIndex                     | Requerido | Integer   | Body      | Página actual                                                     |
| pageSize                      | Requerido | Integer   | Body      | Registros por página (1–500)                                      |
| filter                        | Opcional  | Object    | Body      | Condición de búsqueda                                             |
| filter.alarmRuleID            | Opcional  | String    | Body      | ID de la regla (máx 64). Si vacío, no se filtra                   |
| filter.alarmRuleName          | Opcional  | String    | Body      | Nombre de la regla — búsqueda difusa (máx 64)                      |
| filter.eventSourceName        | Opcional  | String    | Body      | Nombre de la fuente del evento — búsqueda difusa (máx 64)         |
| filter.alarmRuleState         | Opcional  | Integer   | Body      | `-1` o vacío = todos, `0` = normal, `1` = anormal                  |
| filter.alarmRuleEnable        | Opcional  | Integer   | Body      | `-1` o vacío = todos, `0` = deshabilitada, `1` = habilitada        |
| filter.eventSource            | Opcional  | EventSource[] | Body  | Solo `sourceType` y `sourceID` se requieren para la búsqueda      |
| filter.alarmCategory          | Opcional  | AlarmCategory | Body  | Categoría (con `mainCategory` y `subCategory`)                    |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": "1",
  "pageSize": "10",
  "filter": {
    "alarmRuleID": "",
    "alarmRuleName": "",
    "eventSourceName": "",
    "alarmRuleState": 0,
    "alarmRuleEnable": 0,
    "alarmCategory": { "mainCategory": "", "subCategory": "" },
    "eventSource": [ { "sourceID": "", "sourceType": "" } ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "totalCount": 1,
    "pageIndex": 1,
    "pageSize": 10,
    "alarmRule": [
      {
        "id": "1542072136028524544",
        "name": "Camera 01-Motion Detection",
        "color": "#fff0000",
        "enable": 1,
        "state": "0",
        "alarmMainCategory": "alarmCategoryVideo",
        "alarmSubCategory": "alarmSubCategoryCamera",
        "notification": { "enable": 1, "recipients": [ /* … */ ] },
        "schedule": { "timeSchedule": { "id": "8a748e7681618fea018161f847d70000" }, "type": "1" },
        "priority": { "id": "0db8cd1c85324e27a1f36c4f5a66e18", "level": "1", "color": "#F40B0B" },
        "ignoreRecurring": { "enable": 0, "timeValue": 15 },
        "eventSource": {
          "eventType": 10002,
          "sourceID": "a1afc31e55af4960900fa6498d67399d",
          "sourceType": "camera",
          "sourceName": "Camera 01"
        }
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.3.6 Editar Regla de Alarma

`POST /api/hccgw/alarm/v1/alarmrules/update`

**Parámetros de Solicitud:**

| Parámetro                     | Requerido | Tipo            | Ubicación | Descripción                                                |
| ----------------------------- | --------- | --------------- | --------- | ---------------------------------------------------------- |
| Token                         | Requerido | String          | Header    | Máximo 64 caracteres                                       |
| alarmRule                     | Requerido | Object[]        | Body      | Información de la regla a editar                           |
| alarmRule[].id                | Requerido | String          | Body      | ID de la regla de alarma (máx 64)                          |
| alarmRule[].name              | Requerido | String          | Body      | Nombre (máx 255)                                           |
| alarmRule[].description       | Opcional  | String          | Body      | Descripción (máx 128)                                      |
| alarmRule[].color             | Opcional  | String          | Body      | Color (máx 64)                                             |
| alarmRule[].notification      | Opcional  | Notification    | Body      | Configuración de notificación                              |
| alarmRule[].schedule          | Opcional  | Schedule        | Body      | Plantilla de armado                                        |
| alarmRule[].priority          | Opcional  | Priority        | Body      | Prioridad                                                  |
| alarmRule[].ignoreRecurring   | Opcional  | IgnoreRecurring | Body      | Ventana de auto-cierre                                     |
| alarmRule[].eventSource       | Requerido | EventSource     | Body      | Fuente del evento                                          |

**Ejemplo de Solicitud:**

```json
{
  "alarmRule": [
    {
      "id": "1542072136028524544",
      "name": "Camera 01-Motion Detection",
      "color": "#fff0000",
      "enable": 1,
      "state": "0",
      "alarmMainCategory": "alarmCategoryVideo",
      "alarmSubCategory": "alarmSubCategoryCamera",
      "notification": { "enable": 1, "recipients": [ /* … */ ] },
      "schedule": { "timeSchedule": { "id": "8a748e7681618fea018161f847d70000" }, "type": "1" },
      "priority": { "id": "0db8cd1c85324e27a1f36c4f5a66e18" },
      "ignoreRecurring": { "enable": 0, "timeValue": 15 },
      "eventSource": {
        "eventType": 10002,
        "sourceID": "a1afc31e55af4960900fa6498d67399d",
        "sourceType": "camera",
        "sourceName": "Camera 01"
      }
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "data": {
    "alarmRule": [
      { "name": "fjx-test", "id": "1658413372250656768" }
    ]
  }
}
```

---

#### 5.3.7 Obtener Lista de Prioridades de Alarma

`POST /api/hccgw/alarm/v1/alarmpriorities/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Página actual                |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–500) |

**Ejemplo de Solicitud:**

```json
{ "pageIndex": "1", "pageSize": "10" }
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "totalCount": "3",
    "pageIndex": "0",
    "pageSize": "10",
    "alarmpriorities": [
      { "id": "0db8cd1c85324e27a1f36c4f5a66e18", "level": 1, "levelName": "", "color": "#F40B0B", "audioURL": "" },
      { "id": "0e17d83ee1b24f239aec7a1a9a69d66", "level": 3, "levelName": "", "color": "#2D8B3D", "audioURL": "" },
      { "id": "0e1f9742db0d48cea90b5c92b73806d", "level": 2, "levelName": "", "color": "#D79931", "audioURL": "" }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.3.8 Obtener Plantilla de Horario de Armado

`POST /api/hccgw/alarm/v1/receivingschedules/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                  |
| --------- | --------- | ------- | --------- | ---------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres         |
| pageIndex | Requerido | Integer | Body      | Página actual                |
| pageSize  | Requerido | Integer | Body      | Registros por página (1–500) |

**Ejemplo de Solicitud:**

```json
{ "pageIndex": "1", "pageSize": "10" }
```

**Parámetros de Respuesta:** Devuelve `totalCount`, `pageIndex`, `pageSize` y `receivingSchedule[]` (ver objeto [ReceivingSchedule](APENDICE-A.md#a3132-receivingschedule) en el apéndice).

---

#### 5.3.9 Configurar Vinculación de Alarma (Linkage)

`POST /api/hccgw/alarm/v1/alarmlinkage/add`

**Parámetros de Solicitud:**

| Parámetro                       | Requerido | Tipo         | Ubicación | Descripción                                                  |
| ------------------------------- | --------- | ------------ | --------- | ------------------------------------------------------------ |
| Token                           | Requerido | String       | Header    | Máximo 64 caracteres                                         |
| alarmLinkage                    | Requerido | Object[]     | Body      | Información de la configuración de vinculación               |
| alarmLinkage[].alarmRuleID      | Requerido | String       | Body      | ID de la regla de alarma (máx 32)                            |
| alarmLinkage[].linkageItem      | Opcional  | LinkageItem[] | Body     | Lista de acciones de vinculación con `linkageType` y `linkageConfig` |

**Tipos de vinculación soportados (`linkageType`):** `LinkCamera`, `LinkCapturePicture`, `LinkAlarmOutput`, `LinkEMail`.

**Ejemplo de Solicitud:**

```json
{
  "alarmLinkage": [
    {
      "alarmRuleID": "b9619db8ee50475cbf8c6c89cbfb5dbd",
      "linkageItem": [
        {
          "linkageType": "LinkCamera",
          "linkageConfig": {
            "linkCamera": {
              "preRecordTime": 3,
              "postRecordTime": 15,
              "camera": [
                {
                  "id": "21f84da3f9604a30a3f5b6975fa0f38a",
                  "name": "5546G0_191 Camera 01",
                  "areaID": "450ac442bf4e4daf9f04e1af1bc90be7",
                  "areaName": "_2022-05-07T201804_0"
                }
              ]
            }
          }
        },
        {
          "linkageType": "LinkEMail",
          "linkageConfig": {
            "linkEmail": {
              "emailTemplateId": "8a748675809d8e3901809d9c57370000",
              "emailTemplateName": "test22"
            }
          }
        }
      ]
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "alarmLinkage": [
      {
        "alarmRuleID": "1651173299037802496",
        "itemID": "5BE20D67677647EF8D448E67E4AFB411",
        "linkageType": "LinkCamera",
        "errorCode": "0"
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.3.10 Logs de Alarma

`POST /api/hccgw/alarm/v1/alarmlog`

**Parámetros de Solicitud:**

| Parámetro            | Requerido | Tipo      | Ubicación | Descripción                                                                       |
| -------------------- | --------- | --------- | --------- | --------------------------------------------------------------------------------- |
| Token                | Requerido | String    | Header    | Máximo 64 caracteres                                                              |
| pageIndex            | Requerido | Integer   | Body      | Página actual (≥ 1)                                                               |
| pageSize             | Requerido | Integer   | Body      | Registros por página (1–500)                                                      |
| timeRange            | Requerido | Object    | Body      | Rango de tiempo (máximo 1 día entre `beginTime` y `endTime`). Ver [TimeRange](APENDICE-A.md#a3157-timerange) |
| timeRange.beginTime  | Requerido | String    | Body      | Tiempo de inicio                                                                  |
| timeRange.endTime    | Requerido | String    | Body      | Tiempo de fin                                                                     |
| areaID               | Opcional  | String    | Body      | ID de área. Si está ausente, busca en todas las áreas                             |
| eventTypeList        | Opcional  | String[]  | Body      | Lista de tipos de eventos. Si no se configura, incluye todos                      |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 5,
  "timeRange": {
    "beginTime": "2023-04-23 00:00:00",
    "endTime": "2023-04-24 00:00:00"
  },
  "areaID": "565623256767",
  "eventTypeList": ["10061", "10657"]
}
```

**Parámetros de Respuesta:**

| Parámetro            | Requerido | Tipo      | Descripción                                                                        |
| -------------------- | --------- | --------- | ---------------------------------------------------------------------------------- |
| errorCode            | Requerido | String    | Código de estado o error                                                           |
| data                 | Requerido | Object    | Contiene `pageIndex`, `pageSize`, `moreData` y `alarmLogList[]`                    |
| data.moreData        | Requerido | Integer   | Si hay más de una página: `0` = no, `1` = sí                                       |
| data.alarmLogList    | Requerido | Object[]  | Conjunto de logs de alarma. Ver objeto [AlarmMsg](APENDICE-A.md#a320-alarmmsg)     |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pageIndex": 1,
    "pageSize": 1,
    "moreData": 0,
    "alarmLogList": [
      {
        "guid": "9af74b16484d43eaaa64c833c05bcb3a",
        "alarmState": "0",
        "alarmMainCategory": "alarmCategoryVideo",
        "alarmSubCategory": "alarmCategoryVideo",
        "timeInfo": {
          "startTime": "2023-04-26T04:00:00Z",
          "endTime": "2023-04-26T04:00:15Z"
        },
        "eventSource": {
          "eventType": "100657",
          "sourceID": "a333cd708cd542be975e8f1298cc8aa1",
          "sourceName": "201",
          "sourceType": "camera"
        },
        "alarmRule": { "id": "1650433180307689472", "name": "201-Leaving Queue Detection" },
        "alarmPriority": { "id": "1", "level": "1", "color": "#ff1122" }
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.3.11 Umbral de Batería Baja (Cámaras Solares)

`POST /api/hccgw/alarm/v1/voltagesetting/set`

Edita el umbral de batería baja de las cámaras solares.

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo   | Ubicación | Descripción                                                                  |
| ---------------- | --------- | ------ | --------- | ---------------------------------------------------------------------------- |
| Token            | Requerido | String | Header    | Máximo 64 caracteres                                                         |
| voltageThreshold | Requerido | Number | Body      | Umbral de batería baja (**porcentaje**). Rango `[0, 100]`, predeterminado `20` |

**Ejemplo de Solicitud:**

```json
{
  "voltageThreshold": 20
}
```

**Parámetros de Respuesta:**

| Parámetro | Requerido | Tipo    | Descripción                                       |
| --------- | --------- | ------- | ------------------------------------------------- |
| errorCode | Requerido | String  | Código de estado o error                          |
| message   | Opcional  | String  | Mensaje de error                                  |
| data      | Opcional  | Boolean | `true` cuando la edición fue exitosa              |

**Ejemplo de Respuesta:**

```json
{
  "data": true,
  "errorCode": "0"
}
```

---

### 5.4 Servicios Relacionados con Mensajes

> Los mensajes son el contenido cargado activamente por el dispositivo cuando no hay una fuente de activación externa.

#### 5.4.1 Suscribirse a Mensajes

`POST /api/hccgw/rawmsg/v1/mq/subscribe`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo     | Ubicación | Descripción                                                                    |
| ------------- | --------- | -------- | --------- | ------------------------------------------------------------------------------ |
| Token         | Requerido | String   | Header    | Máximo 64 caracteres                                                           |
| subscribeType | Requerido | Integer  | Body      | `0` = cancelar suscripción, `1` = suscribir (máx 1 carácter)                  |
| msgType       | Requerido | String[] | Body      | Tipos de evento. Si está vacío, se suscribe a todos. Ver [Apéndice A.1.6 Tipo de Mensaje](APENDICE-A.md#a16-tipo-de-mensaje) |

**Ejemplo de Solicitud:**

```json
{
  "subscribeType": 1,
  "msgType": ["Msg330001", "Msg330002"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.4.2 Obtener Mensajes

`POST /api/hccgw/rawmsg/v1/mq/messages`

Después de suscribirse a mensajes, puede obtener mensajes manualmente del dispositivo. Se recomienda un intervalo de **500 ms**.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |

> Esta llamada no acepta parámetros de cuerpo.

**Parámetros de Respuesta:**

| Parámetro      | Requerido | Tipo     | Descripción                                                                          |
| -------------- | --------- | -------- | ------------------------------------------------------------------------------------ |
| errorCode      | Requerido | String   | Código de estado o error                                                             |
| data           | Requerido | Object   | Contiene `batchId` y `event[]`                                                       |
| data.batchId   | Requerido | String   | ID del lote de procesamiento de cola                                                 |
| data.event     | —         | Event[]  | Información de eventos. Ver objeto [Event](APENDICE-A.md#a391-event1) en el apéndice |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "batchId": "5823e397664b41e677fab5c4ee6e8c3fc8f60012f480a6c94e40e60501b8b7f59468bcd91f0a6eca6ec6cddf4511a78f",
    "remainingNumber": 0,
    "event": [
      {
        "basicInfo": {
          "occurrenceTime": "2023-05-08 11:15:26",
          "systemId": "855362005e074fbba3f2400d7fba3670",
          "msgType": "Msg330001",
          "resource": { "id": "25051e2467f44cf5947493a56921ca4c", "name": "111", "areaName": "333" },
          "device": { "id": "0d961d4a05264d4b848522d3414eca3a", "name": "K70728087", "category": "mobileDevice" }
        },
        "data": {
          "vehicleRelatedInfo": {
            "gpsInfo": { "ew": "E", "lng": "6.943345", "ns": "N", "lat": "50.331554", "direction": 32759, "height": 6090, "speed": 33333 },
            "vehicleInfo": { "licensePlate": "111", "id": "25051e2467f44cf5947493a56921ca4c", "speedLimit": 8200000 }
          }
        }
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.4.3 Confirmar Mensajes Recibidos

`POST /api/hccgw/rawmsg/v1/mq/messages/complete`

Confirma el consumo de mensajes según el `batchId` recibido. **Sin confirmar, obtendrá los mismos datos continuamente; después de confirmar, obtendrá los nuevos.**

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                                                            |
| --------- | --------- | ------ | --------- | ---------------------------------------------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                                                   |
| batchId   | Requerido | String | Body      | `batchID` devuelto al obtener mensajes (máx 256)                       |

**Ejemplo de Solicitud:**

```json
{
  "batchId": "4075e8d16a4b4ce63dabebcdba3cd37e83b65a13edd5b4d34343ef595ab6b5a7946a86e61d086cc86cc4cfdd4713a58d"
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

#### 5.5.2 Obtener Dirección de Vista en Vivo / Reproducción

`POST /api/hccgw/video/v1/live/address/get`

Obtiene la dirección de streaming (`playUrl`). La forma de reproducirla depende del protocolo elegido: con **EZOPEN** (`protocol=1`) se requiere un SDK de Hik-Connect (JSDecoder SDK en web, Mobile SDK en apps — ver más abajo); con **HLS/RTMP** la respuesta es una URL estándar (`.m3u8` / `rtmp://`) reproducible por reproductores convencionales.

> **Nota:**
>
> - Las regiones de India y Rusia **no** soportan los protocolos RTMP/HLS.
> - Para protocolos RTMP/HLS aplican estas restricciones:
>   - La reproducción no es soportada.
>   - El cifrado de stream no puede habilitarse.
>   - Solo se soporta el formato de video H264.
>   - Durante vista en vivo vía RTMP/HLS, operaciones como habilitar/deshabilitar audio o cambiar entre stream principal/sub requieren reenviar la solicitud RTMP/HLS para reiniciar la vista en vivo.
> - HLS/RTMP devuelven URLs estándar en `playUrl` con `accessToken` como parámetro de consulta (válido durante `expireTime`): la `.m3u8` se reproduce con la etiqueta HTML5 `<video>` o hls.js; la `rtmp://` con video.js, flv.js, VLC o para publicar hacia un CDN.

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo    | Ubicación | Descripción                                                                                          |
| ------------ | --------- | ------- | --------- | ---------------------------------------------------------------------------------------------------- |
| Token        | Requerido | String  | Header    | Máximo 64 caracteres                                                                                 |
| resourceId   | Requerido | String  | Body      | ID del recurso de cámara (obtenido vía `/api/hccgw/resource/v1/areas/cameras/get`, máx 64)           |
| deviceSerial | Requerido | String  | Body      | Número de serie del dispositivo (máx 32)                                                              |
| type         | Requerido | String  | Body      | Tipo: `1` = vista en vivo, `2` = reproducción local, `3` = reproducción en nube. `2` y `3` son inválidos cuando `protocol` es RTMP |
| code         | Opcional  | String  | Body      | Contraseña de cifrado del dispositivo (máx 16). No soportada cuando `protocol` es RTMP                |
| protocol     | Opcional  | Integer | Body      | Protocolo: `1` = EZOPEN (predeterminado), `2` = HLS, `3` = RTMP                                       |
| quality      | Opcional  | String  | Body      | Calidad: `1` = HD (bitrate principal, predeterminado), `2` = Fluent (sub-bitrate)                     |
| expireTime   | Opcional  | Integer | Body      | Tiempo de expiración (segundos). Validez para RTMP: 30s–720d                                          |
| startTime    | Opcional  | String  | Body      | Tiempo de inicio de reproducción (formato `2019-12-01 00:00:00`)                                       |
| stopTime     | Opcional  | String  | Body      | Tiempo de fin de reproducción                                                                         |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "L45203285",
  "resourceId": "5ce3cebed0e549938c59034edb5fe290",
  "type": "1",
  "protocol": 3,
  "quality": 2,
  "expireTime": 600
}
```

**Parámetros de Respuesta:**

| Parámetro       | Requerido | Tipo    | Descripción                                                       |
| --------------- | --------- | ------- | ----------------------------------------------------------------- |
| errorCode       | Requerido | String  | Código de estado o error                                          |
| data            | Opcional  | Object  | Información de streaming                                          |
| data.id         | Opcional  | String  | ID                                                                |
| data.url        | Opcional  | String  | URL                                                               |
| data.expireTime | Opcional  | Integer | Marca de tiempo de expiración. Inválido cuando `protocol` es EZOPEN |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "id": "786192075142131712",
    "url": "rtmp://vtmsgpzl.ezvizlife.com:1935/v3/openlive/L26577519_1_2?expire=1733720797&id=786192075142131712&c=047020a3b0&t=c17825ce51d23a7bc172912ac7263b352a9640aa78176ce94f2b13cb4c0b5c52&ev=100",
    "expireTime": 1733720797000
  },
  "errorCode": "0"
}
```

##### ¿Cómo reproducir el stream? Guía por tipo de cliente

| Cliente | Tecnología | Protocolo |
| ------- | ---------- | --------- |
| Navegador web | **JSDecoder SDK** (Hik-Connect) | EZOPEN |
| App móvil nativa (Android/iOS) | **Mobile SDK — HPNetSDK** (Hik-Connect for Teams Network SDK) | EZOPEN |
| Reproductor estándar (HTML5 `<video>`, hls.js, video.js, VLC, CDN) | Sin SDK | HLS / RTMP (solo H.264, sin cifrado de stream; no disponible en India ni Rusia) |

##### Video en navegador web — JSDecoder SDK

**Datos previos (antes de usar el SDK):**

1. Token de streaming — `GET /api/hccgw/platform/v1/streamtoken/get` (header `Token`): devuelve `appToken` (úsalo como **AccessToken** del SDK) y `streamAreaDomain` (**Domain** del SDK). Vigencia: 7 días.
2. Lista de cámaras — `POST /api/hccgw/resource/v1/areas/cameras/get`: de ahí salen `deviceSerial` (**Serial Number**) y `cameraNo` (**Channel Number**).

| Parámetro del SDK | Fuente | Descripción |
| ----------------- | ------ | ----------- |
| AccessToken | `streamtoken/get` → `appToken` | Token de autenticación de streaming |
| Secret Key | Código de seguridad del dispositivo (se define al agregarlo) | Código de verificación del dispositivo |
| Serial Number | `areas/cameras/get` → `deviceSerial` | Número de serie del dispositivo |
| Channel Number | `areas/cameras/get` → `cameraNo` | Índice de canal/cámara en el dispositivo |
| Domain | `streamtoken/get` → `streamAreaDomain` | Dominio del servidor de streaming |

**Integración:**

1. Descargar el JSDecoder SDK desde https://tpp.hikvision.com/tpp/Resource.
2. Incluir `jsPlugin-3.0.0.min.js` en la página web.
3. Inicializar el plugin:

   ```javascript
   var oPlugin = new JSPlugin({
     szId: "playWind",      // ID del div contenedor
     iWidth: 600, iHeight: 400,
     iMaxSplit: 4,          // máximo de ventanas (1/4/9/16)
     szBasePath: "./dist"   // ruta a la carpeta dist del SDK
   });
   ```
4. Configurar callbacks de ventana con `oPlugin.JS_SetWindowControlCallback({...})`.
5. Reproducir:
   - Vista en vivo: `oPlugin.JS_Play("ezopen://open.ezviz.com/{serial}/{channel}.live", { accessToken, env: { domain }, ezuikit: true, mode: "media" }, windowIndex)`
   - Reproducción: `oPlugin.JS_Play("ezopen://open.ezviz.com/{serial}/{channel}.{local|cloud}.rec?begin={}&end={}", { accessToken, env: { domain }, ezuikit: true, mode: "media" }, windowIndex, beginTime, endTime)`

APIs clave del SDK: `JS_Play()`, `JS_Stop()`, `JS_CapturePicture()` (BMP/JPEG), `JS_StartSaveEx()` (grabación local), `JS_StartEZUITalk()` (audio bidireccional), `JS_DownloadFile()` (descarga), `JS_EnableZoom()`, `JS_ArrangeWindow()`, `JS_InitDataTransform()` (video a MP4).

> **Notas:**
> - **HTTPS obligatorio:** la página debe servirse por HTTPS con los encabezados `Cross-Origin-Embedder-Policy: require-corp`, `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Resource-Policy: cross-origin` (el SDK usa SharedArrayBuffer).
> - **EZOPEN no se reproduce sin el SDK:** los reproductores estándar (VLC, player nativo del navegador) no soportan el protocolo propietario EZOPEN.

##### Video en apps móviles — Mobile SDK (HPNetSDK)

Para apps nativas **Android/iOS** con vista en vivo, reproducción y audio bidireccional, se usa el *Hik-Connect for Teams Network SDK* (HPNetSDK).

- **Descarga:** https://tpp.hikvision.com/tpp/Resource
- **Importante:** HPNetSDK solo funciona en **dispositivos físicos reales** — no en simuladores/emuladores.

**Paso 1 — Inicializar el SDK:**

Android (Kotlin):

```kotlin
HPNetSDK.initWithAreaDomain(
    application,
    "https://ieuapi.hik-proconnect.com",   // areaDomain
    "<accessToken>",                        // de POST /api/hccgw/platform/v1/token/get
    "<appKey>",                             // AK del desarrollador
    object : InitCallback {
        override fun onInitSuccess() { }
        override fun onInitFail(error: HPNetError) { }
    }
)
```

iOS (Objective-C):

```objc
[HPNetSDK initWithAreaDomain:@"https://ieuapi.hik-proconnect.com"
                 accessToken:@"<accessToken>"
                      appkey:@"<appKey>"
                  completion:^(HPNetError *error){
    if (error) { /* falló la inicialización */ } else { /* inicializado */ }
}];
```

**Paso 2 — Vista en vivo:**

```kotlin
// Android
val param = HPNetPlayerParam("123456789", 1, surfaceView)
val previewPlayer = HPNetSDK.createPreviewPlayer(param, this)
previewPlayer.startRealPlay(Type.STREAM_LOW, safeKey)
```

```objc
// iOS
HPNetPlayerParam *param = [[HPNetPlayerParam alloc] init];
param.devSerial = @"123456789";
param.channelNo = 1;
param.playWnd = playerView;
HPNetPreviewPlayer *previewPlayer = [[HPNetSDK alloc] createPreviewPlayerWithParam:param];
[previewPlayer startRealPlayWithSafeKey:safeKey streamType:HPNetSteamType_Low];
```

Operaciones opcionales durante la vista en vivo: `openPlaySound`, `closePlaySound`, `changeStreamType`, `capturePicture`, `startLocalRecord`, `stopLocalRecord`, `electricZoom`, `closeEletricZoom`.

**Paso 3 — Reproducción (playback):**

```kotlin
// Android
val param = HPNetPlayerParam("123456789", 1, mSurfaceView)
val playbackPlayer = HPNetSDK.createPlayBackPlayer(param, this)
playbackPlayer.searchRecordFile(startTime, stopTime)
playbackPlayer.startPlayback(startTime, stopTime, safeKey)
```

```objc
// iOS
HPNetPlayerParam *param = [[HPNetPlayerParam alloc] init];
param.devSerial = @"123456789";
param.channelNo = 1;
param.playWnd = playerView;
HPNetPlayBackPlayer *playbackPlayer = [HPNetSDK createPlayBackPlayerWithParam:param];
[playbackPlayer searchRecordFileWithStartTime:startTime stopTime:stopTime
                                   completion:^(NSArray *records, HPNetError *error){ }];
[playbackPlayer startPlayBackWithStartTime:startTime stopTime:stopTime safeKey:@"123456"];
```

Opciones: `pausePlayback`/`playBackPause`, `resumePlayback`/`playBackResume`, `setPlayBackSpeed`, `getCapacitySupport`.

**Paso 4 — Audio bidireccional (intercom):**

```kotlin
// Android
val param = HPNetIntercomParam(devSerial = "123456789", channelNo = 1)
val intercom = HPNetSDK.createIntercom(param, object : IntercomCallback {
    override fun didReceiveMessage(intercom: IIntercom, msgCode: Int) {
        when (msgCode) {
            MessageCode.VOICE_TALK_START -> { /* iniciado */ }
            MessageCode.VOICE_TALK_FINISH -> { /* finalizado */ }
            MessageCode.VOICE_TALK_AUTO_STOP -> { /* límite de tiempo */ }
            MessageCode.VOICE_TALK_TOKEN_CHANGED -> { /* token cambiado */ }
        }
    }
    override fun didReceiveError(intercom: IIntercom, error: HPNetError) { }
})
intercom.startVoiceTalk(true, safeKey)
intercom.stopVoiceTalk()
```

```objc
// iOS
HPNetIntercomParam *param = [[HPNetIntercomParam alloc] init];
param.devSerial = @"123456789";
param.channelNo = 1;
[mIntercom startVoiceTalk:YES safeKey:@"123456"];
[mIntercom stopVoiceTalk];
```

**Paso 5 — Descargar grabación a archivo:**

```kotlin
// Android
DownloadFileManager.startDownloadFile(devSerial, channelNo, safeKey, startTime, endTime, saveFilePath, object : DownloadFileResultCallback {
    override fun onSuccess(downloadFilePath: String) { }
    override fun onError(errorCode: String) { }
})
DownloadFileManager.stopDownloadFile()
```

> **Nota:** la descarga de archivos tiene un límite de **5 minutos por archivo** (error `HPNETSDK1-100017` si se excede).

**Parámetros del SDK:**

| Parámetro HPNetSDK | Fuente | Descripción |
| ------------------ | ------ | ----------- |
| `areaDomain` | Respuesta de `token/get` → campo `areaDomain` | Dominio de la OpenAPI de Hik-Partner Pro |
| `accessToken` | Respuesta de `token/get` → campo `accessToken` | Token de acceso a la API (vigencia de 7 días) |
| `appKey` | Cuenta de desarrollador | AK (el mismo appKey de la OpenAPI) |
| `devSerial` | `areas/cameras/get` → `device.serialNo` | Número de serie del dispositivo |
| `channelNo` | `areas/cameras/get` → `camera.cameraNo` | Índice de canal en el dispositivo |
| `safeKey` | Código de seguridad del dispositivo | Código de cifrado de streaming (se define al agregar el dispositivo) |

**Tipos de stream:** `STREAM_LOW` (fluido), `STREAM_MID` (balanceado), `STREAM_HIGH` (HD).

**Velocidades de reproducción:** `PLAYBACK_SPEED_1` (normal), `PLAYBACK_SPEED_2/4/8` (rápida 2x/4x/8x), `PLAYBACK_SPEED_1_2/1_4/1_8` (lenta 1/2, 1/4, 1/8).

**Dependencias requeridas (Android):** `okhttp`, `gson`, `okio`, `retrofit2` (`retrofit`, `converter-gson`, `adapter-rxjava2`), `logging-interceptor`, `rxjava`, `rxandroid`.

**Frameworks requeridos (iOS):** AudioToolbox, AVFoundation, CoreMedia, GLKit, VideoToolbox, SystemConfiguration, libbz2, libc++.

---

#### 5.5.3 Buscar Segmentos de Reproducción

`POST /api/hccgw/video/v1/record/element/search`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo    | Ubicación | Descripción                                                                       |
| ------------------ | --------- | ------- | --------- | --------------------------------------------------------------------------------- |
| Token              | Requerido | String  | Header    | Máximo 64 caracteres                                                              |
| pageSize           | Requerido | Integer | Body      | Registros por página                                                              |
| pageIndex          | Requerido | Integer | Body      | Comienza desde 1                                                                  |
| cameraId           | Requerido | String  | Body      | ID del recurso de cámara (obtenido vía `/api/hccgw/resource/v1/areas/cameras/get`, máx 64) |
| filter             | Requerido | Object  | Body      | Condición de búsqueda                                                             |
| filter.timeType    | Requerido | Integer | Body      | `0` = tiempo de cliente, `1` = tiempo del dispositivo local                       |
| filter.beginTime   | Requerido | String  | Body      | Tiempo de inicio (formato `yyyy-MM-ddTHH:mm:ss+08:00`)                            |
| filter.endTime     | Requerido | String  | Body      | Tiempo de fin                                                                     |
| filter.targetType  | Requerido | Integer | Body      | `0` = dispositivo local, `1` = almacenamiento en nube                             |

**Ejemplo de Solicitud:**

```json
{
  "pageSize": 10,
  "pageIndex": 1,
  "cameraId": "35cbe44b091044a0924dcc2036848973",
  "filter": {
    "timeType": 1,
    "beginTime": "2024-11-28T00:00:00+08:00",
    "endTime": "2024-11-28T23:00:00+08:00",
    "targetType": 0
  }
}
```

**Parámetros de Respuesta:**

| Parámetro          | Requerido | Tipo            | Descripción                                                       |
| ------------------ | --------- | --------------- | ----------------------------------------------------------------- |
| errorCode          | Requerido | String          | Código de estado o error                                          |
| data               | Requerido | Object          | Contiene `pageSize`, `pageIndex` y `recordList[]`                  |
| data.recordList    | Opcional  | RecordListInfo[] | Información de segmentos. Cada entrada tiene `beginTime`, `endTime`, `targetType` |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pageIndex": 1,
    "pageSize": 10,
    "recordList": [
      { "beginTime": "2024-11-28T11:39:14+08:00", "endTime": "2024-11-28T23:00:00+08:00", "targetType": 0 },
      { "beginTime": "2024-11-28T14:17:43+08:00", "endTime": "2024-11-28T14:17:53+08:00", "targetType": 0 }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.5.4 Activar Grabación MP4 Estándar

`POST /api/hccgw/video/v1/video/save`

Activa la función de almacenamiento de grabación MP4 estándar del dispositivo y genera la URL de descarga (asíncrono).

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo    | Ubicación | Descripción                                                                                   |
| ------------ | --------- | ------- | --------- | --------------------------------------------------------------------------------------------- |
| Token        | Requerido | String  | Header    | Máximo 64 caracteres                                                                          |
| cameraId     | Requerido | String  | Body      | ID del recurso de cámara (obtenido vía `/api/hccgw/resource/v1/areas/cameras/get`, máx 64)     |
| beginTime    | Requerido | String  | Body      | Tiempo de inicio (formato `yyyy-MM-ddTHH:mm:ss+08:00`)                                         |
| endTime      | Requerido | String  | Body      | Tiempo de fin                                                                                  |
| voiceSwitch  | Opcional  | Integer | Body      | Audio en grabación: `0` = off, `1` = on, `2` = auto (predeterminado). Solo soportado por audio AAC y G711A |

**Ejemplo de Solicitud:**

```json
{
  "cameraId": "35cbe44b091044a0924dcc2036848973",
  "beginTime": "2024-11-28T14:15:41+08:00",
  "endTime": "2024-11-28T14:17:43+08:00",
  "voiceSwitch": 2
}
```

**Parámetros de Respuesta:**

| Parámetro    | Requerido | Tipo   | Descripción                                                |
| ------------ | --------- | ------ | ---------------------------------------------------------- |
| errorCode    | Requerido | String | Código de estado o error                                   |
| data         | Requerido | Object | Información de la tarea                                    |
| data.taskId  | Opcional  | String | ID de tarea asíncrona, para obtener el resultado de grabación |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "taskId": "550596eee62c42c6a0377fcd65912dc5#780eaa6ce4d64eccbe6c334308c10a36"
  },
  "errorCode": "0"
}
```

---

#### 5.5.5 Obtener Estado y URL de Descarga de Grabación

`POST /api/hccgw/video/v1/video/download/url`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                                                                  |
| --------- | --------- | ------ | --------- | ---------------------------------------------------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                                                         |
| taskId    | Requerido | String | Body      | ID de tarea asíncrona, obtenido de `POST /api/hccgw/video/v1/video/save`     |

**Ejemplo de Solicitud:**

```json
{
  "taskId": "550596eee62c42c6a0377fcd65912dc5#780eaa6ce4d64eccbe6c334308c10a36"
}
```

**Parámetros de Respuesta:**

| Parámetro        | Requerido | Tipo     | Descripción                                                                  |
| ---------------- | --------- | -------- | ---------------------------------------------------------------------------- |
| errorCode        | Requerido | String   | Código de estado o error                                                     |
| data             | Requerido | Object   | Estado y URLs                                                                |
| data.status      | Requerido | Integer  | `0` = subido, `1` = subiendo, `2` = falla al subir, `3` = expirado, `4` = eliminado |
| data.expireTime  | Requerido | Long     | Tiempo de expiración                                                         |
| data.urls        | Requerido | String[] | Lista de URLs de descarga                                                    |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "status": 0,
    "expireTime": 1733720797000,
    "urls": ["https://storage.example.com/video/abc123.mp4"]
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

**Parámetros de Respuesta:**

| Parámetro | Requerido | Tipo    | Descripción                                       |
| --------- | --------- | ------- | ------------------------------------------------- |
| errorCode | Requerido | String  | Código de estado o error                          |
| message   | Opcional  | String  | Mensaje de error                                  |
| data      | Opcional  | Object  | Contiene `data: Boolean` (resultado del despertar) |

**Ejemplo de Respuesta:**

```json
{
  "data": { "data": true },
  "errorCode": "0"
}
```

---

#### 5.5.7 Transmisión de Protocolo ISAPI

`POST /api/hccgw/video/v1/isapi/proxypass`

Transmite el protocolo ISAPI de forma transparente al dispositivo.

**Parámetros de Solicitud:**

| Parámetro   | Requerido | Tipo   | Ubicación | Descripción                                                                                  |
| ----------- | --------- | ------ | --------- | -------------------------------------------------------------------------------------------- |
| Token       | Requerido | String | Header    | Máximo 64 caracteres                                                                          |
| method      | Requerido | String | Body      | Método HTTP: `GET`, `POST`, `PUT` o `DELETE`                                                  |
| url         | Requerido | String | Body      | URL ISAPI relativa (p. ej. `/ISAPI/PTZCtrl/channels/2/presets/1`)                              |
| id          | Requerido | String | Body      | ID del dispositivo                                                                            |
| contentType | Requerido | String | Body      | Tipo de contenido. Soporta `application/xml`, `application/json` y `application/x-www-form-urlencoded` |
| body        | Opcional  | String | Body      | Cuerpo/parámetros de la solicitud ISAPI                                                       |

**Ejemplo de Solicitud:**

```json
{
  "method": "GET",
  "url": "/ISAPI/PTZCtrl/channels/2/presets/1",
  "id": "85cff214670c4bc69a8d7436fb93576c",
  "contentType": "application/xml",
  "body": ""
}
```

**Parámetros de Respuesta:**

| Parámetro | Requerido | Tipo   | Descripción                                                            |
| --------- | --------- | ------ | ---------------------------------------------------------------------- |
| errorCode | Requerido | String | Código de estado o error (0 = éxito)                                   |
| message   | Requerido | String | Mensaje informativo                                                    |
| data      | Requerido | String | Respuesta cruda devuelta por el dispositivo (típicamente XML)          |

**Ejemplo de Respuesta:**

```json
{
  "data": "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><ResponseStatus version=\"2.0\" xmlns=\"http://www.isapi.org/ver20/XMLSchema\"><requestURL>/ISAPI/PTZCtrl/channels/2/presets/1</requestURL><statusCode>4</statusCode><statusString>Invalid Operation</statusString><subStatusCode>notSupport</subStatusCode></ResponseStatus>",
  "errorCode": "0"
}
```

---

#### 5.5.8 Transmisión Transparente de Protocolo ISAPI (variante directa)

`POST /api/hccgw/proxy/v1/isapi/proxypass`

> **Nota:** Esta API comparte los mismos parámetros de solicitud y respuesta que `POST /api/hccgw/video/v1/isapi/proxypass`. La diferencia es que los parámetros se transmiten directamente desde OpenAPI a Hik-Connect sin transformación intermedia.

**Parámetros de Solicitud:** idénticos a la sección 5.5.7 (`method`, `url`, `id`, `contentType`, `body`).

**Parámetros de Respuesta:** idénticos a la sección 5.5.7 (`errorCode`, `message`, `data` como cadena con la respuesta cruda del dispositivo).

---

#### 5.5.9 Obtener Estado de Entrada de Alarma (transmisión transparente)

`POST /api/hccgw/proxy/v1/areas/alarminputs/status/get`

> **Nota:** Esta API comparte la misma función que `POST /api/hccgw/resource/v1/areas/alarminputs/status/get`. La diferencia es que el parámetro de solicitud usa `alarmIntputId` (sic) / `alarmIntputID` y los parámetros se transmiten directamente desde OpenAPI a Hik-Connect.

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo          | Ubicación | Descripción                                                              |
| ------------- | --------- | ------------- | --------- | ------------------------------------------------------------------------ |
| Token         | Requerido | String        | Header    | Máximo 64 caracteres                                                     |
| alarmIntputId | Requerido | Array[String] | Body      | Conjunto de IDs de entrada de alarma (hasta 8 recursos al mismo tiempo) |

**Ejemplo de Solicitud:**

```json
{
  "alarmInputId": [
    "2c0a4ab9a2504de4842d95435f3a8620",
    "b35b8e9a9326418ca2198ed45709b5bd"
  ]
}
```

**Parámetros de Respuesta:**

| Parámetro | Requerido | Tipo            | Descripción                                                                                     |
| --------- | --------- | --------------- | ----------------------------------------------------------------------------------------------- |
| errorCode | Requerido | String          | Código de estado o error                                                                        |
| data      | Requerido | Object          | Contiene `alarmInput[]` (lista `AlarmInputInfo`). Si un ID no existe, no se incluye en la respuesta. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "alarmInput": [
      {
        "id": "0da41f0ac59c4debade796914f874148",
        "status": 2,
        "errorCode": "0"
      },
      {
        "id": "3d75a50c0ae84fc99c19581ef82d1b29",
        "status": 1,
        "errorCode": "0"
      }
    ]
  },
  "errorCode": "0"
}
```

---

### 5.6 Servicios de Videoportero

#### 5.6.1 Buscar Edificios

`POST /api/hccgw/vims/v1/build/search`

**Parámetros de Solicitud:**

| Parámetro                       | Requerido | Tipo    | Ubicación | Descripción                                                              |
| ------------------------------- | --------- | ------- | --------- | ------------------------------------------------------------------------ |
| Token                           | Requerido | String  | Header    | Máximo 64 caracteres                                                     |
| pageNum                         | Requerido | Integer | Body      | Número de página                                                          |
| pageSize                        | Requerido | Integer | Body      | Tamaño de página                                                          |
| searchCriteria                  | Requerido | Object  | Body      | Condición de búsqueda. Ver objeto [BuildingSearchCriteria](APENDICE-A.md#a346-buildingsearchcriteria) |
| searchCriteria.areaId           | Opcional  | String  | Body      | ID del área (`-1` = raíz)                                                |
| searchCriteria.isContainSubArea | Opcional  | Integer | Body      | `1` = incluir subáreas                                                    |
| searchCriteria.filterName       | Opcional  | String  | Body      | Filtrar por nombre                                                        |

**Ejemplo de Solicitud:**

```json
{
  "pageNum": 1,
  "pageSize": 64,
  "searchCriteria": {
    "areaId": "-1",
    "isContainSubArea": 1,
    "filterName": ""
  }
}
```

**Parámetros de Respuesta:**

| Parámetro          | Requerido | Tipo       | Descripción                                                          |
| ------------------ | --------- | ---------- | -------------------------------------------------------------------- |
| errorCode          | Requerido | String     | Código de estado o error                                             |
| data               | Requerido | Object     | Contiene `pageNum`, `pageSize`, `totalNum`, `buildList[]`            |
| data.buildList     | —         | Building[] | Lista de edificios (ver objeto [Building](APENDICE-A.md#a345-building)) |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pageNum": 0,
    "pageSize": 0,
    "totalNum": 0,
    "buildList": [
      {
        "buildId": "",
        "buildName": "",
        "areaId": "",
        "areaName": "",
        "totalRoom": 0,
        "totalPerson": 0,
        "deviceNames": ""
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.6.2 Buscar Habitaciones

`POST /api/hccgw/vims/v1/room/search`

**Parámetros de Solicitud:**

| Parámetro                       | Requerido | Tipo    | Ubicación | Descripción                                                                                   |
| ------------------------------- | --------- | ------- | --------- | --------------------------------------------------------------------------------------------- |
| Token                           | Requerido | String  | Header    | Máximo 64 caracteres                                                                          |
| pageNum                         | Requerido | Integer | Body      | Número de página                                                                              |
| pageSize                        | Requerido | Integer | Body      | Tamaño de página                                                                              |
| searchCriteria                  | Requerido | Object  | Body      | Condición de búsqueda. Ver objeto [RoomSearchCriteria](APENDICE-A.md#a3146-roomsearchcriteria) |
| searchCriteria.areaId           | Opcional  | String  | Body      | ID del área                                                                                   |
| searchCriteria.buildId          | Opcional  | String  | Body      | ID del edificio                                                                               |
| searchCriteria.isContainSubArea | Opcional  | Integer | Body      | `1` = incluir subáreas                                                                        |
| searchCriteria.filter           | Opcional  | Object  | Body      | Filtros internos                                                                              |
| searchCriteria.filter.roomNum   | Opcional  | String  | Body      | Número de habitación                                                                          |
| searchCriteria.filter.roomName  | Opcional  | String  | Body      | Nombre de habitación                                                                          |
| searchCriteria.filter.personAmount | Opcional | String | Body      | Cantidad de personas                                                                          |
| searchCriteria.filter.email     | Opcional  | String  | Body      | Correo electrónico                                                                            |
| searchCriteria.filter.mainAccount | Opcional | String | Body      | Cuenta principal                                                                              |

**Ejemplo de Solicitud:**

```json
{
  "pageNum": 1,
  "pageSize": 64,
  "searchCriteria": {
    "areaId": "-1",
    "buildId": "",
    "isContainSubArea": 1,
    "filter": {
      "roomNum": "",
      "roomName": "",
      "personAmount": "",
      "email": "",
      "mainAccount": ""
    }
  }
}
```

**Parámetros de Respuesta:**

| Parámetro       | Requerido | Tipo     | Descripción                                                       |
| --------------- | --------- | -------- | ----------------------------------------------------------------- |
| errorCode       | Requerido | String   | Código de estado o error                                          |
| data            | Requerido | Object   | Contiene `pageNum`, `pageSize`, `totalNum`, `roomList[]`          |
| data.roomList   | —         | RoomVO[] | Lista de habitaciones (ver objeto [RoomVO](APENDICE-A.md#a3147-roomvo)) |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pageNum": 0,
    "pageSize": 0,
    "totalNum": 0,
    "roomList": [
      {
        "roomId": "",
        "roomName": "",
        "roomNum": 0,
        "buildId": "",
        "buildName": "",
        "areaId": "",
        "areaName": "",
        "personAmount": 0,
        "mainAccount": "",
        "email": "",
        "phone": ""
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.6.3 Buscar Residentes

`POST /api/hccgw/vims/v1/person/search`

**Parámetros de Solicitud:**

| Parámetro                            | Requerido | Tipo    | Ubicación | Descripción                                                                            |
| ------------------------------------ | --------- | ------- | --------- | -------------------------------------------------------------------------------------- |
| Token                                | Requerido | String  | Header    | Máximo 64 caracteres                                                                   |
| pageNum                              | Requerido | Integer | Body      | Número de página                                                                       |
| pageSize                             | Requerido | Integer | Body      | Tamaño de página                                                                       |
| searchRequest                        | Requerido | Object  | Body      | Condición de búsqueda. Ver [ResidentSearchRequest](APENDICE-A.md#a3141-residentsearchrequest) |
| searchRequest.areaId                 | Opcional  | String  | Body      | ID del área                                                                            |
| searchRequest.buildId                | Opcional  | String  | Body      | ID del edificio                                                                        |
| searchRequest.isContainSubArea       | Opcional  | Integer | Body      | `1` = incluir subáreas                                                                 |
| searchRequest.filter                 | Opcional  | Object  | Body      | Filtros internos                                                                       |
| searchRequest.filter.name            | Opcional  | String  | Body      | Nombre                                                                                 |
| searchRequest.filter.roomNum         | Opcional  | Integer | Body      | Número de habitación                                                                   |
| searchRequest.filter.email           | Opcional  | String  | Body      | Correo                                                                                 |
| searchRequest.filter.phone           | Opcional  | String  | Body      | Teléfono                                                                               |
| searchRequest.filter.type            | Opcional  | Integer | Body      | Tipo                                                                                   |
| searchRequest.filter.isExpired       | Opcional  | Integer | Body      | `1` = expirado                                                                         |

**Ejemplo de Solicitud:**

```json
{
  "pageNum": 0,
  "pageSize": 0,
  "searchRequest": {
    "areaId": "",
    "buildId": "",
    "isContainSubArea": 0,
    "filter": {
      "name": "",
      "roomNum": 0,
      "email": "",
      "phone": "",
      "type": 0,
      "isExpired": 0
    }
  }
}
```

**Parámetros de Respuesta:**

| Parámetro       | Requerido | Tipo     | Descripción                                                            |
| --------------- | --------- | -------- | ---------------------------------------------------------------------- |
| errorCode       | Requerido | String   | Código de estado o error                                               |
| data            | Requerido | Object   | Contiene `pageNum`, `pageSize`, `totalNum`, `personList[]`             |
| data.personList | —         | Person[] | Lista de residentes (ver objeto [Person](APENDICE-A.md#a3120-person)) |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pageNum": 0,
    "pageSize": 0,
    "totalNum": 0,
    "personList": [
      {
        "personId": "",
        "firstName": "",
        "lastName": "",
        "phone": "",
        "email": "",
        "isExpired": 0,
        "photoUrl": "",
        "headPicUrl": "",
        "roomList": [
          {
            "roomId": "",
            "roomNum": 0,
            "roomName": "",
            "areaId": "",
            "areaName": "",
            "buildId": "",
            "buildName": "",
            "accountType": 0
          }
        ]
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.6.4 Agregar Residente

`POST /api/hccgw/vims/v1/person/add`

> Consulte [4.14 Agregar Residente](#414-agregar-residente) para la guía de uso.

**Parámetros de Solicitud:**

| Parámetro                  | Requerido | Tipo       | Ubicación | Descripción                                                                  |
| -------------------------- | --------- | ---------- | --------- | ---------------------------------------------------------------------------- |
| Token                      | Requerido | String     | Header    | Máximo 64 caracteres                                                         |
| allds                      | Opcional  | String[]   | Body      | Lista de IDs de nivel de acceso a aplicar al residente                       |
| language                   | Opcional  | String     | Body      | Idioma del correo de invitación                                              |
| personBaseInfo             | Requerido | PersonDTO  | Body      | Información básica del residente. Ver [PersonDTO](APENDICE-A.md#a3123-persondto) |
| personBaseInfo.id          | Opcional  | String     | Body      | ID interno                                                                   |
| personBaseInfo.personCode  | Requerido | String     | Body      | Código de persona (1–16 caracteres)                                          |
| personBaseInfo.groupId     | Requerido | String     | Body      | ID del grupo/departamento                                                    |
| personBaseInfo.firstName   | Requerido | String     | Body      | Nombre (máx 255)                                                             |
| personBaseInfo.lastName    | Requerido | String     | Body      | Apellido (máx 255)                                                           |
| personBaseInfo.gender      | Requerido | Integer    | Body      | `0` = femenino, `1` = masculino, `2` = desconocido                          |
| personBaseInfo.phone       | Opcional  | String     | Body      | Teléfono (máx 32)                                                            |
| personBaseInfo.email       | Opcional  | String     | Body      | Correo (máx 64)                                                              |
| personBaseInfo.description | Opcional  | String     | Body      | Descripción (máx 128)                                                        |
| personBaseInfo.startDate   | Requerido | String     | Body      | Fecha de inicio (ISO)                                                        |
| personBaseInfo.endDate     | Requerido | String     | Body      | Fecha de fin (ISO, año ≤ 2037)                                               |
| roomList                   | Requerido | RoomDTO[]  | Body      | Lista de habitaciones a vincular. Ver [RoomDTO](APENDICE-A.md#a3144-roomdto)  |
| roomList[].roomId          | Requerido | String     | Body      | ID de habitación                                                             |
| roomList[].roomNum         | Opcional  | Integer    | Body      | Número de habitación                                                         |
| roomList[].buildId         | Opcional  | String     | Body      | ID del edificio                                                              |
| roomList[].buildName       | Opcional  | String     | Body      | Nombre del edificio                                                          |
| roomList[].areaId          | Opcional  | String     | Body      | ID del área                                                                  |
| roomList[].areaName        | Opcional  | String     | Body      | Nombre del área                                                              |
| roomList[].accountType     | Opcional  | Integer    | Body      | Tipo de cuenta                                                               |

**Ejemplo de Solicitud:**

```json
{
  "allds": ["accessLevel_id_1"],
  "language": "es",
  "personBaseInfo": {
    "personCode": "P001",
    "groupId": "group_root",
    "firstName": "María",
    "lastName": "López",
    "gender": 0,
    "phone": "+521234567890",
    "email": "maria@example.com",
    "startDate": "2024-01-01T00:00:00+08:00",
    "endDate": "2030-12-31T23:59:59+08:00"
  },
  "roomList": [
    { "roomId": "room_101", "buildId": "bld_001", "areaId": "area_001", "accountType": 1 }
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

#### 5.6.5 Editar Residente

`POST /api/hccgw/vims/v1/person/update`

Comparte la misma estructura que `vims/v1/person/add`, pero `personBaseInfo.id` es **requerido**. Si el residente tiene 2 habitaciones, ambas deben ingresarse en la solicitud, o la habitación omitida será eliminada.

**Parámetros de Solicitud:** Idénticos a §5.6.4, pero `personBaseInfo.id` (ID del residente a editar) es requerido.

**Ejemplo de Solicitud:**

```json
{
  "allds": ["accessLevel_id_1"],
  "personBaseInfo": {
    "id": "res_002",
    "personCode": "P001",
    "groupId": "group_root",
    "firstName": "María",
    "lastName": "López Actualizada",
    "gender": 0,
    "phone": "+529876543210",
    "startDate": "2024-01-01T00:00:00+08:00",
    "endDate": "2030-12-31T23:59:59+08:00"
  },
  "roomList": [
    { "roomId": "room_101", "buildId": "bld_001", "areaId": "area_001", "accountType": 1 }
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

#### 5.6.6 Eliminar Residente

`POST /api/hccgw/vims/v1/person/delete`

> **Nota:** Esta API **solo elimina la vinculación entre el residente y la(s) habitación(es)**. Para eliminar completamente a la persona, use `POST /api/hccgw/person/v1/persons/delete`.

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo     | Ubicación | Descripción                          |
| ---------- | --------- | -------- | --------- | ------------------------------------ |
| Token      | Requerido | String   | Header    | Máximo 64 caracteres                 |
| deleteList | Requerido | String[] | Body      | Lista de IDs de residentes a eliminar |

**Ejemplo de Solicitud:**

```json
{
  "deleteList": ["res_002", "res_003"]
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

| Parámetro       | Requerido | Tipo   | Ubicación | Descripción                                                            |
| --------------- | --------- | ------ | --------- | ---------------------------------------------------------------------- |
| Token           | Requerido | String | Header    | Máximo 64 caracteres                                                   |
| id              | Requerido | String | Body      | ID del pase temporal (ID de persona temporal)                          |
| clientLocalTime | Requerido | String | Body      | Hora local del cliente (formato ISO 8601)                              |

**Ejemplo de Solicitud:**

```json
{
  "id": "tempauth_001",
  "clientLocalTime": "2024-01-01T10:00:00+08:00"
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "authCode": "AUTH20240101001",
    "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "expireTime": "2024-01-02T23:59:59+08:00"
  },
  "errorCode": "0"
}
```

---

#### 5.6.8 Buscar Pases Temporales

`POST /api/hccgw/vims/v1/tempauth/list`

**Parámetros de Solicitud:**

| Parámetro                | Requerido | Tipo    | Ubicación | Descripción                                                                |
| ------------------------ | --------- | ------- | --------- | -------------------------------------------------------------------------- |
| Token                    | Requerido | String  | Header    | Máximo 64 caracteres                                                       |
| pageNum                  | Requerido | Integer | Body      | Número de página                                                           |
| pageSize                 | Requerido | Integer | Body      | Tamaño de página                                                           |
| searchRequest            | Opcional  | Object  | Body      | Condición de búsqueda. Ver [TempAuthSearchRequest](APENDICE-A.md#a3155-tempauthsearchrequest) |
| searchRequest.filter     | Opcional  | Object  | Body      | Filtros internos                                                           |
| searchRequest.filter.name | Opcional | String  | Body      | Nombre                                                                     |

**Ejemplo de Solicitud:**

```json
{
  "pageNum": 1,
  "pageSize": 20,
  "searchRequest": {
    "filter": { "name": "" }
  }
}
```

---

#### 5.6.9 Agregar Pase Temporal

`POST /api/hccgw/vims/v1/tempauth/add`

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo     | Ubicación | Descripción                                                                |
| --------------- | --------- | -------- | --------- | -------------------------------------------------------------------------- |
| Token           | Requerido | String   | Header    | Máximo 64 caracteres                                                       |
| name            | Requerido | String   | Body      | Nombre del pase (máx 32)                                                   |
| openCount       | Requerido | Integer  | Body      | Número de aperturas permitidas (rango 1–200)                                |
| startTime       | Requerido | String   | Body      | Inicio de validez (ISO 8601)                                               |
| endTime         | Requerido | String   | Body      | Fin de validez (ISO 8601)                                                  |
| clientLocalTime | Requerido | String   | Body      | Hora local del cliente (ISO 8601)                                          |
| allds           | Opcional  | String[] | Body      | Lista de IDs de nivel de acceso a aplicar al pase temporal                 |

**Ejemplo de Solicitud:**

```json
{
  "name": "Visitante Lunes",
  "openCount": 5,
  "startTime": "2024-01-01T00:00:00+08:00",
  "endTime": "2024-01-07T23:59:59+08:00",
  "clientLocalTime": "2024-01-01T08:00:00+08:00",
  "allds": ["accessLevel_id_1"]
}
```

**Ejemplo de Respuesta:** Devuelve la contraseña y los datos del código QR generado, que se pueden usar para verificación en el dispositivo del nivel de acceso vinculado.

```json
{
  "data": {
    "id": "tempauth_002",
    "password": "1234",
    "qrCodeData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "errorCode": "0"
}
```

> **Nota:** Existen 2 tipos de códigos QR: dinámico y estático. El dinámico solo es válido durante 60 segundos desde su obtención, por lo que se recomienda llamar `POST /api/hccgw/vims/v1/tempauth/get` cada 60 segundos para obtener un QR dinámico válido. Una vez obtenido y usado un nuevo QR dinámico, el anterior se invalida. El QR estático es válido durante todo el período del pase temporal.

---

#### 5.6.10 Editar Pase Temporal

`POST /api/hccgw/vims/v1/tempauth/update`

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo     | Ubicación | Descripción                                       |
| --------------- | --------- | -------- | --------- | ------------------------------------------------- |
| Token           | Requerido | String   | Header    | Máximo 64 caracteres                              |
| id              | Requerido | String   | Body      | ID del pase temporal                              |
| name            | Requerido | String   | Body      | Nombre del pase                                   |
| openCount       | Requerido | Integer  | Body      | Número de aperturas permitidas                    |
| startTime       | Requerido | String   | Body      | Inicio de validez                                 |
| endTime         | Requerido | String   | Body      | Fin de validez                                    |
| clientLocalTime | Requerido | String   | Body      | Hora local del cliente                            |
| allds           | Opcional  | String[] | Body      | Lista de IDs de nivel de acceso                   |

**Ejemplo de Solicitud:**

```json
{
  "id": "tempauth_002",
  "name": "Visitante Editado",
  "openCount": 10,
  "startTime": "2024-01-01T00:00:00+08:00",
  "endTime": "2024-01-14T23:59:59+08:00",
  "clientLocalTime": "2024-01-01T08:00:00+08:00",
  "allds": ["accessLevel_id_1"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.6.11 Eliminar Pase Temporal

`POST /api/hccgw/vims/v1/tempauth/delete`

**Parámetros de Solicitud:**

| Parámetro  | Requerido | Tipo     | Ubicación | Descripción                                  |
| ---------- | --------- | -------- | --------- | -------------------------------------------- |
| Token      | Requerido | String   | Header    | Máximo 64 caracteres                         |
| deleteList | Requerido | String[] | Body      | Lista de IDs de pases temporales a eliminar |

**Ejemplo de Solicitud:**

```json
{
  "deleteList": ["tempauth_002", "tempauth_003"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.6.12 Responder a Llamada de Videoportero

`POST /api/hccgw/devcall/v1/call/receive`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo    | Ubicación | Descripción                                                                  |
| --------- | --------- | ------- | --------- | ---------------------------------------------------------------------------- |
| Token     | Requerido | String  | Header    | Máximo 64 caracteres                                                         |
| recordId  | Requerido | String  | Body      | ID del registro de llamada (máx 64)                                          |
| status    | Requerido | Integer | Body      | Tipo de operación: `1` = contestar, `2` = no contestar, `3` = colgar (tras contestar) |
| userId    | Requerido | String  | Body      | ID de usuario del residente llamado (obtenido de `POST /api/hccgw/platform/v1/users/get`) |

**Ejemplo de Solicitud:**

```json
{
  "recordId": "call_abc123",
  "userId": "user_001",
  "status": "1"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> Para abrir la puerta de forma remota durante una videollamada, use `POST /api/hccgw/acs/v1/remote/control` (sección 5.7.1).

---

### 5.7 Servicios de Control de Acceso

#### 5.7.1 Control Remoto (Abrir Puerta)

`POST /api/hccgw/acs/v1/remote/control`

Abre la puerta de forma remota.

**Parámetros de Solicitud:**

| Parámetro                         | Requerido | Tipo          | Ubicación | Descripción                                                                                       |
| --------------------------------- | --------- | ------------- | --------- | ------------------------------------------------------------------------------------------------- |
| Token                             | Requerido | String        | Header    | Máximo 64 caracteres                                                                              |
| remoteControl                     | Requerido | RemoteControl | Body      | Contenido de la operación. Ver [RemoteControl](APENDICE-A.md#a3138-remotecontrol)                  |
| remoteControl.actionType          | Requerido | Integer       | Body      | Tipo de acción (`1` = abrir)                                                                       |
| remoteControl.elementlist         | Opcional  | Object[]      | Body      | Lista de elementos sobre los que actuar                                                            |
| remoteControl.direction           | Opcional  | Integer       | Body      | Dirección                                                                                          |
| remoteControl.areaId              | Opcional  | String        | Body      | ID del área (control por área)                                                                     |
| remoteControl.depthTraversal      | Opcional  | Integer       | Body      | `1` = aplicar a subáreas                                                                           |

**Ejemplo de Solicitud:**

```json
{
  "remoteControl": {
    "actionType": 1,
    "elementlist": [],
    "direction": 0,
    "areaId": "",
    "depthTraversal": 0
  }
}
```

**Parámetros de Respuesta:**

| Parámetro              | Requerido | Tipo                    | Descripción                                                              |
| ---------------------- | --------- | ----------------------- | ------------------------------------------------------------------------ |
| errorCode              | Requerido | String                  | Código de estado o error                                                 |
| data                   | Requerido | Object                  | Resultado de la operación                                                |
| data.operationResult   | Requerido | RemoteControlResponse[] | Lista de fallos. Si está vacía, la operación tuvo éxito                  |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "operationResult": [
      {
        "elementId": "",
        "elementName": "",
        "areaId": "",
        "areaName": "",
        "errorCode": ""
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.7.2 Obtener Clave de Cifrado Bluetooth del Sistema

`GET /api/hccgw/acs/v1/encryptinfo/get`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción          |
| --------- | --------- | ------ | --------- | -------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres |

**Parámetros de Respuesta:**

| Parámetro        | Requerido | Tipo    | Descripción                                                       |
| ---------------- | --------- | ------- | ----------------------------------------------------------------- |
| errorCode        | Requerido | String  | Código de estado o error                                          |
| data             | Requerido | Object  | Información de cifrado                                            |
| data.encryptType | Requerido | String  | Tipo de cifrado (`AES128_CBC`)                                    |
| data.authData    | Requerido | String  | Información de autenticación (32 bytes en hexadecimal)            |
| data.vector      | Requerido | String  | Vector inicial — IV (32 bytes en hexadecimal)                     |
| data.loopCount   | Requerido | Integer | Veces de iteración al generar la clave de cifrado                 |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "encryptType": "AES128_CBC",
    "authData": "8a7485aa7f209dd5017f2141adff0019",
    "vector": "8a7485aa7f209dd5017f2141adff0019",
    "loopCount": 0
  },
  "errorCode": "0"
}
```

---

#### 5.7.3 Buscar Registros de Pase de Tarjeta

`POST /api/hccgw/acs/v1/event/certificaterecords/search`

Busca registros de pase de tarjeta de control de acceso por página, según tiempo, ID del punto de acceso, tipo de evento y nombre de persona.

**Parámetros de Solicitud:**

| Parámetro                              | Requerido | Tipo    | Ubicación | Descripción                                                              |
| -------------------------------------- | --------- | ------- | --------- | ------------------------------------------------------------------------ |
| Token                                  | Requerido | String  | Header    | Máximo 64 caracteres                                                     |
| pageIndex                              | Opcional  | Integer | Body      | Página actual (predeterminado `1`)                                       |
| pageSize                               | Opcional  | Integer | Body      | Registros por página (1–200)                                              |
| searchCriteria                         | Opcional  | Object  | Body      | Condiciones de búsqueda                                                  |
| searchCriteria.beginTime               | Opcional  | String  | Body      | Inicio (ISO, p. ej. `2023-10-21T11:08:23+08:00`)                          |
| searchCriteria.endTime                 | Opcional  | String  | Body      | Fin (ISO)                                                                |
| searchCriteria.type                    | Opcional  | Integer | Body      | Tipo de tiempo: `0` = cliente (predeterminado), `1` = dispositivo, `2` = tiempo de importación de alarma a BD |
| searchCriteria.eventTypes              | Opcional  | String  | Body      | Tipos de evento separados por coma                                       |
| searchCriteria.swipeAuthResult         | Opcional  | Integer | Body      | Resultado: `0` = todos, `1` = éxito, `2` = falla                          |
| searchCriteria.elementIDs              | Opcional  | String  | Body      | IDs de puntos de acceso, separados por coma                              |
| searchCriteria.searchType              | Opcional  | Integer | Body      | `0` = por persona (predeterminado), `1` = por número de tarjeta          |
| searchCriteria.personCondition         | Opcional  | Object  | Body      | Condición de búsqueda por persona (válida cuando `searchType=0`)         |
| searchCriteria.personCondition.personIds | Opcional | String[] | Body    | IDs de personas                                                           |
| searchCriteria.personCondition.personName | Opcional | String | Body     | Nombre de persona                                                        |
| searchCriteria.cardNumber              | Opcional  | String  | Body      | Número de tarjeta (válido cuando `searchType=1`)                          |
| searchCriteria.temperatureStatus       | Opcional  | Integer | Body      | Estado de temperatura: `0` = todos, `1` = normal, `2` = excepción, `3` = desconocido |
| searchCriteria.maskStatus              | Opcional  | Integer | Body      | Estado de cubrebocas: `0` = todos, `1` = desconocido, `2` = sin cubrebocas, `3` = con cubrebocas |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "searchCriteria": {
    "beginTime": "2024-01-01T00:00:00+08:00",
    "endTime": "2024-01-31T23:59:59+08:00",
    "type": 0,
    "eventTypes": "",
    "swipeAuthResult": 0,
    "searchType": 0,
    "personCondition": { "personIds": [], "personName": "" }
  }
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
        "elementID": "door_001",
        "accessTime": "2024-01-15T08:30:00+08:00",
        "cardNo": "1234567890",
        "swipeAuthResult": 1
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.7.4 Buscar Lista de Niveles de Acceso

`POST /api/hccgw/acspm/v1/accesslevel/list`

**Parámetros de Solicitud:**

| Parámetro                                       | Requerido | Tipo                       | Ubicación | Descripción                                                                  |
| ----------------------------------------------- | --------- | -------------------------- | --------- | ---------------------------------------------------------------------------- |
| Token                                           | Requerido | String                     | Header    | Máximo 64 caracteres                                                         |
| accessLevelSearchRequest                        | Requerido | AccessLevelSearchRequest   | Body      | Solicitud de búsqueda. Ver [AccessLevelSearchRequest](APENDICE-A.md#a36-accesslevelsearchrequest) |
| accessLevelSearchRequest.pageIndex              | Requerido | Integer                    | Body      | Número de página                                                             |
| accessLevelSearchRequest.pageSize               | Requerido | Integer                    | Body      | Registros por página                                                         |
| accessLevelSearchRequest.searchCriteria         | Opcional  | AccessLevelSearchCriteria  | Body      | Filtros internos                                                             |
| accessLevelSearchRequest.searchCriteria.accessLevelName | Opcional | String          | Body      | Filtrar por nombre del nivel de acceso                                       |
| accessLevelSearchRequest.searchCriteria.associateResInfoList | Opcional | AssociateResInfo[] | Body | Filtrar por recursos vinculados                                          |

**Ejemplo de Solicitud:**

```json
{
  "accessLevelSearchRequest": {
    "pageIndex": 1,
    "pageSize": 20,
    "searchCriteria": {
      "accessLevelName": "",
      "associateResInfoList": []
    }
  }
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

#### 5.7.5 Obtener Detalle de Aplicación de Nivel de Acceso por Persona

`POST /api/hccgw/acspm/v1/maintain/overview/person/{id}/elementdetail`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción                                                                  |
| ------------- | --------- | ------- | --------- | ---------------------------------------------------------------------------- |
| Token         | Requerido | String  | Header    | Máximo 64 caracteres                                                         |
| personId      | Requerido | String  | URL       | ID de la persona (parámetro de ruta `{id}`)                                  |
| returnSuccess | Opcional  | Boolean | Body      | Indica si se devuelve también la información de aplicaciones exitosas (predeterminado `false`) |

**Ejemplo de Solicitud:**

```json
{
  "returnSuccess": false
}
```

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

#### 5.7.6 Asignar Nivel de Acceso a Persona(s)

`POST /api/hccgw/acspm/v1/accesslevel/person/add`

**Parámetros de Solicitud:**

| Parámetro                              | Requerido | Tipo     | Ubicación | Descripción                                              |
| -------------------------------------- | --------- | -------- | --------- | -------------------------------------------------------- |
| Token                                  | Requerido | String   | Header    | Máximo 64 caracteres                                     |
| personList                             | Requerido | Object[] | Body      | Lista de asignaciones por persona                        |
| personList[].personId                  | Opcional  | String   | Body      | ID de la persona                                         |
| personList[].accessLevelIdList         | Opcional  | String[] | Body      | Lista de IDs de nivel de acceso a asignar                |

**Ejemplo de Solicitud:**

```json
{
  "personList": [
    {
      "personId": "person_001",
      "accessLevelIdList": ["level_001", "level_002"]
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

#### 5.7.7 Quitar Nivel de Acceso de Persona(s)

`POST /api/hccgw/acspm/v1/accesslevel/person/delete`

**Parámetros de Solicitud:**

| Parámetro                              | Requerido | Tipo     | Ubicación | Descripción                                                                                  |
| -------------------------------------- | --------- | -------- | --------- | -------------------------------------------------------------------------------------------- |
| Token                                  | Requerido | String   | Header    | Máximo 64 caracteres                                                                         |
| personList                             | Requerido | Object[] | Body      | Lista de operaciones por persona                                                             |
| personList[].personId                  | Opcional  | String   | Body      | ID de la persona                                                                             |
| personList[].accessLevelIdList         | Opcional  | String[] | Body      | Lista de IDs de nivel de acceso a quitar                                                     |
| personList[].deleteAll                 | Opcional  | Boolean  | Body      | `true` = quitar **todos** los niveles asignados (en ese caso `accessLevelIdList` se ignora) |

**Ejemplo de Solicitud:**

```json
{
  "personList": [
    {
      "personId": "person_001",
      "accessLevelIdList": ["level_001"],
      "deleteAll": false
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

#### 5.7.8 Modificar Nivel de Acceso de Persona(s)

`POST /api/hccgw/acspm/v1/accesslevel/person/modify`

> El backend compara la lista enviada contra los datos históricos y agrega/elimina niveles automáticamente para sincronizar.

**Parámetros de Solicitud:**

| Parámetro                              | Requerido | Tipo     | Ubicación | Descripción                                                                              |
| -------------------------------------- | --------- | -------- | --------- | ---------------------------------------------------------------------------------------- |
| Token                                  | Requerido | String   | Header    | Máximo 64 caracteres                                                                     |
| personList                             | Requerido | Object[] | Body      | Lista de operaciones por persona                                                         |
| personList[].personId                  | Opcional  | String   | Body      | ID de la persona                                                                         |
| personList[].accessLevelIdList         | Opcional  | String[] | Body      | Lista **completa** de niveles que la persona debe tener (el backend ajusta la diferencia) |
| personList[].deleteAll                 | Opcional  | Boolean  | Body      | `true` = quitar todos los niveles existentes                                              |

**Ejemplo de Solicitud:**

```json
{
  "personList": [
    {
      "personId": "person_001",
      "accessLevelIdList": ["level_002", "level_003"],
      "deleteAll": false
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

### 5.8 Servicios Relacionados con Personas

#### 5.8.1 Buscar Grupos/Departamentos

`POST /api/hccgw/person/v1/groups/search`

> Esta API **no** está paginada. Devuelve todos los grupos que coinciden con los criterios.

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo     | Ubicación | Descripción                                                                          |
| --------------- | --------- | -------- | --------- | ------------------------------------------------------------------------------------ |
| Token           | Requerido | String   | Header    | Máximo 64 caracteres                                                                 |
| parentGroupId   | Opcional  | String   | Body      | ID del grupo padre. Si vacío, busca desde la raíz                                    |
| groupName       | Opcional  | String   | Body      | Nombre de grupo (búsqueda difusa, máx 64)                                            |
| depthTraversal  | Opcional  | Boolean  | Body      | `true` = recorrer en profundidad (incluye subgrupos)                                 |
| groupIdList     | Opcional  | String[] | Body      | Lista de IDs de grupos específicos                                                   |

**Ejemplo de Solicitud:**

```json
{
  "parentGroupId": "root",
  "groupName": "",
  "depthTraversal": true,
  "groupIdList": []
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "groupList": [
      { "groupId": "group_001", "groupName": "Empleados", "parentId": "root", "personCount": 15 }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.8.2 Agregar Departamento

`POST /api/hccgw/person/v1/groups/add`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo   | Ubicación | Descripción                                          |
| ------------ | --------- | ------ | --------- | ---------------------------------------------------- |
| Token        | Requerido | String | Header    | Máximo 64 caracteres                                 |
| description  | Opcional  | String | Body      | Descripción del grupo (máx 128)                      |
| groupName    | Requerido | String | Body      | Nombre del grupo (máx 64)                            |
| areaId       | Opcional  | String | Body      | ID del área asociada (máx 64)                        |

**Ejemplo de Solicitud:**

```json
{
  "groupName": "Seguridad",
  "description": "Personal de seguridad y vigilancia",
  "areaId": "area_001"
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

#### 5.8.3 Editar Departamento

`POST /api/hccgw/person/v1/groups/update`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo   | Ubicación | Descripción                                          |
| ------------ | --------- | ------ | --------- | ---------------------------------------------------- |
| Token        | Requerido | String | Header    | Máximo 64 caracteres                                 |
| groupId      | Requerido | String | Body      | ID del grupo                                         |
| description  | Opcional  | String | Body      | Descripción (máx 128)                                |
| groupName    | Opcional  | String | Body      | Nuevo nombre (máx 64)                                |
| areaId       | Opcional  | String | Body      | Nuevo ID de área                                     |
| parentId     | Opcional  | String | Body      | Nuevo grupo padre (para mover el grupo)              |

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

#### 5.8.4 Eliminar Departamento

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

> Los parámetros van **planos en el cuerpo**, no envueltos en un objeto `personInfo`.

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo    | Ubicación | Descripción                                                                          |
| ------------ | --------- | ------- | --------- | ------------------------------------------------------------------------------------ |
| Token        | Requerido | String  | Header    | Máximo 64 caracteres                                                                 |
| groupId      | Requerido | String  | Body      | ID del grupo/departamento                                                            |
| personCode   | Requerido | String  | Body      | Código de persona (1–16 caracteres)                                                  |
| firstName    | Requerido | String  | Body      | Nombre (máx 255)                                                                     |
| lastName     | Requerido | String  | Body      | Apellido (máx 255)                                                                   |
| gender       | Requerido | Integer | Body      | `0` = femenino, `1` = masculino, `2` = desconocido                                  |
| phone        | Opcional  | String  | Body      | Teléfono (máx 32)                                                                    |
| email        | Opcional  | String  | Body      | Correo (máx 64)                                                                      |
| description  | Opcional  | String  | Body      | Descripción (máx 128)                                                                |
| startDate    | Requerido | String  | Body      | Fecha de inicio (ISO 8601)                                                           |
| endDate      | Requerido | String  | Body      | Fecha de fin (ISO 8601, año ≤ 2037)                                                  |

**Ejemplo de Solicitud:**

```json
{
  "groupId": "group_001",
  "personCode": "EMP001",
  "firstName": "Carlos",
  "lastName": "Ramírez",
  "gender": 1,
  "phone": "+521234567890",
  "email": "carlos@example.com",
  "startDate": "2024-01-01T00:00:00+08:00",
  "endDate": "2030-12-31T23:59:59+08:00"
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

#### 5.8.6 Editar Información Básica de Persona

`POST /api/hccgw/person/v1/persons/update`

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo    | Ubicación | Descripción                                          |
| ------------ | --------- | ------- | --------- | ---------------------------------------------------- |
| Token        | Requerido | String  | Header    | Máximo 64 caracteres                                 |
| personId     | Requerido | String  | Body      | ID de la persona                                     |
| groupId      | Requerido | String  | Body      | ID del grupo/departamento                            |
| personCode   | Requerido | String  | Body      | Código de persona (1–16)                              |
| firstName    | Requerido | String  | Body      | Nombre                                               |
| lastName     | Requerido | String  | Body      | Apellido                                             |
| gender       | Requerido | Integer | Body      | `0` = femenino, `1` = masculino, `2` = desconocido   |
| startDate    | Requerido | String  | Body      | Fecha de inicio                                      |
| endDate      | Requerido | String  | Body      | Fecha de fin                                         |
| phone        | Opcional  | String  | Body      | Teléfono                                             |
| email        | Opcional  | String  | Body      | Correo                                               |
| description  | Opcional  | String  | Body      | Descripción                                          |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "groupId": "group_001",
  "personCode": "EMP001",
  "firstName": "Carlos",
  "lastName": "Ramírez",
  "gender": 1,
  "startDate": "2024-01-01T00:00:00+08:00",
  "endDate": "2030-12-31T23:59:59+08:00",
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

#### 5.8.7 Actualizar Foto Facial de Persona

`POST /api/hccgw/person/v1/persons/photo`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                                                              |
| --------- | --------- | ------ | --------- | ------------------------------------------------------------------------ |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                                                     |
| personId  | Requerido | String | Body      | ID de la persona                                                         |
| photoData | Requerido | String | Body      | Imagen en Base64 (se comprime automáticamente si supera 200 KB)          |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "photoData": "/9j/4AAQSkZJRgABAQAA..."
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

> **Nota:** La información de huella **debe** recolectarse desde un dispositivo.

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo   | Ubicación | Descripción                                                       |
| ------------ | --------- | ------ | --------- | ----------------------------------------------------------------- |
| Token        | Requerido | String | Header    | Máximo 64 caracteres                                              |
| deviceSerial | Requerido | String | Body      | Número de serie del dispositivo de recolección                    |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "FK4599010"
}
```

**Parámetros de Respuesta:**

| Parámetro         | Requerido | Tipo    | Descripción                                          |
| ----------------- | --------- | ------- | ---------------------------------------------------- |
| errorCode         | Requerido | String  | Código de estado o error                             |
| data              | Requerido | Object  | Datos recolectados                                   |
| data.fingerData   | Requerido | String  | Datos de la huella recolectada                       |
| data.fingerQuality | Requerido | Integer | Calidad de la huella (1–100)                         |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "fingerData": "base64encodeddata...",
    "fingerQuality": 85
  },
  "errorCode": "0"
}
```

---

#### 5.8.9 Actualizar Información de Huellas de Persona

`POST /api/hccgw/person/v1/persons/updatefingers`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo     | Ubicación | Descripción                                                  |
| ------------------ | --------- | -------- | --------- | ------------------------------------------------------------ |
| Token              | Requerido | String   | Header    | Máximo 64 caracteres                                         |
| personId           | Requerido | String   | Body      | ID de la persona                                             |
| fingerList         | Opcional  | Object[] | Body      | Lista de huellas dactilares                                  |
| fingerList[].id    | Opcional  | String   | Body      | ID de huella (para edición). Si no se especifica, se agrega   |
| fingerList[].name  | Requerido | String   | Body      | Nombre/etiqueta de la huella (máx 32)                         |
| fingerList[].data  | Requerido | String   | Body      | Datos hexadecimales de la huella (máx 1024)                   |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "fingerList": [
    { "name": "Indice derecho", "data": "A1B2C3D4..." }
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

> Para tarjetas sin número visible, la información de tarjeta debe recolectarse desde un dispositivo. Para tarjetas con número visible, no es necesario recolectarla.

**Parámetros de Solicitud:**

| Parámetro    | Requerido | Tipo   | Ubicación | Descripción                                          |
| ------------ | --------- | ------ | --------- | ---------------------------------------------------- |
| Token        | Requerido | String | Header    | Máximo 64 caracteres                                 |
| deviceSerial | Requerido | String | Body      | Número de serie del dispositivo de recolección       |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "FK4599010"
}
```

**Parámetros de Respuesta:**

| Parámetro     | Requerido | Tipo   | Descripción                       |
| ------------- | --------- | ------ | --------------------------------- |
| errorCode     | Requerido | String | Código de estado o error          |
| data          | Requerido | Object | Datos recolectados                |
| data.cardNo   | Requerido | String | Número de tarjeta recolectado     |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "cardNo": "1234567890"
  },
  "errorCode": "0"
}
```

---

#### 5.8.11 Actualizar Información de Tarjetas de Persona

`POST /api/hccgw/person/v1/persons/updatecards`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo     | Ubicación | Descripción                                                       |
| ------------------ | --------- | -------- | --------- | ----------------------------------------------------------------- |
| Token              | Requerido | String   | Header    | Máximo 64 caracteres                                              |
| personId           | Requerido | String   | Body      | ID de la persona                                                  |
| cardList           | Opcional  | Object[] | Body      | Lista de tarjetas                                                 |
| cardList[].id      | Opcional  | String   | Body      | ID de tarjeta (para edición). Si no se especifica, se agrega       |
| cardList[].cardNo  | Requerido | String   | Body      | Número de tarjeta (máx 20, no duplicado)                          |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "cardList": [
    { "cardNo": "1234567890" }
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

`POST /api/hccgw/person/v1/persons/updatepincode`

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

#### 5.8.13 Ver Información de una Persona

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

**Parámetros de Respuesta:**

| Parámetro            | Requerido | Tipo     | Descripción                                                  |
| -------------------- | --------- | -------- | ------------------------------------------------------------ |
| errorCode            | Requerido | String   | Código de estado o error                                     |
| data                 | Requerido | Object   | Información de la persona                                    |
| data.personInfo      | Requerido | PersonInfo | Información básica de la persona                           |
| data.cardList        | Opcional  | Object[] | Lista de tarjetas vinculadas (con `id`, `cardNo`)             |
| data.fingerList      | Opcional  | Object[] | Lista de huellas (con `id`, `name`, `data`)                   |
| data.pinCode         | Opcional  | String   | Código PIN                                                   |

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
    },
    "cardList": [{ "id": "card_1", "cardNo": "1234567890" }],
    "fingerList": [{ "id": "finger_1", "name": "Indice derecho", "data": "A1B2C3..." }],
    "pinCode": "1234"
  },
  "errorCode": "0"
}
```

---

#### 5.8.14 Eliminar Persona

`POST /api/hccgw/person/v1/persons/delete`

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción                                                                |
| --------- | --------- | ------ | --------- | -------------------------------------------------------------------------- |
| Token     | Requerido | String | Header    | Máximo 64 caracteres                                                       |
| personId  | Requerido | String | Body      | IDs de personas (múltiples separados por **coma** dentro de un solo string) |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100,person_101"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.8.15 Agregar Persona Rápidamente (con foto + PIN)

`POST /api/hccgw/person/v1/persons/quick/add`

> Agrega una persona y aplica su foto facial y código PIN al dispositivo en una sola llamada. **La información de tarjeta y huella debe recolectarse por separado; la aplicación rápida no las soporta.**

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo            | Ubicación | Descripción                                                                  |
| ------------------ | --------- | --------------- | --------- | ---------------------------------------------------------------------------- |
| Token              | Requerido | String          | Header    | Máximo 64 caracteres                                                         |
| personInfo         | Requerido | PersonBaseInfo  | Body      | Información básica de la persona (ver [PersonBaseInfo](APENDICE-A.md#a3121-personbaseinfo1)) |
| aceessLevelList    | Opcional  | String[]        | Body      | Lista de IDs de nivel de acceso a aplicar (nótese la errata oficial `aceess` con doble `e` minúscula) |
| pinCode            | Opcional  | String          | Body      | Código PIN (4–8 dígitos)                                                     |
| photoData          | Opcional  | String          | Body      | Foto facial en Base64                                                        |

**Ejemplo de Solicitud:**

```json
{
  "personInfo": {
    "firstName": "Ana",
    "lastName": "Torres",
    "groupId": "group_001",
    "personCode": "EMP002",
    "gender": 0,
    "startDate": "2024-01-01T00:00:00+08:00",
    "endDate": "2030-12-31T23:59:59+08:00"
  },
  "aceessLevelList": ["level_001"],
  "pinCode": "5678",
  "photoData": "/9j/4AAQSkZJRgABAQAA..."
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

#### 5.8.16 Buscar Lista de Personas

`POST /api/hccgw/person/v1/persons/list`

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo     | Ubicación | Descripción                                          |
| --------------- | --------- | -------- | --------- | ---------------------------------------------------- |
| Token           | Requerido | String   | Header    | Máximo 64 caracteres                                 |
| pageIndex       | Requerido | Integer  | Body      | Página actual (≥ 1)                                  |
| pageSize        | Requerido | Integer  | Body      | Registros por página (1–100)                          |
| filter          | Opcional  | Object   | Body      | Filtros internos                                     |
| filter.name     | Opcional  | String   | Body      | Filtrar por nombre                                   |
| filter.email    | Opcional  | String   | Body      | Filtrar por correo                                   |
| filter.phone    | Opcional  | String   | Body      | Filtrar por teléfono                                 |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "filter": { "name": "Carlos", "email": "", "phone": "" }
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

#### 5.8.17 Obtener Código QR de Persona

`POST /api/hccgw/person/v1/persons/qrcode`

> **Nota:** Existen 2 tipos de códigos QR: dinámico y estático. El QR dinámico solo es válido 60 segundos desde su obtención, por lo que se recomienda volver a llamar a esta API (o `POST /api/hccgw/vims/v1/tempauth/get`) cada 60 segundos. Una vez obtenido y usado un nuevo QR dinámico, el anterior se invalida. El QR estático es válido durante todo el período del pase.

**Parámetros de Solicitud:**

| Parámetro       | Requerido | Tipo   | Ubicación | Descripción                                        |
| --------------- | --------- | ------ | --------- | -------------------------------------------------- |
| Token           | Requerido | String | Header    | Máximo 64 caracteres                               |
| personId        | Requerido | String | Body      | ID de la persona                                   |
| clientLocalTime | Requerido | String | Body      | Hora local del cliente (ISO 8601)                  |

**Ejemplo de Solicitud:**

```json
{
  "personId": "person_100",
  "clientLocalTime": "2024-01-01T10:00:00+08:00"
}
```

**Parámetros de Respuesta:**

| Parámetro       | Requerido | Tipo   | Descripción                                                  |
| --------------- | --------- | ------ | ------------------------------------------------------------ |
| errorCode       | Requerido | String | Código de estado o error                                     |
| data            | Requerido | Object | Datos del QR                                                 |
| data.qrCodeData | Requerido | String | Imagen del código QR codificada en Base64                    |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "qrCodeData": "iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "errorCode": "0"
}
```


---

### 5.9 Servicios de Monitoreo a Bordo

#### 5.9.1 Buscar Conductores en Lote

`POST /api/hccgw/vehicle/v1/driver/batchquery`

**Parámetros de Solicitud:**

| Parámetro             | Requerido | Tipo     | Ubicación | Descripción                                                                  |
| --------------------- | --------- | -------- | --------- | ---------------------------------------------------------------------------- |
| Token                 | Requerido | String   | Header    | Máximo 64 caracteres                                                         |
| groupId               | Opcional  | String   | Body      | Filtrar por grupo de conductores                                             |
| driverIds             | Opcional  | String[] | Body      | Lista de IDs de conductores                                                  |
| distributionStatus    | Opcional  | Integer  | Body      | Estado de distribución de la foto facial                                     |
| fuzzySearch           | Opcional  | String   | Body      | Búsqueda difusa por nombre                                                   |
| relatedVehicle        | Opcional  | Integer  | Body      | `null`/`-1` = todos, `1` = sin vehículo vinculado, `2` = con vehículo vinculado |
| pageIndex             | Requerido | Integer  | Body      | Página actual (≥ 1)                                                          |
| pageSize              | Requerido | Integer  | Body      | Registros por página (1–500)                                                  |

**Ejemplo de Solicitud:**

```json
{
  "pageIndex": 1,
  "pageSize": 20,
  "driverIds": ["driver_001", "driver_002"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "totalCount": 2,
    "pageIndex": 1,
    "pageSize": 20,
    "driverList": [
      {
        "driverId": "driver_001",
        "firstName": "Pedro",
        "lastName": "González",
        "driverCode": "DRV001",
        "phone": "+521234567890",
        "groupId": "driverGroup_001"
      }
    ]
  },
  "errorCode": "0"
}
```

---

#### 5.9.2 Agregar Conductor

`POST /api/hccgw/vehicle/v1/driver/add`

**Parámetros de Solicitud:**

| Parámetro                       | Requerido | Tipo              | Ubicación | Descripción                                                                  |
| ------------------------------- | --------- | ----------------- | --------- | ---------------------------------------------------------------------------- |
| Token                           | Requerido | String            | Header    | Máximo 64 caracteres                                                         |
| firstName                       | Req./Opt. | String            | Body      | Nombre (uno de `firstName`/`lastName` requerido)                              |
| lastName                        | Req./Opt. | String            | Body      | Apellido                                                                     |
| driverCode                      | Requerido | String            | Body      | Código de conductor                                                          |
| gender                          | Requerido | Integer           | Body      | `0` = desconocido, `1` = masculino, `2` = femenino                          |
| groupId                         | Requerido | String            | Body      | ID del grupo de conductores                                                  |
| phone                           | Requerido | String            | Body      | Teléfono                                                                     |
| email                           | Requerido | String            | Body      | Correo electrónico                                                           |
| description                     | Requerido | String            | Body      | Descripción                                                                  |
| relateVehicleIds                | Requerido | String[]          | Body      | IDs de vehículos vinculados (hasta 100)                                       |
| driverLicenseInfo               | Requerido | DriverLicenseInfo | Body      | Información de licencia (ver [DriverLicenseInfo](APENDICE-A.md#a386-driverlicenseinfo)) |
| driverLicenseInfo.licenseNo     | Requerido | String            | Body      | Número de licencia                                                           |
| driverLicenseInfo.validTime     | Requerido | String            | Body      | Fecha de vencimiento                                                         |
| driverLicenseInfo.imageData     | Requerido | String            | Body      | Imagen de la licencia en Base64                                              |
| photoData                       | Requerido | String            | Body      | Foto facial en Base64 (máx 5 MB)                                             |

**Ejemplo de Solicitud:**

```json
{
  "firstName": "Pedro",
  "lastName": "González",
  "driverCode": "DRV001",
  "gender": 1,
  "groupId": "driverGroup_001",
  "phone": "+521234567890",
  "email": "pedro@example.com",
  "description": "Conductor titular",
  "relateVehicleIds": ["vehicle_001"],
  "driverLicenseInfo": {
    "licenseNo": "LIC123456",
    "validTime": "2026-12-31",
    "imageData": "/9j/4AAQSkZJRgABAQAA..."
  },
  "photoData": "/9j/4AAQSkZJRgABAQAA..."
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

#### 5.9.3 Editar Conductor

`POST /api/hccgw/vehicle/v1/driver/update`

**Parámetros de Solicitud:** Todos los siguientes son **requeridos** en el PDF — debe enviarse el conjunto completo:

| Parámetro          | Requerido | Tipo              | Ubicación | Descripción                                          |
| ------------------ | --------- | ----------------- | --------- | ---------------------------------------------------- |
| Token              | Requerido | String            | Header    | Máximo 64 caracteres                                 |
| driverId           | Requerido | String            | Body      | ID del conductor                                     |
| firstName          | Requerido | String            | Body      | Nombre                                               |
| lastName           | Requerido | String            | Body      | Apellido                                             |
| driverCode         | Requerido | String            | Body      | Código de conductor                                  |
| gender             | Requerido | Integer           | Body      | `0` = desconocido, `1` = masculino, `2` = femenino   |
| groupId            | Requerido | String            | Body      | ID del grupo                                         |
| phone              | Requerido | String            | Body      | Teléfono                                             |
| email              | Requerido | String            | Body      | Correo                                               |
| description        | Requerido | String            | Body      | Descripción                                          |
| relateVehicleIds   | Requerido | String[]          | Body      | IDs de vehículos vinculados                          |
| driverLicenseInfo  | Requerido | DriverLicenseInfo | Body      | Información de licencia                              |
| photoData          | Requerido | String            | Body      | Foto facial en Base64                                |

**Ejemplo de Solicitud:**

```json
{
  "driverId": "driver_001",
  "firstName": "Pedro",
  "lastName": "González",
  "driverCode": "DRV001",
  "gender": 1,
  "groupId": "driverGroup_001",
  "phone": "+529876543210",
  "email": "pedro@example.com",
  "description": "Conductor titular",
  "relateVehicleIds": ["vehicle_001"],
  "driverLicenseInfo": { "licenseNo": "LIC123456", "validTime": "2026-12-31", "imageData": "..." },
  "photoData": "..."
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

#### 5.9.5 Buscar Grupos de Conductores en Lote

`POST /api/hccgw/vehicle/v1/driverGroup/batchquery`

> Si `driverGroupIdList` es nulo o vacío, devuelve **todos** los grupos.

**Parámetros de Solicitud:**

| Parámetro         | Requerido | Tipo     | Ubicación | Descripción                                                                |
| ----------------- | --------- | -------- | --------- | -------------------------------------------------------------------------- |
| Token             | Requerido | String   | Header    | Máximo 64 caracteres                                                       |
| driverGroupIdList | Opcional  | String[] | Body      | Lista de IDs de grupos. Si está vacía/nula, incluye todos los grupos       |

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
        "overtimeDuration": "00:00",
        "clockInDate": "2024/01/15",
        "clockInTime": "08:55",
        "clockInSource": "Tarjeta",
        "clockInDevice": "Lector Entrada",
        "clockInArea": "Lobby",
        "clockOutDate": "2024/01/15",
        "clockOutTime": "18:02",
        "clockOutSource": "Tarjeta",
        "clockOutDevice": "Lector Salida",
        "clockOutArea": "Lobby",
        "breakDuration": "01:00",
        "leaveDuration": "00:00",
        "workdayOvertimeDuration": "00:30",
        "weekendOvertimeDuration": "00:00"
      }
    ]
  }
}
```

> **Nota:** Los campos `checkIn*/checkOut*` reflejan el resumen agregado del periodo (entrada/salida según el turno asignado). Los campos `clockIn*/clockOut*` reflejan el evento físico de marcaje (tarjeta, biométrico) registrado por el dispositivo.

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
| country        | Opcional  | Integer   | Body      | Código de país/región. Ver [Apéndice A.1.8](APENDICE-A.md#a18-código-de-paísregión) |
| nameListId     | Opcional  | String    | Body      | ID de la lista de nombres a filtrar                 |
| pageSize       | Opcional  | Integer   | Body      | Registros por página (predeterminado: 20)            |
| searchAfter    | Opcional  | Object[]  | Body      | Paginación: usar `nextSearchAfter` de la respuesta   |

> **Nota:** El rango de búsqueda de `startTime`/`endTime` soportado se especifica en la hoja de datos (datasheet) del producto.

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
        "direction": 1,
        "country": 0,
        "nameListId": "nameListId_4f56745564be",
        "nameListName": "Lista Empleados",
        "personPhone": "+521234567890",
        "dateTimeUTC": "2024-08-21T01:30:00Z",
        "timeDiff": 28800
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

> **Notas:**
>
> - Solo se permite una configuración de Webhook por cuenta.
> - La URL de callback **debe soportar HTTPS**.
> - **Cuando se agotan los reintentos, los mensajes se descartan y se conservan durante 1 mes.** Los integradores pueden contactar al soporte técnico para reenviar los mensajes válidos.
> - Consulte [4.17 Envío de Mensajes por Webhook](#417-envío-de-mensajes-por-webhook) para el proceso detallado de configuración de la firma con clave secreta.

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
| accessLevel.timeSchedule.id     | Requerido | String   | Body      | ID de la plantilla de horario (máximo 18 caracteres) |
| accessLevel.associateResList    | Requerido | Object[] | Body      | Lista de recursos vinculados                   |
| accessLevel.associateResList.id | Requerido | String   | Body      | ID del recurso (puerta) a vincular (máximo 64 caracteres) |

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
      ],
      "usageType": 1
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

