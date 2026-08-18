#!/usr/bin/env python3
"""
Asistente HikGateway - Horarios de control de acceso.

Interfaz simple de menu para que un cliente pueda:
  - Conectarse al gateway y elegir su dispositivo
  - Ver que acepta el dispositivo (capacidades y limites reales)
  - Crear horarios (diurno / nocturno) en el orden correcto
  - Ver el codigo de cada peticion (curl y Python)

Ejecutar:  python asistente.py     (o doble comando:  .\\asistente.bat)
"""

from __future__ import annotations

import json
import sys
from typing import Any

try:
    import requests
    from requests.auth import HTTPDigestAuth
except ImportError:
    print("Falta la libreria 'requests'. Instala con: pip install -r requirements.txt")
    sys.exit(1)


# ---------------------------------------------------------------------------
# Presentacion en consola
# ---------------------------------------------------------------------------

class C:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    GRAY = "\033[90m"


def setup_console() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    if sys.platform == "win32":
        try:
            import ctypes

            k = ctypes.windll.kernel32
            h = k.GetStdHandle(-11)
            mode = ctypes.c_uint32()
            if k.GetConsoleMode(h, ctypes.byref(mode)):
                k.SetConsoleMode(h, mode.value | 0x0004)
        except Exception:
            pass


ANCHO = 70


def cabecera(texto: str) -> None:
    print(f"\n{C.CYAN}{'=' * ANCHO}{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}  {texto}{C.RESET}")
    print(f"{C.CYAN}{'=' * ANCHO}{C.RESET}")


def seccion(texto: str) -> None:
    print(f"\n{C.BOLD}{texto}{C.RESET}")
    print(f"{C.GRAY}{'-' * ANCHO}{C.RESET}")


def nota(texto: str) -> None:
    print(f"{C.YELLOW}{texto}{C.RESET}")


def bien(texto: str) -> None:
    print(f"{C.GREEN}{texto}{C.RESET}")


def mal(texto: str) -> None:
    print(f"{C.RED}{texto}{C.RESET}")


def tenue(texto: str) -> None:
    print(f"{C.GRAY}{texto}{C.RESET}")


def preguntar(texto: str, default: str = "") -> str:
    sufijo = f" [{default}]" if default else ""
    try:
        valor = input(f"{C.CYAN}{texto}{sufijo}: {C.RESET}").strip()
    except (EOFError, KeyboardInterrupt):
        print()
        raise SystemExit(0)
    return valor or default


def enter_para_seguir() -> None:
    try:
        input(f"\n{C.GRAY}Presiona Enter para volver al menu...{C.RESET}")
    except (EOFError, KeyboardInterrupt):
        print()
        raise SystemExit(0)


def confirmar(texto: str) -> bool:
    return preguntar(f"{texto} (s/n)", "n").lower() in ("s", "si", "y", "yes")


# ---------------------------------------------------------------------------
# Definicion de horarios
# ---------------------------------------------------------------------------

DIAS = (
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
)

DIAS_ES = {
    "Monday": "Lunes",
    "Tuesday": "Martes",
    "Wednesday": "Miercoles",
    "Thursday": "Jueves",
    "Friday": "Viernes",
    "Saturday": "Sabado",
    "Sunday": "Domingo",
}

LABORALES = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"}

HORARIO_DIURNO = {
    "nombre": "Turno diurno",
    "resumen": "08:00 a 17:00, Lunes a Viernes",
    "franjas": [("08:00:00", "17:00:00")],
    "explicacion": (
        "Es un horario normal: empieza y termina el mismo dia,\n"
        "por eso se envia en UNA sola franja."
    ),
}

HORARIO_NOCTURNO = {
    "nombre": "Turno nocturno",
    "resumen": "22:00 a 05:00 del dia siguiente, Lunes a Viernes",
    "franjas": [("22:00:00", "23:59:59"), ("00:00:00", "05:00:00")],
    "explicacion": (
        "Este horario cruza la medianoche. El dispositivo exige que cada franja\n"
        "empiece y termine el mismo dia, asi que se parte en DOS franjas:\n"
        "  Franja 1: 22:00:00 a 23:59:59  (la noche)\n"
        "  Franja 2: 00:00:00 a 05:00:00  (la madrugada)\n"
        "Juntas cubren el turno completo de 22:00 a 05:00."
    ),
}


