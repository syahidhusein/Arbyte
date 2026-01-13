#!/bin/bash

# 1. Start Ollama in background so it listens on localhost:11434
ollama serve &

# 2. Wait for it to wake up
sleep 5

# 3. Download the model your code asks for (llama3.2)
ollama pull llama3.2

# 4. Start your Python code
# This command looks for 'backend.py' and the 'app' object inside it
exec gunicorn --bind 0.0.0.0:$PORT backend:app --timeout 120