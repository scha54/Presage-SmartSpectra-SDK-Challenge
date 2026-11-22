/**
 * Heartbeat Heist game state and room progression definitions
 */

export type GameStage = 
  | 'TITLE'
  | 'CONSENT_CALIBRATION'
  | 'ROOM1_LASER'
  | 'ROOM2_VAULT'
  | 'ROOM3_BRIDGE'
  | 'VICTORY';

export interface LaserGate {
  id: number;
  name: string;
  isDisarmed: boolean;
  disarmProgress: number;     // 0 to 100%
  requiredStabilityTime: number; // seconds needed in stable breathing zone
  stableTimeElapsed: number;  // current seconds accumulated
  beamFlickerRate: number;
}

export interface Room1LaserState {
  currentGateIndex: number;
  gates: LaserGate[];
  isCorridorCleared: boolean;
  breathingWindowMin: number; // e.g. 10 BrPM
  breathingWindowMax: number; // e.g. 16 BrPM
  calmSteadiness: number;    // 0 to 100%
  alarmTriggered: boolean;
  alarmLevel: number;        // 0 to 100%
}

export interface VaultTumbler {
  id: number;
  name: string;
  isLocked: boolean;
  targetBpm: number;
  tolerance: number;         // +/- BPM range
  holdDurationRequired: number; // e.g. 3.0 seconds
  currentHoldSeconds: number;
}

export interface Room2VaultState {
  tumblers: VaultTumbler[];
  activeTumblerIndex: number;
  isVaultUnlocked: boolean;
  doorOpenProgress: number;  // 0 to 1 (for 3D door swing animation)
  resonanceSync: number;     // 0 to 100% match
}

export interface BridgeSegment {
  id: number;
  isCrystallized: boolean;
  energyLevel: number;       // 0 to 100%
  stability: number;         // 0 to 100%
}

export interface Room3BridgeState {
  segments: BridgeSegment[];
  currentSegmentIndex: number;
  completedBreathCycles: number;
  targetBreathCycles: number; // 5 cycles
  isBridgeCrossable: boolean;
  playerWalkProgress: number; // 0 to 1
  abyssTurbulence: number;
}

export interface PlayerStats {
  startTime: number;
  endTime: number;
  totalTimeSeconds: number;
  averageHeartRate: number;
  averageBreathingRate: number;
  stealthScore: number;      // 0 to 1000
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
