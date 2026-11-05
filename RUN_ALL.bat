@echo off
title MAVORA - Memory Assistant
cd /d "%~dp0"

echo ===================================================
echo [1/3] Starting MAVORA Backend on Port 8000...
echo ===================================================
start "MAVORA Backend (Port 8000)" cmd /k "cd /d "%~dp0" && .\venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 >nul

echo ===================================================
echo [2/3] Starting MAVORA Frontend on Port 5173...
echo ===================================================
start "MAVORA Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0 --port 5173"

timeout /t 4 >nul

echo ===================================================
echo [3/3] Starting Public Mobile Tunnel (Localtunnel)...
echo ===================================================
start "MAVORA Public Mobile Link" cmd /k "echo Getting Public IP Password... & curl -s https://loca.lt/mytunnelpassword & echo. & echo Enter that IP password above when visiting the URL below! & echo. & npx --yes localtunnel --port 5173"

echo.
echo All 3 services started in their own dedicated windows!
echo Check the 'MAVORA Public Mobile Link' window for your public URL.
pause
