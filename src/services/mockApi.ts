import type { VaultItem, MarketListing, CardPriceData, GradingSubmission, WishlistItem, Order, Offer, OfferUser, ShippingAddress, CreateListingInput, TradeCard, Notification, Redemption, VaultDelivery, StoreProfile, StoreGroup, StoreReview, ServiceProvider, ServicePackage, ServiceOrder, PartnerApplication, PartnerApplicationInput, ServiceOrderInput, GradingService } from '@/types';
import type { AuthUser } from '@/types/auth';
import { getPackagePlaceholderUrl } from '@/lib/utils';
import { GRADER_IMAGE_URLS } from '@/lib/graderAssets';

const API_BASE = 'https://api.swibswap.app/v1';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fallback data
const FALLBACK_VAULT: VaultItem[] = [
  {
    id: 'v1',
    card: { id: 'c1', code: 'OP02-013', nameEn: 'Portgas D. Ace', nameJp: 'ポートガス・D・エース', rarity: 'SR', type: 'Character', language: 'JP', game: 'one-piece', condition: 'Raw' },
    paidPrice: 12500, currentPrice: 18440, currency: 'THB', dateAcquired: '2026-03-12', source: 'Yahoo! JP auction · via proxy',
    condition: 'Raw', status: 'held', plAmount: 5940, plPercent: 47.5,
  },
  {
    id: 'v2',
    card: { id: 'c2', code: 'QCAC-JP001', nameEn: 'Blue-Eyes White Dragon', nameJp: '青眼の白龍', rarity: 'QCSR', type: 'Monster', language: 'JP', game: 'yu-gi-oh', condition: 'Raw' },
    paidPrice: 8800, currentPrice: 9850, currency: 'THB', dateAcquired: '2026-01-20', source: 'Local shop · Bangkok',
    condition: 'Raw', status: 'held', plAmount: 1050, plPercent: 11.9,
  },
  {
    id: 'v3',
    card: { id: 'c3', code: 'OP01-025', nameEn: 'Nami (Alt Art)', nameJp: 'ナミ（パラレル）', rarity: 'SR', type: 'Character', language: 'EN', game: 'one-piece', condition: 'Raw' },
    paidPrice: 5200, currentPrice: 4120, currency: 'THB', dateAcquired: '2025-11-05', source: 'Trade · @kaido99',
    condition: 'Raw', status: 'held', plAmount: -1080, plPercent: -20.8,
  },
  {
    id: 'v4',
    card: { id: 'c4', code: 'OP01-001', nameEn: 'Roronoa Zoro', nameJp: 'ロロノア・ゾロ', rarity: 'L', type: 'Leader', language: 'JP', game: 'one-piece', condition: 'PSA 10' },
    paidPrice: 4500, currentPrice: 6900, currency: 'THB', dateAcquired: '2026-02-14', source: 'eBay · JP seller',
    condition: 'PSA 10', status: 'held', plAmount: 2400, plPercent: 53.3,
  },
  {
    id: 'v5',
    card: { id: 'c5', code: 'OP05-060', nameEn: 'Monkey D. Luffy G5', nameJp: 'モンキー・D・ルフィ ギア5', rarity: 'SEC', type: 'Character', language: 'JP', game: 'one-piece', condition: 'RAWLITY 9' },
    paidPrice: 28000, currentPrice: 32000, currency: 'THB', dateAcquired: '2026-04-01', source: 'SwibSwap Market · @shanks_rt',
    condition: 'RAWLITY 9', status: 'held', plAmount: 4000, plPercent: 14.3,
  },
  {
    id: 'v6',
    card: { id: 'c6', code: 'OP01-120', nameEn: 'Shanks (Alt)', nameJp: 'シャンクス（パラレル）', rarity: 'SR', type: 'Character', language: 'JP', game: 'one-piece', condition: 'Raw' },
    paidPrice: 15000, currentPrice: 0, currency: 'THB', dateAcquired: '2025-08-20', source: 'Yahoo! JP auction',
    condition: 'Raw', status: 'sold', soldFor: 16900, plAmount: 1900, plPercent: 12.7,
  },
];

const FALLBACK_MARKET: MarketListing[] = [
  {
    id: 'm1',
    card: { id: 'c5', code: 'OP05-060', nameEn: 'Monkey D. Luffy G5', nameJp: 'モンキー・D・ルフィ ギア5', rarity: 'SEC', type: 'Character', language: 'JP', game: 'one-piece', condition: 'RAWLITY 9' },
    price: 32000, currency: 'THB', listingType: 'SALE', shelf: 'PRE-GRADED',
    seller: { id: 's1', name: 'kaido99', rating: 4.9 }, vaultVerified: true, timestamp: '2h ago', status: 'active', views: 128, watchers: 4, isFeatured: true,
  },
  {
    id: 'm2',
    card: { id: 'c7', code: 'RD/KP16-JP000', nameEn: 'Winged Kuriboh', nameJp: 'ハネクリボー', rarity: 'UR', type: 'Monster', language: 'JP', game: 'yu-gi-oh', condition: 'Raw' },
    price: 8400, currency: 'THB', listingType: 'TRADE', shelf: 'RAW',
    seller: { id: 's2', name: 'duelist_bkk', rating: 4.7 }, vaultVerified: true, timestamp: '5h ago', status: 'active', views: 67, watchers: 2,
  },
  {
    id: 'm3',
    card: { id: 'c8', code: 'OP03-070', nameEn: 'Charlotte Katakuri', nameJp: 'シャーロット・カタクリ', rarity: 'SR', type: 'Character', language: 'JP', game: 'one-piece', condition: 'PSA 10' },
    price: 5900, currency: 'THB', listingType: 'SALE', shelf: 'GRADED',
    seller: { id: 's3', name: 'nami_swan', rating: 5.0 }, vaultVerified: true, timestamp: '1d ago', status: 'active', views: 215, watchers: 8, isFeatured: true,
  },
  {
    id: 'm4',
    card: { id: 'c9', code: 'OP-05 BOX', nameEn: 'Awakening Booster Box', nameJp: '覚醒の鼓動', rarity: 'BOX', type: 'Sealed', language: 'JP', game: 'one-piece', condition: 'Raw' },
    price: 3200, currency: 'THB', listingType: 'SALE', shelf: 'SEALED-BOX',
    seller: { id: 's4', name: 'yugi_tha', rating: 4.8 }, vaultVerified: true, timestamp: '3d ago', status: 'sold', views: 340, watchers: 12,
  },
];

