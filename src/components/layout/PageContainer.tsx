import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeMap = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
};

export function PageContainer({ children, className, size = 'xl' }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24 md:pb-8', sizeMap[size], className)}>
      {children}
    </div>
  );
}
