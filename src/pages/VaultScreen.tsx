import { useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from '@tanstack/react-router';
import { Route } from '@/routes/vault.index';
import {
  useVault, useListingsBySeller, useDelistListing, useStoreProfile,
  useFollowedSellers, useFollowSeller, useUnfollowSeller, useDeleteVaultItem,
} from '@/hooks/useApi';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth';
import { StorefrontManager } from '@/components/vault/StorefrontManager';
import { ServicesManager } from '@/components/vault/ServicesManager';
import {
  LayoutGrid, List as ListIcon, LayoutTemplate, TrendingUp, TrendingDown,
  CheckSquare, Tag, Plus, Package, Store, EyeOff, Gift, Truck, Clock, Wallet, Trash2, RefreshCw,
  Filter, X, ChevronRight, ArrowUpRight, Sparkles,
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
import { type VaultFilter } from '@/components/vault/VaultFilterTabs';
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
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const { data: vault, isLoading, isFetching, isError: isVaultError, refetch: refetchVault } = useVault();
  const { data: listings, refetch: refetchListings } = useListingsBySeller(userId);
  const delistListing = useDelistListing();
  const deleteVaultItem = useDeleteVaultItem();

  const [activeFilter, setActiveFilter] = useState<VaultFilter>('ALL');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>('grid');
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [vaultViewMode, setVaultViewMode] = useState<'vault' | 'store'>('vault');
  const [storeTab, setStoreTab] = useState<'storefront' | 'services'>('storefront');
  const [confirmUnlistOpen, setConfirmUnlistOpen] = useState(false);
  const [confirmSingleUnlistItem, setConfirmSingleUnlistItem] = useState<VaultItem | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [bulkListModalOpen, setBulkListModalOpen] = useState(false);
  const { action } = Route.useSearch();
  const [registerModalOpen, setRegisterModalOpen] = useState(action === 'register');
  const [listTargetItem, setListTargetItem] = useState<VaultItem | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'offers'>('items');
  const [showFilters, setShowFilters] = useState(false);

  const listingsMap = useMemo(() => {
    const map = new Map<string, { listingId: string; price: number; isFeatured: boolean }>();
    listings?.forEach((l) => {
      if (l.status === 'active' || l.status === 'paused') {
        map.set(l.itemId!, { listingId: l.id, price: l.price, isFeatured: l.isFeatured ?? false });
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
      if (itemStatus === 'LISTING') c.LISTED++;
      if (itemStatus === 'LOCKED') c.LOCKED++;
      if (itemStatus === 'IN_TRANSIT') c.IN_TRANSIT++;
      if (itemStatus === 'REDEEMING') c.REDEEMING++;
      if (itemStatus === 'DELIVERED' || v.status === 'sold') c.COMPLETED++;
    });
    return c;
  }, [vault, listingsMap]);

  const filteredCards = useMemo(() => {
    if (!vault) return [];
    return vault.filter((v) => {
      if (vaultViewMode === 'store') return v.itemStatus === 'LISTING';
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'AVAILABLE') return v.itemStatus === 'AVAILABLE';
      if (activeFilter === 'VAULT_HELD') return v.itemStatus === 'VAULT_HELD';
      if (activeFilter === 'LISTED') return v.itemStatus === 'LISTING';
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

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['vault'] });
    queryClient.invalidateQueries({ queryKey: ['listingsBySeller', userId] });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    queryClient.invalidateQueries({ queryKey: ['market'] });
    refetchVault();
    refetchListings();
  }, [queryClient, userId, refetchVault, refetchListings]);

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

  const handleDelistItem = useCallback((item: VaultItem) => {
    const listing = listingsMap.get(item.id);
    if (listing) {
      setConfirmSingleUnlistItem(item);
    }
  }, [listingsMap]);

  const confirmSingleDelist = useCallback(() => {
    if (!confirmSingleUnlistItem) return;
    const listing = listingsMap.get(confirmSingleUnlistItem.id);
    if (listing) {
      delistListing.mutate(listing.listingId, {
        onSuccess: () => {
          toast.success(t('common.delistSuccess'));
          // Force immediate refetch after delist
          queryClient.invalidateQueries({ queryKey: ['vault'] });
          queryClient.invalidateQueries({ queryKey: ['listingsBySeller', userId] });
          queryClient.invalidateQueries({ queryKey: ['myListings'] });
          refetchVault();
          refetchListings();
        },
        onError: () => toast.error(t('common.delistError')),
      });
    }
    setConfirmSingleUnlistItem(null);
  }, [confirmSingleUnlistItem, listingsMap, delistListing, queryClient, userId, refetchVault, refetchListings, t]);

  const handleDeleteItem = useCallback((item: VaultItem) => {
    deleteVaultItem.mutate(item.id, {
      onSuccess: () => toast.success(t('vault.itemDeleted', { defaultValue: 'Item removed from vault' })),
      onError: () => toast.error(t('common.error')),
    });
  }, [deleteVaultItem, t]);

  const handleRedeemItem = useCallback((item: VaultItem) => {
    // Redemption/delivery flows live on the item detail page (address modal included)
    navigate({ to: '/vault/items/$itemId', params: { itemId: item.id } });
  }, [navigate]);

  const closeListModal = useCallback(() => {
    setListModalOpen(false);
    setListTargetItem(null);
  }, []);

  const handleBulkDelist = useCallback(() => {
    setConfirmUnlistOpen(true);
  }, []);

  const confirmBulkDelist = useCallback(async () => {
    const targets = selectedItems
      .map((item) => listingsMap.get(item.id))
      .filter((l): l is { listingId: string; price: number; isFeatured: boolean } => !!l);
    setConfirmUnlistOpen(false);
    clearSelection();
    if (targets.length === 0) return;

    const results = await Promise.allSettled(
      targets.map((l) => delistListing.mutateAsync(l.listingId))
    );
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - succeeded;

    if (succeeded > 0) toast.success(t('common.delistSuccessCount', { count: succeeded }));
    if (failed > 0) toast.error(t('common.delistError'));

    queryClient.invalidateQueries({ queryKey: ['vault'] });
    queryClient.invalidateQueries({ queryKey: ['listingsBySeller', userId] });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    refetchVault();
    refetchListings();
  }, [selectedItems, listingsMap, delistListing, clearSelection, queryClient, userId, refetchVault, refetchListings, t]);

  const selectedItem = listTargetItem ?? (selectedItems.length === 1 ? selectedItems[0] : null);

  // Grid responsive columns: 2→3→4→5→6
  const gridClass = activeView === 'compact'
    ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3'
    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4';

  return (
    <PageContainer className="py-5">
      <div className="space-y-5">
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
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
          </Link>
          <Link
            to="/vault-deliveries"
            className="flex items-center gap-2 rounded-xl surface-card surface-card-hover p-3 text-sm font-medium transition"
          >
            <Truck className="w-4 h-4 text-brand" />
            Deliveries
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="surface-card rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 text-brand" />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Value</p>
            </div>
            <p className="text-sm font-bold font-mono text-foreground">฿{totalValue.toLocaleString()}</p>
          </div>
          <div className="surface-card rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-md bg-periwinkle/10 flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-periwinkle" />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Cards</p>
            </div>
            <p className="text-sm font-bold font-mono">{cardCount}</p>
            <p className="text-xs text-muted-foreground">{heldCards.length} held</p>
          </div>
          <div className="surface-card rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', totalPL >= 0 ? 'bg-cyan/10' : 'bg-pldown/10')}>
                {totalPL >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-cyan" /> : <TrendingDown className="w-3.5 h-3.5 text-pldown" />}
              </div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">P/L</p>
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
              Vault
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
              Store
            </button>
          </div>
        </div>

        {/* ─── 3-Column Layout: Sidebar + Main + Activity ─── */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Sidebar — Filters */}
          <aside className={cn(
            'lg:w-52 xl:w-60 shrink-0 space-y-3',
            !showFilters && 'hidden lg:block'
          )}>
            <div className="surface-card rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="w-4 h-4 text-brand" />
                Filters
              </div>
              <div className="space-y-0.5">
                {(['ALL', 'AVAILABLE', 'LISTED', 'VAULT_HELD', 'IN_TRANSIT', 'REDEEMING', 'COMPLETED', 'LOCKED'] as VaultFilter[]).map((f) => {
                  const count = counts[f] ?? 0;
                  const active = activeFilter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all',
                        active
                          ? 'bg-brand/15 text-brand'
                          : 'text-muted-foreground hover:text-foreground hover:bg-surface-lighter'
                      )}
                    >
                      <span>{t(`filters.${f.toLowerCase()}` as any)}</span>
                      <span className={cn(
                        'min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-[10px] text-center',
                        active ? 'bg-brand/20 text-brand' : 'bg-surface-lighter text-muted-foreground'
                      )}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </aside>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar: Tab pills + View toggle + Select + Register */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              {/* Left: Tab pills (Items / Offers) */}
              <div className="inline-flex items-center rounded-xl surface-card p-1">
                <button
                  onClick={() => setActiveTab('items')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    activeTab === 'items'
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Package className="w-4 h-4" />
                  Items
                </button>
                <button
                  onClick={() => setActiveTab('offers')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    activeTab === 'offers'
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Offers
                </button>
              </div>

              {/* Right side: View toggles + Select + Register */}
              <div className="flex items-center gap-1 shrink-0">
                {selecting ? (
                  <>
                    <span className="text-xs text-muted-foreground mr-2">Selected {selectedIds.size}</span>
                    <button
                      onClick={clearSelection}
                      className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center text-muted-foreground hover:text-white hover:bg-danger/20 transition-all"
                      aria-label="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelecting(true)}
                    className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center text-muted-foreground hover:text-white transition-all"
                    aria-label="Select"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                )}
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setActiveView(v.id)}
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                      activeView === v.id ? 'bg-surface-lighter text-white' : 'text-muted-foreground hover:text-foreground'
                    )}
                    aria-label={t(v.labelKey)}
                    title={t(v.labelKey)}
                  >
                    <v.icon className="w-4 h-4" />
                  </button>
                ))}
                {/* Refresh button */}
                <button
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className={cn(
                    'w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center transition-all',
                    isFetching
                      ? 'text-brand bg-brand/10'
                      : 'text-muted-foreground hover:text-brand hover:bg-brand/10'
                  )}
                  aria-label="Refresh"
                  title="รีเฟรช"
                >
                  <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
                </button>
                {vaultViewMode === 'vault' && (
                  <Button size="sm" className="bg-brand hover:bg-brand-light gap-1.5 ml-1 h-10 px-3 rounded-xl" onClick={() => setRegisterModalOpen(true)}>
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-xs">Add</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border gap-1.5 h-8 px-2.5 rounded-xl"
                  onClick={() => setHistoryOpen(true)}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">History</span>
                </Button>
              </div>
            </div>

            {/* Bulk action bar */}
            {selecting && selectedIds.size > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface-light p-3 mb-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Selected {selectedIds.size}</span>
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
                    Select All Visible
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" className="gap-2 rounded-xl" onClick={handleBulkList}>
                    <Tag className="w-3.5 h-3.5" />
                    List
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-2 rounded-xl" onClick={handleBulkDelist}>
                    <EyeOff className="w-3.5 h-3.5" />
                    Delist
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-xl" onClick={clearSelection}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Content */}
            {isLoading ? (
              activeView === 'list' ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 bg-surface-light rounded-xl p-3 border border-border">
                      <Skeleton className="w-14 aspect-[5/7] rounded-lg shimmer" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-24 shimmer" />
                        <Skeleton className="h-4 w-1/2 shimmer" />
                        <Skeleton className="h-3 w-32 shimmer" />
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-16 shimmer" />
                        <Skeleton className="h-3 w-12 shimmer" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeView === 'compact' ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[5/7] rounded-2xl shimmer" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="aspect-[5/7] rounded-2xl shimmer" />
                      <Skeleton className="h-3 w-3/4 shimmer" />
                      <Skeleton className="h-3 w-1/2 shimmer" />
                    </div>
                  ))}
                </div>
              )
            ) : isVaultError ? (
              <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-20">
                <EmptyMedia variant="icon">
                  <Package className="w-8 h-8 text-brand" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>{t('vault.loadError', { defaultValue: "Couldn't load your vault" })}</EmptyTitle>
                  <EmptyDescription>{t('vault.loadErrorDesc', { defaultValue: 'Check your connection and try again.' })}</EmptyDescription>
                </EmptyHeader>
                <Button className="bg-brand hover:bg-brand-light gap-2 rounded-xl" onClick={() => refetchVault()}>
                  <RefreshCw className="w-4 h-4" />
                  {t('common.retry')}
                </Button>
              </Empty>
            ) : vaultViewMode === 'store' ? (
              <div className="space-y-4">
                {/* Store area sub-tabs */}
                <div className="inline-flex items-center rounded-xl surface-card p-1">
                  <button
                    onClick={() => setStoreTab('storefront')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      storeTab === 'storefront'
                        ? 'bg-surface text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Store className="w-4 h-4" />
                    Storefront
                  </button>
                  <button
                    onClick={() => setStoreTab('services')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                      storeTab === 'services'
                        ? 'bg-surface text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Sparkles className="w-4 h-4" />
                    Services
                  </button>
                </div>

                {storeTab === 'storefront' ? (
                  <StorefrontManager userId={userId} items={filteredCards} listingsMap={listingsMap} />
                ) : (
                  <ServicesManager />
                )}
              </div>
            ) : filteredCards.length === 0 ? (
              <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-20">
                <EmptyMedia variant="icon">
                  <Package className="w-8 h-8 text-brand" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No items found</EmptyTitle>
                  <EmptyDescription>Add cards to your vault to start tracking</EmptyDescription>
                </EmptyHeader>
                <Button className="bg-brand hover:bg-brand-light gap-2 rounded-xl" onClick={() => setRegisterModalOpen(true)}>
                  <Package className="w-4 h-4" />
                  Add Item
                </Button>
              </Empty>
            ) : activeTab === 'offers' ? (
              <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-20">
                <EmptyMedia variant="icon">
                  <ArrowUpRight className="w-8 h-8 text-brand" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No offers yet</EmptyTitle>
                  <EmptyDescription>Offers will appear here when someone makes a bid</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                {activeView === 'grid' && (
                  <div className={cn(gridClass, 'stagger-fade-in')}>
                    {filteredCards.map((item) => (
                      <VaultCard
                        key={item.id}
                        item={item}
                        selected={selectedIds.has(item.id)}
                        selecting={selecting}
                        onToggleSelect={toggleSelect}
                        onList={handleListItem}
                        onDelist={handleDelistItem}
                        onRedeem={handleRedeemItem}
                        onDelete={handleDeleteItem}
                        isOwner={item.ownerId === userId}
                      />
                    ))}
                  </div>
                )}

                {activeView === 'list' && (
                  <div className="space-y-3 stagger-fade-in">
                    {filteredCards.map((item) => (
                      <VaultListRow
                        key={item.id}
                        item={item}
                        selected={selectedIds.has(item.id)}
                        selecting={selecting}
                        onToggleSelect={toggleSelect}
                        onList={handleListItem}
                        onDelist={handleDelistItem}
                        onRedeem={handleRedeemItem}
                        onDelete={handleDeleteItem}
                        isListed={item.itemStatus === 'LISTING'}
                        isOwner={item.ownerId === userId}
                      />
                    ))}
                  </div>
                )}

                {activeView === 'compact' && (
                  <div className={cn(gridClass, 'stagger-fade-in')}>
                    {filteredCards.map((item) => (
                      <VaultCard
                        key={item.id}
                        item={item}
                        selected={selectedIds.has(item.id)}
                        selecting={selecting}
                        onToggleSelect={toggleSelect}
                        onList={handleListItem}
                        onDelist={handleDelistItem}
                        onRedeem={handleRedeemItem}
                        onDelete={handleDeleteItem}
                        isOwner={item.ownerId === userId}
                        className="rounded-xl"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>

          {/* Right Sidebar — Activity (only on very wide screens; otherwise it
              overlaps the toolbar and squeezes the grid — verified via rect measurement) */}
          <aside className="hidden 2xl:block w-52 shrink-0 space-y-3">
            <div className="surface-card rounded-xl p-3.5 space-y-2.5">
              <div className="text-sm font-semibold text-foreground">Recent</div>
              <div className="space-y-2.5">
                {filteredCards.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    to="/vault/items/$itemId"
                    params={{ itemId: item.id }}
                    className="flex items-center gap-2 group"
                  >
                    <div className="w-8 h-10 rounded-md bg-surface-lighter overflow-hidden shrink-0">
                      {item.card.imageUrl ? (
                        <img src={item.card.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-mono text-muted-foreground">
                          {item.card.code}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate group-hover:text-brand transition-colors">{item.card.nameEn}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{item.card.code}</p>
                    </div>
                    <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                  </Link>
                ))}
                {filteredCards.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No items yet</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="surface-card rounded-xl p-3.5 space-y-2.5">
              <div className="text-sm font-semibold text-foreground">Quick Links</div>
              <div className="space-y-1">
                <Link
                  to="/market"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-lighter transition-all"
                >
                  <Store className="w-3.5 h-3.5" />
                  Market
                </Link>
                <Link
                  to="/services"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-lighter transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Grading Services
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modals */}
      <ListItemModal
        open={listModalOpen}
        onClose={closeListModal}
        item={selectedItem}
        listing={selectedItem ? listingsMap.get(selectedItem.id) ?? null : null}
      />
      <BulkListModal open={bulkListModalOpen} onClose={() => setBulkListModalOpen(false)} items={selectedItems} />
      <RegisterItemModal isOpen={registerModalOpen} onClose={() => setRegisterModalOpen(false)} />
      <VaultHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} userId={userId} />

      {/* Confirm Unlist Dialog */}
      {confirmUnlistOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface-light p-6 space-y-4 animate-scale-in">
            <h3 className="text-lg font-semibold">Confirm Delist</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delist {selectedIds.size} item(s)?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setConfirmUnlistOpen(false)}>Cancel</Button>
              <Button variant="destructive" size="sm" className="rounded-xl" onClick={confirmBulkDelist}>Delist</Button>
            </div>
          </div>
        </div>
      )}
      {/* Confirm Single Unlist Dialog */}
      {confirmSingleUnlistItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface-light p-6 space-y-4 animate-scale-in">
            <h3 className="text-lg font-semibold">Confirm Delist</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delist <strong className="text-foreground">{confirmSingleUnlistItem.card.nameEn}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setConfirmSingleUnlistItem(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" className="rounded-xl" onClick={confirmSingleDelist}>Delist</Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

/* ─── Vault List Row ─── */

function VaultListRow({
  item, selected, selecting, onToggleSelect, onList, onDelist, onRedeem, onDelete, isListed, isOwner,
}: {
  item: VaultItem;
  selected?: boolean;
  selecting?: boolean;
  onToggleSelect?: (id: string) => void;
  onList?: (item: VaultItem) => void;
  onDelist?: (item: VaultItem) => void;
  onRedeem?: (item: VaultItem) => void;
  onDelete?: (item: VaultItem) => void;
  isListed?: boolean;
  isOwner?: boolean;
}) {
  return (
    <Link
      to="/vault/items/$itemId"
      params={{ itemId: item.id }}
      className="flex items-center gap-4 bg-surface-light rounded-xl p-3 border border-border hover:border-brand/30 transition group hover-lift"
    >
      {selecting && (
        <div onClick={(e) => { e.preventDefault(); onToggleSelect?.(item.id); }}>
          <Checkbox checked={selected} />
        </div>
      )}
      <div className="w-14 aspect-[5/7] rounded-lg overflow-hidden bg-surface-lighter shrink-0 flex items-center justify-center text-xl font-bold text-muted-foreground">
        {item.card.imageUrl ? (
          <img src={item.card.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          item.card.code
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-muted-foreground">{item.card.code}</p>
          {isListed && (
            <span className="text-xs font-mono bg-brand/10 text-brand px-1.5 rounded">Listed</span>
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
        {isListed && isOwner && onDelist && !selecting && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelist(item);
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-warning hover:underline"
          >
            <EyeOff className="w-3 h-3" />
            Delist
          </button>
        )}
        {!isListed && isOwner && item.status === 'held' && onList && !selecting && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onList(item);
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            <Tag className="w-3 h-3" />
            List
          </button>
        )}
        {!isListed && isOwner && item.status === 'held' && onRedeem && !selecting && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRedeem(item);
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-periwinkle hover:underline"
          >
            <Gift className="w-3 h-3" />
            Redeem
          </button>
        )}
        {!isListed && isOwner && item.status !== 'sold' && onDelete && !selecting && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm('Remove this item?')) {
                onDelete(item);
              }
            }}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-danger hover:underline"
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>
        )}
        {!isOwner && (
          <span className="mt-2 inline-block text-xs text-muted-foreground/50">
            Held by platform
          </span>
        )}
      </div>
    </Link>
  );
}
