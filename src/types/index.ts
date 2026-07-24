export type CardGame = 'one-piece' | 'yu-gi-oh' | 'pokemon' | 'lorcana' | 'conan' | 'others';

export interface Card {
  id: string;
  code: string;
  nameEn: string;
  nameJp: string;
  rarity: string;
  type: string;
  language: string;
  game: CardGame;
  imageUrl?: string;
  condition: string;
}

export interface VaultItem {
  id: string;
  card: Card;
  ownerId?: string;
  holderId?: string;
  paidPrice: number;
  currentPrice: number;
  currency: string;
  dateAcquired: string;
  source: string;
  condition: string;
  status: 'held' | 'sold' | 'grading';
  itemStatus?: import('./api').ApiItemStatus;
  soldFor?: number;
  plAmount: number;
  plPercent: number;
  serviceOrderId?: string;
  serviceOrderStatus?: string;
  listingId?: string;
  /** Uploaded photos, cover first */
  images?: string[];
}

export type VaultFilter =
  | 'ALL'
  | 'AVAILABLE'
  | 'VAULT_HELD'
  | 'LISTED'
  | 'IN_TRANSIT'
  | 'REDEEMING'
  | 'COMPLETED'
  | 'LOCKED';

export interface MarketListing {
  id: string;
  card: Card;
  price: number;
  currency: string;
  listingType: 'SALE' | 'TRADE';
  shelf: 'RAW' | 'PRE-GRADED' | 'GRADED' | 'SEALED-BOX';
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  vaultVerified: boolean;
  itemId?: string;
  ownerId?: string;
  holderId?: string;
  timestamp: string;
  status?: 'active' | 'paused' | 'sold';
  views?: number;
  watchers?: number;
  isFeatured?: boolean;
}

