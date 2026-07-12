import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { PageContainer } from './PageContainer';
import type { PageContainerProps } from './PageContainer';

interface ScrollablePageProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: PageContainerProps['size'];
}

export function ScrollablePage({ header, children, footer, className, size }: ScrollablePageProps) {
  return (
    <PageContainer className={cn('flex h-full flex-col py-6', className)} size={size}>
      {header}
      <div className={cn('flex-1 overflow-y-auto scrollbar-hide', footer ? 'pb-4' : 'pb-6')}>
        {children}
      </div>
      {footer && <div className="shrink-0">{footer}</div>}
    </PageContainer>
  );
}
