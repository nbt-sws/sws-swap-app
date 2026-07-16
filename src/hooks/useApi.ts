import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listingsApi, ordersApi, authApi, wishlistApi, vaultApi,
  auditApi, marketApi, offersApi, pricesApi, submissionsApi,
  userApi, ratingsApi, pregradeApi, checkoutApi,
  storesApi, collectorApi, notificationsApi, followsApi, kycApi, platformApi,
  apiPost,
} from '@/lib/api';
import * as mockApi from '@/services/mockApi';
import type {
  CreateListingInput, TradeCard, ShippingAddress, CardPriceData, GradingSubmission, Notification, Redemption, VaultDelivery, StoreProfile, StoreGroup, StoreReview, Card, MarketListing,
} from '@/types';
import type { ApiCollectorProfile } from '@/types/api';
import {
  mapApiUserToAuthUser,
  mapApiItemToVaultItem,
  mapApiListingToMarketListing,
  mapApiOrderToOrder,
  mapApiOfferToOffer,
  mapApiWishlistItemToWishlistItem,
  mapApiCollectorProfileToStore,
  mapApiNotification,
  mapApiRedemption,
  mapApiVaultDelivery,
  placeholderCard,
} from '@/lib/api-mappers';

import { useAuthStore } from '@/stores/auth';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function withFallback<T>(apiCall: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (USE_MOCK) return fallback();
  try {
    return await apiCall();
  } catch (err: any) {
    // Only fallback on network errors, not 4xx/5xx responses
    if (err?.name === 'TypeError' || err?.message?.includes('fetch') || err?.message?.includes('network')) {
      console.warn('[withFallback] Network error, using fallback:', err.message);
      return fallback();
    }
    throw err;
  }
}

// ─── Vault hooks ────────────────────────────────────────────────────

export function useVault() {
  const { isAuthenticated, user } = useAuthStore();
  return useQuery({
    queryKey: ['vault', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await vaultApi.getItems({ ownerId: user.id });
      return res.items.map(mapApiItemToVaultItem);
    },
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
    enabled: isAuthenticated && !!user?.id,
  });
}

export function useVaultItem(itemId: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['vault', itemId],
    queryFn: async () => {
      const res = await vaultApi.getItemById(itemId);
      return mapApiItemToVaultItem(res);
    },
    enabled: !!itemId && isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAddToVault() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (item: Parameters<typeof vaultApi.registerItem>[0]) => {
      if (USE_MOCK) {
        return mockApi.addToVault({
          card: placeholderCard({
            id: item.sku,
            code: item.sku,
            nameEn: item.name,
            condition: (item.condition ?? 'Raw') as Card['condition'],
          }),
          ownerId: user?.id,
          holderId: user?.id,
          paidPrice: typeof item.metadata?.paidPrice === 'number' ? item.metadata.paidPrice : 0,
          currency: 'THB',
          dateAcquired: typeof item.metadata?.dateAcquired === 'string' ? item.metadata.dateAcquired : new Date().toISOString().split('T')[0],
          source: typeof item.metadata?.source === 'string' ? item.metadata.source : (item.category ?? 'Manual entry'),
          condition: item.condition ?? 'Raw',
          status: 'held',
          itemStatus: 'AVAILABLE',
          plAmount: 0,
          plPercent: 0,
        } as Omit<import('@/types').VaultItem, 'id' | 'currentPrice' | 'plAmount' | 'plPercent'>);
      }
      return vaultApi.registerItem(item);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault'] }),
  });
}

export function useConsignToPlatform() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: (itemId: string) =>
      USE_MOCK
        ? mockApi.consignItemToPlatform(itemId, user?.id)
        : vaultApi.consignToPlatform(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault'] }),
  });
}

// ─── Market hooks ───────────────────────────────────────────────────

export function useMarketListings(shelf?: string) {
  return useQuery({
    queryKey: ['market', shelf],
    queryFn: async () => {
      const res = await listingsApi.getAll(shelf ? { q: shelf } : undefined);
      return res.results.map(mapApiListingToMarketListing);
    },
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
  });
}

export function useListings(params?: { q?: string; page?: number; limit?: number; sort?: string }) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const res = await listingsApi.getAll(params);
      const listings = res.results.map(mapApiListingToMarketListing);
      return { results: listings };
    },
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
  });
}

export function useListing(listingId: string) {
  return useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const res = await listingsApi.getById(listingId);
      return mapApiListingToMarketListing(res);
    },
    enabled: !!listingId,
    staleTime: 1000 * 60,
  });
}

