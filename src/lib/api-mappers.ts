/**
 * Mappers from API-spec types (src/types/api.ts) to UI/presentation types
 * (src/types/index.ts). These are intentionally conservative: when the backend
 * does not yet provide a field, we fill a safe default so the UI can render.
 */

import type {
  ApiUser,
  ApiItem,
  ApiListing,
  ApiOrder,
  ApiOffer,
  ApiWishlistItem,
  ApiNotification,
  ApiCollectorProfile,
  ApiRedemption,
  ApiVaultDelivery,
} from '@/types/api';
import type {
  AuthUser,
} from '@/types/auth';
import type {
  Notification,
  Redemption,
  VaultDelivery,
  Card,
  VaultItem,
  MarketListing,
  Order,
  Offer,
  WishlistItem,
  StoreProfile,
} from '@/types';

export function mapApiUserToAuthUser(apiUser: ApiUser): AuthUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName: apiUser.fullName,
    avatarUrl: apiUser.avatarUrl,
    tier: apiUser.tier,
    kycStatus: apiUser.kycStatus,
    currency: 'THB',
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  };
}

function placeholderCard(overrides: Partial<Card> = {}): Card {
  return {
    id: overrides.id ?? '',
    code: overrides.code ?? '',
    nameEn: overrides.nameEn ?? 'Unknown card',
    nameJp: overrides.nameJp ?? '',
    rarity: overrides.rarity ?? '',
    type: overrides.type ?? '',
    language: overrides.language ?? '',
    game: overrides.game ?? 'one-piece',
    imageUrl: overrides.imageUrl,
    condition: overrides.condition ?? 'Raw',
  };
}

export function mapApiItemToVaultItem(apiItem: ApiItem): VaultItem {
  const inVault = ['VAULT_HELD', 'LISTED', 'AVAILABLE', 'LOCKED'].includes(apiItem.status);
  return {
    id: apiItem.id,
    card: placeholderCard({
      id: apiItem.id,
      code: apiItem.sku,
      nameEn: apiItem.name,
      imageUrl: apiItem.imageUrl,
      condition: (apiItem.condition ?? 'Raw') as Card['condition'],
    }),
    paidPrice: 0,
    currentPrice: 0,
    currency: 'THB',
    dateAcquired: apiItem.createdAt,
    source: apiItem.category,
    condition: apiItem.condition ?? 'Raw',
    status: apiItem.status === 'SOLD' ? 'sold' : inVault ? 'held' : 'held',
    plAmount: 0,
    plPercent: 0,
  };
}

export function mapApiListingToMarketListing(apiListing: ApiListing): MarketListing {
  return {
    id: apiListing.id,
    card: placeholderCard({
      id: apiListing.itemId,
      nameEn: `Item ${apiListing.itemId.slice(0, 6)}`,
      imageUrl: apiListing.images[0],
      condition: apiListing.condition as Card['condition'],
    }),
    price: apiListing.price,
    currency: apiListing.currency,
    listingType: 'SALE',
    shelf: 'RAW',
    seller: {
      id: apiListing.sellerId,
      name: `Seller ${apiListing.sellerId.slice(0, 6)}`,
      rating: 0,
    },
    vaultVerified: false,
    timestamp: apiListing.createdAt,
    status: apiListing.status.toLowerCase() as MarketListing['status'],
    views: 0,
    watchers: 0,
  };
}

export function mapApiOrderToOrder(apiOrder: ApiOrder): Order {
  const statusMap: Record<ApiOrder['status'], Order['status']> = {
    PENDING: 'PENDING_PAYMENT',
    PAID: 'PAID',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  };

  const shipping = apiOrder.deliveryType === 'SHIP' ? 120 : 0;
  const fee = Math.round(apiOrder.price * 0.05);

  return {
    id: apiOrder.id,
    buyerId: apiOrder.buyerId,
    sellerId: apiOrder.sellerId,
    listing: mapApiListingToMarketListing({
      id: apiOrder.listingId,
      itemId: apiOrder.itemId,
      sellerId: apiOrder.sellerId,
      price: apiOrder.price,
      currency: 'THB',
      condition: '',
      images: [],
      status: 'ACTIVE',
      createdAt: apiOrder.createdAt,
    }),
    subtotal: apiOrder.price,
    fee,
    shipping,
    total: apiOrder.price + fee + shipping,
    status: statusMap[apiOrder.status],
    deliveryPreference: apiOrder.deliveryType,
    shippingAddress: apiOrder.shippingAddress
      ? `${apiOrder.shippingAddress.name}, ${apiOrder.shippingAddress.address}${apiOrder.shippingAddress.district ? `, ${apiOrder.shippingAddress.district}` : ''}, ${apiOrder.shippingAddress.province} ${apiOrder.shippingAddress.postalCode} — ${apiOrder.shippingAddress.phone}`
      : undefined,
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.createdAt,
  };
}

