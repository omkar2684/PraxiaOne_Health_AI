# PraxiaOne Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    default-mysql-client \
    default-libmysqlclient-dev \
    pkg-config \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install mysqlclient

# Copy Django project
COPY . .

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media

# Expose port
EXPOSE 8000

# Default command (can be overridden)
CMD ["gunicorn", "praxiaone.wsgi:application", "--bind", "0.0.0.0:8000"]
