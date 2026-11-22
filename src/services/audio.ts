/**
 * Procedural Web Audio API sound synthesizer
 * Zero external audio assets required; reactive to player bio-metrics.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private breathFilter: BiquadFilterNode | null = null;
  private breathGain: GainNode | null = null;
  private isInitialized: boolean = false;

  public init(): void {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.startAmbientDrone();
      this.initBreathingSynthesizer();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  // --- AMBIENT DRONE ---
  private startAmbientDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'sawtooth';
    this.droneOsc2.frequency.setValueAtTime(55.6, this.ctx.currentTime); // Detuned

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  // --- BREATH SYNTHESIZER ---
  private initBreathingSynthesizer(): void {
    if (!this.ctx || !this.masterGain) return;

    // Pink/White noise buffer for breathing sound
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.breathFilter = this.ctx.createBiquadFilter();
    this.breathFilter.type = 'bandpass';
    this.breathFilter.frequency.setValueAtTime(400, this.ctx.currentTime);
    this.breathFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.breathGain = this.ctx.createGain();
    this.breathGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    whiteNoise.connect(this.breathFilter);
    this.breathFilter.connect(this.breathGain);
    this.breathGain.connect(this.masterGain);

    whiteNoise.start();
  }

  /**
   * Modulate breath sound according to respiratory phase:
   * phase: -1.0 (full exhale) to +1.0 (full inhale)
   */
  public updateBreathAudio(phase: number, stability: number): void {
    if (!this.ctx || !this.breathFilter || !this.breathGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Normalized amplitude (0 when at turnarounds, peak during inhalation/exhalation flow)
    const flowIntensity = Math.abs(phase);
    const targetGain = 0.08 * flowIntensity * (0.4 + 0.6 * (stability / 100));
    
    // Frequency shifts higher on inhale, deeper on exhale
    const centerFreq = phase >= 0 ? 350 + phase * 450 : 350 + Math.abs(phase) * 150;
    
    this.breathGain.gain.setTargetAtTime(targetGain, t, 0.08);
    this.breathFilter.frequency.setTargetAtTime(centerFreq, t, 0.08);
  }

  // --- HEARTBEAT THUMP ---
  /**
   * Triggers a realistic dual-peak "lub-dub" heartbeat thump
   */
  public triggerHeartbeat(intensity: number = 1.0): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const vol = Math.min(1.0, Math.max(0.1, intensity)) * 0.45;

    // "Lub" (first sound: deeper, longer)
    this.createThump(t, 58, 38, 0.16, vol);

    // "Dub" (second sound: slightly higher, crisper, ~120ms later)
    this.createThump(t + 0.12, 72, 44, 0.12, vol * 0.85);
  }

  private createThump(time: number, startFreq: number, endFreq: number, duration: number, gainVal: number): void {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  // --- LASER DEACTIVATION / CHIME ---
  public playLaserDisarm(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.35);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  // --- TUMBLER LOCK CLICK ---
  public playTumblerClick(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // --- VAULT DOOR UNLOCK CLANG ---
  public playVaultUnlock(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Heavy mechanical servo clank
    [130, 260, 520].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + 0.8);

      gain.gain.setValueAtTime(0.35 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.95);
    });
  }

  // --- BRIDGE CRYSTAL CHIME ---
  public playBridgeCrystal(index: number): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Pentatonic scale harmonics (A4, C5, D5, E5, G5)
    const scale = [440, 523.25, 587.33, 659.25, 783.99, 880];
    const freq = scale[Math.min(index, scale.length - 1)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.6);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.85);
  }

  // --- VICTORY FANFARE ---
  public playVictoryFanfare(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const notes = [
      { f: 523.25, d: 0.15, offset: 0.0 }, // C5
      { f: 659.25, d: 0.15, offset: 0.15 }, // E5
      { f: 783.99, d: 0.15, offset: 0.3 }, // G5
      { f: 1046.50, d: 0.6, offset: 0.45 }  // C6
    ];

    notes.forEach(note => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + note.offset);

      gain.gain.setValueAtTime(0.35, t + note.offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.offset + note.d);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + note.offset);
      osc.stop(t + note.offset + note.d + 0.05);
    });
  }

  // --- ALARM GLITCH ---
  public playAlarmWarning(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.setValueAtTime(950, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }
}

export const sound = new AudioSynthesizer();
