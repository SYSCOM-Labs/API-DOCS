# Demo — Consola de integración de Hik DeviceGateway

Aplicación web autocontenida que se conecta a un **Hik DeviceGateway** real y ejercita su API REST (estilo ISAPI, en JSON) por sus cuatro caras: gestión de dispositivos, explorador de la API, control de acceso y video en vivo con PTZ. La autenticación **HTTP Digest (MD5)** la resuelve el proxy incluido, de modo que el navegador nunca la maneja.

> ← Volver a la [Documentación de la API (Hik DeviceGateway)](../../README.md)

## Secciones

1. **Dispositivos** — Lista los dispositivos dados de alta en el gateway (`deviceList`), muestra la información del propio gateway (`deviceInfo`), y permite agregar (`addDevice`) y eliminar (`delDevice`). Seleccione un dispositivo para usarlo como destino (`devIndex`) en el resto de secciones.
2. **Explorador de API** — Un *playground* con los **73 endpoints** del catálogo del gateway. Elija uno, complete los parámetros de ruta (`<ID>`, etc.) y el cuerpo, y dispárelo. El `devIndex` se sustituye con el dispositivo activo.
3. **Control de acceso** — Personas (buscar/agregar), tarjetas (buscar/agregar), puertas (abrir/cerrar con confirmación), eventos de acceso (`AcsEvent`) y consulta de capacidades/captura de huella.
4. **Video en vivo · PTZ** — Vista en vivo en el navegador mediante el SDK de decodificación sin plugin (WebSocket) y control PTZ direccional con zoom.

En todo momento, el **Code HUD** inferior registra cada solicitud/respuesta ISAPI (método, ruta, estado, tiempo y cuerpos), a modo de inspector de tráfico.

## Requisitos

- **Node.js >= 22**.
- Un **Hik DeviceGateway** accesible por red y sus credenciales (usuario `admin`).

## Instalación y uso (local)

```bash
npm install
ALLOWED_GATEWAYS=mi-gateway.midominio.com npm start   # http://localhost:3000
# o durante desarrollo, con recarga:
ALLOWED_GATEWAYS=mi-gateway.midominio.com npm run dev
```

Abra `http://localhost:3000`, indique el **host** del gateway (`http://…` o `https://…`), el **usuario** y la **contraseña**, y pulse **Conectar**.

### Configuración

Copie `.env.example` a `.env` (o exporte las variables al lanzar):

| Variable | Descripción |
| -------- | ----------- |
| `PORT` | Puerto del servidor local (por defecto `3000`). |
| `ALLOWED_GATEWAYS` | Lista blanca de hosts de gateway permitidos, separada por comas (anti-SSRF). El proxy solo reenviará a estos hosts. **Si se deja vacío, se permite cualquier host** (cómodo en desarrollo, inseguro en producción). |

## Despliegue en Cloudflare Workers

```bash
npm run cf-dev     # prueba local del Worker (Miniflare)
npm run deploy     # despliega a Cloudflare (requiere wrangler login)
```

Configure la lista blanca como variable del Worker en `wrangler.toml` (`[vars] ALLOWED_GATEWAYS = "…"`) o con `npx wrangler deploy --var ALLOWED_GATEWAYS:mi-gateway`.

> **Nota (TLS):** el runtime de Cloudflare Workers **no** permite desactivar la verificación TLS. La ruta Cloudflare funciona si el gateway usa **HTTP** o **HTTPS con certificado válido**. Para gateways con certificado autofirmado, use el servidor local (`server.js`), que sí lo tolera (`rejectUnauthorized: false`, solo para demo).

## Cómo funciona el proxy (Digest)

El front envía `POST /proxy` con `{ url, method, headers, body, auth: { user, password } }`. El proxy:

1. Hace una primera petición y recibe el reto `401` con `WWW-Authenticate: Digest realm/nonce/qop`.
2. Calcula `HA1 = MD5(user:realm:pass)`, `HA2 = MD5(method:uri)` y `response = MD5(HA1:nonce:nc:cnonce:qop:HA2)`.
3. Reenvía la petición con el encabezado `Authorization: Digest …` y devuelve la respuesta.

Hay dos implementaciones equivalentes del proxy:

- **`server.js`** — Express, para desarrollo local. Usa el módulo `crypto` de Node para MD5 y tolera certificados autofirmados.
- **`worker.js`** — Cloudflare Worker. Incluye una implementación de **MD5 en JavaScript puro** (Web Crypto no ofrece MD5) y sirve los estáticos vía Workers Assets.

Ambos comparten la lógica de seguridad (`ALLOWED_GATEWAYS` + `isAllowedUrl`). Si cambia la validación, edítela en **los dos archivos**.

## Video en vivo (WebSocket)

La vista en vivo abre un **WebSocket directo al gateway** (`wss://host:443`), independiente del proxy `/proxy`. Requiere que el gateway exponga WebSocket/HTTPS y que el dispositivo tenga canal de video. El endpoint `POST /ISAPI/System/streamMedia` devuelve una URL RTSP que el SDK del fabricante (en `vendor/jsplugin/`) decodifica en el navegador sin plugin.

## Estructura

```
gateway/
├── index.html          # UI (una sola página) + estilos
├── app.js              # Lógica de la SPA (secciones, Code HUD, video)
├── catalog.js          # Catálogo de los 73 endpoints (para el playground)
├── server.js           # Proxy local (Express + Digest)
├── worker.js           # Proxy Cloudflare (Worker + Digest + MD5 JS puro)
├── wrangler.toml       # Configuración de Cloudflare Workers
├── .assetsignore       # Exclusiones del bundle de assets
├── .env.example        # Variables de entorno de ejemplo
└── vendor/jsplugin/    # SDK de decodificación de video sin plugin (fabricante)
```

## Seguridad

- Las **credenciales** se guardan solo en el navegador (`localStorage`) y se envían por petición al proxy; **nunca** se escriben en el repositorio.
- Defina `ALLOWED_GATEWAYS` para restringir a qué hosts puede reenviar el proxy (protección anti-SSRF).
- El operador **abrir puerta** y otras acciones que modifican el equipo real piden confirmación explícita.

## Referencias

| Recurso | Enlace |
| ------- | ------ |
| Documentación de la API | [../../README.md](../../README.md) |
| Apéndice A (objetos y códigos) | [../../APENDICE-A.md](../../APENDICE-A.md) |
| Descarga del gateway y SDK | https://desarrolladores.syscom.mx/?search=HikGateway |
