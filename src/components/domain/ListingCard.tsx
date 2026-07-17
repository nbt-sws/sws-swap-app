import { Link } from '@tanstack/react-router';
import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { useWishlistIds, useAddToWishlist, useRemoveFromWishlist } from '@/hooks/useApi';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Badge } from '@/components/ui/badge';
import { cn, getCardImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import type { MarketListing } from '@/types';

interface ListingCardProps {
  listing: MarketListing;
  onQuickView?: (listing: MarketListing) => void;
  className?: string;
}

// Captured once at page load — reference time for the NEW badge (< 72h)
const PAGE_LOADED_AT = Date.now();

const statusConfig = {
  active: { variant: 'success' as const, labelKey: 'listing.status.active' },
  draft: { variant: 'neutral' as const, labelKey: 'listing.status.draft' },
  paused: { variant: 'warning' as const, labelKey: 'listing.status.inactive' },
  sold: { variant: 'neutral' as const, labelKey: 'listing.status.sold' },
  delisted: { variant: 'neutral' as const, labelKey: 'listing.status.delisted' },
};

export function ListingCard({ listing, onQuickView, className }: ListingCardProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { data: wishlistIds } = useWishlistIds();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const isWishlisted = wishlistIds?.has(listing.id) ?? false;
  const [heartAnimating, setHeartAnimating] = useState(false);

  // Fresh listings (< 72h) get a NEW badge — market convention
  const isNew = useMemo(() => {
    const ts = new Date(listing.timestamp).getTime();
    return Number.isFinite(ts) && PAGE_LOADED_AT - ts < 72 * 60 * 60 * 1000;
  }, [listing.timestamp]);

  const status = statusConfig[listing.status as keyof typeof statusConfig] ?? statusConfig.active;

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isWishlisted) {
        removeFromWishlist.mutate(listing.id);
      } else {
        addToWishlist.mutate(listing.id);
        setHeartAnimating(true);
        setTimeout(() => setHeartAnimating(false), 400);
      }
    },
    [isWishlisted, listing.id, addToWishlist, removeFromWishlist]
  );

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60',
        'bg-gradient-to-br from-surface-light via-surface to-surface-lighter/30',
        'transition-all duration-300 hover:shadow-xl hover:shadow-brand/5 hover:border-brand/20',
        'hover:-translate-y-1',
        className
      )}
    >
      <Link to="/market/$listingId" params={{ listingId: listing.id }}>
        <div className="relative aspect-[5/7] overflow-hidden rounded-t-2xl">
          <ImageWithFallback
            src={getCardImageUrl(listing.card)}
            alt={listing.card.nameEn}
            className="h-full w-full"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/40 via-transparent to-transparent pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {listing.listingType === 'TRADE' ? (
              <Badge className="bg-cyan/20 text-cyan border border-cyan/30 shadow-lg backdrop-blur-sm">{t('common.tradeOnly').toUpperCase()}</Badge>
            ) : (
              <Badge className="bg-brand/20 text-brand border border-brand/30 shadow-lg backdrop-blur-sm">{t('market.listingTypes.sale').toUpperCase()}</Badge>
            )}
            {isNew && (
              <Badge className="bg-success/20 text-success border border-success/30 shadow-lg backdrop-blur-sm">{t('common.new')}</Badge>
            )}
          </div>

          {/* Quick-view hint on hover */}
          {onQuickView && isAuthenticated && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(listing);
              }}
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-center text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10"
            >
              {t('common.quickView')}
            </button>
          )}
        </div>
      </Link>

      {/* Wishlist Heart */}
      <button
        onClick={handleWishlist}
        className={cn(
          'absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 shadow-lg',
          isWishlisted
            ? 'bg-brand text-white shadow-brand/30'
            : 'bg-surface-light/90 text-muted-foreground hover:bg-surface-lighter hover:text-brand'
        )}
        aria-label={isWishlisted ? t('listing.wishlist.remove') : t('listing.wishlist.add')}
      >
        <Heart
          size={16}
          className={cn('transition-transform', heartAnimating && 'heart-burst')}
          fill={isWishlisted ? 'currentColor' : 'none'}
          strokeWidth={2.5}
        />
      </button>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-1 font-semibold text-sm text-foreground transition-colors group-hover:text-brand">
              {listing.card.nameEn}
            </h3>
            {listing.card.code && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{listing.card.code}</p>
            )}
          </div>
          {listing.status !== 'active' && (
            <Badge variant="outline" className="shrink-0 text-xs h-5 px-1.5">
              {t(status.labelKey)}
            </Badge>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {listing.card.rarity && (
            <span className="text-[10px] font-bold bg-surface-lighter/80 px-2 py-0.5 rounded-full border border-border/40">{listing.card.rarity}</span>
          )}
          {listing.card.condition && (
            <span className="text-[10px] font-bold bg-surface-lighter/80 px-2 py-0.5 rounded-full border border-border/40">{listing.card.condition}</span>
          )}
          <span className="text-[10px] font-bold bg-surface-lighter/80 px-2 py-0.5 rounded-full border border-border/40">{listing.shelf}</span>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span
            className={cn(
              'text-base font-bold font-mono whitespace-nowrap',
              listing.listingType === 'TRADE' ? 'text-cyan text-sm' : 'text-brand'
            )}
          >
            {listing.listingType === 'TRADE' ? t('common.tradeOnly') : `฿${listing.price.toLocaleString()}`}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[80px] bg-surface-lighter/80 px-2 py-0.5 rounded-full border border-border/40">
            @{listing.seller.name}
          </span>
        </div>
      </div>
    </div>
  );
}
