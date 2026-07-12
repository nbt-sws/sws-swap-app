/**
 * API-aligned types from SWS real backend contract.
 * These mirror the backend contract exposed through the API gateway at /api/v1.
 * UI/presentation types live in src/types/index.ts and are mapped from these at the hook layer.
 */

export type ApiUserTier = 'REGULAR' | 'MEMBER' | 'ADMIN';
export type ApiKycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  tier: ApiUserTier;
  kycStatus: ApiKycStatus;
  avatarUrl?: string;
  currency?: string;
  preferredGrader?: string;
  preferredPreGrader?: string;
  notifications?: {
    push: boolean;
    email: boolean;
    line: boolean;
    sms: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

export type ApiItemStatus =
  | 'AVAILABLE'
  | 'LOCKED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'VAULT_HELD'
  | 'REDEEMING'
  | 'REDEEMED'
  | 'SUSPENDED';

export interface ApiItem {
  id: string;
  name: string;
  sku: string;
  ownerId: string;
  holderId: string;
  status: ApiItemStatus;
  description?: string;
  category?: string;
  subCategory?: string;
  itemFormat?: string;
  condition?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type ApiListingStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'DELISTED';

export interface ApiListing {
  listingId: string;
  itemId: string;
  sellerId: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  status: ApiListingStatus;
  category?: string;
  subCategory?: string;
  itemFormat?: string;
  condition?: string;
  imageUrl?: string;
  sellerDisplayName?: string;
  sellerAvatarUrl?: string;
  sellerBio?: string;
  sellerTier?: string;
  ownerId?: string;
  holderId?: string;
  createdAt: string;
}

export type ApiOrderStatus =
  | 'CREATED'
  | 'ITEM_LOCKED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_CONFIRMED'
  | 'SHIPPING_ARRANGED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ApiDeliveryPreference = 'SHIP' | 'VAULT_STORE';

export interface ApiShippingAddress {
  name: string;
  address: string;
  province: string;
  postalCode: string;
  phone: string;
  district?: string;
}

export interface ApiOrder {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  itemId: string;
  price: number;
  status: ApiOrderStatus;
  deliveryPreference: ApiDeliveryPreference;
  shippingAddress?: ApiShippingAddress;
  lockedAt?: string;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApiOfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';

export interface ApiOffer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  offerPrice: number;
  status: ApiOfferStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiWishlistItem {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  offerPrice?: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiRedemption {
  id: string;
  itemId: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  shippingAddress: ApiShippingAddress;
  trackingNumber?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ApiVaultDelivery {
  id: string;
  itemId: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  shippingAddress: ApiShippingAddress;
  trackingNumber?: string;
  createdAt: string;
}

export interface ApiNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  channel: string;
  eventType: string;
  readAt?: string;
  createdAt: string;
}

export interface ApiMarketStats {
  sku: string;
  lastSold?: number;
  avgPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  count?: number;
  updatedAt?: string;
}

export interface ApiMarketHistoryPoint {
  time: string;
  price: number;
}

export interface ApiMarketHistoryResponse {
  sku: string;
  period?: string;
  trades: ApiMarketHistoryPoint[];
}

export interface ApiAuthResponse {
  token: string;
  user: ApiUser;
}

export interface ApiCollectorProfile {
  userId: string;
  displayName: string;
  bio?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  accentColor?: string;
  isPublic: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  memberSince: string;
  tier: ApiUserTier;
  kycStatus: string;
  stats: {
    totalItems: number;
    listedItems: number;
    soldItems: number;
    followers: number;
    following: number;
  };
}

export type ApiServiceCategory = 'PREGRADE' | 'GRADE';
export type ApiServiceDeliveryMode = 'PHOTO_UPLOAD' | 'PHYSICAL_DROP_OFF' | 'PHYSICAL_SHIP';

export interface ApiServicePackage {
  id: string;
  providerId: string;
  name: string;
  description: string;
  pricePerCard: number;
  currency: string;
  deliveryMode: ApiServiceDeliveryMode;
  turnaround: string;
  includes: string[];
  imageUrl?: string;
  enabled: boolean;
}

export interface ApiServiceFaq {
  q: string;
  a: string;
}

export interface ApiServiceProvider {
  id: string;
  storeId: string;
  storeName: string;
  storeAvatarUrl?: string;
  storeBannerUrl?: string;
  category: ApiServiceCategory;
  serviceTypes: string[];
  description: string;
  deliveryMode: ApiServiceDeliveryMode;
  turnaround: string;
  pricePerCard: number;
  currency: string;
  scoreLabel: string;
  subScores?: { label: string; value: number }[];
  color: 'brand' | 'periwinkle' | 'cyan' | 'pregrade' | 'plup';
  logoUrl?: string;
  enabled: boolean;
  packages: ApiServicePackage[];
  galleryUrls?: string[];
  contactPhone?: string;
  contactEmail?: string;
  contactLine?: string;
  faq?: ApiServiceFaq[];
}

export interface ApiServiceOrder {
  id: string;
  userId: string;
  category: ApiServiceCategory;
  providerId: string;
  providerName: string;
  storeId: string;
  packageId?: string;
  cardIds: string[];
  status: 'PENDING' | 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  currency: string;
  shippingAddress?: ApiShippingAddress;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPartnerApplication {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  serviceCategories: ApiServiceCategory[];
  serviceTypes: string[];
  message?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  storeId?: string;
  storeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiStoreGroup {
  id: string;
  userId: string;
  name: string;
  itemIds: string[];
  sortOrder?: number;
}

export interface ApiStoreReview {
  id: string;
  storeId: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ApiCampaign {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startAt: string;
  endAt: string;
}

export interface ApiAchievement {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface ApiBadge {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface ApiAuditEntry {
  id: string;
  itemId?: string;
  userId?: string;
  eventType: string;
  previousState: unknown;
  newState: unknown;
  actorId: string;
  occurredAt: string;
}

export interface ApiPlatformStats {
  totalListings?: number;
  totalOrders?: number;
  totalUsers?: number;
}
