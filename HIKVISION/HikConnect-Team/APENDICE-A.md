> ← Volver a la [Documentación de la API (Hik-Connect Team)](README.md) · [Historial de actualizaciones](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice A — Apéndices

### A.1 Diccionario de Datos

#### A.1.1 Categoría de Alarma


| Enumeración                      | Descripción                                                      |
| -------------------------------- | ---------------------------------------------------------------- |
| `alarmCategoryAlarmDetection`    | Categoría Principal de Alarma: Detección de Alarma               |
| `alarmCategoryMaintenance`       | Categoría Principal de Alarma: Mantenimiento                     |
| `alarmCategoryVideo`             | Categoría Principal de Alarma: Seguridad de Video                |
| `alarmCategoryDriving`           | Categoría Principal de Alarma: Monitoreo a Bordo                 |
| `alarmSubCategoryAlarmDevice`    | Subcategoría de Alarma: Dispositivo de Alarma                    |
| `alarmSubCategoryVehicle`        | Subcategoría de Alarma: Vehículo Vinculado a Dispositivo a Bordo |
| `alarmSubCategoryAlarmInput`     | Subcategoría de Alarma: Entrada de Alarma                        |
| `alarmSubCategoryBoxChannel`     | Subcategoría de Alarma: Canal Vinculado con Hik-ProConnect Box   |
| `alarmSubCategoryBoxDevice`      | Subcategoría de Alarma: Hik-ProConnect Box                       |
| `alarmSubCategoryCamera`         | Subcategoría de Alarma: Cámara                                   |
| `alarmSubCategoryEncodingDevice` | Subcategoría de Alarma: Dispositivo de Codificación              |
| `alarmSubCategoryMobileDevice`   | Subcategoría de Alarma: Dispositivo a Bordo                      |


#### A.1.2 Tipo de Recurso


| Enumeración   | Descripción                              |
| ------------- | ---------------------------------------- |
| `alarmInput`  | Entrada de Alarma                        |
| `alarmOutput` | Salida de Alarma                         |
| `camera`      | Cámara                                   |
| `vehicle`     | Vehículo Vinculado a Dispositivo a Bordo |
| `door`        | Puerta                                   |


#### A.1.3 Categoría de Dispositivo


| Enumeración              | Descripción                      |
| ------------------------ | -------------------------------- |
| `alarmDevice`            | Dispositivo de Alarma            |
| `encodingDevice`         | Dispositivo de Codificación      |
| `mobileDevice`           | Dispositivo a Bordo              |
| `accessControllerDevice` | Dispositivo de Control de Acceso |
| `videoIntercomDevice`    | Dispositivo de Videoportero      |


#### A.1.4 Tipo de Alarma

**Seguridad de Video:**


| Código de Evento | Descripción                                                      |
| ---------------- | ---------------------------------------------------------------- |
| 10001            | Manipulación de Video                                            |
| 10002            | Detección de Movimiento                                          |
| 10016            | Captura de Rostro                                                |
| 10018            | Reconocimiento Facial                                            |
| 10019            | Detección de Densidad de Personas                                |
| 10032            | Detección de Fuego y Humo                                        |
| 10033            | Alarma de Temperatura                                            |
| 10034            | Alarma de Diferencia de Temperatura                              |
| 10035            | Detección de Múltiples Tipos de Objetivos                        |
| 10036            | Pre-Alarma de Temperatura                                        |
| 10100            | Cruce de Línea                                                   |
| 10101            | Entrada a Región                                                 |
| 10102            | Salida de Región                                                 |
| 10103            | Intrusión                                                        |
| 10106            | Movimiento Rápido                                                |
| 10500            | Lista Negra de Matrículas                                        |
| 10501            | Lista Blanca de Matrículas                                       |
| 10610            | Alarma de Tiempo de Espera en Cola                               |
| 10611            | Detección de Número de Personas en Cola                          |
| 10621            | Número Anormal de Personas                                       |
| 10630            | Ausencia de Policía                                              |
| 10635            | Sin Mascarilla                                                   |
| 10636            | Alarma de Medición de Distancia                                  |
| 50000            | Activada por Entrada de Alarma                                   |
| 100105           | Densidad de Personas                                             |
| 100657           | Detección de Abandono de Cola                                    |
| 100375           | Coincidencia de Persona y Vehículo                               |
| 100376           | No Coincidencia de Persona y Vehículo                            |
| 50101            | Dispositivo Sin Conexión                                         |
| 50120            | Dispositivo Reconectado                                          |
| 50102            | HDD Lleno de Dispositivo de Codificación                         |
| 50110            | Acceso Inválido de Dispositivo de Codificación                   |
| 50103            | Error de Lectura/Escritura de HDD de Dispositivo de Codificación |


**Detección de Alarma:**


| Código de Evento | Descripción                 |
| ---------------- | --------------------------- |
| 20008            | Restaurar Entrada de Alarma |
| 70001            | Desactivar Alarma           |
| 70002            | Activar Alarma              |
| 70003            | Activación Instantánea      |
| 70004            | Activación en Modo Estancia |
| 70006            | Borrar Alarma               |
| 100302           | Bypass                      |
| 100303           | Bypass Restaurado           |


**Mantenimiento:**


| Código de Evento | Descripción                            |
| ---------------- | -------------------------------------- |
| 10000            | Pérdida de Video                       |
| 10056            | Cámara En Línea                        |
| 10057            | Cámara Sin Conexión                    |
| 11016            | Dispositivo a Bordo En Línea           |
| 11017            | Dispositivo a Bordo Sin Conexión       |
| 20002            | Sector Defectuoso de HDD               |
| 20003            | Alta Temperatura de HDD                |
| 20005            | Evento de Detección de Impacto de HDD  |
| 20006            | Falla Grave de HDD                     |
| 50002            | Excepción de Grabación de Cámara       |
| 70007            | Tarde para Desactivar Alarma           |
| 70113            | Informe de Alarma por Coacción         |
| 70118            | Teclado Bloqueado                      |
| 70119            | Teclado Desbloqueado                   |
| 70200            | Alarma de Manipulación del Dispositivo |
| 70203            | Pérdida de Alimentación Principal      |
| 70204            | Voltaje de Batería Bajo                |
| 70205            | Reinicio de Máquina Anfitriona         |
| 70213            | Fallo de Activación Automática         |
| 70221            | Expansor Desconectado                  |
| 70223            | Red Celular Desconectada               |
| 70224            | Red Cableada Desconectada              |
| 70250            | Detector Inalámbrico Desconectado      |
| 70253            | Batería Baja de Detector Inalámbrico   |
| 70255            | Cámara de Red Desconectada             |
| 70302            | Conflicto de IP                        |
| 70307            | Wi-Fi Desconectado                     |
| 70308            | Excepción de RF                        |
| 70309            | Datos de Red Celular Excedidos         |
| 70310            | Batería Baja de Sirena Inalámbrica     |
| 70311            | Fallo de Batería                       |
| 70402            | Repetidor Inalámbrico Desconectado     |
| 70451            | Subvoltaje de Periférico Inalámbrico   |
| 70452            | Periférico Inalámbrico Desconectado    |
| 70453            | Periférico Inalámbrico Eliminado       |
| 70454            | Periférico Inalámbrico Agregado        |
| 70502            | Sirena Inalámbrica Desconectada        |


**Mantenimiento (Dispositivo a Bordo):**


| Código de Evento | Descripción                              |
| ---------------- | ---------------------------------------- |
| 50101            | Dispositivo Sin Conexión                 |
| 50109            | HDD Lleno                                |
| 50112            | Error de Lectura/Escritura de Disco Duro |
| 50104            | Estándar No Coincide                     |
| 50111            | Inicio de Sesión Ilegal                  |
| 50120            | Dispositivo Reconectado                  |
| 300001           | Señal Normal                             |
| 300002           | Excepción de Señal                       |
| 300003           | Error de Módulo GPS                      |


**Monitoreo a Bordo:**


| Código de Evento | Descripción                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| 11009            | Exceso de Velocidad                                                        |
| 11010            | Vuelco                                                                     |
| 11011            | Colisión                                                                   |
| 11012            | Giro Brusco                                                                |
| 11013            | Frenazo                                                                    |
| 11014            | Aceleración Brusca                                                         |
| 100351           | Detección de Entrada a Geocerca                                            |
| 100352           | Desviación                                                                 |
| 100359           | Fumar                                                                      |
| 100360           | Uso de Teléfono Móvil                                                      |
| 100361           | Conducción con Fatiga                                                      |
| 100362           | Distracción                                                                |
| 100363           | Cinturón de Seguridad Desabrochado                                         |
| 100364           | Advertencia de Colisión Frontal (Forward Collision Warning)                |
| 100365           | Advertencia de Monitoreo de Distancia (Headway Monitoring Warning)          |
| 100366           | Advertencia de Desviación de Carril (Lane Deviation Warning)                |
| 100367           | Advertencia de Colisión con Peatón (Pedestrian Collision Warning)          |
| 100368           | Advertencia de Límite de Velocidad                                         |
| 100369           | Advertencia de Punto Ciego                                                 |
| 100370           | Alarma de Emergencia                                                       |
| 100371           | Entrada de Alarma                                                          |
| 100372           | Bostezo                                                                    |
| 100373           | Lentes Oscuros con IR Interrumpido                                         |
| 100374           | Ausencia                                                                   |
| 100377           | Licencia de Conducir Vencida                                               |
| 100396           | Manipulación de Video                                                      |
| 100398           | Entrada a Ruta                                                             |
| 330407           | ACC ON                                                                     |
| 330408           | ACC OFF                                                                    |
| 330510           | Detección de Pasajero Frontal                                              |


**Paso de Tarjeta / Control de Acceso (Card Swiping):**

Códigos de eventos generados por dispositivos de control de acceso y videoportero al verificar credenciales.

| Código de Evento | Descripción                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| 80001            | Acceso Concedido por Tarjeta                                              |
| 80002            | Acceso Denegado por Tarjeta                                               |
| 80003            | Acceso Concedido por Huella                                               |
| 80004            | Acceso Denegado por Huella                                                |
| 80005            | Acceso Concedido por PIN                                                  |
| 80006            | Acceso Denegado por PIN                                                   |
| 80007            | Acceso Concedido por Rostro                                               |
| 80008            | Acceso Denegado por Rostro                                                |
| 80017            | Alarma de Coacción (Duress Alarm)                                         |
| 80072            | Acceso Concedido por Rostro + Tarjeta                                     |
| 80073            | Acceso Denegado por Rostro + Tarjeta                                      |
| 80074            | Tiempo Agotado por Rostro + Tarjeta                                       |
| 80075            | Acceso Concedido por Rostro + PIN                                         |
| 80076            | Acceso Denegado por Rostro + PIN                                          |
| 80077            | Tiempo Agotado por Rostro + PIN                                           |
| 80078            | Acceso Concedido por Tarjeta + PIN                                        |
| 80079            | Acceso Denegado por Tarjeta + PIN                                         |
| 80080            | Tiempo Agotado por Tarjeta + PIN                                          |
| 80081            | Acceso Concedido por Huella + Tarjeta                                     |
| 80082            | Acceso Denegado por Huella + Tarjeta                                      |
| 80083            | Tiempo Agotado por Huella + Tarjeta                                       |
| 80084            | Acceso Concedido por Huella + PIN                                         |
| 80085            | Acceso Denegado por Huella + PIN                                          |
| 80086            | Tiempo Agotado por Huella + PIN                                           |
| 80094            | Acceso Concedido por Huella + Tarjeta + PIN                               |
| 80099            | Detección de Rostro en Vivo Falló (Live Facial Detection Failed)          |
| 80147            | Modos de Autenticación Combinados                                          |
| 80148            | Modo de Autenticación Combinado — Tiempo Agotado                          |
| 80152            | Tarjeta M1                                                                |
| 80153            | Tarjeta CPU                                                               |
| 80154            | Tarjeta EM                                                                |
| 80155            | Tarjeta NFC                                                               |
| 80173            | Modo de Autenticación No Coincide                                          |
| 80263            | Contraseña No Coincide                                                    |
| 80264            | Sin Coincidencia con ID de Empleado                                       |
| 80273            | Acceso Concedido por Llavero                                              |
| 80274            | Acceso Denegado por Llavero                                               |
| 100344           | Contraseña Autenticada                                                    |
| 100345           | Verificando Desfire                                                       |
| 100346           | Ausencia (Authentication)                                                 |
| 100348           | Autenticación Falló por Rasgos Anormales                                  |
| 100571           | Código QR                                                                 |
| 100572           | Acceso Concedido por Código QR                                            |
| 100574           | Acceso Denegado por Código QR                                             |
| 100620           | Bluetooth                                                                 |
| 100621           | Acceso por Bluetooth                                                      |


#### A.1.5 Fuente de Alarma


| Enumeración      | Descripción                              |
| ---------------- | ---------------------------------------- |
| `camera`         | Cámara                                   |
| `alarmInput`     | Entrada de Alarma                        |
| `vehicle`        | Vehículo Vinculado a Dispositivo a Bordo |
| `mobileDevice`   | Dispositivo a Bordo                      |
| `encodingDevice` | Dispositivo de Codificación              |
| `alarmDevice`    | Dispositivo de Alarma                    |
| `user`           | Usuario                                  |
| `subSystem`      | Partición / Subsistema                   |


#### A.1.6 Tipo de Mensaje

Los tipos de mensaje se usan en `POST /api/hccgw/rawmsg/v1/mq/subscribe` (parámetro `msgType`) para suscribirse a eventos.

**Videoportero:**

| Código de Mensaje | Descripción           |
| ----------------- | --------------------- |
| `Msg140001`       | Llamada de videoportero |

**Monitoreo a Bordo:**

| Código de Mensaje | Descripción                                                    |
| ----------------- | -------------------------------------------------------------- |
| `Msg330001`       | Reporte de datos GPS                                           |
| `Msg330002`       | Alarma activada por botón de pánico                            |
| `Msg330371`       | Entrada de alarma                                              |
| `Msg330364`       | Advertencia de colisión frontal (Forward Collision Warning)    |
| `Msg330365`       | Advertencia de monitoreo de distancia (Headway Monitoring)     |
| `Msg330366`       | Advertencia de desviación de carril (Lane Deviation Warning)   |
| `Msg330367`       | Advertencia de colisión con peatón (Pedestrian Collision)      |
| `Msg330368`       | Advertencia de límite de velocidad (Speed Limit Warning)       |
| `Msg330369`       | Advertencia de punto ciego (Blind Spot Warning)                |
| `Msg330012`       | Giro brusco (Sharp Turn)                                       |
| `Msg330013`       | Frenazo (Sudden Brake)                                         |
| `Msg330014`       | Aceleración brusca (Sudden Acceleration)                       |
| `Msg330010`       | Vuelco (Rollover)                                              |
| `Msg330009`       | Exceso de velocidad (Speeding)                                 |
| `Msg330011`       | Colisión (Collision)                                           |
| `Msg330407`       | ACC ON                                                         |
| `Msg330408`       | ACC OFF                                                        |
| `Msg330359`       | Fumar (Smoking)                                                |
| `Msg330360`       | Uso de teléfono móvil (Using Mobile Phone)                     |
| `Msg330361`       | Conducción con fatiga (Fatigue Driving)                        |
| `Msg330362`       | Distracción (Distraction)                                      |
| `Msg330363`       | Cinturón de seguridad desabrochado (Seatbelt Unbuckled)        |
| `Msg330396`       | Manipulación de video (Video Tampering)                        |
| `Msg330372`       | Bostezo (Yawning)                                              |
| `Msg330373`       | Lentes oscuros con IR interrumpido                             |
| `Msg330374`       | Ausencia (Absence)                                             |
| `Msg330510`       | Detección de pasajero frontal (Front Passenger Detection)      |
| `Msg330375`       | Coincidencia de persona y vehículo                             |
| `Msg330376`       | No coincidencia de persona y vehículo                          |
| `Msg335000`       | Mensaje agregado de a bordo                                    |
| `Msg335001`       | Mensaje extendido de a bordo                                   |

**Eventos de Autenticación (Control de Acceso):**

| Código de Mensaje               | Descripción                                                       |
| ------------------------------- | ----------------------------------------------------------------- |
| `Msg110001` – `Msg110024`       | Eventos básicos de Access Granted/Denied/Timed Out (tarjeta, huella, PIN, rostro y combinaciones) |
| `Msg110501` – `Msg110567`       | Eventos avanzados de combinaciones de credenciales (Card+PIN, Face+Card, Face+PIN, multifactor, etc.) |

> **Nota:** La lista completa de códigos `Msg110xxx` incluye más de 50 entradas. Para la enumeración detallada, consulte la sección A.1.6 "Card Swiping" del PDF oficial V2.15.0.

#### A.1.7 Conjunto de Capacidades

Valores válidos para el parámetro `abilitySet` del objeto `CameraInfo`. Indican las funciones de detección inteligente que soporta una cámara.

| Código | Descripción                                              |
| ------ | -------------------------------------------------------- |
| `2000` | Pérdida de video (Video Loss)                            |
| `2001` | Detección de manipulación de video (Video Tampering)     |
| `2002` | Detección de movimiento (Motion Detection)               |
| `2003` | Alarma PIR (PIR Alarm)                                   |
| `2004` | Captura de rostro (Face Capture)                         |
| `2005` | Cruce de área (Area Crossing)                            |
| `2006` | Entrada a región (Region Entrance)                       |
| `2007` | Salida de región (Region Exiting)                        |
| `2015` | Detección de cambio de escena (Scene Change Detection)    |
| `2016` | Detección de longitud focal (Focal Length Detection)      |
| `2021` | Detección de cruce de línea (Line Crossing Detection)     |
| `2022` | Detección de intrusión (Intrusion Detection)              |
| `2023` | Detección de entrada a región (Region Entrance Detection) |
| `2024` | Detección de salida de región (Region Exiting Detection)  |
| `2027` | Detección de movimiento rápido (Fast Moving Detection)    |
| `2029` | Detección de equipaje abandonado (Unattended Baggage)     |
| `2030` | Detección de retiro de objeto (Object Removal Detection)  |

#### A.1.8 Código de País/Región

Códigos numéricos usados en `country` de varios endpoints (p. ej. `bi/v1/anpr/passing/record/search`). La tabla completa del PDF tiene ~252 entradas (códigos `-1` a `251`). A continuación los más relevantes para LATAM y mercados aliados:

| Código | País/Región           |
| ------ | --------------------- |
| `-1`   | Desconocido           |
| `0`    | China                 |
| `25`   | Portugal              |
| `48`   | España                |
| `172`  | Estados Unidos        |
| `173`  | Canadá                |
| `174`  | México                |
| `175`  | Guatemala             |
| `176`  | Belice                |
| `177`  | El Salvador           |
| `178`  | Honduras              |
| `179`  | Nicaragua             |
| `180`  | Costa Rica            |
| `181`  | Panamá                |
| `182`  | Cuba                  |
| `183`  | República Dominicana  |
| `184`  | Haití                 |
| `210`  | Colombia              |
| `211`  | Venezuela             |
| `212`  | Guyana                |
| `213`  | Suriname              |
| `215`  | Ecuador               |
| `216`  | Perú                  |
| `217`  | Bolivia               |
| `218`  | Paraguay              |
| `219`  | Chile                 |
| `220`  | Brasil                |
| `221`  | Uruguay               |
| `222`  | Argentina             |

> Para la lista completa de los ~252 países/regiones, consulte la tabla A.1.8 del PDF V2.15.0.

#### A.1.9 Marca de Vehículo

Códigos numéricos usados en `brand` de `bi/v1/anpr/passing/record/search`. La tabla del PDF lista ~600 marcas (códigos en rango `1024`–`1960` con saltos). Marcas más comunes:

| Código | Marca       |
| ------ | ----------- |
| `1024` | Audi        |
| `1027` | BMW         |
| `1028` | Buick       |
| `1031` | Chevrolet   |
| `1037` | Ford        |
| `1041` | Honda       |
| `1042` | Hyundai     |
| `1047` | Jeep        |
| `1048` | Kia         |
| `1052` | Mazda       |
| `1053` | Mercedes-Benz |
| `1054` | Mitsubishi  |
| `1055` | Nissan      |
| `1063` | Subaru      |
| `1064` | Suzuki      |
| `1065` | Toyota      |
| `1066` | Volkswagen  |
| `1067` | Volvo       |

> Para la lista completa de ~600 marcas, consulte la tabla A.1.9 del PDF V2.15.0.

---

### A.2 Formato de Fecha/Hora

#### A.2.1 Formato de Hora ISO 8601

Todas las marcas de tiempo usan el formato ISO 8601. Ejemplos: `2025-11-05T09:27:24Z` (UTC) o `2026-01-30T15:40:07+08:00` (con desplazamiento de zona horaria).

#### A.2.2 Tipos de Formato de Fecha

Valores válidos para el parámetro `dateFormat` de la API de Asistencia:

| Valor          | Ejemplo       |
| -------------- | ------------- |
| `yyyy/MM/dd`   | 2026/03/05    |
| `yyyy-MM-dd`   | 2026-03-05    |
| `yyyy.MM.dd`   | 2026.03.05    |
| `dd/MM/yyyy`   | 05/03/2026    |
| `dd-MM-yyyy`   | 05-03-2026    |
| `dd.MM.yyyy`   | 05.03.2026    |
| `MM/dd/yyyy`   | 03/05/2026    |
| `MM-dd-yyyy`   | 03-05-2026    |
| `MM.dd.yyyy`   | 03.05.2026    |
| `yy-MM-dd`     | 26-03-05      |
| `yy/MM/dd`     | 26/03/05      |
| `yy.MM.dd`     | 26.03.05      |
| `dd-MM-yy`     | 05-03-26      |
| `dd/MM/yy`     | 05/03/26      |
| `MM-dd-yy`     | 03-05-26      |
| `MM/dd/yy`     | 03/05/26      |
| `yyyyMMdd`     | 20260305      |
| `MMddyyyy`     | 03052026      |
| `ddMMyyyy`     | 05032026      |
| `yyMMdd`       | 260305        |
| `MMddyy`       | 030526        |
| `ddMMyy`       | 050326        |

#### A.2.3 Tipos de Formato de Hora

Valores válidos para el parámetro `timeFormat`:

| Valor          | Ejemplo     | Descripción                       |
| -------------- | ----------- | --------------------------------- |
| `HH:mm`        | 14:30       | 24 horas con cero a la izquierda  |
| `H:mm`         | 14:30 / 9:05 | 24 horas sin cero                |
| `hh:mm tt`     | 02:30 PM    | 12 horas con cero, AM/PM          |
| `h:mm tt`      | 2:30 PM     | 12 horas sin cero, AM/PM          |
| `HH:mm:ss`     | 14:30:25    | 24 horas con segundos             |
| `H:mm:ss`      | 14:30:25    | 24 horas sin cero, con segundos   |
| `hh:mm:ss tt`  | 02:30:25 PM | 12 horas con segundos, AM/PM      |
| `h:mm:ss tt`   | 2:30:25 PM  | 12 horas sin cero, con segundos, AM/PM |
| `HHmm`         | 1430        | 24 horas compacto                 |
| `Hmm`          | 1430        | 24 horas compacto sin cero        |
| `HHmmss`       | 143025      | 24 horas compacto con segundos    |
| `hmmss`        | 23025       | 12 horas compacto                 |

#### A.2.4 Tipo de Formato de Duración de Tiempo

Valores válidos para el parámetro `durationFormat`:

| Valor    | Ejemplo | Descripción                          |
| -------- | ------- | ------------------------------------ |
| `HH:MM`  | `08:30` | Horas y minutos separados por dos puntos |
| `MM`     | `510`   | Duración expresada en minutos (entero)  |

---

### A.3 Descripción de Objetos

El PDF V2.15.0 define **170 objetos** (A.3.1 a A.3.170). A continuación se documentan los más críticos para integradores — aquellos referenciados desde el Capítulo 5 de la API. Para el resto, consulte el PDF oficial.

> **Nota de mapeo:** Cuando el PDF tiene variantes numeradas del mismo nombre (p. ej. `Event(1)`/`Event(2)`, `VehicleInfo(1..3)`, `PersonInfo(1..2)`, `BasicInfo(1..2)`), corresponden a esquemas usados en contextos distintos (eventos de cola de mensajes vs. eventos de control de acceso, etc.). Verifique el contexto del endpoint.

#### Tabla general (resumen)

| Objeto                       | Descripción breve                                                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `AccessLevel`                | Información de nivel de acceso                                                                                               |
| `AccessLevelFailed`          | Resultado de fallos al aplicar/quitar niveles por persona                                                                     |
| `AccessLevelInfo`            | Información detallada de un nivel de acceso (con áreas, recursos, horario)                                                    |
| `AccessLevelResponse`        | Respuesta al agregar/editar nivel                                                                                            |
| `AccessLevelSearchCriteria`  | Filtros: `accessLevelName`, `associateResInfoList`                                                                            |
| `AccessLevelSearchRequest`   | Solicitud paginada de niveles (envuelve `pageIndex`, `pageSize`, `searchCriteria`)                                            |
| `AcsSnapPicInfo`             | Información de captura de imagen del control de acceso                                                                       |
| `AddDeviceResponse`          | Respuesta al agregar dispositivo (incluye `relatedVehicleInfo`)                                                              |
| `AlarmCategory`              | Categoría principal/sub de alarma                                                                                            |
| `AlarmDeviceInfo`            | Info del dispositivo que genera la alarma                                                                                    |
| `AlarmEventSource`           | Fuente del evento de alarma                                                                                                  |
| `AlarmFile`                  | Archivo adjunto a la alarma (URL, tipo, generationMode, encrypted, extendInfo)                                                |
| `AlarmFileExtendInfo`        | Extensión con `humanId`, `humanName`, `similarity`, `fileType`, `faceLibName`, `faceLibThreshold`                              |
| `AlarmFileInfo`              | Contenedor de archivos de alarma (`fileContent`, `file[]`)                                                                    |
| `AlarmInfo`                  | Información general de alarma                                                                                                |
| `AlarmInputChannel`          | Canal de entrada de alarma                                                                                                   |
| `AlarmInputInfo`             | Estado de entrada de alarma (id, status, errorCode)                                                                          |
| `AlarmLinkage`               | Configuración de vinculación de alarma (`alarmRuleID`, `linkageItem[]`)                                                       |
| `AlarmLinkageConfig`         | Configuración interna del linkage por tipo                                                                                   |
| `AlarmMsg`                   | **Mensaje de alarma completo** (ver detalle abajo)                                                                            |
| `AlarmOutputChannel`         | Canal de salida de alarma                                                                                                    |
| `AlarmOutputOperation`       | Operación sobre salida de alarma                                                                                             |
| `AlarmOutputState`           | Estado de la salida (id, status)                                                                                             |
| `Alarmpriorities`            | Lista de prioridades de alarma                                                                                               |
| `AlarmPriority`              | Prioridad individual (id, level, levelName, color, audioURL)                                                                  |
| `AlarmResourceInfo`          | Recurso vinculado a la alarma                                                                                                |
| `AlarmRule`                  | Configuración de regla de alarma                                                                                             |
| `AlarmRuleDetail`            | Detalle completo de una regla                                                                                                |
| `AlarmRuleOperation`         | Resultado al agregar/editar regla (`name`, `id`, `errorCode`)                                                                 |
| `AlarmTimeInfo`              | Información de tiempo (`startTime`, `endTime`)                                                                                |
| `ANPRInfo`                   | Información de reconocimiento de placas                                                                                      |
| `Area`                       | Información de área                                                                                                          |
| `AreaBrief`                  | Resumen breve de área                                                                                                        |
| `AreaInfo`                   | Información extendida de área                                                                                                |
| `AssociateResId`             | ID de recurso asociado                                                                                                       |
| `AssociateResInfo`           | Información de recurso asociado al nivel de acceso                                                                            |
| `Attachment`                 | Adjunto (con URL, tipo)                                                                                                      |
| `AuthRecord`                 | Registro de autenticación                                                                                                    |
| `Awake`                      | Resultado del despertar de cámara solar                                                                                      |
| `BaseStatus`                 | Estado base                                                                                                                  |
| `BasicInfo(1)` / `BasicInfo(2)` | Información básica del evento (occurrenceTime, systemId, msgType, resource, device)                                       |
| `BriefArea`                  | Área breve (incluye `type` para tipo de área)                                                                                |
| `Building`                   | Edificio (buildId, buildName, areaId, areaName, totalRoom, totalPerson, deviceNames)                                          |
| `BuildingSearchCriteria`     | Filtros de búsqueda de edificio (areaId, isContainSubArea, filterName)                                                       |
| `CameraChannel`              | Canal de cámara                                                                                                              |
| `CameraInfo`                 | Información de cámara (con `online`, `abilitySet`)                                                                            |
| `Card(1)` / `Card(2)`        | Información de tarjeta                                                                                                       |
| `CardFailed`                 | Fallo al aplicar tarjeta                                                                                                     |
| `CertificateInfo`            | Información de certificado                                                                                                   |
| `CertificateStatus`          | Estado de certificado                                                                                                        |
| `ChannelInfo`                | Información de canal                                                                                                         |
| `CloudStorage`               | Configuración de almacenamiento en nube                                                                                      |
| `CloudStorageInfo`           | Info del paquete de cloud storage                                                                                            |
| `CloudStorageDetail`         | Detalle del cloud storage                                                                                                    |
| `CombineBaseInfo` / `CombineDeviceInfo` / `CombineEvent` / `CombineEventData` / `CombineResourceInfo` | Estructuras de eventos combinados (heredadas; el servicio `combine/*` fue removido en V2.15.0) |
| `CommonFailed`               | Estructura genérica de fallo                                                                                                 |
| `DataBean`                   | Información extendida del evento (`vehicleRelatedInfo`, `flowRelatedInfo`, etc.)                                              |
| `Device` / `DeviceInfo` / `DeviceInfo(2)` | Variantes de información de dispositivo                                                                          |
| `DeviceBaseInfo` / `DeviceBrief` / `DeviceByResource` / `DeviceList` / `DeviceOfflineInfo` / `DeviceRecordStatus` / `DeviceTalkInfo` / `DevInfo` | Variantes y subconjuntos                                              |
| `DiskStatus`                 | Estado de disco                                                                                                              |
| `DistributionErrorInfo` / `DistributionInfo` | Distribución de foto facial de conductor                                                                     |
| `DoorChannel` / `DoorInfo`   | Información de puerta                                                                                                        |
| `DriverDistributionFail`     | Fallo de distribución de foto de conductor                                                                                    |
| `DriverGroupInfo`            | Información de grupo de conductores                                                                                          |
| `DriverInfo(1)` / `DriverInfo(2)` | Información de conductor                                                                                                 |
| `DriverLicenseInfo` / `DriverLicenseAddInfo` | Licencia de conducir                                                                                          |
| `ElementDetail`              | Detalle de elemento (puerta) en nivel de acceso                                                                              |
| `ElementStatus`              | Estado de elemento                                                                                                           |
| `Event(1)` / `Event(2)`      | Evento (basicInfo + data + uuid + update)                                                                                    |
| `EventSource`                | Fuente del evento (`sourceType`, `sourceID`, `eventType`, `sourceName`)                                                       |
| `FailedResult`               | Resultado de operación fallida                                                                                               |
| `Finger(1)` / `Finger(2)` / `FingerFailed` | Información de huella y fallos                                                                                |
| `GetDeviceInfo` / `GetDevicesResVo` | Respuesta de consulta de dispositivos                                                                                  |
| `GPSInfo`                    | Posición GPS (ew, lng, ns, lat, direction, height, speed)                                                                    |
| `HddAttributeList` / `HddStatusList` | Atributos/estado de disco duro                                                                                       |
| `IdNameInfo`                 | Par `{id, name}`                                                                                                              |
| `IgnoreRecurring`            | Ventana de auto-cierre de alarma (`enable`, `timeValue`)                                                                      |
| `ImportToArea`               | Configuración de importación automática al área                                                                              |
| `IntelliInfo`                | Información inteligente del evento (`cardNumber`, `personId`, `firstName`, `lastName`, `fullPath`, `phoneNum`, `personPicUrl`, `groupId`, `attendanceStatus`, `authResult`) |
| `LicenseInfo`                | Información de licencia                                                                                                      |
| `LinkAlarmOutput` / `LinkageAlarmOutput` | Vinculación con salida de alarma                                                                                 |
| `LinkCamera` / `LinkageCamera` | Vinculación con cámara                                                                                                     |
| `LinkCapturePicture`         | Vinculación con captura de imagen                                                                                            |
| `LinkEmail` / `LinkageItem` / `LinkageConfig` | Vinculaciones                                                                                                |
| `LocalStorage`               | Almacenamiento local del dispositivo                                                                                         |
| `Notification`               | Configuración de notificación (`enable`, `recipients[]`)                                                                      |
| `PackageDetails` / `PackageOverview` | Detalle/resumen del paquete de servicio                                                                              |
| `Person`                     | Residente/persona completa (ver detalle abajo)                                                                               |
| `PersonBaseInfo(1)` / `PersonBaseInfo(2)` | Información básica de persona en distintos contextos                                                            |
| `PersonDTO`                  | DTO de persona (ver detalle abajo)                                                                                           |
| `PersonGroup`                | Departamento/grupo de personas                                                                                               |
| `PersonInfo(1)` / `PersonInfo(2)` | Información de persona en eventos                                                                                       |
| `PictureInfo`                | Información de imagen                                                                                                        |
| `PlateRect`                  | Coordenadas del rectángulo de la matrícula                                                                                   |
| `Priority`                   | Prioridad                                                                                                                    |
| `QueueInfo` / `QueueRelatedInfo` | Información relacionada con alarma de cola                                                                              |
| `ReceivingSchedule`          | Plantilla de horario de armado                                                                                               |
| `Recipients`                 | Destinatarios de notificación                                                                                                |
| `RecordInfo`                 | Registro de paso de tarjeta (no de grabación de video) — ver detalle abajo                                                    |
| `RecordListInfo`             | Segmento de grabación (`beginTime`, `endTime`, `targetType`)                                                                  |
| `RecordSetting`              | Configuración de grabación de cámara (local + nube)                                                                          |
| `RelatedVehicleInfo`         | Información del vehículo relacionado                                                                                         |
| `RemoteControl`              | Control remoto (`actionType`, `elementlist`, `direction`, `areaId`, `depthTraversal`)                                         |
| `RemoteControlResponse`      | Resultado individual del control remoto                                                                                      |
| `ResidentFilter` / `ResidentSearchRequest` | Filtros de búsqueda de residentes                                                                              |
| `Resource` / `ResourceAddResult` | Recurso y resultado de adición                                                                                          |
| `RoomDTO` / `RoomFilter` / `RoomSearchCriteria` / `RoomVO` | Variantes de habitación de videoportero                                                          |
| `Schedule`                   | Plantilla de armado vinculada a la regla                                                                                     |
| `SelfRelated`                | Auto-relación                                                                                                                |
| `ServicePackage` / `ServicePackageOverview` | Información de paquete de servicios                                                                            |
| `SolarEnergyRecord`          | Registro de energía solar                                                                                                    |
| `TempAuth` / `TempAuthFilter` / `TempAuthSearchRequest` | Pase temporal y filtros                                                                          |
| `TemperatureInfo`            | Información de temperatura                                                                                                   |
| `TimeRange`                  | Rango de tiempo (`beginTime`, `endTime`)                                                                                      |
| `TimeSchedule` / `TimeSetting` / `TimeSpan` | Plantilla de horario                                                                                          |
| `TimeZone` / `TimeZoneInfo` / `TimeZoneDst` | Zona horaria                                                                                                  |
| `TotalTimeCardReportData`    | Datos de reporte total time card                                                                                             |
| `User`                       | Usuario del sistema                                                                                                          |
| `VehicleInfo(1)` / `VehicleInfo(2)` / `VehicleInfo(3)` | Variantes de información de vehículo                                                                  |
| `VehicleRelatedInfo`         | Información relacionada con vehículo en alarmas                                                                              |
| `VideoInfo`                  | Información del flujo de video                                                                                               |

#### Objetos clave — detalle de campos

##### `AlarmMsg`

Estructura del mensaje de alarma recibido en `/alarm/v1/mq/messages`.

| Campo               | Tipo            | Descripción                                                       |
| ------------------- | --------------- | ----------------------------------------------------------------- |
| `systemId`          | String          | ID del sistema                                                    |
| `guid`              | String          | GUID único de la alarma                                           |
| `dataRetransmission` | Integer        | Retransmisión de datos                                            |
| `msgType`           | String          | Tipo de mensaje                                                   |
| `alarmState`        | String          | Estado de la alarma                                               |
| `pulseAlarm`        | String          | Si es alarma pulsada                                              |
| `alarmMainCategory` | String          | Categoría principal (ver A.1.1)                                   |
| `alarmSubCategory`  | String          | Subcategoría                                                      |
| `timeInfo`          | AlarmTimeInfo   | Tiempos (`startTime`, `startTimeLocal`, `endTime`, `endTimeLocal`) |
| `eventSource`       | EventSource     | Fuente del evento                                                 |
| `alarmRule`         | Object          | Regla disparada (`id`, `name`, `description`)                     |
| `alarmPriority`     | Object          | Prioridad (`id`, `level`, `levelName`, `color`)                   |
| `markState`         | String          | Estado de marcado                                                 |
| `affirmedState`     | String          | Estado de afirmación                                              |
| `linkageTypes`      | Array           | Tipos de vinculación                                              |
| `linkageConfig`     | LinkageConfig   | Configuración de vinculación                                      |
| `fileInfo`          | AlarmFileInfo   | Archivos adjuntos (imágenes/video)                                 |
| `vehicleRelatedInfo` | VehicleRelatedInfo | Información relacionada con vehículo                          |
| `queueRelatedInfo`  | QueueRelatedInfo | Información de alarma de cola                                    |
| `anprInfo`          | ANPRInfo        | Información de reconocimiento de placas                            |
| `currentEvent`      | Integer         | `1` = alarma en tiempo real                                        |

##### `AlarmFileExtendInfo`

| Campo              | Tipo    | Descripción                                                                  |
| ------------------ | ------- | ---------------------------------------------------------------------------- |
| `sourceID`         | String  | ID de la fuente                                                              |
| `sourceName`       | String  | Nombre de la fuente                                                          |
| `sourceType`       | String  | Tipo de la fuente                                                            |
| `captureIndex`     | Integer | Índice de captura                                                            |
| `humanId`          | String  | ID de la persona reconocida (rostro)                                          |
| `humanName`        | String  | Nombre de la persona reconocida                                              |
| `similarity`       | Number  | Similitud (0–1)                                                              |
| `fileType`         | String  | Tipo de archivo (`face`, etc.)                                               |
| `faceLibName`      | String  | Nombre de la librería facial                                                 |
| `faceLibThreshold` | Number  | Umbral de la librería facial                                                 |

##### `PersonDTO`

DTO usado en `vims/v1/person/add` y `vims/v1/person/update`.

| Campo         | Tipo    | Requerido | Descripción                                          |
| ------------- | ------- | --------- | ---------------------------------------------------- |
| `id`          | String  | Opcional  | ID interno                                           |
| `personCode`  | String  | Requerido | Código de persona (1–16)                              |
| `groupId`     | String  | Requerido | ID del grupo/departamento                            |
| `firstName`   | String  | Requerido | Nombre (máx 255)                                     |
| `lastName`    | String  | Requerido | Apellido (máx 255)                                   |
| `gender`      | Integer | Requerido | `0` = femenino, `1` = masculino, `2` = desconocido    |
| `phone`       | String  | Opcional  | Teléfono (máx 32)                                    |
| `email`       | String  | Opcional  | Correo (máx 64)                                      |
| `description` | String  | Opcional  | Descripción (máx 128)                                |
| `startDate`   | String  | Requerido | Fecha de inicio (ISO)                                |
| `endDate`     | String  | Requerido | Fecha de fin (ISO, año ≤ 2037)                       |

##### `Person`

Persona completa devuelta por `vims/v1/person/search`.

| Campo        | Tipo       | Descripción                                                            |
| ------------ | ---------- | ---------------------------------------------------------------------- |
| `personId`   | String     | ID de la persona                                                       |
| `firstName`  | String     | Nombre                                                                 |
| `lastName`   | String     | Apellido                                                               |
| `phone`      | String     | Teléfono                                                               |
| `email`      | String     | Correo                                                                 |
| `isExpired`  | Integer    | `1` = expirado                                                         |
| `photoUrl`   | String     | URL de la foto de perfil                                               |
| `headPicUrl` | String     | URL de la imagen de avatar (head pic)                                  |
| `roomList`   | RoomDTO[]  | Lista de habitaciones vinculadas                                       |

##### `Building`

| Campo         | Tipo    | Descripción                            |
| ------------- | ------- | -------------------------------------- |
| `buildId`     | String  | ID del edificio                        |
| `buildName`   | String  | Nombre                                 |
| `areaId`      | String  | ID del área                            |
| `areaName`    | String  | Nombre del área                        |
| `totalRoom`   | Integer | Número total de habitaciones           |
| `totalPerson` | Integer | Número total de personas               |
| `deviceNames` | String  | Nombres de los dispositivos vinculados |

##### `RoomVO`

| Campo         | Tipo    | Descripción                          |
| ------------- | ------- | ------------------------------------ |
| `roomId`      | String  | ID de la habitación                  |
| `roomName`    | String  | Nombre                               |
| `roomNum`     | Integer | Número                               |
| `buildId`     | String  | ID del edificio                      |
| `buildName`   | String  | Nombre del edificio                  |
| `areaId`      | String  | ID del área                          |
| `areaName`    | String  | Nombre del área                      |
| `personAmount` | Integer | Cantidad de personas                |
| `mainAccount` | String  | Cuenta principal                     |
| `email`       | String  | Correo                               |
| `phone`       | String  | Teléfono                             |

##### `RoomDTO`

| Campo         | Tipo    | Descripción                          |
| ------------- | ------- | ------------------------------------ |
| `roomId`      | String  | ID                                   |
| `roomNum`     | Integer | Número                               |
| `roomName`    | String  | Nombre                               |
| `buildId`     | String  | ID del edificio                      |
| `buildName`   | String  | Nombre del edificio                  |
| `areaId`      | String  | ID del área                          |
| `areaName`    | String  | Nombre del área                      |
| `accountType` | Integer | Tipo de cuenta                        |

##### `RemoteControl`

| Campo            | Tipo     | Descripción                                              |
| ---------------- | -------- | -------------------------------------------------------- |
| `actionType`     | Integer  | Tipo de acción (`1` = abrir)                              |
| `elementlist`    | Object[] | Lista de elementos sobre los que actuar                  |
| `direction`      | Integer  | Dirección                                                |
| `areaId`         | String   | ID del área                                              |
| `depthTraversal` | Integer  | `1` = aplicar a subáreas                                  |

##### `RemoteControlResponse`

| Campo         | Tipo   | Descripción                  |
| ------------- | ------ | ---------------------------- |
| `elementId`   | String | ID del elemento              |
| `elementName` | String | Nombre del elemento          |
| `areaId`      | String | ID del área                  |
| `areaName`    | String | Nombre del área              |
| `errorCode`   | String | Código de error de este elemento |

##### `RecordInfo`

> Registro de evento de paso de tarjeta. **No** es información de grabación de video.

| Campo               | Tipo    | Descripción                                                 |
| ------------------- | ------- | ----------------------------------------------------------- |
| `recordGuid`        | String  | GUID del registro                                           |
| `elementId`         | String  | ID del punto de acceso                                      |
| `elementName`       | String  | Nombre del punto de acceso                                  |
| `elementPicUrl`     | String  | URL de la imagen capturada                                  |
| `occurTime`         | String  | Tiempo del evento                                           |
| `eventType`         | Integer | Tipo de evento (ver A.1.4 — Card Swiping)                   |
| `swipeAuthResult`   | Integer | `0` = todos, `1` = éxito, `2` = falla                       |
| `eventMainType`     | String  | Tipo principal del evento                                   |
| `hasCameraSnapPic`  | Boolean | Indica si hay captura de cámara asociada                    |
| `hasDevVideoRecord` | Boolean | Indica si hay grabación de video del dispositivo            |
| `cardNumber`        | String  | Número de tarjeta usado                                     |
| `personInfo`        | PersonInfo | Información de la persona                                |
| `temperatureInfo`   | TemperatureInfo | Información de temperatura                          |
| `maskStatus`        | Integer | Estado de cubrebocas (ver `certificaterecords/search`)       |
| `attendanceStatus`  | Integer | Estado de asistencia                                        |
| `direction`         | Integer | Dirección del paso                                          |
| `recordTime`        | String  | Tiempo del registro                                          |

##### `DataBean`

Información extendida del evento, dependiente del `msgType`.

| Campo                 | Tipo                | Descripción                                                |
| --------------------- | ------------------- | ---------------------------------------------------------- |
| `vehicleRelatedInfo`  | VehicleRelatedInfo  | Para eventos de a bordo: GPS + datos de vehículo            |
| `flowRelatedInfo`     | Object              | Para eventos de flujo de clientes (people flow) y tráfico   |
| `openDoorInfo`        | Object              | Para eventos de apertura de puerta                          |
| `intelliInfo`         | IntelliInfo         | Para eventos de control de acceso/reconocimiento            |
| `picture`             | Array               | Imágenes asociadas                                          |
| `video`               | Array               | Videos asociados                                            |

##### `Event(1)`

Estructura del evento entregado por `/rawmsg/v1/mq/messages`.

| Campo       | Tipo       | Descripción                                              |
| ----------- | ---------- | -------------------------------------------------------- |
| `basicInfo` | BasicInfo  | Información básica del evento (occurrenceTime, systemId, msgType, resource, device) |
| `data`      | DataBean   | Datos extendidos según el `msgType`                       |
| `uuid`      | String     | UUID del evento                                           |
| `update`    | Boolean    | Si es una actualización de un evento previo               |
| `video`     | Array      | Videos asociados                                          |

##### `AccessLevelSearchRequest`

| Campo                            | Tipo                       | Descripción                  |
| -------------------------------- | -------------------------- | ---------------------------- |
| `pageIndex`                      | Integer                    | Página actual                 |
| `pageSize`                       | Integer                    | Registros por página          |
| `searchCriteria.accessLevelName` | String                     | Filtrar por nombre            |
| `searchCriteria.associateResInfoList` | AssociateResInfo[]    | Filtrar por recursos vinculados |

##### `TempAuth`

| Campo           | Tipo     | Descripción                                  |
| --------------- | -------- | -------------------------------------------- |
| `id`            | String   | ID del pase temporal                         |
| `name`          | String   | Nombre (máx 32)                              |
| `openCount`     | Integer  | Número de aperturas permitidas (1–200)        |
| `startTime`     | String   | Inicio de validez (ISO)                       |
| `endTime`       | String   | Fin de validez (ISO)                          |
| `clientLocalTime` | String | Hora local del cliente (ISO)                 |
| `allds`         | String[] | IDs de nivel de acceso aplicados              |
| `qrCodeData`    | String   | Imagen del QR codificada en Base64            |
| `password`      | String   | Contraseña asociada (devuelta al crear)       |


---

### A.4 Códigos de Estado y Error

#### Errores Internos (prefijo CCF)


| Código de Error | Descripción                                       | Sugerencia de Depuración                                   |
| --------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| `CCF000001`     | Error de parámetro                                | Verifique el parámetro contra la documentación             |
| `CCF000004`     | Operación de base de datos fallida                | Verifique la operación de base de datos                    |
| `CCF000005`     | Sin permiso para operar el recurso                | Verifique sus permisos                                     |
| `CCF000007`     | Llamada interna fallida                           | Verifique los parámetros de solicitud                      |
| `CCF038002`     | Longitud del nombre excede el límite              | Ajuste la longitud del nombre                              |
| `CCF038005`     | El nombre no puede contener caracteres especiales | Elimine los caracteres especiales                          |
| `CCF038007`     | Usuario sin nivel de acceso asignado              | Contacte a la plataforma para verificar el nivel de acceso |
| `CCF038009`     | El grupo de personas no existe                    | Verifique el grupo de personas                             |
| `CCF038014`     | Nombre de pila inválido                           | Verifique el nombre de pila                                |
| `CCF038015`     | Apellido inválido                                 | Verifique el apellido                                      |
| `CCF038016`     | ID de persona inválido                            | Verifique personCode                                       |
| `CCF038017`     | Nombre completo de persona inválido               | Verifique el nombre completo                               |
| `CCF038019`     | Email de persona inválido                         | Verifique el email                                         |
| `CCF038020`     | Número de teléfono de persona inválido            | Verifique el número de teléfono                            |
| `CCF038022`     | Validez de persona inválida                       | Verifique el período de validez                            |
| `CCF038023`     | La persona no existe                              | Verifique que la persona exista                            |
| `CCF038024`     | ID de persona ya existe                           | Verifique la unicidad de personCode                        |
| `CCF038029`     | No se permiten más personas                       | Gratis: 100; De pago: 50.000 personas                      |
| `CCF038032`     | No se permiten más tarjetas para la persona       | Máximo 2 tarjetas por persona                              |
| `CCF038034`     | Número de tarjeta duplicado                       | Use un número de tarjeta diferente                         |
| `CCF038039`     | No se permiten más huellas dactilares             | Máximo 2 huellas dactilares por persona                    |
| `CCF038052`     | La dirección de email ya existe                   | Use un email diferente                                     |
| `CCF038055`     | Código PIN duplicado                              | Establezca un código PIN diferente                         |
| `CCF038021`     | Descripción de persona inválida                   | Revise el campo `description`                              |
| `CCF038025`     | El ID de persona no existe                        | Verifique `personId`                                       |
| `CCF038026`     | La imagen de la persona no existe                 | /                                                          |
| `CCF038028`     | Guardar imagen de persona falló                   | /                                                          |
| `CCF038031`     | Agregar persona falló                             | Revise los parámetros                                      |
| `CCF038035`     | La tarjeta no existe                              | Verifique `cardNo`                                          |
| `CCF038036`     | Longitud del número de tarjeta excede el límite   | Máximo 20 caracteres                                       |
| `CCF038037`     | Número de tarjeta vacío                           | Provea `cardNo`                                             |
| `CCF038038`     | Número de tarjeta inválido                        | Use solo dígitos                                           |
| `CCF038042`     | La huella no existe                               | Recolecte la huella primero                                |
| `CCF038059`     | Actualizar tarjeta falló                          | /                                                          |
| `CCF038060`     | Actualizar huella falló                           | /                                                          |
| `CCF038061`     | Actualizar atributo adicional falló               | /                                                          |
| `CCF038062`     | Actualizar imagen falló                           | /                                                          |
| `CCF038064`     | Sin departamentos encontrados con esos criterios  | Ajuste los filtros                                         |
| `CCF038065`     | El dispositivo no existe                          | Verifique el dispositivo                                   |
| `CCF038066`     | Longitud de datos de huella excede el límite      | Máximo 1024 caracteres hexadecimales                       |
| `CCF038067`     | Huella duplicada                                  | Use una huella diferente                                   |
| `CCF038068`     | Foto de perfil duplicada                          | Use una foto diferente                                     |
| `CCF038084`     | Recolectar número de tarjeta desde dispositivo falló | Reintente con el dispositivo                            |
| `CCF038085`     | Recolectar huella desde dispositivo falló         | Reintente con el dispositivo                               |
| `CCF038089`     | El teléfono ya está en uso                        | Use otro teléfono                                          |
| `CCF021008`     | Versión del dispositivo no soportada              | Actualice el firmware                                      |
| `CCF021103`     | El nombre del área ya existe                      | Cambie el nombre                                           |
| `CCF021307`     | El dispositivo no existe                          | Verifique el dispositivo                                   |


#### Errores de Dispositivo (prefijo EVZ)


| Código de Error | Descripción                                       | Sugerencia de Depuración                                             |
| --------------- | ------------------------------------------------- | -------------------------------------------------------------------- |
| `EVZ20002`      | El dispositivo no existe                          | Verifique el número de serie del dispositivo y la región de registro |
| `EVZ20007`      | Dispositivo sin conexión                          | Verifique la conexión de red                                         |
| `EVZ20008`      | Tiempo de respuesta del dispositivo agotado       | Reintente más tarde                                                  |
| `EVZ20010`      | Código de verificación del dispositivo incorrecto | Verifique el código de verificación                                  |
| `EVZ20013`      | Dispositivo agregado por otra cuenta              | El dispositivo está en otra cuenta de Hik-Connect/Hik-ProConnect     |
| `EVZ20014`      | Número de serie del dispositivo incorrecto        | Verifique el número de serie                                         |
| `EVZ20017`      | Dispositivo ya agregado por usted                 | El dispositivo ya está en su cuenta                                  |


#### Errores de Plataforma (prefijo VMS)


| Código de Error | Descripción                                                 | Sugerencia de Depuración                           |
| --------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| `VMS000000`     | Error del sistema                                           | Contacte al soporte                                |
| `VMS000001`     | Error de parámetro                                          | Verifique los parámetros de la API                 |
| `VMS000003`     | No se encontró recurso                                      | Verifique si el recurso existe                     |
| `VMS000004`     | Operación de base de datos fallida                          | Verifique la base de datos                         |
| `VMS000005`     | Sin permiso                                                 | Solicite el permiso                                |
| `VMS000007`     | Llamada interna fallida                                     | Verifique el entorno del sistema                   |
| `VMS000008`     | Operación de Redis fallida                                  | Verifique Redis                                    |
| `VMS000009`     | Solicitudes concurrentes                                    | Intente de nuevo más tarde                         |
| `VMS001000`     | Error de gateway                                            | Intente de nuevo más tarde                         |
| `VMS001001`     | Servicio sobrecargado                                       | Intente de nuevo más tarde                         |
| `VMS003001`     | Email ya registrado                                         | Use un email diferente                             |
| `VMS003002`     | El usuario no existe                                        | Verifique el usuario o cree una nueva cuenta       |
| `VMS021102`     | El área ya existe                                           | Verifique áreas duplicadas                         |
| `VMS021103`     | El nombre del área ya existe                                | Cambie el nombre del área                          |
| `VMS021104`     | No se pueden agregar más áreas                              | Elimine algunas áreas                              |
| `VMS021105`     | Se alcanzó el máximo de niveles de área                     | Cambie el nivel del área                           |
| `VMS021108`     | Número de matrícula duplicado                               | Use un número de matrícula diferente               |
| `VMS021109`     | El dispositivo ya está vinculado a otro vehículo            | Desvincule primero                                 |
| `VMS021110`     | El vehículo no existe                                       | Verifique el vehículo                              |
| `VMS021301`     | Proceso de agregar dispositivo en curso                     | Intente de nuevo más tarde                         |
| `VMS021302`     | El dispositivo ya ha sido agregado                          | Verifique si ya existe                             |
| `VMS021305`     | El nombre del dispositivo ya existe                         | Cambie el nombre del dispositivo                   |
| `VMS021306`     | Tiempo de agregar dispositivo agotado                       | Intente de nuevo más tarde                         |
| `VMS021307`     | El dispositivo no existe                                    | Verifique el dispositivo                           |
| `VMS021311`     | No se pueden agregar más dispositivos                       | Elimine algunos dispositivos                       |
| `VMS021314`     | Dispositivo sin conexión                                    | Verifique la conectividad del dispositivo          |
| `VMS021315`     | Número de serie inválido                                    | Verifique el formato del número de serie           |
| `VMS021316`     | El dispositivo pertenece a otro usuario                     | Verifique la propiedad del dispositivo             |
| `VMS023007`     | Reconocimiento de alarma repetido                           | Verifique el estado de la alarma                   |
| `VMS023008`     | La configuración de alarma ya existe                        | Verifique las configuraciones existentes           |
| `VMS038005`     | El número de personas en la habitación excede el límite     | Verifique la capacidad de la habitación            |
| `VMS038011`     | Tipo de persona incorrecto agregado a la habitación         | Verifique las reglas de titular/miembro de familia |
| `VMS038014`     | El residente ya está en la habitación                       | Verifique los residentes existentes                |
| `VMS038027`     | Llamada respondida                                          | La llamada ya ha sido respondida                   |
| `VMS038028`     | El residente no existe                                      | Verifique el residente                             |
| `VMS040013`     | No se permiten más niveles de acceso                        | Elimine algunos niveles de acceso                  |
| `VMS040016`     | El nivel de acceso no existe                                | Verifique el nivel de acceso                       |
| `VMS040017`     | Excede 4 horarios de acceso por persona por punto de acceso | Reduzca los horarios                               |
| `VMS040018`     | Sin credencial válida para la persona                       | Verifique la información de credenciales           |
| `VMS051025`     | Límite de recurso ANPR                                      | /                                                  |
| `VMS051026`     | El ID de cámara está vacío                                  | /                                                  |
| `VMS051027`     | Formato de hora inválido                                    | /                                                  |
| `VMS051028`     | La hora de inicio debe ser anterior a la hora de fin        | /                                                  |
| `VMS004004`     | ID de rol inválido                                          | Verifique el rol asignado                          |
| `VMS004005`     | Sin permiso                                                 | Solicite el permiso necesario                      |
| `VMS020007`     | Obtener información de Hik-Connect falló                    | Reintente más tarde                                |
| `VMS021008`     | La versión del dispositivo no es soportada                  | Actualice el firmware                              |
| `VMS021106`     | No se pueden agregar más recursos lógicos al sistema VMS    | Elimine recursos no usados                         |
| `VMS021107`     | No se pueden agregar más recursos lógicos al área           | Use otra área                                      |
| `VMS021308`     | Actualizando el dispositivo…                                | Reintente cuando termine                           |
| `VMS021309`     | Tipo de dispositivo incorrecto                              | Verifique el tipo                                  |
| `VMS021337`     | Importación de recurso falló                                | Reintente                                          |
| `VMS022531`     | Error de respuesta de Ezviz                                 | /                                                  |
| `VMS022533`     | Error de respuesta del dispositivo                          | /                                                  |
| `VMS022535`     | Operación no soportada por el dispositivo                    | Verifique capacidades                              |
| `VMS022543`     | Dispositivo sin conexión                                    | Revise conexión                                    |
| `VMS022553`     | Operación inválida                                          | /                                                  |
| `VMS023001`     | Envío de correo electrónico falló                            | Verifique configuración SMTP                       |
| `VMS023002`     | Color duplicado                                             | Use otro color                                     |
| `VMS023003`     | El nombre de la prioridad ya existe                          | Cambie el nombre                                   |
| `VMS023004`     | El nombre de la categoría de alarma ya existe                | Cambie el nombre                                   |
| `VMS023005`     | El nombre de la plantilla de correo ya existe                | Cambie el nombre                                   |
| `VMS023006`     | El correo del sistema no está configurado                    | Configure el correo del sistema                    |
| `VMS038009`     | Agregar persona falló (ID de empleado no obtenido)           | Provea `personCode`                                 |
| `VMS038012`     | Sin permiso para agregar personas a la habitación            | Verifique permisos                                 |
| `VMS038019`     | El registro de llamada no existe                             | Verifique `recordId`                                |
| `VMS038026`     | La dirección de correo ya existe                             | Use otro correo                                    |
| `VMS038029`     | Llamada del dispositivo cancelada                            | /                                                  |
| `VMS040002`     | Nombre duplicado                                            | Use otro nombre                                    |
| `VMS040003`     | Nombre vacío                                                | Provea nombre                                      |
| `VMS040004`     | Caracteres especiales no permitidos en el nombre             | Limpie el nombre                                   |
| `VMS040005`     | Longitud de nombre excedida                                  | Reduzca el largo                                   |
| `VMS040011`     | Recurso no encontrado                                       | /                                                  |
| `VMS040012`     | El recurso ya existe                                        | /                                                  |
| `VMS040014`     | Plantilla de horario inválida                                | /                                                  |
| `VMS040015`     | Grupo de festivos inválido                                  | /                                                  |
| `VMS040020`     | Modo de verificación combinada no permitido                  | Ajuste el modo                                     |
| `VMS040101`–`VMS040122` | Familia de errores específicos de dispositivo (plantillas de horario, grupos de festivos, horarios semanales, longitud/calidad de huella, M1, contraseña, plantilla de visita, etc.) | Consulte la tabla A.4 del PDF V2.15.0 |


#### Errores LAP


| Código de Error | Descripción                                     | Sugerencia de Depuración           |
| --------------- | ----------------------------------------------- | ---------------------------------- |
| `LAP000001`     | Error de parámetro                              | Verifique los parámetros de la API |
| `LAP000004`     | Tiempo de espera de llamada al servicio agotado | Reintente                          |


#### Errores de OpenAPI (prefijo OPEN)

Esta familia de códigos proviene del gateway/auth/área/recurso de OpenAPI. Es la más relevante para depurar integraciones.

| Código de Error | Descripción                                                                | Sugerencia de Depuración                                       |
| --------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `OPEN000000`    | Error interno del sistema                                                  | Contacte al soporte técnico                                    |
| `OPEN300002`    | Clave secreta (SK) incorrecta                                              | Verifique el AppSecret usado para firmar el token              |
| `OPEN000001`    | AK/SK incorrecto                                                           | Verifique las credenciales generadas en Hik-Connect for Teams  |
| `OPEN000002`    | El usuario no existe                                                       | Verifique la cuenta                                            |
| `OPEN000003`    | El sistema no existe                                                       | Verifique el dominio/región del servidor                       |
| `OPEN000004`    | Vinculación con HCC falló                                                  | Revise el vínculo entre OpenAPI y HikCentral Connect           |
| `OPEN000005`    | Token expirado                                                             | Vuelva a solicitar el token vía `/platform/v1/token/get`       |
| `OPEN000006`    | Excepción de token                                                         | Token mal formado o revocado                                   |
| `OPEN000007`    | Falló la conversión de parámetros                                          | Revise tipos y nombres de parámetros                           |
| `OPEN000008`    | Falló la verificación de parámetros                                        | Revise rangos/valores válidos                                  |
| `OPEN000009`    | Excepción de red                                                           | Reintente más tarde                                            |
| `OPEN000010`    | Los recursos solicitados no están disponibles                              | Verifique permiso y existencia del recurso                     |
| `OPEN000011`    | ID de lote (batchId) inválido para envío de mensajes                       | Use el `batchId` devuelto por `/mq/messages`                   |
| `OPEN000012`    | AK de offset de alarma incorrecto                                          | /                                                              |
| `OPEN000013`    | Formato de URL de imagen de alarma inválido                                | /                                                              |
| `OPEN000014`    | Conversión de mensaje de alarma falló                                      | /                                                              |
| `OPEN000015`    | Suscripción a alarma no encontrada                                         | Suscríbase primero con `/alarm/v1/mq/subscribe`                 |
| `OPEN000016`    | Agregar recurso falló                                                      | /                                                              |
| `OPEN000017`    | Error del servidor Hik-Connect                                             | /                                                              |
| `OPEN000018`    | Respuesta de Hik-Connect inválida                                          | /                                                              |
| `OPEN000019`    | Guardar archivo falló                                                      | /                                                              |
| `OPEN000020`    | Sin permiso para visualizar la fuente                                      | Solicite el permiso correspondiente                            |
| `OPEN000021`    | Sin permiso para gestionar la fuente                                       | Solicite el permiso correspondiente                            |
| `OPEN000022`    | Lectura de Dynamo falló                                                    | Reintente                                                      |
| `OPEN000023`    | Número de recursos/registros excedido                                      | Reduzca el volumen de la consulta                              |
| `OPEN000024`    | Formato de hora incorrecto                                                 | Use ISO 8601                                                   |
| `OPEN000025`    | Rango de tiempo para búsqueda excedió el límite                            | Reduzca el rango                                               |
| `OPEN000026`    | ID de área vacío                                                           | Especifique el `areaId`                                         |
| `OPEN000027`    | Volumen de solicitud excedido                                              | Reduzca la cantidad por petición                               |
| `OPEN000028`    | Orden de tiempo de búsqueda inválido                                       | `beginTime` debe ser anterior a `endTime`                       |
| `OPEN000029`    | El área no existe                                                          | Verifique el `areaId`                                           |
| `OPEN000031`    | Excepción genérica                                                         | Consulte el log del backend                                    |
| `OPEN000501`    | El dispositivo no existe                                                   | Verifique el número de serie                                   |
| `OPEN000502`    | Configuración de almacenamiento en nube no encontrada                      | Configure cloud storage en HCC                                 |
| `OPEN000503`    | El recurso de cámara no existe                                             | Verifique el `cameraId`                                         |
| `OPEN000504`    | Agregar área/recurso falló                                                 | /                                                              |
| `OPEN000505`    | El área/recurso ya existe                                                  | /                                                              |
| `OPEN000510`    | Sin respuesta a la solicitud                                               | Reintente                                                      |
| `OPEN000511`    | Error devuelto por la solicitud                                            | /                                                              |
| `OPEN000550`    | Dispositivo sin conexión                                                   | Verifique la conexión del dispositivo                          |
| `OPEN000552`    | Tiempo de respuesta del dispositivo agotado                                | Reintente                                                      |
| `OPEN000554`    | Captura por el dispositivo falló                                           | /                                                              |
| `OPEN000555`    | Error de respuesta del dispositivo                                         | /                                                              |
| `OPEN000556`    | Operación no soportada por el dispositivo                                  | Verifique versión/firmware                                     |
| `OPEN000601`    | Agregar dispositivo falló                                                  | Revise los parámetros del dispositivo                          |
| `OPEN010001`    | Agregar conductor falló                                                    | /                                                              |
| `OPEN010002`    | Editar conductor falló                                                     | /                                                              |
| `OPEN010003`    | Búsqueda en lote de conductores falló                                       | /                                                              |
| `OPEN010004`    | Agregar grupo de conductores falló                                          | /                                                              |
| `OPEN010005`    | Editar grupo de conductores falló                                           | /                                                              |
| `OPEN010006`    | Búsqueda en lote de grupos de conductores falló                             | /                                                              |
| `OPEN010007`    | Aplicación de foto facial de conductor falló                                | Consulte el GUID de tarea con `/driverFace/status/query`        |


#### Errores Específicos de Dispositivo


| Código de Error        | Descripción                                | Sugerencia de Depuración                         |
| ---------------------- | ------------------------------------------ | ------------------------------------------------ |
| `THD_ISAPI_0x20000004` | Dispositivo ocupado                        | Complete la operación actual antes de reintentar |
| `THD_ISAPI_0x60000003` | Error de mensaje XML                       | Contacte al soporte técnico                      |
| `THD_ISAPI_0x60000017` | Error de mensaje JSON                      | Revise el formato del cuerpo                     |
| `THD_ISAPI_0x60000019` | Faltan parámetros                          | Complete los parámetros requeridos               |
| `THD_ISAPI_0x6000001C` | Caracteres inválidos en el parámetro       | Elimine caracteres especiales                    |
| `THD_ISAPI_0x6000001D` | Nombre demasiado largo                     | Reduzca la longitud                              |
| `THD_ISAPI_0x60006000` | Periodos de tiempo solapados               | Ajuste el calendario                             |
| `THD_ISAPI_0x60006001` | Calendarios de festivos solapados          | Ajuste el grupo de festivos                      |
| `THD_ISAPI_0x60006002` | Número de tarjeta sin ordenar              | Ordene los números de tarjeta                    |
| `THD_ISAPI_0x60006003` | El número de tarjeta no existe             | Verifique el número                              |
| `THD_ISAPI_0x60006004` | Número de tarjeta incorrecto               | /                                                |
| `THD_ISAPI_0x60006005` | No se permiten más tarjetas                | /                                                |
| `THD_ISAPI_0x60006006` | Descargar grupo de festivos falló          | Reintente                                        |
| `THD_ISAPI_0x60006007` | Múltiples tarjetas para una sola persona   | Solo se permite hasta 2                          |
| `THD_ISAPI_0x60006008` | La foto facial a eliminar no existe        | /                                                |
| `THD_ISAPI_0x60006009` | Número de dedo incorrecto                  | Use el índice correcto                           |
| `THD_ISAPI_0x6000600A` | Tipo de huella incorrecto                  | /                                                |
| `THD_ISAPI_0x6000600B` | Huella no vinculada                        | /                                                |
| `THD_ISAPI_0x6000600C` | La huella ya existe                        | /                                                |
| `THD_ISAPI_0x6000600D` | El lector no soporta eliminar por ID       | /                                                |
| `THD_ISAPI_0x6000600E` | El número de empleado no existe            | Verifique `personCode`                            |
| `THD_ISAPI_0x6000600F` | El número de empleado ya existe            | /                                                |
| `THD_ISAPI_0x60006010` | El número de tarjeta ya existe             | /                                                |
| `THD_ISAPI_0x60006011` | Longitud de huella es 0                    | Recolecte la huella nuevamente                   |
| `THD_ISAPI_0x60006012` | Lector/empleado incorrecto                 | /                                                |
| `THD_ISAPI_0x60006013` | Contraseña de administrador no configurada | /                                                |
| `THD_ISAPI_0x60007000` | La imagen no existe                        | /                                                |
| `THD_ISAPI_0x60007001` | Distancia entre pupilas muy corta          | Recapture la imagen                              |
| `THD_ISAPI_0x60007002` | Datos de foto facial menores a 1 KB        | Recapture la imagen                              |
| `THD_ISAPI_0x60007003` | Verificación de información de imagen falló | /                                                |
| `THD_ISAPI_0x60007004` | Calificación de rostro falló               | /                                                |
| `THD_ISAPI_0x60007005` | Conversión de imagen QR falló              | /                                                |
| `THD_ISAPI_0x60007006` | Número de huellas/personas alcanzó el límite | /                                              |


---
