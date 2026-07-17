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
import { cn, getCardImageUrl } from '@/lib/utils';
import { downscaleImage } from '@/lib/image';
import type { VaultItem, StoreGroup } from '@/types';
import {
  Edit3, ImagePlus, Package, Plus, Trash2, MapPin, Loader2, GripVertical, FolderOpen, Eye, Star,
} from 'lucide-react';
import { toast } from 'sonner';

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

  const [newGroupName, setNewGroupName] = useState('');
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

  const startEditing = () => {
    setDraftName(profile?.displayName || profile?.name || '');
    setDraftBio(profile?.bio || '');
    setDraftLocation(profile?.location || '');
    setDraftAvatar(profile?.avatarUrl);
    setDraftBanner(profile?.bannerUrl);
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
      },
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftAvatar(profile?.avatarUrl);
    setDraftBanner(profile?.bannerUrl);
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
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-surface-light border-border overflow-hidden">
        <div
          className={cn(
            'h-40 sm:h-48 bg-cover bg-center relative',
            !bannerUrl && 'bg-gradient-to-br from-surface-lighter via-surface-light to-brand/20'
          )}
          style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {!isEditing && (
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 bg-black/40 border-white/10 text-white hover:bg-black/60"
                asChild
              >
                <Link to="/seller/$sellerId" params={{ sellerId: userId }}>
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </Link>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 bg-black/40 border-white/10 text-white hover:bg-black/60"
                onClick={startEditing}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Customize
              </Button>
            </div>
          )}
        </div>
        <CardContent className="p-4 sm:p-5 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-4 border-surface-light shadow-lg bg-surface-lighter">
              <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
              <AvatarFallback className="rounded-xl text-2xl font-bold bg-surface-lighter text-foreground">
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-xl sm:text-2xl font-bold truncate">@{displayName}</h2>
              {profile?.bio && !isEditing && (
                <p className="text-sm text-text-secondary mt-1 line-clamp-2">{profile.bio}</p>
              )}
              {profile?.location && !isEditing && (
                <div className="flex items-center gap-1 text-xs text-text-secondary mt-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm shrink-0">
              <div className="text-center">
                <p className="font-bold">{items.length}</p>
                <p className="text-xs text-muted-foreground">Listings</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{profile?.sales ?? 0}</p>
                <p className="text-xs text-muted-foreground">Sales</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{profile?.followers ?? 0}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-5 space-y-4 border-t border-border pt-4">
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
                  className="bg-surface border-border min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store avatar</Label>
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
                    className="flex items-center justify-center gap-2 w-full h-20 rounded-xl border border-dashed border-border bg-surface hover:border-brand/40 transition"
                  >
                    {uploadAvatar.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    ) : (
                      <>
                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {draftAvatar ? 'Change avatar' : 'Upload avatar'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  <Label>Store banner</Label>
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
                    className="flex items-center justify-center gap-2 w-full h-20 rounded-xl border border-dashed border-border bg-surface hover:border-brand/40 transition"
                  >
                    {uploadBanner.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    ) : (
                      <>
                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {draftBanner ? 'Change banner' : 'Upload banner'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-brand hover:bg-brand-light"
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  Save store profile
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Public preview / Group manager */}
      {!isEditing ? (
        <StorefrontPreview items={items} listingsMap={listingsMap} />
      ) : (
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-brand" />
              Storefront groups
            </h3>
            <p className="text-xs text-text-tertiary mt-0.5">
              Drag cards between groups to organize how buyers browse your store.
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
              Your store is empty. List items from your vault to start organizing.
            </CardContent>
          </Card>
        )}

        {groupsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                'rounded-xl border border-dashed border-border bg-surface-light/50 p-4 transition',
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
                  Ungrouped
                </h4>
                <span className="text-xs text-muted-foreground">{ungroupedItems.length}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {ungroupedItems.map((item) => (
                  <DraggableItem key={item.id} item={item} listingsMap={listingsMap} />
                ))}
              </div>
              {ungroupedItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Drag items here to ungroup
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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Package className="w-4 h-4 text-brand" />
          All listings
        </h3>
        <span className="text-xs text-muted-foreground">{listedItems.length}</span>
      </div>

      {listedItems.length === 0 ? (
        <Card className="bg-surface-light border-border">
          <CardContent className="py-14 text-center space-y-2">
            <Package className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="font-semibold">No active listings</p>
            <p className="text-sm text-muted-foreground">List cards from your vault to start selling.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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
        'rounded-xl border bg-surface-light p-4 transition hover:border-brand/20',
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
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {items.map((item) => (
          <DraggableItem key={item.id} item={item} listingsMap={listingsMap} />
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Drag items into {group.name}
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
      <div className="p-1.5">
        <p className="text-xs font-mono text-text-tertiary truncate">{item.card.code}</p>
        <h5 className="text-xs font-semibold leading-tight line-clamp-2 group-hover:text-brand transition min-h-[1.75rem]">{item.card.nameEn}</h5>
        <p className="text-xs text-brand font-bold mt-0.5">
          {listing ? `฿${listing.price.toLocaleString()}` : '—'}
        </p>
      </div>
    </Link>
  );
}
