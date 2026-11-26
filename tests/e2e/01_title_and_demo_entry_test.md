---
url: http://localhost:5173
target: chrome
headless: true
max_steps: 25
tags: [e2e, smoke, title, hud]
---
# Title Screen and Demo Mode Entry

> Verify the Heartbeat Heist title screen renders all mission details and transitions cleanly into Demo Mode with active HUD telemetry and objectives.

## Step 1

Open http://localhost:5173 and wait for the page to finish loading, then assert the title screen displays "HEARTBEAT HEIST", "POWERED BY PRESAGE SMARTSPECTRA SDK", "MISSION BRIEFING: SECTOR 7", the three stage preview cards ("ROOM 1: LASERS", "ROOM 2: VAULT", "ROOM 3: BRIDGE"), and the buttons "ENTER FACILITY (LIVE SENSOR)" and "DEMO MODE (KEYBOARD / SLIDERS)".

## Step 2

Click the "DEMO MODE (KEYBOARD / SLIDERS)" button on the title screen, then assert the title overlay disappears and the active game HUD shows "FACILITY INTRUSION PROTOCOL", the mode badge "DEMO MODE", and "SURVEILLANCE EVADED".

## Step 3

Inspect the active HUD telemetry and objectives panels, then assert the "CARDIAC PULSE", "RESPIRATION", and "RHYTHM STABILITY" telemetry panels on the left and the "MISSION OBJECTIVES" panel on the right are all visible.
