> ← Volver a la [Documentación de la API (SG50/UG63)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice A — Códigos de Retorno y Ajustes Regionales

Tablas de referencia rápida para la API MQTT de los gateways Milesight SG50/UG63. Los valores provienen del documento oficial del fabricante (firmware 64.0.0.3-r2 / 50.0.0.4-r2).

---

### A.1 Códigos de retorno (Request/Response)

Toda respuesta de las operaciones de administración ([Capítulo 5 del README](README.md)) incluye `code` y `error` en el `body`:

| Code | Descripción |
| ---- | ----------- |
| `200` | Éxito. |
| `20101001` | Error de parámetro (falta un campo requerido o valor fuera de rango). |
| `20101002` | El DevEUI ya existe. |
| `20101003` | Se alcanzó el número máximo de dispositivos. |
| `20101004` | La URI está vacía. |

---

### A.2 Enumeraciones y diccionarios de datos

#### A.2.1 Alta/modificación de dispositivos

| Campo | Valores |
| ----- | ------- |
| `classMode` | `Class A`, `Class C` |
| `netAccess` | `OTAA`, `ABP` |
| `active` (consulta) | `1`: activado · `0`: desactivado |
| `skipFCntCheck` | `true` / `false` (validación del contador de tramas) |
| AppKey por defecto | `5572404c696e6b4c6f52613230313823` |

#### A.2.2 Gateway Info — estado del sistema (`device_info.status`, solo SG50)

| Valor | Significado |
| ----- | ----------- |
| `0` | Operación normal |
| `1` | Modo sleep |

#### A.2.3 Gateway Info — batería (`battery_info`, solo SG50)

| Campo | Valores |
| ----- | ------- |
| `solar_status` | `0`: inactivo · `1`: activo |
| `battery_level` | Porcentaje (%) |
| `battery_status` | `0`: desconocido · `1`: cargando · `2`: descargando · `3`: carga completa · `4`: carga anormal |

#### A.2.4 Gateway Info — red (`network_info`, solo UG63 salvo indicación)

| Campo | Valores |
| ----- | ------- |
| `link` | `1`: WAN · `2`: celular |
| `cellular_status` | `0`: desconectado · `1`: conectado |
| `modem_status` | `0`: sin SIM · `1`: SIM con error · `2`: error de PIN · `3`: PIN requerido · `4`: PUK requerido · `5`: sin señal · `6`: listo · `7`: caído · `8`: sin celular |
| `wan_type` | `0`: cliente DHCP · `1`: IP estática |
| `wan_status` | `0`: desconectado · `1`: conectado |

---

### A.3 Ajustes por defecto de RX2 / Ping Slot por región

Frecuencias y data rates (DR) por defecto de la ventana **RX2** y del **Ping Slot** (Class B) en el NS embebido, por plan de canales:

| Región | RX2 frecuencia default (Hz) | RX2 rango (Hz) | RX2 DR default | Ping Slot frecuencia default (Hz) | Ping Slot rango (Hz) | Ping Slot DR default |
| ------ | --------------------------- | -------------- | -------------- | --------------------------------- | -------------------- | -------------------- |
| CN470 | 505300000 | 470400000–509700000 | 0 | 508300000 | 470400000–509700000 | 2 |
| EU868 | 869525000 | 863000000–870000000 | 0 | 869525000 | 863000000–870000000 | 3 |
| IN865 | 866550000 | 863000000–870000000 | 0 | 866550000 | 863000000–870000000 | 3 |
| RU864 | 869100000 | 864000000–870000000 | 0 | 868900000 | 864000000–870000000 | 3 |
| KR920 | 921900000 | 920900000–923300000 | 0 | 923100000 | 920900000–923300000 | 3 |
| US915 | 923300000 | 923300000–927500000 | 8 | 923300000 | 923300000–927500000 | 8 |
| AU915 | 923300000 | 923300000–927500000 | 8 | 923300000 | 923300000–927500000 | 8 |
| AS923-1 | 923200000 | 915000000–928000000 | 2 | 923400000 | 915000000–928000000 | 3 |
| AS923-2 | 921400000 | 915000000–928000000 | 2 | 921600000 | 915000000–928000000 | 2 |
| AS923-3 | 916600000 | 915000000–928000000 | 2 | 916800000 | 915000000–928000000 | 2 |
| AS923-4 | 917300000 | 915000000–928000000 | 2 | 917500000 | 915000000–928000000 | 2 |

#### A.3.1 Definición de Data Rates — regiones 125 kHz (CN470, EU868, IN865, RU864, AS923-x)

| DR | Definición |
| -- | ---------- |
| 0 | SF12, 125 kHz |
| 1 | SF11, 125 kHz |
| 2 | SF10, 125 kHz |
| 3 | SF9, 125 kHz |
| 4 | SF8, 125 kHz |
| 5 | SF7, 125 kHz |
| 6 | SF7, 500 kHz (CN470) · SF7, 250 kHz (EU868, IN865, RU864, AS923-x) |

#### A.3.2 Definición de Data Rates — KR920

| DR | Definición |
| -- | ---------- |
| 0 | SF12, 125 kHz |
| 1 | SF11, 125 kHz |
| 2 | SF10, 125 kHz |
| 3 | SF9, 125 kHz |
| 4 | SF8, 125 kHz |
| 5 | SF7, 125 kHz |

#### A.3.3 Definición de Data Rates — US915 / AU915

| DR | Definición |
| -- | ---------- |
| 0 | SF10, 125 kHz |
| 1 | SF9, 125 kHz |
| 2 | SF8, 125 kHz |
| 3 | SF7, 125 kHz |
| 4 | SF8, 500 kHz |
| 8 | SF12, 500 kHz |
| 9 | SF11, 500 kHz |
| 10 | SF10, 500 kHz |
| 11 | SF9, 500 kHz |
| 12 | SF8, 500 kHz |
| 13 | SF7, 500 kHz |

> **Nota:** los modelos comercializados por SYSCOM en la región (p. ej. sufijos `915M`/`915EA`) operan en el plan **US915**: RX2 y Ping Slot en 923.3 MHz con DR8 por defecto. La matriz completa, con los rangos de DR aplicables por región, está en el apéndice del documento oficial en [`docs/`](./docs/).

---

> ← Volver a la [Documentación de la API (SG50/UG63)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)
