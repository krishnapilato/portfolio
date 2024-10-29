@echo off
setlocal

echo Running installer...
powershell -ExecutionPolicy Bypass -File "%~dp0InstallApplications.ps1"

pause
endlocal