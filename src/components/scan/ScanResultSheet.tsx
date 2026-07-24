import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X, BadgeCheck, Loader2, RotateCcw, ChevronLeft, ChevronDown,
  Store, Globe, ExternalLink, Check, CheckCircle2, ShieldCheck, Zap, ImageIcon,
  ScanEye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { InfoTip } from '@/components/ui/info-tip';
import {
  AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription,
  AlertDialogAction, AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { GameMark } from '@/components/domain/GameMark';
import { useAddToVault } from '@/hooks/useApi';
import { pricesApi, marketApi, scanApi, scannerApi, describeIdentifiedBy } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ScanResult, ScanCandidate, ScanImageOption, CardVariant } from '@/lib/api';
import type { ApiMarketHistoryPoint } from '@/types/api';
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

/** Explicit condition choices — saved as the vault item's condition (decoupled from price tiles). */
const CONDITIONS = ['Raw', 'PSA 10', 'PSA 9', 'BGS 9.5', 'CGC 9.5'] as const;

type Ccy = 'THB' | 'USD';

/** Focusable elements inside the sheet — used by the focus trap + initial autofocus. */
const FOCUSABLE_SEL =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** SWS market price-history sparkline — adapted from the old Sparkline (cyan line + gradient fill + dots). */
function PriceSparkline({ trades }: { trades: ApiMarketHistoryPoint[] }) {
  const pts = [...trades].reverse(); // API returns newest-first; draw oldest → newest
  if (pts.length < 2) return null;
  const W = 480, H = 64, pad = 4;
  const ys = pts.map((t) => t.price);
  const max = Math.max(...ys);
  const min = Math.min(...ys);
  const range = max - min || 1;
  const coords = pts.map((t, i) => {
    const x = pad + (i / (pts.length - 1)) * (W - pad * 2);
    const y = H - pad - ((t.price - min) / range) * (H - pad * 2);
    return { x, y };
  });
  const line = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  // Accessible summary of the series (the svg is purely visual otherwise)
  const first = pts[0].price;
  const last = pts[pts.length - 1].price;
  const trend = last > first ? 'trending up' : last < first ? 'trending down' : 'flat';
  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block"
      role="img"
      aria-label={`SWS price history: ${pts.length} trades over the past year, last ฿${last.toLocaleString()}, ${trend}`}
    >
      <defs>
        <linearGradient id="scanSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4FE0D0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4FE0D0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`${pad},${H - pad} ${line} ${W - pad},${H - pad}`} fill="url(#scanSparkFill)" stroke="none" />
      <polyline points={line} fill="none" stroke="#4FE0D0" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="2.5" fill="#4FE0D0" />
      ))}
    </svg>
  );
}

