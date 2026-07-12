/**
 * API-aligned types from SWS Architecture API_SPEC.md.
 * These mirror the backend contract. UI/presentation types live in
 * src/types/index.ts and are mapped from these at the hook layer.
 */

export type ApiUserTier = 'REGULAR' | 'MEMBER' | 'ADMIN';
export type ApiKycStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
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
  createdAt: string;
  updatedAt: string;
}

export type ApiItemStatus =
  | 'AVAILABLE'
  | 'LOCKED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'VAULT_HELD'
  | 'REDEEMING'
  | 'REDEEMED'
  | 'SUSPENDED'
  | 'LISTED'
  | 'SOLD';

export interface ApiItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  subCategory?: string;
  itemFormat?: string;
  condition?: string;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  holderId: string;
  status: ApiItemStatus;
  createdAt: string;
  updatedAt: string;
}

export type ApiListingStatus = 'ACTIVE' | 'SOLD' | 'CANCELLED';

export interface ApiListing {
  id: string;
  itemId: string;
  sellerId: string;
  price: number;
  currency: string;
  condition: string;
  images: string[];
  status: ApiListingStatus;
  createdAt: string;
}

export type ApiOrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type ApiDeliveryType = 'SHIP' | 'VAULT_STORE';

export interface ApiOrder {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  itemId: string;
  price: number;
  deliveryType: ApiDeliveryType;
  status: ApiOrderStatus;
  shippingAddress?: ApiShippingAddress;
  createdAt: string;
}

export interface ApiOffer {
  id: string;
  listingId: string;
  offerPrice: number;
  fromUserId: string;
  toUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  createdAt: string;
}

export interface ApiWishlistItem {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface ApiShippingAddress {
  name: string;
  phone: string;
  address: string;
  district?: string;
  province: string;
  postalCode: string;
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
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ApiMarketStats {
  lastSold?: number;
  average?: number;
  min?: number;
  max?: number;
  count?: number;
}

export interface ApiMarketHistoryPoint {
  date: string;
  price: number;
}

export interface ApiAuthResponse {
  token: string;
  user: ApiUser;
}

export interface ApiCollectorProfile {
  userId: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  rating?: number;
  totalSales?: number;
  totalListings?: number;
  followerCount?: number;
  socialLinks?: { platform: string; url: string }[];
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
