import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  X, Sparkles, BadgeCheck, Loader2, RotateCcw, ChevronLeft,
  Store, Globe, ExternalLink, Pencil, CheckCircle2, ShieldCheck, Zap, ImageIcon, CircleHelp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { GameMark } from '@/components/domain/GameMark';
import { useAddToVault } from '@/hooks/useApi';
import { pricesApi, describeIdentifiedBy } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ScanResult, ScanCandidate } from '@/lib/api';
import type { CardGame } from '@/types';

interface ScanResultSheetProps {
  result: ScanResult;
  imagePreview: string;
  game: CardGame;
  onClose: () => void;
}

/** Grade tiers with live eBay data — tile accents adapted from the old CurrentValueHero. */
const TIER_TILES = [
  { grade: 'Raw', key: 'raw', label: 'RAW', accent: 'text-brand', bar: 'bg-brand', ring: 'border-brand' },
  { grade: 'PSA 10', key: 'psa10', label: 'PSA 10', accent: 'text-cyan', bar: 'bg-cyan', ring: 'border-cyan' },
  { grade: 'PSA 9', key: 'psa9', label: 'PSA 9', accent: 'text-periwinkle', bar: 'bg-periwinkle', ring: 'border-periwinkle' },
] as const;

/** Grades without a live tier — plain chips. */
const OTHER_GRADES = ['BGS 9.5', 'CGC 9.5'] as const;

/**
 * Post-scan flow (adapted from sws-scanner-app v1):
 * 1) Recheck — confirm/correct the card, pick a near-match if the AI missed, choose the cover image
 * 2) Market prices — per-marketplace + per-grade tiers (Raw / PSA 10 / PSA 9), then save to vault
 */