export function useCardPrice(cardCode: string) {
  return useQuery<CardPriceData>({
    queryKey: ['price', cardCode],
    queryFn: async () => {
      const res = await pricesApi.getByCode(cardCode);
      return res as CardPriceData;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!cardCode,
  });
}

// ─── Submissions / Grading hooks ────────────────────────────────────

export function useSubmissions() {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const res = await submissionsApi.getAll();
      return res.submissions as GradingSubmission[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useSubmitRating() {
  return useMutation({
    mutationFn: ({ submissionId, rating }: { submissionId: string; rating: { score: number; tags: string[]; comment: string } }) =>
      ratingsApi.submit(submissionId, rating),
  });
}

export function useCreatePregradeOrder() {
  return useMutation({
    mutationFn: pregradeApi.createOrder,
  });
}

export function useApproveSubmissionConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submissionId: string) =>
      apiPost<void>(`submissions/${submissionId}/consent`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions'] }),
  });
}

// ─── User hooks ─────────────────────────────────────────────────────

export function useUser() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await userApi.me();
      return mapApiUserToAuthUser(res);
    },
    staleTime: 1000 * 60 * 5,
    enabled: isAuthenticated,
  });
}

// Separate error handling for useUser - TanStack Query v5 removed onError from useQuery
// We handle 401 errors via the queryClient's default error handler or in components

export function useAuthLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setTokens(res.token);
      setUser(mapApiUserToAuthUser(res.user));
    },
  });
}

export function useAuthRegister() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      setTokens(res.token);
      setUser(mapApiUserToAuthUser(res.user));
    },
  });
}

// ─── Wishlist hooks ─────────────────────────────────────────────────

export function useWishlist() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const [wishlistRes, listingsRes] = await Promise.all([
        wishlistApi.getAll(),
        listingsApi.getAll({ limit: 1000 }),
      ]);
      const listings = listingsRes.results;
      return wishlistRes.items.map((i) =>
        mapApiWishlistItemToWishlistItem(i, listings.find((l) => l.listingId === i.listingId))
      );
    },
    staleTime: 1000 * 60 * 2,
    enabled: isAuthenticated,
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => wishlistApi.add(listingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listingId: string) => wishlistApi.remove(listingId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });
}

// ─── Seller / Listing hooks ─────────────────────────────────────────

