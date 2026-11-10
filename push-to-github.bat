@echo off
title Push ONE DAY to GitHub
cd /d "%~dp0"
echo ========================================================
echo        PUSH TO GITHUB: ONE DAY (TO-DO PWA)
echo ========================================================
echo.

set "GIT_PATH=C:\Program Files\Git\cmd\git.exe"
if not exist "%GIT_PATH%" (
    set "GIT_PATH=git"
)

echo Adding all files...
"%GIT_PATH%" add .

echo Committing...
"%GIT_PATH%" commit -m "Deploy standalone zero-latency ONE DAY PWA with permanent GitHub Pages hosting"

echo Setting branch to main...
"%GIT_PATH%" branch -M main

echo Pushing to https://github.com/mhdjzlomr-a11y/TO-DO.git...
"%GIT_PATH%" push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! All code has been pushed to GitHub Pages!
    echo ========================================================
) else (
    echo If push failed, check your internet connection or git authentication.
)

echo.
pause