def cuerpo_horario_semanal(franjas: list[tuple[str, str]]) -> dict[str, Any]:
    """Arma el JSON del horario semanal: 7 dias x 8 franjas."""
    bloques: list[dict[str, Any]] = []
    for dia in DIAS:
        for numero in range(1, 9):
            activa = dia in LABORALES and numero <= len(franjas)
            inicio, fin = franjas[numero - 1] if activa else ("00:00:00", "00:00:00")
            bloques.append(
                {
                    "week": dia,
                    "id": numero,
                    "enable": activa,
                    "TimeSegment": {"beginTime": inicio, "endTime": fin},
                }
            )
    return {"UserRightWeekPlanCfg": {"enable": True, "WeekPlanCfg": bloques}}


def cuerpo_plantilla(nombre: str, numero_horario: int) -> dict[str, Any]:
    return {
        "UserRightPlanTemplate": {
            "enable": True,
            "templateName": nombre,
            "weekPlanNo": numero_horario,
            "holidayGroupNo": "",
        }
    }


def cuerpo_usuario(
    empleado: str,
    nombre: str,
    puerta: int,
    plantilla: str,
) -> dict[str, Any]:
    return {
        "UserInfo": {
            "employeeNo": empleado,
            "name": nombre,
            "userType": "normal",
            "Valid": {
                "enable": True,
                "beginTime": "2024-01-01T00:00:00",
                "endTime": "2037-12-31T23:59:59",
                "timeType": "local",
            },
            "doorRight": str(puerta),
            "RightPlan": [{"doorNo": puerta, "planTemplateNo": plantilla}],
        }
    }


# ---------------------------------------------------------------------------
# Conexion con el gateway
# ---------------------------------------------------------------------------

class Gateway:
    def __init__(self, url: str, usuario: str, password: str) -> None:
        self.url = url.rstrip("/")
        self.usuario = usuario
        self.password = password
        self.dev_index = ""
        self.dev_nombre = ""
        self.sesion = requests.Session()
        self.sesion.auth = HTTPDigestAuth(usuario, password)
        self.sesion.headers.update({"Content-Type": "application/json"})

    # -- construccion de rutas -------------------------------------------------

    def ruta(self, recurso: str, con_dispositivo: bool = True) -> str:
        sep = "&" if "?" in recurso else "?"
        query = "format=json"
        if con_dispositivo and self.dev_index:
            query += f"&devIndex={self.dev_index}"
        return f"{recurso}{sep}{query}"

    # -- codigo mostrado al cliente -------------------------------------------

    def como_curl(self, metodo: str, ruta: str, cuerpo: Any = None) -> str:
        lineas = [
            f'curl -sS -X {metodo} "{self.url}{ruta}"',
            f'  --digest -u "{self.usuario}:{self.password}"',
            '  -H "Content-Type: application/json"',
        ]
        if cuerpo is not None:
            texto = json.dumps(cuerpo, ensure_ascii=False)
            if len(texto) > 300:
                texto = texto[:297] + "..."
            lineas.append(f"  -d '{texto}'")
        return " \\\n".join(lineas)

    def como_python(self, metodo: str, ruta: str, cuerpo: Any = None) -> str:
        """Genera codigo Python ejecutable tal cual, sin recortes."""
        lineas = [
            "import requests",
            "from requests.auth import HTTPDigestAuth",
            "",
            f'url = "{self.url}{ruta}"',
            f'auth = HTTPDigestAuth("{self.usuario}", "TU_PASSWORD")',
            "",
        ]
        if cuerpo is None:
            lineas.append(f'respuesta = requests.request("{metodo}", url, auth=auth)')
        else:
            # repr() produce True/False de Python, no true/false de JSON.
            lineas.append(f"cuerpo = {cuerpo!r}")
            lineas.append("")
            lineas.append(
                f'respuesta = requests.request("{metodo}", url, auth=auth, json=cuerpo)'
            )
        lineas.append("print(respuesta.status_code, respuesta.text)")
        return "\n".join(lineas)

    # -- ejecucion -------------------------------------------------------------

    def enviar(
        self,
        metodo: str,
        ruta: str,
        cuerpo: Any = None,
    ) -> dict[str, Any]:
        """Ejecuta la peticion y devuelve un resultado normalizado."""
        try:
            respuesta = self.sesion.request(
                metodo,
                f"{self.url}{ruta}",
                data=json.dumps(cuerpo) if cuerpo is not None else None,
                timeout=45,
            )
        except requests.RequestException as exc:
            return {"ok": False, "http": 0, "error": str(exc), "datos": None}

        try:
            datos = respuesta.json()
        except ValueError:
            datos = None

        codigo = None
        detalle = ""
        if isinstance(datos, dict):
            codigo = datos.get("statusCode")
            detalle = str(
                datos.get("subStatusCode") or datos.get("statusString") or ""
            )

        correcto = respuesta.ok and (codigo is None or codigo == 1)
        return {
            "ok": correcto,
            "http": respuesta.status_code,
            "codigo": codigo,
            "detalle": detalle,
            "datos": datos,
            "error": "" if correcto else (detalle or f"HTTP {respuesta.status_code}"),
        }


