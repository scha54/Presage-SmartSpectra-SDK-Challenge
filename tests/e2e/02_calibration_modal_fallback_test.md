---
url: http://localhost:5173
target: chrome
headless: true
max_steps: 25
tags: [e2e, calibration, modal]
---
# Calibration Modal and Demo Fallback Flow

> Verify entering the Live Sensor flow opens the Biometric Sensor Calibration modal and allows clean fallback to Demo Mode.

## Step 1

Open http://localhost:5173 and click the "ENTER FACILITY (LIVE SENSOR)" button on the title screen, then assert the "BIOMETRIC SENSOR CALIBRATION" modal appears with "STEP 1/2", the "ENABLE CAMERA SENSOR" button, the "BYPASS WITH DEMO CONTROLS" button, and the privacy notice "ON-DEVICE COMPUTATION: Video frames are processed strictly in your local browser runtime.".

## Step 2

Click the "BYPASS WITH DEMO CONTROLS" button inside the calibration modal, then assert the calibration modal closes and the active game HUD displays "FACILITY INTRUSION PROTOCOL", the "DEMO MODE" badge, and the "MISSION OBJECTIVES" panel.
