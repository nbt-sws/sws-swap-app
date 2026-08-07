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
  /** Pixel chip rendered next to the title (e.g. "BETA", counts). */
  badge?: ReactNode;
  /** Shipaton-style eyebrow kicker above the title. */
  eyebrow?: string;
  /** Category accent for the eyebrow (default: brand). */
  eyebrowAccent?: 'brand' | 'cyan' | 'peri';
  /** Neon title glow — default on; turn off for dense doc-style pages. */
  glow?: boolean;
  back?:
    | {
        to: string;
        params?: Record<string, string>;
        search?: Record<string, unknown>;
      }
    | (() => void);
}

/**
 * Unified page hero — surreal mesh + neon title + pixel accent.
 * Every primary screen renders its header through this so all pages
 * share the same arcade-console chrome.
 */
export function PageHeader({
  title,
  icon,
  description,
  action,
  className,
  badge,
  eyebrow,
  eyebrowAccent = 'brand',
  glow = true,
  back,
}: PageHeaderProps) {
  const { t } = useTranslation();
  return (
    <header
      className={cn(
        'relative mb-6 overflow-hidden rounded-2xl border border-border/60 bg-surface-light/60 px-5 py-5 sm:px-6',
        className
      )}
    >
      <div className="surreal-mesh absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div
        className="absolute bottom-0 left-0 h-3 w-3 bg-brand/60 pxl-corner"
        aria-hidden="true"
      />

      <div className="relative">
        {back && (
          <div className="mb-3">
            {typeof back === 'function' ? (
              <button
                onClick={back}
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-brand transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {t('common.back')}
              </button>
            ) : (
              <Link
                to={back.to}
                params={back.params}
                search={back.search}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-brand transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                {t('common.back')}
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && (
              <p
                className={cn(
                  'eyebrow mb-1.5',
                  eyebrowAccent === 'cyan' && 'eyebrow--cyan',
                  eyebrowAccent === 'peri' && 'eyebrow--peri'
                )}
              >
                {eyebrow}
              </p>
            )}
            <div className="flex items-center gap-2.5">
              {icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-surface/80 [&>svg]:h-5 [&>svg]:w-5">
                  {icon}
                </div>
              )}
              <h1
                className={cn(
                  'text-2xl sm:text-3xl font-extrabold tracking-tight truncate',
                  glow && 'neon-text-brand'
                )}
              >
                {title}
              </h1>
              {badge}
            </div>
            {description && (
              <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </header>
  );
}