# ---------------------------------------------------------------------------
# Ejecucion mostrando el codigo
# ---------------------------------------------------------------------------

def ejecutar_paso(
    gw: Gateway,
    numero: str,
    titulo: str,
    porque: str,
    metodo: str,
    ruta: str,
    cuerpo: Any = None,
    ver_codigo: bool = True,
) -> dict[str, Any]:
    seccion(f"PASO {numero}: {titulo}")
    print(porque)
    print(f"\n{C.BOLD}Peticion:{C.RESET} {metodo} {ruta.split('?')[0]}")

    if ver_codigo:
        tenue("\nAsi se hace desde la terminal:")
        print(gw.como_curl(metodo, ruta, cuerpo))

    resultado = gw.enviar(metodo, ruta, cuerpo)

    if resultado["ok"]:
        bien(f"\n[OK] El dispositivo acepto la peticion (HTTP {resultado['http']}).")
    else:
        mal(f"\n[ERROR] {resultado['error']} (HTTP {resultado['http']}).")
        if resultado.get("detalle") == "notSupport":
            nota("      Ese numero de horario no existe en este modelo.")
    return resultado


# ---------------------------------------------------------------------------
# Deteccion de dispositivo y capacidades
# ---------------------------------------------------------------------------

def listar_dispositivos(gw: Gateway) -> list[dict[str, str]]:
    ruta = gw.ruta("/ISAPI/ContentMgmt/DeviceMgmt/deviceList", con_dispositivo=False)
    resultado = gw.enviar(
        "POST", ruta, {"SearchDescription": {"position": 0, "maxResult": 100}}
    )
    encontrados: list[dict[str, str]] = []
    datos = resultado.get("datos")
    if not isinstance(datos, dict):
        return encontrados
    lista = (datos.get("SearchResult") or {}).get("MatchList") or []
    for elemento in lista:
        equipo = elemento.get("Device") if isinstance(elemento, dict) else None
        if not isinstance(equipo, dict):
            continue
        if equipo.get("devType") != "AccessControl":
            continue
        encontrados.append(
            {
                "index": str(equipo.get("devIndex", "")),
                "nombre": str(equipo.get("devName", "sin nombre")),
                "estado": str(equipo.get("devStatus", "")),
            }
        )
    return encontrados


