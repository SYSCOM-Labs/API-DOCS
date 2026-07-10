> ← Volver a la [Documentación de la API (RCS)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice A — Diccionarios de Datos

Tablas de referencia rápida para la API REST del RCS de Hikrobot. Todos los valores son ficticios; los códigos y comportamientos exactos dependen de tu versión y configuración de RCS.

---

### A.1 Prefijos de servicio

| Prefijo | Uso |
| ------- | --- |
| `/rcms/services/rest/hikRpcService` | Tareas y vínculos (crear, cancelar, continuar, consultar tarea, ubicar/vincular anaqueles…). |
| `/rcms-dps/rest` | Consultas de estado de robots. |
| `/rcms/services/rest/hikTpsService` | Consultas centradas en anaqueles (posición/berth). |

---

### A.2 Campos meta (presentes en toda petición)

| Campo | Tipo | Descripción |
| ----- | ---- | ----------- |
| `reqCode` | string | Identificador único de la petición (p. ej. 16 hexadecimales aleatorios). Clave para **idempotencia y trazabilidad**. |
| `reqTime` | string | Marca de tiempo de la petición, formato `YYYY-MM-DD HH:MM:SS`. |
| `clientCode` | string | Identificador de la aplicación cliente (etiqueta de auditoría). |
| `tokenCode` | string | Token de la aplicación (etiqueta de auditoría). |

> **Nota:** en algunas ediciones (p. ej. "Lite"), `clientCode`/`tokenCode` son solo etiquetas de auditoría y el acceso se controla por lista blanca de IP. En otras ediciones se valida firma/HMAC. Consulta el manual de tu versión.

---

### A.3 Estados de tarea — `taskStatus`

| Valor | Significado |
| ----- | ----------- |
| 0 | Excepción al enviar |
| 1 | Creada |
| 2 | En ejecución |
| 3 | Enviando |
| 4 | Cancelando |
| 5 | Cancelada |
| 6 | Reenviando |
| 9 | Completada |
| 10 | Interrumpida |

> Una tarea en cola suele reportar `2` con `agvCode` vacío; en cuanto se asigna `agvCode`, ya hay un robot trabajando en ella.

---

### A.4 Códigos `type` en `positionCodePath`

Cada punto de la ruta lleva un `type` que indica qué representa ese punto dentro de la tarea. **Los valores concretos son configurables en el RCS**; los que aparecen en los ejemplos de esta guía son:

| `type` | Rol del punto (ejemplo) |
| ------ | ----------------------- |
| `03` | Origen del anaquel (punto donde el robot recoge el pod). |
| `00` | Estación destino (workstation donde se surte/reabastece). |

> Confirma el catálogo completo de `type` (origen, estación, punto de regreso, etc.) en el manual de tu versión de RCS.

---

### A.5 Banderas de control

| Campo | Endpoint | Valores | Significado |
| ----- | -------- | ------- | ----------- |
| `forceCancel` | `cancelTask` | `"0"` (por defecto) | El robot **deja el anaquel donde esté** y libera la tarea. |
| `forceCancel` | `cancelTask` | `"1"` | El robot **regresa el anaquel al área de almacén** antes de liberar. |
| `indBind` | `bindPodAndBerth` | `"1"` | **Vincula** anaquel ↔ ubicación. |
| `indBind` | `bindPodAndBerth` | `"0"` | **Desvincula** anaquel ↔ ubicación. |
| `podDir` | `bindPodAndBerth` | según config | Orientación del anaquel al vincularlo (p. ej. `"0"`). |

---

### A.6 Eventos de callback (RCS → Host)

El RCS notifica el avance de la tarea a tu URL de callback. Los nombres exactos dependen de la versión/configuración; un conjunto representativo:

| Evento (`method`) | Momento típico |
| ----------------- | -------------- |
| `start` | El robot inició la ejecución de la tarea. |
| `notifyPodArr` | El anaquel llegó a la estación (listo para surtir/reabastecer). |
| `outbin` | Se retiró/entregó producto en la estación (paso intermedio). |
| `end` | La tarea terminó (anaquel devuelto, tarea cerrada). |
| `cancel` | La tarea fue cancelada. |

Campos típicos de un callback: `method`, `reqCode`, `taskCode`, `podCode`, `robotCode`, `currentPositionCode`, `mapCode`.

Acuse esperado del host: `{ "code": 0 }`. Si respondes error, el RCS **reintenta** (haz tu handler idempotente por `reqCode`).

---

### A.7 Convención de códigos de respuesta

| `code` | Significado |
| ------ | ----------- |
| `"0"` | Éxito (`success`). |
| distinto de `"0"` | **Error de negocio.** El RCS procesó la petición pero la rechazó; corrige el payload, no reintentes a ciegas. |
| (sin respuesta / no-JSON) | **Error de transporte** (red, DNS, timeout). No es un `code`; reintenta sin cambiar el payload. |

> El `code` puede llegar como cadena (`"0"`) según el endpoint/versión. Compáralo de forma tolerante.

---

### A.8 Glosario de identificadores

| Identificador | Descripción |
| ------------- | ----------- |
| `mapCode` / `mapShortName` | Identificador del mapa/plano del almacén. Según la versión el parámetro se llama de una u otra forma; envía ambos con el mismo valor. |
| `positionCode` | Un punto del mapa: ubicación de almacenamiento, estación, punto de espera, etc. También aparece como `posCode` en respuestas de estado. |
| `podCode` | Anaquel/rack móvil que el robot transporta. |
| `wbCode` | Estación / workstation donde una persona surte o reabastece. |
| `taskCode` | Código de la tarea de transporte. Recomendado generarlo el host. |
| `taskTyp` | Tipo/plantilla de tarea definida en el RCS. |
| `agvCode` / `robotCode` | La unidad física (robot) que ejecuta la tarea. |
| `areaCode` | Área del mapa a la que pertenece una ubicación. |
| `materialLot` | Lote de material (criterio de consulta en `queryPodBerthAndMat`). |
| `currentPositionCode` | Posición actual reportada en un callback. |

---

> ← Volver a la [Documentación de la API (RCS)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)
