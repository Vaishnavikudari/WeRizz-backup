@echo off
title MAVORA All-in-One Launcher
cd /d "%~dp0"

echo =========================================================
echo       MAVORA - STARTING ALL SERVICES
echo =========================================================

echo [1/3] Starting Backend API on http://localhost:8000 ...
start "1 - MAVORA Backend" cmd /k "cd /d "%~dp0" && .\venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 >nul

echo [2/3] Starting Frontend UI on http://localhost:5173 ...
start "2 - MAVORA Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0 --port 5173"

timeout /t 3 >nul

echo [3/3] Generating Public Mobile Tunnel URL...
start "3 - Mobile Link (Do Not Close)" cmd /k "echo ========================================================= & echo ENTER THIS IP IF PROMPTED FOR PASSWORD: & curl -s https://loca.lt/mytunnelpassword & echo. & echo ========================================================= & echo. & npx --yes localtunnel --port 5173"

echo.
echo All services launched!
echo Check window "3 - Mobile Link" for your active phone link!
pause
