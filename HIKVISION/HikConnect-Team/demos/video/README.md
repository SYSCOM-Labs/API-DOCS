# Demo Video — HikConnect Teams OpenAPI

Demo interactivo que muestra cómo autenticarse con la API de HikConnect Teams, explorar áreas y cámaras, y reproducir video en vivo usando EZUIKit.

![Demo — Video en vivo](./ejemplo.png)

## Requisitos

- Node.js >= 22

## Instalación y uso

```bash
cd API-DOCS/HIKVISION/HikConnect-Team/demos/video
npm install
npm start
```

Abre el navegador en `http://localhost:3000`.

## Pasos en la interfaz

1. **Autenticación** — Selecciona tu región, ingresa App Key y Secret Key, y haz clic en _Iniciar sesión_.
2. **Áreas** — Se carga automáticamente el árbol de áreas de tu cuenta. Haz clic en un área para ver sus cámaras.
3. **Cámaras** — Haz clic en ▶ junto a cualquier cámara para reproducir el video en vivo.

## Despliegue en Cloudflare Workers

El demo incluye `worker.js` y `wrangler.toml` para desplegarlo como Cloudflare Worker.

```bash
npm install
npm run deploy        # despliega en Cloudflare
npm run cf-dev        # prueba local con wrangler dev
```

El Worker sirve los archivos estáticos (`index.html`, `ezuikit.js`, etc.) y maneja el endpoint `/proxy` con la misma lógica de validación de dominios que el servidor local.

## Estructura

```
API-DOCS/hikvision/HikConnect-Team/demos/video/
├── index.html          # Interfaz del demo (dark UI, EZUIKit)
├── server.js           # Proxy Node.js/Express — desarrollo local
├── worker.js           # Cloudflare Worker — proxy + assets
├── wrangler.toml       # Configuración de despliegue en Cloudflare
├── .assetsignore       # Excluye archivos no web del bundle
├── package.json
├── ezuikit.js          # SDK de reproducción de Hikvision
└── ezuikit_static/     # Assets estáticos del SDK (WASM, CSS, imágenes)
```

## Nota sobre CORS

Los endpoints de HikConnect no aceptan solicitudes directas desde el navegador. Tanto `server.js` (local) como `worker.js` (Cloudflare) actúan como proxy: las llamadas a la API se envían a `/proxy` y se reenvían a HikConnect. Solo se permiten dominios de Hikvision (`hikcentralconnect.com`, `hikcentralconnectru.com`, `ezvizlife.com`).

## Referencias

| Documento | Ubicación |
| --------- | --------- |
| Documentación API (ES) | [../../README.md](../../README.md) |
| Apéndice A (códigos de error y diccionarios) | [../../APENDICE-A.md](../../APENDICE-A.md) |
| Historial de actualizaciones | [../../HISTORIAL-ACTUALIZACIONES.md](../../HISTORIAL-ACTUALIZACIONES.md) |
| Developer Guide V2.15.0 (PDF oficial) | [../../docs/](../../docs/) |
| Demo — Hikauto (Fleet API Playground) | [../Hikauto/README.md](../Hikauto/README.md) |
| Skill para agentes (ClawHub) | [../../../HikConnect-Team-Skill/README.md](../../../HikConnect-Team-Skill/README.md) |
