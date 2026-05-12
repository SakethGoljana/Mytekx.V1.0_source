@echo off
title MyTekX Launcher
echo ===================================================
echo             Starting MyTekX Services
echo ===================================================
echo.

echo [1/2] Starting Backend Server...
cd backend
start "MyTekX Backend" cmd /k "npm install && node server.js"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo [2/2] Opening Frontend in Default Browser...
cd ..
start index.html

echo.
echo ===================================================
echo MyTekX is now running! 
echo Keep the backend terminal open to use the chatbot.
echo ===================================================
pause
