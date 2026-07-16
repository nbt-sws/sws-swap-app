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
    return (
      <div
        className={cn(
          'w-full h-full flex items-center justify-center bg-surface-lighter text-muted-foreground font-bold text-2xl font-mono',
          fallbackClassName
        )}
      >
        {(alt || '?').charAt(0).toUpperCase()}
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
