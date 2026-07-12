import ky from 'ky';
import type {
  ApiAuthResponse,
  ApiUser,
  ApiItem,
  ApiListing,
  ApiOrder,
  ApiOffer,
  ApiWishlistItem,
  ApiNotification,
  ApiCollectorProfile,
  ApiServiceProvider,
  ApiServicePackage,
  ApiServiceCategory,
  ApiServiceOrder,
  ApiPartnerApplication,
  ApiRedemption,
  ApiVaultDelivery,
  ApiMarketHistoryPoint,
  ApiMarketStats,
  ApiAuditEntry,
  ApiPlatformStats,
  ApiCampaign,
  ApiAchievement,
  ApiBadge,
  ApiShippingAddress,
} from '@/types/api';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1').replace(/\/?$/, '/');

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('sws_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = ky.create({
  prefix: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = localStorage.getItem('sws_access_token');
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
  },
});

// ─── HTTP Wrappers ──────────────────────────────────────────────────

export async function apiGet<T>(path: string, options?: { searchParams?: Record<string, string | number | undefined> }): Promise<T> {
  try {
    const res = await api.get(path, { ...options, headers: getAuthHeaders() });
    return res.json();
  } catch (err) {
    const error = err as { response?: { status: number } };
    if (error.response?.status === 401) {
      localStorage.removeItem('sws_access_token');
    }
    console.error(`[API GET Error] ${path}:`, err);
    throw err;
  }
}

export async function apiPost<T>(path: string, options?: { json?: unknown; body?: FormData }): Promise<T> {
  try {
    const res = await api.post(path, { ...options, headers: getAuthHeaders() });
    return res.json();
  } catch (err) {
    const error = err as { response?: { status: number } };
    if (error.response?.status === 401) {
      localStorage.removeItem('sws_access_token');
    }
    console.error(`[API POST Error] ${path}:`, err);
    throw err;
  }
}

export async function apiPut<T>(path: string, options?: { json?: unknown }): Promise<T> {
  try {
    const res = await api.put(path, { ...options, headers: getAuthHeaders() });
    return res.json();
  } catch (err) {
    const error = err as { response?: { status: number } };
    if (error.response?.status === 401) {
      localStorage.removeItem('sws_access_token');
    }
    console.error(`[API PUT Error] ${path}:`, err);
    throw err;
  }
}

export async function apiDelete<T>(path: string): Promise<T> {
  try {
    const res = await api.delete(path, { headers: getAuthHeaders() });
    return res.json();
  } catch (err) {
    const error = err as { response?: { status: number } };
    if (error.response?.status === 401) {
      localStorage.removeItem('sws_access_token');
    }
    console.error(`[API DELETE Error] ${path}:`, err);
    throw err;
  }
}

export async function apiPatch<T>(path: string, options?: { json?: unknown }): Promise<T> {
  try {
    const res = await api.patch(path, { ...options, headers: getAuthHeaders() });
    return res.json();
  } catch (err) {
    const error = err as { response?: { status: number } };
    if (error.response?.status === 401) {
      localStorage.removeItem('sws_access_token');
    }
    console.error(`[API PATCH Error] ${path}:`, err);
    throw err;
  }
}

// ─── Domain APIs (aligned with API_SPEC.md) ─────────────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('auth/login', { json: data }).json<ApiAuthResponse>(),
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post('auth/register', { json: data }).json<ApiAuthResponse>(),
  me: () => apiGet<{ user: ApiUser }>('auth/me'),
};

export const userApi = {
  me: () => apiGet<{ user: ApiUser }>('auth/me'),
};

export const listingsApi = {
  getAll: (params?: {
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
    min_price?: number;
    max_price?: number;
    sellerId?: string;
  }) => apiGet<{ listings: ApiListing[] }>('listings', { searchParams: params }),

  getById: (id: string) => apiGet<{ listing: ApiListing }>(`listings/${id}`),

  getBySeller: (sellerId: string) =>
    apiGet<{ listings: ApiListing[] }>('listings', { searchParams: { sellerId } }),

  create: (data: {
    itemId: string;
    price: number;
    currency?: string;
    condition?: string;
    images?: string[];
    description?: string;
    listingType?: 'SALE' | 'TRADE';
    shelf?: string;
  }) => apiPost<{ listing: ApiListing }>('listings', { json: data }),

  updateStatus: (id: string, data: { status: ApiListingStatus }) =>
    apiPut<void>(`listings/${id}/status`, { json: data }),

  delist: (id: string) => apiDelete<void>(`listings/${id}`),
};

