import { useRef, useState } from 'react';
import { useAddToVault, useUploadItemImage } from '@/hooks/useApi';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Package, ImagePlus, X, ChevronLeft, ChevronRight, ChevronDown, Loader2, Star,
} from 'lucide-react';

interface RegisterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GAMES = [
  { value: 'one-piece', label: '⚓ One Piece' },
  { value: 'yu-gi-oh', label: '⚔ Yu-Gi-Oh!' },
];

const CONDITIONS = ['Raw', 'PSA 10', 'PSA 9', 'BGS 9.5', 'CGC 9.5', 'RAWLITY 9.5', 'RAWLITY 9', 'BLACKLENS 92', 'BLACKLENS 85'] as const;

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const INITIAL_FORM = {
  code: '',
  nameEn: '',
  nameJp: '',
  rarity: '',
  type: '',
  language: 'JP',
  game: 'one-piece' as 'one-piece' | 'yu-gi-oh',
  condition: 'Raw' as typeof CONDITIONS[number],
  paidPrice: '',
  source: '',
  dateAcquired: new Date().toISOString().split('T')[0],
};

export function RegisterItemModal({ isOpen, onClose }: RegisterItemModalProps) {
  const addToVault = useAddToVault();
  const uploadImage = useUploadItemImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showAcquisition, setShowAcquisition] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const reset = () => {
    setForm(INITIAL_FORM);
    setImages([]);
    setUploadingCount(0);
    setShowDetails(false);
    setShowAcquisition(false);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const room = MAX_IMAGES - images.length;
    const picked = Array.from(files).slice(0, room);

    for (const file of picked) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: use JPEG, PNG, WebP or AVIF`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: max 5MB per image`);
        continue;
      }
      setUploadingCount((n) => n + 1);
      try {
        const url = await uploadImage.mutateAsync(file);
        setImages((prev) => [...prev, url]);
      } catch {
        toast.error(`${file.name}: upload failed`);
      } finally {
        setUploadingCount((n) => n - 1);
      }
    }
    // Reset input so picking the same file again re-triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isBusy = addToVault.isPending || uploadingCount > 0;
  const canSubmit = !!form.nameEn.trim() && !isBusy;

  const handleSubmit = () => {
    if (!canSubmit) return;

    addToVault.mutate(
      {
        name: form.nameEn.trim(),
        sku: form.code.trim() || `CUSTOM-${Date.now()}`,
        category: form.game,
        subCategory: form.rarity.trim() || undefined,
        itemFormat: form.language,
        condition: form.condition,
        images,
        metadata: {
          paidPrice: form.paidPrice ? Number(form.paidPrice) : 0,
          dateAcquired: form.dateAcquired,
          source: form.source.trim() || 'Manual entry',
          images,
        },
      },
      {
        onSuccess: () => {
          toast.success('Item added to your vault');
          reset();
          onClose();
        },
        onError: () => toast.error('Failed to add item. Please try again.'),
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface-light border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-brand" />
            Add item to vault
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* ─── Photos (optional, first = cover) ─── */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Photos</label>
              <span className="text-xs text-muted-foreground">
                optional · first photo is the cover
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {images.map((url, i) => (
                <div
                  key={url}
                  className={cn(
                    'group relative aspect-[5/7] rounded-lg overflow-hidden border bg-surface-lighter',
                    i === 0 ? 'border-brand ring-1 ring-brand/50' : 'border-border'
                  )}
                >
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />

                  {/* Cover badge */}
                  {i === 0 && (
                    <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      COVER
                    </span>
                  )}

                  {/* Controls */}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => moveImage(i, -1)}
                      disabled={i === 0}
                      aria-label="Move left"
                      className="rounded-full bg-black/50 p-1 text-white hover:bg-black/80 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, 1)}
                      disabled={i === images.length - 1}
                      aria-label="Move right"
                      className="rounded-full bg-black/50 p-1 text-white hover:bg-black/80 disabled:opacity-30"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Uploading placeholders */}
              {Array.from({ length: uploadingCount }).map((_, i) => (
                <div
                  key={`uploading-${i}`}
                  className="aspect-[5/7] rounded-lg border border-border bg-surface-lighter flex items-center justify-center"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-brand" />
                </div>
              ))}

              {/* Add button */}
              {images.length + uploadingCount < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[5/7] rounded-lg border border-dashed border-border bg-surface hover:border-brand/40 hover:bg-surface-lighter transition flex flex-col items-center justify-center gap-1 text-muted-foreground"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span className="text-[10px] font-medium">Add</span>
                </button>
              )}
            </div>
          </section>

          {/* ─── Required ─── */}
          <section className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Card name <span className="text-brand">*</span>
              </label>
              <Input
                value={form.nameEn}
                onChange={(e) => update('nameEn', e.target.value)}
                placeholder="e.g. Portgas D. Ace"
                className="bg-surface border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Card code <span className="text-muted-foreground font-normal">optional · links catalog data</span>
              </label>
              <Input
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
                placeholder="e.g. OP02-013"
                className="bg-surface border-border"
              />
            </div>
          </section>

          {/* ─── Card details (optional, collapsed) ─── */}
          <CollapsibleSection
            title="Card details"
            hint="optional"
            open={showDetails}
            onToggle={() => setShowDetails((v) => !v)}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Game</label>
                <Select value={form.game} onValueChange={(v) => update('game', v as 'one-piece' | 'yu-gi-oh')}>
                  <SelectTrigger className="w-full bg-surface border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-light border-border">
                    {GAMES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Language</label>
                <Select value={form.language} onValueChange={(v) => update('language', v)}>
                  <SelectTrigger className="w-full bg-surface border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-light border-border">
                    <SelectItem value="JP">JP</SelectItem>
                    <SelectItem value="EN">EN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Condition</label>
                <Select value={form.condition} onValueChange={(v) => update('condition', v)}>
                  <SelectTrigger className="w-full bg-surface border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-light border-border">
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Rarity</label>
                <Input
                  value={form.rarity}
                  onChange={(e) => update('rarity', e.target.value)}
                  placeholder="e.g. SR"
                  className="bg-surface border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <Input
                  value={form.type}
                  onChange={(e) => update('type', e.target.value)}
                  placeholder="e.g. Character"
                  className="bg-surface border-border"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Name (JP)</label>
                <Input
                  value={form.nameJp}
                  onChange={(e) => update('nameJp', e.target.value)}
                  placeholder="e.g. ポートガス・D・エース"
                  className="bg-surface border-border"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ─── Acquisition (optional, collapsed) ─── */}
          <CollapsibleSection
            title="Acquisition"
            hint="optional"
            open={showAcquisition}
            onToggle={() => setShowAcquisition((v) => !v)}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Paid (฿)</label>
                <Input
                  type="number"
                  min={0}
                  value={form.paidPrice}
                  onChange={(e) => update('paidPrice', e.target.value)}
                  placeholder="0"
                  className="bg-surface border-border"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Date acquired</label>
                <Input
                  type="date"
                  value={form.dateAcquired}
                  onChange={(e) => update('dateAcquired', e.target.value)}
                  className="bg-surface border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Source</label>
              <Input
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
                placeholder="e.g. Yahoo JP auction"
                className="bg-surface border-border"
              />
            </div>
          </CollapsibleSection>

          <Button
            className="w-full bg-brand hover:bg-brand-light h-11"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {addToVault.isPending
              ? 'Adding...'
              : uploadingCount > 0
                ? `Uploading ${uploadingCount} photo(s)...`
                : 'Add to vault'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Collapsible optional section ─── */

function CollapsibleSection({
  title,
  hint,
  open,
  onToggle,
  children,
}: {
  title: string;
  hint?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-surface/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={open}
      >
        <span>
          {title}
          {hint && <span className="ml-2 text-xs font-normal">{hint}</span>}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-border/60 px-3.5 py-3 animate-fade-in">
          {children}
        </div>
      )}
    </section>
  );
}
