#!/bin/bash
echo "--- PRAXIA ONE DOCKER SERVER STARTING (LINUX/MAC) ---"
docker-compose up --build -d
echo "--- ALL SERVICES STARTING ON HOST 72.60.163.124 (App: 3010, DB: 8010) ---"
echo "Attempting to pull DeepSeek model into Ollama container..."
docker exec -it praxiaone3-ollama-1 ollama run deepseek-r1:8b
echo "Attempting to pull Med42 model into Ollama container..."
docker exec -it praxiaone3-ollama-1 ollama run hf.co/RichardErkhov/m42-health_-_Llama3-Med42-8B-gguf:Q4_K_M
