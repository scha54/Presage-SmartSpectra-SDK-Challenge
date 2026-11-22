import React from 'react';
import { Play, Sparkles, ShieldCheck, Heart, Wind, Lock } from 'lucide-react';
import { sound } from '../services/audio';

interface TitleScreenProps {
  onStart: () => void;
  onStartDemo: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, onStartDemo }) => {
  const handleStart = () => {
    sound.init();
    sound.resume();
    onStart();
  };

  const handleStartDemo = () => {
    sound.init();
    sound.resume();
    onStartDemo();
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <div className="cyber-panel p-8 max-w-2xl w-full border-2 border-[#00f2fe]/40 shadow-2xl relative overflow-hidden">
        {/* Glowing Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00f2fe]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00f2fe]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00f2fe]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00f2fe]" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-[10px] font-orbitron font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#00f2fe]" />
            POWERED BY PRESAGE SMARTSPECTRA SDK
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white font-orbitron tracking-wider glow-cyan mb-2">
            HEARTBEAT HEIST
          </h1>
          <p className="text-sm md:text-base text-gray-300 font-rajdhani font-semibold tracking-wide">
            A Body-Controlled Escape Room Infiltration
          </p>
        </div>

        {/* Narrative / Mission Brief */}
        <div className="bg-black/50 p-4 rounded-lg border border-gray-800 mb-6 text-sm text-gray-300 leading-relaxed font-rajdhani">
          <div className="text-xs font-orbitron font-bold text-[#00f2fe] uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            MISSION BRIEFING: SECTOR 7
          </div>
          You are trapped inside the high-security biometric vault of the futuristic Museum of Technology.
          The facility's defense grid detects panic by scanning physiological vitals. To escape with the
          quantum <strong className="text-white">Resonant Core</strong>, your own body rhythms must become the lockpicks:
        </div>

        {/* Three Stages Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="cyber-panel p-3 rounded border-gray-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#00f2fe] font-orbitron text-xs font-bold">
              <Wind className="w-4 h-4" />
              <span>ROOM 1: LASERS</span>
            </div>
            <p className="text-[11px] text-gray-400 font-rajdhani">
              Regulate your breathing rhythm to disarm the high-voltage laser security grid.
            </p>
          </div>

          <div className="cyber-panel p-3 rounded border-gray-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#ff3366] font-orbitron text-xs font-bold">
              <Heart className="w-4 h-4" />
              <span>ROOM 2: VAULT</span>
            </div>
            <p className="text-[11px] text-gray-400 font-rajdhani">
              Calibrate your pulse to match the vault's resonance frequency and hold steady to unlock.
            </p>
          </div>

          <div className="cyber-panel p-3 rounded border-gray-800 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[#ffaa00] font-orbitron text-xs font-bold">
              <Lock className="w-4 h-4" />
              <span>ROOM 3: BRIDGE</span>
            </div>
            <p className="text-[11px] text-gray-400 font-rajdhani">
              Synchronize deep breath cycles to crystallize the holographic bridge across the abyss.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleStart}
            className="flex-1 cyber-button flex items-center justify-center gap-2 text-sm"
          >
            <Play className="w-4 h-4" />
            <span>ENTER FACILITY (LIVE SENSOR)</span>
          </button>

          <button
            onClick={handleStartDemo}
            className="cyber-button cyber-button-amber flex items-center justify-center gap-2 text-sm"
          >
            <span>DEMO MODE (KEYBOARD / SLIDERS)</span>
          </button>
        </div>

        {/* Medical & Privacy Notice */}
        <div className="mt-5 pt-3 border-t border-gray-900 text-center text-[10px] text-gray-500 font-mono-tech">
          DISCLAIMER: Physiological signals are used solely for interactive game control.
          SmartSpectra measurements are not intended for medical diagnosis or clinical monitoring.
        </div>
      </div>
    </div>
  );
};
