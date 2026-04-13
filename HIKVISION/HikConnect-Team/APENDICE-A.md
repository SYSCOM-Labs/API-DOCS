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


| Código de Evento | Descripción                        |
| ---------------- | ---------------------------------- |
| 11009            | Exceso de Velocidad                |
| 11010            | Vuelco                             |
| 11011            | Colisión                           |
| 11012            | Giro Brusco                        |
| 11013            | Frenazo                            |
| 11014            | Aceleración Brusca                 |
| 100351           | Detección de Entrada a Geocerca    |
| 100352           | Desviación                         |
| 100359           | Fumar                              |
| 100360           | Uso de Teléfono Móvil              |
| 100361           | Conducción con Fatiga              |
| 100362           | Distracción                        |
| 100363           | Cinturón de Seguridad Desabrochado |
| 100364           | Advertencia de Colisión Frontal    |
| 100365           | Salida de Carril                   |


#### A.1.5 Fuente de Alarma


| Enumeración    | Descripción                              |
| -------------- | ---------------------------------------- |
| `camera`       | Cámara                                   |
| `alarmInput`   | Entrada de Alarma                        |
| `vehicle`      | Vehículo Vinculado a Dispositivo a Bordo |
| `mobileDevice` | Dispositivo a Bordo                      |


#### A.1.6 Tipo de Mensaje

Los tipos de mensajes para suscripciones incluyen eventos de autenticación, eventos de videoportero, eventos de monitoreo a bordo y más. Consulte A.1.6 en el documento oficial para la lista completa.

#### A.1.7 Conjunto de Capacidades

Los conjuntos de capacidades se utilizan en `CameraInfo.abilitySet` para indicar qué funciones admite una cámara.

#### A.1.8 Código de País/Región

Consulte A.1.8 en el documento oficial para la lista completa de códigos de país y región utilizados en los parámetros de la API.

#### A.1.9 Marca de Vehículo

Consulte A.1.9 en el documento oficial para la lista completa de enumeración de marcas de vehículos.

---

### A.2 Formato de Fecha/Hora

#### A.2.1 Formato de Hora ISO 8601

Todas las marcas de tiempo usan el formato ISO 8601. Ejemplo: `2025-11-05T09:27:24Z` (UTC) o `2026-01-30T15:40:07+08:00` (con desplazamiento de zona horaria).

#### A.2.2 Tipo de Formato de Fecha

Formato de fecha estándar: `YYYY-MM-DD`

#### A.2.3 Tipo de Formato de Hora

Formato de hora estándar: `HH:mm:ss`

#### A.2.4 Tipo de Formato de Duración de Tiempo

Formato de duración: `PT#H#M#S` (duración ISO 8601)

---

### A.3 Descripción de Objetos

Objetos clave utilizados en toda la API:


| Objeto                | Descripción                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `AccessLevel`         | Información de nivel de acceso                                                                                         |
| `AlarmMsg`            | Mensaje de alarma con fuente de evento, prioridad, información de archivo, etc.                                        |
| `AlarmRule`           | Configuración de regla de alarma                                                                                       |
| `AlarmFileExtendInfo` | Información extendida para archivo de alarma (humanId, humanName, similarity, fileType, faceLibName, faceLibThreshold) |
| `ANPRInfo`            | Información de reconocimiento automático de matrículas                                                                 |
| `Area`                | Información de área                                                                                                    |
| `Building`            | Información de edificio de videoportero                                                                                |
| `CameraInfo`          | Información del canal de cámara incluyendo estado en línea y conjunto de capacidades                                   |
| `Card`                | Información de credencial de tarjeta                                                                                   |
| `DataBean`            | Información extendida del evento incluyendo flowRelatedInfo                                                            |
| `Device`              | Información básica del dispositivo                                                                                     |
| `DeviceInfo`          | Detalle del dispositivo incluyendo número de serie, canales, estado                                                    |
| `DoorChannel`         | Información del canal de puerta                                                                                        |
| `DriverInfo`          | Información del conductor a bordo                                                                                      |
| `DriverGroupInfo`     | Información del grupo de conductores                                                                                   |
| `Finger`              | Información de credencial de huella dactilar                                                                           |
| `GPSInfo`             | Información de ubicación GPS                                                                                           |
| `ImportToArea`        | Configuración de importación automática al área                                                                        |
| `Person`              | Registro de persona con nombre, ID, credenciales                                                                       |
| `PersonDTO`           | Objeto de transferencia de datos extendido de persona                                                                  |
| `PersonGroup`         | Información de departamento/grupo de personas                                                                          |
| `PictureInfo`         | Información de imagen para archivos de alarma                                                                          |
| `PlateRect`           | Coordenadas del rectángulo de la matrícula                                                                             |
| `QueueInfo`           | Información relacionada con alarma de cola                                                                             |
| `RecordInfo`          | Información de grabación de video (incluye dirección, recordTime)                                                      |
| `RemoteControl`       | Parámetros de control remoto de puerta                                                                                 |
| `Resident`            | Información de residente de videoportero                                                                               |
| `RoomDTO`             | Objeto de transferencia de datos de habitación de videoportero                                                         |
| `TempAuth`            | Información de pase temporal                                                                                           |
| `TimeZone`            | Configuración de zona horaria                                                                                          |
| `User`                | Usuario del sistema con id y nombre                                                                                    |
| `VehicleInfo`         | Información del vehículo vinculado al dispositivo a bordo                                                              |
| `VehicleRelatedInfo`  | Información de alarma relacionada con vehículo                                                                         |
| `VideoInfo`           | Información del flujo de video                                                                                         |


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


#### Errores LAP


| Código de Error | Descripción                                     | Sugerencia de Depuración           |
| --------------- | ----------------------------------------------- | ---------------------------------- |
| `LAP000001`     | Error de parámetro                              | Verifique los parámetros de la API |
| `LAP000004`     | Tiempo de espera de llamada al servicio agotado | Reintente                          |


#### Errores Específicos de Dispositivo


| Código de Error        | Descripción          | Sugerencia de Depuración                         |
| ---------------------- | -------------------- | ------------------------------------------------ |
| `THD_ISAPI_0x20000004` | Dispositivo ocupado  | Complete la operación actual antes de reintentar |
| `THD_ISAPI_0x60000003` | Error de mensaje XML | Contacte al soporte técnico                      |


---
