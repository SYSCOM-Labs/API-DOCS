# Milesight EG71 — Gateway de Building IoT (building-IoT gateway)

> Versión del documento: V1.0 — Septiembre 2026 · Documentos del fabricante: *UG6X/EG71 llms* (v2) + PDF oficiales (datasheet, installation guide, administrator guide)
> Producto: Gateway LoRaWAN Milesight EG71 (building IoT: LoRaWAN + BAS fieldbus + I/O + Puerta de enlace de protocolos)

---

## Información Legal

- Esta es una **guía de referencia e integración** basada en el material oficial del fabricante (PDF incluidos en [`docs/`](./docs/); espejo local de los documentos Markdown en [`docs/llms/`](./docs/llms/)). Muestra cómo integrar el gateway Milesight EG71 con plataformas de terceros usando su **API HTTP** (backend CGI + REST) y sus superficies de integración (MQTT, HTTP, BACnet, Modbus).
- **Todos los valores de ejemplo son ilustrativos** — direcciones IP, DevEUI, tokens, instancias BACnet y llaves sirven únicamente para mostrar el formato. Adáptalos a tu instalación.
- Los comportamientos pueden variar según la **versión de firmware** del gateway. Las verificaciones citadas corresponden a **71.0.0.2/71.0.0.3**. Para valores y comportamientos definitivos, consulta siempre el documento oficial correspondiente a tu firmware.
- El producto se proporciona "TAL CUAL". Ni Milesight ni SYSCOM serán responsables de daños especiales, consecuentes, incidentales o indirectos derivados del uso de esta documentación.

---

## Tabla de Contenidos

