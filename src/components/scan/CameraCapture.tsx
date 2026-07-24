import { useEffect, useRef, useState } from 'react';
import { X, Camera, SwitchCamera } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

/**
 * Fullscreen camera with a card-aspect reticle.
 * Adapted from sws-scanner-app's CameraCapture concept (getUserMedia + guide).
 */
export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) setError('Camera unavailable — use gallery instead');
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const shutter = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.9));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={onClose}
          aria-label="Close camera"
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
          aria-label="Switch camera"
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"
        >
          <SwitchCamera className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Video + reticle — pxl-scanline: the one surface where scanlines belong (DESIGN.md §7) */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden pxl-scanline">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Reticle guide (card aspect 63/88) */}
        <div className="relative z-10 pointer-events-none" style={{ aspectRatio: '63/88', height: 'min(70vh, 70vw * 88 / 63)' }}>
          <div className="absolute inset-0 rounded-2xl border-2 border-white/70" />
          <div className="absolute -top-8 inset-x-0 text-center text-xs font-medium text-white/80">
            Align the card inside the frame
          </div>
          {/* Corner accents */}
          {['top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl', 'top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl',
            'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl', 'bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl'].map((cls) => (
            <div key={cls} className={`absolute w-8 h-8 border-brand ${cls}`} />
          ))}
        </div>

        {error && (
          <div className="absolute inset-x-4 bottom-28 z-20 rounded-xl bg-surface-light/90 backdrop-blur p-3 text-center text-sm text-warning">
            {error}
          </div>
        )}
      </div>

      {/* Shutter */}
      <div className="absolute bottom-8 inset-x-0 z-10 flex justify-center">
        <button
          onClick={shutter}
          aria-label="Capture"
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Camera className="w-7 h-7 text-surface-dark" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
