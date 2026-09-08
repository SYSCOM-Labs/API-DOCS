# TrackSolid Pro — Open API de rastreo GPS y gestión de flotas

> Versión del documento: V1.0 — Septiembre 2026
> Producto: TrackSolid Pro (plataforma de rastreo GPS y gestión de flotas de Shenzhen Jimi Software Co., Ltd.)
> Basado en: *Open API Specification V2.7.14* (Shenzhen Jimi Software Co., Ltd.)

---

## Información Legal

- Esta es una **guía de referencia e integración**. Muestra cómo conectar una plataforma de terceros (distribuidor, CRM, ERP o una aplicación propia) con **TrackSolid Pro** usando su Open API para administrar cuentas, dispositivos GPS, ubicación, recorridos, reportes, geocercas, comandos remotos, multimedia y alarmas.
- **Todos los valores del documento son ficticios** — `appKey`, `appSecret`, tokens, cuentas, IMEI, coordenadas y URLs sirven únicamente para ilustrar el formato de las peticiones. Adáptalos a tu propia cuenta e instalación.
- El esquema de firma, los nombres exactos de parámetros y los comportamientos varían según la **versión de la API y el nodo regional de tu cuenta**. Para valores y comportamientos definitivos, **consulta siempre el manual oficial (*Open API Specification*) que corresponda a tu versión** (disponible en [docs/](./docs/tracksolidpro-api-v2.7.14.pdf)).
- El producto se proporciona "TAL CUAL". En ningún caso Shenzhen Jimi Software Co., Ltd. ni SYSCOM serán responsables de daños especiales, consecuentes, incidentales o indirectos derivados del uso de esta documentación.

---

## Tabla de Contenidos

