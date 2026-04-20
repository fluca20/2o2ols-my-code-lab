@echo off
echo 📦 MyCodeLab - Launcher unificato
echo.
echo 1) Avvia menu principale (Dashboard)
echo 2) Avvia Dashboard Settimanale
echo 3) Avvia AI Advisor
echo 4) Apri documentazione
echo.
set /p scelta="Scegli (1-4): "
if "%scelta%"=="1" start tools\launcher\index.html
if "%scelta%"=="2" start tools\weekly-dashboard\index.html
if "%scelta%"=="3" start tools\ai-advisor\index.html
if "%scelta%"=="4" start docs\README.md