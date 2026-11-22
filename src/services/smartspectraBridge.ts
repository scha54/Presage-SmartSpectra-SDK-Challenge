/**
 * SmartSpectra Bridge Service
 * Handles real-time communication with the native SmartSpectra SDK bridge (Node.js/WebSocket)
 * with transparent fallback to in-browser rPPG camera or deterministic Demo mode.
 */

import { SmartSpectraMetrics, ValidationStatus, DataSourceMode, SmartSpectraBridgeStatus } from '../types/smartspectra';
import { rppgCamera } from './rppgCamera';
import { SignalFilter } from './signalFilter';

type MetricsListener = (metrics: SmartSpectraMetrics) => void;
type ValidationListener = (status: ValidationStatus) => void;
type StatusListener = (status: SmartSpectraBridgeStatus) => void;

class SmartSpectraBridgeManager {
  private ws: WebSocket | null = null;
  private wsUrl: string = 'ws://localhost:8765';
  private mode: DataSourceMode = 'LIVE_SDK';
  private signalFilter = new SignalFilter(0.2);

  private isConnected: boolean = false;
  private metricsListeners: Set<MetricsListener> = new Set();
  private validationListeners: Set<ValidationListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();

  // Demo simulator state
  private demoInterval: number | null = null;
  private demoPulse: number = 72;
  private demoBreath: number = 13.5;
  private demoPhase: number = 0; // -1 to +1
  private demoPhaseDir: number = 1;
  private demoStability: number = 88;

  constructor() {
    // Attempt connecting to native bridge on initialization
    this.connectWebSocket();
  }

  public getMode(): DataSourceMode {
    return this.mode;
  }

  public setMode(mode: DataSourceMode): void {
    this.mode = mode;
    if (mode === 'DEMO_MODE') {
      this.startDemoSimulator();
    } else {
      this.stopDemoSimulator();
      if (mode === 'LIVE_SDK' && !this.isConnected) {
        this.connectWebSocket();
      }
    }
    this.notifyStatus();
  }

  public subscribeMetrics(listener: MetricsListener): () => void {
    this.metricsListeners.add(listener);
    return () => this.metricsListeners.delete(listener);
  }

  public subscribeValidation(listener: ValidationListener): () => void {
    this.validationListeners.add(listener);
    return () => this.validationListeners.delete(listener);
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => this.statusListeners.delete(listener);
  }

  public getStatus(): SmartSpectraBridgeStatus {
    return {
      isConnected: this.isConnected,
      mode: this.mode,
      sdkVersion: '3.5.0 (Presage SmartSpectra C-API)',
      hasCameraAccess: true,
      error: null
    };
  }

  // --- NATIVE SDK WEBSOCKET BRIDGE ---
  private connectWebSocket(): void {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.mode = 'LIVE_SDK';
        console.log('[SmartSpectra] Connected to native SDK bridge on port 8765');
        this.notifyStatus();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'metrics') {
            const rawMetrics = data.payload as SmartSpectraMetrics;
            const smoothed = this.signalFilter.filter(rawMetrics.pulseRate, rawMetrics.breathingRate);

            const filtered: SmartSpectraMetrics = {
              ...rawMetrics,
              pulseRate: smoothed.smoothedPulse,
              breathingRate: smoothed.smoothedBreath,
              stabilityScore: this.signalFilter.getBreathingStability()
            };

            this.metricsListeners.forEach(fn => fn(filtered));
          } else if (data.type === 'validation') {
            const status = data.payload as ValidationStatus;
            this.validationListeners.forEach(fn => fn(status));
          }
        } catch (e) {
          console.warn('[SmartSpectra] Error parsing bridge message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        // Fall back to browser camera rPPG if native bridge is not currently running
        if (this.mode === 'LIVE_SDK') {
          console.log('[SmartSpectra] Native bridge offline. Using in-browser camera rPPG sensor.');
          this.mode = 'BROWSER_RPPG';
        }
        this.notifyStatus();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        if (this.mode === 'LIVE_SDK') {
          this.mode = 'BROWSER_RPPG';
        }
        this.notifyStatus();
      };
    } catch {
      this.isConnected = false;
      this.mode = 'BROWSER_RPPG';
      this.notifyStatus();
    }
  }

  // --- IN-BROWSER CAMERA rPPG INITIALIZATION ---
  public async initBrowserCamera(videoElem: HTMLVideoElement): Promise<boolean> {
    const success = await rppgCamera.start(
      videoElem,
      (metrics) => {
        if (this.mode === 'BROWSER_RPPG') {
          const smoothed = this.signalFilter.filter(metrics.pulseRate, metrics.breathingRate);
          const filtered: SmartSpectraMetrics = {
            ...metrics,
            pulseRate: smoothed.smoothedPulse,
            breathingRate: smoothed.smoothedBreath,
            stabilityScore: this.signalFilter.getBreathingStability()
          };
          this.metricsListeners.forEach(fn => fn(filtered));
        }
      },
      (validation) => {
        if (this.mode === 'BROWSER_RPPG') {
          this.validationListeners.forEach(fn => fn(validation));
        }
      }
    );
    return success;
  }

  public stopBrowserCamera(): void {
    rppgCamera.stop();
  }

  // --- DEMO SIMULATOR CONTROLS ---
  public setDemoPulse(pulse: number): void {
    this.demoPulse = Math.max(50, Math.min(160, pulse));
  }

  public setDemoBreath(breath: number): void {
    this.demoBreath = Math.max(6, Math.min(30, breath));
  }

  public setDemoStability(stability: number): void {
    this.demoStability = Math.max(0, Math.min(100, stability));
  }

  public triggerBreathImpulse(inward: boolean): void {
    this.demoPhaseDir = inward ? 1 : -1;
  }

  private startDemoSimulator(): void {
    if (this.demoInterval) return;

    this.demoInterval = window.setInterval(() => {
      // Natural sinusoidal respiratory progression
      const breathCycleSpeed = (this.demoBreath / 60) * 0.15; // frequency
      this.demoPhase += this.demoPhaseDir * breathCycleSpeed;
      if (this.demoPhase >= 1.0) {
        this.demoPhase = 1.0;
        this.demoPhaseDir = -1;
      } else if (this.demoPhase <= -1.0) {
        this.demoPhase = -1.0;
        this.demoPhaseDir = 1;
      }

      // Slight natural heart rate variability jitter
      const jitter = (Math.random() - 0.5) * 0.6;
      const currentPulse = Math.round((this.demoPulse + jitter) * 10) / 10;

      const metrics: SmartSpectraMetrics = {
        pulseRate: currentPulse,
        breathingRate: this.demoBreath,
        respiratoryPhase: Math.round(this.demoPhase * 100) / 100,
        hrvRmssd: 50,
        confidence: 0.95,
        stabilityScore: this.demoStability,
        timestampUs: Math.round(performance.now() * 1000)
      };

      this.metricsListeners.forEach(fn => fn(metrics));

      if (this.validationListeners.size > 0) {
        this.validationListeners.forEach(fn => fn({
          isValid: true,
          code: 0,
          message: 'DEMO MODE: Manual override active.',
          lightingOk: true,
          faceCentered: true,
          motionStable: true
        }));
      }
    }, 100);
  }

  private stopDemoSimulator(): void {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  private notifyStatus(): void {
    const status = this.getStatus();
    this.statusListeners.forEach(fn => fn(status));
  }
}

export const smartspectraBridge = new SmartSpectraBridgeManager();
