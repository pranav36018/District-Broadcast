@echo off
title Connect Karnataka Launcher
cd /d "%~dp0"

:: Kill any existing node processes
taskkill /f /im node.exe >nul 2>&1

:: Start unified server (API + Database + Live Frontend) in background
start "Connect Karnataka Unified Server" /min cmd /c "node server/index.js"
timeout /t 3 /nobreak >nul

:: Open browser to the single unified URL (port 5000)
start http://localhost:5000
exit

