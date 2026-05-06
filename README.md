# 🍵 PraxiaOne: AI-Driven Personalized Wellness

PraxiaOne is a cutting-edge health platform that integrates data from wearables, labs, and EHRs to provide **continuously understood** health insights. Using AI-driven simulations, it predicts future health scores and offers personalized recommendations to improve wellness.

## 🚀 Key Features

*   **Unified Dashboard**: Real-time health score (78/100) and vitals tracking.
*   **Actual Bluetooth Scanning**: Discover and pair with nearby rings, watches, and medical hardware (Oura, Polar, etc).
*   **Medication Tracker**: Integrated scheduling and tracking for prescriptions and supplements.
*   **AI Memory (Qdrant)**: High-performance vector database for personalized health context and document ingestion.
*   **Demo Hybrid Mode**: Built-in "Simulated Scanning" for perfect emulator demonstrations!
*   **AI Assistant**: Context-aware health guidance powered by medical data.
*   **8-Week Forecast**: Predictive modeling of health trends based on current behavior.
*   **Modern UI**: Sleek, hover-to-reveal navigation and glassmorphism design.
*   **Data Integration**: Secure connection to Amazon One Medical, Apple Health, Fitbit, and more.

---

## 🏗️ Architecture

*   **Frontend**: Next.js (Web) & Flutter (Mobile)
*   **Backend**: Django REST Framework (Python)
*   **Vector Database**: Qdrant (for AI Memory & RAG)
*   **Database**: MySQL (Docker-Ready) / SQLite (Local Dev)
*   **AI Engine**: Custom predictive scoring and simulation engine.

---

## ⚡ Quick Start (Automation)

The easiest way to start both the Web dashboard, Backend API, and Mobile app:

**For Windows (CMD/PowerShell):**
```bash
./run_all.bat
```

**For Linux/macOS (Terminal):**
```bash
chmod +x run_all.sh
./run_all.sh
```

---

## 🐳 Docker Setup
Run the full stack (DB + API + Next.js) using the root `docker-compose.yml`:
```bash
docker-compose up --build -d
./docker.md  # Read for more details
```

## 🔒 Security & Compliance
*   **HIPAA Compliant** architecture.
*   **Secure & Encrypted** data storage.
*   **User Controlled Consent** for all data sharing.

---

## 📜 License
© 2026 PraxiaOne. All rights reserved.
