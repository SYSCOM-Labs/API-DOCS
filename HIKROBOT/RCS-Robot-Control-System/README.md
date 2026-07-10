# Hikrobot RCS (Robot Control System) — API REST de logística interna

> Versión del documento: V1.0 — Julio 2026  
> Producto: Hikrobot RCS (Robot Control System) — flota de robots AMR/AGV "goods-to-person"

---

## Información Legal

- Esta es una **guía de referencia e integración**. Muestra cómo conectar una flota de robots AMR/AGV de Hikrobot con un sistema *host* (por ejemplo un WMS o un ERP) usando la API REST del **RCS (Robot Control System)**.
- **Todos los valores del documento son ficticios** — direcciones, códigos de mapa, racks, estaciones, tokens y `taskCode` sirven únicamente para ilustrar el formato de las peticiones. Adáptalos a tu propia instalación.
- El esquema de seguridad, los nombres exactos de parámetros y los comportamientos varían según la **versión y edición del RCS**. Para valores y comportamientos definitivos, **consulta siempre el manual oficial de la API que corresponda a tu versión de RCS de Hikrobot**.
- El producto se proporciona "TAL CUAL". En ningún caso Hikrobot ni SYSCOM serán responsables de daños especiales, consecuentes, incidentales o indirectos derivados del uso de esta documentación.

---

## Tabla de Contenidos

