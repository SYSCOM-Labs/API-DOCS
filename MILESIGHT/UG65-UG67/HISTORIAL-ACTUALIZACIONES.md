> ← Volver a la [Documentación de la API (UG65/UG67)](README.md) · [Apéndice A](APENDICE-A.md)

## Historial de Actualizaciones

### V1.0 — Agosto 2026

Publicación inicial de la guía de integración en español de la **API REST del Network Server embebido** de los gateways Milesight UG65/UG67, basada en el documento oficial *Milesight UG6x API Documentation* (13 de abril de 2021, única versión publicada por el fabricante). Incluye:

1. **Autenticación:** login con JWT (vigencia de 24 horas) y cambio de contraseña.
2. **Applications:** listado paginado y consulta por nombre, con scripts de codec de payload.
3. **Devices:** listado paginado y consulta por nombre, con llaves y estado de activación.
4. **Datos de uplink:** stream en tiempo real por HTTP Streaming (`/api/urpackets`) y consulta por dispositivo (`payloadJSON`).
5. **Cola de downlink:** consulta, encolado y vaciado — incluida la operación *flush* (`DELETE /api/devices/{devEUI}/queue`), que en el documento original no aparece en el índice pero sí en el cuerpo.
6. **Buenas prácticas**, **solución de problemas** (error `code: 13`, streaming, doble parseo de `payloadJSON`) y **checklist de integración**.
7. **Apéndice A** con resumen de los 11 endpoints, ciclo de vida del token, formato de errores y diccionarios de datos.

> Documento educativo basado en el material oficial del fabricante (incluido en [`docs/`](./docs/)). Todos los valores de ejemplo son ilustrativos. Para parámetros y comportamientos exactos, consulta siempre el documento oficial correspondiente a tu firmware.

---

> ← Volver a la [Documentación de la API (UG65/UG67)](README.md) · [Apéndice A](APENDICE-A.md)
