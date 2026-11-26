---
url: http://localhost:5173
target: chrome
headless: true
max_steps: 35
tags: [e2e, progression, victory, replay]
---
# Full 3-Room Heist Walkthrough and Replay Reset

> Verify bypassing through all escape room stages reaches the Victory Modal with stats and achievements, and clicking Infiltrate Again resets the game back to Stage 1.

## Step 1

Open http://localhost:5173, click "DEMO MODE (KEYBOARD / SLIDERS)", expand the "DEMO / SENSOR OVERRIDE" panel at the bottom-left, and click the "BYPASS CURRENT PUZZLE (TEST)" button repeatedly until the "MISSION COMPLETE" Victory Modal appears (checking after each click whether "MISSION COMPLETE" is visible before clicking again), then assert the Victory Modal displays "FACILITY EVADED", "STEALTH EFFICIENCY RATING", "ESCAPE TIME", "AVG HEART RATE", "AVG BREATHING", and the three unlocked achievements "Zen Infiltrator", "Pulse of Steel", and "Quantum Strider".

## Step 2

Click the "INFILTRATE AGAIN" button on the Victory Modal, then assert the "MISSION COMPLETE" Victory Modal closes and active gameplay resumes with "FACILITY INTRUSION PROTOCOL", the "DEMO MODE" badge, and the "MISSION OBJECTIVES" panel visible.
