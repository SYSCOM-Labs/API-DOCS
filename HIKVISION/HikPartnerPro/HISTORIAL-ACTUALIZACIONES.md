> ← [Hik-Partner Pro](README.md) · [Apéndice A](APENDICE-A.md) · [OpenAPI Lab](demos/OpenAPI-Lab/README.md)

### Historial relevante para el laboratorio (OpenAPI V2.15.500)

Esta nota no sustituye el PDF oficial. Resume lo que el laboratorio implementa y lo que **ya no** está en REST 2.15.500.

#### V2.15.500 — base del laboratorio SYSCOM

Cubierto en el OpenAPI Lab:

- Token regional (`token/get` + `areaDomain`)
- Sitios, compartición, managers, handover, team sites
- Dispositivos, cámaras, nube, PIN, upgrade, wake-up
- MQ subscribe / messages / offset, pictureurl, defence
- Webhook config
- ARC
- Audio file + inter/cut (IP Speaker)
- VAS opspack
- Hot spare
- Installers search
- Reenvío ISAPI / OTAP

Retirado o fuera de REST (no implementar contra hpcgw):

- `site/health/report`
- `device/iot/ability/query` y `iot/add/result`
- `video/by/time`
- Cloud attendance
- Live / playback / two-way (HPNetSDK)

#### Laboratorio — septiembre 2026

1. Laboratorio Next.js con proxy de cookies `httpOnly` y formularios por módulo.
2. **Torre de control** (`/demo`): alcance todos/sitio, métricas, ranking, MQ, evidencia, export JSON/CSV.
3. Audio: selector de altavoces, volumen por barra en el payload de cut, playlist, stop, biblioteca al elegir equipo.
4. MQ compartido con unsubscribe al detener.
5. Paleta alineada a marca HikPartner (rojo de marca vs verde/ámbar/rojo semánticos).
