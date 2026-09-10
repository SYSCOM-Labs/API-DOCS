# EG71 Web GUI Guide

The EG71 Web UI is a React + Ant Design SPA. Access via `http://<gateway-ip>` (admin login). Menu structure:

| Menu | Routes | Function |
|---|---|---|
| **Status** | `/dashboard` | Dashboard state: gateway info, access device counts, data-forwarding counts, real-time link status (Ethernet/WLAN/VPN/RS485/IO/KNX/LoRaWAN/Cellular) as expandable drawers |
| **Data Services > Equipment Data** | `/data-services/equipment-data` | Device list (LoRaWAN/BACnet/Modbus/KNX + IO), scan add, batch import/export, device objects, access networks, LoRaWAN config (profiles/multicast/FUOTA) |
| **Data Services > Data Forwarding** | `/data-services/data-forwarding` | Forwarding rules to MQTT/HTTP/BACnet/Modbus, forwarding device/object mapping, TLS certificates, BBMD |
| **Data Services > Data Parsing Library** | `/data-services/data-parsing-library` | Built-in and custom payload codecs (decode/encode), import/export/test/upgrade |
| **Data Services > Data Flow** | `/data-services/data-flow` | Read-only real-time data flow viewer (RX/TX/join/errors per device) |
| **Network > Interfaces** | `/network/interfaces` | Ethernet (WAN/LAN/bridge/port/DHCP server), Wireless, Cellular, LoRaWAN (Radio/advanced/spectral scan), RS485, Loopback |
| **Network > Firewall** | `/network/firewall` | Security level, ACL, DMZ, MAC binding, port mapping |
| **Network > DDNS** | `/network/ddns` | DynDNS / No-IP / etc. |
| **Network > Backup** | `/network/backup` | Link failover (WAN/Cellular/backup priorities, detect interval) |
| **Network > VPN** | `/network/vpn` | OpenVPN client/server, IPsec, L2TP, PPTP, WireGuard, certificates |
| **Platform** | `/platform` | Cloud platform connection (Development Platform / DeviceHub v2) with auto-provision, connection status |
| **System > Settings** | `/system/setting` | General (hostname, Web/console ports, remote access, HTTPS certificates), time/NTP, NFC |
| **System > User** | `/system/user` | Password, user permissions, **API Key management** (create/revoke API keys) |
| **System > Service** | `/system/serve` | SMTP, e-mail groups, SMS/phone alert groups |
| **System > Maintenance** | `/system/maintenance` | Ping/Traceroute/Tcpdump/QXDM, scheduled tasks, config backup/restore, firmware upgrade, reboot |
| **System > Log** | `/system/log` | System log viewer/export |
| **System > SNMP** | `/system/snmp` | SNMP agent, MIB view, VACM, traps, MIB download |
| **System > Events** | `/system/events` | Event list, event-notification rules (e-mail/SMS) |
| **App > Python** | `/app/python` | Python SDK status, app manager, app pack install/uninstall |
| **App > Node-RED** | `/app/nodered` | Node-RED enable/config, flow export, plugin upgrade |

## Built-in LoRaWAN Network Server

On top of packet forwarding, EG71 embeds a chirpstack-based NS. Configure **profiles**, **devices (OTAA/ABP)**, **multicast**, **FUOTA** from `Data Services > Equipment Data > LoRaWAN Configuration`. Payload decoding is via the Data Parsing Library (codec JSON: `value_type`, `length`, `unit`, `scale`; max `value_type` length 242).

## Operation notes

- Many pages use **Apply** to push CGI SET; be aware some flows pop a confirm dialog before applying.
- The **Dashboard** is the only page that reads the CGI `yruo_status:dashboard` response (60+ fields drive 5 cards).
- **Data Services pages** use REST `/api/*`; **Network/System/Platform/App pages** use CGI `POST /cgi`.
- Set **hostname**, **time**, **SNMP**, **event notifications**, **VPN** and **link failover** from their pages; dashboard reflects them.