export interface CreateListingInput {
  card: Card;
  itemId?: string;
  price: number;
  listingType: 'SALE' | 'TRADE';
  shelf: MarketListing['shelf'];
  description?: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface CardPriceData {
  cardId: string;
  highest: number;
  lowest: number;
  trend30d: number;
  current: number;
  history: PricePoint[];
  listings: {
    platform: string;
    price: number;
    url?: string;
    seller?: string;
    ended?: string;
  }[];
  lastSold: {
    platform: string;
    price: number;
    date: string;
  }[];
}

export type GradingService = 'RAWLITY' | 'BLACKLENS' | 'PSA' | 'BGS' | 'CGC' | 'TAG' | 'OTHER';

export interface GradingSubmission {
  id: string;
  orderNumber: string;
  cardName: string;
  cardCode: string;
  service: GradingService;
  status: 'ready' | 'in-lab' | 'grading' | 'qa' | 'shipped' | 'delivered';
  stages: {
    name: string;
    completed: boolean;
    timestamp?: string;
  }[];
  submittedAt: string;
  estimatedDays?: number;
  labOrderNumber?: string;
  consentRequired?: boolean;
}

export type ServiceCategory = 'PREGRADE' | 'GRADE';
export type ServiceDeliveryMode = 'PHOTO_UPLOAD' | 'PHYSICAL_DROP_OFF' | 'PHYSICAL_SHIP';

export interface ServicePackage {
  id: string;
  providerId: string;
  name: string;
  description: string;
  pricePerCard: number;
  currency: string;
  deliveryMode: ServiceDeliveryMode;
  turnaround: string;
  includes: string[];
  imageUrl?: string;
  enabled: boolean;
  grader?: GradingService;
  cutoffDate?: string;
  shippingDate?: string;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceProvider {
  id: string;
  storeId: string;
  storeName: string;
  storeAvatarUrl?: string;
  storeBannerUrl?: string;
  category: ServiceCategory;
  serviceTypes: string[];
  description: string;
  deliveryMode: ServiceDeliveryMode;
  turnaround: string;
  pricePerCard: number;
  currency: string;
  scoreLabel: string;
  subScores?: { label: string; value: number }[];
  color: 'brand' | 'periwinkle' | 'cyan' | 'pregrade' | 'plup';
  logoUrl?: string;
  enabled: boolean;
  packages: ServicePackage[];
  galleryUrls?: string[];
  contactPhone?: string;
  contactEmail?: string;
  contactLine?: string;
  faq?: ServiceFaq[];
  acceptedGraders?: GradingService[];
}

export interface ServiceOrderStage {
  key: string;
  label: string;
  completed: boolean;
  timestamp?: string;
}

export interface ServiceOrder {
  id: string;
  orderNo?: string;
  userId: string;
  category: ServiceCategory;
  providerId: string;
  providerName: string;
  storeId: string;
  packageId?: string;
  packageName?: string;
  grader?: GradingService;
  cardIds: string[];
  status: 'PENDING' | 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  stages: ServiceOrderStage[];
  totalAmount: number;
  currency: string;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  gradeResult?: string;
  customerName?: string;
  lotNumber?: string;
  labOrderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrderInput {
  category: ServiceCategory;
  providerId: string;
  packageId?: string;
  cardIds: string[];
  shippingAddress?: ShippingAddress;
}

export interface ServiceOrderUpdate {
  status?: ServiceOrder['status'];
  stages?: ServiceOrderStage[];
  lotNumber?: string;
  labOrderNumber?: string;
  trackingNumber?: string;
}

export interface ProposedPackage {
  name: string;
  description: string;
  pricePerCard: number;
  currency: string;
  turnaround: string;
  includes: string[];
  grader?: GradingService;
}

export interface PartnerApplication {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  serviceCategories: ServiceCategory[];
  serviceTypes: string[];
  acceptedGraders?: GradingService[];
  customGraderNote?: string;
  proposedPackages?: ProposedPackage[];
  message?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  storeId?: string;
  storeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerApplicationInput {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  serviceCategories: ServiceCategory[];
  serviceTypes: string[];
  acceptedGraders?: GradingService[];
  customGraderNote?: string;
  proposedPackages?: ProposedPackage[];
  message?: string;
}

import type { UserTier, KycStatus } from './auth';
export type { KycStatus } from './auth';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  tier: UserTier;
  kycStatus?: KycStatus;
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

export interface StoreProfile {
  id: string;
  userId: string;
  name: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  rating: number;
  listings: number;
  sales: number;
  followers: number;
  activeListings?: number;
  socialLinks?: { platform: string; url: string }[];
  createdAt?: string;
}

export interface StoreGroup {
  id: string;
  name: string;
  cardCodes: string[];
}

export interface StoreReview {
  id: string;
  storeId: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  listingId: string;
  cardName: string;
  cardCode: string;
  imageUrl?: string;
  game?: CardGame;
  targetPrice: number;
  currentPrice: number;
  currency: string;
  alertEnabled: boolean;
  addedAt?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  district?: string;
  province: string;
  postalCode: string;
  phone: string;
}

export interface Redemption {
  id: string;
  itemId: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  createdAt: string;
  completedAt?: string;
}

export interface VaultDelivery {
  id: string;
  itemId: string;
  userId: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  createdAt: string;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  listing: MarketListing;
  itemId?: string;
  subtotal: number;
  fee: number;
  shipping: number;
  platformFee?: number;
  sellerPayout?: number;
  total: number;
  status: OrderStatus;
  /** Raw backend status (drives the status-flow actions; `status` is display-only) */
  rawStatus?: import('./api').ApiOrderStatus;
  deliveryPreference: 'SHIP' | 'VAULT_STORE';
  shippingAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COUNTERED';

export interface OfferUser {
  id: string;
  name: string;
}

export interface TradeCard {
  code: string;
  nameEn: string;
  condition: string;
  game: Card['game'];
}

export interface Offer {
  id: string;
  listing: MarketListing;
  offerPrice: number;
  tradeCards?: TradeCard[];
  status: OfferStatus;
  direction: 'INCOMING' | 'OUTGOING';
  fromUser: OfferUser;
  toUser: OfferUser;
  createdAt: string;
  expiresAt: string;
}

export interface DeliveryOption {
  id: 'SHIP' | 'VAULT_STORE';
  label: string;
  description: string;
  icon: string;
}

export type Screen = 
  | 'splash' 
  | 'signin' 
  | 'home' 
  | 'picker' 
  | 'scanner' 
  | 'extract' 
  | 'pricing' 
  | 'addToVault' 
  | 'vault' 
  | 'cardDetail' 
  | 'market' 
  | 'services' 
  | 'settings' 
  | 'pregradeOrder' 
  | 'statusHub' 
  | 'ratings' 
  | 'userPanel';

export type Tab = 'home' | 'market' | 'vault' | 'settings';

export interface AuditRecord {
  id: string;
  eventType: string;
  actorId: string;
  occurredAt: string;
  previousState?: unknown;
  newState?: unknown;
}
