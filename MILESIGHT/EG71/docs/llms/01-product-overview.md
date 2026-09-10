# EG71 Product Overview

EG71 is Milesight's **building IoT gateway**: an indoor LoRaWAN gateway in a DIN-rail metal enclosure that adds BAS fieldbus and I/O to the standard gateway feature set, targeting BMS integrators and retrofits.

## Hardware

| Item | Specification |
|---|---|
| CPU | NXP i.MX8M Mini, quad-core 1.5 GHz 64-bit ARM Cortex-A53 |
| Memory | 2 GB DDR4 RAM; 32 GB eMMC; micro SD slot |
| LoRaWAN radio | 8-channel LoRaWAN concentrator; half-duplex; max TX 27 dBm; RX sensitivity −140 dBm @292 bps |
| Frequency bands | CN470, IN865, EU868, RU864, US915, AU915, KR920, AS923-1/2/3/4 |
| LoRaWAN protocol | V1.0 & V1.0.2, Class A/B/C |
| Device capacity | ~2,000 end devices (per 10-minute uplink interval) |
| Ethernet | 2 × GbE RJ45, WAN/LAN switchable; 802.3af PoE PD on ETH1 |
| Wi-Fi | 802.11 b/g/n 2.4 GHz, AP or client |
| Cellular (optional) | 4G LTE CAT1 |
| RS485 | 2 ports (up to 128 devices each), isolated, 120 Ω termination sw-app |
| KNX | 1 × KNX/TP1, up to 63 devices |
| M-Bus | 1 × (under development) |
| Universal inputs | 8; each 0-10 V / 4-20 mA / PT1000 / Ni1000 / NTC / resistance / dry contact |
| Digital inputs | 4, dry contact, pulse counting |
| Relay outputs | 3 × AC 230 V / 3 A |
| Analog outputs | 4 × 0-10 V / 4-20 mA |
| Other | NFC, 1.3" OLED (128×64), Type-C console, micro SD, RTC (72 h supercap) |
| Power | 24 V AC/DC terminal; 802.3af PoE; USB-C 5 V/3 A; typical 8.2 W / max 11.24 W |
| Enclosure | Metal, IP30, DIN-rail or wall mount |
| Temperature | −40 °C ~ +60 °C; 0% ~ 95% RH non-condensing |

> ⚠️ USB powering disables M-Bus and universal inputs.

## Software / management

- **Embedded LoRaWAN Network Server** with device/profiles/app/multicast/FUOTA management, Web UI and API.
- **Data forwarding**: MQTT(S), HTTP(S), BACnet/IP, Modbus TCP, Modbus RTU over TCP; JSON downlink via API.
- **Data acquisition**: Modbus RTU, BACnet MS/TP, KNX/TP over RS485/KNX; BACnet/IP and Modbus TCP/IP on Ethernet/Wi-Fi; LoRaWAN sensors.
- **Edge extensibility**: Node-RED, Python SDK, Docker.
- **Network services**: PPPoE, DHCP, DDNS, SNMP v1/v2c/v3, HTTP(S)/SSH/Telnet server toggles, NTP, event notification (email/SMS).
- **VPN**: OpenVPN (client/server), IPsec, L2TP, PPTP, WireGuard, link failover.
- **Management surfaces**: Web GUI (React), HTTP API (dual CGI + REST), SNMP, SSH.

## Models & regions

Ordering code encodes the radio region (PN is 24 chars, position 18 selects `nsRegion`): e.g. `L08GL*` family. Channel-plan options shown in the Web UI derive from the region code.

## Certifications

CE, CE (RED), FCC. KNX and BTL certifications were not yet granted at datasheet time.