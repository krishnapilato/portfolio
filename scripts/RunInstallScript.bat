@echo off
setlocal

echo Running installer...
powershell -ExecutionPolicy Bypass -File "%~dp0/src/InstallApplications.ps1"

pause
endlocal