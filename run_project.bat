@echo off
title Sports Anti-Doping Monitoring System Runner
echo ========================================================
echo   SPORTS ANTI-DOPING MONITORING SYSTEM
echo   Starting Backend (Django) and Frontend (React/Vite)
echo ========================================================
echo.

echo [1/2] Launching Django Backend Server (Port 8000)...
start "Backend - Django Server" cmd /k "cd /d %~dp0 && backend\.venv\Scripts\python.exe backend\manage.py runserver 0.0.0.0:8000"

timeout /t 2 /nobreak >nul

echo [2/2] Launching React Frontend Server (Port 5173)...
start "Frontend - Vite React Portal" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Both servers have been launched successfully!
echo.
echo   Frontend URL: http://localhost:5173
echo   Backend API:  http://localhost:8000/api/
echo   Admin Panel:  http://localhost:8000/admin/
echo.
echo   Demo Logins (Password for all: Demo@1234):
echo   - Administrator:       admin@demo.sadms
echo   - Athlete:             athlete@demo.sadms
echo   - Doping Officer:      officer@demo.sadms
echo   - Laboratory Staff:    lab@demo.sadms
echo   - Sports Authority:    authority@demo.sadms
echo ========================================================
echo.
pause
