# Playback Pádel

Panel local para sacar la última jugada de una cancha. Al pulsar, lee la hora del NVR, retrocede 15, 30, 45 o 60 segundos y descarga ese tramo por ISAPI.

## Arranque

Hace falta Node 22.12 o más reciente. `ffmpeg` solo entra si el grabador no entrega un MP4.

```sh
cd HIKVISION/HikISAPI/demos/PlaybackPadel
node src/server.js
```

Abre http://127.0.0.1:8787. Un clon no trae credenciales: el panel abre con una cancha vacía. En ajustes se ponen la IP, el puerto, el usuario y la contraseña del grabador, el retroceso y el canal de cada cancha. **Guardar** escribe `data/config.json` solo en esa máquina. **Probar** lista los canales reales. Una contraseña en blanco al guardar no borra la que ya está.

`data/` (configuración y clips, los últimos 20) está en `.gitignore`. `config.example.json` solo muestra la forma del archivo, sin datos. No hace falta copiarlo para usar el panel.

Para abrirlo en la red local, activa **Visible en la red**, pon un código y reinicia el proceso. El panel pasa a escuchar en `0.0.0.0`.

## Botón físico

El botón de la página y un pulsador futuro usan la misma ruta:

```sh
curl -X POST http://127.0.0.1:8787/api/courts/cancha-1/clip
```

La respuesta trae `jobId`. Consulta `GET /api/jobs/<jobId>` hasta que `phase` sea `ready`; `clip.url` es el MP4. Si el panel está en la red, manda la cabecera `X-Access-Code`.

El identificador de la cancha es el de ajustes (`cancha-1`, `cancha-2`, …). Una segunda pulsación mientras ese clip baja espera la misma descarga.