- [Capítulo 1 — Descripción General](#capítulo-1--descripción-general)
- [Capítulo 2 — Conceptos Clave](#capítulo-2--conceptos-clave)
- [Capítulo 3 — Conexión y Autenticación](#capítulo-3--conexión-y-autenticación)
- [Capítulo 4 — Referencia de API](#capítulo-4--referencia-de-api)
  - [4.1 Autenticación](#41-autenticación)
  - [4.2 Cuentas (subcuentas)](#42-cuentas-subcuentas)
  - [4.3 Dispositivos y grupos](#43-dispositivos-y-grupos)
  - [4.4 Ubicación y recorridos](#44-ubicación-y-recorridos)
  - [4.5 Reportes](#45-reportes)
  - [4.6 Geocercas](#46-geocercas)
  - [4.7 Comandos](#47-comandos)
  - [4.8 Multimedia y video](#48-multimedia-y-video)
  - [4.9 Notificaciones push (servidor a servidor)](#49-notificaciones-push-servidor-a-servidor)
  - [4.10 Interfaces deprecadas](#410-interfaces-deprecadas)
- [Capítulo 5 — Formato de Respuesta y Códigos](#capítulo-5--formato-de-respuesta-y-códigos)
- [Capítulo 6 — Ejemplo Completo End-to-End](#capítulo-6--ejemplo-completo-end-to-end)
- [Capítulo 7 — Buenas Prácticas](#capítulo-7--buenas-prácticas)
- [Capítulo 8 — Solución de Problemas](#capítulo-8--solución-de-problemas)
- [Capítulo 9 — Checklist de Integración](#capítulo-9--checklist-de-integración)
- [Apéndice A — Diccionarios de Datos](./APENDICE-A.md)
- [Historial de Actualizaciones](./HISTORIAL-ACTUALIZACIONES.md)

---

## Capítulo 1 — Descripción General

### 1.1 ¿Qué es y para qué sirve?

**TrackSolid Pro** es la plataforma de rastreo GPS y gestión de flotas de Shenzhen Jimi Software Co., Ltd. (JIMI). Administra localizadores GPS vehiculares, personales, de mascotas, cámaras DVR móviles, dispositivos OBD y etiquetas (TAG), con ubicación en tiempo real, historial de recorridos, geocercas, reportes de conducción, video en vivo y alarmas.

La **Open API de TrackSolid Pro** expone esas mismas capacidades para que un distribuidor o integrador ofrezca el servicio de rastreo con su **propia aplicación, portal web o GUI**, sin usar la interfaz web de TrackSolid Pro. Esto mejora la localización y la experiencia de usuario final.

### 1.2 Capacidades de la API

La API te permite, entre otras cosas:

- Gestionar la **jerarquía de cuentas**: listar, crear, eliminar, mover y editar subcuentas, y vincular/desvincular usuarios de la app móvil.
- Administrar **dispositivos**: listar por cuenta, consultar detalle, actualizar datos del vehículo, habilitar/deshabilitar, transferir entre cuentas y organizar en **grupos de dispositivos**.
- Consultar **ubicación en tiempo real** de uno o varios dispositivos, obtener **URL pública para compartir ubicación** y resolver direcciones por **LBS/WiFi**.
- Recuperar **recorridos históricos** (tracks) y reportes: kilometraje, viajes, estacionamiento/ralentí, entradas/salidas de geocerca, RFID, datos **OBD** y fallas OBD.
- Crear y administrar **geocercas** (por dispositivo y de plataforma) y asociarlas a dispositivos con distintos tipos de alarma.
- Enviar **comandos remotos** al dispositivo (plantillas o datos crudos en hexadecimal) y consultar su resultado.
- Acceder a **multimedia y video**: fotos/videos capturados por cámara, página de video en vivo, lista de videos históricos y URL **RTMP** de streaming.
- Recibir **notificaciones push de alarmas** y datos crudos en tu propio servidor (servidor a servidor).

### 1.3 Modelo de integración

La integración es **petición HTTP POST sobre un endpoint único** con parámetros form-urlencoded/JSON. El flujo es:

1. **Autenticarse** con `user_id` + `user_pwd_md5` (método `jimi.oauth.token.get`) para obtener un `accessToken` y un `refreshToken`.
2. **Firmar cada llamada** con MD5 usando tu `appSecret` (cuando `v=1.0`).
3. **Incluir `access_token`** como parámetro en cada llamada posterior.
4. **Renovar el token** con `jimi.oauth.token.refresh` antes de que expire (60–7200 s según `expires_in`).

```
 ┌─────────────────┐   1. POST jimi.oauth.token.get          ┌──────────────────┐
 │  Tu servidor de │ ───────────────────────────────────────►│  TrackSolid Pro  │
 │  aplicaciones   │ ◄─────────────────────────────────────── │  (nodo regional) │
 │  (distribuidor) │   2. accessToken → llamadas firmadas    │  /route/rest     │
 └─────────────────┘                                          └──────────────────┘
```

> **Notas:**
> - Tu app o cliente web debe conectarse a **tu propio servidor de aplicaciones**, nunca directamente al servidor de la API: es tu servidor el que se conecta al servidor de TrackSolid Pro/JIMI.
> - El `accessToken` debe **almacenarse localmente y reutilizarse** mientras siga vigente. No solicites un token por cada petición: el servidor rechaza clientes con frecuencia de solicitud demasiado alta.

---

## Capítulo 2 — Conceptos Clave

| Concepto | Identificador | Descripción |
| -------- | ------------- | ----------- |
| **Credenciales de aplicación** | `appKey` / `appSecret` | Las emite JIMI al darte de alta como integrador. El `appSecret` es sensible: nunca lo expongas en clientes. |
| **Cuenta de plataforma** | `user_id` / `account` | Cuenta de TrackSolid Pro asociada a la appKey. Se usa junto con su contraseña en MD5 (`user_pwd_md5`) para obtener el token. |
| **Token de acceso** | `accessToken` / `access_token` | Credencial temporal (60–7200 s) que autoriza cada llamada. Viaja como parámetro `access_token`. |
| **Token de refresco** | `refreshToken` / `refresh_token` | Permite renovar el `accessToken` sin volver a enviar usuario/contraseña. |
| **Firma** | `sign` | MD5 en mayúsculas calculado sobre los parámetros ordenados, envuelto con el `appSecret`. Obligatoria cuando `v=1.0`. |
| **Subcuenta** | `target` / `account_id` | Cuenta hija de tu cuenta de distribuidor. Las operaciones de dispositivos se hacen sobre subcuentas. |
| **Dispositivo** | `imei` | IMEI del localizador GPS. Es la clave de casi todas las consultas (ubicación, recorridos, comandos, medios). |
| **Grupo de dispositivos** | `deviceGroupId` / `group_id` | Agrupación lógica de dispositivos dentro de una cuenta. |
| **Geocerca** | `fence_id` | Cerca circular o poligonal. Hay dos familias: **por dispositivo** (se descargan al terminal) y **de plataforma** (se evalúan en la nube). |
| **Nodo regional** | URL base | Cada cuenta de Open API pertenece a un nodo: TS, TSP HK, TSP EU o TSP US. Debes llamar al nodo correcto. |

> **Nota:** consulta el diccionario completo de identificadores, enumeraciones y códigos en el [Apéndice A](./APENDICE-A.md).

---

## Capítulo 3 — Conexión y Autenticación

### 3.1 URL base (nodo regional)

Todas las llamadas se hacen por **HTTP POST** contra **una única URL** (`/route/rest`); la interfaz concreta se selecciona con el parámetro común `method`. Usa la URL del **nodo al que pertenece tu cuenta de Open API**:

| Nodo | URL base |
| ---- | -------- |
| TS | `http://open.10000track.com/route/rest` |
| TSP HK (Hong Kong) | `https://hk-open.tracksolidpro.com/route/rest` |
| TSP EU (Europa) | `https://eu-open.tracksolidpro.com/route/rest` |
| TSP US (Estados Unidos) | `https://us-open.tracksolidpro.com/route/rest` |

| Aspecto | Valor |
| ------- | ----- |
| Método HTTP | `POST` (todas las interfaces) |
| Codificación | UTF-8 |
| `Content-Type` | `application/json; charset=utf-8` por defecto |
| Formato de fechas | `yyyy-MM-dd HH:mm:ss` en **UTC (GMT+0)** |
| Formato de respuesta | JSON (parámetro `format`) |

> **Nota regional.** Si obtienes errores de usuario inexistente o de firma en un nodo, verifica primero que estás llamando al nodo correcto para tu cuenta. El nodo TS usa HTTP plano; los nodos TSP usan HTTPS.

### 3.2 Parámetros comunes

Toda petición combina **parámetros comunes** + **parámetros privados** de la interfaz. Por ejemplo, `jimi.oauth.token.get` lleva 7 comunes + 3 privados = 10 pares clave/valor.

| Parámetro | Tipo | Obligatorio | Descripción | Observación | Default |
| --------- | ---- | ----------- | ----------- | ----------- | ------- |
| `method` | string | Sí | Nombre de la interfaz (p. ej. `jimi.oauth.token.get`) | — | — |
| `timestamp` | string | Sí | Marca de tiempo `yyyy-MM-dd HH:mm:ss`. Se tolera ±10 minutos | Hora GMT (UTC) | — |
| `app_key` | string | Sí | appKey | Emitido por JIMI | — |
| `sign` | string | Sí | Firma basada en parámetros, appKey y appSecret | Ver §3.3 | — |
| `sign_method` | string | Sí* | Método de firma. Valor disponible: `md5` | Opcional | `md5` |
| `v` | string | Sí* | Versión de la API: `0.9` o `1.0`. Default del sistema: `1.0` | `0.9`: **no** verifica firma · `1.0`: verifica firma | `1.0` |
| `format` | string | Sí* | Formato de respuesta | Opcional | `json` |

> **Nota:** en la práctica, `sign_method`, `v` y `format` tienen valores por defecto y el fabricante los marca como opcionales; el parámetro `v` es el que decide si el servidor valida o no la firma `sign`:
> - `v=0.9` → **no** se verifica la firma (modo de pruebas).
> - `v=1.0` → **sí** se verifica la firma (modo recomendado y por defecto).

### 3.3 Firma de la petición (`sign`)

Para proteger las llamadas, toda petición (con `v=1.0`) debe incluir firma. El servidor de JIMI recalcula la firma con los mismos parámetros y rechaza las peticiones con firma inválida. Algoritmo soportado: **MD5** (`sign_method`).

**Procedimiento:**

1. **Ordena** todos los parámetros de la petición (comunes + privados) alfabéticamente por nombre de parámetro. **No** incluyas `sign` ni parámetros de tipo byte.

   ```
   foo=1, bar=2, foo_bar=3, foobar=4
   → bar=2, foo=1, foo_bar=3, foobar=4
   ```

2. **Concatena** nombre y valor de cada parámetro, sin signos `=` ni comas:

   ```
   bar2foo1foo_bar3foobar4
   ```

3. **Envuelve** la cadena con el `appSecret` al inicio y al final, y calcula el **MD5** de la cadena UTF-8 resultante:

   ```
   md5(appSecret + bar2foo1foo_bar3foobar4 + appSecret)
   ```

   Ejemplo real (cadena a firmar):

   ```
   md5(h9lri085eachcz4sn7gwnkh6j0jt0yz4bar2foo1foo_bar3foobar4h9lri085eachcz4sn7gwnkh6j0jt0yz4)
   ```

4. La firma resultante es una cadena de **32 caracteres hexadecimales en MAYÚSCULAS**.

> **Notas:**
> - La cadena debe estar en codificación **UTF-8**.
> - Si el valor de un parámetro es un flujo de bytes, conviértelo a hexadecimal antes de firmar (p. ej. `hex("helloworld") = "68656C6C6F776F726C64"`).
> - Ejemplo de cadena completa para `jimi.oauth.token.get` (parámetros ya ordenados, sin `=` ni comas, envuelta en el secreto):
>
>   ```
>   <appSecret>app_key9FB345B8693CCD0054E44ADF99139409expires_in7200formatjsonmethodjimi.oauth.token.getsign_methodmd5timestamp2017-09-28 01:55:00user_id<account>user_pwd_md5<password_md5>v1.0<appSecret>
>   ```

**Ejemplo de referencia en Java (del manual oficial):**

```java
public static String signTopRequest(Map<String, String> params, String seccode, String signMethod) throws IOException {
    // 1: ordenar por nombre de parámetro
    String[] keys = params.keySet().toArray(new String[0]);
    Arrays.sort(keys);

    // 2: concatenar nombre+valor de todos los parámetros
    StringBuilder query = new StringBuilder();
    if (Constants.SIGN_METHOD_MD5.equals(signMethod)) {
        query.append(seccode);
    }
    for (String key : keys) {
        String value = params.get(key);
        if (StringUtils.areNotEmpty(key, value)) {
            query.append(key).append(value);
        }
    }

    // 3: cifrar con MD5/HMAC
    byte[] bytes;
    if (Constants.SIGN_METHOD_HMAC.equals(signMethod)) {
        bytes = encryptHMAC(query.toString(), seccode);
    } else {
        query.append(seccode);
        bytes = encryptMD5(query.toString());
    }

    // 4: convertir a hexadecimal en mayúsculas
    return byte2hex(bytes);
}
```

### 3.4 Ciclo de vida del token

1. Obtén el token con `jimi.oauth.token.get` (§4.1.1). La respuesta incluye `accessToken`, `refreshToken`, `expiresIn` (segundos, 60–7200) y `time` (momento de generación).
2. **Guárdalo localmente** y reutilízalo en todas las llamadas hasta que esté próximo a expirar.
3. Renuévalo con `jimi.oauth.token.refresh` (§4.1.2) antes de que caduque; si caduca, vuelve al paso 1.

> **Advertencia:** el token puede usarse aproximadamente 2 horas (según `expires_in`). No solicites token en cada petición: el servidor limita a los clientes con frecuencia excesiva (error 1006).

---

## Capítulo 4 — Referencia de API

Todas las interfaces comparten:

- **URL:** la del nodo regional de tu cuenta (§3.1).
- **Método HTTP:** `POST`.
- **Parámetros comunes:** `method`, `timestamp`, `app_key`, `sign`, `sign_method`, `v`, `format` (§3.2).
- **Sobre los ejemplos:** los valores son ficticios y los mensajes de `message` se transcriben tal como aparecen en el manual oficial (algunos textos del fabricante son genéricos y no siempre describen la operación).

### 4.1 Autenticación

#### 4.1.1 Obtener token de acceso

Obtiene el `accessToken` inicial a partir de la cuenta de plataforma. **Guarda el token localmente y reutilízalo**: no solicites uno por petición.

| | |
| --- | --- |
| **method** | `jimi.oauth.token.get` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción | Observación |
| --------- | ---- | ----------- | ----------- | ----------- |
| `user_id` | string | Sí | ID de usuario (cuenta de TrackSolid) | — |
| `user_pwd_md5` | string | Sí | Contraseña del usuario en MD5 | MD5 en minúsculas |
| `expires_in` | number | Sí | Segundos de vigencia del token | Rango 60–7200 |

**Respuesta**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `code` | int | `0`: correcto. Otro valor: fallo (ver códigos de error) |
| `message` | string | Mensaje de error correspondiente cuando `code ≠ 0` |
| `result` | object | Resultado |

Objeto `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `accessToken` | string | Token de acceso, requerido por el resto de interfaces |
| `expiresIn` | string | Segundos de vigencia del token |
| `account` | string | Cuenta del usuario |
| `appKey` | string | appKey emitido por JIMI |
| `refreshToken` | string | Token de refresco, para renovar el `accessToken` |
| `time` | string | Momento de generación del token |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": {
    "appKey": "8FB345B8693CCD003CC2DAB61EC8791D",
    "account": "jimitest",
    "accessToken": "7da3330ec28e3996b6ef4a7e3390ba71",
    "expiresIn": 60,
    "refreshToken": "7da3330ec28e3996b6ef4a7e3390ba71",
    "time": "2017-06-15 10:00:00"
  }
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Incorrect user name or password"}
```

#### 4.1.2 Renovar token de acceso

Renueva manualmente el token cuando está próximo a expirar, sin reenviar usuario y contraseña.

| | |
| --- | --- |
| **method** | `jimi.oauth.token.refresh` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción | Observación |
| --------- | ---- | ----------- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso vigente | — |
| `refresh_token` | string | Sí | Token de refresco autorizado | — |
| `expires_in` | number | Sí | Segundos de vigencia del nuevo token | Rango 60–7200 |

**Respuesta:** misma estructura que §4.1.1 (`code`, `message`, `result` con `accessToken`, `expiresIn`, `account`, `appKey`, `refreshToken`, `time`).

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": {
    "appKey": "8FB345B8693CCD003CC2DAB61EC8791D",
    "account": "jimitest",
    "accessToken": "7da3330ec28e3996b6ef4a7e3390ba71",
    "expiresIn": 60,
    "refreshToken": "7da3330ec28e3996b6ef4a7e3390ba71",
    "time": "2017-06-15 10:00:00"
  }
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Illegal request，token is invalid"}
```

---

### 4.2 Cuentas (subcuentas)

#### 4.2.1 Listar todas las subcuentas

Lista todas las subcuentas de una cuenta especificada.

| | |
| --- | --- |
| **method** | `jimi.user.child.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `target` | string | Sí | Cuenta a consultar |

**Respuesta** — `result` es un arreglo de cuentas:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `account` | string | Cuenta de inicio de sesión |
| `name` | string | Nombre |
| `type` | int | Tipo de cuenta: `3` usuario de app · `8` distribuidor · `9` usuario ordinario · `10` distribuidor ordinario · `11` ventas |
| `displayFlag` | int | Disponible o no (`1`: disponible, `0`: no disponible) |
| `address` | string | Ubicación |
| `birth` | string | Fecha de nacimiento |
| `companyName` | string | Nombre de la empresa |
| `email` | string | Correo electrónico |
| `phone` | string | Teléfono de contacto |
| `language` | string | Idioma (`zh`, `en`) |
| `sex` | int | Género: `0` masculino, `1` femenino |
| `enabledFlag` | int | `1` disponible, `0` no disponible |
| `remark` | string | Observaciones |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "account": "123123",
      "name": "test",
      "type": 8,
      "displayFlag": 1,
      "address": null,
      "birth": "2017-04-22 00:00:00",
      "companyName": "",
      "email": "",
      "phone": "",
      "language": "zh",
      "sex": 0,
      "enabledFlag": 1,
      "remark": null
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "The account does not exist"}
```

#### 4.2.2 Crear subcuenta

Crea una subcuenta bajo una cuenta especificada.

| | |
| --- | --- |
| **method** | `jimi.user.child.create` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `super_account` | string | No | Cuenta padre. Si no se indica, se usa la cuenta de la API |
| `account_id` | string | Sí | ID de cuenta, 3–30 caracteres. Admite `a-Z`, `0-9` y los caracteres especiales `_@.` |
| `nick_name` | string | Sí | Apodo o nombre del cliente |
| `account_type` | int | Sí | `1` distribuidor · `2` usuario final · `3` ventas |
| `password` | string | Sí | Contraseña en MD5 |
| `telephone` | string | No | Teléfono |
| `Email` | string | Sí | Correo electrónico (para recuperar la contraseña) |
| `contact_person` | string | No | Persona de contacto |
| `company_name` | string | No | Nombre de la empresa |
| `permissions` | string | Sí | 6 dígitos (0/1) para 6 permisos, en este orden: Web Login, App Login, Send Command, Set Working Mode, Edit by Web, Edit by App. `0` deshabilita, `1` habilita. Ejemplo: `111000` |

**Respuesta:** `result` es `null` cuando la operación es correcta.

```json
{
  "code": 0,
  "message": "Vehicle information modification successful",
  "result": null
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "The account does not exist"}
```

#### 4.2.3 Eliminar subcuenta

Elimina una subcuenta de una cuenta especificada.

| | |
| --- | --- |
| **method** | `jimi.user.child.del` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `super_account` | string | No | Cuenta padre. Si no se indica, se usa la cuenta de la API |
| `account_id` | string | Sí | ID de cuenta, 3–30 caracteres (`a-Z`, `0-9`, `_@.`) |

**Respuesta:** `result` es `null` cuando la operación es correcta. Error típico: `{"code":"xxx","message":"no permissions"}`.

#### 4.2.4 Mover cuenta

Mueve una subcuenta bajo otra subcuenta.

| | |
| --- | --- |
| **method** | `jimi.user.child.move` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta que será movida |
| `target_account` | string | Sí | Cuenta destino |

**Respuesta:** `result` es `null` cuando la operación es correcta. Error típico: `{"code":"xxx","message":"no permissions"}`.

#### 4.2.5 Editar información de usuario

Edita la información de una cuenta de la plataforma: apodo, teléfono, correo, contacto, empresa y permisos.

| | |
| --- | --- |
| **method** | `jimi.user.child.update` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `edit_account` | string | Sí | Nombre de la cuenta a editar, 3–30 caracteres (`a-Z`, `0-9`, `_@.`) |
| `nick_name` | string | Sí | Apodo o nombre del cliente |
| `telephone` | string | No | Teléfono |
| `Email` | string | Sí | Correo electrónico (para recuperar la contraseña) |
| `contact_person` | string | No | Persona de contacto |
| `company_name` | string | No | Nombre de la empresa |
| `permissions` | string | Sí | 6 dígitos (0/1): Web Login, App Login, Send Command, Set Working Mode, Edit by Web, Edit by App |

**Respuesta correcta:**

```json
{
  "code": 0,
  "message": "Account update success!",
  "result": null,
  "data": null
}
```

#### 4.2.6 Vincular usuario de la app a un dispositivo

Vincula un dispositivo a una cuenta de usuario de la app móvil.

| | |
| --- | --- |
| **method** | `jimi.open.device.bind` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo a vincular *(en el manual original la descripción dice "cuenta a la que pertenecen las geocercas"; se transcribe el comportamiento real del parámetro)* |
| `user_id` | string | Sí | Cuenta de usuario de la app a vincular |

**Códigos de respuesta específicos**

| code | Descripción |
| ---- | ----------- |
| `0` | Correcto |
| `10` | El dispositivo ya está vinculado a un usuario |
| `1001` | Parámetros ilegales |
| `1002` | Usuario o dispositivo incorrecto (ver `message`) |
| `1100` | Excepción de negocio |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success"
}
```

#### 4.2.7 Desvincular usuario de la app

Desvincula un dispositivo de una cuenta de usuario de la app móvil.

| | |
| --- | --- |
| **method** | `jimi.open.device.unbind` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `user_id` | string | Sí | Cuenta de usuario de la app a desvincular |

**Códigos de respuesta específicos**

| code | Descripción |
| ---- | ----------- |
| `0` | Correcto |
| `10` | El dispositivo no está vinculado a este usuario; la desvinculación falló |
| `1001` | Parámetros ilegales |
| `1002` | Usuario o dispositivo incorrecto (ver `message`) |
| `1100` | Excepción de negocio |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success"
}
```

---

### 4.3 Dispositivos y grupos

#### 4.3.1 Listar todos los dispositivos de una subcuenta

Consulta todos los dispositivos de una cuenta especificada.

| | |
| --- | --- |
| **method** | `jimi.user.device.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `target` | string | Sí | Cuenta a consultar |

**Respuesta** — `result` es un arreglo de dispositivos:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `deviceName` | string | Nombre del dispositivo |
| `mcType` | string | Modelo del dispositivo |
| `mcTypeUseScope` | string | Ámbito de uso: automóvil, electromóvil, personal, mascota, avión, otros |
| `sim` | string | Número de tarjeta SIM |
| `expiration` | string | Fecha de expiración en la plataforma |
| `activationTime` | string | Fecha de activación |
| `reMark` | string | Observaciones |
| `vehicleName` | string | Nombre del vehículo |
| `vehicleIcon` | string | Ícono del vehículo (ver §4.3.5) |
| `vehicleNumber` | string | Placa del vehículo |
| `vehicleModels` | string | Marca |
| `carFrame` | string | VIN (número de chasis) |
| `driverName` | string | Nombre del conductor |
| `driverPhone` | string | Teléfono del conductor |
| `enabledFlag` | int | `1` disponible, `0` no disponible |
| `engineNumber` | string | Número de motor |
| `deviceGroupId` | string | ID del grupo de dispositivos |
| `deviceGroup` | string | Nombre del grupo de dispositivos |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "imei": "868120145233604",
      "deviceName": "868120145233604",
      "mcType": "GT300L",
      "mcTypeUseScope": "personal",
      "sim": "415451",
      "expiration": "2037-04-01 23:59:59",
      "activationTime": "2017-04-01 11:02:20",
      "reMark": "test",
      "vehicleName": null,
      "vehicleIcon": "bus",
      "vehicleNumber": "粤B3604",
      "vehicleModels": null,
      "carFrame": "2235",
      "driverName": "driver",
      "driverPhone": "13825036579",
      "enabledFlag": 1,
      "engineNumber": "8565674",
      "deviceGroupId": "b54ab3c430864e31a64e54de44c79a1d",
      "deviceGroup": "default group"
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Account queried doesn’t exist"}
```

#### 4.3.2 Obtener información detallada de un dispositivo

Obtiene el detalle de un dispositivo por IMEI.

| | |
| --- | --- |
| **method** | `jimi.track.device.detail` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI a consultar |

**Respuesta** — objeto `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `deviceName` | string | Nombre del dispositivo |
| `account` | string | Cuenta a la que pertenece el dispositivo |
| `customerName` | string | Nombre del cliente de la cuenta a la que pertenece el dispositivo |
| `mcType` | string | Modelo del dispositivo |
| `mcTypeUseScope` | string | automóvil, electromóvil, personal, mascota, avión, otros |
| `sim` | string | Número de tarjeta SIM |
| `expiration` | string | Fecha de expiración en la plataforma |
| `user_expiration` | string | Fecha de expiración por usuario. Formato: `account1,2019-01-01\|account2,2019-02-02` |
| `activationTime` | string | Fecha de activación |
| `reMark` | string | Observaciones |
| `vehicleName` | string | Nombre del vehículo |
| `vehicleIcon` | string | Ícono del vehículo |
| `vehicleNumber` | string | Placa |
| `vehicleModels` | string | Modelo del vehículo |
| `carFrame` | string | VIN |
| `driverName` | string | Nombre del conductor |
| `driverPhone` | string | Teléfono del conductor |
| `enabledFlag` | int | `1` disponible, `0` no disponible |
| `engineNumber` | string | Número de motor |
| `iccid` | string | ICCID de la SIM |
| `importTime` | string | Fecha de importación |
| `imsi` | string | IMSI |
| `licensePlatNo` | string | Número de placa |
| `vin` | string | Número de chasis (VIN) |
| `vehicleBrand` | string | Marca del vehículo |
| `fuel_100km` | string | Consumo de combustible por 100 km |
| `status` | string | `0` deshabilitado, `1` habilitado |
| `currentMileage` | string | Kilometraje actual del dispositivo (km) |
| `deviceGroupId` | string | ID del grupo de dispositivos |
| `deviceGroup` | string | Nombre del grupo de dispositivos |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": {
    "imei": "868120145233604",
    "deviceName": "868120145233604",
    "mcType": "GT300L",
    "mcTypeUseScope": "personal",
    "sim": "415451",
    "expiration": "2037-04-01 23:59:59",
    "activationTime": "2017-04-01 11:02:20",
    "reMark": "test",
    "vehicleName": null,
    "vehicleIcon": "bus",
    "vehicleNumber": "粤B3604",
    "vehicleModels": null,
    "carFrame": "2235",
    "driverName": "driver",
    "driverPhone": "13825036579",
    "enabledFlag": 1,
    "engineNumber": "8565674",
    "iccid": "xxxxxxx",
    "imsi": "xxxx",
    "importTime": "2017-04-01 11:02:20",
    "licensePlatNo": "8565674",
    "VIN": "xxxxxxx",
    "vehicleBrand": "xxxx",
    "fuel_100km": "9",
    "status": "8565674",
    "currentMileage": "102.5",
    "deviceGroupId": "b54ab3c430864e31a64e54de44c79a1d",
    "deviceGroup": "default group"
  }
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Account queried doesn’t exist"}
```

#### 4.3.3 Actualizar la fecha de expiración de usuario de dispositivos

Actualiza la fecha de expiración de usuario de uno o varios dispositivos.

| | |
| --- | --- |
| **method** | `jimi.user.device.expiration.update` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei_list` | string | Sí | Uno o varios IMEI de dispositivo |
| `new_expiration` | string | Sí | Nueva fecha de expiración de usuario para los dispositivos |

**Respuesta** — `result` es un arreglo con el resultado por IMEI:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `update_result` | string | `0` éxito, `1` fallo |
| `update_msg` | string | Información del resultado y causa del fallo |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "imei": "868120145233604",
      "update_result": "0",
      "update_msg": "update success"
    },
    {
      "imei": "868120145233605",
      "update_result": "1",
      "update_msg": "update failed, reason:xxxxxx"
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Illegal device"}
```

#### 4.3.4 Actualizar información del vehículo por IMEI

Actualiza los datos del vehículo/dispositivo. También permite habilitar o deshabilitar el dispositivo.

| | |
| --- | --- |
| **method** | `jimi.open.device.update` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `device_name` | string | No | Nombre del dispositivo |
| `vehicle_name` | string | No | Nombre del vehículo |
| `vehicle_icon` | string | No | Ícono del vehículo (ver §4.3.5) |
| `vehicle_number` | string | No | Placa del vehículo |
| `vehicle_models` | string | No | Marca del vehículo |
| `driver_name` | string | No | Nombre del conductor |
| `driver_phone` | string | No | Teléfono del conductor |
| `device_status` | string | No | `0` deshabilitar / `1` habilitar el dispositivo |
| `sim` | string | No | Número de tarjeta SIM |
| `remarks` | string | No | Observaciones |
| `oilWear` | string | No | Consumo de combustible por 100 km |
| `deviceGroupId` | string | No | ID del grupo de dispositivos |

**Respuesta correcta:**

```json
{
  "code": 0,
  "message": "Vehicle information modification successful",
  "result": null
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "imei doesn’t exists"}
```

#### 4.3.5 Íconos de vehículo

Valores válidos para `vehicle_icon` / `vehicleIcon`:

| Clave de ícono | Descripción |
| -------------- | ----------- |
| `automobile` | Automóvil |
| `bus` | Autobús |
| `per` | Persona |
| `mtc` | Motocicleta |
| `truck` | Camión |
| `taxi` | Taxi |
| `plane` | Avión |
| `schoolBus` | Autobús escolar |
| `excavator` | Excavadora |
| `ship` | Barco |
| `tricycle` | Triciclo |
| `policeMtc` | Motocicleta de policía |
| `tractor` | Tractor |
| `policeCar` | Patrulla |
| `cow` | Vaca (ganado) |
| `other` | Otro |

#### 4.3.6 Mover dispositivos entre cuentas

Transfiere dispositivos de una subcuenta a otra.

| | |
| --- | --- |
| **method** | `jimi.open.device.move` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `src_account` | string | Sí | Cuenta origen de los dispositivos |
| `dest_account` | string | Sí | Cuenta destino de los dispositivos |
| `imeis` | string | Sí | IMEI de los dispositivos, separados por coma |
| `cleanBindFlag` | string | No | `1`: limpiar datos · `0`: no limpiar datos |

**Respuestas:**

```json
{
  "code": 1112,
  "message": " device already exists ",
  "result": ["202205454545454"],
  "data": null
}
```

o, si la transferencia es correcta:

```json
{
  "code": 0,
  "message": " Transfer/Sell Equipment Successfully ",
  "result": null,
  "data": null
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "no permissions"}
```

#### 4.3.7 Crear grupo de dispositivos

Crea un grupo para organizar los dispositivos de una cuenta.

| | |
| --- | --- |
| **method** | `jimi.device.group.create` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenecerá el grupo |
| `group_name` | string | Sí | Nombre del grupo |

**Respuesta** — objeto `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `group_id` | string | ID del nuevo grupo |
| `group_name` | string | Nombre del nuevo grupo |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": {
    "group_id": "534d23f1b28c44319f4f8ba0cda5b7e6",
    "group_name": "device group 1"
  }
}
```

#### 4.3.8 Editar grupo de dispositivos

Renombra un grupo de dispositivos.

| | |
| --- | --- |
| **method** | `jimi.device.group.update` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `group_id` | string | Sí | ID del grupo a editar |
| `group_name` | string | Sí | Nuevo nombre del grupo |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success"
}
```

#### 4.3.9 Eliminar grupo de dispositivos

| | |
| --- | --- |
| **method** | `jimi.device.group.delete` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `group_id` | string | Sí | ID del grupo a eliminar |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success"
}
```

#### 4.3.10 Listar grupos de dispositivos de una cuenta

| | |
| --- | --- |
| **method** | `jimi.device.group.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta propietaria de los grupos |

**Respuesta** — `result` es un arreglo de grupos:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `group_id` | string | ID del grupo |
| `group_name` | string | Nombre del grupo |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "group_id": "b2ac10536171474eb0c151c7bb606f3d",
      "group_name": "Default group"
    },
    {
      "group_id": "298b949bacbb4badae597ba1fdb629be",
      "group_name": "22221"
    },
    {
      "group_id": "05cbdd380ca14c2e89b2ab59904f51b7",
      "group_name": "CVCVXCV"
    }
  ]
}
```

---

### 4.4 Ubicación y recorridos

#### 4.4.1 Obtener la ubicación de los dispositivos por cuenta

Obtiene la última ubicación de todos los dispositivos de una cuenta.

| | |
| --- | --- |
| **method** | `jimi.user.device.location.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `target` | string | Sí | Cuenta a consultar |
| `map_type` | string | No | `GOOGLE`: coordenadas calibradas por Google. `null` (omitir): devuelve latitud y longitud originales |

**Respuesta** — `result` es un arreglo:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `deviceName` | string | Nombre del dispositivo |
| `icon` | string | Ícono del vehículo |
| `status` | string | Estado del dispositivo: `0` offline, `1` online |
| `lat` | double | Latitud (si el dispositivo está expirado, el valor es 0) |
| `lng` | double | Longitud (si el dispositivo está expirado, el valor es 0) |
| `expireFlag` | string | `1` no expirado, `0` expirado |
| `activationFlag` | string | `1` activado, `0` no activado |
| `posType` | string | `GPS`, `LBS`, `WIFI`, `BEACON` |
| `locDesc` | string | Información de ubicación cuando el dispositivo se posiciona por Bluetooth |
| `gpsTime` | string | Hora del posicionamiento GPS |
| `hbTime` | string | Hora del latido (heartbeat) |
| `speed` | string | Velocidad (km/h) |
| `accStatus` | string | ACC: `0` OFF, `1` ON |
| `electQuantity` | string | Nivel de batería calculado según la configuración del modelo y el voltaje |
| `powerValue` | string | Voltaje externo (0–100); algunos modelos no lo soportan |
| `distance` | string | Distancia desde el dispositivo |
| `temperature` | string | Temperatura (℃) |
| `trackerOil` | string | Nivel de combustible del vehículo (valor de voltaje original) |
| `gpsSignal` | string | Nivel de señal GSM: `0` sin señal · `1` extremadamente débil · `2` débil · `3` fuerte · `4` extremadamente fuerte |
| `gpsNum` | string | Número de satélites |
| `direction` | string | Azimut de desplazamiento, 0–360; `-1` = desconocido. Ejemplo: `100.12` |
| `currentMileage` | string | Kilometraje actual |
| `batteryPowerVal` | string | Voltaje interno |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "imei": "868120145233604",
      "deviceName": "868120145233604",
      "icon": "bus",
      "status": "0",
      "posType": "GPS",
      "lat": 22.577282,
      "lng": 113.916604,
      "hbTime": "2017-04-26 09:14:50",
      "accStatus": "0",
      "speed": "0",
      "gpsTime": "2017-04-26 09:17:46",
      "activationFlag": "1",
      "expireFlag": "1",
      "electQuantity": "60",
      "locDesc": null,
      "powerValue": null,
      "temperature": "86.5",
      "trackerOil": null
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "The account does not exist"}
```

#### 4.4.2 Obtener la ubicación de uno o varios dispositivos

Obtiene la última ubicación de uno o varios dispositivos por IMEI.

| | |
| --- | --- |
| **method** | `jimi.device.location.get` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imeis` | string | Sí | IMEI separados por coma; se recomienda POST cuando son muchos (máximo 100 IMEI) |
| `map_type` | string | No | `GOOGLE`: coordenadas calibradas por Google. `null` (omitir): coordenadas originales |

**Respuesta** — `result` es un arreglo:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `deviceName` | string | Nombre del dispositivo |
| `account` | string | Cuenta a la que pertenece el dispositivo |
| `customerName` | string | Nombre del cliente de la cuenta propietaria |
| `icon` | string | Ícono del vehículo |
| `status` | string | Estado: `0` offline, `1` online |
| `lat` | double | Latitud (0 si el dispositivo está expirado) |
| `lng` | double | Longitud (0 si el dispositivo está expirado) |
| `expireFlag` | string | `1` no expirado, `0` expirado |
| `activationFlag` | string | `1` activado, `0` no activado |
| `posType` | string | `GPS`, `LBS`, `WIFI`, `BEACON` |
| `locDesc` | string | Información de ubicación |
| `gpsTime` | string | Hora del posicionamiento GPS |
| `hbTime` | string | Hora del latido (heartbeat) |
| `speed` | string | Velocidad (km/h) |
| `accStatus` | string | ACC: `0` off, `1` on |
| `batteryPowerVal` | string | Batería (0–100); algunos modelos no lo soportan |
| `powerValue` | string | Voltaje externo (0–100); algunos modelos no lo soportan |
| `distance` | string | Distancia desde el dispositivo |
| `temperature` | string | Temperatura (℃) |
| `trackerOil` | string | Combustible restante del vehículo |
| `currentMileage` | string | Kilometraje actual del dispositivo (km) |
| `gpsNum` | string | Número de satélites |
| `gpsSignal` | string | Nivel de señal GSM: `0` sin señal · `1` extremadamente débil · `2` débil · `3` fuerte · `4` extremadamente fuerte |
| `direction` | string | Azimut de desplazamiento, 0–360; `-1` = desconocido |
| `electQuantity` | string | Nivel de batería calculado según el modelo y el voltaje |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "imei": "868120145233604",
      "deviceName": "868120145233604",
      "icon": "bus",
      "status": "0",
      "posType": "GPS",
      "lat": 22.577282,
      "lng": 113.916604,
      "hbTime": "2017-04-26 09:14:50",
      "accStatus": "0",
      "speed": "0",
      "gpsNum": "11",
      "gpsTime": "2017-04-26 09:17:46",
      "activationFlag": "1",
      "expireFlag": "1",
      "electQuantity": "60",
      "locDesc": null,
      "powerValue": null,
      "temperature": "86.5",
      "trackerOil": null,
      "currentMileage": "86.5"
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Illegal device"}
```

#### 4.4.3 Obtener URL para compartir ubicación

Genera una URL pública para mostrar la ubicación del dispositivo en un mapa.

| | |
| --- | --- |
| **method** | `jimi.device.location.URL.share` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |

**Respuesta** — objeto `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `URL` | string | Enlace para compartir la ubicación del dispositivo |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": {
    "URL": "data.16180track.com/api/share?ver=2&method=trackDevice_abr&deviceinfo=7ae7c62385f2067f164002db315854a969a40e3888021cb01dc8f2183ca08dbbd8581f6bb86df4c2e3e1b887cb67c21039b4c0ced18fdf8dd08e0460c5edd13ad87e16dca9702ce6"
  }
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Illegal device"}
```

#### 4.4.4 Obtener el recorrido (track) de un dispositivo

Obtiene los puntos de recorrido de un dispositivo en un rango de **máximo 7 días**, dentro de los últimos **3 meses**.

| | |
| --- | --- |
| **method** | `jimi.device.track.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo (solo 1 por llamada) |
| `begin_time` | number | Sí | Hora de inicio. Formato: `yyyy-MM-dd HH:mm:ss` |
| `end_time` | number | Sí | Hora de fin. Formato: `yyyy-MM-dd HH:mm:ss`; debe ser anterior a la hora actual |
| `map_type` | string | No | `GOOGLE`: coordenadas calibradas por Google. `null` (omitir): coordenadas originales |

**Respuesta** — `result` es el arreglo de puntos y `data` el resumen:

Puntos (`result`):

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `lng` | double | Longitud |
| `lat` | double | Latitud |
| `gpsTime` | string | Hora del posicionamiento GPS. Formato `yyyy-MM-dd HH:mm:ss` |
| `direction` | string | Dirección, coordenadas polares desde el norte |
| `gpsSpeed` | string | Velocidad GPS |
| `posType` | string | `1` GPS, `2` LBS, `3` WIFI |
| `satellite` | string | Intensidad de señal de la antena GPS |
| `ignition` | string | Estado de ignición: `ON` ACC ON, `OFF` ACC OFF |
| `accStatus` | string | Estado del ACC |

Resumen (`data`):

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `mileage` | string | Kilometraje del recorrido dentro del tiempo consultado |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "lat": 22.577144898887813,
      "lng": 113.91674845964586,
      "gpsTime": "2017-04-26 00:00:58",
      "direction": 0,
      "gpsSpeed": -1,
      "posType": 3,
      "satellite": 0,
      "ignition": "ON",
      "accStatus": "ON"
    },
    {
      "lat": 22.57708,
      "lng": 113.916631,
      "gpsTime": "2017-04-26 00:01:30",
      "direction": 184,
      "gpsSpeed": 0,
      "posType": 1,
      "satellite": 0,
      "ignition": "ON",
      "accStatus": "ON"
    }
  ],
  "data": {
    "mileage": 0
  }
}
```

Respuestas de error:

```json
{"code": "xxx", "message": "IMEI does not exist{353419031939627}"}
{"code": "xxx", "message": "The device has expired{353419031939627}"}
```

#### 4.4.5 Obtener la ubicación de un dispositivo TAG

Consulta la última ubicación de dispositivos TAG.

| | |
| --- | --- |
| **method** | `jimi.device.location.getTagMsg` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imeis` | string | Sí | IMEI del/los dispositivo(s) TAG |

**Respuesta** — `result` es un arreglo:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `lng` | double | Longitud |
| `lat` | double | Latitud |
| `gpsTime` | long | Hora del posicionamiento GPS (timestamp Unix) |
| `directions` | string | Dirección *(en el manual original la descripción dice "número de satélites"; se transcribe fielmente)* |
| `gpsSpeed` | int | Velocidad |
| `positionType` | string | `GPS`, `LBS`, `WIFI`, `BEACON` |
| `gpsNum` | int | Número de satélites |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "lng": 113.943054,
      "lat": 22.576609,
      "gpsTime": 1734593340,
      "directions": "0",
      "gpsSpeed": -1.0,
      "positionType": "5",
      "gpsNum": 3
    }
  ]
}
```

Respuesta de error:

```json
{
  "code": 1100,
  "message": "Business exception ",
  "result": null,
  "data": null
}
```

#### 4.4.6 Análisis de ubicación por Wi-Fi / estación base (LBS)

Resuelve coordenadas a partir de información de estaciones base (LBS) y/o redes Wi-Fi. **Cuota:** 10 llamadas/día/dispositivo, asignada por el total de dispositivos de la cuenta (incluye todas las subcuentas).

| | |
| --- | --- |
| **method** | `jimi.lbs.address.get` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | number | Sí | IMEI del dispositivo |
| `lbs` | number | No* | Grupo de información LBS `(mcc,mnc,lac,cell,rssi)`, máximo 7 grupos de 5 valores, ninguno nulo y en orden. MCC (China: 460), MNC, LAC (p. ej. 2312 23222), CELL (p. ej. 23222), RSSI (señal, p. ej. -70) |
| `wifi` | string | No* | `mac1,rssi1\|mac2,rssi2`. Dirección MAC sin dos puntos y potencia RSSI |

> *Al menos uno de `wifi` o `lbs` es obligatorio.

**Respuesta** — objeto `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `lng` | string | Longitud |
| `lat` | string | Latitud |
| `accuracy` | string | Precisión; a mayor valor, mejor |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": {
    "lat": 40.65615416521587,
    "lng": 109.89894039833524,
    "accuracy": 0
  }
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "illegal device"}
```

---

### 4.5 Reportes

#### 4.5.1 Obtener el kilometraje de dispositivos

Obtiene los datos de viajes (trayectos) de uno o varios dispositivos en un rango de tiempo, con el kilometraje total por dispositivo.

| | |
| --- | --- |
| **method** | `jimi.device.track.mileage` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imeis` | string | Sí | IMEI de dispositivos, separados por coma |
| `begin_time` | number | Sí | Hora de inicio. Formato: `yyyy-MM-dd HH:mm:ss` |
| `end_time` | number | Sí | Hora de fin. Formato: `yyyy-MM-dd HH:mm:ss`; debe ser anterior a la hora actual |
| `start_row` | number | No | Número de fila inicial del conjunto de resultados |
| `page_size` | number | No | Registros por página |

