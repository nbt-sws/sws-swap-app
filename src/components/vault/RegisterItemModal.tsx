import { useState } from 'react';
import { useAddToVault } from '@/hooks/useApi';
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
import { Package } from 'lucide-react';

interface RegisterItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GAMES = [
  { value: 'one-piece', label: '⚓ One Piece' },
  { value: 'yu-gi-oh', label: '⚔ Yu-Gi-Oh!' },
];

const CONDITIONS = ['Raw', 'PSA 10', 'PSA 9', 'BGS 9.5', 'CGC 9.5', 'RAWLITY 9.5', 'RAWLITY 9', 'BLACKLENS 92', 'BLACKLENS 85'] as const;

export function RegisterItemModal({ isOpen, onClose }: RegisterItemModalProps) {
  const addToVault = useAddToVault();
  const [form, setForm] = useState({
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
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.code || !form.nameEn) return;

    addToVault.mutate(
      {
        name: form.nameEn,
        sku: form.code,
        category: form.game,
        subCategory: form.rarity,
        itemFormat: form.language,
        condition: form.condition,
        description: `Type: ${form.type}, NameJP: ${form.nameJp}, Source: ${form.source || 'Manual entry'}, Paid: ${form.paidPrice} THB`,
      },
      {
        onSuccess: () => {
          setForm({
            code: '',
            nameEn: '',
            nameJp: '',
            rarity: '',
            type: '',
            language: 'JP',
            game: 'one-piece',
            condition: 'Raw',
            paidPrice: '',
            source: '',
            dateAcquired: new Date().toISOString().split('T')[0],
          });
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface-light border-border max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-brand" />
            Register item to vault
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Game</label>
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
              <label className="text-sm font-medium">Card code</label>
              <Input
                value={form.code}
                onChange={(e) => update('code', e.target.value)}
                placeholder="e.g. OP02-013"
                className="bg-surface border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Card name (EN)</label>
            <Input
              value={form.nameEn}
              onChange={(e) => update('nameEn', e.target.value)}
              placeholder="e.g. Portgas D. Ace"
              className="bg-surface border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Card name (JP) <span className="text-muted-foreground">optional</span></label>
            <Input
              value={form.nameJp}
              onChange={(e) => update('nameJp', e.target.value)}
              placeholder="e.g. ポートガス・D・エース"
              className="bg-surface border-border"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rarity</label>
              <Input
                value={form.rarity}
                onChange={(e) => update('rarity', e.target.value)}
                placeholder="e.g. SR"
                className="bg-surface border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Input
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                placeholder="e.g. Character"
                className="bg-surface border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Condition</label>
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
              <label className="text-sm font-medium">Paid price (฿)</label>
              <Input
                type="number"
                value={form.paidPrice}
                onChange={(e) => update('paidPrice', e.target.value)}
                placeholder="0"
                className="bg-surface border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date acquired</label>
              <Input
                type="date"
                value={form.dateAcquired}
                onChange={(e) => update('dateAcquired', e.target.value)}
                className="bg-surface border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Input
                value={form.source}
                onChange={(e) => update('source', e.target.value)}
                placeholder="e.g. Yahoo JP auction"
                className="bg-surface border-border"
              />
            </div>
          </div>

          <Button
            className="w-full bg-brand hover:bg-brand-light h-11"
            onClick={handleSubmit}
            disabled={addToVault.isPending || !form.code || !form.nameEn}
          >
            {addToVault.isPending ? 'Adding...' : 'Add to vault'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
