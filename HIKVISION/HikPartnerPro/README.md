# Hik-Partner Pro — OpenAPI V2.15.500

> Producto: **Hik-Partner Pro** (HPP)  
> Gateway: `/api/hpcgw/` · Token inicial: `https://api.hik-partner.com`  
> Destinatarios: integradores SYSCOM que operan instalaciones (sitios, dispositivos, alarmas, audio, ARC)

Hik-Partner Pro es la plataforma de **instalador / partner**. No es Hik-Connect for Teams (HCT): el prefijo es `hpcgw`, no `hccgw`. El recuento de sitios, el handover a cliente y el cut-in de IP Speaker son propios de HPP.

---

## Demos disponibles

| Demo | Descripción |
| ---- | ----------- |
| [OpenAPI Lab + Torre de control](./demos/OpenAPI-Lab/README.md) | Laboratorio Next.js: prueba de endpoints REST 2.15.500 y panel operativo por sitio (inventario, salud, MQ, evidencia, exportación) |

---

## Documentación

| Recurso | Ubicación |
| ------- | --------- |
| Guía de prueba del laboratorio | [demos/OpenAPI-Lab/README.md](./demos/OpenAPI-Lab/README.md) |
| Códigos de error usados en el lab | [APENDICE-A.md](./APENDICE-A.md) |
| Notas de versión 2.15.500 | [HISTORIAL-ACTUALIZACIONES.md](./HISTORIAL-ACTUALIZACIONES.md) |
| PDFs oficiales del fabricante | [docs/](./docs/) — [OpenAPI Developer Guide V2.15.500](./docs/Hik-Partner%20Pro%20OpenAPI%20Developer%20Guide_V2.15.500_20260904.pdf) |

La guía OpenAPI de Hikvision está en [docs/](./docs/). El laboratorio no duplica el texto del PDF.

---

## Capítulo 1 — Descripción general

Hik-Partner Pro agrupa **sitios** (instalaciones). Cada dispositivo pertenece a un sitio. El OpenAPI permite:

- Autenticación por AppKey / SecretKey (token 7 días)
- CRUD de sitios, compartición, managers, handover a cuenta de cliente, team sites
- Inventario de dispositivos, canales, PIN, firmware, wake-up
- Cola MQ de eventos (`subscribe` / `messages` / `offset`) y fotos `ISAPI_FILES`
- Armado / desarmado de paneles
- Webhook HTTPS (push; incompatible con poll MQ en la misma AppKey)
- ARC (central receptora, credenciales propias)
- Audio de IP Speaker (categoría 12 / subtipo 19): biblioteca, cut-in, TTS, playlist
- VAS O&M, hot spare, búsqueda de instaladores
- Reenvío transparente ISAPI y OTAP

**Fuera de este OpenAPI REST:** live view, playback, descarga e intercom de cámara (HPNetSDK / VSaaS). No hay `video/by/time` en 2.15.500.

### Cómo obtener credenciales

En Hik-Partner Pro: **Site & Device → My Service → API Integration**. AppKey y SecretKey no se suben a git.

### Orden de lectura

1. Autenticación (`token/get` → usar `areaDomain` de la respuesta).
2. Sitios y dispositivos.
3. Eventos MQ o webhook (elige uno).
4. Módulos específicos (audio, ISAPI, ARC).
5. Demo Torre de control para un flujo de supervisión.

---

## Capítulo 2 — Protocolo

| Regla | Detalle |
| ----- | ------- |
| HTTPS + JSON UTF-8 | Casi todas las rutas son POST |
| Header | `Token: {accessToken}` |
| Token | 7 días; renovar antes de caducar |
| Primera URL | `POST https://api.hik-partner.com/api/hpcgw/v1/token/get` |
| Resto | `https://{areaDomain}/api/hpcgw/...` — **no** hardcodear el dominio |
| Respuesta | `{ errorCode, message, data }` · éxito = `"0"` |
| MQ | Tras `messages`, ACK con `mq/offset` (`batchId`) o el lote se reenvía |
| Webhook | Callback 2xx en &lt; 5 s; al activarlo el poll MQ puede vaciarse |

No inventar endpoints. Si no está en el PDF 2.15.500 ni en el laboratorio, no existe en esta versión.

---

## Capítulo 3 — Aplicaciones típicas

### 3.1 Supervisión por instalación (demo Torre de control)

1. `token/get`
2. `site/search` + `device/list`
3. Filtrar por `siteID`
4. `mq/subscribe` (`subMode: all` o `list`)
5. Loop `mq/messages` (~20 s) + `mq/offset`
6. Opcional: `alarm/pictureurl` para `ISAPI_FILES`
7. `mq/subscribe` `subType: 0` al salir

### 3.2 Aviso por altavoz IP

1. Subir archivo (proxy multipart del lab o upload HPP)
2. `audio/file/add` por serial → `customAudioID` **local al equipo**
3. `audio/inter/cut` con `audioVolume`, `audioLevel`, `playAudioList`
4. TTS no requiere ID; playlist mezcla archivos y TTS (`order` / `loop`)
5. Parar: `enabled: false`

### 3.3 Alta de instalación

1. `site/add` (timeZone apéndice A.3)
2. `v2/device/add` con serial + siteId
3. Compartir o handover cuando corresponda

---

## Relación con otras plataformas HIKVISION de este repo

| Plataforma | Cuándo usarla |
| ---------- | ------------- |
| **Hik-Partner Pro** (esta carpeta) | Instalador: sitios, flota de equipos, MQ partner, IP Speaker, ARC |
| [Hik-Connect Team](../HikConnect-Team/README.md) | VSaaS de usuario: video EZOPEN, personas, asistencia, flota onboard |
| [Hik DeviceGateway](../HikGateway/README.md) | On-premise, ISAPI Digest directo al NVR/ACS |

---

## Aviso legal

Documentación de integración SYSCOM. El producto Hikvision se ofrece según sus términos. SYSCOM no reproduce el PDF oficial. Usa equipos de laboratorio para operaciones destructivas (delete, upgrade, defence, cut-in).
