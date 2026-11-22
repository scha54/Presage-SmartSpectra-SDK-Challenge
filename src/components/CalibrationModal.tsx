import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, AlertCircle, ArrowRight, Shield, Sliders } from 'lucide-react';
import { smartspectraBridge } from '../services/smartspectraBridge';
import { CalibrationProfile, ValidationStatus } from '../types/smartspectra';
import { sound } from '../services/audio';

interface CalibrationModalProps {
  onComplete: (profile: CalibrationProfile) => void;
  onSwitchToDemo: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({ onComplete, onSwitchToDemo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationProgress, setCalibrationProgress] = useState<number>(0);
  const [validation, setValidation] = useState<ValidationStatus | null>(null);

  // Calibration accumulator
  const pulseSamples = useRef<number[]>([]);
  const breathSamples = useRef<number[]>([]);

  useEffect(() => {
    // Subscribe to validation status
    const unsub = smartspectraBridge.subscribeValidation(status => {
      setValidation(status);
    });

    // Subscribe to metrics during calibration
    const unsubMetrics = smartspectraBridge.subscribeMetrics(metrics => {
      if (isCalibrating) {
        pulseSamples.current.push(metrics.pulseRate);
        breathSamples.current.push(metrics.breathingRate);
      }
    });

    return () => {
      unsub();
      unsubMetrics();
    };
  }, [isCalibrating]);

  const requestCamera = async () => {
    if (!videoRef.current) return;
    const ok = await smartspectraBridge.initBrowserCamera(videoRef.current);
    if (ok) {
      setHasCameraAccess(true);
      startCalibration();
    }
  };

  const startCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);
    pulseSamples.current = [];
    breathSamples.current = [];

    const durationMs = 6000; // 6 seconds calibration
    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setCalibrationProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        finishCalibration();
      }
    }, 100);
  };

  const finishCalibration = () => {
    const avgPulse = pulseSamples.current.length > 0
      ? pulseSamples.current.reduce((a, b) => a + b, 0) / pulseSamples.current.length
      : 72;
    const avgBreath = breathSamples.current.length > 0
      ? breathSamples.current.reduce((a, b) => a + b, 0) / breathSamples.current.length
      : 14;

    const restingPulse = Math.round(avgPulse);
    const baselineBreath = Math.round(avgBreath * 10) / 10;

    const profile: CalibrationProfile = {
      restingPulseBpm: restingPulse,
      baselineBreathingBrpm: baselineBreath,
      pulseTargetRange: [restingPulse - 5, restingPulse + 6],
      calibratedAt: Date.now(),
      isCalibrated: true
    };

    sound.playLaserDisarm();
    onComplete(profile);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md">
      <div className="cyber-panel p-6 max-w-xl w-full border border-[#00f2fe]/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#00f2fe]" />
            <h2 className="text-lg font-orbitron font-bold text-white tracking-wide">
              BIOMETRIC SENSOR CALIBRATION
            </h2>
          </div>
          <span className="text-xs font-mono-tech text-gray-400">STEP 1/2</span>
        </div>

        {/* Video Preview & Alignment Reticle */}
        <div className="relative w-full h-56 bg-black rounded-lg overflow-hidden border border-gray-800 mb-4 flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover transform -scale-x-100 ${!hasCameraAccess ? 'hidden' : ''}`}
          />

          {!hasCameraAccess && (
            <div className="flex flex-col items-center gap-3 text-center p-4">
              <Camera className="w-12 h-12 text-gray-600 animate-pulse" />
              <div className="text-sm font-rajdhani text-gray-300">
                Position your face in the camera frame with adequate lighting.
              </div>
              <button
                onClick={requestCamera}
                className="cyber-button text-xs py-2 px-5"
              >
                ENABLE CAMERA SENSOR
              </button>
            </div>
          )}

          {hasCameraAccess && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Forehead & Cheeks Target Box */}
              <div className="w-36 h-28 border-2 border-dashed border-[#00f2fe] rounded-lg relative -translate-y-2">
                <span className="absolute -top-3.5 left-2 bg-black px-1 text-[9px] font-mono-tech text-[#00f2fe]">
                  FACE TARGET
                </span>
              </div>
              <div className="absolute inset-0 scanlines opacity-40 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Status / Guidance Message */}
        <div className="flex items-center gap-2.5 p-3 rounded bg-black/50 border border-gray-800 text-xs font-mono-tech mb-4">
          {validation?.isValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span className={validation?.isValid ? 'text-emerald-300' : 'text-amber-300'}>
            {hasCameraAccess 
              ? (isCalibrating ? `Calibrating baseline vitals (${calibrationProgress}%) — remain relaxed.` : 'Face detected. Ready to calibrate.')
              : 'Webcam consent required to compute real-time optical pulse and respiration.'}
          </span>
        </div>

        {/* Calibration Progress Bar */}
        {isCalibrating && (
          <div className="mb-4">
            <div className="flex justify-between text-xs font-mono-tech text-gray-400 mb-1">
              <span>ACQUIRING RESTING BASELINE</span>
              <span className="text-[#00f2fe] font-bold">{calibrationProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-[#00f2fe] transition-all duration-150"
                style={{ width: `${calibrationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {hasCameraAccess && !isCalibrating && (
            <button
              onClick={startCalibration}
              className="flex-1 cyber-button flex items-center justify-center gap-2 text-xs"
            >
              <span>START CALIBRATION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onSwitchToDemo}
            className="cyber-button cyber-button-amber flex items-center justify-center gap-2 text-xs"
          >
            <Sliders className="w-4 h-4" />
            <span>BYPASS WITH DEMO CONTROLS</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="mt-4 pt-2.5 border-t border-gray-900 flex items-center gap-2 text-[10px] text-gray-500 font-mono-tech">
          <Shield className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
          <span>ON-DEVICE COMPUTATION: Video frames are processed strictly in your local browser runtime.</span>
        </div>
      </div>
    </div>
  );
};
