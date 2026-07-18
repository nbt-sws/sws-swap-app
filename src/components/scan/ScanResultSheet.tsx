import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  X, Sparkles, BadgeCheck, Loader2, RotateCcw, ChevronLeft,
  Store, Globe, ExternalLink, Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { GameMark } from '@/components/domain/GameMark';
import { useAddToVault } from '@/hooks/useApi';
import { pricesApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ScanResult } from '@/lib/api';
import type { CardGame } from '@/types';

interface ScanResultSheetProps {
  result: ScanResult;
  imagePreview: string;
  game: CardGame;
  onClose: () => void;
}

const GRADES = ['Raw', 'PSA 10', 'PSA 9', 'BGS 9.5', 'CGC 9.5'] as const;

/**
 * Post-scan flow (adapted from sws-scanner-app v1):
 * 1) Recheck — user confirms/corrects which card it is (their photo stays the hero)
 * 2) Market prices — per-marketplace pricing (SWS + eBay), then save to vault
 */
export function ScanResultSheet({ result, imagePreview, game, onClose }: ScanResultSheetProps) {
  const navigate = useNavigate();
  const addToVault = useAddToVault();
  const [step, setStep] = useState<1 | 2>(1);

  // Recheck state — prefilled from AI, user-editable
  const [code, setCode] = useState(result.catalog?.code || result.card.code);
  const [name, setName] = useState(result.catalog?.nameEn || result.card.nameEn);
  const [rarity, setRarity] = useState(result.catalog?.rarity || result.card.rarity);
  const [grade, setGrade] = useState<string>('Raw');

  const confidence = Math.round(result.card.confidence);

  // Catalog variants for the recheck picker (parallel rarities of the same code)
  const { data: variantsData } = useQuery({
    queryKey: ['cardVariants', result.card.code],
    queryFn: () => pricesApi.getVariants(result.card.code),
    enabled: !!result.card.code,
    staleTime: 1000 * 60 * 10,
  });
  const variants = variantsData?.variants ?? [];

  // Market prices — fetched once the user confirms the card (step 2)
  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ['marketPrices', code, name],
    queryFn: () => pricesApi.getMarketPrices({ code, name }),
    enabled: step === 2 && (!!code || !!name),
    staleTime: 1000 * 60 * 5,
  });

  const applyVariant = (v: { code: string; nameEn: string; rarity?: string }) => {
    setCode(v.code);
    setName(v.nameEn);
    if (v.rarity) setRarity(v.rarity);
  };

  const handleSave = () => {
    addToVault.mutate(
      {
        name: name.trim() || result.card.nameEn || code,
        sku: code.trim() || `SCAN-${result.hash.slice(0, 10)}`,
        category: game,
        subCategory: rarity.trim() || undefined,
        itemFormat: result.card.lang,
        condition: grade,
        // Always the user's own photo as the cover
        images: [result.imageUrl],
        metadata: {
          paidPrice: 0,
          dateAcquired: new Date().toISOString().split('T')[0],
          source: `Scan (${result.identifiedBy}, ${confidence}%)`,
          images: [result.imageUrl],
        },
      },
      {
        onSuccess: () => {
          toast.success('Saved to your vault');
          navigate({ to: '/vault' });
        },
        onError: () => toast.error('Failed to save'),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-surface-light border border-border animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surface-light/95 backdrop-blur px-5 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="rounded-lg p-1 -ml-1 hover:bg-surface-lighter" aria-label="Back">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <Sparkles className="w-4 h-4 text-brand" />
            <h2 className="font-bold">{step === 1 ? 'Confirm the card' : 'Market prices'}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-lighter" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 1 ? (
          /* ─── STEP 1: Recheck — user verifies/corrects the identification ─── */
          <div className="p-5 space-y-4">
            <div className="flex gap-4">
              {/* User's photo is the hero */}
              <div className="w-28 aspect-[63/88] rounded-xl overflow-hidden bg-surface-lighter shrink-0">
                <img src={imagePreview} alt="Your card" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <BadgeCheck className={cn('w-3.5 h-3.5', confidence >= 90 ? 'text-success' : confidence >= 70 ? 'text-warning' : 'text-pldown')} />
                  <span className={cn(confidence >= 90 ? 'text-success' : confidence >= 70 ? 'text-warning' : 'text-pldown')}>
                    {confidence}% confidence
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Check the details below — correct anything that looks off.</p>
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Code</label>
                    <Input value={code} onChange={(e) => setCode(e.target.value)} className="h-8 bg-surface border-border text-sm font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 bg-surface border-border text-sm" />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">Rarity</label>
                    <Input value={rarity} onChange={(e) => setRarity(e.target.value)} className="h-8 bg-surface border-border text-sm" placeholder="e.g. SR" />
                  </div>
                </div>
              </div>
            </div>

            {/* Catalog variants (same code, different parallel/rarity) */}
            {variants.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Pencil className="w-3 h-3" />
                  Variants in catalog — tap to use:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map((v, i) => (
                    <button
                      key={`${v.code}-${v.rarity}-${i}`}
                      type="button"
                      onClick={() => applyVariant(v)}
                      className={cn(
                        'px-2.5 py-1.5 rounded-lg text-xs border transition-all',
                        code === v.code && rarity === v.rarity
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {v.nameEn}{v.rarity ? ` · ${v.rarity}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full bg-brand hover:bg-brand-light h-11" onClick={() => setStep(2)}>
              Looks right — see prices
            </Button>
          </div>
        ) : (
          /* ─── STEP 2: Market prices per marketplace ─── */
          <div className="p-5 space-y-4">
            {/* Confirmed identity strip */}
            <div className="flex items-center gap-3 rounded-xl bg-surface border border-border p-3">
              <GameMark game={game} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-muted-foreground truncate">{code || '—'}</p>
                <p className="text-sm font-semibold truncate">{name}</p>
              </div>
              {rarity && <Badge variant="outline" className="text-[10px] shrink-0">{rarity}</Badge>}
            </div>

            {pricesLoading ? (
              <div className="space-y-2.5">
                <Skeleton className="h-16 w-full rounded-xl shimmer" />
                <Skeleton className="h-16 w-full rounded-xl shimmer" />
              </div>
            ) : (
              <>
                {/* SWS market */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-surface border-b border-border">
                    <Store className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold">SwibSwap Market</span>
                  </div>
                  <div className="px-3.5 py-3">
                    {prices?.sws.count ? (
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">{prices.sws.count} live listing{prices.sws.count > 1 ? 's' : ''}</span>
                        <span className="font-mono font-bold text-brand">฿{prices.sws.floor?.toLocaleString()} floor</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No listings on our market yet — yours could be the first.</p>
                    )}
                  </div>
                </div>

                {/* eBay */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-surface border-b border-border">
                    <Globe className="w-4 h-4 text-cyan" />
                    <span className="text-xs font-semibold">eBay</span>
                    {prices?.ebay.count ? <span className="text-[10px] text-muted-foreground">({prices.ebay.count} listings)</span> : null}
                  </div>
                  <div className="px-3.5 py-3 space-y-2.5">
                    {prices?.ebay.thb ? (
                      <>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Low</p>
                            <p className="text-sm font-bold font-mono">฿{prices.ebay.thb.min.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Median</p>
                            <p className="text-sm font-bold font-mono text-brand">฿{prices.ebay.thb.median.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">High</p>
                            <p className="text-sm font-bold font-mono">฿{prices.ebay.thb.max.toLocaleString()}</p>
                          </div>
                        </div>
                        {prices.ebay.items.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {prices.ebay.items.slice(0, 3).map((it, i) => (
                              <a
                                key={i}
                                href={it.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1.5 hover:bg-surface-lighter transition-colors group"
                              >
                                <span className="flex-1 min-w-0 text-xs text-muted-foreground truncate group-hover:text-foreground">{it.title}</span>
                                <span className="text-xs font-mono shrink-0">${it.price.toLocaleString()}</span>
                                <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No eBay listings found for this card.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Grade picker */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Condition</p>
              <div className="flex flex-wrap gap-1.5">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                      grade === g
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button
                className="flex-1 bg-brand hover:bg-brand-light h-11"
                onClick={handleSave}
                disabled={addToVault.isPending}
              >
                {addToVault.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save to vault
              </Button>
              <Button variant="outline" className="border-border h-11" onClick={onClose}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Scan again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
