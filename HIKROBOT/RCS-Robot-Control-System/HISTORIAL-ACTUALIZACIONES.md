> ← Volver a la [Documentación de la API (RCS)](README.md) · [Apéndice A](APENDICE-A.md)

## Historial de Actualizaciones

### V1.0 — Julio 2026

Publicación inicial de la guía de integración de la **API REST del RCS (Robot Control System)** de Hikrobot para control de logística interna con flotas de robots AMR/AGV. Incluye:

1. **Descripción general** del modelo host ↔ RCS y el patrón de integración petición + callback.
2. **Conceptos clave** e identificadores (`mapCode`, `positionCode`, `podCode`, `wbCode`, `taskCode`, `agvCode`).
3. **Conexión y autenticación:** prefijos de servicio (`hikRpcService`, `rcms-dps/rest`, `hikTpsService`), campos meta (`reqCode`, `reqTime`, `clientCode`, `tokenCode`) y recomendaciones de transporte.
4. **Referencia de 8 endpoints:**
   - `queryAgvStatus` — estado de robots de un mapa
   - `genAgvSchedulingTask` — crear tarea de transporte
   - `queryTaskStatus` — consultar estado de tareas
   - `cancelTask` — cancelar tarea (`forceCancel`)
   - `continueTask` — continuar tarea multi-etapa
   - `setTaskPriority` — re-priorizar tareas
   - `queryPodBerthAndMat` / `getBerthInfoByPodCode` — ubicación de anaqueles
   - `bindPodAndBerth` — vincular/desvincular anaquel ↔ ubicación
5. **Ciclo de vida de la tarea y callbacks** (`start`, `notifyPodArr`, `outbin`, `end`, `cancel`) con acuse idempotente.
6. **Ejemplo completo end-to-end** (traer un anaquel a picking y regresarlo).
7. **Buenas prácticas**, **solución de problemas** (gotchas) y **checklist de integración**.
8. **Apéndice A** con diccionarios de datos (prefijos, campos meta, estados de tarea, códigos `type`, banderas de control, eventos de callback, códigos de respuesta y glosario).

> Documento educativo basado en material de referencia interno de SYSCOM. Todos los valores son ficticios. Para parámetros y comportamientos exactos, consulta siempre el manual oficial de la API de tu versión de RCS de Hikrobot.

---

> ← Volver a la [Documentación de la API (RCS)](README.md) · [Apéndice A](APENDICE-A.md)
