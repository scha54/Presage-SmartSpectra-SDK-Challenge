import React, { useState } from 'react';
import { DataSourceMode, SmartSpectraMetrics } from '../types/smartspectra';
import { smartspectraBridge } from '../services/smartspectraBridge';
import { Sliders, Play, ChevronDown, ChevronUp, FastForward } from 'lucide-react';

interface DemoControlsProps {
  mode: DataSourceMode;
  onSetMode: (mode: DataSourceMode) => void;
  metrics: SmartSpectraMetrics;
  onFastForwardStage: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  mode,
  onSetMode,
  metrics,
  onFastForwardStage
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [pulse, setPulse] = useState<number>(74);
  const [breath, setBreath] = useState<number>(14);
  const [stability, setStability] = useState<number>(90);

  const handlePulseChange = (val: number) => {
    setPulse(val);
    smartspectraBridge.setDemoPulse(val);
  };

  const handleBreathChange = (val: number) => {
    setBreath(val);
    smartspectraBridge.setDemoBreath(val);
  };

  const handleStabilityChange = (val: number) => {
    setStability(val);
    smartspectraBridge.setDemoStability(val);
  };

  const handleBreathTrigger = (inward: boolean) => {
    smartspectraBridge.triggerBreathImpulse(inward);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 pointer-events-auto">
      <div className={`cyber-panel ${mode === 'DEMO_MODE' ? 'cyber-panel-amber' : ''} p-3 rounded-lg shadow-2xl transition-all duration-300 w-80`}>
        {/* Header Toggle */}
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#ffaa00]" />
            <span className="text-xs font-orbitron font-bold text-[#ffaa00]">
              DEMO / SENSOR OVERRIDE
            </span>
          </div>
          <button className="text-gray-400 hover:text-white p-1">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible Content */}
        {isOpen && (
          <div className="mt-3 pt-3 border-t border-gray-800 flex flex-col gap-3">
            {/* Mode Switcher */}
            <div className="flex rounded bg-black/60 p-1 border border-gray-800 text-[10px] font-orbitron font-bold">
              <button
                onClick={() => onSetMode('LIVE_SDK')}
                className={`flex-1 py-1.5 rounded transition ${
                  mode === 'LIVE_SDK' ? 'bg-[#00f2fe]/20 text-[#00f2fe] border border-[#00f2fe]/50' : 'text-gray-400'
                }`}
              >
                LIVE SDK
              </button>
              <button
                onClick={() => onSetMode('BROWSER_RPPG')}
                className={`flex-1 py-1.5 rounded transition ${
                  mode === 'BROWSER_RPPG' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-gray-400'
                }`}
              >
                WEBCAM
              </button>
              <button
                onClick={() => onSetMode('DEMO_MODE')}
                className={`flex-1 py-1.5 rounded transition ${
                  mode === 'DEMO_MODE' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60' : 'text-gray-400'
                }`}
              >
                DEMO SLIDERS
              </button>
            </div>

            {/* Sliders (active in Demo Mode) */}
            {mode === 'DEMO_MODE' ? (
              <>
                {/* Pulse Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono-tech">
                    <span className="text-gray-400">PULSE OVERRIDE</span>
                    <span className="font-bold text-red-400">{pulse} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="140"
                    value={pulse}
                    onChange={(e) => handlePulseChange(Number(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded accent-[#ff3366] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono-tech">
                    <span>50 (Resting)</span>
                    <span>72 (Target)</span>
                    <span>140 (Elevated)</span>
                  </div>
                </div>

                {/* Respiration Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono-tech">
                    <span className="text-gray-400">BREATHING OVERRIDE</span>
                    <span className="font-bold text-cyan-400">{breath} BrPM</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    value={breath}
                    onChange={(e) => handleBreathChange(Number(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded accent-[#00f2fe] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-500 font-mono-tech">
                    <span>8 (Slow)</span>
                    <span>14 (Calm Window)</span>
                    <span>24 (Rapid)</span>
                  </div>
                </div>

                {/* Stability Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-mono-tech">
                    <span className="text-gray-400">RHYTHM STABILITY</span>
                    <span className="font-bold text-emerald-400">{stability}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={stability}
                    onChange={(e) => handleStabilityChange(Number(e.target.value))}
                    className="w-full h-1 bg-gray-800 rounded accent-[#00ff88] cursor-pointer"
                  />
                </div>

                {/* Manual Breath Trigger Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onMouseDown={() => handleBreathTrigger(true)}
                    className="flex-1 py-1.5 text-[10px] font-orbitron font-bold cyber-button rounded text-center"
                  >
                    INHALE ▲
                  </button>
                  <button
                    onMouseDown={() => handleBreathTrigger(false)}
                    className="flex-1 py-1.5 text-[10px] font-orbitron font-bold cyber-button rounded text-center"
                  >
                    EXHALE ▼
                  </button>
                </div>
              </>
            ) : (
              <div className="text-[11px] text-gray-400 font-rajdhani">
                Receiving live measurements:
                <div className="font-mono-tech text-white text-xs mt-1">
                  Pulse: {metrics.pulseRate} BPM | Breath: {metrics.breathingRate} BrPM
                </div>
              </div>
            )}

            {/* Fast-Forward / Auto-Solve button for quick testing */}
            <button
              onClick={onFastForwardStage}
              className="w-full py-2 bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-orbitron font-bold text-[10px] rounded flex items-center justify-center gap-1.5 transition"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>BYPASS CURRENT PUZZLE (TEST)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
