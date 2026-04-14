# 📱 Testing on Real Android & iOS Devices

This guide explains how to run the **PraxiaMobile** app on your actual physical phone rather than the emulator.

## 🛜 IMPORTANT: Network Configuration
Real devices cannot access the backend using `localhost` or `10.0.2.2`. They must use your computer's **Local IP Address**.

1. **Find your Computer's Local IP**:
   - Open Command Prompt (Windows) and type `ipconfig`.
   - Look for **IPv4 Address** (e.g., `192.168.1.X`).
   - *Ensure your phone and computer are on the same Wi-Fi.*

2. **Update the Flutter App**:
   - Open `praxia_mobile_app/lib/api_service.dart`.
   - Update `baseUrl`:
   ```dart
   // REPLACE 10.0.2.2 with your actual IPv4 address
   static const String baseUrl = 'http://192.168.1.X:8000/api';
   ```

3. **Check Backend Accessibility**:
   - Your Django backend must be running on `0.0.0.0` or your local IP (not just `127.0.0.1`).
   - Use the `run_all.bat` or manually: `python manage.py runserver 0.0.0.0:8000`.

---

## 🤖 Android: Physical Device Setup

1. **Enable Developer Options**:
   - Go to **Settings > About Phone**.
   - Tap **Build Number** 7 times until you see "You are now a developer!".
2. **Enable USB Debugging**:
   - Go to **Settings > System > Developer Options**.
   - Toggle **USB Debugging** to ON.
3. **Connect & Trust**:
   - Plug your phone into your computer via USB.
   - A prompt will appear on your phone: "Allow USB Debugging?". Tap **Allow**.
4. **Run the App**:
   ```bash
   cd praxia_mobile_app
   flutter devices  # Ensure your phone is listed
   flutter run
   ```

---

## 🍎 iOS: Physical Device Setup (Requires Mac)

1. **Prerequisites**:
   - A physical iPhone and a Mac with the latest **Xcode**.
   - A USB-to-Lightning/USB-C cable.
2. **Open iOS Project**:
   - Open `praxia_mobile_app/ios/Runner.xcworkspace` in Xcode.
3. **Configure Signing**:
   - Select the `Runner` project in the left sidebar.
   - Go to **Signing & Capabilities**.
   - Select a **Team** (you can use a free personal Apple ID account).
   - Change the **Bundle Identifier** if needed (e.g., `com.yourname.praxia`).
4. **Trust the Computer**:
   - Connect the iPhone to your Mac.
   - On the iPhone, tap **Trust** if prompted.
5. **Trust the Developer Profile**:
   - On the iPhone, go to **Settings > General > VPN & Device Management**.
   - Find your Apple ID under "Developer App" and tap **Trust**.
6. **Run the App**:
   ```bash
   flutter run
   ```

---

## 🛠️ Troubleshooting

- **Connection Refused**: Double-check that your computer's firewall isn't blocking Port 8000.
- **Device Not Found**: Check your USB cable or try a different port. Ensure "File Transfer" (MTP) mode is enabled on Android.
- **Xcode Error "Provisioning Profile Required"**: Follow the iOS Signing steps above to link your Apple ID.