**Respuesta**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `code` | int | `0`: correcto. Otro: fallo |
| `message` | string | Mensaje de error si `code ≠ 0` |
| `result` | string | Datos devueltos (lista de viajes) |
| `data` | string | Resumen: `imei` y `totalMileage` (suma del kilometraje de todos los viajes del dispositivo en el periodo) |

Elementos de `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `startTime` | string | Hora de inicio |
| `endTime` | string | Hora de fin |
| `startLat` | string | Latitud de la posición inicial |
| `startLng` | string | Longitud de la posición inicial |
| `endLat` | string | Latitud de la posición final |
| `endLng` | string | Longitud de la posición final |
| `runTimeSecond` | int | Segundos transcurridos entre la posición inicial y final |
| `distance` | double | Distancia (metros) entre la posición inicial y final |
| `avgSpeed` | double | Velocidad media |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "imei": "3505831983422342",
      "startTime": "2017-04-26 00:00:58",
      "endTime": "2017-04-26 00:03:58",
      "startLat": 22.577144898887813,
      "startLng": 113.91674845964586,
      "endLat": 22.677144898887813,
      "endLng": 113.92674845964586,
      "elapsed": 2130,
      "distance": 25000,
      "avgSpeed": 90
    }
  ],
  "data": [
    {
      "imei": "3505831983422342",
      "totalMileage": 60000
    }
  ]
}
```

