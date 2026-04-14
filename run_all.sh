#!/bin/bash

echo "🍵 Starting PraxiaOne Full Stack..."

# Start Redis and Qdrant (Docker required for Redis)
echo "[SYSTEM] Starting Redis and Qdrant..."
docker run -p 6379:6379 -d redis:latest &
(cd qdrant && ./qdrant) &

# Start Backend (Python)
echo "[BACKEND] Starting Django API on http://0.0.0.0:8000..."
(cd backend && source .venv/bin/activate && python manage.py runserver 0.0.0.0:8000) &

# Start Frontend (Next.js)
echo "[FRONTEND] Starting Web Dashboard on http://localhost:3000..."
(cd frontend && npm run dev) &

# Start Mobile (Flutter)
echo "[MOBILE] Starting Flutter App..."
(cd praxia_mobile_app && flutter run -d emulator-5554 --no-dds) &

echo "🚀 All services are initializing in the background..."
echo "💡 Backend: http://localhost:8000"
echo "💡 Frontend: http://localhost:3000"
wait
