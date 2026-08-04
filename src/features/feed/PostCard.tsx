import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Bookmark, Share2, BadgeCheck, Radio, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { useNavigate } from '@tanstack/react-router';
import { timeAgo, useToggleReaction } from './useFeed';
import type { ShopPost, ShopPostType } from '@/lib/api';

/* Shared feed post card (Phase 1). Demo posts (id "demo-*") react locally
   only; real posts hit POST /posts/:id/reactions optimistically. */

const TYPE_BADGE: Record<Exclude<ShopPostType, 'update'>, { chip: string; key: string }> = {
  drop: { chip: 'pxl-chip--brand', key: 'feed.badges.drop' },
  restock: { chip: 'pxl-chip--cyan', key: 'feed.badges.restock' },
  live: { chip: 'pxl-chip--brand', key: 'feed.badges.live' },
  activity: { chip: 'pxl-chip--cyan', key: 'feed.badges.activity' },
};

export function ShopAvatar({ name, avatar, size = 'md' }: {
  name: string;
  avatar?: string | null;
  size?: 'md' | 'lg';
}) {
  const cls = size === 'lg' ? 'h-14 w-14 text-lg' : 'h-10 w-10 text-sm';
  if (avatar) {
    return <img src={avatar} alt={name} className={cn('shrink-0 rounded-full object-cover', cls)} loading="lazy" />;
  }
  return (
    <div className={cn('flex shrink-0 items-center justify-center rounded-full font-bold bg-brand/15 text-brand', cls)}>
      {name.charAt(0)}
    </div>
  );
}