#### 4.5.2 Obtener la lista de alarmas de dispositivos

Obtiene la lista de alarmas de dispositivos. El rango de búsqueda debe estar dentro de **1 mes**. Devuelve un máximo de **1000 filas**.

| | |
| --- | --- |
| **method** | `jimi.device.alarm.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí* | IMEI del dispositivo; se usa al consultar un solo dispositivo |
| `imeis` | string | Sí* | Varios IMEI separados por coma, máximo 100 por llamada |
| `alertTypeId` | string | No | Si no se especifica, se devuelven todos los tipos de alarma |
| `begin_time` | date | No | Si no se indican `begin_time` y `end_time`, devuelve las últimas 50 alarmas del último mes |
| `end_time` | date | No | Fin del rango |
| `page_no` | int | Sí | Número de página (`>=1`, default `1`) |
| `page_size` | int | Sí | Registros por página (1–100, default `50`) |

> *Elige uno de los campos `imei` o `imeis`.

**Respuesta** — `result` es un arreglo:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `deviceName` | string | Nombre del dispositivo |
| `imei` | string | IMEI |
| `model` | string | Modelo del dispositivo |
| `account` | string | Cuenta |
| `alertTypeId` | string | ID del tipo de alarma |
| `alertTypeName` | string | Nombre del tipo de alarma |
| `alertTime` | string | Hora de la alarma |
| `positioningTime` | string | Hora del posicionamiento de la alarma |
| `lng` | double | Longitud |
| `lat` | double | Latitud |
| `speed` | string | Velocidad |
| `geoid` | string | ID de la geocerca |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "deviceName": "ABC-34352",
      "imei": "343503422910345",
      "model": "GT06N",
      "account": "test1234",
      "alertTypeId": "1002",
      "alarmTypeName": "ACC On",
      "alertTime": "2019-03-14 14:02:03",
      "positioningTime": "2019-03-14 14:02:03",
      "lat": 22.577144898887813,
      "lng": 113.91674845964586,
      "speed": "10",
      "geoid": "se8yg081p0qh5vnniqrakr1nr0tdh6a0"
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Illegal device"}
```

#### 4.5.3 Obtener datos de estacionamiento / ralentí de dispositivos

Obtiene los datos de estacionamiento (parking) o ralentí (idling) de uno o varios dispositivos en un rango de tiempo.

| | |
| --- | --- |
| **method** | `jimi.open.platform.report.parking` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenecen los dispositivos |
| `imeis` | string | Sí | IMEI separados por coma. Ejemplo: `869247060001770,869247060001259,869247060001804` |
| `start_time` | string | Sí | Hora de inicio. Formato: `yyyy-MM-dd HH:mm:ss` |
| `end_time` | string | Sí | Hora de fin; debe ser anterior a la hora actual |
| `start_row` | string | Sí | Fila inicial del conjunto de resultados |
| `page_size` | string | Sí | Registros por página |
| `acc_type` | string | Sí | `on`: datos de ralentí (idling) · `off`: datos de estacionamiento (parking) |

**Respuesta**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `code` | int | `0`: correcto · `1100`: excepción de negocio · otro: fallo |
| `message` | string | Mensaje de error si `code ≠ 0` |
| `result` | string | `null` |
| `data` | object | Datos devueltos |

Objeto `data`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `totalTime` | string | Tiempo de procesamiento de la petición |
| `dataTotalRows` | string | Total de filas |
| `rows` | array[object] | Detalle de datos |

Elementos de `rows`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `startTime` | string | Hora de inicio |
| `endTime` | string | Hora de fin |
| `durSecond` | string | Tiempo de estacionamiento |
| `lng` | number | Longitud |
| `lat` | number | Latitud |
| `addr` | string | Dirección |
| `deviceName` | string | Nombre del dispositivo |
| `mcType` | string | Modelo del dispositivo |
| `acc` | string | Estado del ACC |
| `stopSecond` | string | Duración del estacionamiento |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": null,
  "data": {
    "totalTime": "185641",
    "dataTotalRows": "2",
    "rows": [
      {
        "imei": "869247060001739",
        "startTime": "2022-12-10T01:05:33.000Z",
        "endTime": "2022-12-10T04:17:48.000Z",
        "durSecond": "11535",
        "lng": 113.943093,
        "lat": 22.576748,
        "addr": "Shigu Road, 松坪村, Xili Sub-district, Nanshan distri...",
        "deviceName": "JC450Pro-01739",
        "mcType": "JC450Pro",
        "acc": "on",
        "stopSecond": "11535"
      },
      {
        "imei": "869247060001739",
        "startTime": "2022-12-09T22:13:16.000Z",
        "endTime": "2022-12-10T01:04:25.000Z",
        "durSecond": "10269",
        "lng": 113.943002,
        "lat": 22.57649,
        "addr": "Shigu Road, 松坪村, Xili Sub-district, Nanshan distri...",
        "deviceName": "JC450Pro-01739",
        "mcType": "JC450Pro",
        "acc": "on",
        "stopSecond": "10269"
      }
    ]
  }
}
```

Respuesta de error:

```json
{
  "code": 1100,
  "message": "Business exception ",
  "result": null,
  "data": null
}
```

#### 4.5.4 Obtener información de reportes RFID

Consulta la información RFID reportada en un periodo de tiempo.

| | |
| --- | --- |
| **method** | `jimi.open.device.rfid.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenece el dispositivo. Si los dispositivos a consultar pertenecen a varios usuarios, indica aquí la cuenta superior común |
| `imeis` | string | No | IMEI separados por coma, máximo 100. Si no se indica `imeis` ni `card_ids`, se consultan todos los reportes RFID del periodo |
| `card_ids` | string | No | RFID separados por coma, máximo 100. Si no se indica `imeis` ni `card_ids`, se consultan todos los reportes RFID del periodo |
| `begin_time` | number | Sí | Hora de inicio. Formato: `yyyy-MM-dd HH:mm:ss` |
| `end_time` | number | Sí | Hora de fin; debe ser anterior a la hora actual. Consulta máximo 1 mes de datos por llamada |
| `page_no` | int | No | Número de página (`>=1`, default `1`) |
| `page_size` | int | No | Registros por página (1–100, default `10`) |

**Respuesta** — objeto `data`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `currentPage` | number | Página actual |
| `pageSize` | number | Registros por página |
| `totalRecord` | number | Total de datos que cumplen las condiciones |
| `result` | array[object] | Datos devueltos |

Elementos de `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `cardId` | string | RFID correspondiente en el reporte |
| `imei` | string | IMEI correspondiente al reporte RFID |
| `photo` | string | Foto tomada por el dispositivo durante el reporte RFID |
| `operationTime` | string | Hora del reporte RFID |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "currentPage": 1,
    "pageSize": 10,
    "startRow": 1,
    "endRow": 10,
    "totalRecord": 34,
    "totalPage": 4,
    "result": [
      {
        "imei": "890768902346789",
        "cardId": "278907",
        "operationTime": "2024-04-22 09:12:23",
        "photo": ""
      }
    ]
  }
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "no permissions"}
```

#### 4.5.5 Obtener el reporte de viajes de dispositivos

Consulta el reporte de viajes (itinerarios) de dispositivos, agregado por día o en detalle.

