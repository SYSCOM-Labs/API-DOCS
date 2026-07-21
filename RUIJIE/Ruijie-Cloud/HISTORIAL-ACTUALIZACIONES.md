> ← Volver a la [Documentación de la API (Ruijie Cloud)](README.md) · [Apéndice A](APENDICE-A.md)

## Historial de Actualizaciones

### V1.0 — Julio 2026

Publicación inicial de la guía de integración de la **API REST de Ruijie Cloud** para plataformas de terceros (MSP, CRM, ERP y aplicaciones a la medida). Basada en el *Ruijie Cloud API Reference Manual V2.0.3*. Incluye:

1. **Descripción general** de la plataforma y el modelo de integración petición REST + token.
2. **Conceptos clave** e identificadores (`appid`/`secret`, `accessToken`, `groupId`, `sn`, `common_type`, `ssidName`, `codeNo`).
3. **Conexión y autenticación:** URL base (`cloud-as.ruijienetworks.com`), obtención de token (`appid` + `secret` → `accessToken`), ciclo de vida del token (30 días / 30 min de inactividad), keep-alive y refresco.
4. **Referencia de API** organizada por familias:
   - **Auth/Cuenta:** `access_token`, `token/refresh`, `org/account/info`
   - **Grupos:** `group/single/tree`, `open/v1/group`
   - **Dispositivos:** `maint/devices`, `device/{sn}`, `current_performance`, puertos de switch, PoE (`poe/info`, `poe/pwr`), puertos de gateway, `devicemgtlogs`, tráfico 24 h
   - **WiFi:** `open/v1/wifi`
   - **Usuarios/Vouchers:** cuentas (crear/listar/actualizar/eliminar/restablecer/resumen) y vouchers (crear/personalizado/listar)
   - **Monitoreo:** clientes conectados, historial de clientes, tráfico por aplicación, tendencia de tráfico por puerto
5. **Formato de respuesta y códigos:** estructura `{code, msg, data}`, convención de rangos de `code` y tabla de códigos de error.
6. **Ejemplo completo end-to-end** (alta de sucursal + publicación de WiFi) y **cliente Python** de referencia.
7. **Buenas prácticas**, **solución de problemas** y **checklist de integración**.
8. **Apéndice A** con diccionarios de datos (conexión, endpoints, ciclo de vida del token, códigos de respuesta y error, modos de cifrado WiFi, jerarquía de grupos, granularidad de tráfico, límites, campos de respuesta y glosario).

> Documento educativo basado en el *Ruijie Cloud API Reference Manual V2.0.3*. Todos los valores son ficticios. Para parámetros y comportamientos exactos, consulta siempre el manual oficial que corresponda a tu versión y región.

---

> ← Volver a la [Documentación de la API (Ruijie Cloud)](README.md) · [Apéndice A](APENDICE-A.md)
