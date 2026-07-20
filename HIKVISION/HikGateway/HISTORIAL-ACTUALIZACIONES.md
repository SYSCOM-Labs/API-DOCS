> ← Volver a la [Documentación de la API (Hik DeviceGateway)](README.md) · [Apéndice A](APENDICE-A.md)

### 1.4 Historial de Actualizaciones

Historial de versiones de la documentación oficial de **Hik DeviceGateway** (fuente: `API_Developer Guide` y `Release Note` del fabricante, incluidos en [`docs/`](./docs/)). El orden es del más reciente al más antiguo.

---

#### V1.8.0 — Enero 2025

**Nuevas funciones:**

1. Soporte de ejecución sobre **Ubuntu 20.04 (64 bits)** y **Red Hat Enterprise Linux 9 (64 bits)**.
2. Reenvío de **datos privados** contenidos en los flujos de vista en vivo y reproducción (por ejemplo, cuadros delimitadores de VCA y atributos de los objetos detectados). Deshabilitado por omisión.
3. Registro opcional de los **logs de operación de dispositivo** de las pruebas de API y del passthrough ISAPI, para auditoría de seguridad y diagnóstico. Deshabilitado por omisión.
4. Configuración de los parámetros de **latido (heartbeat)** para detectar si el dispositivo está en línea: intervalo de latido predeterminado de **30 segundos** y **3 reintentos** para determinar que un dispositivo está fuera de línea.

**Mejoras:**

1. Nuevos mensajes de error de dispositivo fuera de línea: *"Nombre de usuario o contraseña incorrectos"*, *"La cuenta se ha bloqueado por demasiados intentos fallidos de inicio de sesión"* y *"Falló la conexión a la dirección externa"* (la dirección externa configurada en la página de puerto de conexión difiere de la configurada en el dispositivo).
2. Para dispositivos de control de acceso habilitados con **ISUP 5.0 / ISAPI**, el alta de personas o rostros admite el mensaje de protocolo ISAPI del dispositivo.
3. Se ajustan los nombres de los subprocesos de PSS y de medios a `dg_pss` y `dg_das_media`.
4. Posibilidad de abrir varias páginas web para configurar simultáneamente los mismos o distintos elementos de configuración.

---

#### V1.7.0 — Febrero 2024

1. Los dispositivos de acceso admiten la API de obtención de stream — `POST /ISAPI/System/streamMedia?format=json&devIndex=<uuid>`.
2. Se amplía el mensaje de parámetros de sincronización de tiempo `JSON_Time` (`PUT /ISAPI/System/time?format=json&devIndex=<uuid>`): se agrega el modo **NTP** al campo `timeMode`.
3. Nueva API para importar imágenes de rostro a la biblioteca — `POST /ISAPI/Intelligent/FDLib/pictureUpload?format=json&devIndex=<uuid>`.
4. Nuevo evento de subida de estadísticas de conteo de personas — `JSON_EventNotificationAlert_peopleCounting`.
5. Nuevo evento de transmisión de eventos de dispositivo — `JSON_EventNotificationAlert_devXmlEvent`.

---

#### V1.6.1 — Enero 2023

1. Se amplían las condiciones de búsqueda de dispositivos `JSON_SearchDescription` (`POST /ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json`): se agregan `EhomeParams` (búsqueda por número de dispositivo) y `devIndex` (búsqueda por UUID).
2. Se amplían los resultados de búsqueda de dispositivos `JSON_SearchResult`: se agregan `devVersion` (versión), `devSerial` (número de serie) y `offlineHint` (motivo de desconexión).
3. Se amplía el mensaje de resultados de búsqueda de eventos históricos de control de acceso `JSON_AcsEvent` (`POST /ISAPI/AccessControl/AcsEvent?format=json&devIndex=<uuid>`): se agrega `deviceSerial` (número de serie del dispositivo).
4. Se amplían los mensajes detallados de los distintos tipos de evento (consulte los tipos de evento en el Apéndice del PDF oficial).
5. Se agregan códigos de error (de `0x4000A000` a `0x4000A022`, `0x30006010`, `0x40001275` y `0x400011E9`); consulte [APENDICE-A.md](APENDICE-A.md).

---

#### V1.6.0 — Julio 2022

Lanzamiento inicial del documento.
