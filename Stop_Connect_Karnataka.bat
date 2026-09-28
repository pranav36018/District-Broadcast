@echo off
title Stop Connect Karnataka
echo Stopping Connect Karnataka background server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul
echo Done! Connect Karnataka server has been stopped.
timeout /t 2 >nul
exit
