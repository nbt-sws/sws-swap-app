import { cn, getCardImageUrl } from '@/lib/utils';import { useState, useMemo } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMarketListings } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, LayoutGrid, List as ListIcon,
  ChevronDown, X, ShieldCheck, Package, ShoppingBag, RefreshCw,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ListingCard } from '@/components/domain/ListingCard';
import { QuickViewModal } from '@/components/domain/QuickViewModal';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { MarketListing } from '@/types';

const SHELVES: { id: string; key: string }[] = [
  { id: 'All', key: 'market.shelves.all' },
  { id: 'RAW', key: 'market.shelves.raw' },
  { id: 'PRE-GRADED', key: 'market.shelves.preGraded' },
  { id: 'GRADED', key: 'market.shelves.graded' },
  { id: 'SEALED-BOX', key: 'market.shelves.sealedBox' },
];
// Stable ids for filtering — translations are for display only
const GAMES: { id: string; key: string }[] = [
  { id: 'one-piece', key: 'market.games.onePiece' },
  { id: 'yu-gi-oh', key: 'market.games.yugioh' },
];
const LISTING_TYPES: { id: string; key: string }[] = [
  { id: 'SALE', key: 'market.listingTypes.sale' },
  { id: 'TRADE', key: 'market.listingTypes.trade' },
];

const SORT_OPTIONS: { id: string; key: string }[] = [
  { id: 'trending', key: 'market.sort.trending' },
  { id: 'newest', key: 'market.sort.newest' },
  { id: 'price-asc', key: 'market.sort.priceAsc' },
  { id: 'price-desc', key: 'market.sort.priceDesc' },
];

const PRICE_RANGES: { id: string; key: string; min: number; max: number }[] = [
  { id: 'all', key: 'market.priceRanges.all', min: 0, max: Infinity },
  { id: 'under-1k', key: 'market.priceRanges.under1k', min: 0, max: 1000 },
  { id: '1k-5k', key: 'market.priceRanges.1kTo5k', min: 1000, max: 5000 },
  { id: '5k-10k', key: 'market.priceRanges.5kTo10k', min: 5000, max: 10000 },
  { id: '10k-50k', key: 'market.priceRanges.10kTo50k', min: 10000, max: 50000 },
  { id: 'over-50k', key: 'market.priceRanges.over50k', min: 50000, max: Infinity },
];

