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
  ApiServiceOrderStage,
  ApiPartnerApplication,
  ApiGradingService,
  ApiProposedPackage,
  ApiRedemption,
  ApiVaultDelivery,
  ApiMarketHistoryResponse,
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

function createKy(prefix: string) {
  return ky.create({
    prefix,
    retry: 0,
    timeout: 30000,
    hooks: {
      beforeRequest: [
        ({ request }) => {
          const token = localStorage.getItem('sws_access_token');
          if (token) request.headers.set('Authorization', `Bearer ${token}`);
          // Multi-tenant header
          request.headers.set('X-Tenant-ID', import.meta.env.VITE_TENANT_ID || 'default');
        },
      ],
    },
  });
}

// Single API instance — all routes go through the same Worker
export const api = createKy(API_BASE_URL);

// ─── HTTP Wrappers ──────────────────────────────────────────────────

function createWrappers(instance: typeof api) {
  return {
    async get<T>(path: string, options?: { searchParams?: Record<string, string | number | undefined> }): Promise<T> {
      try {
        const res = await instance.get(path, { ...options, headers: getAuthHeaders() });
        return res.json();
      } catch (err) {
        const error = err as { response?: { status: number } };
        if (error.response?.status === 401) {
          localStorage.removeItem('sws_access_token');
          window.location.href = '/login';
        }
        console.error(`[API GET Error] ${path}:`, err);
        throw err;
      }
    },

    async post<T>(path: string, options?: { json?: unknown; body?: FormData }): Promise<T> {
      try {
        const headers = getAuthHeaders();
        const opts: { headers: Record<string, string>; json?: unknown; body?: FormData } = { headers };
        if (options?.body) {
          opts.body = options.body;
        } else if (options?.json !== undefined) {
          opts.json = options.json;
          opts.headers['Content-Type'] = 'application/json';
        }
        const res = await instance.post(path, opts);
        return res.json();
      } catch (err) {
        const error = err as { response?: { status: number } };
        if (error.response?.status === 401) {
          localStorage.removeItem('sws_access_token');
          window.location.href = '/login';
        }
        console.error(`[API POST Error] ${path}:`, err);
        throw err;
      }
    },

    async put<T>(path: string, options?: { json?: unknown }): Promise<T> {
      try {
        const res = await instance.put(path, { json: options?.json, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
        return res.json();
      } catch (err) {
        const error = err as { response?: { status: number } };
        if (error.response?.status === 401) {
          localStorage.removeItem('sws_access_token');
          window.location.href = '/login';
        }
        console.error(`[API PUT Error] ${path}:`, err);
        throw err;
      }
    },

    async delete<T>(path: string): Promise<T> {
      try {
        const res = await instance.delete(path, { headers: getAuthHeaders() });
        return res.json();
      } catch (err) {
        const error = err as { response?: { status: number } };
        if (error.response?.status === 401) {
          localStorage.removeItem('sws_access_token');
          window.location.href = '/login';
        }
        console.error(`[API DELETE Error] ${path}:`, err);
        throw err;
      }
    },

    async patch<T>(path: string, options?: { json?: unknown }): Promise<T> {
      try {
        const res = await instance.patch(path, { json: options?.json, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } });
        return res.json();
      } catch (err) {
        const error = err as { response?: { status: number } };
        if (error.response?.status === 401) {
          localStorage.removeItem('sws_access_token');
          window.location.href = '/login';
        }
        console.error(`[API PATCH Error] ${path}:`, err);
        throw err;
      }
    },
  };
}

export const { get: apiGet, post: apiPost, put: apiPut, delete: apiDelete, patch: apiPatch } = createWrappers(api);

// ─── Domain APIs (aligned with real backend contract) ─────────────────

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('auth/login', { json: data }).json<ApiAuthResponse>(),
  register: (data: { fullName?: string; email: string; password: string }) =>
    api.post('auth/register', { json: { email: data.email, password: data.password, name: data.fullName } }).json<ApiAuthResponse>(),
  me: () => apiGet<ApiUser>('user'),
};

export const userApi = {
  me: () => apiGet<ApiUser>('user'),
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
    status?: string;
  }) => apiGet<{ results: ApiListing[] }>('listings', { searchParams: params }),

  getById: (id: string) => apiGet<ApiListing>(`listings/${id}`),

  getBySeller: (sellerId: string) =>
    apiGet<{ results: ApiListing[] }>('listings', { searchParams: { sellerId } }),

  create: (data: {
    itemId: string;
    title?: string;
    description?: string;
    price: number;
    category?: string;
    subCategory?: string;
    itemFormat?: string;
  }) => apiPost<{ listingId: string; status: string }>('listings', { json: data }),

  activate: (id: string) => apiPost<{ listingId: string; status: string }>(`listings/${id}/activate`),

  delist: (id: string) => apiDelete<{ listingId: string; status: string }>(`listings/${id}`),
};

export const ordersApi = {
  getAll: async () => {
    const res = await apiGet<{ orders: ApiOrder[] } | ApiOrder[]>('orders');
    return Array.isArray(res) ? { orders: res } : res;
  },
  getById: (id: string) => apiGet<ApiOrder>(`orders/${id}`),
  create: (data: {
    listingId: string;
    itemId?: string;
    sellerId?: string;
    price?: number;
    deliveryPreference: ApiOrder['deliveryPreference'];
    shippingAddress?: ApiShippingAddress;
  }) => apiPost<{ orderId: string; status: string }>('orders', { json: data }),
  cancel: (id: string, data?: { reason?: string }) =>
    apiPost<{ orderId: string; status: string }>(`orders/${id}/cancel`, { json: data }),
};

