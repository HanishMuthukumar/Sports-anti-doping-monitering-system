@echo off
title Django Backend Server (Port 8000)
echo ========================================================
echo   Starting Django Backend on http://localhost:8000 ...
echo ========================================================
cd /d %~dp0
backend\.venv\Scripts\python.exe backend\manage.py runserver 0.0.0.0:8000
pause
