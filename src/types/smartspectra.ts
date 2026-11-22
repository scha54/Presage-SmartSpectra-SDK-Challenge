/**
 * Presage SmartSpectra SDK types and data models
 * Based on official SmartSpectra SDK specifications
 */

export type SignalQuality = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'LOST';

export type DataSourceMode = 'LIVE_SDK' | 'BROWSER_RPPG' | 'DEMO_MODE';

export interface SmartSpectraMetrics {
  pulseRate: number;              // Beats per minute (BPM)
  breathingRate: number;          // Breaths per minute (BrPM)
  respiratoryPhase: number;       // Current phase: -1.0 (deep exhale) to +1.0 (deep inhale)
  hrvRmssd?: number;              // Heart rate variability (RMSSD in ms)
  edaTrace?: number;              // Electrodermal activity proxy
  confidence: number;             // 0.0 to 1.0 confidence score
  stabilityScore: number;         // 0 to 100% stability rating
  timestampUs: number;            // Monotonic microsecond timestamp
}

export interface ValidationStatus {
  isValid: boolean;
  code: number;
  message: string;
  lightingOk: boolean;
  faceCentered: boolean;
  motionStable: boolean;
}

export interface CalibrationProfile {
  restingPulseBpm: number;
  baselineBreathingBrpm: number;
  pulseTargetRange: [number, number]; // [min, max]
  calibratedAt: number;
  isCalibrated: boolean;
}

export interface SmartSpectraBridgeStatus {
  isConnected: boolean;
  mode: DataSourceMode;
  sdkVersion: string;
  hasCameraAccess: boolean;
  error: string | null;
}
