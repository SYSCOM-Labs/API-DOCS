# Apéndice A — Códigos de error usados en el laboratorio HPP

> ← [Documentación Hik-Partner Pro](README.md)  
> Traducciones del apéndice A.1 de OpenAPI V2.15.500 más códigos vistos en pruebas de audio (`VMS050020`, `VMS050028`). La lista oficial completa está en el PDF del fabricante.

Todas las respuestas JSON incluyen `errorCode`. Éxito: `"0"`.

## Prefijos

| Prefijo | Ámbito |
|---------|--------|
| LAP | OpenAPI / cuenta / parámetros / token |
| EVZ | Dispositivo / red / cifrado / comando |
| VMS | Servicios de vídeo / audio en nube |
| NO_SESSION / BAD_PATH / PROXY_ERROR | Solo el laboratorio SYSCOM |

## Códigos

| Código | Significado |
|--------|------------|
| 0 | Operación correcta |
| LAP300001 | AppKey no encontrada |
| LAP300002 | AppKey y SecretKey no coinciden |
| LAP300003 | La cuenta HPP asociada a la AppKey no existe |
| LAP000000 | Excepción del sistema |
| LAP000001 | Error de parámetros |
| LAP000002 | Recurso no encontrado |
| LAP000003 | Recurso no encontrado |
| LAP001005 | La cuenta está bloqueada |
| LAP006001 | No se pudo añadir el dispositivo |
| LAP006002 | Dispositivo desconocido |
| LAP006006 | Excepción de red |
| LAP006008 | El serial ya existe |
| LAP006009 | El dispositivo no existe o no hay permiso |
| LAP006012 | El sitio no existe |
| LAP006013 | El operador no es propietario del sitio |
| LAP006016 | Sin permiso para operar el sitio |
| LAP006018 | Operación repetida; espera y reintenta |
| LAP008001 | Sitio inexistente o sin permiso |
| LAP008008 | Error de red |
| LAP008077 | Sin permiso |
| LAP031002 | No se pudo subir el archivo |
| LAP031007 | El archivo es demasiado grande |
| LAP031008 | Archivo inválido |
| LAP033005 | No se pudo obtener el token |
| LAP034000 | Sin permiso sobre el dispositivo |
| LAP034001 | Sin permiso sobre el sitio |
| LAP035001 | Recurso solicitado no encontrado |
| LAP068001 | Otra búsqueda en curso con la misma AppKey |
| LAP068002 | No se pudieron obtener las alarmas |
| LAP500001 | Servicio no disponible |
| LAP500002 | Token vacío |
| LAP500003 | Formato de token inválido |
| LAP500004 | Token expirado o incorrecto (7 días) |
| LAP500005 | Falló la verificación del token |
| LAP500006 | No se pudo obtener la información |
| LAP500007 | Se superó el número de llamadas permitidas |
| VMS022554 | Los recursos físicos no existen |
| VMS050020 | Cut-in de audio fallido (convergence-vms-video). No está en A.1; suele ser función/firmware/licencia |
| VMS050028 | Nombre de archivo de audio con caracteres especiales |
| VMS050034 | Dispositivo vinculado no encontrado |
| EVZ10001 | Parámetro incorrecto |
| EVZ10006 | IP restringida |
| EVZ10007 | Límite de llamadas |
| EVZ10013 | La aplicación no tiene permiso para esta API |
| EVZ10020 | Falta el método HTTP |
| EVZ10029 | Frecuencia de llamadas superada |
| EVZ20001 | El canal no existe |
| EVZ20002 | El dispositivo no existe |
| EVZ20006 | Excepción de red |
| EVZ20007 | Dispositivo desconectado |
| EVZ20008 | El dispositivo no respondió a tiempo |
| EVZ20014 | Serial incorrecto |
| EVZ20015 | El dispositivo no admite esta función |
| EVZ20018 | Dispositivo no vinculado a esta cuenta |
| EVZ20024 | Desconectado y pertenece a otra cuenta |
| EVZ20029 | Desconectado (añadido por esta cuenta) |
| EVZ49999 | Excepción de datos |
| EVZ50000 | Excepción del servidor |
| EVZ60012 | Error desconocido |
| EVZ60019 | Cifrado activado en el dispositivo |
| EVZ60020 | El dispositivo no admite este comando |
| EVZ60051 | Dispositivo no compatible |
| EVZ60054 | Cuenta del dispositivo bloqueada |

## Pistas de audio (laboratorio)

| Código | Acción sugerida |
|--------|-----------------|
| EVZ20007 | El altavoz debe estar en línea |
| EVZ20015 | Solo IP Speaker categoría 12 / subtipo 19 |
| EVZ60020 | Firmware sin el comando; actualizar o probar en HPP |
| VMS050028 | Nombre alfanumérico, guion o guion bajo; sin espacios ni tildes |
| VMS050020 | Payload aceptado pero el altavoz no reproduce; verificar función y `customAudioID` de ese serial |
| EVZ10001 | `audioLevel` [0,15], `audioVolume` [0,100], `pace` [0,100] |
