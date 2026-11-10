@echo off
title ONE DAY - Daily Routine Tracker PWA
cd /d "%~dp0"
echo ========================================================
echo        ONE DAY - DAILY ROUTINE TRACKER PWA
echo ========================================================
echo.

set "PATH=C:\Users\HP\nodejs;%PATH%"

echo Opening browser at http://localhost:3000...
start "" "http://localhost:3000"

node serve.js

pause