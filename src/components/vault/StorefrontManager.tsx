import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  useStoreProfile,
  useUpdateStoreProfile,
  useUploadStoreAvatar,
  useUploadStoreBanner,
  useStoreGroups,
  useUpdateStoreGroups,
  useUpdateListing,
} from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, getCardImageUrl } from '@/lib/utils';
import { downscaleImage } from '@/lib/image';
import type { VaultItem, StoreGroup } from '@/types';
import {
  Edit3, ImagePlus, Package, Plus, Trash2, MapPin, Loader2, GripVertical, FolderOpen, Eye, Star,
  Link as LinkIcon, Store, Heart,
} from 'lucide-react';
import { toast } from 'sonner';

/* Platforms offered in the social-links editor; the public store page
   renders any platform with a generic icon as fallback. */
const LINK_PLATFORMS = ['instagram', 'facebook', 'twitter', 'tiktok', 'line', 'website'] as const;

interface StorefrontManagerProps {
  userId: string;
  items: VaultItem[];
  listingsMap: Map<string, { listingId: string; price: number; isFeatured: boolean }>;
}

type ListingMapEntry = { listingId: string; price: number; isFeatured: boolean };

export function StorefrontManager({ userId, items, listingsMap }: StorefrontManagerProps) {
  const { data: profile, isLoading: profileLoading } = useStoreProfile(userId);
  const updateProfile = useUpdateStoreProfile();
  const uploadAvatar = useUploadStoreAvatar();
  const uploadBanner = useUploadStoreBanner();

  const queryClient = useQueryClient();
  const { data: groups = [], isLoading: groupsLoading } = useStoreGroups(userId);
  const updateGroups = useUpdateStoreGroups();

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftBio, setDraftBio] = useState('');
  const [draftLocation, setDraftLocation] = useState('');
  const [draftAvatar, setDraftAvatar] = useState<string | undefined>();
  const [draftBanner, setDraftBanner] = useState<string | undefined>();
  const [draftLinks, setDraftLinks] = useState<{ platform: string; url: string }[]>([]);

  const [newGroupName, setNewGroupName] = useState('');
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

  const startEditing = () => {
    setDraftName(profile?.displayName || profile?.name || '');
    setDraftBio(profile?.bio || '');
    setDraftLocation(profile?.location || '');
    setDraftAvatar(profile?.avatarUrl);
    setDraftBanner(profile?.bannerUrl);
    setDraftLinks(profile?.socialLinks ?? []);
    setIsEditing(true);
  };

  const groupedCardCodes = useMemo(() => {
    const set = new Set<string>();
    groups.forEach((g) => g.cardCodes.forEach((code) => set.add(code)));
    return set;
  }, [groups]);

  const ungroupedItems = useMemo(
    () => items.filter((i) => !groupedCardCodes.has(i.card.code)),
    [items, groupedCardCodes]
  );

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (file: File) => {
    try {
      const url = await uploadAvatar.mutateAsync(await downscaleImage(file));
      setDraftAvatar(url);
    } catch {
      // ignore
    }
  };

  const handleBannerSelect = async (file: File) => {
    try {
      const url = await uploadBanner.mutateAsync(await downscaleImage(file));
      setDraftBanner(url);
    } catch {
      // ignore
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync({
      userId,
      data: {
        displayName: draftName,
        bio: draftBio,
        location: draftLocation,
        avatarUrl: draftAvatar,
        bannerUrl: draftBanner,
        socialLinks: draftLinks.filter((l) => l.url.trim()),
      },
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftAvatar(profile?.avatarUrl);
    setDraftBanner(profile?.bannerUrl);
    setDraftLinks(profile?.socialLinks ?? []);
  };

  const setLink = (index: number, patch: Partial<{ platform: string; url: string }>) => {
    setDraftLinks((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const setGroupsAndPersist = (next: StoreGroup[]) => {
    queryClient.setQueryData(['storeGroups', userId], next);
    updateGroups.mutate({ userId, groups: next });
  };

  const moveItemToGroup = (cardCode: string, targetGroupId: string | null) => {
    const next = groups.map((g) => ({ ...g, cardCodes: g.cardCodes.filter((code) => code !== cardCode) }));
    if (targetGroupId) {
      const idx = next.findIndex((g) => g.id === targetGroupId);
      if (idx >= 0) next[idx] = { ...next[idx], cardCodes: [...next[idx].cardCodes, cardCode] };
    }
    setGroupsAndPersist(next);
  };

  const addGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    const next = [...groups, { id: `g-${Date.now()}`, name, cardCodes: [] as string[] }];
    setGroupsAndPersist(next);
    setNewGroupName('');
  };

  const deleteGroup = (groupId: string) => {
    const next = groups.filter((g) => g.id !== groupId);
    setGroupsAndPersist(next);
  };

  const bannerUrl = isEditing ? draftBanner : profile?.bannerUrl;
  const avatarUrl = isEditing ? draftAvatar : profile?.avatarUrl;
  const displayName = profile?.displayName || profile?.name || 'My Store';

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Control room — the storefront itself is the hero.
          One surface, hairline divisions, zero nested cards. */}
      <Card className="overflow-hidden border-border bg-surface-light">
        {/* Status strip — friendly mode indicator + actions */}
        <div className="flex items-center justify-between gap-2 border-b border-border bg-surface/50 px-4 py-3 sm:px-5">
          <p className="flex items-center gap-2 text-xs font-semibold">
            <span className={cn('h-2 w-2 rounded-full', isEditing ? 'animate-pulse bg-warning' : 'bg-cyan')} />
            {isEditing ? '✏️ Customizing your store…' : '✨ Your store is live'}
          </p>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground" asChild>
              <Link to="/seller/$sellerId" params={{ sellerId: userId }}>
                <Eye className="w-3.5 h-3.5" />
                View public page
              </Link>
            </Button>
            {isEditing ? (
              <>
                <Button size="sm" variant="ghost" className="h-8 rounded-full px-3 text-xs" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-full bg-brand px-4 text-xs font-bold hover:bg-brand-light"
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending && <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />}
                  Save changes
                </Button>
              </>
            ) : (
              <Button size="sm" className="h-8 gap-1.5 rounded-full bg-brand px-4 text-xs font-bold shadow-glow hover:bg-brand-light" onClick={startEditing}>
                <Edit3 className="w-3 h-3" />
                Customize store
              </Button>
            )}
          </div>
        </div>

        {isEditing ? (
          /* Edit mode — control room: controls left, live buyer view right */
          <div className="grid lg:grid-cols-[440px_1fr]">
            <div className="divide-y divide-border border-b border-border lg:border-b-0 lg:border-r">
              <section className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Store className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Store identity</p>
                    <p className="text-[11px] text-muted-foreground">The basics buyers see first</p>
                  </div>
                </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store name</Label>
                  <Input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="Display name"
                    className="bg-surface border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={draftLocation}
                    onChange={(e) => setDraftLocation(e.target.value)}
                    placeholder="City, Country"
                    className="bg-surface border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  placeholder="Tell buyers about your store..."
                  className="bg-surface border-border min-h-[100px]"
                />
              </div>
              </section>
              <section className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pldown/10 text-pldown">
                    <Heart className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Social &amp; links</p>
                    <p className="text-[11px] text-muted-foreground">Ways buyers can reach you</p>
                  </div>
                </div>
                {draftLinks.length === 0 && (
                  <p className="rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
                    No links yet — add your shop's Facebook, LINE, or website so buyers can say hi 👋
                  </p>
                )}
                <div className="space-y-2.5">
                  {draftLinks.map((link, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Select value={link.platform} onValueChange={(v) => setLink(i, { platform: v })}>
                        <SelectTrigger className="h-10 w-36 shrink-0 bg-surface border-border text-xs capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-surface-light border-border">
                          {LINK_PLATFORMS.map((p) => (
                            <SelectItem key={p} value={p} className="text-xs capitalize">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={link.url}
                        onChange={(e) => setLink(i, { url: e.target.value })}
                        placeholder="https://..."
                        className="h-10 bg-surface border-border text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setDraftLinks((prev) => prev.filter((_, j) => j !== i))}
                        aria-label="Remove link"
                        className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-pldown/10 hover:text-pldown"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 rounded-full border-dashed border-border text-xs hover:border-brand/40 hover:text-brand"
                  onClick={() => setDraftLinks((prev) => [...prev, { platform: 'instagram', url: '' }])}
                >
                  <Plus className="w-3 h-3" />
                  Add a link
                </Button>
              </section>
              <section className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                    <ImagePlus className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">Photos</p>
                    <p className="text-[11px] text-muted-foreground">Make it feel like your shop</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Store avatar</Label>
                  <Input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarSelect(f); }}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 w-full h-24 rounded-xl border border-dashed border-border bg-surface hover:border-brand/40 hover:bg-brand/5 transition"
                  >
                    {uploadAvatar.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    ) : (
                      <>
                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {draftAvatar ? 'Tap to change avatar' : 'Tap to upload avatar'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">Square photo works best</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Store banner</Label>
                  <Input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleBannerSelect(f); }}
                  />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-1.5 w-full h-24 rounded-xl border border-dashed border-border bg-surface hover:border-brand/40 hover:bg-brand/5 transition"
                  >
                    {uploadBanner.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    ) : (
                      <>
                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {draftBanner ? 'Tap to change banner' : 'Tap to upload banner'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">Wide photo looks great here</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              </section>
            </div>

            {/* Buyer view — the public store hero, updating live as you type */}
            <div className="bg-surface/40 p-5 sm:p-6">
              <p className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Eye className="w-3.5 h-3.5" />
                👀 This is what buyers see — updates as you type
              </p>
              <StorefrontHero
                name={draftName.trim() || displayName}
                bio={draftBio}
                location={draftLocation}
                avatarUrl={draftAvatar}
                bannerUrl={draftBanner}
                links={draftLinks.filter((l) => l.url.trim())}
                listings={items.length}
                sales={profile?.sales ?? 0}
                followers={profile?.followers ?? 0}
              />
            </div>
          </div>
        ) : (
          /* View mode — banner hero + hairline stats row */
          <>
            <div
              className={cn(
                'h-40 sm:h-48 bg-cover bg-center relative',
                !bannerUrl && 'bg-gradient-to-br from-surface-lighter via-surface-light to-brand/20'
              )}
              style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
            <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
              <Avatar className="-mt-12 w-24 h-24 rounded-xl border-4 border-surface-light shadow-lg bg-surface-lighter sm:-mt-14 sm:w-28 sm:h-28">
                <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                <AvatarFallback className="rounded-xl text-2xl font-bold bg-surface-lighter text-foreground">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 pb-1">
                <h2 className="truncate text-xl font-bold sm:text-2xl">@{displayName}</h2>
                {profile?.bio && (
                  <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{profile.bio}</p>
                )}
                {profile?.location && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
                    <MapPin className="w-3 h-3" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>
            {/* Stats — friendly cells with icons */}
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
              {[
                { value: items.length, label: 'Listings', icon: <Package className="w-3.5 h-3.5 text-brand" /> },
                { value: profile?.sales ?? 0, label: 'Sales', icon: <Star className="w-3.5 h-3.5 text-pregrade" /> },
                { value: profile?.followers ?? 0, label: 'Followers', icon: <Heart className="w-3.5 h-3.5 text-periwinkle" /> },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1.5 px-2 py-4 text-center">
                  {s.icon}
                  <p className="text-lg font-extrabold leading-none mono-num">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Public preview / Group manager */}
      {!isEditing ? (
        <StorefrontPreview items={items} listingsMap={listingsMap} />
      ) : (
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <FolderOpen className="w-3.5 h-3.5" />
              </span>
              Shelves on your storefront
            </h3>
            <p className="mt-1 text-xs text-text-tertiary">
              Create shelves like “Pokémon” or “New arrivals”, then drag cards onto them — buyers browse by shelf.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g. Manga"
              className="h-8 text-sm bg-surface border-border"
              onKeyDown={(e) => { if (e.key === 'Enter') addGroup(); }}
            />
            <Button size="sm" className="h-8 bg-brand hover:bg-brand-light gap-1" onClick={addGroup}>
              <Plus className="w-3.5 h-3.5" />
              Add
            </Button>
          </div>
        </div>

        {items.length === 0 && (
          <Card className="bg-surface-light border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              Your store is empty for now — list cards from your vault and they'll appear here 🌱
            </CardContent>
          </Card>
        )}

        {groupsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {groups.map((group) => {
              const groupItems = items.filter((i) => group.cardCodes.includes(i.card.code));
              return (
                <DropGroup
                  key={group.id}
                  group={group}
                  items={groupItems}
                  isOver={dragOverGroup === group.id}
                  onDragOver={() => setDragOverGroup(group.id)}
                  onDragLeave={() => setDragOverGroup((prev) => (prev === group.id ? null : prev))}
                  onDrop={(cardCode) => moveItemToGroup(cardCode, group.id)}
                  onDelete={() => deleteGroup(group.id)}
                  listingsMap={listingsMap}
                />
              );
            })}

            {/* Ungrouped */}
            <div
              className={cn(
                'rounded-xl border border-dashed border-border bg-surface-light/50 p-5 transition',
                dragOverGroup === 'ungrouped' && 'border-brand bg-brand/5'
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOverGroup('ungrouped'); }}
              onDragLeave={() => setDragOverGroup((prev) => (prev === 'ungrouped' ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                const cardCode = e.dataTransfer.getData('text/plain');
                if (cardCode) moveItemToGroup(cardCode, null);
                setDragOverGroup(null);
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-muted-foreground" />
                  Not on a shelf yet
                </h4>
                <span className="text-xs text-muted-foreground">{ungroupedItems.length}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {ungroupedItems.map((item) => (
                  <DraggableItem key={item.id} item={item} listingsMap={listingsMap} />
                ))}
              </div>
              {ungroupedItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Everything's on a shelf — nice! 🎉
                </p>
              )}
            </div>
          </div>
        )}
      </section>
      )}
    </div>
  );
}

/** Buyer-view replica of the public store hero — rendered with draft values
    so the owner sees exactly what buyers will see, before saving. */
function StorefrontHero({
  name,
  bio,
  location,
  avatarUrl,
  bannerUrl,
  links,
  listings,
  sales,
  followers,
}: {
  name: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  links: { platform: string; url: string }[];
  listings: number;
  sales: number;
  followers: number;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-light shadow-lg">
      <div
        className={cn(
          'relative h-32 bg-cover bg-center',
          !bannerUrl && 'bg-gradient-to-br from-surface-lighter via-surface-light to-brand/20'
        )}
        style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="px-4 pb-4">
        <Avatar className="-mt-8 h-16 w-16 rounded-xl border-2 border-surface-light bg-surface-lighter shadow">
          <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
          <AvatarFallback className="rounded-xl text-lg font-bold bg-surface-lighter text-foreground">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <p className="mt-2 truncate text-sm font-bold">@{name}</p>
        {bio && <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{bio}</p>}
        {location && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {location}
          </p>
        )}
        {links.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {links.map((l, i) => (
              <span
                key={`${l.platform}-${i}`}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-[10px] capitalize text-muted-foreground"
              >
                <LinkIcon className="w-2.5 h-2.5" />
                {l.platform}
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 grid grid-cols-3 divide-x divide-border border-t border-border pt-3.5 text-center">
          {[
            { value: listings, label: 'Listings' },
            { value: sales, label: 'Sales' },
            { value: followers, label: 'Followers' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-sm font-extrabold leading-none mono-num">{s.value}</p>
              <p className="mt-1.5 text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StorefrontPreview({
  items,
  listingsMap,
}: {
  items: VaultItem[];
  listingsMap: Map<string, ListingMapEntry>;
}) {
  const updateListing = useUpdateListing();
  const listedItems = useMemo(
    () => items.filter((i) => listingsMap.has(i.id)),
    [items, listingsMap]
  );

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Package className="w-3.5 h-3.5" />
          </span>
          On your shelf right now
        </h3>
        <span className="rounded-full bg-surface px-2.5 py-0.5 mono-num text-xs text-muted-foreground">{listedItems.length}</span>
      </div>

      {listedItems.length === 0 ? (
        <Card className="bg-surface-light border-border">
          <CardContent className="py-14 text-center space-y-2">
            <Package className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="font-semibold">Nothing on sale yet</p>
            <p className="text-sm text-muted-foreground">List cards from your vault — they'll show up here ready to sell ✨</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {listedItems.map((item) => {
            const listing = listingsMap.get(item.id);
            return (
              <div key={item.id} className="relative group">
                <Link
                  to={listing ? '/market/$listingId' : '/vault/items/$itemId'}
                  params={{ listingId: listing?.listingId ?? '', itemId: item.id }}
                  className="group block bg-surface-light rounded-xl overflow-hidden border border-border hover:border-brand/40 transition"
                >
                  <div className="aspect-[5/7] overflow-hidden relative">
                    <img
                      src={getCardImageUrl(item.card)}
                      alt={item.card.nameEn}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-mono text-text-tertiary">{item.card.code}</p>
                    <p className="text-xs font-semibold line-clamp-1 group-hover:text-brand transition">{item.card.nameEn}</p>
                    <p className="text-brand font-bold text-xs mt-1">
                      {listing ? `฿${listing.price.toLocaleString()}` : '—'}
                    </p>
                  </div>
                </Link>
                {/* Featured toggle (owner) */}
                {listing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateListing.mutate(
                        { listingId: listing.listingId, data: { is_featured: !listing.isFeatured } },
                        {
                          onSuccess: () => toast.success(listing.isFeatured ? 'Removed from featured' : 'Added to featured'),
                          onError: () => toast.error('Failed to update featured'),
                        }
                      );
                    }}
                    aria-label={listing.isFeatured ? 'Unfeature' : 'Feature'}
                    title={listing.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                    className={cn(
                      'absolute top-1.5 right-1.5 z-10 rounded-full p-1.5 backdrop-blur-sm transition-all',
                      listing.isFeatured
                        ? 'bg-pregrade/90 text-surface-dark shadow'
                        : 'bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:text-pregrade'
                    )}
                  >
                    <Star className={cn('w-3.5 h-3.5', listing.isFeatured && 'fill-current')} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DropGroup({
  group,
  items,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onDelete,
  listingsMap,
}: {
  group: StoreGroup;
  items: VaultItem[];
  isOver: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (cardCode: string) => void;
  onDelete: () => void;
  listingsMap: Map<string, ListingMapEntry>;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-surface-light p-5 transition hover:border-brand/20',
        isOver ? 'border-brand bg-brand/5' : 'border-border'
      )}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e.dataTransfer.getData('text/plain'));
        onDragLeave();
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
          {group.name}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{items.length}</span>
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-pldown transition"
            aria-label={`Delete ${group.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {items.map((item) => (
          <DraggableItem key={item.id} item={item} listingsMap={listingsMap} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Empty shelf — drag cards here to fill it ✨
        </p>
      )}
    </div>
  );
}

function DraggableItem({
  item,
  listingsMap,
}: {
  item: VaultItem;
  listingsMap: Map<string, ListingMapEntry>;
}) {
  const listing = listingsMap.get(item.id);
  return (
    <Link
      to="/vault/items/$itemId"
      params={{ itemId: item.id }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', item.card.code);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className="group block rounded-lg overflow-hidden border border-border bg-surface hover:border-brand/40 transition cursor-grab active:cursor-grabbing"
    >
      <div className="aspect-[5/7] overflow-hidden bg-surface-lighter">
        <img
          src={getCardImageUrl(item.card)}
          alt={item.card.nameEn}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      <div className="p-2">
        <p className="text-xs font-mono text-text-tertiary truncate">{item.card.code}</p>
        <h5 className="text-xs font-semibold leading-tight line-clamp-2 group-hover:text-brand transition min-h-[1.75rem]">{item.card.nameEn}</h5>
        <p className="text-xs text-brand font-bold mt-0.5">
          {listing ? `฿${listing.price.toLocaleString()}` : '—'}
        </p>
      </div>
    </Link>
  );
}