def elegir_dispositivo(gw: Gateway) -> bool:
    cabecera("Buscando dispositivos de control de acceso")
    nota("Consultando la lista de equipos registrados en el gateway...")
    equipos = listar_dispositivos(gw)

    if not equipos:
        mal("\nNo se encontraron dispositivos de tipo AccessControl.")
        manual = preguntar("Escribe el devIndex manualmente (o Enter para salir)")
        if not manual:
            return False
        gw.dev_index = manual
        gw.dev_nombre = "manual"
        return True

    print()
    for numero, equipo in enumerate(equipos, 1):
        estado = equipo["estado"] or "?"
        color = C.GREEN if estado == "online" else C.YELLOW
        print(
            f"  {numero}. {equipo['nombre']:<25} "
            f"{color}{estado}{C.RESET}  {C.GRAY}{equipo['index']}{C.RESET}"
        )

    if len(equipos) == 1:
        elegido = equipos[0]
        bien(f"\nSe usara: {elegido['nombre']}")
    else:
        opcion = preguntar("\nElige el numero del dispositivo", "1")
        try:
            elegido = equipos[max(1, min(len(equipos), int(opcion))) - 1]
        except ValueError:
            elegido = equipos[0]

    gw.dev_index = elegido["index"]
    gw.dev_nombre = elegido["nombre"]
    return True


def buscar_limite(gw: Gateway, recurso: str, maximo: int = 8) -> tuple[int, str]:
    """
    Consulta numeros consecutivos y devuelve hasta cual responde bien el equipo.

    Solo hace GET, nunca escribe. Se detiene en la primera respuesta invalida:
    ese numero ya esta fuera del rango que acepta el dispositivo.
    """
    ultimo = 0
    motivo = f"se probo hasta el {maximo}"
    for numero in range(1, maximo + 1):
        resultado = gw.enviar(
            "GET", gw.ruta(f"/ISAPI/AccessControl/{recurso}/{numero}")
        )
        if resultado["http"] == 0:
            motivo = "sin conexion con el equipo"
            break
        if not resultado["ok"]:
            motivo = resultado.get("detalle") or f"HTTP {resultado['http']}"
            break
        ultimo = numero
        print(f"    numero {numero}: disponible")
    return ultimo, motivo


def mostrar_capacidades(gw: Gateway, cache: dict[str, Any]) -> None:
    cabecera(f"Que acepta este dispositivo: {gw.dev_nombre}")
    print(
        "Antes de configurar nada, revisamos que soporta el equipo.\n"
        "Todas estas consultas son de SOLO LECTURA: no cambian nada."
    )

    seccion("1. Informacion general del equipo")
    info = gw.enviar("GET", gw.ruta("/ISAPI/System/deviceInfo"))
    if info["ok"] and isinstance(info["datos"], dict):
        bloque = info["datos"].get("DeviceInfo", info["datos"])
        for etiqueta, clave in (
            ("Modelo", "model"),
            ("Nombre", "deviceName"),
            ("Firmware", "firmwareVersion"),
            ("Serie", "serialNumber"),
        ):
            if bloque.get(clave):
                print(f"  {etiqueta:<12}: {bloque[clave]}")
    else:
        nota("  El equipo no devolvio informacion general.")

    seccion("2. Funciones de control de acceso declaradas")
    caps = gw.enviar("GET", gw.ruta("/ISAPI/AccessControl/capabilities"))
    if caps["ok"] and isinstance(caps["datos"], dict):
        claves = list((caps["datos"].get("AccessControl") or caps["datos"]).keys())
        if claves:
            print("  Secciones reportadas por el equipo:")
            for clave in claves[:14]:
                print(f"    - {clave}")
            if len(claves) > 14:
                tenue(f"    ... y {len(claves) - 14} mas")
        cache["capabilities"] = caps["datos"]
    else:
        nota("  Este modelo no publica capacidades detalladas por esta via.")

    seccion("3. Limites reales de horarios (lo mas importante)")
    print(
        "  Aqui no confiamos solo en lo que dice el manual: preguntamos numero\n"
        "  por numero cual acepta el equipo. Son consultas de lectura.\n"
    )
    print("  Horarios semanales:")
    limite_horarios, motivo_horarios = buscar_limite(gw, "UserRightWeekPlanCfg")
    print("  Plantillas:")
    limite_plantillas, motivo_plantillas = buscar_limite(gw, "UserRightPlanTemplate")
    cache["limite_horarios"] = limite_horarios
    cache["limite_plantillas"] = limite_plantillas

    print(f"\n  {C.BOLD}Resumen de lo que acepta este equipo{C.RESET}")
    print(
        f"  Horarios semanales : 1 a {limite_horarios or '?'}"
        f"   {C.GRAY}(se detuvo por: {motivo_horarios}){C.RESET}"
    )
    print(
        f"  Plantillas         : 1 a {limite_plantillas or '?'}"
        f"   {C.GRAY}(se detuvo por: {motivo_plantillas}){C.RESET}"
    )
    print("  Franjas por dia    : hasta 8")
    print("  Dias configurables : Lunes a Domingo")

    usable = min(limite_horarios, limite_plantillas)
    if usable >= 2:
        cache["numero_sugerido"] = 2
        bien(
            f"\n  Sugerencia: usar el numero 2 para las pruebas.\n"
            f"  El numero 1 suele venir de fabrica como 'acceso todo el dia'."
        )
    elif usable == 1:
        cache["numero_sugerido"] = 1
        nota(
            "\n  Este equipo solo acepta el numero 1. Configurarlo SOBRESCRIBE\n"
            "  el horario de fabrica de acceso permanente."
        )
    else:
        mal("\n  No se pudo confirmar ningun numero de horario disponible.")

    enter_para_seguir()


