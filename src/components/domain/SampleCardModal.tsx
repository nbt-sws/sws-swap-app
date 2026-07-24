import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { X } from 'lucide-react';
import type { ScannerSampleCatalogItem } from '@/lib/api';

export type SampleCardItem = ScannerSampleCatalogItem;

interface SampleCardModalProps {
  item: SampleCardItem | null;
  /** Collection title (e.g. DON!!) shown as context. */
  catalogTitle?: string;
  onClose: () => void;
}

/**
 * Lightweight detail modal for official sample-catalog items (DON!! / CN-anniv).
 * Image + name + rarity + set info only — these are scanner reference samples,
 * not catalog cards, so no market/variant plumbing.
 */
export function SampleCardModal({ item, catalogTitle, onClose }: SampleCardModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!item} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-sm bg-surface-light border-border p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{item?.name ?? item?.id ?? 'Sample card'}</DialogTitle>
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

        {item && (
          <div>
            <div className="aspect-[5/7] max-h-[55vh] bg-surface-lighter relative">
              <ImageWithFallback src={item.imageUrl} alt={item.name ?? item.id} className="absolute inset-0" />
            </div>
            <div className="p-4">
              {catalogTitle && (
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{catalogTitle}</p>
              )}
              <h2 className="text-base font-bold mt-1">{item.name ?? item.id}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {item.rarity && (
                  <Badge variant="pixel" className="pxl-chip--cyan">
                    {item.rarity}
                  </Badge>
                )}
                {item.variant && <Badge variant="outline">{item.variant}</Badge>}
                {item.setCode && <Badge variant="outline">{item.setCode}</Badge>}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
