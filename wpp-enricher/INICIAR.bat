@echo off
setlocal
cd /d "%~dp0"
title WhatsApp - Enriquecer planilha

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar.ps1"
set "WPP_EXIT=%ERRORLEVEL%"

echo.
if not "%WPP_EXIT%"=="0" echo O programa terminou com erro. Veja a mensagem acima.
pause
exit /b %WPP_EXIT%