export function useMyListings() {
  const { isAuthenticated, user } = useAuthStore();
  return useQuery({
    queryKey: ['myListings'],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await listingsApi.getBySeller(user.id);
      return res.results.map(mapApiListingToMarketListing);
    },
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
    enabled: isAuthenticated,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { data: myListings } = useMyListings();
  const { data: storeProfile } = useStoreProfile(user?.id ?? '');
  
  return useMutation({
    mutationFn: async (input: CreateListingInput) => {
      // Check if item already has an active listing
      const itemId = input.itemId ?? input.card.id;
      const existing = myListings?.find(l => l.itemId === itemId && l.status === 'active');
      if (existing) {
        throw new Error('This item is already listed for sale');
      }
      
      // Use store profile display name if available, fallback to fullName or email
      const _sellerName = storeProfile?.displayName || storeProfile?.name || user?.fullName || user?.email || 'Me';
      void _sellerName; // used in optimistic update
      
      const res = await listingsApi.create({
        itemId,
        title: input.card.nameEn,
        description: input.description,
        price: input.price,
        category: input.shelf,
        itemFormat: input.listingType,
      });
      return mapApiListingToMarketListing({
        listingId: res.listingId,
        itemId,
        sellerId: user?.id ?? '',
        title: input.card.nameEn,
        price: input.price,
        currency: 'THB',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
    },
    // Optimistic update: add the new listing to cache immediately
    onMutate: async (input) => {
      const itemId = input.itemId ?? input.card.id;
      const sellerId = user?.id ?? '';
      // Use store profile display name for optimistic update
      const profile = queryClient.getQueryData<StoreProfile>(['storeProfile', user?.id]);
      const sellerName = profile?.displayName || profile?.name || user?.fullName || user?.email || 'Me';
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['listingsBySeller', sellerId] });
      await queryClient.cancelQueries({ queryKey: ['myListings'] });
      await queryClient.cancelQueries({ queryKey: ['vault'] });
      await queryClient.cancelQueries({ queryKey: ['market'] });
      
      // Snapshot previous values
      const previousListings = queryClient.getQueryData(['listingsBySeller', sellerId]);
      const previousMyListings = queryClient.getQueryData(['myListings']);
      const previousVault = queryClient.getQueryData(['vault']);
      const previousMarket = queryClient.getQueryData(['market']);
      
      // Build a proper optimistic MarketListing
      const optimisticListing: MarketListing = {
        id: `temp-${Date.now()}`,
        card: input.card,
        price: input.price,
        currency: 'THB',
        listingType: input.listingType,
        shelf: input.shelf,
        seller: { id: sellerId, name: sellerName, rating: 0 },
        vaultVerified: true,
        itemId,
        timestamp: new Date().toISOString(),
        status: 'active',
        views: 0,
        watchers: 0,
      };
      
      // Optimistically add to all relevant caches
      queryClient.setQueryData(['listingsBySeller', sellerId], (old: any) => {
        return old ? [...old, optimisticListing] : [optimisticListing];
      });
      queryClient.setQueryData(['myListings'], (old: any) => {
        return old ? [...old, optimisticListing] : [optimisticListing];
      });
      queryClient.setQueryData(['market'], (old: any) => {
        if (!old) return [optimisticListing];
        return Array.isArray(old) ? [optimisticListing, ...old] : { results: [optimisticListing, ...(old.results || [])] };
      });
      
      // Optimistically update vault item status
      queryClient.setQueryData(['vault'], (old: any) => {
        if (!old) return old;
        return old.map((v: any) => v.id === itemId ? { ...v, itemStatus: 'LOCKED', listingId: optimisticListing.id } : v);
      });
      queryClient.setQueryData(['vault', user?.id], (old: any) => {
        if (!old) return old;
        return old.map((v: any) => v.id === itemId ? { ...v, itemStatus: 'LOCKED', listingId: optimisticListing.id } : v);
      });
      
      return { previousListings, previousMyListings, previousVault, previousMarket, itemId };
    },
    onSuccess: async (_data, _variables) => {
      // Force immediate refetch with fresh data - invalidate ALL queries (not just active)
      await queryClient.invalidateQueries({ queryKey: ['myListings'] });
      await queryClient.invalidateQueries({ queryKey: ['market'] });
      await queryClient.invalidateQueries({ queryKey: ['listings'] });
      await queryClient.invalidateQueries({ queryKey: ['listingsBySeller'] });
      await queryClient.invalidateQueries({ queryKey: ['vault'] });
      // Force immediate refetch for vault to update item status
      await queryClient.refetchQueries({ queryKey: ['vault'], exact: false });
      // Also refetch store profile to update listing counts
      await queryClient.invalidateQueries({ queryKey: ['storeProfile'] });
    },
    onError: (err, _input, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(['listingsBySeller', user?.id], context.previousListings);
        queryClient.setQueryData(['myListings'], context.previousMyListings);
        queryClient.setQueryData(['vault'], context.previousVault);
        queryClient.setQueryData(['market'], context.previousMarket);
      }
      console.error('[useCreateListing] Error:', err);
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listingsApi.delist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['market'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listingsBySeller'] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

export function useUpdateListingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ listingId, status }: { listingId: string; status: 'active' | 'paused' | 'sold' }) => {
      if (USE_MOCK) {
        await mockApi.updateListingStatus(listingId, status);
        return;
      }
      if (status === 'active') {
        await listingsApi.activate(listingId);
      } else {
        // paused / sold maps to delist on the real backend
        await listingsApi.delist(listingId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['market'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listingsBySeller'] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

// ─── Orders hooks ───────────────────────────────────────────────────

export function useOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await ordersApi.getAll();
      return res.orders.map(mapApiOrderToOrder);
    },
    staleTime: 1000 * 60 * 2,
    enabled: isAuthenticated,
  });
}

export function useOrder(orderId: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await ordersApi.getById(orderId);
      return mapApiOrderToOrder(res);
    },
    enabled: !!orderId && isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { listingId: string; deliveryType: 'SHIP' | 'VAULT_STORE'; shippingAddress?: ShippingAddress; itemId?: string; sellerId?: string; price?: number }) => {
      if (USE_MOCK) {
        const order = await mockApi.createOrder({
          listingId: data.listingId,
          deliveryPreference: data.deliveryType,
          shippingAddress: data.shippingAddress,
        });
        return order;
      }
      const created = await ordersApi.create({
        listingId: data.listingId,
        itemId: data.itemId,
        sellerId: data.sellerId,
        price: data.price,
        deliveryPreference: data.deliveryType,
        shippingAddress: data.shippingAddress,
      });
      const full = await ordersApi.getById(created.orderId);
      return mapApiOrderToOrder(full);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: import('@/types').Order['status'] }) => {
      if (USE_MOCK) {
        await mockApi.updateOrderStatus(orderId, status);
        return;
      }
      // Real backend only exposes cancel for buyer-facing status transitions.
      if (status === 'CANCELLED') {
        await ordersApi.cancel(orderId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

// ─── KYC hooks ──────────────────────────────────────────────────────

export function useKycStatus(userId?: string) {
  return useQuery({
    queryKey: ['kycStatus', userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await kycApi.getStatus(userId);
      return res;
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });
}

export function useSubmitKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: kycApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kycStatus'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// ─── Offers hooks ───────────────────────────────────────────────────

export function useOffers() {
  const { isAuthenticated, user } = useAuthStore();
  return useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const [received, sent] = await Promise.all([offersApi.getReceived(), offersApi.getSent()]);
      const currentUserId = user?.id;
      return [...received.offers.map((o) => mapApiOfferToOffer(o, currentUserId)), ...sent.offers.map((o) => mapApiOfferToOffer(o, currentUserId))];
    },
    staleTime: 1000 * 60 * 2,
    enabled: isAuthenticated,
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { listingId: string; sellerId?: string; offerPrice: number }) => {
      let sellerId = data.sellerId;
      if (!sellerId && !USE_MOCK) {
        const listing = await listingsApi.getById(data.listingId);
        sellerId = listing.sellerId;
      }
      return offersApi.create({
        listingId: data.listingId,
        sellerId: sellerId ?? '',
        offerPrice: data.offerPrice,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useRespondOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ offerId, action }: { offerId: string; action: 'accept' | 'decline' }) =>
      action === 'accept' ? offersApi.accept(offerId) : offersApi.decline(offerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
  });
}

export function useCreateTradeOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { listingId: string; sellerId?: string; tradeCards: TradeCard[] }) => {
      let sellerId = payload.sellerId;
      if (!sellerId && !USE_MOCK) {
        const listing = await listingsApi.getById(payload.listingId);
        sellerId = listing.sellerId;
      }
      return offersApi.create({ listingId: payload.listingId, sellerId: sellerId ?? '', offerPrice: 0 });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['offers'] }),
  });
}

