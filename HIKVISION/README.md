# HIKVISION — Integraciones disponibles

Documentación técnica de las plataformas y APIs de Hikvision distribuidas por **SYSCOM**.

## Plataformas

| Plataforma | Descripción | Estado |
| ---------- | ----------- | ------ |
| [Hik-Connect Team](./HikConnect-Team/README.md) | HikConnect for Teams OpenAPI — Video VSaaS, control de acceso y alarmas | ✅ Disponible |
| [Hik DeviceGateway](./HikGateway/README.md) | Gateway on-premise: API REST ISAPI/JSON unificada para dispositivos de video y control de acceso, con autenticación HTTP Digest (MD5) | ✅ Disponible |

## Demos

| Demo | Descripción | Estado |
| ---- | ----------- | ------ |
| [Video en vivo](./HikConnect-Team/demos/video/README.md) | Autenticación, exploración de áreas/cámaras y reproducción de video en vivo con EZUIKit | ✅ Disponible |
| [Hikauto — Fleet API Playground](./HikConnect-Team/demos/Hikauto/README.md) | Monitoreo a bordo: flota, conductores, ACC, telemetría GPS (MQ), mapa Leaflet y video EZUIKit | ✅ Disponible |
| [Consola de integración (HikGateway)](./HikGateway/demos/gateway/README.md) | Dispositivos, explorador de API ISAPI, control de acceso y video en vivo con PTZ; proxy dual (local + Cloudflare) que resuelve el Digest | ✅ Disponible |

## Contexto para agentes de IA

| Archivo | Descripción | Estado |
| ------- | ----------- | ------ |
| [llms.txt](./HikConnect-Team/llms.txt) | Enrutador de capacidades de la OpenAPI de HCT: reglas críticas, mapeo de regiones, flujo de autenticación, 13 áreas de capacidad y reglas de decisión para dirigir al agente a la sección correcta | ✅ Disponible |
| [llms-full.txt](./HikConnect-Team/llms-full.txt) | Referencia completa de la OpenAPI de HCT: los 115 endpoints con parámetros y ejemplos de solicitud/respuesta, las guías de integración de video (JSDecoder SDK web, Mobile SDK Android/iOS, HLS/RTMP) y los apéndices A.1–A.4 (diccionario de datos, formatos, objetos y códigos de error) | ✅ Disponible |

## Recursos externos

| Recurso | Descripción |
| ------- | ----------- |
| [Hik-Connect Team Skill](./HikConnect-Team-Skill/README.md) | Skill de ClawHub que envuelve la OpenAPI de HCT para que un agente automatice operaciones de gestión de dispositivos, control de acceso, captura de imagen, streaming de video y alarmas — sin necesidad de implementar un cliente HTTP propio |
