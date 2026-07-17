import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import {
  useListing, useCardPrice, useAddToWishlist, useRemoveFromWishlist, useWishlistIds,
  useCreateOffer, useVault, useCreateTradeOffer, useMarketStats, useMarketHistory,
  useStoreProfile,
} from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/page-loader';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { DeliveryPreferenceSelector } from '@/components/domain/DeliveryPreferenceSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { ImageZoomDialog } from '@/components/ui/ImageZoomDialog';
import {
  Heart, Share2, Star, ArrowRightLeft, Clock, Package, ShieldCheck,
} from 'lucide-react';
import { cn, getCardImageUrl, formatTimeAgo } from '@/lib/utils';
import { GameMark } from '@/components/domain/GameMark';
import { PriceChart } from '@/components/domain/PriceChart';
import { MarketStatsCards } from '@/components/domain/MarketStatsCards';
import { useAuthStore, isMember } from '@/stores/auth';

const statusConfig = {
  active: { labelKey: 'listing.status.active', className: 'bg-success/10 text-success border-0' },
  sold: { labelKey: 'listing.status.sold', className: 'bg-muted/30 text-muted-foreground border-0' },
  paused: { labelKey: 'listing.status.inactive', className: 'bg-warning/10 text-warning border-0' },
  draft: { labelKey: 'listing.status.draft', className: 'bg-surface-lighter text-muted-foreground border-0' },
  delisted: { labelKey: 'listing.status.delisted', className: 'bg-pldown/10 text-pldown border-0' },
};

const PERIODS = ['7d', '30d', '90d', '1y'] as const;