| | |
| --- | --- |
| **method** | `jimi.open.platform.report.trips` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenecen los dispositivos |
| `imeis` | string | Sí | IMEI separados por coma. Ejemplo: `869247060001770,869247060001259,869247060001804` |
| `type` | string | Sí | `day`: los datos de itinerario se agrupan por día · `list`: se devuelve el detalle de itinerarios del dispositivo |
| `start_time` | string | Sí | Hora de inicio. Formato: `yyyy-MM-dd HH:mm:ss` |
| `end_time` | string | Sí | Hora de fin; debe ser anterior a la hora actual |
| `start_row` | string | Sí | Fila inicial del conjunto de resultados |
| `page_size` | string | Sí | Registros por página |

**Respuesta**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `code` | int | `0`: correcto · `1100`: excepción de negocio · otro: fallo |
| `message` | string | Mensaje de error si `code ≠ 0` |
| `data` | object | Datos devueltos |

Objeto `data`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `dayList` | array[object] | Se devuelve cuando `type = list` |
| `datDatas` | array[object] | Se devuelve cuando `type = day` |

Elementos de `datDatas`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `deviceName` | string | Nombre del dispositivo |
| `deviceImei` | string | IMEI del dispositivo |
| `data` | object | Datos del día |

`datDatas.data`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `date` | string | Fecha |
| `totalTrips` | string | Número total de viajes del día |
| `averageSpeed` | string | Velocidad media |
| `fuel` | string | Consumo de combustible |
| `maxSpeed` | string | Velocidad máxima |
| `oilWear` | string | Consumo de combustible por 100 km |
| `totalMileage` | string | Kilometraje total |
| `travelTime` | string | Tiempo total de viaje |

Elementos de `dayList`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `deviceName` | string | Nombre del dispositivo |
| `tripsData` | array[object] | Información de viajes (detalle abajo) |
| `inTotal` | object | Resumen: `allTrips` (número total de viajes), `totalDis` (kilometraje total), `travelTime` (tiempo total en marcha), `totalTime` (tiempo total formateado), `totalAvgSpeed` (velocidad media), `allTotalMaxSpeed` (velocidad media máxima), `totalFuel` (combustible total), `oilWear` (consumo por 100 km) |

`dayList.tripsData`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `Searchdate` | string | Fecha |
| `tripNum` | number | Número de viajes del día |
| `inTotal` | object | Resumen del día: `totalDis`, `travelTime`, `totalTime`, `totalAvgSpeed`, `allTotalMaxSpeed`, `totalFuel`, `oilWear` |
| `dayData` | array[object] | Información de cada itinerario (detalle abajo) |

`dayList.tripsData.dayData`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `startTime` | string | Hora de inicio del viaje |
| `endTime` | string | Hora de fin del viaje |
| `startLat` | string | Latitud inicial del viaje |
| `startLng` | string | Longitud inicial del viaje |
| `endLat` | string | Latitud final del viaje |
| `endLng` | string | Longitud final del viaje |
| `totalMileage` | string | Kilometraje del viaje |
| `travelTime` | string | Tiempo |
| `averageSpeed` | string | Velocidad media |
| `maxSpeed` | string | Velocidad máxima |
| `oilWear` | string | Consumo de combustible por 100 km |
| `fuel` | string | Consumo de combustible |
| `startMileage` | string | Kilometraje inicial |
| `endMileage` | string | Kilometraje final |

> **Nota:** el manual oficial no incluye ejemplo de respuesta correcta para esta interfaz (indica "暂缺" — pendiente). Respuesta de error:

```json
{
  "code": 1100,
  "message": "Business exception ",
  "result": null,
  "data": null
}
```

#### 4.5.6 Obtener datos de entrada y salida de geocerca de dispositivos

Consulta los reportes de entrada y salida de geocercas de dispositivos.

| | |
| --- | --- |
| **method** | `jimi.open.platform.fence.duration` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenecen las geocercas |
| `imeis` | string | Sí | IMEI separados por coma. Ejemplo: `869247060001770,869247060001259,869247060001804` |
| `start_time` | string | Sí | Hora de inicio. Formato: `yyyy-MM-dd HH:mm:ss` |
| `end_time` | string | Sí | Hora de fin; debe ser anterior a la hora actual |
| `start_row` | string | Sí | Fila inicial del conjunto de resultados |
| `page_size` | string | Sí | Registros por página |

**Respuesta**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `code` | int | `0`: correcto · `1100`: excepción de negocio · otro: fallo |
| `message` | string | Mensaje de error si `code ≠ 0` |
| `data` | object | Datos devueltos |

Objeto `data`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `totalTime` | string | Tiempo de procesamiento de la petición |
| `dataTotalRows` | string | Total de filas |
| `rows` | array[object] | Detalle de datos |

Elementos de `rows`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `deviceName` | string | Nombre del dispositivo |
| `fenceName` | string | Nombre de la geocerca |
| `enterTime` | string | Hora de entrada a la geocerca |
| `exitTime` | number | Hora de salida de la geocerca |
| `duration` | number | Duración |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": null,
  "data": {
    "totalTime": "0",
    "dataTotalRows": "2",
    "rows": [
      {
        "imei": "869247060001739",
        "deviceName": "JC450Pro-01739",
        "fenceName": "geofence1",
        "enterTime": "2022-12-10T01:05:33.000Z",
        "exitTime": "2022-12-10T04:17:48.000Z",
        "duration": "11535"
      },
      {
        "imei": "869247060001739",
        "deviceName": "JC450Pro-01739",
        "fenceName": "geofence1",
        "enterTime": "2022-12-10T01:05:33.000Z"
      }
    ]
  }
}
```

Respuesta de error:

```json
{
  "code": 1100,
  "message": "Business exception ",
  "result": null,
  "data": null
}
```

#### 4.5.7 Obtener los datos OBD de dispositivos

Consulta los datos de diagnóstico del bus CAN reportados por dispositivos OBD.

| | |
| --- | --- |
| **method** | `jimi.device.obd.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenecen los dispositivos |
| `imeis` | string | Sí | IMEI separados por coma, máximo 100 por llamada. Soporta consultar dispositivos de la cuenta y sus subcuentas |
| `start_time` | string | Sí | Hora de inicio. Formato: `yyyy-MM-dd HH:mm:ss` |
| `end_time` | string | Sí | Hora de fin; debe ser anterior a la hora actual. Consulta máximo 31 días de datos por llamada |
| `page_no` | int | Sí | Número de página (`>=1`, default `1`) |
| `page_size` | int | Sí | Registros por página (1–100, default `10`) |

**Respuesta** — objeto `data`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `currentPage` | int | Página actual, igual que `page_no` |
| `pageSize` | int | Registros por página, igual que `page_size` |
| `totalRecord` | int | Total de filas |
| `result` | array[object] | Detalle de datos |

Elementos de `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `dataReportTime` | string | Hora en que se reportaron los datos |
| `odometerReading` | string | Kilometraje del odómetro del vehículo (km) |
| `deviceAccumulatedMileage` | string | Kilometraje contado por el dispositivo |
| `remainingFuel` | string | Volumen de combustible |
| `remainingFuelPercentage` | string | Porcentaje de combustible. Los datos reportados por distintos vehículos y dispositivos varían: se muestra volumen o porcentaje según lo reportado por el dispositivo |
| `coolantTemperature` | string | Temperatura del refrigerante (℃) |
| `vehicleBatterVoltage` | string | Voltaje de entrada externo |
| `currentRPM` | string | Velocidad instantánea del motor (RPM) |
| `currentSpeed` | string | Velocidad de conducción actual |
| `vin` | string | Número de identificación del vehículo (VIN) |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "currentPage": 1,
    "pageSize": 2,
    "startRow": 0,
    "endRow": 0,
    "totalRecord": 2684,
    "totalPage": 0,
    "result": [
      {
        "imei": "158511020000028",
        "dataReportTime": "2024-05-09 10:25:00",
        "odometerReading": "2049.6",
        "deviceAccumulatedMileage": "142.9",
        "remainingFuel": null,
        "remainingFuelPercentage": "58",
        "coolantTemperature": "77",
        "vehicleBatterVoltage": "118",
        "currentRPM": "5016",
        "currentSpeed": "88.5",
        "vin": "LC0CG4CF1H0029191"
      },
      {
        "imei": "158511020000028",
        "dataReportTime": "2024-05-09 1:27:23",
        "odometerReading": "2048.6",
        "deviceAccumulatedMileage": "143.9",
        "remainingFuel": null,
        "remainingFuelPercentage": "56",
        "coolantTemperature": "78",
        "vehicleBatterVoltage": "118",
        "currentRPM": "5016",
        "currentSpeed": "95.5",
        "vin": "LC0CG4CF1H0029191"
      }
    ]
  }
}
```

Respuesta de error:

```json
{
  "code": 1100,
  "message": "Business exception ",
  "result": null,
  "data": null
}
```

#### 4.5.8 Obtener los datos de fallas OBD de dispositivos

Consulta los códigos de falla del bus CAN reportados por dispositivos OBD.

| | |
| --- | --- |
| **method** | `jimi.device.obd.fault` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenecen los dispositivos |
| `imeis` | string | Sí | IMEI separados por coma, máximo 100 por llamada. Soporta consultar dispositivos de la cuenta y sus subcuentas |
| `start_time` | string | Sí | Hora de inicio. Formato: `yyyy-MM-dd HH:mm:ss` |
| `end_time` | string | Sí | Hora de fin; debe ser anterior a la hora actual. Consulta máximo 31 días de datos por llamada |
| `page_no` | int | Sí | Número de página (`>=1`, default `1`) |
| `page_size` | int | Sí | Registros por página (1–100, default `10`) |

**Respuesta** — objeto `data` con la misma estructura de paginación que §4.5.7 (`currentPage`, `pageSize`, `totalRecord`, `result`). Elementos de `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `deviceName` | string | Nombre del dispositivo |
| `faultCode` | string | Código de la falla |
| `faultDetail` | string | Descripción detallada de la falla |
| `eventTime` | string | Hora en que se reportó la falla |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": null,
  "data": {
    "currentPage": 1,
    "pageSize": 4,
    "startRow": 0,
    "endRow": 0,
    "totalRecord": 6,
    "totalPage": 0,
    "result": [
      {
        "imei": "202509999999994",
        "deviceName": "VL502_E-99994",
        "faultCode": "P1502",
        "faultDetail": "High speed state of the vehicle - the front axle is faster than the rear axle",
        "eventTime": "2024-07-03 08:16:49"
      },
      {
        "imei": "202509999999994",
        "deviceName": "VL502_E-99994",
        "faultCode": "B0074",
        "faultDetail": "2nd row center seat belt pretensioner - start control (sub-error)",
        "eventTime": "2024-07-03 08:26:49"
      },
      {
        "imei": "202509999999994",
        "deviceName": "VL502_E-99994",
        "faultCode": "P2407",
        "faultDetail": "Fuel evaporative emission system leak detection pump sensing circuit is intermittent/unstable",
        "eventTime": "2024-07-03 08:36:49"
      },
      {
        "imei": "202509999999994",
        "deviceName": "VL502_E-99994",
        "faultCode": "U0464",
        "faultDetail": "Invalid data received from the navigation control module",
        "eventTime": "2024-07-03 08:46:49"
      }
    ]
  }
}
```

Respuesta de error:

```json
{
  "code": 1100,
  "message": "Business exception ",
  "result": null,
  "data": null
}
```

---

### 4.6 Geocercas

La API ofrece **dos familias** de geocercas:

- **Por dispositivo** (§4.6.1 y §4.6.2): cercas circulares que se configuran directamente en un IMEI (el terminal las evalúa). Identificadas por número de serie de comando (`instruct_no`).
- **De plataforma** (§4.6.3 a §4.6.8): cercas circulares o poligonales gestionadas en la nube, pertenecientes a una cuenta y asociables a múltiples dispositivos con distintos tipos de alarma.

#### 4.6.1 Crear geocerca para un IMEI

Crea una geocerca (circular) directamente en un dispositivo.

| | |
| --- | --- |
| **method** | `jimi.open.device.fence.create` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `fence_name` | string | Sí | Nombre de la geocerca |
| `alarm_type` | string | Sí | Tipo de alarma (`in` / `out` / `in,out`) |
| `report_mode` | string | Sí | Modo de reporte de alarma: `0` GPRS, `1` SMS+GPRS |
| `alarm_switch` | string | Sí | Interruptor de alarma de la cerca (`ON`/`OFF`) |
| `lng` | string | Sí | Longitud |
| `lat` | string | Sí | Latitud |
| `radius` | string | Sí | Radio de la cerca (1–9999; unidad: 100 metros) |
| `zoom_level` | string | Sí | Nivel de zoom (3–19) |
| `map_type` | string | Sí | Mapa (`GOOGLE`) |

**Respuesta:** `result` contiene el número de serie de la cerca creada si tiene éxito.

Respuesta correcta:

```json
{
  "code": 0,
  "message": "Successfully create geo-fence.",
  "result": "5"
}
```

Respuesta de error:

```json
{
  "code": 41003,
  "message": "Device is not online, geo-fence creation failed ",
  "result": null
}
```

#### 4.6.2 Eliminar geocerca de un dispositivo

| | |
| --- | --- |
| **method** | `jimi.open.device.fence.delete` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `instruct_no` | string | Sí | Número de serie del comando de geocerca |

**Respuesta correcta:**

```json
{
  "code": 0,
  "message": "delete the geo-fence successfully",
  "result": null
}
```

Respuesta de error:

```json
{
  "code": 41003,
  "message": "The device is not online and geo-fence can’t be deleted",
  "result": null
}
```

#### 4.6.3 Crear geocerca de plataforma

Crea una geocerca de plataforma. La geocerca recién creada pertenece al grupo por defecto.

