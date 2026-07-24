import { useRef, useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Camera, ImagePlus, Loader2, ScanLine, History, Database } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { InfoTip } from '@/components/ui/info-tip';
import { CameraCapture } from '@/components/scan/CameraCapture';
import { ScanResultSheet } from '@/components/scan/ScanResultSheet';
import { ImageCropModal } from '@/components/ui/ImageCropModal';
import { GameMark } from '@/components/domain/GameMark';
import { useScan } from '@/hooks/useScan';
import { downscaleImage } from '@/lib/image';
import { scannerApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ScanResult } from '@/lib/api';
import type { CardGame } from '@/types';

const GAMES: { id: CardGame; label: string }[] = [
  { id: 'one-piece', label: 'One Piece' },
  { id: 'yu-gi-oh', label: 'Yu-Gi-Oh!' },
  { id: 'pokemon', label: 'Pokémon' },
  { id: 'lorcana', label: 'Lorcana' },
  { id: 'conan', label: 'Conan' },
  { id: 'others', label: 'Others' },
];

const LANGS = ['JP', 'EN', 'CN', 'AE'] as const;

const RECENT_KEY = 'sws_recent_scans';

interface RecentScan {
  hash: string;
  code: string;
  name: string;
  imageUrl: string;
  game: CardGame;
  at: number;
  /** Full result payload — lets a recent scan reopen the whole sheet (prices, candidates) */
  result?: ScanResult;
}

