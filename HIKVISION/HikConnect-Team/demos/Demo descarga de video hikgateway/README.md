# Demo Bodycams — Hik Device Gateway (ejecución en terminal)

Consola interactiva en **C# (.NET 9)** para listar dispositivos, buscar grabaciones y descargar video crudo (IMKH) desde un **Hik Device Gateway** usando la API unificada ISAPI con **HTTP Digest Authentication** y mensajes **JSON**.

> **Importante:** toda la experiencia de este demo ocurre en la **terminal / consola**. No hay interfaz gráfica web ni ventana Windows Forms. Verás menús, listas numeradas, progreso de descarga y mensajes de estado directamente en la línea de comandos.

Destino en el repositorio de documentación:

```text
API-DOCS/HIKVISION/HikConnect-Team/demos/Demo descarga de video hikgateway/
```

---

## Qué hace

1. Guarda la configuración del Gateway en un archivo JSON local.
2. Lista dispositivos online enrolados en el Gateway (`deviceList`).
3. Consulta capacidades y busca grabaciones (`ContentMgmt/search`).
4. Descarga el segmento seleccionado (`ContentMgmt/download`) a una carpeta configurable.
5. Nombra el archivo con el rango de tiempo del video + `recuperado` + fecha/hora de descarga.

Compatible sobre todo con **body cameras** conectadas por ISUP/ehome al Gateway. También puede usarse con otros dispositivos de video que expongan búsqueda de grabaciones (p. ej. MDVR), según capacidades del equipo.

---

## Requisitos

| Requisito | Detalle |
|-----------|---------|
| SDK .NET | **.NET 9** (o superior compatible con `net9.0`) |
| Red | Acceso HTTP al Hik Device Gateway |
| Credenciales | Usuario/password del Gateway (Digest) |
| Dispositivo | Bodycam (u otro encoding device) online en el Gateway |

Comprobar el SDK:

```powershell
dotnet --version
```

---

## Cómo iniciar el proyecto

Desde la carpeta del demo:

```powershell
cd "Demo descarga de video hikgateway"
dotnet restore
dotnet run -c Release
```

La primera vez puedes copiar la plantilla de configuración:

```powershell
copy gateway-config.example.json gateway-config.json
```

Luego edita `gateway-config.json` o usa la **opción 1** del menú para cargar host, usuario y password.

> `gateway-config.json` **no se versiona** (contiene secretos). Solo se publica `gateway-config.example.json`.

---

## Qué verás en la terminal

Al arrancar aparece un encabezado con el estado actual y un menú:

```text
════════════════════════════════════════════════════════════════════════
              Hik Device Gateway — Videos
════════════════════════════════════════════════════════════════════════

  Host      http://127.0.0.1:80
  Usuario   admin
  Password  ********
  Descargas C:\...\descargas
────────────────────────────────────────────────────────────────────────

  [1]  Configurar Gateway (host, usuario, password)
  [2]  Carpeta de descarga
  [3]  Buscar y descargar videos
  [4]  Eliminar configuración guardada
  [5]  Abrir carpeta de descargas
  [0]  Salir

  Opción:
```

Todo el flujo (dispositivos, rangos de fecha, lista de videos, progreso en MB) se imprime en la misma consola.

---

## Cómo usarlo

### 1. Configurar el Gateway

Menú → **[1]**

| Campo | Ejemplo |
|-------|---------|
| Host | `http://IP_O_DNS_DEL_GATEWAY` (sin slash final) |
| Usuario | `admin` |
| Password | (se oculta con `*`) |
| Días de búsqueda por defecto | `30` |
| Máximo de resultados | `5` (hasta 40) |

La configuración se guarda en `gateway-config.json` junto al directorio de trabajo.

### 2. Carpeta de descarga

Menú → **[2]**

Define dónde se guardan los `.mp4` crudos. Por defecto: carpeta `descargas/` relativa al proyecto.

### 3. Buscar y descargar videos

Menú → **[3]**

1. Se listan los dispositivos **online**.
2. Eliges el número del dispositivo (p. ej. la bodycam).
3. Eliges un **rango de fechas** con presets visuales (Hoy, 7 días, amplio, personalizado).  
   - **Enter** usa el rango amplio por defecto (evita perder videos por zona horaria UTC).
4. Se muestran las grabaciones encontradas (hora inicio/fin, tamaño, nombre).
5. Eliges el video y espera la descarga (puede tardar varios segundos/minutos según el tamaño y el enlace ISUP).

### 4. Otros

| Opción | Acción |
|--------|--------|
| **[4]** | Borra `gateway-config.json` (pide confirmación `SI`) |
| **[5]** | Abre el Explorador en la carpeta de descargas |
| **[0]** | Sale de la aplicación |

---

## Nombre de los archivos descargados

```text
{inicioUTC}_a_{finUTC}_recuperado_{fechaHoraLocalDescarga}.mp4
```

Ejemplo:

```text
20260731_181811_a_20260731_181847_recuperado_20260731_131520.mp4
```

| Parte | Significado |
|-------|-------------|
| `20260731_181811` | Inicio del segmento de video (UTC) |
| `a` | Separador “hasta” |
| `20260731_181847` | Fin del segmento (UTC) |
| `recuperado` | Leyenda fija |
| `20260731_131520` | Momento local en que se descargó |

El contenido suele ser contenedor propietario **IMKH** (no necesariamente un MP4 estándar reproducible al instante). Puede requerir remuxeo con FFmpeg (`-c copy`) o el Player SDK de Hikvision si el flujo viene cifrado.

---

## Estructura del proyecto

```text
Demo descarga de video hikgateway/
├── Program.cs                      # Menú y flujo interactivo
├── ConsoleUi.cs                    # Presentación en terminal
├── AppConfig.cs                    # Lectura/escritura de gateway-config.json
├── GatewayClient.cs                # Cliente ISAPI (Digest + JSON)
├── HikGatewayVideoDownloader.csproj
├── gateway-config.example.json     # Plantilla sin secretos
├── .gitignore
└── README.md
```

---

## Endpoints ISAPI usados

| Paso | Método | Ruta |
|------|--------|------|
| Listar dispositivos | `POST` | `/ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json` |
| Capacidades | `GET` | `/ISAPI/System/capabilities?devIndex={uuid}` |
| Tracks | `GET` | `/ISAPI/ContentMgmt/record/tracks?format=json&devIndex={uuid}` |
| Buscar grabaciones | `POST` | `/ISAPI/ContentMgmt/search?format=json&devIndex={uuid}` |
| URL por tiempo (opcional) | `POST` | `/ISAPI/System/streamMedia?format=json&devIndex={uuid}` |
| Descargar | `POST` | `/ISAPI/ContentMgmt/download?format=json&devIndex={uuid}` |

Autenticación: **HTTP Digest** (`CredentialCache` + `HttpClientHandler`).

Bodycams suelen aceptar el descriptor:

```text
recordType.meta.hikvision.com/AllEvent
```

---

## Notas operativas

- Si la descarga se corta unos bytes antes del `Content-Length` anunciado, el archivo normalmente **sigue siendo utilizable**; el Gateway cierra la conexión de forma prematura con frecuencia.
- Descargas grandes a través de un proxy nginx pueden devolver **502** por timeout; bodycams con clips pequeños suelen completar bien.
- No subas `gateway-config.json`, la carpeta `descargas/` ni archivos `.mp4` al repositorio.

---

## Licencia / uso

Demo interno SYSCOM Labs — Hikvision / HikConnect Team. Úsalo como referencia de integración con Hik Device Gateway; adáptalo a tu entorno y políticas de seguridad antes de producción.
