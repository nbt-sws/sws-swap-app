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
  CreateListingInput, TradeCard, ShippingAddress, CardPriceData, GradingSubmission, Notification, Redemption, VaultDelivery, StoreProfile, StoreGroup, StoreReview,
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
} from '@/lib/api-mappers';

import { useAuthStore } from '@/stores/auth';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export async function withFallback<T>(apiCall: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (USE_MOCK) return fallback();
  return apiCall();
}

// ─── Vault hooks ────────────────────────────────────────────────────

export function useVault() {
  const { isAuthenticated, user } = useAuthStore();
  return useQuery({
    queryKey: ['vault'],
    queryFn: async () => {
      const items = await withFallback(
        async () => {
          if (!user?.id) return [];
          const res = await vaultApi.getItems({ holderId: user.id });
          return res.items.map(mapApiItemToVaultItem);
        },
        () => mockApi.fetchVault()
      );
      return items;
    },
    staleTime: 1000 * 60 * 2,
    enabled: isAuthenticated,
  });
}

export function useVaultItem(itemId: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['vault', itemId],
    queryFn: async () => {
      const item = await withFallback(
        async () => {
          const res = await vaultApi.getItemById(itemId);
          return mapApiItemToVaultItem(res);
        },
        async () => {
          const items = await mockApi.fetchVault();
          return items.find((i) => i.id === itemId) ?? null;
        }
      );
      return item;
    },
    enabled: !!itemId && isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAddToVault() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: Parameters<typeof vaultApi.registerItem>[0]) => vaultApi.registerItem(item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault'] }),
  });
}

// ─── Market hooks ───────────────────────────────────────────────────

export function useMarketListings(shelf?: string) {
  return useQuery({
    queryKey: ['market', shelf],
    queryFn: async () => {
      const listings = await withFallback(
        async () => {
          const res = await listingsApi.getAll(shelf ? { q: shelf } : undefined);
          return res.results.map(mapApiListingToMarketListing);
        },
        () => mockApi.fetchMarketListings(shelf)
      );
      return listings;
    },
    staleTime: 1000 * 60,
  });
}

export function useListings(params?: { q?: string; page?: number; limit?: number; sort?: string }) {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const listings = await withFallback(
        async () => {
          const res = await listingsApi.getAll(params);
          return res.results.map(mapApiListingToMarketListing);
        },
        () => mockApi.fetchMarketListings(params?.q)
      );
      return { results: listings };
    },
    staleTime: 1000 * 60,
  });
}

export function useListing(listingId: string) {
  return useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listing = await withFallback(
        async () => {
          const res = await listingsApi.getById(listingId);
          return mapApiListingToMarketListing(res);
        },
        () => mockApi.fetchListingById(listingId)
      );
      return listing;
    },
    enabled: !!listingId,
    staleTime: 1000 * 60,
  });
}

export function useCardPrice(cardCode: string) {
  return useQuery<CardPriceData>({
    queryKey: ['price', cardCode],
    queryFn: () => withFallback(() => pricesApi.getByCode(cardCode) as Promise<CardPriceData>, () => mockApi.fetchCardPrice(cardCode)),
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
      const user = await withFallback(
        async () => {
          const res = await userApi.me();
          return mapApiUserToAuthUser(res);
        },
        () => mockApi.fetchUser()
      );
      return user;
    },
    staleTime: 1000 * 60 * 5,
    enabled: isAuthenticated,
  });
}

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
      const wishlist = await withFallback(
        async () => {
          const [wishlistRes, listingsRes] = await Promise.all([
            wishlistApi.getAll(),
            listingsApi.getAll({ limit: 1000 }),
          ]);
          const listings = listingsRes.results;
          return wishlistRes.items.map((i) =>
            mapApiWishlistItemToWishlistItem(i, listings.find((l) => l.listingId === i.listingId))
          );
        },
        () => mockApi.fetchWishlist()
      );
      return wishlist;
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
      const listings = await withFallback(
        async () => {
          if (!user?.id) return [];
          const res = await listingsApi.getBySeller(user.id);
          return res.results.map(mapApiListingToMarketListing);
        },
        () => mockApi.fetchMyListings()
      );
      return listings;
    },
    staleTime: 1000 * 60,
    enabled: isAuthenticated,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingInput) =>
      listingsApi.create({
        itemId: input.card.id,
        title: input.card.nameEn,
        description: input.description,
        price: input.price,
        category: input.shelf,
        itemFormat: input.listingType,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['market'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
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
    },
  });
}

