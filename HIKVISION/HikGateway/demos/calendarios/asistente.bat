@echo off
setlocal
cd /d "%~dp0"
title Asistente de horarios - HikGateway

where python >nul 2>&1
if errorlevel 1 (
  echo No se encontro Python en este equipo.
  echo Instalalo desde https://www.python.org/downloads/ y vuelve a intentar.
  pause
  exit /b 1
)

python -c "import requests" 1>nul 2>nul
if errorlevel 1 (
  echo Preparando el asistente por primera vez...
  python -m pip install -r requirements.txt
)

python "%~dp0asistente.py"
echo.
pause
