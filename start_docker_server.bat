pushd "%~dp0"
echo "--- PRAXIA ONE DOCKER SERVER STARTING (WINDOWS) ---"
docker-compose up --build -d
echo "--- ALL SERVICES RUNNING AT http://localhost:3000 ---"
echo "Attempting to pull DeepSeek model natively on the host machine..."
ollama pull deepseek-r1:8b
echo "Attempting to pull Med42 model natively on the host machine..."
ollama pull hf.co/RichardErkhov/m42-health_-_Llama3-Med42-8B-gguf:Q4_K_M
pause
