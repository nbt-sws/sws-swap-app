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
import { SWS_PLATFORM_USER_UUID } from '@/lib/utils';
import type { AuthUser } from '@/types/auth';
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
    fullName: apiUser.name,
    avatarUrl: apiUser.avatarUrl,
    tier: apiUser.tier,
    role: apiUser.tier,
    kycStatus: apiUser.kycStatus,
    currency: apiUser.currency || 'THB',
    preferredGrader: apiUser.preferredGrader,
    preferredPreGrader: apiUser.preferredPreGrader,
    notifications: apiUser.notifications,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  };
}

export function placeholderCard(overrides: Partial<Card> = {}): Card {
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

function mapApiHolderId(holderId?: string): string | undefined {
  if (!holderId) return holderId;
  return holderId === SWS_PLATFORM_USER_UUID ? 'sws-platform' : holderId;
}

function mapApiOwnerId(ownerId?: string): string | undefined {
  if (!ownerId) return ownerId;
  return ownerId === SWS_PLATFORM_USER_UUID ? 'sws-platform' : ownerId;
}

export function mapApiItemToVaultItem(apiItem: ApiItem): VaultItem {
  const inVault = ['VAULT_HELD', 'AVAILABLE', 'LOCKED', 'LISTING', 'IN_TRANSIT', 'REDEEMING', 'SUSPENDED'].includes(apiItem.status);
  const metadata = apiItem.metadata ?? {};
  const paidPrice = typeof metadata.paidPrice === 'number' ? metadata.paidPrice : 0;
  const dateAcquired = typeof metadata.dateAcquired === 'string' ? metadata.dateAcquired : apiItem.createdAt;
  const source = typeof metadata.source === 'string' ? metadata.source : (apiItem.category ?? '');
  return {
    id: apiItem.id,
    card: placeholderCard({
      id: apiItem.card?.id ?? apiItem.id,
      code: apiItem.sku,
      nameEn: apiItem.name,
      nameJp: apiItem.card?.nameJp ?? '',
      rarity: apiItem.card?.rarity ?? apiItem.subCategory ?? '',
      type: apiItem.card?.type ?? '',
      language: apiItem.itemFormat ?? apiItem.card?.language ?? '',
      game: (apiItem.card?.game ?? apiItem.category ?? 'one-piece') as Card['game'],
      imageUrl: apiItem.imageUrl,
      condition: (apiItem.condition ?? 'Raw') as Card['condition'],
    }),
    ownerId: mapApiOwnerId(apiItem.ownerId),
    holderId: mapApiHolderId(apiItem.holderId),
    paidPrice,
    currentPrice: 0,
    currency: 'THB',
    dateAcquired,
    source,
    condition: apiItem.condition ?? 'Raw',
    status: apiItem.status === 'DELIVERED' || apiItem.status === 'REDEEMED' ? 'sold' : inVault ? 'held' : 'held',
    itemStatus: apiItem.status,
    plAmount: 0,
    plPercent: 0,
    images: Array.isArray(metadata.images) ? (metadata.images as string[]) : [],
  };
}

export function mapApiListingToMarketListing(apiListing: ApiListing): MarketListing {
  return {
    id: apiListing.listingId,
    card: placeholderCard({
      id: apiListing.itemId,
      // Never fall back to the raw itemId here — the market UI must not show it.
      // itemId is exposed separately on MarketListing.itemId for the detail page.
      code: apiListing.cardCode ?? '',
      nameEn: apiListing.cardNameEn ?? apiListing.title,
      nameJp: apiListing.cardNameJp ?? '',
      rarity: apiListing.rarity ?? '',
      type: apiListing.cardType ?? '',
      language: apiListing.language ?? '',
      game: (apiListing.game ?? 'one-piece') as Card['game'],
      imageUrl: apiListing.cardImageUrl ?? apiListing.imageUrl,
      condition: (apiListing.cardCondition ?? apiListing.condition ?? 'Raw') as Card['condition'],
    }),
    price: apiListing.price,
    currency: apiListing.currency,
    listingType: (apiListing.itemFormat === 'TRADE' ? 'TRADE' : 'SALE') as MarketListing['listingType'],
    shelf: (apiListing.category ?? 'RAW') as MarketListing['shelf'],
    seller: {
      id: apiListing.sellerId,
      name: apiListing.sellerDisplayName || `Seller ${apiListing.sellerId.slice(0, 6)}`,
      rating: 0,
    },
    vaultVerified: !!apiListing.holderId && apiListing.holderId !== apiListing.ownerId,
    itemId: apiListing.itemId,
    ownerId: apiListing.ownerId,
    holderId: mapApiHolderId(apiListing.holderId),
    timestamp: apiListing.createdAt,
    status: apiListing.status.toLowerCase() as MarketListing['status'],
    views: 0,
    watchers: 0,
  };
}

export function mapApiOrderToOrder(apiOrder: ApiOrder): Order {
  const statusMap: Record<ApiOrder['status'], Order['status']> = {
    CREATED: 'PENDING_PAYMENT',
    ITEM_LOCKED: 'PENDING_PAYMENT',
    PAYMENT_PENDING: 'PENDING_PAYMENT',
    PAYMENT_CONFIRMED: 'PAID',
    SHIPPING_ARRANGED: 'SHIPPED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  };

  const shipping = apiOrder.deliveryPreference === 'SHIP' ? 120 : 0;
  const fee = Math.round(apiOrder.price * 0.05);

  return {
    id: apiOrder.id,
    buyerId: apiOrder.buyerId,
    sellerId: apiOrder.sellerId,
    listing: mapApiListingToMarketListing({
      listingId: apiOrder.listingId,
      itemId: apiOrder.itemId,
      sellerId: apiOrder.sellerId,
      title: 'Unknown item',
      price: apiOrder.price,
      currency: 'THB',
      status: 'ACTIVE',
      createdAt: apiOrder.createdAt,
    }),
    subtotal: apiOrder.price,
    fee,
    shipping,
    total: apiOrder.price + fee + shipping,
    status: statusMap[apiOrder.status],
    deliveryPreference: apiOrder.deliveryPreference,
    shippingAddress: apiOrder.shippingAddress
      ? `${apiOrder.shippingAddress.name}, ${apiOrder.shippingAddress.address}${apiOrder.shippingAddress.district ? `, ${apiOrder.shippingAddress.district}` : ''}, ${apiOrder.shippingAddress.province} ${apiOrder.shippingAddress.postalCode} — ${apiOrder.shippingAddress.phone}`
      : undefined,
    createdAt: apiOrder.createdAt,
    updatedAt: apiOrder.updatedAt,
  };
}

export function mapApiOfferToOffer(apiOffer: ApiOffer, currentUserId?: string): Offer {
  const isIncoming = currentUserId ? apiOffer.sellerId === currentUserId : true;
  const listing: MarketListing = mapApiListingToMarketListing({
    listingId: apiOffer.listingId,
    itemId: '',
    sellerId: apiOffer.sellerId,
    title: apiOffer.listing?.title ?? 'Unknown item',
    price: apiOffer.listing?.price ?? apiOffer.offerPrice,
    currency: apiOffer.listing?.currency ?? 'THB',
    status: 'ACTIVE',
    createdAt: apiOffer.createdAt,
    imageUrl: apiOffer.listing?.imageUrl,
  });

  return {
    id: apiOffer.id,
    listing,
    offerPrice: apiOffer.offerPrice,
    status: apiOffer.status === 'CANCELLED' || apiOffer.status === 'EXPIRED'
      ? 'DECLINED'
      : (apiOffer.status as Offer['status']),
    direction: isIncoming ? 'INCOMING' : 'OUTGOING',
    fromUser: { id: apiOffer.buyerId, name: apiOffer.buyerName ?? `User ${apiOffer.buyerId.slice(0, 6)}` },
    toUser: { id: apiOffer.sellerId, name: apiOffer.sellerName ?? `User ${apiOffer.sellerId.slice(0, 6)}` },
    createdAt: apiOffer.createdAt,
    expiresAt: apiOffer.expiresAt,
  };
}

export function mapApiWishlistItemToWishlistItem(
  apiItem: ApiWishlistItem,
  listing?: ApiListing
): WishlistItem {
  return {
    id: apiItem.id,
    listingId: apiItem.listingId,
    cardName: listing ? listing.title : `Listing ${apiItem.listingId.slice(0, 6)}`,
    cardCode: listing?.itemId ?? apiItem.listingId,
    game: 'one-piece',
    targetPrice: apiItem.offerPrice ?? 0,
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
    location: apiProfile.address
      ? [
          apiProfile.address.street,
          [apiProfile.address.city, apiProfile.address.state].filter(Boolean).join(', '),
          [apiProfile.address.country, apiProfile.address.postalCode].filter(Boolean).join(' '),
        ]
          .filter(Boolean)
          .join(', ')
      : undefined,
    rating: 0,
    listings: apiProfile.stats?.listedItems ?? 0,
    sales: apiProfile.stats?.soldItems ?? 0,
    followers: apiProfile.stats?.followers ?? 0,
    activeListings: apiProfile.stats?.listedItems ?? 0,
    socialLinks: apiProfile.socialLinks
      ? Object.entries(apiProfile.socialLinks)
          .filter(([, url]) => url)
          .map(([platform, url]) => ({ platform, url: url as string }))
      : undefined,
    createdAt: apiProfile.memberSince,
  };
}

export function mapApiNotification(apiNotification: ApiNotification): Notification {
  return {
    id: apiNotification.id,
    type: apiNotification.eventType,
    title: apiNotification.title,
    body: apiNotification.body,
    read: !!apiNotification.readAt,
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
