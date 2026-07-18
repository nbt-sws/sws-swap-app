import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, ImagePlus, Loader2, ScanLine, History, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { CameraCapture } from '@/components/scan/CameraCapture';
import { ScanResultSheet } from '@/components/scan/ScanResultSheet';
import { GameMark } from '@/components/domain/GameMark';
import { useScan } from '@/hooks/useScan';
import { downscaleImage } from '@/lib/image';
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

  const [game, setGame] = useState<CardGame>('one-piece');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [lang, setLang] = useState<string>(() => localStorage.getItem('sws_scan_lang') ?? 'JP');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recent, setRecent] = useState<RecentScan[]>(loadRecent);
  const [stage, setStage] = useState(0);

  // Staged progress messages while the pipeline runs (perceived performance)
  const STAGES = ['Analyzing photo…', 'Reading card text…', 'Cross-checking sources…'];
  useEffect(() => {
    if (!scan.isPending) return;
    setStage(0);
    const timer = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 4000);
    return () => clearInterval(timer);
  }, [scan.isPending]);

  const pushRecent = useCallback((r: ScanResult, g: CardGame) => {
    setRecent((prev) => {
      const next: RecentScan[] = [
        { hash: r.hash, code: r.card.code, name: r.catalog?.nameEn || r.card.nameEn, imageUrl: r.imageUrl, game: g, at: Date.now() },
        ...prev.filter((p) => p.hash !== r.hash),
      ].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
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
      setImage(dataUrl);
    } catch {
      toast.error('Could not read that image');
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
          toast.error(err?.message?.includes('unable to identify')
            ? 'Could not identify the card — try a clearer photo'
            : 'Scan failed. Please try again.');
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

        {/* Preview / capture area */}
        <div className="relative aspect-[63/88] max-h-[52vh] mx-auto rounded-2xl border-2 border-dashed border-border bg-surface-light/50 overflow-hidden">
          {image ? (
            <>
              <img src={image} alt="Scanned card" className="absolute inset-0 w-full h-full object-contain" />
              <button
                onClick={reset}
                className="absolute top-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80"
              >
                Retake
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
              <History className="w-3.5 h-3.5" />
              Recent scans
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {recent.map((r) => (
                <div key={r.hash} className="rounded-lg overflow-hidden border border-border bg-surface-light">
                  <div className="aspect-[63/88] bg-surface-lighter">
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-1.5">
                    <p className="text-[10px] font-mono text-muted-foreground truncate">{r.code}</p>
                    <p className="text-[10px] font-medium truncate">{r.name}</p>
                  </div>
                </div>
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
            setImage(dataUrl);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Staged identification progress */}
      {scan.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-surface-light border border-border px-10 py-8 animate-scale-in">
            <div className="relative">
              <Loader2 className="w-10 h-10 animate-spin text-brand" />
              <Sparkles className="w-4 h-4 text-brand absolute -top-1 -right-1" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Identifying your card</p>
              <p className="text-sm text-muted-foreground mt-1 animate-fade-in" key={stage}>{STAGES[stage]}</p>
            </div>
            <div className="flex gap-1.5">
              {STAGES.map((_, i) => (
                <div key={i} className={cn('h-1.5 w-8 rounded-full transition-colors', i <= stage ? 'bg-brand' : 'bg-surface-lighter')} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Result sheet */}
      {result && (
        <ScanResultSheet
          result={result}
          imagePreview={image ?? ''}
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
