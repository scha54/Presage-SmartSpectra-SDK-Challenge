import React, { useEffect, useRef } from 'react';
import { GameStage, Room1LaserState, Room2VaultState, Room3BridgeState } from '../types/game';
import { SmartSpectraMetrics, DataSourceMode } from '../types/smartspectra';
import { Activity, Wind, ShieldAlert, Volume2, VolumeX, Eye, Radio, Sparkles } from 'lucide-react';

interface HUDProps {
  stage: GameStage;
  metrics: SmartSpectraMetrics;
  mode: DataSourceMode;
  elapsedSeconds: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleCameraPIP: () => void;
  showCameraPIP: boolean;
  room1State: Room1LaserState;
  room2State: Room2VaultState;
  room3State: Room3BridgeState;
}

export const HUD: React.FC<HUDProps> = ({
  stage,
  metrics,
  mode,
  elapsedSeconds,
  isMuted,
  onToggleMute,
  onToggleCameraPIP,
  showCameraPIP,
  room1State,
  room2State,
  room3State
}) => {
  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
  const breathCanvasRef = useRef<HTMLCanvasElement>(null);
  const ecgHistory = useRef<number[]>(new Array(60).fill(0));
  const breathHistory = useRef<number[]>(new Array(60).fill(0));

  // Format elapsed time MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Draw real-time ECG and Respiration waveforms
  useEffect(() => {
    // 1. ECG Canvas
    const ecgCanvas = ecgCanvasRef.current;
    if (ecgCanvas) {
      const ctx = ecgCanvas.getContext('2d');
      if (ctx) {
        const w = ecgCanvas.width;
        const h = ecgCanvas.height;

        // Generate synthetic ECG P-Q-R-S-T wave pulse spike based on current pulse rate
        const timeNow = performance.now() * 0.001;
        const bpm = metrics.pulseRate || 72;
        const cycleProgress = (timeNow * (bpm / 60)) % 1.0;
        
        let sample = 0;
        if (cycleProgress < 0.1) sample = Math.sin(cycleProgress * Math.PI * 10) * 0.15; // P wave
        else if (cycleProgress > 0.14 && cycleProgress < 0.17) sample = -0.2; // Q dip
        else if (cycleProgress >= 0.17 && cycleProgress <= 0.22) sample = 1.0; // R peak!
        else if (cycleProgress > 0.22 && cycleProgress < 0.26) sample = -0.35; // S dip
        else if (cycleProgress > 0.35 && cycleProgress < 0.5) sample = Math.sin((cycleProgress - 0.35) * Math.PI * 6.6) * 0.25; // T wave

        ecgHistory.current.push(sample);
        if (ecgHistory.current.length > w) ecgHistory.current.shift();

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 1.8;
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const data = ecgHistory.current;
        for (let i = 0; i < data.length; i++) {
          const x = i;
          const y = (h / 2) - data[i] * (h * 0.38);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    // 2. Breath Wave Canvas
    const breathCanvas = breathCanvasRef.current;
    if (breathCanvas) {
      const ctx = breathCanvas.getContext('2d');
      if (ctx) {
        const w = breathCanvas.width;
        const h = breathCanvas.height;

        breathHistory.current.push(metrics.respiratoryPhase);
        if (breathHistory.current.length > w) breathHistory.current.shift();

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2.0;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const data = breathHistory.current;
        for (let i = 0; i < data.length; i++) {
          const x = i;
          const y = (h / 2) - data[i] * (h * 0.38);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }, [metrics]);

  const getStageTitle = () => {
    switch (stage) {
      case 'ROOM1_LASER': return 'STAGE 1/3: LASER SECURITY GRID';
      case 'ROOM2_VAULT': return 'STAGE 2/3: BIOMETRIC PULSE VAULT';
      case 'ROOM3_BRIDGE': return 'STAGE 3/3: QUANTUM BREATH BRIDGE';
      default: return 'SECURITY SURVEILLANCE ACTIVE';
    }
  };

  const getGuidanceText = () => {
    switch (stage) {
      case 'ROOM1_LASER':
        const gate = room1State.gates[room1State.currentGateIndex];
        return `Maintain stable breathing (${room1State.breathingWindowMin}-${room1State.breathingWindowMax} BrPM) to bypass Gate ${room1State.currentGateIndex + 1}/3 (${Math.round(gate?.disarmProgress || 0)}%)`;
      case 'ROOM2_VAULT':
        const tumbler = room2State.tumblers[room2State.activeTumblerIndex];
        const inWindow = room2State.resonanceSync >= 75;
        return inWindow 
          ? `Locking Tumbler ${room2State.activeTumblerIndex + 1}/3! Hold steady: ${(tumbler?.currentHoldSeconds || 0).toFixed(1)}s / ${(tumbler?.holdDurationRequired || 3.0)}s`
          : `Calibrate pulse to target resonance: ${tumbler?.targetBpm || 72} BPM (±${tumbler?.tolerance || 5} BPM)`;
      case 'ROOM3_BRIDGE':
        return `Take deep, steady breaths. Inhale and exhale fully to crystallize platform ${room3State.completedBreathCycles + 1}/5`;
      default:
        return 'Observe facility security rhythms.';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* TOP STATUS BAR */}
      <div className="flex items-center justify-between w-full">
        {/* Title & Stage */}
        <div className="flex items-center gap-3">
          <div className="cyber-panel px-4 py-2 border-l-4 border-l-[#00f2fe]">
            <div className="text-[10px] text-[#00f2fe] font-orbitron tracking-widest uppercase">
              FACILITY INTRUSION PROTOCOL
            </div>
            <div className="text-base font-orbitron font-bold text-white glow-cyan">
              {getStageTitle()}
            </div>
          </div>
        </div>

        {/* Center Timer & Security Status */}
        <div className="flex items-center gap-4">
          <div className="cyber-panel px-5 py-2 flex items-center gap-3">
            <Radio className="w-4 h-4 text-[#ff3366] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] text-gray-400 font-mono-tech uppercase">ELAPSED TIME</span>
              <span className="text-xl font-orbitron font-bold text-white tracking-wider">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
          </div>

          <div className={`cyber-panel px-4 py-2 flex items-center gap-2 ${
            room1State.alarmTriggered ? 'border-[#ff3366] text-[#ff3366] animate-pulse' : 'border-[#00ff88] text-[#00ff88]'
          }`}>
            <ShieldAlert className="w-4 h-4" />
            <span className="text-xs font-orbitron font-semibold uppercase">
              {room1State.alarmTriggered ? 'INTRUSION ALERT' : 'SURVEILLANCE EVADED'}
            </span>
          </div>
        </div>

        {/* Controls: Mode Badge, Audio, PIP */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Data Mode Pill */}
          <div className={`px-3 py-1.5 rounded-full text-xs font-orbitron font-bold border flex items-center gap-2 ${
            mode === 'LIVE_SDK'
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : mode === 'BROWSER_RPPG'
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
              : 'bg-amber-950/80 border-amber-500 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              mode === 'LIVE_SDK' ? 'bg-emerald-400 animate-ping' : mode === 'BROWSER_RPPG' ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <span>{mode === 'LIVE_SDK' ? 'SMARTSPECTRA SDK' : mode === 'BROWSER_RPPG' ? 'CAMERA rPPG' : 'DEMO MODE'}</span>
          </div>

          <button
            onClick={onToggleCameraPIP}
            className={`cyber-panel p-2.5 rounded hover:border-[#00f2fe] text-gray-300 hover:text-white transition ${
              showCameraPIP ? 'border-[#00f2fe] text-[#00f2fe]' : ''
            }`}
            title="Toggle Camera PIP"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="cyber-panel p-2.5 rounded hover:border-[#00f2fe] text-gray-300 hover:text-white transition"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00f2fe]" />}
          </button>
        </div>
      </div>

      {/* LEFT BIO-TELEMETRY HUD */}
      <div className="w-72 flex flex-col gap-3 pointer-events-auto">
        <div className="cyber-panel p-3.5 border-l-4 border-l-[#ff3366]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-[#ff3366]">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-orbitron font-bold uppercase tracking-wider">CARDIAC PULSE</span>
            </div>
            <span className="text-[10px] font-mono-tech text-gray-400">SMARTSPECTRA</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-orbitron font-black text-white glow-red">
              {metrics.pulseRate}
            </span>
            <span className="text-xs text-gray-400 font-mono-tech">BPM</span>
            {metrics.hrvRmssd && (
              <span className="text-[10px] text-gray-500 font-mono-tech ml-auto">
                HRV: {metrics.hrvRmssd}ms
              </span>
            )}
          </div>

          {/* Real-time ECG Waveform Canvas */}
          <div className="w-full h-10 bg-black/60 rounded border border-gray-800 overflow-hidden relative">
            <canvas ref={ecgCanvasRef} width={260} height={40} className="w-full h-full block" />
            <div className="absolute top-1 right-1 text-[8px] font-mono-tech text-red-400/70">ECG LIVE</div>
          </div>
        </div>

        {/* Respiration Panel */}
        <div className="cyber-panel p-3.5 border-l-4 border-l-[#00f2fe]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-[#00f2fe]">
              <Wind className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-orbitron font-bold uppercase tracking-wider">RESPIRATION</span>
            </div>
            <span className="text-[10px] font-mono-tech text-gray-400">RHYTHM</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-orbitron font-black text-white glow-cyan">
              {metrics.breathingRate}
            </span>
            <span className="text-xs text-gray-400 font-mono-tech">BrPM</span>
            <span className={`text-[10px] font-mono-tech ml-auto ${metrics.respiratoryPhase >= 0 ? 'text-cyan-400' : 'text-blue-400'}`}>
              {metrics.respiratoryPhase >= 0 ? 'INHALING ▲' : 'EXHALING ▼'}
            </span>
          </div>

          {/* Real-time Breath Waveform Canvas */}
          <div className="w-full h-10 bg-black/60 rounded border border-gray-800 overflow-hidden relative">
            <canvas ref={breathCanvasRef} width={260} height={40} className="w-full h-full block" />
            <div className="absolute top-1 right-1 text-[8px] font-mono-tech text-cyan-400/70">WAVE LIVE</div>
          </div>
        </div>

        {/* Bio-Stability & Confidence */}
        <div className="cyber-panel p-3 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-mono-tech">RHYTHM STABILITY</span>
            <span className="font-orbitron font-bold text-[#00ff88]">{metrics.stabilityScore}%</span>
          </div>
          <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-[#00ff88] transition-all duration-300"
              style={{ width: `${metrics.stabilityScore}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono-tech text-gray-500 pt-1 border-t border-gray-800/80">
            <span>SIGNAL CONFIDENCE: {Math.round(metrics.confidence * 100)}%</span>
            <span className="text-cyan-400">QUALITY: OPTIMAL</span>
          </div>
        </div>
      </div>

      {/* BOTTOM CONTEXTUAL GUIDANCE BANNER */}
      <div className="w-full flex justify-center">
        <div className="cyber-panel px-6 py-3 max-w-2xl w-full border-t-2 border-t-[#00f2fe] flex items-center gap-4">
          <Sparkles className="w-5 h-5 text-[#00f2fe] shrink-0 animate-pulse" />
          <div className="flex-1">
            <div className="text-[10px] text-gray-400 font-mono-tech uppercase tracking-wider">
              BIO-CONTROL OBJECTIVE
            </div>
            <div className="text-sm font-rajdhani font-semibold text-white tracking-wide">
              {getGuidanceText()}
            </div>
          </div>

          {/* Stage Progress Bar */}
          <div className="w-32 flex flex-col items-end gap-1">
            <span className="text-[9px] font-mono-tech text-[#00f2fe]">
              {stage === 'ROOM1_LASER' && `GATE ${room1State.currentGateIndex + 1}/3`}
              {stage === 'ROOM2_VAULT' && `LOCK ${room2State.activeTumblerIndex + 1}/3`}
              {stage === 'ROOM3_BRIDGE' && `BRIDGE ${room3State.completedBreathCycles}/5`}
            </span>
            <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00f2fe] transition-all duration-300"
                style={{
                  width: stage === 'ROOM1_LASER' 
                    ? `${((room1State.currentGateIndex + (room1State.gates[room1State.currentGateIndex]?.disarmProgress || 0) / 100) / 3) * 100}%`
                    : stage === 'ROOM2_VAULT'
                    ? `${((room2State.activeTumblerIndex + (room2State.tumblers[room2State.activeTumblerIndex]?.currentHoldSeconds || 0) / (room2State.tumblers[room2State.activeTumblerIndex]?.holdDurationRequired || 3)) / 3) * 100}%`
                    : `${(room3State.completedBreathCycles / 5) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
