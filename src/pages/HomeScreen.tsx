import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Scan, Package, Plus, Store, ShoppingBag, ClipboardList, Handshake,
  Heart, ChevronRight, ShieldCheck, Zap, Sparkles,
} from 'lucide-react';
import {
  useUser, useVault, useOrders, useOffers, useWishlist,
  useTrendingListings,
} from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { cn, getCardImageUrl } from '@/lib/utils';
import { useAuthStore, isMember, type AuthUser } from '@/stores/auth';
import type { VaultItem, MarketListing, WishlistItem, Order, Offer } from '@/types';

function formatPrice(n: number) {
  return `฿${n.toLocaleString()}`;
}

function greetingKey(hour: number) {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function PortfolioCard({ vault, loading, t }: { vault?: VaultItem[]; loading: boolean; t: (k: string, o?: Record<string, unknown>) => string }) {
  const { totalValue, plAmount, topCards, heldCount } = useMemo(() => {
    const held = vault?.filter((v) => v.status === 'held') ?? [];
    const totalValue = held.reduce((sum, v) => sum + (v.currentPrice ?? 0), 0);
    const totalPaid = held.reduce((sum, v) => sum + (v.paidPrice ?? 0), 0);
    const plAmount = totalValue - totalPaid;
    const topCards = [...held].sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 3);
    return { totalValue, plAmount, topCards, heldCount: held.length };
  }, [vault]);

  if (loading) {
    return (
      <Card className="surface-card overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="surface-card surface-card-hover overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold">{t('home.portfolio.title')}</p>
          <Link
            to="/vault"
            className="flex items-center gap-0.5 text-xs font-medium text-brand hover:underline"
          >
            {t('home.portfolio.viewVault')} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">{t('home.portfolio.totalValue')}</p>
            <p className="mt-1 text-lg sm:text-xl font-bold mono-num whitespace-nowrap">{formatPrice(totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('home.portfolio.pl')}</p>
            <p className={cn('mt-1 text-lg sm:text-xl font-bold mono-num whitespace-nowrap', plAmount >= 0 ? 'text-cyan' : 'text-pldown')}>
              {plAmount >= 0 ? '+' : ''}{formatPrice(plAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('home.portfolio.cards')}</p>
            <p className="mt-1 text-lg sm:text-xl font-bold mono-num">{heldCount}</p>
          </div>
        </div>

        {topCards.length > 0 && (
          <div className="mt-5 flex items-center gap-3">
            <div className="flex -space-x-2">
              {topCards.map((item) => (
                <div
                  key={item.id}
                  className="h-9 w-7 overflow-hidden rounded-md border-2 border-surface-light shadow-sm bg-surface-lighter"
                >
                  {item.card.imageUrl ? (
                    <img
                      src={item.card.imageUrl}
                      alt={item.card.nameEn}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {item.card.code.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('home.portfolio.topCards', { count: topCards.length })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions({ t }: { t: (k: string, o?: Record<string, unknown>) => string }) {
  const actions = [
    { key: 'scan', icon: Scan, to: '/scan', className: 'bg-brand-gradient text-white shadow-glow hover:opacity-90' },
    { key: 'addVault', icon: Plus, to: '/vault', search: { action: 'register' as const } },
    { key: 'sell', icon: Store, to: '/seller' },
    { key: 'market', icon: ShoppingBag, to: '/market' },
    { key: 'orders', icon: ClipboardList, to: '/orders' },
    { key: 'offers', icon: Handshake, to: '/offers' },
  ];

  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground">{t('home.quickActions.title')}</h2>
      <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.key}
              to={a.to}
              search={a.search as { action: 'register' } | undefined}
              className="group flex flex-col items-center gap-2"
            >
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl surface-card text-foreground transition-all active:scale-95',
                  'hover:bg-surface-lighter hover:-translate-y-0.5',
                  a.className
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center">
                {t(`home.quickActions.${a.key}`)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function VaultSnapshot({ vault, loading, t }: { vault?: VaultItem[]; loading: boolean; t: (k: string, o?: Record<string, unknown>) => string }) {
  const recent = useMemo(() => (vault ? [...vault].sort((a, b) => +new Date(b.dateAcquired) - +new Date(a.dateAcquired)).slice(0, 8) : []), [vault]);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight">{t('home.vaultSnapshot.title')}</h2>
        <Link to="/vault" className="flex items-center gap-0.5 text-xs font-medium text-brand hover:underline">
          {t('home.vaultSnapshot.viewAll')} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-28 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : recent.length === 0 ? (
        <Card className="mt-3 border-border bg-surface-light">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <Package className="h-10 w-10 text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">{t('home.vaultSnapshot.empty')}</p>
            <Link
              to="/vault"
              search={{ action: 'register' as const }}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-light"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('home.quickActions.addVault')}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-1 px-1">
          {recent.map((item) => {
            const pl = item.plAmount ?? item.currentPrice - item.paidPrice;
            return (
              <Link
                key={item.id}
                to="/vault/items/$itemId"
                params={{ itemId: item.id }}
                className="group w-28 shrink-0 snap-start"
              >
                <div className="relative aspect-[5/7] overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-brand/30 hover:shadow-lg">
                  <ImageWithFallback
                    src={getCardImageUrl(item.card)}
                    alt={item.card.nameEn}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 truncate text-xs font-medium">{item.card.nameEn}</p>
                <p className="text-xs font-semibold mono-num whitespace-nowrap">{formatPrice(item.currentPrice)}</p>
                <p className={cn('text-xs font-medium', pl >= 0 ? 'text-cyan' : 'text-pldown')}>
                  {pl >= 0 ? '+' : ''}{pl.toLocaleString()} ({item.plPercent?.toFixed(1) ?? '0.0'}%)
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MarketPulse({ listings, loading, t }: { listings?: MarketListing[]; loading: boolean; t: (k: string, o?: Record<string, unknown>) => string }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight">{t('home.marketPulse.title')}</h2>
        <Link to="/market" className="flex items-center gap-0.5 text-xs font-medium text-brand hover:underline">
          {t('home.marketPulse.viewAll')} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-32 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : !listings || listings.length === 0 ? (
        <Empty className="mt-3 rounded-xl border-dashed border-border bg-surface-light/50 py-10">
          <EmptyMedia variant="icon">
            <ShoppingBag className="w-8 h-8 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('home.marketPulse.empty')}</EmptyTitle>
            <EmptyDescription>{t('home.marketPulse.emptyDescription')}</EmptyDescription>
          </EmptyHeader>
          <Button asChild size="sm" className="bg-brand hover:bg-brand-light">
            <Link to="/market">{t('home.marketPulse.viewAll')}</Link>
          </Button>
        </Empty>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-1 px-1">
          {listings.slice(0, 8).map((listing) => (
            <Link
              key={listing.id}
              to="/market/$listingId"
              params={{ listingId: listing.id }}
              className="group w-32 shrink-0 snap-start"
            >
              <div className="relative aspect-[5/7] overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-brand/30 hover:shadow-lg">
                <ImageWithFallback
                  src={getCardImageUrl(listing.card)}
                  alt={listing.card.nameEn}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-2 top-2 rounded-full bg-surface-dark/80 px-1.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                  {listing.listingType === 'TRADE' ? t('home.marketPulse.trade') : formatPrice(listing.price)}
                </div>
              </div>
              <p className="mt-2 truncate text-xs font-medium">{listing.card.nameEn}</p>
              <p className="text-xs text-muted-foreground truncate">@{listing.seller.name}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function ActivitySummary({ orders, offers, loading, t }: { orders?: Order[]; offers?: Offer[]; loading: boolean; t: (k: string, o?: Record<string, unknown>) => string }) {
  const pendingOrders = useMemo(() => orders?.filter((o) => !['COMPLETED', 'CANCELLED'].includes(o.status)).length ?? 0, [orders]);
  const pendingOffers = useMemo(() => offers?.filter((o) => o.status === 'PENDING').length ?? 0, [offers]);

  if (loading) {
    return (
      <section className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </section>
    );
  }

  if (pendingOrders === 0 && pendingOffers === 0) return null;

  return (
    <section>
      <h2 className="text-base font-bold tracking-tight">{t('home.activity.title')}</h2>
      <Card className="mt-3 surface-card surface-card-hover">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 divide-x divide-border">
            <Link to="/orders" className="group flex items-center gap-3 pr-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold mono-num leading-none">{pendingOrders}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{t('home.activity.pendingOrders', { count: pendingOrders })}</p>
              </div>
            </Link>
            <Link to="/offers" className="group flex items-center gap-3 pl-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-periwinkle/10 text-periwinkle">
                <Handshake className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold mono-num leading-none">{pendingOffers}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{t('home.activity.pendingOffers', { count: pendingOffers })}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function WishlistSnapshot({ items, loading, t }: { items?: WishlistItem[]; loading: boolean; t: (k: string, o?: Record<string, unknown>) => string }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight">{t('home.wishlist.title')}</h2>
        <Link to="/wishlist" className="flex items-center gap-0.5 text-xs font-medium text-brand hover:underline">
          {t('common.viewAll')} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      ) : !items || items.length === 0 ? (
        <Empty className="mt-3 rounded-xl border-dashed border-border bg-surface-light/50 py-8">
          <EmptyMedia variant="icon">
            <Heart className="w-6 h-6 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('home.wishlist.empty')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="mt-3 space-y-2">
          {items.slice(0, 4).map((item) => {
            const diff = item.currentPrice - item.targetPrice;
            return (
              <Link
                key={item.id}
                to="/market"
                search={{ q: item.cardCode }}
                className="flex items-center justify-between rounded-xl border border-border bg-surface-light p-3 transition-colors hover:bg-surface-lighter"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.cardName}</p>
                  <p className="text-xs font-mono text-muted-foreground">{item.cardCode}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold mono-num whitespace-nowrap">{formatPrice(item.currentPrice)}</p>
                  {item.targetPrice > 0 && (
                    <p className={cn('text-xs font-medium', diff <= 0 ? 'text-cyan' : 'text-muted-foreground')}>
                      {t('home.wishlist.target')}: {formatPrice(item.targetPrice)}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function GuestWelcome({ t }: { t: (k: string, o?: Record<string, unknown>) => string }) {
  return (
    <Card className="relative overflow-hidden border-border bg-surface-light">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/10 blur-2xl" />
      <CardContent className="relative p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t('home.guestWelcome.title')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('home.guestWelcome.desc')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" className="bg-brand hover:bg-brand-light" asChild>
                <Link to="/login">{t('home.guestWelcome.signIn')}</Link>
              </Button>
              <Button size="sm" variant="outline" className="border-border" asChild>
                <Link to="/register">{t('home.guestWelcome.register')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KycBanner({ t }: { t: (k: string, o?: Record<string, unknown>) => string }) {
  return (
    <Card className="relative overflow-hidden border-brand/20 bg-surface-light">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/10 blur-2xl" />
      <CardContent className="relative flex items-center gap-4 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t('home.kycBanner.title')}</p>
          <p className="text-xs text-muted-foreground">{t('home.kycBanner.desc')}</p>
        </div>
        <Link
          to="/profile/kyc"
          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-light"
        >
          {t('home.kycBanner.cta')}
        </Link>
      </CardContent>
    </Card>
  );
}

export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: vault, isLoading: vaultLoading } = useVault();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: offers, isLoading: offersLoading } = useOffers();
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();
  const { data: trending, isLoading: trendingLoading } = useTrendingListings();
  const { isAuthenticated } = useAuthStore();

  const isUserMember = isMember(user as AuthUser | null);

  const hour = new Date().getHours();
  const greeting = t(`home.greeting.${greetingKey(hour)}`, { name: user?.fullName ?? t('home.greeting.collector') });
  const dateStr = new Date().toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <PageContainer size="xl" className="py-6 space-y-6">
      <PageHeader
        title={greeting}
        description={dateStr}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="space-y-6">
          {isAuthenticated ? (
            <>
              <PortfolioCard vault={vault} loading={userLoading || vaultLoading} t={t} />
              <QuickActions t={t} />
              <VaultSnapshot vault={vault} loading={vaultLoading} t={t} />
              <MarketPulse listings={trending} loading={trendingLoading} t={t} />
              <ActivitySummary orders={orders} offers={offers} loading={ordersLoading || offersLoading} t={t} />
            </>
          ) : (
            <>
              <GuestWelcome t={t} />
              <QuickActions t={t} />
              <MarketPulse listings={trending} loading={trendingLoading} t={t} />
            </>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {user && !isUserMember && !userLoading && <KycBanner t={t} />}
          {isAuthenticated && <WishlistSnapshot items={wishlist} loading={wishlistLoading} t={t} />}

          {/* Discovery card */}
          <Card className="border-border bg-surface-light">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-periwinkle/10 text-periwinkle">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t('home.discovery.title')}</p>
                  <p className="text-xs text-muted-foreground">{t('home.discovery.desc')}</p>
                </div>
              </div>
              <Link
                to="/market"
                className="mt-4 block w-full rounded-xl bg-surface-lighter py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-periwinkle hover:text-white"
              >
                {t('home.discovery.cta')}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
