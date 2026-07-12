import { useTranslation } from 'react-i18next';
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
    { label: t('common.lastSold'), value: stats.lastSold },
    { label: t('common.average'), value: stats.average },
    { label: t('common.lowest'), value: stats.min },
    { label: t('common.highest'), value: stats.max },
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            'rounded-xl border border-border bg-surface-light',
            compact ? 'p-3' : 'p-4'
          )}
        >
          <p className={cn('text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
            {card.label}
          </p>
          <p
            className={cn(
              'font-bold text-foreground font-mono',
              compact ? 'text-lg mt-0.5' : 'text-xl mt-1'
            )}
          >
            ฿{(card.value ?? 0).toLocaleString()}
          </p>
        </div>
      ))}
      {showCount && (
        <div
          className={cn(
            'rounded-xl border border-border bg-surface-light col-span-2 md:col-span-4',
            compact ? 'p-2 px-3' : 'p-3'
          )}
        >
          <p className={cn('text-muted-foreground', compact ? 'text-[10px]' : 'text-xs')}>
            {t('common.sampleSize')}
          </p>
          <p className={cn('font-bold text-foreground font-mono', compact ? 'text-sm mt-0.5' : 'text-base mt-1')}>
            {stats.count ?? 0} sales
          </p>
        </div>
      )}
    </div>
  );
}
