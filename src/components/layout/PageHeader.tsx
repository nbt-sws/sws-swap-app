import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
  back?:
    | {
        to: string;
        params?: Record<string, string>;
        search?: Record<string, unknown>;
      }
    | (() => void);
}

export function PageHeader({ title, icon, description, action, className, back }: PageHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('mb-6', className)}>
      {back && (
        <div className="flex items-center justify-between mb-4">
          {typeof back === 'function' ? (
            <button
              onClick={back}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
            </button>
          ) : (
            <Link
              to={back.to}
              params={back.params}
              search={back.search}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('common.back')}
            </Link>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {icon}
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {!back && action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
