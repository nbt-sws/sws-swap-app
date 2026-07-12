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
  const cards = [
    { label: 'Last sold', value: stats.lastSold },
    { label: 'Average', value: stats.average },
    { label: 'Lowest', value: stats.min },
    { label: 'Highest', value: stats.max },
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
            Sample size
          </p>
          <p className={cn('font-bold text-foreground font-mono', compact ? 'text-sm mt-0.5' : 'text-base mt-1')}>
            {stats.count ?? 0} sales
          </p>
        </div>
      )}
    </div>
  );
}
