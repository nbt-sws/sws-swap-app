import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Megaphone, Sparkles, Package, Plus, Compass, SearchX, HandCoins,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useFollowedSellers, useFollowSeller, useUnfollowSeller,
} from '@/hooks/useApi';
import { useAuthStore } from '@/stores/auth';
import { StoriesBar } from '@/features/feed/StoriesBar';
import { PostCard } from '@/features/feed/PostCard';
import { PostComposer } from '@/features/feed/PostComposer';
import { FeedGate } from '@/features/feed/FeedGate';
import { useFeed, useFeedAccess } from '@/features/feed/useFeed';
import type { FeedTab, ShopPost } from '@/lib/api';

/* ══════════════════════════════════════════════════════════════════
   Unified feed — Phase 1 (Feed + Stories + Follow) & Phase 2 (Explore).
   Data: GET /feed (live API, migration 009). Errors show a retry card;
   empty results show the empty state — no demo content.
   ══════════════════════════════════════════════════════════════════ */

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border/60 bg-surface-light/80">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* Right rail: cheapest items across current drop/restock posts. */
function NewTodayRail({ posts, t }: { posts: ShopPost[]; t: (k: string) => string }) {
  const items = useMemo(
    () =>
      posts
        .flatMap((p) => p.listings.map((l) => ({ ...l, shopName: p.shopName })))
        .slice(0, 5),
    [posts]
  );
  if (items.length === 0) return null;
  return (
    <Card className="border-border/60 bg-surface-light/80">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
            <Package className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold">{t('feed.newToday')}</p>
        </div>
        <div className="mt-4 space-y-3">
          {items.map((item, i) => (
            <div key={`${item.listingId}-${i}`} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.shopName}</p>
              </div>
              <p className="shrink-0 text-xs font-semibold mono-num text-cyan">
                ฿{item.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* Right rail: WTB board teaser (Phase 2). */
function WtbTeaser({ t }: { t: (k: string) => string }) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-surface-light/80">
      <div className="surreal-mesh absolute inset-0 opacity-60 pointer-events-none" />
      <CardContent className="relative p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <HandCoins className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold">{t('wtb.teaserTitle')}</p>
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground leading-relaxed">{t('wtb.teaserDesc')}</p>
        <Link
          to="/wtb"
          className="mt-3.5 block w-full rounded-xl bg-surface-lighter py-2.5 text-center text-sm font-semibold transition-all hover:bg-warning hover:text-surface-dark"
        >
          {t('wtb.teaserCta')}
        </Link>
      </CardContent>
    </Card>
  );
}

export function FeedScreen() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { status: feedAccess } = useFeedAccess();
  const [tab, setTab] = useState<FeedTab>('foryou');
  const feedQuery = useFeed(tab, 1, feedAccess === 'allowed');

  const { data: followedIds = [] } = useFollowedSellers();
  const follow = useFollowSeller();
  const unfollow = useUnfollowSeller();

  const posts = feedQuery.data?.posts ?? [];

  const toggleFollow = (shopId: string) => {
    if (followedIds.includes(shopId)) unfollow.mutate(shopId);
    else follow.mutate(shopId);
  };

  // Shops with posts in the last 24h → neon stories ring.
  const activeShopIds = useMemo(() => {
    const dayAgo = Date.now() - 24 * 3600000;
    return new Set(
      posts.filter((p) => +new Date(p.createdAt) > dayAgo).map((p) => p.shopId)
    );
  }, [posts]);

  const tabs: { key: FeedTab; label: string; icon: React.ReactNode }[] = [
    { key: 'foryou', label: t('feed.tabs.foryou'), icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: 'following', label: t('feed.tabs.following'), icon: <Megaphone className="h-3.5 w-3.5" /> },
    { key: 'explore', label: t('feed.tabs.explore'), icon: <Compass className="h-3.5 w-3.5" /> },
  ];

  return (
    <PageContainer size="xl" className="py-6 space-y-6">
      {/* Header — unified neon hero via PageHeader */}
      <PageHeader
        title={t('feed.title')}
        icon={<Megaphone className="text-brand" />}
        badge={<span className="pxl-chip pxl-chip--peri">BETA</span>}
        description={t('feed.subtitle')}
        action={
          <div className="flex rounded-xl border border-border bg-surface/80 p-1 backdrop-blur-sm">
            {tabs.map((tb) => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                aria-pressed={tab === tb.key}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
                  tab === tb.key ? 'bg-brand text-white shadow-glow' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tb.icon}
                {tb.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column — live feed is KYC-gated */}
        <div className="space-y-5 min-w-0">
          <FeedGate>
            <StoriesBar activeShopIds={activeShopIds} />
            {tab !== 'explore' && <PostComposer />}

            {feedQuery.isLoading ? (
            <FeedSkeleton />
          ) : feedQuery.isError ? (
            <Card className="border-dashed border-border bg-surface-light/50">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <SearchX className="h-10 w-10 text-muted-foreground/60" />
                <p className="mt-3 text-sm font-semibold">{t('feed.errorTitle')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('feed.errorDesc')}</p>
                <button
                  onClick={() => feedQuery.refetch()}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-xs font-semibold text-brand hover:bg-brand/20 transition-colors"
                >
                  {t('common.retry')}
                </button>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="border-dashed border-border bg-surface-light/50">
              <CardContent className="flex flex-col items-center py-12 text-center">
                <SearchX className="h-10 w-10 text-muted-foreground/60" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {tab === 'following' && !isAuthenticated ? t('feed.emptyAuth') : t('feed.empty')}
                </p>
                <Link
                  to="/stores"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-light transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('feed.emptyCta')}
                </Link>
              </CardContent>
            </Card>
          ) : tab === 'explore' ? (
            /* Explore: dense product-led grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-fade-in">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  followed={followedIds.includes(post.shopId)}
                  onToggleFollow={isAuthenticated ? toggleFollow : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4 stagger-fade-in">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  followed={followedIds.includes(post.shopId)}
                  onToggleFollow={isAuthenticated ? toggleFollow : undefined}
                />
              ))}
            </div>
          )}
          </FeedGate>
        </div>

        {/* Side column */}
        <div className="space-y-6 min-w-0">
          <NewTodayRail posts={posts} t={t} />
          <WtbTeaser t={t} />
        </div>
      </div>
    </PageContainer>
  );
}
