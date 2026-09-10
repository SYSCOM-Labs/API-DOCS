> ← Volver a la [Documentación de la API (UG65/UG67)](README.md) · [Apéndice A](APENDICE-A.md)

## Historial de Actualizaciones

### V1.1 — Septiembre 2026

Se amplía la cobertura del gateway UG65 con una nueva superficie documentada:

1. **Nueva guía [API-GATEWAY](./API-GATEWAY.md):** superficie HTTP completa del gateway — backend **CGI** (`POST /cgi`, todo lo de la Web GUI) + **REST** extendido del Network Server embebido (estilo ChirpStack). Basada en el *UG65 HTTP & API / Integration Guide* del fabricante (verificado contra firmware 60.0.0.49), con espejo local del material original en [`docs/llms/`](./docs/llms/).
2. **Corrección de alcance:** la REST descrita en el PDF oficial (README, V1.0) es de solo consulta/encolado; la superficie CGI+REST ahora documentada sí permite crear/borrar dispositivos, applications e integraciones. El README enlaza a la nueva guía.
3. **En el [Apéndice A](./APENDICE-A.md):** se agregaron el mapa `core/base` de los módulos CGI y los códigos de sesión CGI (`-32001`/`-2`, `ystimeout`), además de endpoints REST del NS no documentados en el PDF (`/api/urdevices` agregado, `/api/urprofiles`, integraciones por application).
4. **Enrutador `llms.txt`** local para agentes de IA que orienta hacia las dos superficies (CGI / REST NS) y sus reglas críticas (autenticación, lectura agregada, rate limit).

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
