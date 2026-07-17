import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageZoomDialogProps {
  images: string[];
  index: number;
  open: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  alt: string;
}

/**
 * Lightbox for viewing item photos full-size.
 * Click the image to toggle 1x / 2x zoom; arrows navigate multi-photo sets.
 */
export function ImageZoomDialog({ images, index, open, onClose, onIndexChange, alt }: ImageZoomDialogProps) {
  const [zoomed, setZoomed] = useState(false);
  const total = images.length;
  const current = images[Math.min(index, total - 1)];

  // Reset zoom when navigating or reopening
  useEffect(() => {
    setZoomed(false);
  }, [index, open]);

  if (total === 0) return null;

  const go = (dir: -1 | 1) => {
    onIndexChange((index + dir + total) % total);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-transparent border-0 shadow-none max-w-3xl w-full p-0 sm:max-w-3xl"
        showCloseButton
      >
        <div className="relative flex items-center justify-center">
          {/* Main image — click to toggle zoom */}
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className={cn(
              'block max-w-full outline-none rounded-xl overflow-hidden transition-transform duration-200 ease-out',
              zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            )}
            aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
          >
            <img
              src={current}
              alt={alt}
              className={cn(
                'max-h-[80vh] w-auto object-contain rounded-xl bg-surface-dark transition-transform duration-200 ease-out select-none',
                zoomed && 'scale-[1.75]'
              )}
              draggable={false}
            />
          </button>

          {/* Prev / next */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Counter */}
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-mono text-white">
                {index + 1} / {total}
              </span>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
