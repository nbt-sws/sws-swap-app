import { queryClient } from './queryClient';
import { feedApi, wtbApi } from './api';
import { useAuthStore } from '@/stores/auth';
import {
  fetchMarketListings,
  fetchOrders,
  fetchPlatformStats,
  fetchRawWishlistItems,
  fetchStores,
  fetchTrendingListings,
  fetchVaultItems,
  fetchWishlistItems,
} from '@/hooks/useApi';

/**
 * Route-level data prefetch.
 *
 * The API round-trip is the dominant cost of a first-time page visit
 * (~2s on a cold connection). Firing the target page's primary queries
 * on nav intent (hover/focus/touch) and once at idle after app load
 * means the page renders from cache instead of showing skeletons.
 *
 * queryKeys/queryFns must mirror the hooks in useApi.ts / useFeed.ts —
 * prefetchQuery is a no-op while cached data is still fresh, so repeat
 * calls are cheap.
 */
export function prefetchRouteData(to: string) {
  const { isAuthenticated, user } = useAuthStore.getState();
  const path = to.split('?')[0].replace(/\/+$/, '') || '/';

  if (path === '/') {
    queryClient.prefetchQuery({ queryKey: ['trendingListings'], queryFn: fetchTrendingListings, staleTime: 1000 * 60 });
    queryClient.prefetchQuery({ queryKey: ['platformStats'], queryFn: fetchPlatformStats, staleTime: 1000 * 60 });
    return;
  }

  if (path.startsWith('/market')) {
    queryClient.prefetchQuery({ queryKey: ['market', undefined], queryFn: () => fetchMarketListings(), staleTime: 1000 * 30 });
    // ListingCard hearts read this on every market render
    if (isAuthenticated) {
      queryClient.prefetchQuery({ queryKey: ['wishlistIds'], queryFn: fetchRawWishlistItems, staleTime: 1000 * 60 * 5 });
    }
    return;
  }

  if (path.startsWith('/stores')) {
    queryClient.prefetchQuery({ queryKey: ['stores'], queryFn: fetchStores, staleTime: 1000 * 60 * 2 });
    return;
  }

  if (path.startsWith('/wtb')) {
    queryClient.prefetchQuery({
      queryKey: ['wtb', 'OPEN', ''],
      queryFn: () => wtbApi.list({ status: 'OPEN' }),
      staleTime: 1000 * 30,
      retry: 0,
    });
    return;
  }

  if (path.startsWith('/feed')) {
    // Guests never fetch the feed (KYC gate) — mirror that here
    if (isAuthenticated) {
      queryClient.prefetchQuery({
        queryKey: ['feed', 'foryou', 'all', 1],
        queryFn: () => feedApi.feed({ tab: 'foryou', page: 1 }),
        staleTime: 1000 * 30,
        retry: 0,
      });
    }
    return;
  }

  if (!isAuthenticated) return;

  if (path.startsWith('/vault')) {
    if (user?.id) {
      queryClient.prefetchQuery({ queryKey: ['vault', user.id], queryFn: () => fetchVaultItems(user.id), staleTime: 1000 * 30 });
    }
    return;
  }

  if (path.startsWith('/orders')) {
    queryClient.prefetchQuery({ queryKey: ['orders'], queryFn: fetchOrders, staleTime: 1000 * 60 * 2 });
    return;
  }

  if (path.startsWith('/wishlist')) {
    queryClient.prefetchQuery({ queryKey: ['wishlist'], queryFn: fetchWishlistItems, staleTime: 1000 * 60 * 5 });
    queryClient.prefetchQuery({ queryKey: ['wishlistIds'], queryFn: fetchRawWishlistItems, staleTime: 1000 * 60 * 5 });
  }
}