export function MarketScreen() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const searchParams = useSearch({ from: '/market/' });
  const [activeShelf, setActiveShelf] = useState('All');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState((searchParams as { q?: string }).q ?? '');
  const [activeSort, setActiveSort] = useState('trending');
  const [activePriceRange, setActivePriceRange] = useState('all');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [quickView, setQuickView] = useState<MarketListing | null>(null);

  const { data: listings, isLoading, isFetching, refetch } = useMarketListings(activeShelf === 'All' ? undefined : activeShelf);

  const handleRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['market'] });
    queryClient.invalidateQueries({ queryKey: ['listings'] });
    queryClient.invalidateQueries({ queryKey: ['myListings'] });
    queryClient.invalidateQueries({ queryKey: ['vault'] });
  };

  const filteredListings = useMemo(() => {
    let result = [...(listings || [])];

    if (activeGame) {
      result = result.filter((l) => l.card.game.includes(activeGame));
    }

    if (activeType) result = result.filter((l) => l.listingType === activeType);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) =>
        l.card.nameEn.toLowerCase().includes(q) ||
        l.card.code.toLowerCase().includes(q)
      );
    }

    if (activePriceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === activePriceRange);
      if (range) {
        result = result.filter((l) => l.price >= range.min && l.price <= range.max);
      }
    }

    if (showVerifiedOnly) {
      result = result.filter((l) => l.vaultVerified);
    }

    switch (activeSort) {
      case 'newest':
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }

    return result;
  }, [listings, activeGame, activeType, searchQuery, activePriceRange, showVerifiedOnly, activeSort, t]);

  const activeFilterCount = [
    activeGame !== null,
    activeType !== null,
    activePriceRange !== 'all',
    showVerifiedOnly,
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  // Market pulse — computed from the live listing set
  const marketStats = useMemo(() => {
    if (!listings || listings.length === 0) return null;
    const salePrices = listings
      .filter((l) => l.listingType !== 'TRADE' && l.price > 0)
      .map((l) => l.price);
    return {
      count: listings.length,
      floor: salePrices.length > 0 ? Math.min(...salePrices) : null,
      sellers: new Set(listings.map((l) => l.seller.id)).size,
      trades: listings.filter((l) => l.listingType === 'TRADE').length,
    };
  }, [listings]);

  const clearAllFilters = () => {
    setActiveGame(null);
    setActiveType(null);
    setActivePriceRange('all');
    setShowVerifiedOnly(false);
    setSearchQuery('');
    setActiveSort('trending');
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title={t('market.title')}
        icon={<ShoppingBag className="w-6 h-6 text-brand" />}
      />

      {/* Market pulse — only when there's enough activity to be worth stating;
          a sparse market shouldn't advertise its own thinness */}
      {marketStats && marketStats.count >= 2 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-y border-border py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2 font-medium text-foreground">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            {t('market.stats.live', { count: marketStats.count })}
          </span>
          {marketStats.floor !== null && (
            <span className="font-mono">{t('market.stats.floor', { price: marketStats.floor.toLocaleString() })}</span>
          )}
          {marketStats.sellers > 1 && (
            <span className="font-mono">{t('market.stats.sellers', { count: marketStats.sellers })}</span>
          )}
          {marketStats.trades > 0 && (
            <span className="font-mono text-cyan">{t('market.stats.forTrade', { count: marketStats.trades })}</span>
          )}
        </div>
      )}

      <div className="space-y-6 mt-6">
        {/* Search + sort + view toolbar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('market.searchPlaceholder')}
              aria-label={t('market.searchPlaceholder')}
              className="w-full bg-surface-light pl-11 pr-11 placeholder:text-muted-foreground/50 border-transparent focus:border-brand"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                aria-label={t('common.clearSearch')}
                className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground hover:bg-surface-lighter"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <div className="relative hidden sm:block shrink-0">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="h-10 appearance-none rounded-xl border border-border bg-surface-light pl-3 pr-8 text-xs text-muted-foreground outline-none focus:border-brand"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{t(opt.key)}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className={cn(
              'w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center transition-all shrink-0',
              isFetching
                ? 'text-brand bg-brand/10'
                : 'text-muted-foreground hover:text-brand hover:bg-brand/10'
            )}
            aria-label="Refresh"
            title="รีเฟรช"
          >
            <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          </button>

          <div className="hidden sm:flex rounded-xl border border-border bg-surface-light p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-surface-lighter text-brand' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label={t('common.gridView')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-1.5 transition-colors ${viewMode === 'list' ? 'bg-surface-lighter text-brand' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label={t('common.listView')}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border overflow-x-auto scrollbar-hide">
          {[
            { label: t('market.tabs.browse'), count: null, to: '/market' },
            { label: t('market.tabs.myCollection'), count: null, to: '/vault' },
            { label: t('market.tabs.myListings'), count: null, to: '/seller' },
          ].map((tab, i) => (
            <Link
              key={tab.label}
              to={tab.to}
              className={`pb-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                i === 0 ? 'border-brand text-brand' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-1.5 rounded-md bg-surface-lighter px-1.5 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Shelf categories + filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pr-2">
            {SHELVES.map((shelf) => (
              <button
                key={shelf.id}
                onClick={() => setActiveShelf(shelf.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  activeShelf === shelf.id
                    ? 'bg-brand text-white'
                    : 'bg-surface-light text-muted-foreground hover:text-white'
                }`}
              >
                {t(shelf.key)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            aria-label={t('common.filters')}
            className="relative flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface-light px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-lighter transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t('common.filters')}
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="hidden lg:flex gap-2 flex-wrap items-center">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setActiveGame(activeGame === game.id ? null : game.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeGame === game.id
                  ? 'bg-periwinkle/20 text-periwinkle border border-periwinkle/30'
                  : 'bg-surface-light text-muted-foreground border border-transparent'
              }`}
            >
              {t(game.key)}
            </button>
          ))}
          {LISTING_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(activeType === type.id ? null : type.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeType === type.id
                  ? 'bg-cyan/20 text-cyan border border-cyan/30'
                  : 'bg-surface-light text-muted-foreground border border-transparent'
              }`}
            >
              {t(type.key)}
            </button>
          ))}

          <div className="relative">
            <select
              value={activePriceRange}
              onChange={(e) => setActivePriceRange(e.target.value)}
              className="h-8 appearance-none rounded-lg border border-border bg-surface-light pl-2.5 pr-7 text-xs text-muted-foreground outline-none focus:border-brand"
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.id} value={r.id}>{t(r.key)}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          </div>

          <button
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              showVerifiedOnly
                ? 'bg-brand/10 text-brand border border-brand/30'
                : 'bg-surface-light text-muted-foreground border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            {t('common.verifiedOnly')}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-brand transition-colors ml-auto"
            >
              {t('common.clearAll')}
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activeGame && (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1 bg-periwinkle/10 text-periwinkle border-0">
                {t(GAMES.find((g) => g.id === activeGame)?.key ?? '')}
                <button onClick={() => setActiveGame(null)}><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activeType && (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1 bg-cyan/10 text-cyan border-0">
                {t(LISTING_TYPES.find((ty) => ty.id === activeType)?.key ?? '')}
                <button onClick={() => setActiveType(null)}><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activePriceRange !== 'all' && (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1">
                {t(PRICE_RANGES.find((r) => r.id === activePriceRange)?.key ?? 'market.priceRanges.all')}
                <button onClick={() => setActivePriceRange('all')}><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {showVerifiedOnly && (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1">
                {t('common.verifiedOnly')}
                <button onClick={() => setShowVerifiedOnly(false)}><X className="w-3 h-3" /></button>
              </Badge>
            )}
          </div>
        )}

        {/* Market shelf — persistent zone so the page feels composed with any item count */}
        <section className="rounded-xl border border-border/50 bg-surface-light/40 p-3 sm:p-5 space-y-4">
          {/* Results header */}
          {!isLoading && (
            <div className="flex items-baseline justify-between px-1">
              <p className="text-sm font-medium">
                {t('market.resultsCount', { count: filteredListings.length })}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-brand transition-colors lg:hidden"
                >
                  {t('common.clearAll')}
                </button>
              )}
            </div>
          )}

          {/* Listings */}
          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-fr">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="space-y-2 h-full">
                    <Skeleton className="aspect-[5/7] rounded-xl" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 bg-surface-light rounded-xl p-3 border border-border">
                    <Skeleton className="w-16 aspect-[5/7] rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredListings.length === 0 ? (
            <Empty className="py-16">
              <EmptyMedia variant="icon">
                <Package className="w-8 h-8 text-brand" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>{t('market.empty')}</EmptyTitle>
                <EmptyDescription>{t('market.emptyDesc')}</EmptyDescription>
              </EmptyHeader>
              {activeFilterCount > 0 && (
                <Button variant="outline" size="sm" className="border-border" onClick={clearAllFilters}>
                  {t('market.clearFilters')}
                </Button>
              )}
            </Empty>
          ) : viewMode === 'grid' ? (
            <div className={cn(
              'grid grid-cols-2 gap-6 auto-rows-fr',
              filteredListings.length < 4
                ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
                : 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            )}>
              {filteredListings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <ListingCard
                    listing={listing}
                    onQuickView={(l) => setQuickView(l)}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <MarketListRow
                  key={listing.id}
                  listing={listing}
                  onQuickView={(l) => setQuickView(l)}
                />
              ))}
            </div>
          )}
        </section>

        <QuickViewModal
          listing={quickView}
          open={!!quickView}
          onClose={() => setQuickView(null)}
        />

        {/* Mobile filter sheet */}
        {showMobileFilters && (
          <MobileFilterSheet
            onClose={() => setShowMobileFilters(false)}
            activeGame={activeGame}
            setActiveGame={setActiveGame}
            activeType={activeType}
            setActiveType={setActiveType}
            activePriceRange={activePriceRange}
            setActivePriceRange={setActivePriceRange}
            showVerifiedOnly={showVerifiedOnly}
            setShowVerifiedOnly={setShowVerifiedOnly}
            activeSort={activeSort}
            setActiveSort={setActiveSort}
            resultCount={filteredListings.length}
            clearAll={clearAllFilters}
          />
        )}
      </div>
    </PageContainer>
  );
}

