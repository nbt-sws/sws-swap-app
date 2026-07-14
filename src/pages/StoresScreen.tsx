import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useStores, useFollowedSellers, useFollowSeller, useUnfollowSeller } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Star, Store, MapPin, Search, Heart, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

interface StoreData {
  id: string;
  name: string;
  rating: number;
  listings: number;
  sales: number;
  followers: number;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

function deriveStoreData(rawSellers: unknown[]): StoreData[] {
  return rawSellers.map((s) => {
    const raw = s as Record<string, unknown>;
    const id = (raw.id as string | undefined) || (raw.userId as string | undefined) || '0';
    return {
      id,
      name: (raw.name as string | undefined) || (raw.displayName as string | undefined) || 'Unknown',
      rating: (raw.rating as number | undefined) ?? 0,
      listings: (raw.listings as number | undefined) ?? (raw.listingCount as number | undefined) ?? (raw.activeListings as number | undefined) ?? 0,
      sales: (raw.sales as number | undefined) ?? (raw.salesCount as number | undefined) ?? 0,
      followers: (raw.followers as number | undefined) ?? (raw.followerCount as number | undefined) ?? 0,
      location: (raw.location as string | undefined) || 'Bangkok, Thailand',
      avatarUrl: (raw.avatarUrl as string | undefined),
      bannerUrl: (raw.bannerUrl as string | undefined),
    };
  });
}

export function StoresScreen() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { data: rawSellers, isLoading } = useStores();
  const { data: followedIds } = useFollowedSellers();
  const follow = useFollowSeller();
  const unfollow = useUnfollowSeller();

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'following'>('all');

  const sellers = useMemo(() => (rawSellers ? deriveStoreData(rawSellers) : []), [rawSellers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sellers.filter((s) => {
      const matchesQuery = !q || s.name.toLowerCase().includes(q) || (s.location ?? '').toLowerCase().includes(q);
      const matchesTab = tab === 'all' || (isAuthenticated && followedIds?.includes(s.id));
      return matchesQuery && matchesTab;
    });
  }, [sellers, query, tab, followedIds, isAuthenticated]);

  const handleFollow = (e: React.MouseEvent, seller: StoreData) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    const isFollowing = followedIds?.includes(seller.id);
    if (isFollowing) unfollow.mutate(seller.id);
    else follow.mutate(seller.id);
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Stores"
        icon={<Store className="w-6 h-6 text-brand" />}
        description="Browse trusted sellers and their collections"
      />

      <div className="space-y-5">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by store name or location"
              className="pl-9 bg-surface-light border-border h-11"
            />
          </div>
          <div className="inline-flex items-center rounded-xl border border-border bg-surface-light p-1 shrink-0">
            <button
              onClick={() => setTab('all')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                tab === 'all'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Store className="w-3.5 h-3.5" />
              All
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate({ to: '/login' });
                  return;
                }
                setTab('following');
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                tab === 'following'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Heart className="w-3.5 h-3.5" />
              Following
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-surface-light border-border overflow-hidden h-full">
                <div className="h-24 bg-surface-lighter shimmer" />
                <CardContent className="p-4">
                  <div className="flex gap-3 -mt-8 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-surface-lighter border-4 border-surface-light shimmer" />
                  </div>
                  <div className="h-4 w-1/2 bg-surface-lighter rounded shimmer mb-2" />
                  <div className="h-3 w-1/3 bg-surface-lighter rounded shimmer" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-surface-light border-border">
            <CardContent className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface-lighter flex items-center justify-center mx-auto">
                {tab === 'following' ? (
                  <Users className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <Search className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {tab === 'following' && !isAuthenticated
                    ? 'Sign in to see stores you follow'
                    : tab === 'following'
                    ? 'You are not following any stores yet'
                    : query
                    ? 'No stores match your search'
                    : 'No stores yet'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {tab === 'following' && !isAuthenticated
                    ? 'Log in to keep track of your favorite sellers.'
                    : tab === 'following'
                    ? 'Follow sellers to see their updates here.'
                    : query
                    ? 'Try a different name or location.'
                    : 'Check back once sellers start listing cards.'}
                </p>
              </div>
              {tab === 'following' && !isAuthenticated && (
                <Button className="bg-brand hover:bg-brand-light" onClick={() => navigate({ to: '/login' })}>
                  Sign in
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((seller) => {
              const following = isAuthenticated && followedIds?.includes(seller.id);
              return (
                <Link
                  key={seller.id}
                  to="/seller/$sellerId"
                  params={{ sellerId: seller.id }}
                  className="group block"
                >
                  <Card className="bg-surface-light border-border overflow-hidden hover:border-brand/40 hover-lift transition h-full relative">
                    <div
                      className={cn(
                        'h-24 bg-cover bg-center relative',
                        !seller.bannerUrl && 'bg-gradient-to-br from-brand to-periwinkle'
                      )}
                      style={seller.bannerUrl ? { backgroundImage: `url(${seller.bannerUrl})` } : undefined}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    </div>
                    <CardContent className="p-4 relative">
                      <Avatar className="w-14 h-14 rounded-xl border-4 border-surface-light -mt-9 mb-3 shadow-md bg-surface-lighter">
                        <AvatarImage src={seller.avatarUrl} alt={seller.name} className="object-cover" />
                        <AvatarFallback className="rounded-xl text-lg font-bold bg-surface-lighter text-foreground">
                          {seller.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate group-hover:text-brand transition">@{seller.name}</h3>
                          <div className="flex items-center gap-1 text-xs text-text-secondary mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{seller.location}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleFollow(e, seller)}
                          disabled={follow.isPending || unfollow.isPending}
                          aria-label={following ? 'Unfollow' : 'Follow'}
                          className={cn(
                            'shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition',
                            following
                              ? 'bg-brand/15 text-brand hover:bg-brand/25'
                              : 'bg-surface-lighter text-muted-foreground hover:text-brand hover:bg-brand/10'
                          )}
                        >
                          <Heart className={cn('w-4 h-4', following && 'fill-current')} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        <div className="bg-surface rounded-lg p-2">
                          <p className="font-bold text-sm">{seller.listings}</p>
                          <p className="text-xs text-text-tertiary">Listings</p>
                        </div>
                        <div className="bg-surface rounded-lg p-2">
                          <p className="font-bold text-sm">{seller.sales}</p>
                          <p className="text-xs text-text-tertiary">Sales</p>
                        </div>
                        <div className="bg-surface rounded-lg p-2">
                          <p className="font-bold text-sm">{seller.followers}</p>
                          <p className="text-xs text-text-tertiary">Followers</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm mt-3">
                        <Star className="w-3.5 h-3.5 text-pregrade fill-pregrade" />
                        <span className="font-medium">{seller.rating || '—'}</span>
                        <span className="text-text-tertiary text-xs ml-0.5">rating</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
