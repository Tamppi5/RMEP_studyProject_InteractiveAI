FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose Flask port
EXPOSE 5001

# Run Flask in development mode with host 0.0.0.0 to allow external connections
CMD ["flask", "run", "--host=0.0.0.0", "--port=5001", "--debug"]