function MarketListRow({
  listing,
  onQuickView,
}: {
  listing: MarketListing;
  onQuickView?: (l: MarketListing) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4 bg-surface-light rounded-xl p-3 border border-border hover:border-brand/30 transition cursor-pointer"
      onClick={() => onQuickView?.(listing)}
    >
      <div className="w-16 aspect-[5/7] rounded-lg overflow-hidden bg-surface-lighter shrink-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
        <ImageWithFallback
          src={getCardImageUrl(listing.card)}
          alt={listing.card.nameEn}
          className="h-full w-full"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-muted-foreground">{listing.card.code}</p>
          {listing.vaultVerified && (
            <span className="text-xs font-mono bg-brand/10 text-brand px-1.5 rounded">{t('market.verified').toUpperCase()}</span>
          )}
        </div>
        <p className="text-sm font-semibold truncate">{listing.card.nameEn}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-xs font-mono bg-surface-lighter px-1.5 rounded">{listing.shelf}</span>
          <span className="text-xs font-mono bg-surface-lighter px-1.5 rounded">{listing.listingType}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold font-mono">{listing.listingType === 'TRADE' ? t('common.tradeOnly') : `฿${listing.price.toLocaleString()}`}</p>
        <p className="text-xs text-muted-foreground">{listing.seller.name}</p>
      </div>
    </div>
  );
}

