# 🎨 PraxiaOne Frontend: Wellness Dashboard

This is the Next.js 15 powered web dashboard for PraxiaOne. It features a modern, high-fidelity UI with real-time vitals tracking, medication management, and AI-driven health insights.

## 🚀 Recent UI Enhancements
- **Hover Sidebar**: Optimized space usage with an auto-hiding sidebar that reveals on mouse-over.
- **Medication Tracker**: Full-featured UI for managing prescriptions and supplements.
- **Live Vitals Feed**: Real-time polling of pulse, blood oxygen, and glucose levels.
- **Glassmorphic Design**: Clean, modern cards with backdrop blur and vibrant gradients.

## 🛠️ Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Create a `.env.local` if you need to point to a custom API:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Access Dashboard**:
   Open [http://localhost:3000](http://localhost:3000)

## 📁 Key Directories
- `/app`: Routing and page components.
- `/components`: Reusable UI modules (Sidebar, Shell, Charts).
- `/lib`: API fetching utilities and helpers.
- `/theme`: MUI theme configuration.

## 🏗️ Architecture
- **Framework**: Next.js 15 (App Router)
- **UI Library**: MUI (Material UI)
- **Icons**: Material Icons (Cake, EventNote, Medication)
- **Theme**: Custom Responsive Dark/Light modes.
