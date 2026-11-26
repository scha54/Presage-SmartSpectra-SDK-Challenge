# Heartbeat Heist — End-to-End Test Results (Kane CLI)

**Application:** Heartbeat Heist (`http://localhost:5173`)  
**Runner:** `kane-cli` v0.10.9 (`chrome`, `--headless`, `--parallel 1`)  
**Test Suite Directory:** `tests/e2e/`

---

## Summary

| # | Test Case | File | Status | Duration | Session ID | Notes |
|---|---|---|---|---|---|---|
| 1 | Title Screen and Demo Mode Entry | `01_title_and_demo_entry_test.md` | **PASSED** (3/3 steps) | 266s | `ba78d587-a3e1-4806-8048-1eaeaf19e52d` | Verified on re-run after splitting Step 2 assertions into Steps 2 & 3 (initial `testrun` run failed at Step 2 with Kane AI analyzer `automation_bug/state_transition_bug`). Synced to Test Manager (`01M8C66H40H2KS60KM46N1Z2W3`). |
| 2 | Calibration Modal and Demo Fallback Flow | `02_calibration_modal_fallback_test.md` | **PASSED** (2/2 steps) | 114s | `a05ee712-7d3a-4cd4-b858-498563a09816` | Passed in sequential `testrun` (`execution_id`: `eff81408-d103-46d0-8fa2-decdbf7599f6`). |
| 3 | Full 3-Room Heist Walkthrough and Replay Reset | `03_full_heist_walkthrough_and_replay_test.md` | **PASSED** (2/2 steps) | 153s | `d824d5f3-682f-4a5a-a972-cadea49afcf9` | Passed in sequential `testrun` (`execution_id`: `483656de-08f8-4c1a-ab1c-a1510ea38e05`). |
| 4 | HUD Controls and Sensor Mode Switching | `04_hud_controls_and_mode_switch_test.md` | **PASSED** (2/2 steps) | 153s | `ba50097a-1e50-4cde-905a-712eefffcf42` | Passed in sequential `testrun` (`execution_id`: `8149b45a-d987-48eb-8544-b300ca5fe6e3`). Synced to Test Manager (`01M8A1QRH9H4ZFHN5TVGWRCVY5`). |
| 5 | Biometric Laser Corridor Progression via Simulated Vitals | `05_biometric_laser_gate_disarm_test.md` | **PASSED** (1/1 step) | 494s | `9e0b915a-c38a-4eff-ba2c-d5a740568d64` | Passed in sequential `testrun` (`execution_id`: `6c8a2e93-79a7-4280-8956-73e1cf9ceda9`). Synced to Test Manager (`01M8A1X3WM6JZ7FW8HYTF4ZJDS`). |

**Overall Suite Coverage:** All **5 / 5** E2E test cases passed in sequential headless Chrome execution.

---

## Detailed Execution Breakdown

### 1. Title Screen and Demo Mode Entry (`01_title_and_demo_entry_test.md`)
- **Command:** `kane-cli testmd run tests/e2e/01_title_and_demo_entry_test.md --headless --agent`
- **Status:** `passed` (`266s`)
- **Steps Verified:**
  - **Step 1 (83.2s):** Verified `HEARTBEAT HEIST`, `POWERED BY PRESAGE SMARTSPECTRA SDK`, `MISSION BRIEFING: SECTOR 7`, the 3 stage preview cards (`ROOM 1: LASERS`, `ROOM 2: VAULT`, `ROOM 3: BRIDGE`), and both entry buttons (`ENTER FACILITY (LIVE SENSOR)` and `DEMO MODE (KEYBOARD / SLIDERS)`).
  - **Step 2 (92.3s):** Clicked `DEMO MODE (KEYBOARD / SLIDERS)`; verified title overlay dismissed and HUD displayed `FACILITY INTRUSION PROTOCOL`, `DEMO MODE`, and `SURVEILLANCE EVADED`.
  - **Step 3 (67.2s):** Verified `CARDIAC PULSE`, `RESPIRATION`, `RHYTHM STABILITY`, and `MISSION OBJECTIVES` panels rendered on screen.
- **Evidence:** `kane-cli evidence serve C:\Users\sande\.testmuai\kaneai\sessions\ba78d587-a3e1-4806-8048-1eaeaf19e52d\evidence\74924098-861a-48c0-b3d1-1245d8b7c107.evidence`

### 2. Calibration Modal and Demo Fallback Flow (`02_calibration_modal_fallback_test.md`)
- **Command:** `kane-cli testrun run --tags e2e --headless --parallel 1 --name heartbeat-heist-e2e --agent`
- **Status:** `passed` (`114s`)
- **Steps Verified:**
  - **Step 1 (52.3s):** Clicked `ENTER FACILITY (LIVE SENSOR)`; verified `BIOMETRIC SENSOR CALIBRATION` modal (`STEP 1/2`), `ENABLE CAMERA SENSOR`, `BYPASS WITH DEMO CONTROLS`, and on-device privacy notice.
  - **Step 2 (47.1s):** Clicked `BYPASS WITH DEMO CONTROLS`; verified calibration modal closed and HUD displayed `FACILITY INTRUSION PROTOCOL`, `DEMO MODE`, and `MISSION OBJECTIVES`.