function loadRecent(): RecentScan[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function ScanScreen() {
  const scan = useScan();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scanner-service health gate — configured && !ready means the card database
  // is in maintenance. Scans still work (the app's own pipeline), so this only
  // surfaces a subtle, non-blocking notice on the landing. Shared cache with
  // ScanResultSheet (['scannerHealth']).
  const { data: scannerHealth } = useQuery({
    queryKey: ['scannerHealth'],
    queryFn: () => scannerApi.health(),
    staleTime: 60_000,
    retry: 1,
  });
  const scannerMaintenance = !!scannerHealth?.scanner.configured && !scannerHealth.scanner.ready;

  const [game, setGame] = useState<CardGame>('one-piece');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [lang, setLang] = useState<string>(() => localStorage.getItem('sws_scan_lang') ?? 'JP');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recent, setRecent] = useState<RecentScan[]>(loadRecent);
  const [stage, setStage] = useState(0);
  const [slowHint, setSlowHint] = useState(false);

  // Staged progress messages while the pipeline runs (perceived performance)
  const STAGES = ['Analyzing photo…', 'Reading card text…', 'Cross-checking sources…'];
  useEffect(() => {
    if (!scan.isPending) return;
    setStage(0);
    setSlowHint(false);
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 4000);
    // After ~12s be honest: it may be the connection, not the pipeline
    const slowTimer = setTimeout(() => setSlowHint(true), 12000);
    return () => {
      clearInterval(timer);
      clearTimeout(slowTimer);
    };
  }, [scan.isPending]);

  const pushRecent = useCallback((r: ScanResult, g: CardGame) => {
    setRecent((prev) => {
      const next: RecentScan[] = [
        { hash: r.hash, code: r.card.code, name: r.catalog?.nameEn || r.card.nameEn, imageUrl: r.imageUrl, game: g, at: Date.now(), result: r },
        ...prev.filter((p) => p.hash !== r.hash),
      ].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // Quota guard: full results are chunky — drop the payload, keep the shell entries
        localStorage.setItem(RECENT_KEY, JSON.stringify(next.map(({ result: _r, ...rest }) => rest)));
      }
      return next;
    });
  }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const prepared = await downscaleImage(file);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(prepared);
      });
      // Open crop modal instead of setting image directly
      setCropSrc(dataUrl);
    } catch {
      toast.error("We couldn't read that image — try a different photo");
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runScan = () => {
    if (!image) return;
    localStorage.setItem('sws_scan_lang', lang);
    scan.mutate(
      { image, tcg: game, lang },
      {
        onSuccess: (res) => {
          setResult(res);
          pushRecent(res, game);
        },
        onError: (err: any) => {
          // User-cancelled scans abort the request — not an error worth toasting
          if (err?.name === 'AbortError') return;
          const message = String(err?.message ?? '').toLowerCase();
          if (message.includes('unable to identify')) {
            toast.error("We couldn't identify this card — try a clearer, well-lit photo");
          } else if (message.includes('anthropic_api_key missing') || message.includes('not configured')) {
            toast.error('AI scanning is not configured — the Anthropic API token is missing');
          } else if (String(err?.name ?? '').includes('ApiError_502')) {
            const detail = String(err?.message ?? 'The upstream AI service returned an invalid response');
            toast.error('AI identification failed (502)', {
              description: detail,
              duration: 8000,
            });
          } else if (
            message.includes('rate limit') || message.includes('quota') || message.includes('credit') ||
            message.includes('insufficient') || message.includes('token') || message.includes('429')
          ) {
            toast.error('AI service limit reached — the AI token or quota may be exhausted');
          } else if (err?.message && !message.includes('failed to fetch')) {
            toast.error(`Scan failed: ${err.message}`);
          } else {
            toast.error("The scan didn't go through — check your connection and try again.");
          }
        },
      }
    );
  };

  const reset = () => {
    setImage(null);
    setResult(null);
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Scan"
        icon={<ScanLine className="w-6 h-6 text-brand" />}
        description="Point your camera at a card — we'll identify it and file it into your vault"
      />

      <div className="max-w-xl mx-auto space-y-5">
        {/* Game chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => setGame(g.id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 border transition-all',
                game === g.id
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-border bg-surface-light text-muted-foreground hover:text-foreground'
              )}
            >
              <GameMark game={g.id} size="sm" />
              {g.label}
            </button>
          ))}
        </div>

        {/* Scanner-service maintenance notice — muted, small, non-blocking.
            Shown on the landing only, above the capture area; nothing when unconfigured. */}
        {scannerMaintenance && !image && (
          <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-light px-3 py-2">
            <Database className="w-3.5 h-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="flex-1 text-xs text-muted-foreground">
              Card database is in maintenance — results may be limited
            </p>
            <InfoTip label="What maintenance means for your scan">
              Scans still work — your photo is identified as usual. Official sample images and extra printings may be missing until maintenance is done.
            </InfoTip>
          </div>
        )}

        {/* Preview / capture area */}
        <div className="relative aspect-[63/88] max-h-[52vh] mx-auto rounded-2xl border-2 border-dashed border-border bg-surface-light/50 overflow-hidden">
          {image ? (
            <>
              <img src={image} alt="Scanned card" className="absolute inset-0 w-full h-full object-contain" />
              <button
                onClick={reset}
                className="absolute top-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80"
              >
                Scan again
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center">
                <ScanLine className="w-8 h-8 text-brand" />
              </div>
              <div>
                <p className="font-medium">No photo yet</p>
                <p className="text-sm text-muted-foreground mt-1">Use the camera or pick from your gallery</p>
              </div>
              <div className="flex gap-3">
                <Button className="bg-brand hover:bg-brand-light gap-2" onClick={() => setCameraOpen(true)}>
                  <Camera className="w-4 h-4" />
                  Camera
                </Button>
                <Button variant="outline" className="border-border gap-2" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="w-4 h-4" />
                  Gallery
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Language + scan action — inline, no extra dialog */}
        {image && !result && (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Language</span>
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
                    lang === l
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border bg-surface-light text-muted-foreground hover:text-foreground'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
            <Button
              className="w-full h-12 bg-brand hover:bg-brand-light text-base"
              onClick={runScan}
              disabled={scan.isPending}
            >
              <span className="flex items-center gap-2">
                <ScanLine className="w-5 h-5" />
                Identify this card
              </span>
            </Button>
          </div>
        )}

        {/* Recent scans */}
        {recent.length > 0 && !image && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" aria-hidden="true" />
              Recent scans
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {recent.map((r) => (
                <button
                  key={r.hash}
                  type="button"
                  disabled={!r.result}
                  onClick={() => {
                    if (!r.result) return;
                    setGame(r.game);
                    setResult(r.result);
                  }}
                  className={cn(
                    'rounded-lg overflow-hidden border border-border bg-surface-light text-left transition-all',
                    r.result ? 'hover:border-brand/50 hover:bg-surface-lighter cursor-pointer' : 'opacity-70 cursor-default'
                  )}
                >
                  <div className="aspect-[63/88] bg-surface-lighter">
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-1.5">
                    <p className="text-[11px] font-mono text-muted-foreground truncate">{r.code}</p>
                    <p className="text-[11px] font-medium truncate">{r.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden gallery input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Camera overlay */}
      {cameraOpen && (
        <CameraCapture
          onCapture={(dataUrl) => {
            setCameraOpen(false);
            setCropSrc(dataUrl);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Crop modal — shown after gallery pick or camera capture */}
      {cropSrc && (
        <ImageCropModal
          src={cropSrc}
          onConfirm={(croppedDataUrl) => {
            setCropSrc(null);
            setImage(croppedDataUrl);
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* Staged identification progress */}
      {scan.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-light border border-border px-10 py-8 animate-scale-in overflow-hidden pxl-scanline">
            <Loader2 className="w-10 h-10 animate-spin motion-reduce:animate-none text-brand" />
            <div className="text-center">
              <p className="font-semibold">Identifying your card</p>
              <p className="text-sm text-muted-foreground mt-1 animate-fade-in motion-reduce:animate-none" key={slowHint ? 'slow' : stage}>
                {slowHint ? 'Still working — your connection may be slow' : STAGES[stage]}
              </p>
            </div>
            <div className="flex gap-1.5">
              {STAGES.map((_, i) => (
                <div key={i} className={cn('h-1.5 w-8 rounded-full transition-colors motion-reduce:transition-none', i <= stage ? 'bg-brand' : 'bg-surface-lighter')} />
              ))}
            </div>
            <Button
              variant="outline"
              className="border-border h-9"
              onClick={() => {
                scan.cancel();
                scan.reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Result sheet — imagePreview falls back to the stored scan photo when reopening from recent */}
      {result && (
        <ScanResultSheet
          result={result}
          imagePreview={image ?? result.imageUrl}
          game={game}
          onClose={() => {
            setResult(null);
            setImage(null);
          }}
        />
      )}
    </PageContainer>
  );
}
