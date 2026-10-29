# Hik-Partner Pro (HPP) — OpenAPI V2.15.500

> Versión del documento: V2.15.500 — Septiembre 2026  
> Producto: Hik-Partner Pro (antes Hik-ProConnect) · Gateway: `/api/hpcgw/` · Token: `https://api.hik-partner.com`

Hik-Partner Pro es la plataforma de **instalador / partner** de Hikvision: agrupa instalaciones (**sitios**), sus dispositivos, la recepción de alarmas (MQ o Webhook), los servicios ARC, hot spare, audio de IP Speaker y el reenvío transparente ISAPI/OTAP. No es Hik-Connect for Teams (HCT): el prefijo de las rutas es `hpcgw`, no `hccgw`.

---

## Información Legal

- Este documento incluye instrucciones para el uso y gestión del Producto. Todas las imágenes, gráficos, ilustraciones e información son únicamente para fines descriptivos y explicativos. Hikvision no otorga garantías, expresas ni implícitas, salvo que se acuerde lo contrario por escrito.
- Ninguna parte de la guía original puede ser extractada, copiada, traducida ni modificada, total o parcialmente, por ningún medio sin autorización escrita de Hikvision.
- **AVISO LEGAL:** El producto se proporciona "TAL CUAL" y "CON TODOS SUS DEFECTOS Y ERRORES". En ningún caso Hikvision ni SYSCOM serán responsables de daños especiales, consecuentes, incidentales o indirectos.
- Usted es responsable de usar este producto conforme a la legislación aplicable y de manera que no infrinja los derechos de terceros.

