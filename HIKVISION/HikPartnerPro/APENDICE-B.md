> ← [Documentación Hik-Partner Pro](README.md) · [Apéndice A](APENDICE-A.md) · [Apéndice B](APENDICE-B.md) · [Apéndice C](APENDICE-C.md) · [Historial](HISTORIAL-ACTUALIZACIONES.md)

## Apéndice B — URIs y mensajes ISAPI del reenvío transparente

> **Notas:**
> - Se conserva la numeración del PDF (A.5–A.6) para trazabilidad.
> - Estas URIs se usan con `/api/hpcgw/v1/device/transparent/{isapi uri}`; consulta [5.7.1 Reenvío Transparente ISAPI](README.md#571-reenvío-transparente-isapi).
> - Las URIs, los nombres de mensajes y los payloads (incluidos sus comentarios) se conservan en inglés, tal como los define el protocolo ISAPI.

### A.5 URIs de Solicitud

Resumen de las URIs ISAPI disponibles a través del reenvío transparente, en el orden de la tabla del PDF. La columna **Mensajes** reproduce la columna «Request and Response Message» del PDF; el detalle de cada URI (solicitud y respuesta por método) está en su sección A.5.x.

| URI | Método | Descripción | Mensajes | Detalle |
| --- | ------ | ----------- | -------- | ------- |
| `/ISAPI/System/deviceInfo` | `GET` | Obtener la información del dispositivo. | [XML_DeviceInfo](#a616-xml_deviceinfo)<br>[XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.19](#a519-isapisystemdeviceinfo) |
| `/ISAPI/System/deviceInfo` | `PUT` | Editar la información del dispositivo. | — | [A.5.19](#a519-isapisystemdeviceinfo) |
| `/ISAPI/PTZCtrl/channels/<ID>/continuous` | `PUT` | Controlar el PTZ. | [XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.6](#a56-isapiptzctrlchannelsidcontinuous) |
| `/ISAPI/PTZCtrl/channels/<ID>/presets` | `GET` | Obtener la lista de presets. | [XML_PTZPresetList](#a626-xml_ptzpresetlist)<br>[XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.7](#a57-isapiptzctrlchannelsidpresets) |
| `/ISAPI/PTZCtrl/channels/<ID>/presets` | `POST` | Administrar todos los presets configurados. | — | [A.5.7](#a57-isapiptzctrlchannelsidpresets) |
| `/ISAPI/PTZCtrl/channels/<ID>/presets` | `DELETE` | Eliminar todos los presets. | — | [A.5.7](#a57-isapiptzctrlchannelsidpresets) |
| `/ISAPI/PTZCtrl/channels/<ID>/presets/<ID>` | `PUT` | Agregar un preset. | [XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.8](#a58-isapiptzctrlchannelsidpresetsid) |
| `/ISAPI/PTZCtrl/channels/<ID>/presets/<ID>` | `DELETE` | Eliminar un preset. | [XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.8](#a58-isapiptzctrlchannelsidpresetsid) |
| `/ISAPI/PTZCtrl/channels/<ID>/presets/<ID>` | `GET` | Obtener un preset. | — | [A.5.8](#a58-isapiptzctrlchannelsidpresetsid) |
| `/ISAPI/PTZCtrl/channels/<ID>/presets/<ID>/goto` | `PUT` | Llamar (ir a) un preset. | [XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.9](#a59-isapiptzctrlchannelsidpresetsidgoto) |
| `/ISAPI/SecurityCP/status/subSystems?format=json` | `GET` | Obtener el estado de las particiones. | [JSON_SubSysList](#a69-json_subsyslist)<br>[JSON_ResponseStatus](#a68-json_responsestatus) | [A.5.16](#a516-isapisecuritycpstatussubsystemsformatjson) |
| `/ISAPI/SecurityCP/control/arm/<ID>?ways=<string>&format=json` | `PUT` | Armar una partición. | [JSON_ResponseStatus](#a68-json_responsestatus) | [A.5.10](#a510-isapisecuritycpcontrolarmidwaysstringformatjson) |
| `/ISAPI/SecurityCP/control/disarm/<ID>?format=json` | `PUT` | Desarmar una partición. | [JSON_ResponseStatus](#a68-json_responsestatus) | [A.5.14](#a514-isapisecuritycpcontroldisarmidformatjson) |
| `/ISAPI/SecurityCP/control/clearAlarm/<ID>?format=json` | `PUT` | Borrar las alarmas de la partición. | [JSON_ResponseStatus](#a68-json_responsestatus) | [A.5.13](#a513-isapisecuritycpcontrolclearalarmidformatjson) |
| `/ISAPI/SecurityCP/status/zones?format=json` | `GET` | Obtener el estado de las zonas. | [JSON_ZoneList](#a613-json_zonelist)<br>[JSON_ResponseStatus](#a68-json_responsestatus) | [A.5.18](#a518-isapisecuritycpstatuszonesformatjson) |
| `/ISAPI/SecurityCP/status/zones?format=json` | `POST` | Buscar el estado de particiones según condiciones. | — | [A.5.18](#a518-isapisecuritycpstatuszonesformatjson) |
| `/ISAPI/SecurityCP/control/bypass?format=json` | `PUT` | Bypass de zonas. | [JSON_ResponseStatus](#a68-json_responsestatus) | [A.5.11](#a511-isapisecuritycpcontrolbypassformatjson) |
| `/ISAPI/SecurityCP/control/bypassRecover?format=json` | `PUT` | Restablecer el bypass de varias zonas. | [JSON_ResponseStatus](#a68-json_responsestatus) | [A.5.12](#a512-isapisecuritycpcontrolbypassrecoverformatjson) |
| `/ISAPI/SecurityCP/status/outputStatus?format=json` | `POST` | Obtener el estado de los relés según condiciones específicas. | `JSON_OutputSearch`<br>[JSON_ResponseStatus](#a68-json_responsestatus) | [A.5.17](#a517-isapisecuritycpstatusoutputstatusformatjson) |
| `/ISAPI/SecurityCP/control/outputs?format=json` | `POST` | Controlar relés en lote. | [JSON_ResponseStatus](#a68-json_responsestatus) | [A.5.15](#a515-isapisecuritycpcontroloutputsformatjson) |
| `/ISAPI/System/IO/outputs` | `GET` | Obtener la información de todos los puertos de salida de E/S. | [XML_IOOutputPortList](#a622-xml_iooutputportlist)<br>[XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.20](#a520-isapisystemiooutputs) |
| `/ISAPI/System/IO/outputs/<ID>/status` | `GET` | Obtener el estado de una salida de alarma específica. | [XML_IOPortStatus](#a624-xml_ioportstatus)<br>[XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.21](#a521-isapisystemiooutputsidstatus) |
| `/ISAPI/System/IO/outputs/<ID>/trigger` | `PUT` | Disparar manualmente una salida de alarma específica. | [XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.22](#a522-isapisystemiooutputsidtrigger) |
| `/ISAPI/System/time` | `GET` | Obtener la zona horaria del dispositivo. | `XML_TimeData`<br>[XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.23](#a523-isapisystemtime) |
| `/ISAPI/System/time` | `PUT` | Obtener o configurar los parámetros de hora del dispositivo. | — | [A.5.23](#a523-isapisystemtime) |
| `/ISAPI/ContentMgmt/InputProxy/channels` | `GET` | Operaciones de administración de todos los canales digitales. | [XML_InputProxyChannelList](#a618-xml_inputproxychannellist)<br>[XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.3](#a53-isapicontentmgmtinputproxychannels) |
| `/ISAPI/ContentMgmt/InputProxy/channels` | `PUT` | Configurar las operaciones de administración de todos los canales digitales. | — | [A.5.3](#a53-isapicontentmgmtinputproxychannels) |
| `/ISAPI/ContentMgmt/InputProxy/channels` | `POST` | Crear canales digitales. | — | [A.5.3](#a53-isapicontentmgmtinputproxychannels) |
| `/ISAPI/ContentMgmt/InputProxy/channels/status` | `GET` | Obtener el estado de todos los canales digitales. | [XML_InputProxyChannelStatusList](#a620-xml_inputproxychannelstatuslist)<br>[XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.4](#a54-isapicontentmgmtinputproxychannelsstatus) |
| `/ISAPI/ContentMgmt/record/control/manualRefresh/channels/<ID>` | `PUT` | Actualizar manualmente el modo de video antes de la reproducción. | [XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.5](#a55-isapicontentmgmtrecordcontrolmanualrefreshchannelsid) |
| `/ISAPI/AccessControl/AcsEvent?format=json` | `POST` | Buscar eventos de control de acceso. | [JSON_AcsEvent](#a61-json_acsevent)<br>[XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.1](#a51-isapiaccesscontrolacseventformatjson) |
| `/ISAPI/AccessControl/UserInfo/Search?format=json` | `POST` | Buscar información de personas. | [JSON_UserInfoSearch](#a610-json_userinfosearch)<br>[XML_ResponseStatus](#a627-xml_responsestatus) | [A.5.2](#a52-isapiaccesscontroluserinfosearchformatjson) |

> **Notas:**
> - La tabla resumen del PDF y las definiciones de cada URI (A.5.x) no siempre coinciden; ante la diferencia, usa la definición de la URI:
>   - `GET /ISAPI/System/time` se describe como «Get device time zone» y nombra `XML_TimeData`; la definición ([A.5.23](#a523-isapisystemtime)) indica «obtener los parámetros de hora» y el mensaje [XML_Time](#a630-xml_time). `XML_TimeData` no existe en A.6.
>   - `POST /ISAPI/SecurityCP/status/outputStatus?format=json` nombra `JSON_OutputSearch`; la definición ([A.5.17](#a517-isapisecuritycpstatusoutputstatusformatjson)) usa [JSON_OutputSearch_Status](#a66-json_outputsearch_status).
>   - `POST /ISAPI/SecurityCP/status/zones?format=json` se describe como búsqueda del estado de **particiones**; la definición ([A.5.18](#a518-isapisecuritycpstatuszonesformatjson)) indica estado de **zonas** según condiciones.
>   - Para `/ISAPI/AccessControl/AcsEvent` y `/ISAPI/AccessControl/UserInfo/Search` el resumen lista `XML_ResponseStatus`; la definición de `AcsEvent` indica [JSON_ResponseStatus](#a68-json_responsestatus) en caso de error, y la de `UserInfo/Search` solo menciona [JSON_UserInfoSearch](#a610-json_userinfosearch).
>   - En el resumen, `PUT` sobre `/presets/<ID>` aparece como «Add a preset» y `POST` sobre `/presets` como «Manage all configured presets»; en la definición, `POST /presets` agrega un preset y `PUT /presets/<ID>` configura sus parámetros.
> - Un guion (—) en **Mensajes** significa que el PDF no indica mensaje en la tabla resumen; consulta el detalle de la URI.

---

#### A.5.1 `/ISAPI/AccessControl/AcsEvent?format=json`

Buscar eventos de control de acceso.

**Definición de la URI de solicitud:**

**Tabla A-2 — `POST /ISAPI/AccessControl/AcsEvent?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `POST` |
| Descripción | Buscar eventos de control de acceso. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | [JSON_AcsEventCond](#a62-json_acseventcond) |
| Respuesta | Éxito: [JSON_AcsEvent](#a61-json_acsevent)<br>Error: [JSON_ResponseStatus](#a68-json_responsestatus) |

> **Notas:**
> - El tiempo de espera (timeout) recomendado para esta URI es de 10 segundos.
> - Si el mensaje de respuesta contiene datos de imagen, estos se devuelven mediante el método *boundary* (multipart); de lo contrario, el mensaje de respuesta se devuelve directamente en formato JSON.

**Ejemplo de respuesta con datos de imagen:**

```text
--MIME_boundary
Content-Type: application/json
Content-Length:480

{
  "AcsEvent":{
    "searchID":"",
    "responseStatusStrg":"OK",
    "numOfMatches":1,
    "totalMatches":1,
    "InfoList":[{
      "major":1,
      "minor":1,
      "time":"2016-12-12T17:30:08+08:00",
      "netUser":"",
      "remoteHostAddr":"",
      "cardNo":"",
      "cardType":1,
      "whiteListNo":1,
      "reportChannel":1,
      "cardReaderKind":1,
      "cardReaderNo":1,
      "doorNo":1,
      "verifyNo":1,
      "alarmInNo":1,
      "alarmOutNo":1,
      "caseSensorNo":1,
      "RS485No":1,
      "multiCardGroupNo":1,
      "accessChannel":1,
      "deviceNo":1,
      "distractControlNo":1,
      "employeeNoString":"",
      "localControllerID":1,
      "InternetAccess":1,
      "type":1,
      "MACAddr":"",
      "swipeCardType":1,
      "serialNo":1,
      "channelControllerID":1,
      "channelControllerLampID":1,
      "channelControllerIRAdaptorID":1,
      "channelControllerIREmitterID":1,
      "userType":"normal",
      "currentVerifyMode":"",
      "attendanceStatus":"",
      "statusValue":1,
      "pictureURL":"",
      "picturesNumber":1,
      "filename":"picture1"
    }]
  }
}
--MIME_boundary
Content-Disposition: form-data; filename="picture1"; //Picture data
Content-Type:image/jpeg
Content-Length:12345

fgagasghshgshdasdad…
--MIME_boundary--
```

---

#### A.5.2 `/ISAPI/AccessControl/UserInfo/Search?format=json`

Buscar información de personas.

**Definición de la URI de solicitud:**

**Tabla A-3 — `POST /ISAPI/AccessControl/UserInfo/Search?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `POST` |
| Descripción | Buscar información de personas. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta.<br>`terminalNo`: dependiente, int, número de terminal; inicia en 1. Es obligatorio para la integración con el sistema de publicación de información (*information release*). El número se genera cuando la terminal de publicación de información se registra en el servidor central de administración; para obtenerlo, llama a `/ISAPI/Publish/TerminalMgr/terminalSearch` con el método POST. |
| Solicitud | [JSON_UserInfoSearchCond](#a611-json_userinfosearchcond) |
| Respuesta | [JSON_UserInfoSearch](#a610-json_userinfosearch) |

> **Notas:**
> - La solicitud (condición de búsqueda de usuarios `JSON_UserInfoSearchCond`) depende de la capacidad de información de usuarios `JSON_Cap_UserInfo` (nodo relacionado: `<UserInfoSearchCond>`).

---

#### A.5.3 `/ISAPI/ContentMgmt/InputProxy/channels`

Operaciones de administración de todos los canales digitales.

**Definición de la URI de solicitud:**

**Tabla A-4 — `GET /ISAPI/ContentMgmt/InputProxy/channels`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener los parámetros de todos los canales digitales. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | [XML_InputProxyChannelList](#a618-xml_inputproxychannellist) |

**Tabla A-5 — `PUT /ISAPI/ContentMgmt/InputProxy/channels`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Configurar los parámetros de todos los canales digitales. |
| Query | Ninguno. |
| Solicitud | [XML_InputProxyChannelList](#a618-xml_inputproxychannellist) |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

**Tabla A-6 — `POST /ISAPI/ContentMgmt/InputProxy/channels`**

| Elemento | Valor |
| -------- | ----- |
| Método | `POST` |
| Descripción | Agregar un canal digital. |
| Query | Ninguno. |
| Solicitud | [XML_InputProxyChannel](#a617-xml_inputproxychannel) |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

---

#### A.5.4 `/ISAPI/ContentMgmt/InputProxy/channels/status`

Obtener el estado de todos los canales digitales.

**Definición de la URI de solicitud:**

**Tabla A-7 — `GET /ISAPI/ContentMgmt/InputProxy/channels/status`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener el estado de todos los canales digitales. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | [XML_InputProxyChannelStatusList](#a620-xml_inputproxychannelstatuslist) |

---

#### A.5.5 `/ISAPI/ContentMgmt/record/control/manualRefresh/channels/<ID>`

Actualizar manualmente el modo de video antes de la reproducción.

**Definición de la URI de solicitud:**

**Tabla A-8 — `PUT /ISAPI/ContentMgmt/record/control/manualRefresh/channels/<ID>`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Actualizar manualmente el modo de video antes de la reproducción. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

> **Notas:**
> - El `<ID>` de la URI de solicitud corresponde al número de canal.

---

#### A.5.6 `/ISAPI/PTZCtrl/channels/<ID>/continuous`

Controlar el PTZ para paneo (pan) e inclinación (tilt).

**Definición de la URI de solicitud:**

**Tabla A-9 — `PUT /ISAPI/PTZCtrl/channels/<ID>/continuous`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Controlar el PTZ para paneo (pan) e inclinación (tilt). |
| Query | Ninguno. |
| Solicitud | [XML_Absolute_PTZData](#a615-xml_absolute_ptzdata) |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

> **Notas:**
> - El `<ID>` de la URL corresponde al ID del canal.

---

#### A.5.7 `/ISAPI/PTZCtrl/channels/<ID>/presets`

Operaciones sobre la configuración de todos los presets.

**Definición de la URI de solicitud:**

**Tabla A-10 — `GET /ISAPI/PTZCtrl/channels/<ID>/presets`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener los parámetros de todos los presets. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | Éxito: [XML_PTZPresetList](#a626-xml_ptzpresetlist)<br>Error: [XML_ResponseStatus](#a627-xml_responsestatus) |

**Tabla A-11 — `POST /ISAPI/PTZCtrl/channels/<ID>/presets`**

| Elemento | Valor |
| -------- | ----- |
| Método | `POST` |
| Descripción | Agregar un preset. |
| Query | Ninguno. |
| Solicitud | [XML_Set_PTZPreset](#a629-xml_set_ptzpreset) |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

**Tabla A-12 — `DELETE /ISAPI/PTZCtrl/channels/<ID>/presets`**

| Elemento | Valor |
| -------- | ----- |
| Método | `DELETE` |
| Descripción | Eliminar todos los presets. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

> **Notas:**
> - El `<ID>` de la URI corresponde al ID de la cámara.

---

#### A.5.8 `/ISAPI/PTZCtrl/channels/<ID>/presets/<ID>`

Obtener o configurar los parámetros de un preset, o eliminar un preset.

**Definición de la URI de solicitud:**

**Tabla A-13 — `GET /ISAPI/PTZCtrl/channels/<ID>/presets/<ID>`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener los parámetros de un preset. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | Éxito: [XML_PTZPreset](#a625-xml_ptzpreset)<br>Error: [XML_ResponseStatus](#a627-xml_responsestatus) |

**Tabla A-14 — `PUT /ISAPI/PTZCtrl/channels/<ID>/presets/<ID>`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Configurar los parámetros de un preset. |
| Query | Ninguno. |
| Solicitud | [XML_Set_PTZPreset](#a629-xml_set_ptzpreset) |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

**Tabla A-15 — `DELETE /ISAPI/PTZCtrl/channels/<ID>/presets/<ID>`**

| Elemento | Valor |
| -------- | ----- |
| Método | `DELETE` |
| Descripción | Eliminar un preset. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

---

#### A.5.9 `/ISAPI/PTZCtrl/channels/<ID>/presets/<ID>/goto`

Llamar (ir a) un preset.

**Definición de la URI de solicitud:**

**Tabla A-16 — `PUT /ISAPI/PTZCtrl/channels/<ID>/presets/<ID>/goto`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Llamar (ir a) un preset. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

> **Notas:**
> - El primer `<ID>` de la URL corresponde al ID del canal y el segundo `<ID>`, al ID del preset.

---

#### A.5.10 `/ISAPI/SecurityCP/control/arm/<ID>?ways=<string>&format=json`

Armar la partición.

**Definición de la URI de solicitud:**

**Tabla A-17 — `PUT /ISAPI/SecurityCP/control/arm/<ID>?ways=<string>&format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Armar la partición. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta.<br>`ways`: tipo de armado: `stay` (armado en presencia) y `away` (armado total), p. ej. `ways=stay` o `ways=away`. |
| Solicitud | [JSON_Operate](#a67-json_operate) |
| Respuesta | [JSON_ResponseStatus](#a68-json_responsestatus) |

> **Notas:**
> - El `<ID>` de la URI de solicitud corresponde al número de partición, que inicia en 1; `0xffffffff` se refiere a todas las particiones.
> - Si la respuesta incluye `armProcess`, el dispositivo admite el armado y se ejecutará el proceso de armado.

---

#### A.5.11 `/ISAPI/SecurityCP/control/bypass?format=json`

Aplicar bypass a varias zonas.

**Definición de la URI de solicitud:**

**Tabla A-18 — `PUT /ISAPI/SecurityCP/control/bypass?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Aplicar bypass a varias zonas. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | [JSON_List_ID](#a63-json_list_id) |
| Respuesta | [JSON_ResponseStatus](#a68-json_responsestatus) |

---

#### A.5.12 `/ISAPI/SecurityCP/control/bypassRecover?format=json`

Restablecer el bypass de varias zonas.

**Definición de la URI de solicitud:**

**Tabla A-19 — `PUT /ISAPI/SecurityCP/control/bypassRecover?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Restablecer el bypass de varias zonas. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | [JSON_List_ID](#a63-json_list_id) |
| Respuesta | [JSON_ResponseStatus](#a68-json_responsestatus) |

---

#### A.5.13 `/ISAPI/SecurityCP/control/clearAlarm/<ID>?format=json`

Borrar las alarmas de una partición.

**Definición de la URI de solicitud:**

**Tabla A-20 — `PUT /ISAPI/SecurityCP/control/clearAlarm/<ID>?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Borrar las alarmas de una partición. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | [JSON_Operate](#a67-json_operate) |
| Respuesta | [JSON_ResponseStatus](#a68-json_responsestatus) |

> **Notas:**
> - El `<ID>` de la URI de solicitud corresponde al número de partición, que inicia en 1; `0xffffffff` indica todas las particiones.

---

#### A.5.14 `/ISAPI/SecurityCP/control/disarm/<ID>?format=json`

Desarmar la partición.

**Definición de la URI de solicitud:**

**Tabla A-21 — `PUT /ISAPI/SecurityCP/control/disarm/<ID>?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Desarmar la partición. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | [JSON_Operate](#a67-json_operate) |
| Respuesta | [JSON_ResponseStatus](#a68-json_responsestatus) |

> **Notas:**
> - El `<ID>` de la URI de solicitud corresponde al número de partición, que inicia en 1; `0xffffffff` indica todas las particiones.

---

#### A.5.15 `/ISAPI/SecurityCP/control/outputs?format=json`

Controlar relés en lote.

**Definición de la URI de solicitud:**

**Tabla A-22 — `POST /ISAPI/SecurityCP/control/outputs?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `POST` |
| Descripción | Controlar relés en lote. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | [JSON_OutputsCtrl](#a65-json_outputsctrl) |
| Respuesta | [JSON_ResponseStatus](#a68-json_responsestatus) |

---

#### A.5.16 `/ISAPI/SecurityCP/status/subSystems?format=json`

Obtener el estado de todas las particiones.

**Definición de la URI de solicitud:**

**Tabla A-23 — `GET /ISAPI/SecurityCP/status/subSystems?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener el estado de todas las particiones. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | Ninguno. |
| Respuesta | Éxito: [JSON_SubSysList](#a69-json_subsyslist)<br>Error: [JSON_ResponseStatus](#a68-json_responsestatus) |

---

#### A.5.17 `/ISAPI/SecurityCP/status/outputStatus?format=json`

Obtener el estado de los relés según condiciones específicas.

**Definición de la URI de solicitud:**

**Tabla A-24 — `POST /ISAPI/SecurityCP/status/outputStatus?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `POST` |
| Descripción | Obtener el estado de los relés según condiciones específicas. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | [JSON_OutputCond](#a64-json_outputcond) |
| Respuesta | Éxito: [JSON_OutputSearch_Status](#a66-json_outputsearch_status)<br>Error: [JSON_ResponseStatus](#a68-json_responsestatus) |

---

#### A.5.18 `/ISAPI/SecurityCP/status/zones?format=json`

Obtener el estado de las zonas.

**Definición de la URI de solicitud:**

**Tabla A-25 — `GET /ISAPI/SecurityCP/status/zones?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener el estado de todas las zonas. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | Ninguno. |
| Respuesta | Éxito: [JSON_ZoneList](#a613-json_zonelist)<br>Error: [JSON_ResponseStatus](#a68-json_responsestatus) |

**Tabla A-26 — `POST /ISAPI/SecurityCP/status/zones?format=json`**

| Elemento | Valor |
| -------- | ----- |
| Método | `POST` |
| Descripción | Obtener el estado de las zonas según condiciones específicas. |
| Query | `format`: determina el formato del mensaje de solicitud o respuesta. |
| Solicitud | [JSON_ZoneCond](#a612-json_zonecond) |
| Respuesta | Éxito: [JSON_ZoneSearch](#a614-json_zonesearch)<br>Error: [JSON_ResponseStatus](#a68-json_responsestatus) |

---

#### A.5.19 `/ISAPI/System/deviceInfo`

Operaciones sobre la información del dispositivo.

**Definición de la URI de solicitud:**

**Tabla A-27 — `GET /ISAPI/System/deviceInfo`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener la información del dispositivo. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | Éxito: [XML_DeviceInfo](#a616-xml_deviceinfo)<br>Error: [XML_ResponseStatus](#a627-xml_responsestatus) |

**Tabla A-28 — `PUT /ISAPI/System/deviceInfo`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Configurar la información del dispositivo. |
| Query | Ninguno. |
| Solicitud | [XML_DeviceInfo](#a616-xml_deviceinfo) |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

---

#### A.5.20 `/ISAPI/System/IO/outputs`

Obtener la información de todos los puertos de salida de E/S.

**Definición de la URI de solicitud:**

**Tabla A-29 — `GET /ISAPI/System/IO/outputs`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener la información de todos los puertos de salida de E/S. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | [XML_IOOutputPortList](#a622-xml_iooutputportlist) |

---

#### A.5.21 `/ISAPI/System/IO/outputs/<ID>/status`

Obtener el estado de una salida de alarma específica.

**Definición de la URI de solicitud:**

**Tabla A-30 — `GET /ISAPI/System/IO/outputs/<ID>/status`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener el estado de una salida de alarma específica. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | Éxito: [XML_IOPortStatus](#a624-xml_ioportstatus)<br>Error: [XML_ResponseStatus](#a627-xml_responsestatus) |

> **Notas:**
> - El `<ID>` de la URI de solicitud corresponde al ID de la salida de alarma.

---

#### A.5.22 `/ISAPI/System/IO/outputs/<ID>/trigger`

Disparar manualmente una salida de alarma específica.

**Definición de la URI de solicitud:**

**Tabla A-31 — `PUT /ISAPI/System/IO/outputs/<ID>/trigger`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Disparar manualmente una salida de alarma específica. |
| Query | Ninguno. |
| Solicitud | [XML_IOPortData](#a623-xml_ioportdata) |
| Respuesta | [XML_ResponseStatus](#a627-xml_responsestatus) |

> **Notas:**
> - El `<ID>` de la URI de solicitud corresponde al ID de la salida de alarma.

---

#### A.5.23 `/ISAPI/System/time`

Obtener o configurar los parámetros de hora del dispositivo.

**Definición de la URI de solicitud:**

**Tabla A-32 — `GET /ISAPI/System/time`**

| Elemento | Valor |
| -------- | ----- |
| Método | `GET` |
| Descripción | Obtener los parámetros de hora del dispositivo. |
| Query | Ninguno. |
| Solicitud | Ninguno. |
| Respuesta | Éxito: [XML_Time](#a630-xml_time)<br>Error: [XML_ResponseStatus](#a627-xml_responsestatus) |

**Tabla A-33 — `PUT /ISAPI/System/time`**

| Elemento | Valor |
| -------- | ----- |
| Método | `PUT` |
| Descripción | Configurar los parámetros de hora del dispositivo. |
| Query | Ninguno. |
| Solicitud | [XML_Time](#a630-xml_time) |
| Respuesta | Éxito: [XML_ResponseStatus_IFSTime](#a628-xml_responsestatus_ifstime)<br>Error: [XML_ResponseStatus](#a627-xml_responsestatus) |

---

### A.6 Mensajes de Solicitud y Respuesta

Definición de los mensajes JSON y XML referenciados en [A.5](#a5-uris-de-solicitud). Los payloads se reproducen tal como vienen en el PDF: son ejemplos esquemáticos (con valores vacíos y comentarios `/* */` o `<!-- -->` que describen cada campo), no necesariamente JSON/XML válido.

#### A.6.1 JSON_AcsEvent

Mensaje `AcsEvent` en formato JSON (resultado de la búsqueda de eventos de control de acceso).

```json
{
  "AcsEvent":{
    "searchID": "",
    /*required, string type, search ID, which is used to confirm the upper-level platform or system. If the platform or the system is the same one during two searching, the search history will be saved in the memory to speed up next searching*/
    "responseStatusStrg": "",
    /*required, string, search status: "OK"-searching completed, "MORE"-searching for more results, "NO MATCH"-no matched results*/
    "numOfMatches": ,
    /*required, integer, number of returned results*/
    "totalMatches": ,
    /*required, integer, total number of matched results*/
    "InfoList": [{
      /*optional, event details*/
      "major": ,
      /*required, integer, major alarm/event types (the type value should be transformed to the decimal number), see Access Control Event Types for details*/
      "minor": ,
      /*required, integer, minor alarm/event types (the type value should be transformed to the decimal number), see Access Control Event Types for details*/
      "time": "",
      /*required, string, time (UTC time), e.g., "2016-12-12T17:30:08+08:00"*/
      "netUser": "",
      /*optional, string, user name*/
      "remoteHostAddr": "",
      /*optional, string, remote host address*/
      "cardNo": "",
      /*optional, string, card No.*/
      "cardType": ,
      /*optional, integer, card types: 1-normal card, 2-disabled card, 3-blocklist card, 4-patrol card, 5-duress card, 6-super card, 7-visitor card, 8-dismiss card*/
      "name": "",
      /*optional, string, person name*/
      "whiteListNo": ,
      /*optional, integer, allowlist No., which is between 1 and 8*/
      "reportChannel": ,
      /*optional, integer, channel type for uploading alarm/event: 1-for uploading arming information, 2-for uploading by central group 1, 3-for uploading by central group 2*/
      "cardReaderKind": ,
      /*optional, integer, authentication unit type: 1-IC card reader, 2-ID card reader, 3-QR code scanner, 4-fingerprint module*/
      "cardReaderNo": ,
      /*Optional, integer, authentication unit No.*/
      "doorNo": ,
      /*optional, integer, door or floor No.*/
      "verifyNo": ,
      /*optional, integer, multiple authentication No.*/
      "alarmInNo": ,
      /*optional, integer, alarm input No.*/
      "alarmOutNo": ,
      /*optional, integer, alarm output No.*/
      "caseSensorNo": ,
      /*optional, integer, event trigger No.*/
      "RS485No": ,
      /*optional, integer, RS-485 channel No.*/
      "multiCardGroupNo": ,
      /*optional, integer, group No.*/
      "accessChannel": ,
      /*optional, integer, swing barrier No.*/
      "deviceNo": ,
      /*optional, integer, device No.*/
      "distractControlNo": ,
      /*optional, integer, distributed controller No.*/
      "employeeNoString": "",
      /*optional, integer, employee ID. (person ID)*/
      "localControllerID": ,
      /*optional, integer, distributed access controller No.: 0-access controller, 1 to 64-distributed access controller No.1 to distributed access controller No.64*/
      "InternetAccess": ,
      /*optional, integer, network interface No.: 1-upstream network interface No.1, 2-upstream network interface No.2, 3-downstream network interface No.1*/
      "type": ,
      /*optional, integer, zone type: 0-instant alarm zone, 1-24-hour alarm zone, 2-delayed zone, 3-internal zone, 4-key zone, 5-fire alarm zone, 6-perimeter protection, 7-24-hour silent alarm zone, 8-24-hour auxiliary zone, 9-24-hour shock alarm zone, 10-emergency door open alarm zone, 11-emergency door closed alarm zone, 255-none*/
      "MACAddr": "",
      /*optional, string, physical address*/
      "swipeCardType": ,
      /*optional, integer, card swiping types: 0-invalid, 1-QR code*/
      "serialNo": ,
      /*optional, integer, event serial No., which is used to judge whether the event loss occurred*/
      "channelControllerID": ,
      /*optional, integer, lane controller No.: 1-main lane controller, 2-sub lane controller*/
      "channelControllerLampID": ,
      /*optional, integer, light board No. of lane controller, which is between 1 and 255*/
      "channelControllerIRAdaptorID": ,
      /*optional, integer, IR adapter No. of lane controller, which is between 1 and 255*/
      "channelControllerIREmitterID": ,
      /*optional, integer, active infrared intrusion detector No. of lane controller, which is between 1 and 255*/
      "userType": "",
      /*optional, string, person type: "normal"-normal person (household), "visitor"-visitor, "blacklist"-person in blocklist, "administrators"-administrator*/
      "currentVerifyMode": "",
      /*optional, string, authentication mode: "cardAndPw"-card+password, "card", "cardOrPw"-card or password, "fp"-fingerprint, "fpAndPw"-fingerprint+password, "fpOrCard"-fingerprint or card, "fpAndCard"-fingerprint+card, "fpAndCardAndPw"-fingerprint+card+password, "faceOrFpOrCardOrPw"-face or fingerprint or card or password, "faceAndFp"-face+fingerprint, "faceAndPw"-face+password, "faceAndCard"-face+card, "face", "employeeNoAndPw"-employee ID.+password, "fpOrPw"-fingerprint or password, "employeeNoAndFp"-employee ID.+fingerprint, "employeeNoAndFpAndPw"-employee ID.+fingerprint+password, "faceAndFpAndCard"-face+fingerprint+card, "faceAndPwAndFp"-face+password+fingerprint, "employeeNoAndFace"-employee ID.+face, "faceOrfaceAndCard"-face or face+card, "fpOrface"-fingerprint or face, "cardOrfaceOrPw"-card or face or password, "cardOrFpOrPw"-card or fingerprint or password*/
      "QRCodeInfo":"test",
      /*optional, string, QR code information*/
      "thermometryUnit": "",
      /*optional, string, temperature unit: "celsius"-Celsius (default), "fahrenheit"-Fahrenheit, "kelvin"-Kelvin*/
      "currTemperature": ,
      /*optional, float, face temperature which is accurate to one decimal place*/
      "isAbnomalTemperature": ,
      /*optional, boolean, whether the face temperature is abnormal: true-yes, false-no*/
      "RegionCoordinates":{
        /*optional, face temperature's coordinates*/
        "positionX": ,
        /*optional, int, normalized X-coordinate which is between 0 and 1000*/
        "positionY":
        /*optional, int, normalized Y-coordinate which is between 0 and 1000*/
      },
      "mask": "",
      /*optional, string, whether the person is wearing mask: "unknown", "yes"-wearing mask, "no"-not wearing mask*/
      "pictureURL": "",
      /*optional, string, picture URL*/
      "filename":"",
      /*optional, string, file name. If multiple pictures are returned at a time, filename of each picture should be unique*/
      "attendanceStatus":"",
      /*optional, string, attendance status: "undefined", "checkIn"-check in, "checkOut"-check out, "breakOut"-break out, "breakIn"-break in, "overtimeIn"-overtime in, "overTimeOut"-overtime out*/
      "label":"",
      /*optional, string, custom attendance name*/
      "statusValue": ,
      /*optional, integer, status value*/
      "helmet": "",
      /*optional, string, whether the person is wearing hard hat: "unknown", "yes"-wearing hard hat, "no"-not wearing hard hat*/
      "visibleLightPicUrl": "test",
      /*optional, string, URL of the visible light picture*/
      "thermalPicUrl": "test",
      /*optional, string, URL of the thermal picture*/
      "appType": "attendance",
      /*optional, string, application type: "attendance" (attendance application), "signIn" (check-in application, which is only used for information release products)*/
      "HealthInfo": {
        /*optional, object, health information*/
        "healthCode": 1,
        /*optional, int, health code status: 0 (no request), 1 (no health code), 2 (green QR code), 3 (yellow QR code), 4 (red QR code), 5 (no such person), 6 (other error, e.g., searching failed due to API exception), 7 (searching for the health code timed out)*/
        "NADCode": 1,
        /*optional, int, nucleic acid test result: 0 (no result), 1 (negative, which means normal), 2 (positive, which means diagnosed), 3 (the result has expired)*/
        "travelCode": 1,
        /*optional, int, trip code: 0 (no trip in the past 14 days), 1 (once left in the past 14 days), 2 (has been to the high-risk area in the past 14 days), 3 (other)*/
        "vaccineStatus": 1
        /*optional, int, whether the person is vaccinated: 0 (not vaccinated), 1 (vaccinated)*/
      },
      "meetingID": "test",
      /*required, string, meeting number, range:[1,32]*/
      "PersonInfoExtends": [
        /*optional, array, extended person information*/
        {
          "id": 1,
          /*optional, integer, extended person ID, range:[1,32]*/
          "value": "test"
          /*optional, string, content of extended person information*/
      }],
      "name": "test",
      /*optional, string, name*/
      "FaceRect": {
        /*optional, object, rectangle for face picture*/
        "height": 1.000,
        /*optional, float, height, range:[0.000,1.000]*/
        "width": 1.000,
        /*optional, float, width, range:[0.000,1.000]*/
        "x": 0.000,
        /*optional, float, horizontal coordinate in the upper-left corner, range:[0.000,1.000]*/
        "y": 0.000
        /*optional, float, vertical coordinate in the upper-left corner, range:[0.000,1.000]*/
      }
    }],
  }
}
```

> **Notas:**
> - Ejemplo esquemático tal como lo trae el PDF: los valores numéricos vacíos (`"numOfMatches": ,`) y la coma final tras `"InfoList": [...]` no son JSON válido; los comentarios `/* */` describen cada campo.
> - La clave `name` aparece dos veces dentro de `InfoList` (nombre de la persona y nombre genérico); se conserva como en el PDF.

---

#### A.6.2 JSON_AcsEventCond

Mensaje `AcsEventCond` en formato JSON (condiciones de búsqueda de eventos de control de acceso).

```json
{
  "AcsEventCond": {
    "searchID": "",
    /*required, string type, search ID, which is used to confirm the upper-level platform or system. If the platform or the system is the same one during two searching, the search history will be saved in the memory to speed up next searching*/
    "searchResultPosition": ,
    /*required, integer, the start position of the search result in the result list. When there are multiple records and you cannot get all search results at a time, you can search for the records after the specified position next time*/
    "maxResults": ,
    /*required, integer, maximum number of search results. If maxResults exceeds the range returned by the device capability, the device will return the maximum number of search results according to the device capability and will not return error message*/
    "major": ,
    /*required, integer, major alarm/event types (the type value should be transformed to the decimal number), see Access Control Alarm Types for details*/
    "minor": ,
    /*required, integer, minor alarm/event types (the type value should be transformed to the decimal number), see Access Control Alarm Types for details*/
    "startTime": "",
    /*optional, string, start time (UTC time), e.g., 2016-12-12T17:30:08+08:00*/
    "endTime": "",
    /*optional, string, end time (UTC time), e.g.,2017-12-12T17:30:08+08:00*/
    "cardNo": "",
    /*optional, string, card No.*/
    "name": "",
    /*optional, string，cardholder name*/
    "picEnable": ,
    /*optional, boolean, whether to contain pictures: "false"-no, "true"-yes*/
    "beginSerialNo": ,
    /*optional, integer, start serial No.*/
    "endSerialNo": ,
    /*optional, integer, end serial No.*/
    "employeeNoString":"",
    /*optional, string, employee ID. (person ID)*/
    "eventAttribute":"",
    /*optional, string, event attribute: "attendance"-valid authentication, "other"*/
    "employeeNo":"",
    /*optional, string, employee ID. (person ID)*/
    "timeReverseOrder": ,
    /*optional, boolean, whether to return events in descending order of time (later events will be returned first): true-yes, false or this node is not returned-no*/
    "isAbnomalTemperature":true
    /*optional, boolean, whether the skin-surface temperature is abnormal*/
    "temperatureSearchCond": "all"
    /*optional, string, temperature search conditions, all (events with temperature information), normal (events with normal temperature), abnormal (events with abnormal temperature), if it exists with isAbnormalTemperature, then the latter will be invalid.*/
  }
}
```

> **Notas:**
> - Falta la coma después de `"isAbnomalTemperature":true` en el PDF; se conserva sin cambios. El campo se escribe `isAbnomalTemperature` en el ejemplo y `isAbnormalTemperature` en el comentario de `temperatureSearchCond`.

---

#### A.6.3 JSON_List_ID

Mensaje JSON con la lista de IDs de zona.

```json
{
  "List":[{
    "id":
    /*int, zone No., which starts from 0; it is required when performing bypass or bypass recovered on multiple zones; it is not required when performing bypass or bypass recovered on a zone*/
  }]
}
```

---

#### A.6.4 JSON_OutputCond

Mensaje JSON con las condiciones para obtener el estado de los relés.

```json
{
  "OutputCond":{
    "searchID":"",
    /*required, string, search ID, which is used to confirm the upper-level platform or system. If the platform or the system is the same one during two searching, the search history will be saved in the memory to speed up next searching*/
    "searchResultPosition": ,
    /*required, integer32, the start position of the search result in the result list. When there are multiple records and you cannot get all search results at a time, you can search for the records after the specified position next time*/
    "maxResults": ,
    /*required, integer32, maximum number of search results this time by calling this URI. If maxResults exceeds the range returned by the device capability, the device will return the maximum number of search results according to the device capability and will not return error message*/
    "outputModuleNo": ,
    /*optional, int, linked output module No.*/
    "moduleType":""
    /*optional, string, module type: "localWired"-local wired module, "extendWired"-extended wired module, "localWireless"-local wireless module, "extendWireless"-extended wireless module*/
  }
}
```

---

#### A.6.5 JSON_OutputsCtrl

Mensaje JSON con los parámetros de control de relés.

```json
{
  "OutputsCtrl":{
    "switch":""
    /*required, string, "open"-enable relay, "close"-disable relay*/
    "List":[{
      /*it is required when control multiple relays, and it is not required when control only one relay*/
      "id":
      /*int, relay No., which starts from 0*/
    }]
  }
}
```

> **Notas:**
> - Falta la coma después de `"switch":""` en el PDF; se conserva sin cambios.

---

#### A.6.6 JSON_OutputSearch_Status

Mensaje JSON con los resultados de la consulta del estado de los relés.

```json
{
  "OutputSearch":{
    "searchID":"",
    /*required, string, search ID, which is used to confirm the upper-level platform or system. If the platform or the system is the same one during two searching, the search history will be saved in the memory to speed up next searching*/
    "responseStatusStrg":"",
    /*required, string, search status: "OK"-searching completed, "NO MATCH"-no matched results, "MORE"-searching for more results*/
    "numOfMatches": ,
    /*required, integer32, number of results returned this time*/
    "totalMatches": ,
    /*required, integer32, total number of matched results*/
    "OutputList":[{
      /*optional, relay list*/
      "Output":{
        "id": ,
        /*required, int, relay No.*/
        "name":"",
        /*optional, string, relay name*/
        "status":"",
        /*optional, string, relay status: "notRelated"-not linked, "on", "off", "offline", "heartbeatAbnormal"-heartbeat exception*/
        "tamperEvident": ,
        /*optional, boolean, zone tampering status: true (tampered), false (not tampered)*/
        "charge":"",
        /*optional, string, state of charge: "normal", "lowPower"-low battery*/
        "linkage":"",
        /*optional, string, event type linked to the relay: "alarm", "arming", "disarming", "manualCtrl"-manually control*/
        "signal": ,
        /*optional, int, signal strength, it is between 0 and 255*/
        "temperature": 1,
        /*optional, int, temperature*/
        "devIndex": "test",
        /*optional, string, device ID, the maximum length is 64 bytes*/
        "devName": "test",
        /*optional, string, device name, the maximum length is 64 bytes*/
        "durationConstOutputEnable": true,
        /*optional, boolean, whether to always keep the relay open*/
        "isAvailable": true,
        /*optional, boolean, whether the relay is enabled, if this node is not returned, it indicates that the relay is enabled by default*/
        "accessModuleType": "transmitter",
        /*optional, enum, access module type: "transmitter", "localTransmitter", "multiTransmitter", "localRelay", "keypad"*/
        "relatedAccessModuleID": 1,
        /*optional, int, linked access module ID*/
        "address": 254,
        /*optional, int, wired (extended) module address, this node works with accessModuleType*/
        "subSystemList": [1, 2, 3],
        /*optional, array, list of linked partitions*/
        "scenarioType": ["alarm"],
        /*optional, array, scenario type*/
        "relayAttrib": "wired",
        /*optional, string, relay attribute: "wired", "wireless" (default)*/
        "deviceNo": 1
        /*optional, int, device ID, range:[1,1000]*/
      }
    }]
  }
}
```

> **Notas:**
> - La tabla resumen de [A.5](#a5-uris-de-solicitud) lo nombra `JSON_OutputSearch`; la definición de la URI ([A.5.17](#a517-isapisecuritycpstatusoutputstatusformatjson)) y este encabezado usan `JSON_OutputSearch_Status` (objeto raíz `OutputSearch`).

---

#### A.6.7 JSON_Operate

Mensaje JSON con los parámetros de operación.

```json
{
  "Operate": {
    /*optional, object, operation parameters*/
    "moduleOperateCode": "12345"
    /*optional, string, module operation code, which should be encrypted*/
  }
}
```

---

#### A.6.8 JSON_ResponseStatus

Mensaje JSON con el estado de la respuesta.

```json
{
  "requestURL":"",
  /*optional, string, request URL*/
  "statusCode": ,
  /*optional, int, status code*/
  "statusString":"",
  /*optional, string, status description*/
  "subStatusCode":"",
  /*optional, string, sub status code*/
  "errorCode": ,
  /*required, int, error code, which corresponds to subStatusCode, this field is required when statusCode is not 1. The returned value is the transformed decimal number*/
  "errorMsg":"",
  /*required, string, error details, this field is required when statusCode is not 1*/
  "MErrCode": "0xFFFFFFFF",
  /*optional, string, error code categorized by functional modules*/
  "MErrDevSelfEx": "0xFFFFFFFF"
  /*optional, string, extension of MErrCode. It is used to define the custom error code, which is categorized by functional modules*/
}
```

> **Notas:**
> - Los códigos de `MErrCode` se describen en [A.8 Códigos de Error por Módulo Funcional](APENDICE-C.md#a8-códigos-de-error-por-módulo-funcional).

---

#### A.6.9 JSON_SubSysList

Mensaje JSON con la lista de información de particiones.

```json
{
  "SubSysList":[{
    /*required, partition list*/
    "SubSys":{
      /*optional, partition, it can be set to NULL if partitions are not needed*/
      "id": ,
      /*required, int, partition No., which starts from 1*/
      "armType":"",
      /*required, string, partition arming type: "stay"-stay arming, "away"-away arming. This node is only valid for arming partitions in a batch*/
      "arming":"",
      /*optional, string, partition arming/disarming status, "stay"-stay arming, "away"-away arming, "disarm"-disarmed, "arming"*/
      "alarm": ,
      /*optional, boolean, whether the partition alarm is triggered: true, false*/
      "preventFaultArm": ,
      /*optional, boolean, whether to prevent fault arming: true, false*/
      "enabled": ,
      /*optional, boolean, whether to enable the partition*/
      "name":"",
      /*optional, string, partition name*/
      "moduleOperateCode": "12345",
      /*optional, string, module operation code, which should be encrypted*/
      "delayTime": 1
      /*optional, int, maximum remaining delay time of the delay zones in the current partition, unit:s; this node is valid when the value of the node arming is "stay" or "away"*/
    }
  }]
}
```

---

#### A.6.10 JSON_UserInfoSearch

Mensaje `UserInfoSearch` en formato JSON (resultado de la búsqueda de información de personas).

```json
{
  "UserInfoSearch":{
    "searchID":"",
    /*required, string type, search ID, which is used to confirm the upper-level platform or system. If the platform or the system is the same one during two searching, the search history will be saved in the memory to speed up next searching*/
    "responseStatusStrg":"",
    /*required, string, search status: "OK"-searching completed, "NO MATCH"-no matched results, "MORE"-searching for more results*/
    "numOfMatches": ,
    /*required, integer32, number of returned results this time*/
    "totalMatches": ,
    /*required, integer32, total number of matched results*/
    "UserInfo":[{
      /*optional, person information*/
      "employeeNo":"",
      /*required, string, employee ID. (person ID)*/
      "name":"",
      /*optional, string, person name*/
      "userType":"",
      /*required, string, person type: "normal"-normal person (household), "visitor", "blackList"-person in blocklist*/
      "closeDelayEnabled": ,
      /*optional, boolean, whether to enable door close delay: "true"-yes, "false"-no*/
      "Valid":{
        /*required, parameters of the effective period*/
        "enable":"",
        /*required, boolean, whether to enable the effective period: "false"-disable, "true"-enable. If this node is set to "false", the effective period is permanent*/
        "beginTime":"",
        /*required, start time of the effective period (if timeType does not exist or is "local", the beginTime is the device local time, e.g., 2017-08-01T17:30:08; if timeType is "UTC", the beginTime is UTC time, e.g., 2017-08-01T17:30:08+08:00)*/
        "endTime":"",
        /*required, end time of the effective period (if timeType does not exist or is "local", the endTime is the device local time, e.g., 2017-08-01T17:30:08; if timeType is "UTC", the endTime is UTC time, e.g., 2017-08-01T17:30:08+08:00)*/
        "timeType":""
        /*optional, string, time type: "local"- device local time, "UTC"- UTC time*/
      },
      "belongGroup":"",
      /*optional, string, group*/
      "password":"",
      /*optional, string, password*/
      "doorRight":"",
      /*optional, string, No. of door or lock that has access permission, e.g., "1,3" indicates having permission to access door (lock) No. 1 and No. 3*/
      "RightPlan":[{
        /*optional, access permission schedule of the door or lock*/
        "doorNo": ,
        /*optional, integer, door No. (lock ID)*/
        "planTemplateNo":""
        /*optional, string, schedule template No.*/
      }],
      "maxOpenDoorTime": ,
      /*optional, integer, the maximum authentication attempts, 0-unlimited*/
      "openDoorTime": ,
      /*optional, integer, read-only, authenticated attempts*/
      "roomNumber": ,
      /*optional, integer, room No.*/
      "floorNumber": ,
      /*optional, integer, floor No.*/
      "doubleLockRight": ,
      /*optional, boolean, whether to have the permission to open the double-locked door: "true"-yes, "false"-no*/
      "localUIRight": ,
      /*optional, boolean, whether to have the permission to access the device local UI: "true"-yes, "false"-no*/
      "localUIUserType":"",
      /*optional, string, user type of device local UI: "admin" (administrator), "operator", "viewer" (normal user). This node is used to distinguish different users with different operation permissions of device local UI*/
      "userVerifyMode":"",
      /*optional, string, person authentication mode: "cardAndPw"-card+password, "card"-card, "cardOrPw"-card or password, "fp"-fingerprint, "fpAndPw"-fingerprint+password, "fpOrCard"-fingerprint or card, "fpAndCard"-fingerprint+card, "fpAndCardAndPw"-fingerprint+card+password, "faceOrFpOrCardOrPw"-face or fingerprint or card or password, "faceAndFp"-face+fingerprint, "faceAndPw"-face+password, "faceAndCard"-face+card, "face"-face, "employeeNoAndPw"-employee ID.+password, "fpOrPw"-fingerprint or password, "employeeNoAndFp"-employee ID.+fingerprint, "employeeNoAndFpAndPw"-employee ID.+fingerprint+password, "faceAndFpAndCard"-face+fingerprint+card, "faceAndPwAndFp"-face+password+fingerprint, "employeeNoAndFace"-employee ID.+face, "faceOrfaceAndCard"-face or face+card, "fpOrface"-fingerprint or face, "cardOrfaceOrPw"-card or face or password, "cardOrFace"-card or face, "cardOrFaceOrFp"-card or face or fingerprint, "cardOrFpOrPw"-card or fingerprint or password. The priority of the person authentication mode is higher than that of the card reader authentication mode*/
      "dynamicCode": "123456",
      /*optional, string, dynamic permission code, this node is write-only*/
      "callNumbers": ["","",""],
      /*optional, array of string, list of called numbers, the default rule is "X-X-X-X", e.g., "1-1-1-401". This node is the extension of the node roomNumber. When the number list is supported, you need to use this node to configure parameters*/
      "floorNumbers": [1,2],
      /*optional, array of int, floor No. list. This node is the extension of floorNumber. When the number list is supported, you need to use this node to configure parameters*/
      "numOfFace":0,
      /*optional, int, number of linked face pictures. This node is read-only and if it is not returned, it indicates that this function is not supported*/
      "numOfFP":0,
      /*optional, int, number of linked fingerprints. This node is read-only and if it is not returned, it indicates that this function is not supported*/
      "numOfCard":0,
      /*optional, int, number of linked cards. This node is read-only and if it is not returned, it indicates that this function is not supported*/
      "gender":"",
      /*optional, string, gender of the person in the face picture: "male", "female", "unknown"*/
      "PersonInfoExtends":[{
        /*optional, array of object, extended fields for the additional person information. This node is used to configure the extended person information displayed on the device's UI. For MinMoe series facial recognition terminals, currently only one value node can be supported for displaying the employee ID. and the node id is not supported*/
        "id":1,
        /*optional, int, extended ID of the additional person information, value range: [1,32]. It corresponds to the id in the message of the request URI /ISAPI/AccessControl/personInfoExtendName?format=json and is used to link the value of the node value and its name (the node name in the message of the request URI /ISAPI/AccessControl/personInfoExtendName?format=json). If the node id does not exist, the ID will start from 1 by default according to the array order*/
        "value":""
        /*optional, string, extended content of the additional person information*/
      }],
      "groupName": "test",
      /*optional, string. group name, range:[1,64]*/
      "age": 0,
      /*optional, integer, age, range:[0,120]*/
      "PatientInfos": {
        /*optional, object, patient infomation*/
        "deviceID": "test",
        /*optional, string, device number*/
        "admissionTime": "1970-01-01T00:00:00+08:00",
        /*optional, datetime, hospitalized date*/
        "chargeNurse": "test",
        /*optional, string, nurse in charge, range:[0,32]*/
        "chargeDoctor": "test",
        /*optional, string, doctor in charge, range:[0,32]*/
        "nursingLevel": "tertiary",
        /*optional, enumerate, nursing level*/
        "doctorsAdvice": "test",
        /*optional, string, advice from doctor, range:[0,128]*/
        "allergicHistory ": "test"
        /*optional, string, allergy, range:[0,128]*/
      },
      "TromboneRule": {
        /*optional, object, trombone rule*/
        "industryType": "builidings",
        /*optional, string, industry type*/
        "unitType": "indoor",
        /*optional, string, device type, indoor (idoor station), villa (villa outdoor station), confirm (double confirm), outdoor (outdoor station), fence (outer door station), doorbell (doorbell), manage (master station), acs (access control device), wardStation (ward extension), bedheadExtension (bedhead extension), bedsideExtension (bedside extension), terminal (terminal), netAudio (network audio), interactive (interactive terminal), amplifier (amplifier)*/
        "SIPVersion": "V10"
        /*optional, string, private SIP version, range:[0,32]*/
      },
      "ESDType": "handAndFoot"
      /*optional, enumerate, ESD detection type: handAndFoot (detect both hand and foot), no (no detection), hand (detect hand), foot (detect foot)*/
    }]
  }
}
```

> **Notas:**
> - La clave `"allergicHistory "` trae un espacio final en el PDF; se corrigió a `"allergicHistory"`.

---

#### A.6.11 JSON_UserInfoSearchCond

Mensaje `UserInfoSearchCond` en formato JSON (condiciones de búsqueda de información de personas).

```json
{
  "UserInfoSearchCond":{
    "searchID":"",
    /*required, string type, search ID, which is used to confirm the upper-level platform or system. If the platform or the system is the same one during two searching, the search history will be saved in the memory to speed up next searching*/
    "searchResultPosition": ,
    /*required, integer32 type, the start position of the search result in the result list. When there are multiple records and you cannot get all search results at a time, you can search for the records after the specified position next time*/
    "maxResults": ,
    /*required, integer32 type, maximum number of search results. If maxResults exceeds the range returned by the device capability, the device will return the maximum number of search results according to the device capability and will not return error message*/
    "EmployeeNoList":[{
      /*optional, person ID list (if this node does not exist or is empty, it indicates searching for all person information)*/
      "employeeNo":""
      /*optional, string type, employee No. (person ID)*/
    }],
    "fuzzySearch":"",
    /*optional, string, key words for fuzzy search*/
    "userType": "normal",
    /*optional, string, normal（normal user), visitor (visitor), blockList (person in blocklist), patient (patient), maintenance (maintenance people)*/
    "deviceIDList": [1, 2]
    /*optional, array, device ID list*/
  }
}
```

---

#### A.6.12 JSON_ZoneCond

Mensaje `ZoneCond` en formato JSON (condiciones de búsqueda de estado de zonas).

```json
{
  "ZoneCond":{
    "searchID":"",
    /*required, string type, search ID, which is used to confirm the upper-level platform or system. If the platform or the system is the same one during two searching, the search history will be saved in the memory to speed up next searching*/
    "searchResultPosition": ,
    /*required, integer32 type, the start position of the search result in the result list. When there are multiple records and you cannot get all search results at a time, you can search for the records after the specified position next time*/
    "maxResults":
    /*required, integer32 type, maximum number of search results that can be obtained this time by calling the URI. If maxResults exceeds the range returned by the device capability, the device will return the maximum number of search results according to the device capability and will not return error message*/
  }
}
```

---

#### A.6.13 JSON_ZoneList

Mensaje JSON con la lista de estado de zonas.

```json
{
  "ZoneList":[{
    "Zone":{
      "id": ,
      /*required, int, zone ID*/
      "name":"",
      /*optional, string, zone name*/
      "status":"",
      /*optional, string, zone status, "notRelated"-no zone linked, "online"-online, "offline"-offline, "trigger"-triggered, "breakDown"-fault, "heartbeatAbnormal"-heartbeat exception*/
      "reason": "short",
      /*optional, string, default reason: "short", "break"*/
      "tamperEvident": ,
      /*optional, boolean, zone tampering alarm status, true-triggered, false-not triggered*/
      "shielded": ,
      /*optional, boolean, zone disabling status, true-disabled, false-not disabled*/
      "bypassed": ,
      /*optional, boolean, whether to bypass the zone, true-bypassed, false-bypass recovered*/
      "armed": ,
      /*required, boolean, whether to arm the zone, true-armed, false-disarmed*/
      "isArming": ,
      /*optional, boolean, whether the zone is armed, this node can only be set to "true"*/
      "alarm": ,
      /*optional, boolean, whether the zone alarm is triggered, true-triggered, false-not triggered*/
      "charge": "",
      /*optional, string, zone battery status, "normal", "lowPower"-low battery*/
      "chargeValue": ,
      /*optional, int, battery power value which is between 0 and 100*/
      "signal": ,
      /*optional, int, signal strength, which ranges from 0 to 255*/
      "temperature": ,
      /*optional, read-only, int, temperature*/
      "detectorType":"",
      /*optional, string, type of the detector linked to the zone, see details about the supported detector types in JSON_ZoneCap*/
      "model": "",
      /*optional, string, model*/
      "zoneType":""
      /*optional, string, zone type: "Instant"-instant zone, "Delay"-delay zone, "Follow"-follow zone, "Perimeter"-perimeter zone, "24hNoSound"-24-hour silent zone, "Emergency"-panic zone, "Fire"-fire zone, "Gas"-gas zone, "Medical"-medical zone, "Timeout"-timeout zone, "Non-Alarm"-disabled zone, "Key"-key zone*/
      "humidity": 20,
      /*optional, int, read-only, humidity, the value is between 10% and 90%*/
      "healthStatus": "normal",
      /*optional, string, read-only, health status: "normal", "fault"*/
      "antiMaskingEnabled": true,
      /*optional, boolean, read-only, whether to enable anti-masking: true-enable，false-disable*/
      "mountingType": "wall",
      /*optional, string, read-only, mounting type: "wall", "ceiling"*/
      "magnetOpenStatus": true,
      /*optional, boolean, whether the magnetic contact is open: true (open), false (closed)*/
      "version": "test",
      /*optional, string, detector version No., the maximum length is 32 bytes*/
      "pirCamConnected": true,
      /*optional, boolean, whether the outdoor triple signal detector and PIR camera are connected: true (yes), false (no)*/
      "accessModuleType": "transmitter",
      /*optional, enum, access module type: "transmitter", "localTransmitter", "multiTransmitter", "localZone", "keypad"*/
      "relatedAccessModuleID": 1,
      /*optional, int, linked access module ID*/
      "address": 254,
      /*optional, int, wired (extended) module address, this node works with accessModuleType*/
      "zoneAttrib": "wired",
      /*optional, enum, zone attribute: "wired", "wireless" (default)*/
      "voltage": 1,
      /*optional, int, voltage of the zone*/
      "signalStrength": 1,
      /*optional, int, signal strength, range:[-128,127]*/
      "mainCharge": "normal",
      /*optional, enum, main (adapter) power status: "normal", "lowPower". Main power and zone power refers to the zone's adapter power status and the zone's battery status respectively*/
      "preheatStatus": "processing",
      /*optional, enum, pre-heat status: "processing", "success"*/
      "userfulLifeStatus": "expire",
      /*optional, enum, expiry status: "expire", "normal"*/
      "mazeStatus": "abnormal",
      /*optional, enum, maze status: "abnormal", "normal"*/
      "sensorStatus": "abnormal",
      /*optional, enum, sensor status: "abnormal", "normal"*/
      "deviceNo": 1
      /*optional, int, device No., range:[1,1000]*/
    }
  }]
}
```

---

#### A.6.14 JSON_ZoneSearch

Mensaje JSON con el resultado de la búsqueda de estado de zonas.

```json
{
  "ZoneSearch":{
    "searchID":"",
    /*required, string type, search ID, which is used to confirm the upper-level platform or system. If the platform or the system is the same one during two searching, the search history will be saved in the memory to speed up next searching*/
    "responseStatusStrg":"",
    /*required, string type, search status: "OK"-searching completed, "NO MATCH"-no matched results, "MORE"-searching for more results*/
    "numOfMatches": ,
    /*required, integer32, number of returned results this time*/
    "totalMatches": ,
    /*required, integer32, total number of matched results*/
    "ZoneList":[{
      "Zone":{
        "id": ,
        /*required, integer type, zone No.*/
        "name":"",
        /*optional, string type, zone name*/
        "status":"",
        /*optional, string type, zone status: "notRelated"-not linked, "online", "offline", "trigger", "breakDown"-fault, "heartbeatAbnormal"-heartbeat exception*/
        "tamperEvident": ,
        /*optional, boolean type, zone tampering status: "true"-tampered, "false"-not tampered*/
        "shielded": ,
        /*optional, boolean type, zone shielding status: "true"-shielded, "false"-not shielded*/
        "bypassed": ,
        /*optional, boolean type, whether the zone is bypassed: "true"-yes, "false"-no*/
        "armed": ,
        /*required, boolean type, whether the zone is armed: "true"-yes, "false"-no*/
        "isArming": ,
        /*optional, boolean type, whether the zone is armed, this node can only be set to "true"*/
        "alarm": ,
        /*optional, boolean type, whether the alarm is triggered in the zone: "true-yes, "false"-no*/
        "charge":"",
        /*optional, string type, state of charge of the zone: "normal", "lowPower"-low battery*/
        "signal": ,
        /*optional, integer type, signal strength, it is between 0 and 255*/
        "subSystemNo ": ,
        /*optional, integer type, partition No.*/
        "zoneAttrib":"",
        /*optional, string, zone attribute: "wired", "wireless". If this node is not returned, the default zone attribute is "wireless"*/
        "RelatedChanList":[{
          /*optional, list of linked channel No.*/
          "RelatedChan":{
            "relator":"",
            /*required, string type, device linked to the channel when the alarm is triggered*/
            "cameraSeq":"",
            /*optional, string type, camera serial No.*/
            "relatedChan":
            /*optional, integer type, linked channel No.*/
          }
        }],
        "detectorType": "test",
        /*optional, string, type of the detector linked to the zone*/
        "model": "DS-PM1-O8-WE",
        /*optional, enum, model, subType:string, "DS-PM1-O8-WE", "DS-PM1-O2-WE"*/
        "zoneType": "Instant",
        /*optional, string, zone type: "Instant"-instant zone, "Delay"-delay zone, "Follow"-follow zone, "Perimeter"-perimeter zone, "24hNoSound"-24-hour silent zone, "Emergency"-panic zone, "Fire"-fire zone, "Gas"-gas zone, "Medical"-medical zone, "Timeout"-timeout zone, "Non-Alarm"-disabled zone, "Key"-key zone*/
        "InputList": [
          /*optional, array, list of input status*/
          {
            "id": 1,
            /*required, int, input ID*/
            "enabled": true,
            /*required, boolean, whether it is enabled*/
            "mode": "NO"
            /*optional, enum, input type: "rolling shutter", "NC" (always closed), "NO" (always open)*/
          }
        ],
        "humidity": 10,
        /*optional, int, humidity, the value is between 10% and 90%*/
        "healthStatus": "normal",
        /*optional, string, read-only, health status: "normal", "fault"*/
        "antiMaskingEnabled": true,
        /*optional, boolean, read-only, whether to enable anti-masking: true-enable，false-disable*/
        "mountingType": "wall",
        /*optional, string, read-only, mounting type: "wall", "ceiling"*/
        "magnetOpenStatus": true,
        /*optional, boolean, whether the magnetic contact is open: true (open), false (closed)*/
        "devIndex": "test",
        /*optional, string, device ID, the maximum length is 64 bytes*/
        "devName": "test",
        /*optional, string, device name, the maximum length is 64 bytes*/
        "isAvailable": true,
        /*optional, boolean, whether the partition is available: true (default), false*/
        "isBypassedAvailable": true,
        /*optional, boolean, whether bypass is configurable: true (yes), false (no). By default, it is configurable*/
        "version": "test",
        /*optional, string, detector version No., the maximum length is 32 bytes*/
        "pirCamConnected": true,
        /*optional, boolean, whether the outdoor triple signal detector and PIR camera are connected: true (yes), false (no)*/
        "accessModuleType": "transmitter",
        /*optional, enum, access module type: "transmitter", "localTransmitter", "multiTransmitter", "localZone", "keypad"*/
        "relatedAccessModuleID": 1,
        /*optional, int, linked access module ID*/
        "address": 254,
        /*optional, int, wired (extended) module address, this node works with accessModuleType*/
        "deviceNo": 1
        /*optional, int, device ID, range:[1,1000]*/
      }
    }]
  }
}
```

> **Notas:**
> - La clave `"subSystemNo "` trae un espacio final en el PDF; se corrigió a `"subSystemNo"`.

---

#### A.6.15 XML_Absolute_PTZData

Mensaje XML con los parámetros de control PTZ.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<PTZData xmlns="http://www.isapi.org/ver20/XMLSchema" version="2.0">
  <!--req, object, PTZ value-->
  <pan>
    <!--opt, int, panning positive direction, range: [-100,100]-->60
  </pan>
  <tilt>
    <!--opt, int, tilting positive direction, range:[-100,100]-->60
  </tilt>
  <zoom>
    <!--opt, int, zooming value, range:[-100,100]-->60
  </zoom>
  <angularVelocity>
    <!--opt, object, angular velocity-->
    <enabled>
      <!--req, bool, whether to enable it-->true
    </enabled>
    <value>
      <!--opt, int, angular velocity value, range:[1,360], unit: rad/s-->1
    </value>
  </angularVelocity>
</PTZData>
```

---

#### A.6.16 XML_DeviceInfo

Mensaje XML con la información del dispositivo.

```xml
<?xml version="1.0" encoding="utf-8"?>
<DeviceInfo version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <deviceName><!--required, xs:string--></deviceName>
  <deviceID><!--required, read-only, xs:string, uuid--></deviceID>
  <deviceDescription>
    <!--optional, xs:string, description about the device defined in RFC1213. For network camera, this node is set to "IPCamera"; for network speed dome, this node is set to "IPDome"; for DVR or DVS, this node is set to "DVR" or "DVS"-->
  </deviceDescription>
  <deviceLocation><!--optional, xs:string, actual location of the device--></deviceLocation>
  <deviceStatus><!--optional, read-only, xs:string, device status: "normal", "abnormal"--></deviceStatus>
  <DetailAbnormalStatus>
    <!--dependent, error status details, it is valid only when deviceStatus is "abnormal"-->
    <hardDiskFull>
      <!--optional, read-only, xs: boolean, whether the error of "HDD full" occurred: "true"-yes,"false"-no-->
    </hardDiskFull>
    <hardDiskError>
      <!--optional, read-only, xs:boolean, whether the error of "HDD error" occurred: "true"-yes,"false"-no-->
    </hardDiskError>
    <ethernetBroken>
      <!--optional, read-only, xs: boolean, whether the error of "network disconnected" occurred: "true"-yes,"false"-no-->
    </ethernetBroken>
    <ipaddrConflict>
      <!--optional, read-only, xs: boolean, whether the error of "IP address conflicted" occurred: "true"-yes,"false"-no-->
    </ipaddrConflict>
    <illegalAccess>
      <!--optional, read-only, xs: boolean, whether the error of "illegal login" occurred: "true"-yes,"false"-no-->
    </illegalAccess>
    <recordError>
      <!--optional, read-only, xs: boolean, whether the error of "recording exception" occurred: "true"-yes,"false"-no-->
    </recordError>
    <raidLogicDiskError>
      <!--optional, read-only, xs: boolean, whether the error of "RAID exception" occurred: "true"-yes,"false"-no-->
    </raidLogicDiskError>
    <spareWorkDeviceError>
      <!--optional, read-only, xs: boolean, whether the error of "working device exception" occurred: "true"-yes,"false"-no-->
    </spareWorkDeviceError>
  </DetailAbnormalStatus>
  <systemContact><!--optional, xs:string, contact information of the device--></systemContact>
  <model><!--required, read-only, xs:string--></model>
  <serialNumber><!--required, read-only, xs:string--></serialNumber>
  <macAddress><!--required, read-only, xs:string--></macAddress>
  <firmwareVersion><!--required, read-only, xs:string--></firmwareVersion>
  <firmwareReleasedDate><!--optional, read-only, xs:string--></firmwareReleasedDate>
  <bootVersion><!--optional, read-only, xs:string--></bootVersion>
  <bootReleasedDate><!--optional, read-only, xs:string--></bootReleasedDate>
  <hardwareVersion><!--optional, read-only, xs:string--></hardwareVersion>
  <encoderVersion><!--optional, read-only, xs:string--></encoderVersion>
  <encoderReleasedDate><!--optional, read-only, xs:stirng--></encoderReleasedDate>
  <decoderVersion><!--optional, read-only, xs:string--></decoderVersion>
  <decoderReleasedDate><!--optional, read-only, xs:stirng--></decoderReleasedDate>
  <softwareVersion><!--optional, read-only, xs:string, software version--></softwareVersion>
  <capacity><!--optional, read-only, xs:integer, unit: MB, device capacity--></capacity>
  <usedCapacity><!--optional, read-only, xs:integer, unit: MB, capacity usage--></usedCapacity>
  <deviceType>
    <!--required, read-only, xs:string, device type: "IPCamera", "IPDome", "DVR", "HybirdNVR", "NVR", "DVS", "IPZoom", "CVR", "Radar", "PerimeterRadar"-perimeter radar, "ACS", "PHA"-Axiom hybrid security control panel-->
  </deviceType>
  <telecontrolID><!--optional, xs:integer, keyfob control ID, the value is between 1 and 255--></telecontrolID>
  <supportBeep><!--optional, xs:boolean--></supportBeep>
  <supportVideoLoss><!--optional, xs:boolean, whether it supports video loss detection--></supportVideoLoss>
  <firmwareVersionInfo><!--optional, read-only, xs:string, firmware version information--></firmwareVersionInfo>
  <actualFloorNum>
    <!--required, xs: integer, actual number of floors, which is between 1 and 128-->
  </actualFloorNum>
  <subChannelEnabled><!--optional, xs:boolean, whether to support sub-stream live view: "true"-yes, "false"-no--></subChannelEnabled>
  <thrChannelEnabled><!--optional, xs:boolean, whether to support third stream live view: "true"-yes, "false"-no--></thrChannelEnabled>
  <radarVersion><!--optional, xs:string, radar version--></radarVersion>
  <cameraModuleVersion><!--read-only, xs:string, camera module version--></cameraModuleVersion>
  <mainversion><!--optional, xs:integer, main version No. which is between 1 and 255--></mainversion>
  <subversion><!--optional, xs:integer, sub version No. which is between 1 and 255--></subversion>
  <upgradeversion><!--optional, xs:integer, upgraded version No. which is between 1 and 255--></upgradeversion>
  <customizeversion><!--optional, xs:integer, customized version No. which is between 1 and 255--></customizeversion>
  <companyName><!--optional, xs:string, the manufacturing company's abbreviation--></companyName>
  <copyright><!--optional, xs:string, copyright information--></copyright>
  <systemName><!--optional, xs:string , storage system name: "storageManagement"-storage management system, "distributedStorageManagement"-distrubuted storage management system--></systemName>
  <systemStatus><!--optional, xs:string,system status: "configured"-configured, "unConfigured"-not configured--></systemStatus>
  <isLeaderDevice><!--optional, xs:boolean, whether it is the corresponding device of the resource IP address--></isLeaderDevice>
  <clusterVersion><!--dependent, xs:string, system cluster version. This node is valid when the value of isLeaderDevice is true--></clusterVersion>
  <manufacturer><!--optional, xs:string, manufacturer information: "hikvision"-Hikvision devices; for neutral devices, this node should be empty--></manufacturer>
  <customizedInfo><!--optional, xs:string, order No. of the customization project. For baseline devices, this node is empty; for custom devices, the order No. of the customization project will be returned by this node--></customizedInfo>
  <localZoneNum><!--optional, xs:integer, number of local zones--></localZoneNum>
  <alarmOutNum><!--optional, xs:integer, number of alarm outputs--></alarmOutNum>
  <distanceResolution><!--optional, xs:float, resolution of distance, unit: meter--></distanceResolution>
  <angleResolution><!--optional, xs:float, resolution of angle, unit: degree--></angleResolution>
  <speedResolution><!--optional, xs:float, resolution of speed, unit: m/s--></speedResolution>
  <detectDistance><!--optional, xs:float, detection distance, unit: meter--></detectDistance>
  <languageType><!--optional, xs:string, language type: Chinese, English, Spanish, Portuguese, Italian, French, Russian, German, Polish, Turkish, Greek, Czech, Brazilian, Portuguese, Slovenian, Swedish, Norwegian, Slovak, Serbian, Dutch, Hungarian, Irish, Bulgarian, Hebrew, Thai, Indonesian, Arabic, Traditional Chinese--></languageType>
  <relayNum><!--optional, xs:integer, number of local relays--></relayNum>
  <electroLockNum><!--optional, xs:integer, number of local electronic locks--></electroLockNum>
  <RS485Num><!--optional, xs:integer, number of local RS-485--></RS485Num>
  <powerOnMode><!--optional, xs:string, device startup mode: "button"-press button to power on (default), "adapter"-connect adapter to power on--></powerOnMode>
  <DockStation>
    <!--optional, dock station configuration-->
    <Platform>
      <!--optional, platform configuration-->
      <type><!--required, xs:string, platform type: none, 9533, 8618, ISAPI--></type>
      <ip><!--optional, xs:string, IP address --></ip>
      <port><!--optional, xs:integer, communication port--></port>
      <userName><!--required, xs:string, user name, which is used for the dock station to log in to platform--></userName>
      <password><!--required, xs:string, password, which is used for the dock station to log in to platform, it should be encrypted--></password>
    </Platform>
    <centralStorageBackupEnabled><!--optional, xs:boolean, whether to enable central storage backup--></centralStorageBackupEnabled>
  </DockStation>
  <webVersion><!--optional, read-only, xs:string, web version No.--></webVersion>
  <deviceRFProgramVersion><!--optional, read-only, xs:string, version No. of the device's RF (Radio Frequency) program--></deviceRFProgramVersion>
  <securityModuleSerialNo><!--optional, read-only, xs:string, serial No. of the security module--></securityModuleSerialNo>
  <securityModuleVersion><!--optional, read-only, xs:string, version No. of the security module--></securityModuleVersion>
  <securityChipVersion><!--optional, read-only, xs:string, version No. of the security chip--></securityChipVersion>
  <securityModuleKeyVersion><!--optional, read-only, xs:string, version No. of the security module key--></securityModuleKeyVersion>
  <UIDLampRecognition><!--optional, information of the UID lamp recognition device-->
    <enabled><!--optional, xs:boolean, whether to enable--></enabled>
  </UIDLampRecognition>
  <bootTime><!--optional, xs:string, read-only, system boot time, ISO 8601 format; the maximum length is 32 bytes--></bootTime>
  <ZigBeeVersion min="0" max="16"><!--optional, xs:string, ZigBee module version--></ZigBeeVersion>
  <R3Version min="0" max="16"><!--optional, xs:string, R3 module version--></R3Version>
  <RxVersion min="0" max="16"><!--optional, xs:string, Rx module version--></RxVersion>
  <bspVersion><!--optional, xs:string, BSP software version--></bspVersion>
  <dspVersion><!--optional, xs:string, DSP software version--></dspVersion>
  <localUIVersion><!--optional, xs:string, local UI version--></localUIVersion>
  <isResetDeviceLanguage>
    <!--optional, boolean, whether it supports resetting the device language (only for Admin and Installer)-->false
  </isResetDeviceLanguage>
</DeviceInfo>
```

> **Notas:**
> - Las erratas dentro de los comentarios del payload (`xs:stirng`, `HybirdNVR`, `distrubuted`) se conservan tal como vienen en el PDF.

---

#### A.6.17 XML_InputProxyChannel

Mensaje `InputProxyChannel` en formato XML (parámetros de un canal digital).

```xml
<?xml version="1.0" encoding="utf-8"?>
<InputProxyChannel version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <id><!--req, xs:string, starts from 1--></id>
  <name><!--opt, xs:string--></name>
  <sourceInputPortDescriptor><!--req-->
    <adminProtocol><!--req, xs:string, "HIKVISION,SONY,ISAPI,ONVIF,..."--></adminProtocol>
    <addressingFormatType><!--req, xs:string, "ipaddress,hostname"--></addressingFormatType>
    <hostName><!--dep, xs:string, domain name--></hostName>
    <ipAddress><!--dep, xs:string, IP address--></ipAddress>
    <ipv6Address><!--dep, xs:string, IPv6 address--></ipv6Address>
    <managePortNo><!--req, xs:integer--></managePortNo>
    <srcInputPort><!--req, xs:string, channel No.--></srcInputPort>
    <userName><!--req, xs:string, user name, which should be encrypted--></userName>
    <password><!--req, wo, xs:string, password, which should be encrypted--></password>
    <streamType><!--opt, xs:string, opt="auto,tcp,udp"--></streamType>
    <deviceID><!--dep, xs:string--></deviceID>
    <deviceTypeName><!--ro, opt, xs:string, device type name--></deviceTypeName>
    <serialNumber><!--ro, opt, xs:string, device serial No.--></serialNumber>
    <firmwareVersion><!--ro, opt, xs:string, firmware version--></firmwareVersion>
    <firmwareCode><!--ro, opt, xs:string, firmware code--></firmwareCode>
  </sourceInputPortDescriptor>
  <enableAnr>
    <!--opt, xs:boolean, whether enables ANR funtion-->
  </enableAnr>
  <NVRInfo>
    <ipAddressNVR>
      <!--opt, xs:string, IP address of NVR-->
    </ipAddressNVR>
    <portNVR>
      <!--opt, xs:integer, port No. of NVR-->
    </portNVR>
    <ipcChannelNo>
      <!--opt, xs:integer, channel No. of the network camera in NVR-->
    </ipcChannelNo>
  </NVRInfo>
</InputProxyChannel>
```

---

#### A.6.18 XML_InputProxyChannelList

Mensaje `InputProxyChannelList` en formato XML (lista de canales digitales).

```xml
<?xml version="1.0" encoding="utf-8"?>
<InputProxyChannelList version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <InputProxyChannel/><!--opt, see details in InputProxyChannel-->
</InputProxyChannelList>
```

**Ver también:** [A.6.17 XML_InputProxyChannel](#a617-xml_inputproxychannel)

---

#### A.6.19 XML_InputProxyChannelStatus

Mensaje `InputProxyChannelStatus` en formato XML (estado de un canal digital).

```xml
<InputProxyChannelStatus version="1.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <id><!--req, xs:string--></id>
  <sourceInputPortDescriptor/><!--req-->
  <online><!--req, xs:boolean, whether the camera is online--></online>
  <streamingProxyChannelIdList><!--req-->
    <streamingProxyChannelId>
      <!--req, xs:string, stream channel No., e.g., 101-main stream of channel 1, 102-sub-stream of channel 1-->
    </streamingProxyChannelId>
  </streamingProxyChannelIdList>
  <chanDetectResult>
    <!--opt, xs:string, network camera status: "connect"-connected, "overSysBandwidth"-insufficient bandwidth, "domainError"-incorrect domain name, "ipcStreamFail"-getting stream failed, "connecting", "chacnNoError"-incorrect channel No., "cipAddrConflictWithDev": IP address is conflicted with device address, "ipAddrConflicWithIpc"-IP address conflicted, "errorUserNameOrPasswd"-incorrect user name or password, "netUnreachable"-invalid network address, "unknownError"-unknown error, "notExist"-does not exist, "ipcStreamTypeNotSupport"-the stream transmission mode is not supported, "ipcResolutionNotSupport"-the resolution of network camera is not supported-->
  </chanDetectResult>
</InputProxyChannelStatus>
```

---

#### A.6.20 XML_InputProxyChannelStatusList

Mensaje `InputProxyChannelStatusList` en formato XML (lista de estados de canales digitales).

```xml
<InputProxyChannelStatusList version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <InputProxyChannelStatus/><!--opt, see details in XML_InputProxyChannelStatus-->
</InputProxyChannelStatusList>
```

**Ver también:** [A.6.19 XML_InputProxyChannelStatus](#a619-xml_inputproxychannelstatus)

---

#### A.6.21 XML_IOOutputPort

Mensaje XML con la información de una salida de alarma.

```xml
<?xml version="1.0" encoding="utf-8"?>
<IOOutputPort version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <id><!--required, xs:integer, "2"--></id>
  <IODescriptor><!--optional, camera IO description-->
    <userName><!--required, xs:string, user name--></userName>
    <addressingFormatType><!--required, xs:string, address type: "ipaddress", "hostname"--></addressingFormatType>
    <hostName><!--dependent, xs:string, host name--></hostName>
    <ipAddress><!--dependent, xs:string, IPv4 address--></ipAddress>
    <ipv6Address><!--dependent, xs:string, IPv6 address--></ipv6Address>
    <managePortNo><!--required, xs:integer, management port No.--></managePortNo>
    <innerIOPortID><!--required, xs:integer, camera IO port No.--></innerIOPortID>
  </IODescriptor>
  <PowerOnState>
    <!--required, output port configuration parameters when the device is powered on-->
    <defaultState>
      <!--read-only, required, xs:string, default output port signal when it is not triggered, "high,low"-->
    </defaultState>
    <outputState>
      <!--read-only, required, output port signal when it is being triggered, xs:string, "high,low,pulse"-->
    </outputState>
    <pulseDuration>
      <!--dependent, xs:integer, duration of a output port signal when it is being triggered, it is valid when outputState is "pulse", unit: milliseconds -->
    </pulseDuration>
  </PowerOnState>
  <name><!--optional, xs:string--></name>
  <IOUseType><!--optional, xs:string, "disable,electricLock,custom"--></IOUseType>
  <normalStatus><!--optional, xs:string, normal status: open-remain open, close-remain closed--></normalStatus>
  <enabled><!--optional, xs:boolean, enable DND of corresponding IO; default value: true--></enabled>
  <IOType><!--optional, read-only, xs:string, supported IO port type: "local", "digitalChannel", "analogChannel"; the default value is "local"--></IOType>
</IOOutputPort>
```

> **Notas:**
> - El PDF describe este mensaje como «JSON message about alarm output information», aunque el payload es XML.

---

#### A.6.22 XML_IOOutputPortList

Mensaje XML con la lista de salidas de alarma.

```xml
<?xml version="1.0" encoding="utf-8"?>
<IOOutputPortList version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <IOOutputPort/><!--optional, see details in IOOutputPort-->
</IOOutputPort>
```

**Ver también:** [A.6.21 XML_IOOutputPort](#a621-xml_iooutputport)

> **Notas:**
> - En el PDF la etiqueta de cierre es `</IOOutputPort>` en lugar de `</IOOutputPortList>`; se conserva tal cual. El cierre correcto según la etiqueta de apertura es `</IOOutputPortList>`.

---

#### A.6.23 XML_IOPortData

Mensaje XML con los parámetros de disparo de la salida de alarma.

```xml
<?xml version="1.0" encoding="utf-8"?>
<IOPortData xmlns=“http://www.isapi.org/ver20/XMLSchema”>
  <outputState><!--required, xs:string, output level: "high, low"--></outputState>
</IOPortData>
```

> **Notas:**
> - El atributo `xmlns` usa comillas tipográficas (`“ ”`) en el PDF; se conserva tal cual. En un mensaje real deben usarse comillas rectas (`"`).

---

#### A.6.24 XML_IOPortStatus

Mensaje XML con el estado de la salida de alarma.

```xml
<?xml version="1.0" encoding="utf-8"?>
<IOPortStatus version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <ioPortID><!--required, xs: integer, I/O No.: 1, 2--></ioPortID>
  <ioPortType><!--required, xs: string, I/O type: "input", "output"--></ioPortType>
  <ioState><!--required, xs: string, I/O status: "active", "inactive"--></ioState>
</IOPortStatus>
```

---

#### A.6.25 XML_PTZPreset

Mensaje XML con los parámetros de un preset.

```xml
<?xml version="1.0" encoding="utf-8"?>
<PTZPreset version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <enabled><!--required, xs:boolean, whether to enable preset configuration--></enabled>
  <id><!--required, xs:string, preset No.--></id>
  <presetName><!--required, xs:string, preset name--></presetName>
  <AbsoluteHigh>
    <elevation><!--optional, xs:integer, tilting parameter, the value is between -900 and 2700--></elevation>
    <azimuth><!--optional, xs:integer, panning parameter, the value is between 0 and 3600--></azimuth>
    <absoluteZoom><!--optional, xs:integer, zooming parameter, the value is between 1 and 1000--></absoluteZoom>
  </AbsoluteHigh>
</PTZPreset>
```

---

#### A.6.26 XML_PTZPresetList

Mensaje XML con la lista de información de presets.

```xml
<?xml version="1.0" encoding="utf-8"?>
<PTZPresetList version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <PTZPreset/><!--optional, see details in XML_PTZPreset-->
</PTZPresetList>
```

**Ver también:** [A.6.25 XML_PTZPreset](#a625-xml_ptzpreset)

---

#### A.6.27 XML_ResponseStatus

Mensaje XML con el estado de la respuesta.

```xml
<?xml version="1.0" encoding="utf-8"?>
<ResponseStatus version="2.0" xmlns="http://www.std-cgi.org/ver20/XMLSchema">
  <requestURL>
    <!--required, read-only, xs:string, request URL-->
  </requestURL>
  <statusCode>
    <!--required, read-only, xs:integer, status code: 0,1-OK, 2-Device Busy, 3-Device Error, 4-Invalid Operation, 5-Invalid XML Format, 6-Invalid XML Content, 7-Reboot Required, 9-Additional Error-->
  </statusCode>
  <statusString>
    <!--required, read-only, xs:string, status description: OK, Device Busy, Device Error, Invalid Operation, Invalid XML Format, Invalid XML Content, Reboot, Additional Error-->
  </statusString>
  <subStatusCode>
    <!--required, read-only, xs:string, describe the error reason in detail-->
  </subStatusCode>
  <MErrCode>
    <!--optional, xs:string, error code categorized by functional modules, e.g., 0x12345678-->
  </MErrCode>
  <MErrDevSelfEx>
    <!--optional, xs:string, extension field of MErrCode. It is used to define the custom error code, which is categorized by functional modules-->
  </MErrDevSelfEx>
</ResponseStatus>
```

> **Notas:**
> - Este ejemplo usa el namespace `http://www.std-cgi.org/ver20/XMLSchema`, a diferencia del resto de mensajes XML (`http://www.isapi.org/ver20/XMLSchema`); se conserva como en el PDF.

---

#### A.6.28 XML_ResponseStatus_IFSTime

Mensaje XML sobre los parámetros de hora del dispositivo (respuesta exitosa de `PUT /ISAPI/System/time`).

```xml
<ResponseStatus version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <requestURL><!--required, xs:string, request URL, read-only--></requestURL>
  <statusCode><!--required, xs:integer, status code: 0 or 1-OK, 2-Device Busy, 3-Device Error, 4-Invalid Operation, 5-Invalid XML Format, 6-Invalid XML Content, 7-Reboot Required, read-only--></statusCode>
  <statusString><!--required, xs:string, status description: "OK,Device Busy,Device Error,Invalid Operation,Invalid XML Format,Invalid XML Content,Reboot", read-only--></statusString>
  <subStatusCode><!--required, xs:string, detailed description of the error code, read-only--></subStatusCode>
  <FailedNodeInfoList>
    <!--optional, information list of failed nodes-->
    <FailedNodeInfo>
      <!--optional, failed node information. When the main node in the data center cluster synchronizes device time, the main node will synchronize time of all sub nodes at the same time. If synchronizing time of all nodes failed, the failed response message will be returned. If synchronizing time of part of nodes failed, the succeeded response message will be returned and this node will returned detailed information of failed nodes-->
      <nodeID><!--required, xs:string, node ID--></nodeID>
      <nodeIP><!--required, xs:string, node IP--></nodeIP>
      <reason><!--optional, xs:string, reason why the node failed to synchronize time, which can be displayed on the interface--></reason>
    </FailedNodeInfo>
  </FailedNodeInfoList>
</ResponseStatus>
```

---

#### A.6.29 XML_Set_PTZPreset

Mensaje XML con los parámetros de configuración de un preset.

```xml
<?xml version="1.0" encoding="utf-8"?>
<PTZPreset version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <enabled><!--required, xs:boolean, whether to enable preset configuration--></enabled>
  <id><!--required, xs:string, preset number--></id>
  <presetName><!--required, xs:string, preset name--></presetName>
</PTZPreset>
```

---

#### A.6.30 XML_Time

Mensaje XML con los parámetros de hora.

```xml
<?xml version="1.0" encoding="utf-8"?>
<Time version="2.0" xmlns="http://www.isapi.org/ver20/XMLSchema">
  <timeMode><!--required, xs:string, timing mode: "manual, NTP, local, satellite, timecorrect, platform"--></timeMode>
  <localTime>
    <!--required, xs:datetime, ISO 8601 time format, device time set manually, e.g.: 2018-02-01T19:54:04. This node is required when <timemode> is "manual" or "local"-->
  </localTime>
  <timeZone>
    <!--required, xs:string, POSIX time zone based on CST for NTP synchronization, e.g., CST-8:00:00DST00:30:00,M4.1.0/02:00:00,M10.5.0/02:00:00; this node is valid when <timemode> is "manual", "local" or "NTP"-->
  </timeZone>
  <satelliteInterval><!--dependent, xs:integer, unit: minute--></satelliteInterval>
  <isSummerTime><!--optional, xs:boolean, whether the time returned by the current device is that in the DST (daylight saving time) mode: true, false--></isSummerTime>
  <platformType>
    <!--dependent, xs: string, platform type: "EZVIZ"-Hik-Connect; it is valid only when the value of timeMode is "platform"-->
  </platformType>
</Time>
```

> **Notas:**
> - La tabla resumen de [A.5](#a5-uris-de-solicitud) lo nombra `XML_TimeData`; la definición de la URI ([A.5.23](#a523-isapisystemtime)) y este encabezado usan `XML_Time`.
