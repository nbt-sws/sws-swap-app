import { useState, useMemo, useEffect } from 'react';
import { useCreateListing, useUpdateListing } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VaultItem } from '@/types';
import { GameMark } from '@/components/domain/GameMark';
import { Tag, ArrowRightLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ListItemModalProps {
  open: boolean;
  onClose: () => void;
  item: VaultItem | null;
  /** Active listing for this item — when present the modal edits instead of creating */
  listing?: { listingId: string; price: number } | null;
}

function getShelf(condition: string): 'RAW' | 'PRE-GRADED' | 'GRADED' | 'SEALED-BOX' {
  if (['PSA', 'BGS', 'CGC', 'TAG', 'ARS'].some((g) => condition.startsWith(g))) return 'GRADED';
  if (['RAWLITY', 'BLACKLENS'].some((g) => condition.startsWith(g))) return 'PRE-GRADED';
  return 'RAW';
}

export function ListItemModal({ open, onClose, item, listing }: ListItemModalProps) {
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const [price, setPrice] = useState('');
  const [listingType, setListingType] = useState<'SALE' | 'TRADE'>('SALE');
  const shelf = useMemo(() => (item ? getShelf(item.condition) : 'RAW'), [item]);
  const isEditMode = !!listing;

  // Prefill current price when editing an active listing
  useEffect(() => {
    if (open && listing) setPrice(String(listing.price));
    if (open && !listing) setPrice('');
  }, [open, listing]);

  const handleSubmit = () => {
    if (!item) return;

    if (isEditMode && listing) {
      // [P2-4] Clamp price to >= 0 — negative prices must not reach the API
      const priceNum = Math.max(0, Number(price) || 0);
      updateListing.mutate(
        { listingId: listing.listingId, data: { price: priceNum } },
        {
          onSuccess: () => {
            toast.success('Listing updated');
            setPrice('');
            onClose();
          },
          onError: () => toast.error('Failed to update listing'),
        }
      );
      return;
    }

    const priceNum = listingType === 'SALE' ? Math.max(0, Number(price) || 0) : 0;
    createListing.mutate(
      {
        card: item.card,
        itemId: item.id,
        price: priceNum,
        listingType,
        shelf,
      },
      {
        onSuccess: () => {
          toast.success('Listing published successfully');
          setPrice('');
          setListingType('SALE');
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to create listing');
        },
      }
    );
  };

  if (!item) return null;

  const isBusy = createListing.isPending || updateListing.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface-light border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{isEditMode ? 'Edit listing' : 'List item for sale'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Item preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
            <div className="w-12 h-16 rounded-lg bg-surface-lighter flex items-center justify-center text-sm font-bold">
              <GameMark game={item.card.game} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-muted-foreground">{item.card.code}</p>
              <p className="font-medium text-sm truncate">{item.card.nameEn}</p>
              <p className="text-xs text-muted-foreground">{item.condition}</p>
            </div>
          </div>

          {/* Listing type — fixed when editing (backend only supports price updates) */}
          {!isEditMode && (
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
          )}

          {/* Price (only for sale) */}
          {(isEditMode || listingType === 'SALE') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (฿)</label>
              <Input
                type="number"
                min={0}
                value={price}
                onChange={(e) => {
                  const v = e.target.value;
                  // [P2-4] Clamp to >= 0 — never allow a negative price in state
                  if (v !== '' && Number(v) < 0) return;
                  setPrice(v);
                }}
                placeholder={`Suggested: ฿${item.currentPrice.toLocaleString()}`}
                className="bg-surface border-border"
              />
              {price !== '' && Number(price) <= 0 && (
                <p className="text-xs text-pldown">Price must be greater than 0</p>
              )}
              <p className="text-xs text-muted-foreground">
                Current market value: ฿{item.currentPrice.toLocaleString()}
              </p>
            </div>
          )}

          {/* Shelf */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Shelf</label>
            <Select value={shelf} disabled>
              <SelectTrigger className="w-full bg-surface border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface-light border-border">
                <SelectItem value="RAW">RAW</SelectItem>
                <SelectItem value="PRE-GRADED">PRE-GRADED</SelectItem>
                <SelectItem value="GRADED">GRADED</SelectItem>
                <SelectItem value="SEALED-BOX">SEALED-BOX</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full bg-brand hover:bg-brand-light h-11"
            onClick={handleSubmit}
            disabled={isBusy || ((isEditMode || listingType === 'SALE') && (!price || Number(price) <= 0))}
          >
            {isBusy ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditMode ? 'Saving...' : 'Creating listing...'}
              </span>
            ) : isEditMode ? (
              'Save changes'
            ) : (
              'Publish listing'
            )}
          </Button>
          {createListing.isError && !isEditMode && (
            <p className="text-xs text-center text-red-500 mt-2">
              Error: {createListing.error instanceof Error ? createListing.error.message : 'Failed to create listing'}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
