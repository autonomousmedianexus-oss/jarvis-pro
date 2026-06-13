@echo off
setlocal
REM Starts the local Jarvis restore stack through the PowerShell helper.
powershell -ExecutionPolicy Bypass -File "%~dp0start-jarvis.ps1"
endlocal
