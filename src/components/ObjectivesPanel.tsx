import React from 'react';
import { GameStage, Room1LaserState, Room2VaultState, Room3BridgeState } from '../types/game';
import { CheckCircle2, Circle, Lock, Unlock } from 'lucide-react';

interface ObjectivesPanelProps {
  stage: GameStage;
  room1State: Room1LaserState;
  room2State: Room2VaultState;
  room3State: Room3BridgeState;
}

export const ObjectivesPanel: React.FC<ObjectivesPanelProps> = ({
  stage,
  room1State,
  room2State,
  room3State
}) => {
  return (
    <div className="absolute top-20 right-4 w-72 cyber-panel p-4 z-20 pointer-events-auto">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800">
        <span className="text-xs font-orbitron font-bold text-[#00f2fe] tracking-wider uppercase">
          MISSION OBJECTIVES
        </span>
        <span className="text-[10px] font-mono-tech text-gray-400">SECTOR 7</span>
      </div>

      {/* ROOM 1: LASER CORRIDOR */}
      {stage === 'ROOM1_LASER' && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[11px] text-gray-300">
            Deactivate the 3 resonant security gates by maintaining steady respiration:
          </div>

          {room1State.gates.map((gate, idx) => (
            <div
              key={gate.id}
              className={`flex items-center justify-between p-2 rounded text-xs border ${
                gate.isDisarmed
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                  : room1State.currentGateIndex === idx
                  ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                  : 'bg-black/40 border-gray-800 text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                {gate.isDisarmed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-cyan-400" />
                )}
                <span className="font-orbitron text-[11px]">{gate.name}</span>
              </div>
              <span className="font-mono-tech text-[10px]">
                {gate.isDisarmed ? 'DISARMED' : `${Math.round(gate.disarmProgress)}%`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ROOM 2: PULSE VAULT */}
      {stage === 'ROOM2_VAULT' && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[11px] text-gray-300">
            Align 3 biometric tumbler pins by holding your pulse in the resonance band:
          </div>

          {room2State.tumblers.map((tumbler, idx) => (
            <div
              key={tumbler.id}
              className={`flex items-center justify-between p-2 rounded text-xs border ${
                !tumbler.isLocked
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                  : room2State.activeTumblerIndex === idx
                  ? 'bg-amber-950/40 border-amber-500/60 text-white'
                  : 'bg-black/40 border-gray-800 text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                {!tumbler.isLocked ? (
                  <Unlock className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-400" />
                )}
                <span className="font-orbitron text-[11px]">{tumbler.name}</span>
              </div>
              <span className="font-mono-tech text-[10px]">
                {!tumbler.isLocked 
                  ? 'UNLOCKED' 
                  : `${tumbler.currentHoldSeconds.toFixed(1)}s / ${tumbler.holdDurationRequired}s`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ROOM 3: BREATH BRIDGE */}
      {stage === 'ROOM3_BRIDGE' && (
        <div className="flex flex-col gap-2.5">
          <div className="text-[11px] text-gray-300">
            Materialize 5 quantum holographic bridge platforms through rhythmic breath cycles:
          </div>

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {room3State.segments.map((seg, idx) => (
              <div
                key={seg.id}
                className={`h-12 rounded border flex flex-col items-center justify-center gap-1 ${
                  seg.isCrystallized
                    ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                    : room3State.currentSegmentIndex === idx
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                    : 'bg-black/50 border-gray-800 text-gray-600'
                }`}
              >
                <span className="text-[10px] font-orbitron font-bold">{idx + 1}</span>
                <span className="text-[8px] font-mono-tech">
                  {seg.isCrystallized ? '100%' : `${Math.round(seg.energyLevel)}%`}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[10px] font-mono-tech text-cyan-400 text-center pt-2">
            {room3State.isBridgeCrossable ? '⚡ BRIDGE ONLINE — ESCAPE THROUGH PORTAL!' : 'CYCLE INHALE & EXHALE FULLY'}
          </div>
        </div>
      )}
    </div>
  );
};