const MY_LISTINGS: MarketListing[] = [
  {
    id: 'my1',
    card: { id: 'c10', code: 'OP02-013', nameEn: 'Portgas D. Ace', nameJp: 'ポートガス・D・エース', rarity: 'SR', type: 'Character', language: 'JP', game: 'one-piece', condition: 'Raw' },
    price: 18500, currency: 'THB', listingType: 'SALE', shelf: 'RAW',
    seller: { id: 'u1', name: 'BoBoBoA', rating: 4.9 }, vaultVerified: true, timestamp: '1h ago', status: 'active', views: 42, watchers: 1, isFeatured: true,
  },
  {
    id: 'my2',
    card: { id: 'c11', code: 'QCAC-JP001', nameEn: 'Blue-Eyes White Dragon', nameJp: '青眼の白龍', rarity: 'QCSR', type: 'Monster', language: 'JP', game: 'yu-gi-oh', condition: 'Raw' },
    price: 0, currency: 'THB', listingType: 'TRADE', shelf: 'RAW',
    seller: { id: 'u1', name: 'BoBoBoA', rating: 4.9 }, vaultVerified: true, timestamp: '2d ago', status: 'active', views: 18, watchers: 0,
  },
  {
    id: 'my3',
    card: { id: 'c12', code: 'OP01-001', nameEn: 'Roronoa Zoro', nameJp: 'ロロノア・ゾロ', rarity: 'L', type: 'Leader', language: 'JP', game: 'one-piece', condition: 'PSA 10' },
    price: 7000, currency: 'THB', listingType: 'SALE', shelf: 'GRADED',
    seller: { id: 'u1', name: 'BoBoBoA', rating: 4.9 }, vaultVerified: true, timestamp: '1w ago', status: 'paused', views: 89, watchers: 3, isFeatured: true,
  },
];

const FALLBACK_PRICE_DATA: Record<string, CardPriceData> = {
  'OP02-013': {
    cardId: 'c1', highest: 27033, lowest: 8435, trend30d: 8.2, current: 18440,
    history: [
      { date: '2026-01', price: 14200 }, { date: '2026-02', price: 15800 },
      { date: '2026-03', price: 15100 }, { date: '2026-04', price: 16200 },
      { date: '2026-05', price: 17500 }, { date: '2026-06', price: 17000 },
      { date: '2026-07', price: 18440 },
    ],
    listings: [
      { platform: 'eBay', price: 19200, seller: 'JP seller' },
      { platform: 'Yahoo! JP', price: 17800, ended: '2d ago' },
    ],
    lastSold: [
      { platform: 'eBay', price: 18500, date: '2026-07-01' },
      { platform: 'Yahoo! JP', price: 17200, date: '2026-06-28' },
    ],
  },
};

const FALLBACK_SUBMISSIONS: GradingSubmission[] = [
  {
    id: 's1', orderNumber: 'SWS-PG-004217', cardName: 'Portgas D. Ace', cardCode: 'OP02-013',
    service: 'RAWLITY', status: 'ready',
    stages: [
      { name: 'Received', completed: true, timestamp: '2026-07-01' },
      { name: 'In Lab', completed: true, timestamp: '2026-07-02' },
      { name: 'Scoring', completed: true, timestamp: '2026-07-04' },
      { name: 'Report Ready', completed: true, timestamp: '2026-07-05' },
    ],
    submittedAt: '2026-07-01', consentRequired: true,
  },
  {
    id: 's2', orderNumber: 'SWS-PSA-78912345', cardName: 'Blue-Eyes White Dragon', cardCode: 'QCAC-JP001',
    service: 'PSA', status: 'grading',
    stages: [
      { name: 'Received', completed: true, timestamp: '2026-06-20' },
      { name: 'Research/ID', completed: true, timestamp: '2026-06-22' },
      { name: 'Grading', completed: true, timestamp: '2026-06-28' },
      { name: 'QA', completed: false },
      { name: 'Ship', completed: false },
    ],
    submittedAt: '2026-06-20', estimatedDays: 12, labOrderNumber: '78912345',
  },
  {
    id: 's3', orderNumber: 'SWS-BL-004218', cardName: 'Nami (Alt Art)', cardCode: 'OP01-025',
    service: 'BLACKLENS', status: 'ready',
    stages: [
      { name: 'Uploaded', completed: true, timestamp: '2026-07-05' },
      { name: 'AI Analysis', completed: true, timestamp: '2026-07-05' },
      { name: 'Human Review', completed: true, timestamp: '2026-07-06' },
      { name: 'Report Ready', completed: true, timestamp: '2026-07-06' },
    ],
    submittedAt: '2026-07-05', estimatedDays: 1,
  },
  {
    id: 's4', orderNumber: 'SWS-PSA-78909771', cardName: 'Roronoa Zoro', cardCode: 'OP01-001',
    service: 'PSA', status: 'delivered',
    stages: [
      { name: 'Received', completed: true, timestamp: '2026-05-10' },
      { name: 'Research/ID', completed: true, timestamp: '2026-05-12' },
      { name: 'Grading', completed: true, timestamp: '2026-05-18' },
      { name: 'QA', completed: true, timestamp: '2026-05-20' },
      { name: 'Ship', completed: true, timestamp: '2026-05-22' },
    ],
    submittedAt: '2026-05-10', labOrderNumber: '78909771',
  },
];

const FALLBACK_SERVICE_ORDERS: ServiceOrder[] = [];
const PARTNER_APPLICATIONS: PartnerApplication[] = [];

function loadServiceOrders(): ServiceOrder[] {
  if (typeof window === 'undefined') return FALLBACK_SERVICE_ORDERS;
  try {
    const raw = localStorage.getItem('sws_service_orders');
    if (!raw) return FALLBACK_SERVICE_ORDERS;
    return JSON.parse(raw) as ServiceOrder[];
  } catch {
    return FALLBACK_SERVICE_ORDERS;
  }
}