// ─── Market data hooks ──────────────────────────────────────────────

export function useMarketHistory(
  cardCode: string,
  range: string = '30d',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['marketHistory', cardCode, range],
    queryFn: async () => {
      const res = await marketApi.getHistory(cardCode, range);
      return res.trades.map((t) => ({ date: t.time, price: t.price }));
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!cardCode && (options?.enabled ?? true),
  });
}

export function useMarketStats(
  cardCode: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['marketStats', cardCode],
    queryFn: async () => {
      const res = await marketApi.getStats(cardCode);
      return {
        lastSold: res.lastSold,
        average: res.avgPrice,
        min: res.minPrice,
        max: res.maxPrice,
        count: res.count,
      };
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!cardCode && (options?.enabled ?? true),
  });
}

// ─── Audit hooks ────────────────────────────────────────────────────

export function useItemAuditHistory(itemId: string) {
  return useQuery({
    queryKey: ['itemAudit', itemId],
    queryFn: async () => {
      const res = await auditApi.getItemHistory(itemId);
      return res.history;
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!itemId,
  });
}

export function useUserAuditHistory(userId: string) {
  return useQuery({
    queryKey: ['userAudit', userId],
    queryFn: async () => {
      const res = await auditApi.getUserHistory(userId);
      return res.history;
    },
    staleTime: 1000 * 60 * 2,
    enabled: !!userId,
  });
}

// ─── Vault delivery hook ────────────────────────────────────────────

export function useVaultDelivery() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ itemId, shippingAddress }: { itemId: string; shippingAddress?: ShippingAddress }) => {
      if (USE_MOCK) {
        return mockApi.createVaultDelivery(itemId, shippingAddress ?? { name: '', address: '', province: '', postalCode: '', phone: '' }, user?.id);
      }
      const res = await vaultApi.createVaultDelivery(itemId, { shippingAddress: shippingAddress ?? { name: '', address: '', province: '', postalCode: '', phone: '' } });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
      queryClient.invalidateQueries({ queryKey: ['vaultDeliveries'] });
    },
  });
}

