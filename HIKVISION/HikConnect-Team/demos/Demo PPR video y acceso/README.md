# POC SYSCOM — Video y Control de Acceso

> Prueba de concepto sobre **Hik-Connect for Teams OpenAPI** con **Next.js 16 (PPR + Cache Components)**.
> Expone las capacidades de **video** (inventario, live EZOPEN, cifrado) y **control de acceso**
> (puertas, apertura remota, marcaciones, personas, grupos, niveles de acceso, alta de dispositivos)
> del tenant SYSCOM, detrás de una app propia con login independiente.

Los clientes de la POC **no tienen las claves en el repo ni en el servidor de hosting**: cada
navegador captura AppKey/SecretKey la primera vez y las guarda en una cookie cifrada de ese
dispositivo. El BFF las usa solo en memoria para hablar con Hikvision.

---

## Tabla de contenidos

- [Características](#características)
- [Stack](#stack)
- [Arranque rápido](#arranque-rápido)
- [Configuración](#configuración)
- [Cómo se usa](#cómo-se-usa)
- [PPR + Cache Components: qué se usó y por qué](#ppr--cache-components-qué-se-usó-y-por-qué)
- [Arquitectura](#arquitectura)
- [API propia (BFF)](#api-propia-bff)
- [Flujo de video live (EZOPEN)](#flujo-de-video-live-ezopen)
- [Códigos de verificación](#códigos-de-verificación)
- [Demo script](#demo-script)
- [Seguridad y secretos](#seguridad-y-secretos)
- [Limitaciones conocidas](#limitaciones-conocidas)

---

## Características

**Video**

- Inventario completo de cámaras del tenant (paginado server-side).
- Live **EZOPEN** con el SDK oficial **EZUIKit** (decoder WASM self-hosted).
- Detección de **cifrado de stream** por dispositivo + captura del código de verificación
  directo en la UI (sin pantallas de error).
- Filtros compartibles por URL: texto, área, estado en línea y cifrado.

**Control de acceso**

- Listado de puertas con estado en línea y ficha de detalle por puerta.
- **Apertura remota**: las 4 acciones del OpenAPI (`unlock`, `lock`, `remain_unlock`,
  `remain_lock`), cada una exige motivo y queda auditada.
- **Marcaciones**: eventos de acceso de las últimas 48 h, paginados y filtrables por puerta.
- **Personas y grupos**: alta/baja de grupos (departamentos), alta de personas, tarjeta, PIN
  y asignación de nivel de acceso.
- **Niveles de acceso**: listado con puertas y horarios; usuarios de plataforma (solo lectura).
- **Alta de dispositivos** (video y acceso) desde la UI con serial + código de verificación.

**Plataforma**

- Modos `live` (tenant real) y `mock` (fixtures, sin tocar Hikvision).
- Modo **Simulados/Reales** para comandos de puerta, conmutable en caliente desde `/settings`.
- Credenciales del OpenAPI **por navegador** (cookie cifrada; nunca en el repo ni en disco del host).
- Auditoría local de toda acción sensible (`data/audit.jsonl`).

---

## Stack

| Pieza | Elección | Por qué |
|-------|----------|---------|
| Framework | **Next.js 16** (App Router, TS) | PPR + Cache Components, Server Actions, Route Handlers |
| Renderizado | **PPR** (`cacheComponents: true`) | Shell estático instantáneo + huecos dinámicos (ver [sección dedicada](#ppr--cache-components-qué-se-usó-y-por-qué)) |
| Player | **EZUIKit** (Hikvision) en `public/ezuikit/` | Único SDK que reproduce EZOPEN en web |
| Auth POC | Cookie `httpOnly` + JWT HMAC propio | Sesión independiente del token de HCT |
| Claves HCT | Cookie cifrada `poc_hct` (este navegador) | Otro dispositivo o borrar cookies = volver a capturar |

---

## Arranque rápido

```bash
npm install
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local
npm run dev
```

1. Abrir http://localhost:3000
2. Login: `admin` / `admin` (operador) o `visor` / `visor` (solo lectura)
3. **Primer uso en cada navegador**: el dashboard pide las claves del OpenAPI
   (`AppKey` / `SecretKey`). Se guardan en una cookie cifrada de **este dispositivo**
   (180 días). Otro equipo, otro navegador o borrar las cookies del sitio las vuelve a pedir.

> Si la red bloquea registry.npmjs.org, configurar un mirror corporativo en `.npmrc`
> (`registry=...`).

---

## Configuración

### Variables de entorno (`.env.local`)

| Variable | Descripción |
|----------|-------------|
| `POC_MODE` | `live` (HCT real) o `mock` (fixtures) |
| `POC_DRY_RUN` | `true` = comandos de puerta solo se auditan (default; se cambia en caliente en `/settings`) |
| `SESSION_SECRET` | Secreto HMAC de la cookie de sesión |
| `POC_ADMIN_PASSWORD` / `POC_VIEWER_PASSWORD` | Contraseñas de los usuarios fijos |
| `HCT_HOST` | `https://ius.hikcentralconnect.com` |
| `HCT_APP_KEY` / `HCT_SECRET_KEY` | **Vacías a propósito.** Cada navegador las captura en el primer uso (cookie `poc_hct`) |
| `CAMERA_ALLOWLIST` | IDs de cámara visibles (vacía = todas) |

### Página `/settings` (rol operador)

Todo lo sensible se explica y edita desde la UI, sin tocar archivos ni reiniciar:

- **Comandos de puerta**: Simulados (solo audit) ↔ Reales (abren de verdad).
- **Credenciales HCT**: host, AppKey y SecretKey con **edición inline**. Viven en cookie de
  este navegador (botón "Olvidar claves de este navegador" las borra).
- **Códigos de verificación** guardados: listar y eliminar.
- **Estado de datos locales**: `data/encryption.json`, `data/audit.jsonl`.

### Usuarios del demo

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin` | operator: todo + comandos + configuración |
| `visor` | `visor` | viewer: solo lectura |

> **Permisos por usuario**: el OpenAPI de Hik-Connect for Teams es a nivel **plataforma**
> (AppKey/SecretKey), no por usuario final. Si un cliente necesita permisos por usuario, los
> implementa en su propio backend/BFF — no en Teams. Los roles de este demo solo ejemplifican
> cómo se vería esa capa.

---

## Cómo se usa

1. **Dashboard** — conteos del tenant (cámaras, puertas, en línea) y accesos rápidos.
2. **Cámaras** — inventario con filtros. Botón **"Sincronizar cifrado"** detecta qué cámaras
   tienen stream cifrado (lotes de 50, dentro del rate limit). Filtrar por **"Sin cifrar"**
   para encontrar cámaras cuyo live funciona sin código.
3. **Detalle de cámara** — live EZOPEN. Si la cámara es cifrada y no hay código guardado,
   la UI lo pide directamente; se guarda localmente solo cuando el player confirma reproducción.
4. **Puertas** — listado con filtros; cada puerta abre su ficha con las 4 acciones remotas
   (con motivo obligatorio + auditoría) y sus marcaciones de 48 h.
5. **Personas** — grupos/departamentos (crear/eliminar) y personas (alta, tarjeta, PIN,
   asignación de nivel, baja).
6. **Niveles** — niveles de acceso del tenant, usuarios de plataforma y la tabla
   **"Lo que el OpenAPI NO expone"** (crear usuarios de consola, RBAC de usuarios finales,
   enrolamiento biométrico sin hardware, estado de hoja de puerta, RTSP/WebRTC).
7. **Marcaciones** — tabla paginada de eventos de acceso de las últimas 48 h.
8. **Configuración** — todo lo editable en caliente (ver arriba).

---

## PPR + Cache Components: qué se usó y por qué

### Qué es

**PPR (Partial Prerendering)** es el modelo de renderizado de Next.js 16: cada página se parte en

1. un **shell estático** (layout, navegación, datos cacheables) que se prerenderiza una vez y se
   sirve al instante, y
2. **huecos dinámicos** envueltos en `<Suspense>` que se streamean después, sin bloquear la carga.

**Cache Components** es el mecanismo que lo activa (`cacheComponents: true` en `next.config.ts`)
y que decide qué entra al shell y qué no, mediante `'use cache'`, `cacheLife()` y `cacheTag()`.

### Dónde se usó en esta POC

| Pieza | Uso | Archivo |
|-------|-----|---------|
| `'use cache'` + `cacheLife` + `cacheTag` | Fixtures **mock** (cámaras, puertas, grupos, niveles) en el shell PPR | `lib/hct/cameras.ts`, `doors.ts`, `persons.ts`, `accessLevels.ts` |
| Inventario **live** | Dinámico por navegador: las claves van en cookie y cada visitante puede ser otro tenant | mismos archivos, sin `'use cache'` en live |
| `revalidateTag(...)` | Botones "Actualizar inventario" / "Sincronizar cifrado" | `app/actions.ts` |
| `<Suspense>` + `await connection()` | Streams EZOPEN, marcaciones y lecturas de cookie de claves | páginas de detalle / events |
| `mode` como argumento | Separa `live` de `mock`; las cookies **no** se leen dentro de `'use cache'` | `lib/hct/*` |

### Por qué se implementó así

1. **El OpenAPI limita a 5 req/s.** En modo `mock`, `'use cache'` evita trabajo repetido. En
   `live` el inventario no se cachea de forma global: cada navegador trae sus propias claves
   (otro tenant) y mezclar listados sería un leak.
2. **Los datos secretos o volátiles nunca se cachean.** Las URLs firmadas EZOPEN (corta vida) y
   las marcaciones van en huecos dinámicos — siempre frescas, nunca en HTML estático.
3. **La UX mejora sin trade-offs:** la página aparece al instante (shell) y los datos vivos van
   llegando (streaming), en vez de elegir entre "todo estático" o "todo dinámico".

### Lo que costó (y queda documentado para quien lo replique)

- El rate limiter de HCT (`lib/hct/rateLimit.ts`) reserva slots por timestamp, **sin cadena de
  promesas de módulo**: un `'use cache'` que espera promesas creadas fuera de su frontera se
  cuelga durante el prerender (`Filling a cache during prerender timed out` / `USE_CACHE_TIMEOUT`).
- Todo `fetch` a HCT lleva `AbortSignal.timeout(15s)`: una conexión colgada ya no puede trabar
  un llenado de caché.
- Los badges de cifrado comparten `cacheTag` con el inventario para no romper la hidratación.

---

## Arquitectura

```
Cliente (browser)
   │  cookie poc_session (login) + cookie poc_hct (claves cifradas de ESTE navegador)
   ▼
Next.js 16 ── Server Components (PPR: shell + Suspense)
   │           ├─ 'use cache' → fixtures mock
   │           └─ dinámico  → live HCT, streams, marcaciones, comandos
   ├── Route Handlers  app/api/*   (BFF)
   ├── Server Actions
   ▼
lib/hct/* ── rate limiter (5 req/s) + token en memoria por AppKey
   ▼
Hik-Connect for Teams OpenAPI ── https://ius.hikcentralconnect.com
```

- **BFF**: el navegador no llama a Hikvision; el servidor usa las claves de la cookie de esa
  petición (en memoria) y no las persiste en disco.
- **Datos locales** (`data/`, gitignored, solo si corres el demo en tu PC): `settings.json`
  (dry-run), `device-codes.json`, `encryption.json`, `audit.jsonl`.
- **EZUIKit self-hosted** en `public/ezuikit/` con `staticPath` local (sin CDN externo) y
  headers COOP/COEP/CORP en `next.config.ts` (el decoder WASM usa `SharedArrayBuffer`).

---

## API propia (BFF)

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login POC → cookie httpOnly |
| POST | `/api/auth/logout` | Cierra sesión |
| GET | `/api/cameras` | Inventario normalizado |
| POST | `/api/cameras/{id}/stream` | Sesión EZOPEN `{url, accessToken, domain, template}`; 409 = falta código |
| POST/DELETE | `/api/cameras/{id}/code` | Guardar / borrar código de verificación local |
| GET | `/api/doors` | Puertas del tenant |
| POST | `/api/doors/{id}/commands` | `{action, reason}`; operator + audit |
| GET | `/api/events?page=&pageSize=` | Marcaciones 48 h paginadas |

---

## Flujo de video live (EZOPEN)

1. `POST /api/cameras/{id}/stream` → servidor: `streamtoken/get` + `live/address/get`
   (`protocol: 1`). Ojo: la doc dice `playUrl`, pero el API real devuelve `data.url`.
2. Si la cámara es cifrada conocida sin código, la UI pide el código directo; si el flag es
   desconocido y HCT responde `EVZ60019`, se cae al mismo prompt como red de seguridad.
3. El reproductor vive en `public/player.html` (página estática, igual que el demo oficial) y la
   app la embebe en un `<iframe>`. **No montar EZUIKit dentro de un componente React**: el SDK
   saca su contenedor del DOM y lo recrea, rompiendo la reconciliación de React.
4. `player.html` usa `staticPath: "/ezuikit/ezuikit_static"` para cargar el decoder WASM local.
5. El log `canvas resize fail` del SDK es **benigno** (el template llama `resize()` antes de que
   el decoder tenga video handle); `player.html` lo suprime para el dev overlay.
6. Al salir del detalle, Next.js 16 **no desmonta** la página anterior (React Activity): el
   cleanup del efecto de `EzopenPlayer` manda `poc:stop` al iframe y vacía su `src` — sin esto,
   el audio de la cámara seguía abierto en el listado.
7. EZOPEN no funciona en `<video>`/VLC; requiere el SDK.

---

## Códigos de verificación

Los códigos de dispositivo **no van en `.env.local` ni en el repo**. Viven en
`data/device-codes.json` (`data/` está en `.gitignore`):

- Si el archivo no existe en la computadora, se crea solo la primera vez que se captura un código.
- Al abrir una cámara cifrada sin código guardado, la UI pide el código directamente.
- **El código se guarda solo cuando el player confirma reproducción real** (`handleSuccess` del
  SDK). HCT acepta cualquier código al crear la sesión (va embebido en la URL `ezopen://`); si es
  incorrecto, la reproducción falla en el player, la UI avisa y **no** se guarda nada.
- Si un código guardado deja de funcionar (rotado), se borra solo y la UI vuelve a pedirlo.
- Guardados y borrados quedan en `data/audit.jsonl`.

---

## Demo script

1. Login como `visor` → dashboard con conteos, cámaras y puertas del tenant real.
2. Entrar a una cámara cifrada → la UI pide el código; al capturarlo se guarda localmente y no
   se vuelve a pedir en esa computadora.
3. Marcaciones: tabla paginada de las últimas 48 h.
4. Login como `admin` → detalle de una puerta, ejecutar "Abrir"; mostrar el rastro en
   `data/audit.jsonl`. En `/settings` alternar Simulados/Reales en vivo.
5. Mostrar `POC_MODE=mock`: misma UI sin tocar el tenant.

---

## Seguridad y secretos

- [x] `.env.local` y `data/` están en `.gitignore` — las claves nunca se commitean.
- [ ] Rotar `HCT_APP_KEY`/`HCT_SECRET_KEY` de laboratorio al cerrar la POC.
- [ ] Cambiar `SESSION_SECRET` y contraseñas seed fuera de dev.
- [ ] No loguear URLs EZOPEN, `appToken` ni códigos de dispositivo.
- [ ] Los comandos de puerta no tienen allowlist: cualquier operator puede abrir cualquier
      puerta en modo REAL. Mantener **Simulados** durante demos sin riesgo.

---

## Limitaciones conocidas

- Sin código de verificación de una cámara cifrada no hay live real (`EVZ60019`).
- `online` de una puerta indica conectividad, no si la hoja está abierta/cerrada.
- HLS/RTMP existen en `live/address/get` pero no aplican con stream cifrado; no hay RTSP/WebRTC
  nativos en el OpenAPI.
- El OpenAPI **no expone**: creación de usuarios de consola, RBAC de usuarios finales,
  enrolamiento biométrico sin hardware, ni estado de hoja de puerta (ver `/levels`).
- COEP `require-corp` rompe CDNs externos: todo asset del visor está self-hosted.
