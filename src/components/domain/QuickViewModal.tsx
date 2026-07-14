import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  useWishlist, useAddToWishlist, useRemoveFromWishlist,
  useMarketStats, useMarketHistory,
} from '@/hooks/useApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Heart, ShoppingBag, ExternalLink, X } from 'lucide-react';
import { cn, getCardImageUrl } from '@/lib/utils';
import { PriceChart } from './PriceChart';
import { MarketStatsCards } from './MarketStatsCards';
import type { MarketListing } from '@/types';

interface QuickViewModalProps {
  listing: MarketListing | null;
  open: boolean;
  onClose: () => void;
}

export function QuickViewModal({ listing, open, onClose }: QuickViewModalProps) {
  const { t } = useTranslation();
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const isWishlisted = listing ? wishlist?.some((w) => w.cardCode === listing.card.code) : false;

  const cardCode = listing?.card.code ?? '';
  const { data: marketStats } = useMarketStats(cardCode, { enabled: open && !!cardCode });
  const { data: marketHistory } = useMarketHistory(cardCode, '30d', { enabled: open && !!cardCode });

  if (!listing) return null;

  const toggleWishlist = () => {
    if (isWishlisted) removeFromWishlist.mutate(listing.id);
    else addToWishlist.mutate(listing.id);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-surface-light border-border p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{listing.card.nameEn}</DialogTitle>
        </DialogHeader>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute top-3 right-3 z-10 rounded-full bg-surface-lighter text-muted-foreground hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
          {/* Image */}
          <div className="aspect-[4/5] md:aspect-auto md:h-full bg-surface-lighter relative">
            <ImageWithFallback
              src={getCardImageUrl(listing.card)}
              alt={listing.card.nameEn}
              className="absolute inset-0"
            />
            <div className="absolute top-3 left-3">
              <Badge className={listing.listingType === 'SALE' ? 'bg-brand/20 text-brand' : 'bg-cyan/20 text-cyan'}>
                {listing.listingType}
              </Badge>
            </div>
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col">
            <p className="text-xs font-mono text-muted-foreground">{listing.card.code}</p>
            <h2 className="text-xl font-bold mt-1">{listing.card.nameEn}</h2>
            <p className="text-sm text-muted-foreground font-mono">{listing.card.nameJp}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="outline">{listing.card.rarity}</Badge>
              <Badge variant="outline">{listing.card.condition}</Badge>
              <Badge variant="outline">{listing.shelf}</Badge>
              <Badge variant="outline">{listing.card.language}</Badge>
            </div>

            <div className="mt-5">
              <p className="text-xs text-muted-foreground">{t('common.price')}</p>
              <p className={cn('text-3xl font-extrabold font-mono', listing.listingType === 'TRADE' ? 'text-cyan' : 'text-brand')}>
                {listing.listingType === 'TRADE' ? t('common.tradeOnly') : `฿${listing.price.toLocaleString()}`}
              </p>
            </div>

            {/* Seller */}
            <Link
              to="/seller/$sellerId"
              params={{ sellerId: listing.seller.id }}
              onClick={onClose}
              className="mt-5 flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-brand/30 transition"
            >
              <div className="w-10 h-10 rounded-full bg-surface-lighter flex items-center justify-center font-bold">
                {listing.seller.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">@{listing.seller.name}</p>
                <p className="text-xs text-muted-foreground">{t('market.sellerRating', { rating: listing.seller.rating })}</p>
              </div>
            </Link>

            {/* Market data */}
            {marketStats && (
              <div className="mt-5">
                <MarketStatsCards stats={marketStats} compact />
              </div>
            )}
            {marketHistory && marketHistory.length > 0 && (
              <div className="mt-4">
                <PriceChart data={marketHistory} period="30d" compact />
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto pt-6 flex items-center gap-3">
              {listing.listingType === 'SALE' && (
                <Button asChild className="flex-1 bg-brand hover:bg-brand-light rounded-full" onClick={onClose}>
                  <Link to="/checkout/$listingId" params={{ listingId: listing.id }}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {t('common.buyNow')}
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className={cn('rounded-full border-border', isWishlisted && 'bg-brand text-brand border-brand')}
                onClick={toggleWishlist}
              >
                <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
              </Button>
              <Button asChild variant="outline" className="rounded-full border-border" onClick={onClose}>
                <Link to="/market/$listingId" params={{ listingId: listing.id }}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('common.viewDetail')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
