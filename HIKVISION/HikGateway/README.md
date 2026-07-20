# Hik DeviceGateway (HikGateway) — API REST V1.8.0

> Versión del documento: V1.8.0 — Enero 2025  
> Producto: Hik Device Gateway — convertidor de protocolos on-premise

Documentación técnica en español de la **API REST (estilo ISAPI, en JSON)** que expone **Hik DeviceGateway**, el gateway on-premise de Hikvision que unifica dispositivos de video y de control de acceso —que hablan protocolos heterogéneos (ISUP/EHome, ISAPI, ONVIF, GB/T-28181)— detrás de un único contrato HTTP/HTTPS con autenticación **HTTP Digest (MD5)**. Es una vía de integración alternativa a [Hik-Connect for Teams](../HikConnect-Team/README.md): a diferencia de aquella (servicio en la nube), HikGateway se instala y opera en su propia infraestructura.

---

## Información Legal

- Este documento es una guía de integración elaborada por **SYSCOM** para desarrolladores e integradores, con base en la documentación oficial del fabricante incluida en [`docs/`](./docs/).
- **AVISO LEGAL:** el producto y su documentación oficial se proporcionan "tal cual", sin garantías expresas ni implícitas. Hikvision es propietaria de los derechos de autor y marcas relacionadas con el producto descrito. Las marcas y logotipos mencionados pertenecen a sus respectivos titulares.
- Usted es el único responsable de utilizar el producto conforme a la legislación aplicable, respetando los derechos de terceros (incluidos los de privacidad y protección de datos). Ante cualquier conflicto entre este documento y la documentación oficial del fabricante, prevalece esta última.
- Para soporte técnico e integración, contacte al equipo de SYSCOM.

---

## Demos Disponibles

| Demo | Descripción |
| ---- | ----------- |
| [Consola de integración](./demos/gateway/README.md) | Aplicación web autocontenida que se conecta a un gateway real: gestión de dispositivos, explorador de la API ISAPI (playground con Code HUD), control de acceso (personas, tarjetas, puertas, eventos) y video en vivo con PTZ. Incluye proxy dual (local con Node y despliegue en Cloudflare Workers) que resuelve el handshake HTTP Digest. |

---

## Tabla de Contenidos

