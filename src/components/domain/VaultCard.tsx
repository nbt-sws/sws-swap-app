import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  TrendingUp,
  TrendingDown,
  Tag,
  Sparkles,
  EyeOff,
  Trash2,
  Gift,
  Package,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import { cn, getCardImageUrl, formatPriceChange, isPlatformHeld } from '@/lib/utils';
import type { VaultItem } from '@/types';

interface VaultCardProps {
  item: VaultItem;
  selected?: boolean;
  selecting?: boolean;
  onToggleSelect?: (itemId: string) => void;
  onList?: (item: VaultItem) => void;
  onDelist?: (item: VaultItem) => void;
  onRedeem?: (item: VaultItem) => void;
  onDelete?: (item: VaultItem) => void;
  isListed?: boolean;
  isOwner?: boolean;
  className?: string;
}

export function VaultCard({
  item,
  selected,
  selecting,
  onToggleSelect,
  onList,
  onDelist,
  onRedeem,
  onDelete,
  isOwner,
  className,
}: VaultCardProps) {
  const { t } = useTranslation();
  const platformHeld = isPlatformHeld(item);
  const isListing = item.itemStatus === 'LISTING';

  // Status configuration — pixel-chip look (R1), category colors (R3):
  // listed → cyan (market), vault states → periwinkle, grading → brand
  const statusConfig = isListing
    ? {
        label: t('filters.listed'),
        chipClass: 'pxl-chip--cyan',
        icon: Sparkles,
      }
    : item.status === 'sold'
    ? { label: t('common.sold'), chipClass: '', icon: null }
    : item.serviceOrderStatus
    ? {
        label: `${t('common.grade')} · ${item.serviceOrderStatus}`,
        chipClass: 'pxl-chip--brand',
        icon: null,
      }
    : platformHeld
    ? {
        label: 'SWS Vault',
        chipClass: 'pxl-chip--peri',
        icon: Package,
      }
    : {
        label: t('common.inVault'),
        chipClass: 'pxl-chip--peri',
        icon: null,
      };

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60',
        'bg-gradient-to-br from-surface-light via-surface to-surface-lighter/30',
        'transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20',
        'hover:-translate-y-1',
        selecting && selected && 'ring-2 ring-brand border-transparent',
        isListing && 'ring-1 ring-brand/20',
        className
      )}
    >
      {/* Selection checkbox */}
      {selecting && (
        <div className="absolute top-2.5 left-2.5 z-20">
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggleSelect?.(item.id)}
          />
        </div>
      )}

      {/* Card Image */}
      <Link
        to="/vault/items/$itemId"
        params={{ itemId: item.id }}
        className="block relative aspect-[5/7] overflow-hidden"
      >
        <ImageWithFallback
          src={getCardImageUrl(item.card)}
          alt={item.card.nameEn}
          className="h-full w-full"
        />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/40 via-transparent to-transparent" />

        {/* Hover overlay with glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Delete button on hover — hide when listed or selecting */}
        {!selecting && isOwner && onDelete && item.status !== 'sold' && !isListing && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm('Are you sure you want to remove this item from your vault?')) {
                onDelete(item);
              }
            }}
            className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Delete item"
          >
            <div className="w-7 h-7 rounded-full bg-danger/90 flex items-center justify-center hover:bg-danger transition-colors">
              <Trash2 className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        )}

        {/* Status badge */}
        {!selecting && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant="pixel" className={cn('shadow-lg', statusConfig.chipClass)}>
              {StatusIcon && <StatusIcon className="w-3 h-3" aria-hidden="true" />}
              {statusConfig.label}
            </Badge>
          </div>
        )}

        {/* Condition badge */}
        {item.condition && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white border border-white/10">
              {item.condition}
            </span>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <span className="text-xs font-bold font-mono bg-brand text-white px-2.5 py-1 rounded-full shadow-lg shadow-brand/20">
            ฿{item.currentPrice.toLocaleString()}
          </span>
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-3">
        {/* Card name */}
        <h3 className="line-clamp-1 font-semibold text-sm text-foreground transition-colors group-hover:text-brand">
          {item.card.nameEn}
        </h3>

        {/* SKU */}
        <p className="mt-0.5 line-clamp-1 text-xs font-mono text-muted-foreground">
          {item.card.code}
        </p>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {item.card.rarity && (
            <span className="text-[11px] font-bold bg-surface-lighter/80 text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">
              {item.card.rarity}
            </span>
          )}
          {item.condition && (
            <span className="text-[11px] font-bold bg-surface-lighter/80 text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">
              {item.condition}
            </span>
          )}
          {item.card.language && (
            <span className="text-[11px] font-bold bg-surface-lighter/80 text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">
              {item.card.language}
            </span>
          )}
        </div>

        {/* P/L indicator */}
        {item.status !== 'sold' && (
          <div
            className={cn(
              'mt-2 flex items-center text-xs font-mono font-bold',
              item.plPercent >= 0 ? 'text-success' : 'text-danger'
            )}
          >
            {item.plPercent >= 0 ? (
              <TrendingUp className="w-3 h-3 mr-0.5" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-0.5" />
            )}
            {formatPriceChange(item.plPercent)}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-2.5 flex gap-1.5">
          {/* Listed → Unlist + Edit + Redeem/Delivery */}
          {isListing && isOwner && onDelist && !selecting && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelist(item);
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl',
                  'bg-surface-lighter text-muted-foreground text-[11px] font-semibold',
                  'border border-border hover:border-warning/30 hover:text-warning hover:bg-warning/10',
                  'active:scale-[0.97] transition-all duration-150'
                )}
                aria-label="Unlist item"
              >
                <EyeOff className="w-3 h-3" />
                {t('common.delist')}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onList?.(item);
                }}
                className={cn(
                  'flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl',
                  'bg-surface-lighter text-muted-foreground text-[11px] font-semibold',
                  'border border-border hover:border-brand/30 hover:text-brand hover:bg-brand/10',
                  'active:scale-[0.97] transition-all duration-150'
                )}
                aria-label="Edit listing"
              >
                <Pencil className="w-3 h-3" />
              </button>
              {/* Redeem button for listed + platform held items */}
              {platformHeld && onRedeem && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRedeem(item);
                  }}
                  className={cn(
                    'flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl',
                    'bg-periwinkle/10 text-periwinkle text-[11px] font-semibold',
                    'border border-periwinkle/20 hover:bg-periwinkle hover:text-white',
                    'active:scale-[0.97] transition-all duration-150'
                  )}
                  aria-label="Redeem item"
                >
                  <Gift className="w-3 h-3" />
                </button>
              )}
            </>
          )}

          {/* Not Listed + In Vault → List + Redeem */}
          {!isListing &&
            isOwner &&
            item.status === 'held' &&
            !platformHeld &&
            onList &&
            !selecting && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onList(item);
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl',
                    'bg-brand text-white text-[11px] font-semibold',
                    'hover:bg-brand-light shadow-sm',
                    'active:scale-[0.97] transition-all duration-150'
                  )}
                  aria-label="List item for sale"
                >
                  <Tag className="w-3 h-3" />
                  {t('common.list')}
                </button>
                {/* Delivery button for non-listed vault items */}
                {onRedeem && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRedeem(item);
                    }}
                    className={cn(
                      'flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl',
                      'bg-surface-lighter text-muted-foreground text-[11px] font-semibold',
                      'border border-border hover:border-periwinkle/30 hover:text-periwinkle hover:bg-periwinkle/10',
                      'active:scale-[0.97] transition-all duration-150'
                    )}
                    aria-label="Request delivery"
                  >
                    <Gift className="w-3 h-3" />
                  </button>
                )}
              </>
            )}

          {/* SWS Vault → Redeem */}
          {!isListing &&
            isOwner &&
            item.status === 'held' &&
            platformHeld &&
            onRedeem &&
            !selecting && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRedeem(item);
                }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl',
                  'bg-periwinkle/10 text-periwinkle text-[11px] font-semibold',
                  'border border-periwinkle/20 hover:bg-periwinkle hover:text-white',
                  'active:scale-[0.97] transition-all duration-150'
                )}
                aria-label="Redeem item"
              >
                <Gift className="w-3 h-3" />
                {t('common.redeem')}
              </button>
            )}

          {/* Not owner */}
          {!isOwner && (
            <div className="flex-1 py-1.5 text-center text-[11px] text-muted-foreground/50">
              {t('vault.heldByPlatform')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
