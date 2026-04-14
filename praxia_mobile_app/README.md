# 📱 PraxiaMobile: Your Personal Wellness Companion

The mobile companion app for the PraxiaOne platform, built with Flutter.

## ✨ Key Features
- **Health Score**: Real-time summary of your wellness (78/100).
- **Vitals Dashboard**: Pulse, sleep, and steps at a glance.
- **AI Assistant**: Context-aware health chat for instant guidance.
- **8-Week Forecast**: Predictive health trends modeled from your data.
- **Data Integration**: Connect to Apple Health, Google Fit, and medical hardware.

## 🛠️ Getting Started

1. **Prerequisites**:
   - Flutter SDK (stable)
   - Android Emulator or Physical Device

2. **Run Application**:
   ```bash
   flutter run -d emulator-5554 --no-dds
   ```

3. **Login**:
   Use `demo_user` / `demo123` to access the full features with stored JWTs.

## 📁 Key Directories
- `/lib/main.dart`: Entry point.
- `/lib/screens`: All 9 screens (Score, Vitals, Chat, etc.).
- `/lib/api_service.dart`: Centralized Django REST API connector.
- `/lib/widgets`: Custom UI components (Glassmorphism, Charts).

## 🔌 API Connectivity
This app connects to the PraxiaOne backend on **Port 8000** for JWT authentication and live data syncing.