export type ApiListingStatus = ApiListing['status'];
export type ApiOrderStatus = ApiOrder['status'];

export const wishlistApi = {
  getAll: () => apiGet<{ items: ApiWishlistItem[] }>('wishlist'),
  add: (listingId: string) => apiPost<ApiWishlistItem>(`wishlist/${listingId}`),
  remove: (listingId: string) => apiDelete<{ status: string }>(`wishlist/${listingId}`),
};

export const notificationsApi = {
  getAll: () => apiGet<{ notifications: ApiNotification[] }>('notifications'),
  markRead: (id: string) => apiPatch<{ status: string }>(`notifications/${id}/read`),
};

export const storesApi = {
  getAll: (params?: { tier?: string; search?: string; page?: number; limit?: number }) =>
    apiGet<{ sellers: ApiCollectorProfile[] }>('collectors', { searchParams: params }),
};

export const collectorApi = {
  getProfile: (userId: string) => apiGet<ApiCollectorProfile>(`collectors/${userId}`),
  updateProfile: (data: Partial<ApiCollectorProfile>) =>
    apiPut<ApiCollectorProfile>('collectors/me', { json: data }),
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
  getItems: (params: {
    holderId?: string;
    ownerId?: string;
    userId?: string;
    status?: string;
    category?: string;
    subCategory?: string;
    itemFormat?: string;
    page?: number;
    limit?: number;
  }) => apiGet<{ items: ApiItem[] }>('items', { searchParams: params }),

  getItemById: (id: string) => apiGet<ApiItem>(`items/${id}`),

  registerItem: (data: {
    name: string;
    sku: string;
    category?: string;
    subCategory?: string;
    itemFormat?: string;
    condition?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }) => apiPost<ApiItem>('items', { json: data }),

  deleteItem: (id: string) => apiDelete<void>(`items/${id}`),

  createRedemption: (id: string, data: { shippingAddress: ApiShippingAddress }) =>
    apiPost<{ status: string }>(`items/${id}/redemptions`, { json: data }),

  getRedemptions: () => apiGet<{ redemptions: ApiRedemption[] }>('redemptions'),

  createVaultDelivery: (id: string, data: { shippingAddress: ApiShippingAddress }) =>
    apiPost<{ status: string }>(`items/${id}/vault-deliveries`, { json: data }),

  getVaultDeliveries: () => apiGet<{ deliveries: ApiVaultDelivery[] }>('vault-deliveries'),

  consignToPlatform: (id: string) => apiPost<{ status: string }>(`items/${id}/consign`),
};

export const auditApi = {
  getItemHistory: (itemId: string) =>
    apiGet<{ itemId: string; history: ApiAuditEntry[] }>(`audit/items/${itemId}`),
  getUserHistory: (userId: string) =>
    apiGet<{ userId: string; history: ApiAuditEntry[] }>(`audit/users/${userId}`),
};

export const marketApi = {
  getHistory: (sku: string, period?: string) =>
    apiGet<ApiMarketHistoryResponse>(`market/${sku}/history`, { searchParams: period ? { period } : undefined }),
  getStats: (sku: string) => apiGet<ApiMarketStats>(`market/${sku}/stats`),
};

export const offersApi = {
  getReceived: () => apiGet<{ offers: ApiOffer[] }>('offers/received'),
  getSent: () => apiGet<{ offers: ApiOffer[] }>('offers/sent'),
  create: (data: { listingId: string; sellerId: string; offerPrice: number }) =>
    apiPost<ApiOffer>('offers', { json: data }),
  accept: (offerId: string) => apiPost<ApiOffer>(`offers/${offerId}/accept`),
  decline: (offerId: string) => apiPost<ApiOffer>(`offers/${offerId}/decline`),
};

export const kycApi = {
  getStatus: (userId: string) =>
    apiGet<{ userId: string; status: ApiUser['kycStatus']; submittedAt?: string; reviewedAt?: string }>(`kyc/status/${userId}`),
  submit: (data: { documents: { type: string; s3Key: string }[] }) =>
    apiPost<{ kycId: string; status: ApiUser['kycStatus']; message: string }>('kyc/submit', { json: data }),
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
  getByOrder: (orderId: string) => apiGet<unknown>(`shipments/${orderId}`),
  track: (id: string) => apiGet<{ timeline: unknown[] }>(`shipments/${id}/track`),
};

// ─── Legacy wrappers for swap-app compatibility (mock-only endpoints) ─

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
  getById: (orderId: string) => apiGet<{ order: ApiServiceOrder }>(`service-orders/${orderId}`),
  update: (orderId: string, data: {
    status?: ApiServiceOrder['status'];
    stages?: ApiServiceOrderStage[];
    lotNumber?: string;
    labOrderNumber?: string;
    trackingNumber?: string;
  }) => apiPatch<{ order: ApiServiceOrder }>(`service-orders/${orderId}`, { json: data }),
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
    acceptedGraders?: ApiGradingService[];
    customGraderNote?: string;
    proposedPackages?: ApiProposedPackage[];
    message?: string;
  }) => apiPost<{ application: ApiPartnerApplication }>('partners/applications', { json: data }),
  getApplications: () => apiGet<{ applications: ApiPartnerApplication[] }>('partners/applications'),
  getApplication: (id: string) => apiGet<{ application: ApiPartnerApplication }>(`partners/applications/${id}`),
};

export const checkoutApi = {
  getDefaultAddress: () => apiGet<ApiShippingAddress>('addresses/default'),
};

export { USE_MOCK };
