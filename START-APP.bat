@echo off
title Daily Task Tracker PWA (Taskati)
cd /d "%~dp0"
echo ========================================================
echo        DAILY TASK TRACKER PWA - TASKATI THEME
echo ========================================================
echo.

set "PATH=C:\Users\HP\nodejs;%PATH%"

echo Starting Next.js PWA server on http://localhost:3000...
start "" "http://localhost:3000"
npm run dev

pause
