> ← [Documentación Hik-Partner Pro](README.md) · [Apéndice A](APENDICE-A.md) · [Apéndice B](APENDICE-B.md) · [Apéndice C](APENDICE-C.md) · [Historial](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice C — Códigos de respuesta de dispositivos (protocolo de texto)

> **Notas:** se conserva la numeración del PDF (A.7–A.8). Estos códigos los devuelve el dispositivo vía ISAPI/reenvío transparente, no la OpenAPI de la plataforma (cuyos códigos están en [A.1 Códigos de Estado y Error](APENDICE-A.md#a1-códigos-de-estado-y-error)).

### A.7 Códigos de Respuesta del Protocolo de Texto

Los códigos de respuesta que se devuelven durante la integración mediante el protocolo de texto se basan en los códigos de estado de HTTP. Hay 7 tipos de códigos de estado predefinidos: 1 (OK), 2 (Device Busy, dispositivo ocupado), 3 (Device Error, error del dispositivo), 4 (Invalid Operation, operación no válida), 5 (Invalid Message Format, formato de mensaje no válido), 6 (Invalid Message Content, contenido de mensaje no válido) y 7 (Reboot Required, se requiere reinicio). Cada tipo de código de estado contiene varios subcódigos de estado (sub status codes), y los códigos de respuesta tienen una correspondencia uno a uno con los subcódigos de estado.

> **Notas:**
> - Las columnas **Sub Status Code** y **Error Code** se reproducen literalmente del PDF, incluidas sus erratas (`updateDatabasError`, `unitInfoEror`, `getProgressFaild`, etc.) y los puntos finales que algunos traen (`getUpgradeProcessfailed.`, `invalidServiceType.`). El orden de las filas es el del PDF, aunque algunos códigos no estén en secuencia.
> - `analysis unitFull` (0x40001017) contiene un espacio tal como aparece en el PDF.
> - Los códigos `0x600000012` a `0x600000016` tienen 9 dígitos hexadecimales en el PDF; se conservan tal cual.
> - Las filas con `/` en **Error Code** (después de `0x4000A01D` y de `0x60008016`) no tienen código propio en el PDF; se reproducen tal como aparecen.
> - La descripción de `0x40001051` (`deleteArmingInfo`) en el PDF tiene un término omitido ("The camera is already . Disarm…"); se marca así en la traducción.
> - La descripción de `0x4000114F` (`theURLIsTooLong`) en el PDF es idéntica a la de `0x40001150` ("No schedule configured for the task."); se traduce tal cual, aunque no corresponde al nombre del código.

#### StatusCode=1 — OK

| Sub Status Code | Error Code | Descripción |
| --------------- | ---------- | ----------- |
| `ok` | `0x1` | Operación completada. |
| `riskPassword` | `0x10000002` | Contraseña de riesgo. |
| `armProcess` | `0x10000005` | Proceso de armado. |

#### StatusCode=2 — Dispositivo ocupado (Device Busy)

| Sub Status Code | Error Code | Descripción |
| --------------- | ---------- | ----------- |
| `noMemory` | `0x20000001` | Memoria insuficiente. |
| `serviceUnavailable` | `0x20000002` | El servicio no está disponible. |
| `upgrading` | `0x20000003` | Actualizando firmware. |
| `deviceBusy` | `0x20000004` | El dispositivo está ocupado o no responde. |
| `reConnectIpc` | `0x20000005` | El servidor de video se reconectó. |
| `transferUpgradePackageFailed` | `0x20000006` | Falló la transmisión de los datos de actualización del dispositivo. |
| `startUpgradeFailed` | `0x20000007` | Falló el inicio de la actualización del dispositivo. |
| `getUpgradeProcessfailed.` | `0x20000008` | Falló la obtención del estado de la actualización. |
| `certificateExist` | `0x2000000B` | El certificado de autenticación ya existe. |

#### StatusCode=3 — Error del dispositivo (Device Error)

| Sub Status Code | Error Code | Descripción |
| --------------- | ---------- | ----------- |
| `deviceError` | `0x30000001` | Error de hardware. |
| `badFlash` | `0x30000002` | Error de operación de la memoria flash. |
| `28181Uninitialized` | `0x30000003` | La configuración 28181 no está inicializada. |
| `socketConnectError` | `0x30000005` | Falló la conexión al socket. |
| `receiveError` | `0x30000007` | Falló la recepción del mensaje de respuesta. |
| `deletePictureError` | `0x3000000A` | Falló la eliminación de la imagen. |
| `pictureSizeExceedLimit` | `0x3000000C` | Tamaño de imagen demasiado grande. |
| `clearCacheError` | `0x3000000D` | Falló la limpieza de la caché. |
| `updateDatabasError` | `0x3000000F` | Falló la actualización de la base de datos. |
| `searchDatabaseError` | `0x30000010` | Falló la búsqueda en la base de datos. |
| `writeDatabaseError` | `0x30000011` | Falló la escritura en la base de datos. |
| `deleteDatabaseError` | `0x30000012` | Falló la eliminación del elemento de la base de datos. |
| `searchDatabaseElementError` | `0x30000013` | Falló la obtención del número de elementos de la base de datos. |
| `cloudAutoUpgradeException` | `0x30000016` | Falló la descarga del paquete de actualización desde la nube y la actualización. |
| `HBPException` | `0x30001000` | Excepción de HBP. |
| `UDEPException` | `0x30001001` | Excepción de UDEP. |
| `elasticSearchException` | `0x30001002` | Excepción de Elastic. |
| `kafkaException` | `0x30001003` | Excepción de Kafka. |
| `HBaseException` | `0x30001004` | Excepción de HBase. |
| `sparkException` | `0x30001005` | Excepción de Spark. |
| `yarnException` | `0x30001006` | Excepción de Yarn. |
| `cacheException` | `0x30001007` | Excepción de caché. |
| `trafficException` | `0x30001008` | Excepción del servidor de big data de puntos de monitoreo. |
| `faceException` | `0x30001009` | Excepción del servidor de big data de rostros. |
| `SSDFileSystemIsError` | `0x30001013` | Error del sistema de archivos de la SSD (ocurre cuando el sistema de archivos no es Ext4). |
| `insufficientSSDCapacityForFPD` | `0x30001014` | Espacio insuficiente en la SSD para la detección de frecuencia de personas. |
| `wifiException` | `0x3000100A` | Excepción del servidor de big data de Wi-Fi. |
| `structException` | `0x3000100D` | Excepción del servidor de estructuración de parámetros de video. |
| `noLinkageResource` | `0x30001015` | Recursos de vinculación insuficientes. |
| `engineAbnormal` | `0x30002015` | Excepción del motor. |
| `engineInitialization` | `0x30002016` | Inicializando el motor. |
| `algorithmLoadingFailed` | `0x30002017` | Falló la carga del modelo. |
| `algorithmDownloadFailed` | `0x30002018` | Falló la descarga del modelo. |
| `algorithmDecryptionFailed` | `0x30002019` | Falló el descifrado del modelo. |
| `unboundChannel` | `0x30002020` | Elimine el canal vinculado para cargar el nuevo modelo. |
| `unsupportedResolution` | `0x30002021` | Resolución no válida. |
| `unsupportedSteamType` | `0x30002022` | Tipo de stream no válido. |
| `insufficientDecRes` | `0x30002023` | Recursos de decodificación insuficientes. |
| `insufficientEnginePerformance` | `0x30002024` | Rendimiento del motor insuficiente (el número de canales por analizar supera la capacidad del motor). |
| `improperResolution` | `0x30002025` | Resolución inadecuada (la resolución máxima permitida es 4096×4096). |
| `improperPicSize` | `0x30002026` | Tamaño de imagen inadecuado (el tamaño máximo permitido es 5 MB). |
| `URLDownloadFailed` | `0x30002027` | Falló la descarga de la imagen mediante el URI. |
| `unsupportedImageFormat` | `0x30002028` | Formato de imagen no válido (actualmente solo se admite JPG). |
| `unsupportedPollingIntervalTime` | `0x30002029` | Intervalo de sondeo no válido (el intervalo debe ser mayor a 10 s). |
| `exceedImagesNumber` | `0x30002030` | El número de imágenes supera el límite (la plataforma puede aplicar de 1 a 100 URIs de imagen por vez; el máximo permitido es 100). |
| `unsupportedMPID` | `0x30002031` | El MPID aplicado no existe en el dispositivo, por lo que no se admite actualizar este MPID. |
| `modelPackageNotMatchLabel` | `0x30002032` | El modelo y el archivo de descripción no coinciden. |
| `modelPackageNotMatchTask` | `0x30002033` | La tarea y el tipo de modelo no coinciden. |
| `insufficientSpace` | `0x30002034` | Espacio insuficiente (cuando el número de paquetes de modelo no alcanza el máximo permitido pero su tamaño conjunto supera el espacio libre, no se pueden agregar los paquetes de modelo). |
| `engineUnLoadingModelPackage` | `0x30002035` | Falló la aplicación de la tarea. Este motor no está vinculado a un paquete de modelo (falló la cancelación de la vinculación: este motor no está vinculado a un paquete de modelo). |
| `engineWithModelPackage` | `0x30002036` | Falló la vinculación del motor con este paquete de modelo. El motor ya está vinculado a otro paquete de modelo. Cancele primero esa vinculación. |
| `modelPackageDelete` | `0x30002037` | Falló la vinculación del paquete de modelo. El paquete de modelo fue eliminado. |
| `deleteTaskFailed` | `0x30002038` | Falló la eliminación de la tarea (se devuelve cuando el usuario no logra finalizar una tarea). |
| `modelPackageNumberslimited` | `0x30002039` | Falló la adición del paquete de modelo. El número de paquetes de modelo alcanzó el máximo permitido. |
| `modelPackageDeleteFailed` | `0x30002040` | Falló la eliminación del paquete de modelo. |
| `noArmingResource` | `0x30001016` | Recursos de armado insuficientes. |
| `calibrationTimeout` | `0x30002051` | Se agotó el tiempo de calibración. |
| `captureTimeout` | `0x30006000` | Se agotó el tiempo de recolección de datos. |
| `lowScore` | `0x30006001` | Baja calidad de los datos recolectados. |
| `uploadingFailed` | `0x30007004` | Falló la carga. |

#### StatusCode=4 — Operación no válida (Invalid Operation)

| Sub Status Code | Error Code | Descripción |
| --------------- | ---------- | ----------- |
| `notSupport` | `0x40000001` | No soportado. |
| `lowPrivilege` | `0x40000002` | Sin permiso. |
| `badAuthorization` | `0x40000003` | Falló la autenticación. |
| `methodNotAllowed` | `0x40000004` | Método HTTP no válido. |
| `notSetHdiskRedund` | `0x40000005` | Falló la configuración del HDD de respaldo. |
| `invalidOperation` | `0x40000006` | Operación no válida. |
| `notActivated` | `0x40000007` | No activado. |
| `hasActivated` | `0x40000008` | Activado. |
| `certificateAlreadyExist` | `0x40000009` | El certificado ya existe. |
| `operateFailed` | `0x4000000F` | Falló la operación. |
| `USBNotExist` | `0x40000010` | El dispositivo USB no está conectado. |
| `upgradePackageMorethan2GB` | `0x40001000` | Solo se permite cargar paquetes de actualización de hasta 2 GB. |
| `IDNotexist` | `0x40001001` | El ID no existe. |
| `interfaceOperationError` | `0x40001002` | Falló la operación de la API. |
| `synchronizationError` | `0x40001003` | Falló la sincronización. |
| `synchronizing` | `0x40001004` | Sincronizando. |
| `importError` | `0x40001005` | Falló la importación. |
| `importing` | `0x40001006` | Importando. |
| `fileAlreadyExists` | `0x40001007` | El archivo ya existe. |
| `invalidID` | `0x40001008` | ID no válido. |
| `backupnodeNotAlloweLog` | `0x40001009` | No se permite el acceso al nodo de respaldo. |
| `exportingError` | `0x4000100A` | Falló la exportación. |
| `exporting` | `0x4000100B` | Exportando. |
| `exportEnded` | `0x4000100C` | Exportación detenida. |
| `exported` | `0x4000100D` | Exportado. |
| `IPOccupied` | `0x4000100E` | La dirección IP ya está ocupada. |
| `IDAlreadyExists` | `0x4000100F` | El ID ya existe. |
| `exportItemsExceedLimit` | `0x40001010` | No se pueden exportar más elementos. |
| `noFiles` | `0x40001011` | El archivo no existe. |
| `beingExportedByAnotherUser` | `0x40001012` | Otro usuario está exportando. |
| `needReAuthentication` | `0x40001013` | Se requiere autenticación después de la actualización. |
| `unitAddNotOnline` | `0x40001015` | El servidor de análisis de datos agregado está fuera de línea. |
| `unitControl` | `0x40001016` | El servidor de análisis de datos ya está agregado. |
| `analysis unitFull` | `0x40001017` | No se pueden agregar más servidores de análisis de datos. |
| `unitIDError` | `0x40001018` | El ID del servidor de análisis de datos no existe. |
| `unitExit` | `0x40001019` | El servidor de análisis de datos ya existe en la lista. |
| `unitSearch` | `0x4000101A` | Falló la búsqueda del servidor de análisis de datos en la lista. |
| `unitNotOnline` | `0x4000101B` | El servidor de análisis de datos está fuera de línea. |
| `unitInfoEror` | `0x4000101C` | Falló la obtención de la información del servidor de análisis de datos. |
| `unitGetNodeInfoError` | `0x4000101D` | Falló la obtención de la información del nodo. |
| `unitGetNetworkInfoError` | `0x4000101E` | Falló la obtención de la información de red del servidor de análisis de datos. |
| `unitSetNetworkInfoError` | `0x4000101F` | Falló la configuración de la información de red del servidor de análisis de datos. |
| `setSmartNodeInfoError` | `0x40001020` | Falló la configuración de la información del nodo. |
| `setUnitNetworkInfoError` | `0x40001021` | Falló la configuración de la información de red del servidor de análisis de datos. |
| `unitRestartCloseError` | `0x40001022` | Falló el reinicio o apagado del servidor de análisis de datos. |
| `virtualIPnotAllowed` | `0x40001023` | No se permite agregar una dirección IP virtual. |
| `unitInstalled` | `0x40001024` | El servidor de análisis de datos ya está instalado. |
| `badSubnetMask` | `0x40001025` | Máscara de subred no válida. |
| `uintVersionMismatched` | `0x40001026` | La versión del servidor de análisis de datos no coincide. |
| `deviceMOdelMismatched` | `0x40001027` | Falló la adición. El modelo del dispositivo no coincide. |
| `unitAddNotSelf` | `0x40001028` | No se permite agregar periféricos. |
| `noValidUnit` | `0x40001029` | No hay un servidor de análisis de datos válido. |
| `unitNameDuplicate` | `0x4000102A` | Nombre de servidor de análisis de datos duplicado. |
| `deleteUnitFirst` | `0x4000102B` | Elimine primero el servidor de análisis de datos agregado al nodo. |
| `getLocalInfoFailed` | `0x4000102C` | Falló la obtención de la información del servidor. |
| `getClientAddedNodeFailed` | `0x4000102D` | Falló la obtención de la información de los nodos agregados al servidor de análisis de datos. |
| `taskExit` | `0x4000102E` | La tarea ya existe. |
| `taskInitError` | `0x4000102F` | Falló la inicialización de la tarea. |
| `taskSubmitError` | `0x40001030` | Falló el envío de la tarea. |
| `taskDelError` | `0x40001031` | Falló la eliminación de la tarea. |
| `taskPauseError` | `0x40001032` | Falló la pausa de la tarea. |
| `taskContinueError` | `0x40001033` | Falló el inicio de la tarea. |
| `taskSeverNoCfg` | `0x40001035` | El servidor de búsqueda de texto completo no está configurado. |
| `taskPicSeverNoCfg` | `0x40001036` | El servidor de imágenes no está configurado. |
| `taskStreamError` | `0x40001037` | Excepción en la información de streaming. |
| `taskRecSDK` | `0x40001038` | No se admite la grabación histórica. |
| `taskCasaError` | `0x4000103A` | No se admite la conexión en cascada. |
| `taskVCARuleError` | `0x4000103B` | Regla VCA no válida. |
| `taskNoRun` | `0x4000103C` | La tarea no se ejecutó. |
| `unitLinksNoStorageNode` | `0x4000103D` | No hay ningún nodo vinculado al servidor de análisis de datos. Configure primero el nodo. |
| `searchFailed` | `0x4000103E` | Falló la búsqueda de archivos de video. |
| `searchNull` | `0x4000103F` | No hay clips de video. |
| `userScheOffline` | `0x40001040` | El servicio del programador de tareas está fuera de línea. |
| `updateTypeUnmatched` | `0x40001041` | El tipo de paquete de actualización no coincide. |
| `userExist` | `0x40001043` | El usuario ya existe. |
| `userCannotDelAdmin` | `0x40001044` | No se puede eliminar al administrador. |
| `userInexistence` | `0x40001045` | El nombre de usuario no existe. |
| `userCannotCreatAdmin` | `0x40001046` | No se puede crear al administrador. |
| `monitorCamExceed` | `0x40001048` | Se pueden agregar hasta 3000 cámaras. |
| `monitorCunitOverLimit` | `0x40001049` | Falló la adición. El centro de control admite hasta 5 niveles inferiores. |
| `monitorReginOverLimit` | `0x4000104A` | Falló la adición. El área admite hasta 5 niveles inferiores. |
| `monitorArming` | `0x4000104B` | La cámara ya está armada. Desarme la cámara e intente de nuevo. |
| `monitorSyncCfgNotSet` | `0x4000104C` | Los parámetros del sistema no están configurados. |
| `monitorFdSyncing` | `0x4000104E` | Sincronizando. Intente de nuevo cuando termine la sincronización. |
| `monitorParseFailed` | `0x4000104F` | Falló el análisis de la información de la cámara. |
| `monitorCreatRootFailed` | `0x40001050` | Falló la creación del nodo de recursos. |
| `deleteArmingInfo` | `0x40001051` | La cámara ya está [término omitido en el PDF]. Desarme la cámara e intente de nuevo. |
| `cannotModify` | `0x40001052` | No se permite editar. Seleccione de nuevo. |
| `cannotDel` | `0x40001053` | No se permite eliminar. Seleccione de nuevo. |
| `deviceExist` | `0x40001054` | El dispositivo ya existe. |
| `IPErrorConnectFailed` | `0x40001056` | Falló la conexión. Verifique el puerto de red. |
| `cannotAdd` | `0x40001057` | Solo se pueden agregar cámaras de captura. |
| `serverExist` | `0x40001058` | El servidor ya existe. |
| `fullTextParamError` | `0x40001059` | Parámetros de búsqueda de texto completo incorrectos. |
| `storParamError` | `0x4000105A` | Parámetros del servidor de almacenamiento incorrectos. |
| `picServerFull` | `0x4000105B` | El espacio del servidor de almacenamiento de imágenes está lleno. |
| `NTPUnconnect` | `0x4000105C` | Falló la conexión al servidor NTP. Verifique los parámetros. |
| `storSerConnectFailed` | `0x4000105D` | Falló la conexión al servidor de almacenamiento. Verifique el puerto de red. |
| `storSerLoginFailed` | `0x4000105E` | Falló el inicio de sesión en el servidor de almacenamiento. Verifique el nombre de usuario y la contraseña. |
| `searchSerConnectFailed` | `0x4000105F` | Falló la conexión al servidor de búsqueda de texto completo. Verifique el puerto de red. |
| `searchSerLoginFailed` | `0x40001060` | Falló el inicio de sesión en el servidor de búsqueda de texto completo. Verifique el nombre de usuario y la contraseña. |
| `kafkaConnectFailed` | `0x40001061` | Falló la conexión a Kafka. Verifique el puerto de red. |
| `mgmtConnectFailed` | `0x40001062` | Falló la conexión al sistema. Verifique el puerto de red. |
| `mgmtLoginFailed` | `0x40001063` | Falló el inicio de sesión en el sistema. Verifique el nombre de usuario y la contraseña. |
| `TDAConnectFailed` | `0x40001064` | Falló la conexión al servidor de acceso a datos de tráfico. Verifique el estado del servidor. |
| `86sdkConnectFailed` | `0x40001065` | Falló la conexión al puerto de escucha del sistema iVMS-8600. Verifique los parámetros. |
| `nameExist` | `0x40001066` | Nombre de servidor duplicado. |
| `batchProcessFailed` | `0x40001067` | Falló el procesamiento por lotes. |
| `IDNotExist` | `0x40001068` | El ID del servidor no existe. |
| `serviceNumberReachesLimit` | `0x40001069` | No se pueden agregar más servicios. |
| `invalidServiceType.` | `0x4000106A` | Tipo de servicio no válido. |
| `clusterGetInfo` | `0x4000106B` | Falló la obtención de la información del grupo del clúster. |
| `clusterDelNode` | `0x4000106C` | Falló la eliminación del nodo. |
| `clusterAddNode` | `0x4000106D` | Falló la adición del nodo. |
| `clusterInstalling` | `0x4000106E` | Creando el clúster… No realice operaciones. |
| `clusterUninstall` | `0x4000106F` | Restableciendo el clúster… No realice operaciones. |
| `clusterInstall` | `0x40001070` | Falló la creación del clúster. |
| `clusterIpError` | `0x40001071` | Dirección IP del servidor del programador de tareas no válida. |
| `clusterNotSameSeg` | `0x40001072` | El nodo principal y el nodo secundario deben estar en el mismo segmento de red. |
| `clusterVirIpError` | `0x40001073` | Falló la obtención automática de la dirección IP virtual. Ingrésela manualmente. |
| `clusterNodeUnadd` | `0x40001074` | El nodo principal (secundario) especificado no está agregado. |
| `clusterNodeOffline` | `0x40001075` | El servidor del programador de tareas está fuera de línea. |
| `nodeNotCurrentIP` | `0x40001076` | Al agregar los nodos principal y secundario se requiere el nodo de análisis de la dirección IP actual. |
| `addNodeNetFailed` | `0x40001077` | Falló la adición del nodo. La red se desconectó. |
| `needTwoMgmtNode` | `0x40001078` | Al agregar los nodos principal y secundario se requieren dos nodos de administración. |
| `ipConflict` | `0x40001079` | La dirección IP virtual y la dirección IP del servidor de análisis de datos entran en conflicto. |
| `ipUsed` | `0x4000107A` | La dirección IP virtual ya está ocupada. |
| `cloudAlalyseOnline` | `0x4000107B` | El servidor de análisis en la nube está en línea. |
| `virIP&mainIPnotSameNetSegment` | `0x4000107C` | La dirección IP virtual no está en el mismo segmento de red que la dirección IP del nodo principal/secundario. |
| `getNodeDispatchInfoFailed` | `0x4000107D` | Falló la obtención de la información del programador del nodo. |
| `unableModifyManagementNetworkIP` | `0x4000107E` | Falló la edición de la interfaz de red de administración. La tarjeta de análisis está en el clúster. |
| `notSpecifyVirtualIP` | `0x4000107F` | Se debe especificar una dirección IP virtual para el clúster principal y secundario. |
| `armingFull` | `0x40001080` | No se pueden armar más dispositivos. |
| `armingNoFind` | `0x40001081` | La información de armado no existe. |
| `disArming` | `0x40001082` | Falló el desarmado. |
| `getArmingError` | `0x40001084` | Falló la obtención de la información de armado. |
| `refreshArmingError` | `0x40001085` | Falló la actualización de la información de armado. |
| `ArmingPlateSame` | `0x40001086` | El número de placa se armó de forma repetida. |
| `ArmingParseXLSError` | `0x40001087` | Falló el análisis del archivo de información de armado. |
| `ArmingTimeError` | `0x40001088` | Periodo de armado no válido. |
| `ArmingSearchTimeError` | `0x40001089` | Periodo de búsqueda no válido. |
| `armingRelationshipReachesLimit` | `0x4000108A` | No se pueden crear más relaciones. |
| `duplicateAarmingName` | `0x4000108B` | El nombre de la relación ya existe. |
| `noMoreArmingListAdded` | `0x4000108C` | No se pueden armar más bibliotecas de lista de bloqueo. |
| `noMoreCamerasAdded` | `0x4000108D` | No se pueden armar más cámaras. |
| `noMoreArmingListAddedWithCamera` | `0x4000108E` | No se pueden vincular más bibliotecas a la cámara. |
| `noMoreArmingPeriodAdded` | `0x4000108F` | No se pueden agregar más periodos al programa de armado. |
| `armingPeriodsOverlapped` | `0x40001090` | Los periodos del programa de armado se traslapan. |
| `noArmingAlarmInfo` | `0x40001091` | La información de alarma no existe. |
| `armingAlarmUnRead` | `0x40001092` | Falló la obtención del número de alarmas no leídas. |
| `getArmingAlarmError` | `0x40001093` | Falló la obtención de la información de alarma. |
| `searchByPictureTimedOut` | `0x40001094` | Se agotó el tiempo de la búsqueda de imagen por imagen. Busque de nuevo. |
| `comparisonTimeRangeError` | `0x40001095` | Error en el periodo de comparación. |
| `selectMonitorNumberUpperLimit` | `0x40001096` | No se pueden filtrar más IDs de puntos de monitoreo. |
| `noMoreComparisonTasksAdded` | `0x40001097` | No se pueden ejecutar más tareas de comparación al mismo tiempo. |
| `GetComparisonResultFailed` | `0x40001098` | Falló la obtención del resultado de la comparación. |
| `comparisonTypeError` | `0x40001099` | Error en el tipo de comparación. |
| `comparisonUnfinished` | `0x4000109A` | La comparación no ha terminado. |
| `facePictureModelInvalid` | `0x4000109B` | Modelo de rostro no válido. |
| `duplicateLibraryName.` | `0x4000109C` | El nombre de la biblioteca ya existe. |
| `noRecord` | `0x4000109D` | No se encontraron registros. |
| `countingRecordsFailed.` | `0x4000109E` | Falló el cálculo del número de registros. |
| `getHumanFaceFrameFailed` | `0x4000109F` | Falló la obtención de la miniatura del rostro a partir de la imagen. |
| `modelingFailed.` | `0x400010A0` | Falló el modelado del rostro a partir de la URL de la imagen. |
| `1V1FacePictureComparisonFailed` | `0x400010A1` | Falló la comparación 1 VS 1 de imágenes de rostro. |
| `libraryArmed` | `0x400010A2` | La biblioteca de lista de bloqueo está armada. |
| `licenseExeedLimit` | `0x400010A3` | Dongle limitado. |
| `licenseExpired` | `0x400010A4` | Dongle vencido. |
| `licenseDisabled` | `0x400010A5` | Dongle no disponible. |
| `licenseNotExist` | `0x400010A6` | El dongle no existe. |
| `SessionExpired` | `0x400010A7` | Sesión vencida. |
| `beyondConcurrentLimit` | `0x400010A8` | Se superó el límite de concurrencia. |
| `stopSync` | `0x400010A9` | Sincronización detenida. |
| `getProgressFaild` | `0x400010AA` | Falló la obtención del progreso. |
| `uploadExtraCaps` | `0x400010AB` | No se pueden cargar más archivos. |
| `timeRangeError` | `0x400010AC` | Error en el periodo. |
| `dataPortNotConnected` | `0x400010AD` | El puerto de datos no está conectado. |
| `addClusterNodeFailed` | `0x400010AE` | Falló la adición al clúster. El dispositivo ya está agregado a otro clúster. |
| `taskNotExist` | `0x400010AF` | La tarea no existe. |
| `taskQueryFailed` | `0x400010B0` | Falló la búsqueda de la tarea. |
| `modifyTimeRuleFailed` | `0x400010B2` | La tarea ya existe. No se permite editar la regla de tiempo. |
| `modifySmartRuleFailed` | `0x400010B3` | La tarea ya existe. No se permite editar la regla VAC. |
| `queryHistoryVideoFailed` | `0x400010B4` | Falló la búsqueda de video histórico. |
| `addDeviceFailed` | `0x400010B5` | Falló la adición del dispositivo. |
| `addVideoFailed` | `0x400010B6` | Falló la adición de archivos de video. |
| `deleteAllVideoFailed` | `0x400010B7` | Falló la eliminación de todos los archivos de video. |
| `createVideoIndexFailed` | `0x400010B8` | Falló la indexación de archivos de video. |
| `videoCheckTypeFailed` | `0x400010B9` | Falló la verificación de los tipos de archivos de video. |
| `configStructuredAddressFailed` | `0x400010BA` | Falló la configuración de la dirección IP del servidor de estructuración. |
| `configPictureServerAddressFailed` | `0x400010BB` | Falló la configuración de la dirección IP del servidor de almacenamiento de imágenes. |
| `storageServiceIPNotExist` | `0x400010BD` | La dirección IP del servidor de almacenamiento no existe. |
| `syncBackupDatabaseFailed` | `0x400010BE` | Falló la sincronización de la base de datos secundaria. Intente de nuevo. |
| `syncBackupNTPTimeFailed` | `0x400010BF` | Falló la sincronización de la hora NTP del servidor secundario. |
| `clusterNotSelectLoopbackAddress` | `0x400010C0` | El clúster principal o secundario no admite la dirección de loopback. |
| `addFaceRecordFailed` | `0x400010C1` | Falló la adición del registro de rostro. |
| `deleteFaceRecordFailed` | `0x400010C2` | Falló la eliminación del registro de rostro. |
| `modifyFaceRecordFailed` | `0x400010C3` | Falló la edición del registro de rostro. |
| `queryFaceRecordFailed` | `0x400010C4` | Falló la búsqueda del registro de rostro. |
| `faceDetectFailed` | `0x400010C5` | Falló la detección del rostro. |
| `libraryNotExist` | `0x400010C6` | La biblioteca no existe. |
| `blackListQueryExporting` | `0x400010C7` | Exportando las listas de bloqueo coincidentes. |
| `blackListQueryExported` | `0x400010C8` | Se exportaron las listas de bloqueo coincidentes. |
| `blackListQueryStopExporting` | `0x400010C9` | Se detuvo la exportación de las listas de bloqueo coincidentes. |
| `blackListAlarmQueryExporting` | `0x400010CA` | Exportando las alarmas de lista de bloqueo coincidentes. |
| `blackListAlarmQueryExported` | `0x400010CB` | Se exportaron las alarmas de lista de bloqueo coincidentes. |
| `blackListAlarmQueryStopExporting` | `0x400010CC` | Se detuvo la exportación de las alarmas de lista de bloqueo coincidentes. |
| `getBigDataCloudAnalysisFailed` | `0x400010CD` | Falló la obtención de la información de análisis de big data en la nube. |
| `setBigDataCloudAnalysisFailed` | `0x400010CE` | Falló la configuración del análisis de big data en la nube. |
| `submitMapSearchFailed` | `0x400010CF` | Falló el envío de la tarea de búsqueda mediante comparación de imágenes. |
| `controlRelationshipNotExist` | `0x400010D0` | La relación no existe. |
| `getHistoryAlarmInfoFailed` | `0x400010D1` | Falló la obtención de la información histórica de alarmas. |
| `getFlowReportFailed` | `0x400010D2` | Falló la obtención del reporte de conteo de personas. |
| `addGuardFailed` | `0x400010D3` | Falló la adición de la configuración de armado. |
| `deleteGuardFailed` | `0x400010D4` | Falló la eliminación de la configuración de armado. |
| `modifyGuardFailed` | `0x400010D5` | Falló la edición de la configuración de armado. |
| `queryGuardFailed` | `0x400010D6` | Falló la búsqueda de las configuraciones de armado. |
| `uploadUserSuperCaps` | `0x400010D7` | No se puede cargar más información de usuarios. |
| `bigDataServerConnectFailed` | `0x400010D8` | Falló la conexión al servidor de big data. |
| `microVideoCloudRequestInfoBuildFailed` | `0x400010D9` | Falló la adición de la información de respuesta de la nube de microvideo. |
| `microVideoCloudResponseInfoBuildFailed` | `0x400010DA` | Falló el análisis de la información de respuesta de la nube de microvideo. |
| `transcodingServerRequestInfoBuildFailed` | `0x400010DB` | Falló la adición de la información de respuesta del servidor de transcodificación. |
| `transcodingServerResponseInfoParseFailed` | `0x400010DC` | Falló el análisis de la información de respuesta del servidor de transcodificación. |
| `transcodingServerOffline` | `0x400010DD` | El servidor de transcodificación está fuera de línea. |
| `microVideoCloudOffline` | `0x400010DE` | La nube de microvideo está fuera de línea. |
| `UPSServerOffline` | `0x400010DF` | El servidor de monitoreo de UPS está fuera de línea. |
| `statisticReportRequestInfoBuildFailed` | `0x400010E0` | Falló la adición de la información de respuesta del reporte estadístico. |
| `statisticReportResponseInfoParseFailed` | `0x400010E1` | Falló el análisis de la información de respuesta del reporte estadístico. |
| `DisplayConfigInfoBuildFailed` | `0x400010E2` | Falló la adición de la información de configuración de visualización. |
| `DisplayConfigInfoParseFailed` | `0x400010E3` | Falló el análisis de la información de configuración de visualización. |
| `DisplayConfigInfoSaveFailed` | `0x400010E4` | Falló el guardado de la información de configuración de visualización. |
| `notSupportDisplayConfigType` | `0x400010E5` | No se admite el tipo de configuración de visualización. |
| `passError` | `0x400010E7` | Contraseña incorrecta. |
| `upgradePackageLarge` | `0x400010EB` | Paquete de actualización demasiado grande. |
| `sesssionUserReachesLimit` | `0x400010EC` | No pueden iniciar sesión más usuarios mediante sesión. |
| `ISO8601TimeFormatError` | `0x400010ED` | Formato de hora ISO8601 no válido. |
| `clusterDissolutionFailed` | `0x400010EE` | Falló la eliminación del clúster. |
| `getServiceNodeInfoFailed` | `0x400010EF` | Falló la obtención de la información del nodo de servicio. |
| `getUPSInfoFailed` | `0x400010F0` | Falló la obtención de la información de configuración del UPS. |
| `getDataStatisticsReportFailed` | `0x400010F1` | Falló la obtención del reporte estadístico de datos. |
| `getDisplayConfigInfoFailed` | `0x400010F2` | Falló la obtención de la configuración de visualización. |
| `namingAnalysisBoardNotAllowed` | `0x400010F3` | No se permite renombrar la tarjeta de análisis. |
| `onlyDrawRegionsOfConvexPolygon` | `0x400010F4` | Solo se admite dibujar áreas de polígono convexo. |
| `bigDataServerResponseInfoParseFailed` | `0x400010F5` | Falló el análisis del mensaje de respuesta del servicio de big data. |
| `bigDataServerReturnFailed` | `0x400010F6` | El servicio de big data no devolvió respuesta. |
| `microVideoReturnFailed` | `0x400010F7` | El servicio de nube de microvideo no devolvió respuesta. |
| `transcodingServerReturnFailed` | `0x400010F8` | El servicio de transcodificación no devolvió respuesta. |
| `UPSServerReturnFailed` | `0x400010F9` | El servicio de monitoreo de UPS no devolvió respuesta. |
| `forwardingServerReturnFailed` | `0x400010FA` | El servicio de reenvío no devolvió respuesta. |
| `storageServerReturnFailed` | `0x400010FB` | El servicio de almacenamiento no devolvió respuesta. |
| `cloudAnalysisServerReturnFailed` | `0x400010FC` | El servicio de análisis en la nube no devolvió respuesta. |
| `modelEmpty` | `0x400010FD` | No se obtuvo ningún modelo. |
| `mainAndBackupNodeCannotModifyManagementNetworkInterfaceIP` | `0x400010FE` | No se permite editar la dirección IP de la interfaz de administración del nodo principal y del nodo de respaldo. |
| `IDTooLong` | `0x400010FF` | El ID es demasiado largo. |
| `pictureCheckFailed` | `0x40001100` | Falló la detección de la imagen. |
| `pictureModelingFailed` | `0x40001101` | Falló el modelado de la imagen. |
| `setCloudAnalsisDefaultProvinceFailed` | `0x40001102` | Falló la configuración de la provincia predeterminada del servicio de análisis en la nube. |
| `InspectionAreasNumberExceedLimit` | `0x40001103` | No se pueden agregar más regiones de detección. |
| `picturePixelsTooLarge` | `0x40001105` | La resolución de la imagen es demasiado alta. |
| `picturePixelsTooSmall` | `0x40001106` | La resolución de la imagen es demasiado baja. |
| `storageServiceIPEmpty` | `0x40001107` | La dirección IP del servidor de almacenamiento es obligatoria. |
| `bigDataServerRequestInfoBuildFail` | `0x40001108` | Falló la creación del mensaje de solicitud del servicio de big data. |
| `analysiTimedOut` | `0x40001109` | Se agotó el tiempo del análisis. |
| `high-performanceModeDisabled.` | `0x4000110A` | Habilite el modo de alto rendimiento. |
| `configuringUPSMonitoringServerTimedOut` | `0x4000110B` | Se agotó el tiempo de configuración del servidor de monitoreo de UPS. Verifique la dirección IP. |
| `cloudAnalysisRequestInformationBuildFailed` | `0x4000110C` | Falló la creación del mensaje de solicitud del servicio de análisis en la nube. |
| `cloudAnalysisResponseInformationParseFailed` | `0x4000110D` | Falló el análisis del mensaje de respuesta del servicio de análisis en la nube. |
| `allCloudAnalysisInterfaceFailed` | `0x4000110E` | Falló la llamada a la API del servicio de análisis en la nube. |
| `cloudAnalysisModelCompareFailed` | `0x4000110F` | Falló la comparación de modelos del servicio de análisis en la nube. |
| `cloudAnalysisFacePictureQualityRatingFailed` | `0x40001110` | Falló la obtención de la calificación de calidad de rostro del servicio de análisis en la nube. |
| `cloudAnalysisExtractFeaturePointsFailed` | `0x40001111` | Falló la extracción de características del servicio de análisis en la nube. |
| `cloudAnalysisExtractPropertyFailed` | `0x40001112` | Falló la extracción de propiedades del servicio de análisis en la nube. |
| `getAddedNodeInformationFailed` | `0x40001113` | Falló la obtención de la información de los nodos agregados al servidor de análisis de datos. |
| `noMoreAnalysisUnitsAdded` | `0x40001114` | No se pueden agregar más servidores de análisis de datos. |
| `detectionAreaInvalid` | `0x40001115` | Región de detección no válida. |
| `shieldAreaInvalid` | `0x40001116` | Región de enmascaramiento no válida. |
| `noMoreShieldAreasAdded` | `0x40001117` | No se pueden dibujar más regiones de enmascaramiento. |
| `onlyAreaOfRectangleShapeAllowed` | `0x40001118` | En el área de detección solo se permite dibujar rectángulos. |
| `numberReachedLlimit` | `0x40001119` | El número alcanzó el límite. |
| `wait1~3MinutesGetIPAfterSetupDHCP` | `0x4000111A` | Espere de 1 a 3 minutos para obtener la dirección IP después de configurar DHCP. |
| `plannedTimeMustbeHalfAnHour` | `0x4000111B` | El programa debe ser de media hora. |
| `oneDeviceCannotBuildCluster` | `0x4000111C` | Crear un clúster principal y de respaldo requiere al menos dos dispositivos. |
| `updatePackageFileNotUploaded` | `0x4000111E` | El paquete de actualización no se ha cargado. |
| `highPerformanceTasksNotSupportDrawingDetectionRegions` | `0x4000111F` | No se permite dibujar el área de detección en el modo de alto rendimiento. |
| `controlCenterIDDoesNotExist` | `0x40001120` | El ID del centro de control no existe. |
| `regionIDDoesNotExist` | `0x40001121` | El ID del área no existe. |
| `licensePlateFormatError` | `0x40001122` | Formato de placa no válido. |
| `managementNodeDoesNotSupportThisOperation` | `0x40001123` | La operación no está soportada. |
| `searchByPictureResourceNotConfiged` | `0x40001124` | Las condiciones para la búsqueda de imagen por imagen no están configuradas. |
| `videoFileEncapsulationFormatNotSupported` | `0x40001125` | No se admite el formato de contenedor del video. |
| `videoPackageFailure` | `0x40001126` | Falló la conversión del formato de contenedor del video. |
| `videoCodingFormatNotSupported` | `0x40001127` | No se admite el formato de codificación del video. |
| `monitorOfDeviceArmingdeleteArmingInfo` | `0x40001129` | La cámara está armada. Desármela e intente de nuevo. |
| `getVideoSourceTypeFailed` | `0x4000112A` | Falló la obtención del tipo de fuente de video. |
| `smartRulesBuildFailed` | `0x4000112B` | Falló la creación de la regla VAC. |
| `smartRulesParseFailed` | `0x4000112C` | Falló el análisis de la regla VAC. |
| `timeRulesBuildFailed` | `0x4000112D` | Falló la creación de la regla de tiempo. |
| `timeRulesParseFailed` | `0x4000112E` | Falló el análisis de la regla de tiempo. |
| `monitoInfoInvalid` | `0x4000112F` | Información de cámara no válida. |
| `addingFailedVersionMismatches` | `0x40001130` | Falló la adición. La versión del dispositivo no coincide. |
| `theInformationReturnedAfterCloudAnalysisIsEmpty` | `0x40001131` | El servicio de análisis en la nube no devolvió respuesta. |
| `selectingIpAddressOfHostAndSpareNodeFailedCheckTheStatus` | `0x40001132` | Falló la configuración de la dirección IP del nodo principal y del nodo de respaldo. Verifique el estado de los nodos. |
| `theSearchIdDoesNotExist` | `0x40001133` | El ID de búsqueda no existe. |
| `theSynchronizationIdDoesNotExist` | `0x40001134` | El ID de sincronización no existe. |
| `theUserIdDoesNotExist` | `0x40001136` | El ID de usuario no existe. |
| `theIndexCodeDoesNotExist` | `0x40001138` | El código de índice no existe. |
| `theControlCenterIdDoesNotExist` | `0x40001139` | El ID del centro de control no existe. |
| `theAreaIdDoesNotExist` | `0x4000113A` | El ID del área no existe. |
| `theArmingLinkageIdDoesNotExist` | `0x4000113C` | El ID de la relación de armado no existe. |
| `theListLibraryIdDoesNotExist` | `0x4000113D` | El ID de la biblioteca de listas no existe. |
| `invalidCityCode` | `0x4000113E` | Código de ciudad no válido. |
| `synchronizingThePasswordOfSpareServerFailed` | `0x4000113F` | Falló la sincronización de la contraseña del sistema de respaldo. |
| `editingStreamingTypeIsNotSupported` | `0x40001140` | No se admite editar el tipo de streaming. |
| `switchingScheduledTaskToTemporaryTaskIsNotSupported` | `0x40001141` | No se admite cambiar una tarea programada a tarea temporal. |
| `switchingTemporaryTaskToScheduledTaskIsNotSupported` | `0x40001142` | No se admite cambiar una tarea temporal a tarea programada. |
| `theTaskIsNotDispatchedOrItIsUpdating` | `0x40001143` | La tarea no se ha despachado o se está actualizando. |
| `thisTaskDoesNotExist` | `0x40001144` | Esta tarea no existe en el servicio de análisis en la nube. |
| `duplicatedSchedule` | `0x40001145` | Los periodos del programa no pueden traslaparse. |
| `continuousScheduleWithSameAlgorithmTypeShouldBeMerged` | `0x40001146` | Los periodos continuos del programa con el mismo tipo de algoritmo deben fusionarse. |
| `invalidStreamingTimeRange` | `0x40001147` | Periodo de streaming no válido. |
| `invalidListLibraryType` | `0x40001148` | Tipo de biblioteca de listas no válido. |
| `theNumberOfMatchedResultsShouldBeLargerThan0` | `0x40001149` | El número de resultados de búsqueda debe ser mayor a 0. |
| `invalidValueRangeOfSimilarity` | `0x4000114A` | Rango de similitud no válido. |
| `invalidSortingType` | `0x4000114B` | Tipo de ordenamiento no válido. |
| `noMoreListLibraryCanBeLinkedToTheDevice` | `0x4000114C` | No se pueden agregar más listas a un dispositivo. |
| `InvalidRecipientAddressFormat` | `0x4000114D` | Formato de dirección del receptor de resultados no válido. |
| `creatingClusterFailedTheDongleIsNotPluggedIn` | `0x4000114E` | Inserte el dongle antes de crear el clúster. |
| `theURLIsTooLong` | `0x4000114F` | No hay un programa configurado para la tarea. |
| `noScheduleIsConfiguredForTheTask` | `0x40001150` | No hay un programa configurado para la tarea. |
| `theDongleIsExpiried` | `0x40001151` | El dongle venció. |
| `dongleException` | `0x40001152` | Excepción del dongle. |
| `invalidKey` | `0x40001153` | Clave del servicio de autorización no válida. |
| `decryptionFailed` | `0x40001154` | Falló el descifrado del servicio de autorización. |
| `encryptionFailed` | `0x40001155` | Falló el cifrado del servicio de autorización. |
| `AuthorizeServiceResponseError` | `0x40001156` | Excepción en la respuesta del servicio de autorización. |
| `incorrectParameter` | `0x40001157` | Error en los parámetros del servicio de autorización. |
| `operationFailed` | `0x40001158` | Error al operar el servicio de autorización. |
| `noAnalysisResourceOrNoDataInTheListLibrary` | `0x40001159` | No hay recursos de análisis en la nube o no hay datos en la biblioteca de listas. |
| `calculationException` | `0x4000115A` | Excepción de cálculo. |
| `allocatingList` | `0x4000115B` | Asignando lista. |
| `thisOperationIsNotSupportedByTheCloudAnalytics` | `0x4000115C` | El servicio de análisis en la nube no admite esta operación. |
| `theCloudAnalyticsIsInterrupted` | `0x4000115D` | Se interrumpió la operación del servicio de análisis en la nube. |
| `theServiceIsNotReady` | `0x4000115E` | El servicio no está listo. |
| `searchingForExternalApiFailed` | `0x4000115F` | Falló la búsqueda de interfaces externas. |
| `noOnlineNode` | `0x40001160` | No hay ningún nodo en línea. |
| `noNodeAllocated` | `0x40001161` | No hay nodos asignados. |
| `noMatchedList` | `0x40001162` | No hay listas coincidentes. |
| `allocatingFailedTooManyFacePictureLists` | `0x40001163` | Falló la asignación. Demasiadas listas del servicio de big data. |
| `searchIsNotCompletedSearchAgain` | `0x40001164` | La búsqueda actual no ha terminado. Busque de nuevo. |
| `allocatingListIsNotCompleted` | `0x40001165` | La asignación de la lista no ha terminado. |
| `searchingForCloudAnalyticsResultsFailed` | `0x40001166` | Se agotó el tiempo de la búsqueda en el servicio de análisis en la nube. |
| `noDataOfTheCurrentLibraryFound` | `0x40001167` | No hay datos en la biblioteca actual. Asegúrese de que haya datos en HBase. |
| `noFacePictureLibraryIsArmed` | `0x40001168` | No hay ninguna biblioteca de imágenes de rostro armada para el servicio de big data. |
| `noAvailableDataSlicingVersionInformationArmFirstAndSliceTheData` | `0x40001169` | Información de versión estándar no válida. |
| `duplicatedOperationDataSlicingIsExecuting` | `0x4000116A` | Falló la segmentación. Operación duplicada. |
| `slicinDataFailedNoArmedFacePictureLibrary` | `0x4000116B` | Falló la segmentación. No hay información de armado en el big data de rostros. |
| `GenerateBenchmarkFileFailedSlicingAgain` | `0x4000116C` | Falló la generación del archivo segmentado. Segmente de nuevo. |
| `NonprimaryNodeIsProhibitedFromSlcingData` | `0x4000116D` | El nodo de respaldo no tiene permitido segmentar. |
| `NoReadyNodeToClusterServers` | `0x4000116E` | Falló la creación del clúster. No hay ningún nodo listo. |
| `NodeManagementServiceIsOffline` | `0x4000116F` | El servidor de administración de nodos está fuera de línea. |
| `theCamera(s)OfTheControlCenterAreAlreadyArmed.DisarmThemFirst` | `0x40001170` | Algunas cámaras del centro de control ya están armadas. Desármelas e intente de nuevo. |
| `theCamera(s)OfTheAreaAreAlreadyArmed.DisarmThemFirst` | `0x40001171` | Algunas cámaras de esta área ya están armadas. Desármelas e intente de nuevo. |
| `configuringHigh-frequencyPeopleDetectionFailed` | `0x40001172` | Falló la configuración de la detección de personas de alta frecuencia. |
| `searchingForHigh-frequencyPeopleDetectionLogsFailed.` | `0x40001173` | Falló la búsqueda de los registros de eventos de la detección de personas de alta frecuencia. |
| `gettingDetailsOfSearchedHigh-frequencyPeopleDetectionLogsFailed.` | `0x40001174` | Falló la obtención de los detalles de los resultados de búsqueda de alarmas de personas que aparecen con frecuencia. |
| `theArmedCamerasAlreadyExistInTheControlCenter` | `0x40001175` | Algunas cámaras del centro de control ya están armadas. |
| `disarmingFailedTheCameraIsNotArmed` | `0x40001177` | Falló el desarmado. La cámara no está armada. |
| `noDataReturned` | `0x40001178` | El servicio de big data no devolvió respuesta. |
| `preallocFailure` | `0x40001179` | Falló la preasignación del recurso de algoritmo. |
| `overDogLimit` | `0x4000117A` | Falló la configuración. No se pueden preasignar más recursos. |
| `analysisServicesDoNotSupport` | `0x4000117B` | No soportado. |
| `commandAndDispatchServiceError` | `0x4000117C` | Error del servicio de programación del servicio de análisis en la nube. |
| `engineModuleError` | `0x4000117D` | Error del módulo de motor del servicio de análisis en la nube. |
| `streamingServiceError` | `0x4000117E` | Error del componente de streaming del servicio de análisis en la nube. |
| `faceAnalysisModuleError` | `0x4000117F` | Error del módulo de análisis de rostros del servicio de análisis en la nube. |
| `vehicleAnalysisModuleError` | `0x40001180` | Error del módulo de análisis de imágenes de vehículos del servicio de análisis en la nube. |
| `videoStructuralAnalysisModuleError` | `0x40001181` | Error del módulo de estructuración de video del servicio de análisis en la nube. |
| `postprocessingModuleError` | `0x40001182` | Error del módulo de posprocesamiento del servicio de análisis en la nube. |
| `frequentlyAppearedPersonAlarmIsAlreadyConfiguredForListLibrary` | `0x40001183` | La alarma de persona que aparece con frecuencia ya está armada para la biblioteca de lista de bloqueo. |
| `creatingListLibraryFailed` | `0x40001184` | Falló la creación de la biblioteca de listas. |
| `invalidIdentiryKeyOfListLibrary` | `0x40001185` | Clave de identidad de la biblioteca de listas no válida. |
| `noMoreDevicesCanBeArmed` | `0x40001186` | No se pueden agregar más cámaras. |
| `settingAlgorithmTypeForDeviceFailed` | `0x40001187` | Falló la asignación del recurso de la tarea. |
| `gettingHighFrequencyPersonDetectionAlarmInformationFailed` | `0x40001188` | Falló la configuración de la alarma de persona que aparece con frecuencia. |
| `invalidSearchConfition` | `0x40001189` | Resultado no válido. |
| `theTaskIsNotCompleted` | `0x4000118B` | La tarea no ha terminado. |
| `resourceOverRemainLimit` | `0x4000118C` | No se pueden preasignar más recursos. |
| `frequentlyAppearedPersonAlarmIsAlreadyConfiguredForTheCameraDisarmFirstAndTryAgain` | `0x4000118D` | La alarma de persona que aparece con frecuencia de esta cámara está configurada. Elimine la información de armado e intente de nuevo. |
| `switchtimedifflesslimit` | `0x4000123b` | La diferencia de tiempo entre el encendido y el apagado debe ser menor a 10 minutos. |
| `associatedFaceLibNumOverLimit` | `0x40001279` | Se alcanzó el número máximo de bibliotecas de imágenes de rostro vinculadas. |
| `noMorePeopleNumChangeRulesAdded` | `0x4000128A` | Se alcanzó el número máximo de reglas de cambio en el número de personas. |
| `noMoreViolentMotionRulesAdded` | `0x4000128D` | Se alcanzó el número máximo de reglas de movimiento violento. |
| `noMoreLeavePositionRulesAdded` | `0x4000128E` | Se alcanzó el número máximo de reglas de abandono de puesto. |
| `SMRDiskNotSupportRaid` | `0x40001291` | El disco SMR no admite RAID. |
| `OnlySupportHikAndCustomProtocol` | `0x400012A3` | Las cámaras IPv6 solo pueden agregarse mediante Device Network SDK o protocolos personalizados. |
| `vehicleEnginesNoResource` | `0x400012A6` | Recursos insuficientes del motor de vehículos. |
| `noMoreRunningRulesAdded` | `0x400012A9` | Se alcanzó el número máximo de reglas de carrera. |
| `noMoreGroupRulesAdded` | `0x400012AA` | Se alcanzó el número máximo de reglas de aglomeración de personas. |
| `noMoreFailDownRulesAdded` | `0x400012AB` | Se alcanzó el número máximo de reglas de caída de personas. |
| `noMorePlayCellphoneRulesAdded` | `0x400012AC` | Se alcanzó el número máximo de reglas de uso de teléfono celular. |
| `ruleEventTypeDuplicate` | `0x400012C8` | Tipo de evento duplicado. |
| `noMoreRetentionRulesAdded` | `0x400015AD` | Se alcanzó el número máximo de reglas de permanencia de personas. |
| `noMoreSleepOnDutyRulesAdded` | `0x400015AE` | Se alcanzó el número máximo de reglas de dormir en servicio. |
| `polygonNotAllowCrossing` | `0x400015C2` | No se permite que los polígonos se crucen. |
| `configureRuleBeforeAdvanceParam` | `0x400015F8` | No se pueden configurar los parámetros avanzados porque no hay ninguna regla configurada; configure primero la información de la regla. |
| `behaviorCanNotPackToPic` | `0x40001603` | El modelo de comportamiento no puede empaquetarse como algoritmo de imagen. |
| `noCluster` | `0x40001608` | No se ha creado ningún clúster. |
| `NotAssociatedWithOwnChannel` | `0x400019C1` | El canal actual no está vinculado. |
| `AITargetBPCaptureFail` | `0x400019C5` | Falló la captura de la imagen de referencia para la comparación de objetivos con IA. |
| `AITargetBPToDSPFail` | `0x400019C6` | Falló el envío de la imagen de referencia al DSP para la comparación de objetivos con IA. |
| `AITargetBPDuplicateName` | `0x400019C7` | Nombre duplicado de la imagen de referencia para la comparación de objetivos con IA. |
| `audioFileNameWrong` | `0x400019D0` | Nombre de archivo de audio incorrecto. |
| `audioFileImportFail` | `0x400019D1` | Falló la importación del archivo de audio. |
| `NonOperationalStandbyMachine` | `0x400019F0` | Hot spare no operativo. |
| `MaximumNumberOfDevices` | `0x400019F1` | Se alcanzó el número máximo de dispositivos. |
| `StandbyMmachineCannotBeDeleted` | `0x400019F2` | El hot spare no puede eliminarse. |
| `alreadyRunning` | `0x40002026` | El programa de aplicación está en ejecución. |
| `notRunning` | `0x40002027` | El programa de aplicación está detenido. |
| `packNotFound` | `0x40002028` | El paquete de software no existe. |
| `alreadyExist` | `0x40002029` | El programa de aplicación ya existe. |
| `noMemory` | `0x4000202A` | Memoria insuficiente. |
| `invalLicense` | `0x4000202B` | Licencia no válida. |
| `noClientCertificate` | `0x40002036` | El certificado de cliente no está instalado. |
| `noCACertificate` | `0x40002037` | El certificado de CA no está instalado. |
| `authenticationFailed` | `0x40002038` | Falló la autenticación del certificado. Verifique el certificado. |
| `clientCertificateExpired` | `0x40002039` | El certificado de cliente venció. |
| `clientCertificateRevocation` | `0x4000203A` | El certificado de cliente fue revocado. |
| `CACertificateExpired` | `0x4000203B` | El certificado de CA venció. |
| `CACertificateRevocation` | `0x4000203C` | El certificado de CA fue revocado. |
| `connectFail` | `0x4000203D` | Falló la conexión. |
| `loginNumExceedLimit` | `0x4000203F` | No pueden iniciar sesión más usuarios. |
| `HDMIResolutionIllegal` | `0x40002040` | La resolución de video HDMI no puede ser mayor que la del stream principal y el substream. |
| `hdFormatFail` | `0x40002049` | Falló el formateo del HDD. |
| `formattingFailed` | `0x40002056` | Falló el formateo del HDD. |
| `encryptedFormattingFailed` | `0x40002057` | Falló el formateo del HDD cifrado. |
| `wrongPassword` | `0x40002058` | Falló la verificación de la contraseña de la tarjeta SD. Contraseña incorrecta. |
| `audioIsPlayingPleaseWait` | `0x40002067` | Se está reproduciendo audio. Espere. |
| `twoWayAudioInProgressPleaseWait` | `0x40002068` | Audio bidireccional en curso. Espere. |
| `calibrationPointNumFull` | `0x40002069` | Se alcanzó el número máximo de puntos de calibración. |
| `completeTheLevelCalibrationFirst` | `0x4000206A` | La calibración de nivel no está configurada. |
| `completeTheRadarCameraCalibrationFirst` | `0x4000206B` | La calibración radar-cámara no está configurada. |
| `pointsOnStraightLine` | `0x4000209C` | Falló la calibración. Los puntos de calibración no pueden estar sobre la misma línea. |
| `TValueLessThanOrEqualZero` | `0x4000209D` | Falló la calibración. El valor T de los puntos de calibración debe ser mayor a 0. |
| `HBDLibNumOverLimit` | `0x40002092` | El número de bibliotecas de imágenes de cuerpo humano alcanzó el límite superior. |
| `theShieldRegionError` | `0x40002093` | Falló el guardado. El área enmascarada debe ser el área de suelo donde se ubica el objeto enmascarado. |
| `theDetectionAreaError` | `0x40002094` | Falló el guardado. El área de detección solo debe cubrir el área de suelo. |
| `invalidLaneLine` | `0x40002096` | Falló el guardado. Línea de carril no válida. |
| `enableITSFunctionOfThisChannelFirst` | `0x400020A2` | Habilite primero la función ITS de este canal. |
| `noCloudStorageServer` | `0x400020C5` | No hay servidor de almacenamiento en la nube. |
| `NotSupportWithVideoTask` | `0x400020F3` | Esta función no está soportada. |
| `noDetectionArea` | `0x400050df` | No hay área de detección. |
| `armingFailed` | `0x40008000` | Falló el armado. |
| `disarmingFailed` | `0x40008001` | Falló el desarmado. |
| `clearAlarmFailed` | `0x40008002` | Falló la limpieza de la alarma. |
| `bypassFailed` | `0x40008003` | Falló el bypass. |
| `bypassRecoverFailed` | `0x40008004` | Falló la recuperación del bypass. |
| `outputsOpenFailed` | `0x40008005` | Falló la apertura del relevador. |
| `outputsCloseFailed` | `0x40008006` | Falló el cierre del relevador. |
| `registerTimeOut` | `0x40008007` | Se agotó el tiempo de registro. |
| `registerFailed` | `0x40008008` | Falló el registro. |
| `addedByOtherHost` | `0x40008009` | El periférico ya fue agregado por otro panel de control de seguridad. |
| `alreadyAdded` | `0x4000800A` | El periférico ya está agregado. |
| `armedStatus` | `0x4000800B` | La partición está armada. |
| `bypassStatus` | `0x4000800C` | En bypass. |
| `zoneNotSupport` | `0x4000800D` | La zona no admite esta operación. |
| `zoneFault` | `0x4000800E` | La zona está en estado de falla. |
| `pwdConflict` | `0x4000800F` | Conflicto de contraseña. |
| `audioTestEntryFailed` | `0x40008010` | Falló la activación del modo de prueba de audio. |
| `audioTestRecoveryFailed` | `0x40008011` | Falló la desactivación del modo de prueba de audio. |
| `addCardMode` | `0x40008012` | Modo de agregar tarjeta. |
| `searchMode` | `0x40008013` | Modo de búsqueda. |
| `addRemoterMode` | `0x40008014` | Modo de agregar llavero (keyfob). |
| `registerMode` | `0x40008015` | Modo de registro. |
| `exDevNotExist` | `0x40008016` | El periférico no existe. |
| `theNumberOfExDevLimited` | `0x40008017` | No se pueden agregar periféricos. |
| `sirenConfigFailed` | `0x40008018` | Falló la configuración de la sirena. |
| `chanCannotRepeatedBinded` | `0x40008019` | Este canal ya está vinculado a la zona. |
| `inProgramMode` | `0x4000801B` | El teclado está en modo de programación. |
| `inPaceTest` | `0x4000801C` | En modo de prueba de recorrido (pacing). |
| `arming` | `0x4000801D` | Armando. |
| `masterSlaveIsEnable` | `0x4000802c` | La relación principal-secundario ya surtió efecto; el radar secundario no admite esta operación. |
| `forceTrackNotEnabled` | `0x4000802d` | El seguimiento obligatorio está deshabilitado. |
| `isNotSupportZoneConfigByLocalArea` | `0x4000802e` | Esta área no admite el tipo de zona. |
| `alarmLineCross` | `0x4000802f` | Las líneas de disparo se traslapan. |
| `zoneDrawingOutOfRange` | `0x40008030` | La zona dibujada está fuera del rango de detección. |
| `alarmLineDrawingOutOfRange` | `0x40008031` | La línea de disparo de alarma dibujada está fuera del rango de detección. |
| `hasTargetInWarningArea` | `0x40008032` | La zona de advertencia ya contiene objetivos. ¿Desea habilitar el armado obligatorio? |
| `radarMoudleConnectFail` | `0x40008033` | Falló la comunicación con el módulo de radar. |
| `importCfgFilePasswordErr` | `0x40008034` | Contraseña incorrecta para importar archivos de configuración. |
| `overAudioFileNumLimit` | `0x40008038` | El número de archivos de audio supera el límite. |
| `audioFileNameIsLong` | `0x40008039` | El nombre del archivo de audio es demasiado largo. |
| `audioFormatIsWrong` | `0x4000803a` | El formato del archivo de audio no es válido. |
| `audioFileIsLarge` | `0x4000803b` | El tamaño del archivo de audio supera el límite. |
| `pircamCapTimeOut` | `0x4000803c` | Se agotó el tiempo de captura de la pircam. |
| `pircamCapFail` | `0x4000803d` | Falló la captura de la pircam. |
| `pircamIsCaping` | `0x4000803e` | La pircam está capturando. |
| `audioFileHasExisted` | `0x4000803f` | El archivo de audio ya existe. |
| `subscribeTypeErr` | `0x4000a016` | No se admite la suscripción a este tipo de metadatos. |
| `EISError` | `0x4000A01C` | Falló la estabilización electrónica de imagen. La función de eventos inteligentes está habilitada. |
| `jpegPicWithAppendDataError` | `0x4000A01D` | Falló la captura de la imagen térmica. Verifique que los parámetros de medición de temperatura (emisividad, distancia, temperatura reflejada) estén configurados correctamente. |
| `startAppFail` | `/` | Falló el inicio de la ejecución del programa de aplicación. |
| `yuvconflict` | `/` | El stream de video sin procesar entró en conflicto. |
| `overMaxAppNum` | `/` | No se pueden cargar más programas de aplicación. |
| `noFlash` | `/` | Memoria flash insuficiente. |
| `platMismatch` | `/` | La plataforma no coincide. |
| `emptyEventName` | `0x400015E0` | El nombre del evento está vacío. |
| `sameEventName` | `0x400015E1` | Ya existe un evento con el mismo nombre. |
| `emptyEventType` | `0x400015E2` | El tipo de evento es obligatorio. |
| `sameEventType` | `0x400015E3` | Ya existe un evento con el mismo tipo. |
| `maxEventNameReached` | `0x400015E4` | Se alcanzó el máximo de eventos. |
| `hotSpareNotAllowedExternalStorage` | `0x400015FC` | No se permite el almacenamiento externo cuando el hot spare está habilitado. |
| `sameCustomProtocolName` | `0x400015FD` | Ya existe un protocolo con el mismo nombre. |
| `maxPTZTriggerChannelReached` | `0x400015FE` | Se alcanzó el máximo de canales vinculados con PTZ. |
| `POSCanotAddHolidayPlan` | `0x400015FF` | No hay eventos POS durante los días festivos. |
| `eventTypeIsTooLong` | `0x40001600` | El tipo de evento es demasiado largo. |
| `eventNameIsTooLong` | `0x40001601` | El nombre del evento es demasiado largo. |
| `PerimeterEnginesNoResource` | `0x40001602` | No hay más motores de perímetro. |
| `invalidProvinceCode` | `0x40001607` | Código de provincia no válido. |

#### StatusCode=5 — Formato de mensaje no válido (Invalid Message Format)

| Sub Status Code | Error Code | Descripción |
| --------------- | ---------- | ----------- |
| `badXmlFormat` | `0x50000001` | Formato XML no válido. |

#### StatusCode=6 — Contenido de mensaje no válido (Invalid Message Content)

| Sub Status Code | Error Code | Descripción |
| --------------- | ---------- | ----------- |
| `badParameters` | `0x60000001` | Parámetro no válido. |
| `badHostAddress` | `0x60000002` | Dirección IP del host no válida. |
| `badXmlContent` | `0x60000003` | Contenido XML no válido. |
| `badIPv4Address` | `0x60000004` | Dirección IPv4 no válida. |
| `badIPv6Address` | `0x60000005` | Dirección IPv6 no válida. |
| `conflictIPv4Address` | `0x60000006` | Conflicto de dirección IPv4. |
| `conflictIPv6Address` | `0x60000007` | Conflicto de dirección IPv6. |
| `badDomainName` | `0x60000008` | Nombre de dominio no válido. |
| `connectSreverFail` | `0x60000009` | Falló la conexión al servidor. |
| `conflictDomainName` | `0x6000000A` | Conflicto de nombre de dominio. |
| `badPort` | `0x6000000B` | Conflicto de número de puerto. |
| `portError` | `0x6000000C` | Error de puerto. |
| `exportErrorData` | `0x6000000D` | Falló la importación de datos. |
| `badNetMask` | `0x6000000E` | Máscara de subred no válida. |
| `badVersion` | `0x6000000F` | La versión no coincide. |
| `badDevType` | `0x60000010` | El tipo de dispositivo no coincide. |
| `badLanguage` | `0x60000011` | El idioma no coincide. |
| `incorrentUserNameOrPassword` | `0x600000012` | Nombre de usuario o contraseña incorrectos. |
| `invalidStoragePoolOfCloudServer` | `0x600000013` | Pool de almacenamiento no válido. El pool de almacenamiento no está configurado o el ID es incorrecto. |
| `noFreeSpaceOfStoragePool` | `0x600000014` | El pool de almacenamiento está lleno. |
| `riskPassword` | `0x600000015` | Contraseña de riesgo. |
| `UnSupportCapture` | `0x600000016` | No se admite la captura en resolución 4096*2160 o 3072*2048 cuando H.264+ está habilitado. |
| `userPwdLenUnder8` | `0x60000023` | La contraseña debe contener al menos dos tipos de caracteres, entre dígitos, letras y símbolos. |
| `userPwdNameSame` | `0x60000025` | Contraseña duplicada. |
| `userPwdNameMirror` | `0x60000026` | La contraseña no puede ser el nombre de usuario en orden inverso. |
| `beyondARGSRangeLimit` | `0x60000027` | El valor del parámetro está fuera del límite. |
| `DetectionLineOutofDetectionRegion` | `0x60000085` | La línea de la regla está fuera de la región. |
| `DetectionRegionError` | `0x60000086` | Error en la región de la regla. Asegúrese de que la región de la regla sea un polígono convexo. |
| `DetectionRegionOutOfCountingRegion` | `0x60000087` | La región de la regla debe marcarse con un marco rojo. |
| `PedalAreaError` | `0x60000088` | El área del pedal debe estar dentro de la región de la regla. |
| `DetectionAreaABError` | `0x60000089` | Las regiones de detección A y B deben estar dentro de un marco de regla. |
| `ABRegionCannotIntersect` | `0x6000008a` | Las regiones A y B no pueden traslaparse. |
| `customHBPIDError` | `0x6000008b` | ID incorrecto de la biblioteca personalizada de imágenes de cuerpo humano. |
| `customHBPIDRepeat` | `0x6000008c` | ID duplicado de la biblioteca personalizada de imágenes de cuerpo humano. |
| `dataVersionsInHBDLibMismatches` | `0x6000008d` | Las versiones de la base de datos de la biblioteca de imágenes de cuerpo humano no coinciden. |
| `invalidHBPID` | `0x6000008e` | PID de imagen de cuerpo humano no válido. |
| `invalidHBDID` | `0x6000008f` | ID de biblioteca de imágenes de cuerpo humano no válido. |
| `humanLibraryError` | `0x60000090` | Error de la biblioteca de imágenes de cuerpo humano. |
| `humanLibraryNumError` | `0x60000091` | No se pueden agregar más bibliotecas de imágenes de cuerpo humano. |
| `humanImagesNumError` | `0x60000092` | No se pueden agregar más imágenes de cuerpo humano. |
| `noHumanInThePicture` | `0x60000093` | Falló el modelado: no hay ningún cuerpo humano en la imagen. |
| `analysisEnginesNoResourceError` | `0x60001000` | No hay motor de análisis. |
| `analysisEnginesUsageExcced` | `0x60001001` | El uso del motor está sobrecargado. |
| `PicAnalysisNoResourceError` | `0x60001002` | No hay motor de análisis disponible para el reconocimiento secundario de imágenes. |
| `analysisEnginesLoadingError` | `0x60001003` | Inicializando el motor de análisis. |
| `analysisEnginesAbnormaError` | `0x60001004` | Excepción del motor de análisis. |
| `analysisEnginesFacelibImporting` | `0x60001005` | Importando imágenes a la biblioteca de imágenes de rostro. Falló la edición de los parámetros del motor de análisis. |
| `analysisEnginesAssociatedChannel` | `0x60001006` | El motor de análisis está vinculado a un canal. |
| `smdEncodingNoResource` | `0x60001007` | Recursos de codificación de detección de movimiento insuficientes. |
| `smdDecodingNoResource` | `0x60001008` | Recursos de decodificación de detección de movimiento insuficientes. |
| `diskError` | `0x60001009` | Error de HDD. |
| `diskFull` | `0x6000100a` | HDD lleno. |
| `facelibDataProcessing` | `0x6000100b` | Procesando los datos de la biblioteca de imágenes de rostro. |
| `capturePackageFailed` | `0x6000100c` | Falló la captura de paquetes. |
| `capturePackageProcessing` | `0x6000100d` | Capturando paquetes. |
| `noSupportWithPlaybackAbstract` | `0x6000100e` | Esta función no está soportada. La reproducción por sinopsis de video está habilitada. |
| `insufficientNetworkBandwidth` | `0x6000100f` | Ancho de banda de red insuficiente. |
| `tapeLibNeedStopArchive` | `0x60001010` | Detenga primero la operación de archivado de la biblioteca de cintas. |
| `identityKeyError` | `0x60001011` | Comando de interacción incorrecto. |
| `identityKeyMissing` | `0x60001012` | Se perdió el comando de interacción. |
| `noSupportWithPersonDensityDetect` | `0x60001013` | Esta función no está soportada. La detección de densidad de personas está habilitada. |
| `ipcResolutionOverflow` | `0x60001014` | La resolución configurada de la cámara de red no es válida. |
| `ipcBitrateOverflow` | `0x60001015` | La tasa de bits configurada de la cámara de red no es válida. |
| `tooGreatTimeDifference` | `0x60001016` | Diferencia de tiempo demasiado grande entre el dispositivo y el servidor. |
| `noSupportWithPlayback` | `0x60001017` | Esta función no está soportada. La reproducción está habilitada. |
| `channelNoSupportWithSMD` | `0x60001018` | Esta función no está soportada. La detección de movimiento está habilitada. |
| `channelNoSupportWithFD` | `0x60001019` | Esta función no está soportada. La captura de rostros está habilitada. |
| `illegalPhoneNumber` | `0x6000101a` | Número de teléfono no válido. |
| `illegalCertificateNumber` | `0x6000101b` | Número de certificado no válido. |
| `linkedCameraOutLimit` | `0x6000101c` | Se agotó el tiempo de conexión a la cámara. |
| `achieveMaxChannelLimit` | `0x6000101e` | No se permiten más canales. |
| `humanMisInfoFilterEnabledChanNumError` | `0x6000101f` | No se permiten más canales con la prevención de falsas alarmas habilitada. |
| `humanEnginesNoResource` | `0x60001020` | Recursos insuficientes del motor de análisis de cuerpo humano. |
| `taskNumberOverflow` | `0x60001021` | No se pueden agregar más tareas. |
| `collisionTimeOverflow` | `0x60001022` | No se pueden configurar más duraciones de comparación. |
| `invalidTaskID` | `0x60001023` | ID de tarea no válido. |
| `eventNotSupport` | `0x60001024` | No se admite la suscripción a eventos. |
| `invalidEZVIZSecretKey` | `0x60001034` | Código de verificación no válido para Hik-Connect. |
| `needDoubleVerification` | `0x60001042` | Se requiere doble verificación. |
| `noDoubleVerificationUser` | `0x60001043` | No hay usuario de doble verificación. |
| `timeSpanNumOverLimit` | `0x60001044` | Se alcanzó el número máximo de intervalos de tiempo. |
| `channelNumOverLimit` | `0x60001045` | Se alcanzó el número máximo de canales. |
| `noSearchIDResource` | `0x60001046` | Recursos de searchID insuficientes. |
| `noSupportDeleteStrangerLib` | `0x60001051` | No se admite eliminar la biblioteca de desconocidos. |
| `noSupportCreateStrangerLib` | `0x60001052` | No se admite crear la biblioteca de desconocidos. |
| `behaviorAnalysisRuleInfoError` | `0x60001053` | Error en los parámetros de la regla de detección de eventos anormales. |
| `safetyHelmetParamError` | `0x60001054` | Error en los parámetros de casco de seguridad. |
| `OneChannelOnlyCanBindOneEngine` | `0x60001077` | No se pueden vincular más motores. |
| `engineTypeMismatch` | `0x60001079` | El tipo de motor no coincide. |
| `badUpgradePackage` | `0x6000107A` | Paquete de actualización no válido. |
| `AudioFileNameDuplicate` | `0x60001135` | Nombre de archivo de audio duplicado. |
| `CurrentAudioFileAIRuleInUseAlreadyDelete` | `0x60001136` | Se eliminó la vinculación de reglas de IA relacionada con el archivo de audio actual. |
| `TransitionUseEmmc` | `0x60002000` | Falló el arranque del dispositivo. La EMMC está sobreutilizada. |
| `AdaptiveStreamNotEnabled` | `0x60002001` | La función de stream autoadaptativo no está habilitada. |
| `AdaptiveStreamAndVariableBitrateEnabled` | `0x60002002` | Las funciones de stream autoadaptativo y tasa de bits variable no pueden habilitarse al mismo tiempo. |
| `noSafetyHelmetRegion` | `0x60002023` | El área de detección de casco de seguridad no está configurada (si los usuarios guardan su configuración sin configurar el área de armado, se les debe indicar que configuren una). |
| `unclosedSafetyHelmet` | `0x60002024` | La detección de casco de seguridad está habilitada (si los usuarios guardan su configuración después de eliminar el área de armado, se les debe indicar que primero deshabiliten la detección de casco de seguridad y luego eliminen el área de armado). |
| `width/heightRatioOfPictureError` | `0x6000202C` | La relación ancho/alto de la imagen cargada debe estar en el rango de 1:2 a 2:1. |
| `PTZNotInitialized` | `0x6000202E` | El PTZ no está inicializado. |
| `PTZSelfChecking` | `0x6000202F` | El PTZ está en autodiagnóstico. |
| `PTZLocked` | `0x60002030` | El PTZ está bloqueado. |
| `advancedParametersError` | `0x60002031` | El intervalo de cambio automático en los parámetros avanzados no puede ser menor que la tolerancia de estacionamiento para la detección de estacionamiento ilegal en la configuración de reglas del domo de velocidad. |
| `resolutionError` | `0x60005003` | Resolución no válida. |
| `deployExceedMax` | `0x60006018` | Las conexiones de armado superan el número máximo. |
| `detectorTypeMismatch` | `0x60008000` | El tipo de detector no coincide. |
| `nameExist` | `0x60008001` | El nombre ya existe. |
| `uploadImageSizeError` | `0x60008016` | El tamaño de la imagen cargada es mayor a 5 MB. |
| `laneAndRegionOverlap` | `/` | Los carriles se traslapan. |
| `unitConfigurationNotInEffect` | `/` | Parámetro de unidad no válido. |
| `ruleAndShieldingMaskConflict` | `/` | La región de la regla de línea se traslapa con el área enmascarada. |
| `wholeRuleInShieldingMask` | `/` | Hay reglas completas de medición de temperatura dentro del área enmascarada. |
| `LogDiskNotSetReadOnlyInGroupMode` | `0x60001100` | El HDD de registros del grupo de HDD no puede configurarse como de solo lectura. |
| `LogDiskNotSetReDundancyInGroupMode` | `0x60001101` | El HDD de registros del grupo de HDD no puede configurarse como redundante. |
| `holidayNameContainChineseOrSpecialChar` | `0x60001080` | No se permiten caracteres chinos ni especiales en el nombre del día festivo. |
| `genderValueError` | `0x60001081` | Género no válido. |
| `certificateTypeValueError` | `0x60001082` | Tipo de identificación no válido. |
| `personInfoExtendValueIsTooLong` | `0x60001083` | La longitud de las etiquetas personalizadas supera el límite. |
| `personInfoExtendValueContainsInvalidChar` | `0x60001084` | No se permiten caracteres no válidos en las etiquetas personalizadas de la biblioteca de imágenes de rostro. |
| `excelHeaderError` | `0x60001085` | Error en el encabezado de Excel. |
| `intelligentTrafficMutexWithHighFrames` | `0x60008014` | Deshabilite todas las funciones de detección de incidentes de tráfico, aplicación de infracciones y recolección de datos de tráfico, o ajuste la tasa de cuadros del video a menos de 50 fps. |
| `intelligentTrafficMutexWithHighFramesEx` | `0x60008018` | Deshabilite todas las funciones de detección de incidentes de tráfico, aplicación de infracciones, recolección de datos de tráfico y detección de vehículos, o ajuste la tasa de cuadros del video a menos de 50 fps. |

#### StatusCode=7 — Se requiere reinicio (Reboot Required)

| Sub Status Code | Error Code | Descripción |
| --------------- | ---------- | ----------- |
| `rebootRequired` | `0x70000001` | Reinicie para que surta efecto. |

### A.8 Códigos de Error por Módulo Funcional

Los códigos de error que se devuelven durante la integración mediante el protocolo de texto se clasifican por módulo funcional. Las tablas siguientes incluyen los códigos de error, su descripción y sugerencias de depuración.

> **Notas:**
> - Cuando el PDF deja vacía la columna **Error String**, **Descripción** o **Sugerencia de depuración**, la celda se deja vacía.
> - `multiAuthentication Failed` (0x01000001) contiene un espacio tal como aparece en el PDF.
> - El rango del Módulo de Control de Puertas aparece en el PDF como `0x010ffffff` (9 dígitos hexadecimales); se conserva tal cual.
> - Los módulos de Información de Personas y de Certificados aparecen en el PDF con la tabla vacía.

#### Módulo de Funciones Públicas (rango de códigos de error: `0x00000000`, de `0x00100001` a `0x001fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `success` | `0x00000000` | Correcto. |  |
| `deviceNotActivated` | `0x00100001` | El dispositivo no está activado. | Active el dispositivo. |
| `deviceNoPermission` | `0x00100002` | Falló la operación del dispositivo. Sin permiso. | Actualice los permisos del usuario. |
| `deviceNotSupport` | `0x00100003` | Esta función no está soportada. | Verifique el conjunto de capacidades del dispositivo y llame a la API correspondiente a la función soportada. |
| `deviceResourceNotEnough` | `0x00100004` | Recursos insuficientes. | Libere recursos. |
| `dataFormatError` | `0x00100005` | Formato de mensaje no válido. |  |
| `resetError` | `0x00100006` | Falló la restauración a la configuración de fábrica. Se requiere reactivar el dispositivo después de reiniciarlo, ya que el botón Reset puede estar atascado. |  |
| `parameterError` | `0x00100007` | Parámetro incorrecto. |  |
|  | `0x00100100` | Canal no válido. | Verifique que el canal sea válido. |
|  | `0x00100101` | La vista en vivo NPQ no se admite con el cifrado de stream. | Cambie el modo de streaming para el cifrado de stream. |
|  | `0x00100102` | No se permiten más canales para streaming NPQ. | Reduzca los canales de streaming NPQ e intente de nuevo. |
|  | `0x00100103` | El tipo de stream no está soportado. | Verifique el tipo de stream solicitado. |
|  | `0x00100104` | El número de conexiones superó el límite. | Reduzca el número de clientes de streaming e intente de nuevo. |
|  | `0x00100105` | Ancho de banda insuficiente. | Reduzca el número de canales de streaming remoto. |

#### Módulo de Funciones de Usuario (rango de códigos de error: de `0x00200001` a `0x002fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `passwordError` | `0x00200001` | Nombre de usuario o contraseña incorrectos. | Verifique que la contraseña sea correcta. |
| `userNameNotExist` | `0x00200002` | La cuenta no existe. | Verifique que la cuenta exista o agréguela. |
| `userNameLocked` | `0x00200003` | La cuenta está bloqueada. | Espere a que el dispositivo se desbloquee. |
| `userNumLimited` | `0x00200004` | El número de usuarios con sesión iniciada superó el límite superior. | Cierre sesión. |
| `lowPrivilege` | `0x00200005` | Sin permisos para esta operación. | Para operaciones de usuarios, verifique las siguientes situaciones:<br>• No se permite eliminar su propia cuenta.<br>• No se permite editar su propio nivel o permisos.<br>• No se permite obtener información de usuarios con permisos superiores.<br>• No se permite elevar el nivel o los permisos del usuario.<br>Para otras operaciones, verifique según las siguientes medidas: si fallaron operaciones no relacionadas con la configuración de permisos del usuario, puede verificar el tipo de usuario y sus permisos; si no se resuelve, contacte a los desarrolladores. |
| `incorrentUserNameOrPassword` | `0x00200006` | Nombre de usuario o contraseña incorrectos. | Verifique que el nombre de usuario y la contraseña configurados coincidan. Si no, contacte al administrador para configurarlos de nuevo. Si el administrador olvidó la contraseña, restablezca la contraseña del dispositivo. |
| `riskPassword` | `0x00200007` | Contraseña de riesgo. | Contraseña de baja seguridad. Cambie la contraseña de nuevo. |
| `passwordMustContainMorethan8Characters` | `0x00200008` | La longitud de la contraseña debe ser mayor o igual a 8. | Verifique que la longitud de la contraseña sea mayor o igual a 8. Si no, cambie la contraseña de nuevo. |
| `passwordLenNoMoreThan16` | `0x00200009` | La longitud de la contraseña no puede ser mayor a 16. | Verifique si la longitud de la contraseña es mayor a 16. Si es así, cambie la contraseña de nuevo. |
| `adminUserNotAllowedModify` | `0x0020000a` | No se permite editar la información del administrador. | Verifique si la cuenta editada es admin. |
| `confirmPasswordError` | `0x0020000b` | Confirmación de contraseña incorrecta. | Verifique la confirmación de la contraseña. |
| `passwordMustContainMorethan2Types` | `0x0020000c` | La contraseña debe contener al menos dos de los siguientes: números, minúsculas, mayúsculas y caracteres especiales. | Verifique que la contraseña configurada cumpla los requisitos. |
| `passwordContainUserName` | `0x0020000d` | La contraseña no puede contener el nombre de usuario. | Verifique si la contraseña contiene el nombre de usuario. |
| `userPwdNameMirror` | `0x0020000e` | La contraseña no puede ser el nombre de usuario invertido. | Verifique si la contraseña es el nombre de usuario invertido. |

#### Módulo de Funciones de Hora (rango de códigos de error: de `0x00300001` a `0x003fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `manualAdjustmentFailed` | `0x00300001` | Falló la sincronización de hora. |  |
| `NTPError` | `0x00300002` | Dirección de servidor NTP no válida. | Verifique que la dirección del servidor NTP sea válida. |
| `timeFormatError` | `0x00300003` | Formato de hora incorrecto durante la calibración de hora.<br>Por ejemplo, la hora en formato ISO 8601 debe ser "2018-02-01T19:54:04", pero la hora aplicada es "2018-02-01 19:54:04". | Formato de mensaje incorrecto o formato de hora incorrecto. |
| `beyondTimeRangeLimit` | `0x00300004` | La hora de calibración no está dentro del rango de tiempo soportado por el dispositivo. | Obtenga la capacidad del dispositivo y verifique que la hora configurada esté dentro del rango de tiempo soportado por el dispositivo. |
| `endtimeEarlierThanBegintime` | `0x00300005` | La hora de inicio del periodo de validez no puede ser posterior a la hora de fin. | Verifique que la hora de inicio y la hora de fin sean válidas. |

#### Módulo de Funciones de Red (rango de códigos de error: de `0x00400001` a `0x004fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `domainNameParseFailed` | `0x00400001` | Falló la resolución del nombre de dominio. |  |
| `PPPOEConnectedFailed` | `0x00400002` | Falló la conexión PPPOE a la red. |  |
| `FTPConnectedFailed` | `0x00400003` | El servidor FTP está desconectado. |  |
| `deviceIPConflicted` | `0x00400004` | Conflicto entre las direcciones IP de los dispositivos. |  |
| `libraryConnectedFailed` | `0x00400005` | La biblioteca de imágenes y video está desconectada. |  |
| `fileUploadFailed` | `0x00400006` | Falló la carga. | Verifique que la conexión de red sea normal. Si lo es, contacte al servicio posventa. |
| `storSerDownloadFileFailed` | `0x00400007` | Falló la descarga. | Verifique que la conexión de red sea normal. Si lo es, contacte al servicio posventa. |
| `storSerDownloadFileSizeZero` | `0x00400008` | El tamaño del archivo descargado del servicio de almacenamiento es 0. | Verifique que la conexión de red sea normal. Si lo es, contacte al servicio posventa. |
| `storSerNotConfig` | `0x00400009` | El servicio de almacenamiento no está configurado. | Verifique que la configuración sea correcta. |
| `badHostAddress` | `0x0040000a` | Error en la dirección del host. | Verifique que la configuración sea correcta. |
| `badIPv4Address` | `0x0040000b` | Dirección IPv4 incorrecta. | Verifique que la configuración sea correcta. |
| `badIPv6Address` | `0x0040000c` | Dirección IPv6 incorrecta. | Verifique que la configuración sea correcta. |
| `conflictIPv4Address` | `0x0040000d` | Conflicto de dirección IPv4. | Verifique el estado de configuración de IPv4 en la red. |
| `conflictIPv6Address` | `0x0040000e` | Conflicto de dirección IPv6. | Verifique el estado de configuración de IPv6 en la red. |
| `badDomainName` | `0x0040000f` | Nombre de dominio incorrecto. | Verifique que la configuración sea correcta. |
| `connectSreverFail` | `0x00400010` | Falló la conexión al servidor. | Verifique que la red sea normal y que la configuración sea correcta. |
| `conflictDomainName` | `0x00400011` | Conflicto de nombre de dominio. | Verifique que la configuración sea correcta. |
| `badPort` | `0x00400012` | Conflicto de puerto. | Verifique que la configuración sea correcta. |
| `portError` | `0x00400013` | Error de puerto. | Verifique que la configuración sea correcta. |
| `badNetMask` | `0x00400014` | Error de máscara de subred. | Verifique que la configuración sea correcta. |
| `badVersion` | `0x00400015` | La versión no coincide. | Verifique que la versión sea correcta. |
| `badDns` | `0x00400016` | Error de DNS. | Verifique que la configuración sea correcta. |
| `badMTU` | `0x00400017` | Error de MTU. | Verifique que la configuración sea correcta. |
| `badGateway` | `0x00400018` | Gateway incorrecto. | Verifique que la configuración sea correcta. |
| `urlDownloadFail` | `0x00400019` | Falló la descarga mediante URL. | Verifique que la red sea normal y que la URL sea correcta. |
| `deployExceedMax` | `0x0040001a` | El número de canales armados supera el número máximo de conexiones. | Obtenga el número máximo de armados soportado y el número de canales armados. |

#### Módulo de Funciones de Mantenimiento (rango de códigos de error: de `0x00500001` a `0x005fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `upgradeXMLFormatError` | `0x00500001` | Solicitud XML de actualización incorrecta. | Verifique que el archivo de actualización sea correcto. Si el archivo es correcto, intente la actualización local. |
| `upgradeContentError` | `0x00500002` | Contenido de la solicitud de actualización incorrecto. | Verifique que el archivo de actualización sea correcto. Si el archivo es correcto, intente la actualización local. |
| `noUpgradePermission` | `0x00500003` | Sin permiso de actualización. | Cambie a la cuenta admin o solicite al admin permisos de operación avanzada. |
| `upgrading` | `0x00500004` | Actualizando firmware… | Espere a que termine la actualización. |
| `receiveUpgradePackageError` | `0x00500005` | Falló la recepción del paquete de actualización. | Verifique que la red sea normal. |
| `upgradePackageLanguageMismatch` | `0x00500006` | El idioma del paquete de actualización no coincide. | Verifique el tipo de idioma del paquete de actualización y del dispositivo. |
| `upgradePackageMismatch` | `0x00500007` | El archivo de actualización no coincide con el tipo de dispositivo. | Verifique el tipo del paquete de actualización y del dispositivo. |
| `OEMCodeMismatch` | `0x00500008` | Error en el paquete de actualización. El código OEM no coincide. | Contacte al servicio posventa para obtener el paquete de actualización correcto. |
| `versionMismatch` | `0x00500009` | La versión del archivo de actualización no coincide. | Contacte al servicio posventa para obtener el paquete de actualización correcto. |
| `upgradeHalfFailed` | `0x0050000c` | Ocurrió un error a mitad de la actualización del dispositivo. Error de memoria flash o de caché. |  |
| `deviceParameterImportFailed` | `0x0050000d` | Falló la importación de los parámetros del dispositivo. El modelo, la versión o la plataforma del dispositivo no coinciden. |  |
| `deviceEncryptionError` | `0x0050000e` | El paquete de actualización no coincide. Error de cifrado del dispositivo. |  |
| `SDCardFormatError` | `0x00500025` | Falló el formateo de la tarjeta SD. |  |
| `SDCardLoadFailed` | `0x00500026` | Falló la carga de la página después de insertar la tarjeta SD. |  |
| `NASFailed` | `0x00500027` | Falló el montaje del NAS. |  |
| `hardDiskError` | `0x00500028` | Excepción del HDD (posibles causas: el HDD no existe, es incompatible, está cifrado, capacidad insuficiente, excepción de formateo, excepción del arreglo, arreglo incompatible, etc.). |  |
| `upgradeError` | `0x00500030` | Error de actualización. |  |
| `upgradePackageSizeMismath` | `0x00500032` | No coinciden el tamaño real del paquete de actualización descargado y el tamaño indicado en la solicitud de actualización. |  |
| `upgradePackageSizeExceeded` | `0x00500033` | El tamaño del paquete superó el de la partición. |  |
| `domainNameParseFailedForDownload` | `0x00500034` | Falló la resolución del nombre de dominio de la dirección de descarga. |  |
| `netWorkUnstable` | `0x00500035` | Red inestable. Se agotó el tiempo de descarga o se alcanzó el número máximo de intentos. |  |
| `digestValueMismatch` | `0x00500036` | El valor de digest no coincide. |  |
| `signatureVerifyFailed` | `0x00500037` | Falló la verificación de la firma. |  |
| `innerFormatError` | `0x00500038` | Formato interno del paquete de actualización incorrecto. |  |
| `memoryNotEnough` | `0x00500039` | Memoria insuficiente. |  |
| `burnFailed` | `0x0050003a` | Falló la grabación del firmware. |  |
| `unknownError` | `0x0050003b` | Ocurrió un error desconocido en las APIs subyacentes. |  |
| `userCancel` | `0x0050003c` | El usuario solicitó cancelar la operación actual. |  |
| `systemResume` | `0x0050003d` | Falló la actualización. Puede recuperarse mediante el sistema de respaldo o el sistema mínimo. |  |
|  | `0x00500080` | No se encontró el archivo de actualización. | Verifique si la ruta del paquete de actualización es demasiado larga o si existe un paquete de actualización correcto en esa ruta. |
|  | `0x00500081` | El archivo de actualización no coincide con el tipo de motor. | Seleccione el paquete de actualización que corresponda al tipo de motor del dispositivo. |
|  | `0x00500082` | Falló la resolución del nombre de dominio de la cámara. | Confirme que el dispositivo tenga configurado correctamente el servicio DNS y que el dominio de la cámara sea válido. |
|  | `0x00500083` | La red de la cámara es inalcanzable. | Confirme que la red local pueda acceder a la red donde se ubica el canal agregado. |

#### Módulo de Vista en Vivo (rango de códigos de error: de `0x00600001` a `0x006fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `liveViewFailed` | `0x00600001` | Falló la vista en vivo. El número de canales de streaming superó el límite. |  |
|  | `0x00600002` | Excepción en el formato de empaquetado de la solicitud. | Verifique el formato de empaquetado de la vista en vivo solicitada. |
|  | `0x00600003` | NPQ no estará disponible después de habilitar EHome 2.x. | Cuando EHome 2.x esté habilitado, use otro modo de vista en vivo. |
|  | `0x00600005` | La vista en vivo NPQ no se admite para el canal cero. | Use otro modo de vista en vivo para el canal cero. |
|  | `0x00600007` | Solo el stream virtual admite vista en vivo NPQ. | Cambie al stream virtual. |
|  | `0x0060000A` | El canal IP está fuera de línea. | Verifique que el canal IP esté en línea e intente de nuevo. |
|  | `0x0060000B` | El dispositivo no admite la transcodificación de la vista en vivo. | Use otro tipo de stream para la vista en vivo. |
|  | `0x0060000C` | El canal cero no está habilitado. | Habilite el canal cero antes de iniciar su vista en vivo. |
|  | `0x0060000D` | La capacidad de transcodificación superó el límite. | Reduzca la resolución de la cámara o el número de canales de transcodificación. |
|  | `0x00600010` | El canal no tiene substream. | Use el modo de stream principal para la vista en vivo. |
|  | `0x00600011` | El dispositivo no admite la vista en vivo NPQ. | Cambie a otro modo de vista en vivo. |
|  | `0x00600012` | La función NPQ está deshabilitada. | Habilite la función NPQ o cambie a otro modo de vista en vivo. |

#### Módulo de Reproducción (rango de códigos de error: de `0x00700001` a `0x007fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
|  | `0x00700001` | Falló la reproducción. Se admite la reproducción de un solo canal como máximo. |  |
|  | `0x00700002` | No se admite la velocidad de reproducción mostrada en el video wall. | Reduzca la velocidad de reproducción. |
|  | `0x00700003` | La tasa de transmisión del stream de reproducción es demasiado alta. | Reduzca la tasa de transmisión del stream de reproducción. |
|  | `0x00700004` | No se admite el tipo de codificación del stream de reproducción. | Proporcione un stream con un tipo de codificación soportado por el dispositivo. |
|  | `0x00700005` | No se admite el formato de contenedor del stream de reproducción. | Proporcione un stream con un formato de contenedor soportado por el dispositivo. |
|  | `0x00700007` | Ocurrió una excepción al decodificar el stream de reproducción.<br>Posibles causas: excepción al mostrar en el video wall, excepción de imagen, excepción de visualización, excepción de decodificación, imagen congelada, pantalla negra, tipo de stream no válido, vista en vivo congelada, excepción de decodificación de audio y pantalla borrosa. |  |
|  | `0x00700008` | El video de reproducción no existe o falló la búsqueda. | Busque de nuevo o verifique que el HDD funcione normalmente. |
|  | `0x00700009` | Error en el parámetro de tiempo de reproducción. | Verifique que el periodo del video buscado sea correcto e intente de nuevo. |
|  | `0x0070000A` | Tipo de video no válido. | Seleccione el tipo de video correcto para buscar. |
|  | `0x0070000B` | Tipo de tiempo no válido. | Seleccione el tipo de tiempo correcto para buscar. |
|  | `0x0070000C` | Parámetro de evento no válido. | Seleccione el parámetro de evento correcto para buscar. |
|  | `0x0070000D` | Tipo de evento no válido. | Seleccione el tipo de evento correcto para buscar. |
|  | `0x0070000E` | El dispositivo no admite la búsqueda inteligente. | Seleccione un modo de búsqueda no inteligente. |
|  | `0x0070000F` | Tipo de evento inteligente no válido. | Seleccione el tipo de evento inteligente correcto para buscar. |
|  | `0x00700010` | Sensibilidad de análisis dinámico no válida. | Seleccione la sensibilidad correcta para buscar video. |
|  | `0x00700011` | No se admite la reproducción en reversa. | Seleccione el modo de reproducción correcto. |
|  | `0x00700012` | Estado de archivo no válido. | Seleccione el estado de archivo correcto para buscar. |
|  | `0x00700013` | Posición inicial de búsqueda no válida. | Use la posición inicial de búsqueda correcta. |
|  | `0x00700014` | Número máximo de búsqueda no válido. | Use el número máximo de búsqueda correcto. |

#### Módulo de Captura (rango de códigos de error: de `0x00800001` a `0x008fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
|  | `0x00800001` | Falló la captura manual. |  |

#### Módulo de Audio Bidireccional (rango de códigos de error: de `0x00900001` a `0x009fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `startFailed` | `0x00900001` | Falló el inicio del audio bidireccional. Pérdida de audio o error del controlador. |  |
| `codingFormatNotMatch` | `0x00900002` | El formato de codificación del intercomunicador es inconsistente y la negociación falla. | Verifique o capture los paquetes en la plataforma y luego analice si los formatos de codificación de audio negociados por ambas partes son consistentes. |
| `dialedIsBusy` | `0x00900003` | La parte llamada ya está en una intercomunicación y no puede responder a otra. | Verifique si la parte llamada ya está en una intercomunicación; si no, obtenga el mensaje del protocolo y analice el mensaje de respuesta. |
| `destinationLongNumberError` | `0x00900004` | El número largo de destino solicitado es incorrecto. | Verifique o capture los paquetes en la plataforma y luego analice el número largo. |

#### Módulo de Almacenamiento de Video (rango de códigos de error: de `0x00a00001` a `0x00afffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `videoSearchFailed` | `0x00a00001` | Falló la búsqueda de videos. | No hay recursos almacenados en el dispositivo. |
| `notFindStorageMedium` | `0x00a00002` | No se encontró ningún medio de almacenamiento. |  |
| `videoDownloadFailed` | `0x00a00003` | Falló la descarga de videos. |  |

#### Módulo de Almacenamiento de Imágenes (rango de códigos de error: de `0x00b00001` a `0x00bfffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
|  | `0x00b00001` | Falló la búsqueda de imágenes. | No hay recursos de imagen. |

#### Módulo de Funciones de E/S (rango de códigos de error: de `0x00c00001` a `0x00cfffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
|  | `0x00c00001` | Número de entrada de alarma no válido. |  |
|  | `0x00c00002` | Número de salida de alarma no válido. |  |

#### Módulo de Funciones de Eventos (rango de códigos de error: de `0x00d00001` a `0x00dfffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
|  | `0x00d00001` | Regla de evento incorrecta. | Consulte el manual para la configuración correcta. |

#### Módulo de Servicio de Estacionamiento (rango de códigos de error: de `0x00e00001` a `0x00efffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
|  | `0x00e00001` | El vehículo con pase de estacionamiento ya existe. | El pase de estacionamiento se crea por placa; verifique si ya se creó el pase de estacionamiento para esta placa. |
|  | `0x00e00002` | El número de placa es obligatorio. |  |

#### Módulo de Funciones Generales (rango de códigos de error: de `0x00f00001` a `0x00ffffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `noMemory` | `0x00f00001` | Memoria del dispositivo insuficiente (falló la asignación de espacio en el heap). | Verifique la memoria libre y envíe los registros al desarrollador para su análisis. |
| `deviceBusy` | `0x00f00002` | El dispositivo está ocupado o no responde. | Envíe los registros a los desarrolladores para su análisis.<br>Para los servicios de recolección de huellas, recolección de rostros, aplicación de archivos y carga de archivos, verifique que la última operación haya terminado. |
| `notSupport` | `0x00f00003` | El dispositivo no admite la URL. | Capture los paquetes y verifique si la URL aplicada existe en la plataforma PMP. Si existe, envíe la URL al desarrollador para su análisis. |
| `methodNotAllowed` | `0x00f00004` | El método HTTP no está permitido. | Capture los paquetes y verifique el método correspondiente a la URL en la plataforma PMP. |
| `invalidOperation` | `0x00f00005` | Operación no válida del comando de la API. |  |
| `IDNotexist` | `0x00f00006` | El ID no existe (la URL debe contener el ID, pero la URL real no lo contiene). | Capture los paquetes y verifique que el ID incluido en la URL sea correcto. |
| `invalidID` | `0x00f00007` | ID no válido (el ID en la URL supera el conjunto de capacidades o el formato del ID no es válido). | Capture los paquetes y verifique que el ID incluido en la URL sea correcto.<br>Obtenga las capacidades de la URL y verifique el rango del ID. |
| `invalidIURL` | `0x00f00008` | El contenido después de "?" en la URL es incorrecto. | Capture los paquetes y verifique que la URL sea correcta. |
| `deviceAckTimeOut` | `0x00f00009` | Se agotó el tiempo de respuesta del dispositivo. | Si se agotó el tiempo de comunicación con el módulo externo, verifique si el módulo externo está fuera de línea.<br>Una vez descartada esa situación, envíe los registros al desarrollador para su análisis. |
| `badXmlFormat` | `0x00f0000a` | Error de formato XML. |  |
| `badJsonFormat` | `0x00f0000b` | Error de formato JSON. |  |
| `badURLFormat` | `0x00f0000c` | Error de formato de URL. | Obtenga la URL y verifique que sea correcta. |
| `badXmlContent` | `0x00f0000d` | Error en el mensaje XML:<br>• El mensaje contiene solo la URL, sin cuerpo de mensaje.<br>• El nodo requerido no está configurado.<br>• El valor del nodo supera el límite del rango (valor de nodo incorrecto). |  |
| `badJsonContent` | `0x00f0000e` | Error en el mensaje JSON:<br>• El mensaje contiene solo la URL, sin cuerpo de mensaje.<br>• El nodo requerido no está configurado.<br>• El valor del nodo supera el límite del rango (valor de nodo incorrecto). |  |
| `messageParametersLack` | `0x00f0000f` | El nodo requerido no existe. |  |
| `invalidSearchConditions` | `0x00f00010` | Condición de búsqueda no válida; busque de nuevo. | Verifique que el searchID sea correcto. |
| `operObjectNotExist` | `0x00f00011` | El objeto no existe (para las operaciones sobre puertas o E/S de alarma, el objeto no está agregado). | Verifique que la cerradura de la puerta esté conectada. |

#### Módulo de Control de Puertas (rango de códigos de error: de `0x01000001` a `0x010ffffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `multiAuthentication Failed` | `0x01000001` | Falló la operación del estado de autenticación multifactor. |  |
| `securityModuleOffline` | `0x01000002` | El módulo de control de puerta de seguridad está fuera de línea y no puede abrir la puerta. | Verifique si el control de puerta de seguridad está fuera de línea. |

#### Módulo de Plantillas de Horario (rango de códigos de error: de `0x01100001` a `0x011fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `planNumberConflict` | `0x01100001` | Conflicto de número de plan. |  |
| `timeOverlap` | `0x01100002` | Conflicto de periodos. | Revise el mensaje para determinar si hay traslape entre distintos periodos de un mismo día. |

#### Módulo de Información de Personas (rango de códigos de error: de `0x01200001` a `0x012fffff`)

> **Notas:** la tabla de este módulo está vacía en el PDF.

#### Módulo de Certificados (rango de códigos de error: de `0x01300001` a `0x013fffff`)

> **Notas:** la tabla de este módulo está vacía en el PDF.

#### Módulo de Funciones de Seguridad (rango de códigos de error: de `0x01400001` a `0x014fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `decryptFailed` | `0x01400001` | Falló el descifrado al descifrar campos de información sensible o al importar archivos de datos. | La clave secreta de importación debe ser consistente con la de exportación. |
| `certificateNotmatch` | `0x01400003` | Los certificados no coinciden; las claves pública y privada SSL/TLS deben coincidir en pares. | Las claves pública y privada deben generarse al mismo tiempo. |
| `notActivated` | `0x01400004` | El dispositivo no está activado. | Active el dispositivo antes de usarlo con herramientas como SADP. |
| `hasActivated` | `0x01400005` | El dispositivo ya está activado. |  |
| `forbiddenIP` | `0x01400006` | La dirección IP está bloqueada. | La dirección IP se bloquea cuando los intentos de inicio de sesión ilegales superan el límite superior. |
| `bondMacAddressNotMatch` | `0x01400007` | La dirección MAC no coincide con el usuario. | Verifique si la dirección MAC específica está vinculada al usuario. |
| `bondIpAddressNotMatch` | `0x01400008` | La dirección IP no coincide con el usuario. | Verifique si la dirección IP específica está vinculada al usuario. |
| `badAuthorization` | `0x01400009` | Activado por un inicio de sesión ilegal. | Una contraseña incorrecta activó el inicio de sesión ilegal. |

#### Módulo de Funciones de Publicidad (rango de códigos de error: de `0x01500001` a `0x015fffff`)

| Error String | Error Code | Descripción | Sugerencia de depuración |
| ------------ | ---------- | ----------- | ------------------------ |
| `materialDownloadFailed` | `0x01500001` | Falló la descarga del material. | • Verifique que la conexión de red sea normal.<br>• Verifique que el dispositivo funcione normalmente.<br>• Revise los registros impresos (log print). |
| `materialNumberIsOver` | `0x01500002` | El número de materiales en la lista de programas alcanzó el límite superior. | Verifique si el número de materiales en la lista de programas aplicada superó el límite. |
