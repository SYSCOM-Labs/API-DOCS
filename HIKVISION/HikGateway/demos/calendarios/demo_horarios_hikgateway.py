#!/usr/bin/env python3
"""
Demo/tutorial: como crear horarios y plantillas en un dispositivo de control
de acceso a traves del HikGateway.

Casos de prueba:
  - Diurno:   08:00:00 -> 17:00:00
  - Nocturno: 22:00:00 -> 05:00:00 (cruza medianoche: se parte en 2 franjas)

En cada paso el tutorial muestra, en este orden:
  1) Explicacion en lenguaje natural (que se hace y por que)
  2) Endpoint (metodo + ruta)
  3) Cuerpo JSON que se envia (formateado y facil de leer)
  4) Comando curl equivalente (listo para copiar/pegar)
  5) Pausa (Enter = ejecutar / s = saltar / q = salir)
  6) Respuesta del dispositivo

Como esta organizado este archivo (cada PARTE es un bloque independiente):
  PARTE 1 - Utilidades de consola (colores y como se imprime en pantalla)
  PARTE 2 - Los horarios del tutorial (los datos que vamos a crear)
  PARTE 3 - Preguntas al usuario (datos de conexion y opciones)
  PARTE 4 - Cuerpos JSON de cada peticion (LO MAS IMPORTANTE del tutorial)
  PARTE 5 - Cliente HTTP (como se arma, se muestra y se envia cada peticion)
  PARTE 6 - Los pasos del tutorial, en el orden correcto
  PARTE 7 - Linea de comandos y flujo principal (main)

Basado en Documentacion/HikGateway.postman_collection.json
y API Developer Guide v1.8.0 (seccion User Permission Schedule).
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any

try:
    import requests
    from requests.auth import HTTPDigestAuth
except ImportError:
    print("Falta 'requests'. Instala con: pip install -r requirements.txt")
    sys.exit(1)


# ===========================================================================
# PARTE 1 - Utilidades de consola (colores y como se imprime en pantalla)
# ===========================================================================

class C:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    CYAN = "\033[36m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    MAGENTA = "\033[35m"
    RED = "\033[31m"
    WHITE = "\033[97m"


def enable_windows_ansi() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    if sys.platform != "win32":
        return
    try:
        import ctypes

        kernel32 = ctypes.windll.kernel32
        handle = kernel32.GetStdHandle(-11)
        mode = ctypes.c_uint32()
        if kernel32.GetConsoleMode(handle, ctypes.byref(mode)):
            kernel32.SetConsoleMode(handle, mode.value | 0x0004)
    except Exception:
        pass


def titulo(texto: str) -> None:
    print(f"\n{C.BOLD}{C.CYAN}{'=' * 72}{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}{texto}{C.RESET}")
    print(f"{C.BOLD}{C.CYAN}{'=' * 72}{C.RESET}")


def info(texto: str) -> None:
    print(f"{C.YELLOW}{texto}{C.RESET}")


def ok(texto: str) -> None:
    print(f"{C.GREEN}{texto}{C.RESET}")


def err(texto: str) -> None:
    print(f"{C.RED}{texto}{C.RESET}")


def comando(texto: str) -> None:
    print(f"\n{C.MAGENTA}--- Comando curl (copialo a la terminal) ---{C.RESET}")
    print(f"{C.WHITE}{texto}{C.RESET}")
    print(f"{C.MAGENTA}--------------------------------------------{C.RESET}\n")


def explicar(texto: str) -> None:
    """Bloque de explicacion larga para el cliente."""
    print(f"\n{C.BOLD}Que estamos haciendo y por que:{C.RESET}")
    print(f"{C.YELLOW}{texto}{C.RESET}")


def mostrar_endpoint(method: str, url: str) -> None:
    """Muestra de forma destacada el metodo HTTP y la URL de la peticion."""
    print(f"\n{C.BOLD}Endpoint:{C.RESET} {C.CYAN}{method.upper()}{C.RESET} {url}")


def mostrar_json(titulo_bloque: str, cuerpo: Any) -> None:
    """
    Imprime un JSON formateado y legible. En un tutorial esto es clave:
    el cliente debe VER con claridad la estructura exacta que se envia.
    """
    print(f"\n{C.BOLD}{titulo_bloque}{C.RESET}")
    texto = json.dumps(cuerpo, ensure_ascii=False, indent=2)
    print(f"{C.GREEN}{texto}{C.RESET}")


# ===========================================================================
# PARTE 2 - Los horarios del tutorial (los datos que vamos a crear)
# ===========================================================================

DAYS = (
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
)

# Diurno: una sola franja (no cruza medianoche).
SCENARIO_DAY = {
    "key": "diurno",
    "name": "Turno diurno",
    "description": "08:00:00 a 17:00:00 (8 AM - 5 PM)",
    "default_id": "2",
    # Lista de franjas activas por dia: (begin, end)
    "segments": [("08:00:00", "17:00:00")],
}

# Nocturno: 22:00 -> 05:00 cruza medianoche.
# En Hikvision cada TimeSegment suele exigir beginTime <= endTime en el mismo dia.
# Por eso se parte en 2 franjas: 22:00-23:59:59 y 00:00:00-05:00:00.
SCENARIO_NIGHT = {
    "key": "nocturno",
    "name": "Turno nocturno",
    "description": "22:00:00 a 05:00:00 (cruza medianoche)",
    "default_id": "2",
    "segments": [
        ("22:00:00", "23:59:59"),
        ("00:00:00", "05:00:00"),
    ],
}


# ===========================================================================
# PARTE 3 - Preguntas al usuario (datos de conexion y opciones)
# ===========================================================================

def ask(prompt: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    try:
        value = input(f"{C.CYAN}{prompt}{suffix}: {C.RESET}").strip()
    except (EOFError, KeyboardInterrupt):
        print()
        raise SystemExit(0)
    return value or default


def normalize_host(url: str) -> str:
    url = url.strip().rstrip("/")
    if not url:
        return url
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
    return url


def prompt_connection(*, host_arg: str | None = None) -> dict[str, str]:
    titulo("1) Conexion al HikGateway")
    explicar(
        "El HikGateway es el puente entre tu PC/servidor y el dispositivo de acceso\n"
        "(biométrico, panel, etc.). Todas las peticiones van al gateway con Digest Auth\n"
        "(usuario/password del gateway) y el parametro devIndex apunta al equipo destino.\n\n"
        "No guardamos credenciales en archivos: solo se usan en esta sesion de terminal."
    )

    if host_arg:
        host = normalize_host(host_arg)
        ok(f"URL (--host): {host}")
    else:
        host = normalize_host(ask("URL del gateway (ej. http://192.168.1.100)"))
        while not host:
            err("La URL es obligatoria.")
            host = normalize_host(ask("URL del gateway"))

    user = ask("Usuario del gateway", "admin")
    password = ask("Password (visible: puedes pegarla y verla)")
    while not password:
        err("La contrasena es obligatoria.")
        password = ask("Password (visible)")

    return {
        "host": host,
        "user": user,
        "password": password,
    }


def prompt_demo_options(cfg: dict[str, Any]) -> None:
    titulo("2) Que vamos a configurar (prueba del cliente)")
    explicar(
        "Vamos a crear PLANTILLAS DE HORARIO en el dispositivo de acceso.\n\n"
        "Conceptos clave (en orden):\n"
        "  A) Plan semanal (WeekPlan): define franjas hora por dia (Lun..Dom).\n"
        "     Cada dia admite hasta 8 franjas (id 1..8).\n"
        "  B) Plantilla (PlanTemplate): empaqueta un WeekPlan (y opcionalmente festivos)\n"
        "     con un nombre. Su ID es el planTemplateNo.\n"
        "  C) Usuario: se le asigna planTemplateNo en RightPlan para que solo abra\n"
        "     puertas dentro de ese horario.\n\n"
        "Casos de esta demo:\n"
        f"  * DIURNO:  {SCENARIO_DAY['description']}\n"
        f"  * NOCTURNO: {SCENARIO_NIGHT['description']}\n\n"
        "IMPORTANTE - horario nocturno que cruza medianoche:\n"
        "  Un solo segmento 22:00:00 -> 05:00:00 suele RECHAZARSE o comportarse mal\n"
        "  porque en muchos equipos beginTime debe ser menor o igual a endTime el mismo dia.\n"
        "  Solucion compatible: DOS franjas por dia:\n"
        "    Franja 1: 22:00:00 -> 23:59:59\n"
        "    Franja 2: 00:00:00 -> 05:00:00\n"
        "  Juntas cubren el turno nocturno completo. Esta demo prueba exactamente eso."
    )

    info(
        "\nElige escenario:\n"
        "  1 = solo diurno (08:00-17:00)\n"
        "  2 = solo nocturno (22:00-05:00 en 2 franjas)\n"
        "  3 = ambos (recomendado para la prueba con el cliente)"
    )
    choice = ask("Escenario", "3")
    if choice == "1":
        scenarios = [SCENARIO_DAY]
    elif choice == "2":
        scenarios = [SCENARIO_NIGHT]
    else:
        scenarios = [SCENARIO_DAY, SCENARIO_NIGHT]

    test_id = ask(
        "ID soportado que se reutilizara para las dos pruebas "
        "(el 2 funciono; evita 1 porque suele ser 'todo el dia')",
        "2",
    ) or "2"
    cfg["test_id"] = test_id.strip()
    resolved = [{**sc, "id": test_id.strip()} for sc in scenarios]

    cfg["scenarios"] = resolved
    cfg["dev_index"] = ask(
        "DEV_INDEX UUID AccessControl (vacio = obtener al listar)",
        cfg.get("dev_index", ""),
    ).strip()
    cfg["employee_no"] = ask("employeeNo a modificar (paso usuario)", "1596") or "1596"
    cfg["employee_name"] = ask("Nombre del usuario", "Usuario Demo") or "Usuario Demo"
    cfg["door_no"] = ask("Numero de puerta (doorNo)", "1") or "1"

    apply_user = ask(
        "Al final, asignar una plantilla a un usuario existente? (s/n)",
        "n",
    ).lower()
    cfg["apply_user"] = apply_user in ("s", "si", "y", "yes")

    if cfg["apply_user"]:
        cfg["user_template_id"] = resolved[0]["id"]
    else:
        cfg["user_template_id"] = ""


# ===========================================================================
# PARTE 4 - Cuerpos JSON de cada peticion (LO MAS IMPORTANTE del tutorial)
# ---------------------------------------------------------------------------
# Cada funcion de aqui construye el JSON EXACTO que se envia al dispositivo.
# Son funciones puras (no hacen red): reciben datos y devuelven un dict que
# luego se muestra en pantalla y se manda tal cual en el cuerpo de la peticion.
# ===========================================================================

def build_week_plan_payload(
    time_segments: list[tuple[str, str]],
    workdays: set[str] | None = None,
) -> dict[str, Any]:
    """
    Construye el cuerpo de UserRightWeekPlanCfg (el horario semanal).

    time_segments: lista de (inicio, fin) que se habilitan en los dias
    laborales, empezando en la franja id=1. Los demas dias/franjas van
    deshabilitados (enable=false) con 00:00:00-00:00:00.

    Estructura resultante (resumida):
        {
          "UserRightWeekPlanCfg": {
            "enable": true,
            "WeekPlanCfg": [
              {"week": "Monday", "id": 1, "enable": true,
               "TimeSegment": {"beginTime": "08:00:00", "endTime": "17:00:00"}},
              ... (7 dias x 8 franjas = 56 entradas) ...
            ]
          }
        }
    """
    if workdays is None:
        workdays = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"}

    if len(time_segments) > 8:
        raise ValueError("Maximo 8 franjas por dia")

    segments: list[dict[str, Any]] = []
    for day in DAYS:
        for seg_id in range(1, 9):
            active = day in workdays and seg_id <= len(time_segments)
            if active:
                begin, end = time_segments[seg_id - 1]
            else:
                begin, end = "00:00:00", "00:00:00"
            segments.append(
                {
                    "week": day,
                    "id": seg_id,
                    "enable": active,
                    "TimeSegment": {
                        "beginTime": begin,
                        "endTime": end,
                    },
                }
            )
    return {
        "UserRightWeekPlanCfg": {
            "enable": True,
            "WeekPlanCfg": segments,
        }
    }


def build_template_payload(
    template_name: str,
    week_plan_no: int,
    holiday_group_no: str = "",
) -> dict[str, Any]:
    """
    Construye el cuerpo de UserRightPlanTemplate (la plantilla).

    La plantilla le pone nombre al horario y es lo que despues se asigna a
    las personas. Apunta al horario semanal mediante weekPlanNo.

    Estructura resultante:
        {
          "UserRightPlanTemplate": {
            "enable": true,
            "templateName": "Turno diurno",
            "weekPlanNo": 2,
            "holidayGroupNo": ""   // vacio = sin dias festivos
          }
        }
    """
    return {
        "UserRightPlanTemplate": {
            "enable": True,
            "templateName": template_name,
            "weekPlanNo": week_plan_no,
            "holidayGroupNo": holiday_group_no,
        }
    }


def build_user_modify_payload(
    employee_no: str,
    name: str,
    door_no: int,
    plan_template_no: str,
) -> dict[str, Any]:
    """
    Construye el cuerpo de UserInfo/Modify (asignar plantilla a una persona).

    El campo clave es RightPlan[].planTemplateNo: es lo que limita a que
    horas puede abrir la puerta esa persona.

    Estructura resultante (resumida):
        {
          "UserInfo": {
            "employeeNo": "1596",
            "name": "Usuario Demo",
            "Valid": { ... periodo de validez ... },
            "doorRight": "1",
            "RightPlan": [{"doorNo": 1, "planTemplateNo": "2"}]
          }
        }
    """
    return {
        "UserInfo": {
            "employeeNo": employee_no,
            "name": name,
            "userType": "normal",
            "Valid": {
                "enable": True,
                "beginTime": "2024-01-01T00:00:00",
                "endTime": "2037-12-31T23:59:59",
                "timeType": "local",
            },
            "doorRight": str(door_no),
            "RightPlan": [
                {
                    "doorNo": door_no,
                    "planTemplateNo": plan_template_no,
                }
            ],
        }
    }


def build_device_list_payload() -> dict[str, Any]:
    """Cuerpo para pedir la lista de dispositivos conectados al gateway."""
    return {"SearchDescription": {"position": 0, "maxResult": 100}}


def q_dev(dev_index: str) -> str:
    """Query string comun a casi todas las peticiones: format + devIndex."""
    return f"format=json&devIndex={dev_index}"


# ===========================================================================
# PARTE 5 - Cliente HTTP (como se arma, se muestra y se envia cada peticion)
# ===========================================================================

class GatewayClient:
    def __init__(
        self,
        host: str,
        user: str,
        password: str,
        solo_mostrar: bool = False,
    ) -> None:
        self.host = host.rstrip("/")
        self.user = user
        self.password = password
        self.solo_mostrar = solo_mostrar
        self.session = requests.Session()
        self.session.auth = HTTPDigestAuth(user, password)
        self.session.headers.update({"Content-Type": "application/json"})

    def url(self, path: str) -> str:
        if not path.startswith("/"):
            path = "/" + path
        return f"{self.host}{path}"

    def to_curl(
        self,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
    ) -> str:
        full = self.url(path)
        parts = [
            "curl",
            "-sS",
            "-X",
            method.upper(),
            "-u",
            f"'{self.user}:{self.password}'",
            "--digest",
            "-H",
            "'Content-Type: application/json'",
        ]
        if body is not None:
            payload = json.dumps(body, ensure_ascii=False, indent=2)
            escaped = payload.replace("'", "'\\''")
            parts.extend(["-d", f"'{escaped}'"])
        parts.append(f"'{full}'")
        return " \\\n  ".join(parts)

    def pause(self) -> bool:
        try:
            ans = input(
                f"{C.DIM}Enter = ejecutar este paso | s = saltar | q = salir: {C.RESET}"
            ).strip().lower()
        except (EOFError, KeyboardInterrupt):
            print()
            raise SystemExit(0)
        if ans in ("q", "quit", "salir"):
            raise SystemExit(0)
        if ans in ("s", "skip", "n", "no"):
            info("Paso saltado.")
            return False
        return True

    def request_step(
        self,
        title: str,
        explanation: str,
        method: str,
        path: str,
        body: dict[str, Any] | None = None,
    ) -> dict[str, Any] | list[Any] | None:
        # Orden de presentacion pensado para un tutorial:
        #   titulo -> explicacion -> endpoint -> JSON claro -> curl -> pausa
        titulo(title)
        explicar(explanation)
        mostrar_endpoint(method, self.url(path))
        if body is not None:
            mostrar_json("Cuerpo JSON que se envia:", body)
        else:
            print(f"\n{C.BOLD}Cuerpo JSON:{C.RESET} (esta peticion no lleva cuerpo)")
        comando(self.to_curl(method, path, body))

        if not self.pause():
            return None

        if self.solo_mostrar:
            ok("Modo --solo-mostrar: no se envio la peticion al gateway.")
            return None

        full = self.url(path)
        try:
            resp = self.session.request(
                method=method.upper(),
                url=full,
                data=json.dumps(body) if body is not None else None,
                timeout=60,
            )
        except requests.RequestException as exc:
            err(f"Error de red: {exc}")
            return None

        print(f"\n{C.BOLD}Respuesta del dispositivo (HTTP {resp.status_code}):{C.RESET}")
        if resp.status_code >= 400:
            err(
                "La peticion fallo. Revisa statusCode/statusString en el JSON.\n"
                "Si es el nocturno, confirma que el equipo acepte 2 franjas cruzando medianoche."
            )

        text = resp.text.strip()
        if not text:
            info("(respuesta vacia)")
            return None

        try:
            data = resp.json()
            print(f"{C.WHITE}{json.dumps(data, ensure_ascii=False, indent=2)}{C.RESET}")
            status = None
            if isinstance(data, dict):
                status = data.get("statusCode") or (
                    data.get("ResponseStatus") or {}
                ).get("statusCode")
            if status is not None and str(status) not in ("1", "0"):
                # Hikvision: statusCode 1 suele ser OK
                info(f"Nota: statusCode={status} (en ISAPI, 1 normalmente = OK).")
            return data
        except ValueError:
            print(text[:4000])
            return None


# ===========================================================================
# PARTE 6 - Los pasos del tutorial, en el orden correcto
# ---------------------------------------------------------------------------
# Flujo:  A) listar dispositivo  ->  A2/A3) capacidades y limites  ->
#         B) horario semanal  ->  C) plantilla  ->  D) verificar  ->
#         E) asignar a usuario (opcional)
# ===========================================================================

def extract_access_devices(data: Any) -> list[dict[str, str]]:
    found: list[dict[str, str]] = []
    if not isinstance(data, dict):
        return found
    result = data.get("SearchResult") or data
    match_list = result.get("MatchList") if isinstance(result, dict) else None
    if not isinstance(match_list, list):
        return found
    for item in match_list:
        device = item.get("Device") if isinstance(item, dict) else None
        if not isinstance(device, dict):
            continue
        if device.get("devType") != "AccessControl":
            continue
        found.append(
            {
                "devIndex": str(device.get("devIndex", "")),
                "devName": str(device.get("devName", "")),
                "devType": str(device.get("devType", "")),
                "devStatus": str(device.get("devStatus", "")),
            }
        )
    return found


def step_list_devices(client: GatewayClient, cfg: dict[str, Any]) -> str:
    path = "/ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json"
    data = client.request_step(
        title="Paso A - Listar dispositivos registrados en el gateway",
        explanation=(
            "Objetivo: descubrir el UUID (devIndex) del equipo de control de acceso.\n\n"
            "Por que: el gateway puede tener varios dispositivos (camaras, accesos, etc.).\n"
            "Cada API de acceso lleva ?devIndex=<uuid> para saber a cual equipo reenviar\n"
            "el comando ISAPI.\n\n"
            "Que mirar en la respuesta:\n"
            "  - MatchList[].Device.devType == AccessControl\n"
            "  - Device.devIndex  (UUID)\n"
            "  - Device.devStatus (idealmente online)\n\n"
            "Metodo: POST /ISAPI/ContentMgmt/DeviceMgmt/deviceList?format=json"
        ),
        method="POST",
        path=path,
        body=build_device_list_payload(),
    )

    devices = extract_access_devices(data)
    if devices:
        ok("\nDispositivos AccessControl detectados:")
        for i, d in enumerate(devices, 1):
            print(
                f"  {i}. {d['devName']} | {d['devIndex']} | "
                f"{d['devStatus']} | {d['devType']}"
            )
        if not cfg.get("dev_index") and devices[0]["devIndex"]:
            cfg["dev_index"] = devices[0]["devIndex"]
            ok(f"\nUsando DEV_INDEX = {cfg['dev_index']}")
    elif cfg.get("dev_index"):
        info(
            f"No se pudo listar; se usara el DEV_INDEX indicado: {cfg['dev_index']}"
        )
    else:
        err(
            "No hay DEV_INDEX. Conecta un AccessControl al gateway o "
            "pegalo manualmente cuando se pida."
        )
    return str(cfg.get("dev_index") or "")


def find_schedule_capability_fields(
    value: Any,
    path: str = "",
) -> list[tuple[str, Any]]:
    """Localiza campos de capacidad relacionados con planes y plantillas."""
    found: list[tuple[str, Any]] = []
    keywords = ("plan", "schedule", "template", "week", "holiday", "time")
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else key
            if any(word in key.lower() for word in keywords):
                if not isinstance(child, (dict, list)):
                    found.append((child_path, child))
            found.extend(find_schedule_capability_fields(child, child_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found.extend(find_schedule_capability_fields(child, f"{path}[{index}]"))
    return found


def step_access_capabilities(
    client: GatewayClient,
    cfg: dict[str, Any],
) -> None:
    path = f"/ISAPI/AccessControl/capabilities?{q_dev(cfg['dev_index'])}"
    data = client.request_step(
        title="Paso A2 - Consultar capacidades y limites del dispositivo",
        explanation=(
            "Objetivo:\n"
            "  Consultar lo que el modelo declara soportar antes de modificar horarios.\n"
            "  Algunos equipos informan cantidad/rango de WeekPlan y PlanTemplate;\n"
            "  otros solo informan funciones generales y no publican el limite numerico.\n\n"
            "Como interpretar:\n"
            "  - Si aparecen max/min/num relacionados con weekPlan o planTemplate,\n"
            "    esos valores son el limite declarado por el equipo.\n"
            "  - Si no aparecen, el limite se confirma con GET sobre un ID conocido.\n"
            "  - La prueba anterior mostro que ID 3 responde notSupport, por eso esta\n"
            "    version reutiliza el ID 2 para diurno y despues nocturno.\n\n"
            "Esta consulta es de solo lectura: no modifica el dispositivo."
        ),
        method="GET",
        path=path,
        body=None,
    )
    fields = find_schedule_capability_fields(data)
    if fields:
        ok("\nCampos de capacidad relacionados con horarios encontrados:")
        for field, value in fields:
            print(f"  {field} = {value}")
    elif data is not None:
        info(
            "\nEl equipo respondio capacidades, pero no publico un limite numerico "
            "de WeekPlan/PlanTemplate. Se usara el ID 2 ya validado."
        )


def step_probe_schedule_limit(
    client: GatewayClient,
    cfg: dict[str, Any],
    max_probe: int = 16,
) -> None:
    titulo("Paso A3 - Detectar rango de IDs con consultas GET")
    explicar(
        "Capabilities no siempre publica un numero maximo. Para completar la prueba,\n"
        "consultaremos IDs consecutivos empezando en 1, sin escribir nada.\n\n"
        "Por cada ID se consulta WeekPlan y PlanTemplate. Cuando el dispositivo devuelve\n"
        "statusCode=4 / subStatusCode=notSupport, se considera que ese ID queda fuera\n"
        "del rango soportado. Esta prueba es de solo lectura.\n\n"
        f"Se detendra en el primer ID no soportado o, como seguridad, en {max_probe}."
    )
    info(
        "\nSe mostrara el curl exacto de cada GET. "
        "Enter inicia el sondeo | s lo omite | q sale."
    )
    if not client.pause():
        return

    if client.solo_mostrar:
        for schedule_id in range(1, 4):
            for resource in ("UserRightWeekPlanCfg", "UserRightPlanTemplate"):
                path = (
                    f"/ISAPI/AccessControl/{resource}/{schedule_id}"
                    f"?{q_dev(cfg['dev_index'])}"
                )
                comando(client.to_curl("GET", path))
        info(
            "Modo --solo-mostrar: se enseñaron IDs 1..3 como ejemplo; "
            "no se consultó el dispositivo."
        )
        return

    last_supported = 0
    for schedule_id in range(1, max_probe + 1):
        supported = True
        for resource in ("UserRightWeekPlanCfg", "UserRightPlanTemplate"):
            path = (
                f"/ISAPI/AccessControl/{resource}/{schedule_id}"
                f"?{q_dev(cfg['dev_index'])}"
            )
            comando(client.to_curl("GET", path))
            try:
                response = client.session.get(client.url(path), timeout=60)
                try:
                    data = response.json()
                except ValueError:
                    data = {}
            except requests.RequestException as exc:
                err(f"Error de red durante el sondeo: {exc}")
                return

            status_code = data.get("statusCode") if isinstance(data, dict) else None
            sub_status = data.get("subStatusCode") if isinstance(data, dict) else None
            print(
                f"ID {schedule_id} | {resource} | HTTP {response.status_code} | "
                f"statusCode={status_code} | subStatusCode={sub_status}"
            )
            if status_code == 4 and sub_status == "notSupport":
                supported = False

        if not supported:
            break
        last_supported = schedule_id

    if last_supported:
        ok(
            f"\nRango consecutivo detectado: IDs 1..{last_supported}. "
            f"Para esta demo se reutilizara el ID {cfg['test_id']}."
        )
    else:
        err(
            "\nNo fue posible confirmar un ID soportado con el sondeo. "
            "Revisa capacidades, permisos y modelo del dispositivo."
        )


def step_week_plan_for_scenario(
    client: GatewayClient,
    cfg: dict[str, Any],
    scenario: dict[str, Any],
) -> None:
    cal_id = scenario["id"]
    segs = scenario["segments"]
    path = (
        f"/ISAPI/AccessControl/UserRightWeekPlanCfg/{cal_id}"
        f"?{q_dev(cfg['dev_index'])}"
    )
    body = build_week_plan_payload(segs)

    franjas_txt = "\n".join(
        f"    Franja {i}: {b} -> {e}" for i, (b, e) in enumerate(segs, 1)
    )
    extra_night = ""
    if scenario["key"] == "nocturno":
        extra_night = (
            "\n\nPor que 2 franjas y no una sola 22:00-05:00?\n"
            "  En la mayoria de dispositivos Hikvision, cada TimeSegment es del mismo dia\n"
            "  calendario y beginTime debe ser <= endTime. Un rango que cruza las 00:00\n"
            "  se modela partiendo el turno:\n"
            "    - Parte 1 (noche del dia D): 22:00:00 a 23:59:59\n"
            "    - Parte 2 (madrugada del dia D): 00:00:00 a 05:00:00\n"
            "  Asi el personal de turno nocturno queda cubierto de 22:00 a 05:00.\n"
            "  Esta es la prueba critica con el cliente: validar que el equipo acepte\n"
            "  y respete esas dos franjas."
        )

    client.request_step(
        title=(
            f"Paso B - Plan semanal: {scenario['name']} "
            f"(WeekPlan ID {cal_id})"
        ),
        explanation=(
            f"Escenario: {scenario['description']}\n\n"
            "Que hace este paso:\n"
            "  Escribe en el dispositivo el horario semanal (Lunes a Viernes en este demo;\n"
            "  Sabado/Domingo quedan deshabilitados). Ese horario TODAVIA no se aplica\n"
            "  solo a personas: primero debe empaquetarse en una PLANTILLA (paso C).\n\n"
            f"Franjas activas por dia laboral:\n{franjas_txt}\n\n"
            "Campos importantes del JSON:\n"
            "  - enable (del plan): true = plan activo\n"
            "  - WeekPlanCfg[].week: Monday..Sunday\n"
            "  - WeekPlanCfg[].id: numero de franja 1..8\n"
            "  - WeekPlanCfg[].enable: si esa franja cuenta\n"
            "  - TimeSegment.beginTime / endTime: HH:MM:SS hora local del dispositivo\n\n"
            f"El ID {cal_id} de la URL sera el weekPlanNo de la plantilla.\n\n"
            "En la prueba con ambos escenarios este mismo ID se reutiliza:\n"
            "primero se escribe/verifica el diurno y despues se SOBRESCRIBE con el\n"
            "nocturno. Esto evita usar el ID 3, que el equipo reporto notSupport."
            f"{extra_night}"
        ),
        method="PUT",
        path=path,
        body=body,
    )


def step_plan_template_for_scenario(
    client: GatewayClient,
    cfg: dict[str, Any],
    scenario: dict[str, Any],
) -> None:
    cal_id = scenario["id"]
    path = (
        f"/ISAPI/AccessControl/UserRightPlanTemplate/{cal_id}"
        f"?{q_dev(cfg['dev_index'])}"
    )
    body = build_template_payload(
        template_name=scenario["name"],
        week_plan_no=int(cal_id),
        holiday_group_no="",
    )
    client.request_step(
        title=(
            f"Paso C - Plantilla: {scenario['name']} "
            f"(PlanTemplate ID {cal_id})"
        ),
        explanation=(
            "Que hace este paso:\n"
            "  Crea/actualiza la PLANTILLA que une:\n"
            f"    - templateName = '{scenario['name']}'\n"
            f"    - weekPlanNo   = {cal_id}  (el plan semanal del paso B)\n"
            "    - holidayGroupNo = '' (vacio: sin excepciones de festivos en esta prueba)\n\n"
            "Por que hace falta la plantilla:\n"
            "  El usuario no se liga directamente al WeekPlan; se liga al planTemplateNo.\n"
            "  Asi puedes reutilizar el mismo horario en muchas personas.\n\n"
            "Nota: en biometricos faciales, la plantilla 1 suele ser 'acceso todo el dia'.\n"
            f"Usamos y reutilizamos el ID {cal_id}; no tocamos la plantilla 1 y no usamos\n"
            "el ID 3 porque este equipo ya respondio notSupport para ese numero."
        ),
        method="PUT",
        path=path,
        body=body,
    )


def step_verify_scenario(
    client: GatewayClient,
    cfg: dict[str, Any],
    scenario: dict[str, Any],
) -> None:
    cal_id = scenario["id"]
    week_path = (
        f"/ISAPI/AccessControl/UserRightWeekPlanCfg/{cal_id}"
        f"?{q_dev(cfg['dev_index'])}"
    )
    client.request_step(
        title=f"Paso D1 - Verificar plan semanal (GET ID {cal_id})",
        explanation=(
            "Leemos de vuelta el WeekPlan para confirmar que el dispositivo guardo\n"
            "las franjas. En el JSON busca los dias Monday..Friday con enable=true\n"
            "y los beginTime/endTime esperados.\n\n"
            f"Esperado para '{scenario['name']}':\n"
            + "\n".join(
                f"  - {b} -> {e}" for b, e in scenario["segments"]
            )
            + "\n\nSi el nocturno no muestra las 2 franjas, el equipo pudo rechazar el PUT\n"
            "o truncar el payload. Revisa el HTTP status del paso B."
        ),
        method="GET",
        path=week_path,
        body=None,
    )

    tpl_path = (
        f"/ISAPI/AccessControl/UserRightPlanTemplate/{cal_id}"
        f"?{q_dev(cfg['dev_index'])}"
    )
    client.request_step(
        title=f"Paso D2 - Verificar plantilla (GET ID {cal_id})",
        explanation=(
            "Confirmamos que la plantilla apunta al weekPlanNo correcto y esta enable=true.\n"
            f"Debes ver templateName ~ '{scenario['name']}' y weekPlanNo = {cal_id}."
        ),
        method="GET",
        path=tpl_path,
        body=None,
    )


def step_apply_user(client: GatewayClient, cfg: dict[str, Any]) -> None:
    tpl = cfg["user_template_id"]
    path = f"/ISAPI/AccessControl/UserInfo/Modify?{q_dev(cfg['dev_index'])}"
    body = build_user_modify_payload(
        employee_no=cfg["employee_no"],
        name=cfg["employee_name"],
        door_no=int(cfg["door_no"]),
        plan_template_no=str(tpl),
    )
    client.request_step(
        title=(
            f"Paso E - Asignar plantilla {tpl} al usuario "
            f"employeeNo={cfg['employee_no']}"
        ),
        explanation=(
            "Que hace:\n"
            "  Actualiza la persona existente y le pone RightPlan[].planTemplateNo\n"
            f"  = '{tpl}'. A partir de ahi, esa persona solo deberia poder acceder\n"
            "  dentro de las franjas de esa plantilla (sujeto a puerta doorRight).\n\n"
            "Requisitos:\n"
            "  - El usuario ya debe existir en el dispositivo (si no, usa Record en vez de Modify).\n"
            "  - doorNo / doorRight deben coincidir con la puerta real.\n\n"
            "Como validar en sitio con el cliente:\n"
            "  1) Asigna plantilla DIURNA: intentar acceso a las 10:00 (OK) y a las 20:00 (denegado).\n"
            "  2) Asigna plantilla NOCTURNA: intentar ~23:00 (OK), ~03:00 (OK) y ~10:00 (denegado).\n"
            "  Eso demuestra que 22:00-05:00 con 2 franjas funciona de punta a punta."
        ),
        method="PUT",
        path=path,
        body=body,
    )


def show_intro() -> None:
    titulo("Demo HikGateway - Prueba de horarios (cliente)")
    info(
        "Este recorrido es para explicar y PROBAR con el cliente:\n"
        "  1) Consultar capacidades/limites del dispositivo\n"
        "  2) Escribir y verificar el diurno 08:00-17:00 en el ID 2\n"
        "  3) Sobrescribir el MISMO ID 2 con el nocturno 22:00-05:00\n"
        "  4) Verificar que las 2 franjas nocturnas quedaron guardadas\n"
        "  5) Crear/actualizar la plantilla en el mismo orden\n"
        "  6) (Opcional) Asignar la plantilla final a un usuario\n\n"
        "Reutilizar el ID 2 permite aislar la prueba del horario nocturno: el equipo\n"
        "ya reporto que el ID 3 no esta soportado, por lo que no se volvera a usar.\n\n"
        "En cada paso veras la explicacion + el curl exacto.\n"
        "  Enter = ejecutar | s = saltar | q = salir\n"
        "Tip PowerShell: usa curl.exe (no el alias de Invoke-WebRequest)."
    )


# ===========================================================================
# PARTE 7 - Linea de comandos y flujo principal (main)
# ===========================================================================

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description=(
            "Demo cliente: horarios diurno (08-17) y nocturno (22-05) "
            "via HikGateway, con explicacion detallada y curl por paso."
        )
    )
    p.add_argument(
        "--solo-mostrar",
        action="store_true",
        help="Solo imprime los comandos curl; no llama al gateway.",
    )
    p.add_argument(
        "--sin-usuario",
        action="store_true",
        help="No pregunta ni ejecuta asignacion a usuario.",
    )
    p.add_argument(
        "--host",
        default=None,
        help="URL del gateway (si se omite, se pregunta).",
    )
    p.add_argument(
        "--dev-index",
        default=None,
        help="UUID AccessControl.",
    )
    p.add_argument(
        "--escenario",
        choices=("diurno", "nocturno", "ambos"),
        default=None,
        help="Fija el escenario sin preguntar.",
    )
    return p.parse_args()


def main() -> int:
    enable_windows_ansi()
    args = parse_args()
    show_intro()

    conn = prompt_connection(host_arg=args.host)
    cfg: dict[str, Any] = {
        **conn,
        "dev_index": (args.dev_index or "").strip(),
        "scenarios": [],
        "apply_user": False,
        "user_template_id": "",
        "employee_no": "1596",
        "employee_name": "Usuario Demo",
        "door_no": "1",
        "test_id": "2",
    }

    if args.escenario:
        if args.escenario == "diurno":
            scs = [SCENARIO_DAY]
        elif args.escenario == "nocturno":
            scs = [SCENARIO_NIGHT]
        else:
            scs = [SCENARIO_DAY, SCENARIO_NIGHT]
        # Ambos escenarios reutilizan el mismo ID soportado. El segundo sobrescribe
        # al primero, lo que permite probar el nocturno sin depender del ID 3.
        cfg["scenarios"] = [{**s, "id": "2"} for s in scs]
        cfg["apply_user"] = not args.sin_usuario
        if cfg["apply_user"]:
            cfg["user_template_id"] = cfg["scenarios"][0]["id"]
        info(
            "Escenario fijo por argumento: "
            + ", ".join(f"{s['name']} ID={s['id']}" for s in cfg["scenarios"])
        )
    else:
        prompt_demo_options(cfg)
        if args.sin_usuario:
            cfg["apply_user"] = False

    print(
        f"\n{C.BOLD}Resumen de la sesion{C.RESET}\n"
        f"  Host: {cfg['host']}\n"
        f"  Usuario gateway: {cfg['user']}\n"
        f"  DEV_INDEX: {cfg['dev_index'] or '(se obtendra al listar)'}\n"
        f"  Escenarios: "
        + ", ".join(
            f"{s['name']}[ID {s['id']}]" for s in cfg["scenarios"]
        )
        + f"\n  Asignar a usuario: "
        f"{'si -> plantilla ' + cfg['user_template_id'] if cfg['apply_user'] else 'no'}\n"
        f"  Modo: {'solo curl' if args.solo_mostrar else 'ejecutar en gateway'}"
    )

    client = GatewayClient(
        host=cfg["host"],
        user=cfg["user"],
        password=cfg["password"],
        solo_mostrar=args.solo_mostrar,
    )

    step_list_devices(client, cfg)

    if not cfg.get("dev_index"):
        if args.solo_mostrar:
            cfg["dev_index"] = "00000000-0000-0000-0000-000000000000"
            info(f"DEV_INDEX de ejemplo para curls: {cfg['dev_index']}")
        else:
            err("No se puede continuar sin DEV_INDEX.")
            return 1

    step_access_capabilities(client, cfg)
    step_probe_schedule_limit(client, cfg)

    for scenario in cfg["scenarios"]:
        titulo(
            f"=== Prueba secuencial en ID {scenario['id']}: "
            f"{scenario['name']} ({scenario['description']}) ==="
        )
        step_week_plan_for_scenario(client, cfg, scenario)
        step_plan_template_for_scenario(client, cfg, scenario)
        step_verify_scenario(client, cfg, scenario)

    if cfg.get("apply_user"):
        step_apply_user(client, cfg)

    titulo("Demo finalizado - que validar con el cliente")
    ok(
        "Flujo: listar dispositivo -> WeekPlan -> PlanTemplate -> GET verify "
        "-> (opcional) UserInfo.Modify."
    )
    info(
        "Checklist de aceptacion:\n"
        "  [ ] Capabilities se consulto antes de escribir\n"
        "  [ ] Diurno 08:00-17:00 queda en WeekPlan ID 2 y GET lo confirma\n"
        "  [ ] El mismo ID 2 se sobrescribe con el nocturno\n"
        "  [ ] GET confirma 22:00-23:59:59 y 00:00-05:00 en WeekPlan ID 2\n"
        "  [ ] PlanTemplate ID 2 apunta a weekPlanNo 2\n"
        "  [ ] Para prueba fisica diurna, ejecutar solo escenario diurno y asignar usuario\n"
        "  [ ] Para prueba fisica nocturna, ejecutar solo escenario nocturno; acceso OK\n"
        "      ~23:00 y ~03:00, y denegado a media manana\n\n"
        "Documentacion: Documentacion/HikGateway.postman_collection.json "
        "(Access Control Devices -> Calendarios)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
