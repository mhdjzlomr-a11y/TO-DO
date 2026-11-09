@echo off
title Push TO-DO App to GitHub
cd /d "%~dp0"
echo ========================================================
echo        PUSH TO GITHUB: TO-DO (PWA Next.js)
echo ========================================================
echo.

set "GIT_PATH=C:\Program Files\Git\cmd\git.exe"
if not exist "%GIT_PATH%" (
    set "GIT_PATH=git"
)

echo Adding all files...
"%GIT_PATH%" add .

echo Committing...
"%GIT_PATH%" commit -m "Initial commit: Daily Task Tracker PWA with Taskati theme, Dhikr counters, Reading options, and Push notifications"

echo Setting branch to main...
"%GIT_PATH%" branch -M main

echo Pushing to https://github.com/mhdjzlomr-a11y/TO-DO.git...
"%GIT_PATH%" push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! All code has been pushed to GitHub!
    echo ========================================================
) else (
    echo If push failed, check your internet connection or git authentication.
)

echo.
pause
