import { getCardImageUrl, cn } from '@/lib/utils';
import { PostCard } from '@/features/feed/PostCard';
import { ListingCard } from '@/components/domain/ListingCard';
import { VaultCard } from '@/components/domain/VaultCard';
import type { ShopPost } from '@/lib/api';
import type { MarketListing, StoreProfile, VaultItem } from '@/types';

/* ─── Product-UI mockups for the /welcome landing ───────────────────
   These render the REAL app components (PostCard, ListingCard,
   VaultCard) with real API data, inside a miniature app-shell frame —
   visitors see the actual product, not an illustration of it.
   Everything is pointer-events-none: the mockup is a living screenshot. */

export function AppFrame({ label, accent, children, className }: {
  label: string;
  accent: 'brand' | 'cyan' | 'periwinkle';
  children: React.ReactNode;
  className?: string;
}) {
  const glow = accent === 'brand' ? 'shadow-[0_24px_64px_-24px_rgba(240,106,168,0.25)]'
    : accent === 'cyan' ? 'shadow-[0_24px_64px_-24px_rgba(79,224,208,0.2)]'
    : 'shadow-[0_24px_64px_-24px_rgba(123,138,245,0.25)]';
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-border/70 bg-surface-dark',
      glow,
      className
    )}>
      {/* Mini app top bar — mirrors the real TopBar */}
      <div className="flex items-center gap-2 border-b border-border/60 bg-surface-dark/95 px-3.5 py-2.5">
        <img src="/logo.png" alt="" className="h-5 w-5 rounded object-contain" />
        <span className="truncate text-[11px] font-bold tracking-tight">{label}</span>
        <span className="ml-auto h-5 w-5 rounded-full bg-surface-lighter" />
      </div>
      {/* Real components, frozen from interaction */}
      <div className="pointer-events-none select-none bg-surface p-3" aria-hidden="true">
        {children}
      </div>
      <div className="absolute bottom-0 right-0 h-3 w-3 bg-brand/50 pxl-corner" aria-hidden="true" />
    </div>
  );
}

/* ─── Feed — the real PostCard with real shops + real listings ──── */

function mkPost(shop: StoreProfile, index: number, listings: MarketListing[]): ShopPost {
  const linked = listings.map((l) => ({
    listingId: l.id,
    title: l.card.nameEn,
    price: l.price,
    imageUrl: getCardImageUrl(l.card),
  }));
  return {
    id: `welcome-demo-${shop.userId}-${index}`,
    shopId: shop.userId,
    shopName: shop.displayName || shop.name,
    shopAvatar: shop.avatarUrl ?? null,
    type: index === 0 ? 'drop' : 'update',
    room: 'product',
    body: index === 0
      ? '🔥 ลงของใหม่แล้วจ้า เข้าไปดูในชั้นได้เลย รอบนี้ของสวยทั้งนั้น!'
      : '📦 restock ที่ถามกันเข้ามาเยอะแล้วนะครับ ทักมาได้เลย',
    mediaUrls: [],
    liveAt: null,
    createdAt: new Date(Date.now() - (index + 1) * 47 * 60000).toISOString(),
    likes: 24 - index * 7,
    saves: 6 - index * 2,
    likedByMe: false,
    savedByMe: false,
    listings: index === 0 ? linked : [],
    vaultItems: [],
  };
}

export function FeedMock({ shops, listings }: { shops: StoreProfile[]; listings: MarketListing[] }) {
  const posts = shops.slice(0, 2).map((shop, i) =>
    mkPost(shop, i, i === 0 ? listings.slice(0, 3) : [])
  );
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

/* ─── Vault — the real VaultCard with real card data ────────────── */

function mkVaultItem(l: MarketListing, index: number): VaultItem {
  const currentPrice = l.price;
  const paidPrice = Math.max(0, Math.round(currentPrice * (0.78 + index * 0.08)));
  const plAmount = currentPrice - paidPrice;
  return {
    id: `welcome-demo-${l.id}`,
    card: l.card,
    ownerId: 'welcome-demo',
    paidPrice,
    currentPrice,
    currency: l.currency || 'THB',
    dateAcquired: new Date(Date.now() - (index + 3) * 30 * 86400000).toISOString(),
    source: 'shop',
    condition: l.card.condition,
    status: 'held',
    plAmount,
    plPercent: paidPrice > 0 ? (plAmount / paidPrice) * 100 : 0,
  };
}

export function VaultMock({ listings }: { listings: MarketListing[] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {listings.slice(0, 3).map((l, i) => (
        <VaultCard key={l.id} item={mkVaultItem(l, i)} />
      ))}
    </div>
  );
}

/* ─── Market — the real ListingCard grid ─────────────────────────── */

export function MarketMock({ listings }: { listings: MarketListing[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {listings.slice(0, 4).map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
