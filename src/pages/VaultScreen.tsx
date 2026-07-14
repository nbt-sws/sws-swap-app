import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Route } from '@/routes/vault.index';
import {
  useVault, useListingsBySeller, useDelistListing, useStoreProfile,
  useFollowedSellers, useFollowSeller, useUnfollowSeller,
} from '@/hooks/useApi';
import { useAuthStore } from '@/stores/auth';
import { StorefrontManager } from '@/components/vault/StorefrontManager';
import {
  LayoutGrid, List as ListIcon, LayoutTemplate, TrendingUp, TrendingDown,
  CheckSquare, Tag, Plus, Package, Store, EyeOff, Gift, Truck, Clock, Wallet,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { VaultCard } from '@/components/domain/VaultCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { cn, formatPriceChange } from '@/lib/utils';
import { ListItemModal } from '@/components/vault/ListItemModal';
import { BulkListModal } from '@/components/vault/BulkListModal';
import { RegisterItemModal } from '@/components/vault/RegisterItemModal';
import { VaultFilterTabs, type VaultFilter } from '@/components/vault/VaultFilterTabs';
import { VaultProfileHeader, VaultProfileHeaderSkeleton } from '@/components/vault/VaultProfileHeader';
import { VaultHistoryDialog } from '@/components/vault/VaultHistoryDialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { VaultItem, StoreProfile } from '@/types';

const VIEWS = [
  { id: 'grid', icon: LayoutGrid, labelKey: 'common.gridView' },
  { id: 'list', icon: ListIcon, labelKey: 'common.listView' },
  { id: 'compact', icon: LayoutTemplate, labelKey: 'common.compactView' },
] as const;

export function VaultScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const { data: vault, isLoading } = useVault();
  const { data: listings } = useListingsBySeller(userId);
  const delistListing = useDelistListing();

  const [activeFilter, setActiveFilter] = useState<VaultFilter>('ALL');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>('grid');
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [vaultViewMode, setVaultViewMode] = useState<'vault' | 'store'>('vault');
  const [confirmUnlistOpen, setConfirmUnlistOpen] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [bulkListModalOpen, setBulkListModalOpen] = useState(false);
  const { action } = Route.useSearch();
  const [registerModalOpen, setRegisterModalOpen] = useState(action === 'register');
  const [listTargetItem, setListTargetItem] = useState<VaultItem | null>(null);
  const listingsMap = useMemo(() => {
    const map = new Map<string, { listingId: string; price: number }>();
    listings?.forEach((l) => {
      if (l.status === 'active' || l.status === 'paused') {
        map.set(l.card.code, { listingId: l.id, price: l.price });
      }
    });
    return map;
  }, [listings]);

  const heldCards = useMemo(() => vault?.filter((v) => v.status === 'held') ?? [], [vault]);
  const totalValue = useMemo(() => heldCards.reduce((sum, v) => sum + v.currentPrice, 0), [heldCards]);
  const totalPL = useMemo(() => heldCards.reduce((sum, v) => sum + v.plAmount, 0), [heldCards]);
  const cardCount = vault?.length ?? 0;

  const { data: profile, isLoading: profileLoading } = useStoreProfile(userId);
  const { data: followedIds } = useFollowedSellers();
  const followSeller = useFollowSeller();
  const unfollowSeller = useUnfollowSeller();
  const isOwner = user?.id === userId;
  const isFollowing = followedIds?.includes(userId) ?? false;

  const fallbackProfile = useMemo<StoreProfile>(() => ({
    id: userId,
    userId,
    name: user?.fullName || user?.email || userId,
    displayName: user?.fullName,
    avatarUrl: user?.avatarUrl,
    rating: 0,
    listings: 0,
    sales: 0,
    followers: 0,
  }), [userId, user]);
  const effectiveProfile = profile ?? fallbackProfile;

  const counts = useMemo(() => {
    const c: Record<VaultFilter, number> = {
      ALL: 0,
      AVAILABLE: 0,
      VAULT_HELD: 0,
      LISTED: 0,
      IN_TRANSIT: 0,
      REDEEMING: 0,
      COMPLETED: 0,
      LOCKED: 0,
    };
    vault?.forEach((v) => {
      c.ALL++;
      const itemStatus = v.itemStatus;
      if (itemStatus === 'AVAILABLE') c.AVAILABLE++;
      if (itemStatus === 'VAULT_HELD') c.VAULT_HELD++;
      if (itemStatus === 'LOCKED') c.LOCKED++;
      if (itemStatus === 'IN_TRANSIT') c.IN_TRANSIT++;
      if (itemStatus === 'REDEEMING') c.REDEEMING++;
      if (itemStatus === 'DELIVERED' || v.status === 'sold') c.COMPLETED++;
      if (listingsMap.has(v.card.code)) c.LISTED++;
    });
    return c;
  }, [vault, listingsMap]);

  const filteredCards = useMemo(() => {
    if (!vault) return [];
    return vault.filter((v) => {
      if (vaultViewMode === 'store') return listingsMap.has(v.card.code);
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'AVAILABLE') return v.itemStatus === 'AVAILABLE' && !listingsMap.has(v.card.code);
      if (activeFilter === 'VAULT_HELD') return v.itemStatus === 'VAULT_HELD';
      if (activeFilter === 'LISTED') return listingsMap.has(v.card.code);
      if (activeFilter === 'IN_TRANSIT') return v.itemStatus === 'IN_TRANSIT';
      if (activeFilter === 'REDEEMING') return v.itemStatus === 'REDEEMING';
      if (activeFilter === 'COMPLETED') return v.itemStatus === 'DELIVERED' || v.status === 'sold';
      if (activeFilter === 'LOCKED') return v.itemStatus === 'LOCKED';
      return false;
    });
  }, [vault, vaultViewMode, activeFilter, listingsMap]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelecting(false);
  }, []);

  const selectedItems = useMemo(
    () => filteredCards.filter((v) => selectedIds.has(v.id)),
    [filteredCards, selectedIds]
  );

  const handleBulkList = useCallback(() => {
    if (selectedItems.length === 1) {
      setListTargetItem(selectedItems[0]);
      setListModalOpen(true);
    } else if (selectedItems.length > 1) {
      setBulkListModalOpen(true);
    }
  }, [selectedItems]);

  const handleListItem = useCallback((item: VaultItem) => {
    setListTargetItem(item);
    setListModalOpen(true);
  }, []);

  const closeListModal = useCallback(() => {
    setListModalOpen(false);
    setListTargetItem(null);
  }, []);

  const handleBulkDelist = useCallback(() => {
    setConfirmUnlistOpen(true);
  }, []);

  const confirmBulkDelist = useCallback(() => {
    selectedItems.forEach((item) => {
      const listing = listingsMap.get(item.card.code);
      if (listing) delistListing.mutate(listing.listingId);
    });
    setConfirmUnlistOpen(false);
    clearSelection();
  }, [selectedItems, listingsMap, delistListing, clearSelection]);

  const selectedItem = listTargetItem ?? (selectedItems.length === 1 ? selectedItems[0] : null);

  return (
    <PageContainer className="py-6">
      <div className="space-y-6">
        {/* Profile header */}
        {profileLoading && !profile ? (
          <VaultProfileHeaderSkeleton />
        ) : (
          <VaultProfileHeader
            profile={effectiveProfile}
            isOwner={isOwner}
            isFollowing={isFollowing}
            onFollow={() => {
              if (isFollowing) unfollowSeller.mutate(userId);
              else followSeller.mutate(userId);
            }}
            onShare={() => {
              const url = typeof window !== 'undefined' ? window.location.href : '';
              if (navigator.share) {
                navigator.share({ title: effectiveProfile.displayName || effectiveProfile.name, url }).catch(() => {});
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(url).catch(() => {});
              }
            }}
          />
        )}
        {/* Fulfillment links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/redemptions"
            className="flex items-center gap-2 rounded-xl surface-card surface-card-hover p-3 text-sm font-medium transition"
          >
            <Gift className="w-4 h-4 text-brand" />
            Redemptions
          </Link>
          <Link
            to="/vault-deliveries"
            className="flex items-center gap-2 rounded-xl surface-card surface-card-hover p-3 text-sm font-medium transition"
          >
            <Truck className="w-4 h-4 text-brand" />
            Deliveries
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="surface-card rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 text-brand" />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t('vault.stats.value')}</p>
            </div>
            <p className="text-sm font-bold font-mono text-foreground">฿{totalValue.toLocaleString()}</p>
          </div>
          <div className="surface-card rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-periwinkle/10 flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-periwinkle" />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t('vault.stats.cards')}</p>
            </div>
            <p className="text-sm font-bold font-mono">{cardCount}</p>
            <p className="text-xs text-muted-foreground">{heldCards.length} {t('vault.stats.held')}</p>
          </div>
          <div className="surface-card rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', totalPL >= 0 ? 'bg-cyan/10' : 'bg-pldown/10')}>
                {totalPL >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-cyan" /> : <TrendingDown className="w-3.5 h-3.5 text-pldown" />}
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t('vault.stats.pl')}</p>
            </div>
            <p className={cn(
              'text-sm font-bold font-mono flex items-center gap-1',
              totalPL >= 0 ? 'text-plup' : 'text-pldown'
            )}>
              ฿{Math.abs(totalPL).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {totalPL >= 0 ? '+' : '-'}
              {totalValue > totalPL ? ((totalPL / (totalValue - totalPL)) * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
        </div>

      {/* Vault / Store Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center rounded-xl surface-card p-1">
          <button
            onClick={() => { setVaultViewMode('vault'); clearSelection(); }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              vaultViewMode === 'vault'
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Package className="w-4 h-4" />
            {t('vault.vault')}
          </button>
          <button
            onClick={() => { setVaultViewMode('store'); clearSelection(); }}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              vaultViewMode === 'store'
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Store className="w-4 h-4" />
            {t('vault.store')}
          </button>
        </div>
      </div>

      {/* Toolbar: Filters + Views + Select + Register */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        {/* Filter Pills */}
        <VaultFilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
          isOwner={isOwner}
        />

        {/* Right side: View toggles + Select + Register */}
        <div className="flex items-center gap-1 shrink-0">
          {selecting ? (
            <>
              <span className="text-xs text-muted-foreground mr-2">{t('common.selected', { count: selectedIds.size })}</span>
              <button
                onClick={clearSelection}
                className="w-11 h-11 rounded-lg bg-surface-light flex items-center justify-center text-muted-foreground hover:text-white"
                aria-label={t('common.cancel')}
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSelecting(true)}
              className="w-11 h-11 rounded-lg bg-surface-light flex items-center justify-center text-muted-foreground hover:text-white"
              aria-label={t('common.selectAll')}
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          )}
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={cn(
                'w-11 h-11 rounded-lg flex items-center justify-center transition-all',
                activeView === v.id ? 'bg-surface-lighter text-white' : 'text-muted-foreground'
              )}
              aria-label={t(v.labelKey)}
              title={t(v.labelKey)}
            >
              <v.icon className="w-4 h-4" />
            </button>
          ))}
          {vaultViewMode === 'vault' && (
            <Button size="sm" className="bg-brand hover:bg-brand-light gap-1.5 ml-1 h-10 px-2.5" onClick={() => setRegisterModalOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">{t('common.add')}</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-border gap-1.5 h-8 px-2.5"
            onClick={() => setHistoryOpen(true)}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">{t('common.history')}</span>
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selecting && selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-light p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{t('common.selected', { count: selectedIds.size })}</span>
            <button onClick={() => {
              const visibleIds = filteredCards.map((i) => i.id);
              const allSelected = visibleIds.every((id) => selectedIds.has(id));
              setSelectedIds((prev) => {
                const next = new Set(prev);
                if (allSelected) {
                  visibleIds.forEach((id) => next.delete(id));
                } else {
                  visibleIds.forEach((id) => next.add(id));
                }
                return next;
              });
            }} className="text-sm text-brand hover:underline">
              {t('common.selectAll')}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="gap-2" onClick={handleBulkList}>
              <Tag className="w-3.5 h-3.5" />
              {t('common.list')}
            </Button>
            <Button size="sm" variant="secondary" className="gap-2" onClick={handleBulkDelist}>
              <EyeOff className="w-3.5 h-3.5" />
              {t('common.delist')}
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        activeView === 'list' ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 bg-surface-light rounded-xl p-3 border border-border">
                <Skeleton className="w-14 aspect-[5/7] rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : activeView === 'compact' ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[5/7] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[5/7] rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )
      ) : filteredCards.length === 0 ? (
        <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-20">
          <EmptyMedia variant="icon">
            <Package className="w-8 h-8 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{vaultViewMode === 'store' ? t('vault.empty.storeTitle') : t('vault.empty.vaultTitle')}</EmptyTitle>
            <EmptyDescription>
              {vaultViewMode === 'store'
                ? t('vault.empty.storeDesc')
                : t('vault.empty.vaultDesc')}
            </EmptyDescription>
          </EmptyHeader>
          {vaultViewMode === 'store' && (
            <Button className="bg-brand hover:bg-brand-light gap-2" onClick={() => { setVaultViewMode('vault'); }}>
              <Package className="w-4 h-4" />
              {t('common.goToVault')}
            </Button>
          )}
        </Empty>
      ) : vaultViewMode === 'store' ? (
        <StorefrontManager userId={userId} items={filteredCards} listingsMap={listingsMap} />
      ) : (
        <>
          {activeView === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredCards.map((item) => (
                <VaultCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  selecting={selecting}
                  onToggleSelect={toggleSelect}
                  onList={handleListItem}
                />
              ))}
            </div>
          )}

          {activeView === 'list' && (
            <div className="space-y-4">
              {filteredCards.map((item) => (
                <VaultListRow
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  selecting={selecting}
                  onToggleSelect={toggleSelect}
                  onList={handleListItem}
                  isListed={listingsMap.has(item.card.code)}
                />
              ))}
            </div>
          )}

          {activeView === 'compact' && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredCards.map((item) => (
                <VaultCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  selecting={selecting}
                  onToggleSelect={toggleSelect}
                  onList={handleListItem}
                  className="rounded-xl"
                />
              ))}
            </div>
          )}
        </>
      )}
      </div>

      {/* Modals */}
      <ListItemModal open={listModalOpen} onClose={closeListModal} item={selectedItem} />
      <BulkListModal open={bulkListModalOpen} onClose={() => setBulkListModalOpen(false)} items={selectedItems} />
      <RegisterItemModal isOpen={registerModalOpen} onClose={() => setRegisterModalOpen(false)} />
      <VaultHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} userId={userId} />

      {/* Confirm Unlist Dialog */}
      {confirmUnlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface-light p-6 space-y-4">
            <h3 className="text-lg font-semibold">{t('vault.confirmUnlist.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('vault.confirmUnlist.description', { count: selectedIds.size })}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setConfirmUnlistOpen(false)}>{t('common.cancel')}</Button>
              <Button variant="destructive" size="sm" onClick={confirmBulkDelist}>{t('common.delist')}</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

/* ─── Vault List Row ─── */

function VaultListRow({
  item, selected, selecting, onToggleSelect, onList, isListed,
}: {
  item: VaultItem;
  selected?: boolean;
  selecting?: boolean;
  onToggleSelect?: (id: string) => void;
  onList?: (item: VaultItem) => void;
  isListed?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Link
      to="/vault/items/$itemId"
      params={{ itemId: item.id }}
      className="flex items-center gap-4 bg-surface-light rounded-xl p-3 border border-border hover:border-brand/30 transition group"
    >
      {selecting && (
        <div onClick={(e) => { e.preventDefault(); onToggleSelect?.(item.id); }}>
          <Checkbox checked={selected} />
        </div>
      )}
      <div className="w-14 aspect-[5/7] rounded-lg overflow-hidden bg-surface-lighter shrink-0 flex items-center justify-center text-xl font-bold text-muted-foreground">
        {item.card.code}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-muted-foreground">{item.card.code}</p>
          {isListed && (
            <span className="text-xs font-mono bg-brand/10 text-brand px-1.5 rounded">{t('filters.listed').toUpperCase()}</span>
          )}
        </div>
        <p className="text-sm font-semibold truncate">{item.card.nameEn}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-xs font-mono bg-surface-lighter px-1.5 rounded">{item.condition}</span>
          <span className="text-xs font-mono bg-surface-lighter px-1.5 rounded">{item.card.rarity}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold font-mono">฿{item.currentPrice.toLocaleString()}</p>
        <p className={cn('text-xs font-bold', item.plPercent >= 0 ? 'text-plup' : 'text-pldown')}>
          {formatPriceChange(item.plPercent)}
        </p>
        {onList && item.status === 'held' && !selecting && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onList(item);
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            <Tag className="w-3 h-3" />
            {t('common.list')}
          </button>
        )}
      </div>
    </Link>
  );
}
