# HikISAPI — Demos de integración por ISAPI

> Estado del documento: demos disponibles — Noviembre 2026

**ISAPI** es la interfaz HTTP nativa de los dispositivos Hikvision (NVR/DVR, cámaras, controles de acceso). Se consume directamente sobre la red local del equipo, con autenticación HTTP Digest, sin pasar por la nube de Hik-Connect.

Esta carpeta reúne **demos ejecutables** que consumen ISAPI directamente contra un grabador. La documentación de referencia de ISAPI como tal aún no forma parte de este repositorio.

## Demos

| Demo | Descripción | Estado |
| ---- | ----------- | ------ |
| [Playback Pádel](./demos/PlaybackPadel/README.md) | Panel local que extrae la última jugada de una cancha: lee la hora del NVR, retrocede 15, 30, 45 o 60 s y descarga el tramo en MP4 | ✅ Disponible |

## Endpoints ISAPI utilizados por los demos

| Endpoint | Método | Uso |
| -------- | ------ | --- |
| `/ISAPI/System/deviceInfo` | GET | Verificar conexión y leer datos del equipo |
| `/ISAPI/ContentMgmt/InputProxy/channels` | GET | Listar los canales reales del grabador |
| `/ISAPI/System/time` | GET | Leer la hora local del NVR para calcular el tramo |
| `/ISAPI/ContentMgmt/search?TimeType=local` | POST | Buscar la grabación del tramo solicitado |
| `/ISAPI/ContentMgmt/download` | POST | Descargar el clip |

> **Notas:**
> - Estos demos se ejecutan **en la misma red que el grabador**; no usan proxy de Cloudflare como los demos de HikConnect, porque ISAPI no se consume desde el navegador sino desde un servidor local.
> - La IP, el usuario y la contraseña del grabador se guardan solo en `data/config.json` de cada instalación y están excluidos del control de versiones.