- **Evidence:** `kane-cli evidence serve "C:\Build\Antigravity\Presage SmartSpectra SDK Challenge\.testmuai\evidence\eff81408-d103-46d0-8fa2-decdbf7599f6.evidence"`

### 3. Full 3-Room Heist Walkthrough and Replay Reset (`03_full_heist_walkthrough_and_replay_test.md`)
- **Command:** `kane-cli testrun run --tags e2e --headless --parallel 1 --name heartbeat-heist-e2e --agent`
- **Status:** `passed` (`153s`)
- **Steps Verified:**
  - **Step 1 (88.4s):** Entered Demo Mode, expanded `DEMO / SENSOR OVERRIDE`, bypassed stages using `BYPASS CURRENT PUZZLE (TEST)` until Victory Modal appeared; verified `MISSION COMPLETE`, `FACILITY EVADED`, `STEALTH EFFICIENCY RATING`, `ESCAPE TIME`, `AVG HEART RATE`, `AVG BREATHING`, and achievements (`Zen Infiltrator`, `Pulse of Steel`, `Quantum Strider`).
  - **Step 2 (50.4s):** Clicked `INFILTRATE AGAIN`; verified Victory Modal closed and active gameplay resumed with `FACILITY INTRUSION PROTOCOL`, `DEMO MODE`, and `MISSION OBJECTIVES`.
- **Evidence:** `kane-cli evidence serve "C:\Build\Antigravity\Presage SmartSpectra SDK Challenge\.testmuai\evidence\483656de-08f8-4c1a-ab1c-a1510ea38e05.evidence"`

### 4. HUD Controls and Sensor Mode Switching (`04_hud_controls_and_mode_switch_test.md`)
- **Command:** `kane-cli testrun run --tags e2e --headless --parallel 1 --name heartbeat-heist-e2e --agent`
- **Status:** `passed` (`153s`)
- **Steps Verified:**
  - **Step 1 (47.1s):** Minimized `SMARTSPECTRA SENSOR` PIP, restored it via `Toggle Camera PIP`, and toggled `Mute Audio` -> `Unmute Audio`.
  - **Step 2 (94.2s):** Expanded `DEMO / SENSOR OVERRIDE`, switched to `WEBCAM` (`CAMERA rPPG` badge + `Receiving live measurements:`), then switched back to `DEMO SLIDERS` (`DEMO MODE` badge + `PULSE OVERRIDE`, `BREATHING OVERRIDE`, and `RHYTHM STABILITY` sliders).
- **Evidence:** `kane-cli evidence serve "C:\Build\Antigravity\Presage SmartSpectra SDK Challenge\.testmuai\evidence\8149b45a-d987-48eb-8544-b300ca5fe6e3.evidence"`

### 5. Biometric Laser Corridor Progression via Simulated Vitals (`05_biometric_laser_gate_disarm_test.md`)
- **Command:** `kane-cli testrun run --tags e2e --headless --parallel 1 --name heartbeat-heist-e2e --agent`
- **Status:** `passed` (`494s`)
- **Steps Verified:**
  - **Step 1 (478.5s):** Entered Demo Mode with calm simulated breathing (`13.5 BrPM`, `88%` stability), waited for all 3 laser corridor gates (`ALPHA BARRIER`, `BETA GRID`, `GAMMA SHIELD`) to disarm automatically, and verified transition to `STAGE 2/3: BIOMETRIC PULSE VAULT` with `TUMBLER I (70 BPM)`, `TUMBLER II (74 BPM)`, and `TUMBLER III (78 BPM)` in `MISSION OBJECTIVES`.
- **Evidence:** `kane-cli evidence serve "C:\Build\Antigravity\Presage SmartSpectra SDK Challenge\.testmuai\evidence\6c8a2e93-79a7-4280-8956-73e1cf9ceda9.evidence"`

---

## Key Testing Observations
1. **Sequential vs. Parallel Local Runs:** Running `kane-cli testrun run` with `--parallel 3` against `http://localhost:5173` caused cross-browser interference and severe Three.js WebGL software-rendering slowdown; running sequentially (`--parallel 1`) eliminated interference.
2. **Headless WebGL Tick Rate:** Under headless Chrome software rendering (`SwiftShader`), the Three.js scene loop + 100ms React metric updates slowed Stage 1's 10.5s simulated-breathing disarm sequence to ~6–8 minutes wall-clock time (`ELAPSED TIME` in HUD tracked ~100ms ticks cleanly once enough frames elapsed).
