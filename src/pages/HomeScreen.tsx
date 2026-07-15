import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Scan, Package, Plus, Store, ShoppingBag, ClipboardList, Handshake,
  Heart, ChevronRight, ShieldCheck, Zap, Sparkles, TrendingUp, ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from 'recharts';
import {
  useUser, useVault, useOrders, useOffers, useWishlist,
  useTrendingListings,
} from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
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

/* ─── Hero Greeting ─────────────────────────────────────────────── */
function HeroGreeting({ greeting, dateStr }: { greeting: string; dateStr: string }) {
  return (
    <section className="relative -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12 px-4 sm:px-6 lg:px-10 xl:px-12 pt-2 pb-8 overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-8 right-1/4 w-48 h-48 bg-periwinkle/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <p className="text-xs font-medium text-brand tracking-wide uppercase">{dateStr}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          {greeting}
        </h1>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1 w-12 rounded-full bg-brand-gradient" />
          <div className="h-1 w-3 rounded-full bg-periwinkle/60" />
        </div>
      </div>
    </section>
  );
}

/* ─── Mini Portfolio Chart ─────────────────────────────────────── */
function MiniPortfolioChart({ data, isPositive }: { data: { date: string; value: number }[]; isPositive: boolean }) {
  const color = isPositive ? 'var(--color-cyan, #22d3ee)' : 'var(--color-pldown, #f87171)';
  const gradientId = isPositive ? 'miniGradUp' : 'miniGradDown';
  return (
    <div className="h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '4px 8px' }}
            itemStyle={{ color: color, fontSize: '11px' }}
            formatter={(value: number) => [`฿${value.toLocaleString()}`, 'Value']}
            labelFormatter={() => ''}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Portfolio Card ─────────────────────────────────────────────── */
function PortfolioCard({ vault, loading, t }: { vault?: VaultItem[]; loading: boolean; t: (k: string, o?: Record<string, unknown>) => string }) {
  const { totalValue, plAmount, topCards, heldCount, chartData } = useMemo(() => {
    const held = vault?.filter((v) => v.status === 'held') ?? [];
    const totalValue = held.reduce((sum, v) => sum + (v.currentPrice ?? 0), 0);
    const totalPaid = held.reduce((sum, v) => sum + (v.paidPrice ?? 0), 0);
    const plAmount = totalValue - totalPaid;
    const topCards = [...held].sort((a, b) => b.currentPrice - a.currentPrice).slice(0, 3);

    // Generate mock portfolio value history (7 points) for the mini chart
    const chartData: { date: string; value: number }[] = [];
    if (held.length > 0) {
      const days = 7;
      const base = totalPaid || totalValue || 1000;
      const volatility = Math.max(base * 0.05, 500);
      let current = base;
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const target = totalValue;
        const progress = (days - 1 - i) / (days - 1);
        const drift = base + (target - base) * progress;
        const noise = (Math.random() - 0.5) * volatility;
        current = Math.max(0, Math.round(drift + noise));
        chartData.push({ date: date.toISOString().split('T')[0], value: current });
      }
      if (chartData.length > 0) {
        chartData[chartData.length - 1].value = totalValue;
      }
    }

    return { totalValue, plAmount, topCards, heldCount: held.length, chartData };
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
    <Card className="relative overflow-hidden border-border/60 bg-surface-light/80 backdrop-blur-sm transition-all duration-300 hover:border-brand/30 hover:shadow-glow">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-brand-gradient opacity-80" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <TrendingUp className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold">{t('home.portfolio.title')}</p>
          </div>
          <Link
            to="/vault"
            className="group/link flex items-center gap-0.5 text-xs font-medium text-brand hover:text-brand-light transition-colors"
          >
            {t('home.portfolio.viewVault')} <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 sm:gap-6">
          <div>
            <p className="text-xs text-muted-foreground">{t('home.portfolio.totalValue')}</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold mono-num whitespace-nowrap tracking-tight">{formatPrice(totalValue)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('home.portfolio.pl')}</p>
            <p className={cn('mt-1.5 text-xl sm:text-2xl font-bold mono-num whitespace-nowrap tracking-tight', plAmount >= 0 ? 'text-cyan' : 'text-pldown')}>
              {plAmount >= 0 ? '+' : ''}{formatPrice(plAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t('home.portfolio.cards')}</p>
            <p className="mt-1.5 text-xl sm:text-2xl font-bold mono-num tracking-tight">{heldCount}</p>
          </div>
        </div>

        {/* Mini portfolio chart */}
        {chartData.length > 0 && (
          <div className="mt-4">
            <MiniPortfolioChart data={chartData} isPositive={plAmount >= 0} />
          </div>
        )}

        {topCards.length > 0 && (
          <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border/40">
            <div className="flex -space-x-2">
              {topCards.map((item) => (
                <div
                  key={item.id}
                  className="h-10 w-8 overflow-hidden rounded-md border-2 border-surface-light shadow-md bg-surface-lighter"
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

/* ─── Quick Actions ──────────────────────────────────────────────── */
function QuickActions({ t }: { t: (k: string, o?: Record<string, unknown>) => string }) {
  const actions = [
    { key: 'scan', icon: Scan, to: '/scan', className: 'bg-brand-gradient text-white shadow-glow hover:shadow-glow hover:scale-105' },
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
        {actions.map((a, i) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.key}
              to={a.to}
              search={a.search as { action: 'register' } | undefined}
              className="group flex flex-col items-center gap-2.5"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-2xl text-foreground transition-all duration-200 active:scale-90',
                  'bg-surface-light border border-border/60 hover:border-brand/40 hover:bg-surface-lighter hover:-translate-y-1 hover:shadow-md',
                  a.className
                )}
              >
                <Icon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
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

/* ─── Vault Snapshot ───────────────────────────────────────────── */
function VaultSnapshot({ vault, loading, t }: { vault?: VaultItem[]; loading: boolean; t: (k: string, o?: Record<string, unknown>) => string }) {
  const recent = useMemo(() => (vault ? [...vault].sort((a, b) => +new Date(b.dateAcquired) - +new Date(a.dateAcquired)).slice(0, 8) : []), [vault]);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight">{t('home.vaultSnapshot.title')}</h2>
        <Link to="/vault" className="group/link flex items-center gap-0.5 text-xs font-medium text-brand hover:text-brand-light transition-colors">
          {t('home.vaultSnapshot.viewAll')} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
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
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-light transition-colors"
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
                <div className="relative aspect-[5/7] overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-brand/40 hover:shadow-glow group-hover:shadow-glow">
                  <ImageWithFallback
                    src={getCardImageUrl(item.card)}
                    alt={item.card.nameEn}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="h-4 w-4 text-white drop-shadow-md" />
                  </div>
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

/* ─── Market Pulse ─────────────────────────────────────────────── */
function MarketPulse({ listings, loading, t }: { listings?: MarketListing[]; loading: boolean; t: (k: string, o?: Record<string, unknown>) => string }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight">{t('home.marketPulse.title')}</h2>
        <Link to="/market" className="group/link flex items-center gap-0.5 text-xs font-medium text-brand hover:text-brand-light transition-colors">
          {t('home.marketPulse.viewAll')} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
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
              <div className="relative aspect-[5/7] overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:border-brand/40 hover:shadow-glow">
                <ImageWithFallback
                  src={getCardImageUrl(listing.card)}
                  alt={listing.card.nameEn}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                <div className="absolute left-2 top-2 rounded-full bg-surface-dark/80 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm border border-white/10">
                  {listing.listingType === 'TRADE' ? t('home.marketPulse.trade') : formatPrice(listing.price)}
                </div>
                {/* Hover arrow */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="h-4 w-4 text-white drop-shadow-md" />
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

/* ─── Activity Summary ─────────────────────────────────────────── */
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
      <Card className="mt-3 overflow-hidden border-border/60 bg-surface-light/80 backdrop-blur-sm transition-all duration-300 hover:border-brand/30 hover:shadow-glow">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-2 divide-x divide-border/40">
            <Link to="/orders" className="group flex items-center gap-3 pr-3 sm:pr-4 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-transform duration-200 group-hover:scale-105">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold mono-num leading-none">{pendingOrders}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{t('home.activity.pendingOrders', { count: pendingOrders })}</p>
              </div>
            </Link>
            <Link to="/offers" className="group flex items-center gap-3 pl-3 sm:pl-4 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-periwinkle/10 text-periwinkle transition-transform duration-200 group-hover:scale-105">
                <Handshake className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl sm:text-3xl font-bold mono-num leading-none">{pendingOffers}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{t('home.activity.pendingOffers', { count: pendingOffers })}</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/* ─── Wishlist Snapshot ────────────────────────────────────────── */
function WishlistSnapshot({ items, loading, t }: { items?: WishlistItem[]; loading: boolean; t: (k: string, o?: Record<string, unknown>) => string }) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold tracking-tight">{t('home.wishlist.title')}</h2>
        <Link to="/wishlist" className="group/link flex items-center gap-0.5 text-xs font-medium text-brand hover:text-brand-light transition-colors">
          {t('common.viewAll')} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
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
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-surface-light/60 p-3 transition-all duration-200 hover:bg-surface-lighter hover:border-brand/30 hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium group-hover:text-brand transition-colors">{item.cardName}</p>
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

/* ─── Guest Welcome ──────────────────────────────────────────────── */
function GuestWelcome({ t }: { t: (k: string, o?: Record<string, unknown>) => string }) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-surface-light/80 backdrop-blur-sm">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/15 blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-24 w-24 rounded-full bg-periwinkle/10 blur-3xl" />
      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-inner">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base">{t('home.guestWelcome.title')}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('home.guestWelcome.desc')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" className="bg-brand hover:bg-brand-light transition-all hover:shadow-glow" asChild>
                <Link to="/login">{t('home.guestWelcome.signIn')}</Link>
              </Button>
              <Button size="sm" variant="outline" className="border-border/60 hover:border-brand/40 transition-colors" asChild>
                <Link to="/register">{t('home.guestWelcome.register')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── KYC Banner ───────────────────────────────────────────────── */
function KycBanner({ t }: { t: (k: string, o?: Record<string, unknown>) => string }) {
  return (
    <Card className="relative overflow-hidden border-brand/20 bg-surface-light/80 backdrop-blur-sm">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/10 blur-2xl" />
      <CardContent className="relative flex items-center gap-4 p-4 sm:p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t('home.kycBanner.title')}</p>
          <p className="text-xs text-muted-foreground">{t('home.kycBanner.desc')}</p>
        </div>
        <Link
          to="/profile/kyc"
          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-light transition-colors hover:shadow-glow"
        >
          {t('home.kycBanner.cta')}
        </Link>
      </CardContent>
    </Card>
  );
}

/* ─── Discovery Card ───────────────────────────────────────────── */
function DiscoveryCard({ t }: { t: (k: string, o?: Record<string, unknown>) => string }) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-surface-light/80 backdrop-blur-sm transition-all duration-300 hover:border-periwinkle/40 hover:shadow-glow">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-periwinkle/10 blur-2xl" />
      <CardContent className="relative p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-periwinkle/10 text-periwinkle transition-transform duration-200 hover:scale-105">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{t('home.discovery.title')}</p>
            <p className="text-xs text-muted-foreground">{t('home.discovery.desc')}</p>
          </div>
        </div>
        <Link
          to="/market"
          className="mt-4 block w-full rounded-xl bg-surface-lighter py-2.5 text-center text-sm font-semibold text-foreground transition-all duration-200 hover:bg-periwinkle hover:text-white hover:shadow-md"
        >
          {t('home.discovery.cta')}
        </Link>
      </CardContent>
    </Card>
  );
}

/* ─── Main Export ──────────────────────────────────────────────── */
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
  const greeting = t(`home.greeting.${greetingKey(hour)}`, { name: (user as any)?.fullName ?? t('home.greeting.collector') });
  const dateStr = new Date().toLocaleDateString(i18n.language === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <PageContainer size="xl" className="py-6 space-y-6">
      <HeroGreeting greeting={greeting} dateStr={dateStr} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        {/* Main column */}
        <div className="space-y-6 stagger-fade-in">
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
        <div className="space-y-6 stagger-fade-in">
          {(user as any) && !isUserMember && !userLoading && <KycBanner t={t} />}
          {isAuthenticated && <WishlistSnapshot items={wishlist} loading={wishlistLoading} t={t} />}
          <DiscoveryCard t={t} />
        </div>
      </div>
    </PageContainer>
  );
}