export function useCreateRedemption() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async ({ itemId, shippingAddress }: { itemId: string; shippingAddress: ShippingAddress }) => {
      if (USE_MOCK) {
        return mockApi.createRedemption(itemId, shippingAddress, user?.id);
      }
      const res = await vaultApi.createRedemption(itemId, { shippingAddress });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
    },
  });
}

export function useRedemptions() {
  const { isAuthenticated } = useAuthStore();
  return useQuery<Redemption[]>({
    queryKey: ['redemptions'],
    queryFn: async () => {
      const res = await vaultApi.getRedemptions();
      return res.redemptions.map(mapApiRedemption);
    },
    staleTime: 1000 * 60 * 2,
    enabled: isAuthenticated,
  });
}

export function useVaultDeliveries() {
  const { isAuthenticated } = useAuthStore();
  return useQuery<VaultDelivery[]>({
    queryKey: ['vaultDeliveries'],
    queryFn: async () => {
      const res = await vaultApi.getVaultDeliveries();
      return res.deliveries.map(mapApiVaultDelivery);
    },
    staleTime: 1000 * 60 * 2,
    enabled: isAuthenticated,
  });
}

// ─── Checkout / Shipping hooks ──────────────────────────────────────

export function useDefaultShippingAddress() {
  return useQuery({
    queryKey: ['defaultAddress'],
    queryFn: checkoutApi.getDefaultAddress,
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Stores / Collectors hooks ──────────────────────────────────────

export function useStores() {
  return useQuery<StoreProfile[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await storesApi.getAll();
      return res.sellers.map(mapApiCollectorProfileToStore);
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useStoreProfile(userId: string) {
  return useQuery<StoreProfile | null>({
    queryKey: ['storeProfile', userId],
    queryFn: async () => {
      const res = await collectorApi.getProfile(userId);
      return mapApiCollectorProfileToStore(res);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateStoreProfile() {
  const queryClient = useQueryClient();
  return useMutation<StoreProfile, Error, { userId: string; data: Partial<StoreProfile> }>({
    mutationFn: async ({ userId: _userId, data }) => {
      const profileUpdate: Partial<ApiCollectorProfile> = {
        displayName: data.displayName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        bannerUrl: data.bannerUrl,
        socialLinks: data.socialLinks
          ? Object.fromEntries(data.socialLinks.map((l) => [l.platform, l.url]))
          : undefined,
      };
      const res = await collectorApi.updateProfile(profileUpdate);
      return mapApiCollectorProfileToStore(res);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['storeProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

export function useUploadStoreAvatar() {
  return useMutation<string, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await collectorApi.uploadAvatar(formData);
      return res.avatarUrl;
    },
  });
}

export function useUploadStoreBanner() {
  return useMutation<string, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('banner', file);
      const res = await collectorApi.uploadBanner(formData);
      return res.bannerUrl;
    },
  });
}

export function useStoreGroups(userId: string) {
  return useQuery<StoreGroup[]>({
    queryKey: ['storeGroups', userId],
    queryFn: async () => {
      return [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useStoreReviews(storeId: string) {
  return useQuery<StoreReview[]>({
    queryKey: ['storeReviews', storeId],
    queryFn: async () => {
      return [] as StoreReview[];
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateStoreGroups() {
  const queryClient = useQueryClient();
  return useMutation<StoreGroup[], Error, { userId: string; groups: StoreGroup[] }>({
    mutationFn: async ({ userId: _userId, groups }) => groups,
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['storeGroups', userId] });
    },
  });
}

// ─── Notifications hooks ────────────────────────────────────────────

export function useNotifications() {
  const { isAuthenticated } = useAuthStore();
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationsApi.getAll();
      return res.notifications.map(mapApiNotification);
    },
    staleTime: 1000 * 60,
    enabled: isAuthenticated,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => notificationsApi.markRead(id)));
    },
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const previous = queryClient.getQueryData<Notification[]>(['notifications']);
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        old?.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n))
      );
      return { previous };
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['notifications'], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

// ─── Follow hooks ───────────────────────────────────────────────────

export function useFollowedSellers() {
  return useQuery({
    queryKey: ['followedSellers'],
    queryFn: async () => {
      const res = await followsApi.getAll();
      return res.follows.map((f) => f.followingId);
    },
    staleTime: 1000 * 60,
  });
}

export function useFollowSeller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sellerId: string) => followsApi.follow(sellerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followedSellers'] }),
  });
}

export function useUnfollowSeller() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sellerId: string) => followsApi.unfollow(sellerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followedSellers'] }),
  });
}

// ─── Legacy compatibility aliases ───────────────────────────────────

export function useListingsBySeller(sellerId?: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['listingsBySeller', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      const res = await listingsApi.getBySeller(sellerId);
      return res.results.map(mapApiListingToMarketListing);
    },
    enabled: !!sellerId && isAuthenticated,
    staleTime: 1000 * 5,
    refetchOnWindowFocus: true,
  });
}

