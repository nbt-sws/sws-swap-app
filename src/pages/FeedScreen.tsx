import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Heart, MessageCircle, Bookmark, Share2, BadgeCheck, Megaphone,
  Sparkles, Package, Radio, ChevronRight, Send, Store, Plus,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/* ══════════════════════════════════════════════════════════════════
   SUPER APP FEED — Phase 0 prototype (mock data only)
   Additive feature: does NOT import existing API hooks or mutate
   any existing screen. Wire to feedApi in Phase 1 (see
   docs/SUPERAPP_CONCEPT.md).
   ══════════════════════════════════════════════════════════════════ */

type PostType = 'update' | 'drop' | 'restock' | 'live';
type FeedTab = 'foryou' | 'following' | 'new';

interface ShopRef {
  id: string;
  name: string;
  verified: boolean;
  hasNew: boolean;
  color: string; // existing palette hex only (brand/periwinkle/cyan/warning)
}

interface DropItem {
  code: string;
  name: string;
  price: number;
}

interface FeedPost {
  id: string;
  shop: ShopRef;
  type: PostType;
  timeAgo: string;
  body: string;
  likes: number;
  comments: number;
  items?: DropItem[];
  liveAt?: string;
}

/* ─── Mock data ─────────────────────────────────────────────────── */

const SHOPS: ShopRef[] = [
  { id: 'pk', name: 'PK Cards', verified: true, hasNew: true, color: '#F06AA8' },
  { id: 'dragon', name: 'Dragon Vault BKK', verified: true, hasNew: true, color: '#7B8AF5' },
  { id: 'mintlab', name: 'Mint Lab', verified: false, hasNew: false, color: '#4FE0D0' },
  { id: 'hearth', name: 'Hearth & Hobby', verified: true, hasNew: false, color: '#FFD84D' },
  { id: 'nightowl', name: 'Night Owl TCG', verified: false, hasNew: true, color: '#7B8AF5' },
];

const MY_SHOP: ShopRef = { id: 'me', name: 'ร้านของฉัน', verified: false, hasNew: false, color: '#F06AA8' };

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'p1', shop: SHOPS[0], type: 'drop', timeAgo: '25 นาทีที่แล้ว',
    body: '🔥 ล็อตใหม่ลงตู้แล้ว! งานสภาพสวย ๆ ทั้งนั้น เกรด 9–10 เช็กได้เลย จองทางแอปได้ก่อนใคร',
    likes: 128, comments: 23,
    items: [
      { code: 'SV8-122', name: 'Terapagos ex SAR', price: 4850 },
      { code: 'OP09-061', name: 'Luffy SEC', price: 6200 },
      { code: 'MTG-BLC-89', name: 'Ajani, Nacatl Pariah', price: 1350 },
    ],
  },
  {
    id: 'p2', shop: SHOPS[1], type: 'live', timeAgo: '1 ชม.ที่แล้ว',
    body: 'คืนนี้ 2 ทุ่มเจอกัน! ไลฟ์เปิดกล่อง + แจกการ์ดท้ายไลฟ์ ฝากกดติดตามร้านไว้จะได้ไม่พลาด',
    likes: 86, comments: 41, liveAt: 'คืนนี้ 20:00',
  },
  {
    id: 'p3', shop: SHOPS[4], type: 'update', timeAgo: '3 ชม.ที่แล้ว',
    body: 'เสาร์นี้ร้านไปออกบูธงาน TCG Meet @ สามย่านมิตรทาวน์ ใครมีการ์ดอยากส่งเช็กสภาพ เอามาฝากได้ที่บูธเลยครับ',
    likes: 45, comments: 8,
  },
  {
    id: 'p4', shop: SHOPS[2], type: 'restock', timeAgo: '5 ชม.ที่แล้ว',
    body: 'รีสต็อกแล้ว! ตัวที่หมดไปนาน รอบนี้มาแบบจำนวนจำกัด ใครตั้ง wishlist ไว้เช็กเลย',
    likes: 67, comments: 12,
    items: [
      { code: 'SV5-167', name: 'Greninja ex', price: 2290 },
      { code: 'FAB-LGS-214', name: 'Command and Conquer', price: 3100 },
    ],
  },
  {
    id: 'p5', shop: SHOPS[0], type: 'update', timeAgo: 'เมื่อวาน',
    body: 'ขอบคุณทุกออเดอร์สัปดาห์นี้ครับ 🙏 ของแพ็กส่งรอบพรุ่งนี้เช้า ใครอยากเปลี่ยนเป็นเก็บเข้า Vault ทักมาได้เลย',
    likes: 92, comments: 15,
  },
  {
    id: 'p6', shop: SHOPS[3], type: 'drop', timeAgo: 'เมื่อวาน',
    body: 'งานใหญ่ประจำเดือนมาแล้ว ของหายากหลายใบ พร้อมส่งเกรดต่อได้เลยจากหน้าร้าน',
    likes: 154, comments: 29,
    items: [
      { code: 'SV3-126', name: 'Charizard ex', price: 5990 },
      { code: 'BS2-4', name: 'Blastoise holo', price: 8500 },
      { code: 'OP01-120', name: 'Shanks Manga', price: 12500 },
      { code: 'PROMO-25', name: 'Pikachu Thailand', price: 1790 },
    ],
  },
];

