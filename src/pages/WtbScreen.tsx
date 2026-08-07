import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import {
  HandCoins, Plus, Search, SearchX, X, CheckCircle2, Trash2, Target,
  ImagePlus, Layers, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { GameMark } from '@/components/domain/GameMark';
import { useAuthStore } from '@/stores/auth';
import { uploadsApi } from '@/lib/api';
import { useCatalogCards } from '@/hooks/useCatalog';
import {
  timeAgo, useCreateWtb, useDeleteWtb, useWtbList, useWtbSetStatus,
} from '@/features/feed/useFeed';
import type { WtbRequest } from '@/lib/api';

/* ══════════════════════════════════════════════════════════════════
   WTB Board (Phase 2) — collectors post "want to buy" requests; shops
   browse demand. Live API only (migration 009); errors show a retry card.
   A request can carry one reference image — uploaded or picked from the
   card catalog (migration 013).
   ══════════════════════════════════════════════════════════════════ */

const MAX_IMG_SIZE = 5 * 1024 * 1024;

function WtbCard({ req, isOwner }: { req: WtbRequest; isOwner: boolean }) {
  const { t } = useTranslation();
  const setStatus = useWtbSetStatus();
  const remove = useDeleteWtb();
  const [viewing, setViewing] = useState(false);

  return (
    <Card className="neon-card group relative flex h-full flex-col overflow-hidden border-border/60 bg-surface-light/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-warning/40 hover:shadow-[0_8px_24px_-8px_rgba(255,216,77,0.25)]">
      {/* Pixel corner accent */}
      <div className="absolute top-0 right-0 h-3 w-3 bg-warning/60 pxl-corner" aria-hidden="true" />
      <CardContent className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex gap-3">
          {req.imageUrl ? (
            <button
              onClick={() => setViewing(true)}
              aria-label={t('wtb.viewImage')}
              className="shrink-0 overflow-hidden rounded-lg border border-border/60 transition-all hover:border-warning/50"
            >
              <ImageWithFallback
                src={req.imageUrl}
                alt={req.cardName}
                className="h-24 w-[68px] object-cover"
              />
            </button>
          ) : null}
          <div className="min-w-0 min-h-24 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  {req.game && <GameMark game={req.game} size="sm" />}
                  {req.cardCode && (
                    <span className="text-[11px] font-mono text-muted-foreground">{req.cardCode}</span>
                  )}
                  <Badge variant="pixel" className="pxl-chip--brand">{t('wtb.badge')}</Badge>
                </div>
                <h3 className="mt-1.5 truncate text-base font-bold tracking-tight group-hover:text-warning transition-colors">
                  {req.cardName}
                </h3>
              </div>
            </div>

            {/* Budget — the hero number */}
            <div className="mt-3 flex items-baseline gap-2 rounded-xl border border-cyan/20 bg-cyan/5 px-3 py-2">
              <Target className="h-4 w-4 shrink-0 self-center text-cyan" />
              {req.targetPrice != null ? (
                <>
                  <span className="text-lg font-extrabold mono-num neon-text-cyan whitespace-nowrap">
                    ฿{req.targetPrice.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t('wtb.budget')}</span>
                </>
              ) : (
                <span className="text-sm font-semibold text-cyan">{t('wtb.budgetOpen')}</span>
              )}
              {req.condition && (
                <span className="ml-auto rounded-full bg-surface-lighter px-2 py-0.5 text-[10px] text-muted-foreground">
                  {req.condition}
                </span>
              )}
            </div>
          </div>
        </div>

        {req.note && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2 min-h-8">{req.note}</p>
        )}

        {/* Spacer keeps the footer pinned to the bottom so every card shares one height */}
        <div className="flex-1" aria-hidden="true" />

        <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-periwinkle/15 text-[10px] font-bold text-periwinkle">
            {req.userName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-xs text-muted-foreground">{req.userName}</span>
          <span className="text-[10px] text-muted-foreground/70">· {timeAgo(req.createdAt)}</span>
          {isOwner && (
            <span className="ml-auto flex gap-1">
              <button
                onClick={() => setStatus.mutate({ id: req.id, status: 'FOUND' })}
                title={t('wtb.markFound')}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-cyan hover:bg-cyan/10 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove.mutate(req.id)}
                title={t('wtb.delete')}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-pldown hover:bg-pldown/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </span>
          )}
        </div>
      </CardContent>

      {/* Image lightbox */}
      {viewing && req.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setViewing(false)}
        >
          <button
            onClick={() => setViewing(false)}
            aria-label={t('common.close')}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={req.imageUrl}
            alt={req.cardName}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain"
          />
        </div>
      )}
    </Card>
  );
}

function WtbForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const create = useCreateWtb();
  const [cardName, setCardName] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [game, setGame] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [note, setNote] = useState('');
  // Image: either an uploaded file (preview local) or a catalog card image URL.
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const [catalogImage, setCatalogImage] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQ, setPickerQ] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catalogQuery = useCatalogCards({ q: pickerQ || undefined, pageSize: 8 });

  const pickPhoto = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_IMG_SIZE) {
      toast.error(t('wtb.imageTooLarge'));
      return;
    }
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhoto({ file, preview: URL.createObjectURL(file) });
    setCatalogImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearImage = () => {
    if (photo) URL.revokeObjectURL(photo.preview);
    setPhoto(null);
    setCatalogImage(null);
  };

  const submit = async () => {
    if (!cardName.trim()) return;
    // Upload the picked photo first, then post the request with its URL.
    let imageUrl = catalogImage ?? undefined;
    if (photo) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', photo.file);
        imageUrl = (await uploadsApi.upload(formData)).url;
      } catch {
        setUploading(false);
        toast.error(t('wtb.uploadFailed'));
        return;
      }
      setUploading(false);
    }
    create.mutate(
      {
        cardName: cardName.trim(),
        cardCode: cardCode.trim() || undefined,
        game: game.trim() || undefined,
        targetPrice: targetPrice ? Number(targetPrice) : undefined,
        condition: condition.trim() || undefined,
        note: note.trim() || undefined,
        imageUrl,
      },
      {
        onSuccess: () => {
          if (photo) URL.revokeObjectURL(photo.preview);
          toast.success(t('wtb.posted'));
          onClose();
        },
        onError: () => toast.error(t('wtb.postFailed')),
      }
    );
  };

  const busy = uploading || create.isPending;
  const imagePreview = photo?.preview ?? catalogImage;

  return (
    <Card className="pxl-shadow-brand border-warning/30 bg-surface-light">
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">{t('wtb.formTitle')}</p>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Input
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder={t('wtb.formName')}
          className="bg-surface border-border"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={cardCode}
            onChange={(e) => setCardCode(e.target.value)}
            placeholder={t('wtb.formCode')}
            className="bg-surface border-border font-mono"
          />
          <Input
            value={game}
            onChange={(e) => setGame(e.target.value)}
            placeholder={t('wtb.formGame')}
            className="bg-surface border-border"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value.replace(/\D/g, ''))}
            placeholder={t('wtb.formBudget')}
            inputMode="numeric"
            className="bg-surface border-border mono-num"
          />
          <Input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder={t('wtb.formCondition')}
            className="bg-surface border-border"
          />
        </div>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('wtb.formNote')}
          className="bg-surface border-border"
        />

        {/* Reference image — upload a photo or pick from the card catalog */}
        <div className="rounded-xl border border-border/60 bg-surface p-3">
          <div className="flex items-center gap-2">
            {imagePreview && (
              <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg border border-border">
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={clearImage}
                  aria-label={t('wtb.removeImage')}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/70 p-0.5 text-white hover:text-pldown"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface-light px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-cyan/40 hover:text-cyan"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {t('wtb.uploadPhoto')}
              </button>
              <button
                onClick={() => setPickerOpen((v) => !v)}
                disabled={busy}
                aria-expanded={pickerOpen}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface-light px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-periwinkle/40 hover:text-periwinkle"
              >
                <Layers className="h-3.5 w-3.5" />
                {t('wtb.pickFromCards')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => pickPhoto(e.target.files)}
              />
            </div>
          </div>

          {/* Catalog picker — search a card, tap to use its art (auto-fills the form) */}
          {pickerOpen && (
            <div className="mt-3 border-t border-border/40 pt-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={pickerQ}
                  onChange={(e) => setPickerQ(e.target.value)}
                  placeholder={t('wtb.searchCard')}
                  className="h-8 bg-surface-light pl-8 text-xs"
                />
              </div>
              <div className="mt-2 grid max-h-44 grid-cols-4 gap-2 overflow-y-auto">
                {catalogQuery.isLoading ? (
                  <div className="col-span-full flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (catalogQuery.data?.cards ?? []).length === 0 ? (
                  <p className="col-span-full py-4 text-center text-[11px] text-muted-foreground">
                    {t('wtb.noCardsFound')}
                  </p>
                ) : (
                  (catalogQuery.data?.cards ?? []).map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCatalogImage(c.imageUrl ?? null);
                        setPhoto(null);
                        if (!cardName.trim()) setCardName(c.nameEn);
                        if (!cardCode.trim()) setCardCode(c.code);
                        if (!game.trim() && c.game) setGame(c.game);
                        setPickerOpen(false);
                      }}
                      title={`${c.nameEn} (${c.code})`}
                      className="group/pick overflow-hidden rounded-lg border border-border/60 text-left transition-all hover:border-periwinkle/50 hover:shadow-glow"
                    >
                      <div className="aspect-[5/7] w-full bg-surface-lighter">
                        <ImageWithFallback src={c.imageUrl ?? ''} alt={c.nameEn} className="h-full w-full object-cover" />
                      </div>
                      <p className="truncate p-1 text-[9px] text-muted-foreground group-hover/pick:text-foreground">{c.nameEn}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={submit}
          disabled={!cardName.trim() || busy}
          className="w-full bg-warning text-surface-dark hover:bg-warning/90 font-bold"
        >
          {busy && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
          {uploading ? t('wtb.uploading') : t('wtb.formSubmit')}
        </Button>
      </CardContent>
    </Card>
  );
}

export function WtbScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const wtbQuery = useWtbList({ status: 'OPEN', q: query.trim() || undefined });
  const requests = wtbQuery.data?.requests ?? [];

  const openForm = () => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }
    setShowForm((v) => !v);
  };

  return (
    <PageContainer size="xl" className="py-6 space-y-6">
      {/* Hero — unified neon hero via PageHeader */}
      <PageHeader
        title={t('wtb.title')}
        icon={<HandCoins className="text-warning" />}
        badge={<span className="pxl-chip pxl-chip--brand">{t('wtb.badge')}</span>}
        description={t('wtb.subtitle')}
        glow={false}
        action={
          <Button
            onClick={openForm}
            className="bg-warning font-bold text-surface-dark hover:bg-warning/90 hover:shadow-[0_0_20px_rgba(255,216,77,0.35)]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {t('wtb.createCta')}
          </Button>
        }
      />

      {showForm && <WtbForm onClose={() => setShowForm(false)} />}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('wtb.searchPlaceholder')}
          className="pl-9 bg-surface-light border-border"
        />
      </div>

      {/* Board */}
      {wtbQuery.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : wtbQuery.isError ? (
        <Card className="border-dashed border-border bg-surface-light/50">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold">{t('wtb.errorTitle')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('wtb.errorDesc')}</p>
            <button
              onClick={() => wtbQuery.refetch()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/10 px-4 py-1.5 text-xs font-semibold text-warning hover:bg-warning/20 transition-colors"
            >
              {t('common.retry')}
            </button>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card className="border-dashed border-border bg-surface-light/50">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold">{t('wtb.emptyTitle')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('wtb.emptyDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-fade-in">
          {requests.map((req) => (
            <WtbCard key={req.id} req={req} isOwner={user?.id === req.userId} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
