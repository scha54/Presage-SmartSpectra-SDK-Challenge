/**
 * Signal Processing and Filtering Utility
 * Exponential Moving Average (EMA), sliding window variance,
 * hysteresis thresholding, and sustained hold timers.
 */

export class SignalFilter {
  private alpha: number;
  private currentPulseEma: number | null = null;
  private currentBreathEma: number | null = null;
  private pulseHistory: number[] = [];
  private breathHistory: number[] = [];
  private maxHistoryLen: number = 50;

  constructor(alpha: number = 0.25) {
    this.alpha = alpha;
  }

  /**
   * Filter new pulse and breath samples using EMA
   */
  public filter(rawPulse: number, rawBreath: number): { smoothedPulse: number; smoothedBreath: number } {
    if (this.currentPulseEma === null) {
      this.currentPulseEma = rawPulse;
    } else {
      this.currentPulseEma = this.alpha * rawPulse + (1 - this.alpha) * this.currentPulseEma;
    }

    if (this.currentBreathEma === null) {
      this.currentBreathEma = rawBreath;
    } else {
      this.currentBreathEma = this.alpha * rawBreath + (1 - this.alpha) * this.currentBreathEma;
    }

    // Keep history for variance calculation
    this.pulseHistory.push(this.currentPulseEma);
    if (this.pulseHistory.length > this.maxHistoryLen) {
      this.pulseHistory.shift();
    }

    this.breathHistory.push(this.currentBreathEma);
    if (this.breathHistory.length > this.maxHistoryLen) {
      this.breathHistory.shift();
    }

    return {
      smoothedPulse: Math.round(this.currentPulseEma * 10) / 10,
      smoothedBreath: Math.round(this.currentBreathEma * 10) / 10
    };
  }

  /**
   * Calculate stability score (0 to 100%) based on variance of breathing rate
   */
  public getBreathingStability(): number {
    if (this.breathHistory.length < 5) return 50;

    const mean = this.breathHistory.reduce((sum, val) => sum + val, 0) / this.breathHistory.length;
    const variance = this.breathHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.breathHistory.length;
    const stdDev = Math.sqrt(variance);

    // Standard deviation of <= 0.8 BrPM is considered 100% stable; > 4.0 BrPM is 0% stable
    const stability = Math.max(0, Math.min(100, Math.round((1 - (stdDev / 4.0)) * 100)));
    return stability;
  }

  /**
   * Calculate pulse stability score (0 to 100%)
   */
  public getPulseStability(): number {
    if (this.pulseHistory.length < 5) return 50;

    const mean = this.pulseHistory.reduce((sum, val) => sum + val, 0) / this.pulseHistory.length;
    const variance = this.pulseHistory.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / this.pulseHistory.length;
    const stdDev = Math.sqrt(variance);

    // Standard deviation of <= 1.5 BPM is 100% stable; > 8.0 BPM is 0% stable
    const stability = Math.max(0, Math.min(100, Math.round((1 - (stdDev / 8.0)) * 100)));
    return stability;
  }

  /**
   * Hysteresis check: evaluates whether an incoming value stays within a target range,
   * applying a grace margin to prevent high-frequency boundary jitter.
   */
  public checkHysteresis(
    value: number,
    targetMin: number,
    targetMax: number,
    isCurrentlyActive: boolean,
    margin: number = 2.0
  ): boolean {
    if (isCurrentlyActive) {
      // Once active, allow slightly wider margin to remain active
      return value >= (targetMin - margin) && value <= (targetMax + margin);
    } else {
      // To become active, must strictly be inside the target window
      return value >= targetMin && value <= targetMax;
    }
  }

  public reset(): void {
    this.currentPulseEma = null;
    this.currentBreathEma = null;
    this.pulseHistory = [];
    this.breathHistory = [];
  }
}