export const ordersApi = {
  getRecent: () => apiGet<{ orders: ApiOrder[] }>('orders/recent'),
  getAll: () => apiGet<{ orders: ApiOrder[] }>('orders'),
  getById: (id: string) => apiGet<{ order: ApiOrder }>(`orders/${id}`),
  create: (data: {
    listingId: string;
    deliveryType: ApiOrder['deliveryType'];
    shippingAddress?: ApiShippingAddress;
  }) => apiPost<{ order: ApiOrder }>('orders', { json: data }),
  updateStatus: (id: string, data: { status: ApiOrder['status'] }) =>
    apiPut<void>(`orders/${id}/status`, { json: data }),
  cancel: (id: string) => apiPost<void>(`orders/${id}/cancel`),
};

export type ApiListingStatus = ApiListing['status'];
export type ApiOrderStatus = ApiOrder['status'];

export const wishlistApi = {
  getAll: () => apiGet<{ wishlist: ApiWishlistItem[] }>('wishlist'),
  add: (listingId: string) => apiPost<void>(`wishlist/${listingId}`),
  remove: (listingId: string) => apiDelete<void>(`wishlist/${listingId}`),
};

export const notificationsApi = {
  getAll: () => apiGet<{ notifications: ApiNotification[] }>('notifications'),
  markRead: (id: string) => apiPatch<void>(`notifications/${id}/read`),
};

export const storesApi = {
  getAll: (params?: { tier?: string; search?: string; minListings?: string; hasSales?: string }) =>
    apiGet<{ sellers: ApiCollectorProfile[] }>('collectors', { searchParams: params }),
};

export const collectorApi = {
  getProfile: (userId: string) => apiGet<{ profile: ApiCollectorProfile }>(`collectors/${userId}`),
  updateProfile: (data: Partial<ApiCollectorProfile>) =>
    apiPut<{ profile: ApiCollectorProfile }>('collectors/me', { json: data }),
  uploadAvatar: (formData: FormData) =>
    api.post('collector-profiles/avatar', { body: formData, headers: getAuthHeaders() }).json<{ avatarUrl: string }>(),
  uploadBanner: (formData: FormData) =>
    api.post('collector-profiles/banner', { body: formData, headers: getAuthHeaders() }).json<{ bannerUrl: string }>(),
};

export const followsApi = {
  follow: (followingId: string) => apiPost<void>('follows', { json: { followingId } }),
  unfollow: (followingId: string) => apiDelete<void>(`follows/${followingId}`),
  getAll: () => apiGet<{ follows: { id: string; followerId: string; followingId: string; createdAt: string }[] }>('follows'),
};

export const vaultApi = {
  getItems: (params?: {
    ownerId?: string;
    holderId?: string;
    userId?: string;
    status?: string;
    category?: string;
    subCategory?: string;
    itemFormat?: string;
    page?: number;
    limit?: number;
  }) => apiGet<{ items: ApiItem[] }>('items', { searchParams: params }),

  getItemById: (id: string) => apiGet<{ item: ApiItem }>(`items/${id}`),

  registerItem: (data: {
    name: string;
    sku: string;
    category?: string;
    subCategory?: string;
    itemFormat?: string;
    condition?: string;
    description?: string;
    imageUrl?: string;
  }) => apiPost<{ item: ApiItem }>('items', { json: data }),

  deleteItem: (id: string) => apiDelete<void>(`items/${id}`),

  createRedemption: (id: string, data: { shippingAddress: ApiShippingAddress }) =>
    apiPost<{ redemption: ApiRedemption }>(`items/${id}/redemptions`, { json: data }),

  getRedemptions: () => apiGet<{ redemptions: ApiRedemption[] }>('redemptions'),

  createVaultDelivery: (id: string, data: { shippingAddress: ApiShippingAddress }) =>
    apiPost<{ delivery: ApiVaultDelivery }>(`items/${id}/vault-deliveries`, { json: data }),

  getVaultDeliveries: () => apiGet<{ deliveries: ApiVaultDelivery[] }>('vault-deliveries'),
};

export const auditApi = {
  getItemHistory: (itemId: string) =>
    apiGet<{ itemId: string; history: ApiAuditEntry[] }>(`audit/items/${itemId}`),
  getUserHistory: (userId: string) =>
    apiGet<{ userId: string; history: ApiAuditEntry[] }>(`audit/users/${userId}`),
};

export const marketApi = {
  getHistory: (sku: string, period?: string) =>
    apiGet<{ data: ApiMarketHistoryPoint[] }>(`market/${sku}/history`, { searchParams: period ? { period } : undefined }),
  getStats: (sku: string) => apiGet<ApiMarketStats>(`market/${sku}/stats`),
};

