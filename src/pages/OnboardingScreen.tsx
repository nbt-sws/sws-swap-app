import { useState } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronRight, ChevronLeft, Check, Store } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GameMark } from '@/components/domain/GameMark';
import { ShopAvatar } from '@/features/feed/PostCard';
import { cn } from '@/lib/utils';
import {
  useStores, useFollowedSellers, useFollowSeller, useUnfollowSeller,
} from '@/hooks/useApi';

/* ══════════════════════════════════════════════════════════════════
   Onboarding (Phase B) — shown right after registration.
   Step 1: pick favorite games (persisted locally for personalization)
   Step 2: follow suggested shops (real follows via API)
   Step 3: KYC nudge (feed/vault unlock)
   ══════════════════════════════════════════════════════════════════ */

const FAV_GAMES_KEY = 'sws-fav-games';
const TOTAL_STEPS = 3;

const GAMES: { id: string; name: string }[] = [
  { id: 'pokemon', name: 'Pokémon' },
  { id: 'one-piece', name: 'One Piece' },
  { id: 'yu-gi-oh', name: 'Yu-Gi-Oh!' },
  { id: 'lorcana', name: 'Lorcana' },
  { id: 'conan', name: 'Conan' },
];

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all',
            i === current ? 'w-6 bg-brand shadow-glow' : i < current ? 'w-1.5 bg-brand/50' : 'w-1.5 bg-border'
          )}
        />
      ))}
    </div>
  );
}

function GamesStep({ selected, toggle }: { selected: Set<string>; toggle: (id: string) => void }) {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center neon-text-brand">
        {t('onboarding.games.title')}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm mx-auto">
        {t('onboarding.games.subtitle')}
      </p>
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 stagger-fade-in">
        {GAMES.map((g) => {
          const active = selected.has(g.id);
          return (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              aria-pressed={active}
              className={cn(
                'relative flex flex-col items-center gap-2.5 rounded-2xl border-2 p-5 transition-all',
                active
                  ? 'border-brand bg-brand/10 shadow-glow'
                  : 'border-border bg-surface-light/60 hover:border-brand/40 hover:bg-surface-light'
              )}
            >
              <GameMark game={g.id} size="lg" />
              <span className="text-sm font-semibold">{g.name}</span>
              {active && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ShopSuggestion { id: string; name: string; avatar?: string | null }

function ShopsStep() {
  const { t } = useTranslation();
  const { data: rawSellers, isLoading } = useStores();
  const { data: followedIds = [] } = useFollowedSellers();
  const follow = useFollowSeller();
  const unfollow = useUnfollowSeller();

  const shops: ShopSuggestion[] = ((rawSellers as unknown as Record<string, unknown>[]) ?? [])
    .map((s) => ({
      id: (s.id as string) || (s.userId as string) || '',
      name: (s.name as string) || (s.displayName as string) || 'Shop',
      avatar: (s.avatarUrl as string | undefined) ?? null,
    }))
    .filter((s) => s.id)
    .slice(0, 6);

  const toggleFollow = (shopId: string) => {
    if (followedIds.includes(shopId)) unfollow.mutate(shopId);
    else follow.mutate(shopId);
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center neon-text-brand">
        {t('onboarding.shops.title')}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm mx-auto">
        {t('onboarding.shops.subtitle')}
      </p>
      <div className="mt-8 space-y-2.5 max-w-md mx-auto">
        {isLoading ? (
          <>
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </>
        ) : shops.length === 0 ? (
          <Card className="border-dashed border-border bg-surface-light/50">
            <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
              <Store className="h-5 w-5" />
              {t('onboarding.shops.empty')}
            </CardContent>
          </Card>
        ) : (
          shops.map((shop) => {
            const followed = followedIds.includes(shop.id);
            return (
              <Card key={shop.id} className="neon-card border-border/60 bg-surface-light/80">
                <CardContent className="flex items-center gap-3 p-3.5">
                  <ShopAvatar name={shop.name} avatar={shop.avatar} />
                  <span className="flex-1 truncate text-sm font-semibold">{shop.name}</span>
                  <Button
                    size="sm"
                    variant={followed ? 'outline' : 'default'}
                    onClick={() => toggleFollow(shop.id)}
                    disabled={follow.isPending || unfollow.isPending}
                    className={cn(
                      'h-8 text-xs',
                      followed ? 'border-brand/40 text-brand' : 'bg-brand hover:bg-brand-light'
                    )}
                  >
                    {followed ? t('onboarding.shops.following') : t('onboarding.shops.follow')}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function KycStep() {
  const { t } = useTranslation();
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-glow">
        <ShieldCheck className="h-10 w-10" />
      </div>
      <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight neon-text-brand">
        {t('onboarding.kyc.title')}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {t('onboarding.kyc.subtitle')}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Button asChild className="w-full max-w-xs h-12 bg-brand hover:bg-brand-light hover:shadow-glow text-base font-bold">
          <Link to="/profile/kyc">{t('onboarding.kyc.cta')}</Link>
        </Button>
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link to="/">{t('onboarding.kyc.later')}</Link>
        </Button>
      </div>
    </div>
  );
}

export function OnboardingScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [games, setGames] = useState<Set<string>>(new Set());

  const toggleGame = (id: string) =>
    setGames((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const persistGames = () => {
    try {
      localStorage.setItem(FAV_GAMES_KEY, JSON.stringify([...games]));
    } catch {
      // non-blocking — personalization only
    }
  };

  const next = () => {
    if (step === 0) persistGames();
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
    else navigate({ to: '/' });
  };

  return (
    <PageContainer size="md" className="py-10">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-surface-light/40 px-5 py-8 sm:px-10">
        <div className="surreal-mesh absolute inset-0 pointer-events-none" />
        <div className="relative space-y-8">
          <StepDots current={step} />
          <p className="text-center text-[11px] font-pixel text-muted-foreground uppercase tracking-widest">
            {t('onboarding.step', { current: step + 1, total: TOTAL_STEPS })}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && <GamesStep selected={games} toggle={toggleGame} />}
              {step === 1 && <ShopsStep />}
              {step === 2 && <KycStep />}
            </motion.div>
          </AnimatePresence>

          {step < TOTAL_STEPS - 1 && (
            <div className="flex items-center justify-between pt-2">
              {step > 0 ? (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="text-muted-foreground">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('onboarding.back')}
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="text-muted-foreground">
                  {t('onboarding.skip')}
                </Button>
              )}
              <Button onClick={next} className="bg-brand hover:bg-brand-light hover:shadow-glow font-bold">
                {t('onboarding.next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
