import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { ShoppingBag, X } from 'lucide-react';
import { useCatalogCard } from '@/hooks/useCatalog';

interface CardDetailModalProps {
  /** Catalog card code; null/undefined = closed. URL-driven by the caller. */
  code: string | null;
  onClose: () => void;
  /** Switch the modal to another code (variant selection). */
  onSelectCode: (code: string) => void;
}

/**
 * Catalog card detail — modal variant of the QuickViewModal pattern.
 * Data surface (catalog) → cyan wayfinding accent; rarity uses a pixel chip.
 */
export function CardDetailModal({ code, onClose, onSelectCode }: CardDetailModalProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useCatalogCard(code);
  const card = data?.card ?? null;
  const variants = data?.variants ?? [];

  return (
    <Dialog open={!!code} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl bg-surface-light border-border p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{card?.nameEn ?? code ?? 'Card detail'}</DialogTitle>
        </DialogHeader>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute top-3 right-3 z-10 rounded-full bg-surface-lighter text-muted-foreground hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
            <Skeleton className="aspect-[4/5] md:aspect-auto md:min-h-[420px] rounded-none" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : !card ? (
          <div className="p-10 text-center">
            <p className="text-sm text-muted-foreground">Card not found in the catalog.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr]">
            {/* Image */}
            <div className="aspect-[4/5] md:aspect-auto md:h-full bg-surface-lighter relative">
              <ImageWithFallback
                src={card.imageUrl ?? ''}
                alt={card.nameEn ?? card.code}
                className="absolute inset-0"
              />
              {card.rarity && (
                <div className="absolute top-3 left-3">
                  <Badge variant="pixel" className="pxl-chip--cyan">
                    {card.rarity}
                  </Badge>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col max-h-[80vh] overflow-y-auto">
              <p className="text-xs font-mono text-muted-foreground">{card.code}</p>
              <h2 className="text-xl font-bold mt-1">{card.nameEn}</h2>
              {card.nameJp && (
                <p className="text-sm text-muted-foreground font-mono">{card.nameJp}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {card.rarity && <Badge variant="outline">{card.rarity}</Badge>}
                {card.type && <Badge variant="outline">{card.type}</Badge>}
                {card.game && <Badge variant="outline">{card.game}</Badge>}
              </div>

              {/* Variants */}
              {variants.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Variants ({variants.length})
                  </p>
                  <div className="divide-y divide-border/60 border border-border rounded-xl overflow-hidden">
                    {variants.map((v, i) => (
                      <button
                        key={`${v.code}-${i}`}
                        type="button"
                        onClick={() => onSelectCode(v.code)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-surface-lighter transition-colors"
                      >
                        <div className="w-8 aspect-[5/7] shrink-0 rounded-sm overflow-hidden bg-surface-lighter">
                          <ImageWithFallback src={v.imageUrl ?? ''} alt={v.nameEn ?? v.code} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-muted-foreground">{v.code}</p>
                          <p className="text-sm truncate">{v.nameEn}</p>
                        </div>
                        {v.rarity && (
                          <Badge variant="pixel" className="pxl-chip--cyan shrink-0">
                            {v.rarity}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto pt-6 flex items-center gap-3">
                <Button
                  asChild
                  className="flex-1 bg-cyan/15 text-cyan hover:bg-cyan/25 rounded-full border border-cyan/30"
                  onClick={onClose}
                >
                  <Link to="/market" search={{ q: card.code }}>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View in market
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