function MobileFilterSheet({
  onClose,
  activeGame,
  setActiveGame,
  activeType,
  setActiveType,
  activePriceRange,
  setActivePriceRange,
  showVerifiedOnly,
  setShowVerifiedOnly,
  activeSort,
  setActiveSort,
  resultCount,
  clearAll,
}: {
  onClose: () => void;
  activeGame: string | null;
  setActiveGame: (v: string | null) => void;
  activeType: string | null;
  setActiveType: (v: string | null) => void;
  activePriceRange: string;
  setActivePriceRange: (v: string) => void;
  showVerifiedOnly: boolean;
  setShowVerifiedOnly: (v: boolean) => void;
  activeSort: string;
  setActiveSort: (v: string) => void;
  resultCount: number;
  clearAll: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-surface-light p-6 shadow-xl animate-slide-up">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t('common.filters')}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-surface-lighter">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('common.game')}</h3>
            <div className="space-y-1">
              {GAMES.map((game) => (
                <button
                  key={game.id}
                  onClick={() => setActiveGame(activeGame === game.id ? null : game.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                    activeGame === game.id
                      ? 'bg-brand/10 font-medium text-brand'
                      : 'text-muted-foreground hover:bg-surface-lighter'
                  }`}
                >
                  {t(game.key)}
                  {activeGame === game.id && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('common.type')}</h3>
            <div className="space-y-1">
              {LISTING_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveType(activeType === type.id ? null : type.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                    activeType === type.id
                      ? 'bg-brand/10 font-medium text-brand'
                      : 'text-muted-foreground hover:bg-surface-lighter'
                  }`}
                >
                  {t(type.key)}
                  {activeType === type.id && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('common.sort')}</h3>
            <div className="space-y-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setActiveSort(opt.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                    activeSort === opt.id
                      ? 'bg-brand/10 font-medium text-brand'
                      : 'text-muted-foreground hover:bg-surface-lighter'
                  }`}
                >
                  {t(opt.key)}
                  {activeSort === opt.id && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('common.priceRange')}</h3>
            <div className="space-y-1">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setActivePriceRange(range.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                    activePriceRange === range.id
                      ? 'bg-brand/10 font-medium text-brand'
                      : 'text-muted-foreground hover:bg-surface-lighter'
                  }`}
                >
                  {t(range.key)}
                  {activePriceRange === range.id && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-lighter">
            <Checkbox
              id="verified-only"
              checked={showVerifiedOnly}
              onCheckedChange={(checked) => setShowVerifiedOnly(checked === true)}
            />
            <span className="text-sm text-muted-foreground">{t('common.verifiedSellersOnly')}</span>
            <ShieldCheck className="ml-auto w-4 h-4 text-brand" />
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={clearAll}
            className="flex-1 rounded-xl border border-border bg-surface-light py-3 text-sm font-medium text-muted-foreground hover:bg-surface-lighter transition-colors"
          >
            {t('common.clearAll')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-brand py-3 text-sm font-medium text-white hover:bg-brand-light transition-colors"
          >
            {t('common.showResults', { count: resultCount })}
          </button>
        </div>
      </div>
    </>
  );
}