- [Capítulo 1 — Descripción General](#capítulo-1--descripción-general)
  - [1.1 Introducción](#11-introducción)
  - [1.2 Capacidades Abiertas](#12-capacidades-abiertas)
  - [1.3 Términos y Definiciones](#13-términos-y-definiciones)
  - [1.4 Historial de Actualizaciones](#14-historial-de-actualizaciones)
- [Capítulo 2 — Primeros Pasos](#capítulo-2--primeros-pasos)
- [Capítulo 3 — Resumen del Protocolo](#capítulo-3--resumen-del-protocolo)
  - [3.1 Reglas de API](#31-reglas-de-api)
  - [3.2 Firma y Autenticación](#32-firma-y-autenticación)
  - [3.3 Reglas de Respuesta](#33-reglas-de-respuesta)
- [Capítulo 4 — Aplicaciones Típicas](#capítulo-4--aplicaciones-típicas)
  - [4.1 Agregar Dispositivos al Gateway](#41-agregar-dispositivos-al-gateway)
  - [4.2 Video y Audio](#42-video-y-audio)
  - [4.3 Control de Acceso](#43-control-de-acceso)
  - [4.4 Alarmas y Eventos](#44-alarmas-y-eventos)
- [Capítulo 5 — Referencia de API](#capítulo-5--referencia-de-api)
  - [5.1 Gestión de Dispositivos](#51-gestión-de-dispositivos)
  - [5.2 Operación de Dispositivo](#52-operación-de-dispositivo)
  - [5.3 Mantenimiento del Gateway](#53-mantenimiento-del-gateway)
  - [5.4 Transmit Device ISAPI (Passthrough)](#54-transmit-device-isapi-passthrough)
  - [5.5 Video en Vivo y Multimedia](#55-video-en-vivo-y-multimedia)
  - [5.6 Operación de Dispositivos de Video](#56-operación-de-dispositivos-de-video)
  - [5.7 Servidores de Escucha y Notificaciones](#57-servidores-de-escucha-y-notificaciones)
  - [5.8 Control de Acceso — Personas](#58-control-de-acceso--personas)
  - [5.9 Control de Acceso — Rostro](#59-control-de-acceso--rostro)
  - [5.10 Control de Acceso — Tarjeta](#510-control-de-acceso--tarjeta)
  - [5.11 Control de Acceso — Huella](#511-control-de-acceso--huella)
  - [5.12 Control de Acceso — Eventos](#512-control-de-acceso--eventos)
  - [5.13 Control de Acceso — Control de Puerta](#513-control-de-acceso--control-de-puerta)
  - [5.14 Control de Acceso — Parámetros de Puerta](#514-control-de-acceso--parámetros-de-puerta)
  - [5.15 Control de Acceso — Programación de Permisos](#515-control-de-acceso--programación-de-permisos)
  - [5.16 Suscripción a Alarmas y Eventos](#516-suscripción-a-alarmas-y-eventos)
- [Apéndice A — Apéndices](APENDICE-A.md)

> **Apéndices y anexos:** los diccionarios de datos, la descripción de objetos JSON y los códigos de estado/error se documentan en [APENDICE-A.md](APENDICE-A.md). El historial de versiones está en [HISTORIAL-ACTUALIZACIONES.md](HISTORIAL-ACTUALIZACIONES.md). Los PDF oficiales del fabricante y la colección Postman están en [`docs/`](./docs/).

---


## Capítulo 1 — Descripción General

### 1.1 Introducción

Hik Device Gateway (HikGateway) es un **gateway on-premise** que actúa como **convertidor de protocolos** entre los dispositivos Hikvision y su plataforma o aplicación de integración. Se instala en un servidor Linux de su propiedad y **no es un servicio en la nube**: todo el tráfico, la administración de dispositivos y los flujos de video permanecen dentro de su infraestructura.

Su función principal es unificar la enorme diversidad de protocolos que hablan los dispositivos Hikvision (cámaras corporales, domos rápidos portátiles, dispositivos móviles/embarcados, dispositivos de alarma, terminales de control de acceso, NVR, etc.) detrás de **una única API REST estilo ISAPI**. De este modo, el integrador programa contra un solo contrato en JSON sobre HTTP/HTTPS, mientras el gateway se encarga de traducir hacia ISUP/EHome, ISAPI, ONVIF o GB/T-28181 según el dispositivo. Cada dispositivo se direcciona por su `devIndex` (un UUID único generado al agregarlo).

Este documento describe el mecanismo de comunicación y seguridad, las operaciones del gateway, las operaciones sobre los dispositivos agregados (vista en vivo, reproducción, búsqueda de video, etc.), la suscripción a alarmas/eventos y el control de acceso.

> **Notas:**
>
> - REST (Representational State Transfer) es un método de diseño de protocolo en el que toda la información se modela como recursos. Cada recurso se identifica de forma única mediante un URI (Uniform Resource Identifier), lo que permite una gestión simple y extensible.
> - El gateway está dirigido a **fabricantes y desarrolladores de terceros (integradores)** que necesiten incorporar dispositivos Hikvision a su propia plataforma sin implementar cada protocolo de dispositivo por separado.

**Requisitos previos antes de comenzar la integración:**

- Un **servidor Linux** dedicado donde se instale y ejecute el gateway (ver [Capítulo 2 — Primeros Pasos](#capítulo-2--primeros-pasos)).
- Uno o varios **dispositivos Hikvision** compatibles, accesibles por red desde el servidor del gateway.
- **Credenciales de administrador** (usuario `admin`) para la consola web del gateway y para la autenticación de la API.
- Conocimientos básicos de un lenguaje de programación con soporte de cliente HTTP y **autenticación HTTP Digest (MD5)**, así como nociones de seguridad de video (canales, PTZ, alarmas) y de streaming RTSP.

---

### 1.2 Capacidades Abiertas

#### 1.2.1 Protocolos de Dispositivo Soportados

Hacia los dispositivos, el gateway habla múltiples protocolos y los convierte a la API REST unificada. Hacia el integrador, siempre se expone la misma API estilo ISAPI en JSON.

- **ISUP / EHome 2.0** — Protocolo de registro activo del dispositivo hacia el gateway (el dispositivo inicia la conexión). Es el modo habitual para dispositivos móviles, corporales y embarcados con IP dinámica o detrás de NAT.
- **ISUP 5.0 / EHome V5** — Evolución del protocolo ISUP. Los dispositivos agregados por este medio habilitan capacidades adicionales, como la **reproducción y la descarga de video por tiempo**.
- **ISAPI** — Protocolo REST nativo de Hikvision para dispositivos con IP fija accesible; el gateway se conecta directamente al dispositivo.
- **ONVIF** — Protocolo estándar de la industria para dispositivos de video de terceros compatibles con Hikvision.
- **GB/T-28181** — Estándar chino de interconexión para sistemas de videovigilancia.

> **Notas:**
>
> - En las páginas de referencia de este documento (Capítulos 1 a 4) se detallan explícitamente los flujos para dispositivos agregados por **ISUP/EHome** e **ISAPI**; el soporte de **ONVIF** y **GB/T-28181** forma parte de las capacidades del producto como convertidor de protocolos.
> - Al agregar un dispositivo por ISUP/EHome se emplean sus credenciales de registro `EhomeID` y `EhomeKey`. Tras agregarlo, conviene consultar la lista de dispositivos para verificar su estado en línea/fuera de línea.

#### 1.2.2 Capacidades de Video

Para vista en vivo, reproducción y audio bidireccional, el flujo es siempre el mismo: primero se solicita al gateway la URL de streaming del dispositivo y luego se opera esa URL mediante métodos RTSP.

- **Vista en vivo** — Obtención en tiempo real del video/audio del área monitoreada.
- **Reproducción** — Reproducción remota de grabaciones por archivo o por tiempo (la reproducción por tiempo requiere dispositivos agregados vía ISUP 5.0).
- **Descarga de archivos de video** — Descarga de grabaciones al equipo local por archivo o por tiempo (la descarga por tiempo requiere dispositivos agregados vía ISUP 5.0).
- **Control PTZ** — Movimiento panorámico, inclinación y zoom; ajuste y llamada de presets, auto-escaneo, enfoque, iris, posicionamiento 3D y funciones auxiliares (luz, limpiaparabrisas, calefactor, ventilador).
- **Audio bidireccional** — Envío y recepción de audio entre la plataforma y las cámaras (por ejemplo, cámaras corporales).
- **Grabación y captura** — Grabación manual de video y captura de imágenes de los canales.

#### 1.2.3 Capacidades de Control de Acceso

El modelo de control de acceso toma a la **persona** como unidad de gestión: una persona puede vincularse con tarjetas, rostros y huellas para obtener permisos de acceso.

- **Gestión de personas** — Alta individual o por lotes, edición, conteo, búsqueda y eliminación.
- **Gestión de tarjetas** — Alta, edición, conteo, búsqueda y eliminación de tarjetas vinculadas a personas.
- **Gestión de rostros** — Alta de registros de rostro o carga de la imagen de rostro de una persona; conteo, búsqueda y eliminación.
- **Gestión de huellas** — Recolección de la huella mediante el lector, aplicación al dispositivo, edición, búsqueda y eliminación.
- **Control de puertas** — Control remoto de puertas (mantener abierta, mantener cerrada o estado normal) y consulta del estado de funcionamiento.
- **Eventos de acceso** — Búsqueda de eventos históricos de control de acceso y configuración del modo de reconocimiento facial.

#### 1.2.4 Eventos y Notificaciones

El gateway ofrece dos modos, mutuamente excluyentes, para obtener alarmas y eventos de los dispositivos.

- **Recepción directa** — Se configura en el dispositivo un servidor de escucha (`httpHosts`) al que este sube automáticamente los eventos/alarmas por HTTP en cuanto se producen.
- **Suscripción** — El integrador se suscribe a los tipos de alarma/evento deseados y el gateway le entrega la información suscrita junto con latidos de vida (heartbeat).

> **Notas:**
>
> - El **modo de recepción directa** y el **modo de suscripción** no pueden utilizarse al mismo tiempo.
> - En el modo de suscripción, el intervalo de latido predeterminado es de **10 segundos** y el tiempo de espera sugerido es de **30 segundos**; si no se recibe latido dentro de ese plazo, debe reconstruirse la suscripción.

#### 1.2.5 Transmit Device ISAPI

El gateway incluye un mecanismo de **paso directo (passthrough)** que permite reenviar una petición ISAPI nativa hacia un dispositivo específico, direccionándolo por su `devIndex`. Esto habilita el acceso a comandos ISAPI del dispositivo que no cuentan con un endpoint dedicado en la API del gateway.

> **Notas:**
>
> - En la referencia de la API, esta capacidad se expone con la forma `http://<ipAddress>:<port>/<ISAPIURI>?devIndex=<uuid>`, donde `<ISAPIURI>` es la ruta ISAPI original del dispositivo.

---

### 1.3 Términos y Definiciones

| Término | Descripción |
| ------- | ----------- |
| `devIndex` | Identificador único (UUID/GUID de 128 bits) que el gateway asigna a cada dispositivo al agregarlo. Se incluye en el parámetro `query` de la URL para direccionar al dispositivo de destino (por ejemplo, `?devIndex=550e8400e29b41d4a716446655440000`). |
| ISUP | Protocolo de registro activo de Hikvision (antes EHome). El dispositivo inicia la conexión hacia el gateway; adecuado para IP dinámica o entornos con NAT. Existen las variantes 2.0 y 5.0. |
| EHome | Nombre anterior del protocolo ISUP. `EHome 2.0` equivale a `ISUP 2.0` y `EHome V5` a `ISUP 5.0`. |
| ISAPI | Interfaz REST nativa de Hikvision basada en un protocolo de texto. Define la estructura de URL (`/ISAPI/...`) y los mensajes en XML o JSON que también expone la API del gateway. |
| ONVIF | Estándar abierto de la industria para la interoperabilidad de dispositivos de video en red. |
| GB/T-28181 | Estándar chino para la interconexión de sistemas de videovigilancia en red. |
| Gateway | El propio Hik Device Gateway: servidor on-premise que convierte los protocolos de dispositivo en una única API REST estilo ISAPI. |
| Passthrough | Mecanismo de paso directo (*Transmit Device ISAPI*) que reenvía una petición ISAPI nativa al dispositivo indicado por `devIndex`. |
| Digest | Esquema de autenticación **HTTP Digest** basado en MD5 (RFC 2617) que utiliza la API del gateway para autenticar cada sesión. |
| `EhomeID` / `EhomeKey` | Identificador y clave de registro de un dispositivo que se conecta por ISUP/EHome; se proporcionan al gateway al agregar el dispositivo. |

---

### 1.4 Historial de Actualizaciones

El listado por versión se mantiene en [HISTORIAL-ACTUALIZACIONES.md](HISTORIAL-ACTUALIZACIONES.md).

---

## Capítulo 2 — Primeros Pasos

### Paso 1 — Verificar los requisitos del servidor

El gateway se ejecuta sobre Linux de 64 bits (Linux64). Prepare un servidor que cumpla, como mínimo, con lo siguiente:

| Elemento | Requisito |
| -------- | --------- |
| Sistema operativo | CentOS 7, Ubuntu 20.04 o Red Hat Enterprise Linux (RHEL) 9, arquitectura de 64 bits |
| CPU | Procesador clase Intel Core i5 o superior |
| Memoria RAM | 8 GB o más |
| Red | Conectividad de red hacia los dispositivos y hacia la plataforma de integración |

> **Notas:**
>
> - Los requisitos de sistema operativo, CPU y memoria corresponden a la configuración recomendada de instalación. Ajuste el dimensionamiento según el número de dispositivos y de flujos de video concurrentes que vaya a manejar.

### Paso 2 — Descargar el instalador

Descargue el paquete de instalación de HikGateway desde el portal de desarrolladores de SYSCOM:

`https://desarrolladores.syscom.mx/?search=HikGateway`

### Paso 3 — Instalar el gateway

Ejecute el script de instalación `install.sh` incluido en el paquete. El instalador admite, entre otras, las siguientes opciones:

- `--port` — Puerto de servicio del gateway.
- `--path` — Ruta de instalación.

Durante o después de la instalación, abra en el firewall del servidor los puertos que utilizará el gateway (por ejemplo, mediante `firewalld` en distribuciones basadas en RHEL/CentOS). Consulte la tabla **Puertos por defecto** al final de este capítulo.

### Paso 4 — Acceder a la consola web

El gateway publica una consola web servida por **nginx** en el puerto **80 (HTTP)** y **443 (HTTPS)**. Acceda con un navegador a la dirección IP del servidor e inicie sesión.

Desde la consola puede administrar dispositivos y utilizar la sección **"API Testing"** para probar las llamadas a la API de forma interactiva antes de integrarlas en su aplicación.

### Paso 5 — Agregar dispositivos

Agregue los dispositivos que desea gestionar. Existen dos vías, según el protocolo del dispositivo:

- **Por registro ISUP/EHome** — El dispositivo se registra activamente contra el gateway usando sus credenciales `EhomeID` y `EhomeKey`. Es la opción recomendada para dispositivos con IP dinámica o detrás de NAT.
- **Por ISAPI** — El gateway se conecta directamente al dispositivo (IP fija accesible) empleando sus credenciales de acceso.

En ambos casos, el alta puede realizarse desde la consola web o mediante `POST /ISAPI/ContentMgmt/DeviceMgmt/addDevice?format=json`. Tras agregar dispositivos por ISUP/EHome, consulte la lista de dispositivos para verificar su estado en línea/fuera de línea.

### Paso 6 — Credenciales

La cuenta administrativa predeterminada del gateway es el usuario **`admin`**. Esta credencial se utiliza tanto para la consola web como para la **autenticación HTTP Digest** de todas las llamadas a la API. Establezca una contraseña robusta y consérvela de forma segura.

---

### Puertos por defecto

| Puerto | Protocolo | Uso |
| ------ | --------- | --- |
| 80 | HTTP | API REST y consola web |
| 443 | HTTPS | API REST y consola web sobre TLS (**requerido para audio bidireccional**) |
| 554 | RTSP | Streaming de medios (vista en vivo, reproducción, audio bidireccional) |
| 7660 / 7661 | TCP | Registro de dispositivos ISUP / EHome 2.0 |
| 7662 | TCP | Recepción de alarmas ISUP / EHome |
| 7663–7667 | TCP | Registro de dispositivos ISUP 5.0 / EHome V5 |
| 15000–17000 | TCP/UDP | Transmisión (streaming) de medios |
| 7091 | TCP | PSS |
| 8081 | HTTP (interno) | HTTPService — proxy inverso de nginx hacia `127.0.0.1` |
| 9081 | WebSocket (interno) | WebSocket — proxy inverso de nginx hacia `127.0.0.1` |
| 7314 | WebSocket (interno) | WebSocket-Stream — proxy inverso de nginx hacia `127.0.0.1` |
| 10081 | HTTP (interno) | Servicio de imágenes (picture) — `127.0.0.1` |
| 11081 | HTTP (interno) | Servicio de descarga (download) — `127.0.0.1` |
| 12081 | HTTP (interno) | Servicio de audio bidireccional (audiotalk) — `127.0.0.1` |

> **Notas:**
>
> - Los puertos marcados como **(interno)** están enlazados a `127.0.0.1` y nginx actúa como proxy inverso hacia ellos; no es necesario exponerlos al exterior. Abra en el firewall únicamente los puertos externos que su despliegue vaya a utilizar.

---

## Capítulo 3 — Resumen del Protocolo

Los métodos de operación de recursos del protocolo del gateway son los mismos de HTTP (Hyper Text Transport Protocol) y RTSP (Real Time Streaming Protocol). Los métodos RTSP se emplean principalmente para obtener el flujo en tiempo real de la vista en vivo, el audio bidireccional y la reproducción.

### 3.1 Reglas de API

| Regla | Detalles |
| ----- | -------- |
| Protocolo | HTTP (versión 1.1), HTTPS y RTSP (versión 1.0). |
| Formato de URL | `{protocol}://{host}:{port}{abs_path}?{query}`. El `abs_path` sigue el estilo ISAPI: `/ServiceName/ResourceType/resource`, donde `ServiceName` es `ISAPI` (por ejemplo, `/ISAPI/System/deviceInfo`). |
| Direccionamiento del dispositivo | Para operar un dispositivo se incluye en el `query` el parámetro `devIndex=<uuid>`. Ejemplo completo: `http://10.17.132.22/ISAPI/System/time?format=json&devIndex=550e8400e29b41d4a716446655440000`. |
| Métodos HTTP | `GET` (obtener recursos), `POST` (crear/agregar y buscar recursos), `PUT` (actualizar recursos; también puede crear si no existen), `DELETE` (eliminar recursos). |
| Métodos RTSP | `OPTIONS`, `DESCRIBE`, `SETUP`, `PLAY`, `PAUSE`, `TEARDOWN` (para los flujos de video/audio en tiempo real). |
| Formato de datos | JSON cuando se añade `?format=json` al `query`. El estilo ISAPI también admite XML nativo. Los nodos hoja usan *lower camel case* y los nodos no hoja *upper camel case*. |
| Content-Type | `application/json` para información de configuración; `application/octet-stream` para datos binarios (firmware, archivos de configuración). |
| Puertos por defecto | HTTP: 80; HTTPS: 443; RTSP: 554. |
| Autenticación | HTTP Digest con algoritmo MD5 (RFC 2617). |
| Formato de tiempo | Estándar ISO 8601: `YYYY-MM-DDThh:mm:ss.sTZD` (por ejemplo, `2017-08-16T20:17:06+08:00` o `2017-08-16T20:09:06Z`). |

> **Notas:**
>
> - El `devIndex` es un número aleatorio de 128 bits (UUID/GUID) único, generado por el sistema al agregar el dispositivo.
> - El formato de mensaje JSON descrito en este capítulo solo aplica a las URL basadas en HTTP.

---

### 3.2 Firma y Autenticación

Toda sesión con la API del gateway debe autenticarse mediante **HTTP Digest (MD5)**, conforme a *HTTP Authentication: Basic and Digest Access Authentication* (RFC 2617). Si la petición no contiene información de autenticación válida, el gateway responde con el código de error **401**.

El resumen (digest) del mensaje se genera con el algoritmo MD5 a partir del nombre de usuario, la contraseña, el valor `nonce`, el método HTTP (o RTSP) y la URL de la petición. El flujo es el siguiente:

**Paso 1 — Primera petición sin autenticación.** El cliente envía la petición y el gateway responde `401 Unauthorized` con un encabezado `WWW-Authenticate` que contiene el `realm`, el `qop`, el `nonce` (y, en su caso, `opaque`):

```
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Digest realm="DS-GWAS0101(6419)", qop="auth", nonce="4e546c6c596a55355a5749364e5752684f4445344d57593d", opaque="<valor-generado-por-el-servidor>"
```

> **Notas:**
>
> - El `nonce` es un número aleatorio generado por el servicio. La fórmula de generación sugerida es `nonce = BASE64(time-stamp MD5(time-stamp ":" ETag ":" private-key))`, donde `time-stamp` es una marca de tiempo o número de serie único, `ETag` es el valor del encabezado HTTP `ETag` de la petición y `private-key` es un dato conocido solo por el servicio.

**Paso 2 — El cliente calcula el `response`.** Con los valores del reto y las credenciales, se calculan dos bloques de datos, `A1` (seguridad) y `A2` (mensaje):

- `HA1 = MD5(username:realm:password)` — es decir, `A1 = <username>:<realm>:<password>`.
- `HA2 = MD5(method:uri)` — es decir, `A2 = <request-method>:<uri>`.
- `response = MD5(HA1:nonce:nc:cnonce:qop:HA2)` cuando `qop="auth"`.

Según el valor de `qop`, la fórmula del digest es:

```
qop = Undefined:   Digest = MD5(MD5(A1):<nonce>:MD5(A2))
qop = "auth":      Digest = MD5(MD5(A1):<nonce>:<nc>:<cnonce>:<qop>:MD5(A2))
qop = "auth-int":  Digest = MD5(MD5(A1):<nonce>:<nc>:<cnonce>:<qop>:MD5(A2))
```

> **Notas:**
>
> - `qop` indica si se requiere protección de calidad. Si `qop` no está definido, `A2 = <request-method>:<uri>`; si `qop="auth-int"`, `A2 = <request-method>:<uri>:MD5(<request-entity-body>)`.
> - Si el algoritmo es `MD5-sess`, `A1 = MD5(<username>:<realm>:<password>):<nonce>:<cnonce>`.

**Paso 3 — Reenviar la petición autenticada.** El cliente repite la petición incluyendo el encabezado `Authorization: Digest` con el `response` calculado:

```
Authorization: Digest username="admin", realm="DS-GWAS0101(6419)", nonce="4e546c6c596a55355a5749364e5752684f4445344d57593d", uri="/ISAPI/Event/notification/subscribeDeviceMgmt", cnonce="7e867c78d9874aa904b489a6791aaeaf", nc=00000001, qop="auth", response="fa7d3d95762b6e10c8a18f09f1f61e81"
```

> **Notas:**
>
> - Para la autenticación de inicio de sesión, el método disponible es `GET`.
> - Si la autenticación falla, el dispositivo devuelve el mensaje `JSON_ResponseStatus_AuthenticationFailed` e informa el número de intentos restantes. Cuando los intentos restantes llegan a **0**, la cuenta se bloqueará en el siguiente intento de autenticación.

---

### 3.3 Reglas de Respuesta

Las respuestas de las operaciones basadas en HTTP siguen la estructura ISAPI `ResponseStatus`. Cuando la operación falla por un error de la URL basada en HTTP, se devuelve el mensaje `JSON_ResponseStatus` con el código de error correspondiente; cuando el error ocurre en una URL basada en RTSP, se devuelve directamente el código de estado RTSP (RFC 2326).

Los campos habituales del objeto `ResponseStatus` son:

- `requestURL` — URL de la petición que originó la respuesta.
- `statusCode` — Código de estado de la operación. **`statusCode: 1` significa OK (éxito).**
- `statusString` — Descripción breve del estado (por ejemplo, `OK`).
- `subStatusCode` — Subcódigo textual con mayor detalle.
- `errorCode` / `errorMsg` — Código y mensaje de error específicos (presentes cuando la operación falla).

**Ejemplo de éxito:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/ContentMgmt/DeviceMgmt/addDevice?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

**Ejemplo de falla:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/ContentMgmt/DeviceMgmt/addDevice?format=json",
    "statusCode": 6,
    "statusString": "Invalid Content",
    "subStatusCode": "invalidContent",
    "errorCode": 1073741825,
    "errorMsg": "invalid parameter"
  }
}
```

> **Notas:**
>
> - En operaciones por lotes, si algunas operaciones fallan, se devuelven tanto el mensaje `JSON_ResponseStatus` como el mensaje de detalle de las fallas (por ejemplo, al agregar o eliminar dispositivos en lote).

---

## Capítulo 4 — Aplicaciones Típicas

Para realizar la vista en vivo, la reproducción o el audio bidireccional, primero debe obtener la URL de streaming del dispositivo enviando una petición a través del gateway y, a continuación, iniciar el flujo sobre esa URL mediante los métodos RTSP. También puede controlar el PTZ, grabar video manualmente y descargar archivos de video.

### 4.1 Agregar Dispositivos al Gateway

Puede agregar uno o varios dispositivos al gateway a partir de su información de registro (identificador y clave del dispositivo). Después de agregarlos, puede obtener la lista de dispositivos.

El flujo, según protocolo, es:

- **ISUP / EHome:** el dispositivo se registra activamente contra el gateway con `EhomeID` y `EhomeKey`. Tras darlo de alta, consulte la lista de dispositivos para comprobar su estado en línea/fuera de línea.
- **ISAPI:** el gateway se conecta directamente al dispositivo mediante sus credenciales de acceso.

Secuencia de llamadas:

1. `POST /ISAPI/ContentMgmt/DeviceMgmt/addDevice?format=json` — agrega uno o varios dispositivos al gateway.
2. *(Opcional)* `PUT /ISAPI/ContentMgmt/DeviceMgmt/modDevice?format=json` — edita la información del dispositivo.
3. *(Opcional)* `POST /ISAPI/ContentMgmt/DeviceMgmt/delDevice?format=json` — elimina dispositivos del gateway (admite eliminación por lotes).
4. `POST /ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json` — obtiene la lista de dispositivos agregados (incluye el estado).

---

### 4.2 Video y Audio

#### 4.2.1 Vista en Vivo

La vista en vivo permite obtener de forma remota el video o el audio en tiempo real del área monitoreada.

1. `POST /ISAPI/System/streamMedia?format=json&devIndex=<uuid>` — solicita al dispositivo la URL del flujo en tiempo real (`streamUrl`). El gateway devuelve una URL que contiene los datos del flujo.
2. `DESCRIBE rtsp://{ipAddress}:{port}{streamUrl}` — obtiene la información de medios (SDP) para la vista en vivo.
3. `SETUP rtsp://{ipAddress}:{port}{streamUrl}` — especifica el modo de transmisión y los contenidos.
4. `PLAY rtsp://{ipAddress}:{port}{streamUrl}` — inicia la vista en vivo.
5. `TEARDOWN rtsp://{ipAddress}:{port}{streamUrl}` — detiene la vista en vivo.

#### 4.2.2 Reproducción

Permite reproducir grabaciones de forma remota, por archivo o por tiempo.

> **Notas:**
>
> - Asegúrese de que existan archivos de video almacenados en el dispositivo.
> - Solo los dispositivos agregados vía **ISUP 5.0** admiten la reproducción de video **por tiempo**.

1. Obtenga la URL del archivo de video o la URL del flujo:
   - Por archivo: `POST /ISAPI/ContentMgmt/search?format=json&devIndex=<uuid>` — busca los archivos de video y obtiene la URL del archivo (`playbackURI`).
   - Por tiempo: `POST /ISAPI/System/streamMedia?format=json&devIndex=<uuid>` — obtiene la URL del flujo para reproducción por tiempo.
2. `DESCRIBE rtsp://{ipAddress}:{port}{streamUrl}` — obtiene la información de medios (SDP) para la reproducción.
3. `SETUP rtsp://{ipAddress}:{port}{streamUrl}` — especifica el modo de transmisión y los contenidos.
4. `PLAY rtsp://{ipAddress}:{port}{streamUrl}` — inicia la reproducción según la URL del archivo de video.
5. `TEARDOWN rtsp://{ipAddress}:{port}{streamUrl}` — detiene la reproducción.

> **Notas:**
>
> - Puede buscar los archivos de video para comprobar si existen grabaciones dentro de un periodo de tiempo antes de obtener la URL del flujo.

#### 4.2.3 Descarga de Archivos de Video

Permite descargar grabaciones al equipo local, por archivo o por tiempo.

> **Notas:**
>
> - Asegúrese de que existan archivos de video almacenados en el dispositivo.
> - Solo los dispositivos agregados vía **ISUP 5.0** admiten la descarga de video **por tiempo**.

1. Obtenga la URL del archivo de video o la URL del flujo:
   - Por archivo: `POST /ISAPI/ContentMgmt/search?format=json&devIndex=<uuid>` — busca los archivos de video y obtiene la URL del archivo (`playbackURI`).
   - Por tiempo: `POST /ISAPI/System/streamMedia?format=json&devIndex=<uuid>` — obtiene la URL del flujo para descarga por tiempo.
2. `POST /ISAPI/ContentMgmt/download?format=json&devIndex=<uuid>` — descarga los archivos de video al equipo local.

#### 4.2.4 Audio Bidireccional

El audio bidireccional permite enviar y recibir audio entre la plataforma/sistema y las cámaras (por ejemplo, cámaras corporales), de modo que el operador y el punto remoto puedan hablar para atender una incidencia.

1. *(Opcional)* `GET /ISAPI/System/TwoWayAudio/channels/<ID>?format=json&devIndex=<uuid>` — obtiene la información de un canal de audio bidireccional específico.
2. `POST /ISAPI/System/streamMedia?format=json&devIndex=<uuid>` — solicita al dispositivo la URL del flujo de audio (`streamUrl`).
3. `DESCRIBE rtsp://{ipAddress}:{port}{streamUrl}` — obtiene la información de descripción (SDP) del flujo de audio.
4. `SETUP rtsp://{ipAddress}:{port}{streamUrl}` — transmite la solicitud de recepción o envío del flujo de audio entre el gateway y la plataforma.
5. `PLAY rtsp://{ipAddress}:{port}{streamUrl}` — inicia el audio bidireccional.
6. Transmita los datos de audio en formato binario entre el gateway y la plataforma (plataforma → gateway y gateway → plataforma).
7. `TEARDOWN rtsp://{ipAddress}:{port}{streamUrl}` — detiene el audio bidireccional.

> **Notas:**
>
> - El formato de transmisión de los datos de audio es **RTP**. Los tipos de audio admitidos son **G.711a**, **G.711u**, **G.7221** y **G.726**.
> - El audio bidireccional requiere el puerto **HTTPS (443)** habilitado en el gateway.

#### 4.2.5 Control PTZ

El control PTZ permite las funciones de paneo, inclinación y zoom de las cámaras. También puede ajustar y llamar presets, iniciar el auto-escaneo, enfocar, ajustar el iris, habilitar funciones auxiliares o realizar posicionamiento 3D.

1. `PUT /ISAPI/PTZCtrl/channels/<ID>/continuous?format=json&devIndex=<uuid>` — inicia el control PTZ de la cámara.
2. `POST /ISAPI/PTZCtrl/channels/<ID>/presets?format=json&devIndex=<uuid>` — agrega presets.
3. `PUT /ISAPI/PTZCtrl/channels/<ID>/presets/<ID>/goto?format=json&devIndex=<uuid>` — llama a un preset configurado.
4. *(Opcional)* `DELETE /ISAPI/PTZCtrl/channels/<ID>/presets/<ID>?format=json&devIndex=<uuid>` — elimina un preset configurado.
5. *(Opcional)* Tras iniciar el control PTZ, realice operaciones adicionales con las URI correspondientes:
   - Auto-escaneo: `PUT /ISAPI/PTZCtrl/channels/<ID>/autoPan?format=json&devIndex=<uuid>`.
   - Enfoque (in/out): `PUT /ISAPI/System/Video/inputs/channels/<ID>/focus?format=json&devIndex=<uuid>`.
   - Iris: `PUT /ISAPI/System/Video/inputs/channels/<ID>/iris?format=json&devIndex=<uuid>`.
   - Funciones auxiliares (luz, limpiaparabrisas, calefactor, ventilador): `PUT /ISAPI/PTZCtrl/channels/<ID>/auxcontrols/<ID>?format=json&devIndex=<uuid>`.
   - Posicionamiento 3D: `PUT /ISAPI/PTZCtrl/channels/<ID>/position3D?format=json&devIndex=<uuid>`.

---

### 4.3 Control de Acceso

El control de acceso restringe de forma selectiva el paso a un lugar o recurso. En las aplicaciones integradas mediante el gateway, la **persona** es la unidad de gestión y control: una persona se vincula con huellas, tarjetas, rostros y otros atributos.

#### 4.3.1 Flujo General

El flujo básico de integración para los dispositivos de control de acceso es:

1. Agregue los dispositivos al gateway, por **ISUP** o por **ISAPI**. Si los agrega por ISUP, obtenga la lista de dispositivos y verifique su estado en línea/fuera de línea.
2. *(Opcional)* Configure los parámetros de escucha de alarma/evento para recibir los detalles de alarma/evento.
3. Agregue las personas correspondientes a los dispositivos.
4. Vincule a cada persona sus tarjetas, rostros y/o huellas.
5. La plataforma de terceros consulta los eventos/alarmas de los dispositivos.

> **Notas:**
>
> - La persona es la unidad base: agregue primero la persona y aplique su información **antes** de aplicar tarjetas, rostros o huellas.
> - Existen dos métodos para recibir los eventos/alarmas de los dispositivos: transmitirlos directamente en tiempo real desde los dispositivos hacia la plataforma de terceros (requiere un servicio de escucha en la plataforma), o consultarlos periódicamente (no requiere servicio de escucha).
> - Este documento incluye archivos de código de ejemplo de referencia (`AccessControl.csproj` para control de acceso y `SubscribeAlarm.csproj` para suscripción de alarma/evento).

#### 4.3.2 Gestión de Personas

Una persona es la unidad básica que puede vincularse con varias tarjetas y huellas. Antes de cualquier otra operación, agregue las personas y aplique su información (ID de persona, nombre, organización, permisos, etc.) a los dispositivos.

1. *(Opcional)* `GET /ISAPI/AccessControl/capabilities?format=json&devIndex=<uuid>` — obtiene la capacidad de control de acceso.
2. `POST /ISAPI/AccessControl/UserInfo/Record?format=json&devIndex=<uuid>` — agrega una persona o varias en lote.
3. *(Opcional)* Operaciones posteriores al alta:
   - Editar: `PUT /ISAPI/AccessControl/UserInfo/Modify?format=json&devIndex=<uuid>`.
   - Contar personas agregadas: `GET /ISAPI/AccessControl/UserInfo/Count?format=json&devIndex=<uuid>`.
   - Buscar personas: `POST /ISAPI/AccessControl/UserInfo/Search?format=json&devIndex=<uuid>`.
   - Eliminar personas y sus permisos vinculados: `PUT /ISAPI/AccessControl/UserInfoDetail/Delete?format=json&devIndex=<uuid>` y consultar el progreso con `GET /ISAPI/AccessControl/UserInfoDetail/DeleteProcess?format=json&devIndex=<uuid>`.

#### 4.3.3 Gestión de Tarjetas

Si una persona accederá con tarjeta, agregue la tarjeta y vincúlela a la persona para otorgar permisos.

> **Notas:**
>
> - Asegúrese de haber agregado antes las personas (ver [4.3.2 Gestión de Personas](#432-gestión-de-personas)).

1. `POST /ISAPI/AccessControl/CardInfo/Record?format=json&devIndex=<uuid>` — agrega una tarjeta y la vincula con una persona.
2. *(Opcional)* Operaciones posteriores:
   - Editar: `PUT /ISAPI/AccessControl/CardInfo/Modify?format=json&devIndex=<uuid>`.
   - Eliminar: `PUT /ISAPI/AccessControl/CardInfo/Delete?format=json&devIndex=<uuid>`.
   - Contar tarjetas: `GET /ISAPI/AccessControl/CardInfo/Count?format=json`.
   - Buscar tarjetas: `POST /ISAPI/AccessControl/CardInfo/Search?format=json&devIndex=<uuid>`.

#### 4.3.4 Gestión de Rostros

Si una persona accederá por rostro, aplique los registros de rostro (ID del registro, información de la persona en la imagen, etc.) para otorgar permisos.

> **Notas:**
>
> - Asegúrese de haber agregado antes las personas (ver [4.3.2 Gestión de Personas](#432-gestión-de-personas)).

1. Agregue un registro de rostro o establezca la imagen de rostro de una persona:
   - Agregar registro vinculado a la persona: `POST /ISAPI/Intelligent/FDLib/FaceDataRecord?format=json&devIndex=<uuid>`.
   - Establecer la imagen de rostro de una persona específica: `PUT /ISAPI/Intelligent/FDLib/FDSetUp?format=json&devIndex=<uuid>`.
2. *(Opcional)* Operaciones posteriores:
   - Eliminar registros de rostro: `PUT /ISAPI/Intelligent/FDLib/FDSearch/Delete?format=json&devIndex=<uuid>`.
   - Contar registros de rostro: `GET /ISAPI/Intelligent/FDLib/Count?format=json&devIndex=<uuid>`.
   - Buscar registros de rostro: `POST /ISAPI/Intelligent/FDLib/FDSearch?format=json&devIndex=<uuid>`.

#### 4.3.5 Gestión de Huellas

Si una persona accederá por huella, primero recolecte los datos de la huella con el lector y luego aplique los parámetros de la huella (datos, ID, tipo, etc.) al dispositivo y al lector de tarjetas para vincularla con la persona.

> **Notas:**
>
> - Asegúrese de haber agregado antes las personas (ver [4.3.2 Gestión de Personas](#432-gestión-de-personas)).

1. *(Opcional)* `GET /ISAPI/AccessControl/CaptureFingerPrint/capabilities?format=json&devIndex=<uuid>` — obtiene la capacidad de recolección de huellas.
2. `POST /ISAPI/AccessControl/CaptureFingerPrint?format=json&devIndex=<uuid>` — recolecta los datos de la huella.
3. *(Opcional)* `GET /ISAPI/AccessControl/FingerPrintCfg/capabilities?format=json&devIndex=<uuid>` — obtiene la capacidad de configuración de huellas.
4. *(Opcional)* `GET /ISAPI/AccessControl/CardReaderCfg/<ID>?format=json&devIndex=<uuid>` — obtiene los parámetros del lector (número de huellas y capacidad).
5. `POST /ISAPI/AccessControl/FingerPrintDownload?format=json&devIndex=<uuid>` — aplica los parámetros de la huella al lector para vincularla con una persona.
6. *(Opcional)* `GET /ISAPI/AccessControl/FingerPrintProgress?format=json&devIndex=<uuid>` — obtiene el progreso de aplicación de la huella.
7. *(Opcional)* Operaciones posteriores:
   - Editar: `POST /ISAPI/AccessControl/FingerPrintModify?format=json&devIndex=<uuid>`.
   - Buscar: `POST /ISAPI/AccessControl/FingerPrintUpload?format=json&devIndex=<uuid>`.
   - Eliminar: consultar capacidad con `GET /ISAPI/AccessControl/FingerPrint/Delete/capabilities?format=json&devIndex=<uuid>`, eliminar con `PUT /ISAPI/AccessControl/FingerPrint/Delete?format=json&devIndex=<uuid>` y consultar el progreso con `GET /ISAPI/AccessControl/FingerPrint/DeleteProcess?format=json&devIndex=<uuid>`.

#### 4.3.6 Control Remoto de Puerta

Puede controlar de forma remota el estado de las puertas a través del gateway.

1. *(Opcional)* `GET /ISAPI/AccessControl/capabilities?format=json&devIndex=<uuid>` — obtiene la capacidad de control de acceso.
2. *(Opcional)* `GET /ISAPI/AccessControl/AcsWorkStatus?format=json&devIndex=<uuid>` — obtiene el estado de funcionamiento de los dispositivos de control de acceso.
3. `PUT /ISAPI/AccessControl/RemoteControl/door/<ID>?format=json&devIndex=<uuid>` — controla la puerta de forma remota (mantener abierta, mantener cerrada o estado normal).

---

### 4.4 Alarmas y Eventos

Cuando ocurre un evento o se activa una alarma, puede recibir la información directamente o suscribirse a los tipos de alarma/evento para recibir la información correspondiente.

> **Notas:**
>
> - El modo de **recepción directa** y el modo de **suscripción** no pueden utilizarse al mismo tiempo.

#### 4.4.1 Recepción Directa de Eventos

Para los dispositivos que admiten la subida de eventos/alarmas en modo de escucha HTTP, se recomienda la recepción directa. Tras configurar la dirección del servidor de escucha, se reciben los eventos/alarmas directamente desde los dispositivos.

> **Notas:**
>
> - El dispositivo debe admitir la subida de información de evento y alarma en modo de escucha.

1. `POST /ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>` — configura los parámetros del servidor de escucha en el dispositivo.
2. Cuando ocurre un evento o se activa una alarma, el dispositivo sube automáticamente la información al servidor de escucha configurado.

> **Notas:**
>
> - El recurso `httpHosts` admite además los métodos `GET` (consultar), `PUT` (editar) y `DELETE` (eliminar) para administrar los servidores de escucha configurados.

#### 4.4.2 Suscripción a Eventos

En el modo de suscripción, el integrador se suscribe a los tipos de alarma/evento y el gateway le entrega la información suscrita junto con latidos de vida (heartbeat).

> **Notas:**
>
> - Antes de comenzar, asegúrese de haber habilitado la función de reenvío de alarmas en la consola web del gateway.

1. `POST /ISAPI/Event/notification/subscribeDeviceMgmt?format=json` — establece los parámetros de la suscripción a alarmas/eventos. Se devuelve el ID de suscripción.
2. *(Opcional)* `GET /ISAPI/Event/notification/subscribeDeviceMgmt/<ID>/queryStatus?format=json` — consulta el estado de la suscripción. *(No disponible cuando el modo de suscripción `eventMode` es `all`.)*
3. *(Opcional)* `POST /ISAPI/Event/notification/subscribeDeviceMgmt/<ID>/devIndex/<uuid>?format=json` — agrega tipos de alarma/evento a la suscripción. *(No disponible cuando `eventMode` es `all`.)*
4. Reciba la información de alarma/evento suscrita y el latido de vida a través de los mensajes `JSON_EventNotificationAlert_AlarmEventInfo` y `JSON_EventNotificationAlert_HeartbeatInfo` que sube el dispositivo.
5. *(Opcional)* `DELETE /ISAPI/Event/notification/unSubscribeDeviceMgmt/<ID>/devIndex/<uuid>?format=json` — cancela la suscripción a las alarmas/eventos de un dispositivo específico. *(No disponible cuando `eventMode` es `all`.)*
6. `DELETE /ISAPI/Event/notification/unSubscribeDeviceMgmt/<ID>?format=json` — cancela la suscripción a alarmas/eventos.

> **Notas:**
>
> - El intervalo de latido predeterminado es de **10 segundos** y el tiempo de espera sugerido es de **30 segundos**. Si se agota el tiempo de espera del latido o se recibe una excepción en la información de alarma/evento, reconstruya el enlace llamando de nuevo a `POST /ISAPI/Event/notification/subscribeDeviceMgmt?format=json`.
> - El `devIndex` presente en el mensaje de evento/alarma coincide con el devuelto al obtener la lista de dispositivos (`POST /ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json`).

---

## Capítulo 5 — Referencia de API

Esta es la referencia detallada de los endpoints de la API REST del gateway. Cada endpoint se documenta con su método y ruta, la tabla de parámetros de solicitud, un ejemplo de solicitud y un ejemplo de respuesta.

Convenciones aplicables a **todos** los endpoints:

- **Autenticación:** todas las peticiones requieren autenticación **HTTP Digest (MD5)** (ver [Capítulo 3 — Resumen del Protocolo](#capítulo-3--resumen-del-protocolo)). En las tablas se indica como el encabezado `Authorization`.
- **Direccionamiento:** las operaciones sobre un dispositivo agregado llevan el parámetro de consulta `devIndex=<uuid>`, obtenido de [`deviceList`](#514-buscarlistar-dispositivos). Las operaciones sobre el propio gateway no lo llevan.
- **Formato:** añada `?format=json` para recibir/enviar JSON; el estilo ISAPI también admite XML nativo.
- **Respuestas de escritura:** salvo que se indique otra estructura, las operaciones de escritura (POST/PUT/DELETE) devuelven el objeto `ResponseStatus` (ver [3.3 Reglas de Respuesta](#33-reglas-de-respuesta)). El detalle de objetos y códigos está en [APENDICE-A.md](APENDICE-A.md).

---

### 5.1 Gestión de Dispositivos

Las operaciones de esta sección permiten dar de alta, eliminar, editar y consultar los dispositivos administrados por el Hik Device Gateway. El identificador `devIndex` que devuelve la operación de búsqueda (5.1.4) es el que deberá utilizar en el resto de las llamadas de la API.

#### 5.1.1 Agregar dispositivo

`POST /ISAPI/ContentMgmt/DeviceMgmt/addDevice?format=json`

Agrega uno o varios dispositivos al gateway en una sola operación (alta por lotes) mediante el protocolo de registro EHome/ISUP. La operación es exitosa aunque solo uno de los dispositivos del lote se registre correctamente; revise el campo `status` de cada elemento devuelto para conocer el resultado individual.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| DeviceInList | Requerido | Array | Body | Lista de dispositivos a agregar; cada elemento contiene un objeto `Device`. |
| Device | Requerido | Object | Body | Datos del dispositivo que se va a registrar. |
| protocolType | Requerido | String | Body | Protocolo de acceso del dispositivo (por ejemplo, `ehomeV5`). |
| EhomeParams | Requerido | Object | Body | Parámetros de registro EHome/ISUP del dispositivo. |
| EhomeID | Requerido | String | Body | Identificador EHome/ISUP configurado en el dispositivo. |
| EhomeKey | Requerido | String | Body | Clave EHome/ISUP del dispositivo. Es información sensible y debe cifrarse cuando el esquema de cifrado esté activo. |
| devName | Requerido | String | Body | Nombre descriptivo del dispositivo. |
| devType | Requerido | String | Body | Tipo de dispositivo (por ejemplo, `AccessControl`, `encodingDev`). |

**Ejemplo de Solicitud:**

```json
{
  "DeviceInList": [
    {
      "Device": {
        "protocolType": "ehomeV5",
        "EhomeParams": {
          "EhomeID": "K1T642",
          "EhomeKey": "test2024"
        },
        "devName": "test1",
        "devType": "AccessControl"
      }
    },
    {
      "Device": {
        "protocolType": "ehomeV5",
        "EhomeParams": {
          "EhomeID": "test002",
          "EhomeKey": "test2024"
        },
        "devName": "test2",
        "devType": "encodingDev"
      }
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "DeviceOutList": [
    {
      "Device": {
        "EhomeParams": {
          "EhomeID": "1002"
        },
        "devIndex": "5D84AB94-6C63-4F1C-918B-2104CF2DF40C",
        "devName": "DeepinMind",
        "protocolType": "ehomeV5",
        "status": "success"
      }
    }
  ]
}
```

---

#### 5.1.2 Eliminar dispositivo

`POST /ISAPI/ContentMgmt/DeviceMgmt/delDevice?format=json`

Elimina uno o varios dispositivos del gateway (baja por lotes) indicando sus `devIndex`. Revise el campo `status` de cada elemento devuelto para conocer el resultado individual.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| DevIndexList | Requerido | Array | Body | Lista de UUID (`devIndex`) de los dispositivos que se desea eliminar. |

**Ejemplo de Solicitud:**

```json
{
  "DevIndexList": [
    "2cd6716d-767f-4756-ac55-50276a5e3b4a"
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "DelDevList": [
    {
      "Dev": {
        "devIndex": "684E6BB4-C22A-4297-AE62-8DBC4771E3F8",
        "status": "success"
      }
    }
  ]
}
```

---

#### 5.1.3 Editar dispositivo

`PUT /ISAPI/ContentMgmt/DeviceMgmt/modDevice?format=json`

Modifica la información de un dispositivo ya registrado (nombre, parámetros EHome, etc.). Los campos que se envíen vacíos conservan su valor actual.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| DeviceInfo | Requerido | Object | Body | Datos del dispositivo que se van a modificar. |
| devIndex | Requerido | String | Body | UUID del dispositivo que se va a editar. |
| protocolType | Requerido | String | Body | Protocolo de acceso del dispositivo (por ejemplo, `ehomeV5`). |
| EhomeParams | Opcional | Object | Body | Parámetros de registro EHome/ISUP. |
| EhomeID | Opcional | String | Body | Identificador EHome/ISUP del dispositivo. |
| EhomeKey | Opcional | String | Body | Clave EHome/ISUP. Deje el campo vacío para conservar la clave actual. Es información sensible. |
| devName | Opcional | String | Body | Nombre del dispositivo. Deje el campo vacío para conservar el nombre actual. |

**Ejemplo de Solicitud:**

```json
{
  "DeviceInfo": {
    "devIndex": "2cd6716d-767f-4756-ac55-50276a5e3b4a",
    "protocolType": "ehomeV5",
    "EhomeParams": {
      "EhomeID": "111",
      "EhomeKey": ""
    },
    "devName": ""
  }
}
```

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/ContentMgmt/DeviceMgmt/modDevice?format=json", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

#### 5.1.4 Buscar/listar dispositivos

`POST /ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json`

Consulta la lista de dispositivos agregados, con paginación y filtros opcionales. La respuesta incluye el `devIndex` de cada dispositivo, valor necesario para el resto de las operaciones de la API.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| SearchDescription | Requerido | Object | Body | Criterios de búsqueda y paginación. |
| position | Requerido | Integer | Body | Posición inicial (desplazamiento) del primer resultado; comienza en 0. |
| maxResult | Requerido | Integer | Body | Número máximo de resultados a devolver. |
| Filter | Opcional | Object | Body | Conjunto de filtros para acotar la consulta. |
| key | Opcional | String | Body | Palabra clave de búsqueda (nombre u otro identificador). Vacío significa sin filtro. |
| devType | Opcional | String | Body | Filtra por tipo de dispositivo. Vacío significa todos los tipos. |
| protocolType | Opcional | Array | Body | Filtra por protocolo(s) de acceso (por ejemplo, `ehomeV5`). |
| devStatus | Opcional | Array | Body | Filtra por estado del dispositivo: `online`, `offline`. |

**Ejemplo de Solicitud:**

```json
{
  "SearchDescription": {
    "position": 0,
    "maxResult": 100,
    "Filter": {
      "key": "",
      "devType": "",
      "protocolType": ["ehomeV5"],
      "devStatus": ["online", "offline"]
    }
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "SearchResult": {
    "MatchList": [
      {
        "Device": {
          "EhomeParams": {
            "EhomeID": "J81551785"
          },
          "ISAPIPortBound": false,
          "ISAPIUserBound": false,
          "activeStatus": true,
          "devIndex": "38941127-49B5-44B3-84FC-219747AFF04E",
          "devMode": "AE-DI5042-G4",
          "devName": "DASHCAM",
          "devStatus": "online",
          "devType": "encodingDev",
          "protocolType": "ehomeV5",
          "videoChannelNum": 5
        }
      },
      {
        "Device": {
          "EhomeParams": {
            "EhomeID": "F16507415"
          },
          "ISAPIPortBound": false,
          "activeStatus": true,
          "devIndex": "E1554DB4-3F60-465D-82CF-45D3740A3D92",
          "devMode": "DS-K1T331W",
          "devName": "FACIAL1",
          "devStatus": "online",
          "devType": "AccessControl",
          "protocolType": "ehomeV5",
          "videoChannelNum": 1
        }
      }
    ],
    "numOfMatches": 2,
    "totalMatches": 2
  }
}
```

---

### 5.2 Operación de Dispositivo

Las operaciones de esta sección actúan sobre un dispositivo concreto administrado por el gateway. Todas requieren el parámetro `devIndex` (UUID del dispositivo destino), que se obtiene de la operación de búsqueda (5.1.4).

#### 5.2.1 Obtener información del dispositivo

`GET /ISAPI/System/deviceInfo?format=json&devIndex=<uuid>`

Obtiene los parámetros del dispositivo: modelo, tipo, versiones de firmware, número de serie, dirección MAC, etc.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "DeviceInfo": {
    "bootVersion": null,
    "deviceID": "255",
    "deviceName": "SYSCOM EXPO demo 1",
    "deviceType": "ACS",
    "encoderReleasedDate": "build 191119",
    "encoderVersion": "V1.0",
    "firmwareReleasedDate": "build 231107",
    "firmwareVersion": "V3.3.8",
    "macAddress": "E0:CA:3C:EC:69:65",
    "model": "DS-K1T341CMFW",
    "serialNumber": "DS-K1T341CMFW20231107V030308ENAD1864724",
    "telecontrolID": 1
  }
}
```

---

#### 5.2.2 Configurar información del dispositivo

`PUT /ISAPI/System/deviceInfo?format=json&devIndex=<uuid>`

Modifica los parámetros configurables del dispositivo. Los campos de solo lectura incluidos en el mensaje se ignoran.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| DeviceInfo | Requerido | Object | Body | Parámetros del dispositivo que se van a configurar. |
| deviceName | Opcional | String | Body | Nombre del dispositivo. |
| deviceDescription | Opcional | String | Body | Descripción del dispositivo. |
| deviceID | Opcional | String | Body | Identificador del dispositivo. |
| deviceType | Opcional | String | Body | Tipo de dispositivo. |
| model | Opcional | String | Body | Modelo del dispositivo (campo de solo lectura). |
| serialNumber | Opcional | String | Body | Número de serie (campo de solo lectura). |
| macAddress | Opcional | String | Body | Dirección MAC (campo de solo lectura). |
| firmwareVersion | Opcional | String | Body | Versión del firmware (campo de solo lectura). |
| firmwareReleasedDate | Opcional | String | Body | Fecha de liberación del firmware (campo de solo lectura). |
| encoderVersion | Opcional | String | Body | Versión del codificador (campo de solo lectura). |
| encoderReleasedDate | Opcional | String | Body | Fecha de liberación del codificador (campo de solo lectura). |
| bootVersion | Opcional | String | Body | Versión del programa de arranque (campo de solo lectura). |
| bootReleasedDate | Opcional | String | Body | Fecha de liberación del programa de arranque (campo de solo lectura). |
| telecontrolID | Opcional | Integer | Body | Identificador de control remoto del dispositivo. |

**Ejemplo de Solicitud:**

```json
{
  "DeviceInfo": {
    "bootReleasedDate": "100316",
    "bootVersion": "V1.3.4",
    "deviceDescription": "IPCamera",
    "deviceID": "C92216702",
    "deviceName": "IP CAMERA test",
    "deviceType": "IPCamera",
    "encoderReleasedDate": "build 190626",
    "encoderVersion": "V7.3",
    "firmwareReleasedDate": "build 190924",
    "firmwareVersion": "V5.6.2",
    "macAddress": "f8:4d:fc:d8:23:e3",
    "model": "DS-2CD2125FWD-IS",
    "serialNumber": "DS-2CD2125FWD-IS20190214AAWRC92216702",
    "telecontrolID": 88
  }
}
```

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/deviceInfo?format=json&devIndex=<uuid>", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

#### 5.2.3 Obtener todas las interfaces de red

`GET /ISAPI/System/Network/interfaces?format=json&devIndex=<uuid>`

Obtiene la información de todas las interfaces de red del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "NetworkInterfaceList": [
    {
      "NetworkInterface": {
        "id": 1,
        "IPAddress": {
          "ipVersion": "dual",
          "addressingType": "static",
          "ipAddress": "10.19.82.57",
          "subnetMask": "255.255.255.0",
          "ipv6Address": "::",
          "bitMask": "0",
          "DefaultGateway": {
            "ipAddress": "10.19.82.254",
            "ipv6Address": "::"
          },
          "PrimaryDNS": {
            "ipAddress": "10.1.7.97"
          },
          "SecondaryDNS": {
            "ipAddress": "10.1.7.98"
          }
        }
      }
    }
  ]
}
```

---

#### 5.2.4 Obtener una interfaz de red

`GET /ISAPI/System/Network/interfaces/<ID>?format=json&devIndex=<uuid>`

Obtiene la información de una interfaz de red específica del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | Integer | Ruta | Identificador de la interfaz de red. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "NetworkInterface": {
    "id": 1,
    "IPAddress": {
      "ipVersion": "dual",
      "addressingType": "static",
      "ipAddress": "10.19.82.57",
      "subnetMask": "255.255.255.0",
      "ipv6Address": "::",
      "bitMask": "0",
      "DefaultGateway": {
        "ipAddress": "10.19.82.254",
        "ipv6Address": "::"
      },
      "Ipv6Mode": {
        "ipV6AddressingType": "ra",
        "ipv6AddressList": [
          {
            "v6Address": {
              "address": "::",
              "bitMask": 0,
              "id": "1",
              "type": "manual"
            }
          }
        ]
      },
      "PrimaryDNS": {
        "ipAddress": "10.1.7.97"
      },
      "SecondaryDNS": {
        "ipAddress": "10.1.7.98"
      }
    }
  }
}
```

---

#### 5.2.5 Configurar una interfaz de red

`PUT /ISAPI/System/Network/interfaces/<ID>?format=json&devIndex=<uuid>`

Establece los parámetros de una interfaz de red específica del dispositivo (direccionamiento IPv4/IPv6, puerta de enlace, DNS, etc.).

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | Integer | Ruta | Identificador de la interfaz de red. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| NetworkInterface | Requerido | Object | Body | Configuración de la interfaz de red. |
| id | Requerido | Integer | Body | Identificador de la interfaz. |
| IPAddress | Requerido | Object | Body | Parámetros de direccionamiento IP de la interfaz. |
| ipVersion | Opcional | String | Body | Versión de IP: `v4`, `v6` o `dual`. |
| addressingType | Opcional | String | Body | Modo de direccionamiento: `static` o `dynamic`. |
| ipAddress | Opcional | String | Body | Dirección IPv4 de la interfaz. |
| subnetMask | Opcional | String | Body | Máscara de subred IPv4. |
| ipv6Address | Opcional | String | Body | Dirección IPv6 de la interfaz. |
| bitMask | Opcional | String | Body | Longitud del prefijo IPv6. |
| DefaultGateway | Opcional | Object | Body | Puerta de enlace predeterminada (contiene `ipAddress` e `ipv6Address`). |
| Ipv6Mode | Opcional | Object | Body | Configuración del modo IPv6 (`ipV6AddressingType`, `ipv6AddressList`). |
| PrimaryDNS | Opcional | Object | Body | Servidor DNS primario (contiene `ipAddress`). |
| SecondaryDNS | Opcional | Object | Body | Servidor DNS secundario (contiene `ipAddress`). |

**Ejemplo de Solicitud:**

```json
{
  "NetworkInterface": {
    "IPAddress": {
      "DefaultGateway": {
        "ipAddress": "10.19.82.254",
        "ipv6Address": "::"
      },
      "Ipv6Mode": {
        "ipV6AddressingType": "ra",
        "ipv6AddressList": [
          {
            "v6Address": {
              "address": "::",
              "bitMask": 0,
              "id": "1",
              "type": "manual"
            }
          }
        ]
      },
      "PrimaryDNS": {
        "ipAddress": "10.1.7.97"
      },
      "SecondaryDNS": {
        "ipAddress": "10.1.7.98"
      },
      "addressingType": "static",
      "bitMask": "0",
      "ipAddress": "10.19.82.57",
      "ipVersion": "dual",
      "ipv6Address": "::",
      "subnetMask": "255.255.255.0"
    },
    "id": 1
  }
}
```

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/Network/interfaces/<ID>?format=json&devIndex=<uuid>", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

#### 5.2.6 Obtener la IP de una interfaz

`GET /ISAPI/System/Network/interfaces/<ID>/ipAddress?format=json&devIndex=<uuid>`

Obtiene la configuración de direccionamiento IP de una interfaz de red específica del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | Integer | Ruta | Identificador de la interfaz de red. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "IPAddress": {
    "ipVersion": "dual",
    "addressingType": "static",
    "ipAddress": "10.19.82.57",
    "subnetMask": "255.255.255.0",
    "ipv6Address": "::",
    "bitMask": "0",
    "DefaultGateway": {
      "ipAddress": "10.19.82.254",
      "ipv6Address": "::"
    },
    "Ipv6Mode": {
      "ipV6AddressingType": "ra",
      "ipv6AddressList": [
        {
          "v6Address": {
            "address": "::",
            "bitMask": 0,
            "id": "1",
            "type": "manual"
          }
        }
      ]
    },
    "PrimaryDNS": {
      "ipAddress": "10.1.7.97"
    },
    "SecondaryDNS": {
      "ipAddress": "10.1.7.98"
    }
  }
}
```

---

#### 5.2.7 Configurar la IP de una interfaz

`PUT /ISAPI/System/Network/interfaces/<ID>/ipAddress?format=json&devIndex=<uuid>`

Establece la configuración de direccionamiento IP de una interfaz de red específica del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | Integer | Ruta | Identificador de la interfaz de red. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| IPAddress | Requerido | Object | Body | Parámetros de direccionamiento IP de la interfaz. |
| ipVersion | Opcional | String | Body | Versión de IP: `v4`, `v6` o `dual`. |
| addressingType | Opcional | String | Body | Modo de direccionamiento: `static` o `dynamic`. |
| ipAddress | Opcional | String | Body | Dirección IPv4 de la interfaz. |
| subnetMask | Opcional | String | Body | Máscara de subred IPv4. |
| ipv6Address | Opcional | String | Body | Dirección IPv6 de la interfaz. |
| bitMask | Opcional | String | Body | Longitud del prefijo IPv6. |
| DefaultGateway | Opcional | Object | Body | Puerta de enlace predeterminada (contiene `ipAddress` e `ipv6Address`). |
| Ipv6Mode | Opcional | Object | Body | Configuración del modo IPv6 (`ipV6AddressingType`, `ipv6AddressList`). |
| PrimaryDNS | Opcional | Object | Body | Servidor DNS primario (contiene `ipAddress`). |
| SecondaryDNS | Opcional | Object | Body | Servidor DNS secundario (contiene `ipAddress`). |

**Ejemplo de Solicitud:**

```json
{
  "IPAddress": {
    "DefaultGateway": {
      "ipAddress": "10.19.82.254",
      "ipv6Address": "::"
    },
    "Ipv6Mode": {
      "ipV6AddressingType": "ra",
      "ipv6AddressList": [
        {
          "v6Address": {
            "address": "::",
            "bitMask": 0,
            "id": "1",
            "type": "manual"
          }
        }
      ]
    },
    "PrimaryDNS": {
      "ipAddress": "10.1.7.97"
    },
    "SecondaryDNS": {
      "ipAddress": "10.1.7.98"
    },
    "addressingType": "static",
    "bitMask": "0",
    "ipAddress": "10.19.82.57",
    "ipVersion": "dual",
    "ipv6Address": "::",
    "subnetMask": "255.255.255.0"
  }
}
```

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/Network/interfaces/<ID>/ipAddress?format=json&devIndex=<uuid>", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

#### 5.2.8 Reiniciar dispositivo

`PUT /ISAPI/System/reboot?format=json&devIndex=<uuid>`

Reinicia de forma remota el dispositivo indicado.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/reboot?format=json&devIndex=<uuid>", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

#### 5.2.9 Actualizar firmware del dispositivo

`PUT /ISAPI/System/upgradeEhome?format=json&devIndex=<uuid>`

Actualiza el firmware del dispositivo mediante un paquete de actualización descargado desde un servidor FTP.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| UpgradeParams | Requerido | Object | Body | Parámetros de la actualización desde FTP. |
| FTPServerIP | Requerido | String | Body | Dirección IP del servidor FTP. |
| FTPServerPort | Requerido | Integer | Body | Puerto del servidor FTP. |
| userName | Requerido | String | Body | Usuario del servidor FTP. Es información sensible y debe cifrarse cuando el esquema de cifrado esté activo. |
| password | Requerido | String | Body | Contraseña del servidor FTP. Es información sensible y debe cifrarse cuando el esquema de cifrado esté activo. |
| file | Requerido | String | Body | Nombre del archivo del paquete de actualización (por ejemplo, `digicap.dav`). |

**Ejemplo de Solicitud:**

```json
{
  "UpgradeParams": {
    "FTPServerIP": "120.34.98.30",
    "FTPServerPort": 23,
    "userName": "test",
    "password": "12345",
    "file": "digicap.dav"
  }
}
```

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/upgradeEhome?format=json&devIndex=<uuid>", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

#### 5.2.10 Obtener zona horaria

`GET /ISAPI/System/time/timeZone?devIndex=<uuid>`

Obtiene la zona horaria configurada en el dispositivo. La respuesta es una cadena de texto plano; cuando incluye horario de verano, contiene el segmento `DST` con las reglas de inicio y fin.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```
CST-8:00:00DST00:30:00,M4.1.0/02:00:00,M10.5.0/02:00:00
```

---

#### 5.2.11 Configurar zona horaria

`PUT /ISAPI/System/time/timeZone?devIndex=<uuid>`

Establece la zona horaria del dispositivo. El cuerpo de la solicitud es **texto plano** (no JSON) con el formato de cadena de zona horaria. En el ejemplo, el segmento `DST01:00:00` indica el desplazamiento del horario de verano, `M5.3.0/02:00:00` la regla de inicio y `M4.2.0/03:00:00` la regla de fin.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| timeZone | Requerido | String | Body | Cadena de zona horaria en texto plano, con formato `CST±h:mm:ss[DSTh:mm:ss,<regla_inicio>,<regla_fin>]`. |

**Ejemplo de Solicitud:**

```
CST+0:00:00DST01:00:00,M5.3.0/02:00:00,M4.2.0/03:00:00
```

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/time/timeZone?devIndex=<uuid>", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

#### 5.2.12 Obtener hora

`GET /ISAPI/System/time?format=json&devIndex=<uuid>`

Obtiene los parámetros de sincronización de hora del dispositivo (hora local y modo de sincronización).

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "Time": {
    "timeMode": "manual",
    "localTime": "2021-10-26T10:21:44+00:00"
  }
}
```

---

#### 5.2.13 Configurar hora

`PUT /ISAPI/System/time?format=json&devIndex=<uuid>`

Establece los parámetros de sincronización de hora del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| Time | Requerido | Object | Body | Parámetros de hora del dispositivo. |
| localTime | Requerido | String | Body | Hora local en formato ISO 8601 con desplazamiento de zona horaria (por ejemplo, `2021-10-26T10:21:44+00:00`). |
| timeMode | Requerido | String | Body | Modo de sincronización: `manual` o `NTP`. |

**Ejemplo de Solicitud:**

```json
{
  "Time": {
    "localTime": "2021-10-26T10:21:44+00:00",
    "timeMode": "manual"
  }
}
```

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/time?format=json&devIndex=<uuid>", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

### 5.3 Mantenimiento del Gateway

Las operaciones de esta sección actúan sobre el propio Hik Device Gateway. Utilizan las mismas rutas ISAPI que las operaciones de dispositivo, pero **sin** el parámetro `devIndex`.

#### 5.3.1 Obtener información del gateway

`GET /ISAPI/System/deviceInfo?format=json`

Obtiene los parámetros del Hik Device Gateway (nombre, modelo, versión de firmware, etc.).

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "DeviceInfo": {
    "deviceName": "Hik Device Gateway",
    "deviceID": "255",
    "deviceType": "gateway",
    "model": "DS-GWAS0101",
    "serialNumber": "DS-GWAS0101202501090001",
    "macAddress": "00:11:22:33:44:55",
    "firmwareVersion": "V1.8.0",
    "firmwareReleasedDate": "build 250109"
  }
}
```

---

#### 5.3.2 Configurar información del gateway

`PUT /ISAPI/System/deviceInfo?format=json`

Modifica los parámetros configurables del Hik Device Gateway. Los campos de solo lectura incluidos en el mensaje se ignoran.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| DeviceInfo | Requerido | Object | Body | Parámetros del gateway que se van a configurar. |
| deviceName | Opcional | String | Body | Nombre del Hik Device Gateway. |

**Ejemplo de Solicitud:**

```json
{
  "DeviceInfo": {
    "deviceName": "test101 Gateway"
  }
}
```

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/deviceInfo?format=json", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

#### 5.3.3 Reiniciar el gateway

`PUT /ISAPI/System/reboot?format=json`

Reinicia el Hik Device Gateway.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/reboot?format=json", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

#### 5.3.4 Obtener hora del gateway

`GET /ISAPI/System/time?format=json`

Obtiene los parámetros de sincronización de hora del Hik Device Gateway.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "Time": {
    "timeMode": "manual",
    "localTime": "2021-10-26T09:47:25+08:00"
  }
}
```

---

#### 5.3.5 Configurar hora del gateway

`PUT /ISAPI/System/time?format=json`

Establece los parámetros de sincronización de hora del Hik Device Gateway.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| Time | Requerido | Object | Body | Parámetros de hora del gateway. |
| localTime | Requerido | String | Body | Hora local en formato ISO 8601 con desplazamiento de zona horaria (por ejemplo, `2021-10-26T09:47:25+08:00`). |
| timeMode | Requerido | String | Body | Modo de sincronización: `manual` o `NTP`. |

**Ejemplo de Solicitud:**

```json
{
  "Time": {
    "localTime": "2021-10-26T09:47:25+08:00",
    "timeMode": "manual"
  }
}
```

**Ejemplo de Respuesta:**

```json
{"ResponseStatus": {"requestURL": "/ISAPI/System/time?format=json", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

---

### 5.4 Transmit Device ISAPI (Passthrough)

#### 5.4.1 Reenviar ISAPI nativa al dispositivo

`<MÉTODO> <ISAPIURI>?devIndex=<uuid>`

En su forma completa, según la guía oficial: `http://<ipAddress>:<port>/<ISAPIURI>?devIndex=<uuid>`

Reenvía (passthrough) una URI ISAPI nativa al dispositivo para ejecutar la función correspondiente. Permite invocar **cualquier** URI ISAPI soportada por el equipo a través del gateway, sin necesidad de que dicha operación esté expuesta explícitamente por la API del gateway. El método HTTP y el cuerpo de la solicitud dependen de la URI ISAPI reenviada; tanto la solicitud como la respuesta son idénticas a las de la ISAPI nativa del dispositivo. Esta operación solo es compatible con dispositivos agregados vía ISUP5.0 e ISAPI.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ipAddress | Requerido | String | Ruta | Dirección IP del Hik Device Gateway. |
| port | Requerido | Integer | Ruta | Puerto del Hik Device Gateway. |
| ISAPIURI | Requerido | String | Ruta | URI ISAPI soportada por el dispositivo que se desea reenviar. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |

> El método, el cuerpo de la solicitud y el cuerpo de la respuesta son los mismos que define la URI ISAPI nativa reenviada.

**Ejemplo de Solicitud:**

Ejemplo 1 — Consultar las capacidades del dispositivo (sin cuerpo):

```
GET http://<ipAddress>:<port>/ISAPI/System/capabilities?devIndex=<uuid>
```

Ejemplo 2 — Enviar un comando de control PTZ continuo (el cuerpo corresponde a la ISAPI nativa `PTZData`):

```
PUT http://<ipAddress>:<port>/ISAPI/PTZCtrl/channels/1/continuous?devIndex=<uuid>
```

```json
{
  "PTZData": {
    "pan": 10,
    "tilt": 10,
    "zoom": 10
  }
}
```

**Ejemplo de Respuesta:**

La respuesta es idéntica a la que devolvería la ISAPI nativa del dispositivo. En las operaciones de escritura, el equipo responde normalmente con el objeto de estado estándar:

```json
{"ResponseStatus": {"requestURL": "/ISAPI/PTZCtrl/channels/1/continuous", "statusCode": 1, "statusString": "OK", "subStatusCode": "ok"}}
```

En las operaciones de lectura (como el Ejemplo 1), el dispositivo devuelve su carga útil ISAPI nativa correspondiente (por ejemplo, el documento de capacidades del equipo).

---

### 5.5 Video en Vivo y Multimedia

Esta sección describe las operaciones para obtener las URL de reproducción de vista en vivo y de reproducción (playback), el audio bidireccional, la gestión de grabaciones y el control PTZ de los dispositivos de video conectados al gateway. Cada dispositivo se direcciona mediante su `devIndex` (UUID) obtenido de la lista de dispositivos (`deviceList`). Los endpoints de streaming no transmiten el medio directamente: devuelven una URL (RTSP o WebSocket) que usted debe usar para iniciar la reproducción.

#### 5.5.1 Obtener URL de vista en vivo

`POST /ISAPI/System/streamMedia?format=json&devIndex=<uuid>`

Obtiene la URL de streaming para iniciar la vista en vivo de una cámara. La URL de reproducción se devuelve en el campo `MediaAccessInfo.URL` de la respuesta.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| StreamInfo | Requerido | Object | Body | Objeto que describe el flujo solicitado. |
| id | Requerido | String | Body | Identificador del canal de la cámara. |
| streamType | Requerido | String | Body | Tipo de flujo: `main` (flujo principal) o `sub` (flujo secundario). |
| method | Requerido | String | Body | Método de acceso; use `preview` para vista en vivo. |

**Ejemplo de Solicitud:**

```json
{
  "StreamInfo": {
    "id": "1",
    "streamType": "main",
    "method": "preview"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "MediaAccessInfo": {
    "URL": "rtsp://3.140.9.60:554/dac/realplay/38941127-49B5-44B3-84FC-219747AFF04E1/MAIN/TCP?streamform=rtp"
  }
}
```

---

#### 5.5.2 Obtener URL de reproducción (playback)

`POST /ISAPI/ContentMgmt/search?format=json&devIndex=<uuid>`

Busca los archivos de video grabados dentro de un intervalo de tiempo y devuelve la URL de reproducción de cada segmento encontrado. La URL de reproducción se encuentra en `CMSearchResult.matchList[0].searchMatchItem.mediaSegmentDescriptor.playbackURI`.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| CMSearchDescription | Requerido | Object | Body | Objeto que describe los criterios de búsqueda. |
| searchID | Requerido | String | Body | Identificador único de la búsqueda (GUID). |
| trackIDList | Requerido | Array | Body | Lista de pistas (canales) a consultar; `trackID` 101 corresponde al flujo principal del canal 1. |
| timeSpanList | Requerido | Array | Body | Lista de intervalos de tiempo (`startTime`, `endTime`) en formato UTC. |
| contentTypeList | Opcional | Array | Body | Tipo de contenido a buscar, p. ej. `video`. |
| maxResults | Opcional | Number | Body | Número máximo de resultados a devolver. |
| searchResultPostion | Opcional | Number | Body | Posición inicial del resultado (para paginación). |
| metadataList | Opcional | Array | Body | Descriptores de metadatos, p. ej. `recordType.meta.hikvision.com`. |

**Ejemplo de Solicitud:**

```json
{
  "CMSearchDescription": {
    "searchID": "C7E71364-4560-0001-6EDD-16ED17B01CCD",
    "trackIDList": [
      { "trackID": 101 }
    ],
    "timeSpanList": [
      {
        "timeSpan": {
          "startTime": "2021-10-25T16:00:00Z",
          "endTime": "2021-10-28T15:59:59Z"
        }
      }
    ],
    "contentTypeList": [
      { "contentType": "video" }
    ],
    "maxResults": 40,
    "searchResultPostion": 0,
    "metadataList": [
      { "metadataDescriptor": "recordType.meta.hikvision.com" }
    ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "CMSearchResult": {
    "matchList": [
      {
        "searchMatchItem": {
          "mediaSegmentDescriptor": {
            "codecType": "H.264-BP",
            "contenType": "video",
            "lockStatus": "unlock",
            "name": "00010000658000300",
            "playbackURI": "rtsp://13.58.159.195:554/dac/playback/camera/E4680FAC-20D5-4FCB-8551-D6168EE37BE61/MAIN/TCP?starttime=20220921T232525Z&endtime=20220921T232802Z&name=00010000658000300&size=48144784&streamform=rtp",
            "size": 48144784
          },
          "sourceID": "{00000000-0000-0000-0000-000000000000}",
          "timeSpan": {
            "endTime": "2022-09-21T23:28:02Z",
            "startTime": "2022-09-21T23:25:25Z"
          },
          "trackID": 101
        }
      }
    ],
    "numOfMatches": 1,
    "responseStatus": true,
    "responseStatusStrg": "OK",
    "searchID": "00000000-0000-0000-0000-000000000000"
  }
}
```

---

#### 5.5.3 Obtener canal de audio bidireccional

`GET /ISAPI/System/TwoWayAudio/channels/<ID>?format=json&devIndex=<uuid>`

Obtiene la información de un canal de audio bidireccional (two-way audio) específico del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador del canal de audio bidireccional. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "TwoWayAudioChannel": {
    "id": "1",
    "enabled": true,
    "audioCompressionType": "G.711ulaw",
    "audioInputType": "MIC",
    "speakerVolume": 100,
    "microphoneVolume": 100
  }
}
```

---

#### 5.5.4 Obtener URL de audio (two-way)

`POST /ISAPI/System/streamMedia?format=json&devIndex=<uuid>`

Obtiene la URL de streaming para establecer una sesión de audio bidireccional con el dispositivo. La URL se devuelve en el campo `MediaAccessInfo.URL` de la respuesta.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| StreamInfo | Requerido | Object | Body | Objeto que describe el flujo solicitado. |
| id | Requerido | String | Body | Identificador del canal de audio. |
| method | Requerido | String | Body | Método de acceso; use `twoWayAudio` para audio bidireccional. |

**Ejemplo de Solicitud:**

```json
{
  "StreamInfo": {
    "id": "1",
    "method": "twoWayAudio"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "MediaAccessInfo": {
    "URL": "rtsp://3.140.9.60:554/dac/twoWayAudio/38941127-49B5-44B3-84FC-219747AFF04E1/TCP"
  }
}
```

---

#### 5.5.5 Iniciar grabación manual

`POST /ISAPI/ContentMgmt/record/control/manual/start/tracks/<ID>?format=json&devIndex=<uuid>`

Inicia manualmente la grabación de una cámara durante la vista en vivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador de la pista (track) a grabar; 101 corresponde al flujo principal del canal 1. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/ContentMgmt/record/control/manual/start/tracks/101?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.5.6 Detener grabación manual

`POST /ISAPI/ContentMgmt/record/control/manual/stop/tracks/<ID>?format=json&devIndex=<uuid>`

Detiene manualmente la grabación de una cámara previamente iniciada.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador de la pista (track) cuya grabación se detendrá. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/ContentMgmt/record/control/manual/stop/tracks/101?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.5.7 Obtener calendario de grabación

`GET /ISAPI/ContentMgmt/record/tracks?format=json&devIndex=<uuid>`

Obtiene los calendarios de grabación (pistas) configurados en la cámara.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "TrackList": [
    {
      "Track": {
        "Channel": 101,
        "CustomExtensionList": [
          {
            "CustomExtension": {
              "CustomExtensionName": "www.hikvision.com/RaCM/trackExt/ver10",
              "PostRecordTimeSeconds": 5,
              "PreRecordTimeSeconds": 5,
              "SaveAudio": false,
              "enableSchedule": true
            }
          }
        ],
        "DefaultRecordingMode": "CMR",
        "Description": "trackType=standard,contentType=video,codecType=H.264-BP,resolution=2560x1440,framerate=30.0 fps,bitrate=6144 kbps",
        "Duration": "P0DT0H",
        "Enable": false,
        "Size": 1,
        "SrcDescriptor": {
          "SrcChannel": 1,
          "SrcDriver": "",
          "SrcGUID": "{00000000-0000-0000-0000-000000000000}",
          "SrcLogin": "",
          "SrcType": "",
          "SrcUrl": "rtsp://localhost/PSIA/Streaming/channels/101",
          "SrcUrlMethods": "",
          "StreamHint": ""
        },
        "TrackGUID": "{00000000-0000-0000-0000-000000000000}",
        "TrackSchedule": {
          "ScheduleBlockList": [
            { "ScheduleBlock": { "...": "bloques de programación por día (ver 5.5.8)" } }
          ]
        },
        "id": 101
      }
    }
  ]
}
```

> **Notas:** La estructura completa del objeto `Track` (incluidos los bloques `ScheduleBlockList`) coincide con la mostrada en el endpoint 5.5.8. Consulte el Apéndice para el detalle de todos los campos.

---

#### 5.5.8 Agregar calendario de grabación

`POST /ISAPI/ContentMgmt/record/tracks?format=json&devIndex=<uuid>`

Agrega un calendario de grabación (pista) a la cámara.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| Track | Requerido | Object | Body | Objeto que describe la pista de grabación. |
| Channel | Requerido | Number | Body | Canal asociado a la pista (p. ej. 101). |
| DefaultRecordingMode | Requerido | String | Body | Modo de grabación por defecto, p. ej. `CMR` (grabación continua) o `MOTION`. |
| Enable | Requerido | Boolean | Body | Habilita o deshabilita la pista de grabación. |
| LoopEnable | Requerido | Boolean | Body | Habilita la sobrescritura cíclica al llenarse el almacenamiento. |
| SrcDescriptor | Requerido | Object | Body | Descriptor de la fuente de video (URL RTSP, códec, credenciales, etc.). |
| TrackSchedule | Requerido | Object | Body | Programación semanal de la grabación (bloques por día y acción). |
| id | Requerido | Number | Body | Identificador de la pista. |

> **Notas:** El cuerpo del objeto `Track` incluye campos adicionales (`CustomExtensionList`, `Description`, `TrackGUID`, y la estructura anidada de `TrackSchedule`). Consulte el Apéndice para el detalle completo de cada campo.

**Ejemplo de Solicitud:**

```json
{
  "Track": {
    "Channel": 101,
    "CustomExtensionList": [
      {
        "CustomExtension": {
          "CustomExtensionName": "",
          "PostRecordTimeSeconds": 10,
          "PreRecordTimeSeconds": 5,
          "enableSchedule": true
        }
      }
    ],
    "DefaultRecordingMode": "CMR",
    "Description": "trackType=standard,trackType=video,codecType=H.264-BP,resolution=1920x1080,framerate=0.880000 fps,bitrate=512 kbps",
    "Enable": true,
    "LoopEnable": true,
    "SrcDescriptor": {
      "SrcChannel": 1,
      "SrcDriver": "RTSP",
      "SrcGUID": "e32e6863-ea5e-4ee4-997e-f84dfcd823e3",
      "SrcLogin": "admin",
      "SrcType": "H.264-BP",
      "SrcUrl": "rtsp://localhost/ISAPI/Streaming/channels/101",
      "SrcUrlMethods": "DESCRIBE, SETUP, PLAY, TEARDOWN",
      "StreamHint": "trackType=standard,trackType=video,codecType=H.264-BP,resolution=1920x1080,framerate=0.880000 fps,bitrate=512 kbps"
    },
    "TrackGUID": "e32e6863-ea5e-4ee4-997e-f84dfcd823e3",
    "TrackSchedule": {
      "ScheduleBlockList": [
        {
          "ScheduleBlock": {
            "ScheduleAction": [
              {
                "Actions": { "ActionRecordingMode": "MOTION", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Monday", "TimeOfDay": "20:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Monday", "TimeOfDay": "04:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Tuesday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Tuesday", "TimeOfDay": "00:01:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Wednesday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Wednesday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Thursday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Thursday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Friday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Friday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Saturday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Saturday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Sunday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Sunday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              }
            ],
            "ScheduleBlockGUID": "{00000000-0000-0000-0000-000000000000}",
            "ScheduleBlockType": ""
          }
        }
      ]
    },
    "id": 101
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/ContentMgmt/record/tracks?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.5.9 Configurar calendario de grabación

`PUT /ISAPI/ContentMgmt/record/tracks/<ID>?format=json&devIndex=<uuid>`

Modifica un calendario de grabación (pista) existente en la cámara.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador de la pista (track) a configurar. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| Track | Requerido | Object | Body | Objeto que describe la pista de grabación. |
| Channel | Requerido | Number | Body | Canal asociado a la pista (p. ej. 101). |
| DefaultRecordingMode | Requerido | String | Body | Modo de grabación por defecto, p. ej. `CMR` (grabación continua) o `MOTION`. |
| Enable | Requerido | Boolean | Body | Habilita o deshabilita la pista de grabación. |
| LoopEnable | Requerido | Boolean | Body | Habilita la sobrescritura cíclica al llenarse el almacenamiento. |
| SrcDescriptor | Requerido | Object | Body | Descriptor de la fuente de video (URL RTSP, códec, credenciales, etc.). |
| TrackSchedule | Requerido | Object | Body | Programación semanal de la grabación (bloques por día y acción). |
| id | Requerido | Number | Body | Identificador de la pista. |

> **Notas:** El cuerpo del objeto `Track` es idéntico al del endpoint 5.5.8 e incluye campos adicionales (`CustomExtensionList`, `Description`, `TrackGUID` y la estructura anidada de `TrackSchedule`). Consulte el Apéndice para el detalle completo de cada campo.

**Ejemplo de Solicitud:**

```json
{
  "Track": {
    "Channel": 101,
    "CustomExtensionList": [
      {
        "CustomExtension": {
          "CustomExtensionName": "",
          "PostRecordTimeSeconds": 10,
          "PreRecordTimeSeconds": 5,
          "enableSchedule": true
        }
      }
    ],
    "DefaultRecordingMode": "CMR",
    "Description": "trackType=standard,trackType=video,codecType=H.264-BP,resolution=1920x1080,framerate=0.880000 fps,bitrate=512 kbps",
    "Enable": true,
    "LoopEnable": true,
    "SrcDescriptor": {
      "SrcChannel": 1,
      "SrcDriver": "RTSP",
      "SrcGUID": "e32e6863-ea5e-4ee4-997e-f84dfcd823e3",
      "SrcLogin": "admin",
      "SrcType": "H.264-BP",
      "SrcUrl": "rtsp://localhost/ISAPI/Streaming/channels/101",
      "SrcUrlMethods": "DESCRIBE, SETUP, PLAY, TEARDOWN",
      "StreamHint": "trackType=standard,trackType=video,codecType=H.264-BP,resolution=1920x1080,framerate=0.880000 fps,bitrate=512 kbps"
    },
    "TrackGUID": "e32e6863-ea5e-4ee4-997e-f84dfcd823e3",
    "TrackSchedule": {
      "ScheduleBlockList": [
        {
          "ScheduleBlock": {
            "ScheduleAction": [
              {
                "Actions": { "ActionRecordingMode": "MOTION", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Monday", "TimeOfDay": "20:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Monday", "TimeOfDay": "04:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Tuesday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Tuesday", "TimeOfDay": "00:01:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Wednesday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Wednesday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Thursday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Thursday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Friday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Friday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Saturday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Saturday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              },
              {
                "Actions": { "ActionRecordingMode": "CMR", "Log": false, "Record": true, "SaveImg": false },
                "Description": "nothing",
                "ScheduleActionEndTime": { "DayOfWeek": "Sunday", "TimeOfDay": "24:00:00" },
                "ScheduleActionStartTime": { "DayOfWeek": "Sunday", "TimeOfDay": "00:00:00" },
                "ScheduleDSTEnable": false,
                "id": 1
              }
            ],
            "ScheduleBlockGUID": "{00000000-0000-0000-0000-000000000000}",
            "ScheduleBlockType": ""
          }
        }
      ]
    },
    "id": 101
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/ContentMgmt/record/tracks/101?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.5.10 Iniciar control PTZ

`PUT /ISAPI/PTZCtrl/channels/<ID>/continuous?format=json&devIndex=<uuid>`

Controla de forma continua el movimiento PTZ de una cámara (giro horizontal, giro vertical y zoom).

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador del canal de la cámara. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| PTZData | Requerido | Object | Body | Objeto con los parámetros de movimiento PTZ. |
| pan | Requerido | Number | Body | Velocidad de giro horizontal, en el rango de -100 a 100. Un valor positivo gira a la derecha, uno negativo a la izquierda y 0 detiene el movimiento. |
| tilt | Requerido | Number | Body | Velocidad de giro vertical, en el rango de -100 a 100. Un valor positivo sube, uno negativo baja y 0 detiene el movimiento. |
| zoom | Requerido | Number | Body | Velocidad de zoom, en el rango de -100 a 100. Un valor positivo acerca, uno negativo aleja y 0 detiene el zoom. |

> **Notas:** Para detener el movimiento continuo, envíe una nueva solicitud con `pan`, `tilt` y `zoom` en 0. El rango exacto puede variar según el modelo; verifique las capacidades PTZ del dispositivo.

**Ejemplo de Solicitud:**

```json
{
  "PTZData": {
    "pan": 10,
    "tilt": 10,
    "zoom": 10
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/PTZCtrl/channels/1/continuous?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.5.11 Agregar presets

`POST /ISAPI/PTZCtrl/channels/<ID>/presets?format=json&devIndex=<uuid>`

Agrega uno o varios presets (posiciones predefinidas) para una cámara PTZ.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador del canal de la cámara. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| PTZPresetList | Requerido | Array | Body | Lista de presets a agregar. |
| enabled | Requerido | Boolean | Body | Habilita o deshabilita el preset. |
| id | Requerido | Number | Body | Identificador del preset. |
| presetName | Requerido | String | Body | Nombre del preset. |

**Ejemplo de Solicitud:**

```json
{
  "PTZPresetList": [
    {
      "PTZPreset": {
        "enabled": true,
        "id": 1,
        "presetName": "preset1"
      }
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/PTZCtrl/channels/1/presets?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.5.12 Llamar a un preset

`PUT /ISAPI/PTZCtrl/channels/<ID>/presets/<ID>/goto?format=json&devIndex=<uuid>`

Mueve la cámara PTZ hacia un preset previamente configurado.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID (canal) | Requerido | String | Ruta | Identificador del canal de la cámara (primer `<ID>`). |
| ID (preset) | Requerido | String | Ruta | Identificador del preset a invocar (segundo `<ID>`). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/PTZCtrl/channels/1/presets/3/goto?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

### 5.6 Operación de Dispositivos de Video

Esta sección agrupa las operaciones de configuración y control de los dispositivos de video: carga de rostros a la biblioteca, entradas/salidas de alarma, parámetros de entrada de video y de codificación, captura y descarga de imágenes, y el despertado de dispositivos en reposo. Todos los endpoints se direccionan mediante el `devIndex` del dispositivo destino.

#### 5.6.1 Agregar/subir rostro (biblioteca)

`POST /ISAPI/Intelligent/FDLib/pictureUpload?format=json&devIndex=<uuid>`

Importa una imagen de rostro a la biblioteca de rostros (FDLib) del dispositivo. Antes de importar, debe obtener el `FDID` de la biblioteca destino mediante la API `/ISAPI/Intelligent/FDLib/search`.

> **Notas:** Este endpoint se envía como `multipart/form-data` (`withAttachment = true`): una parte contiene el mensaje JSON `PictureUploadData` y otra parte contiene los datos binarios de la imagen del rostro. Los datos binarios de la imagen se envían a continuación del mensaje JSON.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| PictureUploadData | Requerido | Object (parte JSON) | Body | Parte JSON del multipart con los metadatos del rostro. |
| FDID | Requerido | String | Body | Identificador de la biblioteca de rostros destino. |
| FaceAppendData | Opcional | Object | Body | Datos adicionales del rostro, p. ej. `name` (nombre asociado). |
| (imagen) | Requerido | Binary (parte archivo) | Body | Parte binaria del multipart con la imagen del rostro (p. ej. JPEG). |

**Ejemplo de Solicitud:**

```json
{
  "PictureUploadData": {
    "FDID": "8533053A8BE44932A487F6F81BF2BC79",
    "FaceAppendData": {
      "name": "test"
    }
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Intelligent/FDLib/pictureUpload?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

> **Notas:** En caso de éxito, el dispositivo puede devolver un mensaje `MaskInfo` con la información del modelo de rostro generado; en caso de error, devuelve un mensaje `ResponseStatus` con el detalle.

---

#### 5.6.2 Obtener entradas/salidas de alarma

`GET /ISAPI/System/IO?format=json&devIndex=<uuid>`

Obtiene la información de las entradas y salidas de alarma (I/O) del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "IOPortList": [
    {
      "IOPortData": {
        "id": "1",
        "portType": "input",
        "inputStatus": "active"
      }
    },
    {
      "IOPortData": {
        "id": "1",
        "portType": "output",
        "outputState": "low"
      }
    }
  ]
}
```

---

#### 5.6.3 Disparar salida de alarma

`PUT /ISAPI/System/IO/outputs/<ID>/trigger?format=json&devIndex=<uuid>`

Activa manualmente una salida de alarma del dispositivo, conmutándola a nivel alto o bajo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Número de la salida de alarma a disparar. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| IOPortData | Requerido | Object | Body | Objeto con el estado de la salida. |
| outputState | Requerido | String | Body | Estado deseado de la salida: `high` (nivel alto) o `low` (nivel bajo). |

**Ejemplo de Solicitud:**

```json
{
  "IOPortData": {
    "outputState": "high"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/System/IO/outputs/1/trigger?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.6.4 Obtener parámetros de entrada de video

`GET /ISAPI/System/Video/inputs/channels?format=json&devIndex=<uuid>`

Obtiene, en lote, los parámetros de entrada de video de todos los canales del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "VideoInputChannelList": [
    {
      "VideoInputChannel": {
        "id": "1",
        "inputPort": "1",
        "name": "IPCamera 01",
        "videoFormat": "PAL"
      }
    }
  ]
}
```

---

#### 5.6.5 Obtener parámetros de un canal

`GET /ISAPI/System/Video/inputs/channels/<ID>?format=json&devIndex=<uuid>`

Obtiene los parámetros de entrada de video de un canal específico.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador del canal de entrada de video. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "VideoInputChannel": {
    "id": "1",
    "inputPort": "1",
    "name": "IPCamera 01",
    "videoFormat": "PAL"
  }
}
```

---

#### 5.6.6 Configurar parámetros de un canal

`PUT /ISAPI/System/Video/inputs/channels/<ID>?format=json&devIndex=<uuid>`

Establece los parámetros de entrada de video de un canal específico.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador del canal de entrada de video. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| VideoInputChannel | Requerido | Object | Body | Objeto con los parámetros del canal. |
| id | Requerido | String | Body | Identificador del canal. |
| inputPort | Requerido | String | Body | Puerto de entrada asociado al canal. |
| name | Requerido | String | Body | Nombre del canal. |
| videoFormat | Requerido | String | Body | Formato de video, p. ej. `PAL` o `NTSC`. |

**Ejemplo de Solicitud:**

```json
{
  "VideoInputChannel": {
    "id": "1",
    "inputPort": "1",
    "name": "IPCamera 01",
    "videoFormat": "PAL"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/System/Video/inputs/channels/1?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.6.7 Obtener parámetros de codificación

`GET /ISAPI/Streaming/channels/<ID>?format=json&devIndex=<uuid>`

Obtiene los parámetros de codificación (streaming) de un canal específico.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador del canal de streaming (p. ej. 101). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "StreamingChannel": {
    "Audio": {
      "audioCompressionType": "G.711ulaw",
      "audioInputChannelID": "1",
      "enabled": true
    },
    "Transport": {
      "ControlProtocolList": [
        { "ControlProtocol": { "streamingTransport": "RTSP" } },
        { "ControlProtocol": { "streamingTransport": "HTTP" } },
        { "ControlProtocol": { "streamingTransport": "SHTTP" } }
      ],
      "Unicast": {
        "enabled": true,
        "rtpTransportType": "RTP/TCP"
      },
      "maxPacketSize": 1000
    },
    "Video": {
      "GovLength": 6,
      "H264Profile": "Main",
      "constantBitRate": 512,
      "enabled": true,
      "maxFrameRate": 600,
      "videoCodecType": "H.264",
      "videoInputChannelID": "1",
      "videoQualityControlType": "CBR",
      "videoResolutionHeight": 1080,
      "videoResolutionWidth": 1920,
      "videoScanType": "progressive"
    },
    "channelName": "IPCamera 01",
    "enabled": true,
    "id": "101"
  }
}
```

---

#### 5.6.8 Configurar parámetros de codificación

`PUT /ISAPI/Streaming/channels/<ID>?format=json&devIndex=<uuid>`

Establece los parámetros de codificación (streaming) de un canal específico.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador del canal de streaming (p. ej. 101). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| StreamingChannel | Requerido | Object | Body | Objeto que describe el canal de streaming. |
| Audio | Requerido | Object | Body | Parámetros de audio (tipo de compresión, canal de entrada, habilitación). |
| Video | Requerido | Object | Body | Parámetros de video (códec, resolución, tasa de bits, tasa de cuadros, etc.). |
| Transport | Requerido | Object | Body | Parámetros de transporte (protocolos de control, multicast, unicast, seguridad). |
| channelName | Requerido | String | Body | Nombre del canal. |
| enabled | Requerido | Boolean | Body | Habilita o deshabilita el canal de streaming. |
| id | Requerido | String | Body | Identificador del canal. |

> **Notas:** El cuerpo del objeto `StreamingChannel` contiene numerosos subcampos anidados dentro de `Audio`, `Video` y `Transport`. Consulte el Apéndice para el detalle completo de cada campo.

**Ejemplo de Solicitud:**

```json
{
  "StreamingChannel": {
    "Audio": {
      "audioCompressionType": "G.711ulaw",
      "audioInputChannelID": "1",
      "enabled": true
    },
    "Transport": {
      "ControlProtocolList": [
        { "ControlProtocol": { "streamingTransport": "RTSP" } },
        { "ControlProtocol": { "streamingTransport": "HTTP" } },
        { "ControlProtocol": { "streamingTransport": "SHTTP" } }
      ],
      "Multicast": {
        "audioDestPortNo": 8862,
        "destIPAddress": "0.0.0.0",
        "enabled": true,
        "videoDestPortNo": 8860
      },
      "Security": {
        "certificateType": "digest",
        "enabled": true
      },
      "Unicast": {
        "enabled": true,
        "rtpTransportType": "RTP/TCP"
      },
      "maxPacketSize": 1000
    },
    "Video": {
      "GovLength": 6,
      "H264Profile": "Main",
      "H265Profile": "Main",
      "PacketType": "PS",
      "SVC": { "enabled": false },
      "SmartCodec": { "enabled": false },
      "constantBitRate": 512,
      "enabled": true,
      "fixedQuality": 60,
      "keyFrameInterval": 1000,
      "maxFrameRate": 600,
      "smoothing": 50,
      "snapShotImageType": "JPEG",
      "videoCodecType": "H.264",
      "videoInputChannelID": "1",
      "videoQualityControlType": "CBR",
      "videoResolutionHeight": 1080,
      "videoResolutionWidth": 1920,
      "videoScanType": "progressive"
    },
    "channelName": "IPCamera 01",
    "enabled": true,
    "id": "101"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Streaming/channels/101?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.6.9 Captura manual de imagen

`GET /ISAPI/Streaming/channels/<channelID>/picture?format=json&devIndex=<uuid>`

Captura manualmente una imagen del flujo de video de un canal específico. La respuesta devuelve la URL con la que podrá descargar la imagen almacenada (ver 5.6.10).

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| channelID | Requerido | String | Ruta | Identificador del canal del cual capturar la imagen (p. ej. 101). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

> **Notas:** Esta URI solo es válida cuando la suscripción a eventos/alarmas está habilitada y existe. Si el canal indicado no existe, no será posible capturar la imagen.

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "PictureData": {
    "URL": "/HikGatewayStorage/pic?C836D420DB63EFA3F4BF48B7A6C07DBE"
  }
}
```

---

#### 5.6.10 Descargar imagen almacenada

`GET /HikGatewayStorage/pic?<hash>`

Descarga el archivo de imagen almacenado en el gateway, identificado por el hash devuelto en la captura manual (5.6.9). A diferencia del resto de endpoints, la respuesta no es JSON: es el contenido binario de la imagen.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| hash | Requerido | String | Query | Identificador (hash) del archivo de imagen devuelto por el endpoint de captura manual. |

> **Notas:** Esta ruta no lleva los parámetros `format` ni `devIndex`; el hash es el único parámetro de consulta y actúa como identificador del archivo.

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

La respuesta es el contenido binario de la imagen con tipo de contenido `image/jpeg` (no devuelve JSON).

---

#### 5.6.11 Despertar dispositivo

`PUT /ISAPI/System/wakeUp?format=json&devIndex=<uuid>`

Despierta un dispositivo que se encuentra en modo de reposo (sleep).

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
| --- | --- | --- | --- | --- |
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

> **Notas:** Tras despertar el dispositivo, espere a que este vuelva a conectarse antes de realizar cualquier otra operación. La reconexión toma aproximadamente 1 minuto.

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/System/wakeUp?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

### 5.7 Servidores de Escucha y Notificaciones

Este grupo de operaciones permite consultar, registrar, modificar y eliminar los servidores de escucha (listening servers) a los que el dispositivo envía directamente sus eventos y alarmas mediante HTTP/HTTPS. Todas las operaciones se dirigen a un dispositivo concreto a través del parámetro `devIndex`.

> **Notas:**
> - El nodo `SubscribeEvent` de cada servidor permite definir el intervalo de latido (`heartbeat`, en segundos; valor por omisión 30) y el modo de suscripción de eventos (`eventMode`: `all` para recibir todos los eventos, o `list` para recibir únicamente los tipos indicados en `minorEvent`).
> - El campo `addressingFormatType` determina qué dato de dirección debe enviarse: `ipaddress` (use `ipAddress`) u `hostname` (use `hostName`).

---

#### 5.7.1 Obtener servidores de escucha

`GET /ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>`

Obtiene los parámetros de todos los servidores de escucha configurados en el dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "HttpHostNotificationList": [
    {
      "HttpHostNotification": {
        "id": "1",
        "url": "",
        "protocolType": "EHome",
        "addressingFormatType": "ipaddress",
        "ipAddress": "54.244.61.32",
        "portNo": 7667
      }
    },
    {
      "HttpHostNotification": {
        "id": "2",
        "url": "/event/notification",
        "protocolType": "HTTP",
        "addressingFormatType": "ipaddress",
        "ipAddress": "10.21.84.48",
        "portNo": 80
      }
    }
  ]
}
```

---

#### 5.7.2 Agregar servidor de escucha

`POST /ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>`

Registra uno o varios servidores de escucha para que el dispositivo les remita directamente sus alarmas.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| id | Requerido | String | Body | Número identificador del servidor de escucha. |
| url | Requerido | String | Body | Ruta a la que se cargan los eventos (máx. 128 bytes). |
| protocolType | Requerido | String | Body | Protocolo de transporte: `HTTP` o `HTTPS`. |
| addressingFormatType | Requerido | String | Body | Tipo de dirección: `ipaddress` o `hostname`. |
| ipAddress | Dependiente | String | Body | Dirección IP de escucha (cuando `addressingFormatType` es `ipaddress`). |
| hostName | Dependiente | String | Body | Nombre de dominio (cuando `addressingFormatType` es `hostname`). |
| portNo | Requerido | Integer | Body | Puerto de escucha del servidor. |

**Ejemplo de Solicitud:**

```json
{
  "HttpHostNotificationList": [
    {
      "HttpHostNotification": {
        "id": "2",
        "url": "/event/notification",
        "protocolType": "HTTP",
        "addressingFormatType": "ipaddress",
        "ipAddress": "10.21.84.48",
        "portNo": 80
      }
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.7.3 Configurar servidor de escucha

`PUT /ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>`

Reemplaza los parámetros de todos los servidores de escucha del dispositivo con la configuración indicada.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| id | Requerido | String | Body | Número identificador del servidor de escucha. |
| url | Requerido | String | Body | Ruta a la que se cargan los eventos (máx. 128 bytes). |
| protocolType | Requerido | String | Body | Protocolo de transporte: `HTTP` o `HTTPS`. |
| addressingFormatType | Requerido | String | Body | Tipo de dirección: `ipaddress` o `hostname`. |
| ipAddress | Dependiente | String | Body | Dirección IP de escucha (cuando `addressingFormatType` es `ipaddress`). |
| hostName | Dependiente | String | Body | Nombre de dominio (cuando `addressingFormatType` es `hostname`). |
| portNo | Requerido | Integer | Body | Puerto de escucha del servidor. |

**Ejemplo de Solicitud:**

```json
{
  "HttpHostNotificationList": [
    {
      "HttpHostNotification": {
        "id": "2",
        "url": "/event/notification",
        "protocolType": "HTTP",
        "addressingFormatType": "ipaddress",
        "ipAddress": "10.21.84.48",
        "portNo": 80
      }
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.7.4 Eliminar servidor de escucha

`DELETE /ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>`

Elimina todos los servidores de escucha configurados en el dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Event/notification/httpHosts?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

### 5.8 Control de Acceso — Personas

Operaciones de gestión de personas (usuarios) en un dispositivo de control de acceso. Cada persona se identifica por su número de empleado (`employeeNo`).

> **Notas:**
> - Se pueden agregar hasta 30 personas en una sola solicitud de alta.
> - Al eliminar una persona se eliminan también la tarjeta, la huella y el rostro asociados. La eliminación se procesa de forma asíncrona; el dispositivo confirma el resultado a través de la interfaz de progreso de eliminación.

---

#### 5.8.1 Agregar persona

`POST /ISAPI/AccessControl/UserInfo/Record?format=json&devIndex=<uuid>`

Agrega una o varias personas al dispositivo de control de acceso.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| employeeNo | Requerido | String | Body | Número de empleado (ID de la persona). |
| name | Opcional | String | Body | Nombre de la persona. |
| Valid.beginTime | Requerido | String | Body | Inicio del periodo de validez (p. ej. `2017-01-01T00:00:00`). |
| Valid.endTime | Requerido | String | Body | Fin del periodo de validez (máx. `2037-12-31T23:59:59`). |

**Ejemplo de Solicitud:**

```json
{
  "UserInfo": [
    {
      "employeeNo": "123456",
      "name": "test",
      "Valid": {
        "beginTime": "2017-01-01T00:00:00",
        "endTime": "2027-12-31T23:59:59"
      }
    }
  ]
}
```

**Ejemplo de Respuesta:**

```json
{
  "UserInfoOutList": {
    "UserInfoOut": [
      {
        "employeeNo": "123456",
        "statusCode": 1,
        "statusString": "OK",
        "subStatusCode": "ok",
        "errorCode": 1,
        "errorMsg": "ok"
      }
    ]
  }
}
```

---

#### 5.8.2 Eliminar persona

`PUT /ISAPI/AccessControl/UserInfoDetail/Delete?format=json&devIndex=<uuid>`

Elimina una o varias personas y sus permisos asociados del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| mode | Requerido | String | Body | Modo de eliminación: `all` (eliminar todas) o `byEmployeeNo` (por número de empleado). |
| EmployeeNoList[].employeeNo | Dependiente | String | Body | Número de empleado a eliminar (válido cuando `mode` es `byEmployeeNo`). |

**Ejemplo de Solicitud:**

```json
{
  "UserInfoDetail": {
    "mode": "byEmployeeNo",
    "EmployeeNoList": [
      { "employeeNo": "123456" }
    ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/UserInfoDetail/Delete?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.8.3 Editar persona

`PUT /ISAPI/AccessControl/UserInfo/Modify?format=json&devIndex=<uuid>`

Modifica la información de una persona existente, identificada por su número de empleado.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| employeeNo | Requerido | String | Body | Número de empleado (ID de la persona) a modificar. |
| name | Opcional | String | Body | Nombre de la persona. |
| Valid.beginTime | Opcional | String | Body | Inicio del periodo de validez. |
| Valid.endTime | Opcional | String | Body | Fin del periodo de validez. |

**Ejemplo de Solicitud:**

```json
{
  "UserInfo": {
    "employeeNo": "123456",
    "name": "test",
    "Valid": {
      "beginTime": "2017-08-01T17:30:08",
      "endTime": "2027-08-01T17:30:08"
    }
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/UserInfo/Modify?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.8.4 Buscar personas

`POST /ISAPI/AccessControl/UserInfo/Search?format=json&devIndex=<uuid>`

Busca los detalles de las personas registradas en el dispositivo. La búsqueda es paginada mediante `searchResultPosition` y `maxResults`.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| searchID | Requerido | String | Body | Identificador de búsqueda; permite al dispositivo detectar peticiones consecutivas del mismo solicitante y acelerar la siguiente búsqueda. |
| searchResultPosition | Requerido | Integer | Body | Posición final del resultado en la lista; permite continuar la paginación. |
| maxResults | Requerido | Integer | Body | Número máximo de resultados a devolver (limitado por la capacidad del dispositivo). |

**Ejemplo de Solicitud:**

```json
{
  "UserInfoSearchCond": {
    "searchID": "C7E71364-4560-0001-6EDD-16ED17B01CCD",
    "searchResultPosition": 0,
    "maxResults": 30
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "UserInfoSearch": {
    "searchID": "C7E71364-4560-0001-6EDD-16ED17B01CCD",
    "responseStatusStrg": "OK",
    "numOfMatches": 1,
    "totalMatches": 1,
    "UserInfo": [
      {
        "employeeNo": "123456",
        "name": "test",
        "userType": "normal",
        "Valid": {
          "enable": true,
          "beginTime": "2017-01-01T00:00:00",
          "endTime": "2027-12-31T23:59:59",
          "timeType": "local"
        },
        "doorRight": "1",
        "RightPlan": [
          { "doorNo": 1, "planTemplateNo": "1" }
        ]
      }
    ]
  }
}
```

> **Notas:** El campo `responseStatusStrg` indica el estado de la búsqueda: `OK` (búsqueda finalizada), `MORE` (aún hay resultados; repita la consulta avanzando `searchResultPosition`) o `NO MATCH` (sin coincidencias).

---

### 5.9 Control de Acceso — Rostro

Operaciones para asociar y eliminar el registro de rostro (face) de una persona.

---

#### 5.9.1 Agregar registro de rostro

`POST /ISAPI/Intelligent/FDLib/FaceDataRecord?format=json&devIndex=<uuid>`

Agrega el registro de rostro de una persona cargando la imagen en datos binarios. Esta operación se envía como **multipart** (`withAttachment=true`): el cuerpo se compone de dos partes, una parte JSON con la información del rostro (`FaceInfo`) y una parte binaria con la imagen JPEG.

El encabezado debe declarar `Content-Type: multipart/form-data; boundary=...`. La primera parte se nombra `FaceDataRecord` con `Content-Type: application/json` y contiene el JSON; la segunda parte se nombra `FaceImage` con `Content-Type: image/jpeg` y contiene los datos binarios de la imagen.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| Content-Type | Requerido | String | Header | `multipart/form-data; boundary=<límite>`. |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| employeeNo | Requerido | String | Body (parte JSON) | Número de empleado (ID de la persona) al que se asocia el rostro. |
| faceLibType | Opcional | String | Body (parte JSON) | Tipo de biblioteca: `blackFD` (lista de bloqueo, por omisión), `infraredFD` o `staticFD`. |
| FaceImage | Requerido | Binary | Body (parte binaria) | Imagen del rostro en formato JPEG. |

**Ejemplo de Solicitud:**

Parte JSON (`FaceDataRecord`):

```json
{
  "FaceInfo": {
    "employeeNo": "123456"
  }
}
```

Parte binaria (`FaceImage`): contenido binario de la imagen JPEG del rostro.

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Intelligent/FDLib/FaceDataRecord?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.9.2 Eliminar registro de rostro

`PUT /ISAPI/Intelligent/FDLib/FDSearch/Delete?format=json&devIndex=<uuid>`

Elimina el registro de rostro de una o varias personas. Admite eliminación por lotes.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| faceLibType | Opcional | String | Body | Tipo de biblioteca: `blackFD` (por omisión), `infraredFD` o `staticFD`. |
| EmployeeNoList[].employeeNo | Requerido | String | Body | Número de empleado cuyo rostro se eliminará. |

**Ejemplo de Solicitud:**

```json
{
  "FaceInfoDelCond": {
    "EmployeeNoList": [
      { "employeeNo": "123456" }
    ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Intelligent/FDLib/FDSearch/Delete?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

### 5.10 Control de Acceso — Tarjeta

Operaciones para asociar y eliminar tarjetas (cards) de las personas.

> **Notas:** El número de empleado y el número de tarjeta no pueden editarse. Para cambiar el número de tarjeta, elimine la tarjeta y agréguela de nuevo.

---

#### 5.10.1 Agregar tarjeta

`POST /ISAPI/AccessControl/CardInfo/Record?format=json&devIndex=<uuid>`

Asocia una tarjeta a una persona existente.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| employeeNo | Requerido | String | Body | Número de empleado (ID de la persona) al que se asocia la tarjeta. |
| cardNo | Requerido | String | Body | Número de tarjeta. |
| cardType | Opcional | String | Body | Tipo de tarjeta: `normalCard` (por omisión), `patrolCard`, `hijackCard`, `superCard`, `dismissingCard` o `emergencyCard`. |

**Ejemplo de Solicitud:**

```json
{
  "CardInfo": {
    "employeeNo": "123456",
    "cardNo": "1234567890"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/CardInfo/Record?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.10.2 Eliminar tarjeta

`PUT /ISAPI/AccessControl/CardInfo/Delete?format=json&devIndex=<uuid>`

Elimina una o varias tarjetas. Se puede filtrar por número de empleado o por número de tarjeta; ambos filtros son mutuamente excluyentes. Si no se indica ninguno, se eliminan todas las tarjetas.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| CardNoList[].cardNo | Opcional | String | Body | Número de tarjeta a eliminar. |
| EmployeeNoList[].employeeNo | Opcional | String | Body | Número de empleado cuyas tarjetas se eliminarán (excluyente con `CardNoList`). |

**Ejemplo de Solicitud:**

```json
{
  "CardInfoDelCond": {
    "CardNoList": [
      { "cardNo": "1234567890" }
    ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/CardInfo/Delete?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

### 5.11 Control de Acceso — Huella

Operaciones para capturar, registrar y eliminar huellas dactilares (fingerprints).

> **Notas:** El número de huella (`fingerNo` / `fingerPrintID`) toma valores entre 1 y 10. Los datos de huella (`fingerData`) se transmiten codificados en Base64.

---

#### 5.11.1 Capturar huella

`POST /ISAPI/AccessControl/CaptureFingerPrint?format=json&devIndex=<uuid>`

Ordena al dispositivo capturar (leer) una huella desde su lector y devuelve los datos capturados junto con su calidad. Este flujo suele usarse para obtener los datos de huella que luego se registran en una persona.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| fingerNo | Requerido | Integer | Body | Número de dedo a capturar. |

**Ejemplo de Solicitud:**

```json
{
  "CaptureFingerPrintCond": {
    "fingerNo": 1
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "CaptureFingerPrint": {
    "fingerData": "MzAxIC1dFWjIc3D9Fiis…",
    "fingerNo": 1,
    "fingerPrintQuality": 82
  }
}
```

> **Notas:** El campo `fingerData` es una cadena Base64 extensa; en este ejemplo se ha truncado con «…».

---

#### 5.11.2 Registrar huella

`POST /ISAPI/AccessControl/FingerPrintDownload?format=json&devIndex=<uuid>`

Aplica (registra) los parámetros de huella en una persona, enviando los datos de huella al dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| employeeNo | Requerido | String | Body | Número de empleado (ID de la persona) asociado a la huella. |
| fingerPrintID | Requerido | Integer | Body | Número de dedo (entre 1 y 10). |
| fingerData | Requerido | String | Body | Datos de huella codificados en Base64. |
| enableCardReader | Opcional | Array | Body | Lista de lectores a los que aplicar la huella (p. ej. `[1,3,5]`; por omisión `[1]`). |
| fingerType | Opcional | String | Body | Tipo de huella: `normalFP` (por omisión), `hijackFP`, `patrolFP`, `superFP` o `dismissingFP`. |

**Ejemplo de Solicitud:**

```json
{
  "FingerPrintCfg": {
    "employeeNo": "123456",
    "fingerPrintID": 1,
    "fingerData": "MzAxJCvpJFiId03BFFiIb0LZJTiID1Vt…"
  }
}
```

> **Notas:** El campo `fingerData` del ejemplo se ha truncado con «…»; en la solicitud real debe enviarse la cadena Base64 completa.

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/FingerPrintDownload?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

> **Notas:** La respuesta `ResponseStatus` con estado `OK` no significa que los parámetros de huella ya se hayan aplicado. Debe consultar la interfaz de progreso de aplicación de huella para verificar el estado real.

---

#### 5.11.3 Eliminar huella

`PUT /ISAPI/AccessControl/FingerPrint/Delete?format=json&devIndex=<uuid>`

Elimina una o varias huellas de una persona.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| EmployeeNoDetail.employeeNo | Requerido | String | Body | Número de empleado (ID de la persona) asociado a las huellas. |
| EmployeeNoDetail.fingerPrintID | Requerido | Array | Body | Lista de números de dedo a eliminar (p. ej. `[1,2,3]`). |

**Ejemplo de Solicitud:**

```json
{
  "FingerPrintDelete": {
    "EmployeeNoDetail": {
      "employeeNo": "123456",
      "fingerPrintID": [1, 2, 3]
    }
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/FingerPrint/Delete?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

### 5.12 Control de Acceso — Eventos

Consulta del historial de eventos de control de acceso registrados en el dispositivo.

---

#### 5.12.1 Buscar eventos históricos

`POST /ISAPI/AccessControl/AcsEvent?format=json&devIndex=<uuid>`

Busca eventos históricos de control de acceso. La búsqueda es paginada y admite filtros por tipo de evento (`major`/`minor`) y rango de tiempo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| searchID | Requerido | String | Body | Identificador de búsqueda; permite acelerar consultas consecutivas del mismo solicitante. |
| searchResultPosition | Requerido | Integer | Body | Posición final del resultado en la lista; permite continuar la paginación. |
| maxResults | Requerido | Integer | Body | Número máximo de resultados a devolver. |
| major | Opcional | Integer | Body | Tipo principal de evento (`0` = todos, por omisión). |
| minor | Opcional | Integer | Body | Subtipo de evento (`0` = todos, por omisión). |
| startTime | Opcional | String | Body | Hora de inicio del rango (UTC), p. ej. `2023-01-13T01:00:00-07:00`. |
| endTime | Opcional | String | Body | Hora de fin del rango (UTC). |

**Ejemplo de Solicitud:**

```json
{
  "AcsEventCond": {
    "searchID": "123",
    "searchResultPosition": 0,
    "maxResults": 30
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "AcsEvent": {
    "searchID": "123",
    "responseStatusStrg": "OK",
    "numOfMatches": 1,
    "totalMatches": 1,
    "deviceSerial": "D39983214",
    "MatchList": [
      {
        "major": 5,
        "minor": 75,
        "time": "2023-01-13T09:30:08+08:00",
        "cardNo": "1234567890",
        "cardReaderNo": 1,
        "doorNo": 1,
        "employeeNoString": "123456"
      }
    ]
  }
}
```

> **Notas:** El campo `responseStatusStrg` indica el estado de la búsqueda (`OK`, `MORE` o `NO MATCH`). El nodo `MatchList` solo se devuelve cuando `totalMatches` es mayor que 0. Los valores de `major` y `minor` corresponden a los tipos principal y secundario de eventos de control de acceso.

---

### 5.13 Control de Acceso — Control de Puerta

Control remoto de las puertas (relé) del dispositivo de acceso.

---

#### 5.13.1 Controlar puerta remotamente

`PUT /ISAPI/AccessControl/RemoteControl/door/<ID>?format=json&devIndex=<uuid>`

Ejecuta remotamente una acción sobre una puerta (relé) del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | Integer | Ruta | Número de puerta (entre 1 y 65535; el valor 65535 aplica a todas las puertas). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| cmd | Requerido | String | Body | Comando a ejecutar sobre la puerta. |

Valores admitidos para `cmd`:

| Valor | Descripción |
|-------|-------------|
| `open` | Abrir la puerta. |
| `close` | Cerrar la puerta (bajo control). |
| `alwaysOpen` | Mantener la puerta abierta (fuera de control). |
| `alwaysClose` | Mantener la puerta cerrada (fuera de control). |
| `visitorCallLadder` | Un visitante llama al elevador. |
| `householdCallLadder` | Un residente llama al elevador. |

**Ejemplo de Solicitud:**

```json
{
  "RemoteControlDoor": {
    "cmd": "open"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/RemoteControl/door/1?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

### 5.14 Control de Acceso — Parámetros de Puerta

Consulta y configuración de los parámetros de una puerta.

> **Notas:** El parámetro de ruta `<doorID>` corresponde al ID de la puerta y comienza desde 1.

---

#### 5.14.1 Obtener parámetros de puerta

`GET /ISAPI/AccessControl/Door/param/<doorID>?format=json&devIndex=<uuid>`

Obtiene los parámetros de una puerta.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| doorID | Requerido | Integer | Ruta | ID de la puerta (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "doorName": "test"
}
```

---

#### 5.14.2 Configurar parámetros de puerta

`PUT /ISAPI/AccessControl/Door/param/<doorID>?format=json&devIndex=<uuid>`

Configura los parámetros de una puerta.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| doorID | Requerido | Integer | Ruta | ID de la puerta (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| doorName | Opcional | String | Body | Nombre de la puerta. |

**Ejemplo de Solicitud:**

```json
{
  "doorName": "test"
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/Door/param/1?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

### 5.15 Control de Acceso — Programación de Permisos

Consulta y configuración de la programación de permisos de las personas: planes de días festivos, grupos de días festivos, planes semanales y plantillas de plan.

> **Notas:** Los identificadores de ruta (`<holidayPlanID>`, `<holidayGroupID>`, `<weekPlanID>`, `<planTemplateID>`) comienzan desde 1.

---

#### 5.15.1 Obtener plan de días festivos

`GET /ISAPI/AccessControl/UserRightHolidayPlanCfg/<holidayPlanID>?format=json&devIndex=<uuid>`

Obtiene la programación del plan de días festivos de permisos de una persona.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| holidayPlanID | Requerido | Integer | Ruta | Número del plan de días festivos (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "UserRightHolidayPlanCfg": {
    "enable": true,
    "beginDate": "2021-01-01",
    "endDate": "2023-01-01",
    "HolidayPlanCfg": [
      {
        "id": 1,
        "enable": true,
        "TimeSegment": {
          "beginTime": "00:00:00",
          "endTime": "23:59:59"
        }
      }
    ]
  }
}
```

---

#### 5.15.2 Configurar plan de días festivos

`PUT /ISAPI/AccessControl/UserRightHolidayPlanCfg/<holidayPlanID>?format=json&devIndex=<uuid>`

Configura la programación del plan de días festivos de permisos de una persona.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| holidayPlanID | Requerido | Integer | Ruta | Número del plan de días festivos (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| enable | Requerido | Boolean | Body | Habilitar el plan de días festivos. |
| beginDate | Requerido | String | Body | Fecha de inicio del periodo festivo (hora local del dispositivo). |
| endDate | Requerido | String | Body | Fecha de fin del periodo festivo (hora local del dispositivo). |
| HolidayPlanCfg[].id | Requerido | Integer | Body | Número del intervalo de tiempo (rango [1,8]). |
| HolidayPlanCfg[].enable | Requerido | Boolean | Body | Habilitar el intervalo de tiempo. |
| HolidayPlanCfg[].TimeSegment.beginTime | Requerido | String | Body | Hora de inicio del intervalo. |
| HolidayPlanCfg[].TimeSegment.endTime | Requerido | String | Body | Hora de fin del intervalo. |

**Ejemplo de Solicitud:**

```json
{
  "UserRightHolidayPlanCfg": {
    "enable": true,
    "beginDate": "2021-01-01",
    "endDate": "2023-01-01",
    "HolidayPlanCfg": [
      {
        "id": 1,
        "enable": true,
        "TimeSegment": {
          "beginTime": "00:00:00",
          "endTime": "23:59:59"
        }
      }
    ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/UserRightHolidayPlanCfg/1?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.15.3 Obtener grupo de días festivos

`GET /ISAPI/AccessControl/UserRightHolidayGroupCfg/<holidayGroupID>?format=json&devIndex=<uuid>`

Obtiene la configuración del grupo de días festivos de permisos de una persona.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| holidayGroupID | Requerido | Integer | Ruta | Número del grupo de días festivos (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "UserRightHolidayGroupCfg": {
    "enable": true,
    "groupName": "test",
    "holidayPlanNo": "1,3,5"
  }
}
```

---

#### 5.15.4 Configurar grupo de días festivos

`PUT /ISAPI/AccessControl/UserRightHolidayGroupCfg/<holidayGroupID>?format=json&devIndex=<uuid>`

Configura el grupo de días festivos de permisos de una persona.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| holidayGroupID | Requerido | Integer | Ruta | Número del grupo de días festivos (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| enable | Requerido | Boolean | Body | Habilitar el grupo de días festivos. |
| groupName | Requerido | String | Body | Nombre del grupo de días festivos. |
| holidayPlanNo | Requerido | String | Body | Números de planes de días festivos del grupo (p. ej. `1,3,5`); puede ir vacío. |

**Ejemplo de Solicitud:**

```json
{
  "UserRightHolidayGroupCfg": {
    "enable": true,
    "groupName": "test",
    "holidayPlanNo": "1,3,5"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/UserRightHolidayGroupCfg/1?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.15.5 Obtener plan semanal

`GET /ISAPI/AccessControl/UserRightWeekPlanCfg/<weekPlanID>?format=json&devIndex=<uuid>`

Obtiene la programación del plan semanal de permisos de una persona.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| weekPlanID | Requerido | Integer | Ruta | Número del plan semanal (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "UserRightWeekPlanCfg": {
    "enable": true,
    "WeekPlanCfg": [
      {
        "week": "Monday",
        "id": 1,
        "enable": true,
        "TimeSegment": {
          "beginTime": "10:10:00",
          "endTime": "12:10:00"
        }
      }
    ]
  }
}
```

---

#### 5.15.6 Configurar plan semanal

`PUT /ISAPI/AccessControl/UserRightWeekPlanCfg/<weekPlanID>?format=json&devIndex=<uuid>`

Configura la programación del plan semanal de permisos de una persona.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| weekPlanID | Requerido | Integer | Ruta | Número del plan semanal (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| enable | Requerido | Boolean | Body | Habilitar el plan semanal. |
| WeekPlanCfg[].week | Requerido | String | Body | Día de la semana: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday` o `Sunday`. |
| WeekPlanCfg[].id | Requerido | Integer | Body | Número del intervalo de tiempo (rango [1,8]). |
| WeekPlanCfg[].enable | Requerido | Boolean | Body | Habilitar el intervalo de tiempo. |
| WeekPlanCfg[].TimeSegment.beginTime | Requerido | String | Body | Hora de inicio del intervalo. |
| WeekPlanCfg[].TimeSegment.endTime | Requerido | String | Body | Hora de fin del intervalo. |

**Ejemplo de Solicitud:**

```json
{
  "UserRightWeekPlanCfg": {
    "enable": true,
    "WeekPlanCfg": [
      {
        "week": "Monday",
        "id": 1,
        "enable": true,
        "TimeSegment": {
          "beginTime": "10:10:00",
          "endTime": "12:10:00"
        }
      }
    ]
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/UserRightWeekPlanCfg/1?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.15.7 Obtener plantilla de plan

`GET /ISAPI/AccessControl/UserRightPlanTemplate/<planTemplateID>?format=json&devIndex=<uuid>`

Obtiene la plantilla de plan de permisos de una persona.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| planTemplateID | Requerido | Integer | Ruta | Número de la plantilla de plan (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "UserRightPlanTemplate": {
    "enable": true,
    "templateName": "test",
    "weekPlanNo": 1,
    "holidayGroupNo": "1,3,5"
  }
}
```

---

#### 5.15.8 Configurar plantilla de plan

`PUT /ISAPI/AccessControl/UserRightPlanTemplate/<planTemplateID>?format=json&devIndex=<uuid>`

Configura la plantilla de plan de permisos de una persona, combinando un plan semanal y un grupo de días festivos.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| planTemplateID | Requerido | Integer | Ruta | Número de la plantilla de plan (comienza desde 1). |
| devIndex | Requerido | String | Query | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| enable | Requerido | Boolean | Body | Habilitar la plantilla de plan. |
| templateName | Requerido | String | Body | Nombre de la plantilla. |
| weekPlanNo | Requerido | Integer | Body | Número del plan semanal asociado. |
| holidayGroupNo | Requerido | String | Body | Números de grupos de días festivos asociados (p. ej. `1,3,5`); puede ir vacío. |

**Ejemplo de Solicitud:**

```json
{
  "UserRightPlanTemplate": {
    "enable": true,
    "templateName": "test",
    "weekPlanNo": 1,
    "holidayGroupNo": "1,3,5"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/AccessControl/UserRightPlanTemplate/1?format=json&devIndex=<uuid>",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

### 5.16 Suscripción a Alarmas y Eventos

Estas operaciones habilitan y gestionan la suscripción a las alarmas y eventos que HikGateway recibe de los dispositivos. A diferencia de los servidores de escucha (sección 5.7), la suscripción se gestiona a nivel del propio gateway y las notificaciones se entregan de forma continua.

> **Notas:**
> - Cuando `eventMode` es `all`, HikGateway se suscribe a los eventos y alarmas de todos los dispositivos agregados; los dispositivos que se agreguen posteriormente quedan suscritos de forma automática, sin ninguna operación adicional. En este modo no se admite la suscripción a un único dispositivo.
> - En estos endpoints el `<uuid>` del dispositivo viaja como segmento de la ruta (`/devIndex/<uuid>`), no como parámetro de consulta.
> - El `<ID>` de la ruta es el identificador de suscripción devuelto por el dispositivo o el gateway.

---

#### 5.16.1 Suscribirse a eventos

`POST /ISAPI/Event/notification/subscribeDeviceMgmt?format=json`

Habilita la suscripción a alarmas y eventos. El modo `all` suscribe todos los dispositivos; el modo `device` suscribe únicamente los dispositivos indicados en `DevEventList`.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| eventMode | Requerido | String | Body | Modo de armado: `all` (armar todos los dispositivos agregados) o `device` (armar dispositivos específicos). |
| defenceMode | Dependiente | String | Body | Modo de defensa; use `all` para suscribir todos los eventos (aplica cuando `eventMode` es `all`). |
| DevEventList[].Dev.devIndex | Dependiente | String | Body | UUID del dispositivo a suscribir (aplica cuando `eventMode` es `device`). |
| DevEventList[].Dev.uploadMode | Dependiente | String | Body | Modo de armado del dispositivo; use `all` para suscribir todos sus eventos. |

**Ejemplo de Solicitud:**

```json
{
  "SubscribeDeviceMgmt": {
    "eventMode": "all",
    "defenceMode": "all"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "SubscribeDeviceMgmtRsp": {
    "id": "1"
  }
}
```

> **Notas:** Además de `SubscribeDeviceMgmtRsp` (que contiene el `id` de suscripción), el gateway carga de forma repetida los mensajes de notificación de alarma/evento y de latido (heartbeat) mientras la suscripción está activa.

---

#### 5.16.2 Suscribirse (dispositivo específico)

`POST /ISAPI/Event/notification/subscribeDeviceMgmt/<ID>/devIndex/<uuid>?format=json`

Agrega los tipos de alarma/evento de un dispositivo específico a los que se desea suscribir. Mediante `GET` sobre la misma ruta se pueden consultar los tipos ya suscritos del dispositivo.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador de suscripción. |
| uuid | Requerido | String | Ruta | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |
| devIndex | Requerido | String | Body | UUID del dispositivo. |
| uploadMode | Requerido | String | Body | Modo de armado del dispositivo; use `all` para suscribir todos sus eventos. |

**Ejemplo de Solicitud:**

```json
{
  "SubscribeDevEvent": {
    "devIndex": "2cd6716d-767f-4756-ac55-50276a5e3b4a",
    "uploadMode": "all"
  }
}
```

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Event/notification/subscribeDeviceMgmt/<ID>/devIndex/<uuid>?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.16.3 Consultar estado de suscripción

`GET /ISAPI/Event/notification/subscribeDeviceMgmt/<ID>/queryStatus?format=json`

Consulta el estado de la suscripción a alarmas y eventos.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador de suscripción. |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "SubscribeQueryStatusList": [
    {
      "Dev": {
        "devIndex": "2cd6716d-767f-4756-ac55-50276a5e3b4a",
        "status": "continue"
      }
    }
  ]
}
```

> **Notas:** El campo `status` indica el estado de armado de cada dispositivo: `continue` (conectado), `abnormalLink` (excepción de conexión) o `fail` (suscripción fallida).

---

#### 5.16.4 Cancelar suscripción (dispositivo)

`DELETE /ISAPI/Event/notification/unSubscribeDeviceMgmt/<ID>/devIndex/<uuid>?format=json`

Cancela la suscripción a los tipos de alarma/evento de un dispositivo específico.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador de suscripción devuelto por el dispositivo. |
| uuid | Requerido | String | Ruta | UUID del dispositivo destino (de deviceList). |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Event/notification/unSubscribeDeviceMgmt/<ID>/devIndex/<uuid>?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

#### 5.16.5 Cancelar suscripción

`DELETE /ISAPI/Event/notification/unSubscribeDeviceMgmt/<ID>?format=json`

Deshabilita por completo la suscripción a alarmas y eventos.

**Parámetros de Solicitud:**

| Parámetro | Requerido | Tipo | Ubicación | Descripción |
|-----------|-----------|------|-----------|-------------|
| Authorization | Requerido | String | Header | Credenciales HTTP Digest (ver Capítulo 3). |
| ID | Requerido | String | Ruta | Identificador de suscripción devuelto por el gateway. |
| format | Opcional | String | Query | Formato de datos; use `json`. |

**Ejemplo de Solicitud:**

Esta solicitud no lleva cuerpo.

**Ejemplo de Respuesta:**

```json
{
  "ResponseStatus": {
    "requestURL": "/ISAPI/Event/notification/unSubscribeDeviceMgmt/<ID>?format=json",
    "statusCode": 1,
    "statusString": "OK",
    "subStatusCode": "ok"
  }
}
```

---

## Apéndice A — Apéndices

Los diccionarios de datos (enumeraciones), la descripción de los objetos JSON y los códigos de estado y error se documentan en un archivo aparte para mantener esta referencia legible:

**[APENDICE-A.md](APENDICE-A.md)** · **[HISTORIAL-ACTUALIZACIONES.md](HISTORIAL-ACTUALIZACIONES.md)**
