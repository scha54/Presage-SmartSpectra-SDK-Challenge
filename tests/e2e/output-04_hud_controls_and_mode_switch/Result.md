---
test: ../04_hud_controls_and_mode_switch_test.md
status: passed
started: 2026-11-25T19:08:21.592Z
duration_s: 153
session_id: ba50097a-1e50-4cde-905a-712eefffcf42
---

# HUD Controls and Sensor Mode Switching — Result

## Step 1 ✓ passed (47.1s)
md5: 8c0f241e39608748cdc98c1acf7a9641
Open http://localhost:5173 and click "DEMO MODE (KEYBOARD / SLIDERS)", click the minimize ("X") button on the "SMARTSPECTRA SENSOR" picture-in-picture panel at the bottom-right so it hides, click the "Toggle Camera PIP" eye button in the top-right HUD to restore it, and click the "Mute Audio" speaker button in the top-right HUD, then assert the "SMARTSPECTRA SENSOR" panel is visible again and the audio toggle button title is "Unmute Audio".

## Step 2 ✓ passed (94.2s)
md5: 1cc0c0cf2db4a0ee1eb92bda23a342bc
Click the "DEMO / SENSOR OVERRIDE" panel header at the bottom-left to expand it, click the "WEBCAM" tab button and confirm the top-right HUD badge updates to "CAMERA rPPG" and the override panel displays "Receiving live measurements:", then click the "DEMO SLIDERS" tab button and assert the top-right HUD badge shows "DEMO MODE" and the "PULSE OVERRIDE", "BREATHING OVERRIDE", and "RHYTHM STABILITY" sliders are visible.