export function ScanResultSheet({ result, imagePreview, game, onClose }: ScanResultSheetProps) {
  const navigate = useNavigate();
  const addToVault = useAddToVault();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const idInfo = describeIdentifiedBy(result.identifiedBy);

  // Recheck state — prefilled from AI, user-editable
  const [code, setCode] = useState(result.catalog?.code || result.card.code);
  const [name, setName] = useState(result.catalog?.nameEn || result.card.nameEn);
  const [rarity, setRarity] = useState(result.catalog?.rarity || result.card.rarity);
  const [grade, setGrade] = useState<string>('Raw');
  // Cover image — user's photo by default, official samples selectable
  const [coverUrl, setCoverUrl] = useState(result.imageUrl);

  const confidence = Math.round(result.card.confidence);

  // Alternatives when the identification looks wrong: catalog near-matches + AI candidates
  const alternatives: ScanCandidate[] = (() => {
    const seen = new Set<string>([String(result.card.code).toUpperCase()]);
    const out: ScanCandidate[] = [];
    for (const c of [...(result.nearMatches ?? []), ...(result.candidates ?? [])]) {
      const k = String(c.code).toUpperCase();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(c);
    }
    return out.slice(0, 6);
  })();

  // Cover image choices — user's photo first, then official/catalog samples
  const imageOptions = result.imageOptions?.length
    ? result.imageOptions
    : [{ url: result.imageUrl, label: 'your-photo' }];

  // Catalog variants for the recheck picker (parallel rarities of the same code)
  const { data: variantsData } = useQuery({
    queryKey: ['cardVariants', code],
    queryFn: () => pricesApi.getVariants(code),
    enabled: !!code,
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

  const applyCandidate = (c: ScanCandidate) => {
    setCode(c.code);
    if (c.nameEn) setName(c.nameEn);
    if (c.rarity) setRarity(c.rarity);
    // Switch the cover to the official sample if one exists — user can switch back below
    if (c.imageUrl) setCoverUrl(c.imageUrl);
  };

  const handleSave = () => {
    const images = coverUrl === result.imageUrl ? [result.imageUrl] : [coverUrl, result.imageUrl];
    addToVault.mutate(
      {
        name: name.trim() || result.card.nameEn || code,
        sku: code.trim() || `SCAN-${result.hash.slice(0, 10)}`,
        category: game,
        subCategory: rarity.trim() || undefined,
        itemFormat: result.card.lang,
        condition: grade,
        images,
        metadata: {
          paidPrice: 0,
          dateAcquired: new Date().toISOString().split('T')[0],
          source: `Scan (${result.identifiedBy}, ${confidence}%)`,
          images,
        },
      },
      {
        onSuccess: () => {
          toast.success('Saved to your vault');
          setStep(3);
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
        {/* Header + stepper */}
        <div className="sticky top-0 z-10 bg-surface-light/95 backdrop-blur px-5 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step === 2 && (
                <button onClick={() => setStep(1)} className="rounded-lg p-1 -ml-1 hover:bg-surface-lighter" aria-label="Back">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <Sparkles className="w-4 h-4 text-brand" />
              <h2 className="font-bold">
                {step === 1 ? 'Confirm the card' : step === 2 ? 'Market prices' : 'Saved'}
              </h2>
              {result.cached && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan/15 text-cyan text-[10px] font-bold px-2 py-0.5">
                  <Zap className="w-3 h-3" />
                  Instant
                </span>
              )}
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-lighter" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mt-3">
            {['Confirm', 'Prices', 'Saved'].map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={cn(
                    'w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center',
                    done ? 'bg-success text-white' : active ? 'bg-brand text-white' : 'bg-surface-lighter text-muted-foreground'
                  )}>
                    {done ? <CheckCircle2 className="w-3 h-3" /> : n}
                  </span>
                  <span className={cn('text-[10px]', active ? 'text-foreground font-medium' : 'text-muted-foreground')}>{label}</span>
                  {n < 3 && <div className="w-4 h-px bg-border" />}
                </div>
              );
            })}
          </div>
        </div>

        {step === 1 && (
          /* ─── STEP 1: Recheck — user verifies/corrects the identification ─── */
          <div className="p-5 space-y-4">
            <div className="flex gap-4">
              {/* User's photo is the hero */}
              <div className="w-28 aspect-[63/88] rounded-xl overflow-hidden bg-surface-lighter shrink-0">
                <img src={imagePreview} alt="Your card" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <BadgeCheck className={cn('w-3.5 h-3.5', confidence >= 90 ? 'text-success' : confidence >= 70 ? 'text-warning' : 'text-pldown')} />
                  <span className={cn(confidence >= 90 ? 'text-success' : confidence >= 70 ? 'text-warning' : 'text-pldown')}>
                    {confidence}%
                  </span>
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                    idInfo.verified ? 'bg-success/10 text-success' : 'bg-surface-lighter text-muted-foreground'
                  )}>
                    {idInfo.verified && <ShieldCheck className="w-3 h-3" />}
                    {idInfo.label}
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

            {/* AI ↔ image-search disagreement — offer the vision code as a one-tap fix */}
            {result.crossCheck?.visionCode && !result.crossCheck?.agreed &&
              result.crossCheck.visionCode !== result.card.code && (
              <div className="rounded-xl border border-warning/40 bg-warning/5 p-3 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-warning">AI and image search disagree</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Card recognition picked <span className="font-mono text-foreground">{result.card.code}</span>,
                  but reverse-image search found <span className="font-mono text-cyan">{result.crossCheck.visionCode}</span>.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-warning/40 text-warning hover:bg-warning/10"
                  onClick={() => setCode(result.crossCheck!.visionCode!)}
                >
                  Use {result.crossCheck.visionCode} instead
                </Button>
              </div>
            )}

            {/* Not this card? — near matches from catalog + AI candidates */}
            {alternatives.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <CircleHelp className="w-3 h-3" />
                  Not this card? Similar matches:
                </p>
                <div className="space-y-1.5">
                  {alternatives.map((c) => {
                    const active = code.toUpperCase() === c.code.toUpperCase();
                    return (
                      <button
                        key={`${c.source}-${c.code}`}
                        type="button"
                        onClick={() => applyCandidate(c)}
                        className={cn(
                          'w-full flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all',
                          active
                            ? 'border-brand bg-brand/10'
                            : 'border-border bg-surface hover:bg-surface-lighter'
                        )}
                      >
                        <div className="w-8 aspect-[63/88] rounded overflow-hidden bg-surface-lighter shrink-0 flex items-center justify-center">
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt={c.code} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn('text-xs font-mono truncate', active ? 'text-brand' : 'text-muted-foreground')}>{c.code}</p>
                          <p className="text-xs font-medium truncate">{c.nameEn || '—'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {c.rarity && <Badge variant="outline" className="text-[9px] px-1.5 py-0">{c.rarity}</Badge>}
                          <span className={cn(
                            'text-[9px] font-medium',
                            c.source === 'catalog' ? 'text-cyan' : 'text-muted-foreground'
                          )}>
                            {c.source === 'catalog' ? 'Catalog' : c.confidence ? `AI ${Math.round(c.confidence)}%` : 'AI'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Catalog variants (same code, different parallel/rarity) — image grid like the old VariantPicker */}
            {variants.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Pencil className="w-3 h-3" />
                  {variants.length} printings in catalog — tap the one that matches your card:
                </p>
                {variants.some((v) => v.imageUrl) ? (
                  <div className="grid grid-cols-3 gap-2">
                    {variants.map((v, i) => {
                      const active = code === v.code && rarity === v.rarity;
                      return (
                        <button
                          key={`${v.code}-${v.rarity}-${i}`}
                          type="button"
                          onClick={() => applyVariant(v)}
                          className={cn(
                            'rounded-xl border p-1.5 transition-all flex flex-col items-center gap-1',
                            active ? 'border-brand bg-brand/10' : 'border-border bg-surface hover:bg-surface-lighter'
                          )}
                        >
                          <div className="w-full aspect-[63/88] rounded-lg overflow-hidden bg-surface-lighter flex items-center justify-center">
                            {v.imageUrl ? (
                              <img src={v.imageUrl} alt={v.rarity || v.code} className="w-full h-full object-contain" loading="lazy" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className={cn('text-[10px] font-mono font-semibold', active ? 'text-brand' : 'text-muted-foreground')}>
                            {v.rarity || '—'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {/* Cover image — pick the user's photo or an official sample */}
            {imageOptions.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Cover image:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imageOptions.map((opt) => {
                    const active = coverUrl === opt.url;
                    return (
                      <button
                        key={opt.url}
                        type="button"
                        onClick={() => setCoverUrl(opt.url)}
                        className={cn(
                          'relative w-16 aspect-[63/88] rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                          active ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
                        )}
                      >
                        <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" loading="lazy" />
                        <span className={cn(
                          'absolute bottom-0 inset-x-0 text-[8px] font-medium text-center py-0.5 backdrop-blur-sm truncate px-0.5',
                          active ? 'bg-brand/80 text-white' : 'bg-black/60 text-white/80'
                        )}>
                          {opt.label === 'your-photo' ? 'Your photo' : opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button className="w-full bg-brand hover:bg-brand-light h-11" onClick={() => setStep(2)}>
              Looks right — see prices
            </Button>
          </div>
        )}

        {step === 2 && (
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

            {/* Current value by grade — tier tiles adapted from the old CurrentValueHero */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Current value · by grade</p>
              <div className="grid grid-cols-3 gap-2">
                {TIER_TILES.map((t) => {
                  const tier = prices?.tiers?.[t.key];
                  const active = grade === t.grade;
                  const thb = tier?.thb;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setGrade(t.grade)}
                      className={cn(
                        'relative min-w-0 rounded-xl border bg-surface px-2.5 pb-2.5 pt-3 text-left overflow-hidden transition-all',
                        active ? cn(t.ring, 'bg-surface-lighter') : 'border-border hover:bg-surface-lighter/60'
                      )}
                    >
                      <span className={cn('absolute top-0 inset-x-0 h-0.5', t.bar)} />
                      <span className="block text-[9px] font-bold tracking-wider text-muted-foreground">{t.label}</span>
                      {pricesLoading ? (
                        <span className="block h-6 w-4/5 mt-1.5 rounded shimmer bg-surface-lighter" />
                      ) : thb ? (
                        <>
                          <span className={cn('block text-base font-bold font-mono leading-tight mt-1 truncate', t.accent)}>
                            ฿{thb.median.toLocaleString()}
                          </span>
                          <span className="block text-[9px] font-mono text-muted-foreground mt-0.5 truncate">
                            median · {tier!.count} listings
                          </span>
                          {thb.max > thb.min && (
                            <span className="block mt-2">
                              <span className="relative block h-1 rounded-full bg-surface-lighter">
                                <span className={cn('absolute inset-0 rounded-full opacity-40', t.bar)} />
                                <span
                                  className="absolute -top-0.5 -bottom-0.5 w-0.5 rounded-full bg-foreground"
                                  style={{ left: `${Math.min(100, Math.max(0, ((thb.median - thb.min) / (thb.max - thb.min)) * 100))}%` }}
                                />
                              </span>
                              <span className="flex justify-between mt-1 text-[8px] font-mono text-muted-foreground">
                                <span>฿{thb.min.toLocaleString()}</span>
                                <span>฿{thb.max.toLocaleString()}</span>
                              </span>
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="block text-[10px] text-muted-foreground mt-2 pb-1">No sales found</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Other conditions without live tier data */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground mr-0.5">Other:</span>
                {OTHER_GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all',
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
                    {/* Outbound links — same fallback links the old scanner offered */}
                    {(code || name) && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent([code, name].filter(Boolean).join(' '))}&LH_Sold=1&LH_Complete=1`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-cyan hover:bg-surface-lighter transition-colors"
                        >
                          Sold history
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent([code, name].filter(Boolean).join(' '))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-brand hover:bg-surface-lighter transition-colors"
                        >
                          Current listings
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

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

        {/* ─── STEP 3: Saved — journey completion ─── */}
        {step === 3 && (
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">is now in your vault</p>
            </div>
            <div className="w-24 aspect-[63/88] rounded-xl overflow-hidden bg-surface-lighter">
              <img src={coverUrl} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="w-full flex gap-2.5 pt-1">
              <Button className="flex-1 bg-brand hover:bg-brand-light h-11" onClick={() => navigate({ to: '/vault' })}>
                View in vault
              </Button>
              <Button variant="outline" className="border-border h-11" onClick={onClose}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Scan next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
