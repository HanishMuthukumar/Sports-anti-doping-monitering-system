@echo off
title React Frontend Server (Port 5173)
echo ========================================================
echo   Starting Vite React Frontend on http://localhost:5173 ...
echo ========================================================
cd /d %~dp0frontend
npm run dev
pause
