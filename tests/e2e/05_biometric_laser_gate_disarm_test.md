---
url: http://localhost:5173
target: chrome
headless: true
max_steps: 25
tags: [e2e, gameplay, biometric]
---
# Biometric Laser Corridor Progression via Simulated Vitals

> Verify that maintaining calm simulated breathing vitals in Demo Mode automatically disarms all three Laser Corridor gates and advances to Stage 2 (Biometric Pulse Vault).

## Step 1

Open http://localhost:5173, click "DEMO MODE (KEYBOARD / SLIDERS)" to enter Stage 1 with default calm breathing telemetry (13.5 BrPM and 88% stability), and wait 15 seconds for all three laser security gates (Alpha Barrier, Beta Grid, Gamma Shield) to disarm automatically, then assert the HUD stage title has advanced to "STAGE 2/3: BIOMETRIC PULSE VAULT" and the "MISSION OBJECTIVES" panel shows "TUMBLER I (70 BPM)", "TUMBLER II (74 BPM)", and "TUMBLER III (78 BPM)".