# ---------------------------------------------------------------------------
# Acciones principales
# ---------------------------------------------------------------------------

def resumen_horario(horario: dict[str, Any], numero: int) -> None:
    seccion(f"Vas a configurar: {horario['nombre']}")
    print(f"  Horario : {horario['resumen']}")
    print(f"  Se guarda en el numero: {numero}")
    print()
    print(horario["explicacion"])
    print()
    print(f"  {C.BOLD}Como queda cada dia laboral:{C.RESET}")
    for indice, (inicio, fin) in enumerate(horario["franjas"], 1):
        print(f"    Franja {indice}: {inicio} a {fin}")
    print(f"    {C.GRAY}Sabado y Domingo: sin acceso{C.RESET}")


def configurar_horario(
    gw: Gateway,
    horario: dict[str, Any],
    numero: int,
    ver_codigo: bool,
) -> None:
    cabecera(f"Configurar {horario['nombre']}")
    resumen_horario(horario, numero)

    print(
        f"\n{C.BOLD}Se haran 4 peticiones, en este orden:{C.RESET}\n"
        f"  1) Guardar el horario semanal   (PUT UserRightWeekPlanCfg/{numero})\n"
        f"  2) Guardar la plantilla         (PUT UserRightPlanTemplate/{numero})\n"
        f"  3) Leer el horario para validar (GET UserRightWeekPlanCfg/{numero})\n"
        f"  4) Leer la plantilla            (GET UserRightPlanTemplate/{numero})"
    )

    if not confirmar("\nEsto MODIFICA el dispositivo. Continuar?"):
        nota("Cancelado. No se envio nada.")
        enter_para_seguir()
        return

    cuerpo = cuerpo_horario_semanal(horario["franjas"])
    paso1 = ejecutar_paso(
        gw,
        "1 de 4",
        "Guardar el horario semanal",
        "Se define a que horas puede pasar la gente cada dia de la semana.\n"
        "Los dias y franjas que no se usan se envian apagados (enable: false).",
        "PUT",
        gw.ruta(f"/ISAPI/AccessControl/UserRightWeekPlanCfg/{numero}"),
        cuerpo,
        ver_codigo,
    )
    if not paso1["ok"]:
        mal("\nNo se puede continuar: el horario no se guardo.")
        enter_para_seguir()
        return

    ejecutar_paso(
        gw,
        "2 de 4",
        "Guardar la plantilla",
        "La plantilla le pone nombre al horario y es lo que se asigna a las personas.\n"
        f"Aqui la plantilla {numero} apunta al horario semanal {numero}.",
        "PUT",
        gw.ruta(f"/ISAPI/AccessControl/UserRightPlanTemplate/{numero}"),
        cuerpo_plantilla(horario["nombre"], numero),
        ver_codigo,
    )

    verificacion = ejecutar_paso(
        gw,
        "3 de 4",
        "Leer el horario guardado",
        "Confirmamos que el dispositivo realmente guardo las franjas.",
        "GET",
        gw.ruta(f"/ISAPI/AccessControl/UserRightWeekPlanCfg/{numero}"),
        None,
        ver_codigo,
    )
    mostrar_franjas_guardadas(verificacion.get("datos"))

    ejecutar_paso(
        gw,
        "4 de 4",
        "Leer la plantilla guardada",
        "Confirmamos el nombre y a que horario apunta la plantilla.",
        "GET",
        gw.ruta(f"/ISAPI/AccessControl/UserRightPlanTemplate/{numero}"),
        None,
        ver_codigo,
    )

    seccion("Resultado")
    bien(f"Plantilla {numero} lista: {horario['nombre']} ({horario['resumen']}).")
    print("Ya puedes asignarla a un usuario desde la opcion 5 del menu.")
    enter_para_seguir()


