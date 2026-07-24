import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useStores, useFollowedSellers, useUnfollowSeller } from '@/hooks/useApi';
import { listingsApi } from '@/lib/api';
import { mapApiListingToMarketListing } from '@/lib/api-mappers';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ListingCard } from '@/components/domain/ListingCard';
import { Users, Store, Package, Heart, Trash2, Loader2 } from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  rating: number;
  listings: number;
  sales: number;
  followers: number;
  activeListings: number;
}

function deriveStoreData(rawSellers: unknown[]): StoreData[] {
  return rawSellers.map((s) => {
    const raw = s as Record<string, unknown>;
    return {
      id: (raw.id as string | undefined) || (raw.userId as string | undefined) || '',
      name: (raw.name as string | undefined) || (raw.displayName as string | undefined) || 'Unknown',
      rating: (raw.rating as number | undefined) ?? 4.5,
      listings: (raw.listings as number | undefined) ?? (raw.listingCount as number | undefined) ?? 0,
      sales: (raw.sales as number | undefined) ?? (raw.salesCount as number | undefined) ?? 0,
      followers: (raw.followers as number | undefined) ?? (raw.followerCount as number | undefined) ?? 0,
      activeListings: (raw.activeListings as number | undefined) ?? 0,
    };
  });
}

export function FollowingScreen() {
  const { data: rawSellers, isLoading: storesLoading } = useStores();
  const { data: followedIds, isLoading: followsLoading } = useFollowedSellers();
  const unfollow = useUnfollowSeller();

  const allSellers = rawSellers ? deriveStoreData(rawSellers) : [];
  const followedSellers = allSellers.filter((s) => followedIds?.includes(s.id));

  const isLoading = storesLoading || followsLoading;

  // Latest listings from followed sellers — real data via GET /market/listings?sellerId=
  // (one query per followed seller, merged client-side newest-first).
  const feedQueries = useQueries({
    queries: followedSellers.map((seller) => ({
      queryKey: ['sellerListings', seller.id],
      queryFn: async () => {
        const res = await listingsApi.getBySeller(seller.id);
        return res.results.map(mapApiListingToMarketListing);
      },
      staleTime: 1000 * 30,
    })),
  });

  const feedLoading = feedQueries.some((q) => q.isLoading);
  const feedListings = useMemo(
    () =>
      feedQueries
        .flatMap((q) => q.data ?? [])
        .filter((l) => (l.status ?? 'active') === 'active')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 12),
    [feedQueries]
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Following"
        icon={<Users className="w-6 h-6 text-brand" />}
        description="Sellers you follow and their latest listings"
      />

      <div className="space-y-6">
        {/* Sellers */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">Sellers ({followedSellers.length})</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          ) : followedSellers.length === 0 ? (
            <Card className="bg-surface-light border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Store className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>You are not following any sellers yet.</p>
                <Button asChild className="mt-4 bg-brand hover:bg-brand-light">
                  <Link to="/stores">Browse stores</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {followedSellers.map((seller) => (
                <Card key={seller.id} className="bg-surface-light border-border flex-shrink-0 w-56">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <Link to="/seller/$sellerId" params={{ sellerId: seller.id }}>
                        <div className="w-12 h-12 rounded-full bg-surface-lighter flex items-center justify-center font-bold text-lg">
                          {seller.name.charAt(0)}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to="/seller/$sellerId" params={{ sellerId: seller.id }} className="block truncate font-semibold text-sm hover:text-brand">
                          @{seller.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{seller.activeListings} listings</p>
                      </div>
                    </div>
                    <button
                      onClick={() => unfollow.mutate(seller.id)}
                      disabled={unfollow.isPending}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground hover:text-pldown hover:bg-pldown/10 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Unfollow
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Feed */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4 text-brand" />
            New listings from followed sellers
          </h2>
          {feedLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          ) : feedListings.length === 0 ? (
            <Card className="bg-surface-light border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No listings from followed sellers yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {feedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
