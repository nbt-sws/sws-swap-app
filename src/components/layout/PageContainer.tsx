import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeMap = {
  sm: 'max-w-4xl',
  md: 'max-w-6xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1440px]',
  full: 'max-w-none',
};

export function PageContainer({ children, className, size = 'xl' }: PageContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-12 pb-0 md:pb-0', sizeMap[size], className)}>
      {children}
    </div>
  );
}
