import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Send, Radio, ImagePlus, X, Loader2, Layers, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { uploadsApi } from '@/lib/api';
import type { FeedRoom, ShopPostType } from '@/lib/api';
import { useVault, useListings } from '@/hooks/useApi';
import { useCreatePost } from './useFeed';
import { ShopAvatar } from './PostCard';

/* Shop post composer — posts go straight to the live API.
   Photos upload to R2 via /uploads first, then their URLs ride on the post.
   Cards can be attached from the vault or the market (link chips on the post).
   On failure the draft (text + photos) is kept so nothing is lost. */

const POST_TYPES: ShopPostType[] = ['update', 'drop', 'restock', 'live'];
export const FEED_ROOMS: Exclude<FeedRoom, 'all'>[] = ['chat', 'news', 'product', 'pokemon', 'onepiece', 'lorcana'];

const MAX_PHOTOS = 6;
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_ATTACH = 8;

interface PendingPhoto {
  localId: string;
  file: File;
  preview: string;
}

interface AttachedCard {
  kind: 'vault' | 'listing';
  id: string;
  title: string;
  imageUrl?: string;
  price?: number;
}

export function PostComposer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const createPost = useCreatePost(user?.id);

  const [value, setValue] = useState('');
  const [type, setType] = useState<ShopPostType>('update');
  const [room, setRoom] = useState<Exclude<FeedRoom, 'all'>>('chat');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [attached, setAttached] = useState<AttachedCard[]>([]);
  const [attachOpen, setAttachOpen] = useState(false);
  const [attachTab, setAttachTab] = useState<'vault' | 'market'>('vault');
  const [marketQ, setMarketQ] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const vaultQuery = useVault();
  const marketQuery = useListings({ q: marketQ || undefined, limit: 12 });

  const isAttached = (kind: AttachedCard['kind'], id: string) =>
    attached.some((a) => a.kind === kind && a.id === id);

  const toggleAttach = (card: AttachedCard) => {
    setAttached((prev) => {
      if (prev.some((a) => a.kind === card.kind && a.id === card.id)) {
        return prev.filter((a) => !(a.kind === card.kind && a.id === card.id));
      }
      if (prev.length >= MAX_ATTACH) {
        toast.error(t('feed.composer.attachLimit', { max: MAX_ATTACH }));
        return prev;
      }
      return [...prev, card];
    });
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const next = [...photos];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) {
        toast.error(t('feed.composer.photoLimit', { max: MAX_PHOTOS }));
        break;
      }
      if (file.size > MAX_SIZE) {
        toast.error(t('feed.composer.photoTooLarge'));
        continue;
      }
      next.push({
        localId: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      });
    }
    setPhotos(next);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (localId: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.localId === localId);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((p) => p.localId !== localId);
    });
  };

  const submit = async () => {
    const body = value.trim();
    if (!body && photos.length === 0 && attached.length === 0) return;
    if (!isAuthenticated || !user?.id) {
      navigate({ to: '/login' });
      return;
    }
    try {
      // 1) Upload photos first → absolute URLs served by /images/*
      let mediaUrls: string[] = [];
      if (photos.length > 0) {
        setUploading(true);
        mediaUrls = await Promise.all(
          photos.map(async (p) => {
            const formData = new FormData();
            formData.append('file', p.file);
            const { url } = await uploadsApi.upload(formData);
            return url;
          })
        );
        setUploading(false);
      }
      // 2) Create the post with uploaded URLs + attached card links
      createPost.mutate(
        {
          type,
          room,
          body: body || t('feed.composer.photoOnlyBody'),
          mediaUrls,
          linkedListingIds: attached.filter((a) => a.kind === 'listing').map((a) => a.id),
          linkedVaultItemIds: attached.filter((a) => a.kind === 'vault').map((a) => a.id),
        },
        {
          onSuccess: () => {
            photos.forEach((p) => URL.revokeObjectURL(p.preview));
            setValue('');
            setType('update');
            setRoom('chat');
            setPhotos([]);
            setAttached([]);
            toast.success(t('feed.composer.posted'));
          },
          onError: () => {
            // Keep the draft so the user can retry without retyping.
            toast.error(t('feed.composer.postFailed'));
          },
        }
      );
    } catch {
      setUploading(false);
      toast.error(t('feed.composer.uploadFailed'));
    }
  };

  const busy = uploading || createPost.isPending;

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
              placeholder={t(`feed.composer.placeholders.${room}`, { defaultValue: t('feed.composer.placeholder') })}
              rows={2}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
            />

            {/* Photo previews */}
            {photos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {photos.map((p) => (
                  <div key={p.localId} className="group/ph relative aspect-square overflow-hidden rounded-lg border border-border">
                    <img src={p.preview} alt="" className="h-full w-full object-cover" />
                    <button
                      onClick={() => removePhoto(p.localId)}
                      aria-label={t('feed.composer.removePhoto')}
                      className="absolute right-1 top-1 rounded-full bg-surface-dark/80 p-1 text-white opacity-0 transition-opacity group-hover/ph:opacity-100 hover:text-pldown"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Attached cards (vault / market) */}
            {attached.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attached.map((a) => (
                  <div
                    key={`${a.kind}-${a.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-periwinkle/35 bg-periwinkle/10 py-1 pl-1 pr-1.5"
                  >
                    {a.imageUrl ? (
                      <img src={a.imageUrl} alt="" className="h-7 w-5 rounded object-cover" />
                    ) : (
                      <Layers className="h-3.5 w-3.5 text-periwinkle" />
                    )}
                    <span className="max-w-[140px] truncate text-[11px] font-medium">{a.title}</span>
                    <span className={cn('pxl-chip text-[8px]', a.kind === 'vault' ? 'pxl-chip--peri' : 'pxl-chip--cyan')}>
                      {a.kind === 'vault' ? 'VAULT' : 'MKT'}
                    </span>
                    <button
                      onClick={() => toggleAttach(a)}
                      aria-label={t('feed.composer.removeAttach')}
                      className="rounded-full p-0.5 text-muted-foreground hover:text-pldown"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Room picker — which channel this post lands in */}
            <div className="mt-2 flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
              {FEED_ROOMS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoom(r)}
                  aria-pressed={room === r}
                  className={cn(
                    'shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all border',
                    room === r
                      ? 'bg-periwinkle/15 text-periwinkle border-periwinkle/40 shadow-glow'
                      : 'bg-surface text-muted-foreground border-border/60 hover:text-foreground'
                  )}
                >
                  {t(`feed.rooms.${r}`)}
                </button>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
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
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photos.length >= MAX_PHOTOS || busy}
                  aria-label={t('feed.composer.addPhoto')}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-all border',
                    photos.length > 0
                      ? 'bg-cyan/15 text-cyan border-cyan/40'
                      : 'bg-surface-lighter text-muted-foreground border-transparent hover:text-cyan'
                  )}
                >
                  <ImagePlus className="h-3 w-3" />
                  {photos.length > 0 ? `${photos.length}/${MAX_PHOTOS}` : t('feed.composer.addPhoto')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  className="hidden"
                  onChange={(e) => addPhotos(e.target.files)}
                />
                <button
                  onClick={() => setAttachOpen(true)}
                  disabled={busy}
                  aria-label={t('feed.composer.attachCard')}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] transition-all border',
                    attached.length > 0
                      ? 'bg-periwinkle/15 text-periwinkle border-periwinkle/40'
                      : 'bg-surface-lighter text-muted-foreground border-transparent hover:text-periwinkle'
                  )}
                >
                  <Layers className="h-3 w-3" />
                  {attached.length > 0 ? `${attached.length}/${MAX_ATTACH}` : t('feed.composer.attachCard')}
                </button>
              </div>
              <button
                onClick={submit}
                disabled={(!value.trim() && photos.length === 0 && attached.length === 0) || busy}
                className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-light hover:shadow-glow disabled:opacity-40 disabled:hover:shadow-none"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {uploading ? t('feed.composer.uploading') : t('feed.composer.post')}
              </button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Attach card dialog — pick from own vault or search the market */}
      <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
        <DialogContent className="max-w-lg border-border bg-surface">
          <DialogHeader>
            <DialogTitle className="text-sm">{t('feed.composer.attachTitle', { count: attached.length, max: MAX_ATTACH })}</DialogTitle>
          </DialogHeader>

          <div className="flex gap-1.5">
            {(['vault', 'market'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setAttachTab(tab)}
                aria-pressed={attachTab === tab}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-all border',
                  attachTab === tab
                    ? 'bg-brand/15 text-brand border-brand/40'
                    : 'bg-surface-lighter text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                {t(tab === 'vault' ? 'feed.composer.attachFromVault' : 'feed.composer.attachFromMarket')}
              </button>
            ))}
          </div>

          {attachTab === 'market' && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={marketQ}
                onChange={(e) => setMarketQ(e.target.value)}
                placeholder={t('feed.composer.searchCards')}
                className="w-full rounded-lg border border-border bg-surface-light py-1.5 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-brand focus:outline-none"
              />
            </div>
          )}

          <div className="grid max-h-[320px] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {attachTab === 'vault' ? (
              (vaultQuery.data ?? []).length === 0 ? (
                <p className="col-span-full py-8 text-center text-xs text-muted-foreground">
                  {vaultQuery.isLoading ? t('common.loading') : t('feed.composer.noVaultCards')}
                </p>
              ) : (
                (vaultQuery.data ?? []).map((item) => {
                  const on = isAttached('vault', item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleAttach({ kind: 'vault', id: item.id, title: item.card.nameEn, imageUrl: item.card.imageUrl, price: item.currentPrice })}
                      aria-pressed={on}
                      className={cn(
                        'group relative overflow-hidden rounded-lg border text-left transition-all',
                        on ? 'border-periwinkle shadow-glow' : 'border-border/60 hover:border-periwinkle/40'
                      )}
                    >
                      <div className="aspect-[5/7] w-full bg-surface-lighter">
                        <ImageWithFallback src={item.card.imageUrl ?? ''} alt={item.card.nameEn} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-1.5">
                        <p className="truncate text-[10px] font-medium">{item.card.nameEn}</p>
                        <p className="text-[10px] mono-num text-cyan">฿{item.currentPrice.toLocaleString()}</p>
                      </div>
                      {on && <span className="absolute right-1 top-1 rounded-full bg-periwinkle px-1.5 py-0.5 text-[9px] font-bold text-white">✓</span>}
                    </button>
                  );
                })
              )
            ) : (
              (marketQuery.data?.results ?? []).length === 0 ? (
                <p className="col-span-full py-8 text-center text-xs text-muted-foreground">
                  {marketQuery.isLoading ? t('common.loading') : t('feed.composer.noMarketCards')}
                </p>
              ) : (
                (marketQuery.data?.results ?? []).map((l) => {
                  const on = isAttached('listing', l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => toggleAttach({ kind: 'listing', id: l.id, title: l.card.nameEn, imageUrl: l.card.imageUrl, price: l.price })}
                      aria-pressed={on}
                      className={cn(
                        'group relative overflow-hidden rounded-lg border text-left transition-all',
                        on ? 'border-cyan shadow-glow' : 'border-border/60 hover:border-cyan/40'
                      )}
                    >
                      <div className="aspect-[5/7] w-full bg-surface-lighter">
                        <ImageWithFallback src={l.card.imageUrl ?? ''} alt={l.card.nameEn} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-1.5">
                        <p className="truncate text-[10px] font-medium">{l.card.nameEn}</p>
                        <p className="text-[10px] mono-num text-cyan">฿{l.price.toLocaleString()}</p>
                      </div>
                      {on && <span className="absolute right-1 top-1 rounded-full bg-cyan px-1.5 py-0.5 text-[9px] font-bold text-white">✓</span>}
                    </button>
                  );
                })
              )
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setAttachOpen(false)}
              className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-brand-light hover:shadow-glow"
            >
              {t('common.done')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
