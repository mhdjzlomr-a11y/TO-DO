@echo off
title Open ONE DAY in Chrome
cd /d "%~dp0"
echo Opening ONE DAY Routine Tracker in Google Chrome...

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "%~dp0index.html"
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" "%~dp0index.html"
) else (
    start "" "%~dp0index.html"
)

exit