export function mapApiOfferToOffer(apiOffer: ApiOffer, currentUserId?: string): Offer {
  const isIncoming = currentUserId ? apiOffer.toUserId === currentUserId : true;
  const listing: MarketListing = mapApiListingToMarketListing({
    id: apiOffer.listingId,
    itemId: '',
    sellerId: isIncoming ? apiOffer.fromUserId : apiOffer.toUserId,
    price: apiOffer.offerPrice,
    currency: 'THB',
    condition: '',
    images: [],
    status: 'ACTIVE',
    createdAt: apiOffer.createdAt,
  });

  return {
    id: apiOffer.id,
    listing,
    offerPrice: apiOffer.offerPrice,
    status: apiOffer.status,
    direction: isIncoming ? 'INCOMING' : 'OUTGOING',
    fromUser: { id: apiOffer.fromUserId, name: `User ${apiOffer.fromUserId.slice(0, 6)}` },
    toUser: { id: apiOffer.toUserId, name: `User ${apiOffer.toUserId.slice(0, 6)}` },
    createdAt: apiOffer.createdAt,
    expiresAt: apiOffer.createdAt,
  };
}

export function mapApiWishlistItemToWishlistItem(
  apiItem: ApiWishlistItem,
  listing?: ApiListing
): WishlistItem {
  return {
    id: apiItem.id,
    listingId: apiItem.listingId,
    cardName: listing ? `Item ${listing.itemId.slice(0, 6)}` : `Listing ${apiItem.listingId.slice(0, 6)}`,
    cardCode: listing?.itemId ?? apiItem.listingId,
    targetPrice: 0,
    currentPrice: listing?.price ?? 0,
    currency: listing?.currency ?? 'THB',
    alertEnabled: false,
    addedAt: apiItem.createdAt,
  };
}

export function mapApiCollectorProfileToStore(apiProfile: ApiCollectorProfile): StoreProfile {
  return {
    id: apiProfile.userId,
    userId: apiProfile.userId,
    name: apiProfile.displayName || `Seller ${apiProfile.userId.slice(0, 6)}`,
    displayName: apiProfile.displayName,
    bio: apiProfile.bio,
    avatarUrl: apiProfile.avatarUrl,
    bannerUrl: apiProfile.bannerUrl,
    location: apiProfile.location,
    rating: apiProfile.rating ?? 0,
    listings: apiProfile.totalListings ?? 0,
    sales: apiProfile.totalSales ?? 0,
    followers: apiProfile.followerCount ?? 0,
    activeListings: apiProfile.totalListings ?? 0,
    socialLinks: apiProfile.socialLinks,
  };
}

export function mapApiNotification(apiNotification: ApiNotification): Notification {
  return {
    id: apiNotification.id,
    type: apiNotification.type,
    title: apiNotification.title,
    body: apiNotification.body,
    read: apiNotification.read,
    createdAt: apiNotification.createdAt,
  };
}

export function mapApiRedemption(apiRedemption: ApiRedemption): Redemption {
  return {
    id: apiRedemption.id,
    itemId: apiRedemption.itemId,
    userId: apiRedemption.userId,
    status: apiRedemption.status,
    shippingAddress: apiRedemption.shippingAddress,
    trackingNumber: apiRedemption.trackingNumber,
    createdAt: apiRedemption.createdAt,
    completedAt: apiRedemption.completedAt,
  };
}

export function mapApiVaultDelivery(apiDelivery: ApiVaultDelivery): VaultDelivery {
  return {
    id: apiDelivery.id,
    itemId: apiDelivery.itemId,
    userId: apiDelivery.userId,
    status: apiDelivery.status,
    shippingAddress: apiDelivery.shippingAddress,
    trackingNumber: apiDelivery.trackingNumber,
    createdAt: apiDelivery.createdAt,
  };
}
