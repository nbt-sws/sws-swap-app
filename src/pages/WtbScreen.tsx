import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import {
  HandCoins, Plus, Search, SearchX, X, CheckCircle2, Trash2, Target,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GameMark } from '@/components/domain/GameMark';
import { useAuthStore } from '@/stores/auth';
import {
  timeAgo, useCreateWtb, useDeleteWtb, useWtbList, useWtbSetStatus,
} from '@/features/feed/useFeed';
import type { WtbRequest } from '@/lib/api';

/* ══════════════════════════════════════════════════════════════════
   WTB Board (Phase 2) — collectors post "want to buy" requests; shops
   browse demand. Live API only (migration 009); errors show a retry card.
   ══════════════════════════════════════════════════════════════════ */

function WtbCard({ req, isOwner }: { req: WtbRequest; isOwner: boolean }) {
  const { t } = useTranslation();
  const setStatus = useWtbSetStatus();
  const remove = useDeleteWtb();

  return (
    <Card className="neon-card group relative overflow-hidden border-border/60 bg-surface-light/80">
      {/* Pixel corner accent */}
      <div className="absolute top-0 right-0 h-3 w-3 bg-warning/60 pxl-corner" aria-hidden="true" />
      <CardContent className="p-4 sm:p-5">
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

        {req.note && (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">{req.note}</p>
        )}

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

  const submit = () => {
    if (!cardName.trim()) return;
    create.mutate(
      {
        cardName: cardName.trim(),
        cardCode: cardCode.trim() || undefined,
        game: game.trim() || undefined,
        targetPrice: targetPrice ? Number(targetPrice) : undefined,
        condition: condition.trim() || undefined,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('wtb.posted'));
          onClose();
        },
        onError: () => toast.error(t('wtb.postFailed')),
      }
    );
  };

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
        <Button
          onClick={submit}
          disabled={!cardName.trim() || create.isPending}
          className="w-full bg-warning text-surface-dark hover:bg-warning/90 font-bold"
        >
          {t('wtb.formSubmit')}
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
      {/* Hero — surreal mesh + neon title + pixel accent */}
      <header className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface-light/60 px-5 py-6 sm:px-7">
        <div className="surreal-mesh absolute inset-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-3 w-3 bg-brand/60 pxl-corner" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <HandCoins className="h-5 w-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t('wtb.title')}
              </h1>
              <span className="pxl-chip pxl-chip--brand">{t('wtb.badge')}</span>
            </div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{t('wtb.subtitle')}</p>
          </div>
          <Button
            onClick={openForm}
            className="bg-warning font-bold text-surface-dark hover:bg-warning/90 hover:shadow-[0_0_20px_rgba(255,216,77,0.35)]"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {t('wtb.createCta')}
          </Button>
        </div>
      </header>

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