/** Centering estimate panel — adapted from the old QualityResult (honest "AI estimate" label). */
function CenteringPanel({ centering }: { centering: { left: number; right: number; top: number; bottom: number } }) {
  const rows = [
    { a: 'Left', b: 'Right', av: centering.left, bv: centering.right },
    { a: 'Top', b: 'Bottom', av: centering.top, bv: centering.bottom },
  ];
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
        Centering · AI estimate
        <InfoTip label="How to read the centering estimate">
          Border width on each side, estimated from your photo. Closer to 50/50 means better centering — a plus for grading. It's an estimate, not a measurement.
        </InfoTip>
      </p>
      {rows.map((r) => (
        <div key={r.a} className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
            <span>{r.a} {Math.round(r.av)}%</span>
            <span>{r.b} {Math.round(r.bv)}%</span>
          </div>
          {/* Bidirectional marker: midpoint tick = perfect 50/50, cyan marker =
              where this card sits. Reads as a balance gauge, not a progress bar. */}
          <div
            className="relative h-1.5 rounded-full bg-surface-lighter"
            role="img"
            aria-label={`${r.a}–${r.b} balance ${Math.round(r.av)}/${Math.round(r.bv)} — closer to the center tick is better`}
          >
            <span className="absolute left-1/2 -translate-x-1/2 -top-0.5 -bottom-0.5 w-px bg-foreground/50" aria-hidden="true" />
            <span
              className="absolute -top-0.5 -bottom-0.5 w-1 -translate-x-1/2 rounded-full bg-cyan"
              style={{ left: `${r.av}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Post-scan flow (adapted from sws-scanner-app v1):
 * 1) Recheck — confirm/correct the card, pick a near-match if the AI missed, choose the cover image
 * 2) Market prices — per-grade tier tiles + per-marketplace data, then save to vault
 * 3) Saved
 * Layout: bottom sheet on mobile, wide 2-column dialog on desktop.
 * Dialog semantics are implemented in place (role/aria-modal/focus trap/Escape/inert background)
 * rather than migrating to Radix Dialog, to avoid churning the custom sheet layout.
 */
export function ScanResultSheet({ result, imagePreview, game, onClose }: ScanResultSheetProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToVault = useAddToVault();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const idInfo = describeIdentifiedBy(result.identifiedBy);
  // Plain-language explanation behind the identification-source badge (InfoTip)
  const sourceTip = (() => {
    switch (result.identifiedBy) {
      case 'vision-cross-check':
        return 'Two independent checks agreed: the AI read of your photo matched a reverse-image search on the web.';
      case 'ocr-extract':
        return 'The card code was read straight from the text in your photo.';
      case 'haiku-confident':
        return 'The AI recognized this card from your photo with high certainty.';
      default:
        return "The AI's best guess from your photo — no independent check confirmed it, so compare the details below.";
    }
  })();

  // Community sample contribution — only offered when no official image exists
  const [contributed, setContributed] = useState(false);
  const contribute = useMutation({
    mutationFn: scanApi.contribute,
    onSuccess: () => {
      setContributed(true);
      toast.success('Shared — future scans of this card will use your photo');
      queryClient.invalidateQueries({ queryKey: ['cardVariants'] });
    },
    onError: () => toast.error("We couldn't share your photo — please try again"),
  });

  // Recheck state — prefilled from AI, user-editable
  const [code, setCode] = useState(result.catalog?.code || result.card.code);
  const [name, setName] = useState(result.catalog?.nameEn || result.card.nameEn);
  const [rarity, setRarity] = useState(result.catalog?.rarity || result.card.rarity);
  // Explicit condition — saved to the vault. ONLY changed via the condition selector, never by price tiles.
  const [grade, setGrade] = useState<string>('Raw');
  // Which tier tile is visually highlighted on the prices step — display-only, never saved
  const [viewTier, setViewTier] = useState<string>('Raw');
  // Cover image — user's photo by default, official samples selectable
  const [coverUrl, setCoverUrl] = useState(result.imageUrl);
  // Any manual correction marks the result "Edited" (old scanner showed an Edited pill)
  const [edited, setEdited] = useState(false);
  // Display currency for the prices step (old CurrencyPills)
  const [ccy, setCcy] = useState<Ccy>(() => (localStorage.getItem('sws_scan_ccy') === 'USD' ? 'USD' : 'THB'));
  // Discard guard — intercepts backdrop/X/Escape when corrections would be lost
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const confidence = Math.round(result.card.confidence);
  // High-confidence hits collapse the "Not this card?" wall behind a disclosure;
  // low-confidence scans stay expanded (disambiguation mode)
  const [altsOpen, setAltsOpen] = useState(confidence < 90);

  // Photo & quality disclosure (step-1 mobile density) — collapsed by default,
  // expanded only when the centering estimate is notably off (worst side < 45%)
  const centeringWorst = result.card.centering
    ? Math.min(
        result.card.centering.left,
        result.card.centering.right,
        result.card.centering.top,
        result.card.centering.bottom
      )
    : 50;
  const [detailsOpen, setDetailsOpen] = useState(centeringWorst < 45);
  // Optional "what did you pay?" — left blank means NOT recorded (never saved as 0)
  const [paidPrice, setPaidPrice] = useState('');

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

  // Scanner-service health — shared cache with ScanScreen (['scannerHealth']).
  // When unconfigured every scanner enhancement below degrades silently to the
  // pre-existing behavior.
  const { data: scannerHealth } = useQuery({
    queryKey: ['scannerHealth'],
    queryFn: () => scannerApi.health(),
    staleTime: 60_000,
    retry: 1,
  });
  const scannerConfigured = !!scannerHealth?.scanner.configured;

  // Official card details → extra cover-image choices (spec §C.2)
  const { data: opDetails } = useQuery({
    queryKey: ['scannerOpDetails', code],
    queryFn: () => scannerApi.opDetails(code.trim()),
    enabled: scannerConfigured && !!code.trim(),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  // Cover image choices — user's photo FIRST (it's their own scan), then the
  // scanner's official images (watermarked → sample → official mirror), then
  // the pre-existing community/catalog fills. Deduped by URL; unchanged when
  // the scanner is unconfigured or the details call failed.
  const imageOptions = useMemo<ScanImageOption[]>(() => {
    const base: ScanImageOption[] = result.imageOptions?.length
      ? result.imageOptions
      : [{ url: result.imageUrl, label: 'your-photo' }];
    const d = scannerConfigured ? opDetails?.details : null;
    if (!d) return base;
    const isOwn = (o: ScanImageOption) => o.label === 'your-photo' || o.url === result.imageUrl;
    const seen = new Set(base.map((o) => o.url));
    const official: ScanImageOption[] = [];
    const push = (url: string | undefined, label: string) => {
      if (url && !seen.has(url)) {
        seen.add(url);
        official.push({ url, label });
      }
    };
    push(d.watermarkedSampleUrl, 'official-sample');
    push(d.sampleImageUrl, 'official-sample');
    push(d.officialImageUrl, 'official');
    return [...base.filter(isOwn), ...official, ...base.filter((o) => !isOwn(o))];
  }, [result.imageOptions, result.imageUrl, opDetails, scannerConfigured]);

  // The hero shows the *selected* cover; the local preview stands in for the user's own photo
  const heroSrc = coverUrl === result.imageUrl ? imagePreview : coverUrl;
  // No official/sample image anywhere → the user can contribute theirs
  const canContribute = !contributed && imageOptions.length === 1 && !!code.trim();

  // Printings for the recheck picker — scanner service first (official variants,
  // image precedence handled server-side). The legacy catalog query stays
  // disabled until the scanner path settles empty/errored, so the two never
  // fetch in parallel (spec §C.3).
  const scannerVariantsQ = useQuery({
    queryKey: ['scannerOpVariants', code],
    queryFn: () => scannerApi.opVariants(code.trim()),
    enabled: scannerConfigured && !!code.trim(),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
  const scannerVariants = scannerVariantsQ.data?.variants ?? [];
  const scannerPathEmpty =
    scannerVariantsQ.isError || (scannerVariantsQ.isSuccess && scannerVariants.length === 0);
  const useScannerVariants = scannerConfigured && scannerVariants.length > 0;
  const { data: variantsData } = useQuery({
    queryKey: ['cardVariants', code],
    queryFn: () => pricesApi.getVariants(code),
    enabled: !!code && (!scannerConfigured || scannerPathEmpty),
    staleTime: 1000 * 60 * 10,
  });
  const variants: CardVariant[] = useScannerVariants
    ? scannerVariants.map((v) => ({ code: v.code, nameEn: v.name, rarity: v.rarity, imageUrl: v.imageUrl ?? undefined }))
    : (variantsData?.variants ?? []);

  // Visual-match: let the user compare their photo against variant images to find the
  // right printing. Degrades silently when the scanner is unconfigured or fails.
  const visualMatch = useMutation({
    mutationFn: () => {
      const candidates = variants
        .filter((v): v is CardVariant & { imageUrl: string; code: string } => !!v.imageUrl && !!v.code)
        .map((v) => ({ id: v.code, imageUrl: v.imageUrl }));
      return scannerApi.visualMatch({ image: imagePreview, candidates, haikuConfirm: true });
    },
    onSuccess: (res) => {
      const r = res.result;
      if (!r) {
        toast.error('Auto-match unavailable — please pick the printing manually');
        return;
      }
      const matchedId = r.bestMatch?.matched
        ? r.bestMatch.id
        : r.haikuConfirmation
          ? r.haikuConfirmation.matchId
          : undefined;
      if (matchedId) {
        const matched = variants.find((v) => v.code === matchedId);
        if (matched) {
          applyVariant(matched);
          toast.success('Matched the printing from your photo');
          return;
        }
      }
      if (r.degraded || !r.confident) {
        toast('No confident photo match — please choose the printing yourself', { icon: <ScanEye className="w-4 h-4" /> });
      } else {
        toast('Auto-match finished — please confirm the best printing', { icon: <ScanEye className="w-4 h-4" /> });
      }
    },
    onError: () => toast.error('Photo matching failed — please pick the printing manually'),
  });
  const canVisualMatch = scannerConfigured && variants.filter((v) => v.imageUrl).length >= 2;

  // Market prices — fetched once the user confirms the card (step 2)
  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ['marketPrices', code, name],
    queryFn: () => pricesApi.getMarketPrices({ code, name }),
    enabled: step === 2 && (!!code || !!name),
    staleTime: 1000 * 60 * 5,
  });

  // Our own market's sold history → sparkline (old TradingHistory had one for eBay)
  const { data: history } = useQuery({
    queryKey: ['scanPriceHistory', code],
    queryFn: () => marketApi.getHistory(code, '1y'),
    enabled: step === 2 && !!code,
    staleTime: 1000 * 60 * 5,
  });
  const trades = history?.trades ?? [];

  // Step-1 "Photo & quality details" — cover picker + centering panel. Shared by the
  // collapsed-by-default mobile disclosure and the always-visible desktop column.
  const coverPicker = imageOptions.length > 1 && (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground">
        Choose a cover image:
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
                'relative w-14 aspect-[63/88] rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                active ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <img src={opt.url === result.imageUrl ? imagePreview : opt.url} alt={opt.label} className="w-full h-full object-cover" loading="lazy" />
              <span className={cn(
                'absolute bottom-0 inset-x-0 text-[11px] font-medium text-center py-0.5 backdrop-blur-sm truncate px-0.5',
                active ? 'bg-brand/80 text-white' : 'bg-black/60 text-white/80'
              )}>
                {opt.label === 'your-photo' ? 'Yours' : opt.label}
              </span>
            </button>
          );
        })}
        </div>
      </div>
  );
  const centeringPanel = result.card.centering && <CenteringPanel centering={result.card.centering} />;
  const hasQualityDetails = !!(coverPicker || centeringPanel);

  // ─── Dialog semantics (in place of a Radix Dialog migration) ───────────────
  const sheetRef = useRef<HTMLDivElement>(null);
  // Refs keep the []-deps effects below from going stale
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dirtyRef = useRef(false);
  dirtyRef.current = edited && step !== 3;
  const confirmOpenRef = useRef(confirmDiscard);
  confirmOpenRef.current = confirmDiscard;

  // Intercept any close that would silently destroy corrections (backdrop, X, Escape)
  const requestClose = () => {
    if (dirtyRef.current) setConfirmDiscard(true);
    else onCloseRef.current();
  };

  // Autofocus the dialog container on open (NOT the X button — screen readers
  // get the dialog label + result summary first); restore focus on close
  useEffect(() => {
    const prev = document.activeElement;
    const el = sheetRef.current;
    el?.focus();
    return () => {
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, []);

  // Escape (routed through the discard guard) + Tab focus trap within the sheet
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmOpenRef.current) return; // the discard dialog handles its own Escape
        e.preventDefault();
        if (dirtyRef.current) setConfirmDiscard(true);
        else onCloseRef.current();
        return;
      }
      if (e.key === 'Tab') {
        const el = sheetRef.current;
        if (!el || confirmOpenRef.current) return;
        const f = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SEL)).filter(
          (n) => n.offsetParent !== null
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        const active = document.activeElement;
        if (e.shiftKey) {
          if (active === first || !el.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else if (active === last || !el.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Inert + aria-hide everything outside the sheet while it's open — page content,
  // and crucially the fixed BottomNav (z-50) which otherwise overlays the sheet
  // footer on mobile and intercepts pointer events. Sonner toasts and our own
  // backdrop layer (click-to-close target) are exempt.
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const touched: { sib: Element; inert: boolean; aria: string | null }[] = [];
    let node: Element = el;
    while (node.parentElement) {
      const parent: Element = node.parentElement;
      for (const sib of Array.from(parent.children)) {
        if (sib === node || sib.hasAttribute('data-sonner-toaster') || sib.hasAttribute('data-scan-backdrop')) continue;
        touched.push({ sib, inert: sib.hasAttribute('inert'), aria: sib.getAttribute('aria-hidden') });
        sib.setAttribute('inert', '');
        sib.setAttribute('aria-hidden', 'true');
      }
      node = parent;
      if (parent === document.body) break;
    }
    return () => {
      for (const t of touched) {
        if (!t.inert) t.sib.removeAttribute('inert');
        if (t.aria === null) t.sib.removeAttribute('aria-hidden');
        else t.sib.setAttribute('aria-hidden', t.aria);
      }
    };
  }, []);
  // ───────────────────────────────────────────────────────────────────────────

  // Enter advances to prices ONLY from the code field — the deliberate
  // "correct the code, hit Enter, see prices" keyboard path. Name/rarity no
  // longer jump steps implicitly (accidental advances were reported).
  const enterToPrices = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setStep(2);
    }
  };

  const pickCcy = (c: Ccy) => {
    setCcy(c);
    localStorage.setItem('sws_scan_ccy', c);
  };

  const applyVariant = (v: { code: string; nameEn: string; rarity?: string }) => {
    setCode(v.code);
    setName(v.nameEn);
    if (v.rarity) setRarity(v.rarity);
    setEdited(true);
  };

  const applyCandidate = (c: ScanCandidate) => {
    setCode(c.code);
    if (c.nameEn) setName(c.nameEn);
    if (c.rarity) setRarity(c.rarity);
    // Switch the cover to the official sample if one exists — user can switch back below
    if (c.imageUrl) setCoverUrl(c.imageUrl);
    setEdited(true);
  };

  const handleSave = () => {
    const images = coverUrl === result.imageUrl ? [result.imageUrl] : [coverUrl, result.imageUrl];
    // paidPrice is optional: only written when the user entered one — never 0-by-default
    const paid = parseFloat(paidPrice);
    const paidRecorded = Number.isFinite(paid) && paid > 0;
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
          ...(paidRecorded ? { paidPrice: paid } : {}),
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
        onError: () => toast.error("Couldn't save to your vault — please try again"),
      }
    );
  };

  // Price formatter honoring the currency toggle — eBay data arrives as paired USD/THB
  const fmt = (usd: number, thb: number) =>
    ccy === 'THB' ? `฿${Math.round(thb).toLocaleString()}` : `$${usd.toLocaleString()}`;

  // Individual eBay items carry a USD price only — convert via the response's rate
  // when THB is active; otherwise show the honest USD value (labelled below).
  const fmtEbayItem = (price: number) => {
    if (ccy === 'THB' && prices?.ebay.thb) {
      return `฿${Math.round(price * prices.ebay.thb.rate).toLocaleString()}`;
    }
    return `$${price.toLocaleString()}`;
  };

  const stepLabel = step === 1 ? 'Confirm the card' : step === 2 ? 'Market prices' : 'Saved';

  // Saved-step echo — chosen condition + market median for THAT condition when we
  // have tier data for it (BGS/CGC have no eBay tier), plus what was paid.
  const savedTierKey = grade === 'Raw' ? 'raw' : grade === 'PSA 10' ? 'psa10' : grade === 'PSA 9' ? 'psa9' : null;
  const savedTier = savedTierKey ? prices?.tiers?.[savedTierKey] : undefined;
  const savedMedian = savedTier?.usd && savedTier?.thb ? fmt(savedTier.usd.median, savedTier.thb.median) : null;
  const paidEcho = (() => {
    const p = parseFloat(paidPrice);
    return Number.isFinite(p) && p > 0 ? `paid ฿${Math.round(p).toLocaleString()}` : 'price not recorded';
  })();

  return (
    <>
      {/* Backdrop — own fixed layer at z-[55]: ABOVE the app BottomNav (z-50) so the
          nav is dimmed and visually blocked, but BELOW the sheet (z-[60]). Stronger
          opacity on mobile, where the 92vh sheet leaves the nav peeking at the edge. */}
      <div
        data-scan-backdrop
        className="fixed inset-0 z-[55] bg-black/80 sm:bg-black/60 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
        onClick={requestClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Scan result — ${stepLabel}`}
          aria-describedby="scan-result-summary"
          tabIndex={-1}
          className="pointer-events-auto relative w-full sm:max-w-2xl lg:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-surface-light border border-border animate-slide-up motion-reduce:animate-none outline-none"
        >
        {/* Screen-reader result summary — referenced by aria-describedby on the dialog */}
        <p id="scan-result-summary" className="sr-only">
          Scan result: {name || result.card.nameEn}, {confidence}% confident. Step {step} of 3 — {stepLabel}.
        </p>
        {/* Header + stepper */}
        <div className="sticky top-0 z-10 bg-surface-light/95 backdrop-blur px-5 pt-4 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step === 2 && (
                <button onClick={() => setStep(1)} className="rounded-lg p-1 -ml-1 hover:bg-surface-lighter" aria-label="Back">
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="font-bold">{stepLabel}</h2>
              {result.cached && (
                <span className="pxl-chip pxl-chip--cyan">
                  <Zap className="w-3 h-3" aria-hidden="true" />
                  Instant
                  <InfoTip label="Why this result was instant">
                    Result from a previous identical scan — no new API call was needed.
                  </InfoTip>
                </span>
              )}
              {edited && step === 1 && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-warning/15 text-warning text-[11px] font-bold px-2 py-0.5">
                  Edited
                  <InfoTip label="What Edited means">
                    You've changed the AI's suggestion. Your edits are what get saved — review them before continuing.
                  </InfoTip>
                </span>
              )}
            </div>
            <button
              onClick={requestClose}
              className="rounded-lg h-10 w-10 -m-2 flex items-center justify-center hover:bg-surface-lighter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Close"
            >
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
                    'w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center pxl-num',
                    done ? 'bg-success text-white' : active ? 'bg-brand text-white' : 'bg-surface-lighter text-muted-foreground'
                  )}>
                    {done ? <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> : n}
                  </span>
                  <span className={cn('text-[11px] font-pixel', active ? 'text-foreground font-bold' : 'text-muted-foreground')}>{label}</span>
                  {n < 3 && <div className="w-4 h-px bg-border" />}
                </div>
              );
            })}
          </div>
        </div>

        {step === 1 && (
          <>
          {/* ─── STEP 1: Recheck — 2-column on desktop, stacked on mobile ─── */}
          <div className="p-5 sm:grid sm:grid-cols-[240px,minmax(0,1fr)] sm:gap-6 space-y-4 sm:space-y-0">
            {/* Left column — hero (selected cover); photo & quality details behind a
                collapsed disclosure on mobile, always visible on desktop */}
            <div className="space-y-3">
              {/* Hero — the one hard-offset pxl-shadow accent on this screen */}
              <div className="relative w-40 sm:w-full mx-auto aspect-[63/88] rounded-xl overflow-hidden bg-surface-lighter pxl-shadow-peri">
                <img src={heroSrc} alt="Card" className="w-full h-full object-cover" />
                <span className={cn(
                  'absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-bold backdrop-blur-sm',
                  coverUrl === result.imageUrl ? 'bg-black/60 text-white/90' : 'bg-cyan/80 text-black'
                )}>
                  {coverUrl === result.imageUrl ? 'Your photo' : 'Official sample'}
                </span>
              </div>

              {/* Mobile: single collapsed-by-default disclosure (expanded up-front only
                  when the centering estimate is notably off) */}
              {hasQualityDetails && (
                <div className="sm:hidden">
                  <button
                    type="button"
                    aria-expanded={detailsOpen}
                    onClick={() => setDetailsOpen((o) => !o)}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Photo &amp; quality details
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform motion-reduce:transition-none',
                        detailsOpen && 'rotate-180'
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {detailsOpen && (
                    <div className="space-y-3 pt-2.5">
                      {coverPicker}
                      {centeringPanel}
                    </div>
                  )}
                </div>
              )}
              {/* Desktop: plenty of room in the 240px column — show directly */}
              {hasQualityDetails && (
                <div className="hidden sm:block space-y-3">
                  {coverPicker}
                  {centeringPanel}
                </div>
              )}

              {/* Contribute — when no official/sample image exists yet (old scanner's CONTRIBUTE) */}
              {canContribute && (
                <button
                  type="button"
                  disabled={contribute.isPending}
                  onClick={() => contribute.mutate({ code: code.trim(), game, lang: result.card.lang, rarity: rarity.trim() || undefined, nameEn: name.trim() || undefined, imageUrl: result.imageUrl })}
                  className="w-full rounded-xl border border-dashed border-border px-3 py-2.5 text-left hover:border-cyan/50 hover:bg-cyan/5 transition-all disabled:opacity-50"
                >
                  <p className="text-[11px] font-semibold text-cyan flex items-center gap-1.5">
                    {contribute.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                    No official sample yet
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Share your photo as this card's sample for future scans.
                  </p>
                </button>
              )}
              {contributed && (
                <p className="text-[11px] text-success flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Shared as the community sample
                </p>
              )}
            </div>

            {/* Right column — badges, fields, alternatives */}
            <div className="space-y-4 min-w-0">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <BadgeCheck className={cn('w-3.5 h-3.5', confidence >= 90 ? 'text-success' : confidence >= 70 ? 'text-warning' : 'text-pldown')} aria-hidden="true" />
                  <span className={cn(confidence >= 90 ? 'text-success' : confidence >= 70 ? 'text-warning' : 'text-pldown')}>
                    <span className="pxl-num">{confidence}%</span> confident
                  </span>
                  <InfoTip label="What confidence means">
                    How sure we are that this is the right card. 90%+ is usually reliable — below that, compare the details and similar matches before saving.
                  </InfoTip>
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium',
                    idInfo.verified ? 'bg-success/10 text-success' : 'bg-surface-lighter text-muted-foreground'
                  )}>
                    {idInfo.verified && <ShieldCheck className="w-3 h-3" aria-hidden="true" />}
                    {idInfo.label}
                    <InfoTip label="How we identified this card">{sourceTip}</InfoTip>
                  </span>
                </div>
                {/* Reasoning is only meaningful before the user edits (old scanner hid it after edits) */}
                {result.card.reasoning && !edited && (
                  <p className="border-l-2 border-cyan/40 pl-2.5 text-xs text-muted-foreground leading-relaxed">{result.card.reasoning}</p>
                )}
                {!edited && (
                  <p className="text-xs text-muted-foreground">
                    {confidence >= 90
                      ? 'Check the details below — correct anything that looks off.'
                      : "We're not fully sure about this one — compare the similar matches below before saving."}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-muted-foreground">Code</label>
                    <Input value={code} onChange={(e) => { setCode(e.target.value); setEdited(true); }} onKeyDown={enterToPrices} className="h-8 bg-surface border-border text-sm font-mono" />
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">Press Enter to see prices</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-mono uppercase text-muted-foreground">Name</label>
                    <Input value={name} onChange={(e) => { setName(e.target.value); setEdited(true); }} className="h-8 bg-surface border-border text-sm" />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase text-muted-foreground">Rarity</label>
                    <Input value={rarity} onChange={(e) => { setRarity(e.target.value); setEdited(true); }} className="h-8 bg-surface border-border text-sm" placeholder="e.g. SR" />
                  </div>
                </div>
              </div>

              {/* Explicit condition — saved as the vault item's condition (price tiles no longer set it) */}
              <div className="space-y-1.5">
                <p id="scan-condition-label" className="text-[11px] font-mono uppercase text-muted-foreground">
                  Your card's condition
                </p>
                <div role="group" aria-labelledby="scan-condition-label" className="flex flex-wrap gap-1.5">
                  {CONDITIONS.map((g) => {
                    const active = grade === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setGrade(g)}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                          active
                            ? 'border-brand bg-brand/10 text-brand'
                            : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {active && <Check className="w-3 h-3" aria-hidden="true" />}
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI ↔ image-search disagreement — offer the vision code as a one-tap fix */}
              {result.crossCheck?.visionCode && !result.crossCheck?.agreed &&
                result.crossCheck.visionCode !== result.card.code && (
                <div className="rounded-xl border border-warning/40 bg-warning/5 p-3 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-warning">Two checks found different cards</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Text recognition read <span className="font-mono text-foreground">{result.card.code}</span>,
                    but a reverse-image search matched <span className="font-mono text-cyan">{result.crossCheck.visionCode}</span>.
                    Pick the one that matches your physical card.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-warning/40 text-warning hover:bg-warning/10"
                    onClick={() => { setCode(result.crossCheck!.visionCode!); setEdited(true); }}
                  >
                    Use {result.crossCheck.visionCode} instead
                  </Button>
                </div>
              )}

              {/* Not this card? — collapsed behind a disclosure on high-confidence hits,
                  expanded (disambiguation mode) when the AI is unsure */}
              {alternatives.length > 0 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    aria-expanded={altsOpen}
                    onClick={() => setAltsOpen((o) => !o)}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Not this card? Similar matches ({alternatives.length})
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 transition-transform motion-reduce:transition-none',
                        altsOpen && 'rotate-180'
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {altsOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <p className="sm:col-span-2 text-[11px] text-muted-foreground leading-relaxed">
                      <span className="text-cyan font-medium">Catalog</span> = an exact match in our card database · AI % = the model's guess, with its confidence
                    </p>
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
                            {c.rarity && <Badge variant="outline" className="text-[11px] px-1.5 py-0">{c.rarity}</Badge>}
                            <span className={cn(
                              'text-[11px] font-medium',
                              c.source === 'catalog' ? 'text-cyan' : 'text-muted-foreground'
                            )}>
                              {c.source === 'catalog' ? 'Catalog' : c.confidence ? `AI ${Math.round(c.confidence)}%` : 'AI'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  )}
                </div>
              )}

              {/* Catalog variants (same code, different parallel/rarity) — image grid like the old VariantPicker */}
              {variants.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {variants.length} printings in catalog — tap the one that matches your card:
                    </p>
                    {canVisualMatch && (
                      <button
                        type="button"
                        disabled={visualMatch.isPending}
                        onClick={() => visualMatch.mutate()}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all',
                          'border-cyan/50 text-cyan hover:bg-cyan/5 disabled:opacity-50'
                        )}
                      >
                        {visualMatch.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScanEye className="w-3 h-3" />}
                        Match from photo
                      </button>
                    )}
                  </div>
                  {variants.some((v) => v.imageUrl) ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
                            <span className={cn('text-[11px] font-mono font-semibold', active ? 'text-brand' : 'text-muted-foreground')}>
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
            </div>
          </div>

          {/* Sticky footer CTA — mirrors the sticky header so the primary action is
              never buried below the fold on mobile */}
          <div className="sticky bottom-0 z-10 border-t border-border/50 bg-surface-light/95 backdrop-blur px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Button className="w-full bg-brand hover:bg-brand-light h-11" onClick={() => setStep(2)}>
              Looks right — see prices
            </Button>
          </div>
          </>
        )}

        {step === 2 && (
          /* ─── STEP 2: Market prices — tier tiles + per-marketplace cards ─── */
          <div className="p-5 space-y-4">
            {/* Confirmed identity strip — includes the explicit condition chosen in step 1
                and the Edited marker when the AI's suggestion was corrected */}
            <div className="flex items-center gap-3 rounded-xl bg-surface border border-border p-3">
              <GameMark game={game} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-muted-foreground truncate">{code || '—'}</p>
                <p className="text-sm font-semibold truncate">{name}</p>
              </div>
              {edited && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-warning/15 text-warning text-[11px] font-bold px-2 py-0.5 shrink-0">
                  Edited
                </span>
              )}
              {rarity && <Badge variant="outline" className="text-[11px] shrink-0">{rarity}</Badge>}
              <Badge variant="outline" className="text-[11px] shrink-0 border-brand/50 text-brand">
                Condition · {grade}
              </Badge>
            </div>

            {/* Current value by grade — header + currency pills (old CurrencyPills) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Current value · by grade</p>
                <div className="flex gap-1">
                  {(['THB', 'USD'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={ccy === c}
                      onClick={() => pickCcy(c)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border transition-all',
                        ccy === c
                          ? 'bg-brand text-white border-transparent'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {c === 'THB' ? '฿ THB' : '$ USD'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tap a tile to view that grade's prices — it doesn't change the condition you set in step 1.
              </p>

              {/* Tier tiles adapted from the old CurrentValueHero — display-only (viewTier),
                  they no longer mutate the condition saved to the vault */}
              <div className="grid grid-cols-3 gap-2">
                {TIER_TILES.map((t) => {
                  const tier = prices?.tiers?.[t.key];
                  const active = viewTier === t.grade;
                  const thb = tier?.thb;
                  const usd = tier?.usd;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      aria-pressed={active}
                      aria-label={`View ${t.label} prices`}
                      onClick={() => setViewTier(t.grade)}
                      className={cn(
                        'relative min-w-0 rounded-xl border bg-surface px-2.5 pb-2.5 pt-3 text-left overflow-hidden transition-all',
                        active ? cn(t.ring, 'bg-surface-lighter') : 'border-border hover:bg-surface-lighter/60'
                      )}
                    >
                      <span className={cn('absolute top-0 inset-x-0 h-0.5', t.bar)} />
                      <span className="block text-[11px] font-bold tracking-wider text-muted-foreground">{t.label}</span>
                      {pricesLoading ? (
                        <span className="block h-6 w-4/5 mt-1.5 rounded shimmer bg-surface-lighter" />
                      ) : thb && usd ? (
                        <>
                          <span className={cn('block text-base font-bold font-mono leading-tight mt-1 truncate', t.accent)}>
                            {fmt(usd.median, thb.median)}
                          </span>
                          <span className="block text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                            {tier!.count} listings
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
                              <span className="flex justify-between mt-1 text-[11px] font-mono text-muted-foreground">
                                <span>{fmt(usd.min, thb.min)}</span>
                                <span>{fmt(usd.max, thb.max)}</span>
                              </span>
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="block text-[11px] text-muted-foreground mt-2 pb-1">No sales found</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {pricesLoading ? (
              <div className="grid sm:grid-cols-2 gap-2.5">
                <Skeleton className="h-32 w-full rounded-xl shimmer" />
                <Skeleton className="h-32 w-full rounded-xl shimmer" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2.5 items-start">
                {/* SWS market */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-surface border-b border-border">
                    <Store className="w-4 h-4 text-brand" aria-hidden="true" />
                    <span className="text-xs font-semibold">SwibSwap Market</span>
                  </div>
                  <div className="px-3.5 py-3 space-y-2.5">
                    {prices?.sws.count ? (
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">{prices.sws.count} live listing{prices.sws.count > 1 ? 's' : ''}</span>
                        <span className="font-mono font-bold text-brand">฿{prices.sws.floor?.toLocaleString()} floor</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No listings on our market yet — yours could be the first.</p>
                    )}
                    {/* Sold-history sparkline — only when our market has real trades */}
                    {trades.length >= 2 && (
                      <div className="pt-2 border-t border-border/50 space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                          <span>SWS price history · 1y</span>
                          <span>last ฿{trades[0].price.toLocaleString()}</span>
                        </div>
                        <PriceSparkline trades={trades} />
                      </div>
                    )}
                  </div>
                </div>

                {/* eBay */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-surface border-b border-border">
                    <Globe className="w-4 h-4 text-cyan" aria-hidden="true" />
                    <span className="text-xs font-semibold">eBay</span>
                    {prices?.ebay.count ? <span className="text-[11px] text-muted-foreground">({prices.ebay.count} listings)</span> : null}
                  </div>
                  <div className="px-3.5 py-3 space-y-2.5">
                    {prices?.ebay.thb ? (
                      <>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-[11px] text-muted-foreground uppercase">Low</p>
                            <p className="text-sm font-bold font-mono">{fmt(prices.ebay.min ?? 0, prices.ebay.thb.min)}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground uppercase">Median</p>
                            <p className="text-sm font-bold font-mono text-brand">{fmt(prices.ebay.median ?? 0, prices.ebay.thb.median)}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground uppercase">High</p>
                            <p className="text-sm font-bold font-mono">{fmt(prices.ebay.max ?? 0, prices.ebay.thb.max)}</p>
                          </div>
                        </div>
                        {prices.ebay.items.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {/* Item prices are USD source data — state the conversion honestly */}
                            {ccy === 'THB' && (
                              <p className="text-[11px] font-mono text-muted-foreground">
                                {prices.ebay.thb
                                  ? `eBay (USD → THB @ ${prices.ebay.thb.rate})`
                                  : 'eBay (USD)'}
                              </p>
                            )}
                            {prices.ebay.items.slice(0, 3).map((it, i) => (
                              <a
                                key={i}
                                href={it.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1.5 hover:bg-surface-lighter transition-colors group"
                              >
                                <span className="flex-1 min-w-0 text-xs text-muted-foreground truncate group-hover:text-foreground">{it.title}</span>
                                <span className="text-xs font-mono shrink-0">{fmtEbayItem(it.price)}</span>
                                <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden="true" />
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No eBay listings found for this card.</p>
                    )}
                    {/* Outbound links — plain text links with external affordance, not CTAs */}
                    {(code || name) && (
                      <div className="flex items-center gap-4 pt-1">
                        <a
                          href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent([code, name].filter(Boolean).join(' '))}&LH_Sold=1&LH_Complete=1`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-cyan underline-offset-2 hover:underline"
                        >
                          Sold history
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                        <a
                          href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent([code, name].filter(Boolean).join(' '))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-cyan underline-offset-2 hover:underline"
                        >
                          Current listings
                          <ExternalLink className="w-3 h-3" aria-hidden="true" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Optional buy-in — recorded only when filled in; never defaults to ฿0 */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor="scan-paid-price" className="text-[11px] font-mono uppercase text-muted-foreground">
                What did you pay? (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono" aria-hidden="true">฿</span>
                <Input
                  id="scan-paid-price"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={paidPrice}
                  onChange={(e) => setPaidPrice(e.target.value)}
                  placeholder="Leave blank if you'd rather not say"
                  className="pl-8 h-11 bg-surface border-border font-mono"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Used only for your profit/loss tracking — if left blank, no price is recorded.
              </p>
            </div>

          {/* Sticky footer CTA for step 2 — mirrors step 1 so the action is never buried below BottomNav */}
          <div className="sticky bottom-0 z-10 border-t border-border/50 bg-surface-light/95 backdrop-blur px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-2.5">
              <Button
                className="flex-1 bg-brand hover:bg-brand-light h-11"
                onClick={handleSave}
                disabled={addToVault.isPending}
              >
                {addToVault.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save to vault
              </Button>
              <Button variant="outline" className="border-border h-11" onClick={requestClose}>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Scan again
              </Button>
            </div>
          </div>
          </div>
        )}

        {/* ─── STEP 3: Saved — journey completion, echoing the actual outcome ─── */}
        {step === 3 && (
          <div className="p-6 flex flex-col items-center text-center space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="w-14 h-14 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Added to your vault · {grade}
                {savedMedian ? ` · market median ${savedMedian}` : ''}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">{paidEcho}</p>
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
                Scan next card
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Discard guard — corrections would be lost on close; confirm first.
          Rendered above the sheet (z-80) via portal. */}
      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogPortal>
          <AlertDialogOverlay className="z-[80]" />
          <AlertDialogContent className="z-[80] bg-surface-light border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Discard your corrections?</AlertDialogTitle>
              <AlertDialogDescription>
                You've edited the card details. Closing now will lose those changes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep editing</AlertDialogCancel>
              <AlertDialogAction className="bg-brand hover:bg-brand-light" onClick={() => onCloseRef.current()}>
                Discard
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
}