export function useDelistListing() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: listingsApi.delist,
    // Optimistic update: remove the listing from cache immediately
    onMutate: async (listingId: string) => {
      const sellerId = user?.id ?? '';
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['listingsBySeller', sellerId] });
      await queryClient.cancelQueries({ queryKey: ['myListings'] });
      await queryClient.cancelQueries({ queryKey: ['vault'] });
      
      // Snapshot previous values
      const previousListings = queryClient.getQueryData(['listingsBySeller', sellerId]);
      const previousMyListings = queryClient.getQueryData(['myListings']);
      const previousVault = queryClient.getQueryData(['vault']);
      
      // Find the itemId associated with this listingId for vault cache update
      const listingsData = queryClient.getQueryData<MarketListing[]>(['listingsBySeller', sellerId]);
      const listing = listingsData?.find((l: any) => l.id === listingId || l.listingId === listingId);
      const itemId = listing?.itemId;
      
      // Optimistically remove the listing from listings caches
      queryClient.setQueryData(['listingsBySeller', sellerId], (old: any) => {
        return old ? old.filter((l: any) => l.id !== listingId && l.listingId !== listingId) : old;
      });
      queryClient.setQueryData(['myListings'], (old: any) => {
        return old ? old.filter((l: any) => l.id !== listingId && l.listingId !== listingId) : old;
      });
      
      // Optimistically update vault item status if we know the itemId
      if (itemId) {
        queryClient.setQueryData(['vault'], (old: any) => {
          if (!old) return old;
          return old.map((item: any) => {
            if (item.id === itemId) {
              return { ...item, itemStatus: 'AVAILABLE', listingId: undefined };
            }
            return item;
          });
        });
        queryClient.setQueryData(['vault', user?.id], (old: any) => {
          if (!old) return old;
          return old.map((item: any) => {
            if (item.id === itemId) {
              return { ...item, itemStatus: 'AVAILABLE', listingId: undefined };
            }
            return item;
          });
        });
      }
      
      return { previousListings, previousMyListings, previousVault, itemId };
    },
    onSuccess: async () => {
      // Force immediate refetch - invalidate ALL queries (not just active)
      await queryClient.invalidateQueries({ queryKey: ['myListings'] });
      await queryClient.invalidateQueries({ queryKey: ['market'] });
      await queryClient.invalidateQueries({ queryKey: ['listings'] });
      await queryClient.invalidateQueries({ queryKey: ['listingsBySeller', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['vault'] });
      await queryClient.invalidateQueries({ queryKey: ['storeProfile', user?.id] });
    },
    onError: (err, _listingId, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(['listingsBySeller', user?.id], context.previousListings);
        queryClient.setQueryData(['myListings'], context.previousMyListings);
        queryClient.setQueryData(['vault'], context.previousVault);
        queryClient.setQueryData(['vault', user?.id], context.previousVault);
      }
      console.error('[useDelistListing] Error:', err);
    },
  });
}

// ─── Buyer-web-like home data hooks (mock-backed) ───────────────────

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 400));
      return [
        { orderId: 'ORD-001', title: 'Monkey D. Luffy G5', imageUrl: '', totalAmount: 32000, createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), buyerName: 'collector_a' },
        { orderId: 'ORD-002', title: 'Charlotte Katakuri PSA 10', imageUrl: '', totalAmount: 5900, createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), buyerName: 'duelist_bkk' },
        { orderId: 'ORD-003', title: 'Awakening Booster Box', imageUrl: '', totalAmount: 3200, createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), buyerName: 'yugi_tha' },
      ];
    },
    staleTime: 1000 * 60,
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const res = await platformApi.getStats();
      return res;
    },
    staleTime: 1000 * 60,
  });
}

export function useTrendingListings() {
  return useQuery({
    queryKey: ['trendingListings'],
    queryFn: async () => {
      const res = await listingsApi.getAll({ sort: 'price_desc', limit: 8 });
      const listings = res.results.map(mapApiListingToMarketListing);
      return listings.slice(0, 8);
    },
    staleTime: 1000 * 60,
  });
}