| | |
| --- | --- |
| **method** | `jimi.open.platform.fence.create` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenecerá la nueva cerca |
| `fence_name` | string | Sí | Nombre de la nueva cerca |
| `fence_type` | string | Sí | Tipo de cerca (`circle`/`polygon`) |
| `fence_color` | string | No | Color de la cerca, color RGB16 estándar (p. ej. rojo `#FF0000`). Default: `#3B7AFF` |
| `geom` | string | Sí | Colección de puntos de coordenadas. Polígono: latitud y longitud separadas por coma y múltiples puntos separados por `#`, p. ej. `22.581714259546697,113.89460067944759#22.57323797629247,113.92341832019817` (requiere conversión al sistema de coordenadas Mars). Círculo: `22.57540001979625,113.88814802356858`. **La latitud va antes que la longitud** |
| `radius` | string | No | Radio de la cerca en metros, rango 200–5000. Obligatorio cuando es círculo; si no se envía se interpreta como polígono. Default: `200` |
| `description` | string | No | Descripción de la cerca |

**Respuesta**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `code` | int | `0`: correcto · `1114`: el nombre de la cerca ya existe · `-1`: el sistema está ocupado · otro: fallo |
| `message` | string | Mensaje de error si `code ≠ 0` |
| `result` | string | `null` |
| `data` | string | Datos devueltos: `fence_id` si tiene éxito |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": null,
  "data": "c33b80d46d2b41d588a5afbd6f8b6285"
}
```

Respuesta de error:

```json
{
  "code": 1114,
  "message": "That name already exists ",
  "result": null,
  "data": null
}
```

#### 4.6.4 Editar geocerca de plataforma

Edita la información de una geocerca de plataforma.

| | |
| --- | --- |
| **method** | `jimi.open.platform.fence.update` *(ver nota)* |
| **HTTP** | `POST` |

> **Nota del fabricante:** la sección 7.42 del manual V2.7.14 indica `jimi.open.platform.fence.create` como `method`, lo cual es un error de transcripción del documento (esa operación es la de creación, §4.6.3). La operación de edición utiliza el método de actualización de la familia `jimi.open.platform.fence.*`. Confirma el valor exacto del `method` con el soporte de JIMI antes de integrar.

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenece la cerca |
| `fence_id` | string | Sí | ID de la cerca a editar |
| `fence_name` | string | Sí | Nuevo nombre de la cerca |
| `fence_type` | string | Sí | Tipo de cerca (`circle`/`polygon`) |
| `fence_color` | string | No | Color de la cerca, RGB16 (p. ej. `#FF0000`). Default: `#3B7AFF` |
| `geom` | string | Sí | Colección de puntos. Polígono: puntos `lat,lng` separados por `#` (requiere conversión al sistema Mars). Círculo: `lat,lng`. La latitud va antes que la longitud |
| `radius` | string | No | Radio en metros (200–5000). Obligatorio para círculo; si no se envía se interpreta como polígono. Default: `200` |
| `description` | string | No | Descripción de la cerca |

**Respuesta:** `data` contiene el `fence_id` si tiene éxito. `code`: `0` correcto, `-1` sistema ocupado.

```json
{
  "code": 0,
  "message": "success",
  "result": null,
  "data": "c33b80d46d2b41d588a5afbd6f8b6285"
}
```

#### 4.6.5 Eliminar geocerca de plataforma

| | |
| --- | --- |
| **method** | `jimi.open.platform.fence.delete` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenece la cerca |
| `fence_id` | string | Sí | ID de la cerca a eliminar |

**Respuesta correcta:**

```json
{
  "code": 0,
  "message": "success",
  "result": null,
  "data": null
}
```

Respuesta de error:

```json
{
  "code": -1,
  "message": " The system is busy ",
  "result": null,
  "data": null
}
```

#### 4.6.6 Asociar dispositivos a una geocerca

Asocia dispositivos (y sus tipos de alarma) a una geocerca de plataforma.

| | |
| --- | --- |
| **method** | `jimi.open.platform.fence.bind` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `fence_id` | string | Sí | ID de la cerca |
| `imeis` | string | No | IMEI separados por coma. Ejemplo: `869247060001770,869247060001259,869247060001804` |
| `alert_type` | string | No | Tipos de alarma separados por coma: `in` (entrar a la cerca) · `out` (salir de la cerca) · `stayTimeIn` (no entrar a la cerca por más de N días) · `stayTimeOut` (no salir de la cerca por más de N días) |
| `stay_time_in` | int | No | Alarma al no entrar a la cerca por más de N días. Si se envía, `alert_type` debe incluir `stayTimeIn` |
| `stay_time_out` | int | No | Alarma al no salir de la cerca por más de N días. Si se envía, `alert_type` debe incluir `stayTimeOut` |

**Respuesta:** `data` contiene el número de dispositivos asociados si tiene éxito.

```json
{
  "code": 0,
  "message": "success",
  "result": null,
  "data": "3"
}
```

#### 4.6.7 Listar geocercas de plataforma de una cuenta

Consulta las geocercas de plataforma de una cuenta.

| | |
| --- | --- |
| **method** | `jimi.open.platform.fence.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `account` | string | Sí | Cuenta a la que pertenecen las geocercas |
| `page_no` | number | No | Número de página (`>=1`, default `1`) |
| `page_size` | number | No | Registros por página (1–50, default `10`) |

**Respuesta** — objeto `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `total` | string | Número de cercas de la cuenta |
| `rows` | array[object] | Detalle de cada cerca |

Elementos de `rows` (también aplican a §4.6.8):

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `fence_id` | string | ID de la cerca |
| `fence_name` | string | Nombre de la geocerca |
| `fence_type` | string | Tipo de cerca (`circle`/`polygon`) |
| `fence_color` | string | Default: `#3B7AFF` |
| `coordinates` | string | Colección de puntos de coordenadas. Polígono: `lat,lng` separados por `;`. Círculo: `lat,lng`. La latitud va antes que la longitud |
| `radius` | string | Radio de la cerca en metros (200–5000); aplica cuando es círculo |
| `description` | string | Descripción de la cerca |
| `imeis` | string | IMEI asociados. Ejemplo: `869247060001770,869247060001259,869247060001804` |
| `alert_type` | string | Tipos de alarma separados por coma: `in`, `out`, `stayTimeIn`, `stayTimeOut` |
| `stay_time_in` | int | Alarma por no entrar a la cerca en más de N días; requiere `stayTimeIn` en `alert_type` |
| `stay_time_out` | int | Alarma por no salir de la cerca en más de N días; requiere `stayTimeOut` en `alert_type` |
| `account` | string | Cuenta |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": {
    "total": 294,
    "rows": [
      {
        "fence_id": "dfab43ea3e7a40e987056c857cccae7b",
        "fence_name": "test fence",
        "fence_type": "circle",
        "fence_color": "#3b7aff",
        "coordinates": "22.544382,114.004037",
        "radius": "4153",
        "description": "",
        "imeis": "231011234567990,869247060001655,868598060001827,869247060001259",
        "alert_type": "in",
        "stay_time_out": null,
        "stay_time_in": null,
        "account": "hao001"
      }
    ]
  }
}
```

Respuesta de error:

```json
{
  "code": -1,
  "message": "The system is busy ",
  "result": null,
  "data": null
}
```

#### 4.6.8 Consultar una geocerca por ID

Consulta la información de una geocerca de plataforma por su `fence_id`.

| | |
| --- | --- |
| **method** | `jimi.open.platform.fence.detail` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `fence_id` | string | Sí | ID único de la cerca |

**Respuesta** — `result` es un objeto con el detalle de la cerca; los campos son los mismos descritos en la tabla de `rows` de §4.6.7 (`fence_id`, `fence_name`, `fence_type`, `fence_color`, `coordinates`, `radius`, `description`, `imeis`, `alert_type`, `stay_time_in`, `stay_time_out`, `account`).

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": {
    "fence_id": "dfab43ea3e7a40e987056c857cccae7b",
    "fence_name": "test fence",
    "fence_type": "circle",
    "fence_color": "#3b7aff",
    "coordinates": "22.544382,114.004037",
    "radius": "4153",
    "description": "",
    "imeis": "231011234567990,869247060001655,868598060001827,869247060001259",
    "alert_type": "in",
    "stay_time_out": null,
    "stay_time_in": null,
    "account": "hao001"
  }
}
```

Respuesta de error:

```json
{
  "code": -1,
  "message": "The system is busy ",
  "result": null,
  "data": null
}
```

---

### 4.7 Comandos

#### 4.7.1 Obtener la lista de comandos soportados por un dispositivo

| | |
| --- | --- |
| **method** | `jimi.open.instruction.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |

**Respuesta** — `result` es un arreglo:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `id` | string | Código del comando |
| `orderName` | string | Nombre del comando |
| `orderContent` | string | Plantilla del comando |
| `orderExplain` | string | Explicación del comando |
| `orderMsg` | string | Mensaje de ayuda |
| `isOffLine` | string | Si soporta comando offline: `0` no, `1` sí |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "id": 81,
      "orderName": "SOS setting",
      "orderContent": "SOS,A,{0},{1},{2}#",
      "orderExplain": "SOS is used for receive alerts and SOS alerts. SOS number should have 3-20 numbers.",
      "orderMsg": "",
      "isOffLine": "1"
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Illegal device"}
```

#### 4.7.2 Enviar comando a un dispositivo

| | |
| --- | --- |
| **method** | `jimi.open.instruction.send` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `inst_param_json` | string | Sí | Cadena de caracteres JSON con el mensaje del comando |

Estructura de `inst_param_json`:

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `inst_id` | string | Sí | Código del comando |
| `inst_template` | string | Sí | Plantilla del comando |
| `params` | array[string] | Sí | Arreglo de parámetros del comando |
| `is_cover` | boolean | No | Si cubre el comando offline existente: `true` cubre, `false` no cubre. Default: `false` |

Ejemplos:

```json
{"inst_id": "113", "inst_template": "RELAY,1#", "params": [], "is_cover": "true"}
{"inst_id": "114", "inst_template": "RELAY,0#", "params": [], "is_cover": "true"}
```

Comando definido por el usuario:

```json
{"inst_id": "96", "inst_template": "{0}", "params": ["STATUS#"], "is_cover": "true"}
```

**Respuesta correcta:**

```json
{
  "code": 0,
  "message": "command is successfully sent.",
  "result": null
}
```

Respuesta de error:

```json
{
  "code": 12005,
  "message": "Fail to send command. Result code：226",
  "result": null
}
```

#### 4.7.3 Obtener resultados de la ejecución de comandos

| | |
| --- | --- |
| **method** | `jimi.open.instruction.result` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |

**Respuesta** — `result` es un arreglo:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `codeId` | string | Código del comando |
| `code` | string | Comando enviado |
| `content` | string | Contenido de respuesta del dispositivo |
| `isExecute` | string | Estado del comando: `0` ejecución fallida · `1` ejecución exitosa · `3` por enviar · `4` cancelado |
| `sendTime` | string | Hora. Formato: `yyyy-MM-dd HH:mm:ss` |
| `sender` | string | Remitente |
| `receiveDevice` | string | IMEI receptor |
| `isOffLine` | string | `0` online, `1` offline |
| `idsource` | string | Descripción del comando |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "success",
  "result": [
    {
      "codeId": "99",
      "code": "status#",
      "content": "Parameter error",
      "isExecute": "4",
      "sendTime": "2017-06-19 11:46:00",
      "sender": "jimitest",
      "receiveDevice": "868120111111117",
      "isOffLine": "1",
      "idsource": "User-defined command"
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "Illegal device"}
```

#### 4.7.4 Enviar datos de comando crudos (raw) a un dispositivo

Envía un comando en formato hexadecimal crudo al dispositivo.

| | |
| --- | --- |
| **method** | `jimi.open.instruction.raw.send` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `raw_cmd` | string | Sí | Datos crudos del comando (cadena hexadecimal) |

Ejemplo de comando crudo: `0B02C3A405060708`

**Respuesta correcta:**

```json
{
  "code": 0,
  "message": "command is successfully sent.",
  "result": null
}
```

Respuesta de error:

```json
{
  "code": 12005,
  "message": "Fail to send command. Result code：226",
  "result": null
}
```

#### 4.7.5 Enviar instrucción de medios (foto/video)

Envía un comando de captura de foto o video al dispositivo.

| | |
| --- | --- |
| **method** | `jimi.device.meida.cmd.send` *(así aparece en el manual; la grafía "meida" es del fabricante)* |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `camera` | string | Sí | `1` cámara frontal · `2` cámara interior · `3` frontal + interior. Cuando `mediaType=1`, solo admite `1` o `2` |
| `mediaType` | string | Sí | `1` foto, `2` video |
| `shootTime` | string | No | `0` o `3`–`10`. Cuando `mediaType=2`, duración de la grabación (3–10) |

**Respuesta**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `code` | int | `0`: éxito. Otro: fallo |
| `result` | JSON | `{"code":"100","data":"1.3.3","msg":"Communication successful response","cmdSeqNo":"1"}`. Códigos de retorno: `225` timeout · `226` error de parámetro · `227` el comando no se ejecutó correctamente · `228` el dispositivo no está en línea · `229` error de red/conexión · `238` dispositivo interrumpido · `240` error de formato de datos |
| `message` | string | Descripción del resultado del envío del comando |

Ejemplo de éxito:

```json
{
  "code": 0,
  "message": "Operation successful",
  "result": {"code": "255", "data": "1.3.3", "msg": "通信成功响应", "cmdSeqNo": "1"}
}
```

Ejemplo de excepción:

```json
{
  "code": -1,
  "message": "Operation successful",
  "result": {"code": "228", "data": "1.3.3", "msg": "设备不在线", "cmdSeqNo": "1"}
}
```

---

### 4.8 Multimedia y video

#### 4.8.1 Obtener URL de foto o video del dispositivo

Obtiene las URL de fotos o videos capturados por la cámara del dispositivo.

> **Nota importante:** esta interfaz **solo devuelve los videos o fotos creados por comando remoto**. Para obtener todo tipo de fotos o videos, usa la interfaz de §4.8.5.

| | |
| --- | --- |
| **method** | `jimi.device.media.URL` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `camera` | string | Sí | `1` frontal · `2` interior · `3` ambas |
| `media_type` | string | Sí | `1` foto · `2` video · `3` ambos |
| `start_time` | date | No | Hora de inicio de creación de la foto o video |
| `end_time` | date | No | Hora de fin de creación de la foto o video |
| `token` | string | No | Token para validar si se puede acceder a la foto o video |
| `page_no` | int | No | Índice base cero; `0` por defecto |
| `page_size` | int | No | `10` filas por defecto |

**Respuesta** — `result` puede tener varias filas:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `thumb_URL` | string | URL de la miniatura del video o foto |
| `file_URL` | string | URL del video o foto |
| `mime_type` | string | Tipo MIME del video o foto |
| `create_time` | date | Hora de creación del video o foto |
| `alarm_time` | date | Hora en que ocurrió la alarma |
| `media_type` | string | `1` foto, `2` video |
| `camera` | string | `0` cámara frontal, `1` cámara interior |
| `file_size` | int | Tamaño del archivo de foto o video |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "Operation successful",
  "result": [
    {
      "thumb_URL": "Q9GLAFFqfCrYF6YfQAcON4w4Ezs=/lhWse7ie3wtFrjuQZ22dLAk5CSaR",
      "file_URL": "357730090345670_3949477_2019_04_29_12_32_38_01",
      "mime_type": "video/mp4",
      "create_time": "2019-04-29 10:32:43",
      "media_type": 2,
      "camera": 1,
      "file_size": 9949087
    },
    {
      "thumb_URL": "Q9GLAFFqfCrYF6YfQAcON4w4Ezs=/FhCrZEIy3518sR_ylOlqDg7w3Ju-",
      "file_URL": "351609080120911_3949476_2019_04_29_18_32_12",
      "mime_type": "video/3gpp",
      "create_time": "2019-04-29 10:32:42",
      "media_type": 2,
      "camera": 1,
      "file_size": 2411318
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "imei doesn’t exists"}
```

#### 4.8.2 Obtener URL de la página de video en vivo del dispositivo

Obtiene la URL de la página de video en vivo del dispositivo y la información de su última posición.

| | |
| --- | --- |
| **method** | `jimi.device.live.page.url` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `type` | string | No | Default `1`. `1` video en tiempo real · `2` video histórico |
| `voice` | string | No | Default `1`. `0` deshabilitar audio · `1` habilitar audio |

**Respuesta** — objeto `result`:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `lng` | double | Longitud |
| `lat` | double | Latitud |
| `gpsTime` | string | Hora del posicionamiento GPS. Formato `yyyy-MM-dd HH:mm:ss` |
| `direction` | string | Dirección, coordenadas polares desde el norte |
| `gpsSpeed` | string | Velocidad GPS |
| `posType` | string | `1` GPS, `2` LBS, `3` WIFI |
| `satellite` | string | Intensidad de señal de la antena GPS |
| `VIN` | string | VIN |
| `plateNo` | string | Número de placa |
| `UrlCamera` | string | URL de la página de video en vivo |

Respuesta correcta:

```json
{
  "code": 0,
  "message": "Vehicle information modification successful",
  "result": {
    "lat": 22.577144898887813,
    "lng": 113.91674845964586,
    "gpsTime": "2017-04-26 00:00:58",
    "direction": 0,
    "gpsSpeed": -1,
    "posType": 3,
    "satellite": 11,
    "VIN": "V12345",
    "plateNo": "ABC-12345",
    "UrlCamera": "https://www.domain.com/device/video/35408343202342345"
  }
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "imei doesn’t exists"}
```

#### 4.8.3 Obtener la lista de videos históricos

Envía al dispositivo el comando de carga de la lista de archivos de video histórico, o consulta la lista de archivos.

> **Nota:** esta interfaz solo aplica al **firmware antiguo de los modelos JC200 y JC400** de la plataforma TrackSolid. Para otros modelos, usa la interfaz de §4.8.2.

| | |
| --- | --- |
| **method** | `jimi.device.history.file.list` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `type` | string | Sí | `1` upload (cargar) · `2` query (consultar) |

**Respuesta**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `code` | int | `0`: éxito. Otro: fallo |
| `result` | JSON | Con `type=1`: `{"code":"100","data":"1.3.3","msg":"Successful response","cmdSeqNo":"1"}`. Códigos: `225` timeout · `226` error de parámetro · `227` comando no ejecutado correctamente · `228` dispositivo no en línea · `229` error de red · `238` dispositivo interrumpido · `240` error de formato. Con `type=2`: lista de archivos `"...mp4,...mp4,"` |
| `message` | string | Descripción del resultado del envío del comando |

Éxito con `type=1`:

```json
{
  "code": 0,
  "message": "Operation successful",
  "result": {"code": "255", "data": "1.3.3", "msg": "Successful response", "cmdSeqNo": "1"}
}
```

Excepción con `type=1`:

```json
{
  "code": -1,
  "message": "Operation successful",
  "result": {"code": "228", "data": "1.3.3", "msg": "Device is offline", "cmdSeqNo": "1"}
}
```

Éxito con `type=2`:

```json
{
  "code": 0,
  "message": "Operation successful",
  "result": "2018_03_29_16_51_45.mp4,2018_03_29_16_52_46.mp4,"
}
```

#### 4.8.4 Enviar instrucción de video histórico

Envía al dispositivo el comando de carga de un archivo de video histórico.

| | |
| --- | --- |
| **method** | `jimi.device.history.cmd.send` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `type` | string | Sí | `1` fragmento completo · `2` fragmento de evento |
| `camera` | string | Sí | `1` exterior · `2` interior |
| `fileName` | string | No* | Nombre del archivo de video histórico. No nulo cuando `type=1` |
| `time` | string | No* | Punto de tiempo del evento, formato `yyyy-MM-dd HH:mm:ss`. No nulo cuando `type=2` |

**Respuesta:** igual estructura que §4.8.3 con `type=1` (`result` JSON con `code`/`data`/`msg`/`cmdSeqNo`; códigos 225–240).

Éxito:

```json
{
  "code": 0,
  "message": "Operation successful",
  "result": {"code": "255", "data": "1.3.3", "msg": "Successful response", "cmdSeqNo": "1"}
}
```

Excepción:

```json
{
  "code": -1,
  "message": "Operation successful",
  "result": {"code": "228", "data": "1.3.3", "msg": "Device is offline", "cmdSeqNo": "1"}
}
```

#### 4.8.5 Obtener URL de foto o video (versión JIMI)

Obtiene las URL de fotos o videos capturados por la cámara del dispositivo (cubre **todos** los tipos, no solo los generados por comando remoto).

| | |
| --- | --- |
| **method** | `jimi.device.jimi.media.URL` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |
| `camera` | string | Sí | `1` cámara frontal · `2` cámara interior · `3` ambas |
| `media_type` | string | Sí | `1` foto · `2` video · `3` ambos |
| `start_time` | date | No | Hora de inicio de creación de la foto o video |
| `end_time` | date | No | Hora de fin de creación de la foto o video |
| `token` | string | No | Token para validar si se puede acceder a la foto o video |
| `page_no` | int | No | Índice base cero; `0` por defecto |
| `page_size` | int | No | `10` filas por defecto |

**Respuesta** — `result` puede tener varias filas:

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `thumb_URL` | string | URL de la miniatura del video o foto |
| `file_URL` | string | URL del video o foto |
| `mime_type` | string | Tipo MIME del video o foto |
| `create_time` | long | Hora de creación (timestamp Unix) |
| `alarm_time` | long | Hora en que se disparó la alarma (timestamp Unix) |
| `media_type` | string | `1` foto, `2` video |
| `camera` | string | `0` cámara frontal, `1` cámara interior |
| `file_size` | int | Tamaño del archivo de foto o video |

> **Nota:** timestamps Unix. Ejemplo: `1611105520` = `2021-01-20 09:18:40`.

Respuesta correcta:

```json
{
  "code": 0,
  "message": "Operation successful",
  "result": [
    {
      "thumb_URL": "http://8.210.205.58:8081/normal/get?fileKey=2021_01_20_09_17_49_I_28.jpg",
      "file_URL": "http://8.210.205.58:8081/normal/get?fileKey=357730090564767_29057540_2021_01_20_09_17_49_I_28_128.mp4",
      "create_time": 1611105520,
      "mime_type": "video/mp4",
      "media_type": 2,
      "alarm_time": 1611105469,
      "camera": 0,
      "file_size": "12108649"
    },
    {
      "thumb_URL": "http://8.210.205.58:8081/normal/get?fileKey=2021_01_20_08_06_13_I_56.jpg",
      "file_URL": "http://8.210.205.58:8081/normal/get?fileKey=357730090564767_00000000_2021_01_20_08_06_13_I_56_146.mp4",
      "create_time": 1611101264,
      "mime_type": "video/mp4",
      "media_type": 2,
      "alarm_time": 1611101173,
      "camera": 0,
      "file_size": "48452069"
    }
  ]
}
```

Respuesta de error:

```json
{"code": "xxx", "message": "imei doesn’t exists"}
```

#### 4.8.6 Obtener URL RTMP de video

Obtiene la URL RTMP de streaming de video del dispositivo.

| | |
| --- | --- |
| **method** | `jimi.open.video.rtmp.url` |
| **HTTP** | `POST` |

**Parámetros privados**

| Parámetro | Tipo | Obligatorio | Descripción |
| --------- | ---- | ----------- | ----------- |
| `access_token` | string | Sí | Token de acceso |
| `imei` | string | Sí | IMEI del dispositivo |

**Respuesta** — `result` es la URL RTMP (string). Códigos de retorno documentados: `225` timeout · `226` error de parámetro · `227` comando no ejecutado · `228` dispositivo no en línea · `229` error de red · `238` dispositivo interrumpido · `240` error de formato.

Éxito:

```json
{
  "code": 0,
  "message": "success",
  "result": "rtmp://36.133.0.208:1935/0/353376110035950?uId=openapi8b7914c3e4c188def67edd6b4a743146&vhost=8&user=172&expire_stamp=1595923486798&ext=&channel=0&token=25b422283ff824461b33d8c5059d"
}
```

Excepción:

```json
{
  "code": 228,
  "message": "The device is not online",
  "result": "null"
}
```

---

### 4.9 Notificaciones push (servidor a servidor)

TrackSolid Pro puede **enviar a tu servidor** notificaciones HTTP cuando ocurren eventos. Para activar el push, **contacta a JIMI y proporciona manualmente la URL** de tu servidor.

#### 4.9.1 Recepción de notificaciones de alarma

Tu plataforma debe exponer una URL para recibir las notificaciones; el servidor de JIMI las envía mediante una petición HTTP a esa URL.

**Lista de servicios de mensaje**

| Tipo de mensaje | Descripción |
| --------------- | ----------- |
| `jimi.push.device.alarm` | Datos de alarma |

**Contenido de la petición**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `msgType` | string | Tipo de mensaje, correspondiente a la lista de servicios |
| `data` | string | Contenido del mensaje, según `msgType` |

**Contenido del mensaje (`jimi.push.device.alarm`)**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `deviceName` | string | Nombre del dispositivo |
| `alarmType` | string | Tipo de alarma |
| `alarmName` | string | Nombre de la alarma |
| `lat` | string | Latitud |
| `lng` | string | Longitud |
| `alarmTime` | string | Hora de la alarma. Formato `yyyy-MM-dd HH:mm:ss` |

Ejemplo:

```
Parámetro 1:  Key = msgType
              Value = jimi.push.device.alarm
Parámetro 2:  Key = data
              Value = {
                "imei": "868120145233604",
                "deviceName": "868120145233604",
                "alarmType": "2",
                "alarmName": "Power off alarm",
                "lat": 40.65615416521587,
                "lng": 109.89894039833524,
                "alarmTime": "2017-05-08 12:00:00"
              }
```

#### 4.9.2 Recepción de datos crudos (raw) del dispositivo

Tu plataforma debe exponer una URL (la misma URL de push de mensajes) para recibir los datos crudos que envía el dispositivo; el servidor de JIMI los reenvía con una petición HTTP. Debes proporcionar la URL manualmente a JIMI.

**Lista de servicios de mensaje**

| Tipo de mensaje | Descripción |
| --------------- | ----------- |
| `jimi.open.instruction.raw.receive` | Mensaje de recepción de datos crudos; distinto del mensaje de alarma |

**Contenido de la petición**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `msgType` | string | Tipo de mensaje, correspondiente a la lista de servicios |
| `data` | string | Contenido del mensaje, según `msgType` |

**Contenido del mensaje (`jimi.open.instruction.raw.receive`)**

| Clave | Tipo | Descripción |
| ----- | ---- | ----------- |
| `imei` | string | IMEI del dispositivo |
| `deviceName` | string | Nombre del dispositivo |
| `raw_data` | string | Datos crudos del dispositivo (cadena hexadecimal) |

Ejemplo:

```
Parámetro 1:  Key = msgType
              Value = jimi.open.instruction.raw.receive
Parámetro 2:  Key = data
              Value = {
                "imei": "868120145233604",
                "deviceName": "868120145233604",
                "raw_data": "0A0C0F01182E0101"
              }
```

---

### 4.10 Interfaces deprecadas

Las siguientes interfaces están **deprecadas** desde la versión V2.7.3 de la API (2023-02-15). No las uses en integraciones nuevas:

| Interfaz | method | Descripción original |
| -------- | ------ | -------------------- |
| Enviar comando (dispositivo scooter) | `jimi.scooter.instruction.send` | Enviar comando a dispositivo scooter |
| Obtener detalle de scooter | `jimi.scooter.device.detail` | Obtener estado y detalle del scooter |

---

## Capítulo 5 — Formato de Respuesta y Códigos

### 5.1 Estructura de respuesta

Todas las interfaces devuelven JSON con al menos estos campos:

| Clave | Tipo | Obligatorio | Descripción |
| ----- | ---- | ----------- | ----------- |
| `code` | int | Sí | Código de resultado |
| `message` | string | No | Descripción del resultado o del error |
| `result` | string/object/array | Según la interfaz | Datos devueltos |
| `data` | object | Solo algunas interfaces | Datos adicionales (interfaces de reportes y geocercas de plataforma) |

### 5.2 Códigos de resultado generales

| Rango | Valor | Descripción |
| ----- | ----- | ----------- |
| `-1` | -1 | El sistema está ocupado |
| `0` | 0 | Éxito |
| `1XXX` | 1001 | Error de parámetro (faltan parámetros obligatorios o error de formato). Ver la descripción de cada interfaz |
| | 1002 | Usuario/dispositivo ilegal (no pertenece a la cuenta ni a subcuentas propias) |
| | 1003 | Operación repetida |
| | 1004 | Acceso ilegal, ¡excepción de token! (token inválido o inexistente) |
| | 1005 | Acceso ilegal, ¡el acceso de IP excede el límite! |
| | 1006 | Acceso ilegal, ¡peticiones demasiado frecuentes! |
| | 1007 | Acceso ilegal, ¡método de petición erróneo! |
| | 1008 | Acceso ilegal, ¡entrada anormal! |
| | 12001 | Falló la creación de la cuenta de plataforma |
| | 12002 | Falló la transferencia de dispositivo |
| | 12003 | Falló la creación de la geocerca |
| | 12004 | Falló la eliminación de la geocerca |
| | 12005 | Falló el envío del comando |
| | 1100 | Excepción de negocio (interfaces de reportes y geocercas de plataforma) |
| | 1112 | El dispositivo ya existe (transferencia de dispositivos) |
| | 1114 | El nombre de la geocerca ya existe (geocercas de plataforma) |

### 5.3 Códigos de error por operación

**Creación de cuenta**

| Código | Descripción |
| ------ | ----------- |
| 213 | La cuenta ya existe |
| 214 | La cuenta no existe |
| 215 | Error de tipo de usuario. Posibles causas: 1) el tipo de usuario está vacío; 2) el tipo de usuario no existe; 3) el usuario actual no tiene permiso para crear ese tipo de usuario |
| 217 | El usuario destino no existe |

