# MILESIGHT — Integraciones disponibles

Documentación técnica de las plataformas y APIs de **Milesight** distribuidas por **SYSCOM**.

> **Sobre la marca.** Milesight (Xiamen Milesight IoT Co., Ltd.) es un fabricante de productos IoT: gateways y sensores LoRaWAN, cámaras de videovigilancia con IA y routers celulares 4G/5G. Las APIs documentadas aquí corresponden a sus **gateways LoRaWAN con Network Server (NS) embebido**, que permiten recibir datos de los dispositivos finales, enviar downlinks y administrar el NS sin depender de un servidor LoRaWAN externo.

## Plataformas

| Plataforma | Descripción | Estado |
| ---------- | ----------- | ------ |
| [SG50 / UG63 — API MQTT](./SG50-UG63/README.md) | API **MQTT** del Network Server embebido de los gateways SG50 (solar) y UG63: topics de datos con comodín `$deveui`, uplink/downlink, notificaciones Join/ACK, información del gateway y administración de dispositivos por mensajes request/response | ✅ Disponible |
| [UG65 / UG67 — API REST](./UG65-UG67/README.md) | API **REST HTTP** del Network Server embebido de los gateways UG65 y UG67: autenticación JWT, consulta de aplicaciones y dispositivos, uplink por HTTP Streaming y cola de downlink | ✅ Disponible |

> **Nota:** cada familia de gateways expone una API distinta. **SG50/UG63** se integran por **MQTT** (mensajes JSON contra un broker); **UG65/UG67** por **HTTP REST** (`https://<ip-gateway>:8080/api`, token JWT). Verifica el modelo de tu gateway antes de elegir la guía.

## Recursos de la plataforma SG50 / UG63 (API MQTT)

| Recurso | Descripción |
| ------- | ----------- |
| [Documentación de la API (SG50/UG63)](./SG50-UG63/README.md) | Guía completa de integración: topics de datos, formatos JSON, administración de dispositivos del NS por request/response, buenas prácticas y troubleshooting |
| [Apéndice A — códigos y ajustes regionales](./SG50-UG63/APENDICE-A.md) | Códigos de retorno, ajustes por defecto de RX2/Ping Slot por región LoRaWAN y diccionarios de datos |
| [Historial de actualizaciones](./SG50-UG63/HISTORIAL-ACTUALIZACIONES.md) | Cambios del documento por versión |
| [PDF oficial del fabricante](./SG50-UG63/docs/) | *MQTT API Specification — SG50/UG63* (documento original en inglés) |

## Recursos de la plataforma UG65 / UG67 (API REST)

| Recurso | Descripción |
| ------- | ----------- |
| [Documentación de la API (UG65/UG67)](./UG65-UG67/README.md) | Guía completa de integración: autenticación, referencia de endpoints, uplink por streaming, cola de downlink, buenas prácticas y troubleshooting |
| [Apéndice A — endpoints y diccionarios](./UG65-UG67/APENDICE-A.md) | Resumen de endpoints, ciclo de vida del token, formato de errores y diccionarios de datos |
| [Historial de actualizaciones](./UG65-UG67/HISTORIAL-ACTUALIZACIONES.md) | Cambios del documento por versión |
| [PDF oficial del fabricante](./UG65-UG67/docs/) | *Milesight UG6x API Documentation* (documento original en inglés) |

## Volver

| Sección | Enlace |
| ------- | ------ |
| Índice de marcas | [../README.md](../README.md) |
| HIKVISION — índice de plataformas | [../HIKVISION/README.md](../HIKVISION/README.md) |
| HIKROBOT — índice de plataformas | [../HIKROBOT/README.md](../HIKROBOT/README.md) |
| RUIJIE — índice de plataformas | [../RUIJIE/README.md](../RUIJIE/README.md) |
