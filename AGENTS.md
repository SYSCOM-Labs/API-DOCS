# AGENTS.md

Instrucciones para agentes de IA (Claude Code, OpenCode, Kilo) al trabajar en este repositorio.

## Propósito del repositorio

Repositorio público de documentación técnica (en español) de las APIs de integración para las marcas distribuidas por **SYSCOM**. No es una librería ni un servicio — es un sitio de referencia para integradores. La mayor parte del contenido son `README.md` extensos y apéndices Markdown; el código solo aparece en los `demos/` de cada plataforma.

Escribe siempre en español neutro, en el mismo tono cordial/técnico que ya usan los READMEs existentes.

## Estructura jerárquica

```
API-DOCS/
└── <MARCA>/                      # ej. HIKVISION (mayúsculas)
    ├── README.md                 # índice de plataformas de la marca
    └── <Plataforma>/             # ej. HikConnect-Team
        ├── README.md             # documentación completa de la API
        ├── APENDICE-A.md         # códigos de error, diccionarios de datos
        ├── HISTORIAL-ACTUALIZACIONES.md
        ├── docs/                 # PDF oficial del fabricante (no editar)
        └── demos/<nombre>/       # demo ejecutable autocontenido
```

Al agregar una nueva marca, sigue este patrón exacto: crea `<MARCA>/README.md` con una tabla de plataformas y enlázalo desde el `README.md` raíz. Cada plataforma vive en su propia carpeta con su propio README, apéndices, `docs/` y `demos/`.

## Demos: arquitectura dual proxy (local + Cloudflare)

`HIKVISION/HikConnect-Team/demos/video/` es la plantilla a seguir. La API de HikConnect **rechaza llamadas directas desde el navegador por CORS**, así que cada demo necesita un proxy. El demo implementa el mismo proxy de dos formas:

- `server.js` — Express, para desarrollo local (`npm start`, `npm run dev`).
- `worker.js` — Cloudflare Worker, para despliegue público (`npm run deploy`, `npm run cf-dev`).

Ambos archivos comparten exactamente la misma lógica de seguridad: la constante `ALLOWED_DOMAINS` y la función `isAllowedUrl()`. **Si modificas la lista o la validación, debes editarla en los dos archivos** — no hay módulo compartido. El front (`index.html`) llama a `POST /proxy` con `{ url, method, headers, body }` y el proxy reenvía a HikConnect si el dominio está permitido (`hikcentralconnect.com`, `hikcentralconnectru.com`, `ezvizlife.com`).

Otros detalles que conviene preservar al tocar el demo:

- `wrangler.toml` usa `[assets] directory = "."` — el Worker sirve toda la carpeta del demo como assets estáticos, y `.assetsignore` excluye lo que no debe subir (server.js, node_modules, etc.). Si agregas archivos no-web, actualiza `.assetsignore`.
- `worker.js` borra el header `host` antes de reenviar (Cloudflare no permite reenviarlo).
- `server.js` usa un `httpsAgent` con `rejectUnauthorized: false` — es intencional para el demo; no replicarlo en código de producción.
- Requiere Node >= 22 (declarado en `engines`).

## Comandos

Desde `HIKVISION/HikConnect-Team/demos/video/`:

```bash
npm install
npm start            # servidor local en http://localhost:3000
npm run dev          # mismo, con nodemon
npm run cf-dev       # prueba local del Worker con wrangler
npm run deploy       # despliega a Cloudflare (requiere wrangler login)
```

No hay tests, linter ni build configurados en el repo. No los inventes a menos que el usuario lo pida.

## Convenciones de escritura para los READMEs

- Tablas con columna **Estado** (✅ Disponible, 🚧 En desarrollo, etc.) para listar marcas/plataformas/demos.
- Bloques `> **Notas:**` para advertencias importantes (límites de tiempo, restricciones regionales, intervalos de polling).
- Referencias cruzadas relativas (`./demos/video/README.md`), no URLs absolutas.
- El README de cada plataforma encabeza con versión del documento y fecha (`> Versión del documento: V2.15.0 — Marzo 2026`).