**Transferencia de dispositivos**

| Código | Descripción |
| ------ | ----------- |
| 218 | El usuario solo puede transferir/vender dispositivos a una subcuenta |
| 219 | La lista de IMEI es ilegal |
| 220 | El número de IMEI excede el límite |

**Geocercas (por dispositivo)**

| Código | Descripción |
| ------ | ----------- |
| 41001 | Se excedió el número máximo de geocercas soportadas |
| 41002 | El nombre de la cerca ya existe |
| 41003 | El dispositivo no está en línea |
| 41004 | Falló la operación de geocerca |

**Comandos**

| Código | Descripción |
| ------ | ----------- |
| 225 | Timeout |
| 226 | Error de parámetro |
| 227 | El comando no se ejecutó correctamente |
| 228 | El dispositivo no está en línea |
| 229 | Error de red, error de conexión, etc. |
| 238 | Dispositivo interrumpido |
| 240 | Error de formato de datos |
| 243 | No soportado por el dispositivo |
| 252 | El dispositivo está ocupado |

> El diccionario completo de códigos está en el [Apéndice A](./APENDICE-A.md), incluido el catálogo de **tipos de alarma** (§8.1 del manual).

---

## Capítulo 6 — Ejemplo Completo End-to-End

Escenario: un distribuidor quiere **listar los dispositivos de una subcuenta y obtener su ubicación actual** usando el nodo TSP HK.

### Paso 1 — Obtener el token

Parámetros (comunes + privados) antes de firmar:

```
app_key=9FB345B8693CCD0054E44ADF99139409
expires_in=7200
format=json
method=jimi.oauth.token.get
sign_method=md5
timestamp=2017-09-28 01:55:00
user_id=jimitest
user_pwd_md5=e10adc3949ba59abbe56e057f20f883e
v=1.0
```

Cadena a firmar (parámetros ordenados alfabéticamente, sin `=` ni comas, envuelta en el `appSecret`):

```
<appSecret>app_key9FB345B8693CCD0054E44ADF99139409expires_in7200formatjsonmethodjimi.oauth.token.getsign_methodmd5timestamp2017-09-28 01:55:00user_idjimitestuser_pwd_md5e10adc3949ba59abbe56e057f20f883ev1.0<appSecret>
```

`sign = MD5(cadena).toUpperCase()` → 32 caracteres hexadecimales en mayúsculas.

Petición:

```bash
curl -X POST 'https://hk-open.tracksolidpro.com/route/rest' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'method=jimi.oauth.token.get' \
  -d 'timestamp=2017-09-28 01:55:00' \
  -d 'app_key=9FB345B8693CCD0054E44ADF99139409' \
  -d 'sign_method=md5' \
  -d 'v=1.0' \
  -d 'format=json' \
  -d 'sign=TU_FIRMA_MD5_EN_MAYUSCULAS' \
  -d 'user_id=jimitest' \
  -d 'user_pwd_md5=e10adc3949ba59abbe56e057f20f883e' \
  -d 'expires_in=7200'
```

Respuesta:

```json
{
  "code": 0,
  "message": "success",
  "result": {
    "appKey": "9FB345B8693CCD0054E44ADF99139409",
    "account": "jimitest",
    "accessToken": "7da3330ec28e3996b6ef4a7e3390ba71",
    "expiresIn": 7200,
    "refreshToken": "7da3330ec28e3996b6ef4a7e3390ba71",
    "time": "2017-09-28 01:55:01"
  }
}
```

### Paso 2 — Listar los dispositivos de la subcuenta

Con `method=jimi.user.device.list` y los parámetros privados `access_token` + `target=<subcuenta>`, recalculando la firma con el nuevo conjunto de parámetros:

```bash
curl -X POST 'https://hk-open.tracksolidpro.com/route/rest' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'method=jimi.user.device.list' \
  -d 'timestamp=2017-09-28 02:00:00' \
  -d 'app_key=9FB345B8693CCD0054E44ADF99139409' \
  -d 'sign_method=md5' \
  -d 'v=1.0' \
  -d 'format=json' \
  -d 'sign=NUEVA_FIRMA' \
  -d 'access_token=7da3330ec28e3996b6ef4a7e3390ba71' \
  -d 'target=subcuenta01'
```

### Paso 3 — Obtener la ubicación de un dispositivo

Con `method=jimi.device.location.get` y los parámetros privados `access_token` + `imeis=<imei>`:

```bash
curl -X POST 'https://hk-open.tracksolidpro.com/route/rest' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'method=jimi.device.location.get' \
  -d 'timestamp=2017-09-28 02:01:00' \
  -d 'app_key=9FB345B8693CCD0054E44ADF99139409' \
  -d 'sign_method=md5' \
  -d 'v=1.0' \
  -d 'format=json' \
  -d 'sign=NUEVA_FIRMA' \
  -d 'access_token=7da3330ec28e3996b6ef4a7e3390ba71' \
  -d 'imeis=868120145233604'
```

### Paso 4 — Renovar el token antes de que expire

Con `method=jimi.oauth.token.refresh`:

```bash
curl -X POST 'https://hk-open.tracksolidpro.com/route/rest' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'method=jimi.oauth.token.refresh' \
  -d 'timestamp=2017-09-28 03:50:00' \
  -d 'app_key=9FB345B8693CCD0054E44ADF99139409' \
  -d 'sign_method=md5' \
  -d 'v=1.0' \
  -d 'format=json' \
  -d 'sign=NUEVA_FIRMA' \
  -d 'access_token=7da3330ec28e3996b6ef4a7e3390ba71' \
  -d 'refresh_token=7da3330ec28e3996b6ef4a7e3390ba71' \
  -d 'expires_in=7200'
```

> **Recuerda:** la firma `sign` se recalcula en **cada** petición, porque el conjunto de parámetros cambia (incluye `access_token`, `timestamp` y los parámetros privados de cada interfaz).

---

## Capítulo 7 — Buenas Prácticas

1. **Cachea el token.** El `accessToken` dura 60–7200 segundos (típicamente ~2 horas). Guárdalo en memoria/almacenamiento local de tu servidor y renuévalo con `refreshToken` unos minutos antes de que expire. No pidas un token por petición: provocarás el error `1006` (peticiones demasiado frecuentes).
2. **Centraliza la firma.** Implementa la firma MD5 en un solo módulo de tu servidor; ordénala siempre por nombre de parámetro y excluye `sign`. Un orden o un espacio distinto invalida la firma.
3. **Usa el nodo correcto.** Cada cuenta de Open API pertenece a un nodo (TS, HK, EU, US). Llamar al nodo equivocado produce errores de usuario/token que parecen de credenciales.
4. **Usa UTC en `timestamp`.** El servidor tolera ±10 minutos respecto a su hora UTC. Si tu servidor tiene el reloj desfasado, todas las firmas fallarán.
5. **Agrupa los IMEI.** Las consultas de ubicación, RFID y OBD aceptan hasta 100 IMEI por llamada (separados por coma). Úsalo en lugar de hacer una llamada por dispositivo.
6. **Respeta las ventanas de consulta.** Tracks: máximo 7 días dentro de 3 meses. Alarmas: 1 mes, máximo 1000 filas. RFID: 1 mes por llamada. OBD: 31 días por llamada. LBS/WiFi: 10 llamadas/día/dispositivo.
7. **Recibe alarmas por push, no por sondeo.** Configura la URL de notificaciones (`jimi.push.device.alarm`) con JIMI para recibir las alarmas en tiempo real en lugar de consultar `jimi.device.alarm.list` en bucle.
8. **Maneja los dispositivos offline.** Los comandos y las geocercas de dispositivo fallan si el terminal está offline (`228`, `41003`). Reintenta cuando el dispositivo vuelva a conectar o usa comandos offline (`is_cover`).
9. **Protege el `appSecret`.** Vive solo en tu servidor. Nunca lo expongas en apps móviles ni frontends; tus clientes deben hablar con tu backend, no con la API de JIMI directamente.
10. **Valida `code` antes de parsear `result`/`data`.** Algunas interfaces devuelven `result` como arreglo y otras como objeto o string; y las de reportes/geocercas de plataforma usan `data`. Consulta siempre el `code` primero.

---

## Capítulo 8 — Solución de Problemas

| Síntoma | Causa probable | Solución |
| ------- | -------------- | -------- |
| `1004` — token inválido | Token expirado o mal copiado | Renueva con `jimi.oauth.token.refresh` o vuelve a autenticar. Verifica que no haya espacios extra |
| Firma rechazada / error de acceso con `v=1.0` | Orden de parámetros incorrecto, `sign` en minúsculas, o `timestamp` fuera de ±10 min UTC | Revisa el orden alfabético, convierte la firma a MAYÚSCULAS y sincroniza el reloj del servidor con UTC |
| `1006` — peticiones demasiado frecuentes | Estás pidiendo token en cada llamada o saturando la API | Cachea el token y aplica rate limiting en tu cliente |
| "Incorrect user name or password" en `token.get` | `user_pwd_md5` mal calculado o cuenta inexistente en ese nodo | La contraseña va en MD5 **minúsculas**; confirma el nodo regional correcto |
| `1002` — usuario/dispositivo ilegal | El IMEI o la cuenta no pertenece a tu jerarquía | Verifica que el dispositivo esté bajo tu cuenta o subcuentas |
| `228` / `41003` — dispositivo offline | El terminal no tiene conexión en ese momento | Espera a que reconecte; para comandos, usa `is_cover` para cubrir comandos offline |
| `41002` / `1114` — nombre de cerca duplicado | Ya existe una cerca con ese nombre en la cuenta | Elige otro nombre o edita la existente |
| `1112` — el dispositivo ya existe | El IMEI ya está en la cuenta destino al transferir | Elimina el duplicado o verifica la cuenta destino |
| `41001` — máximo de geocercas excedido | Límite de cercas por dispositivo alcanzado | Elimina cercas obsoletas antes de crear nuevas |
| La ubicación llega desviada en China | El mapa usa coordenadas originales (WGS-84) | Usa `map_type=GOOGLE` para recibir coordenadas calibradas |
| LBS devuelve error de cuota | Superaste 10 llamadas/día/dispositivo en `jimi.lbs.address.get` | Distribuye las consultas o espera al siguiente día (UTC) |

---

## Capítulo 9 — Checklist de Integración

1. [ ] Recibí de JIMI mi `appKey` y `appSecret`, y conozco el **nodo regional** de mi cuenta (TS / HK / EU / US).
2. [ ] Implementé la **firma MD5** (orden alfabético, sin `sign`, envuelta en `appSecret`, salida en mayúsculas).
3. [ ] Implementé el **gestor de token**: obtención (`jimi.oauth.token.get`), caché local y renovación (`jimi.oauth.token.refresh`) antes de expirar.
4. [ ] Mi servidor envía `timestamp` en **UTC** con reloj sincronizado (NTP).
5. [ ] Verifiqué el flujo mínimo: token → `jimi.user.device.list` → `jimi.device.location.get`.
6. [ ] Manejo los códigos de error principales: `1001`, `1002`, `1004`, `1006`, `1100`, `-1`.
7. [ ] Si uso alarmas push: proporcioné a JIMI la **URL de mi servidor** para `jimi.push.device.alarm` y valido `msgType`/`data` en mi receptor.
8. [ ] Respeto las ventanas y límites: tracks ≤ 7 días/3 meses, alarmas ≤ 1 mes/1000 filas, RFID ≤ 1 mes, OBD ≤ 31 días, LBS ≤ 10/día/dispositivo, lotes ≤ 100 IMEI.
9. [ ] El `appSecret` y las credenciales viven solo en mi backend; mis clientes finales nunca llaman a la API directamente.
10. [ ] Probé contra el nodo productivo con al menos un dispositivo real (comandos, geocercas y multimedia requieren hardware en línea).

---

> ← Volver al [índice de TRACKSOLIDPRO](../README.md) · [Apéndice A — Diccionarios de Datos](./APENDICE-A.md) · [Historial de Actualizaciones](./HISTORIAL-ACTUALIZACIONES.md)
