---
test: ../01_title_and_demo_entry_test.md
status: passed
started: 2026-11-26T15:04:49.706Z
duration_s: 266
session_id: ba78d587-a3e1-4806-8048-1eaeaf19e52d
---

# Title Screen and Demo Mode Entry — Result

## Step 1 ✓ passed (83.2s)
md5: 6e4529e3644dd92ad7e9c60bd81bbbc4
Open http://localhost:5173 and wait for the page to finish loading, then assert the title screen displays "HEARTBEAT HEIST", "POWERED BY PRESAGE SMARTSPECTRA SDK", "MISSION BRIEFING: SECTOR 7", the three stage preview cards ("ROOM 1: LASERS", "ROOM 2: VAULT", "ROOM 3: BRIDGE"), and the buttons "ENTER FACILITY (LIVE SENSOR)" and "DEMO MODE (KEYBOARD / SLIDERS)".

## Step 2 ✓ passed (92.3s)
md5: 9ca8a90eaa83fdaaf06c47dc380708a2
Click the "DEMO MODE (KEYBOARD / SLIDERS)" button on the title screen, then assert the title overlay disappears and the active game HUD shows "FACILITY INTRUSION PROTOCOL", the mode badge "DEMO MODE", and "SURVEILLANCE EVADED".

## Step 3 ✓ passed (67.2s)
md5: 3e63a113ae465102014746b9a04eaf46
Inspect the active HUD telemetry and objectives panels, then assert the "CARDIAC PULSE", "RESPIRATION", and "RHYTHM STABILITY" telemetry panels on the left and the "MISSION OBJECTIVES" panel on the right are all visible.
