import React, { useEffect, useRef } from 'react';
import { smartspectraBridge } from '../services/smartspectraBridge';
import { ValidationStatus } from '../types/smartspectra';
import { Camera, AlertCircle, CheckCircle, X } from 'lucide-react';

interface CameraPreviewProps {
  onClose: () => void;
  validationStatus: ValidationStatus | null;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({ onClose, validationStatus }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      smartspectraBridge.initBrowserCamera(videoRef.current);
    }
    return () => {
      // Do not stop stream on PIP close so background measurement persists
    };
  }, []);

  return (
    <div className="fixed bottom-20 right-4 w-64 cyber-panel p-2.5 z-30 pointer-events-auto shadow-2xl">
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-[#00f2fe] font-orbitron font-bold">
          <Camera className="w-3.5 h-3.5" />
          <span>SMARTSPECTRA SENSOR</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition p-0.5"
          title="Minimize Preview"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Video Container with Face Reticle Overlay */}
      <div className="relative w-full h-40 bg-black rounded overflow-hidden border border-gray-800">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover transform -scale-x-100"
        />

        {/* Targeting Reticle & Forehead ROI Box */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Forehead / Face Region of Interest Indicator */}
          <div className="w-28 h-20 border border-cyan-400/60 rounded-md relative -translate-y-4">
            <span className="absolute -top-3 left-1 text-[8px] font-mono-tech text-cyan-400 bg-black/80 px-1">
              ROI: SIGNAL LOCK
            </span>
            {/* Corner Crosshairs */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />
          </div>
        </div>

        {/* Scanlines Effect */}
        <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />
      </div>

      {/* Signal Status Bar */}
      <div className="mt-2 text-[10px] font-mono-tech flex items-center gap-1.5">
        {validationStatus?.isValid ? (
          <>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 truncate">{validationStatus.message || 'Signal locked. Stay steady.'}</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-400 truncate">{validationStatus?.message || 'Detecting facial signal...'}</span>
          </>
        )}
      </div>
    </div>
  );
};