> **Notas:**
> - Esta es una traducción técnica al español neutro de la guía oficial *Hik-Partner Pro OpenAPI Developer Guide V2.15.500* (2026-09-04), preparada para integradores SYSCOM. Ante cualquier discrepancia prevalece el PDF en [docs/](./docs/).
> - Las incoherencias del PDF (tabla contra ejemplo, erratas en nombres de campo, JSON inválido) se documentan en bloques de notas junto a cada API; no se corrigen en silencio.
> - La subsección [4.4.1](#441-alta-en-línea-de-su-empresa-en-la-lista-arc-de-hik-partner-pro) proviene de una infografía de Hikvision y la sección [4.11](#411-flujos-de-referencia-del-laboratorio-syscom) del laboratorio SYSCOM; ninguna de las dos está en el PDF.

---

## Demos Disponibles

| Demo | Descripción | Estado |
| ---- | ----------- | ------ |
| [OpenAPI Lab + Torre de control](./demos/OpenAPI-Lab/README.md) | Laboratorio Next.js: prueba de los endpoints REST 2.15.500 y panel operativo por sitio (inventario, salud, MQ, evidencia, exportación) | ✅ Disponible |

---

## Contexto para agentes de IA

Además de este README, la plataforma incluye dos archivos pensados para que un modelo de lenguaje consuma la API sin inventar endpoints. Siguen la convención [llms.txt](https://llmstxt.org/) y se dividen en enrutador y referencia:

| Archivo | Tamaño | Para qué sirve |
| ------- | ------ | -------------- |
| [llms.txt](./llms.txt) | ~21 KB | Enrutador de capacidades: reglas críticas, dominios, flujo de autenticación, 12 áreas de capacidad y reglas de decisión |
| [llms-full.txt](./llms-full.txt) | ~216 KB | Referencia completa: los 63 endpoints y las 11 sub-APIs OTAP con parámetros y ejemplos, aplicaciones típicas y apéndices |

> **Notas:**
> - Ambos archivos están en inglés, con los identificadores (rutas, campos, enums) sin traducir, igual que los de Hik-Connect Team y TrackSolid Pro. Se derivan del mismo PDF que este README.

---

## Tabla de Contenidos

- [Capítulo 1 — Descripción General](#capítulo-1--descripción-general)
  - [1.1 Introducción](#11-introducción)
  - [1.2 Capacidades Abiertas](#12-capacidades-abiertas)
  - [1.3 Términos y Definiciones](#13-términos-y-definiciones)
  - [1.4 Historial de Actualizaciones](#14-historial-de-actualizaciones)
  - [1.5 Relación con otras plataformas HIKVISION](#15-relación-con-otras-plataformas-hikvision)
  - [1.6 Fuera del alcance de esta OpenAPI](#16-fuera-del-alcance-de-esta-openapi)
- [Capítulo 2 — Primeros Pasos](#capítulo-2--primeros-pasos)
  - [Paso 1 — Solicitar una API Key](#paso-1--solicitar-una-api-key)
  - [Paso 2 — Obtener el token](#paso-2--obtener-el-token)
  - [Paso 3 — Llamar a las demás APIs](#paso-3--llamar-a-las-demás-apis)
- [Capítulo 3 — Resumen del Protocolo](#capítulo-3--resumen-del-protocolo)
  - [3.1 Reglas de API](#31-reglas-de-api)
  - [3.2 Autenticación](#32-autenticación)
  - [3.3 Reglas de Respuesta](#33-reglas-de-respuesta)
- [Capítulo 4 — Aplicaciones Típicas](#capítulo-4--aplicaciones-típicas)
  - [4.1 Gestión de Sitios](#41-gestión-de-sitios)
  - [4.2 Gestión de Dispositivos](#42-gestión-de-dispositivos)
  - [4.3 Eventos y Alarmas](#43-eventos-y-alarmas)
  - [4.4 Servicio ARC](#44-servicio-arc)
  - [4.5 Servicio VSaaS](#45-servicio-vsaas)
  - [4.6 Hot Spare](#46-hot-spare)
  - [4.7 Servicios de Valor Agregado](#47-servicios-de-valor-agregado)
  - [4.8 Audio y Video](#48-audio-y-video)
  - [4.9 Instalador](#49-instalador)
  - [4.10 Envío de Mensajes por Webhook](#410-envío-de-mensajes-por-webhook)
  - [4.11 Flujos de referencia del laboratorio SYSCOM](#411-flujos-de-referencia-del-laboratorio-syscom)
- [Capítulo 5 — Referencia de API](#capítulo-5--referencia-de-api)
  - [5.1 Funciones Comunes](#51-funciones-comunes)
  - [5.2 Gestión de Sitios](#52-gestión-de-sitios)
  - [5.3 Gestión de Dispositivos](#53-gestión-de-dispositivos)
  - [5.4 Servicio ARC](#54-servicio-arc)
  - [5.5 Hot Spare](#55-hot-spare)
  - [5.6 Mensajes de Alarma](#56-mensajes-de-alarma)
  - [5.7 Capacidad Transparente](#57-capacidad-transparente)
  - [5.8 Audio y Video](#58-audio-y-video)
  - [5.9 Servicios de Valor Agregado](#59-servicios-de-valor-agregado)
  - [5.10 Webhook](#510-webhook)
  - [5.11 Instalador](#511-instalador)
  - [5.12 APIs Retiradas](#512-apis-retiradas)
- [Apéndices](#apéndices)
- [Aviso legal](#aviso-legal)

---

## Capítulo 1 — Descripción General

### 1.1 Introducción

Este documento presenta las capacidades abiertas y las APIs que ofrece **Hik-Partner Pro** para que fabricantes o desarrolladores de terceros integren rápidamente sus aplicaciones, incluyendo la gestión de sitios, la gestión de dispositivos, la suscripción y recepción de alarmas, los servicios ARC, entre otras.

Hik-Partner Pro es la plataforma del **instalador / partner**: agrupa los **sitios** (instalaciones) y cada dispositivo pertenece a un sitio. Todas las rutas de esta OpenAPI usan el prefijo `/api/hpcgw/`.

**Orden de lectura recomendado:**

1. Revisar las [Capacidades Abiertas](#12-capacidades-abiertas) y los [Términos y Definiciones](#13-términos-y-definiciones).
2. Seguir los [Primeros Pasos](#capítulo-2--primeros-pasos): solicitar la API Key, obtener el token y llamar a las demás APIs.
3. Estudiar el [Resumen del Protocolo](#capítulo-3--resumen-del-protocolo) (reglas de llamada, autenticación y reglas de respuesta).
4. Consultar la Referencia de API (Capítulo 5) para los parámetros de solicitud y respuesta de cada API.

---

### 1.2 Capacidades Abiertas

Síntesis de las descripciones de capacidades de las aplicaciones típicas del PDF. Cada área enlaza a su sección de la Referencia de API.

#### 1.2.1 Sitios

La gestión de sitios incluye las capacidades básicas de sitio (agregar, buscar, actualizar y eliminar). Es el requisito previo de la gestión de dispositivos, ya que **los dispositivos deben agregarse a un sitio**.

| Grupo | Capacidades | Referencia |
| ----- | ----------- | ---------- |
| Información del sitio | Agregar, eliminar, editar y buscar sitios | [5.2 Gestión de Sitios](#52-gestión-de-sitios) |
| Relación del sitio | Compartir un sitio y cancelar la compartición, asignar administradores del sitio, handover por compartición y gestión de los usuarios finales que lo reciben | [5.2 Gestión de Sitios](#52-gestión-de-sitios) |
| Team site | Crear, buscar, modificar, hacer el handover y eliminar team sites | [5.2 Gestión de Sitios](#52-gestión-de-sitios) |

#### 1.2.2 Dispositivos

La capacidad de dispositivos sirve para el acceso unificado, el mantenimiento, la consulta y el control de operación de los recursos de dispositivo en la plataforma, y está pensada para el ciclo de vida completo de los dispositivos administrados.

| Grupo | Capacidades | Referencia |
| ----- | ----------- | ---------- |
| Información del dispositivo | Agregar dispositivos a un sitio, editar o eliminar su información, consultar la lista de dispositivos y la lista de canales asociados | [5.3 Gestión de Dispositivos](#53-gestión-de-dispositivos) |
| Operación del dispositivo | Controlar los permisos de operación de los usuarios finales, consultar el PIN, verificar si hay una versión de firmware disponible, actualizar el firmware y consultar el progreso y el estado de la actualización, despertar cámaras solares | [5.3 Gestión de Dispositivos](#53-gestión-de-dispositivos) |
| Reenvío transparente | Configurar y operar dispositivos mediante protocolos ISAPI y OTAP reenviados por la plataforma | [5.7 Capacidad Transparente](#57-capacidad-transparente) |

#### 1.2.3 Eventos y Alarmas

Los eventos incluyen los eventos de conexión/desconexión de dispositivos, los eventos y alarmas reportados por los dispositivos y los eventos de inspección de Hik-Partner Pro. Una plataforma de terceros puede suscribirse bajo demanda mediante la API de suscripción a mensajes de alarma.

- Suscribirse a los mensajes de alarma, obtener los mensajes y confirmar su recepción (`offset`).
- Obtener la URL de descarga de imágenes relacionadas con alarmas.
- Armar y desarmar dispositivos, y consultar su estado de armado.

Referencia: [5.6 Mensajes de Alarma](#56-mensajes-de-alarma). Tipos de evento: [A.4 Detalles de Eventos](APENDICE-A.md#a4-detalles-de-eventos).

> **Notas:**
> - `POST /api/hpcgw/v1/mq/messages` usa long polling: si no hay alarmas, la llamada queda bloqueada durante **20 s**.
> - Las APIs se llaman de forma cíclica. El intervalo de llamada se ajusta según la necesidad; se recomienda **300 ms o más**.
> - No bloquee la API que recibe los mensajes de alarma; se recomienda procesar el contenido de los mensajes de forma asíncrona.

#### 1.2.4 Servicio ARC

Para la integración con un ARC (central receptora de alarmas) se ofrecen, además de las APIs básicas, APIs específicas del servicio ARC. Las Open APIs se pueden llamar con el **ARC ID / ARC Key** solicitado en el Portal de Hik-Partner Pro, que equivalen a la API Key y la API Secret.

- Consultar la lista de dispositivos con servicio ARC.
- Asociar y desasociar dispositivos del ARC.
- Actualizar el tipo de evento y el número de cuenta (`accountNumber`) del dispositivo.
- Consultar la información del sitio de los dispositivos con servicio ARC.

Referencia: [5.4 Servicio ARC](#54-servicio-arc).

#### 1.2.5 Servicio VSaaS

Además de la gestión básica de dispositivos, la integración VSaaS se centra en funciones de video: vista en vivo, reproducción, descarga de video y audio bidireccional. Estas funciones **no** forman parte de esta OpenAPI REST: se implementan con **HPNetSDK** de Hik-Partner Pro (ver la guía de desarrollo de HPNetSDK). Ver [1.6 Fuera del alcance de esta OpenAPI](#16-fuera-del-alcance-de-esta-openapi).

> **Notas:**
> - La API Key para integrar el servicio VSaaS solo se puede solicitar fuera de línea, por correo electrónico u otros medios.

#### 1.2.6 Hot Spare

Configuración de dispositivos hot spare (equipo principal / equipo de respaldo): el equipo de respaldo detecta, mediante heartbeat (latido) con la nube, si el equipo principal está desconectado, y descarga desde la nube el archivo de respaldo que sube el equipo principal.

- Agregar, consultar y eliminar la configuración hot spare.
- Heartbeat entre la nube y los equipos principal/de respaldo.
- Subir, consultar, obtener la URL de descarga y eliminar archivos hot spare.

Referencia: [5.5 Hot Spare](#55-hot-spare).

#### 1.2.7 Servicios de Valor Agregado

Este módulo ofrece capacidades de valor agregado, como la activación del paquete de monitoreo de salud; tras la activación, el dispositivo cuenta con la capacidad de mantenimiento (O&M).

Referencia: [5.9 Servicios de Valor Agregado](#59-servicios-de-valor-agregado).

#### 1.2.8 Audio y Video

Gestión de audio personalizado y cut-in de audio (inserción de audio) para altavoces de red, es decir, dispositivos con tipo de dispositivo `12` y subtipo `19`.

| Capacidad | Descripción |
| --------- | ----------- |
| Subida de archivo de audio | Sube un solo archivo de audio. El nombre del archivo debe ser único. Formatos admitidos: MP3, WAV y AAC. Tamaño máximo: 10 MB. Si ya cuenta con una URL de archivo de audio descargable directamente, puede omitir este paso. |
| Aplicación de archivo de audio | Aplica un archivo de audio subido a un dispositivo específico y completa la vinculación mediante la URL de almacenamiento, el formato y el ID único del audio. |
| Consulta y eliminación de audio | Consulta la lista de audios personalizados del dispositivo (ID, nombre, formato, tamaño, duración e información de almacenamiento) y elimina uno o varios archivos por ID de audio. |
| Control de cut-in de audio | Reproducción por cut-in con archivos de audio personalizados o voz sintetizada (TTS), con parámetros configurables como prioridad, modo de reproducción, duración, volumen, idioma, voz (timbre) y velocidad de habla. |

Referencia: [5.8 Audio y Video](#58-audio-y-video).

#### 1.2.9 Instalador

Este módulo ofrece capacidades relacionadas con los instaladores, como consultar la información de los empleados del instalador. Admite búsqueda por correo electrónico, nombre de usuario o número de teléfono, incluida la búsqueda difusa.

Referencia: [5.11 Instalador](#511-instalador).

#### 1.2.10 Envío de Mensajes por Webhook

Alternativa al sondeo de mensajes: tras configurar el Webhook, las notificaciones de eventos se envían a una URL de callback HTTPS del integrador, con verificación de firma (`X-Hook-Signature`).

- Obtener, guardar y eliminar la configuración de envío de mensajes.

Referencia: [5.10 Webhook](#510-webhook).

> **Notas:**
> - Una vez configurado el Webhook, es posible que el sondeo original (`/api/hpcgw/v1/mq/messages`) ya no obtenga mensajes. Si su integración usa sondeo, contacte al soporte técnico para cambiar a Webhook.
> - El receptor debe responder con un código HTTP 2XX en caso de éxito (cualquier otro código se considera falla). El tiempo de espera es de 5 segundos.

---

### 1.3 Términos y Definiciones

| Término | Descripción |
| ------- | ----------- |
| Sitio | Instalación administrada en Hik-Partner Pro. Los dispositivos deben agregarse a un sitio antes de poder gestionarlos. |
| Instalador / empleado | Cuentas de empleados de la empresa instaladora en Hik-Partner Pro. Se consultan con `POST /api/hpcgw/v1/installers/search`. |
| Administrador del sitio | Empleado asignado para gestionar un sitio (`POST /api/hpcgw/v2/site/assign`). Al asignar nuevos administradores se retiran los anteriores, salvo los que tienen el permiso *Manage All Sites*. |
| Usuario final / cliente | Cliente que recibe el sitio o sus dispositivos mediante handover. |
| Team site (sitio de equipo) | Tipo de sitio con APIs propias (`/api/hpcgw/v1/site/team/...`), agregado en V2.15.0. Si al crearlo no se configura `serverType`, los servicios no se activan y no se pueden agregar dispositivos. |
| Compartir sitio | Compartir un sitio que **no** se ha entregado con un proveedor de servicios de instalación para obtener servicios de instalación de dispositivos. Solo se pueden compartir sitios que no han sido transferidos. |
| Handover | Entrega del sitio al cliente (usuario final) una vez terminadas la instalación y la configuración de los dispositivos. |
| Handover por compartición | Modalidad de handover en la que el instalador conserva la propiedad de los dispositivos y el cliente solo obtiene permiso de uso. El instalador define los permisos de dispositivo que comparte y puede compartir el sitio con más usuarios. |
| ARC | Central receptora de alarmas. Dispone de APIs específicas (`/api/hpcgw/v1/arcservice/...`) y puede controlar, mediante reenvío transparente, dispositivos de otros instaladores. |
| ARC ID / ARC Key | Credenciales de un ARC, solicitadas en el Portal de Hik-Partner Pro. Equivalen a la API Key y la API Secret, y se envían como `appKey` / `secretKey` en `token/get`. |
| Hot spare (equipo principal / equipo de respaldo) | Esquema de redundancia: el equipo principal (*host*) mantiene un heartbeat con la nube y sube un archivo de respaldo; el equipo de respaldo (*spare*) detecta si el principal está desconectado y descarga ese archivo. Se pueden configurar hasta 3 equipos de respaldo. |
| ISAPI | Protocolo de dispositivo de Hikvision que la plataforma reenvía de forma transparente mediante `GET/PUT/POST/DELETE /api/hpcgw/v1/device/transparent/{isapi uri}`. Las URIs admitidas se listan en [A.5 URIs de Solicitud](APENDICE-B.md#a5-uris-de-solicitud). |
| OTAP | Protocolo basado en modelo de objeto (propiedades, acciones, sombra) que la plataforma reenvía mediante `GET/PUT/POST/DELETE /api/hpcgw/v2/device/transparent/{otap uri}`. |
| API Key / API Secret (`appKey` / `secretKey`) | Cuenta de desarrollador de Hik-Partner Pro. La API Key tiene correspondencia uno a uno con la cuenta de Hik-Partner Pro y se usa para obtener el `accessToken`. |
| `accessToken` | Credencial de llamada de las Open APIs, obtenida con la API Key. Válida durante 7 días. |
| Dominio de primer nivel | `https://api.hik-partner.com`. Dedicado exclusivamente a obtener el token; común a todas las regiones. |
| `areaDomain` | Dominio de segundo nivel (regional) que devuelve `token/get`. Es el dominio que deben usar todas las APIs de servicio; cada región tiene uno distinto. |
| MQ | Cola de mensajes de alarma de la plataforma, operada con `mq/subscribe` (suscribirse), `mq/messages` (obtener mensajes, long polling) y `mq/offset` (confirmar lote). |

> **Notas:**
> - El PDF no desarrolla el significado de las siglas ARC, ISAPI, OTAP ni MQ; las descripciones anteriores se basan en el uso que la guía hace de cada término.

---

### 1.4 Historial de Actualizaciones

El listado por versión se mantiene en [HISTORIAL-ACTUALIZACIONES.md](./HISTORIAL-ACTUALIZACIONES.md).

---

### 1.5 Relación con otras plataformas HIKVISION

| Plataforma | Cuándo usarla |
| ---------- | ------------- |
| **Hik-Partner Pro** (esta carpeta) | Instalador: sitios, flota de equipos, MQ partner, IP Speaker, ARC |
| [Hik-Connect Team](../HikConnect-Team/README.md) | VSaaS de usuario: video EZOPEN, personas, asistencia, flota onboard |
| [Hik DeviceGateway](../HikGateway/README.md) | On-premise, ISAPI Digest directo al NVR/ACS |

> **Notas:**
> - Hik-Partner Pro no es Hik-Connect for Teams: el prefijo de rutas es `hpcgw`, no `hccgw`.

---

### 1.6 Fuera del alcance de esta OpenAPI

**Funciones que se implementan con HPNetSDK** (no con esta OpenAPI REST):

| Función | Cómo implementarla |
| ------- | ------------------ |
| Vista en vivo | HPNetSDK de Hik-Partner Pro |
| Reproducción | HPNetSDK de Hik-Partner Pro |
| Descarga de video | HPNetSDK de Hik-Partner Pro |
| Audio bidireccional (intercom) | HPNetSDK de Hik-Partner Pro |

**APIs retiradas:**

| API | Descripción | Retirada en | Estado |
| --- | ----------- | ----------- | ------ |
| `POST /api/hpcgw/v1/site/health/report` | Obtener el reporte de monitoreo de salud del sitio | V2.15.500 | ❌ Retirada |
| `POST /api/hpcgw/v1/device/iot/ability/query` | Verificar si se admite agregar dispositivos de modelo de objeto | V2.15.500 | ❌ Retirada |
| `POST /api/hpcgw/v1/device/iot/add/result` | Buscar el estado de alta del dispositivo de modelo de objeto | V2.15.500 | ❌ Retirada |
| `POST /api/hpcgw/v1/video/by/time` | Obtener la información de archivos almacenados por tiempo | V2.15.500 | ❌ Retirada |
| APIs de cloud attendance (asistencia en la nube) | Aplicación típica y APIs del sistema de asistencia en la nube | V2.15.0 | ❌ Retirada |

> **Notas:**
> - No implemente integraciones contra estas APIs: ya no forman parte de la guía V2.15.500. El PDF no conserva las rutas de las APIs de cloud attendance.

---

## Capítulo 2 — Primeros Pasos

### Paso 1 — Solicitar una API Key

La API Key es una cuenta para desarrolladores de Hik-Partner Pro, compuesta por la **API Key** y la **API Secret**. La API Key tiene correspondencia uno a uno con la cuenta de Hik-Partner Pro.

Para solicitarla:

1. Registre una cuenta de **Primary Admin** (dominio: `https://hik-partner.com`).
2. Complete el proceso de autenticación de la empresa.
3. Vaya a **Site & Device → My Service**, seleccione **API Integration** y haga clic en **Generate Developer Account** para obtener la cuenta de API (API Key / API Secret).

> **Notas:**
> - Para la integración ARC se usan el ARC ID y la ARC Key solicitados en el Portal de Hik-Partner Pro, que equivalen a la API Key y la API Secret.
> - La API Key para integrar el servicio VSaaS solo se puede solicitar fuera de línea, por correo electrónico u otros medios.
> - Guarde la API Key y la API Secret de forma segura y no las suba a repositorios de código.

### Paso 2 — Obtener el token

El `accessToken` es la credencial de llamada de las Open APIs y se obtiene con la API Key de la siguiente forma:

- **Dominio de primer nivel:** `https://api.hik-partner.com` (este dominio está dedicado a obtener el token y es común a todas las regiones).
- **URI de solicitud:** `POST /api/hpcgw/v1/token/get`

**Parámetros de Solicitud:**

```http
POST /api/hpcgw/v1/token/get HTTP/1.1
Host: api.hik-partner.com
Content-Type: application/json

{
  "appKey": "8yedm*****y5z0a7gr3",
  "secretKey": "b2391***54rpcp1k"
}
```

**Parámetros de Respuesta:**

```json
{
  "data": {
    "accessToken": "hpc.6grytwxxxxti2h6kipfb8",
    "expireTime": 1640416102626,
    "areaDomain": "https://apiisa.hik-partner.com"
  },
  "errorCode": "0"
}
```

1. `accessToken` es la información de autenticación y se usa como valor de `Authorization` en el header de solicitud de las APIs de servicio. Al llamarlas, se debe anteponer el prefijo fijo `Bearer ` (con espacio). Ejemplo:

   ```http
   Authorization: Bearer hpc.6grytwxxxxti2h6kipfb8
   ```

2. `expireTime` representa la fecha de expiración del token, con precisión de milisegundos. El token obtenido es válido durante **7 días**. Si caduca, se devuelve el código de error `LAP500004` y es necesario obtener un token nuevo con la API Key.
3. `areaDomain` es el dominio de segundo nivel y se usa como dominio de las APIs de servicio. Las solicitudes de servicio deben usar el dominio de segundo nivel específico que se devuelve (cada región tiene uno distinto); **no** se puede usar el dominio de primer nivel con el que se obtuvo el token.

> **Notas:**
> - El ejemplo de esta sección devuelve `"areaDomain": "https://apiisa.hik-partner.com"`, mientras que la tabla de [5.1.1 Obtener Token](#511-obtener-token) indica `https://isaapi.hik-partner.com` para Sudamérica. Use siempre el valor que devuelva la API en su entorno, sin fijar el dominio en el código.
> - Este ejemplo muestra los campos dentro de `data`; el ejemplo de 5.1.1 los muestra en el nivel raíz. Ver la nota de [5.1.1 Obtener Token](#511-obtener-token).

### Paso 3 — Llamar a las demás APIs

Con el `accessToken` y el `areaDomain` obtenidos, arme y complete los parámetros según el formato que indica la documentación de cada API.

**Ejemplo de uso:** buscar información de sitios con `POST /api/hpcgw/v1/site/search`.

**Ejemplo de Solicitud:**

```bash
curl -X POST 'https://apiisa.hik-partner.com/api/hpcgw/v1/site/search' \
--header 'Authorization: Bearer hpc.6grytwxxxxti2h6kipfb8' \
--header 'Content-Type: application/json' \
--data '{
  "search": "test",
  "page": 0,
  "pageSize": 100
}'
```

> **Notas:**
> - En el PDF, el header de este ejemplo aparece como `Bearerhpc.6grytwxxxxti2h6kipfb8`, sin el espacio después de `Bearer`. Es una errata: la propia guía indica que el prefijo fijo es `"Bearer "` con espacio, y así se muestra aquí.
> - El dominio del ejemplo (`apiisa.hik-partner.com`) es el `areaDomain` devuelto en el Paso 2; sustitúyalo por el que reciba en su entorno.

---

## Capítulo 3 — Resumen del Protocolo

### 3.1 Reglas de API

| Regla | Detalles |
| ----- | -------- |
| Protocolo de transmisión | HTTPS. Las URLs de callback del Webhook también deben usar HTTPS. |
| URL de obtención del token | `https://api.hik-partner.com/api/hpcgw/v1/token/get` (dominio de primer nivel, común a todas las regiones). |
| URL de las APIs de servicio | `https://{areaDomain}/api/hpcgw/...` — el `areaDomain` lo devuelve `token/get`. |
| Dominios regionales (`areaDomain`) | Europa: `https://ieuapi.hik-partner.com` <br>Norteamérica: `https://iusapi.hik-partner.com` <br>Sudamérica: `https://isaapi.hik-partner.com` <br>Singapur: `https://isgpapi.hik-partner.com` <br>Rusia: `https://api.hik-partnerru.com` |
| Métodos de solicitud | `POST` en la mayoría de las APIs; `GET` en `GET /api/hpcgw/v1/arcservice/site/{id}/info`; `GET/PUT/POST/DELETE` en el reenvío transparente ISAPI y OTAP. |
| Formato de datos | JSON, con `Content-Type: application/json`. Excepciones indicadas en la Referencia de API: `multipart/form-data` (subida de archivo de audio), `application/x-www-form-urlencoded` (algunas APIs OTAP con `GET`) y `application/json` o `application/xml` (reenvío ISAPI). |
| Header de autenticación | `Authorization: Bearer <accessToken>` en todas las APIs de servicio. |
| Límite de llamadas | La plataforma limita el número de llamadas; al excederlo devuelve `LAP500007` (ver [3.2](#32-autenticación)). |

> **Notas:**
> - Los dominios originales (`https://api.hik-proconnectru.com` para Rusia y `https://api.hik-proconnect.com` para el resto) se podían usar hasta finales de 2023.
> - El PDF no declara explícitamente la codificación de caracteres de los cuerpos JSON; los ejemplos XML de la guía declaran `UTF-8`.
> - El PDF no indica un número máximo de llamadas por segundo; solo documenta los códigos de error por límite excedido.

### 3.2 Autenticación

La autenticación se basa en la API Key (o el ARC ID / ARC Key en integraciones ARC):

1. Obtenga la API Key y la API Secret ([Paso 1](#paso-1--solicitar-una-api-key)).
2. Llame a `POST /api/hpcgw/v1/token/get` con `appKey` y `secretKey` contra el dominio de primer nivel ([Paso 2](#paso-2--obtener-el-token)).
3. Reciba el `accessToken`, válido durante **7 días**; `expireTime` indica la expiración en milisegundos.
4. Envíe el token en el header `Authorization` con el prefijo `Bearer ` en todas las APIs de servicio, contra el `areaDomain` devuelto.
5. Si el token caduca, la API devuelve `LAP500004`: obtenga un token nuevo con la API Key.

**Ejemplo de Header de Solicitud:**

```http
Content-Type: application/json
Authorization: Bearer hpc.6grytwxxxxti2h6kipfb8
```

**Códigos de error relacionados con la autenticación y los límites de llamada:**

| Código | Descripción |
| ------ | ----------- |
| `LAP300001` | No se encontró el AK. |
| `LAP300002` | El AK y el SK no coinciden. |
| `LAP300003` | No existe la cuenta de Hik-Partner Pro vinculada al AK. |
| `LAP500002` | El token de acceso está vacío. |
| `LAP500003` | Formato inválido del token de acceso. |
| `LAP500004` | Token de acceso caducado o incorrecto (válido durante 7 días). |
| `LAP500005` | Falló la verificación del token de acceso. |
| `LAP500007` | El número de llamadas excede el límite. |
| `EVZ10029` | La frecuencia de llamadas a la API excedió el límite. |

Lista completa en [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

> **Notas:**
> - El header correcto es `Authorization: Bearer <accessToken>`. No use un header `Token:`, que corresponde a otra plataforma.

### 3.3 Reglas de Respuesta

Las respuestas usan formato JSON con la siguiente estructura:

| Parámetro | Requerido | Tipo | Descripción |
| --------- | --------- | ---- | ----------- |
| errorCode | Requerido | String | Código de estado o de error. `"0"` indica éxito. |
| message | Opcional | String | Descripción del estado o del error, en correspondencia uno a uno con el código. |
| data | Según la API | Object | Objeto con los datos de respuesta cuando la solicitud tiene éxito. |

- `errorCode: "0"` = éxito.
- Cualquier otro valor = falla. Consulte [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

**Ejemplo de éxito:**

```json
{
  "data": {
    "accessToken": "hpc.6grytwxxxxti2h6kipfb8",
    "expireTime": 1640416102626,
    "areaDomain": "https://apiisa.hik-partner.com"
  },
  "errorCode": "0"
}
```

**Ejemplo de resultado parcial** (operación en lote: `errorCode` global `"0"` con fallas por dispositivo dentro de `data`):

```json
{
  "data": {
    "successCount": 1,
    "failedCount": 1,
    "successDevices": [
      {
        "deviceSerial": "Q01728482"
      }
    ],
    "failedDevices": [
      {
        "deviceSerial": "K52996719",
        "errorCode": "EVZ20007"
      }
    ]
  },
  "errorCode": "0"
}
```

> **Notas:**
> - En las APIs que operan varios dispositivos a la vez (por ejemplo, armado/desarmado), un `errorCode` global `"0"` no garantiza que todos los dispositivos se hayan procesado: revise también los códigos de error por dispositivo dentro de `data`.
> - El PDF no incluye un ejemplo de respuesta de falla a nivel global.
> - Algunas APIs devuelven `message` con valores como `"Ok"` u `"ok"` en respuestas exitosas; no dependa del texto de `message` para determinar el éxito, use `errorCode`.

## Capítulo 4 — Aplicaciones Típicas

Este capítulo describe, por módulo funcional, qué capacidades ofrece Hik-Partner Pro OpenAPI y en qué orden se llaman sus APIs. Cada flujo enlaza a la referencia detallada del [Capítulo 5](#capítulo-5--referencia-de-api).

> **Notas:**
> - Todos los flujos parten de obtener el token de acceso con [5.1.1 Obtener Token](#511-obtener-token) (`POST /api/hpcgw/v1/token/get`) y de usar el `areaDomain` devuelto para el resto de las llamadas.
> - Las figuras del PDF se describen aquí en pasos numerados; se cita su número original ("Figura 2-N del PDF").

---

### 4.1 Gestión de Sitios

**Descripción de la capacidad**

La gestión de sitios incluye las capacidades básicas sobre sitios (agregar, buscar, actualizar y eliminar). Es el requisito previo para la gestión de dispositivos, ya que los dispositivos deben agregarse a un sitio.

**Mapa de capacidades (Figura 2-2 del PDF, "Site Related"):**

1. **Información del sitio:** agregar sitio, eliminar sitio, actualizar la información del sitio y buscar sitios — ver [5.2.1](#521-información-del-sitio).
2. **Team site (sitio de equipo):** crear team site, buscar team sites, modificar la información del team site, hacer handover del team site y eliminar team site — ver [5.2.3](#523-team-site).

**Guía de programación (Figura 2-3 del PDF, "Programming Guide"):**

1. **Inicio.** El flujo se divide en dos ramas según la intención:
   - **Crear:** agregar la información de un sitio con `POST /api/hpcgw/v1/site/add` (requiere `name` y `timeZone` en el body).
   - **Leer/buscar:** buscar la información de sitios con `POST /api/hpcgw/v1/site/search` (admite parámetros de paginación y búsqueda; devuelve los ID).
2. **Elegir una acción específica:** decidir si se necesita actualizar, eliminar o usar el sitio.
   - **Modificar:** editar la información de un sitio específico con `POST /api/hpcgw/v1/site/{id}/update` (requiere `{id}` en la URL y `name` en el body).
   - **Eliminar:** eliminar un sitio y todos sus dispositivos con `POST /api/hpcgw/v1/site/{id}/delete` (requiere `{id}` en la URL; elimina también los dispositivos).
   - **Usar el sitio:** continuar al paso siguiente.
3. **Obtener el ID de sitio confirmado** (paso conceptual al que convergen las ramas de creación, búsqueda y modificación).
4. **Gestión de dispositivos a través de sitios:** con la confirmación del sitio completada, asignar dispositivos usando el ID de sitio confirmado (base de la gestión de dispositivos).
5. **Fin.**

Las APIs relacionadas con la gestión de sitios son las siguientes:

| Función | API | Referencia |
| ------- | --- | ---------- |
| Agregar la información de un sitio | `POST /api/hpcgw/v1/site/add` | [5.2.1](#521-información-del-sitio) |
| Eliminar la información de un sitio | `POST /api/hpcgw/v1/site/{id}/delete` | [5.2.1](#521-información-del-sitio) |
| Editar la información de un sitio | `POST /api/hpcgw/v1/site/{id}/update` | [5.2.1](#521-información-del-sitio) |
| Buscar la información de sitios | `POST /api/hpcgw/v1/site/search` | [5.2.1](#521-información-del-sitio) |
| Compartir un sitio | `POST /api/hpcgw/v1/site/share` | [5.2.2](#522-relación-del-sitio) |
| Cancelar la compartición de un sitio | `POST /api/hpcgw/v1/site/share/cancel/{id}` | [5.2.2](#522-relación-del-sitio) |

> **Notas:**
> - La tabla del PDF solo lista estas seis APIs. Las APIs de team site que aparecen en la Figura 2-2 (`site/team/add`, `site/team/search`, `site/team/{id}/modify`, `site/team/handover`, `site/team/{id}/delete`) y las demás de relación del sitio (asignación, handover, cliente) se documentan en [5.2.2](#522-relación-del-sitio) y [5.2.3](#523-team-site).

---

### 4.2 Gestión de Dispositivos

**Descripción de la capacidad**

La capacidad de dispositivos se usa para el acceso unificado, el mantenimiento, la consulta y el control de operación de los recursos de dispositivos en la plataforma. El integrador puede agregar dispositivos a un sitio específico, editar o eliminar la información de los dispositivos, y consultar la lista de dispositivos y la información de los canales asociados a ellos. También permite controlar los permisos de operación de los usuarios finales sobre el dispositivo, consultar el PIN del dispositivo, comprobar si hay una versión de firmware disponible para actualizar, ejecutar la actualización de firmware y consultar su progreso, y despertar cámaras alimentadas por energía solar. Esta capacidad está diseñada para la gestión del ciclo de vida completo de los dispositivos administrados en la plataforma.

**Mapa de capacidades (Figura 2-4 del PDF, "Device Related"):**

1. **Información del dispositivo:** agregar dispositivo, eliminar dispositivo, actualizar la información del dispositivo, consultar la lista de dispositivos y consultar la lista de canales del dispositivo — ver [5.3.1](#531-información-del-dispositivo).
2. **Operaciones del dispositivo:** consultar el PIN del dispositivo, actualizar el firmware, consultar el progreso de la actualización y consultar el estado de la actualización — ver [5.3.2](#532-operación-del-dispositivo).

> **Notas:**
> - La Figura 2-4 no incluye dos capacidades que sí menciona la descripción: el control de permisos del usuario final (`POST /api/hpcgw/v1/device/cloud/enable`) y el despertar de cámaras solares (`POST /api/hpcgw/v1/device/camera/wakeUp`). Ambas se documentan en [5.3.2](#532-operación-del-dispositivo).

**Guía de programación**

Mediante las APIs de gestión de sitios y de gestión de dispositivos puede agregar, eliminar, editar y buscar dispositivos, así como configurarlos y operarlos. El proceso de integración es el siguiente (Figura 2-5 del PDF, "Device Management Integration Flow"):

1. Obtener el token de acceso con la API Key: `POST /api/hpcgw/v1/token/get` — ver [5.1.1](#511-obtener-token).
2. Llamar a las APIs de gestión de sitios — ver [5.2](#52-gestión-de-sitios).
3. Llamar a las APIs de gestión de dispositivos — ver [5.3](#53-gestión-de-dispositivos).
4. A partir de ahí, el flujo se bifurca en dos usos del reenvío transparente de ISAPI — ver [5.7.1](#571-reenvío-transparente-isapi):
   - **Operar dispositivos:** `GET/PUT/POST/DELETE /api/hpcgw/v1/device/transparent/{isapi uri}`
   - **Configurar dispositivos:** `GET/PUT/POST/DELETE /api/hpcgw/v1/device/transparent/{isapi uri}`

Las APIs relacionadas con la gestión de dispositivos son las siguientes:

| Función | API | Referencia |
| ------- | --- | ---------- |
| Agregar la información de dispositivos | `POST /api/hpcgw/v2/device/add` | [5.3.1](#531-información-del-dispositivo) |
| Eliminar la información de un dispositivo | `POST /api/hpcgw/v1/device/delete` | [5.3.1](#531-información-del-dispositivo) |
| Editar la información de un dispositivo | `POST /api/hpcgw/v1/device/update` | [5.3.1](#531-información-del-dispositivo) |
| Obtener la lista de dispositivos | `POST /api/hpcgw/v1/device/list` | [5.3.1](#531-información-del-dispositivo) |
| Obtener la lista de canales vinculados a un dispositivo | `POST /api/hpcgw/v1/device/camera/list` | [5.3.1](#531-información-del-dispositivo) |
| Reenviar protocolos ISAPI | `GET/PUT/POST/DELETE /api/hpcgw/v1/device/transparent/{isapi uri}` | [5.7.1](#571-reenvío-transparente-isapi) |

> **Notas:**
> - Para las APIs de gestión de sitios, consulte [4.1 Gestión de Sitios](#41-gestión-de-sitios).

---

### 4.3 Eventos y Alarmas

Los eventos comprenden los eventos de conexión/desconexión (online/offline) de los dispositivos, los eventos y alarmas que reportan los dispositivos, y los eventos de inspección generados por Hik-Partner Pro. Una plataforma de terceros puede suscribirse bajo demanda mediante la API de suscripción a mensajes de alarma de los dispositivos. El flujo es el siguiente (Figura 2-6 del PDF, "Integration Flow of Subscribing to Events/Alarms"):

1. Obtener el token de acceso con la API Key: `POST /api/hpcgw/v1/token/get` — ver [5.1.1](#511-obtener-token).
2. *(Opcional)* Obtener la lista de dispositivos: `POST /api/hpcgw/v1/device/list` — ver [5.3.1](#531-información-del-dispositivo).
3. Suscribirse a los mensajes de alarma: `POST /api/hpcgw/v1/mq/subscribe` — ver [5.6](#56-mensajes-de-alarma).
4. Ciclo de consulta (se repite):
   1. Obtener los mensajes de alarma: `POST /api/hpcgw/v1/mq/messages`.
      - *(Opcional)* Obtener la URL de descarga de las imágenes relacionadas con la alarma: `POST /api/hpcgw/v1/alarm/pictureurl`.
   2. Confirmar que los mensajes se recibieron: `POST /api/hpcgw/v1/mq/offset`.
5. Cancelar la suscripción: `POST /api/hpcgw/v1/mq/subscribe` (con `subType` = `0`).

La figura acompaña el ciclo de consulta con dos recomendaciones:

1. Las APIs se llaman de forma cíclica. Puede ajustar el intervalo de llamada según sus necesidades; se recomienda un intervalo de 300 ms o más.
2. No bloquee la API que recibe los mensajes de alarma; se recomienda procesar el contenido de los mensajes de forma asíncrona.

Las APIs relacionadas con eventos y alarmas son las siguientes:

| Función | API | Referencia |
| ------- | --- | ---------- |
| Suscribirse a los mensajes de alarma de los dispositivos | `POST /api/hpcgw/v1/mq/subscribe` | [5.6](#56-mensajes-de-alarma) |
| Obtener mensajes de alarma | `POST /api/hpcgw/v1/mq/messages` | [5.6](#56-mensajes-de-alarma) |
| Confirmar que los mensajes se recibieron | `POST /api/hpcgw/v1/mq/offset` | [5.6](#56-mensajes-de-alarma) |
| Obtener la URL para descargar una imagen relacionada con una alarma | `POST /api/hpcgw/v1/alarm/pictureurl` | [5.6](#56-mensajes-de-alarma) |

> **Notas:**
> - La API `POST /api/hpcgw/v1/mq/messages` usa el método de long polling (sondeo largo). Si no hay alarmas, la llamada queda bloqueada durante 20 s.
> - En la Figura 2-6 la cancelación aparece como "Undo subscription" con la misma ruta `mq/subscribe`; la cancelación se indica con `subType` = `0` (0 = cancelar suscripción, 1 = suscribirse), según la tabla de parámetros de [5.6](#56-mensajes-de-alarma).

**Notas sobre la API "Obtener la URL para descargar una imagen relacionada con una alarma"**

1. Existen dos formatos de URL:
   1. **URLs que comienzan con `ISAPI_FILES`.** Estas imágenes **no** se pueden descargar con la URL incluida en la información de la alarma. Por ejemplo:

      ```text
      ISAPI_FILES/E44034229_2/20220107064543310-E44034229-2-10000-5$encrypt=2,2022-01-07T08:58:43,107be007f872b61a720d4c1b075c968e
      ```

      En este caso, primero obtenga la URL con la API "Obtener la URL para descargar una imagen relacionada con una alarma" (`POST /api/hpcgw/v1/alarm/pictureurl`) y después descargue la imagen.
   2. **URLs con el formato `https://xxx&isEncrypted=xx&xxx&isDevVideo=xx`.** Por ejemplo:

      ```text
      https://ieu.ezvizlife.com/v3/alarms/pic/get?fileId=20211231074837-E61958062-1-40002-2-1&deviceSerialNo=E61958062&cn=1&isEncrypted=0&isCloudStored=0&ct=5&lc=7&bn=5_alarm.eu&isDevVideo=0
      ```

      En este caso, la imagen de la alarma **sí** se puede descargar directamente con la URL incluida en la información de la alarma.
2. La imagen de la alarma puede estar cifrada. Los pasos de descifrado son los siguientes:
   1. **Identificar el tipo de cifrado** por el valor de `isEncrypted` o `encrypt` en la URL de la imagen: `0` significa que la imagen no está cifrada, `1` que está cifrada por el dispositivo y `2` que está cifrada por la plataforma.
   2. **Descifrar según el tipo:**
      1. **Imágenes cifradas por la plataforma:**
         1. Obtener la clave de descifrado:
            - Para el primer tipo de URL (`ISAPI_FILES`), tome los valores de `checksum` y `timestamp` de la URL. Calcule el SHA256 estándar de (`checksum` + `timestamp`), ordénelo en big endian y tome los primeros 16 caracteres: esa es la clave de descifrado.
            - Para el segundo tipo de URL, tome los valores de `checksum` y `alarmTime` del mensaje de evento. Calcule el SHA256 estándar de (`checksum` + `alarmTime`), ordénelo en big endian y tome los primeros 16 caracteres: esa es la clave de descifrado.
         2. Descifrado AES estándar: los datos a descifrar van del carácter 48 hasta el último carácter del archivo cifrado. Otros parámetros: método de alineación (padding) `PKCS5Padding`; modo de cifrado y descifrado `cbc128`; offset (vector de inicialización): `48, 49, 50, 51, 52, 53, 54, 55, 0, 0, 0, 0, 0, 0, 0, 0`.
         3. Se recomienda verificar el encabezado: use los caracteres 0 a 16 para comprobar si contienen el valor fijo `hikencodepicture`.
      2. **Imágenes cifradas por el dispositivo:** se requiere la clave de cifrado de stream que el usuario configuró en la página de configuración del dispositivo (Device Configuration). Los pasos son:
         1. Aplique dos veces MD5 a la clave del dispositivo y compare el resultado con los bytes 16 a 32 del archivo cifrado. Si coinciden, el archivo es correcto.
         2. Obtenga la clave de descifrado: codifique la clave del dispositivo como secuencia de bytes y tome los primeros 16 bytes; esa es la clave de descifrado.
         3. Descifrado AES estándar: los datos a descifrar van del byte 48 hasta el final del archivo cifrado; con ellos se obtiene la imagen descifrada. Parámetros de descifrado: modo de alineación (padding) `PKCS5`; modo de cifrado `cbc128`; offset (vector de inicialización): `48, 49, 50, 51, 52, 53, 54, 55, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0`.
      3. **Imágenes únicas y múltiples:** el campo `isDevVideo` distingue el modo de una sola imagen (`0`) del modo de múltiples imágenes (`1`). Si `isDevVideo` no existe, se trata de una sola imagen. El descifrado de múltiples imágenes se basa en el de una sola imagen:
         1. Tome los primeros 4 bytes del archivo cifrado y obtenga el valor de `Len`, que es la longitud en bytes de los datos de la imagen.
         2. Tome el flujo de bytes de 0 a `Len`: son los datos completos de la primera imagen.
         3. Descifre los datos de esa imagen según el método de cifrado que corresponda y obtenga la imagen descifrada.
         4. A partir del final de la imagen anterior, obtenga los datos de la siguiente imagen con el mismo método y descífrelos, hasta llegar al final de los datos.

> **Notas:**
> - Donde el PDF dice "The key is from the 48th character to the last character" (cifrado por plataforma) y "the secret key is the 48th byte to the end" (cifrado por dispositivo), por contexto se refiere a los **datos cifrados** (el cuerpo del archivo a partir del byte 48), no a la clave AES, que se obtiene en el paso anterior. Aquí se tradujo con esa interpretación; verifíquelo con una imagen real.
> - El offset que el PDF indica para el cifrado por dispositivo tiene 19 valores (`48…55` seguidos de 11 ceros), mientras que el de cifrado por plataforma tiene 16. Un vector de inicialización AES-CBC tiene 16 bytes, por lo que lo más probable es que el correcto sea `48, 49, 50, 51, 52, 53, 54, 55, 0, 0, 0, 0, 0, 0, 0, 0` en ambos casos. Se conserva la lista del PDF tal cual.
> - El PDF escribe "Alignment mode: PKCS5; Padding Encryption mode: cbc128" para el cifrado por dispositivo; se interpreta como padding `PKCS5` y modo `cbc128` (AES-128-CBC), igual que en el cifrado por plataforma.
> - La expresión "sort them by big endian" del PDF no se detalla más; lo habitual es tomar el digest SHA256 en su representación hexadecimal estándar y usar sus primeros 16 caracteres como clave AES-128.
> - El PDF escribe `timestampt` en la fórmula del primer tipo de URL; el campo de la URL es `timestamp`.

#### 4.3.1 Tipos y Detalles de Eventos

Consulte [A.4 Detalles de Eventos](APENDICE-A.md#a4-detalles-de-eventos) para conocer los tipos de eventos y el detalle de cada mensaje.

---

### 4.4 Servicio ARC

**Descripción de la capacidad**

**Mapa de capacidades (Figura 2-7 del PDF, "ARC Related"):** el módulo **ARC** agrupa los **recursos ARC**:

1. Consultar la lista de dispositivos ARC.
2. Asociar un dispositivo con la ARC.
3. Desasociar un dispositivo de la ARC.
4. Actualizar el tipo de evento.
5. Actualizar el `accountNumber`.
6. Consultar la información del sitio.

Todas estas APIs se documentan en [5.4 Servicio ARC](#54-servicio-arc).

**Guía de programación**

Para la integración de una ARC (central receptora de alarmas), además de las APIs básicas se ofrecen APIs específicas del servicio ARC. En la integración ARC, las Open APIs se pueden llamar con el ARC ID y el ARC Key solicitados en el portal de Hik-Partner Pro. El ARC ID y el ARC Key equivalen a la API Key y la API Secret (`appKey` / `secretKey` de [5.1.1 Obtener Token](#511-obtener-token)). El flujo de integración ARC es el siguiente (Figura 2-8 del PDF, "ARC Services Integration Flow"):

1. Obtener el token de acceso con la API Key (aquí, el ARC ID / ARC Key): `POST /api/hpcgw/v1/token/get` — ver [5.1.1](#511-obtener-token).
2. *(Opcional)* Llamar a las APIs de gestión de dispositivos — ver [5.3](#53-gestión-de-dispositivos).
3. Obtener la lista de dispositivos con el servicio ARC habilitado: `POST /api/hpcgw/v1/arcservice/device/list` — ver [5.4](#54-servicio-arc).
4. Con esa lista, el flujo continúa por cualquiera de estas ramas:
   - Gestionar eventos y alarmas — ver [4.3](#43-eventos-y-alarmas).
   - *(Opcional)* Deshabilitar el servicio ARC del dispositivo: `POST /api/hpcgw/v1/arcservice/device/disable`.
   - *(Opcional)* Obtener la información del sitio de los dispositivos con servicio ARC habilitado: `GET /api/hpcgw/v1/arcservice/site/{id}/info`.
   - *(Opcional)* Llamar a HPNetSDK para iniciar vista en vivo, reproducción o audio bidireccional, y descargar videos.

Las APIs relacionadas con el servicio ARC son las siguientes:

| Función | API | Referencia |
| ------- | --- | ---------- |
| Obtener la lista de dispositivos con el servicio ARC habilitado | `POST /api/hpcgw/v1/arcservice/device/list` | [5.4](#54-servicio-arc) |
| Deshabilitar el servicio ARC de dispositivos | `POST /api/hpcgw/v1/arcservice/device/disable` | [5.4](#54-servicio-arc) |
| Obtener la información del sitio de los dispositivos con servicio ARC habilitado | `GET /api/hpcgw/v1/arcservice/site/{id}/info` | [5.4](#54-servicio-arc) |

> **Notas:**
> - Para las APIs de gestión de dispositivos, consulte [4.2 Gestión de Dispositivos](#42-gestión-de-dispositivos).
> - Para las APIs de eventos y alarmas, consulte [4.3 Eventos y Alarmas](#43-eventos-y-alarmas).
> - Puede solicitar una API Key en línea desde el portal de Hik-Partner Pro.
> - La tabla del PDF solo lista tres APIs, pero la Figura 2-7 incluye también asociar dispositivo (`POST /api/hpcgw/v1/arcservice/device/enable`), actualizar tipo de evento (`POST /api/hpcgw/v1/arcservice/event/type/update`) y actualizar `accountNumber` (`POST /api/hpcgw/v1/arcservice/account/number/update`). Las seis se documentan en [5.4](#54-servicio-arc).
> - En las cajas rayadas de la Figura 2-8 (pasos opcionales) el PDF no indica un orden entre ramas; se pueden usar de forma independiente.

#### 4.4.1 Alta en línea de su empresa en la lista ARC de Hik-Partner Pro

> **Notas:** Fuente: infografía de Hikvision, no incluida en la guía OpenAPI V2.15.500.

Título original de la infografía: *"Display Your ARC to More Installers — Online Add Your Company to HPC's ARC List"* (muestre su ARC a más instaladores). La infografía usa el nombre Hik-ProConnect, que es el nombre anterior de Hik-Partner Pro (el cambio de nombre se registra en la versión V1.5.0 de la guía).

**Qué es**

Antes, agregar su empresa a la lista de centrales receptoras de alarmas (ARC) de Hik-ProConnect era un trámite fuera de línea. La función *"Online Add Your Company to the ARC List"* permite completarlo en línea.

**Por qué conviene**

Al terminar el proceso, la información de su empresa (por ejemplo, el logotipo de su marca) aparece en la lista ARC. Todos los usuarios de Hik-ProConnect pueden verla y conectar sus dispositivos a su central, lo que ayuda a promover su marca y su negocio.

**Cómo hacerlo (en el portal Hik-ProConnect)**

1. Registre una cuenta de Hik-ProConnect y **asegúrese de elegir el tipo de usuario "Alarm Receiving Center"**. Inicie sesión y vaya a **Company Information**.
   - Si su cuenta es de otro tipo de usuario y no puede cambiarla usted mismo a "Alarm Receiving Center", contacte a la sucursal de Hikvision.
2. Llene la información requerida de su empresa.
3. Recibirá un **ARC ID** (API Key) y un **ARC Key** (API Secret). Úselos para completar la configuración en su software ARC o en Hik IP Receiver Pro.
4. Elija un dispositivo para probar que su software ARC recibe las alarmas y suba la evidencia (captura de pantalla).
5. Hikvision verifica la evidencia en un plazo de 3 días hábiles. Tras la aprobación, la información de su empresa aparece en la lista ARC y los instaladores pueden verla.

**Enlaces**

- Portal: <https://www.hik-proconnect.com/>
- App Hik-ProConnect: disponible en App Store y Google Play.

**Relación con la OpenAPI**

El ARC ID y el ARC Key que se obtienen en el paso 3 son las credenciales con las que su software ARC llama a la OpenAPI: se envían como `appKey` y `secretKey` en [5.1.1 Obtener Token](#511-obtener-token) (`POST /api/hpcgw/v1/token/get`), tal como indica la guía de programación de [4.4](#44-servicio-arc) ("ARC ID and Key are equivalent to API Key and API Secret"). Con el token obtenido se usan las APIs de [5.4 Servicio ARC](#54-servicio-arc) y de [4.6 Hot Spare](#46-hot-spare).

---

### 4.5 Servicio VSaaS

Además de la gestión básica de dispositivos, la integración VSaaS se centra en funciones de video: vista en vivo, reproducción, descarga de video y audio bidireccional, que deben implementarse con HPNetSDK de Hik-Partner Pro (consulte la guía de desarrollo de HPNetSDK para más detalles). El proceso de integración es el siguiente (Figura 2-9 del PDF, "VSaaS Service Integration Flow"):

1. Obtener el token de acceso con la API Key: `POST /api/hpcgw/v1/token/get` — ver [5.1.1](#511-obtener-token).
2. Gestionar los dispositivos — ver [5.3](#53-gestión-de-dispositivos).
3. A partir de ahí, dos ramas en paralelo:
   - Gestionar eventos y alarmas — ver [4.3](#43-eventos-y-alarmas).
   - Llamar a HPNetSDK para iniciar vista en vivo, reproducción o audio bidireccional, y descargar videos.

> **Notas:**
> - Para las APIs de gestión de dispositivos, consulte [4.2 Gestión de Dispositivos](#42-gestión-de-dispositivos).
> - Para las APIs de eventos y alarmas, consulte [4.3 Eventos y Alarmas](#43-eventos-y-alarmas).
> - La solicitud de una API Key para integrar el servicio VSaaS solo puede hacerse fuera de línea, por correo electrónico u otros medios.

---

### 4.6 Hot Spare

A continuación se describen los flujos de llamadas para el hot spare (equipo principal) y el hot spare (equipo de respaldo). Las APIs se documentan en [5.5 Hot Spare](#55-hot-spare).

#### 4.6.1 Flujo de llamadas (equipo principal)

Flujo de la Figura 2-10 del PDF ("API Calling Flow for Hot Spare (Host)"):

1. **Inicio.**
2. Obtener el token: `POST /api/hpcgw/v1/token/get`.
3. Obtener la identidad de hot spare: `POST /api/hpcgw/v1/hotspare/add`.
4. Desde aquí, dos ramas en paralelo:
   - **Heartbeat:** ejecutar la interacción de heartbeat (latido) cada minuto con `POST /api/hpcgw/v1/hotspare/heartbeat` → **Fin**.
   - **Archivo de hot spare:** ¿hay actualizaciones en el archivo de hot spare?
     - **No** → **Fin**.
     - **Sí** → subir el nuevo archivo de hot spare (máx. 2 MB por carga) con `POST /api/hpcgw/v1/hotspare/file/upload` → **Fin**.

Pasos:

1. Llame a `POST /api/hpcgw/v1/token/get` con el ARC ID y el ARC Key para obtener el token — ver [5.1.1](#511-obtener-token).

   > **Notas:**
   > - Esta es la API base; el token que devuelve se usa en las demás APIs.

2. Llame a `POST /api/hpcgw/v1/hotspare/add` para establecer la identidad de hot spare del equipo principal — ver [5.5](#55-hot-spare).
3. El equipo principal llama cada minuto a la API de interacción de heartbeat `POST /api/hpcgw/v1/hotspare/heartbeat`, para que se pueda detectar su estado de actividad.
4. Llame a `POST /api/hpcgw/v1/hotspare/file/upload` para subir un archivo de hot spare de no más de 2 MB.

   > **Notas:**
   > - Para subir archivos más grandes, contacte al soporte técnico.
   > - Cuando la configuración del equipo principal cambie y requiera un archivo de hot spare actualizado, puede subir un archivo nuevo para reemplazar el anterior.

#### 4.6.2 Flujo de llamadas (equipo de respaldo)

Flujo de la Figura 2-11 del PDF ("API calling flow of Hot Spare (Spare)"):

1. **Inicio.**
2. Obtener el token: `POST /api/hpcgw/v1/token/get`.
3. Obtener la identidad de hot spare: `POST /api/hpcgw/v1/hotspare/add`.
4. Desde aquí, dos ramas en paralelo:
   - **Heartbeat:** ejecutar la interacción de heartbeat cada minuto con `POST /api/hpcgw/v1/hotspare/heartbeat`. Después, comprobar si el último heartbeat del equipo principal tiene más de 3 minutos de antigüedad:
     - **Sí** → tomar el lugar del equipo principal y comenzar a operar → **Fin**.
     - **No** → dejar de operar → **Fin**.
   - **Archivo de hot spare:** comprobar si hay actualizaciones en el archivo de hot spare con `POST /api/hpcgw/v1/hotspare/file/get`.
     - **Sí** → descargar el archivo de hot spare con `POST /api/hpcgw/v1/hotspare/file/downloadurl` → **Fin**.

Pasos:

1. Llame a `POST /api/hpcgw/v1/token/get` con el ARC ID y el ARC Key para obtener el token — ver [5.1.1](#511-obtener-token).

   > **Notas:**
   > - Esta es la API base; el token que devuelve se usa en las demás APIs.

2. Llame a `POST /api/hpcgw/v1/hotspare/add` para establecer la identidad de hot spare — ver [5.5](#55-hot-spare).
3. El equipo principal llama cada minuto a la API de interacción de heartbeat `POST /api/hpcgw/v1/hotspare/heartbeat`, para que se pueda detectar su estado de actividad en caso de falla.
4. Llame periódicamente a `POST /api/hpcgw/v1/hotspare/file/get` y compare la fecha que devuelve con la fecha de la última actualización del archivo local descargado, para saber si hay cambios. Si los hay, llame a `POST /api/hpcgw/v1/hotspare/file/downloadurl` para obtener la URL y descargar desde la nube el archivo de hot spare más reciente.

> **Notas:**
> - En el paso 2 de este flujo el PDF repite el texto del flujo del equipo principal ("to set the hot spare identity for host device"). Por contexto, en el flujo del equipo de respaldo la llamada establece la identidad del equipo de respaldo; confirme el valor del parámetro de identidad en [5.5](#55-hot-spare).
> - El paso 3 del PDF también habla del "host device" en el flujo del equipo de respaldo. La Figura 2-11 muestra que el equipo de respaldo envía su propio heartbeat y, a la vez, vigila el heartbeat del equipo principal (umbral de 3 minutos) para decidir si toma el control.
> - En la Figura 2-11 la rama "No" de la comprobación de archivo no está dibujada, y la ruta aparece como `hotspare/file/Downloadurl`; la ruta real es `hotspare/file/downloadurl` (con su errata literal "downloadurl" en minúsculas).

---

### 4.7 Servicios de Valor Agregado

**Descripción de la capacidad**

Este módulo ofrece capacidades de valor agregado, como la activación del paquete de monitoreo de salud (tras la activación, el dispositivo cuenta con la capacidad de mantenimiento, O&M).

**Guía de programación**

| Función | API | Referencia |
| ------- | --- | ---------- |
| Activar el servicio de monitoreo de salud para un dispositivo específico | `POST /api/hpcgw/v1/vas/opspack/active` | [5.9](#59-servicios-de-valor-agregado) |

---

### 4.8 Audio y Video

**Descripción de la capacidad**

La capacidad de audio ofrece gestión de audio personalizado y cut-in de audio (inserción de audio) para altavoces de red. Antes de usar audio personalizado, el integrador debe subir el archivo con la API de carga de audio para obtener la URL de almacenamiento del audio y su ID único, y después aplicar el audio al dispositivo indicado. La plataforma también permite consultar la lista de audios actual del dispositivo, eliminar archivos de audio configurados y ejecutar el cut-in de audio con audio personalizado o voz sintetizada. Esta capacidad aplica a los altavoces de red con tipo de dispositivo 12 y subtipo 19.

Las capacidades disponibles son (Tabla 2-1 del PDF):

| Capacidad | Descripción |
| --------- | ----------- |
| Carga de archivo de audio | Permite subir un archivo de audio a la vez. El nombre del archivo debe ser único. Se admiten los formatos MP3, WAV y AAC. El archivo no puede superar 10 MB. <br>**Nota:** si ya cuenta con una URL de archivo de audio descargable directamente, puede omitir este paso. |
| Aplicación del archivo de audio | Permite aplicar un archivo de audio ya subido a un dispositivo específico, y completar la vinculación del audio mediante la URL de almacenamiento del audio, el formato del archivo y el ID único. |
| Consulta y eliminación de audio | Permite consultar la lista de audios personalizados del dispositivo para obtener el ID, nombre, formato, tamaño, duración e información de almacenamiento de cada audio; también permite eliminar uno o varios archivos de audio por su ID. |
| Control del cut-in de audio | Permite la reproducción por cut-in con archivos de audio personalizados o voz sintetizada, con parámetros configurables como prioridad, modo de reproducción, duración de reproducción, volumen, idioma, voz (timbre) y velocidad del habla. |

**Mapa de capacidades (Figura 2-12 del PDF, "Audio & Video"):** el módulo **Audio y Video** agrupa el **dispositivo de audio** con cinco capacidades: subir archivo de audio, agregar archivo de audio al dispositivo, obtener los archivos de audio del dispositivo, eliminar archivos de audio del dispositivo y cut-in de audio. Ver [5.8 Audio y Video](#58-audio-y-video).

**Guía de programación**

Proceso típico de llamadas para la gestión de audio personalizado y el cut-in de audio en altavoces de red: el integrador primero sube el archivo de audio para obtener la URL de almacenamiento y el ID único, y luego aplica el audio al dispositivo indicado. Después puede consultar la lista de audios actual del dispositivo y eliminar archivos configurados según lo necesite. Por último, puede ejecutar la reproducción por cut-in mediante la API de cut-in de audio, con archivos de audio personalizados o voz sintetizada. Esta capacidad aplica a los altavoces de red con tipo de dispositivo 12 y subtipo 19.

Flujo de la Figura 2-13 del PDF ("API Calling Flow for Audio & Video"):

1. **Inicio.** El flujo ofrece tres entradas:
   - **Ruta opcional 1 (archivo local):** subir un archivo de audio con `POST /api/hpcgw/v1/audio/file/upload` (requiere `multipart/form-data` con `audioFile`, `fileName` y `formatType`; devuelve `audioFileUrl` y `UUID`). Continúa al paso 2.
   - **Si ya tiene una URL existente:** ir directamente al paso 2.
   - **Consultar:** ir directamente al paso 3.
2. **Aplicar el archivo de audio al dispositivo** con `POST /api/hpcgw/v1/audio/file/add` (requiere `deviceSerial` y `customAudioInfo` con la URL y el UUID).
3. **Obtener la lista de audios del dispositivo** con `POST /api/hpcgw/v1/audio/file/list/get` (requiere `deviceSerial`; devuelve `CustomAudioInfoList` con los ID).
4. **Elegir una operación** (después del paso 2):
   - **Eliminar archivos de audio seleccionados** con `POST /api/hpcgw/v1/audio/file/del` (requiere `deviceSerial` y `customAudioIdList`) → **Fin**.
   - **Ejecutar la reproducción por cut-in** con `POST /api/hpcgw/v1/audio/inter/cut` (requiere `deviceSerial`, `audioLevel`, `volume` y `playAudioList` con los ID) → **Fin**.

Pasos:

1. Llame a `POST /api/hpcgw/v1/audio/file/upload` para subir un archivo de audio y obtener la URL de almacenamiento del audio (`audioFileUrl`) y su identificador único (`uuid`). Los formatos de audio admitidos son MP3, WAV y AAC, y un archivo no puede superar 10 MB.
2. Llame a `POST /api/hpcgw/v1/audio/file/add` para aplicar un archivo de audio ya subido a un dispositivo específico. Antes de llamar a esta API, obtenga la URL de almacenamiento y el ID único del archivo mediante la API de carga de audio.
3. Llame a `POST /api/hpcgw/v1/audio/file/list/get` para consultar la lista de audios del dispositivo.
4. Llame a `POST /api/hpcgw/v1/audio/file/del` para eliminar uno o varios archivos de audio configurados.
5. Llame a `POST /api/hpcgw/v1/audio/inter/cut` para ejecutar el cut-in de audio. Como fuente del cut-in se pueden usar archivos de audio personalizados o voz sintetizada (TTS), con parámetros configurables como prioridad del audio, modo de reproducción, duración de reproducción, volumen de difusión, idioma del TTS, voz (timbre) y velocidad del habla.

Todas estas APIs se documentan en [5.8 Audio y Video](#58-audio-y-video).

> **Notas:**
> - La Figura 2-13 usa algunos nombres de campo de forma abreviada o con mayúsculas distintas (`UUID`, `CustomAudioInfoList`, `customAudioIdList`, `volume`). En la referencia de API los campos son `uuid`, `customAudioIDList` y `audioVolume`; use siempre los nombres de [5.8](#58-audio-y-video).

---

### 4.9 Instalador

**Descripción de la capacidad**

Este módulo ofrece capacidades relacionadas con el instalador, como consultar la información de los empleados del instalador.

**Guía de programación**

Llame a `POST /api/hpcgw/v1/installers/search` para obtener la información de los empleados del instalador. Se admite la búsqueda por correo electrónico, nombre de usuario o número de teléfono, y también la búsqueda difusa. Ver [5.11 Instalador](#511-instalador).

---

### 4.10 Envío de Mensajes por Webhook

> **Notas:**
> - Una vez configurado el Webhook, las notificaciones de eventos se envían por Webhook y el sondeo original puede dejar de recibir mensajes. Si ya implementó las notificaciones de eventos mediante sondeo (`/api/hpcgw/v1/mq/messages`), debe contactar al soporte técnico para cambiar del sondeo al Webhook.

**Flujo de integración del Webhook**

El diagrama de secuencia del PDF (sin número de figura) involucra tres participantes: el **integrador**, el **servicio HPP OpenAPI** y el **endpoint del Webhook** (su servidor de callback):

1. El integrador crea o actualiza la información del Webhook con `/api/hpcgw/webhook/v1/config/save`.
2. El servicio OpenAPI llama a la URL de callback con una solicitud HTTP GET de verificación.
3. El endpoint del Webhook responde a la verificación.
4. El servicio OpenAPI crea o actualiza la configuración del Webhook.
5. El servicio OpenAPI responde al integrador.
6. El integrador se suscribe a los eventos con `/api/hpcgw/v1/mq/subscribe`.
7. El servicio OpenAPI envía los mensajes de evento a la dirección del Webhook configurada previamente.
8. El integrador recibe los mensajes a través del endpoint del Webhook configurado.

Pasos:

1. Llame a la API `POST /api/hpcgw/webhook/v1/config/save` para crear la configuración del Webhook — ver [5.10](#510-webhook).
2. Llame a la API `POST /api/hpcgw/v1/mq/subscribe` para suscribirse a los eventos — ver [5.6](#56-mensajes-de-alarma).
3. Reciba las notificaciones de eventos en el endpoint del Webhook configurado. Devuelva un código de estado HTTP 2XX en caso de éxito y uno distinto de 2XX en caso de falla. El tiempo de espera es de 5 segundos.

**Control de seguridad**

> **Notas:**
> - Por seguridad, las URL de callback deben usar HTTPS en todas las operaciones del Webhook.

1. **Verificación de la firma de la URL de callback**

   Cuando el integrador crea una configuración de Webhook mediante la API, el servicio OpenAPI primero verifica la URL de callback enviándole una solicitud HTTPS GET con los siguientes headers: `X-Hook-Batch-Id` (cadena aleatoria) y `X-Hook-Timestamp` (timestamp de inicio de la solicitud).

   Criterio de verificación: la respuesta debe incluir en sus headers un `X-Hook-Signature` (ver [X-Hook-Signature](#x-hook-signature) y el ejemplo de código más abajo), y la firma debe pasar la validación. El Webhook solo se crea después de una validación exitosa. Del mismo modo, al actualizar el Webhook se repite el mismo proceso de verificación para confirmar la validez de la URL.

2. **Verificación de la firma de los mensajes enviados**

   Para garantizar la seguridad de los mensajes (protección contra alteración y contra reenvío/replay), el receptor debe verificar al remitente. Cuando el servicio envía una solicitud HTTP POST a la URL de callback, los headers relacionados con el Webhook son los siguientes (Tabla 2-2 del PDF):

   | Header HTTP | Descripción |
   | ----------- | ----------- |
   | X-Hook-Batch-Id | Coincide con el `batchId` del body de la solicitud. |
   | X-Hook-Signature | Firma digital (formato: algoritmo + firma). Por ejemplo: <br>`sha256=ede4cd6ad2e2b76b81d5c403234629a36a9d75793b12c7b9e382c8f061d1bf61` <br>El receptor la usa para verificar al remitente. |
   | X-Hook-Timestamp | Timestamp de inicio de la solicitud. El receptor debe validarlo para asegurar la vigencia de la firma y mejorar la seguridad; por ejemplo, la desviación del timestamp no debería superar 1 minuto. |

   > **Notas:**
   > - Al registrar el Webhook, el integrador debe especificar una clave secreta del Webhook (`signSecret`) en la API `POST /api/hpcgw/webhook/v1/config/save`. Si el campo no se envía, se usa por defecto la SecretKey (SK) del integrador.

#### X-Hook-Signature

1. **Prefijo:** identificador de la función hash (actualmente fijo: `sha256`).
2. **Delimitador:** signo igual (`=`).
3. **Firma digital:** valor hash codificado en hexadecimal, generado así:
   - Concatene los siguientes elementos para formar el mensaje: timestamp de la solicitud (igual a `X-Hook-Timestamp`), punto (`.`) y `batchId`.
   - Determine la función hash a partir del prefijo (p. ej., SHA-256) y genere el MAC con el algoritmo HMAC usando la clave secreta (el `signSecret` del registro del Webhook).
   - Codifique el MAC en hexadecimal para obtener la firma final.

**Ejemplo de código del algoritmo de firma (Java):**

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class SignatureDemo {
  private static final String HASH_ALGORITHM = "HmacSHA256";
  public static String generateSignature(String secret, String timestamp, String batchId) throws Exception {
    // Step 1: Concatenate `Message`
    String message = timestamp + "." + batchId;
    // Step 2: Generate `MAC` using `secret` as a key with `HmacSHA256`
    Mac mac = Mac.getInstance(HASH_ALGORITHM);
    SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HASH_ALGORITHM);
    mac.init(secretKey);
    byte[] rawMac = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));

    // Step 3: Convert `MAC` to a hexadecimal string
    StringBuilder hexString = new StringBuilder();
    for (byte b : rawMac) {
      hexString.append(String.format("%02x", b));
    }
    // The final signature format: `sha256=<signature>`
    return "sha256=" + hexString.toString();
  }

  public static void main(String[] args) {
    try {
      String secret = "your_secret_key";
      Long timestamp = System.currentTimeMillis();
      String batchId = "ebd5a32a518c423f91d4f889a9d5e841";
      String signature = generateSignature(secret, timestamp + "", batchId);
      System.out.println("Generated Signature: " + signature);
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
```

**Ejemplo de mensaje:**

```json
{
  "batchId": "9dce56d70exxxx202d3d56691fc7",
  "list": [
    {
      "messageId": "e21a5d62fxxxxxxx82d29a2e55952",
      "accountNumber": "12XX",
      "deviceSerial": "Q01XXXXXX",
      "formatType": "JSON",
      "alarmData": "{\"CIDEvent\":{\"code\":1401,\"description\":\"DisarmOperation\",\"evttype\":\"13\",\"system\":1,\"systemName\":\"Area 1\",\"userName\":\"user@xxx.net\",\"userNo\":502},\"deviceSerial\":\"Q01XXXXXX\",\"eventDescription\":\"CID event\",\"eventType\":\"cidEvent\",\"relationId\":\"053f29d4-4d51-xxxx-439e502209e7\",\"triggerTime\":\"2025-06-19T21:04:41\",\"version\":\"v30\"}"
    },
    {
      "messageId": "e21a5d62f8xxxxxxx29a2e55953",
      "accountNumber": "12XX",
      "deviceSerial": "Q01XXXXXX",
      "formatType": "JSON",
      "alarmData": "{\"CIDEvent\":{\"code\":1401,\"description\":\"DisarmOperation\",\"evttype\":\"13\",\"system\":1,\"systemName\":\"Area 1\",\"userName\":\"user@xxx.net\",\"userNo\":502},\"deviceSerial\":\"Q01XXXXXX\",\"eventDescription\":\"CID event\",\"eventType\":\"cidEvent\",\"relationId\":\"053f29d4-4d51-xxxx-439e502209e7\",\"triggerTime\":\"2025-06-19T21:04:41\",\"version\":\"v30\"}"
    }
  ]
}
```

> **Notas:**
> - El campo `alarmData` es una cadena JSON serializada; debe decodificarse por separado. Su contenido sigue el formato de los mensajes de evento descritos en [A.4 Detalles de Eventos](APENDICE-A.md#a4-detalles-de-eventos) (en el ejemplo, un evento CID `cidEvent`).
> - El código Java se reindentó a 2 espacios y se quitaron las marcas de bloque (```` ```java ````) que el PDF incluye dentro del propio ejemplo; el código no cambia.
> - Las APIs de configuración del Webhook (consultar, guardar y eliminar) se documentan en [5.10 Webhook](#510-webhook).

---

### 4.11 Flujos de referencia del laboratorio SYSCOM

> **Notas:**
> - Material SYSCOM, no incluido en el PDF de la guía OpenAPI V2.15.500. Resume los flujos que se validaron en el laboratorio y en los demos de este repositorio.
> - Todas las llamadas (excepto `token/get`) llevan el header `Authorization: Bearer <accessToken>` y van contra el `areaDomain` devuelto por [5.1.1](#511-obtener-token).

#### 4.11.1 Supervisión por instalación (demo Torre de control)

1. `token/get` — ver [5.1.1](#511-obtener-token).
2. `site/search` + `device/list` — ver [5.2.1](#521-información-del-sitio) y [5.3.1](#531-información-del-dispositivo).
3. Filtrar los dispositivos por `siteID`.
4. `mq/subscribe` (`subMode`: `all` o `list`) — ver [5.6](#56-mensajes-de-alarma).
5. Ciclo `mq/messages` (long polling de ~20 s) + `mq/offset`.
6. Opcional: `alarm/pictureurl` para las imágenes con URL `ISAPI_FILES` (ver [4.3](#43-eventos-y-alarmas)).
7. `mq/subscribe` con `subType: 0` al salir.

#### 4.11.2 Aviso por altavoz IP

1. Subir el archivo (proxy multipart del laboratorio o `audio/file/upload` de HPP) — ver [5.8](#58-audio-y-video).
2. `audio/file/add` por número de serie → `customAudioID` **local al equipo**.
3. `audio/inter/cut` con `audioVolume`, `audioLevel` y `playAudioList`.
4. El TTS (`speechSynthesis`) no requiere ID; la lista de reproducción puede mezclar archivos y TTS (`playMode`: `order` / `loop`).
5. Para detener: `enabled: false`.

#### 4.11.3 Alta de instalación

1. `site/add` (`timeZone` según [A.3 Lista de Zonas Horarias](APENDICE-A.md#a3-lista-de-zonas-horarias)) — ver [5.2.1](#521-información-del-sitio).
2. `v2/device/add` con número de serie y `siteId` — ver [5.3.1](#531-información-del-dispositivo).
3. Compartir el sitio o hacer el handover (entrega del sitio al cliente) cuando corresponda — ver [5.2.2](#522-relación-del-sitio).

---

## Capítulo 5 — Referencia de API

> **Notas:**
> - Todas las rutas usan el prefijo `/api/hpcgw/`. La única llamada que va al dominio de primer nivel es `token/get`; todas las demás usan el `areaDomain` que devuelve.
> - Salvo que se indique otra cosa, cada API requiere los headers `Content-Type: application/json` y `Authorization: Bearer <accessToken>`.
> - Un `errorCode` igual a `"0"` indica éxito. Cualquier otro valor se consulta en [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

---

### 5.1 Funciones Comunes

#### 5.1.1 Obtener Token

`POST /api/hpcgw/v1/token/get`

Obtiene la información del token de acceso.

**URL de Solicitud:** `https://api.hik-partner.com/api/hpcgw/v1/token/get`

| Área    | Dominio                       |
| ------- | ----------------------------- |
| General | `https://api.hik-partner.com` |

> **Notas:**
> - El token obtenido es válido durante 7 días, con precisión de milisegundos. Si caduca, la API devuelve el código `LAP500004` y es necesario solicitar un token nuevo con la API Key.
> - Esta es la única API que se llama contra el dominio de primer nivel. Las demás deben usar el `areaDomain` de la respuesta.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo   | Ubicación | Descripción |
| --------- | --------- | ------ | --------- | ----------- |
| appKey    | Requerido | String | Body      | Access Key ID (API Key o ARC ID). |
| secretKey | Requerido | String | Body      | Secret Access Key (API Secret o ARC Key). |

**Parámetros de Respuesta:**

| Parámetro   | Tipo   | Descripción |
| ----------- | ------ | ----------- |
| accessToken | String | Token de acceso. Se usa como información de autenticación en el header de las demás APIs de esta guía. |
| expireTime  | Long   | Fecha de expiración del token de acceso, en milisegundos. Es válido durante 7 días; al caducar se puede obtener de nuevo. |
| areaDomain  | String | Dominio del área. Úselo al llamar a las demás APIs de esta guía. Valores posibles: <br>• Europa: `https://ieuapi.hik-partner.com` <br>• Norteamérica: `https://iusapi.hik-partner.com` <br>• Sudamérica: `https://isaapi.hik-partner.com` <br>• Singapur: `https://isgpapi.hik-partner.com` <br>• Rusia: `https://api.hik-partnerru.com` |

**Ejemplo de Respuesta:**

```json
{
  "accessToken": "jmna8qnqg8d3dgnzs87m4v2dme3l",
  "expireTime": 1585747008592,
  "areaDomain": "https://ieuapi.hik-partner.com"
}
```

> **Notas:**
> - Los dominios originales se podían usar hasta finales de 2023: Rusia `https://api.hik-proconnectru.com` y resto del mundo `https://api.hik-proconnect.com`.
> - En el ejemplo del PDF las claves `"accessToken "` y `"expireTime "` traen un espacio final por errata; aquí se muestran corregidas.
> - El ejemplo del PDF muestra los campos al nivel raíz. En el resto de la guía la respuesta sigue el formato `{ "errorCode", "message", "data" }`. Verifique la estructura real en su entorno antes de fijar el parseo.

---

### 5.2 Gestión de Sitios

#### 5.2.1 Información del Sitio

##### 5.2.1.1 Agregar Sitio

`POST /api/hpcgw/v1/site/add`

Agrega la información de un sitio.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/add`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| name          | Requerido | String  | Body      | Nombre del sitio. Máximo 128 caracteres. |
| timeZone      | Requerido | Integer | Body      | Zona horaria. Ver [A.3 Lista de Zonas Horarias](APENDICE-A.md#a3-lista-de-zonas-horarias). |
| timeSync      | Opcional  | Boolean | Body      | Si se sincroniza la zona horaria. Por defecto es `false`. |
| siteState     | Opcional  | String  | Body      | Estado donde se ubica el sitio. Máximo 128 caracteres. |
| siteCity      | Opcional  | String  | Body      | Ciudad donde se ubica el sitio. Máximo 128 caracteres. |
| siteStreet    | Opcional  | String  | Body      | Calle donde se ubica el sitio. Máximo 128 caracteres. |
| location      | Opcional  | String  | Body      | Dirección detallada del sitio. Máximo 128 caracteres. |

**Ejemplo de Solicitud:**

```json
{
  "name": "",
  "siteCity": "",
  "siteState": "",
  "siteStreet": "",
  "location": "",
  "timeSync": true,
  "timeZone": 222
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### 5.2.1.2 Eliminar Sitio

`POST /api/hpcgw/v1/site/{id}/delete`

Elimina la información de un sitio.

> **Notas:**
> - Al eliminar un sitio se eliminan también todos sus dispositivos.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/{id}/delete`

**Parámetros de URL:**

| Parámetro | Requerido | Tipo   | Descripción |
| --------- | --------- | ------ | ----------- |
| id        | Requerido | String | ID del sitio (sistema). |

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### 5.2.1.3 Editar Sitio

`POST /api/hpcgw/v1/site/{id}/update`

Edita la información de un sitio.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/{id}/update`

**Parámetros de URL:**

| Parámetro | Requerido | Tipo   | Descripción |
| --------- | --------- | ------ | ----------- |
| id        | Requerido | String | ID del sitio (sistema). |

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| name          | Requerido | String | Body      | Nombre del sitio. Máximo 128 caracteres. |
| siteState     | Opcional  | String | Body      | Estado donde se ubica el sitio. Máximo 128 caracteres. |
| siteCity      | Opcional  | String | Body      | Ciudad donde se ubica el sitio. Máximo 128 caracteres. |
| siteStreet    | Opcional  | String | Body      | Calle donde se ubica el sitio. Máximo 128 caracteres. |
| location      | Opcional  | String | Body      | Dirección detallada del sitio. Máximo 128 caracteres. |

**Ejemplo de Solicitud:**

```json
{
  "name": "Apartment",
  "siteCity": "Singapore",
  "siteState": "",
  "siteStreet": "",
  "location": ""
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - A diferencia de `site/add`, esta API no recibe `timeZone` ni `timeSync`.

---

##### 5.2.1.4 Buscar Sitios

`POST /api/hpcgw/v1/site/search`

Busca la información de los sitios.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/search`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| page          | Opcional  | Integer | Body      | Número de página actual. Por defecto es la primera página. |
| pageSize      | Opcional  | Integer | Body      | Elementos por página. Por defecto 20. |
| search        | Opcional  | String  | Body      | Condición de búsqueda: nombre del sitio, dirección, instalador, etc. Admite búsqueda difusa. |

**Ejemplo de Solicitud:**

```json
{
  "page": 0,
  "pageSize": 0,
  "search": ""
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.rows[].id | String | ID del sitio. |
| data.rows[].siteName | String | Nombre del sitio. |
| data.rows[].timeZone | String | Zona horaria. Ver [A.3 Lista de Zonas Horarias](APENDICE-A.md#a3-lista-de-zonas-horarias). |
| data.rows[].timeSync | Boolean | Si se sincroniza la zona horaria. Por defecto es `false`. |
| data.rows[].installerId | String | ID del instalador. Si hay varios, se devuelve el primero. |
| data.rows[].installerFirstName | String | Nombre del instalador. |
| data.rows[].installerLastName | String | Apellido del instalador. |
| data.rows[].siteState | String | Estado donde se ubica el sitio. |
| data.rows[].siteCity | String | Ciudad donde se ubica el sitio. |
| data.rows[].siteStreet | String | Calle donde se ubica el sitio. |
| data.rows[].location | String | Dirección detallada del sitio. |
| data.rows[].siteDeliveryStatus | Integer | `0`: sitio sin handover · `1`: handover en curso · `2`: handover completado. |
| data.rows[].cloudEnable | Boolean | `true` si al menos un dispositivo tiene el permiso habilitado; `false` solo si todos lo tienen deshabilitado. |
| data.rows[].sharedInfo | Object | Información de compartición del sitio. |
| data.rows[].sharedInfo.shareType | Integer | `0`: el sitio es de la empresa actual y no se ha compartido. <br>`1`: es de la empresa actual y se compartió con un partner de mantenimiento. <br>`2`: otra empresa lo compartió con usted y usted da el mantenimiento. <br>`3`: es de la empresa actual y se compartió con instaladores para la instalación y configuración de dispositivos. Al hacer el handover al cliente, esta compartición se revoca automáticamente. <br>`4`: otra empresa lo compartió con usted y usted da la instalación y configuración de dispositivos. |
| data.rows[].sharedInfo.shareState | Integer | `0`: en espera de autenticación del usuario final. <br>`1`: en espera de que la otra empresa acepte. <br>`2`: compartido actualmente. <br>`3`: el usuario final rechazó la solicitud. <br>`4`: la otra empresa rechazó la solicitud. |
| data.rows[].sharedInfo.shareToCompany | Object | Se devuelve cuando usted comparte sus sitios con otras empresas. Solo puede existir este nodo o `shareFromCompany`, no ambos. |
| data.rows[].sharedInfo.shareFromCompany | Object | Se devuelve cuando otra empresa comparte el sitio con usted. Solo puede existir este nodo o `shareToCompany`, no ambos. |
| …shareToCompany/shareFromCompany.address | String | Dirección de la empresa que comparte o recibe. |
| …shareToCompany/shareFromCompany.companyName | String | Nombre de la empresa que comparte o recibe. |
| …shareToCompany/shareFromCompany.email | String | Correo electrónico. |
| …shareToCompany/shareFromCompany.firstName | String | Nombre de la persona. |
| …shareToCompany/shareFromCompany.lastName | String | Apellido de la persona. |
| …shareToCompany/shareFromCompany.phone | String | Teléfono de la empresa. |
| …shareToCompany/shareFromCompany.street | String | Calle donde se ubica la empresa. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "page": 1,
    "pageSize": 20,
    "rows": [
      {
        "id": "",
        "installerFirstName": "",
        "installerId": "",
        "installerLastName": "",
        "location": "",
        "siteCity": "",
        "siteName": "",
        "siteState": "",
        "siteStreet": "",
        "timeSync": true,
        "timeZone": "182",
        "siteDeliveryStatus": 2,
        "cloudEnable": true,
        "sharedInfo": {
          "shareState": 4,
          "shareType": 3,
          "shareToCompany": {
            "address": "",
            "companyName": "",
            "email": "",
            "firstName": "",
            "lastName": "",
            "phone": "",
            "street": ""
          }
        }
      },
      {
        "id": "",
        "installerFirstName": "",
        "installerId": "",
        "installerLastName": "",
        "location": "",
        "siteCity": "",
        "siteName": "",
        "siteState": "",
        "siteStreet": "",
        "timeSync": true,
        "timeZone": "182",
        "siteDeliveryStatus": 2,
        "cloudEnable": true,
        "sharedInfo": {
          "shareState": 4,
          "shareType": 4,
          "shareFromCompany": {
            "address": "",
            "companyName": "",
            "email": "",
            "firstName": "",
            "lastName": "",
            "phone": "",
            "street": ""
          }
        }
      }
    ],
    "total": 0,
    "totalPage": 0
  },
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla de respuesta del PDF lista los campos del sitio directamente bajo `data`, pero el ejemplo los coloca dentro de `data.rows[]`, junto con `page`, `pageSize`, `total` y `totalPage`. Aquí se documenta la estructura del ejemplo.
> - `timeZone` se envía como Integer en `site/add`, pero `site/search` lo devuelve como String (`"182"`).

---

#### 5.2.2 Relación del Sitio

##### 5.2.2.1 Compartir Sitio

`POST /api/hpcgw/v1/site/share`

Comparte un sitio.

> **Notas:**
> - Existen dos escenarios para compartir un sitio, y esta API solo aplica al primero:
>   - El sitio no se ha entregado (sin handover), sino que se comparte con un proveedor de servicios de instalación para obtener servicios de instalación de dispositivos.
>   - El usuario final autoriza a los instaladores a administrar el sitio, y el sitio se comparte con un partner de mantenimiento para brindar servicios al usuario final de forma conjunta.
> - Solo se pueden compartir sitios que no se han transferido.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/share`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| email         | Requerido | String  | Body      | Correo electrónico del empleado de la empresa con la que se comparte el sitio. Además, esa empresa debe tener habilitada la función de compartir sitios. |
| siteId        | Requerido | String  | Body      | ID del sitio que se va a compartir. |
| applyTimeType | Opcional  | Integer | Body      | Duración de la autorización del sitio: <br>`-1` o vacío: permanente. <br>`0`: 1 hora. <br>`1`: 2 horas. <br>`2`: 4 horas. <br>`3`: 8 horas. <br>`4`: 24 horas. |
| describe      | Opcional  | String  | Body      | Información adicional que se mostrará a los empleados. |

**Ejemplo de Solicitud:**

```json
{
  "email": "xxx@example.com",
  "describe": "additional information",
  "siteId": "xxxxx",
  "applyTimeType": 0
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - En el ejemplo del PDF la clave `"applyTimeType "` trae un espacio final por errata; aquí se muestra corregida.

---

##### 5.2.2.2 Cancelar Compartición del Sitio

`POST /api/hpcgw/v1/site/share/cancel/{id}`

Cancela la compartición de un sitio.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/share/cancel/{id}`

**Parámetros de URL:**

| Parámetro | Requerido | Tipo   | Descripción |
| --------- | --------- | ------ | ----------- |
| id        | Requerido | String | ID del sitio (sistema). |

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### 5.2.2.3 Asignar Administradores del Sitio

`POST /api/hpcgw/v2/site/assign`

Asigna uno o varios administradores del sitio.

> **Notas:**
> - Al asignar nuevos administradores, los administradores anteriores se eliminan. Sin embargo, no se eliminan los administradores que tienen el permiso Manage All Sites (administrar todos los sitios).

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/site/assign`

**Parámetros de Solicitud:**

| Parámetro                                    | Requerido | Tipo     | Ubicación | Descripción |
| -------------------------------------------- | --------- | -------- | --------- | ----------- |
| Content-Type                                 | Requerido | String   | Header    | `application/json` |
| Authorization                                | Requerido | String   | Header    | `Bearer <accessToken>` |
| siteIds                                      | Requerido | Array    | Body      | Lista de IDs de los sitios a los que se asigna el administrador. |
| installerPermissionTimes                     | Requerido | Object[] | Body      | ID del empleado que se asigna y vigencia del permiso de administración del sitio. Se admiten hasta 100 pares de estos dos nodos. |
| installerPermissionTimes[].expiredDurationTime | Requerido | Long   | Body      | Vigencia del permiso de administración del sitio (unidad: ms): `-1` (permanente). |
| installerPermissionTimes[].installerId       | Requerido | String   | Body      | ID del empleado que se asigna. De 1 a 48 caracteres; no puede estar vacío. El ID del empleado se obtiene con `POST /api/hpcgw/v1/installers/search`. El empleado debe tener el permiso de administración de sitios. Para quitar a un empleado de la lista de administradores del sitio, asigne el sitio al administrador de la empresa. |

**Ejemplo de Solicitud:**

```json
{
  "siteIds": [
    "aaaa",
    "bbbb"
  ],
  "installerPermissionTimes": [
    {
      "installerId": "xxxx",
      "expiredDurationTime": -1
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

##### 5.2.2.4 Obtener Administradores del Sitio

`POST /api/hpcgw/v1/site/sitemanagers`

Obtiene la lista de administradores del sitio.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/sitemanagers`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| siteId        | Requerido | String | Body      | ID del sitio. |

**Ejemplo de Solicitud:**

```json
{
  "siteId": "aaaaa"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.installerMangers | Object[] | Información de los administradores del sitio. |
| data.installerMangers[].installerId | String | ID del administrador del sitio. |
| data.installerMangers[].installerFirstName | String | Nombre del administrador del sitio. |
| data.installerMangers[].installerLastName | String | Apellido del administrador del sitio. |
| data.installerMangers[].installerEmail | String | Correo electrónico del administrador del sitio. |
| data.installerMangers[].installerPhone | String | Teléfono del administrador del sitio. |
| data.installerMangers[].expireDurationTime | Long | Fecha de expiración del permiso de administrador del sitio, con precisión de milisegundos: `-1` (vigencia permanente). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "installerMangers": [
      {
        "installerId": "aaa",
        "installerFirstName": "aa",
        "installerLastName": "bb",
        "installerEmail": "aa@outlook.net",
        "installerPhone": "6523123",
        "expireDurationTime": "1873727183782"
      }
    ]
  },
  "errorCode": "0"
}
```

> **Notas:**
> - El nombre del campo `installerMangers` (sin la "a" de "Managers") es literal en el PDF, tanto en la tabla como en el ejemplo; se conserva tal cual.
> - La tabla declara `expireDurationTime` como Long, pero el ejemplo lo devuelve como String (`"1873727183782"`).
> - En la solicitud de `v2/site/assign` el campo equivalente se llama `expiredDurationTime` (con "d"), mientras que aquí la respuesta usa `expireDurationTime`.

---

##### 5.2.2.5 Hacer Handover de Sitios por Compartición

`POST /api/hpcgw/v2/site/handover/share`

Realiza el handover (entrega del sitio al cliente) por compartición.

> **Notas:**
> - Una vez completadas la instalación y la configuración de los dispositivos, puede entregar los dispositivos a su cliente (usuario final) mediante compartición. Después de que el cliente acepta el handover:
>   - Usted conserva la propiedad de los dispositivos y el cliente solo tiene permiso para usarlos.
>   - Usted puede definir los permisos de dispositivo que comparte con el cliente.
> - Para los sitios que ya se entregaron por compartición, puede llamar a esta API para compartirlos con más usuarios.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/site/handover/share`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo     | Ubicación | Descripción |
| ------------- | --------- | -------- | --------- | ----------- |
| Content-Type  | Requerido | String   | Header    | `application/json` |
| Authorization | Requerido | String   | Header    | `Bearer <accessToken>` |
| siteId        | Requerido | String   | Body      | ID del sitio. |
| batchHcAccount | Requerido | Object[] | Body     | Información de las cuentas de los usuarios finales. |
| batchHcAccount[].hcAccount | Requerido | String | Body | Cuenta del usuario final. |
| batchHcAccount[].type | Requerido | Integer | Body | Tipo de cuenta: `0`: correo electrónico · `1`: número de teléfono. |
| userSharePermission | Requerido | Object[] | Body | Detalle de los permisos de dispositivo que se comparten con los usuarios finales. |
| userSharePermission[].deviceSerial | Requerido | String | Body | Número de serie del dispositivo. De 1 a 9 caracteres. |
| userSharePermission[].ax2PermissionDetails | Opcional | Object | Body | Información de permisos del panel de control de seguridad que se comparte con los usuarios. Válido para los paneles de control de seguridad de la serie AX PRO. |
| userSharePermission[].ax2PermissionDetails.ax2Permission | Opcional | Array | Body | Permisos del panel de control de seguridad que se comparten con los usuarios: <br>• Permiso para compartir dispositivos con otros usuarios: <br>`20`: permiso de compartir dispositivo. <br>• Permisos de operación (AX PRO V1.2.7 y posteriores): <br>`0`: armar. <br>`1`: desarmar / silenciar alarma. <br>`6`: ver registros/estado. <br>`7`: bypass de zona. <br>`8`: control de automatización. <br>• Permisos de notificación (AX PRO V1.2.9 y posteriores): <br>`10`: PircamGif. <br>`11`: VideoClips. <br>`12`: alarma de pánico desde teclado/llavero/app. <br>`13`: alarma médica desde teclado/llavero. <br>`14`: alarma de incendio desde teclado. <br>`15`: evento de alarma inteligente. <br>`16`: tapa del panel abierta. <br>`17`: tapa de periféricos abierta. <br>`18`: alarma de zona. <br>`19`: operación del panel. <br>`21`: estado del panel (alimentación y batería). <br>`22`: estado del panel (comunicaciones). <br>`23`: estado de zona. <br>`24`: estado de periféricos. |
| userSharePermission[].ax2PermissionDetails.areaPermission | Opcional | Array | Body | Permisos por partición (área) del panel de control de seguridad que se comparten con los usuarios (AX PRO V1.2.9 y posteriores). Puede indicar la lista de números de partición (área) para compartir los permisos correspondientes: `-1` (todas). |
| userSharePermission[].otherPermissionDetails | Opcional | Object[] | Body | Información de otros permisos de dispositivo que se pueden compartir con los usuarios. Este nodo es válido para dispositivos que no son paneles de control de seguridad AX PRO. |
| userSharePermission[].otherPermissionDetails[].permission | Opcional | Integer | Body | Permisos que se pueden compartir: `0`: vista en vivo · `1`: reproducción · `2`: audio bidireccional · `3`: alarma · `4`: llamada / abrir puerta · `5`: PTZ · `6`: permiso de compartir (no admitido en permisos a nivel de canal). <br>Permisos que se pueden compartir según el tipo de dispositivo: <br>• Canal de dispositivo de codificación: vista en vivo, reproducción, audio bidireccional, alarma y PTZ. <br>• Canal de dispositivo de control de acceso: vista en vivo, reproducción, audio bidireccional, alarma y llamada / abrir puerta. <br>• Canal de dispositivo de videoportero: vista en vivo, reproducción, audio bidireccional, alarma y llamada / abrir puerta. <br>• Canal de timbre (doorbell): vista en vivo, reproducción, audio bidireccional, alarma y llamada. <br>• Canal de Hik-ProConnect Box: vista en vivo, reproducción, alarma y PTZ. <br>• Dispositivo radar: alarma. <br>• Switch y router: no se puede compartir ningún permiso. |
| userSharePermission[].otherPermissionDetails[].channelNo | Opcional | Array | Body | Lista de números de canal que se comparten con el usuario: `-1` (todos los canales). Este nodo solo es válido para permisos a nivel de canal. |
| remark        | Opcional  | String   | Body      | Observaciones. |

**Ejemplo de Solicitud:**

```json
{
  "siteId": "aaaaa",
  "batchHcAccount": [
    {
      "hcAccount": "ccccc@example.com",
      "type": 0
    }
  ],
  "userSharePermission": [
    {
      "deviceSerial": "ABC",
      "otherPermissionDetails": [
        {
          "permission": 1,
          "channelNo": ["1", "2"]
        },
        {
          "permission": 3,
          "channelNo": ["-1"]
        }
      ]
    },
    {
      "deviceSerial": "DEF",
      "ax2PermissionDetails": {
        "ax2Permission": [1, 2],
        "areaPermission": ["-1"]
      }
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

> **Notas:**
> - La tabla del PDF escribe el campo como `hcAcccount` (con tres "c"), pero el ejemplo usa `hcAccount`, igual que el resto de las APIs de esta subsección. Aquí se documenta `hcAccount`.
> - El ejemplo usa el valor `2` en `ax2Permission`, que no aparece en la lista de valores de la tabla.
> - `channelNo` y `areaPermission` se envían como arreglos de String (`["-1"]`), aunque representen números.

---

##### 5.2.2.6 Buscar Usuarios Finales del Handover por Compartición

`POST /api/hpcgw/v2/site/customer/list`

Busca la lista de usuarios finales de un handover por compartición.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/site/customer/list`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| siteId        | Requerido | String | Body      | ID del sitio. |

**Ejemplo de Solicitud:**

```json
{
  "siteId": "aaaaa"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.customers | Object | Información de los usuarios finales. |
| data.customers[].hcAccount | String | Cuenta del usuario final (el PDF la describe como "ID del administrador del sitio"; ver Notas). |
| data.customers[].type | Integer | Tipo de cuenta: `0`: correo electrónico · `1`: número de teléfono. |
| data.customers[].status | String | Estado de la compartición: `"0"`: rechazada · `"1"`: aprobada · `"2"`: pendiente · `"3"`: expirada · `"4"`: no registrado. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "customers": [
      {
        "hcAccount": "abc@example.com",
        "type": 0,
        "status": "0"
      }
    ]
  },
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla declara `customers` como Object, pero el ejemplo lo devuelve como arreglo; aquí se documenta como `data.customers[]`.
> - La tabla describe `hcAccount` como "Site manager ID", pero el ejemplo y el contexto de la API indican que es la cuenta (correo o teléfono) del usuario final.

---

##### 5.2.2.7 Consultar Detalle del Usuario Final del Handover por Compartición

`POST /api/hpcgw/v1/site/customer/detail`

Consulta la información de un usuario final de un handover por compartición.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/customer/detail`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| siteId        | Requerido | String | Body      | ID del sitio. |
| hcAccount     | Requerido | String | Body      | Cuenta del usuario final. |

**Ejemplo de Solicitud:**

```json
{
  "siteId": "aaaaa",
  "hcAccount": "abc@example.com"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.shareDevices | Object[] | Información de los dispositivos compartidos. |
| data.shareDevices[].deviceSerial | String | Número de serie del dispositivo. |
| data.shareDevices[].ax2PermissionDetails | Object | Información de permisos del panel de control de seguridad compartida con los usuarios. Válido para los paneles de control de seguridad de la serie AX PRO. |
| data.shareDevices[].ax2PermissionDetails.ax2Permission | Array | Permisos del panel de control de seguridad compartidos con el usuario. Consulte los valores en [5.2.2.5 `v2/site/handover/share`](#5225-hacer-handover-de-sitios-por-compartición). |
| data.shareDevices[].ax2PermissionDetails.areaPermission | Array | Permisos por partición (área) del panel de control de seguridad compartidos con el usuario (AX PRO V1.2.9 y posteriores). Lista de números de partición (área) con los permisos correspondientes: `-1` (todas). |
| data.shareDevices[].otherPermissionDetails | Object[] | Información de otros permisos de dispositivo compartidos con el usuario. Este nodo es válido para dispositivos que no son paneles de control de seguridad AX PRO. |
| data.shareDevices[].otherPermissionDetails[].permission | Integer | Permisos que se pueden compartir. Consulte los valores en [5.2.2.5 `v2/site/handover/share`](#5225-hacer-handover-de-sitios-por-compartición). |
| data.shareDevices[].otherPermissionDetails[].channelNo | Array | Lista de números de canal compartidos con el usuario: `-1` (todos los canales). Este nodo solo es válido para permisos a nivel de canal. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "shareDevices": [
      {
        "deviceSerial": "ABC",
        "otherPermissionDetails": [
          {
            "permission": 1,
            "channelNo": ["1", "2"]
          }
        ]
      },
      {
        "deviceSerial": "DEF",
        "ax2PermissionDetails": {
          "ax2Permission": [1, 2],
          "areaPermission": ["1", "2"]
        }
      }
    ]
  },
  "errorCode": "0"
}
```

---

##### 5.2.2.8 Modificar Cuenta del Usuario Final

`POST /api/hpcgw/v1/site/customer/account/update`

Modifica la información de la cuenta del usuario final.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/customer/account/update`

**Parámetros de Solicitud:**

| Parámetro            | Requerido | Tipo    | Ubicación | Descripción |
| -------------------- | --------- | ------- | --------- | ----------- |
| Content-Type         | Requerido | String  | Header    | `application/json` |
| Authorization        | Requerido | String  | Header    | `Bearer <accessToken>` |
| siteId               | Requerido | String  | Body      | ID del sitio. |
| oldShareHc           | Requerido | Object  | Body      | Información de la cuenta antes de la modificación. |
| oldShareHc.hcAccount | Requerido | String  | Body      | Cuenta. |
| oldShareHc.type      | Requerido | Integer | Body      | Tipo de cuenta: `0`: correo electrónico · `1`: número de teléfono. |
| newShareHc           | Requerido | Object  | Body      | Información de la cuenta después de la modificación. |
| newShareHc.hcAccount | Requerido | String  | Body      | Cuenta. |
| newShareHc.type      | Requerido | Integer | Body      | Tipo de cuenta: `0`: correo electrónico · `1`: número de teléfono. |

**Ejemplo de Solicitud:**

```json
{
  "siteId": "aaaaa",
  "oldShareHc": {
    "hcAccount": "abc@example.com",
    "type": 0
  },
  "newShareHc": {
    "hcAccount": "def@example.com",
    "type": 0
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla del PDF escribe el campo como `hcAcccount` (con tres "c"), pero el ejemplo usa `hcAccount`. Aquí se documenta `hcAccount`.

---

##### 5.2.2.9 Modificar Permisos de Dispositivo del Usuario Final

`POST /api/hpcgw/v1/site/customer/devices/update`

Modifica la información de permisos de dispositivo de un usuario final.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/customer/devices/update`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| siteId        | Requerido | Array  | Body      | ID del sitio. |
| sharedHc      | Requerido | Object | Body      | Información del usuario cuyos permisos se van a editar. |
| sharedHc.hcAccount | Requerido | Long | Body   | Cuenta. |
| sharedHc.type | Requerido | String | Body      | Tipo de cuenta: `0`: correo electrónico · `1`: número de teléfono. |
| sharedHc.shareDevices | Requerido | Object | Body | Información de los dispositivos compartidos. |
| sharedHc.shareDevices[].deviceSerial | Requerido | String | Body | Número de serie del dispositivo. No puede estar vacío. De 1 a 9 caracteres. |
| sharedHc.shareDevices[].ax2PermissionDetails | Opcional | Object | Body | Información de permisos del panel de control de seguridad compartida con los usuarios. Válido para los paneles de control de seguridad de la serie AX PRO. |
| sharedHc.shareDevices[].ax2PermissionDetails.ax2Permission | Opcional | Array | Body | Permisos del panel de control de seguridad compartidos con los usuarios. Consulte los valores en [5.2.2.5 `v2/site/handover/share`](#5225-hacer-handover-de-sitios-por-compartición). |
| sharedHc.shareDevices[].ax2PermissionDetails.areaPermission | Opcional | Array | Body | Permisos por partición (área) del panel de control de seguridad compartidos con el usuario (AX PRO V1.2.9 y posteriores). Puede indicar la lista de números de partición (área) para compartir los permisos correspondientes: `-1` (todas). |
| sharedHc.shareDevices[].otherPermissionDetails | Opcional | Object | Body | Información de otros permisos de dispositivo que se pueden compartir con los usuarios. Este nodo es válido para dispositivos que no son paneles de control de seguridad AX PRO. |
| sharedHc.shareDevices[].otherPermissionDetails[].permission | Opcional | Integer | Body | Permisos que se pueden compartir. Consulte los valores en [5.2.2.5 `v2/site/handover/share`](#5225-hacer-handover-de-sitios-por-compartición). |
| sharedHc.shareDevices[].otherPermissionDetails[].channelNo | Opcional | Array | Body | Lista de números de canal compartidos con el usuario: `-1` (todos los canales). Este nodo solo es válido para permisos a nivel de canal. |

**Ejemplo de Solicitud:**

```json
{
  "siteId": "aaaaa",
  "sharedHc": {
    "hcAccount": "ccccc@yopamail.com",
    "type": 0,
    "shareDevices": [
      {
        "deviceSerial": "ABC",
        "otherPermissionDetails": [
          {
            "permission": 1,
            "channelNo": ["1", "2"]
          }
        ]
      },
      {
        "deviceSerial": "DEF",
        "ax2PermissionDetails": {
          "ax2Permission": [1, 2],
          "areaPermission": ["1", "2"]
        }
      }
    ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla del PDF tiene varias incoherencias con el ejemplo; aquí se respetan los tipos de la tabla, pero conviene guiarse por el ejemplo:
>   - `siteId` se declara como Array, pero el ejemplo lo envía como String (`"aaaaa"`), igual que en el resto de las APIs.
>   - `hcAccount` se declara como Long y `type` como String, pero el ejemplo envía `hcAccount` como String (correo) y `type` como Integer (`0`), igual que en `site/customer/account/update`.
>   - `shareDevices` y `otherPermissionDetails` se declaran como Object, pero el ejemplo los envía como arreglos.
>   - La tabla escribe `hcAcccount` (con tres "c"); el ejemplo usa `hcAccount`, que es el nombre que se documenta aquí.
> - El ejemplo del PDF es JSON inválido: cierra el arreglo `shareDevices` con `}]` (una llave de más). Aquí se corrigió mínimamente cerrándolo con `]`.

---

##### 5.2.2.10 Cancelar Compartición con el Usuario Final

`POST /api/hpcgw/v1/site/customer/cancle`

Cancela la compartición con el usuario final.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/customer/cancle`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| siteId        | Requerido | String | Body      | ID del sitio. |
| hcAccounts    | Requerido | Array  | Body      | Lista de cuentas de usuario. |

**Ejemplo de Solicitud:**

```json
{
  "siteId": "aaaaa",
  "hcAccounts": [
    "aaa",
    "bbb"
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - La ruta `cancle` es una errata literal de la API y debe usarse tal cual.
> - La tabla del PDF escribe el campo como `hcAcccounts` (con tres "c"), pero el ejemplo usa `hcAccounts`. Aquí se documenta `hcAccounts`.

---

#### 5.2.3 Team Site

##### 5.2.3.1 Crear Team Site

`POST /api/hpcgw/v1/site/team/add`

Crea un team site (sitio de equipo).

> **Notas:**
> - Si no se configura `serverType`, los servicios no se activan y no se pueden agregar dispositivos.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/team/add`

**Parámetros de Solicitud:**

| Parámetro         | Requerido | Tipo    | Ubicación | Descripción |
| ----------------- | --------- | ------- | --------- | ----------- |
| Content-Type      | Requerido | String  | Header    | `application/json` |
| Authorization     | Requerido | String  | Header    | `Bearer <accessToken>` |
| systemName        | Requerido | String  | Body      | Nombre del sitio (sistema). De 1 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| timezone          | Requerido | Integer | Body      | Zona horaria. Ver [A.3 Lista de Zonas Horarias](APENDICE-A.md#a3-lista-de-zonas-horarias). |
| syncTimezone      | Opcional  | Integer | Body      | Si se sincroniza la zona horaria del sitio con sus dispositivos: `1` (habilitar), `0` u otros valores (deshabilitar). Si el campo no se envía, queda deshabilitado por defecto. |
| serverType        | Opcional  | Array   | Body      | Servicios que se activan: `0` (servicio de gestión de video), `1` (servicio de vehículos), `2` (servicio de detección de alarmas), `[3, 6]` (servicio de control de acceso y asistencia), `4` (servicio de videoportero), `5` (servicio de reportes de análisis; requiere que el servicio de gestión de video esté activado, de lo contrario no estará disponible), `9` (servicio ANPR), `10` (servicio de detección de salud), `11` (servicio de altavoz IP). |
| systemScene       | Opcional  | Integer | Body      | Tipo de escenario: `0` (residencial), `1` (departamento), `2` (villa), `3` (tienda), `4` (oficina), `5` (fábrica), `6` (hotel), `7` (restaurante), `8` (otro), `9` (tipo de sitio vacío), `10` (comunidad), `11` (escuela). |
| systemSceneCustom | Opcional  | String  | Body      | Escenario personalizado; obligatorio cuando `systemScene=8`. Máximo 200 caracteres. |
| city              | Opcional  | String  | Body      | Ciudad del sitio (sistema). De 1 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| street            | Opcional  | String  | Body      | Calle del sitio (sistema). De 0 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| location          | Opcional  | String  | Body      | Dirección detallada del sitio (sistema). De 0 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| state             | Opcional  | String  | Body      | Estado del sitio (sistema). De 0 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| description       | Opcional  | String  | Body      | Descripción del sitio (sistema). De 0 a 500 caracteres. |

**Ejemplo de Solicitud:**

```json
{
  "location": "",
  "systemName": "New Site_20251120_204703",
  "timezone": 26,
  "syncTimezone": 1,
  "street": "",
  "city": "",
  "state": "",
  "systemScene": 9,
  "description": "",
  "serverType": [
    0,
    1
  ],
  "systemSceneCustom": ""
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| errorCode | String | Requerido. Código de estado o de error de la respuesta: `0`: éxito. |
| message | String | Opcional. Descripción del estado o del error, en correspondencia uno a uno con el código. |
| data | Object | Requerido. Objeto de datos de respuesta. |
| data.systemId | String | Requerido. ID único del sitio (sistema). |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "",
  "data": {
    "systemId": "4b8c651224b84145a6dcb2f6c08da406"
  }
}
```

> **Notas:**
> - A diferencia de las APIs de sitio de 5.2.1, los team sites usan `systemName`, `timezone` y `syncTimezone` (Integer), en lugar de `name`, `timeZone` y `timeSync` (Boolean).
> - El ID que devuelve (`data.systemId`) es el que se usa como `{id}` en `site/team/{id}/modify` y `site/team/{id}/delete`, y como `systemId` en `site/team/handover`.

---

##### 5.2.3.2 Buscar Team Sites

`POST /api/hpcgw/v1/site/team/search`

Busca team sites.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/team/search`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| page          | Opcional  | Integer | Body      | Número de página. Si se omite, por defecto es la primera página. |
| pageSize      | Opcional  | Integer | Body      | Elementos por página. Por defecto 20. |
| systemName    | Opcional  | String  | Body      | Nombre del sitio (sistema). Admite búsqueda difusa. |

**Ejemplo de Solicitud:**

```json
{
  "page": 1,
  "pageSize": 20,
  "systemName": ""
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| errorCode | String | Requerido. Código de estado o de error de la respuesta: `0`: éxito. |
| message | String | Opcional. Descripción del estado o del error. |
| data | Object | Datos que se devuelven cuando la solicitud tiene éxito. |
| data.total | Integer | Número total de resultados. |
| data.page | Integer | Número de página actual. Si está vacío, por defecto es la primera página. |
| data.pageSize | Integer | Número de registros por página. |
| data.totalPages | Integer | Número total de páginas. |
| data.rows | Object[] | Lista de información de los sitios (sistemas). |
| data.rows[].systemId | String | ID del sitio (sistema). |
| data.rows[].country | String | País del sitio (sistema). |
| data.rows[].systemName | String | Nombre de la partición (según el PDF; ver Notas). |
| data.rows[].city | String | Ciudad del sitio (sistema). |
| data.rows[].timezone | number | Zona horaria. Ver [A.3 Lista de Zonas Horarias](APENDICE-A.md#a3-lista-de-zonas-horarias). |
| data.rows[].street | String | Calle del sitio (sistema). |
| data.rows[].location | String | Dirección detallada del sitio (sistema). De 0 a 128 caracteres. |
| data.rows[].state | String | Estado del sitio (sistema). De 0 a 128 caracteres. |
| data.rows[].description | String | Descripción del sitio (sistema). |
| data.rows[].systemScene | Integer | Tipo de escenario: `0` (residencial), `1` (departamento), `2` (villa), `3` (tienda), `4` (oficina), `5` (fábrica), `6` (hotel), `7` (restaurante), `8` (otro), `9` (tipo de sitio vacío), `10` (comunidad), `11` (escuela). |
| data.rows[].mode | Integer | Modo de handover del sitio: `0` (handover por transferencia), `1` (handover por compartición). |
| data.rows[].syncTimezone | Integer | Sincronización de zona horaria: `0` (no sincroniza), `1` (sincroniza). |
| data.rows[].systemManagerPermission | Boolean | Si se otorgó el permiso de gestión de servicios (con este permiso puede activar, renovar y administrar los servicios de HCT): `true` (otorgado), `false` (no otorgado). |
| data.rows[].remoteAccess | Boolean | Si se otorgó el permiso de acceso al sistema (con este permiso puede acceder de forma remota al sistema Hik-Connect for Teams): `true` (otorgado), `false` (no otorgado). |
| data.rows[].serverType | Array | Servicios activados: `0` (servicio de gestión de video), `1` (servicio de vehículos), `2` (servicio de detección de alarmas), `[3, 6]` (servicio de control de acceso y asistencia), `4` (servicio de videoportero), `5` (servicio de reportes de análisis; requiere que el servicio de gestión de video esté activado, de lo contrario no estará disponible), `9` (servicio ANPR), `10` (servicio de detección de salud), `11` (servicio de altavoz IP). |
| data.rows[].inviteStatus | Integer | Estado del sitio (sistema): `0` (creado), `1` (invitación sin confirmar), `2` (autorizado), `4` (entregado, sin autorizar), `5` (disuelto), `7` (no registrado). |
| data.rows[].ownerInfo | Object | Información del propietario. Solo es válida cuando el sitio ya se entregó (handover). |
| data.rows[].ownerInfo.siteOwnerName | String | Nombre del propietario del sitio. |
| data.rows[].ownerInfo.siteOwnerMail | String | Correo electrónico del propietario del sitio. |
| data.rows[].ownerInfo.siteOwnerPhone | String | Teléfono del propietario del sitio. |
| data.rows[].ownerInfo.siteAccount | String | Cuenta del propietario del sitio. |
| data.rows[].managerInfo | Object | Información de los administradores del sitio. |
| data.rows[].managerInfo[].id | String | ID del administrador. |
| data.rows[].managerInfo[].firstName | String | Nombre del administrador. |
| data.rows[].managerInfo[].lastName | String | Apellido del administrador. |
| data.rows[].managerInfo[].phone | String | Teléfono del administrador. |
| data.rows[].managerInfo[].email | String | Correo electrónico del administrador. |
| data.rows[].managerInfo[].siteAllPermission | Boolean | Si el administrador tiene el permiso Manage All Sites (administrar todos los sitios). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pageSize": 10,
    "rows": [
      {
        "systemId": "073f466df9f04c5eb28f1379cb97db62",
        "country": "",
        "systemName": "openAPI-Team11",
        "city": "",
        "timezone": 141,
        "street": "",
        "description": "12345676678901",
        "location": "",
        "state": "A",
        "systemScene": 8,
        "systemManagerPermission": true,
        "remoteAccess": true,
        "inviteStatus": 7,
        "mode": 0,
        "syncTimezone": 1,
        "managerInfo": [
          {
            "id": "feb99145fc554d97b66a8bb62bce0b91",
            "lastName": "470997",
            "phone": "",
            "email": "uat13-v3-20251126@example.net"
          }
        ],
        "ownerInfo": {
          "siteOwnerName": "test1",
          "siteOwnerMail": "test@example.com",
          "siteOwnerPhone": "",
          "siteAccount": "test@example.com"
        }
      },
      {
        "systemId": "35998569dfb7451bb05d03aa85fe1f10",
        "country": "",
        "systemName": "open-edit",
        "city": "",
        "timezone": 26,
        "street": "",
        "description": "",
        "location": "",
        "state": "",
        "systemScene": 0,
        "systemManagerPermission": true,
        "remoteAccess": true,
        "inviteStatus": 7,
        "mode": 0,
        "syncTimezone": 0,
        "managerInfo": [
          {
            "id": "feb99145fc554d97b66a8bb62bce0b91",
            "lastName": "470997",
            "phone": "",
            "email": "uat13-v3-20251126@example.com"
          }
        ],
        "ownerInfo": {
          "siteOwnerName": "",
          "siteOwnerMail": "",
          "siteOwnerPhone": "",
          "siteAccount": "1284-012345678901234567890123"
        }
      }
    ],
    "total": 12,
    "totalPage": 2,
    "page": 2
  },
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla del PDF llama `totalPages` al total de páginas, pero el ejemplo devuelve `totalPage` (como en `site/search`). Verifique el nombre real en su entorno.
> - La tabla declara `managerInfo` como Object, pero el ejemplo lo devuelve como arreglo; aquí se documenta como `data.rows[].managerInfo[]`. El ejemplo no incluye `firstName` ni `siteAllPermission`.
> - La tabla describe `systemName` como "Partition name"; por el contexto (y por el ejemplo) corresponde al nombre del sitio (sistema).
> - La tabla lista `systemId` dos veces dentro de `rows`; aquí se documenta una sola vez.
> - El ejemplo no incluye `serverType` en las filas, aunque la tabla lo lista.
> - La tabla de respuesta del PDF marca todos los campos de `data` como opcionales.

---

##### 5.2.3.3 Editar Team Site

`POST /api/hpcgw/v1/site/team/{id}/modify`

Edita un team site.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/team/{id}/modify`

**Parámetros de URL:**

| Parámetro | Requerido | Tipo   | Descripción |
| --------- | --------- | ------ | ----------- |
| id        | Requerido | String | ID del sitio (sistema). |

**Parámetros de Solicitud:**

| Parámetro         | Requerido | Tipo    | Ubicación | Descripción |
| ----------------- | --------- | ------- | --------- | ----------- |
| Content-Type      | Requerido | String  | Header    | `application/json` |
| Authorization     | Requerido | String  | Header    | `Bearer <accessToken>` |
| systemName        | Requerido | String  | Body      | Nombre del sitio (sistema). De 1 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| timezone          | Requerido | Integer | Body      | Zona horaria. Ver [A.3 Lista de Zonas Horarias](APENDICE-A.md#a3-lista-de-zonas-horarias). |
| syncTimezone      | Requerido | Integer | Body      | Si se sincroniza la zona horaria del sitio con sus dispositivos: `1` (habilitar), `0` u otros valores (deshabilitar). Si el campo no se envía, queda deshabilitado por defecto. |
| systemScene       | Opcional  | Integer | Body      | Tipo de escenario: `0` (residencial), `1` (departamento), `2` (villa), `3` (tienda), `4` (oficina), `5` (fábrica), `6` (hotel), `7` (restaurante), `8` (otro), `9` (tipo de sitio vacío), `10` (comunidad), `11` (escuela). |
| systemSceneCustom | Opcional  | String  | Body      | Escenario personalizado; obligatorio cuando `systemScene=8`. Máximo 200 caracteres. |
| city              | Opcional  | String  | Body      | Ciudad del sitio (sistema). De 1 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| street            | Opcional  | String  | Body      | Calle del sitio (sistema). De 0 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| location          | Opcional  | String  | Body      | Dirección detallada del sitio (sistema). De 0 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| state             | Opcional  | String  | Body      | Estado del sitio (sistema). De 0 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| description       | Opcional  | String  | Body      | Descripción del sitio (sistema). De 0 a 500 caracteres. |

**Ejemplo de Solicitud:**

```json
{
  "systemName": "New Site_20251126_6",
  "city": "dfddd",
  "street": "aaa",
  "description": "asdasdasd",
  "location": "sss",
  "state": "Singapore",
  "systemScene": 2,
  "systemSceneCustom": "",
  "timezone": 26,
  "syncTimezone": 1
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| errorCode | String | Requerido. Código de estado o de error de la respuesta: `0`: éxito. |
| message | String | Opcional. Descripción del estado o del error. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - A diferencia de `site/team/add`, aquí `syncTimezone` es requerido, aunque la descripción del PDF conserva el texto "si el campo no se envía, queda deshabilitado por defecto".
> - Esta API no recibe `serverType`.

---

##### 5.2.3.4 Hacer Handover del Team Site

`POST /api/hpcgw/v1/site/team/handover`

Realiza el handover (entrega del sitio al cliente) de un team site.

> **Notas:**
> - Si al crear el team site no se envió `serverType`, los servicios no se activan y no se pueden agregar dispositivos.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/team/handover`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| systemId      | Requerido | String  | Body      | ID del tenant (sitio/sistema). |
| systemName    | Requerido | String  | Body      | Nombre del sitio (sistema). |
| handOverBy    | Requerido | Integer | Body      | Método de handover: `1` (correo electrónico), `2` (número de teléfono). |
| contact       | Requerido | String  | Body      | Correo electrónico o número de teléfono, según el valor de `handOverBy`. El formato del teléfono es: código internacional de área-número de teléfono. Longitud máxima: 64 para correo y 24 para teléfono. |
| customerName  | Opcional  | String  | Body      | Nombre del cliente. De 0 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| remark        | Opcional  | String  | Body      | Observaciones. De 0 a 128 caracteres. No puede contener caracteres especiales como `: * ? " < > \|`. |
| language      | Requerido | String  | Body      | Abreviatura del idioma (identificador del idioma de la plantilla de correo). Ver [A.2 Idiomas](APENDICE-A.md#a2-idiomas). |
| customerPhone | Opcional  | String  | Body      | Teléfono del cliente. Válido cuando `handOverBy = 1` (correo electrónico). Longitud máxima de 24; solo se admiten dígitos. |
| mode          | Requerido | Integer | Body      | Modo de handover del sitio: `0` (handover por transferencia), `1` (handover por compartición). |
| allPermission | Opcional  | Boolean | Body      | Si se otorgan todos los permisos del sitio. Solo es válido cuando `mode = 1` (handover por compartición). <br>• Si el valor es `false` o el campo no se envía: no se otorgan todos los permisos. <br>• Si el valor es `true`: se otorgan todos los permisos, y los dos campos de `permission` son obligatorios. |
| permission    | Opcional  | Object  | Body      | Si `allPermission` es `true` en modo compartición, se otorgan automáticamente todos los permisos. |
| permission.systemManager | Opcional | Boolean | Body | Si se otorga el permiso de gestión del sistema (es decir, autorizar el sitio). Valor por defecto: `false`. Si es `false`, `remoteAccess` solo puede ser `-1`. |
| permission.remoteAccess | Opcional | Integer | Body | Permiso de acceso remoto, en horas. Cuando `systemManager` es `true`, el valor por defecto es `0`; cuando `systemManager` es `false`, el valor queda fijo en `-1` (sin permiso). <br>Valores: `-1` (sin permiso), `0` (permiso permanente), `1` (1 hora), `2` (2 horas), `4` (4 horas), `8` (8 horas). Los valores personalizados deben ser múltiplos de 24; por ejemplo, `48` equivale a 2 días. |

**Ejemplo de Solicitud:**

```json
{
  "systemId": "b7c90bdd946a4082972db40002f89327",
  "handOverBy": 1,
  "remark": "1123",
  "contact": "20241125@example.net",
  "customerName": "",
  "language": "en",
  "systemName": "New Site_20251124_151912",
  "customerPhone": "",
  "mode": 0,
  "allPermission": false,
  "permission": {
    "systemManager": false,
    "remoteAccess": -1
  }
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| errorCode | String | Requerido. Código de estado o de error de la respuesta del servicio: `0`: éxito. |
| message | String | Opcional. Descripción del estado o del error. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - Los valores de `handOverBy` (`1` correo, `2` teléfono) no coinciden con los de `type` en las APIs de handover por compartición de 5.2.2 (`0` correo, `1` teléfono).
> - El PDF incluye la advertencia sobre `serverType` en la descripción de esta API, aunque ese campo se define al crear el team site (`site/team/add`).

---

##### 5.2.3.5 Eliminar Team Site

`POST /api/hpcgw/v1/site/team/{id}/delete`

Elimina un team site.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/site/team/{id}/delete`

**Parámetros de URL:**

| Parámetro | Requerido | Tipo   | Descripción |
| --------- | --------- | ------ | ----------- |
| id        | Requerido | String | ID del sitio (sistema). Se obtiene con la API de búsqueda de team sites (`site/team/search`). |

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| errorCode | String | Requerido. Código de estado o de error de la respuesta: `0`: éxito. |
| message | String | Requerido. Descripción del estado o del error, en correspondencia uno a uno con el código. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "Ok"
}
```

---

### 5.3 Gestión de Dispositivos

#### 5.3.1 Información del Dispositivo

##### 5.3.1.1 Agregar Dispositivos

`POST /api/hpcgw/v2/device/add`

Agrega la información de dispositivos.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/add`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceList    | Requerido | Array  | Body      | Lista de dispositivos. No puede estar vacía. |
| deviceList[].deviceSerial | Requerido | String | Body | Número de serie del dispositivo. No puede estar vacío. De 1 a 9 caracteres. |
| deviceList[].validateCode | Requerido | String | Body | Código de verificación del dispositivo. No puede estar vacío. De 1 a 18 caracteres. |
| deviceList[].extendInfo | Opcional | String | Body | Información extendida. Se admite información personalizada. De 1 a 256 caracteres. |
| siteId        | Requerido | String | Body      | ID del sitio al que se agregarán los dispositivos. No puede estar vacío. De 1 a 48 caracteres. |

**Ejemplo de Solicitud:**

```json
{
  "deviceList": [
    {
      "deviceSerial": "abc",
      "validateCode": "def",
      "extendInfo": "xxx"
    }
  ],
  "siteId": "aaaaa"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.addSuccessList | Object[] | Lista de dispositivos agregados correctamente. Puede estar vacía. |
| data.addSuccessList[].deviceCategory | String | Tipo de dispositivo. |
| data.addSuccessList[].deviceName | String | Nombre del dispositivo. |
| data.addSuccessList[].deviceSerial | String | Número de serie del dispositivo. |
| data.addFailedList | Object[] | Lista de dispositivos que no se pudieron agregar. Puede estar vacía. |
| data.addFailedList[].deviceSerial | String | Número de serie del dispositivo. |
| data.addFailedList[].failReason | String | Causa del fallo. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "addFailedList": [
      {
        "deviceSerial": "abc",
        "failReason": "add Exception{LAP006001}"
      },
      {
        "deviceSerial": "def",
        "failReason": "add Exception{LAP006001}"
      }
    ],
    "addSuccessList": [
      {
        "deviceCategory": "0",
        "deviceName": "string",
        "deviceSerial": "abc"
      }
    ]
  },
  "errorCode": "0"
}
```

> **Notas:**
> - En la tabla del PDF el campo aparece como `siteld` por la tipografía (la `I` mayúscula se confunde con `l`); el ejemplo confirma que el nombre correcto es `siteId`.
> - En esta API `deviceCategory` se devuelve como String (`"0"`), mientras que `device/list` lo devuelve como Integer. Consulte los valores en [5.3.1.4 Obtener Lista de Dispositivos](#5314-obtener-lista-de-dispositivos).
> - Una respuesta con `errorCode` igual a `"0"` puede incluir dispositivos fallidos: revise siempre `addFailedList`.

---

##### 5.3.1.2 Eliminar Dispositivo

`POST /api/hpcgw/v1/device/delete`

Elimina la información de un dispositivo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/delete`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| id            | Requerido | String | Body      | ID del dispositivo. No puede estar vacío. Máximo 48 caracteres. |

**Ejemplo de Solicitud:**

```json
{
  "id": ""
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### 5.3.1.3 Editar Dispositivo

`POST /api/hpcgw/v1/device/update`

Edita la información de un dispositivo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/update`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceId      | Requerido | String | Body      | ID del dispositivo. |
| deviceName    | Requerido | String | Body      | Nombre del dispositivo. Máximo 128 caracteres. |
| extendInfo    | Opcional  | String | Body      | Información extendida. Se admite información personalizada. De 1 a 256 caracteres. |

**Ejemplo de Solicitud:**

```json
{
  "deviceId": "",
  "deviceName": "",
  "extendInfo": "xxx"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

##### 5.3.1.4 Obtener Lista de Dispositivos

`POST /api/hpcgw/v1/device/list`

Obtiene la lista de dispositivos.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/list`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| page          | Opcional  | Integer | Body      | Número de página. Por defecto es la página 1. |
| pageSize      | Opcional  | Integer | Body      | Elementos por página. Por defecto 20. |
| siteId        | Opcional  | String  | Body      | ID del sitio. |
| deviceSerial  | Opcional  | String  | Body      | Número de serie del dispositivo. |

**Ejemplo de Solicitud:**

```json
{
  "page": 1,
  "pageSize": 20
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.rows[].id | String | ID del dispositivo. |
| data.rows[].deviceName | String | Nombre del dispositivo. |
| data.rows[].deviceOnlineStatus | Integer | Estado del dispositivo: `0` (fuera de línea), `1` (en línea), `2` (desconocido). |
| data.rows[].deviceSerial | String | Número de serie del dispositivo. |
| data.rows[].deviceVersion | String | Número de versión del dispositivo. |
| data.rows[].deviceType | String | Modelo del dispositivo. |
| data.rows[].deviceCategory | Integer | Categoría del dispositivo. Ver la tabla de valores de `deviceCategory` más abajo. |
| data.rows[].deviceSubCategory | Integer | Subcategoría del dispositivo. Ver la tabla de valores de `deviceSubCategory` más abajo. |
| data.rows[].isSubscribed | Boolean | Si está suscrito a la información de eventos. |
| data.rows[].deviceAddTime | String | Fecha y hora (formato ISO 8601) en que se agregó el dispositivo, p. ej. `"2021-03-25T06:26:01.927Z"`. |
| data.rows[].timeZone | String | Zona horaria. Ver [A.3 Lista de Zonas Horarias](APENDICE-A.md#a3-lista-de-zonas-horarias). |
| data.rows[].extInfo | String | Información extendida agregada al dispositivo. |
| data.rows[].siteID | String | ID del sitio. |
| data.rows[].siteName | String | Nombre del sitio. |
| data.rows[].deviceShareFlag | Boolean | Si es un dispositivo compartido. |
| data.rows[].arcId | String | ID del ARC vinculado. |
| data.rows[].arcCompanyName | String | Nombre de la empresa ARC vinculada. |

**Valores de `deviceCategory`:**

| Valor | Categoría |
| ----- | --------- |
| `1`  | IPC |
| `2`  | NVR |
| `3`  | AlarmHost |
| `4`  | Intercom |
| `5`  | AccessControl |
| `7`  | IPDome |
| `8`  | Doorbell |
| `9`  | StorageBox |
| `10` | thermalCamera |
| `11` | Switch |
| `12` | Other (otros: radar, altavoz de red) |
| `99` | Todos los dispositivos |

**Valores de `deviceSubCategory`:**

| Valor | Subcategoría |
| ----- | ------------ |
| `0`  | Desconocido (unknown) |
| `1`  | NVR |
| `2`  | DVR |
| `3`  | AX2 |
| `4`  | AX Hub |
| `5`  | AX Hybrid |
| `6`  | Estación de alarma de pánico (panic alarm station) |
| `7`  | Estación de alarma de pánico tipo caja (box panic alarm station) |
| `8`  | Estación de alarma de pánico tipo poste (pole panic alarm station) |
| `9`  | MinMoe |
| `10` | AX Hybrid Pro |
| `11` | Cámara solar (solar-powered camera) |
| `12` | Estación de puerta (door station) |
| `13` | Radar de detección de caídas (fall detection radar) |
| `14` | AxECO |
| `15` | SwitchNet |
| `16` | SwitchAC |
| `17` | SwitchAP |
| `18` | SIGN RADAR |
| `19` | IP SPEAKER |
| `20` | NVS |
| `21` | SwitchRouter |
| `23` | Interactive Screen (pantalla interactiva) |
| `24` | Information Publish (publicación de información) |
| `25` | LEDDeviceCard |
| `26` | NetworkAmplifier |
| `27` | Bridge |
| `28` | IndoorUnit |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "page": 1,
    "pageSize": 20,
    "rows": [
      {
        "deviceCategory": 3,
        "deviceName": "xxx",
        "deviceOnlineStatus": 0,
        "deviceSerial": " Q01728482",
        "deviceVersion": " V2.0.0 build 200224",
        "id": "xxxxxxxxxx",
        "deviceSubCategory": 0,
        "deviceType": "DS-PWA96-M-WE",
        "isSubscribed": 1,
        "deviceAddTime": "2014-03-25T06:26:01.927Z",
        "timeZone": "182",
        "extInfo": "xxxx",
        "siteID": "xxxxxxxx",
        "siteName": "xxx",
        "deviceShareFlag": false,
        "arcId": "xxx",
        "arcCompanyName": "xxx"
      }
    ],
    "total": 0,
    "totalPage": 0
  },
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla de respuesta del PDF lista los campos del dispositivo directamente, sin jerarquía; el ejemplo los coloca dentro de `data.rows[]`, junto con `page`, `pageSize`, `total` y `totalPage`. Aquí se documenta la estructura del ejemplo.
> - El PDF no define los valores `6` de `deviceCategory` ni `22` de `deviceSubCategory`; las listas anteriores reproducen exactamente las del PDF.
> - En la tabla de solicitud el campo aparece como `siteld` por la tipografía; el nombre correcto es `siteId`. Observe que en la respuesta el campo se llama `siteID` (con `D` mayúscula).
> - `isSubscribed` se declara Boolean, pero el ejemplo lo muestra como `1`. Contemple ambos tipos al parsear.
> - En el ejemplo del PDF el valor de `deviceAddTime` viene entre comillas tipográficas (`”…”`), lo que lo vuelve JSON inválido; aquí se corrigió a comillas rectas.
> - Los espacios iniciales en `deviceSerial` (`" Q01728482"`) y `deviceVersion` (`" V2.0.0 build 200224"`) vienen así en el ejemplo del PDF.

---

##### 5.3.1.5 Obtener Lista de Canales del Dispositivo

`POST /api/hpcgw/v1/device/camera/list`

Obtiene la lista de canales vinculados a un dispositivo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/camera/list`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "abc"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object[] | Lista de canales. |
| data[].deviceSerial | String | Número de serie del dispositivo. |
| data[].ipcSerial | String | Número de serie de la cámara de red. |
| data[].channelNo | int | Número de canal. |
| data[].deviceName | String | Nombre del dispositivo. |
| data[].channelName | String | Nombre del canal. |
| data[].status | int | Estado del canal: `0` (fuera de línea), `1` (en línea), `-1` (desconocido). |
| data[].isShared | String | Estado de compartición del canal: `0` (no compartido), `1` (compartido con otros), `2` (compartido por otros). |
| data[].isEncrypt | int | Si el stream está cifrado: `0` (no cifrado), `1` (cifrado). |
| data[].videoLevel | int | Resolución de video: `0` (fluida), `1` (balanceada), `2` (HD), `3` (ultra HD). |
| data[].relatedIpc | boolean | Si el canal actual está vinculado a la cámara de red: `true` (sí), `false` (no). |

**Ejemplo de Respuesta:**

```json
{
  "data": [
    {
      "deviceSerial": "427734222",
      "ipcSerial": "427734222",
      "channelNo": 1,
      "deviceName": "My(427734222)427734222",
      "channelName": "My(427734222)427734222",
      "status": 1,
      "isShared": "0",
      "isEncrypt": 0,
      "videoLevel": 2,
      "relatedIpc": false
    }
  ],
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla de respuesta del PDF lista los campos sin jerarquía; el ejemplo muestra que `data` es un arreglo de canales. Aquí se documenta la estructura del ejemplo.
> - `isShared` es String (`"0"`), a diferencia de los demás campos de estado, que son numéricos.

---

#### 5.3.2 Operación del Dispositivo

##### 5.3.2.1 Habilitar o Deshabilitar el Permiso de Operación del Usuario Final

`POST /api/hpcgw/v1/device/cloud/enable`

Habilita o deshabilita el permiso de operación de dispositivos de los usuarios finales.

> **Notas:**
> - Después de hacer el handover por compartición del sitio al usuario final, puede deshabilitar Hik-Connect Mobile Client para los dispositivos. Una vez deshabilitado, el usuario final no puede realizar operaciones sobre los dispositivos (como vista en vivo, reproducción, armar y desarmar, etc.) en Hik-Connect Mobile Client.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/cloud/enable`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| siteId        | Requerido | String  | Body      | ID del sitio. |
| cloudEnable   | Requerido | Boolean | Body      | Habilita o deshabilita el permiso sobre los dispositivos: `true` (habilitar), `false` (deshabilitar). |

**Ejemplo de Solicitud:**

```json
{
  "siteId": "abcdcedfhg",
  "cloudEnable": false
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - Aunque la ruta está bajo `device/`, el permiso se aplica a nivel de sitio (`siteId`). El campo `cloudEnable` de [5.2.1.4 Buscar Sitios](#5214-buscar-sitios) refleja el resultado.

---

##### 5.3.2.2 Consultar el Código PIN del Dispositivo

`POST /api/hpcgw/v1/device/pincode/query`

Consulta el código PIN de un dispositivo.

> **Notas:**
> - Se pueden hacer hasta 100 solicitudes por dispositivo en un periodo de 24 horas.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/pincode/query`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "abc"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.pin | String | Código PIN. |
| data.deviceSerial | String | Número de serie del dispositivo. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pin": "xxxx",
    "deviceSerial": "xxxx"
  },
  "errorCode": "0"
}
```

---

##### 5.3.2.3 Actualizar el Firmware del Dispositivo

`POST /api/hpcgw/v1/device/upgrade`

Actualiza el firmware de un dispositivo.

> **Notas:**
> - Para los paneles de seguridad de primera generación (AlarmHost, `deviceCategory` `3`), los parámetros `username` y `password` son obligatorios. Para los demás paneles de seguridad, `pinCode` es obligatorio y `username` es opcional.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/upgrade`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |
| password      | Opcional  | String | Body      | Contraseña del dispositivo con certificación EN. |
| username      | Opcional  | String | Body      | Nombre de usuario del dispositivo con certificación EN. |
| pinCode       | Opcional  | String | Body      | Código PIN, que se obtiene con [5.3.2.2 Consultar el Código PIN del Dispositivo](#5322-consultar-el-código-pin-del-dispositivo). |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "abc",
  "password": "xxx",
  "username": "xxx",
  "pinCdode": "xxx"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.deviceSerial | String | Número de serie del dispositivo. |
| data.error | String | Código de error cuando la actualización falla. |
| data.errorDesc | String | Descripción del error cuando la actualización falla. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "deviceSerial": "xxxx",
    "error": "xxxx",
    "errorDesc": "xxxx"
  },
  "errorCode": "0"
}
```

> **Notas:**
> - El ejemplo de solicitud del PDF escribe la clave como `pinCdode`, pero la tabla la define como `pinCode`. Se conserva el ejemplo tal cual; use `pinCode` según la tabla y verifíquelo en su entorno.
> - La tabla marca `username`, `password` y `pinCode` como opcionales, pero su obligatoriedad depende del tipo de panel (ver la nota al inicio de esta API).
> - En el PDF, la descripción de `pinCode` remite a "Request Parameters"; por contexto corresponde a la API `device/pincode/query`.

---

##### 5.3.2.4 Obtener el Progreso de Actualización del Dispositivo

`POST /api/hpcgw/v1/device/upgrade/progress`

Obtiene el progreso de la actualización de firmware de un dispositivo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/upgrade/progress`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "abc"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.deviceSerial | String | Número de serie del dispositivo. |
| data.progress | Integer | Progreso de la actualización (%). |
| data.statue | Integer | Estado de la actualización: `0` (pendiente de actualizar), `1` (inicio de la actualización), `2` (descarga en curso), `3` (descarga finalizada), `4` (grabación del firmware en curso), `5` (grabación finalizada), `6` (reiniciando), `7` (actualización finalizada), `8` (el dispositivo devuelve un código de error). |
| data.error | String | Código de error cuando la actualización falla. |
| data.errorDesc | String | Descripción del error cuando la actualización falla. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "progress": 1,
    "statue": 1,
    "error": "xxxx",
    "errorDesc": "xxxx"
  },
  "errorCode": "0"
}
```

> **Notas:**
> - El campo de estado se llama `statue` (no `status`) tanto en la tabla como en el ejemplo del PDF; se conserva literal.
> - La tabla incluye `deviceSerial` en la respuesta, pero el ejemplo del PDF no lo muestra.

---

##### 5.3.2.5 Consultar el Estado de Actualización del Dispositivo

`POST /api/hpcgw/v1/device/upgrade/state`

Obtiene el estado de actualización de un dispositivo, es decir, si existe una versión más reciente de firmware disponible.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/upgrade/state`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "abc"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.isNeedUpgrade | Integer | Si hay una versión más reciente disponible para actualizar: `0` (no), `1` (sí). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "isNeedUpgrade": 1
  },
  "errorCode": "0"
}
```

---

##### 5.3.2.6 Despertar Cámara Solar

`POST /api/hpcgw/v1/device/camera/wakeUp`

Despierta una cámara solar.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/camera/wakeUp`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxxx"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.wakeUp | Integer | `1` (despierta), `0` (en reposo). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "wakeUp": 1
  },
  "errorCode": "0"
}
```

> **Notas:**
> - La ruta conserva la mayúscula literal de la API: `camera/wakeUp`.
> - Las cámaras solares corresponden a `deviceSubCategory` `11` en [5.3.1.4 Obtener Lista de Dispositivos](#5314-obtener-lista-de-dispositivos).

---

### 5.4 Servicio ARC

El PDF agrupa estos 6 endpoints en una única subsección, "ARC Resources" (Recursos ARC).

> **Notas:**
> - Para la integración ARC (central receptora de alarmas), las Open APIs se llaman con el ARC ID / ARC Key solicitados en el portal de Hik-Partner Pro. Según el PDF, el ARC ID y el ARC Key equivalen a la API Key y la API Secret: se envían como `appKey` / `secretKey` en [5.1.1 Obtener Token](#511-obtener-token) y el `accessToken` resultante es el que va en el header `Authorization` de estas APIs.
> - Cada endpoint indica a quién está disponible: `arcservice/device/list` y `arcservice/site/{id}/info` son exclusivos de usuarios ARC; el resto está disponible tanto para usuarios ARC como para instaladores.
> - Para las APIs generales de gestión de dispositivos, consulte la sección de Gestión de Dispositivos.

---

#### 5.4.1 Obtener Dispositivos con Servicio ARC

`POST /api/hpcgw/v1/arcservice/device/list`

Obtiene la lista de dispositivos que tienen habilitado el servicio ARC. Esta API está disponible solo para usuarios ARC.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/arcservice/device/list`

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo     | Ubicación | Descripción |
| ---------------- | --------- | -------- | --------- | ----------- |
| Content-Type     | Requerido | String   | Header    | `application/json` |
| Authorization    | Requerido | String   | Header    | `Bearer <accessToken>` |
| page             | Opcional  | Integer  | Body      | Número de página. El valor es la página 1. |
| pageSize         | Opcional  | Integer  | Body      | Elementos por página. Por defecto 20. |
| siteId           | Opcional  | Integer  | Body      | ID del sitio. |
| deviceSerialList | Opcional  | String[] | Body      | Conjunto de números de serie de dispositivos. Máximo 200 elementos. |

**Ejemplo de Solicitud:**

```json
{
  "page": 1,
  "pageSize": 20,
  "deviceSerialList": ["xxxx", "xxxx"]
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.rows[].id | String | ID del dispositivo. |
| data.rows[].deviceName | String | Nombre del dispositivo. |
| data.rows[].deviceOnlineStatus | Integer | Estado del dispositivo: `0` (fuera de línea), `1` (en línea), `2` (desconocido). |
| data.rows[].deviceSerial | String | Número de serie del dispositivo. |
| data.rows[].deviceVersion | String | Número de versión del dispositivo. |
| data.rows[].deviceType | String | Modelo del dispositivo. |
| data.rows[].deviceCategory | Integer | Categoría de dispositivo: `1` (IPC), `2` (NVR), `3` (AlarmHost), `4` (Intercom), `5` (AccessControl), `7` (IPDome), `8` (Doorbell), `9` (StorageBox), `10` (thermalCamera), `11` (Switch), `99` (todos los dispositivos). |
| data.rows[].deviceSubCategory | Integer | Subcategoría de dispositivo: `0` (desconocido), `1` (NVR), `2` (DVR), `3` (AX2), `4` (AX Hub), `5` (AX Hybrid), `6` (estación de alarma de pánico), `7` (estación de alarma de pánico tipo caja), `8` (estación de alarma de pánico tipo poste), `9` (MinMoe), `10` (AX Hybrid Pro), `11` (cámara solar), `12` (frente de calle / door station), `13` (radar de detección de caídas). |
| data.rows[].isSubscribed | Boolean | Si está suscrito a la información de eventos/alarmas. |
| data.rows[].deviceAddTime | String | Fecha y hora (formato ISO 8601) en que se agregó el dispositivo, p. ej. `"2021-03-25T06:26:01.927Z"`. |
| data.rows[].timeZone | String | Zona horaria. Ver [A.3 Lista de Zonas Horarias](APENDICE-A.md#a3-lista-de-zonas-horarias). |
| data.rows[].extInfo | String | Información extendida agregada al dispositivo. |
| data.rows[].siteID | String | ID del sitio. |
| data.rows[].siteName | String | Nombre del sitio. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "page": 1,
    "pageSize": 20,
    "rows": [
      {
        "deviceCategory": 3,
        "deviceName": "xxx",
        "deviceOnlineStatus": 0,
        "deviceSerial": " Q01728482",
        "deviceVersion": " V2.0.0 build 200224",
        "id": "xxxxxxxxxx",
        "deviceSubCategory": 0,
        "deviceType": "DS-PWA96-M-WE",
        "isSubscribed": 1,
        "deviceAddTime": "2014-03-25T06:26:01.927Z",
        "timeZone": "182",
        "extInfo": "xxxx",
        "siteID": "xxxxxxxx",
        "siteName": "xxx"
      }
    ],
    "total": 0,
    "totalPage": 0
  },
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla de respuesta del PDF lista los campos del dispositivo directamente, pero el ejemplo los coloca dentro de `data.rows[]`, junto con `page`, `pageSize`, `total` y `totalPage`. Aquí se documenta la estructura del ejemplo.
> - En la solicitud el ID del sitio se llama `siteId` y es Integer; en la respuesta se llama `siteID` (con "ID" en mayúsculas) y es String. Respete la grafía de cada caso.
> - `isSubscribed` se declara como Boolean, pero el ejemplo devuelve `1`. Contemple ambos formatos al parsear.
> - En el ejemplo del PDF el valor de `deviceAddTime` usa comillas tipográficas (`”…”`), lo que lo hace JSON inválido; aquí se muestran comillas rectas. Los espacios iniciales de `deviceSerial` y `deviceVersion` vienen así en el PDF.

---

#### 5.4.2 Habilitar Servicio ARC del Dispositivo

`POST /api/hpcgw/v1/arcservice/device/enable`

Habilita el servicio ARC de un dispositivo. Por defecto se suscriben todos los tipos de evento. Esta API está disponible tanto para usuarios ARC como para instaladores.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/arcservice/device/enable`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |
| arcId         | Requerido | String | Body      | ARC ID. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxx",
  "arcId": "xxx"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.permission | Integer | Estado del permiso ARC: `0` (pendiente de aprobación por el usuario final), `1` (aprobado y aplicado), `null` (la edición falló). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "permission": 1
  },
  "errorCode": "0"
}
```

---

#### 5.4.3 Deshabilitar Servicio ARC del Dispositivo

`POST /api/hpcgw/v1/arcservice/device/disable`

Deshabilita el servicio ARC de un dispositivo. Esta API está disponible tanto para usuarios ARC como para instaladores.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/arcservice/device/disable`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxx"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.4.4 Editar Tipos de Evento ARC del Dispositivo

`POST /api/hpcgw/v1/arcservice/event/type/update`

Edita la lista de eventos ARC de un dispositivo. Esta API está disponible tanto para usuarios ARC como para instaladores. Se debe configurar `ax2PermissionList` o `CCTVEventList`: `ax2PermissionList` contiene los permisos específicos para dispositivos de la serie AX PRO; `CCTVEventList` es la lista de eventos de los dispositivos de codificación (cámaras/grabadores).

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/arcservice/event/type/update`

**Parámetros de Solicitud:**

| Parámetro         | Requerido | Tipo          | Ubicación | Descripción |
| ----------------- | --------- | ------------- | --------- | ----------- |
| Content-Type      | Requerido | String        | Header    | `application/json` |
| Authorization     | Requerido | String        | Header    | `Bearer <accessToken>` |
| deviceSerial      | Requerido | String        | Body      | Número de serie del dispositivo. |
| ax2PermissionList | Opcional  | List<Integer> | Body      | Lista de eventos soportados por el panel de control de seguridad. Cada edición sobrescribe por completo la lista anterior (p. ej., si primero se configura `<10, 11, 12, 13>` y después `<10>`, prevalece `<10>`). <br>• Permisos de las series **AX PRO y AX Hybrid Pro**: `10`-PIRCAM Gif, `11`-Video Clips, `12`-Panic Alarm, `13`-Medical Alarm, `14`-Fire Alarm, `15`-Smart Alarm, `16`-Panel Lid Opened, `17`-Peripheral Tamper, `18`-Zone Alarm, `19`-System Operation, `21`-Panel Status (Power&Battery), `22`-Panel Status (Communications), `23`-Zone Status, `24`-Peripherals Status, `45`-Panel Upgrade. <br>• Permisos de la serie **AX Home**: `5`-Alarms, `6`-Faults, `7`-Operations, `8`-System Events. |
| CCTVEventList     | Opcional  | List<Integer> | Body      | Lista de eventos soportados (dispositivos de codificación). Cada edición sobrescribe por completo la lista anterior (p. ej., si primero se configura `<1, 2, 3>` y después `<4>`, prevalece `<4>`); si se configura `<0>`, se cancelan todos los valores configurados previamente. Valores: `1`-IO, `2`-VMD, `3`-diskerror, `4`-diskfull, `5`-diskrecover, `6`-fielddetection, `7`-linedetection, `9`-recordException, `10`-regionEntrance, `11`-regionExiting, `12`-shelteralarm, `13`-videoloss, `14`-fireDetection, `15`-TMPA, `16`-TMA, `17`-TDA. |

> **Notas:**
> - En la serie AX PRO, los permisos de tercer nivel deben enviarse junto con su permiso de segundo nivel: del `10` al `18` pertenecen al `39`; del `21` al `24`, al `40`; el `19`, al `41`, y el `45`, al `42`. Consulte la tabla de Permisos ARC siguiente.

**Permisos ARC (Figura 3-1 del PDF):**

| Permiso de 1er nivel | Permiso de 2do nivel | Valor de 2do nivel | Permisos de 3er nivel (valor) |
| -------------------- | -------------------- | ------------------ | ----------------------------- |
| ARC | Alarms (alarmas) | `39` | Zone Alarm `18` · Peripheral Tamper `17` · Panel Lid Opened `16` · Keypad/keyfob/APP Panic Alarm `12` · Keypad/keyfob Medical Alarm `13` · Keypad Fire Alarm `14` · Camera Events `15` · PIRCAM Gif `10` · Video Clips `11` |
| ARC | Faults (fallas) | `40` | Panel Status (Power and Battery) `21` · Panel Status (Communications) `22` · Zone Status `23` · Peripherals Status `24` |
| ARC | Operations (operaciones) | `41` | System Operations `19` |
| ARC | System Events (eventos del sistema) | `42` | Panel Upgrade `45` |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxx",
  "ax2PermissionLists": [
    22
  ],
  "eventFilterLists": [
    1
  ]
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.permission | Integer | Estado del permiso ARC: `0` (solicitud en curso), `1` (edición aplicada), `null` (la edición falló). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "permission": 1
  },
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla del PDF nombra los campos `ax2PermissionList` y `CCTVEventList`, pero el ejemplo de solicitud usa `ax2PermissionLists` y `eventFilterLists`. Se conserva el ejemplo tal como viene en el PDF; verifique en su entorno qué nombres acepta la API antes de fijar la integración.
> - La tabla del PDF describe `CCTVEventList` con el mismo texto que `ax2PermissionList` ("lista de eventos soportados por el panel de control de seguridad"), aunque la descripción de la API indica que es la lista de eventos de los dispositivos de codificación; aquí se usa esta última.
> - En la tabla de Permisos ARC, `15` aparece como "Camera Events", mientras que en la lista de la serie AX PRO aparece como "Smart Alarm". Se documentan ambos tal como vienen en el PDF.

---

#### 5.4.5 Editar Número de Cuenta del Dispositivo

`POST /api/hpcgw/v1/arcservice/account/number/update`

Edita el número de cuenta (account No.) del dispositivo. Esta API está disponible tanto para usuarios ARC como para instaladores.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/arcservice/account/number/update`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |
| accountNumber | Requerido | String | Body      | Número de cuenta. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxx",
  "accountNumber": "xxx"
}
```

> **Notas:**
> - El PDF no incluye parámetros ni ejemplo de respuesta para esta API. Por consistencia con el resto de la guía, se espera `{ "errorCode": "0" }` en caso de éxito; verifíquelo en su entorno.

---

#### 5.4.6 Obtener Información del Sitio con Servicio ARC

`GET /api/hpcgw/v1/arcservice/site/{id}/info`

Obtiene la información del sitio de los dispositivos que tienen habilitado el servicio ARC. Esta API está disponible solo para usuarios ARC.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/arcservice/site/{id}/info`

**Parámetros de URL:**

| Parámetro | Requerido | Tipo   | Descripción |
| --------- | --------- | ------ | ----------- |
| id        | Requerido | String | ID del sitio. |

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.id | String | ID del sitio. |
| data.siteName | String | Nombre del sitio. |
| data.timeZone | String | Zona horaria del sitio. Ver [A.3 Lista de Zonas Horarias](APENDICE-A.md#a3-lista-de-zonas-horarias). |
| data.timeSync | Boolean | Si se sincroniza la zona horaria. |
| data.installerId | String | ID del administrador del sitio (instalador). Si hay varios instaladores, se devuelve el primero. |
| data.installerFirstName | String | Nombre del administrador del sitio (instalador). |
| data.installerLastName | String | Apellido del administrador del sitio (instalador). |
| data.installerEmail | String | Correo electrónico del administrador del sitio (instalador). |
| data.installerPhone | String | Teléfono del administrador del sitio (instalador). |
| data.siteState | String | Estado donde se ubica el sitio. |
| data.siteCity | String | Ciudad donde se ubica el sitio. |
| data.siteStreet | String | Calle donde se ubica el sitio. |
| data.location | String | Dirección detallada del sitio. |
| data.siteOwnerName | String | Nombre del propietario del sitio (usuario final). |
| data.siteOwnerEmail | String | Correo electrónico del propietario del sitio (usuario final). |
| data.siteOwnerPhone | String | Teléfono del propietario del sitio (usuario final). |
| data.sharedInfo | Object | Información de compartición del sitio. |
| data.sharedInfo.shareType | Integer | `0`: el sitio es de la empresa actual y no se ha compartido. <br>`1`: es de la empresa actual y se compartió con un partner de mantenimiento. <br>`2`: otra empresa lo compartió con usted y usted da el mantenimiento. <br>`3`: es de la empresa actual y se compartió con instaladores para la instalación y configuración de dispositivos. Al hacer el handover al cliente, esta compartición se revoca automáticamente. <br>`4`: otra empresa lo compartió con usted y usted da la instalación y configuración de dispositivos. |
| data.sharedInfo.shareState | Integer | `0`: en espera de autenticación del usuario final. <br>`1`: en espera de que la otra empresa acepte. <br>`2`: compartido actualmente. <br>`3`: el usuario final rechazó la solicitud. <br>`4`: la otra empresa rechazó la solicitud. |
| data.sharedInfo.shareToCompany | Object | Se devuelve cuando usted comparte sus sitios con otras empresas. Solo puede existir este nodo o `shareFromCompany`, no ambos. |
| data.sharedInfo.shareFromCompany | Object | Se devuelve cuando otra empresa comparte el sitio con usted. Solo puede existir este nodo o `shareToCompany`, no ambos. |
| …shareToCompany/shareFromCompany.companyName | String | Nombre de la empresa que comparte o recibe. |
| …shareToCompany/shareFromCompany.email | String | Correo electrónico. |
| …shareToCompany/shareFromCompany.firstName | String | Nombre de la persona. |
| …shareToCompany/shareFromCompany.lastName | String | Apellido de la persona. |
| …shareToCompany/shareFromCompany.phone | String | Teléfono de la empresa. |
| …shareToCompany/shareFromCompany.street | String | Calle donde se ubica la empresa. |
| …shareToCompany/shareFromCompany.address | String | Dirección de la empresa. |

**Ejemplo de Respuesta (sitio compartido con otros):**

```json
{
  "data": {
    "id": "",
    "siteName": "",
    "siteCity": "",
    "siteState": "",
    "siteStreet": "",
    "location": "",
    "timeSync": true,
    "timeZone": "",
    "installerId": "",
    "installerFirstName": "",
    "installerLastName": "",
    "installerEmail": "",
    "installerPhone": "",
    "siteOwnerName": "",
    "siteOwnerEmail": "",
    "siteOwnerPhone": "",
    "sharedInfo": {
      "shareState": 4,
      "shareType": 3,
      "shareToCompany": {
        "address": "",
        "companyName": "",
        "email": "",
        "firstName": "",
        "lastName": "",
        "phone": "",
        "street": ""
      }
    }
  },
  "errorCode": "0"
}
```

**Ejemplo de Respuesta (sitio compartido por otros):**

```json
{
  "data": {
    "id": "",
    "installerFirstName": "",
    "installerId": "",
    "installerLastName": "",
    "location": "",
    "siteCity": "",
    "siteName": "",
    "siteState": "",
    "siteStreet": "",
    "timeSync": true,
    "timeZone": "182",
    "sharedInfo": {
      "shareState": 4,
      "shareType": 4,
      "shareFromCompany": {
        "address": "",
        "companyName": "",
        "email": "",
        "firstName": "",
        "lastName": "",
        "phone": "",
        "street": ""
      }
    }
  },
  "errorCode": "0"
}
```

> **Notas:**
> - El PDF lista `id` en una tabla "Request Body", pero al ser una API `GET` con `{id}` en la ruta, aquí se documenta como parámetro de URL.
> - Los ejemplos de respuesta del PDF son JSON inválidos y se corrigieron mínimamente: (1) falta la coma después de `"siteOwnerPhone": ""`; (2) la clave `"siteOwnerName "` trae un espacio final; (3) el ejemplo "para sitios compartidos con otros" concatena dos objetos de sitio dentro de `data` (uno con `shareToCompany` y otro con `shareFromCompany`), y el ejemplo "para sitios compartidos por otros" repite el objeto con `shareToCompany` y queda truncado antes de `errorCode`. Aquí el primer ejemplo conserva el objeto con `shareToCompany` (`shareType` `3`) y el segundo usa el objeto con `shareFromCompany` (`shareType` `4`) que el PDF incluía en el primero.
> - El objeto con `shareFromCompany` del PDF no incluye `installerEmail`, `installerPhone` ni los campos `siteOwner*`; se respeta tal cual.

---

### 5.5 Hot Spare

APIs para configurar hot spare (equipo principal / equipo de respaldo): registro de la identidad de cada equipo, heartbeat (latido) entre la nube y los equipos para que el equipo de respaldo detecte si el principal está fuera de línea, y respaldo en la nube del archivo de hot spare.

> **Notas:**
> - Según el flujo de llamadas de hot spare del PDF, el token se obtiene con [5.1.1 Obtener Token](#511-obtener-token) usando el ARC ID y el ARC Key. La configuración de hot spare queda asociada a esa AK (`appKey`): `hotspare/get`, `hotspare/delete` y `hotspare/file/delete` operan sobre lo configurado bajo la AK actual.
> - Flujo del equipo principal: `hotspare/add` (tipo `0`) → `hotspare/heartbeat` cada minuto → `hotspare/file/upload` (máximo 2 MB; para archivos mayores, contacte a soporte técnico). Cuando cambie la configuración del equipo principal, suba un archivo nuevo para reemplazar el anterior.
> - Flujo del equipo de respaldo: `hotspare/add` (tipo `1`–`3`) → `hotspare/heartbeat` cada minuto → `hotspare/file/get` de forma programada, comparando `lastModifiedTime` con la fecha del archivo local descargado; si hay cambios, `hotspare/file/downloadurl` para descargar el archivo más reciente.
> - Códigos de error específicos: `LAP026338` (no se ha agregado el hot spare principal), `LAP026339` (el número de equipo de respaldo ya existe), `LAP026341` (el archivo de hot spare excede el tamaño límite), `LAP026342` (falló la carga del archivo de hot spare) y `LAP068001` (otro usuario tiene una búsqueda en curso; con la AK y la SK ocupadas en una búsqueda no se admiten búsquedas concurrentes ni llamadas síncronas). Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

---

#### 5.5.1 Agregar Hot Spare

`POST /api/hpcgw/v1/hotspare/add`

Configura el tipo de un dispositivo hot spare (principal o de respaldo).

> **Notas:**
> - Debe configurar el equipo principal antes que los equipos de respaldo; de lo contrario se devuelve el código de error `LAP026338`.
> - Cada número de equipo de respaldo solo se puede configurar una vez. Por ejemplo, si el equipo de respaldo No. 1 ya está configurado y se intenta configurar de nuevo, se devuelve el código de error `LAP026339`.
> - Se pueden configurar hasta 3 equipos de respaldo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/hotspare/add`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| uuid          | Requerido | String  | Body      | UUID del dispositivo hot spare. Máximo 128 caracteres. |
| type          | Requerido | Integer | Body      | Tipo de dispositivo hot spare: `0`-equipo principal, `1`-equipo de respaldo No. 1, `2`-equipo de respaldo No. 2, `3`-equipo de respaldo No. 3. |

**Ejemplo de Solicitud:**

```json
{
  "uuid": "e7c0cee2-74a0-473f-802e-1afbb33d5303",
  "type": 0
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.5.2 Obtener Hot Spare

`POST /api/hpcgw/v1/hotspare/get`

Busca la información de los dispositivos hot spare configurados para la AK actual.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/hotspare/get`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.list[].uuid | String | UUID del dispositivo hot spare. Máximo 128 caracteres. |
| data.list[].type | Integer | Tipo de dispositivo hot spare: `0`-equipo principal, `1`-equipo de respaldo No. 1, `2`-equipo de respaldo No. 2, `3`-equipo de respaldo No. 3. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "ok",
  "data": {
    "list": [
      {
        "uuid": "e7c0cee2-74a0-473f-802e-1afbb33d5303",
        "type": 0
      }
    ]
  }
}
```

---

#### 5.5.3 Eliminar Hot Spare

`POST /api/hpcgw/v1/hotspare/delete`

Elimina dispositivos hot spare de la AK. Admite la eliminación por lotes o borrar todas las configuraciones de la AK.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/hotspare/delete`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo     | Ubicación | Descripción |
| ------------- | --------- | -------- | --------- | ----------- |
| Content-Type  | Requerido | String   | Header    | `application/json` |
| Authorization | Requerido | String   | Header    | `Bearer <accessToken>` |
| deleteMode    | Requerido | String   | Body      | Modo de eliminación: `"all"` (eliminar todos los dispositivos), `"list"` (eliminar los dispositivos indicados). |
| list          | Requerido | String[] | Body      | Arreglo de UUID. Solo es válido cuando `deleteMode` es `"list"`. |

**Ejemplo de Solicitud:**

```json
{
  "deleteMode": "list",
  "list": ["e7c0cee2-74a0-473f-802e-1afbb33d5303"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - El PDF marca `list` como Requerido aunque solo aplica con `deleteMode` = `"list"`. El PDF no indica qué enviar en `list` con `deleteMode` = `"all"`; verifique el comportamiento en su entorno.

---

#### 5.5.4 Enviar Heartbeat de Hot Spare

`POST /api/hpcgw/v1/hotspare/heartbeat`

Mediante el heartbeat (latido) entre la nube y los equipos principal y de respaldo, el equipo de respaldo puede saber si el equipo principal está fuera de línea.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/hotspare/heartbeat`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| uuid          | Requerido | String | Body      | UUID del dispositivo hot spare. Máximo 128 caracteres. |

**Ejemplo de Solicitud:**

```json
{
  "uuid": " e7c0cee2-74a0-473f-802e-1afbb33d5303"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.list[].uuid | String | UUID del dispositivo hot spare. Máximo 128 caracteres. |
| data.list[].type | Integer | Tipo de dispositivo hot spare: `0`-equipo principal, `1`-equipo de respaldo No. 1, `2`-equipo de respaldo No. 2, `3`-equipo de respaldo No. 3. |
| data.list[].timeLag | Long | Diferencia entre la última actualización del heartbeat y la hora actual del servidor, en milisegundos. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "ok",
  "data": {
    "list": [
      {
        "uuid": "e7c0cee2-74a0-473f-802e-1afbb33d5303",
        "type": 0,
        "timeLag": 1707102237228
      }
    ]
  }
}
```

> **Notas:**
> - Según el flujo de hot spare del PDF, cada equipo debe llamar a esta API una vez por minuto.
> - En el ejemplo de solicitud del PDF el `uuid` trae un espacio inicial (`" e7c0…"`); probablemente es una errata. Envíe el UUID sin espacios.
> - El valor de ejemplo de `timeLag` (`1707102237228`) tiene la forma de una marca de tiempo epoch en milisegundos, no de una diferencia; interprételo según la descripción de la tabla (diferencia en ms) y verifíquelo en su entorno.

---

#### 5.5.5 Subir Archivo de Hot Spare

`POST /api/hpcgw/v1/hotspare/file/upload`

Sube un archivo de hot spare a la nube como respaldo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/hotspare/file/upload`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` (según el PDF; ver Notas). |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| file          | Requerido | Binary | Form      | Archivo de hot spare. Tamaño máximo: 2 MB. |

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.key | String | Ubicación de almacenamiento del archivo subido. Se usa para obtener la URL de descarga y para eliminar el archivo. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "ok",
  "data": {
    "key": ""
  }
}
```

> **Notas:**
> - El PDF no incluye ejemplo de solicitud. El parámetro `file` es binario, por lo que en la práctica se envía como `multipart/form-data` (campo `file`), aunque la tabla de headers del PDF indica `Content-Type: application/json`. Verifique en su entorno el `Content-Type` que acepta la API.
> - Si el archivo excede el límite se devuelve `LAP026341`; si la carga falla, `LAP026342`. Para archivos mayores de 2 MB, contacte a soporte técnico.

---

#### 5.5.6 Obtener URL de Descarga del Archivo de Hot Spare

`POST /api/hpcgw/v1/hotspare/file/downloadurl`

Obtiene la URL de descarga de un archivo de hot spare.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/hotspare/file/downloadurl`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| key           | Requerido | String | Body      | Ruta del archivo (el `key` devuelto por `hotspare/file/upload` o `hotspare/file/get`). |

**Ejemplo de Solicitud:**

```json
{
  "key": ""
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.url | String | URL para descargar el archivo. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "ok",
  "data": {
    "url": ""
  }
}
```

---

#### 5.5.7 Buscar Archivos de Hot Spare

`POST /api/hpcgw/v1/hotspare/file/get`

Busca los archivos de hot spare subidos.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/hotspare/file/get`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.list[].key | String | Ruta del archivo de hot spare. |
| data.list[].lastModifiedTime | Long | Fecha y hora de la última modificación, como marca de tiempo epoch en milisegundos. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "ok",
  "data": {
    "list": [
      {
        "key": "",
        "lastModifiedTime": 1707102237228
      }
    ]
  }
}
```

> **Notas:**
> - En el ejemplo del PDF la clave `"lastModifiedTime "` trae un espacio final por errata; aquí se muestra corregida.

---

#### 5.5.8 Eliminar Archivo de Hot Spare

`POST /api/hpcgw/v1/hotspare/file/delete`

Elimina un archivo de hot spare de la AK.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/hotspare/file/delete`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| key           | Requerido | String | Body      | Ruta del archivo. |

**Ejemplo de Solicitud:**

```json
{
  "key": ""
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

### 5.6 Mensajes de Alarma

> **Notas:**
> - El flujo de consumo por polling es: suscribirse con `mq/subscribe` → obtener mensajes con `mq/messages` → confirmar el lote con `mq/offset` usando el `batchId` recibido. Si el lote no se confirma, los mensajes se reenvían al cabo de un tiempo.
> - Una vez configurado el Webhook, las notificaciones de eventos se envían por Webhook y es posible que el polling (`/api/hpcgw/v1/mq/messages`) ya no obtenga mensajes. Si su integración usa polling, contacte al soporte técnico para cambiar a Webhook. Ver [4.10 Envío de Mensajes por Webhook](#410-envío-de-mensajes-por-webhook).
> - Los tipos de evento y el contenido de `alarmData` se describen en [A.4 Detalles de Eventos](APENDICE-A.md#a4-detalles-de-eventos).

---

#### 5.6.1 Suscribirse a Mensajes de Alarma

`POST /api/hpcgw/v1/mq/subscribe`

Suscribe (o cancela la suscripción) a los mensajes de alarma de los dispositivos.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/mq/subscribe`

**Parámetros de Solicitud:**

| Parámetro        | Requerido | Tipo     | Ubicación | Descripción |
| ---------------- | --------- | -------- | --------- | ----------- |
| Content-Type     | Requerido | String   | Header    | `application/json` |
| Authorization    | Requerido | String   | Header    | `Bearer <accessToken>` |
| subType          | Requerido | Integer  | Body      | Estado: `1` (suscribirse), `0` (cancelar la suscripción). |
| subMode          | Requerido | String   | Body      | Modo de suscripción: `"all"` (todos los dispositivos, incluidos los que se agreguen después), `"list"` (los dispositivos de la lista). |
| deviceSerialList | Opcional  | String[] | Body      | Lista de números de serie de dispositivos. No es válido cuando `subMode` es `"all"`; es obligatorio cuando `subMode` es `"list"`. |

**Ejemplo de Solicitud:**

```json
{
  "subType": 1,
  "subMode": "list",
  "deviceSerialList": ["abc", "def"]
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

#### 5.6.2 Obtener Mensajes de Alarma

`POST /api/hpcgw/v1/mq/messages`

Obtiene los mensajes de alarma.

> **Notas:**
> - Se recomienda llamar a esta API de forma continua para obtener la información de eventos. Después de obtenerla, se recomienda llamar lo antes posible a [5.6.3 Confirmar Recepción de Mensajes](#563-confirmar-recepción-de-mensajes) (`mq/offset`) para confirmar que los mensajes se recibieron.
> - Por defecto, la plataforma solo conserva en caché dos horas de información de eventos.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/mq/messages`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.batchId | String | ID de la operación por lotes. Se usa para confirmar manualmente que los mensajes se recibieron; de lo contrario, los mensajes se reenviarán al cabo de un tiempo. |
| data.list[].formatType | String | Formato del mensaje: `XML` o `JSON`. |
| data.list[].accountNumber | String | Número de usuario. |
| data.list[].deviceSerial | String | Número de serie del dispositivo. |
| data.list[].alarmData | String | Datos de la alarma. El tipo es String tanto si el formato es JSON como XML. Si necesita los protocolos ISAPI completos, contacte al soporte técnico o visite tpp.hikvision.com. Ver [A.4 Detalles de Eventos](APENDICE-A.md#a4-detalles-de-eventos). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "batchId": "xxxxx",
    "list": [
      {
        "formatType": "XML",
        "accountNumber": "xxx",
        "deviceSerial": "DS2323",
        "alarmData": "xxx"
      },
      {
        "formatType": "JSON",
        "accountNumber": "xxx",
        "deviceSerial": "DS2323",
        "alarmData": {
          "deviceSerial": "xxx",
          "eventType": "VMD"
        }
      }
    ]
  },
  "errorCode": "0"
}
```

> **Notas:**
> - El ejemplo del PDF incluye el comentario `//device serial number` junto a cada `deviceSerial`, lo que no es JSON válido; aquí se omitió.
> - La tabla indica que `alarmData` es String en ambos formatos, pero el ejemplo del PDF muestra `alarmData` como objeto en el mensaje `JSON`. Prepare el parseo para recibir tanto una cadena (que puede contener XML o JSON serializado) como un objeto.

---

#### 5.6.3 Confirmar Recepción de Mensajes

`POST /api/hpcgw/v1/mq/offset`

Confirma que los mensajes se recibieron.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/mq/offset`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| batchId       | Requerido | String | Body      | ID de la operación por lotes, devuelto por [5.6.2 Obtener Mensajes de Alarma](#562-obtener-mensajes-de-alarma) (`POST /api/hpcgw/v1/mq/messages`). |

**Ejemplo de Solicitud:**

```json
{
  "batchId": "xxxx"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - En la tabla del PDF el parámetro aparece como `batchld` (con "l" minúscula) por errata; el ejemplo y la respuesta de `mq/messages` usan `batchId`, que es el nombre correcto.

---

#### 5.6.4 Obtener URL de Imagen de Alarma

`POST /api/hpcgw/v1/alarm/pictureurl`

Obtiene la URL para descargar una imagen relacionada con una alarma.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/alarm/pictureurl`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| filePath      | Requerido | String | Body      | Ruta del archivo adjunto en el mensaje de alarma. El nombre del archivo comienza con `ISAPI_FILES`. |

**Ejemplo de Solicitud:**

```json
{
  "filePath": "ISAPI_FILES/C94115305_6/20210809105618274-C94115305-6-10000-2$encrypt=2,2021-08-09T12:54:25,fd9b7f16393203046d40be71da380128"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.pictureUrl | String | URL para descargar la imagen. Válida durante dos horas. |
| data.encrypt | Boolean | Si la imagen está cifrada. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pictureUrl": "",
    "encrypt": true
  },
  "errorCode": "0"
}
```

> **Notas:**
> - En el ejemplo de solicitud del PDF el valor de `filePath` usa comillas tipográficas (`“ ”`) y aparece partido en dos líneas por el ancho de página; aquí se muestra con comillas rectas y en una sola línea.
> - El nombre de la ruta `alarm/pictureurl` es literal de la API.

---

#### 5.6.5 Establecer Modo de Armado

`POST /api/hpcgw/device/v1/defence/set`

Establece el modo de armado de uno o varios dispositivos. Admite armado, armado silencioso y desarmado.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/device/v1/defence/set`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| deviceSerials | Requerido | Array   | Body      | Lista de números de serie de dispositivos. Cada número de serie tiene de 1 a 9 caracteres y solo admite letras (a-z, A-Z) y dígitos (0-9). Los números de serie duplicados se ignoran. Se requiere al menos un número de serie válido. |
| defenceMode   | Requerido | String  | Body      | Modo de armado: `DEVICE_DEFENCE` (armado; la alarma sonora y visual del dispositivo está habilitada), `MUTE_DEFENCE` (armado silencioso; la alarma sonora y visual del dispositivo está deshabilitada), `DISARM` (desarmado). |
| waitResult    | Opcional  | Boolean | Body      | Si se espera hasta que el modo de armado se aplique en todos los dispositivos. Por defecto es `true`. Si es `false`, la API responde en cuanto se envían las tareas y `data` en la respuesta es `null`. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerials": ["Q01728482", "K52996719"],
  "defenceMode": "DEVICE_DEFENCE",
  "waitResult": true
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.successCount | Integer | Número de dispositivos en los que el modo de armado se aplicó correctamente. |
| data.failedCount | Integer | Número de dispositivos en los que falló la aplicación del modo de armado. |
| data.successDevices | Array | Información de los dispositivos en los que el modo de armado se aplicó correctamente. |
| data.successDevices[].deviceSerial | String | Número de serie del dispositivo. |
| data.failedDevices | Array | Información de los dispositivos en los que falló la aplicación del modo de armado. |
| data.failedDevices[].deviceSerial | String | Número de serie del dispositivo. |
| data.failedDevices[].errorCode | String | Código de error del dispositivo. Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "successCount": 1,
    "failedCount": 1,
    "successDevices": [
      {
        "deviceSerial": "Q01728482"
      }
    ],
    "failedDevices": [
      {
        "deviceSerial": "K52996719",
        "errorCode": "EVZ20007"
      }
    ]
  },
  "errorCode": "0"
}
```

> **Notas:**
> - Si `waitResult` es `false`, la API responde en cuanto se envían las tareas y `data` es `null`, por ejemplo: `{"errorCode": "0"}`. En ese caso, debe confirmar si el modo de armado se aplicó en cada dispositivo llamando a [5.6.6 Obtener Modo de Armado](#566-obtener-modo-de-armado) (`POST /api/hpcgw/device/v1/defence/get`).
> - A diferencia de la mayoría de las APIs, esta ruta usa el prefijo `/api/hpcgw/device/v1/` (no `/api/hpcgw/v1/device/`).

---

#### 5.6.6 Obtener Modo de Armado

`POST /api/hpcgw/device/v1/defence/get`

Obtiene el modo de armado actual de uno o varios dispositivos.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/device/v1/defence/get`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerials | Requerido | Array  | Body      | Lista de números de serie de dispositivos. Cada número de serie tiene de 1 a 9 caracteres y solo admite letras (a-z, A-Z) y dígitos (0-9). Los números de serie duplicados se ignoran. Se requiere al menos un número de serie válido. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerials": ["Q01728482", "K52996719"]
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.devices | Array | Estado de armado de cada dispositivo. Los dispositivos se devuelven en el mismo orden en que se solicitaron. |
| data.devices[].deviceSerial | String | Número de serie del dispositivo. |
| data.devices[].currentMode | String | Modo de armado actual: `DEVICE_DEFENCE` (armado), `MUTE_DEFENCE` (armado silencioso), `DISARM` (desarmado). Es `null` si falló la obtención del modo de armado del dispositivo, o si el dispositivo está armado pero no se puede leer su configuración de alarma sonora y visual. |
| data.devices[].errorCode | String | Código de error del dispositivo. Es `null` si el modo de armado se obtuvo correctamente. Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "devices": [
      {
        "deviceSerial": "Q01728482",
        "currentMode": "MUTE_DEFENCE"
      },
      {
        "deviceSerial": "K52996719",
        "errorCode": "EVZ20007"
      }
    ]
  },
  "errorCode": "0"
}
```

> **Notas:**
> - En el ejemplo, el dispositivo que falla no incluye `currentMode` y el que responde correctamente no incluye `errorCode`; trate ambos campos como posiblemente ausentes o `null`.

---

### 5.7 Capacidad Transparente

#### 5.7.1 Reenvío Transparente ISAPI

`GET/PUT/POST/DELETE /api/hpcgw/v1/device/transparent/{isapi uri}`

Reenvía protocolos ISAPI al dispositivo.

> **Notas:**
> - Consulte [A.5 URIs de Solicitud](APENDICE-B.md#a5-uris-de-solicitud) para conocer las URIs soportadas. Si necesita la lista completa de URIs soportadas, contacte al soporte técnico o inicie sesión en tpp.hikvision.com.
> - Los usuarios ARC pueden llamar a esta API para controlar dispositivos de otros instaladores.
> - Si la versión del dispositivo es demasiado antigua (anterior a V4.84), el tamaño máximo del mensaje de respuesta está limitado a 16 KB y cualquier dato que exceda ese límite se trunca.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/device/transparent/{isapi uri}`

`{isapi uri}` es la URI ISAPI que se reenvía al dispositivo, p. ej. `ISAPI/System/time/ntpServers/1`.

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` o `application/xml`. |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| X-Devserial   | Requerido | String  | Header    | Número de serie del dispositivo. |
| X-Username    | Opcional  | String  | Header    | Nombre de usuario. Es obligatorio cuando se especifica un usuario para operar dispositivos AX PRO. |
| X-Password    | Opcional  | String  | Header    | Contraseña. Es obligatoria cuando se especifica un usuario para operar los dispositivos. |
| X-Userlevel   | Opcional  | Integer | Header    | Tipo de usuario en dispositivos AX PRO: `0` (instalador, valor por defecto), `1` (admin/operador). |

**Ejemplo de Solicitud:**

Mensaje XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<NTPServer version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <id>1</id>
  <addressingFormatType>ipaddress</addressingFormatType>
  <ipAddress>10.10.10.10</ipAddress>
  <portNo>123</portNo>
  <synchronizeInterval>1</synchronizeInterval>
</NTPServer>
```

Mensaje JSON:

```json
{
  "Zone": {
    "id": 1,
    "zoneName": "test",
    "zoneType": "Instant",
    "delayTime": 1,
    "stayAwayEnabled": true,
    "chimeEnabled": true,
    "silentEnabled": true,
    "timeOut": true,
    "detectorSeqCfg": "mod",
    "detectorSeq": "123456789"
  }
}
```

Mensaje de solicitud HTTP:

```http
PUT /api/hpcgw/v1/device/transparent/ISAPI/System/time/ntpServers/1 HTTP/1.1
Host: api.hik-partner.com
Authorization: Bearer at.2eafygyuabvmptnbak3ctbiq03eotm8x-6pkihc3byk-1w21rv5-dhjflmofu
X-Devserial: 519928976
Content-Type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<NTPServer version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <id>1</id>
  <addressingFormatType>ipaddress</addressingFormatType>
  <ipAddress>10.10.10.10</ipAddress>
  <portNo>123</portNo>
  <synchronizeInterval>1</synchronizeInterval>
</NTPServer>
```

**Parámetros de Respuesta:**

| Parámetro    | Tipo   | Ubicación | Descripción |
| ------------ | ------ | --------- | ----------- |
| X-EZO-Code   | String | Header    | Código devuelto. |
| X-ErrorCode  | String | Header    | Código de error. Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error). |
| X-DeviceCode | String | Header    | Código de error devuelto por el dispositivo. |

**Ejemplo de Respuesta:**

Mensaje XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<NTPServer version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <id>1</id>
  <addressingFormatType>ipaddress</addressingFormatType>
  <ipAddress>10.10.10.10</ipAddress>
  <portNo>123</portNo>
  <synchronizeInterval>1</synchronizeInterval>
</NTPServer>
```

Mensaje JSON:

```json
{
  "Zone": {
    "id": 1,
    "zoneName": "test",
    "zoneType": "Instant",
    "delayTime": 1,
    "stayAwayEnabled": true,
    "chimeEnabled": true,
    "silentEnabled": true,
    "timeOut": true,
    "detectorSeqCfg": "mod",
    "detectorSeq": "123456789"
  }
}
```

> **Notas:**
> - El PDF no incluye un bloque "Request URL" para esta API; la URL se muestra aquí con el mismo patrón `{areaDomain}` del resto de la guía. El ejemplo HTTP del PDF usa `Host: api.hik-partner.com`; en la práctica, use el `areaDomain` devuelto por [5.1.1 Obtener Token](#511-obtener-token).

---

#### 5.7.2 Reenvío Transparente OTAP

`GET/PUT/POST/DELETE /api/hpcgw/v2/device/transparent/{otap uri}`

APIs transmitidas mediante el protocolo OTAP. Permiten leer y escribir propiedades, ejecutar acciones y consultar el modelo de objeto de los dispositivos (por ejemplo, paneles AX PRO), ya sea desde la sombra (shadow) que mantiene la nube o directamente desde el dispositivo.

> **Notas:**
> - El ARC puede llamar a estas APIs para controlar dispositivos de otros instaladores.
> - El formato de los valores de cada propiedad o acción (`data`, `value`) no se describe en esta guía: consulte el documento del protocolo OTAP correspondiente.

**URIs OTAP soportadas:**

| Descripción | URI | Método |
| ----------- | --- | ------ |
| [Obtener Propiedad](#5721-obtener-propiedad) | `/otap/prop` | GET |
| [Establecer Propiedad](#5722-establecer-propiedad) | `/otap/prop` | PUT |
| [Obtener Propiedad Directamente del Dispositivo](#5723-obtener-propiedad-directamente-del-dispositivo) | `/otap/prop/direct` | GET |
| [Establecer Propiedad Directamente en el Dispositivo](#5724-establecer-propiedad-directamente-en-el-dispositivo) | `/otap/prop/direct` | PUT |
| [Ejecutar Acción en el Dispositivo](#5725-ejecutar-acción-en-el-dispositivo) | `/otap/action` | PUT |
| [Obtener Definición del Modelo de Objeto](#5726-obtener-definición-del-modelo-de-objeto) | `/otap/product/profile` | POST |
| [Obtener Propiedades en Lote](#5727-obtener-propiedades-en-lote) | `/otap/multi/prop/get/by/shadow` | POST |
| [Establecer Propiedades en Lote](#5728-establecer-propiedades-en-lote) | `/otap/multi/prop/put/by/shadow` | PUT |
| [Obtener Propiedades en Lote Directamente del Dispositivo](#5729-obtener-propiedades-en-lote-directamente-del-dispositivo) | `/otap/multi/prop/get` | PUT |
| [Establecer Propiedades en Lote Directamente en el Dispositivo](#57210-establecer-propiedades-en-lote-directamente-en-el-dispositivo) | `/otap/multi/prop/put` | PUT |
| [Obtener Lista de Datos OTAP](#57211-obtener-lista-de-datos-otap) | `/api/service/device/otap/table/list?pageIndex=%s&pageSize=%s` | GET |

**Headers comunes de las sub-APIs OTAP (resumen SYSCOM, armado a partir de cada sub-API):**

Además de `Content-Type` y `Authorization`, las sub-APIs usan los siguientes headers (cada endpoint indica cuáles aplican):

| Header | Descripción |
| ------ | ----------- |
| x-devserial | Número de serie del dispositivo. |
| X-LocalIndex | Número de recurso. |
| X-ResourceCategory | Categoría del recurso (p. ej. `global`, `Zone`, `SubSystem`). |
| X-DomainIdentifier | Dominio funcional (p. ej. `InfoMgr`, `TimeMgr`, `ZoneMgr`). |
| X-PropIdentifier | Identificador de la propiedad de la función. |
| X-Actionidentifier | Identificador de la acción (solo en `otap/action`). |
| x-listIdentifier | Identificador de la función de lista (solo en `otap/table/list`). |
| X-Username | Opcional. Usuario con el que se opera sobre el dispositivo AX PRO. |
| X-UserType | Opcional. Tipo de usuario del `X-Username` en el dispositivo AX PRO: `"installer"` (por defecto), `"administrator"`, `"operator"`. |

> **Notas:**
> - En la tabla de URIs soportadas del PDF, las APIs directas aparecen como `/otap/prop/direct`, pero las secciones de detalle, la URL de solicitud y los ejemplos curl usan `/otap/direct` (`/api/hpcgw/v2/device/transparent/otap/direct`). Aquí se respeta lo que dice cada parte del PDF; verifique la ruta real en su entorno.
> - Según el [historial V2.14.0](./HISTORIAL-ACTUALIZACIONES.md), se eliminó `X-Username` de `otap/multi/prop/get` y se agregó `X-UserType` a `otap/multi/prop/put`.
> - Los nombres de headers conservan las mayúsculas/minúsculas del PDF (`x-devserial`, `X-Actionidentifier`, `x-listIdentifier`). Los headers HTTP no distinguen mayúsculas, pero conviene enviarlos tal cual.

---

##### 5.7.2.1 Obtener Propiedad

`GET /api/hpcgw/v2/device/transparent/otap/prop`

Obtiene una propiedad.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/prop`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo   | Ubicación | Descripción |
| ------------------ | --------- | ------ | --------- | ----------- |
| Content-Type       | Requerido | String | Header    | `application/x-www-form-urlencoded` |
| Authorization      | Requerido | String | Header    | `Bearer <accessToken>` |
| x-devserial        | Requerido | String | Header    | Número de serie del dispositivo. |
| X-LocalIndex       | Requerido | String | Header    | Número de recurso. |
| X-ResourceCategory | Requerido | String | Header    | Categoría del recurso. |
| X-DomainIdentifier | Requerido | String | Header    | Dominio funcional. |
| X-PropIdentifier   | Requerido | String | Header    | Identificador de la propiedad de la función. |

**Ejemplo de Solicitud:**

```bash
curl --location --request GET 'https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/prop' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer hpc.mgjxfwu0wexwxw2021lmz3oocnt8uf4b' \
--header 'x-devserial: Q04054748' \
--header 'X-LocalIndex: 0' \
--header 'X-ResourceCategory: global' \
--header 'X-DomainIdentifier: InfoMgr' \
--header 'X-PropIdentifier: DeviceVersion'
```

**Parámetros de Respuesta:**

| Parámetro | Tipo   | Descripción |
| --------- | ------ | ----------- |
| data      | JSON   | Valor de la propiedad. Su formato se detalla en el documento del protocolo OTAP correspondiente. |
| errorCode | String | Código de estado de la respuesta del servicio. |
| message   | String | Descripción del estado de la respuesta del servicio. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "firmwareReleasedDate": "build 240205",
    "firmwareVersion": "V1.0.0"
  },
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - La tabla del PDF indica `Content-Type: application/x-www-form-urlencoded`, pero el ejemplo curl envía `application/json`.
> - En el ejemplo del PDF falta la comilla de cierre del último header (`X-PropIdentifier: DeviceVersion`); aquí se muestra corregida.

---

##### 5.7.2.2 Establecer Propiedad

`PUT /api/hpcgw/v2/device/transparent/otap/prop`

Establece (configura) una propiedad.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/prop`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo   | Ubicación | Descripción |
| ------------------ | --------- | ------ | --------- | ----------- |
| Content-Type       | Requerido | String | Header    | `application/json` |
| Authorization      | Requerido | String | Header    | `Bearer <accessToken>` |
| x-devserial        | Requerido | String | Header    | Número de serie del dispositivo. |
| X-LocalIndex       | Requerido | String | Header    | Número de recurso. |
| X-ResourceCategory | Requerido | String | Header    | Categoría del recurso. |
| X-DomainIdentifier | Requerido | String | Header    | Dominio funcional. |
| X-PropIdentifier   | Requerido | String | Header    | Identificador de la propiedad de la función. |

**Ejemplo de Solicitud:**

```bash
curl --location --request PUT 'https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/prop' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer hpc.1uqrvv3n3e6dfxem17atusunm295wk7t' \
--header 'x-devserial: Q31153369' \
--header 'X-LocalIndex: 0' \
--header 'X-ResourceCategory: global' \
--header 'X-DomainIdentifier: TimeMgr' \
--header 'X-PropIdentifier: LocalDateTime' \
--data '{
   "localDateTime": "2024-04-22T15:39:01+08:00"
}'
```

**Parámetros de Respuesta:**

| Parámetro | Tipo   | Descripción |
| --------- | ------ | ----------- |
| errorCode | String | Código de estado de la respuesta del servicio. |
| message   | String | Descripción del estado de la respuesta del servicio. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - El PDF no trae tabla de body: el cuerpo es el valor de la propiedad en JSON, con el formato del documento del protocolo OTAP correspondiente (en el ejemplo, `localDateTime` del dominio `TimeMgr`).

---

##### 5.7.2.3 Obtener Propiedad Directamente del Dispositivo

`GET /api/hpcgw/v2/device/transparent/otap/direct`

Obtiene una propiedad consultándola directamente al dispositivo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/direct`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo   | Ubicación | Descripción |
| ------------------ | --------- | ------ | --------- | ----------- |
| Content-Type       | Requerido | String | Header    | `application/x-www-form-urlencoded` |
| Authorization      | Requerido | String | Header    | `Bearer <accessToken>` |
| x-devserial        | Requerido | String | Header    | Número de serie del dispositivo. |
| X-LocalIndex       | Requerido | String | Header    | Número de recurso. |
| X-ResourceCategory | Requerido | String | Header    | Categoría del recurso. |
| X-DomainIdentifier | Requerido | String | Header    | Dominio funcional. |
| X-PropIdentifier   | Requerido | String | Header    | Identificador de la propiedad de la función. |
| X-Username         | Opcional  | String | Header    | Usuario con el que se opera sobre el dispositivo AX PRO. |
| X-UserType         | Opcional  | String | Header    | Tipo de usuario del `X-Username` en el dispositivo AX PRO: `"installer"` (por defecto), `"administrator"`, `"operator"`. |

**Ejemplo de Solicitud:**

```bash
curl --location --request GET 'https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/direct' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer hpc.mgjxfwu0wexwxw2021lmz3oocnt8uf4b' \
--header 'x-devserial: Q04054748' \
--header 'X-LocalIndex: 0' \
--header 'X-ResourceCategory: global' \
--header 'X-DomainIdentifier: InfoMgr' \
--header 'X-PropIdentifier: DeviceDescription'
```

**Parámetros de Respuesta:**

| Parámetro | Tipo   | Descripción |
| --------- | ------ | ----------- |
| data      | JSON   | Valor de la propiedad. Su formato se detalla en el documento del protocolo OTAP correspondiente. |
| errorCode | String | Código de estado de la respuesta del servicio. |
| message   | String | Descripción del estado de la respuesta del servicio. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "deviceName": "AX HOME",
    "deviceType": "PWAEco",
    "macAddress": "08:54:11:20:08:ff",
    "model": "DS-PA101-32P-WB",
    "serialNumber": "Q29598581"
  },
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - La tabla del PDF indica `Content-Type: application/x-www-form-urlencoded`, pero el ejemplo curl envía `application/json`.
> - La tabla de URIs soportadas del PDF lista esta API como `/otap/prop/direct`; la URL de solicitud y el ejemplo usan `/otap/direct`.

---

##### 5.7.2.4 Establecer Propiedad Directamente en el Dispositivo

`PUT /api/hpcgw/v2/device/transparent/otap/direct`

Establece una propiedad directamente en el dispositivo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/direct`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo   | Ubicación | Descripción |
| ------------------ | --------- | ------ | --------- | ----------- |
| Content-Type       | Requerido | String | Header    | `application/json` |
| Authorization      | Requerido | String | Header    | `Bearer <accessToken>` |
| x-devserial        | Requerido | String | Header    | Número de serie del dispositivo. |
| X-LocalIndex       | Requerido | String | Header    | Número de recurso. |
| X-ResourceCategory | Requerido | String | Header    | Categoría del recurso. |
| X-DomainIdentifier | Requerido | String | Header    | Dominio funcional. |
| X-PropIdentifier   | Requerido | String | Header    | Identificador de la propiedad de la función. |
| X-Username         | Opcional  | String | Header    | Usuario con el que se opera sobre el dispositivo AX PRO. |
| X-UserType         | Opcional  | String | Header    | Tipo de usuario del `X-Username` en el dispositivo AX PRO: `"installer"` (por defecto), `"administrator"`, `"operator"`. |

**Ejemplo de Solicitud:**

```bash
curl --location --request PUT 'https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/direct' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer hpc.1uqrvv3n3e6dfxem17atusunm295wk7t' \
--header 'x-devserial: Q31153369' \
--header 'X-LocalIndex: 0' \
--header 'X-ResourceCategory: global' \
--header 'X-DomainIdentifier: InfoMgr' \
--header 'X-PropIdentifier: DeviceDescription' \
--data '{
   "deviceName": "test1234"
}'
```

**Parámetros de Respuesta:**

| Parámetro | Tipo   | Descripción |
| --------- | ------ | ----------- |
| errorCode | String | Código de estado de la respuesta del servicio. |
| message   | String | Descripción del estado de la respuesta del servicio. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - El PDF no trae tabla de body: el cuerpo es el valor de la propiedad en JSON, con el formato del documento del protocolo OTAP correspondiente.
> - La tabla de URIs soportadas del PDF lista esta API como `/otap/prop/direct`; la URL de solicitud y el ejemplo usan `/otap/direct`.

---

##### 5.7.2.5 Ejecutar Acción en el Dispositivo

`PUT /api/hpcgw/v2/device/transparent/otap/action`

Ejecuta operaciones (acciones) en el dispositivo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/action`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo   | Ubicación | Descripción |
| ------------------ | --------- | ------ | --------- | ----------- |
| Content-Type       | Requerido | String | Header    | `application/json` |
| Authorization      | Requerido | String | Header    | `Bearer <accessToken>` |
| x-devserial        | Requerido | String | Header    | Número de serie del dispositivo. |
| X-LocalIndex       | Requerido | String | Header    | Número de recurso. |
| X-ResourceCategory | Requerido | String | Header    | Categoría del recurso. |
| X-DomainIdentifier | Requerido | String | Header    | Dominio funcional. |
| X-Actionidentifier | Requerido | String | Header    | Identificador de la acción de la función. |
| X-Username         | Opcional  | String | Header    | Usuario con el que se opera sobre el dispositivo AX PRO. |
| X-UserType         | Opcional  | String | Header    | Tipo de usuario del `X-Username` en el dispositivo AX PRO: `"installer"` (por defecto), `"administrator"`, `"operator"`. |

**Ejemplo de Solicitud:**

```bash
curl --location --request PUT 'https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/action' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer hpc.c3qmm09ogn7krggg16p5r7muja3yscn5' \
--header 'x-devserial: Q31153341' \
--header 'X-LocalIndex: 0' \
--header 'X-ResourceCategory: global' \
--header 'X-DomainIdentifier: ZoneMgr' \
--header 'X-Actionidentifier: SearchZoneStatus' \
--data '{
   "searchID":"test101",
   "searchResultPosition":1,
   "maxResults":32
}'
```

**Parámetros de Respuesta:**

| Parámetro | Tipo   | Descripción |
| --------- | ------ | ----------- |
| errorCode | String | Código de estado de la respuesta del servicio. |
| message   | String | Descripción del estado de la respuesta del servicio. |

**Ejemplo de Respuesta:**

```json
{
  "data": [
    {
      "armStatus": "armed",
      "exitDelayTime": 0,
      "name": "Area 1",
      "subSystemID": 1
    }
  ],
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - La tabla de respuesta del PDF no incluye `data`, pero el ejemplo devuelve el resultado de la acción en `data` (en este caso, un arreglo con el estado de armado de las áreas). Su formato depende del documento del protocolo OTAP correspondiente.

---

##### 5.7.2.6 Obtener Definición del Modelo de Objeto

`POST /api/hpcgw/v2/device/transparent/otap/product/profile`

Busca la definición del modelo de objeto del dispositivo (recursos, dominios, propiedades, acciones y eventos que soporta).

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/product/profile`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| x-devserial   | Requerido | String  | Header    | Número de serie del dispositivo. |
| needSchema    | Opcional  | Boolean | Body      | Si se requiere el schema: `true`, `false` (por defecto). |
| checkMD5      | Opcional  | Boolean | Body      | Si se requiere verificación MD5: `true`, `false` (por defecto). |
| needGzip      | Opcional  | Boolean | Body      | Si el protocolo del modelo de objeto se devuelve comprimido con gzip: `true`, `false` (por defecto). |
| md5           | Opcional  | String  | Body      | MD5 que el invocador guardó localmente. |
| identifier    | Opcional  | String  | Body      | Identificador de la función. |

**Ejemplo de Solicitud:**

```bash
curl --location --request POST 'https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/product/profile' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer hpc.3ebcwoaaybdmlue33uqhw7xag57j6bcv' \
--header 'x-devserial: Q31153341'
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta, en formato JSON. |
| data.gzipProfile | Byte[] | Paquete gzip del contenido de `profile`. |
| data.productId | String | Número del modelo de objeto. |
| data.version | String | Versión del protocolo del modelo de objeto. |
| data.md5 | String | Valor MD5 (digest) del contenido de `profile`. |
| data.changed | Boolean | `true`: hay actualizaciones en el contenido de `profile` · `false`: sin actualizaciones. |
| data.profile | Object | Información del objeto `profile`. |
| data.profile.version | String | Versión de `profile`. |
| data.profile.capacities | Map | Conjunto de capacidades. |
| data.profile.resources[] | Array | Lista de recursos. |
| data.profile.resources[].identifier | String | Identificador de la función. |
| data.profile.resources[].title | String | Nombre del recurso. |
| data.profile.resources[].sid | Integer | Identificador corto. |
| data.profile.resources[].resourceCategory | String | Categoría del recurso. |
| data.profile.resources[].localIndex | Array | Número(s) de recurso. |
| data.profile.resources[].localIndexRule | Object | Información de la regla. |
| data.profile.resources[].localIndexRule.ruleType | String | Tipo de regla. |
| data.profile.resources[].localIndexRule.ruleRange | Object | Información del rango de la regla. |
| …ruleRange.minimum | Integer | Valor mínimo. |
| …ruleRange.maximum | Integer | Valor máximo. |
| …ruleRange.step | Integer | Paso (incremento). |
| data.profile.resources[].dynamic | Boolean | Si es un recurso dinámico. |
| data.profile.resources[].global | Boolean | Si es un recurso global. |
| data.profile.resources[].domains[] | Array | Dominios. |
| …domains[].identifier | String | Identificador de la función. |
| …domains[].sid | Integer | ID corto. |
| …domains[].title | String | Nombre del dominio. |
| …domains[].props[] | Array | Propiedades. |
| …props[].identifier | String | Identificador de la función. |
| …props[].version | String | Versión del protocolo. |
| …props[].access | String | Permiso de acceso (p. ej. `rw`). |
| …props[].title | String | Nombre de la función. |
| …props[].sid | Integer | Identificador corto. |
| …props[].schema | Map<String,Object> | Schema del identificador. |
| …domains[].actions[] | Array | Acciones (operaciones). |
| …actions[].identifier | String | Identificador de la función. |
| …actions[].version | String | Versión del protocolo. |
| …actions[].direction | String | Permiso de acceso (dirección, p. ej. `Plt2Dev`). |
| …actions[].title | String | Nombre de la función. |
| …actions[].sid | Integer | Identificador corto. |
| …actions[].schema | Map<String,Object> | Schema del identificador. |
| …actions[].input | Object | Schema de la solicitud. |
| …actions[].output | Object | Información del schema de salida. |
| …actions[].output.schema | Map<String,Object> | Schema de salida. |
| …domains[].events[] | Array | Eventos. |
| …events[].identifier | String | Identificador de la función. |
| …events[].version | String | Versión del protocolo. |
| …events[].eventType | Array | Tipo de evento (p. ej. `notification`). |
| …events[].title | String | Nombre de la función. |
| …events[].sid | Integer | Identificador corto. |
| …events[].input | Object | Información del schema de la solicitud. |
| …events[].input.schema | Map<String,Object> | Schema de la solicitud. |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0",
  "message": "Ok",
  "data": {
    "profile": {
      "version": "V1.0.0 build 210102",
      "capacities": null,
      "resources": [
        {
          "identifier": "global",
          "title": null,
          "sid": null,
          "resourceCategory": "global",
          "localIndex": [
            "0"
          ],
          "localIndexRule": {
            "ruleType": null,
            "ruleRange": null
          },
          "dynamic": false,
          "global": true,
          "domains": [
            {
              "identifier": "DoorMagnetic",
              "sid": 746,
              "title": null,
              "props": [
                {
                  "identifier": "OpenSound",
                  "version": "v3.0",
                  "access": "rw",
                  "title": null,
                  "sid": null,
                  "schema": null
                }
              ],
              "actions": [
                {
                  "identifier": "Erasure",
                  "sid": null,
                  "version": "v3.0",
                  "direction": "Plt2Dev",
                  "title": null,
                  "input": null,
                  "output": null
                }
              ],
              "events": [
                {
                  "identifier": "MagneticAlarm",
                  "sid": null,
                  "version": "v3.0",
                  "title": null,
                  "eventType": [
                    "notification"
                  ],
                  "input": null
                },
                {
                  "identifier": "DoorRestored",
                  "sid": null,
                  "version": "v3.0",
                  "title": null,
                  "eventType": [
                    "notification"
                  ],
                  "input": null
                }
              ]
            },
            {
              "identifier": "AppRemind",
              "sid": 457,
              "title": null,
              "props": [
                {
                  "identifier": "AppMsgSwitch",
                  "version": "v3.0",
                  "access": "rw",
                  "title": null,
                  "sid": null,
                  "schema": null
                }
              ],
              "actions": [],
              "events": []
            },
            {
              "identifier": "BatteryInfo",
              "sid": null,
              "title": null,
              "props": [
                {
                  "identifier": "SurplusPower",
                  "version": "v3.0",
                  "access": "rw",
                  "title": null,
                  "sid": null,
                  "schema": null
                }
              ],
              "actions": [],
              "events": []
            }
          ]
        }
      ]
    },
    "gzipProfile": null,
    "productId": "CS-T2C-BG",
    "version": "V1.0.0 build 211203",
    "md5": "c9898669dabc3e4429ab86eee49b3ae1",
    "changed": true
  }
}
```

> **Notas:**
> - La tabla del PDF usa guiones para el anidamiento (`-profile`, `--resources`, `---domains`, `----props`…). Aquí se expresan como rutas con punto y `[]` según la estructura del ejemplo; `…` abrevia el prefijo `data.profile.resources[].domains[]`.
> - El ejemplo curl del PDF no envía body; todos los campos del body son opcionales.

---

##### 5.7.2.7 Obtener Propiedades en Lote

`POST /api/hpcgw/v2/device/transparent/otap/multi/prop/get/by/shadow`

Obtiene varias propiedades en lote (desde la sombra del dispositivo), incluso de varios dispositivos en una sola llamada.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/multi/prop/get/by/shadow`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |

**Ejemplo de Solicitud:**

```bash
curl --location --request POST 'https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/multi/prop/get/by/shadow' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer hpc.3ebcwoaaybdmlue33uqhw7xag57j6bcv' \
--data '[
   {
      "deviceSerial": "Q29598581",
      "resourceCategory": "Zone",
      "localIndex": "1",
      "domainId": "ZoneMgr",
      "propId": "SingleZoneBasicInfo"
   },
   {
      "deviceSerial": "Q29598581",
      "resourceCategory": "global",
      "localIndex": "0",
      "domainId": "InfoMgr",
      "propId": "DeviceVersion"
   }
]'
```

**Parámetros de Respuesta:**

| Parámetro | Tipo       | Descripción |
| --------- | ---------- | ----------- |
| data      | JSON Array | Valores de las propiedades. Su formato se detalla en el documento del protocolo OTAP correspondiente. |
| errorCode | String     | Código de estado de la respuesta del servicio. |
| message   | String     | Descripción del estado de la respuesta del servicio. |

**Ejemplo de Respuesta:**

```json
{
  "data": [
    {
      "deviceSerial": "Q29598581",
      "propResps": [
        {
          "deviceSerial": "Q29598581",
          "domainId": "InfoMgr",
          "localIndex": "0",
          "propId": "DeviceVersion",
          "resourceCategory": "global",
          "timestamp": 1711616019401,
          "value": {
            "firmwareReleasedDate": "build 240130",
            "firmwareVersion": "V1.0.0"
          }
        },
        {
          "deviceSerial": "Q29598581",
          "domainId": "ZoneMgr",
          "localIndex": "1",
          "propId": "SingleZoneBasicInfo",
          "resourceCategory": "Zone",
          "timestamp": 1711616018757,
          "value": {
            "childDevID": "Q27811987",
            "deactivationMode": "off",
            "delayParam": {
              "entryDelay": 30,
              "exitDelay": 30
            },
            "detectorType": "magneticContact",
            "deviceNo": 1,
            "linkageSubSystems": [
              1
            ],
            "model": "DS-PD121-WB",
            "serialNumber": "Q27811987",
            "version": "V1.0.0 build 231219",
            "zoneName": "Magnetic Contact 1",
            "zoneType": "instant"
          }
        }
      ]
    }
  ],
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - En el PDF, la tabla "Request Body" (Table 3-111) repite por errata los campos del header (`Content-Type`, `Authorization`). El ejemplo muestra que el body es un arreglo JSON en el que cada elemento indica `deviceSerial`, `resourceCategory`, `localIndex`, `domainId` y `propId`.
> - La respuesta agrupa los resultados por dispositivo (`data[].deviceSerial`) y devuelve cada propiedad en `data[].propResps[]` con su `value` y `timestamp` (milisegundos).

---

##### 5.7.2.8 Establecer Propiedades en Lote

`PUT /api/hpcgw/v2/device/transparent/otap/multi/prop/put/by/shadow`

Establece varias propiedades en lote (a través de la sombra del dispositivo), incluso en varios dispositivos en una sola llamada.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/multi/prop/put/by/shadow`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo       | Ubicación | Descripción |
| ------------- | --------- | ---------- | --------- | ----------- |
| Content-Type  | Requerido | String     | Header    | `application/json` |
| Authorization | Requerido | String     | Header    | `Bearer <accessToken>` |
| propRequests  | Requerido | JSON Array | Body      | Lista de información a configurar. |
| propRequests[].deviceSerial | Requerido | String | Body | Número de serie del dispositivo. |
| propRequests[].propReqs | Requerido | JSON Array | Body | Información de las propiedades del dispositivo. |
| propRequests[].propReqs[].resourceCategory | Requerido | String | Body | Categoría del recurso. |
| propRequests[].propReqs[].localIndex | Requerido | String | Body | Número de recurso. |
| propRequests[].propReqs[].domainId | Requerido | String | Body | Dominio funcional. |
| propRequests[].propReqs[].propId | Requerido | String | Body | Identificador de la función. |
| propRequests[].propReqs[].value | Requerido | JSON | Body | Contenido a modificar. Su formato se detalla en el documento del protocolo OTAP correspondiente. |

**Ejemplo de Solicitud:**

```bash
curl --location --request PUT 'https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/multi/prop/put/by/shadow' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer hpc.l68ptk43b0hfijoko3vxfhx5oegqo6mz' \
--data '[
  {
    "deviceSerial": "Q31153369",
    "propReqs": [
      {
        "resourceCategory": "SubSystem",
        "localIndex": "1",
        "domainId": "AlarmSubSystemMgr",
        "propId": "SingleSubSystemBasicInfo3224",
        "value": {
          "linkageZoneInfo": {
            "supportLinkageZones": [
              1
            ]
          },
          "linkageChildDevInfo": [
            {}
          ],
          "name": "Area 2",
          "enabled": true
        }
      },
      {
        "resourceCategory": "SubSystem",
        "localIndex": "2",
        "domainId": "AlarmSubSystemMgr",
        "propId": "SingleSubSystemBasicInfo",
        "value": {
          "name": "area 8",
          "enabled": false
        }
      }
    ]
  }
]'
```

**Parámetros de Respuesta:**

| Parámetro    | Tipo       | Descripción |
| ------------ | ---------- | ----------- |
| data         | JSON Array | Resultado de la configuración en lote de propiedades. |
| deviceSerial | String     | Número de serie del dispositivo. |
| errorCode    | String     | Código de estado de la respuesta del dispositivo. |
| message      | String     | Descripción del estado de la respuesta del dispositivo. |

**Ejemplo de Respuesta:**

```json
{
  "data": [
    {
      "code": "200",
      "deviceSerial": "Q29598581",
      "message": "Operation succeeded"
    }
  ],
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - La tabla del body del PDF lista todos los campos bajo `propRequests` en un solo nivel (`-deviceSerial`, `-propReqs`, `-resourceCategory`…), pero el ejemplo muestra que el body es directamente un arreglo (sin la clave `propRequests`) y que `resourceCategory`, `localIndex`, `domainId`, `propId` y `value` van anidados dentro de `propReqs[]`. Aquí se documenta el anidamiento del ejemplo.
> - La tabla de respuesta del PDF lista `deviceSerial`, `errorCode` y `message` al mismo nivel que `data`; en el ejemplo, el resultado por dispositivo viene en `data[].deviceSerial`, `data[].code` y `data[].message`.
> - El primer elemento del ejemplo usa el `propId` `SingleSubSystemBasicInfo3224` y el segundo `SingleSubSystemBasicInfo`; se conservan tal como vienen en el PDF.

---

##### 5.7.2.9 Obtener Propiedades en Lote Directamente del Dispositivo

`PUT /api/hpcgw/v2/device/transparent/otap/multi/prop/get`

Obtiene varias propiedades en lote consultándolas directamente al dispositivo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/multi/prop/get`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo       | Ubicación | Descripción |
| ------------- | --------- | ---------- | --------- | ----------- |
| Content-Type  | Requerido | String     | Header    | `application/json` |
| Authorization | Requerido | String     | Header    | `Bearer <accessToken>` |
| x-devserial   | Requerido | String     | Header    | Número de serie del dispositivo. |
| propRequests  | Requerido | JSON Array | Body      | Lista de propiedades del dispositivo. |
| propRequests[].resourceCategory | Requerido | String | Body | Categoría del recurso. |
| propRequests[].localIndex | Requerido | String | Body | Número de recurso. |
| propRequests[].domainId | Requerido | String | Body | Dominio funcional. |
| propRequests[].propId | Requerido | String | Body | Identificador de la función. |

**Ejemplo de Solicitud:**

```bash
curl --location --request PUT https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/multi/prop/get
--header Content-Type: application/json
--header Authorization: Bearer hpc.l68ptk43b0hfijoko3vxfhx5oegqo6mz
--header x-devserial: Q31153341
--data [
 {
   "localIndex": "0",
   "resourceCategory": "global",
   "domainId": "InfoMgr",
   "propId": "DeviceDescription"
 },
 {
   "localIndex": "0",
   "resourceCategory": "global",
   "domainId": "InfoMgr",
   "propId": "DeviceVersion"
 }
]
```

**Parámetros de Respuesta:**

| Parámetro | Tipo   | Descripción |
| --------- | ------ | ----------- |
| data      | Object | Resultado de la obtención en lote de propiedades del dispositivo. |
| errorCode | String | Código de estado de la respuesta del dispositivo. |
| message   | String | Descripción del estado de la respuesta del dispositivo. |

**Ejemplo de Respuesta:**

```json
{
  "data": [
    {
      "propResps": [
        {
          "deviceSerial": "F65153704",
          "resourceCategory": "SubSystem",
          "localIndex": "1",
          "domainId": "AlarmSubSystemMgr",
          "propId": "SingleSubSystemBasicInfo",
          "value": {
            "linkageZoneInfo": {
              "supportLinkageZones": [
                2
              ]
            },
            "linkageChildDevInfo": [
              {}
            ],
            "name": "Area 2",
            "enabled": true
          },
          "timestamp": 1690251526886
        },
        {
          "deviceSerial": "F65153704",
          "resourceCategory": "SubSystem",
          "localIndex": "2",
          "domainId": "AlarmSubSystemMgr",
          "propId": "SingleSubSystemBasicInfo",
          "value": {
            "linkageZoneInfo": {
              "supportLinkageZones": [
                2
              ]
            },
            "linkageChildDevInfo": [
              {}
            ],
            "name": "area 8",
            "enabled": false
          },
          "timestamp": 1690251527410
        }
      ]
    }
  ],
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - Aunque obtiene datos, esta API usa el método `PUT`.
> - La tabla del body del PDF agrupa los campos bajo `propRequests`, pero el ejemplo envía directamente el arreglo (sin la clave `propRequests`).
> - El ejemplo curl del PDF no lleva comillas en la URL, los headers ni el `--data`, ni barras invertidas de continuación de línea; tal como está no es ejecutable en shell. Se conserva como viene en el PDF: agregue `'…'` y `\` al usarlo.
> - La tabla de respuesta declara `data` como Object, pero el ejemplo devuelve un arreglo (`data[].propResps[]`). Además, el ejemplo de respuesta (serie `F65153704`, propiedades de `AlarmSubSystemMgr`) no corresponde a la solicitud de ejemplo (`InfoMgr` en `Q31153341`).
> - Según el historial V2.14.0, esta API ya no recibe el header `X-Username`.

---

##### 5.7.2.10 Establecer Propiedades en Lote Directamente en el Dispositivo

`PUT /api/hpcgw/v2/device/transparent/otap/multi/prop/put`

Establece varias propiedades en lote directamente en el dispositivo.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/otap/multi/prop/put`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo       | Ubicación | Descripción |
| ------------- | --------- | ---------- | --------- | ----------- |
| Content-Type  | Requerido | String     | Header    | `application/json` |
| Authorization | Requerido | String     | Header    | `Bearer <accessToken>` |
| x-devserial   | Requerido | String     | Header    | Número de serie del dispositivo. |
| X-Username    | Opcional  | String     | Header    | Correo del usuario con el que se opera sobre el dispositivo de alarma. |
| X-UserType    | Opcional  | String     | Header    | Tipo de usuario de los dispositivos AX PRO: `"installer"`, `"administrator"`, `"operator"`. |
| propRequests  | Requerido | JSON Array | Body      | Lista de propiedades del dispositivo. |
| propRequests[].resourceCategory | Requerido | String | Body | Categoría del recurso. |
| propRequests[].localIndex | Requerido | String | Body | Número de recurso. |
| propRequests[].domainId | Requerido | String | Body | Dominio funcional. |
| propRequests[].propId | Requerido | String | Body | Identificador de la función. |
| propRequests[].value | Requerido | JSON | Body | Contenido a modificar. Su formato se detalla en el documento del protocolo OTAP correspondiente. |

**Ejemplo de Solicitud:**

```bash
curl --location --request PUT https://isgpapi.hik-partner.com/api/hpcgw/v2/device/transparent/otap/multi/prop/put
--header Content-Type: application/json
--header Authorization: Bearer hpc.l68ptk43b0hfijoko3vxfhx5oegqo6mz
--header x-devserial: Q31153341
--data [
 {
   "resourceCategory": "SubSystem",
   "localIndex": "1",
   "domainId": "AlarmSubSystemMgr",
   "propId": "SingleSubSystemBasicInfo3224",
   "value": {
     "linkageZoneInfo": {
       "supportLinkageZones": [
         1
       ]
     },
     "linkageChildDevInfo": [
       {}
     ],
     "name": "Area 2",
     "enabled": true
   }
 },
 {
   "resourceCategory": "SubSystem",
   "localIndex": "2",
   "domainId": "AlarmSubSystemMgr",
   "propId": "SingleSubSystemBasicInfo",
   "value": {
     "name": "area 8",
     "enabled": false
   }
 }
]
```

**Parámetros de Respuesta:**

| Parámetro | Tipo   | Descripción |
| --------- | ------ | ----------- |
| data      | Object | Resultado de la configuración en lote de propiedades en el dispositivo. |
| errorCode | String | Código de estado de la respuesta del dispositivo. |
| message   | String | Descripción del estado de la respuesta del dispositivo. |

**Ejemplo de Respuesta:**

```json
{
  "data": [
    {
      "propResps": [
        {
          "deviceSerial": "F65153704",
          "resourceCategory": "SubSystem",
          "localIndex": "1",
          "domainId": "AlarmSubSystemMgr",
          "propId": "SingleSubSystemBasicInfo",
          "value": {
            "linkageZoneInfo": {
              "supportLinkageZones": [
                2
              ]
            },
            "linkageChildDevInfo": [
              {}
            ],
            "name": "Area 2",
            "enabled": true
          },
          "timestamp": 1690251526886
        },
        {
          "deviceSerial": "F65153704",
          "resourceCategory": "SubSystem",
          "localIndex": "2",
          "domainId": "AlarmSubSystemMgr",
          "propId": "SingleSubSystemBasicInfo",
          "value": {
            "linkageZoneInfo": {
              "supportLinkageZones": [
                2
              ]
            },
            "linkageChildDevInfo": [
              {}
            ],
            "name": "area 8",
            "enabled": false
          },
          "timestamp": 1690251527410
        }
      ]
    }
  ],
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - El header `X-UserType` se agregó en la V2.14.0. A diferencia de las APIs `otap/direct` y `otap/action`, el PDF no indica aquí un valor por defecto.
> - La tabla del body del PDF agrupa los campos bajo `propRequests`, pero el ejemplo envía directamente el arreglo (sin la clave `propRequests`).
> - El ejemplo curl del PDF no lleva comillas en la URL, los headers ni el `--data`, ni barras invertidas de continuación de línea; se conserva como viene en el PDF.
> - La tabla de respuesta declara `data` como Object, pero el ejemplo devuelve un arreglo (`data[].propResps[]`). El ejemplo de respuesta del PDF es idéntico al de `otap/multi/prop/get` y no refleja los valores enviados en la solicitud.

---

##### 5.7.2.11 Obtener Lista de Datos OTAP

`GET /api/hpcgw/v2/device/transparent/api/service/device/otap/table/list?pageIndex=%s&pageSize=%s`

Obtiene datos de una lista OTAP de forma paginada (por ejemplo, la lista de usuarios del dispositivo).

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v2/device/transparent/api/service/device/otap/table/list?pageIndex=%s&pageSize=%s`

**Parámetros de Solicitud:**

| Parámetro          | Requerido | Tipo    | Ubicación | Descripción |
| ------------------ | --------- | ------- | --------- | ----------- |
| Content-Type       | Requerido | String  | Header    | `application/json` |
| Authorization      | Requerido | String  | Header    | `Bearer <accessToken>` |
| x-devserial        | Requerido | String  | Header    | Número de serie del dispositivo. |
| X-LocalIndex       | Requerido | String  | Header    | Número de recurso. |
| X-ResourceCategory | Requerido | String  | Header    | Categoría del recurso. |
| X-DomainIdentifier | Requerido | String  | Header    | Dominio funcional. |
| X-PropIdentifier   | Requerido | String  | Header    | Identificador de la propiedad de la función. |
| x-listIdentifier   | Requerido | String  | Header    | Identificador de la función. |
| pageIndex          | Requerido | Integer | Query     | Número de página; por defecto `1`. Si el valor es menor o igual a 0, se devuelve la página 1; si es mayor que la última página, se devuelve la última. |
| pageSize           | Requerido | Integer | Query     | Registros por página; por defecto 10, máximo 150. |

**Ejemplo de Solicitud:**

```bash
curl --location --request GET 'https://ieuapi.hik-partner.com/api/hpcgw/v2/device/transparent/api/service/device/otap/table/list?pageIndex=1&pageSize=150' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer hpc.l68ptk43b0hfijoko3vxfhx5oegqo6mz' \
--header 'x-devserial: Q04553078' \
--header 'X-DomainIdentifier: UserMgr' \
--header 'X-PropIdentifier: UserInfoCfgList' \
--header 'X-LocalIndex: 0' \
--header 'X-ResourceCategory: global' \
--header 'x-listIdentifier: UserInfoCfgChangeSync'
```

**Parámetros de Respuesta:**

| Parámetro          | Tipo          | Descripción |
| ------------------ | ------------- | ----------- |
| data               | Object        | Datos de la lista OTAP devueltos. |
| data.pageIndex     | Integer       | Número de página. |
| data.pageSize      | Integer       | Registros por página. |
| data.records       | Array<String> | Valores de las propiedades, en formato JSON. |
| data.totalPages    | Integer       | Total de páginas. |
| data.totalElements | Integer       | Total de registros. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "pageIndex": 1,
    "pageSize": 150,
    "records": ["xxx", "xxx"],
    "totalPages": 1,
    "totalElements": 20
  },
  "errorCode": "0",
  "message": "Ok"
}
```

> **Notas:**
> - El PDF lista `pageIndex` y `pageSize` en una tabla "Request Body" (Table 3-119), pero al ser una API `GET` se envían en la query string, como muestran la ruta y el ejemplo. Aquí se documentan con ubicación `Query`.
> - En el ejemplo curl del PDF falta la comilla de apertura de la URL y hay un espacio antes de la comilla de cierre (`pageSize=150 '`); aquí se muestra corregido.
> - En el ejemplo de respuesta del PDF las claves traen espacios por errata (`" pageIndex"`, `" records "`, etc.); aquí se muestran corregidas.
> - Cada elemento de `records` es una cadena con el valor de la propiedad en JSON; el PDF lo ilustra con `"xxx"`.

---

### 5.8 Audio y Video

> **Notas:**
> - Las APIs de esta sección aplican a los altavoces de red (IP speaker): tipo de dispositivo (`deviceCategory`) `12` y subtipo (`deviceSubCategory`) `19`.
> - El flujo completo de carga, aplicación, consulta, eliminación y cut-in de audio se describe en [4.8 Audio y Video](#48-audio-y-video).
> - En V2.13.0 se agregaron los códigos de error `VMS022554` (los recursos físicos no existen) y `VMS050034` (no se encontró el dispositivo vinculado), asociados a estas APIs. Ver [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error).

#### 5.8.1 Subir Archivo de Audio

`POST /api/hpcgw/v1/audio/file/upload`

Sube un archivo de audio.

> **Notas:**
> - El archivo de audio no debe superar 10 MB; los formatos admitidos son MP3, WAV y AAC.
> - El tipo principal del altavoz de red es `12` y el subtipo es `19`.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/audio/file/upload`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo          | Ubicación | Descripción |
| ------------- | --------- | ------------- | --------- | ----------- |
| Content-Type  | Requerido | String        | Header    | `multipart/form-data` |
| Authorization | Requerido | String        | Header    | `Bearer <accessToken>` |
| fileName      | Requerido | String        | Form      | Nombre del archivo. Debe ser único. |
| formatType    | Requerido | String        | Form      | Formato del archivo: `"mp3"`, `"wav"`, `"aac"`. |
| audioFile     | Requerido | MultipartFile | Form      | Archivo de audio. Solo admite subir un único archivo de no más de 10 MB. |

**Ejemplo de Solicitud:**

```text
{
     "fileName": "xxxxxx",
     "formatType": "mp3",
     "audioFile": xxxxx
}
```

**Parámetros de Respuesta:**

| Parámetro         | Tipo   | Descripción |
| ----------------- | ------ | ----------- |
| data.audioFileUrl | String | Dirección de almacenamiento del archivo de audio. |
| data.uuid         | String | ID único del archivo de audio. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "audioFileUrl": "xxxxx",
    "uuid": "xxxxx"
  },
  "errorCode": "0"
}
```

> **Notas:**
> - Aunque el cuerpo de la solicitud es `multipart/form-data`, el PDF muestra el ejemplo con notación tipo JSON y el valor de `audioFile` sin comillas (marcador del archivo binario). No es JSON válido; se conserva tal cual en un bloque `text`. En la práctica, envíe `fileName`, `formatType` y `audioFile` como campos del formulario multipart.
> - La tabla de respuesta del PDF lista `audioFileUrl` y `uuid` sin prefijo; el ejemplo muestra que van dentro de `data`.

---

#### 5.8.2 Aplicar Archivo de Audio al Dispositivo

`POST /api/hpcgw/v1/audio/file/add`

Aplica el archivo de audio al dispositivo.

> **Notas:**
> - Primero suba el archivo de audio para obtener su URL de almacenamiento mediante [`POST /api/hpcgw/v1/audio/file/upload`](#581-subir-archivo-de-audio).
> - El archivo de audio no debe superar 10 MB; los formatos admitidos son MP3, WAV y AAC.
> - El tipo principal del altavoz de red es `12` y el subtipo es `19`.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/audio/file/add`

**Parámetros de Solicitud:**

| Parámetro                       | Requerido | Tipo   | Ubicación | Descripción |
| ------------------------------- | --------- | ------ | --------- | ----------- |
| Content-Type                    | Requerido | String | Header    | `application/json` |
| Authorization                   | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial                    | Requerido | String | Body      | Número de serie del dispositivo. |
| customAudioInfo                 | Requerido | Object | Body      | Contenido de audio que se aplicará. |
| customAudioInfo.customAudioName | Requerido | String | Body      | Nombre del archivo de audio personalizado. |
| customAudioInfo.customAudioURL  | Requerido | String | Body      | URL del archivo de audio personalizado. |
| customAudioInfo.audioFileFormat | Requerido | String | Body      | Formato del archivo de audio: `"mp3"`, `"wav"`, `"aac"`. |
| customAudioInfo.uuid            | Requerido | String | Body      | ID único del archivo de audio. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxxxxx",
  "customAudioInfo": {
    "customAudioName": "xxxxxx",
    "audioFileFormat": "xxxxxx",
    "customAudioURL": "xxxxx",
    "uuid": "xxxx"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - `customAudioURL` y `uuid` corresponden a `data.audioFileUrl` y `data.uuid` devueltos por `audio/file/upload`. Observe la diferencia de mayúsculas entre `audioFileUrl` (respuesta de carga) y `customAudioURL` (esta solicitud).

---

#### 5.8.3 Obtener Lista de Audios del Dispositivo

`POST /api/hpcgw/v1/audio/file/list/get`

Obtiene la lista de audios del dispositivo. El tipo principal del altavoz de red es `12` y el subtipo es `19`.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/audio/file/list/get`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String | Body      | Número de serie del dispositivo. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxxxxx"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.CustomAudioInfoList | Object[] | Lista de información de audios personalizados. |
| data.CustomAudioInfoList[].customAudioID | Integer | ID del archivo de audio personalizado. |
| data.CustomAudioInfoList[].customAudioName | String | Nombre del archivo de audio personalizado. |
| data.CustomAudioInfoList[].customAudioPath | String | Directorio del servidor donde se almacenan los archivos de audio personalizados. |
| data.CustomAudioInfoList[].audioFileFormat | String | Formato del archivo de audio: `"mp3"`, `"wav"`, `"aac"`. |
| data.CustomAudioInfoList[].audioFileSize | Integer | Tamaño del archivo de audio. Rango: [0, 2097152000]. Unidad: byte. |
| data.CustomAudioInfoList[].audioFileDuration | Integer | Duración del archivo de audio. Rango: [0, 3600]. Unidad: segundo. |
| data.CustomAudioInfoList[].customAudioFile | Object | Información de almacenamiento del archivo de audio personalizado. |
| data.CustomAudioInfoList[].customAudioFile.filePathType | String | Tipo de dirección de acceso del archivo de audio personalizado: `"localPath"` (almacenamiento local del dispositivo), `"simpleStorage"` (protocolo de almacenamiento simple), `"URL"` (dirección accesible directamente), `"binary"` (datos binarios para transmisión directa del archivo). |
| data.CustomAudioInfoList[].customAudioFile.filePath | String | Ruta del archivo de audio. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "CustomAudioInfoList": [
      {
        "customAudioID": 11111,
        "customAudioName": "xxx",
        "customAudioPath": 11111,
        "audioFileFormat": 11111,
        "audioFileSize": 10,
        "audioFileDuration": 100,
        "customAudioFile": {
          "filePathType": "xxx",
          "filePath": "xxx"
        }
      }
    ]
  },
  "errorCode": "0"
}
```

> **Notas:**
> - `CustomAudioInfoList` empieza con mayúscula, tal como en el PDF.
> - En el ejemplo del PDF, `customAudioPath` y `audioFileFormat` aparecen con valores numéricos (`11111`), aunque la tabla los define como String. Considere la tabla como referencia del tipo y valide la respuesta real en su entorno.
> - Use `customAudioID` como identificador en [`audio/file/del`](#584-eliminar-archivos-de-audio) y en [`audio/inter/cut`](#585-cut-in-de-audio).

---

#### 5.8.4 Eliminar Archivos de Audio

`POST /api/hpcgw/v1/audio/file/del`

Elimina uno o varios archivos de audio. El tipo principal del altavoz de red es `12` y el subtipo es `19`.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/audio/file/del`

**Parámetros de Solicitud:**

| Parámetro         | Requerido | Tipo      | Ubicación | Descripción |
| ----------------- | --------- | --------- | --------- | ----------- |
| Content-Type      | Requerido | String    | Header    | `application/json` |
| Authorization     | Requerido | String    | Header    | `Bearer <accessToken>` |
| deviceSerial      | Requerido | String    | Body      | Número de serie del dispositivo. |
| customAudioIDList | Requerido | Integer[] | Body      | Lista de ID de archivos de audio. Los ID de la lista son únicos. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxxxxx",
  "customAudioIDList": [1, 2]
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data.Result | Object[] | Resultado. |
| data.Result[].customID | Integer | ID del archivo de audio que se eliminará. |
| data.Result[].statusCode | Integer | Si la operación tuvo éxito: `1` (éxito); otros valores (falla). |
| data.Result[].statusString | String | `"ok"` (éxito); otros valores (información del error). |
| data.Result[].subStatusCode | String | `"ok"` (éxito); otros valores (información del error). |
| data.Result[].errorCode | Integer | Código de estado: `1` (éxito); otros valores (falla). |
| data.Result[].errorMsg | String | Detalle del error. |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "Result": [
      {
        "customID": 11111,
        "statusCode": 11111,
        "statusString": "xxx",
        "subStatusCode": "xxx",
        "errorCode": 111,
        "errorMsg": "xxx"
      }
    ]
  },
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla del PDF lista `Result` en el primer nivel; el ejemplo muestra que va dentro de `data`.
> - El `errorCode` de cada elemento de `Result` es un Integer por elemento (`1` = éxito) y es distinto del `errorCode` de nivel raíz (String, `"0"` = éxito). Evalúe ambos: la llamada puede ser exitosa y aun así fallar la eliminación de algún archivo.

---

#### 5.8.5 Cut-in de Audio

`POST /api/hpcgw/v1/audio/inter/cut`

Ejecuta el cut-in de audio (inserción de audio). El tipo principal (`deviceCategory`) del altavoz de red es `12` y el subtipo (`deviceSubCategory`) es `19`.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/audio/inter/cut`

**Parámetros de Solicitud:**

| Parámetro                              | Requerido | Tipo     | Ubicación | Descripción |
| -------------------------------------- | --------- | -------- | --------- | ----------- |
| Content-Type                           | Requerido | String   | Header    | `application/json` |
| Authorization                          | Requerido | String   | Header    | `Bearer <accessToken>` |
| deviceSerial                           | Requerido | String   | Body      | Número de serie del dispositivo. |
| audioLevel                             | Requerido | Integer  | Body      | Nivel de prioridad de reproducción del audio: [0, 15]. Cuanto mayor el valor, mayor la prioridad. Se compara la prioridad del audio que se está reproduciendo con la del audio de cut-in para decidir si el audio de cut-in se reproduce de inmediato o espera a que termine la reproducción actual. Se puede asignar una prioridad mayor al audio de cut-in. |
| enabled                                | Opcional  | Boolean  | Body      | Si se habilita el cut-in: `true` (habilitar, valor por defecto), `false` (deshabilitar). Si el campo no se envía, el cut-in queda habilitado por defecto. |
| playMode                               | Opcional  | String   | Body      | Modo de reproducción: `"order"` (reproduce en orden y repite una vez), `"loop"` (reproduce en bucle, en orden). Cuando `playMode` es `loop`, `playDuration` es obligatorio. |
| playDuration                           | Opcional  | Integer  | Body      | Duración de la reproducción: [0, 86400]. Unidad: segundo. |
| audioVolume                            | Requerido | Integer  | Body      | Volumen de difusión: [0, 100]. |
| TTSLanguageType                        | Opcional  | String   | Body      | Idioma del TTS: `"chinese"`, `"english"` (valor por defecto), `"spanish"`, `"russian"`, `"japanese"`, `"thai"`. |
| voiceType                              | Opcional  | String   | Body      | Tipo de voz: `"male"`, `"female"`. |
| pace                                   | Opcional  | Integer  | Body      | Velocidad del habla: [0, 100]. |
| playAudioList                          | Requerido | Object[] | Body      | Contenido de audio del cut-in. |
| playAudioList[].audioSource            | Requerido | String   | Body      | Fuente del audio: `"customAudio"` (archivo de audio personalizado), `"speechSynthesis"` (síntesis de voz). |
| playAudioList[].customAudioID          | Opcional  | Integer  | Body      | ID del archivo de audio personalizado. Obligatorio cuando `audioSource` es `"customAudio"`. |
| playAudioList[].speechSynthesisContent | Opcional  | String   | Body      | Contenido de la síntesis de voz. Obligatorio cuando `audioSource` es `"speechSynthesis"`. Longitud: [1, 4096]. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxx",
  "audioLevel": 111,
  "enabled": true,
  "playMode": "xxx",
  "playDuration": 111,
  "audioVolume": 111,
  "TTSLanguageType": "xxx",
  "voiceType": "xxx",
  "pace": 111,
  "playAudioList": [
    {
      "audioSource": "xxx",
      "customAudioID": 111
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

> **Notas:**
> - Los valores numéricos del ejemplo del PDF (`"audioLevel": 111`, `"audioVolume": 111`) son marcadores y quedan fuera de los rangos documentados ([0, 15] y [0, 100]). Envíe valores dentro de rango.
> - `TTSLanguageType` empieza con mayúsculas, tal como en el PDF.
> - Para reproducir voz sintetizada, use `"audioSource": "speechSynthesis"` con `speechSynthesisContent`; `TTSLanguageType`, `voiceType` y `pace` controlan el idioma, la voz y la velocidad.

---

### 5.9 Servicios de Valor Agregado

#### 5.9.1 Activar Paquete de Mantenimiento del Dispositivo

`POST /api/hpcgw/v1/vas/opspack/active`

Activa el paquete de mantenimiento (O&M) del dispositivo. Si existe un servicio premium, este se usa con prioridad sobre el paquete de mantenimiento local.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/vas/opspack/active`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| deviceSerial  | Requerido | String  | Body      | Número de serie del dispositivo. |
| opspackType   | Opcional  | Integer | Body      | Tipo de paquete de mantenimiento: `1` (paquete anual para todos los tipos de dispositivo), `2` (paquete anual para cámaras de red). Es obligatorio cuando no existe servicio premium. |
| num           | Opcional  | Integer | Body      | Cantidad de unidades locales que se usarán: [1, 10]. Es obligatorio cuando no existe servicio premium. |

**Ejemplo de Solicitud:**

```json
{
  "deviceSerial": "xxxxxx",
  "opspackType": 1,
  "num": 2
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - Ver el contexto de esta capacidad en [4.7 Servicios de Valor Agregado](#47-servicios-de-valor-agregado).

---

### 5.10 Webhook

> **Notas:**
> - El flujo completo de envío de mensajes y el cálculo de la firma (`X-Hook-Signature`) se describen en [4.10 Envío de Mensajes por Webhook](#410-envío-de-mensajes-por-webhook).

#### 5.10.1 Consultar Configuración de Webhook

`POST /api/hpcgw/webhook/v1/config/query`

Obtiene la configuración de envío de mensajes.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/webhook/v1/config/query`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` (token de acceso del usuario). |

**Parámetros de Respuesta:**

| Parámetro        | Tipo    | Descripción |
| ---------------- | ------- | ----------- |
| data.callbackUrl | String  | URL de callback para el envío. |
| data.retryTimes  | Integer | Número de reintentos. |
| data.retryDelay  | Long    | Intervalo entre reintentos (milisegundos). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "callbackUrl": "https://xxx.com",
    "retryTimes": 3,
    "retryDelay": 1000
  },
  "errorCode": "0"
}
```

> **Notas:**
> - La tabla del PDF lista los campos sin prefijo; el ejemplo muestra que van dentro de `data`. La respuesta no devuelve `signSecret`.

---

#### 5.10.2 Guardar Configuración de Webhook

`POST /api/hpcgw/webhook/v1/config/save`

Guarda la configuración de envío de mensajes.

> **Notas:**
> - Actualmente solo se permite una configuración de Webhook por cuenta.
> - Las URL de callback deben usar el protocolo HTTPS.
> - Cuando se alcanza el límite de reintentos, los mensajes se descartan y se conservan durante 1 mes. Los integradores pueden contactar al soporte técnico para que se reenvíen los mensajes válidos.
> - Para el proceso detallado de configuración de la clave secreta de la firma, consulte [4.10 Envío de Mensajes por Webhook](#410-envío-de-mensajes-por-webhook).

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/webhook/v1/config/save`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` (token de acceso del usuario). |
| callbackUrl   | Requerido | String  | Body      | Dirección de callback para el envío. Debe admitir solicitudes GET y POST y usar HTTPS. Longitud máxima: 256 caracteres. |
| retryTimes    | Opcional  | Integer | Body      | Número de reintentos. Rango: [-1, 5]. Por defecto: `3`. El valor `-1` indica reintentos ilimitados durante 2 horas. |
| retryDelay    | Opcional  | Long    | Body      | Intervalo entre reintentos (milisegundos). |
| signSecret    | Opcional  | String  | Body      | Clave secreta para la firma (se usa para firmar la información enviada). Si está vacía, se usa por defecto la SecretKey (SK). Longitud: de 8 a 32 caracteres. Formato: combinación de letras y dígitos. |

**Ejemplo de Solicitud:**

```json
{
  "callbackUrl": "https://xxx.com",
  "retryTimes": 3,
  "retryDelay": 1000,
  "signSecret": "xxxx"
}
```

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

> **Notas:**
> - El valor `"signSecret": "xxxx"` del ejemplo del PDF es un marcador de 4 caracteres; un valor real debe tener entre 8 y 32 caracteres.

---

#### 5.10.3 Eliminar Configuración de Webhook

`POST /api/hpcgw/webhook/v1/config/delete`

Elimina la configuración de envío de mensajes.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/webhook/v1/config/delete`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo   | Ubicación | Descripción |
| ------------- | --------- | ------ | --------- | ----------- |
| Content-Type  | Requerido | String | Header    | `application/json` |
| Authorization | Requerido | String | Header    | `Bearer <accessToken>` (token de acceso del usuario). |

**Ejemplo de Respuesta:**

```json
{
  "errorCode": "0"
}
```

---

### 5.11 Instalador

#### 5.11.1 Buscar Empleados

`POST /api/hpcgw/v1/installers/search`

Busca la lista de empleados.

**URL de Solicitud:** `https://{areaDomain}/api/hpcgw/v1/installers/search`

**Parámetros de Solicitud:**

| Parámetro     | Requerido | Tipo    | Ubicación | Descripción |
| ------------- | --------- | ------- | --------- | ----------- |
| Content-Type  | Requerido | String  | Header    | `application/json` |
| Authorization | Requerido | String  | Header    | `Bearer <accessToken>` |
| page          | Opcional  | Integer | Body      | Número de página actual. Por defecto es la primera página. |
| pageSize      | Opcional  | Integer | Body      | Elementos por página. Por defecto 20. |
| search        | Opcional  | String  | Body      | Condición de búsqueda: nombre de usuario, correo electrónico y número de teléfono. Admite búsqueda difusa. Si no se envía, se muestran todos los resultados. |

**Ejemplo de Solicitud:**

```json
{
  "search": "name"
}
```

**Parámetros de Respuesta:**

| Parámetro | Tipo | Descripción |
| --------- | ---- | ----------- |
| data | Object | Datos de respuesta. |
| data.page | Integer | Número de página. Por defecto es la página 1. |
| data.pageSize | Integer | Elementos por página. Por defecto 20. |
| data.rows | Object[] | Resultados de la búsqueda. |
| data.rows[].id | String | ID del empleado (`InstallerId`). |
| data.rows[].firstName | String | Nombre del empleado. |
| data.rows[].lastName | String | Apellido del empleado. |
| data.rows[].email | String | Correo electrónico. |
| data.rows[].phone | String | Número de teléfono. |
| data.rows[].invitedStatus | Boolean | Estado de registro del empleado invitado: `true` (registrado), `false` (no registrado). |
| data.rows[].isAdmin | Boolean | Si el empleado es el administrador. |
| data.rows[].enableStatus | Boolean | Si la identidad del empleado está habilitada: `true` (sí), `false` (no). |

**Ejemplo de Respuesta:**

```json
{
  "data": {
    "page": 1,
    "pageSize": 20,
    "rows": [
      {
        "email": "string",
        "enableStatus": true,
        "firstName": "string",
        "id": "string",
        "invitedStatus": true,
        "isAdmin": true,
        "lastName": "string",
        "phone": "string"
      }
    ],
    "total": 0,
    "totalPage": 0
  },
  "errorCode": "0"
}
```

> **Notas:**
> - El ejemplo del PDF incluye `data.total` y `data.totalPage`, que no aparecen en la tabla de respuesta; por su nombre corresponden al total de elementos y de páginas.
> - El `id` devuelto es el `installerId` que usan otras APIs de esta guía (por ejemplo, en la asignación de instaladores a sitios). Ver el contexto en [4.9 Instalador](#49-instalador).

---

### 5.12 APIs Retiradas

Las siguientes APIs se retiraron de Hik-Partner Pro OpenAPI según el historial de actualizaciones del PDF (sección 1.2; ver [HISTORIAL-ACTUALIZACIONES.md](HISTORIAL-ACTUALIZACIONES.md)). Se listan solo como referencia para integraciones existentes.

| API | Retirada en | Motivo/nota | Estado |
| --- | ----------- | ----------- | ------ |
| `POST /api/hpcgw/v1/site/health/report` | V2.15.500 | Servicio de monitoreo de salud del sitio (reporte de salud). | ❌ Retirada |
| `POST /api/hpcgw/v1/device/iot/ability/query` | V2.15.500 | Gestión de dispositivos: verificar si se admite agregar dispositivos de modelo de objeto. | ❌ Retirada |
| `POST /api/hpcgw/v1/device/iot/add/result` | V2.15.500 | Gestión de dispositivos: estado de alta del dispositivo de modelo de objeto. | ❌ Retirada |
| `POST /api/hpcgw/v1/video/by/time` | V2.15.500 | Gestión de video: información de archivos almacenados por tiempo. | ❌ Retirada |
| APIs de cloud attendance (asistencia en la nube) | V2.15.0 | Se retiraron junto con su aplicación típica. El PDF ya no indica sus rutas. | ❌ Retirada |

> **Notas:**
> - No implemente estas APIs contra `hpcgw`: ya no forman parte de la guía V2.15.500 y no deben usarse en integraciones nuevas. Si una integración existente las usa, migre a las capacidades vigentes documentadas en este capítulo.
> - El motivo de cada retiro no se detalla en el PDF; la columna **Motivo/nota** resume el módulo y la función que indicaba el historial de cambios.
---

## Apéndices

| Apéndice | Contenido | Secciones del PDF |
| -------- | --------- | ----------------- |
| [APENDICE-A.md](./APENDICE-A.md) | Códigos de estado y error de la OpenAPI, idiomas, zonas horarias y mensajes de evento | A.1–A.4 |
| [APENDICE-B.md](./APENDICE-B.md) | URIs y mensajes ISAPI del reenvío transparente | A.5–A.6 |
| [APENDICE-C.md](./APENDICE-C.md) | Códigos de respuesta de los dispositivos (protocolo de texto) y por módulo funcional | A.7–A.8 |

---

## Aviso legal

Documentación de integración SYSCOM. El producto Hikvision se ofrece según sus términos. Esta traducción no sustituye al PDF oficial en [docs/](./docs/), que prevalece ante cualquier discrepancia. Use equipos de laboratorio para las operaciones destructivas (eliminar sitios o dispositivos, actualizar firmware, armar/desarmar, cut-in de audio).
