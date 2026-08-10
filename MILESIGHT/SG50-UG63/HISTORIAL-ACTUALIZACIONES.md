> ← Volver a la [Documentación de la API (SG50/UG63)](README.md) · [Apéndice A](APENDICE-A.md)

## Historial de Actualizaciones

### V1.0 — Agosto 2026

Publicación inicial de la guía de integración en español de la **API MQTT del Network Server embebido** de los gateways Milesight SG50/UG63, basada en el documento oficial *MQTT API Specification — SG50/UG63* (última revisión del fabricante: 16 de julio de 2025). Incluye:

1. **Descripción general** del modelo gateway (NS embebido) ↔ broker MQTT ↔ plataforma.
2. **Topics de datos configurables** (uplink, downlink, Join, ACK, Gateway Info, Request/Response) y el comodín `$deveui`.
3. **Formatos JSON** de los cuatro reportes del gateway: Uplink Data, Join Notification, ACK Notification y Gateway Info (con campos exclusivos por modelo).
4. **Downlink Data** (publicación de comandos en Base64).
5. **Administración del NS por request/response:** 5 operaciones (`/ns/device/add`, `/ns/device`, `/ns/device` query, `/ns/device/{devEUI}`, `/gatewayinfo`).
6. **Buenas prácticas**, **solución de problemas** y **checklist de integración**.
7. **Apéndice A** con códigos de retorno, enumeraciones (estados de batería, módem, WAN) y ajustes por defecto de RX2/Ping Slot para las 11 regiones LoRaWAN soportadas.

#### Revisiones del documento del fabricante

| Fecha | Firmware aplicable | Cambio |
| ----- | ------------------ | ------ |
| 12 de abril de 2025 | 64.0.0.3 / 50.0.0.4 | Versión inicial de la especificación. |
| 19 de mayo de 2025 | 64.0.0.3-r1 / 50.0.0.4-r1 | Se agrega la consulta de información del gateway (`GET /gatewayinfo`). |
| 16 de julio de 2025 | 64.0.0.3-r2 / 50.0.0.4-r2 | Se agrega el comodín (*wildcard*) `$deveui` a los topics. |

> Documento educativo basado en el material oficial del fabricante (incluido en [`docs/`](./docs/)). Todos los valores de ejemplo son ilustrativos. Para parámetros y comportamientos exactos, consulta siempre el documento oficial correspondiente a tu firmware.

---

> ← Volver a la [Documentación de la API (SG50/UG63)](README.md) · [Apéndice A](APENDICE-A.md)
