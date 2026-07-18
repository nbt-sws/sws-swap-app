import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { X, Sparkles, BadgeCheck, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameMark } from '@/components/domain/GameMark';
import { useAddToVault } from '@/hooks/useApi';
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

export function ScanResultSheet({ result, imagePreview, game, onClose }: ScanResultSheetProps) {
  const navigate = useNavigate();
  const addToVault = useAddToVault();
  const [grade, setGrade] = useState<string>('Raw');

  const { card, catalog } = result;
  const name = catalog?.nameEn || card.nameEn || card.code;
  const code = catalog?.code || card.code;
  const rarity = catalog?.rarity || card.rarity;
  const confidence = Math.round(card.confidence);

  const handleSave = () => {
    addToVault.mutate(
      {
        name,
        sku: code || `SCAN-${result.hash.slice(0, 10)}`,
        category: catalog?.game ?? game,
        subCategory: rarity || undefined,
        itemFormat: card.lang,
        condition: grade,
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
            <Sparkles className="w-4 h-4 text-brand" />
            <h2 className="font-bold">Scan result</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-lighter" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Image + identity */}
          <div className="flex gap-4">
            <div className="w-28 aspect-[63/88] rounded-xl overflow-hidden bg-surface-lighter shrink-0">
              <img src={catalog?.imageUrl || imagePreview} alt={name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <p className="text-xs font-mono text-muted-foreground">{code || '—'}</p>
              <h3 className="font-bold text-lg leading-tight">{name}</h3>
              {card.nameJp && <p className="text-xs text-muted-foreground">{card.nameJp}</p>}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <GameMark game={(catalog?.game as CardGame) ?? game} size="sm" />
                {rarity && <Badge variant="outline" className="text-[10px]">{rarity}</Badge>}
                {card.type && <Badge variant="outline" className="text-[10px]">{card.type}</Badge>}
                <Badge className="text-[10px]">{card.lang}</Badge>
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-xs">
                <BadgeCheck className={cn('w-3.5 h-3.5', confidence >= 90 ? 'text-success' : confidence >= 70 ? 'text-warning' : 'text-pldown')} />
                <span className={cn(confidence >= 90 ? 'text-success' : confidence >= 70 ? 'text-warning' : 'text-pldown')}>
                  {confidence}% confidence
                </span>
                <span className="text-muted-foreground">· {result.identifiedBy}</span>
              </div>
            </div>
          </div>

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

          {/* Actions */}
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
      </div>
    </div>
  );
}
