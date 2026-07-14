import { useTranslation } from 'react-i18next';
import { Receipt, BarChart3, ArrowDown, ArrowUp, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketStatsCardsProps {
  stats: {
    lastSold?: number;
    average?: number;
    min?: number;
    max?: number;
    count?: number;
  };
  className?: string;
  compact?: boolean;
  showCount?: boolean;
}

export function MarketStatsCards({ stats, className, compact, showCount }: MarketStatsCardsProps) {
  const { t } = useTranslation();
  const cards = [
    { label: t('common.lastSold'), value: stats.lastSold, icon: Receipt, tone: 'text-brand bg-brand/10' },
    { label: t('common.average'), value: stats.average, icon: BarChart3, tone: 'text-periwinkle bg-periwinkle/10' },
    { label: t('common.lowest'), value: stats.min, icon: ArrowDown, tone: 'text-pldown bg-pldown/10' },
    { label: t('common.highest'), value: stats.max, icon: ArrowUp, tone: 'text-plup bg-plup/10' },
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={cn(
              'rounded-xl border border-border bg-surface-light',
              compact ? 'p-3' : 'p-4'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', card.tone)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-xs')}>
                {card.label}
              </p>
            </div>
            <p
              className={cn(
                'font-bold text-foreground font-mono',
                compact ? 'text-lg mt-0.5' : 'text-xl mt-1'
              )}
            >
              ฿{(card.value ?? 0).toLocaleString()}
            </p>
          </div>
        );
      })}
      {showCount && (
        <div
          className={cn(
            'rounded-xl border border-border bg-surface-light col-span-2 md:col-span-4',
            compact ? 'p-2 px-3' : 'p-3'
          )}
        >
          <p className={cn('text-muted-foreground', compact ? 'text-xs' : 'text-xs')}>
            {t('common.sampleSize')}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className={cn('font-bold text-foreground font-mono', compact ? 'text-sm mt-0.5' : 'text-base mt-1')}>
              {stats.count ?? 0} sales
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
