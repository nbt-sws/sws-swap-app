import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function ImageWithFallback({ src, alt, className, fallbackClassName }: ImageWithFallbackProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    // Designed card-back placeholder — never a bare letter that reads as "broken image"
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center gap-2',
          'bg-gradient-to-br from-brand/10 via-surface-lighter to-periwinkle/10',
          fallbackClassName
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-muted-foreground/60">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h8M8 11h8M8 15h5" strokeLinecap="round" />
        </svg>
        <span className="text-xs font-mono text-muted-foreground/70 max-w-[80%] truncate px-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Shimmer placeholder while loading — sibling so caller transitions on <img> stay intact */}
      {!loaded && <div className="absolute inset-0 shimmer bg-surface-lighter" aria-hidden="true" />}
      {/* Fade the wrapper, not the img: caller's hover/scale transition classes keep working */}
      <div
        className={cn(
          'h-full w-full overflow-hidden transition-opacity duration-300 ease-out',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
      >
        <img
          src={src}
          alt={alt}
          className={cn('w-full h-full object-cover', className)}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}