// ─── Orders hooks ───────────────────────────────────────────────────

export function useOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const orders = await withFallback(
        async () => {
          const res = await ordersApi.getAll();
          return res.orders.map(mapApiOrderToOrder);
        },
        () => mockApi.fetchOrders()
      );
      return orders;
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
      const order = await withFallback(
        async () => {
          const res = await ordersApi.getById(orderId);
          return mapApiOrderToOrder(res);
        },
        async () => mockApi.fetchOrderById(orderId)
      );
      return order;
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
      const offers = await withFallback(
        async () => {
          const [received, sent] = await Promise.all([offersApi.getReceived(), offersApi.getSent()]);
          const currentUserId = user?.id;
          return [...received.offers.map((o) => mapApiOfferToOffer(o, currentUserId)), ...sent.offers.map((o) => mapApiOfferToOffer(o, currentUserId))];
        },
        () => mockApi.fetchOffers()
      );
      return offers;
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

export function useMarketHistory(cardCode: string, range: string = '30d') {
  return useQuery({
    queryKey: ['marketHistory', cardCode, range],
    queryFn: () => withFallback(
      () => marketApi.getHistory(cardCode, range).then((r) => r.trades.map((t) => ({ date: t.time, price: t.price }))),
      () => mockApi.fetchMarketHistory(cardCode, range).then((r) => r.data)
    ),
    staleTime: 1000 * 60 * 5,
    enabled: !!cardCode,
  });
}

