import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function ImageWithFallback({ src, alt, className, fallbackClassName }: ImageWithFallbackProps) {
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
    <img
      src={src}
      alt={alt}
      className={cn('w-full h-full object-cover', className)}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
    />
  );
}
