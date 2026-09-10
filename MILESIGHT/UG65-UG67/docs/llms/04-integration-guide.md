# UG65 Integration Guide

## Connect a LoRaWAN sensor and forward its data

1. In **Network Server > Payload Codecs** pick (or import) the decoder for the sensor model, or define one with the codec JSON editor.
2. **Network Server > Applications** → add an application; optionally add an **integration** (HTTP or MQTT) to push device events to your server.
3. **Network Server > Device** → register the sensor (OTAA or ABP), set its device-profile and the codec, and save.
4. **Status** or **Network Server > Packets** will show it joining and uplinking. Decoded values appear in your application/NS UI.
5. For more than one network, add destinations under **Packet Forward > General** — the gateway can forward to multiple UDP servers (e.g. embedded NS + external ChirpStack/TTN).

## Publish device data to a cloud / BMS

- **MQTT/HTTP integrations** per application: pick your broker or URL, set topic/headers, and the embedded NS pushes JSON events (`uplink`, `join`, `ack`, `error`, `status`, `location`) — your backend subscribes. Scripting the integration over the API? The stored schema is flat and has pitfalls (empty `uplinkTopic` publishes nothing) — read §3.3 of the API guide first.
- **BACnet/IP and BACnet/SC server**: from **Protocol > BACnet Server** create a server and map the device objects you want readable/writable; a BMS polls or subscribes (COV) to the gateway as a BACnet device. Note the direction: on the UG65 the gateway is the **BACnet server** (the BMS reads it) — unlike the EG71, the standard UG65 has no field-bus acquisition side, so there is no device-discovery flow.
- **Modbus server** likewise exposes values as Modbus registers (`Protocol > Modbus Server`). For RS485 Modbus RTU slaves on industrial variants use **Industrial > Modbus master/serial**.
- **Webhook-style HTTP(S) forwarding** of uplink payloads to arbitrary endpoints is also available in the packet forward destination configuration.

## Downlink / control

- Queue downlink from the Web UI (device → queue, or FUOTA for firmware).
- Class C groups: use **Network Server > Multicast** to broadcast to many receivers.
- REST downlink: `POST /api/urdevices/:devEUI/queue`.

## Network & remote management

- **Network > Interfaces** — WAN/LAN, DHCP, wireless client or AP, cellular (on LTE models).
- **Link failover** under Network > Backup to keep uplink alive over WAN/cellular.
- VPN (OpenVPN/IPsec/WireGuard/…) from **Network > VPN** for a tunnel back to the NOC.
- Restrict exposure with **Network > Firewall**, lock down SNMP (**System > SNMP**, v1/v2c/v3) and remote access (**System > Remote**).
- **System > Events** → notification rules (e-mail/SNMP) on system/cellular/network events.

## Fleet & scale

- Register several gateways in one **Gateway Fleet** so profiles and codecs push to all members.
- Firmware upgrades via **Maintenance > Upgrade** locally or over the fleet; scheduled tasks via **Maintenance > Schedule**.

## Edge apps

- **Node-RED** (App) and **Python SDK** (App) extend the gateway locally (e.g. parse payloads, write to serial/Modbus, expose REST).
- Industrial variants add IO/serial/Modbus-master so the gateway can drive field controllers too.