# PraxiaOne Production Server Deployment

This document instructs you on how to prepare a remote VPS (AWS EC2, DigitalOcean, or Azure) to successfully run the PraxiaOne services, ensuring your Flutter App and Web Dashboard connect securely.

## 1. Prerequisites (Server Machine Specs)
Deploying LLMs (like Ollama) and Vector Databases locally requires minimum specs:
- **RAM**: Minimum 8GB (16GB recommended for LLMs caching).
- **CPU**: 4+ Cores
- **OS**: Ubuntu 22.04 LTS
- **Git** & **Docker Compose** installed.

## 2. Server Initial Configuration

SSH to your newly created VPS:
```bash
ssh root@YOUR_SERVER_IP
```

Install Git and Docker if not present:
```bash
sudo apt update && sudo apt install git docker.io docker-compose -y
sudo systemctl enable docker && sudo systemctl start docker
```

## 3. Uploading & Building the Code
Clone your repository containing this project structure:
```bash
git clone https://github.com/YOUR_ORGINIZATION/praxiaone3.git
cd praxiaone3
```

> [!IMPORTANT]
> Because you are deploying for production, ensure `.env` file credentials are changed from defaults before starting. Provide actual secure passwords for MySQL in `docker-compose.yml`.

Start the services sequentially:
```bash
# Start background services first: Database, Redis, VectorDB, Ollama
docker-compose up -d db redis qdrant ollama

# Build and start Django and Celery Workers
docker-compose up --build -d backend celery_worker

# Build and start Next.js frontend
docker-compose up --build -d frontend
```

Verify everything is up without crashing:
```bash
docker-compose ps
```

## 4. Reverse Proxy & SSL (Allowing Mobile App Connects)

iOS and Android will automatically block plaintext HTTP traffic in production. You **must** wrap your raw `8000` port with an NGINX proxy so the app connects to port `443` over `https://`.

Install NGINX & Certbot:
```bash
sudo apt install nginx -y
sudo apt install certbot python3-certbot-nginx -y
```

Set up NGINX to proxy the Django Backend (Port 8000) and Next.js (Port 3000):
```nginx
# /etc/nginx/sites-available/praxiaone
server {
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable your site and get a free SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/praxiaone /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d api.yourdomain.com
```

## 5. Integrating with Mobile Flutter Application

Once your API responds at `https://api.yourdomain.com`, update your Flutter source code before publishing:

**`lib/api_service.dart`**
```dart
class ApiService {
  // Switch to your production domain:
  static const String baseUrl = 'https://api.yourdomain.com/api'; 
  ...
}
```

Run a flutter build test:
```bash
flutter clean && flutter pub get
flutter build apk --release
```
