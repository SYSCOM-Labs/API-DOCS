# UG65 Product Overview

UG65 is Milesight's **IP65 indoor LoRaWAN gateway**, a standard building-block of LoRaWAN networks: it embeds a ChirpStack-based LoRaWAN Network Server, forwards packets to several destination servers, and exposes BACnet/Modbus servers for BMS integration. It is the "standard indoor" gateway in the Milesight family (UG63 V2 → UG56 → UG65 → UG67 → SG50), the highest-volume model.

## Hardware

| Item | Specification |
|---|---|
| CPU | NXP i.MX8M Nano, quad-core 1.5 GHz 64-bit ARM Cortex-A53 |
| Memory | 512 MB DDR4 RAM; 8 GB eMMC |
| LoRaWAN radio | 8-channel LoRaWAN concentrator; **half/full-duplex**; LBT; max TX 27 dBm; RX −140 dBm @292 bps |
| Frequency bands | CN470, IN865, EU868, RU864, US915, AU915, KR920, AS923-1/2/3/4 |
| LoRaWAN protocol | V1.0 & V1.0.2, Class A/B/C |
| Ethernet | 1 × GbE RJ45 WAN, 802.3af PoE PD |
| Wi-Fi | 802.11 b/g/n 2.4 GHz, AP or client, internal antenna |
| Cellular (optional) | 4G LTE, mini SIM |
| LoRa antenna | 1 × external, 50 Ω N-Female connector |
| Interfaces | USB Type-C (power/console), RST button, DC jack (2.1×5.5 mm), status LEDs (Power/Status/LoRa/Wi-Fi/LTE/ETH) |
| Power | DC 9-24 V connector; 802.3af PoE; USB-C 5 V/1 A; typical 2.9 W, max 4.2 W |
| Enclosure | IP65, PC+ABS (UL94 V0), 180×110×55.5 mm, 548 g; desktop/wall mount |
| Temperature | −40 °C ~ +70 °C (cellular performance reduced above 60 °C) |
| Battery backup (UG65-B) | optional UPS battery module; charge/power status visible in Overview |

## Software / management

- **Embedded LoRaWAN Network Server** with applications, devices (OTAA/ABP), payload codecs, profiles, FUOTA, multicast, gateway fleet, packets viewer.
- **Packet Forward**: forward UDP to multiple network servers (general), plus configurable radios.
- **Protocol servers**: BACnet/IP + BACnet/SC, BACnet MS/TP (RS485 not present on UG65 standard), Modbus TCP / Modbus RTU server for object read-write.
- **Integration**: MQTT(S), HTTP(S), BACnet/IP, BACnet/SC, Modbus TCP, Modbus RTU over TCP.
- **Network services**: PPPoE, DHCP, DDNS, SNMP v1/v2c/v3, HTTP(S), DNS, ARP, SNTP, Telnet, SSH, QoS, routing, proxy.
- **VPN**: OpenVPN, IPsec, PPTP, L2TP, GRE, DMVPN, WireGuard.
- **Edge apps**: Node-RED, Python SDK.
- **UI**: one Web GUI for all modules; pages are jQuery + YS.UI hash-routed; HTTP API account (`System > User > HTTP API`) for scripted/browser-less access.

## Models & regions

Ordering code encodes the LoRa region and cellular variant (e.g. `UG65-L01GL-868M` means CAT1 cellular + EU868; `UG65-868M` = no cellular). North-America datasheet covers the US915 variant. Region also controls the channel-plan drop-down shown for the radio config.

## Certifications

CE, FCC (per datasheet tables); IP65; wide-temperature tested. FCC/CE listing pages per model.