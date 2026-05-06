@echo off
echo Starting PraxiaOne Natively on Windows (No Docker)...
echo =======================================================

echo 1. Starting Qdrant Vector Database...
start "Qdrant Vector DB" cmd /c "cd qdrant && qdrant.exe"

echo 2. Starting Django Backend AI Server...
start "Django Backend Server" cmd /c "cd backend && .venv\Scripts\activate.bat && python manage.py runserver"

echo 3. Starting Next.js Frontend Server...
start "NextJS Frontend" cmd /c "cd frontend && npm run dev"

echo =======================================================
echo All servers have been triggered! 
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Qdrant DB: http://localhost:6333
echo You can safely close this orchestrator window.
pause
