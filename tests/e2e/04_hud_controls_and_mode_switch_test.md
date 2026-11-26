---
url: http://localhost:5173
target: chrome
headless: true
max_steps: 30
tags: [e2e, hud, controls, mode-switch]
---
# HUD Controls and Sensor Mode Switching

> Verify Camera PIP minimize/restore, Audio Mute toggle, and switching sensor modes in the Demo / Sensor Override panel.

## Step 1

Open http://localhost:5173 and click "DEMO MODE (KEYBOARD / SLIDERS)", click the minimize ("X") button on the "SMARTSPECTRA SENSOR" picture-in-picture panel at the bottom-right so it hides, click the "Toggle Camera PIP" eye button in the top-right HUD to restore it, and click the "Mute Audio" speaker button in the top-right HUD, then assert the "SMARTSPECTRA SENSOR" panel is visible again and the audio toggle button title is "Unmute Audio".

## Step 2

Click the "DEMO / SENSOR OVERRIDE" panel header at the bottom-left to expand it, click the "WEBCAM" tab button and confirm the top-right HUD badge updates to "CAMERA rPPG" and the override panel displays "Receiving live measurements:", then click the "DEMO SLIDERS" tab button and assert the top-right HUD badge shows "DEMO MODE" and the "PULSE OVERRIDE", "BREATHING OVERRIDE", and "RHYTHM STABILITY" sliders are visible.
