# 🫀 Heartbeat Heist — A Body-Controlled 3D Escape Room

**Heartbeat Heist** is an immersive, sci-fi browser-based escape room powered by the **Presage SmartSpectra SDK**. Players infiltrate a futuristic high-security museum after hours to retrieve the quantum *Resonant Core*. The museum's biometric defense grid detects panic and irregular heartbeats. To escape, **the player's real-time physiological vitals—captured through their webcam using SmartSpectra—become the game's controls.**

---

## 🎮 Game Concept & Rooms

### Stage 1: The Laser Corridor
- **Challenge:** The player navigates a high-voltage laser security grid composed of 3 sequential barrier gates.
- **Biometric Mechanic:** The security grid detects irregular or hyperventilating respiration. The player must maintain a calm, stable breathing rhythm (10–16 BrPM).
- **Feedback:** As breathing stabilizes, laser voltages drop, ruby-red beams shift to electric cyan, and the gates power down one by one.

### Stage 2: The Pulse Vault
- **Challenge:** A heavy circular titanium vault door guarded by 3 concentric rotating glyph rings and a central biometric core.
- **Biometric Mechanic:** The biometric lock requires the player to match their cardiac pulse rate to the resonant frequency of each security tumbler (calibrated around the player's resting heart rate). The player must hold their pulse in the resonance window for 3–4 sustained seconds.
- **Feedback:** The central biometric core pulses in size and color in exact synchrony with the player's real heartbeat. As tumblers lock, mechanical gears clank into place, steam vents release, and the vault door rotates open.

### Stage 3: The Breath Bridge
- **Challenge:** A bottomless museum atrium abyss separating the vault from the extraction portal.
- **Biometric Mechanic:** A quantum holographic bridge that collapses into the void without synchronized breathing. Each full, deep breath cycle (inhale $\rightarrow$ exhale) energizes and crystallizes 1 of 5 floating crystal platforms.
- **Feedback:** With each deep breath, harmonic chimes sound, holographic platforms solidify, and once all 5 segments are energized, an energy pathway connects to the escape portal.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19, TypeScript, Vite
- **3D Graphics & Shaders:** Three.js (procedural cyber-museum environments, laser beams, rotating biometric vault, crystal bridge, dynamic particle fog)
- **Physiological Sensing:**
  - **Presage SmartSpectra SDK:** Native C-API runtime via `@smartspectra/node-sdk` WebSocket bridge (`server/bridge.cjs`) streaming real-time pulse and respiration metrics.
  - **Browser Optical rPPG Sensor:** In-browser fallback camera analyzer sampling forehead skin micro-coloration fluctuations via `getUserMedia`.
  - **Interactive Demo Simulator:** Deterministic keyboard & slider controls with full stage-bypass support for offline or presentation environments.
- **Audio Architecture:** Procedural **Web Audio API** synthesizer (zero external sound file dependencies; real-time heartbeat thump synchronized with player's actual BPM, breath flow noise filter, laser alarms, and harmonic crystal chimes).
- **Styling:** Tailwind CSS with custom neon glowing effects, CRT scanlines, and sci-fi glassmorphism HUD panels.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v20+ (v24 LTS recommended)
- **Webcam:** Any standard USB or built-in laptop webcam

### 2. Environment Configuration
Create a `.env` file in the repository root (or copy from `.env.example`):
```env
# Presage Technologies / SmartSpectra SDK Configuration
# Register and get your key at: https://physiology.presagetech.com/auth/register
SMARTSPECTRA_API_KEY=your_presage_api_key_here
PRESAGE_API_KEY=your_presage_api_key_here
```

### 3. Installation
```bash
npm install
```

### 4. Running the Application

#### Option A: Web Game (Frontend + In-Browser Camera rPPG & Demo Mode)
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Option B: Full Stack with Native SmartSpectra SDK Bridge
In terminal 1 (start the native SDK bridge):
```bash
npm run bridge
```
In terminal 2 (start the Vite dev server):
```bash
npm run dev
```

---

## 🔬 Signal Processing & Filtering Architecture

1. **Signal Ingestion:** Captures raw physiological metrics (`pulseRate`, `breathingRate`, `respiratoryPhase`, `stabilityScore`).
2. **Smoothing & Noise Reduction:** Applies Exponential Moving Average (EMA) filtering ($\alpha = 0.20$) to eliminate frame jitter without introducing perceptible latency.
3. **Variance & Stability Scoring:** Computes standard deviation over a 5-second sliding window to determine respiration steadiness (0–100%).
4. **Hysteresis Banding:** Prevents rapid on/off flickering when vitals fluctuate near target thresholds.
5. **Sustained Duration Timers:** Enforces steady biological control (e.g., maintaining target pulse for 3.5 consecutive seconds) with a 0.5s grace decay window.

---

## ☁️ Vercel Deployment

Heartbeat Heist is pre-configured for deployment on **Vercel**:

### Option 1: Deploy via GitHub / Vercel Web Dashboard (Recommended)
1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/new), click **Import Project** and select this repository.
3. Vercel automatically detects the framework presets from [vercel.json](file:///c:/Build/Antigravity/Presage%20SmartSpectra%20SDK%20Challenge/vercel.json):
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_SMARTSPECTRA_API_KEY`: Your Presage API Key
   - `VITE_PRESAGE_API_KEY`: Your Presage API Key
5. Click **Deploy**. Your game will be live with full HTTPS webcam access!

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 🔒 Vercel Camera Permissions
The included [vercel.json](file:///c:/Build/Antigravity/Presage%20SmartSpectra%20SDK%20Challenge/vercel.json) specifies the HTTP security header:
```json
"headers": [
  { "key": "Permissions-Policy", "value": "camera=(self)" }
]
```
This ensures that the browser grants full optical access to the webcam for real-time SmartSpectra rPPG extraction without permission boundary conflicts.

---

## 🛡️ Health & Privacy Disclaimer

- **Entertainment Only:** This software is designed strictly as an interactive game. Physiological signals are used solely for gameplay mechanics.
- **Not a Medical Device:** SmartSpectra measurements are not intended for clinical diagnosis, patient monitoring, or treatment of any health condition.
- **On-Device Privacy:** Video frames are processed strictly on-device in your local runtime; no video feeds or personal health images are transmitted or stored.

---

## 🧪 Demo Mode & Presentation Features

- **Pill Indicators:** The HUD clearly displays the active telemetry source:
  - `SMARTSPECTRA SDK` (Emerald Green) – Connected to local native SDK bridge.
  - `CAMERA rPPG` (Cyan) – Live webcam optical sensing directly in browser.
  - `DEMO MODE` (Amber) – Manual simulator with keyboard & slider overrides.
- **Bypass / Fast-Forward Button:** Click the `BYPASS CURRENT PUZZLE (TEST)` button to quickly demonstrate puzzle progression, door animations, and victory screens during brief 2-minute presentations.
- **Camera PIP:** Toggle the floating picture-in-picture camera preview at any time to inspect facial alignment and signal confidence.
