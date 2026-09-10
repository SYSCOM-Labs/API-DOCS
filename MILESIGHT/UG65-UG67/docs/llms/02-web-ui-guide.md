# UG65 Web GUI Guide

The UG65 Web UI is a jQuery + Bootstrap + YS.UI hash-routed SPA. Access via `http://<gateway-ip>`; login via the CGI `user.login`. Menu (132 entries incl. hidden; 80 visible pages), by section:

| Section (`#` route) | Pages | Function |
|---|---|---|
| **Status** | `#status/summary` (Overview), `#status/network`, `#status/cellular`, `#status/wlan`, `#status/vpn`, `#status/router`, `#status/host`, `#status/gps` | Live state: system info, network, cellular (if variant), wireless, VPN, routing, host, GPS |
| **Packet Forward** | `#packetforward/general`, `/radios`, `/advanced`, `/custom`, `/traffic` | Forward UDP packets to LoRaWAN network servers; configure radios and custom forward rules; live traffic |
| **Network Server** | `#networkserver/generalsetting`, `/applications`, `/payloadcodecs`, `/profiles`, `/device`, `/fuota`, `/multicast`, `/gateways`, `/packets` | Embedded ChirpStack NS: applications, codecs, device profiles/service profiles, devices, FUOTA, multicast groups, gateway fleet, packets |
| **Protocol** | `#protocol/bacnet/server`, `/bacnet/object`, `/modbus/server`, `/modbus/object` | BACnet server + objects, Modbus server + objects (read/write, add/del) |
| **Network** | `#network/interfaces`, `/firewall`, `/dhcp/server`, `/dhcp/relay`, `/ddns/ddns`, `/backup`, `/vpn`, `/proxy/settings`, QoS, routing | Network config, firewall (ACL/DMZ/MAC binding), DHCP/DHCP relay, DDNS, link failover, VPN, proxy, QoS, static/dynamic routing |
| **System** | `#system/setting`, `/user` (incl. **HTTP API** account tab), `/aaa`, `/snmp`, `/remote`, `/events` | General/time, Web user + HTTP API account, AAA (RADIUS), SNMP, remote access, events/notifications |
| **Maintenance** | `#maintenance/tools`, `/log`, `/upgrade/upgrade`, `/backup/backup`, `/reboot/reboot`, `/schedule/schedule` | Ping/traceroute/etc., logs, firmware upgrade, config backup/restore, reboot, scheduled tasks |
| **App** | Python SDK, Node-RED | Enable/runs apps on the gateway |
| **Industrial** (variant) | `#industrial/io`, `/serialport`, `/gps`, `/modbus`, `/modbusmaster`, `/bluetooth` | IO/serial/GPS/Modbus master — shown only on UG6X industrial variants |

Special features guests will hit:

- **HTTP API account** (`System > User > HTTP API`): a dedicated account type for scripted/API access. Type `1` = Synchronize (shares Web login) / `2` = Separate (own username/password ≤31, `strict_password` 5-31 with letter+digit+ASCII special). Save sends CGI `add`/`set`/`delete` on `yruo_usermanagement:api_user_list`. A password-conversion tool (Advanced) encrypts a raw password with AES-CBC and shows the ciphertext.
- **Overview page** shows the UPS/battery status for the UG65-B variant.
- **Menu gating** by PN: e.g. `pn:["cellular"]` only on cellular models; `disable:["63"]` hides pages on UG63. Industrial pages only on industrial variants.