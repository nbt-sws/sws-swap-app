import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Send, Radio } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { useCreatePost } from './useFeed';
import { ShopAvatar } from './PostCard';
import type { ShopPostType } from '@/lib/api';

/* Shop post composer (Phase 1) — posts go straight to the live API;
   on failure the draft is kept and an error toast is shown. */

const POST_TYPES: ShopPostType[] = ['update', 'drop', 'restock', 'live'];

export function PostComposer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const createPost = useCreatePost(user?.id);

  const [value, setValue] = useState('');
  const [type, setType] = useState<ShopPostType>('update');

  const submit = () => {
    const body = value.trim();
    if (!body) return;
    if (!isAuthenticated || !user?.id) {
      navigate({ to: '/login' });
      return;
    }
    createPost.mutate(
      { type, body },
      {
        onSuccess: () => {
          setValue('');
          setType('update');
          toast.success(t('feed.composer.posted'));
        },
        onError: () => {
          // Keep the draft so the user can retry without retyping.
          toast.error(t('feed.composer.postFailed'));
        },
      }
    );
  };

  // Guests get a disabled teaser instead of a dead composer.
  if (!isAuthenticated) {
    return (
      <Card className="border-dashed border-border bg-surface-light/50">
        <CardContent className="flex items-center gap-3 p-4">
          <ShopAvatar name="?" />
          <button
            onClick={() => navigate({ to: '/login' })}
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-left text-sm text-muted-foreground hover:border-brand/40 transition-colors"
          >
            {t('feed.composer.guestPlaceholder')}
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neon-card border-border/60 bg-surface-light/80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ShopAvatar name={(user as { fullName?: string; name?: string })?.fullName ?? (user as { name?: string })?.name ?? 'S'} />
          <div className="min-w-0 flex-1">
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t('feed.composer.placeholder')}
              rows={2}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1.5">
                {POST_TYPES.map((pt) => (
                  <button
                    key={pt}
                    onClick={() => setType(pt)}
                    aria-pressed={type === pt}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-all border',
                      type === pt
                        ? 'bg-brand/15 text-brand border-brand/40'
                        : 'bg-surface-lighter text-muted-foreground border-transparent hover:text-foreground'
                    )}
                  >
                    {pt === 'live' && <Radio className="h-3 w-3" />}
                    {t(`feed.badges.${pt}`)}
                  </button>
                ))}
              </div>
              <button
                onClick={submit}
                disabled={!value.trim() || createPost.isPending}
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
