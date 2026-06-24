# SYSCOM API Docs

Documentación técnica de las APIs de integración para las marcas distribuidas por **Syscom**. Recurso público para desarrolladores e integradores.

## Marcas disponibles


| Marca                              | Descripción                                                            | Estado       |
| ---------------------------------- | ---------------------------------------------------------------------- | ------------ |
| [HIKVISION](./HIKVISION/README.md) | Integraciones oficiales para las plataformas y APIs de Hikvision | ✅ Disponible |


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

## Estructura del repositorio

```
API-DOCS/
└── HIKVISION/
    ├── README.md                       # Índice de plataformas de la marca
    ├── HikConnect-Team/                # HikConnect for Teams OpenAPI V2.15.0
    │   ├── README.md                   # Documentación completa de la API (ES)
    │   ├── APENDICE-A.md               # Códigos de error, diccionarios de datos
    │   ├── HISTORIAL-ACTUALIZACIONES.md
    │   ├── docs/                       # PDF oficial del fabricante
    │   └── demos/
    │       ├── video/                  # Demo interactivo de video en vivo
    │       └── Hikauto/                # Fleet API Playground (monitoreo a bordo)
    └── HikConnect-Team-Skill/          # Skill de ClawHub para agentes
```

## ¿Cómo usar esta documentación?

Cada carpeta de marca contiene:

- **README principal** con toda la documentación de la API en español
- **Apéndices** con diccionarios de datos y códigos de error
- **Demos** con código de ejemplo funcional

## Contacto

Para soporte técnico con integraciones, contacta al equipo de SYSCOM.