export const offersApi = {
  getReceived: () => apiGet<{ offers: ApiOffer[] }>('offers/received'),
  getSent: () => apiGet<{ offers: ApiOffer[] }>('offers/sent'),
  create: (data: { listingId: string; offerPrice: number }) =>
    apiPost<{ offer: ApiOffer }>('offers', { json: data }),
  accept: (offerId: string) => apiPost<void>(`offers/${offerId}/accept`),
  decline: (offerId: string) => apiPost<void>(`offers/${offerId}/decline`),
};

export const kycApi = {
  getStatus: (userId: string) => apiGet<{ status: ApiUser['kycStatus']; submittedAt?: string }>(`kyc/status/${userId}`),
  submit: (data: unknown) => apiPost<{ status: ApiUser['kycStatus'] }>('kyc/submit', { json: data }),
};

export const campaignsApi = {
  getAll: () => apiGet<{ campaigns: ApiCampaign[] }>('campaigns'),
  getBySlug: (slug: string) => apiGet<{ campaign: ApiCampaign }>(`campaigns/${slug}`),
  claim: (slug: string) => apiPost<{ success: boolean }>(`campaigns/${slug}/claim`),
  getMy: () => apiGet<{ campaigns: ApiCampaign[] }>('campaigns/my'),
};

export const achievementsApi = {
  getAll: () => apiGet<{ achievements: ApiAchievement[] }>('achievements'),
  getBySlug: (slug: string) => apiGet<{ achievement: ApiAchievement }>(`achievements/${slug}`),
  getMy: () => apiGet<{ achievements: ApiAchievement[] }>('achievements/my'),
  progress: (slug: string, data?: unknown) =>
    apiPost<{ achievement: ApiAchievement }>(`achievements/${slug}/progress`, { json: data }),
};

export const badgesApi = {
  getAll: () => apiGet<{ badges: ApiBadge[] }>('badges'),
  getByUser: (userId: string) => apiGet<{ badges: ApiBadge[] }>(`users/${userId}/badges`),
  getEquipped: (userId: string) => apiGet<{ badges: ApiBadge[] }>(`users/${userId}/badges/equipped`),
  equip: (badgeId: string) => apiPost<void>('users/me/badges/equip', { json: { badgeId } }),
};

export const platformApi = {
  getStats: () => apiGet<ApiPlatformStats>('platform/stats'),
};

export const shipmentsApi = {
  getByOrder: (orderId: string) => apiGet<{ shipment: unknown }>(`shipments/${orderId}`),
  track: (id: string) => apiGet<{ tracking: unknown }>(`shipments/${id}/track`),
};

// ─── Legacy wrappers for swap-app compatibility (not in API_SPEC.md) ─

export const pricesApi = {
  getByCode: (cardCode: string) => apiGet<unknown>(`prices/${cardCode}`),
};

export const submissionsApi = {
  getAll: () => apiGet<{ submissions: unknown[] }>('submissions'),
};

export const ratingsApi = {
  submit: (submissionId: string, rating: { score: number; tags: string[]; comment: string }) =>
    apiPost<void>(`submissions/${submissionId}/rating`, { json: rating }),
};

export const pregradeApi = {
  createOrder: (order: { cardIds: string[]; lab: string }) =>
    apiPost<{ orderId: string; shippingTag: string }>('pregrade', { json: order }),
};

export const servicesApi = {
  getProviders: (category?: 'PREGRADE' | 'GRADE') =>
    apiGet<{ providers: ApiServiceProvider[] }>('services/providers', {
      searchParams: category ? { category } : undefined,
    }),
  getProvider: (id: string) => apiGet<{ provider: ApiServiceProvider }>(`services/providers/${id}`),
};

export const servicePackagesApi = {
  getByProvider: (providerId: string) =>
    apiGet<{ packages: ApiServicePackage[] }>(`services/providers/${providerId}/packages`),
};

export const serviceOrdersApi = {
  create: (data: {
    category: ApiServiceOrder['category'];
    providerId: string;
    packageId?: string;
    cardIds: string[];
    shippingAddress?: ApiShippingAddress;
  }) => apiPost<{ order: ApiServiceOrder }>('service-orders', { json: data }),
};

export const partnersApi = {
  submitApplication: (data: {
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    website?: string;
    serviceCategories: ApiServiceCategory[];
    serviceTypes: string[];
    message?: string;
  }) => apiPost<{ application: ApiPartnerApplication }>('partners/applications', { json: data }),
  getApplications: () => apiGet<{ applications: ApiPartnerApplication[] }>('partners/applications'),
  getApplication: (id: string) => apiGet<{ application: ApiPartnerApplication }>(`partners/applications/${id}`),
};

export const checkoutApi = {
  getDefaultAddress: () => apiGet<ApiShippingAddress>('addresses/default'),
};

export { USE_MOCK };
