import { useCallback, useRef, useState } from 'react';
import { X, Crop } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Rect {
  x: number; // normalized 0–1 relative to image
  y: number;
  w: number;
  h: number;
}

interface ImageCropModalProps {
  /** data-URL or object-URL of the image to crop */
  src: string;
  onConfirm: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

/**
 * Fullscreen crop UI — no external library required.
 * User drags on the image to draw a selection; tapping "Crop" extracts
 * that region via canvas. "Use full" skips cropping.
 */
export function ImageCropModal({ src, onConfirm, onCancel }: ImageCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [selection, setSelection] = useState<Rect | null>(null);
  const [cropPreview, setCropPreview] = useState<string | null>(null);
  const isDrawing = useRef(false);
  const drawStart = useRef<{ x: number; y: number } | null>(null);

  const getNorm = useCallback((clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return { x: 0, y: 0 };
    const r = img.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (clientY - r.top) / r.height)),
    };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const p = getNorm(e.clientX, e.clientY);
    drawStart.current = p;
    isDrawing.current = true;
    setSelection({ x: p.x, y: p.y, w: 0, h: 0 });
  }, [getNorm]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing.current || !drawStart.current) return;
    const p = getNorm(e.clientX, e.clientY);
    const s = drawStart.current;
    setSelection({
      x: Math.min(p.x, s.x),
      y: Math.min(p.y, s.y),
      w: Math.abs(p.x - s.x),
      h: Math.abs(p.y - s.y),
    });
  }, [getNorm]);

  const onPointerUp = useCallback(() => { isDrawing.current = false; }, []);

  const handleCrop = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const sel = selection && selection.w > 0.02 && selection.h > 0.02
      ? selection
      : { x: 0, y: 0, w: 1, h: 1 };
    const canvas = document.createElement('canvas');
    const sx = Math.round(sel.x * img.naturalWidth);
    const sy = Math.round(sel.y * img.naturalHeight);
    const sw = Math.max(1, Math.round(sel.w * img.naturalWidth));
    const sh = Math.max(1, Math.round(sel.h * img.naturalHeight));
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
    setCropPreview(canvas.toDataURL('image/jpeg', 0.92));
  }, [selection]);

  const handleConfirm = useCallback(() => {
    if (cropPreview) onConfirm(cropPreview);
    else handleCrop();
  }, [cropPreview, handleCrop, onConfirm]);

  const handleRedo = useCallback(() => {
    setCropPreview(null);
    setSelection(null);
  }, []);

  const hasCrop = !!(selection && selection.w > 0.02 && selection.h > 0.02);
  const sel = selection;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black" style={{ touchAction: 'none' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-3 shrink-0 bg-black/80 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button type="button" onClick={onCancel}
          className="p-2 rounded-full text-white hover:bg-white/10 transition-colors" aria-label="Cancel crop">
          <X className="w-5 h-5" />
        </button>
        <p className="min-w-0 text-center text-xs sm:text-sm text-white/80 font-medium select-none truncate">
          {cropPreview ? 'Review your crop' : hasCrop ? 'Tap Crop to continue' : 'Drag to select area'}
        </p>
        <span className="w-9 shrink-0" aria-hidden="true" />
      </div>

      {/* Image + selection overlay */}
      <div className="flex-1 flex items-center justify-center overflow-hidden select-none px-4 pb-24 sm:pb-20"
        onPointerDown={cropPreview ? undefined : onPointerDown}
        onPointerMove={cropPreview ? undefined : onPointerMove}
        onPointerUp={cropPreview ? undefined : onPointerUp}
        onPointerCancel={cropPreview ? undefined : onPointerUp}
        style={{ cursor: cropPreview ? 'default' : 'crosshair', touchAction: 'none' }}>
        <div className={cropPreview ? 'relative rounded-xl border border-white/15 bg-white/5 p-2' : 'relative inline-block'}>
          <img ref={imgRef} src={cropPreview ?? src} alt={cropPreview ? 'Cropped image preview' : 'Crop preview'}
            className={cropPreview
              ? 'block max-w-[calc(100vw-2rem)] max-h-[52dvh] sm:max-w-[min(82vw,420px)] sm:max-h-[58dvh] object-contain rounded-lg pointer-events-none select-none'
              : 'block max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-180px)] sm:max-w-[88vw] sm:max-h-[calc(100dvh-120px)] object-contain pointer-events-none select-none'}
            draggable={false} />

          {!cropPreview && sel && sel.w > 0 && sel.h > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <mask id="crop-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect x={`${sel.x * 100}%`} y={`${sel.y * 100}%`}
                      width={`${sel.w * 100}%`} height={`${sel.h * 100}%`} fill="black" />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
              </svg>

              <div className="absolute border-2 border-white"
                style={{ left: `${sel.x * 100}%`, top: `${sel.y * 100}%`, width: `${sel.w * 100}%`, height: `${sel.h * 100}%` }}>
                <span className="absolute inset-x-0 top-1/3 border-t border-white/30" />
                <span className="absolute inset-x-0 top-2/3 border-t border-white/30" />
                <span className="absolute inset-y-0 left-1/3 border-l border-white/30" />
                <span className="absolute inset-y-0 left-2/3 border-l border-white/30" />
                {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                  <span key={c} className="absolute w-4 h-4 border-white border-[3px]"
                    style={{
                      top: c.startsWith('t') ? -2 : undefined, bottom: c.startsWith('b') ? -2 : undefined,
                      left: c.endsWith('l') ? -2 : undefined, right: c.endsWith('r') ? -2 : undefined,
                    }} aria-hidden="true" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed inset-x-0 bottom-0 z-20 px-3 sm:px-4 py-3 text-center bg-black/95 backdrop-blur-sm border-t border-white/10 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {cropPreview ? (
          <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-2">
            <Button type="button" variant="outline" size="sm" className="h-10 flex-1 border-white/20 text-white hover:bg-white/10" onClick={handleRedo}>
              Adjust crop
            </Button>
            <Button type="button" size="sm" className="h-10 flex-1 bg-brand hover:bg-brand-light text-white" onClick={() => onConfirm(cropPreview)}>
              Confirm crop
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-white/40 select-none">
              {hasCrop
              ? `Selected ${Math.round(sel!.w * 100)}% × ${Math.round(sel!.h * 100)}% of image`
              : 'Or tap "Use full" to skip cropping'}
            </p>
            <Button type="button" size="sm" className="w-full max-w-sm h-10 bg-brand hover:bg-brand-light text-white gap-1.5" onClick={handleConfirm}>
              <Crop className="w-3.5 h-3.5" />
              {hasCrop ? 'Crop' : 'Use full'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