export function useMarketStats(cardCode: string) {
  return useQuery({
    queryKey: ['marketStats', cardCode],
    queryFn: () => withFallback(
      () => marketApi.getStats(cardCode).then((r) => ({
        lastSold: r.lastSold,
        average: r.avgPrice,
        min: r.minPrice,
        max: r.maxPrice,
        count: r.count,
      })),
      () => mockApi.fetchMarketStats(cardCode)
    ),
    staleTime: 1000 * 60 * 5,
    enabled: !!cardCode,
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
  return useMutation({
    mutationFn: async ({ itemId, shippingAddress }: { itemId: string; shippingAddress?: ShippingAddress }) => {
      if (USE_MOCK) {
        return mockApi.createVaultDelivery(itemId, shippingAddress ?? { name: '', address: '', province: '', postalCode: '', phone: '' });
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
  return useMutation({
    mutationFn: async ({ itemId, shippingAddress }: { itemId: string; shippingAddress: ShippingAddress }) => {
      if (USE_MOCK) {
        return mockApi.createRedemption(itemId, shippingAddress);
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
      const redemptions = await withFallback(
        async () => {
          const res = await vaultApi.getRedemptions();
          return res.redemptions.map(mapApiRedemption);
        },
        () => mockApi.fetchRedemptions()
      );
      return redemptions;
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
      const deliveries = await withFallback(
        async () => {
          const res = await vaultApi.getVaultDeliveries();
          return res.deliveries.map(mapApiVaultDelivery);
        },
        () => mockApi.fetchVaultDeliveries()
      );
      return deliveries;
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
      const sellers = await withFallback(
        async () => {
          const res = await storesApi.getAll();
          return res.sellers.map(mapApiCollectorProfileToStore);
        },
        async () => mockApi.fetchStores()
      );
      return sellers;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useStoreProfile(userId: string) {
  return useQuery<StoreProfile | null>({
    queryKey: ['storeProfile', userId],
    queryFn: async () => {
      const profile = await withFallback(
        async () => {
          const res = await collectorApi.getProfile(userId);
          return mapApiCollectorProfileToStore(res);
        },
        async () => mockApi.fetchStoreProfile(userId)
      );
      return profile;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateStoreProfile() {
  const queryClient = useQueryClient();
  return useMutation<StoreProfile, Error, { userId: string; data: Partial<StoreProfile> }>({
    mutationFn: ({ userId, data }) => withFallback(
      async () => {
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
      async () => mockApi.updateStoreProfile(userId, data)
    ),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['storeProfile', userId] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

export function useUploadStoreAvatar() {
  return useMutation<string, Error, File>({
    mutationFn: (file) => withFallback(
      async () => {
        const formData = new FormData();
        formData.append('avatar', file);
        const res = await collectorApi.uploadAvatar(formData);
        return res.avatarUrl;
      },
      async () => mockApi.uploadStoreAvatar(file)
    ),
  });
}

export function useUploadStoreBanner() {
  return useMutation<string, Error, File>({
    mutationFn: (file) => withFallback(
      async () => {
        const formData = new FormData();
        formData.append('banner', file);
        const res = await collectorApi.uploadBanner(formData);
        return res.bannerUrl;
      },
      async () => mockApi.uploadStoreBanner(file)
    ),
  });
}

export function useStoreGroups(userId: string) {
  return useQuery<StoreGroup[]>({
    queryKey: ['storeGroups', userId],
    queryFn: async () => {
      const groups = await withFallback(
        async () => [],
        async () => mockApi.fetchStoreGroups(userId)
      );
      return groups;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useStoreReviews(storeId: string) {
  return useQuery<StoreReview[]>({
    queryKey: ['storeReviews', storeId],
    queryFn: async () => {
      const reviews = await withFallback(
        async () => [] as StoreReview[],
        async () => mockApi.fetchStoreReviews(storeId)
      );
      return reviews;
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateStoreGroups() {
  const queryClient = useQueryClient();
  return useMutation<StoreGroup[], Error, { userId: string; groups: StoreGroup[] }>({
    mutationFn: ({ userId, groups }) => withFallback(
      async () => groups,
      async () => mockApi.updateStoreGroups(userId, groups)
    ),
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
      const notifications = await withFallback(
        async () => {
          const res = await notificationsApi.getAll();
          return res.notifications.map(mapApiNotification);
        },
        () => mockApi.fetchNotifications()
      );
      return notifications;
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
      const sellers = await withFallback(
        async () => {
          const res = await followsApi.getAll();
          return res.follows.map((f) => f.followingId);
        },
        () => mockApi.getFollowedSellers()
      );
      return sellers;
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
      const listings = await withFallback(
        async () => {
          const res = await listingsApi.getBySeller(sellerId);
          return res.results.map(mapApiListingToMarketListing);
        },
        () => mockApi.fetchListingsBySeller(sellerId)
      );
      return listings;
    },
    enabled: !!sellerId && isAuthenticated,
    staleTime: 1000 * 60,
  });
}

export function useDelistListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listingsApi.delist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      queryClient.invalidateQueries({ queryKey: ['market'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
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
      const stats = await withFallback(
        async () => {
          const res = await platformApi.getStats();
          return res;
        },
        () => mockApi.fetchPlatformStats()
      );
      return stats;
    },
    staleTime: 1000 * 60,
  });
}

export function useTrendingListings() {
  return useQuery({
    queryKey: ['trendingListings'],
    queryFn: async () => {
      const listings = await withFallback(
        async () => {
          const res = await listingsApi.getAll({ sort: 'price_desc', limit: 8 });
          return res.results.map(mapApiListingToMarketListing);
        },
        () => mockApi.fetchMarketListings()
      );
      return listings.slice(0, 8);
    },
    staleTime: 1000 * 60,
  });
}