- [Capítulo 1 — Descripción General](#capítulo-1--descripción-general)
- [Capítulo 2 — Conceptos Clave](#capítulo-2--conceptos-clave)
- [Capítulo 3 — Conexión y Autenticación](#capítulo-3--conexión-y-autenticación)
- [Capítulo 4 — Referencia de API](#capítulo-4--referencia-de-api)
- [Capítulo 5 — Ciclo de Vida de una Tarea y Callbacks](#capítulo-5--ciclo-de-vida-de-una-tarea-y-callbacks)
- [Capítulo 6 — Ejemplo Completo End-to-End](#capítulo-6--ejemplo-completo-end-to-end)
- [Capítulo 7 — Buenas Prácticas](#capítulo-7--buenas-prácticas)
- [Capítulo 8 — Solución de Problemas](#capítulo-8--solución-de-problemas)
- [Capítulo 9 — Checklist de Integración](#capítulo-9--checklist-de-integración)
- [Apéndice A — Diccionarios de Datos](./APENDICE-A.md)
- [Historial de Actualizaciones](./HISTORIAL-ACTUALIZACIONES.md)

---

## Capítulo 1 — Descripción General

### 1.1 ¿Qué es y para qué sirve?

Una flota de robots móviles autónomos (**AMR/AGV**) para logística *"goods-to-person"* resuelve un problema simple: en vez de que la persona camine hasta el producto, el **robot lleva el anaquel (rack/pod) hasta la persona** en una estación de trabajo, y luego lo devuelve a su lugar. Con esto se automatiza el surtido de pedidos (*picking*) y el reabastecimiento dentro de un almacén.

El cerebro de la flota es el **RCS (Robot Control System)**: un servidor que conoce el mapa, la posición de cada robot y de cada anaquel, y decide qué robot ejecuta cada tarea. Tu sistema (el *host*) no maneja robots individualmente: le pide al RCS **tareas de alto nivel** ("lleva el anaquel A hasta la estación 1") y el RCS se encarga de la ruta, el tráfico y la seguridad.

### 1.2 Capacidades de la API

La API del RCS te permite, entre otras cosas:

- Consultar el **estado de los robots** de un mapa.
- Crear **tareas de transporte** (mover un anaquel a una estación y de vuelta).
- **Consultar, cancelar, continuar y re-priorizar** tareas.
- Consultar **dónde está físicamente** cada anaquel.
- **Vincular/desvincular** anaqueles a ubicaciones de almacenamiento.

### 1.3 Patrón de integración: petición + callback

La integración es **bidireccional**:

1. **Host → RCS (petición REST).** Tu sistema hace llamadas HTTP para crear/consultar tareas.
2. **RCS → Host (callback / webhook).** Conforme la tarea avanza, el RCS notifica a una URL tuya con eventos ("el anaquel llegó a la estación", "la tarea terminó", etc.). Así no tienes que estar preguntando constantemente por *polling*.

```
 ┌──────────┐   1. POST genAgvSchedulingTask    ┌──────────┐   mueve   ┌───────┐
 │  Host    │ ────────────────────────────────► │   RCS    │ ────────► │ Robot │
 │ (WMS/ERP)│ ◄──────────────────────────────── │ (flota)  │           └───────┘
 └──────────┘   2. callbacks: start/arr/end     └──────────┘
```

---

## Capítulo 2 — Conceptos Clave

| Concepto | Identificador | Descripción |
| -------- | ------------- | ----------- |
| **Mapa** | `mapCode` | Identificador del plano del almacén sobre el que operan los robots. |
| **Posición / berth** | `positionCode` | Un punto del mapa: una ubicación de almacenamiento, una estación de trabajo, un punto de espera, etc. |
| **Pod / rack** | `podCode` | El anaquel móvil que el robot levanta y transporta. |
| **Estación / workstation** | `wbCode` | El puesto donde una persona surte o reabastece cuando llega el anaquel. |
| **Tarea** | `taskCode` | Una orden de transporte de alto nivel que el RCS ejecuta con algún robot. |
| **Robot / AGV** | `agvCode` / `robotCode` | La unidad física que ejecuta la tarea. |

> **Nota:** consulta el glosario completo de identificadores y enumeraciones en el [Apéndice A](./APENDICE-A.md).

---

## Capítulo 3 — Conexión y Autenticación

### 3.1 URL base y prefijos de servicio

Todas las llamadas son **POST** con cuerpo **JSON** (`Content-Type: application/json`). La URL se arma como:

```
<protocolo>://<host-rcs>:<puerto> + <prefijo-de-servicio> + / + <acción>
```

Distintas familias de endpoints viven bajo prefijos distintos:

| Prefijo | Uso |
| ------- | --- |
| `/rcms/services/rest/hikRpcService` | Tareas y vínculos (crear, cancelar, continuar, consultar tarea…). |
| `/rcms-dps/rest` | Consultas de estado de robots. |
| `/rcms/services/rest/hikTpsService` | Consultas centradas en anaqueles (posición/berth). |

Ejemplo de URL completa (host ficticio):

```
http://<rcs-host>:8181/rcms/services/rest/hikRpcService/genAgvSchedulingTask
```

### 3.2 Campos meta en cada petición

Cada llamada incluye, además del payload propio del endpoint, un conjunto de campos de control/auditoría:

| Campo | Descripción |
| ----- | ----------- |
| `reqCode` | Identificador único de la petición (p. ej. 16 hexadecimales aleatorios). Sirve para **idempotencia y trazabilidad**. |
| `reqTime` | Marca de tiempo de la petición (`YYYY-MM-DD HH:MM:SS`). |
| `clientCode` | Identificador de la aplicación cliente (etiqueta de auditoría). |
| `tokenCode` | Token de la aplicación (etiqueta de auditoría). |

> **Nota sobre autenticación.** El esquema de seguridad varía según la versión y edición del RCS. Algunas ediciones validan firma/HMAC; otras (por ejemplo ediciones "Lite") tratan `clientCode`/`tokenCode` solo como etiquetas y controlan el acceso por una **lista blanca de IP de origen** (IP AllowList) configurada en el propio RCS. En esas ediciones, ese control de IP suele aplicar solo a los endpoints de tareas (`hikRpcService`) y no a las consultas de estado. **Consulta siempre el manual de tu versión** para saber qué exige tu servidor.

### 3.3 Recomendaciones de transporte

- Define **timeouts** de conexión y de respuesta razonables (p. ej. 10 s para conectar, 30 s total) para que una caída de red no bloquee tu proceso.
- Distingue dos tipos de error:
  - **(a) Error de transporte** — no hubo respuesta (red, DNS, timeout).
  - **(b) Error de negocio** — el RCS respondió con un `code` distinto de `0`.
  
  Se manejan diferente: los de transporte se **reintentan**; los de negocio requieren **corregir el payload**.

---

## Capítulo 4 — Referencia de API

> En todos los ejemplos, recuerda que `reqCode`, `reqTime`, `clientCode` y `tokenCode` viajan en el cuerpo aunque a veces se omitan por brevedad. Todos los valores son ficticios.

| # | Acción | Prefijo | Propósito |
| - | ------ | ------- | --------- |
| 4.1 | `queryAgvStatus` | `/rcms-dps/rest` | Estado de robots de un mapa |
| 4.2 | `genAgvSchedulingTask` | `hikRpcService` | Crear tarea de transporte |
| 4.3 | `queryTaskStatus` | `hikRpcService` | Consultar estado de tareas |
| 4.4 | `cancelTask` | `hikRpcService` | Cancelar tarea |
| 4.5 | `continueTask` | `hikRpcService` | Continuar tarea multi-etapa |
| 4.6 | `setTaskPriority` | `hikRpcService` | Re-priorizar tareas |
| 4.7 | `queryPodBerthAndMat` / `getBerthInfoByPodCode` | `hikRpcService` / `hikTpsService` | Ubicación de anaqueles |
| 4.8 | `bindPodAndBerth` | `hikRpcService` | Vincular anaquel ↔ ubicación |

---

### 4.1 Estado de robots — `queryAgvStatus`

Lista los robots que reportan estado en un mapa.

- **Prefijo:** `/rcms-dps/rest`

```bash
curl -X POST 'http://<rcs-host>:8181/rcms-dps/rest/queryAgvStatus' \
  -H 'Content-Type: application/json' \
  -d '{
    "reqCode": "5F3A9C1D2B7E4088",
    "reqTime": "2026-01-15 09:00:00",
    "mapCode": "WAREHOUSE01",
    "mapShortName": "WAREHOUSE01"
  }'
```

> **Gotcha común.** Según la versión, el parámetro del mapa se llama `mapCode` o `mapShortName`. Enviar **ambos** con el mismo valor evita el error `"Enter map code…"` y funciona en más versiones.

Respuesta (forma típica):

```json
{
  "code": "0",
  "message": "success",
  "data": [
    { "agvCode": "AMR-01", "battery": 82, "posCode": "STORAGE-A-12", "status": "IDLE" },
    { "agvCode": "AMR-02", "battery": 47, "posCode": "STATION-1", "status": "BUSY" }
  ]
}
```

---

### 4.2 Crear tarea de transporte — `genAgvSchedulingTask`

El endpoint central: **crea una tarea que mueve un robot real.** Le entregas la ruta como una lista ordenada de puntos (`positionCodePath`); el robot los visitará en ese orden.

- **Prefijo:** `/rcms/services/rest/hikRpcService`

```bash
curl -X POST 'http://<rcs-host>:8181/rcms/services/rest/hikRpcService/genAgvSchedulingTask' \
  -H 'Content-Type: application/json' \
  -d '{
    "reqCode": "A1B2C3D4E5F60718",
    "reqTime": "2026-01-15 09:01:00",
    "taskTyp": "A01",
    "taskCode": "HOST-TASK-000123",
    "priority": "10",
    "podCode": "RACK-0007",
    "positionCodePath": [
      { "positionCode": "RACK-0007", "type": "03" },
      { "positionCode": "STATION-1", "type": "00" }
    ]
  }'
```

Campos frecuentes:

| Campo | Descripción |
| ----- | ----------- |
| `taskTyp` | Tipo de tarea/plantilla definida en el RCS (p. ej. mover anaquel). |
| `taskCode` | Código de tarea. **Recomendado generarlo tú** (ver [Capítulo 7](#capítulo-7--buenas-prácticas)). Si lo dejas vacío, el RCS asigna uno. |
| `priority` | Prioridad de la tarea, típicamente `1`–`127` (mayor = antes). |
| `podCode` | Anaquel a transportar (cuando aplica). |
| `positionCodePath` | Lista ordenada de puntos `{positionCode, type}`. El `type` indica qué es cada punto (origen del anaquel, estación destino, punto de regreso, etc.), según tu configuración de RCS. Ver códigos `type` en el [Apéndice A](./APENDICE-A.md). |
| `agvCode` | Opcional: forzar un robot específico. Normalmente se deja vacío y el RCS elige. |

Respuesta:

```json
{ "code": "0", "message": "success", "taskCode": "HOST-TASK-000123" }
```

---

### 4.3 Consultar estado de tareas — `queryTaskStatus`

- **Prefijo:** `/rcms/services/rest/hikRpcService`

```bash
curl -X POST 'http://<rcs-host>:8181/rcms/services/rest/hikRpcService/queryTaskStatus' \
  -H 'Content-Type: application/json' \
  -d '{
    "reqCode": "9988776655443322",
    "reqTime": "2026-01-15 09:05:00",
    "agvCode": "",
    "taskCodes": ["HOST-TASK-000123"]
  }'
```

Respuesta:

```json
{
  "code": "0",
  "data": [
    { "taskCode": "HOST-TASK-000123", "agvCode": "AMR-02", "taskStatus": 2 }
  ]
}
```

**Tabla de estados de tarea** (`taskStatus`):

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

> **Práctico:** una tarea en cola suele reportar `2` con `agvCode` vacío; en cuanto tiene `agvCode` asignado, ya hay un robot trabajando en ella.

---

### 4.4 Cancelar tarea — `cancelTask`

- **Prefijo:** `/rcms/services/rest/hikRpcService`
- Debes indicar `taskCode` **o** `agvCode` (no ambos vacíos).

```bash
curl -X POST 'http://<rcs-host>:8181/rcms/services/rest/hikRpcService/cancelTask' \
  -H 'Content-Type: application/json' \
  -d '{
    "reqCode": "1122334455667788",
    "taskCode": "HOST-TASK-000123",
    "forceCancel": "0"
  }'
```

Semántica de `forceCancel`:

- `"0"` (por defecto): el robot **deja el anaquel donde esté** y libera la tarea.
- `"1"`: el robot **regresa el anaquel al área de almacén** antes de liberar.

---

### 4.5 Continuar tarea — `continueTask`

Avanza el siguiente paso de una tarea de varias etapas (p. ej. "ya terminé de surtir en la estación, que se lleve el anaquel"). Provee **un** disparador: `taskCode` (recomendado), `agvCode`, `wbCode` o `podCode`.

```bash
curl -X POST 'http://<rcs-host>:8181/rcms/services/rest/hikRpcService/continueTask' \
  -H 'Content-Type: application/json' \
  -d '{ "reqCode": "AABBCCDDEEFF0011", "taskCode": "HOST-TASK-000123" }'
```

---

### 4.6 Re-priorizar tareas — `setTaskPriority`

- **Prefijo:** `/rcms/services/rest/hikRpcService`
- Rango típico de prioridad: `1`–`127` (mayor = antes).

```bash
curl -X POST 'http://<rcs-host>:8181/rcms/services/rest/hikRpcService/setTaskPriority' \
  -H 'Content-Type: application/json' \
  -d '{
    "reqCode": "0011223344556677",
    "priorities": [
      { "taskCode": "HOST-TASK-000123", "priority": "90" },
      { "taskCode": "HOST-TASK-000124", "priority": "20" }
    ]
  }'
```

---

### 4.7 Ubicación de anaqueles — `queryPodBerthAndMat` / `getBerthInfoByPodCode`

Para saber **dónde está físicamente** un anaquel (útil antes de crear una tarea de regreso, o para validar que el anaquel existe).

**`queryPodBerthAndMat`** (prefijo `hikRpcService`) — acepta al menos uno de: `podCode` (un anaquel), `mapShortName` (todos los del mapa), `positionCode` (qué anaquel hay en un punto) o `materialLot`:

```bash
curl -X POST 'http://<rcs-host>:8181/rcms/services/rest/hikRpcService/queryPodBerthAndMat' \
  -H 'Content-Type: application/json' \
  -d '{ "reqCode": "7766554433221100", "podCode": "RACK-0007" }'
```

```json
{
  "code": "0",
  "data": [
    { "podCode": "RACK-0007", "positionCode": "STORAGE-A-12", "areaCode": "A", "mapDataCode": "WAREHOUSE01" }
  ]
}
```

**`getBerthInfoByPodCode`** (prefijo `hikTpsService`) — consulta por lista de anaqueles:

```bash
curl -X POST 'http://<rcs-host>:8181/rcms/services/rest/hikTpsService/getBerthInfoByPodCode' \
  -H 'Content-Type: application/json' \
  -d '{ "reqCode": "6655443322110099", "podCodes": ["RACK-0007", "RACK-0012"] }'
```

---

### 4.8 Vincular anaquel ↔ ubicación — `bindPodAndBerth`

- **Prefijo:** `/rcms/services/rest/hikRpcService`

```bash
curl -X POST 'http://<rcs-host>:8181/rcms/services/rest/hikRpcService/bindPodAndBerth' \
  -H 'Content-Type: application/json' \
  -d '{
    "reqCode": "5544332211009988",
    "indBind": "1",
    "podCode": "RACK-0007",
    "podDir": "0",
    "positionCode": "STORAGE-A-12"
  }'
```

`indBind`: `"1"` vincula, `"0"` desvincula.

---

## Capítulo 5 — Ciclo de Vida de una Tarea y Callbacks

Una tarea recorre estados: **creada → (en cola) → en ejecución → completada**, con ramas posibles a **cancelada** o **interrumpida** (ver tabla de `taskStatus` en §4.3).

Mientras avanza, el RCS envía **callbacks HTTP a una URL tuya** con eventos. Los nombres exactos dependen de tu versión/configuración, pero un conjunto representativo es:

| Evento | Momento típico |
| ------ | -------------- |
| `start` | El robot inició la ejecución de la tarea. |
| `notifyPodArr` | El anaquel llegó a la estación (listo para surtir/reabastecer). |
| `outbin` | Se retiró/entregó producto en la estación (paso intermedio). |
| `end` | La tarea terminó (anaquel devuelto, tarea cerrada). |
| `cancel` | La tarea fue cancelada. |

Un callback trae, típicamente, campos como: `method` (el nombre del evento), `reqCode`, `taskCode`, `podCode`, `robotCode`, `currentPositionCode`, `mapCode`.

Tu endpoint de callback debe **responder un acuse** (por ejemplo `{"code":0}`) para que el RCS marque el evento como entregado. Si respondes error, el RCS **reintentará** — lo cual es útil (no pierdes eventos si tu base de datos estaba momentáneamente caída) pero obliga a que tu handler sea **idempotente** (ver [Capítulo 7](#capítulo-7--buenas-prácticas)).

Ejemplo de callback recibido:

```json
{
  "method": "notifyPodArr",
  "reqCode": "C0FFEE1234567890",
  "taskCode": "HOST-TASK-000123",
  "podCode": "RACK-0007",
  "robotCode": "AMR-02",
  "currentPositionCode": "STATION-1",
  "mapCode": "WAREHOUSE01"
}
```

Respuesta que tu host devuelve:

```json
{ "code": 0 }
```

---

## Capítulo 6 — Ejemplo Completo End-to-End

**Escenario:** hay un pedido que se surte en `STATION-1` con producto del anaquel `RACK-0007`, guardado en `STORAGE-A-12`.

**Paso 1 — (Opcional) validar dónde está el anaquel.**

```bash
curl -X POST '.../hikRpcService/queryPodBerthAndMat' \
  -H 'Content-Type: application/json' \
  -d '{ "reqCode": "...", "podCode": "RACK-0007" }'
# -> data[0].positionCode = "STORAGE-A-12" (existe y está disponible)
```

**Paso 2 — crear la tarea de transporte** (genera tú el `taskCode`):

```bash
curl -X POST '.../hikRpcService/genAgvSchedulingTask' \
  -H 'Content-Type: application/json' \
  -d '{
    "reqCode": "...",
    "taskTyp": "A01",
    "taskCode": "HOST-TASK-000123",
    "priority": "10",
    "podCode": "RACK-0007",
    "positionCodePath": [
      { "positionCode": "RACK-0007", "type": "03" },
      { "positionCode": "STATION-1", "type": "00" }
    ]
  }'
# -> { "code": "0", "taskCode": "HOST-TASK-000123" }
```

**Paso 3 — el RCS avisa que empezó** (callback `start`). Tu host marca la tarea "en camino".

**Paso 4 — el anaquel llega** (callback `notifyPodArr`, `currentPositionCode=STATION-1`). Tu host muestra al operador qué surtir.

**Paso 5 — el operador termina de surtir.** Tu host pide continuar para que el anaquel regrese:

```bash
curl -X POST '.../hikRpcService/continueTask' \
  -H 'Content-Type: application/json' \
  -d '{ "reqCode": "...", "taskCode": "HOST-TASK-000123" }'
```

**Paso 6 — la tarea termina** (callback `end`). Tu host cierra el viaje. Si en cualquier punto quieres abortar, usas `cancelTask` (§4.4).

Confirmación opcional por *polling* en cualquier momento:

```bash
curl -X POST '.../hikRpcService/queryTaskStatus' \
  -H 'Content-Type: application/json' \
  -d '{ "reqCode": "...", "taskCodes": ["HOST-TASK-000123"] }'
# taskStatus: 9 => Completada
```

---

## Capítulo 7 — Buenas Prácticas

- **Genera tu propio `taskCode` antes de llamar.** Si el RCS lo asigna, existe una ventana en la que puede llegarte un callback de una tarea cuyo código todavía no conoces. Generándolo tú (p. ej. `HOST-TASK-000123` con un componente único), correlacionas el callback desde el primer instante.
- **Haz idempotente tu handler de callbacks.** El RCS reintenta si no recibe acuse. Usa el `reqCode` (único por evento) como clave: si ya lo procesaste, responde acuse y no repitas el efecto. Un `INSERT` que ignore duplicados por `reqCode` funciona bien.
- **Un viaje vivo por anaquel.** Evita crear dos tareas simultáneas para el mismo `podCode`. Un candado a nivel de tu base de datos (una restricción de unicidad sobre "anaquel + viaje activo") previene condiciones de carrera.
- **Prefiere callbacks sobre polling**, pero ten un *poll* de respaldo (p. ej. cada minuto con `queryTaskStatus`) para detectar tareas que quedaron colgadas si se perdió un evento.
- **Serializa el orquestador.** Si tienes un proceso que crea/gestiona tareas, protégelo con un candado (p. ej. un lock de aplicación) para que no corran dos instancias a la vez.
- **Responde el acuse rápido.** Contesta el callback y procesa el trabajo pesado después, para no hacer esperar al RCS ni provocar reintentos por timeout.
- **Fija timeouts** en tus llamadas salientes y trata el timeout como reintentable, no como fallo definitivo.

---

## Capítulo 8 — Solución de Problemas

| Síntoma | Causa probable / solución |
| ------- | ------------------------- |
| `"Enter map code…"` en `queryAgvStatus` | El nombre del parámetro cambia entre versiones. Envía `mapCode` **y** `mapShortName`. |
| `403` / rechazo solo en endpoints de tareas | La IP de tu host no está en la lista blanca del RCS (suele aplicar solo a `hikRpcService`). Agrégala en la configuración del RCS. |
| No llega ningún callback | La URL de callback no es alcanzable desde el RCS, o el RCS no permite ciertos caracteres en la URL. Usa una ruta simple y verifica conectividad de red del RCS hacia tu host. |
| Respuesta no-JSON o vacía | Error de transporte (red/timeout), no de negocio. Reintenta; no cambies el payload. |
| El robot deja el anaquel "tirado" al cancelar | Es el comportamiento por defecto (`forceCancel:"0"`). Usa `"1"` si quieres que lo regrese al almacén. |
| Callbacks duplicados | Normal: son reintentos. Deduplica por `reqCode`. |

---

## Capítulo 9 — Checklist de Integración

- [ ] Confirmar versión/edición del RCS y su manual de API correspondiente.
- [ ] Configurar URL base, prefijos de servicio y (si aplica) lista blanca de IP.
- [ ] Implementar cliente REST con timeouts y campos meta (`reqCode`, `reqTime`, …).
- [ ] Implementar endpoint de callbacks idempotente que responda acuse.
- [ ] Generar `taskCode` propios y correlacionar tareas ↔ callbacks.
- [ ] Probar el flujo completo (Capítulo 6) con un anaquel y una estación reales.
- [ ] Añadir poll de respaldo y monitoreo de tareas colgadas.

---

> *Documento educativo. Para valores, parámetros y comportamientos exactos, consulta siempre el manual oficial de la API de tu versión de RCS de Hikrobot.*

---

## Navegación

| Sección | Enlace |
| ------- | ------ |
| Apéndice A — diccionarios de datos | [APENDICE-A.md](./APENDICE-A.md) |
| Historial de actualizaciones | [HISTORIAL-ACTUALIZACIONES.md](./HISTORIAL-ACTUALIZACIONES.md) |
| HIKROBOT — índice de plataformas | [../README.md](../README.md) |
| Índice de marcas | [../../README.md](../../README.md) |
