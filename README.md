# SYSCOM API Docs

Documentación técnica de las APIs de integración para las marcas distribuidas por **Syscom**. Recurso público para desarrolladores e integradores.

## Marcas disponibles


| Marca                              | Descripción                                                            | Estado       |
| ---------------------------------- | ---------------------------------------------------------------------- | ------------ |
| [HIKVISION](./HIKVISION/README.md) | Integraciones oficiales para las plataformas y APIs de Hikvision | ✅ Disponible |
| [HIKROBOT](./HIKROBOT/README.md) | Robótica y logística industrial: API REST del RCS para flotas de robots AMR/AGV | ✅ Disponible |
| [RUIJIE](./RUIJIE/README.md) | Infraestructura de red (Ruijie/Reyee): API REST de Ruijie Cloud para gestión de dispositivos, WiFi, vouchers y monitoreo | ✅ Disponible |


> Próximamente se agregarán más marcas y plataformas.

## Accesos directos

| Sección | Enlace |
| ------- | ------ |
| HIKVISION — índice de plataformas | [HIKVISION/README.md](./HIKVISION/README.md) |
| Hik-Connect Team — Documentación OpenAPI (ES) | [HikConnect-Team/README.md](./HIKVISION/HikConnect-Team/README.md) |
| Apéndice A — códigos de error y diccionarios | [APENDICE-A.md](./HIKVISION/HikConnect-Team/APENDICE-A.md) |
| Historial de actualizaciones | [HISTORIAL-ACTUALIZACIONES.md](./HIKVISION/HikConnect-Team/HISTORIAL-ACTUALIZACIONES.md) |
| Demo — Video en vivo (EZUIKit) | [demos/video/README.md](./HIKVISION/HikConnect-Team/demos/video/README.md) |
| Demo — Hikauto (Fleet API Playground) | [demos/Hikauto/README.md](./HIKVISION/HikConnect-Team/demos/Hikauto/README.md) |
| Skill para agentes (ClawHub) | [HikConnect-Team-Skill/README.md](./HIKVISION/HikConnect-Team-Skill/README.md) |
| Hik DeviceGateway — Documentación API REST (ES) | [HikGateway/README.md](./HIKVISION/HikGateway/README.md) |
| HikGateway — Apéndice A (objetos y códigos de error) | [APENDICE-A.md](./HIKVISION/HikGateway/APENDICE-A.md) |
| HikGateway — Historial de actualizaciones | [HISTORIAL-ACTUALIZACIONES.md](./HIKVISION/HikGateway/HISTORIAL-ACTUALIZACIONES.md) |
| Demo — Consola de integración (HikGateway) | [demos/gateway/README.md](./HIKVISION/HikGateway/demos/gateway/README.md) |
| HIKROBOT — índice de plataformas | [HIKROBOT/README.md](./HIKROBOT/README.md) |
| RCS (Robot Control System) — API REST de logística (ES) | [RCS-Robot-Control-System/README.md](./HIKROBOT/RCS-Robot-Control-System/README.md) |
| RCS — Apéndice A (diccionarios de datos) | [APENDICE-A.md](./HIKROBOT/RCS-Robot-Control-System/APENDICE-A.md) |
| RUIJIE — índice de plataformas | [RUIJIE/README.md](./RUIJIE/README.md) |
| Ruijie Cloud — Documentación API REST (ES) | [Ruijie-Cloud/README.md](./RUIJIE/Ruijie-Cloud/README.md) |
| Ruijie Cloud — Apéndice A (endpoints, códigos y glosario) | [APENDICE-A.md](./RUIJIE/Ruijie-Cloud/APENDICE-A.md) |

## Estructura del repositorio

```
API-DOCS/
├── HIKVISION/
│   ├── README.md                       # Índice de plataformas de la marca
│   ├── HikConnect-Team/                # HikConnect for Teams OpenAPI V2.15.0
│   │   ├── README.md                   # Documentación completa de la API (ES)
│   │   ├── APENDICE-A.md               # Códigos de error, diccionarios de datos
│   │   ├── HISTORIAL-ACTUALIZACIONES.md
│   │   ├── docs/                       # PDF oficial del fabricante
│   │   └── demos/
│   │       ├── video/                  # Demo interactivo de video en vivo
│   │       └── Hikauto/                # Fleet API Playground (monitoreo a bordo)
│   ├── HikConnect-Team-Skill/          # Skill de ClawHub para agentes
│   └── HikGateway/                     # Hik DeviceGateway — API REST ISAPI V1.8.0
│       ├── README.md                   # Documentación completa de la API (ES)
│       ├── APENDICE-A.md               # Diccionarios de datos y códigos de error
│       ├── HISTORIAL-ACTUALIZACIONES.md
│       ├── docs/                       # PDF oficial del fabricante + colección Postman
│       └── demos/gateway/              # Consola de integración (dispositivos, API, acceso, video)
├── HIKROBOT/
│   ├── README.md                       # Índice de plataformas de la marca
│   └── RCS-Robot-Control-System/       # API REST del RCS (robots AMR/AGV)
│       ├── README.md                   # Documentación completa de la API (ES)
│       ├── APENDICE-A.md               # Diccionarios de datos y tablas de referencia
│       └── HISTORIAL-ACTUALIZACIONES.md
└── RUIJIE/
    ├── README.md                       # Índice de plataformas de la marca
    └── Ruijie-Cloud/                   # API REST de Ruijie Cloud (red Ruijie/Reyee)
        ├── README.md                   # Documentación completa de la API (ES)
        ├── APENDICE-A.md               # Endpoints, códigos, cifrados WiFi y glosario
        └── HISTORIAL-ACTUALIZACIONES.md
```

## ¿Cómo usar esta documentación?

Cada carpeta de marca contiene:

- **README principal** con toda la documentación de la API en español
- **Apéndices** con diccionarios de datos y códigos de error
- **Demos** con código de ejemplo funcional

## Contacto

Para soporte técnico con integraciones, contacta al equipo de SYSCOM.