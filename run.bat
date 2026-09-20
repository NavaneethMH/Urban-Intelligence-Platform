@echo off
echo =========================================================================
echo INNOVEXA - AI-Powered Mobile Urban Intelligence Platform
echo Problem Statement 26124 (BEL / Smart Automation / SIH 2025)
echo =========================================================================
echo.

echo Starting Central FastAPI Backend on http://127.0.0.1:8000 ...
start "INNOVEXA Backend API" python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

echo Starting Web Frontend HTTP Server on http://127.0.0.1:8080 ...
cd frontend
start "INNOVEXA Web Command Center" python -m http.server 8080

echo Opening INNOVEXA Command Center in default browser...
timeout /t 2 >nul
start http://127.0.0.1:8080

echo.
echo INNOVEXA Platform is now running!
echo - Web UI: http://127.0.0.1:8080
echo - Backend API Docs: http://127.0.0.1:8000/docs
echo Press any key to stop...
pause >nul