def mostrar_franjas_guardadas(datos: Any) -> None:
    """Muestra en texto claro lo que quedo guardado en el equipo."""
    if not isinstance(datos, dict):
        return
    config = datos.get("UserRightWeekPlanCfg")
    if not isinstance(config, dict):
        return
    activas: dict[str, list[str]] = {}
    for bloque in config.get("WeekPlanCfg") or []:
        if not isinstance(bloque, dict) or not bloque.get("enable"):
            continue
        periodo = bloque.get("TimeSegment") or {}
        dia = DIAS_ES.get(str(bloque.get("week")), str(bloque.get("week")))
        activas.setdefault(dia, []).append(
            f"{periodo.get('beginTime')} a {periodo.get('endTime')}"
        )

    if not activas:
        nota("      El equipo no reporta franjas activas.")
        return

    print(f"\n  {C.BOLD}Esto quedo guardado en el dispositivo:{C.RESET}")
    for dia in DIAS:
        nombre = DIAS_ES[dia]
        if nombre in activas:
            print(f"    {nombre:<10}: {', '.join(activas[nombre])}")


def asignar_a_usuario(gw: Gateway, cache: dict[str, Any], ver_codigo: bool) -> None:
    cabecera("Asignar una plantilla a un usuario")
    print(
        "Una plantilla sola no hace nada hasta que se le asigna a una persona.\n"
        "Este paso conecta al empleado con el horario que creaste.\n\n"
        f"{C.BOLD}Importante:{C.RESET} el usuario ya debe existir en el dispositivo."
    )

    numero = preguntar(
        "\nNumero de plantilla a asignar",
        str(cache.get("numero_sugerido", 2)),
    )
    empleado = preguntar("Numero de empleado (employeeNo)")
    if not empleado:
        nota("Sin numero de empleado no se puede continuar.")
        enter_para_seguir()
        return
    nombre = preguntar("Nombre de la persona", "Usuario de prueba")
    puerta = preguntar("Numero de puerta", "1")

    if not confirmar(f"\nAsignar plantilla {numero} a {nombre}?"):
        nota("Cancelado.")
        enter_para_seguir()
        return

    resultado = ejecutar_paso(
        gw,
        "1 de 1",
        "Asignar la plantilla al usuario",
        "El campo importante es RightPlan.planTemplateNo:\n"
        "es el que limita a que horas puede abrir la puerta esa persona.",
        "PUT",
        gw.ruta("/ISAPI/AccessControl/UserInfo/Modify"),
        cuerpo_usuario(empleado, nombre, int(puerta or 1), str(numero)),
        ver_codigo,
    )

    if resultado["ok"]:
        seccion("Como comprobarlo en sitio")
        print(
            "  Horario diurno  : debe abrir a media manana y NO en la noche.\n"
            "  Horario nocturno: debe abrir cerca de las 23:00 y de las 03:00,\n"
            "                    y NO a media manana."
        )
    else:
        nota(
            "\nSi el error menciona que no existe el usuario, primero hay que darlo\n"
            "de alta con /ISAPI/AccessControl/UserInfo/Record."
        )
    enter_para_seguir()