export function PostCard({ post, followed, onToggleFollow }: {
  post: ShopPost;
  followed?: boolean;
  onToggleFollow?: (shopId: string) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const reaction = useToggleReaction();

  const [liked, setLiked] = useState(post.likedByMe);
  const [saved, setSaved] = useState(post.savedByMe);
  const [likes, setLikes] = useState(post.likes);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  const listings = post.listings ?? [];
  const vaultItems = post.vaultItems ?? [];

  const toggle = (kind: 'like' | 'save') => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    // Optimistic local flip, confirmed by the API.
    if (kind === 'like') {
      setLiked((v) => !v);
      setLikes((n) => (liked ? n - 1 : n + 1));
    } else {
      setSaved((v) => !v);
    }
    reaction.mutate({ postId: post.id, kind });
  };

  const share = () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => toast.success(t('feed.linkCopied'))).catch(() => {});
    }
  };

  const badge = post.type !== 'update' ? TYPE_BADGE[post.type as Exclude<ShopPostType, 'update'>] : null;

  return (
    <Card className="neon-card overflow-hidden border-border/60 bg-surface-light/80">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/seller/$sellerId" params={{ sellerId: post.shopId }} className="shrink-0">
            <ShopAvatar name={post.shopName} avatar={post.shopAvatar} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                to="/seller/$sellerId"
                params={{ sellerId: post.shopId }}
                className="truncate text-sm font-semibold hover:text-brand transition-colors"
              >
                {post.shopName}
              </Link>
              <BadgeCheck className="h-4 w-4 shrink-0 text-cyan" />
            </div>
            <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
          </div>
          {badge && (
            <Badge variant="pixel" className={badge.chip}>
              {post.type === 'live' && <Radio className="mr-1 inline h-2.5 w-2.5" />}
              {t(badge.key)}
            </Badge>
          )}
          {onToggleFollow && (
            <button
              onClick={() => onToggleFollow(post.shopId)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all',
                followed
                  ? 'bg-surface-lighter text-muted-foreground hover:text-foreground'
                  : 'bg-brand/10 text-brand hover:bg-brand hover:text-white hover:shadow-glow'
              )}
            >
              {followed ? t('feed.followingBtn') : t('feed.follow')}
            </button>
          )}
        </div>

        {/* Body */}
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">{post.body}</p>

        {/* Photo attachments — compact thumbnail strip, never a hero */}
        {post.mediaUrls.length > 0 && (
          <div
            className={cn(
              'mt-3 grid gap-2',
              post.mediaUrls.length === 1
                ? 'grid-cols-2 max-w-[220px]'
                : post.mediaUrls.length === 2
                  ? 'grid-cols-3 max-w-[330px]'
                  : 'grid-cols-4 max-w-[440px]'
            )}
          >
            {post.mediaUrls.slice(0, 6).map((url, i) => (
              <button
                key={`${url}-${i}`}
                onClick={() => setPhotoIndex(i)}
                aria-label={t('feed.viewPhoto')}
                className="group/ph relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-surface-lighter transition-all hover:border-brand/50"
              >
                <ImageWithFallback src={url} alt="" className="h-full w-full object-cover transition-transform group-hover/ph:scale-105" />
              </button>
            ))}
          </div>
        )}

        {/* Photo lightbox — full-size viewer with prev/next */}
        {photoIndex !== null && post.mediaUrls[photoIndex] && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setPhotoIndex(null)}
          >
            <button
              onClick={() => setPhotoIndex(null)}
              aria-label={t('common.close')}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
            {post.mediaUrls.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex + post.mediaUrls.length - 1) % post.mediaUrls.length); }}
                  aria-label={t('feed.prevPhoto')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPhotoIndex((photoIndex + 1) % post.mediaUrls.length); }}
                  aria-label={t('feed.nextPhoto')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs mono-num text-white">
                  {photoIndex + 1}/{post.mediaUrls.length}
                </span>
              </>
            )}
            <img
              src={post.mediaUrls[photoIndex]}
              alt=""
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain"
            />
          </div>
        )}

        {post.liveAt && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-brand/25 bg-brand/5 px-3 py-2">
            <Radio className="h-4 w-4 text-brand" />
            <span className="text-xs font-semibold neon-text-brand">
              {new Date(post.liveAt).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs text-muted-foreground">— {t('feed.liveHint')}</span>
          </div>
        )}

        {/* Linked listings (drops / restocks) */}
        {listings.length > 0 && (
          <div className="mt-4">
            <div className={cn(
              'grid gap-3',
              listings.length > 3 ? 'grid-cols-4' : listings.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:max-w-[70%]'
            )}>
              {listings.map((item) => (
                <Link
                  key={item.listingId}
                  to="/market/$listingId"
                  params={{ listingId: item.listingId }}
                  className="group/item block"
                >
                  <div className="relative aspect-[5/7] w-full overflow-hidden rounded-xl border border-border bg-surface-lighter transition-all group-hover/item:border-brand/40 group-hover/item:shadow-glow">
                    {item.imageUrl ? (
                      <ImageWithFallback src={item.imageUrl} alt={item.title} />
                    ) : (
                      <div className="surreal-mesh-static absolute inset-0 flex items-center justify-center">
                        <span className="font-pixel text-[9px] tracking-wider text-brand/90">{item.title.slice(0, 10)}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground transition-colors group-hover/item:text-foreground">{item.title}</p>
                  <p className="text-xs font-semibold mono-num text-cyan">฿{item.price.toLocaleString()}</p>
                </Link>
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

        {/* Shared vault items (cards shared straight from the vault) */}
        {vaultItems.length > 0 && (
          <div className="mt-4">
            <div className={cn(
              'grid gap-3',
              vaultItems.length > 3 ? 'grid-cols-4' : vaultItems.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:max-w-[70%]'
            )}>
              {vaultItems.map((item) => (
                <Link
                  key={item.itemId}
                  to="/vault/items/$itemId"
                  params={{ itemId: item.itemId }}
                  className="group/item block"
                >
                  <div className="relative aspect-[5/7] w-full overflow-hidden rounded-xl border border-border bg-surface-lighter transition-all group-hover/item:border-periwinkle/50 group-hover/item:shadow-glow">
                    {item.imageUrl ? (
                      <ImageWithFallback src={item.imageUrl} alt={item.title} />
                    ) : (
                      <div className="surreal-mesh-static absolute inset-0 flex items-center justify-center">
                        <span className="font-pixel text-[9px] tracking-wider text-periwinkle/90">{item.title.slice(0, 10)}</span>
                      </div>
                    )}
                    <span className="pxl-chip pxl-chip--peri absolute left-1.5 top-1.5 text-[8px]">VAULT</span>
                    {item.condition && (
                      <span className="absolute right-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
                        {item.condition}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground transition-colors group-hover/item:text-foreground">{item.title}</p>
                  <p className="text-xs font-semibold mono-num text-cyan">฿{item.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-1 border-t border-border/40 pt-3">
          <button
            onClick={() => toggle('like')}
            aria-pressed={liked}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors',
              liked ? 'text-brand' : 'text-muted-foreground hover:text-brand hover:bg-brand/5'
            )}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-brand')} />
            <span className="mono-num">{likes}</span>
          </button>
          <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-periwinkle hover:bg-periwinkle/5 transition-colors">
            <MessageCircle className="h-4 w-4" />
          </button>
          <button
            onClick={share}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-surface-lighter transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => toggle('save')}
            aria-pressed={saved}
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