function formatPrice(n: number) {
  return `฿${n.toLocaleString()}`;
}

/* ─── Shop avatar (letter + palette tint) ───────────────────────── */
function ShopAvatar({ shop, size = 'md' }: { shop: ShopRef; size?: 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm';
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-bold', cls)}
      style={{ backgroundColor: `${shop.color}1F`, color: shop.color }}
    >
      {shop.name.charAt(0)}
    </div>
  );
}

/* ─── CSS-drawn card art placeholder (no external images) ───────── */
function CardArt({ item, tint }: { item: DropItem; tint: string }) {
  return (
    <div
      className="relative aspect-[5/7] w-full overflow-hidden rounded-xl border border-border"
      style={{
        background: `radial-gradient(120% 90% at 30% 20%, ${tint}26 0%, transparent 55%), linear-gradient(160deg, #282D5A 0%, #1E2248 45%, #0D0F26 100%)`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-pixel text-[9px] tracking-wider" style={{ color: tint }}>
          {item.code}
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-4">
        <p className="truncate text-[10px] font-medium text-white/90">{item.name}</p>
      </div>
    </div>
  );
}

/* ─── Post type badge (pixel chip, always paired with text) ─────── */
function PostBadge({ type, t }: { type: PostType; t: (k: string) => string }) {
  if (type === 'update') return null;
  const meta: Record<Exclude<PostType, 'update'>, { cls: string; icon?: React.ReactNode }> = {
    drop: { cls: 'pxl-chip pxl-chip--brand' },
    restock: { cls: 'pxl-chip pxl-chip--cyan' },
    live: { cls: 'pxl-chip pxl-chip--brand' },
  };
  return (
    <span className={meta[type].cls}>
      {type === 'live' && <Radio className="mr-1 inline h-2.5 w-2.5" />}
      {t(`feed.badges.${type}`)}
    </span>
  );
}

/* ─── Shop rail (followed shops, glow ring = new in <24h) ───────── */
function ShopRail({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-1 px-1">
      {SHOPS.map((shop) => (
        <button key={shop.id} className="group flex w-16 shrink-0 snap-start flex-col items-center gap-1.5">
          <div
            className={cn(
              'rounded-full p-[3px] transition-all',
              shop.hasNew
                ? 'bg-brand-gradient shadow-glow'
                : 'bg-surface-lighter group-hover:bg-muted'
            )}
          >
            <div className="rounded-full border-2 border-surface">
              <ShopAvatar shop={shop} size="lg" />
            </div>
          </div>
          <span className="w-full truncate text-center text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
            {shop.name}
          </span>
          {shop.hasNew && (
            <span className="-mt-1 text-[9px] font-pixel text-brand">{t('feed.hasNew')}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Composer (mock: prepends to local feed) ───────────────────── */
function Composer({ onPost, t }: { onPost: (body: string) => void; t: (k: string) => string }) {
  const [value, setValue] = useState('');
  const submit = () => {
    const body = value.trim();
    if (!body) return;
    onPost(body);
    setValue('');
  };
  return (
    <Card className="border-border/60 bg-surface-light/80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ShopAvatar shop={MY_SHOP} />
          <div className="min-w-0 flex-1">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('feed.composer.placeholder')}
              rows={2}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-1.5">
                {(['update', 'drop', 'restock', 'live'] as PostType[]).map((type) => (
                  <span key={type} className="rounded-full bg-surface-lighter px-2.5 py-1 text-[11px] text-muted-foreground">
                    {t(`feed.badges.${type}`)}
                  </span>
                ))}
              </div>
              <button
                onClick={submit}
                disabled={!value.trim()}
                className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-light hover:shadow-glow disabled:opacity-40 disabled:hover:shadow-none"
              >
                <Send className="h-3.5 w-3.5" />
                {t('feed.composer.post')}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Single post card ──────────────────────────────────────────── */
function PostCard({ post, followed, onToggleFollow, t }: {
  post: FeedPost;
  followed: boolean;
  onToggleFollow: (id: string) => void;
  t: (k: string) => string;
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Card className="overflow-hidden border-border/60 bg-surface-light/80 transition-all duration-300 hover:border-brand/30">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ShopAvatar shop={post.shop} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold">{post.shop.name}</span>
              {post.shop.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-cyan" />}
            </div>
            <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
          </div>
          <PostBadge type={post.type} t={t} />
          <button
            onClick={() => onToggleFollow(post.shop.id)}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all',
              followed
                ? 'bg-surface-lighter text-muted-foreground hover:text-foreground'
                : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
            )}
          >
            {followed ? t('feed.followingBtn') : t('feed.follow')}
          </button>
        </div>

        {/* Body */}
        <p className="mt-3 text-sm leading-relaxed">{post.body}</p>

        {post.liveAt && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-brand/25 bg-brand/5 px-3 py-2">
            <Radio className="h-4 w-4 text-brand" />
            <span className="text-xs font-semibold text-brand">{post.liveAt}</span>
            <span className="text-xs text-muted-foreground">— {t('feed.liveHint')}</span>
          </div>
        )}

        {/* Drop / restock items */}
        {post.items && (
          <div className="mt-4">
            <div className={cn(
              'grid gap-3',
              post.items.length > 3 ? 'grid-cols-4' : post.items.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:max-w-[70%]'
            )}>
              {post.items.map((item) => (
                <div key={item.code}>
                  <CardArt item={item} tint={post.shop.color} />
                  <p className="mt-1.5 text-xs font-semibold mono-num text-cyan">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>
            <Link
              to="/market"
              className="group/link mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-light transition-colors"
            >
              {t('feed.viewMarket')}
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-1 border-t border-border/40 pt-3">
          <button
            onClick={() => setLiked((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
              liked ? 'text-brand' : 'text-muted-foreground hover:text-brand hover:bg-brand/5'
            )}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-brand')} />
            <span className="mono-num">{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-periwinkle hover:bg-periwinkle/5 transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span className="mono-num">{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-lighter transition-colors">
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSaved((v) => !v)}
            className={cn(
              'ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
              saved ? 'text-cyan' : 'text-muted-foreground hover:text-cyan hover:bg-cyan/5'
            )}
          >
            <Bookmark className={cn('h-4 w-4', saved && 'fill-cyan')} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Right rail: new arrivals today ────────────────────────────── */
function NewTodayRail({ posts, t }: { posts: FeedPost[]; t: (k: string) => string }) {
  const items = useMemo(
    () => posts.flatMap((p) => (p.items ?? []).map((item) => ({ ...item, shop: p.shop }))).slice(0, 5),
    [posts]
  );
  return (
    <Card className="border-border/60 bg-surface-light/80">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan/10 text-cyan">
            <Package className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold">{t('feed.newToday')}</p>
        </div>
        <div className="mt-4 space-y-3">
          {items.map((item, i) => (
            <div key={`${item.code}-${i}`} className="flex items-center gap-3">
              <div className="w-9 shrink-0">
                <CardArt item={item} tint={item.shop.color} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{item.name}</p>
                <p className="text-[11px] text-muted-foreground">{item.shop.name}</p>
              </div>
              <p className="shrink-0 text-xs font-semibold mono-num text-cyan">{formatPrice(item.price)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Right rail: suggested shops ───────────────────────────────── */
function SuggestedShops({ followedIds, onToggleFollow, t }: {
  followedIds: Set<string>;
  onToggleFollow: (id: string) => void;
  t: (k: string) => string;
}) {
  return (
    <Card className="relative overflow-hidden border-border/60 bg-surface-light/80">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-periwinkle/10 blur-2xl" />
      <CardContent className="relative p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-periwinkle/10 text-periwinkle">
            <Store className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold">{t('feed.suggested')}</p>
        </div>
        <div className="mt-4 space-y-3">
          {SHOPS.filter((s) => !followedIds.has(s.id)).slice(0, 3).map((shop) => (
            <div key={shop.id} className="flex items-center gap-3">
              <ShopAvatar shop={shop} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-xs font-semibold">{shop.name}</p>
                  {shop.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-cyan" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{t('feed.suggestedHint')}</p>
              </div>
              <button
                onClick={() => onToggleFollow(shop.id)}
                className="shrink-0 rounded-full bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand transition-all hover:bg-brand hover:text-white"
              >
                {t('feed.follow')}
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main export ───────────────────────────────────────────────── */
export function FeedScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<FeedTab>('foryou');
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set(['pk', 'dragon', 'nightowl']));

  const toggleFollow = (id: string) =>
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const addPost = (body: string) =>
    setPosts((prev) => [
      { id: `local-${Date.now()}`, shop: MY_SHOP, type: 'update', timeAgo: t('feed.justNow'), body, likes: 0, comments: 0 },
      ...prev,
    ]);

  const visiblePosts = useMemo(() => {
    if (tab === 'following') return posts.filter((p) => followedIds.has(p.shop.id) || p.shop.id === MY_SHOP.id);
    if (tab === 'new') return posts.filter((p) => p.items && p.items.length > 0);
    return posts;
  }, [posts, tab, followedIds]);

  const tabs: { key: FeedTab; label: string }[] = [
    { key: 'foryou', label: t('feed.tabs.foryou') },
    { key: 'following', label: t('feed.tabs.following') },
    { key: 'new', label: t('feed.tabs.new') },
  ];

  return (
    <PageContainer size="xl" className="py-6 space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Megaphone className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t('feed.title')}</h1>
            <span className="pxl-chip pxl-chip--peri">BETA</span>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('feed.subtitle')}</p>
        </div>
        <div className="flex rounded-xl border border-border bg-surface-light p-1">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all',
                tab === tb.key ? 'bg-brand text-white shadow-glow' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main column */}
        <div className="space-y-5 min-w-0">
          <ShopRail t={t} />
          <Composer onPost={addPost} t={t} />

          <div className="space-y-4 stagger-fade-in">
            {visiblePosts.length === 0 ? (
              <Card className="border-dashed border-border bg-surface-light/50">
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <Sparkles className="h-10 w-10 text-muted-foreground/60" />
                  <p className="mt-3 text-sm text-muted-foreground">{t('feed.empty')}</p>
                  <Link
                    to="/stores"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-light transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('feed.emptyCta')}
                  </Link>
                </CardContent>
              </Card>
            ) : (
              visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  followed={followedIds.has(post.shop.id) || post.shop.id === MY_SHOP.id}
                  onToggleFollow={toggleFollow}
                  t={t}
                />
              ))
            )}
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6 min-w-0">
          <NewTodayRail posts={posts} t={t} />
          <SuggestedShops followedIds={followedIds} onToggleFollow={toggleFollow} t={t} />
        </div>
      </div>
    </PageContainer>
  );
}
