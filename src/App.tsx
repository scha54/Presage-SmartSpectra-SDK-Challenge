import React, { useState, useEffect, useRef } from 'react';
import { GameStage, Room1LaserState, Room2VaultState, Room3BridgeState, PlayerStats, Achievement } from './types/game';
import { SmartSpectraMetrics, DataSourceMode, CalibrationProfile, ValidationStatus } from './types/smartspectra';
import { smartspectraBridge } from './services/smartspectraBridge';
import { sound } from './services/audio';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HUD } from './components/HUD';
import { ObjectivesPanel } from './components/ObjectivesPanel';
import { CameraPreview } from './components/CameraPreview';
import { TitleScreen } from './components/TitleScreen';
import { CalibrationModal } from './components/CalibrationModal';
import { VictoryModal } from './components/VictoryModal';
import { DemoControls } from './components/DemoControls';

export const App: React.FC = () => {
  // Game Lifecycle State
  const [stage, setStage] = useState<GameStage>('TITLE');
  const [mode, setMode] = useState<DataSourceMode>('LIVE_SDK');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCameraPIP, setShowCameraPIP] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Live Metrics & Status
  const [metrics, setMetrics] = useState<SmartSpectraMetrics>({
    pulseRate: 72,
    breathingRate: 14,
    respiratoryPhase: 0,
    hrvRmssd: 45,
    confidence: 0.9,
    stabilityScore: 85,
    timestampUs: 0
  });
  const [validation, setValidation] = useState<ValidationStatus | null>(null);

  // Calibration Profile
  const [calibration, setCalibration] = useState<CalibrationProfile>({
    restingPulseBpm: 72,
    baselineBreathingBrpm: 14,
    pulseTargetRange: [67, 77],
    calibratedAt: 0,
    isCalibrated: false
  });

  // Room 1: Laser Corridor State
  const [room1State, setRoom1State] = useState<Room1LaserState>({
    currentGateIndex: 0,
    gates: [
      { id: 1, name: 'ALPHA BARRIER', isDisarmed: false, disarmProgress: 0, requiredStabilityTime: 3.0, stableTimeElapsed: 0, beamFlickerRate: 1 },
      { id: 2, name: 'BETA GRID', isDisarmed: false, disarmProgress: 0, requiredStabilityTime: 3.5, stableTimeElapsed: 0, beamFlickerRate: 1.5 },
      { id: 3, name: 'GAMMA SHIELD', isDisarmed: false, disarmProgress: 0, requiredStabilityTime: 4.0, stableTimeElapsed: 0, beamFlickerRate: 2 }
    ],
    isCorridorCleared: false,
    breathingWindowMin: 10,
    breathingWindowMax: 16,
    calmSteadiness: 85,
    alarmTriggered: false,
    alarmLevel: 0
  });

  // Room 2: Pulse Vault State
  const [room2State, setRoom2State] = useState<Room2VaultState>({
    tumblers: [
      { id: 1, name: 'TUMBLER I (70 BPM)', isLocked: true, targetBpm: 70, tolerance: 5, holdDurationRequired: 3.0, currentHoldSeconds: 0 },
      { id: 2, name: 'TUMBLER II (74 BPM)', isLocked: true, targetBpm: 74, tolerance: 5, holdDurationRequired: 3.5, currentHoldSeconds: 0 },
      { id: 3, name: 'TUMBLER III (78 BPM)', isLocked: true, targetBpm: 78, tolerance: 5, holdDurationRequired: 4.0, currentHoldSeconds: 0 }
    ],
    activeTumblerIndex: 0,
    isVaultUnlocked: false,
    doorOpenProgress: 0,
    resonanceSync: 0
  });

  // Room 3: Breath Bridge State
  const [room3State, setRoom3State] = useState<Room3BridgeState>({
    segments: [
      { id: 1, isCrystallized: false, energyLevel: 0, stability: 0 },
      { id: 2, isCrystallized: false, energyLevel: 0, stability: 0 },
      { id: 3, isCrystallized: false, energyLevel: 0, stability: 0 },
      { id: 4, isCrystallized: false, energyLevel: 0, stability: 0 },
      { id: 5, isCrystallized: false, energyLevel: 0, stability: 0 }
    ],
    currentSegmentIndex: 0,
    completedBreathCycles: 0,
    targetBreathCycles: 5,
    isBridgeCrossable: false,
    playerWalkProgress: 0,
    abyssTurbulence: 20
  });

  // Player Performance Stats
  const gameStartTime = useRef<number>(0);
  const pulseReadings = useRef<number[]>([]);
  const breathReadings = useRef<number[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    startTime: 0,
    endTime: 0,
    totalTimeSeconds: 0,
    averageHeartRate: 72,
    averageBreathingRate: 14,
    stealthScore: 850,
    achievements: []
  });

  // Breath cycle tracking ref for Room 3
  const hasInhaledInCycle = useRef<boolean>(false);
  const lastHeartbeatTime = useRef<number>(0);

  // Subscribe to SmartSpectra bridge data
  useEffect(() => {
    const unsubMetrics = smartspectraBridge.subscribeMetrics(newMetrics => {
      setMetrics(newMetrics);
      pulseReadings.current.push(newMetrics.pulseRate);
      breathReadings.current.push(newMetrics.breathingRate);

      // Procedural audio modulation
      sound.updateBreathAudio(newMetrics.respiratoryPhase, newMetrics.stabilityScore);

      // Trigger heartbeat thump audio synced to pulse
      const now = performance.now();
      const heartbeatIntervalMs = (60 / Math.max(45, newMetrics.pulseRate)) * 1000;
      if (now - lastHeartbeatTime.current >= heartbeatIntervalMs) {
        sound.triggerHeartbeat(0.9);
        lastHeartbeatTime.current = now;
      }
    });

    const unsubValidation = smartspectraBridge.subscribeValidation(newValidation => {
      setValidation(newValidation);
    });

    const unsubStatus = smartspectraBridge.subscribeStatus(newStatus => {
      setMode(newStatus.mode);
    });

    return () => {
      unsubMetrics();
      unsubValidation();
      unsubStatus();
    };
  }, []);

  // Timer loop
  useEffect(() => {
    if (stage === 'TITLE' || stage === 'CONSENT_CALIBRATION' || stage === 'VICTORY') return;

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  // Main Gameplay Logic Loop (100ms tick)
  useEffect(() => {
    if (stage === 'TITLE' || stage === 'CONSENT_CALIBRATION' || stage === 'VICTORY') return;

    const tick = setInterval(() => {
      const dt = 0.1; // 100ms

      // --- PUZZLE 1: LASER CORRIDOR ---
      if (stage === 'ROOM1_LASER') {
        const { currentGateIndex, gates, breathingWindowMin, breathingWindowMax } = room1State;
        const currentGate = gates[currentGateIndex];

        if (currentGate && !currentGate.isDisarmed) {
          const isBreathInWindow = metrics.breathingRate >= breathingWindowMin && metrics.breathingRate <= breathingWindowMax;
          const isCalm = metrics.stabilityScore >= 68 && isBreathInWindow;

          if (isCalm) {
            const newElapsed = currentGate.stableTimeElapsed + dt;
            const progress = Math.min(100, Math.round((newElapsed / currentGate.requiredStabilityTime) * 100));

            if (newElapsed >= currentGate.requiredStabilityTime) {
              // Disarm this gate!
              sound.playLaserDisarm();
              const updatedGates = [...gates];
              updatedGates[currentGateIndex] = {
                ...currentGate,
                isDisarmed: true,
                disarmProgress: 100,
                stableTimeElapsed: newElapsed
              };

              const nextGateIdx = currentGateIndex + 1;
              if (nextGateIdx >= gates.length) {
                // All gates disarmed! Advance to Room 2
                setRoom1State(prev => ({
                  ...prev,
                  gates: updatedGates,
                  isCorridorCleared: true
                }));
                setTimeout(() => {
                  setStage('ROOM2_VAULT');
                }, 1200);
              } else {
                setRoom1State(prev => ({
                  ...prev,
                  currentGateIndex: nextGateIdx,
                  gates: updatedGates
                }));
              }
            } else {
              const updatedGates = [...gates];
              updatedGates[currentGateIndex] = {
                ...currentGate,
                disarmProgress: progress,
                stableTimeElapsed: newElapsed
              };
              setRoom1State(prev => ({ ...prev, gates: updatedGates }));
            }
          } else {
            // Unstable breathing decays progress slightly
            const newElapsed = Math.max(0, currentGate.stableTimeElapsed - dt * 0.4);
            const progress = Math.min(100, Math.round((newElapsed / currentGate.requiredStabilityTime) * 100));
            const updatedGates = [...gates];
            updatedGates[currentGateIndex] = {
              ...currentGate,
              disarmProgress: progress,
              stableTimeElapsed: newElapsed
            };
            setRoom1State(prev => ({ ...prev, gates: updatedGates }));
          }
        }
      }

      // --- PUZZLE 2: PULSE VAULT ---
      else if (stage === 'ROOM2_VAULT') {
        const { tumblers, activeTumblerIndex, isVaultUnlocked } = room2State;
        if (!isVaultUnlocked) {
          const activeTumbler = tumblers[activeTumblerIndex];
          if (activeTumbler && activeTumbler.isLocked) {
            const diff = Math.abs(metrics.pulseRate - activeTumbler.targetBpm);
            const inResonance = diff <= activeTumbler.tolerance;
            const resonancePercent = Math.max(0, Math.min(100, Math.round((1 - diff / 18) * 100)));

            if (inResonance) {
              const newHold = activeTumbler.currentHoldSeconds + dt;
              if (newHold >= activeTumbler.holdDurationRequired) {
                // Tumbler pin snapped!
                sound.playTumblerClick();
                const updatedTumblers = [...tumblers];
                updatedTumblers[activeTumblerIndex] = {
                  ...activeTumbler,
                  isLocked: false,
                  currentHoldSeconds: activeTumbler.holdDurationRequired
                };

                const nextTumblerIdx = activeTumblerIndex + 1;
                if (nextTumblerIdx >= tumblers.length) {
                  // All tumblers unlocked!
                  sound.playVaultUnlock();
                  setRoom2State(prev => ({
                    ...prev,
                    tumblers: updatedTumblers,
                    isVaultUnlocked: true,
                    resonanceSync: 100
                  }));
                  setTimeout(() => {
                    setStage('ROOM3_BRIDGE');
                  }, 2000);
                } else {
                  setRoom2State(prev => ({
                    ...prev,
                    activeTumblerIndex: nextTumblerIdx,
                    tumblers: updatedTumblers,
                    resonanceSync: 100
                  }));
                }
              } else {
                const updatedTumblers = [...tumblers];
                updatedTumblers[activeTumblerIndex] = { ...activeTumbler, currentHoldSeconds: newHold };
                setRoom2State(prev => ({
                  ...prev,
                  tumblers: updatedTumblers,
                  resonanceSync: resonancePercent
                }));
              }
            } else {
              // Pulse drifted out of resonance
              const newHold = Math.max(0, activeTumbler.currentHoldSeconds - dt * 0.5);
              const updatedTumblers = [...tumblers];
              updatedTumblers[activeTumblerIndex] = { ...activeTumbler, currentHoldSeconds: newHold };
              setRoom2State(prev => ({
                ...prev,
                tumblers: updatedTumblers,
                resonanceSync: resonancePercent
              }));
            }
          }
        }
      }

      // --- PUZZLE 3: BREATH BRIDGE ---
      else if (stage === 'ROOM3_BRIDGE') {
        const { currentSegmentIndex, segments, completedBreathCycles, isBridgeCrossable } = room3State;

        if (!isBridgeCrossable) {
          // Detect full breath cycle: Inhale peak (phase > 0.55) followed by Exhale trough (phase < -0.45)
          if (metrics.respiratoryPhase >= 0.55) {
            hasInhaledInCycle.current = true;
          }

          const currentSeg = segments[currentSegmentIndex];
          if (currentSeg) {
            // Fill current segment energy in sync with inhalation
            const energy = Math.min(100, Math.max(10, Math.round((metrics.respiratoryPhase + 1) * 50)));
            const updatedSegments = [...segments];
            updatedSegments[currentSegmentIndex] = { ...currentSeg, energyLevel: energy };
            setRoom3State(prev => ({ ...prev, segments: updatedSegments }));
          }

          if (hasInhaledInCycle.current && metrics.respiratoryPhase <= -0.45) {
            // Full breath cycle completed! Crystallize platform!
            hasInhaledInCycle.current = false;
            sound.playBridgeCrystal(currentSegmentIndex);

            const updatedSegments = [...segments];
            updatedSegments[currentSegmentIndex] = {
              ...currentSeg,
              isCrystallized: true,
              energyLevel: 100
            };

            const nextCycles = completedBreathCycles + 1;
            const nextSegIdx = currentSegmentIndex + 1;

            if (nextCycles >= 5) {
              // Bridge completely materialized!
              setRoom3State(prev => ({
                ...prev,
                segments: updatedSegments,
                completedBreathCycles: 5,
                isBridgeCrossable: true
              }));

              // Finish escape!
              setTimeout(() => {
                completeGame();
              }, 2200);
            } else {
              setRoom3State(prev => ({
                ...prev,
                segments: updatedSegments,
                currentSegmentIndex: nextSegIdx,
                completedBreathCycles: nextCycles
              }));
            }
          }
        }
      }
    }, 100);

    return () => clearInterval(tick);
  }, [stage, room1State, room2State, room3State, metrics]);

  // Complete Game & Compute Stats
  const completeGame = () => {
    sound.playVictoryFanfare();
    const endTime = Date.now();
    const totalSecs = Math.max(15, Math.round((endTime - gameStartTime.current) / 1000));

    const avgPulse = pulseReadings.current.length > 0
      ? pulseReadings.current.reduce((a, b) => a + b, 0) / pulseReadings.current.length
      : 74;
    const avgBreath = breathReadings.current.length > 0
      ? breathReadings.current.reduce((a, b) => a + b, 0) / breathReadings.current.length
      : 13.8;

    // Calculate Bio-Stealth Score (up to 1000 pts)
    const timeScore = Math.max(200, 500 - totalSecs * 2);
    const stabilityScore = Math.round(metrics.stabilityScore * 5);
    const totalScore = Math.min(1000, timeScore + stabilityScore);

    const achievements: Achievement[] = [
      {
        id: 'zen',
        title: 'Zen Infiltrator',
        description: 'Maintained calm respiratory rhythm under laser surveillance.',
        icon: '🧘',
        unlocked: true
      },
      {
        id: 'pulse',
        title: 'Pulse of Steel',
        description: 'Synchronized cardiovascular resonance to unlock the vault tumblers.',
        icon: '⚡',
        unlocked: true
      },
      {
        id: 'bridge',
        title: 'Quantum Strider',
        description: 'Materialized the crystalline abyss bridge with rhythmic breathing.',
        icon: '🌉',
        unlocked: true
      }
    ];

    setPlayerStats({
      startTime: gameStartTime.current,
      endTime,
      totalTimeSeconds: totalSecs,
      averageHeartRate: avgPulse,
      averageBreathingRate: avgBreath,
      stealthScore: totalScore,
      achievements
    });

    setStage('VICTORY');
  };

  // Start Live Heist
  const handleStartLive = () => {
    setStage('CONSENT_CALIBRATION');
  };

  // Start Direct Demo Mode
  const handleStartDemo = () => {
    smartspectraBridge.setMode('DEMO_MODE');
    setMode('DEMO_MODE');
    gameStartTime.current = Date.now();
    setStage('ROOM1_LASER');
  };

  // Calibration Complete
  const handleCalibrationComplete = (profile: CalibrationProfile) => {
    setCalibration(profile);
    // Tailor Room 2 targets around player's calibrated resting pulse
    const base = profile.restingPulseBpm;
    setRoom2State(prev => ({
      ...prev,
      tumblers: [
        { ...prev.tumblers[0], targetBpm: base - 2 },
        { ...prev.tumblers[1], targetBpm: base + 2 },
        { ...prev.tumblers[2], targetBpm: base + 5 }
      ]
    }));
    gameStartTime.current = Date.now();
    setStage('ROOM1_LASER');
  };

  // Bypass / Fast-Forward current stage for quick demonstration
  const handleFastForward = () => {
    sound.playLaserDisarm();
    if (stage === 'ROOM1_LASER') {
      setRoom1State(prev => ({
        ...prev,
        isCorridorCleared: true,
        gates: prev.gates.map(g => ({ ...g, isDisarmed: true, disarmProgress: 100 }))
      }));
      setStage('ROOM2_VAULT');
    } else if (stage === 'ROOM2_VAULT') {
      sound.playVaultUnlock();
      setRoom2State(prev => ({
        ...prev,
        isVaultUnlocked: true,
        tumblers: prev.tumblers.map(t => ({ ...t, isLocked: false, currentHoldSeconds: t.holdDurationRequired }))
      }));
      setStage('ROOM3_BRIDGE');
    } else if (stage === 'ROOM3_BRIDGE') {
      completeGame();
    }
  };

  // Reset & Replay
  const handleReplay = () => {
    setElapsedSeconds(0);
    pulseReadings.current = [];
    breathReadings.current = [];
    setRoom1State(prev => ({
      ...prev,
      currentGateIndex: 0,
      isCorridorCleared: false,
      gates: prev.gates.map(g => ({ ...g, isDisarmed: false, disarmProgress: 0, stableTimeElapsed: 0 }))
    }));
    setRoom2State(prev => ({
      ...prev,
      activeTumblerIndex: 0,
      isVaultUnlocked: false,
      doorOpenProgress: 0,
      tumblers: prev.tumblers.map(t => ({ ...t, isLocked: true, currentHoldSeconds: 0 }))
    }));
    setRoom3State(prev => ({
      ...prev,
      currentSegmentIndex: 0,
      completedBreathCycles: 0,
      isBridgeCrossable: false,
      segments: prev.segments.map(s => ({ ...s, isCrystallized: false, energyLevel: 0 }))
    }));
    gameStartTime.current = Date.now();
    setStage('ROOM1_LASER');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      {/* 3D WebGL Canvas Viewport */}
      <ThreeCanvas
        stage={stage}
        metrics={metrics}
        room1State={room1State}
        room2State={room2State}
        room3State={room3State}
      />

      {/* Atmospheric CRT Scanline & Grain Overlay */}
      <div className="absolute inset-0 scanlines opacity-30 pointer-events-none z-10" />

      {/* In-Game HUD (Active during escape rooms) */}
      {(stage === 'ROOM1_LASER' || stage === 'ROOM2_VAULT' || stage === 'ROOM3_BRIDGE') && (
        <>
          <HUD
            stage={stage}
            metrics={metrics}
            mode={mode}
            elapsedSeconds={elapsedSeconds}
            isMuted={isMuted}
            onToggleMute={() => {
              const muted = sound.toggleMute();
              setIsMuted(muted);
            }}
            onToggleCameraPIP={() => setShowCameraPIP(!showCameraPIP)}
            showCameraPIP={showCameraPIP}
            room1State={room1State}
            room2State={room2State}
            room3State={room3State}
          />

          <ObjectivesPanel
            stage={stage}
            room1State={room1State}
            room2State={room2State}
            room3State={room3State}
          />
        </>
      )}

      {/* Floating Webcam PIP (When enabled and camera active) */}
      {showCameraPIP && stage !== 'TITLE' && stage !== 'CONSENT_CALIBRATION' && stage !== 'VICTORY' && (
        <CameraPreview
          onClose={() => setShowCameraPIP(false)}
          validationStatus={validation}
        />
      )}

      {/* Demo / Manual Fallback Controls */}
      {stage !== 'TITLE' && stage !== 'CONSENT_CALIBRATION' && (
        <DemoControls
          mode={mode}
          onSetMode={m => {
            smartspectraBridge.setMode(m);
            setMode(m);
          }}
          metrics={metrics}
          onFastForwardStage={handleFastForward}
        />
      )}

      {/* Modals / Screens */}
      {stage === 'TITLE' && (
        <TitleScreen
          onStart={handleStartLive}
          onStartDemo={handleStartDemo}
        />
      )}

      {stage === 'CONSENT_CALIBRATION' && (
        <CalibrationModal
          onComplete={handleCalibrationComplete}
          onSwitchToDemo={handleStartDemo}
        />
      )}

      {stage === 'VICTORY' && (
        <VictoryModal
          stats={playerStats}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
};
