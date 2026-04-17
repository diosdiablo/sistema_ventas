@echo off
TITLE Vanta POS Server
echo =========================================
echo       Iniciando Servidor Vanta POS...
echo =========================================
echo.

:: Cambia el directorio actual adonde este archivo .bat se encuentra
cd /d "%~dp0"

echo Encendiendo el servidor local...
:: Abre el navegador predeterminado (puede demorar un segundo en cargar)
start http://localhost:5173

:: Ejecuta el servidor Vite
call npm run dev

pause
