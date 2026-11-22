import React from 'react';
import { Trophy, Clock, Heart, Wind, Award, RotateCcw, Share2 } from 'lucide-react';
import { PlayerStats } from '../types/game';
import { sound } from '../services/audio';

interface VictoryModalProps {
  stats: PlayerStats;
  onReplay: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ stats, onReplay }) => {
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs}s`;
  };

  const getRank = (score: number) => {
    if (score >= 850) return { rank: 'S-RANK', label: 'MASTER BIO-INFILTRATOR', color: 'text-amber-300 glow-amber' };
    if (score >= 700) return { rank: 'A-RANK', label: 'COVERT SPECIALIST', color: 'text-cyan-300 glow-cyan' };
    return { rank: 'B-RANK', label: 'TACTICAL OPERATIVE', color: 'text-emerald-300 glow-green' };
  };

  const rankInfo = getRank(stats.stealthScore);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-black/80 backdrop-blur-lg">
      <div className="cyber-panel p-8 max-w-xl w-full border-2 border-[#00f2fe] shadow-2xl relative">
        {/* Glowing Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#00f2fe]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00f2fe]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00f2fe]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#00f2fe]" />

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-orbitron font-bold tracking-widest uppercase mb-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            MISSION COMPLETE
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-orbitron tracking-wider glow-cyan mb-1">
            FACILITY EVADED
          </h1>
          <p className="text-sm text-gray-300 font-rajdhani font-semibold">
            The quantum Resonant Core has been extracted from Sector 7.
          </p>
        </div>

        {/* Rank Showcase */}
        <div className="cyber-panel p-4 rounded-lg border-cyan-500/40 text-center mb-6">
          <div className="text-xs font-mono-tech text-gray-400 uppercase tracking-widest mb-1">
            STEALTH EFFICIENCY RATING
          </div>
          <div className={`text-4xl font-black font-orbitron ${rankInfo.color} mb-1`}>
            {rankInfo.rank}
          </div>
          <div className="text-xs font-orbitron font-semibold text-gray-300">
            {rankInfo.label} • {stats.stealthScore} / 1000 PTS
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="cyber-panel p-3 rounded text-center">
            <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-[10px] text-gray-400 font-mono-tech uppercase">ESCAPE TIME</div>
            <div className="text-lg font-orbitron font-bold text-white">
              {formatTime(stats.totalTimeSeconds)}
            </div>
          </div>

          <div className="cyber-panel p-3 rounded text-center">
            <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <div className="text-[10px] text-gray-400 font-mono-tech uppercase">AVG HEART RATE</div>
            <div className="text-lg font-orbitron font-bold text-white">
              {Math.round(stats.averageHeartRate)} <span className="text-xs text-gray-400">BPM</span>
            </div>
          </div>

          <div className="cyber-panel p-3 rounded text-center">
            <Wind className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-[10px] text-gray-400 font-mono-tech uppercase">AVG BREATHING</div>
            <div className="text-lg font-orbitron font-bold text-white">
              {Math.round(stats.averageBreathingRate * 10) / 10} <span className="text-xs text-gray-400">BrPM</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <div className="text-xs font-orbitron font-bold text-[#00f2fe] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>UNLOCKED ACHIEVEMENTS</span>
          </div>

          <div className="flex flex-col gap-2">
            {stats.achievements.map(ach => (
              <div
                key={ach.id}
                className="flex items-center gap-3 p-2.5 rounded bg-black/40 border border-gray-800"
              >
                <div className="w-8 h-8 rounded bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-sm">
                  {ach.icon}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-orbitron font-bold text-white">{ach.title}</div>
                  <div className="text-[11px] text-gray-400 font-rajdhani">{ach.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Replay Button */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              sound.init();
              sound.resume();
              onReplay();
            }}
            className="flex-1 cyber-button flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>INFILTRATE AGAIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
