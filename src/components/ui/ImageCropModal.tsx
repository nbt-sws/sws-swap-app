import { useCallback, useRef, useState } from 'react';
import { X, Crop, RotateCcw, Check } from 'lucide-react';
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

  const onPointerUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

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
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-black overflow-hidden h-dvh max-h-dvh sm:inset-6 sm:mx-auto sm:h-[calc(100dvh-3rem)] sm:max-h-[900px] sm:w-[calc(100vw-3rem)] sm:max-w-5xl sm:rounded-2xl sm:border sm:border-white/15 sm:shadow-2xl"
      style={{ touchAction: 'none' }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 bg-black/80 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/75 text-white shadow-lg hover:bg-white/15 transition-colors"
          aria-label="Cancel crop"
        >
          <X className="w-5 h-5" />
        </button>
        <p className="min-w-0 flex-1 text-center text-sm text-white/90 font-medium select-none truncate">
          {cropPreview ? 'Review your crop' : hasCrop ? 'Tap Crop to continue' : 'Drag to select area'}
        </p>
        <span className="w-10 shrink-0" aria-hidden="true" />
      </div>

      {/* Image + selection overlay */}
      <div
        className="relative flex flex-1 min-h-0 items-center justify-center overflow-hidden select-none px-4 pb-4"
        onPointerDown={cropPreview ? undefined : onPointerDown}
        onPointerMove={cropPreview ? undefined : onPointerMove}
        onPointerUp={cropPreview ? undefined : onPointerUp}
        onPointerCancel={cropPreview ? undefined : onPointerUp}
        style={{ cursor: cropPreview ? 'default' : 'crosshair', touchAction: 'none' }}
      >
        <div className={cropPreview ? 'relative rounded-xl border border-white/15 bg-white/5 p-2' : 'relative inline-block'}>
          <img
            ref={imgRef}
            src={cropPreview ?? src}
            alt={cropPreview ? 'Cropped image preview' : 'Crop preview'}
            className={cropPreview
              ? 'block max-h-[62dvh] w-auto max-w-[calc(100vw-3rem)] object-contain rounded-lg pointer-events-none select-none sm:max-h-[64dvh]'
              : 'block max-h-[62dvh] w-auto max-w-[calc(100vw-3rem)] object-contain pointer-events-none select-none sm:max-h-[64dvh]'}
            draggable={false}
          />

          {!cropPreview && sel && sel.w > 0 && sel.h > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <mask id="crop-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={`${sel.x * 100}%`}
                      y={`${sel.y * 100}%`}
                      width={`${sel.w * 100}%`}
                      height={`${sel.h * 100}%`}
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
              </svg>

              <div
                className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                style={{ left: `${sel.x * 100}%`, top: `${sel.y * 100}%`, width: `${sel.w * 100}%`, height: `${sel.h * 100}%` }}
              >
                {/* Rule-of-thirds grid */}
                <span className="absolute inset-x-0 top-1/3 border-t border-white/40" />
                <span className="absolute inset-x-0 top-2/3 border-t border-white/40" />
                <span className="absolute inset-y-0 left-1/3 border-l border-white/40" />
                <span className="absolute inset-y-0 left-2/3 border-l border-white/40" />

                {/* Corner handles */}
                {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                  <span
                    key={c}
                    className="absolute w-4 h-4 border-white border-[3px] shadow-sm"
                    style={{
                      top: c.startsWith('t') ? -2 : undefined,
                      bottom: c.startsWith('b') ? -2 : undefined,
                      left: c.endsWith('l') ? -2 : undefined,
                      right: c.endsWith('r') ? -2 : undefined,
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        {cropPreview ? (
          <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-12 flex-1 gap-1.5 border-white/20 text-white hover:bg-white/10"
              onClick={handleRedo}
            >
              <RotateCcw className="w-4 h-4" />
              Adjust
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-12 flex-1 gap-1.5 bg-brand hover:bg-brand-light text-white"
              onClick={() => onConfirm(cropPreview)}
            >
              <Check className="w-4 h-4" />
              Confirm
            </Button>
          </div>
        ) : (
          <div className="mx-auto max-w-sm space-y-2">
            <p className="text-xs text-white/50 select-none text-center">
              {hasCrop
                ? `Selected ${Math.round(sel!.w * 100)}% × ${Math.round(sel!.h * 100)}% of image`
                : 'Drag on the image to crop, or use the full image'}
            </p>
            <Button
              type="button"
              size="sm"
              className="w-full h-12 bg-brand hover:bg-brand-light text-white gap-1.5"
              onClick={handleConfirm}
            >
              <Crop className="w-4 h-4" />
              {hasCrop ? 'Crop selection' : 'Use full image'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