export function ListingDetailScreen() {
  const { t } = useTranslation();
  const { listingId } = useParams({ from: '/market/$listingId' });
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const isListingMember = isMember(user);

  const { data: listing, isLoading } = useListing(listingId);
  const { data: sellerProfile } = useStoreProfile(listing?.seller.id ?? '');
  const { data: priceData } = useCardPrice(listing?.card.code ?? '');
  const { data: marketStats } = useMarketStats(listing?.card.code ?? '');
  const { data: marketHistory } = useMarketHistory(listing?.card.code ?? '', '30d');
  const { data: wishlistIds } = useWishlistIds();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const createOffer = useCreateOffer();
  const createTradeOffer = useCreateTradeOffer();
  const { data: vault } = useVault();

  const [offerAmount, setOfferAmount] = useState('');
  const [offerOpen, setOfferOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedTradeCards, setSelectedTradeCards] = useState<string[]>([]);
  const [delivery, setDelivery] = useState<'SHIP' | 'VAULT_STORE'>('SHIP');
  const [period, setPeriod] = useState<string>('30d');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  const isWishlisted = listing ? (wishlistIds?.has(listing.id) ?? false) : false;

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <PageLoader />
      </PageContainer>
    );
  }

  if (!listing) {
    return (
      <PageContainer className="py-6">
        <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-20">
          <EmptyMedia variant="icon">
            <Package className="w-8 h-8 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('listing.notFound')}</EmptyTitle>
            <EmptyDescription>{t('listing.backToMarket')}</EmptyDescription>
          </EmptyHeader>
          <Button asChild className="bg-brand hover:bg-brand-light">
            <Link to="/market">{t('listing.backToMarket')}</Link>
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  const status = statusConfig[listing.status as keyof typeof statusConfig] ?? statusConfig.active;

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    if (isWishlisted) removeFromWishlist.mutate(listing.id);
    else addToWishlist.mutate(listing.id);
  };

  const handleOffer = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    const price = Number(offerAmount);
    if (!price || price <= 0) return;
    createOffer.mutate({ listingId: listing.id, offerPrice: price }, {
      onSuccess: () => setOfferOpen(false),
    });
  };

  const toggleTradeCard = (code: string) => {
    setSelectedTradeCards((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleTradeOffer = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    if (selectedTradeCards.length === 0 || !vault) return;
    const tradeCards = vault
      .filter((item) => selectedTradeCards.includes(item.card.code))
      .map((item) => ({
        code: item.card.code,
        nameEn: item.card.nameEn,
        condition: item.card.condition,
        game: item.card.game,
      }));
    createTradeOffer.mutate({ listingId: listing.id, tradeCards }, {
      onSuccess: () => {
        setTradeOpen(false);
        setSelectedTradeCards([]);
      },
    });
  };

  const isTrade = listing.listingType === 'TRADE';
  const isOwnListing = !!user && user.id === listing.seller.id;

  return (
    <PageContainer className="py-6 pb-28 md:pb-6">
      <PageHeader
        title={t('listing.title')}
        back={{ to: '/market' }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image — click to zoom */}
        <Card className="bg-surface-light border-border overflow-hidden">
          <CardContent className="p-0 aspect-[4/5] flex items-center justify-center relative">
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="absolute inset-0 cursor-zoom-in"
              aria-label="View photo full size"
            >
              <ImageWithFallback
                src={getCardImageUrl(listing.card)}
                alt={listing.card.nameEn}
                className="absolute inset-0"
              />
            </button>
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className={status.className}>{t(status.labelKey)}</Badge>
              <Badge className="bg-surface-lighter text-foreground">{listing.shelf}</Badge>
            </div>

          </CardContent>
        </Card>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-1">{listing.card.code}</p>
            <h1 className="text-2xl font-bold mb-2">{listing.card.nameEn}</h1>
            {[listing.card.rarity, listing.card.condition, listing.card.language].filter(Boolean).length > 0 && (
              <p className="text-sm text-muted-foreground">
                {[listing.card.rarity, listing.card.condition, listing.card.language].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>

          {/* Seller + trust signals */}
          <Link
            to="/seller/$sellerId"
            params={{ sellerId: listing.seller.id }}
            className="flex items-center gap-3 bg-surface-light rounded-xl p-3 border border-border hover:border-brand/30 transition"
          >
            <div className="w-10 h-10 rounded-full bg-surface-lighter flex items-center justify-center font-bold">
              {listing.seller.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">@{listing.seller.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                {listing.seller.rating > 0 && (
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-pregrade fill-pregrade" />
                    {listing.seller.rating}
                  </span>
                )}
                {sellerProfile && sellerProfile.sales > 0 && (
                  <span>{t('listing.sellerSales', { count: sellerProfile.sales })}</span>
                )}
                <span className="inline-flex items-center gap-0.5 text-success">
                  <ShieldCheck className="w-3 h-3" />
                  {t('common.verifiedSeller')}
                </span>
              </div>
            </div>
          </Link>

          {/* Listing Details */}
          <div className="bg-surface-light rounded-xl p-4 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Listed</span>
              <span className="text-xs font-medium">{formatTimeAgo(listing.timestamp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Condition</span>
              <span className="text-xs font-medium">{listing.card.condition}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Shelf</span>
              <Badge variant="outline" className="text-xs">{listing.shelf}</Badge>
            </div>
            {listing.listingType === 'TRADE' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Type</span>
                <Badge className="bg-cyan/10 text-cyan text-xs">Trade Only</Badge>
              </div>
            )}
            {/* IDs demoted to a quiet footer — debug info, not purchase info */}
            <p className="text-[10px] font-mono text-muted-foreground/50 pt-2 border-t border-border/60">
              Item {listing.itemId?.slice(0, 8)}… · Listing {listing.id.slice(0, 8)}…
            </p>
          </div>

          {/* Price + trust */}
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-1">{t('common.price').toUpperCase()}</p>
            {isTrade ? (
              <p className="text-3xl font-bold font-mono text-cyan">{t('common.tradeOnly')}</p>
            ) : (
              <p className="text-3xl font-bold font-mono text-brand">฿{listing.price.toLocaleString()}</p>
            )}
          </div>

          {listing.vaultVerified && (
            <div className="flex items-start gap-2.5 rounded-xl bg-success/5 border border-success/20 px-3 py-2.5">
              <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-success">{t('listing.trust.verified')}</p>
                <p className="text-xs text-muted-foreground">{t('listing.trust.protection')}</p>
              </div>
            </div>
          )}

          {/* Delivery options — only relevant when purchasing */}
          {!isOwnListing && (
            <div className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground">{t('common.deliveryOptions').toUpperCase()}</p>
              <DeliveryPreferenceSelector
                value={delivery}
                onChange={setDelivery}
                isMember={isListingMember}
              />
            </div>
          )}

          {/* Actions */}
          {isOwnListing ? (
            <div className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
              <Package className="w-5 h-5 text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{t('listing.yourListing')}</p>
                <p className="text-xs text-muted-foreground">{t('listing.yourListingDesc')}</p>
              </div>
              <Button variant="outline" size="sm" className="border-border shrink-0" asChild>
                <Link to="/vault">{t('listing.manageInVault')}</Link>
              </Button>
            </div>
          ) : (
          <div className="flex gap-3">
            {!isTrade ? (
              <>
                <Button
                  className="flex-1 bg-brand hover:bg-brand-light h-12"
                  onClick={() => navigate({ to: '/checkout/$listingId', params: { listingId: listing.id }, search: { delivery } })}
                >
                  {t('common.buyNow')}
                </Button>
                <Dialog open={offerOpen} onOpenChange={setOfferOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 border-border h-12">
                      {t('common.makeOffer')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-surface-light border-border">
                    <DialogHeader>
                      <DialogTitle>{t('listing.dialog.makeOffer')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{t('common.yourOffer')}</p>
                        <Input
                          type="number"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(e.target.value)}
                          placeholder={t('common.enterAmount')}
                          className="bg-surface border-border"
                        />
                      </div>
                      <Button className="w-full bg-brand hover:bg-brand-light" onClick={handleOffer} disabled={createOffer.isPending}>
                        {createOffer.isPending ? t('common.sending') : t('common.sendOffer')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Dialog open={tradeOpen} onOpenChange={setTradeOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-cyan hover:bg-cyan/90 text-surface-dark h-12">
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    {t('listing.dialog.proposeTrade')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-surface-light border-border max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('listing.dialog.proposeTrade')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-muted-foreground">
                      {t('listing.dialog.selectCards', { cardName: listing.card.nameEn })}
                    </p>

                    {!vault || vault.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t('listing.dialog.vaultEmptyForTrade')}</p>
                    ) : (
                      <div className="space-y-2">
                        {vault.map((item) => {
                          const selected = selectedTradeCards.includes(item.card.code);
                          return (
                            <div
                              key={item.card.code}
                              onClick={() => toggleTradeCard(item.card.code)}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition',
                                selected ? 'border-cyan bg-cyan/10' : 'border-border bg-surface hover:border-border/80'
                              )}
                            >
                              <Checkbox checked={selected} onCheckedChange={() => toggleTradeCard(item.card.code)} />
                              <div className={cn(
                                'w-10 h-12 rounded-md flex items-center justify-center text-sm shrink-0',
                                item.card.game === 'one-piece' ? 'bg-brand/10' : 'bg-periwinkle/10'
                              )}>
                                <GameMark game={item.card.game} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-mono text-muted-foreground">{item.card.code}</p>
                                <p className="font-medium text-sm truncate">{item.card.nameEn}</p>
                                <p className="text-xs text-muted-foreground">{item.card.condition}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Button
                      className="w-full bg-cyan hover:bg-cyan/90 text-surface-dark"
                      onClick={handleTradeOffer}
                      disabled={createTradeOffer.isPending || selectedTradeCards.length === 0}
                    >
                      {createTradeOffer.isPending ? t('common.sending') : t('listing.dialog.sendTradeOffer', { count: selectedTradeCards.length })}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          )}

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleWishlist} disabled={addToWishlist.isPending || removeFromWishlist.isPending}>
              <Heart className={cn('w-4 h-4 mr-2', isWishlisted && 'fill-current text-brand')} />
              {isWishlisted ? t('common.wishlisted') : t('common.wishlist')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = typeof window !== 'undefined' ? window.location.href : '';
                if (navigator.share) {
                  navigator.share({ title: listing.card.nameEn, url }).catch(() => {});
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(url).catch(() => {});
                }
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t('common.share')}
            </Button>
          </div>
        </div>
      </div>

      {/* Price chart + market stats */}
      {!!priceData && priceData.history.length > 0 && (
        <div className="mt-6 space-y-6">
          {marketStats && <MarketStatsCards stats={marketStats} />}

          <PriceChart
            data={priceData.history}
            period={period}
            onPeriodChange={PERIODS.includes(period as typeof PERIODS[number]) ? setPeriod : undefined}
            trend={priceData.trend30d}
          />

          {marketHistory && marketHistory.length > 0 && (
            <Card className="bg-surface-light border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-brand" />
                  <h3 className="font-semibold">{t('common.recentSales')}</h3>
                </div>
                <div className="space-y-0.5">
                  {marketHistory.slice(-8).reverse().map((sale, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-surface"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                          <Clock className="w-4 h-4 text-brand" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            ฿{sale.price?.toLocaleString() ?? '0'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Sticky buy bar — mobile thumb zone (desktop keeps the inline buttons) */}
      {!isOwnListing && (
        <div className="fixed bottom-20 inset-x-0 z-40 px-3 md:hidden">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-light/95 backdrop-blur px-3.5 py-3 shadow-xl">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono uppercase text-muted-foreground">{isTrade ? 'Trade' : t('common.price')}</p>
              <p className={cn('text-base font-bold font-mono truncate', isTrade ? 'text-cyan' : 'text-brand')}>
                {isTrade ? t('common.tradeOnly') : `฿${listing.price.toLocaleString()}`}
              </p>
            </div>
            {!isTrade ? (
              <Button
                className="bg-brand hover:bg-brand-light h-11 px-5 shrink-0"
                onClick={() => navigate({ to: '/checkout/$listingId', params: { listingId: listing.id }, search: { delivery } })}
              >
                {t('common.buyNow')}
              </Button>
            ) : (
              <Button
                className="bg-cyan hover:bg-cyan/90 text-surface-dark h-11 px-5 shrink-0"
                onClick={() => setTradeOpen(true)}
              >
                {t('listing.dialog.proposeTrade')}
              </Button>
            )}
          </div>
        </div>
      )}

      <ImageZoomDialog
        images={[getCardImageUrl(listing.card)]}
        index={zoomIndex}
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        onIndexChange={setZoomIndex}
        alt={listing.card.nameEn}
      />
    </PageContainer>
  );
}