function saveServiceOrders(orders: ServiceOrder[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sws_service_orders', JSON.stringify(orders));
}

function loadPartnerApplications(): PartnerApplication[] {
  if (typeof window === 'undefined') return PARTNER_APPLICATIONS;
  try {
    const raw = localStorage.getItem('sws_partner_applications');
    if (!raw) return PARTNER_APPLICATIONS;
    return JSON.parse(raw) as PartnerApplication[];
  } catch {
    return PARTNER_APPLICATIONS;
  }
}

function savePartnerApplications(apps: PartnerApplication[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sws_partner_applications', JSON.stringify(apps));
}

const FALLBACK_USER: AuthUser = {
  id: 'u1', fullName: 'BoBoBoA', email: 'boboboa@email.com', avatarUrl: undefined,
  currency: 'THB', tier: 'MEMBER', kycStatus: 'APPROVED',
  preferredGrader: 'PSA', preferredPreGrader: 'RAWLITY',
  notifications: { push: true, email: true, line: true, sms: false },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-07-10T00:00:00Z',
};

const FALLBACK_STORE_PROFILES: StoreProfile[] = [
  {
    id: 'u1', userId: 'u1', name: 'BoBoBoA', displayName: 'BoBoBoA',
    bio: 'Thai collector focused on OP-01 chase cards and PSA 10 leaders. Always open to trades.',
    avatarUrl: undefined,
    bannerUrl: undefined,
    location: 'Bangkok, Thailand',
    rating: 4.9, listings: 3, sales: 12, followers: 45,
  },
  {
    id: 's1', userId: 's1', name: 'kaido99', displayName: 'kaido99',
    bio: 'Specializing in high-end One Piece alt arts and RAWLITY pre-grades.',
    avatarUrl: undefined,
    bannerUrl: undefined,
    location: 'Bangkok, Thailand',
    rating: 4.9, listings: 8, sales: 34, followers: 128,
  },
  {
    id: 's2', userId: 's2', name: 'duelist_bkk', displayName: 'duelist_bkk',
    bio: 'Yu-Gi-Oh! collector and tournament player. Trade-friendly.',
    avatarUrl: undefined,
    bannerUrl: undefined,
    location: 'Bangkok, Thailand',
    rating: 4.7, listings: 5, sales: 9, followers: 67,
  },
  {
    id: 's3', userId: 's3', name: 'nami_swan', displayName: 'nami_swan',
    bio: 'Sealed boxes + graded slabs. Shipping nationwide.',
    avatarUrl: undefined,
    bannerUrl: undefined,
    location: 'Chiang Mai, Thailand',
    rating: 5.0, listings: 12, sales: 56, followers: 203,
  },
  {
    id: 's4', userId: 's4', name: 'yugi_tha', displayName: 'yugi_tha',
    bio: 'Vintage YGO and OP singles.',
    avatarUrl: undefined,
    bannerUrl: undefined,
    location: 'Bangkok, Thailand',
    rating: 4.8, listings: 6, sales: 21, followers: 89,
  },
];

const FALLBACK_STORE_GROUPS: Record<string, StoreGroup[]> = {
  u1: [
    { id: 'g1', name: 'Manga', cardCodes: ['OP02-013', 'OP01-025'] },
    { id: 'g2', name: 'Hits', cardCodes: ['OP01-001', 'OP05-060'] },
  ],
};

const FALLBACK_STORE_REVIEWS: StoreReview[] = [
  {
    id: 'r1',
    storeId: 's1',
    reviewerName: 'tony_collector',
    rating: 5,
    comment: 'kaido99 pre-graded my Luffy chase card same day. Super professional and the report was detailed.',
    createdAt: '2026-07-08T10:00:00Z',
  },
  {
    id: 'r2',
    storeId: 's1',
    reviewerName: 'yugi_king',
    rating: 5,
    comment: 'Sent a batch of PSA through their grading service. Everything arrived back safely and was updated in my vault.',
    createdAt: '2026-06-22T14:30:00Z',
  },
  {
    id: 'r3',
    storeId: 's3',
    reviewerName: 'op_hunter',
    rating: 4,
    comment: 'Great slabs and fast shipping. Packaging could be a bit more premium but cards were perfect.',
    createdAt: '2026-07-01T09:15:00Z',
  },
  {
    id: 'r4',
    storeId: 'u1',
    reviewerName: 'newbie_collector',
    rating: 5,
    comment: 'Photo pre-grade report helped me decide whether to send my card for grading. Saved me money!',
    createdAt: '2026-07-05T16:45:00Z',
  },
];

function storeProvider(
  store: StoreProfile,
  category: ServiceProvider['category'],
  overrides: Partial<Omit<ServiceProvider, 'storeId' | 'storeName' | 'category'>>
): ServiceProvider {
  return {
    id: `${store.id}-${category.toLowerCase()}`,
    storeId: store.id,
    storeName: store.displayName || store.name,
    storeAvatarUrl: store.avatarUrl,
    storeBannerUrl: store.bannerUrl,
    category,
    serviceTypes: [],
    description: '',
    deliveryMode: 'PHYSICAL_SHIP',
    turnaround: '',
    pricePerCard: 0,
    currency: 'THB',
    scoreLabel: category === 'PREGRADE' ? 'Pre-grade score' : 'Grade',
    color: 'brand',
    enabled: true,
    packages: [],
    galleryUrls: [],
    ...overrides,
  };
}

const FALLBACK_SERVICE_PROVIDERS: ServiceProvider[] = [
  storeProvider(FALLBACK_STORE_PROFILES[1], 'PREGRADE', {
    serviceTypes: ['Physical pre-grade', 'AI surface scan', 'Human review'],
    description:
      'Welcome to kaido99 Pre-grade. Bring your raw One Piece / Yu-Gi-Oh! cards to our Bangkok shop for a full condition report and pre-grade score. Same-day service available for walk-ins.',
    deliveryMode: 'PHYSICAL_DROP_OFF',
    turnaround: 'Same day – 3 days',
    pricePerCard: 300,
    scoreLabel: '9.5',
    color: 'brand',
    contactPhone: '+66 81 234 5678',
    contactLine: '@kaido99',
    galleryUrls: [
      'https://picsum.photos/seed/kaido99pg1/400/300',
      'https://picsum.photos/seed/kaido99pg2/400/300',
      'https://picsum.photos/seed/kaido99pg3/400/300',
    ],
    faq: [
      { q: 'Do I need an appointment?', a: 'Walk-ins are welcome on weekdays 12:00–20:00.' },
      { q: 'Which cards can be pre-graded?', a: 'We accept TCG cards in raw condition only.' },
    ],
    packages: [
      {
        id: 'kaido99-pg-standard',
        providerId: 's1-pregrade',
        name: 'Standard Pre-grade',
        description: 'Full surface, edge, corner and centering check with a digital report.',
        deliveryMode: 'PHYSICAL_DROP_OFF',
        turnaround: '3 days',
        pricePerCard: 300,
        currency: 'THB',
        includes: ['Physical inspection', 'Digital report', 'Pre-grade score'],
        imageUrl: getPackagePlaceholderUrl('kaido99-pg-standard'),
        enabled: true,
      },
      {
        id: 'kaido99-pg-express',
        providerId: 's1-pregrade',
        name: 'Express Same-day',
        description: 'Skip the queue and get your pre-grade score within 2 hours.',
        deliveryMode: 'PHYSICAL_DROP_OFF',
        turnaround: 'Same day',
        pricePerCard: 500,
        currency: 'THB',
        includes: ['Priority queue', 'Physical inspection', 'Digital report', 'Pre-grade score'],
        imageUrl: getPackagePlaceholderUrl('kaido99-pg-express'),
        enabled: true,
      },
    ],
  }),
  storeProvider(FALLBACK_STORE_PROFILES[1], 'GRADE', {
    serviceTypes: ['PSA', 'BGS', 'TAG'],
    acceptedGraders: ['PSA', 'BGS', 'TAG'],
    description:
      'kaido99 Grading is an authorized PSA dealer and group submitter for BGS & TAG. We inspect, prep, submit and return slabs with full tracking inside your SWS vault.',
    deliveryMode: 'PHYSICAL_SHIP',
    turnaround: '2–10 weeks',
    pricePerCard: 630,
    scoreLabel: '10',
    color: 'cyan',
    contactPhone: '+66 81 234 5678',
    contactLine: '@kaido99',
    galleryUrls: [
      'https://picsum.photos/seed/kaido99g1/400/300',
      'https://picsum.photos/seed/kaido99g2/400/300',
    ],
    faq: [
      { q: 'Which graders do you accept?', a: 'PSA, BGS and TAG.' },
      { q: 'Is shipping insured?', a: 'Yes, both domestic and international legs are insured.' },
      { q: 'Are prices per card?', a: 'Yes. Prices include our handling fee; PSA/BGS/TAG grading fees and return shipping are covered.' },
    ],
    packages: [
      {
        id: 'kaido99-grade-psa-regular',
        providerId: 's1-grade',
        grader: 'PSA',
        name: 'PSA Regular',
        description: 'PSA Regular service. Best for standard-value cards.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '25–40 business days',
        pricePerCard: 2800,
        currency: 'THB',
        includes: ['Inspection & prep', 'PSA Regular submission', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-psa-regular'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-psa-express',
        providerId: 's1-grade',
        grader: 'PSA',
        name: 'PSA Express',
        description: 'PSA Express service for faster turnaround.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '10–15 business days',
        pricePerCard: 5200,
        currency: 'THB',
        includes: ['Inspection & prep', 'PSA Express submission', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-psa-express'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-psa-super',
        providerId: 's1-grade',
        grader: 'PSA',
        name: 'PSA Super Express',
        description: 'PSA Super Express for high-priority cards.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '5–10 business days',
        pricePerCard: 12200,
        currency: 'THB',
        includes: ['Inspection & prep', 'PSA Super Express submission', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-psa-super'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-psa-walk',
        providerId: 's1-grade',
        grader: 'PSA',
        name: 'PSA Walk-Through',
        description: 'PSA Walk-Through for ultra-high-value cards.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '3–5 business days',
        pricePerCard: 21000,
        currency: 'THB',
        includes: ['White-glove inspection', 'PSA Walk-Through submission', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-psa-walk'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-bgs-base',
        providerId: 's1-grade',
        grader: 'BGS',
        name: 'BGS Base with Sub-grades',
        description: 'Beckett Base service with full sub-grades.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '75+ business days',
        pricePerCard: 630,
        currency: 'THB',
        includes: ['Inspection & prep', 'BGS Base with sub-grades', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-bgs-base'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-bgs-standard',
        providerId: 's1-grade',
        grader: 'BGS',
        name: 'BGS Standard',
        description: 'Beckett Standard with sub-grades and faster queue.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '45 business days',
        pricePerCard: 1225,
        currency: 'THB',
        includes: ['Inspection & prep', 'BGS Standard submission', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-bgs-standard'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-bgs-express',
        providerId: 's1-grade',
        grader: 'BGS',
        name: 'BGS Express',
        description: 'Beckett Express with sub-grades.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '15 business days',
        pricePerCard: 2800,
        currency: 'THB',
        includes: ['Inspection & prep', 'BGS Express submission', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-bgs-express'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-bgs-priority',
        providerId: 's1-grade',
        grader: 'BGS',
        name: 'BGS Priority',
        description: 'Beckett Priority with sub-grades.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '5 business days',
        pricePerCard: 4375,
        currency: 'THB',
        includes: ['Inspection & prep', 'BGS Priority submission', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-bgs-priority'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-tag-basic',
        providerId: 's1-grade',
        grader: 'TAG',
        name: 'TAG Basic',
        description: 'TAG Basic — AI grading with 1–10 label and DIG report.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '45+ business days',
        pricePerCard: 770,
        currency: 'THB',
        includes: ['Inspection & prep', 'TAG Basic submission', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-tag-basic'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-tag-standard',
        providerId: 's1-grade',
        grader: 'TAG',
        name: 'TAG Standard',
        description: 'TAG Standard — includes 360° video and leaderboard score.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '30 business days',
        pricePerCard: 1365,
        currency: 'THB',
        includes: ['Inspection & prep', 'TAG Standard submission', '360° video', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-tag-standard'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-tag-express',
        providerId: 's1-grade',
        grader: 'TAG',
        name: 'TAG Express',
        description: 'TAG Express — faster turnaround with full DIG report.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '15 business days',
        pricePerCard: 2065,
        currency: 'THB',
        includes: ['Inspection & prep', 'TAG Express submission', '360° video', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-tag-express'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-tag-priority',
        providerId: 's1-grade',
        grader: 'TAG',
        name: 'TAG Priority',
        description: 'TAG Priority — limited slots, fastest open tier.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '5 business days',
        pricePerCard: 5215,
        currency: 'THB',
        includes: ['Inspection & prep', 'TAG Priority submission', '360° video', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-tag-priority'),
        enabled: true,
      },
      {
        id: 'kaido99-grade-tag-walk',
        providerId: 's1-grade',
        grader: 'TAG',
        name: 'TAG Walk-Through',
        description: 'TAG Walk-Through — same-day to 3-day handling for high-value cards.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '2–3 business days',
        pricePerCard: 10465,
        currency: 'THB',
        includes: ['White-glove inspection', 'TAG Walk-Through submission', '360° video', 'Return shipping', 'Vault tracking'],
        imageUrl: getPackagePlaceholderUrl('kaido99-grade-tag-walk'),
        enabled: true,
      },
    ],
  }),
  storeProvider(FALLBACK_STORE_PROFILES[3], 'GRADE', {
    serviceTypes: ['PSA', 'BGS'],
    acceptedGraders: ['PSA', 'BGS'],
    description:
      'nami_swan Grading is based in Chiang Mai and accepts PSA and BGS submissions. We also authenticate sealed boxes. Drop-off or insured ship-in accepted.',
    deliveryMode: 'PHYSICAL_SHIP',
    turnaround: '4–8 weeks',
    pricePerCard: 510,
    scoreLabel: '10',
    color: 'plup',
    contactPhone: '+66 89 876 5432',
    contactLine: '@nami_swan',
    galleryUrls: [
      'https://picsum.photos/seed/namiswan1/400/300',
      'https://picsum.photos/seed/namiswan2/400/300',
    ],
    faq: [
      { q: 'Which graders do you accept?', a: 'PSA and BGS only.' },
      { q: 'Do you authenticate sealed boxes?', a: 'Yes — sealed-box authentication is available as a separate add-on.' },
    ],
    packages: [
      {
        id: 'nami_swan-grade-psa-regular',
        providerId: 's3-grade',
        grader: 'PSA',
        name: 'PSA Regular',
        description: 'PSA Regular submission for standard-value cards.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '25–40 business days',
        pricePerCard: 2850,
        currency: 'THB',
        includes: ['Pre-submission check', 'PSA Regular submission', 'Return shipping', 'Vault update'],
        imageUrl: getPackagePlaceholderUrl('nami-grade-psa-regular'),
        enabled: true,
      },
      {
        id: 'nami_swan-grade-bgs-base',
        providerId: 's3-grade',
        grader: 'BGS',
        name: 'BGS Base with Sub-grades',
        description: 'Beckett Base service with centering, edges, corners and surface sub-grades.',
        deliveryMode: 'PHYSICAL_SHIP',
        turnaround: '75+ business days',
        pricePerCard: 510,
        currency: 'THB',
        includes: ['Pre-submission check', 'BGS Base with sub-grades', 'Return shipping', 'Vault update'],
        imageUrl: getPackagePlaceholderUrl('nami-grade-bgs-base'),
        enabled: true,
      },
    ],
  }),
  storeProvider(FALLBACK_STORE_PROFILES[0], 'PREGRADE', {
    serviceTypes: ['Photo review', 'AI scoring', 'Condition report'],
    description:
      'BoBoBoA Photo Pre-grade lets you upload high-resolution scans of your raw cards and receive a digital condition report within 24 hours. No shipping required.',
    deliveryMode: 'PHOTO_UPLOAD',
    turnaround: '24 hr',
    pricePerCard: 190,
    scoreLabel: '92/100',
    color: 'periwinkle',
    contactEmail: 'boboboa@swibswap.app',
    galleryUrls: [
      'https://picsum.photos/seed/boboboapg1/400/300',
      'https://picsum.photos/seed/boboboapg2/400/300',
      'https://picsum.photos/seed/boboboapg3/400/300',
    ],
    packages: [
      {
        id: 'boboboa-pg-basic',
        providerId: 'u1-pregrade',
        name: 'Basic Photo Review',
        description: 'AI + human photo review with a 0–100 surface score.',
        deliveryMode: 'PHOTO_UPLOAD',
        turnaround: '24 hr',
        pricePerCard: 190,
        currency: 'THB',
        includes: ['AI surface scan', 'Human review', 'PDF report', 'Vault score tag'],
        imageUrl: getPackagePlaceholderUrl('boboboa-pg-basic'),
        enabled: true,
      },
      {
        id: 'boboboa-pg-premium',
        providerId: 'u1-pregrade',
        name: 'Premium Photo Review',
        description: 'Detailed centering, edge, corner and surface breakdown with grading probability.',
        deliveryMode: 'PHOTO_UPLOAD',
        turnaround: '24 hr',
        pricePerCard: 350,
        currency: 'THB',
        includes: ['AI surface scan', 'Human review', 'Detailed sub-scores', 'Grade probability', 'PDF report'],
        imageUrl: getPackagePlaceholderUrl('boboboa-pg-premium'),
        enabled: true,
      },
    ],
  }),
];

const GRADER_KEYS: GradingService[] = ['PSA', 'BGS', 'CGC', 'TAG', 'RAWLITY', 'BLACKLENS'];

FALLBACK_SERVICE_PROVIDERS.forEach((provider) => {
  provider.packages = provider.packages.map((pkg) => {
    if (pkg.grader && GRADER_KEYS.includes(pkg.grader)) {
      return { ...pkg, imageUrl: GRADER_IMAGE_URLS[pkg.grader] };
    }
    return pkg;
  });
});

function loadStoreProfiles(): StoreProfile[] {
  if (typeof window === 'undefined') return FALLBACK_STORE_PROFILES;
  try {
    const raw = localStorage.getItem('sws_store_profiles');
    if (!raw) return FALLBACK_STORE_PROFILES;
    const parsed = JSON.parse(raw) as StoreProfile[];
    return parsed.length ? parsed : FALLBACK_STORE_PROFILES;
  } catch {
    return FALLBACK_STORE_PROFILES;
  }
}

function saveStoreProfiles(profiles: StoreProfile[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sws_store_profiles', JSON.stringify(profiles));
}

function loadStoreGroups(): Record<string, StoreGroup[]> {
  if (typeof window === 'undefined') return FALLBACK_STORE_GROUPS;
  try {
    const raw = localStorage.getItem('sws_store_groups');
    if (!raw) return FALLBACK_STORE_GROUPS;
    return JSON.parse(raw) as Record<string, StoreGroup[]>;
  } catch {
    return FALLBACK_STORE_GROUPS;
  }
}

function saveStoreGroups(groups: Record<string, StoreGroup[]>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sws_store_groups', JSON.stringify(groups));
}

const FALLBACK_WISHLIST: WishlistItem[] = [
  { id: 'w1', listingId: 'm1', cardName: 'Shanks (Alt)', cardCode: 'OP01-120', game: 'one-piece', targetPrice: 9000, currentPrice: 11200, currency: 'THB', alertEnabled: true, addedAt: '2026-07-01T10:00:00Z' },
  { id: 'w2', listingId: 'm2', cardName: 'Ace SP', cardCode: 'OP02-013p', game: 'one-piece', targetPrice: 15000, currentPrice: 13800, currency: 'THB', alertEnabled: true, addedAt: '2026-07-03T08:00:00Z' },
  { id: 'w3', listingId: 'm3', cardName: 'Kuriboh RAWLITY 9+', cardCode: 'RD/KP16', game: 'yu-gi-oh', targetPrice: 7500, currentPrice: 8400, currency: 'THB', alertEnabled: true, addedAt: '2026-07-05T12:00:00Z' },
];

// API functions with fallback
export async function fetchVault(): Promise<VaultItem[]> {
  try {
    const res = await fetch(`${API_BASE}/vault`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(400);
    return FALLBACK_VAULT;
  }
}

export async function fetchMarketListings(shelf?: string): Promise<MarketListing[]> {
  try {
    const url = shelf ? `${API_BASE}/market?shelf=${shelf}` : `${API_BASE}/market`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(300);
    const all = [...FALLBACK_MARKET, ...MY_LISTINGS];
    return shelf ? all.filter((m) => m.shelf === shelf) : all;
  }
}

export async function fetchCardPrice(cardCode: string): Promise<CardPriceData> {
  try {
    const res = await fetch(`${API_BASE}/prices/${cardCode}`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(500);
    return FALLBACK_PRICE_DATA[cardCode] || {
      cardId: '', highest: 0, lowest: 0, trend30d: 0, current: 0,
      history: [], listings: [], lastSold: [],
    };
  }
}

export async function fetchSubmissions(): Promise<GradingSubmission[]> {
  try {
    const res = await fetch(`${API_BASE}/submissions`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(400);
    return FALLBACK_SUBMISSIONS;
  }
}

export async function fetchUser(): Promise<AuthUser> {
  try {
    const res = await fetch(`${API_BASE}/user`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(300);
    return FALLBACK_USER;
  }
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  try {
    const res = await fetch(`${API_BASE}/wishlist`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(300);
    return FALLBACK_WISHLIST;
  }
}

// Mutations
export async function addToVault(item: Omit<VaultItem, 'id' | 'currentPrice' | 'plAmount' | 'plPercent'>): Promise<VaultItem> {
  await delay(600);
  const newItem: VaultItem = {
    ...item,
    id: `v${Date.now()}`,
    currentPrice: item.paidPrice * 1.1,
    plAmount: item.paidPrice * 0.1,
    plPercent: 10,
  };
  return newItem;
}

export async function submitRating(submissionId: string, rating: { score: number; tags: string[]; comment: string }): Promise<void> {
  await delay(500);
  console.log('Rating submitted:', { submissionId, rating });
}

export async function createPregradeOrder(order: { cardIds: string[]; lab: string }): Promise<{ orderId: string; shippingTag: string }> {
  await delay(700);
  console.log('Pregrade order:', order);
  return {
    orderId: `SWS-PG-${Math.floor(100000 + Math.random() * 900000)}`,
    shippingTag: `https://swibswap.app/tag/${Date.now()}`,
  };
}

export async function fetchServiceProviders(category?: string): Promise<ServiceProvider[]> {
  await delay(300);
  let providers = [...FALLBACK_SERVICE_PROVIDERS];
  if (category) providers = providers.filter((p) => p.category === category);
  return providers.filter((p) => p.enabled);
}

export async function fetchServiceProvider(providerId: string): Promise<ServiceProvider | null> {
  await delay(300);
  const provider = FALLBACK_SERVICE_PROVIDERS.find((p) => p.id === providerId);
  return provider ?? null;
}

export async function fetchServicePackages(providerId: string): Promise<ServicePackage[]> {
  await delay(200);
  const provider = FALLBACK_SERVICE_PROVIDERS.find((p) => p.id === providerId);
  return provider?.packages.filter((pkg) => pkg.enabled) ?? [];
}

export async function createServiceOrder(input: ServiceOrderInput, userId = 'u1'): Promise<ServiceOrder> {
  await delay(700);
  const provider = FALLBACK_SERVICE_PROVIDERS.find((p) => p.id === input.providerId);
  const pkg = input.packageId ? provider?.packages.find((p) => p.id === input.packageId) : undefined;
  const pricePerCard = pkg?.pricePerCard ?? provider?.pricePerCard ?? 0;
  const order: ServiceOrder = {
    id: `SWS-SO-${Math.floor(100000 + Math.random() * 900000)}`,
    userId,
    category: input.category,
    providerId: input.providerId,
    providerName: provider?.storeName ?? input.providerId,
    storeId: provider?.storeId ?? '',
    packageId: input.packageId,
    cardIds: input.cardIds,
    status: 'PENDING',
    totalAmount: pricePerCard * input.cardIds.length,
    currency: pkg?.currency ?? provider?.currency ?? 'THB',
    shippingAddress: input.shippingAddress,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const orders = loadServiceOrders();
  orders.unshift(order);
  saveServiceOrders(orders);
  return order;
}

export async function submitPartnerApplication(input: PartnerApplicationInput): Promise<PartnerApplication> {
  await delay(600);
  const application: PartnerApplication = {
    id: `SWS-PA-${Math.floor(100000 + Math.random() * 900000)}`,
    ...input,
    status: 'PENDING',
    storeName: input.companyName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const apps = loadPartnerApplications();
  apps.unshift(application);
  savePartnerApplications(apps);
  return application;
}

export async function fetchPartnerApplications(): Promise<PartnerApplication[]> {
  await delay(300);
  return loadPartnerApplications();
}

export async function fetchServiceOrders(): Promise<ServiceOrder[]> {
  await delay(300);
  return loadServiceOrders();
}

export async function approveSubmissionConsent(submissionId: string): Promise<GradingSubmission> {
  await delay(500);
  const submission = FALLBACK_SUBMISSIONS.find((s) => s.id === submissionId);
  if (submission) {
    submission.consentRequired = false;
    submission.status = 'in-lab';
  }
  return submission || FALLBACK_SUBMISSIONS[0];
}

let FOLLOWED_SELLERS = new Set<string>();

function loadFollowedSellers() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('sws_followed_sellers');
    if (raw) FOLLOWED_SELLERS = new Set(JSON.parse(raw));
  } catch {
    // ignore
  }
}

function saveFollowedSellers() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sws_followed_sellers', JSON.stringify(Array.from(FOLLOWED_SELLERS)));
}

export async function getFollowedSellers(): Promise<string[]> {
  await delay(200);
  loadFollowedSellers();
  return Array.from(FOLLOWED_SELLERS);
}

export async function followSeller(sellerId: string): Promise<void> {
  await delay(300);
  FOLLOWED_SELLERS.add(sellerId);
  saveFollowedSellers();
}

export async function unfollowSeller(sellerId: string): Promise<void> {
  await delay(300);
  FOLLOWED_SELLERS.delete(sellerId);
  saveFollowedSellers();
}
// ─── Store / Collector mock data ──────────────────────────────────

export async function fetchStores(): Promise<StoreProfile[]> {
  await delay(300);
  return loadStoreProfiles();
}

export async function fetchStoreProfile(userId: string): Promise<StoreProfile | null> {
  await delay(250);
  const profiles = loadStoreProfiles();
  return profiles.find((p) => p.userId === userId) || null;
}

export async function fetchStoreReviews(storeId: string): Promise<StoreReview[]> {
  await delay(250);
  return FALLBACK_STORE_REVIEWS.filter((r) => r.storeId === storeId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateStoreProfile(userId: string, data: Partial<StoreProfile>): Promise<StoreProfile> {
  await delay(400);
  const profiles = loadStoreProfiles();
  const idx = profiles.findIndex((p) => p.userId === userId);
  const updated: StoreProfile = idx >= 0
    ? { ...profiles[idx], ...data, userId, id: userId }
    : { ...FALLBACK_STORE_PROFILES[0], ...data, userId, id: userId, name: data.name || data.displayName || `Seller ${userId.slice(0, 6)}` };
  if (idx >= 0) profiles[idx] = updated;
  else profiles.push(updated);
  saveStoreProfiles(profiles);
  return updated;
}

export async function uploadStoreAvatar(file: File): Promise<string> {
  await delay(600);
  return URL.createObjectURL(file);
}

export async function uploadStoreBanner(file: File): Promise<string> {
  await delay(600);
  return URL.createObjectURL(file);
}

export async function fetchStoreGroups(userId: string): Promise<StoreGroup[]> {
  await delay(250);
  const groups = loadStoreGroups();
  return groups[userId] ?? [];
}

export async function updateStoreGroups(userId: string, groups: StoreGroup[]): Promise<StoreGroup[]> {
  await delay(400);
  const all = loadStoreGroups();
  all[userId] = groups;
  saveStoreGroups(all);
  return groups;
}

// ─── Commerce mock data ───────────────────────────────────────────

const FALLBACK_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    buyerId: 'mock-buyer',
    sellerId: FALLBACK_MARKET[0].seller.id,
    listing: FALLBACK_MARKET[0],
    subtotal: 32000,
    fee: 1600,
    shipping: 0,
    total: 33600,
    status: 'PAID',
    deliveryPreference: 'VAULT_STORE',
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: '2026-07-05T10:05:00Z',
  },
  {
    id: 'ORD-002',
    buyerId: 'mock-buyer',
    sellerId: FALLBACK_MARKET[2].seller.id,
    listing: FALLBACK_MARKET[2],
    subtotal: 5900,
    fee: 295,
    shipping: 120,
    total: 6315,
    status: 'SHIPPED',
    deliveryPreference: 'SHIP',
    shippingAddress: 'BoBoBoA, 123 Sukhumvit Rd, Khlong Toei, Bangkok 10110 — 0812345678',
    createdAt: '2026-07-01T08:30:00Z',
    updatedAt: '2026-07-03T14:20:00Z',
  },
  {
    id: 'ORD-003',
    buyerId: 'mock-buyer',
    sellerId: FALLBACK_MARKET[3].seller.id,
    listing: FALLBACK_MARKET[3],
    subtotal: 3200,
    fee: 160,
    shipping: 120,
    total: 3480,
    status: 'COMPLETED',
    deliveryPreference: 'SHIP',
    shippingAddress: '456 Rama IX Rd, Huai Khwang, Bangkok 10310',
    createdAt: '2026-06-20T12:00:00Z',
    updatedAt: '2026-06-25T09:00:00Z',
  },
];

const sellerUser: OfferUser = { id: 's1', name: 'kaido99' };
const buyerUser: OfferUser = { id: 'u2', name: 'duelist_bkk' };
const meUser: OfferUser = { id: 'u1', name: 'BoBoBoA' };

const FALLBACK_OFFERS: Offer[] = [
  {
    id: 'OFF-001',
    listing: FALLBACK_MARKET[0],
    offerPrice: 30000,
    status: 'PENDING',
    direction: 'OUTGOING',
    fromUser: meUser,
    toUser: sellerUser,
    createdAt: '2026-07-06T10:00:00Z',
    expiresAt: '2026-07-15T23:59:59Z',
  },
  {
    id: 'OFF-002',
    listing: FALLBACK_MARKET[1],
    offerPrice: 0,
    tradeCards: [
      { code: 'OP01-025', nameEn: 'Nami (Alt Art)', condition: 'Raw', game: 'one-piece' },
      { code: 'OP02-013', nameEn: 'Portgas D. Ace', condition: 'Raw', game: 'one-piece' },
    ],
    status: 'PENDING',
    direction: 'INCOMING',
    fromUser: buyerUser,
    toUser: meUser,
    createdAt: '2026-07-04T08:00:00Z',
    expiresAt: '2026-07-10T23:59:59Z',
  },
];

const DEFAULT_ADDRESS: ShippingAddress = {
  name: 'BoBoBoA',
  address: '123 Sukhumvit Rd, Khlong Toei',
  province: 'Bangkok',
  postalCode: '10110',
  phone: '0812345678',
};

export async function fetchListingById(id: string): Promise<MarketListing | null> {
  await delay(300);
  const listings = await fetchMarketListings();
  return listings.find((l) => l.id === id) ?? null;
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/orders`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(300);
    return FALLBACK_ORDERS;
  }
}

export async function fetchOrderById(orderId: string): Promise<Order | null> {
  await delay(200);
  const orders = await fetchOrders();
  return orders.find((o) => o.id === orderId) ?? null;
}

const FALLBACK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Order shipped',
    body: 'Your order #ORD-002 is on the way.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'n2',
    type: 'offer',
    title: 'Offer received',
    body: 'PokeVault sent an offer on Luffy ST01-001.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'n3',
    type: 'like',
    title: 'New follower',
    body: 'CardKingdom started following your store.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'n4',
    type: 'message',
    title: 'Message from seller',
    body: 'Your card has been graded and is ready for shipping.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

let MOCK_NOTIFICATIONS = FALLBACK_NOTIFICATIONS.map((n) => ({ ...n }));

export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const res = await fetch(`${API_BASE}/notifications`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(300);
    return MOCK_NOTIFICATIONS;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(200);
  MOCK_NOTIFICATIONS = MOCK_NOTIFICATIONS.map((n) => (n.id === id ? { ...n, read: true } : n));
}

export async function fetchOffers(): Promise<Offer[]> {
  try {
    const res = await fetch(`${API_BASE}/offers`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(300);
    return FALLBACK_OFFERS;
  }
}

export async function getDefaultShippingAddress(): Promise<ShippingAddress> {
  await delay(100);
  return DEFAULT_ADDRESS;
}

export async function createOrder(payload: {
  listingId: string;
  deliveryPreference: 'SHIP' | 'VAULT_STORE';
  shippingAddress?: ShippingAddress;
}): Promise<Order> {
  await delay(700);
  const listing = await fetchListingById(payload.listingId);
  if (!listing) throw new Error('Listing not found');
  const price = listing.price;
  const fee = Math.round(price * 0.05);
  const shipping = payload.deliveryPreference === 'SHIP' ? 120 : 0;
  const now = new Date().toISOString();
  const order: Order = {
    id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    buyerId: 'current-user',
    sellerId: listing.seller.id,
    listing,
    subtotal: price,
    fee,
    shipping,
    total: price + fee + shipping,
    status: 'PENDING_PAYMENT',
    deliveryPreference: payload.deliveryPreference,
    shippingAddress: payload.shippingAddress
      ? `${payload.shippingAddress.name}, ${payload.shippingAddress.address}${payload.shippingAddress.district ? `, ${payload.shippingAddress.district}` : ''}, ${payload.shippingAddress.province} ${payload.shippingAddress.postalCode} — ${payload.shippingAddress.phone}`
      : undefined,
    createdAt: now,
    updatedAt: now,
  };
  FALLBACK_ORDERS.unshift(order);
  return order;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  await delay(400);
  const order = await fetchOrderById(orderId);
  if (!order) throw new Error('Order not found');
  return { ...order, status: 'CANCELLED', updatedAt: new Date().toISOString() };
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  await delay(400);
  const order = await fetchOrderById(orderId);
  if (!order) throw new Error('Order not found');
  return { ...order, status, updatedAt: new Date().toISOString() };
}

let MOCK_WISHLIST = [...FALLBACK_WISHLIST];

export async function addToWishlist(listingId: string): Promise<WishlistItem> {
  await delay(400);
  const listing = await fetchListingById(listingId);
  const code = listing?.card.code ?? listingId;
  const item: WishlistItem = {
    id: `w${Date.now()}`,
    listingId,
    cardName: listing?.card.nameEn ?? code,
    cardCode: code,
    game: listing?.card.game,
    targetPrice: listing?.price ?? 0,
    currentPrice: listing?.price ?? 0,
    currency: listing?.currency ?? 'THB',
    alertEnabled: true,
  };
  MOCK_WISHLIST = [item, ...MOCK_WISHLIST];
  return item;
}

export async function removeFromWishlist(listingId: string): Promise<void> {
  await delay(300);
  MOCK_WISHLIST = MOCK_WISHLIST.filter((i) => i.listingId !== listingId);
}



export async function createOffer(payload: {
  listingId: string;
  offerPrice: number;
}): Promise<Offer> {
  await delay(500);
  const listing = await fetchListingById(payload.listingId);
  if (!listing) throw new Error('Listing not found');
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: `OFF-${Math.floor(100000 + Math.random() * 900000)}`,
    listing,
    offerPrice: payload.offerPrice,
    status: 'PENDING',
    direction: 'OUTGOING',
    fromUser: meUser,
    toUser: { id: listing.seller.id, name: listing.seller.name },
    createdAt: now.toISOString(),
    expiresAt: expires,
  };
}

export async function respondOffer(
  offerId: string,
  action: 'ACCEPT' | 'DECLINE' | 'COUNTER',
  counterPrice?: number
): Promise<Offer> {
  await delay(400);
  const offers = await fetchOffers();
  const offer = offers.find((o) => o.id === offerId);
  if (!offer) throw new Error('Offer not found');
  if (action === 'ACCEPT') return { ...offer, status: 'ACCEPTED' };
  if (action === 'DECLINE') return { ...offer, status: 'DECLINED' };
  if (action === 'COUNTER' && counterPrice) {
    return { ...offer, status: 'COUNTERED', offerPrice: counterPrice };
  }
  return offer;
}

export async function createTradeOffer(payload: {
  listingId: string;
  tradeCards: TradeCard[];
}): Promise<Offer> {
  await delay(500);
  const listing = await fetchListingById(payload.listingId);
  if (!listing) throw new Error('Listing not found');
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: `OFF-${Math.floor(100000 + Math.random() * 900000)}`,
    listing,
    offerPrice: 0,
    tradeCards: payload.tradeCards,
    status: 'PENDING',
    direction: 'OUTGOING',
    fromUser: meUser,
    toUser: { id: listing.seller.id, name: listing.seller.name },
    createdAt: now.toISOString(),
    expiresAt: expires,
  };
}

export async function fetchMyListings(): Promise<MarketListing[]> {
  try {
    const res = await fetch(`${API_BASE}/seller/listings`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(300);
    return MY_LISTINGS;
  }
}

export async function createListing(input: CreateListingInput): Promise<MarketListing> {
  await delay(700);
  const newListing: MarketListing = {
    id: `my${Date.now()}`,
    card: { ...input.card, id: input.card.id || `c${Date.now()}` },
    price: input.price,
    currency: 'THB',
    listingType: input.listingType,
    shelf: input.shelf,
    seller: { id: 'u1', name: 'BoBoBoA', rating: 4.9 },
    vaultVerified: false,
    timestamp: new Date().toISOString(),
    status: 'active',
    views: 0,
    watchers: 0,
  };
  MY_LISTINGS.unshift(newListing);
  return newListing;
}

export async function updateListingStatus(listingId: string, status: 'active' | 'paused' | 'sold'): Promise<MarketListing> {
  await delay(300);
  const idx = MY_LISTINGS.findIndex((l) => l.id === listingId);
  if (idx === -1) throw new Error('Listing not found');
  MY_LISTINGS[idx] = { ...MY_LISTINGS[idx], status };
  return MY_LISTINGS[idx];
}

export async function fetchListingsBySeller(_sellerId: string): Promise<MarketListing[]> {
  void _sellerId;
  await delay(300);
  return MY_LISTINGS;
}

export async function deleteListing(listingId: string): Promise<void> {
  await delay(300);
  const idx = MY_LISTINGS.findIndex((l) => l.id === listingId);
  if (idx !== -1) MY_LISTINGS.splice(idx, 1);
}

// ─── Market data mock ─────────────────────────────────────────────

export async function fetchMarketHistory(cardCode: string, _range: string): Promise<{ data: { date: string; price: number }[] }> {
  void _range;
  await delay(400);
  const baseData = FALLBACK_PRICE_DATA[cardCode];
  if (baseData) {
    return { data: baseData.history };
  }
  const mockHistory = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      date: date.toISOString().split('T')[0],
      price: Math.round(5000 + Math.random() * 20000),
    };
  });
  return { data: mockHistory };
}

export async function fetchMarketStats(cardCode: string): Promise<{ lastSold?: number; average?: number; min?: number; max?: number; count?: number }> {
  await delay(300);
  const baseData = FALLBACK_PRICE_DATA[cardCode];
  if (baseData) {
    const prices = baseData.history.map((h) => h.price);
    const lastSold = baseData.lastSold[0]?.price ?? baseData.current;
    return {
      lastSold,
      average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min: Math.min(...prices),
      max: Math.max(...prices),
      count: baseData.history.length + baseData.lastSold.length,
    };
  }
  return { lastSold: 10000, average: 12000, min: 5000, max: 25000, count: 12 };
}

// ─── Vault audit history mock ─────────────────────────────────────

export interface AuditRecord {
  id: string;
  eventType: string;
  actorId: string;
  occurredAt: string;
  previousState?: unknown;
  newState?: unknown;
}

export async function fetchItemAuditHistory(itemId: string): Promise<AuditRecord[]> {
  await delay(300);
  const item = FALLBACK_VAULT.find((v) => v.id === itemId);
  if (!item) return [];
  return [
    {
      id: `audit-${itemId}-1`,
      eventType: 'ITEM_REGISTERED',
      actorId: item.id,
      occurredAt: item.dateAcquired + 'T00:00:00Z',
      newState: { status: 'AVAILABLE', price: item.paidPrice },
    },
    {
      id: `audit-${itemId}-2`,
      eventType: 'PRICE_UPDATED',
      actorId: 'system',
      occurredAt: new Date().toISOString(),
      previousState: { price: item.paidPrice },
      newState: { price: item.currentPrice },
    },
  ];
}

export async function fetchUserAuditHistory(userId: string): Promise<AuditRecord[]> {
  await delay(300);
  if (!userId) return [];
  return FALLBACK_VAULT.flatMap((item) => [
    {
      id: `audit-${item.id}-1`,
      eventType: 'ITEM_REGISTERED',
      actorId: userId,
      occurredAt: item.dateAcquired + 'T00:00:00Z',
      newState: { itemId: item.id, status: 'AVAILABLE' },
    },
  ]);
}

// ─── Redemptions & vault deliveries mock ──────────────────────────

let FALLBACK_REDEMPTIONS: Redemption[] = [
  {
    id: 'RDM-001',
    itemId: 'v4',
    userId: 'u1',
    status: 'DELIVERED',
    shippingAddress: DEFAULT_ADDRESS,
    trackingNumber: 'TH123456789',
    createdAt: '2026-06-15T08:00:00Z',
    completedAt: '2026-06-20T10:00:00Z',
  },
];

let FALLBACK_VAULT_DELIVERIES: VaultDelivery[] = [
  {
    id: 'DVD-001',
    itemId: 'v2',
    userId: 'u1',
    status: 'SHIPPED',
    shippingAddress: DEFAULT_ADDRESS,
    trackingNumber: 'TH987654321',
    createdAt: '2026-07-02T09:00:00Z',
  },
];

export async function fetchRedemptions(): Promise<Redemption[]> {
  try {
    const res = await fetch(`${API_BASE}/redemptions`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(300);
    return FALLBACK_REDEMPTIONS.map((r) => ({ ...r }));
  }
}

export async function fetchVaultDeliveries(): Promise<VaultDelivery[]> {
  try {
    const res = await fetch(`${API_BASE}/vault-deliveries`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    await delay(300);
    return FALLBACK_VAULT_DELIVERIES.map((d) => ({ ...d }));
  }
}

export async function createRedemption(
  itemId: string,
  shippingAddress: ShippingAddress
): Promise<Redemption> {
  await delay(700);
  const item = FALLBACK_VAULT.find((v) => v.id === itemId);
  const redemption: Redemption = {
    id: `RDM-${Math.floor(100000 + Math.random() * 900000)}`,
    itemId,
    userId: 'current-user',
    status: 'PENDING',
    shippingAddress,
    createdAt: new Date().toISOString(),
  };
  if (item) {
    FALLBACK_REDEMPTIONS = [redemption, ...FALLBACK_REDEMPTIONS];
  }
  return redemption;
}

export async function createVaultDelivery(
  itemId: string,
  shippingAddress: ShippingAddress
): Promise<VaultDelivery> {
  await delay(700);
  const item = FALLBACK_VAULT.find((v) => v.id === itemId);
  const delivery: VaultDelivery = {
    id: `DVD-${Math.floor(100000 + Math.random() * 900000)}`,
    itemId,
    userId: 'current-user',
    status: 'PENDING',
    shippingAddress,
    createdAt: new Date().toISOString(),
  };
  if (item) {
    FALLBACK_VAULT_DELIVERIES = [delivery, ...FALLBACK_VAULT_DELIVERIES];
  }
  return delivery;
}

export async function fetchPlatformStats() {
  await delay(300);
  return { totalUsers: 12480, totalListings: 8342, totalOrders: 3650 };
}

// ─── Vault delivery mock ──────────────────────────────────────────

export async function requestVaultDelivery(itemId: string): Promise<{ success: boolean }> {
  await delay(500);
  console.log('Vault delivery requested for:', itemId);
  return { success: true };
}

// ─── Aliases for buyer-web compatibility ──────────────────────────

export async function delistListing(listingId: string): Promise<void> {
  await delay(300);
  const idx = MY_LISTINGS.findIndex((l) => l.id === listingId);
  if (idx !== -1) MY_LISTINGS.splice(idx, 1);
}
