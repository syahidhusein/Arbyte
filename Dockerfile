FROM python:3.10.19-slim

# Install system tools
RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy YOUR backend.py and other files into the container
COPY . .

# Environment setup
ENV PORT=5000
EXPOSE 5000
RUN chmod +x start.sh

CMD ["./start.sh"]