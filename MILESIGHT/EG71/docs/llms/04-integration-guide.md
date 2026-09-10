# EG71 Integration Guide

## Connect an end device (sensor / meter) and see its data

1. In the **Data Parsing Library** pick or import a codec for the sensor model, or create a custom codec (codec JSON: define each field's `value_type`, length, unit, scale; BOOL/ENUM/TEXT, bytes; downlink via `raw_downlink`).
2. In **Data Services > Equipment Data > Access Network** make sure the matching access network exists: LoRaWAN, BACnet IP/MS-TP, Modbus TCP/RTU/RTU-over-TCP, KNX TP. (RS485 baud/parity live in **Network > Interfaces > RS485**.)
3. Add the device (manual add, scan, or batch import). Protocol devices can then auto-generate their objects from the codec/protocol profile.
4. Open the device → object list; enable and optionally linear-scale (`gradient`/`offset`) each object, set its BACnet/Modbus/KNX instance, unit, poll interval.
5. Watch live values in **Data Flow**, or write/read an object with the object-row actions.

## BACnet/IP field devices — prerequisites

Five conditions, verified end-to-end on firmware 71.0.0.3 (discovery → live values → MQTT forwarding):

1. **Access network first.** Create the BACnet IP access network and bind it to the interface that faces the devices. Its `udpPort` is bound by the gateway itself — if another service on the gateway already holds that port (the built-in BACnet server uses 47808 by default), the access network cannot come up; give each BACnet IP access network its own free port.
2. **Same broadcast domain.** Discovery rides on BACnet/IP broadcasts (Who-Is / I-Am) inside the bound interface's L2 segment; after discovery the gateway polls each device by **unicast** at the address learned from its I-Am. There is no per-device IP/port setting — the gateway learns each device's address from its responses.
3. **Device side.** The device must answer broadcasts on the access network's UDP port and run on a **separate host** from the gateway. A BACnet simulator bound to a single specific address, or running on the gateway host itself (including in its Docker), will not be discovered — bind it to all interfaces (`0.0.0.0:<port>`) on its own host.
4. **Objects & polling.** After adding the device, create its objects and set the poll `interval` (default 60 s). `currentValue` refreshes once per cycle — the object list shows the update counter so you can confirm values are live.
5. **Deleting is destructive.** Deleting an access network deletes every device under it **together with all their objects** — there is no undo.

## Forward data to a cloud / BMS

- **MQTT**: create an MQTT forwarding rule (broker host/port, client ID, user/pass, keepalive), then map devices/objects into the payload. The gateway publishes value updates and acknowledges writes. TLS and client certificates are supported. (Scripting the rule over the API? Read §3.4.1 of the API guide first — the stored topic schema differs from the Web UI form.)
- **HTTP**: create an HTTP forwarding rule with one or more target URLs, custom headers, and TLS settings. Choose the JSON body format the platform expects (enable "customized data format" where needed).
- **BACnet/IP or Modbus TCP**: enable the built-in server, pick the interface, then expose selected device objects as BACnet objects / Modbus registers. BACnet BBMD (broadcast management) is configurable for routed networks.
- **Platform (cloud)**: connect to Milesight Development Platform or DeviceHub v2 from **Platform** page, or to a third-party NS (TTN, ChirpStack, Actility…) by disabling the embedded NS and pointing the gateway at it as a packet forwarder.

## Connect to a BMS (Niagara / Tridium and similar)

- **BMS reads from the gateway** — the usual supervision direction. Enable the built-in **BACnet/IP server** (Data Services: interface, UDP port, BACnet device instance & name), then expose the device objects you need. A Niagara JACE/Supervisor discovers the gateway with its standard BACnet/IP driver and reads those objects like any other BACnet device. Enable **BBMD** only when the BMS and the gateway are on different routed networks. For a Modbus-centric BMS, use the built-in **Modbus TCP server** the same way.
- **Field bus into the BMS via the gateway** — BACnet/Modbus/KNX field devices are collected by the gateway (see the BACnet/IP prerequisites above), then forwarded over MQTT/HTTP to the head end; control writes flow back through object writes.
- Objects follow the standard BACnet object model (Analog Value / Analog Input / Binary I/O, …), so no proprietary mapping is needed on the BMS side. BACnet BTL certification was still pending at datasheet time — see the product overview.

## Downlink / control

- Write a device object value (write/relay/queue) from the Web UI or API (LoRaWAN downlink queue via `POST /api/urdevices/:devEUI/queue`; BACnet/Modbus writes via `POST /api/dsdevices/objects/read-write`).
- Multicast: schedule `POST /api/multicast-groups/:id/queue` for Class-C groups.
- FUOTA: create firmware-upgrade tasks for supported device models from `Equipment Data > LoRaWAN Configuration > FUOTA`.

## Edge computing

- **Node-RED**: enable from **App > Node-RED**, then open `/node-red` on the gateway. Flows can consume and re-publish the forwarded JSON.
- **Python SDK**: install from **App > Python**, write scripts (e.g. poll a Modbus register and push to a webhook).
- **Docker**: EG71 supports Docker containers for custom services on the gateway.

## Networking & remote access

- Set WAN (DHCP/static/PPPoE), LAN subnet + DHCP server, Wi-Fi AP/client, and bridge mode in **Network > Interfaces**.
- For resilient uplinks set **Link failover** (WAN + cellular + priorities).
- Open a **VPN** (OpenVPN client/server, IPsec, WireGuard, L2TP, PPTP) so a remote NOC can reach the gateway.
- Restrict access via **Firewall** (security level, ACL, DMZ, port mapping) and SNMP communities/users.
- Alert on events (link down, cellular outage, device offline) with **System > Events** notification rules delivered to e-mail/SMS groups.

## Platform & fleet

- Register the gateway in a fleet so a central Milesight/DeviceHub console can manage many gateways (fleet = one set of profiles and codecs pushed to members).
- Manage users (admin read-write / read-only), API keys, and enable remote service only when needed.