@echo off
setlocal
echo 🍵 Starting PraxiaOne Web Version...

:: Start Redis and Qdrant (Docker required for Redis)
echo [SYSTEM] Starting Redis and Qdrant...
start /B "Praxia Redis" cmd /c "docker run -p 6379:6379 -d redis:latest"
start /B "Praxia Qdrant" cmd /c "cd qdrant && .\qdrant.exe"

:: Start Backend (Python)
echo [BACKEND] Starting Django API on http://0.0.0.0:8000...
start /B "Praxia Backend" cmd /c "cd backend && python manage.py runserver 0.0.0.0:8000"

:: Start Frontend (Next.js)
echo [FRONTEND] Starting Web Dashboard on http://localhost:3000...
start /B "Praxia Frontend" cmd /c "cd frontend && npm run dev"

echo 🚀 Done! Web services are spinning up...
echo 💡 Backend: http://localhost:8000
echo 💡 Frontend: http://localhost:3000
pause
