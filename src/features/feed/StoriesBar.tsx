import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFollowedSellers, useStores } from '@/hooks/useApi';
import { ShopAvatar } from './PostCard';

/* Stories bar (Phase 1): followed shops, neon gradient ring = active in the
   last 24h (activeShopIds from current feed data). Shows only real followed
   shops; with none, just the "your shop" shortcut remains. */

interface ShopStory {
  id: string;
  name: string;
  avatar?: string | null;
}

export function StoriesBar({ activeShopIds }: { activeShopIds: Set<string> }) {
  const { t } = useTranslation();
  const { data: rawSellers } = useStores();
  const { data: followedIds } = useFollowedSellers();

  let shops: ShopStory[] = [];
  if (rawSellers && followedIds) {
    shops = (rawSellers as unknown as Record<string, unknown>[])
      .map((s) => ({
        id: (s.id as string) || (s.userId as string) || '',
        name: (s.name as string) || (s.displayName as string) || 'Shop',
        avatar: (s.avatarUrl as string | undefined) ?? null,
      }))
      .filter((s) => s.id && followedIds.includes(s.id));
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x -mx-1 px-1">
      {/* Post shortcut */}
      <Link
        to="/seller"
        className="group flex w-16 shrink-0 snap-start flex-col items-center gap-1.5"
      >
        <div className="rounded-full p-[3px] bg-surface-lighter group-hover:bg-muted transition-colors border border-dashed border-border">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-surface bg-surface-light text-brand">
            <Plus className="h-5 w-5" />
          </div>
        </div>
        <span className="w-full truncate text-center text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
          {t('feed.stories.you')}
        </span>
      </Link>

      {shops.map((shop) => {
        const active = activeShopIds.has(shop.id);
        const inner = (
          <>
            <div
              className={cn(
                'rounded-full p-[3px] transition-all',
                active ? 'stories-ring' : 'bg-surface-lighter group-hover:bg-muted'
              )}
            >
              <div className="rounded-full border-2 border-surface">
                <ShopAvatar name={shop.name} avatar={shop.avatar} size="lg" />
              </div>
            </div>
            <span className="w-full truncate text-center text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
              {shop.name}
            </span>
            {active && (
              <span className="-mt-1 text-[9px] font-pixel text-brand">{t('feed.hasNew')}</span>
            )}
          </>
        );
        return (
          <Link
            key={shop.id}
            to="/seller/$sellerId"
            params={{ sellerId: shop.id }}
            className="group flex w-16 shrink-0 snap-start flex-col items-center gap-1.5"
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
