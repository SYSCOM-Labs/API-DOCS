# Hik-Connect Team Skill

> Skill oficial publicado en ClawHub que envuelve la OpenAPI de **Hik-Connect for Teams (HCT)**.

**Repositorio del skill:** [https://clawhub.ai/hikconnectteam/hik-connect-team-skill](https://clawhub.ai/hikconnectteam/hik-connect-team-skill)

---

## ¿Qué es?

Integración de habilidades para desarrolladores de Hik-Connect for Teams, basada en la API OpenAPI de HCT. Permite a un agente automatizar operaciones sobre la plataforma — gestión de dispositivos, control de acceso, captura de imagen, video en vivo y alarmas — sin necesidad de escribir un cliente HTTP propio desde cero.

## ¿Para quién es?

Desarrolladores e integradores que trabajen con sistemas Hik-Connect for Teams y necesiten automatizar operaciones de mantenimiento, monitoreo de seguridad e integración empresarial mediante un agente. Requiere haber gestionado previamente las credenciales de la API (AppKey y SecretKey).

## Capacidades

El skill expone cinco módulos especializados:

| Módulo | Operaciones |
| ------ | ----------- |
| **Gestión de recursos** | Descubrimiento de dispositivos, adquisición de detalles y enumeración de canales |
| **Control de acceso** | Apertura y cierre remoto de puertas |
| **Captura de dispositivos** | Capturas en tiempo real y obtención de URLs de imágenes |
| **Streaming de video** | Acceso a flujos de video en vivo |
| **Notificaciones de alarma** | Suscripción a eventos y gestión de webhooks |

## Instalación

```bash
openclaw skills install hik-connect-team-skill
```

## Configuración

Las credenciales de la API (`AppKey` y `SecretKey`) se proporcionan al skill mediante una de estas opciones:

- Variables de entorno
- Archivo de configuración

## Requisitos

- **Python 3.8+**
- Dependencias: `requests`, `tabulate`, `pycryptodome`, `Pillow`

---

## Recursos adicionales

- **Índice de la marca HIKVISION:** [HIKVISION — plataformas](../README.md)
- **OpenAPI de la plataforma:** [Hik-Connect Team — Documentación](../HikConnect-Team/README.md)
- **Apéndice A (códigos de error y diccionarios):** [APENDICE-A.md](../HikConnect-Team/APENDICE-A.md)
- **Demo — Video en vivo (EZUIKit):** [demos/video](../HikConnect-Team/demos/video/README.md)
- **Demo — Hikauto (Fleet API Playground):** [demos/Hikauto](../HikConnect-Team/demos/Hikauto/README.md)
- **Página del skill en ClawHub:** [clawhub.ai/hikconnectteam/hik-connect-team-skill](https://clawhub.ai/hikconnectteam/hik-connect-team-skill)