- [Capítulo 1 — ¿Qué es y para qué?](#capítulo-1--qué-es-y-para-qué)
- [Capítulo 2 — Superficies de la API (mapa CGI vs REST)](#capítulo-2--superficies-de-la-api-mapa-cgi-vs-rest)
- [Capítulo 3 — Páginas de la interfaz web (Web GUI)](#capítulo-3--páginas-de-la-interfaz-web-web-gui)
- [Guía de integración por API](./API-GATEWAY.md)
- [Apéndice A — Endpoints, errCodes y mapa core/base](./APENDICE-A.md)
- [Historial de actualizaciones](./HISTORIAL-ACTUALIZACIONES.md)

---

## Capítulo 1 — ¿Qué es y para qué?

El **EG71** es el gateway **building IoT** de Milesight: un gateway LoRaWAN de interior (chasis metálico DIN-rail) que añade **bus de campo BAS** e **I/O** al conjunto estándar de gateway, dirigido a integradores de **BMS** y retrofits.

### 1.1 Hardware (resumen)

| Rasgo | Especificación |
| ----- | -------------- |
| CPU | NXP i.MX8M Mini, 4× Cortex-A53 1.5 GHz 64-bit |
| Memoria | 2 GB DDR4; 32 GB eMMC; slot micro SD |
| LoRaWAN | Concentrador de 8 canales (half-duplex); hasta ~2,000 dispositivos (intervalo 10 min); Class A/B/C |
| Bandas | CN470, IN865, EU868, RU864, US915, AU915, KR920, AS923-1/2/3/4 |
| Ethernet | 2× GbE RJ45 (WAN/LAN); PoE PD 802.3af en ETH1 |
| Wi-Fi | 802.11 b/g/n 2.4 GHz (AP o cliente) |
| Celular (opcional) | 4G LTE CAT1 |
| Bus de campo | 2× RS485 (Modbus RTU / BACnet MS/TP), 1× KNX/TP1, 1× M-Bus (en desarrollo) |
| I/O | 8× entradas universales (0-10 V / 4-20 mA / PT1000 / Ni1000 / NTC / contacto seco), 4× DI, 3× relé 230 V AC / 3 A, 4× AO |
| Otros | NFC, OLED 1.3" (128×64), consola Type-C, RTC (supercap 72 h) |
| Alimentación | 24 V AC/DC; PoE 802.3af; USB-C 5 V/3 A — ⚠️ **alimentar por USB desactiva M-Bus y las entradas universales** |
| Clima | −40 °C ~ +60 °C; 0% ~ 95% RH |

### 1.2 Modelos y certificaciones

El código de pedido codifica la región LoRaWAN (PN de 24 caracteres; posición 18 = `nsRegion`). Certificaciones: CE, CE (RED), FCC. Certificaciones KNX y BTL pendientes al momento del datasheet.

### 1.3 ¿Para qué lo uso?

- **Integrador LoRaWAN**: conecta sensores/wifi meters, los decodifica y los reenvía (MQTT/HTTP) a tu plataforma.
- **Integrador BMS**: recolecta dispositivos BACnet/IP, Modbus TCP/RTU y KNX a través del gateway y los sirve al supervisor (Niagara, Tridium, …) por sus propios servidores BACnet/IP y Modbus TCP.
- **Edge**: Node-RED, Python SDK y Docker para lógica local.

---

## Capítulo 2 — Superficies de la API (mapa CGI vs REST)

Dos superficies HTTP están disponibles en la IP del gateway. Las verificaciones de este documento corresponden al firmware **71.0.0.2/71.0.0.3**.

| Superficie | Ruta base | Autenticación | Para qué |
| ---------- | --------- | ------------- | -------- |
| **Backend CGI** | `POST /cgi` | `Authorization: Bearer login=<usuario>;<td>` | Configuración de red, VPN, Firewall, Sistema, radio LoRa, Plataforma, Apps |
| **API REST** | `/api/*` | `Authorization: Bearer <jwt>` (de `/api/internal/login`) | Gestión de dispositivos/equipos, biblioteca de codecs, **data forwarding** (MQTT/HTTP/BACnet/Modbus), LoRaWAN NS, access networks |
| **Sesión** | `POST /islogin`, `POST /logout` | bearer | Verificación de estado de sesión |

Reglas de uso:

- **Páginas de configuración** (Network/System/Platform/App) → CGI.
- **Data Services** (dispositivos, codecs, forwarding) → REST.
- Los **conteos de objetos y dispositivos siempre se derivan de datos reales**; no los hardcodées.
- Envoltura de éxito `{errCode: 0, errMsg: "success", ...}` para REST y `{status: 0, result:[...]}` para CGI.
- **Límite de velocidad**: CGI ≥ 500 ms entre llamadas; ráfagas devuelven `503`.

La referencia completa (auth, CGI `core/base`, endpoints REST, getchas verificados) está en la [Guía de integración por API](./API-GATEWAY.md).

---

## Capítulo 3 — Páginas de la interfaz web (Web GUI)

La Web UI es un SPA React + Ant Design. Acceso por `http://<ip-gateway>` con login admin. Estructura del menú:

| Menú | Rutas | Función |
| ---- | ----- | ------- |
| **Status** | `/dashboard` | Estado del gateway, conteos de dispositivos de acceso y de forwarding, estado de enlaces (Ethernet/WLAN/VPN/RS485/IO/KNX/LoRaWAN/Celular) |
| **Data Services > Equipment Data** | `/data-services/equipment-data` | Lista de dispositivos (LoRaWAN/BACnet/Modbus/KNX + I/O), scan/add, importación/exportación, objetos de dispositivo, access networks, config LoRaWAN (perfiles/multicast/FUOTA) |
| **Data Services > Data Forwarding** | `/data-services/data-forwarding` | Reglas de forwarding a MQTT/HTTP/BACnet/Modbus, mapeo de dispositivos/objetos, certificados TLS, BBMD |
| **Data Services > Data Parsing Library** | `/data-services/data-parsing-library` | Codecs integrados y personalizados, importar/exportar/probar/actualizar |
| **Data Services > Data Flow** | `/data-services/data-flow` | Visor en tiempo real de data flow (RX/TX/join/errores por dispositivo) |
| **Network > Interfaces** | `/network/interfaces` | Ethernet, Wireless, Celular, LoRaWAN (Radio/avanzado/scan espectral), RS485, Loopback |
| **Network > Firewall** | `/network/firewall` | Nivel de seguridad, ACL, DMZ, MAC binding, port mapping |
| **Network > DDNS** | `/network/ddns` | DynDNS / No-IP / etc. |
| **Network > Backup** | `/network/backup` | Link failover (prioridades WAN/Celular, intervalo de detección) |
| **Network > VPN** | `/network/vpn` | OpenVPN, IPsec, L2TP, PPTP, WireGuard, certificados |
| **Platform** | `/platform` | Conexión a nube (Development Platform / DeviceHub v2) con auto-provision |
| **System > Settings** | `/system/setting` | General (hostname, puertos Web/consola, acceso remoto, certificados HTTPS), hora/NTP, NFC |
| **System > User** | `/system/user` | Contraseña, permisos de usuario, **API Key management** |
| **System > Service** | `/system/serve` | SMTP, grupos de e-mail, grupos SMS/teléfono |
| **System > Maintenance** | `/system/maintenance` | Ping/Traceroute/Tcpdump/QXDM, tareas programadas, backup/restauración, firmware, reinicio |
| **System > Log** | `/system/log` | Visor y exportación de logs |
| **System > SNMP** | `/system/snmp` | SNMP agent, MIB, VACM, traps, descarga MIB |
| **System > Events** | `/system/events` | Lista de eventos, reglas de notificación (e-mail/SMS) |
| **App > Python** | `/app/python` | Python SDK, gestor de apps, instalación/desinstalación de paquetes |
| **App > Node-RED** | `/app/nodered` | Node-RED: enable/config, exportación de flows, upgrade de plugins |

Notas de operación:

- Muchas páginas usan **Apply** para enviar el CGI SET; algunas confirman primero.
- **Dashboard** es la única página que lee `yruo_status:dashboard` (60+ campos → 5 tarjetas).
- **Data Services** usa REST `/api/*`; **Network/System/Platform/App** usa CGI `POST /cgi`.
- El NS embebido (estilo ChirpStack) se configura desde `Data Services > Equipment Data > LoRaWAN Configuration` — perfiles, dispositivos (OTAA/ABP), multicast, FUOTA. La decodificación vive en la **Data Parsing Library**.

---

## Navegación

| Sección | Enlace |
| ------- | ------ |
| Guía de integración por API (HTTP completo) | [API-GATEWAY.md](./API-GATEWAY.md) |
| Enrutador de capacidades para agentes de IA | [llms.txt](./llms.txt) |
| Apéndice A — endpoints, errCodes y mapa core/base | [APENDICE-A.md](./APENDICE-A.md) |
| Historial de actualizaciones | [HISTORIAL-ACTUALIZACIONES.md](./HISTORIAL-ACTUALIZACIONES.md) |
| PDFs oficiales del fabricante | [docs/](./docs/) |
| Material original del fabricante (EN) | [docs/llms/](./docs/llms/) |
| MILESIGHT — índice de plataformas | [../README.md](../README.md) |
| Índice de marcas | [../../README.md](../../README.md) |
