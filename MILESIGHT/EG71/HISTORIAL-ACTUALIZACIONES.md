> ← Volver a la [Descripción general de la plataforma (EG71)](README.md) · [Guía de integración por API](API-GATEWAY.md) · [Apéndice A](APENDICE-A.md)

## Historial de Actualizaciones

### V1.0 — Septiembre 2026

Publicación inicial de la plataforma **Milesight EG71** (gateway building IoT: LoRaWAN + BAS fieldbus + I/O). Incluye:

1. **Descripción general** del hardware, modelos, certificaciones y casos de uso (integrador LoRaWAN, integrador BMS, edge).
2. **Mapa de superficies HTTP**: backend CGI (`POST /cgi`, configuración de red/sistema) vs REST (`/api/*`, Data Services: dispositivos, codecs, forwarding, NS LoRaWAN).
3. **Guía de integración por API** ([API-GATEWAY](./API-GATEWAY.md)): autenticación dual (CGI `login=…;<td>` + REST JWT, con clave/IV AES fijos del firmware), referencia CGI `core/base`, endpoints REST de Equipment Data (LoRaWAN/BACnet/Modbus/KNX), descubrimiento BACnet/IP (scan), access networks, data forwarding (MQTT/HTTP/BACnet/Modbus), codecs, NS LoRaWAN y visor de data flow. Incluye los *gotchas* verificados en firmware 71.0.0.2/71.0.0.3 (`isSave:true`, lectura agregada, conflicto de puerto BACnet, esquema plano de topics MQTT).
4. **Guía de integración por flujo**: conectar sensores LoRaWAN, prerrequisitos BACnet/IP, reenvío a nube/BMS (MQTT/HTTP/BACnet/Modbus), conexión a BMS (Niagara/Tridium), downlink/control, edge (Node-RED/Python/Docker), red y acceso remoto, plataforma y flota.
5. **Apéndice A** con catálogo de endpoints REST, errCodes observados, mapa `core/base` CGI y mapas de tipos del visor de data flow.
6. **PDFs oficiales del fabricante** en [`docs/`](./docs/): datasheet, installation guide y administrator guide.
7. **Espejo local** del material original del fabricante (Markdown) en [`docs/llms/`](./docs/llms/), con su `llms.txt` router.
8. **Enrutador `llms.txt`** local para agentes de IA.

> Documento educativo basado en el material oficial del fabricante (incluido en [`docs/`](./docs/)). Todos los valores de ejemplo son ilustrativos. Para parámetros y comportamientos exactos, consulta siempre el documento oficial correspondiente a tu firmware.

---

> ← Volver a la [Descripción general de la plataforma (EG71)](README.md) · [Guía de integración por API](API-GATEWAY.md) · [Apéndice A](APENDICE-A.md)
