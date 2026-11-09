@echo off
title Daily Task Tracker PWA (Taskati)
cd /d "%~dp0"
echo ========================================================
echo        DAILY TASK TRACKER PWA - TASKATI THEME
echo ========================================================
echo.

set "PATH=C:\Users\HP\nodejs;%PATH%"

echo Opening browser at http://localhost:3000...
start "" "http://localhost:3000"

echo To open on your mobile phone (same Wi-Fi), visit:
echo http://192.168.0.115:3000
echo.

node node_modules\next\dist\bin\next dev -H 0.0.0.0 -p 3000

pause
