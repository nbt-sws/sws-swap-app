import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateListing } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Camera, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Card as CardType, MarketListing } from '@/types';

const GAMES: { value: CardType['game']; label: string }[] = [
  { value: 'one-piece', label: 'One Piece' },
  { value: 'yu-gi-oh', label: 'Yu-Gi-Oh!' },
  { value: 'pokemon', label: 'Pokémon' },
  { value: 'lorcana', label: 'Lorcana' },
  { value: 'conan', label: 'Conan' },
  { value: 'others', label: 'Others' },
];

const CONDITIONS: CardType['condition'][] = ['Raw', 'PSA 10', 'PSA 9', 'BGS 9.5', 'CGC 9.5', 'RAWLITY 9.5', 'RAWLITY 9', 'BLACKLENS 92', 'BLACKLENS 85'];
const SHELVES: MarketListing['shelf'][] = ['RAW', 'PRE-GRADED', 'GRADED', 'SEALED-BOX'];
const LANGUAGES: CardType['language'][] = ['JP', 'EN'];

export function CreateListingScreen() {
  const navigate = useNavigate();
  const createListing = useCreateListing();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [listingType, setListingType] = useState<'SALE' | 'TRADE'>('SALE');
  const [form, setForm] = useState({
    game: 'one-piece' as CardType['game'],
    code: '',
    nameEn: '',
    nameJp: '',
    rarity: '',
    type: '',
    language: 'JP' as CardType['language'],
    condition: 'Raw' as CardType['condition'],
    shelf: 'RAW' as MarketListing['shelf'],
    price: '',
    description: '',
  });

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.nameEn) return;

    createListing.mutate(
      {
        card: {
          id: crypto.randomUUID(),
          code: form.code,
          nameEn: form.nameEn,
          nameJp: form.nameJp,
          rarity: form.rarity,
          type: form.type,
          language: form.language,
          game: form.game,
          condition: form.condition,
          imageUrl: undefined,
        },
        price: listingType === 'SALE' ? Number(form.price) || 0 : 0,
        listingType,
        shelf: form.shelf,
        description: form.description,
      },
      {
        onSuccess: () => navigate({ to: '/seller' }),
      }
    );
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Create new listing"
        back={{ to: '/seller' }}
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-surface-light border-border">
            <CardHeader>
              <CardTitle className="text-base">Card details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Game</label>
                  <Select value={form.game} onValueChange={(v) => update('game', v)}>
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
                    required
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
                  required
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
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Condition</label>
                  <Select value={form.condition} onValueChange={(v) => update('condition', v as CardType['condition'])}>
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
                  <label className="text-sm font-medium">Shelf</label>
                  <Select value={form.shelf} onValueChange={(v) => update('shelf', v as MarketListing['shelf'])}>
                    <SelectTrigger className="w-full bg-surface border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-light border-border">
                      {SHELVES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface-light border-border">
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Add details about the card condition, shipping, or trades you are looking for..."
                className="bg-surface border-border min-h-24"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-surface-light border-border sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Listing settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Listing type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['SALE', 'TRADE'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setListingType(type)}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm font-medium border transition',
                        listingType === type
                          ? 'border-brand bg-brand/10 text-brand'
                          : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {type === 'SALE' ? 'For sale' : 'For trade'}
                    </button>
                  ))}
                </div>
              </div>

              {listingType === 'SALE' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (฿)</label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="0"
                    className="bg-surface border-border"
                    required={listingType === 'SALE'}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Photos</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground bg-surface hover:bg-surface-light transition"
                >
                  <Camera className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">{photos.length > 0 ? `${photos.length} photo(s) selected` : 'Upload card photos'}</p>
                  <p className="text-xs">{photos.length > 0 ? photos.map(f => f.name).join(', ') : 'Tap to select files'}</p>
                </button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) setPhotos(Array.from(e.target.files));
                  }}
                />
              </div>

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Package className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  Vault-verified listings get more views. You can send the card to the vault after creating the listing.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-brand hover:bg-brand-light h-12"
                disabled={createListing.isPending || !form.code || !form.nameEn || (listingType === 'SALE' && !form.price)}
              >
                {createListing.isPending ? 'Creating...' : 'Publish listing'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </PageContainer>
  );
}
