pushd "%~dp0"
echo "--- PRAXIA ONE DOCKER SERVER STARTING (WINDOWS) ---"
docker-compose up --build -d
echo "--- ALL SERVICES RUNNING AT http://localhost:3000 ---"
echo "Waiting 15 seconds for Ollama server to initialize inside the container..."
timeout /t 15 /nobreak > NUL

echo "Attempting to pull DeepSeek model into Ollama container..."
docker-compose exec -T ollama ollama pull deepseek-r1:8b
echo "Attempting to pull Med42 model into Ollama container..."
docker-compose exec -T ollama ollama pull hf.co/RichardErkhov/m42-health_-_Llama3-Med42-8B-gguf:Q4_K_M
pause