def ver_estado_actual(gw: Gateway, cache: dict[str, Any]) -> None:
    cabecera("Consultar un horario ya guardado")
    numero = preguntar(
        "Numero de horario a consultar",
        str(cache.get("numero_sugerido", 2)),
    )

    resultado = ejecutar_paso(
        gw,
        "1 de 2",
        "Leer el horario semanal",
        "Consulta de solo lectura: muestra las franjas activas.",
        "GET",
        gw.ruta(f"/ISAPI/AccessControl/UserRightWeekPlanCfg/{numero}"),
        None,
        False,
    )
    mostrar_franjas_guardadas(resultado.get("datos"))

    plantilla = ejecutar_paso(
        gw,
        "2 de 2",
        "Leer la plantilla",
        "Muestra el nombre de la plantilla y a que horario apunta.",
        "GET",
        gw.ruta(f"/ISAPI/AccessControl/UserRightPlanTemplate/{numero}"),
        None,
        False,
    )
    datos = plantilla.get("datos")
    if isinstance(datos, dict) and isinstance(
        datos.get("UserRightPlanTemplate"), dict
    ):
        info = datos["UserRightPlanTemplate"]
        print(f"\n  Nombre    : {info.get('templateName')}")
        print(f"  Horario   : {info.get('weekPlanNo')}")
        print(f"  Habilitada: {'si' if info.get('enable') else 'no'}")

    enter_para_seguir()


def ver_codigo_completo(gw: Gateway, cache: dict[str, Any]) -> None:
    cabecera("Codigo de todas las peticiones, en orden")
    numero = int(cache.get("numero_sugerido", 2))
    print(
        "Esta es la secuencia completa. El orden importa:\n"
        "primero el horario, luego la plantilla, al final el usuario.\n"
    )

    pasos = [
        (
            "1. Buscar el dispositivo",
            "POST",
            gw.ruta("/ISAPI/ContentMgmt/DeviceMgmt/deviceList", con_dispositivo=False),
            {"SearchDescription": {"position": 0, "maxResult": 100}},
            "Devuelve el devIndex que usan todas las demas peticiones.",
        ),
        (
            "2. Ver capacidades del dispositivo",
            "GET",
            gw.ruta("/ISAPI/AccessControl/capabilities"),
            None,
            "Solo lectura. Sirve para saber que soporta el equipo.",
        ),
        (
            "3. Guardar el horario diurno (08:00-17:00)",
            "PUT",
            gw.ruta(f"/ISAPI/AccessControl/UserRightWeekPlanCfg/{numero}"),
            cuerpo_horario_semanal(HORARIO_DIURNO["franjas"]),
            "Una sola franja porque no cruza la medianoche.",
        ),
        (
            "4. Guardar el horario nocturno (22:00-05:00)",
            "PUT",
            gw.ruta(f"/ISAPI/AccessControl/UserRightWeekPlanCfg/{numero}"),
            cuerpo_horario_semanal(HORARIO_NOCTURNO["franjas"]),
            "DOS franjas: 22:00-23:59:59 y 00:00-05:00, porque cruza la medianoche.",
        ),
        (
            "5. Guardar la plantilla",
            "PUT",
            gw.ruta(f"/ISAPI/AccessControl/UserRightPlanTemplate/{numero}"),
            cuerpo_plantilla("Turno nocturno", numero),
            "La plantilla es lo que se asigna a las personas.",
        ),
        (
            "6. Verificar lo guardado",
            "GET",
            gw.ruta(f"/ISAPI/AccessControl/UserRightWeekPlanCfg/{numero}"),
            None,
            "Confirma que las franjas quedaron en el equipo.",
        ),
        (
            "7. Asignar la plantilla al usuario",
            "PUT",
            gw.ruta("/ISAPI/AccessControl/UserInfo/Modify"),
            cuerpo_usuario("1596", "Usuario de prueba", 1, str(numero)),
            "El usuario debe existir antes.",
        ),
    ]

    for titulo, metodo, ruta, cuerpo, comentario in pasos:
        seccion(titulo)
        tenue(comentario)
        print(gw.como_curl(metodo, ruta, cuerpo))

    if confirmar("\nGuardar todo esto en un archivo de texto?"):
        nombre = "peticiones_en_orden.txt"
        with open(nombre, "w", encoding="utf-8") as archivo:
            archivo.write("PETICIONES HIKGATEWAY - HORARIOS DE ACCESO\n")
            archivo.write("=" * ANCHO + "\n\n")
            for titulo, metodo, ruta, cuerpo, comentario in pasos:
                archivo.write(f"{titulo}\n{'-' * ANCHO}\n{comentario}\n\n")
                archivo.write(gw.como_curl(metodo, ruta, cuerpo) + "\n\n")
                if cuerpo is not None:
                    archivo.write("Cuerpo JSON completo:\n")
                    archivo.write(json.dumps(cuerpo, ensure_ascii=False, indent=2))
                    archivo.write("\n\n")
                archivo.write("Equivalente en Python:\n")
                archivo.write(gw.como_python(metodo, ruta, cuerpo) + "\n\n\n")
        bien(f"Guardado en: {nombre}")

    enter_para_seguir()


