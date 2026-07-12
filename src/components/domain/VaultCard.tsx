import { Link } from '@tanstack/react-router';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn, getCardImageUrl, formatPriceChange } from '@/lib/utils';
import type { VaultItem } from '@/types';

interface VaultCardProps {
  item: VaultItem;
  selected?: boolean;
  selecting?: boolean;
  onToggleSelect?: (itemId: string) => void;
  className?: string;
}

export function VaultCard({ item, selected, selecting, onToggleSelect, className }: VaultCardProps) {
  const statusLabel =
    item.status === 'held'
      ? 'In Vault'
      : item.status === 'sold'
      ? 'Sold'
      : 'Graded';

  const statusColor =
    item.status === 'held'
      ? 'bg-cyan/20 text-cyan'
      : item.status === 'sold'
      ? 'bg-pldown/20 text-pldown'
      : 'bg-candle/20 text-candle';

  return (
    <div
      className={cn(
        'group relative bg-surface-light rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-brand/20 transition-all duration-300',
        selecting && selected && 'ring-2 ring-brand border-transparent',
        className
      )}
    >
      {/* Selection checkbox */}
      {selecting && (
        <div className="absolute top-3 left-3 z-20">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect?.(item.id)}
          />
        </div>
      )}

      <Link
        to="/vault/items/$itemId"
        params={{ itemId: item.id }}
        className="block relative aspect-[5/7] overflow-hidden rounded-t-2xl"
      >
        <ImageWithFallback
          src={getCardImageUrl(item.card)}
          alt={item.card.nameEn}
          className="transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className={statusColor}>{statusLabel}</Badge>
        </div>

        {/* Hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="p-3">
        <p className="text-xs font-mono text-muted-foreground">{item.card.code}</p>
        <p className="text-sm font-semibold truncate">{item.card.nameEn}</p>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-[10px] font-mono bg-surface-lighter px-1.5 py-0.5 rounded">{item.condition}</span>
          <span className="text-[10px] font-mono bg-surface-lighter px-1.5 py-0.5 rounded">{item.card.rarity}</span>
          <span className="text-[10px] font-mono bg-surface-lighter px-1.5 py-0.5 rounded">{item.card.language}</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-[10px] text-muted-foreground">Value</p>
            <p className="text-sm font-bold font-mono">
              {item.status === 'sold' && item.soldFor ? `฿${item.soldFor.toLocaleString()}` : `฿${item.currentPrice.toLocaleString()}`}
            </p>
          </div>
          {item.status !== 'sold' && (
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">P/L</p>
              <div className={cn('flex items-center justify-end text-xs font-bold', item.plPercent >= 0 ? 'text-plup' : 'text-pldown')}>
                {item.plPercent >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {formatPriceChange(item.plPercent)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
