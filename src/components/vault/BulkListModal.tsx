import { useState } from 'react';
import { useCreateListing } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { VaultItem } from '@/types';
import { Tag, ArrowRightLeft } from 'lucide-react';

interface BulkListModalProps {
  open: boolean;
  onClose: () => void;
  items: VaultItem[];
}

function getShelf(condition: string): 'RAW' | 'PRE-GRADED' | 'GRADED' | 'SEALED-BOX' {
  if (condition.includes('PSA') || condition.includes('BGS') || condition.includes('CGC')) return 'GRADED';
  if (condition.includes('RAWLITY')) return 'PRE-GRADED';
  return 'RAW';
}

export function BulkListModal({ open, onClose, items }: BulkListModalProps) {
  const createListing = useCreateListing();
  const [price, setPrice] = useState('');
  const [listingType, setListingType] = useState<'SALE' | 'TRADE'>('SALE');

  const handleSubmit = () => {
    const priceNum = listingType === 'SALE' ? Number(price) || 0 : 0;
    let completed = 0;
    const total = items.length;

    items.forEach((item) => {
      createListing.mutate(
        {
          card: item.card,
          price: priceNum,
          listingType,
          shelf: getShelf(item.condition),
        },
        {
          onSuccess: () => {
            completed++;
            if (completed === total) {
              setPrice('');
              setListingType('SALE');
              onClose();
            }
          },
        }
      );
    });
  };

  if (items.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface-light border-border max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">List {items.length} items</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Items list */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface border border-border">
                <div className="w-8 h-10 rounded-md bg-surface-lighter flex items-center justify-center text-xs font-bold">
                  {item.card.game === 'one-piece' ? '⚓' : '⚔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-muted-foreground">{item.card.code}</p>
                  <p className="text-sm font-medium truncate">{item.card.nameEn}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.condition}</span>
              </div>
            ))}
          </div>

          {/* Listing type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Listing type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['SALE', 'TRADE'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setListingType(type)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition ${
                    listingType === type
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type === 'SALE' ? <Tag className="w-4 h-4" /> : <ArrowRightLeft className="w-4 h-4" />}
                  {type === 'SALE' ? 'For sale' : 'For trade'}
                </button>
              ))}
            </div>
          </div>

          {/* Price (only for sale) */}
          {listingType === 'SALE' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Price per item (฿)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="bg-surface border-border"
              />
              <p className="text-xs text-muted-foreground">
                All items will be listed at the same price. You can edit individual prices later.
              </p>
            </div>
          )}

          <Button
            className="w-full bg-brand hover:bg-brand-light h-11"
            onClick={handleSubmit}
            disabled={createListing.isPending || (listingType === 'SALE' && !price)}
          >
            {createListing.isPending ? 'Creating listings...' : `List ${items.length} items`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