# ---------------------------------------------------------------------------
# Menu principal
# ---------------------------------------------------------------------------

def bienvenida() -> None:
    cabecera("Asistente de horarios - HikGateway")
    print(
        "Este asistente configura horarios de acceso paso a paso.\n\n"
        f"{C.BOLD}El orden siempre es el mismo:{C.RESET}\n"
        "  1. Buscar el dispositivo\n"
        "  2. Revisar que acepta el dispositivo\n"
        "  3. Crear el horario semanal\n"
        "  4. Crear la plantilla que usa ese horario\n"
        "  5. Asignar la plantilla a las personas\n"
    )


def conectar() -> Gateway | None:
    seccion("Datos de conexion")
    print("Se piden cada vez y no se guardan en ningun archivo.")
    url = preguntar("\nDireccion del gateway (ej. http://192.168.1.100)")
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
    usuario = preguntar("Usuario", "admin")
    password = preguntar("Password")
    if not password:
        mal("La contrasena es obligatoria.")
        return None
    return Gateway(url, usuario, password)


def menu(gw: Gateway, cache: dict[str, Any]) -> None:
    ver_codigo = True
    while True:
        numero = cache.get("numero_sugerido", 2)
        cabecera(f"Menu principal  -  Dispositivo: {gw.dev_nombre}")
        print(
            f"  1. Ver que acepta este dispositivo   {C.GRAY}(solo lectura){C.RESET}\n"
            f"  2. Crear horario DIURNO    {C.GRAY}08:00 a 17:00{C.RESET}\n"
            f"  3. Crear horario NOCTURNO  {C.GRAY}22:00 a 05:00{C.RESET}\n"
            f"  4. Consultar un horario ya guardado  {C.GRAY}(solo lectura){C.RESET}\n"
            f"  5. Asignar una plantilla a un usuario\n"
            f"  6. Ver el codigo de todas las peticiones en orden\n"
            f"  7. Mostrar comandos al ejecutar: "
            f"{C.GREEN + 'si' + C.RESET if ver_codigo else C.GRAY + 'no' + C.RESET}\n"
            f"  0. Salir"
        )
        tenue(f"\n  Numero de horario/plantilla en uso: {numero}")

        opcion = preguntar("\nElige una opcion", "1")

        if opcion == "0":
            bien("\nHasta luego.")
            return
        if opcion == "1":
            mostrar_capacidades(gw, cache)
        elif opcion == "2":
            configurar_horario(gw, HORARIO_DIURNO, numero, ver_codigo)
        elif opcion == "3":
            configurar_horario(gw, HORARIO_NOCTURNO, numero, ver_codigo)
        elif opcion == "4":
            ver_estado_actual(gw, cache)
        elif opcion == "5":
            asignar_a_usuario(gw, cache, ver_codigo)
        elif opcion == "6":
            ver_codigo_completo(gw, cache)
        elif opcion == "7":
            ver_codigo = not ver_codigo
        else:
            nota("Opcion no valida.")


def main() -> int:
    setup_console()
    bienvenida()

    gw = conectar()
    if gw is None:
        mal("No se pudo iniciar la conexion.")
        return 1

    if not elegir_dispositivo(gw):
        mal("Sin dispositivo no se puede continuar.")
        return 1

    cache: dict[str, Any] = {"numero_sugerido": 2}
    nota("\nSe recomienda empezar por la opcion 1 para ver que acepta el equipo.")
    menu(gw, cache)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nCancelado por el usuario.")
        raise SystemExit(0)
