import { useState, useMemo } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMarketListings, useVault, useMyListings } from '@/hooks/useApi';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, LayoutGrid, List as ListIcon,
  ChevronDown, X, ShieldCheck, Package,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ListingCard } from '@/components/domain/ListingCard';
import { QuickViewModal } from '@/components/domain/QuickViewModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import type { MarketListing } from '@/types';

const SHELVES = ['All', 'RAW', 'PRE-GRADED', 'GRADED', 'SEALED-BOX'];
const GAMES = ['⚓ One Piece', '⚔ Yu-Gi-Oh!'];
const LISTING_TYPES = ['For sale', 'For trade'];

const SORT_OPTIONS = [
  { id: 'trending', label: 'Trending' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
];

const PRICE_RANGES = [
  { id: 'all', label: 'All prices', min: 0, max: Infinity },
  { id: 'under-1k', label: '< ฿1,000', min: 0, max: 1000 },
  { id: '1k-5k', label: '฿1,000 – 5,000', min: 1000, max: 5000 },
  { id: '5k-10k', label: '฿5,000 – 10,000', min: 5000, max: 10000 },
  { id: '10k-50k', label: '฿10,000 – 50,000', min: 10000, max: 50000 },
  { id: 'over-50k', label: '> ฿50,000', min: 50000, max: Infinity },
];

export function MarketScreen() {
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

  const { data: listings, isLoading } = useMarketListings(activeShelf === 'All' ? undefined : activeShelf);
  const { data: vault } = useVault();
  const { data: myListings } = useMyListings();

  const vaultCount = vault?.length ?? 0;
  const myListingsCount = myListings?.length ?? 0;

  const filteredListings = useMemo(() => {
    let result = [...(listings || [])];

    if (activeGame) {
      const gameKey = activeGame === '⚓ One Piece' ? 'one-piece' : 'yu-gi-oh';
      result = result.filter((l) => l.card.game.includes(gameKey));
    }

    if (activeType === 'For sale') result = result.filter((l) => l.listingType === 'SALE');
    if (activeType === 'For trade') result = result.filter((l) => l.listingType === 'TRADE');

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
  }, [listings, activeGame, activeType, searchQuery, activePriceRange, showVerifiedOnly, activeSort]);

  const activeFilterCount = [
    activeGame !== null,
    activeType !== null,
    activePriceRange !== 'all',
    showVerifiedOnly,
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

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
        title="SwibSwap Market"
        description={`${isLoading ? '-' : filteredListings.length} LIVE · raw · pre-graded · graded · sealed — all vault-backed`}
      />

      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards, codes…"
            className="w-full bg-surface-light rounded-xl pl-11 pr-4 py-3 text-sm outline-none placeholder:text-muted-foreground/50 border border-transparent focus:border-brand transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-surface-lighter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border overflow-x-auto scrollbar-hide">
          {[
            { label: 'Browse', count: null, to: '/market' },
            { label: 'My Collection', count: vaultCount, to: '/vault' },
            { label: 'My Listings', count: myListingsCount, to: '/seller' },
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
                <span className="ml-1.5 rounded-md bg-surface-lighter px-1.5 py-0.5 text-[10px]">
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
            {SHELVES.map((shelf) => (
              <button
                key={shelf}
                onClick={() => setActiveShelf(shelf)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  activeShelf === shelf
                    ? 'bg-brand text-white'
                    : 'bg-surface-light text-muted-foreground hover:text-white'
                }`}
              >
                {shelf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="relative flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface-light px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface-lighter transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative hidden sm:block">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              className="h-8 appearance-none rounded-lg border border-border bg-surface-light pl-2.5 pr-7 text-xs text-muted-foreground outline-none focus:border-brand"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          </div>

          <div className="hidden sm:flex rounded-lg border border-border bg-surface-light p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1 transition-colors ${viewMode === 'grid' ? 'bg-surface-lighter text-brand' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md p-1 transition-colors ${viewMode === 'list' ? 'bg-surface-lighter text-brand' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="List view"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="hidden gap-2 flex-wrap items-center">
          {GAMES.map((game) => (
            <button
              key={game}
              onClick={() => setActiveGame(activeGame === game ? null : game)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeGame === game
                  ? 'bg-periwinkle/20 text-periwinkle border border-periwinkle/30'
                  : 'bg-surface-light text-muted-foreground border border-transparent'
              }`}
            >
              {game}
            </button>
          ))}
          {LISTING_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(activeType === type ? null : type)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                activeType === type
                  ? 'bg-cyan/20 text-cyan border border-cyan/30'
                  : 'bg-surface-light text-muted-foreground border border-transparent'
              }`}
            >
              {type}
            </button>
          ))}

          <div className="relative">
            <select
              value={activePriceRange}
              onChange={(e) => setActivePriceRange(e.target.value)}
              className="h-8 appearance-none rounded-lg border border-border bg-surface-light pl-2.5 pr-7 text-xs text-muted-foreground outline-none focus:border-brand"
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
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
            Verified only
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-brand transition-colors ml-auto"
            >
              Clear all
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
                {activeGame}
                <button onClick={() => setActiveGame(null)}><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activeType && (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1 bg-cyan/10 text-cyan border-0">
                {activeType}
                <button onClick={() => setActiveType(null)}><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {activePriceRange !== 'all' && (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1">
                {PRICE_RANGES.find((r) => r.id === activePriceRange)?.label}
                <button onClick={() => setActivePriceRange('all')}><X className="w-3 h-3" /></button>
              </Badge>
            )}
            {showVerifiedOnly && (
              <Badge variant="secondary" className="gap-1 px-2.5 py-1">
                Verified only
                <button onClick={() => setShowVerifiedOnly(false)}><X className="w-3 h-3" /></button>
              </Badge>
            )}
          </div>
        )}

        {/* Listings */}
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-fr">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2 h-full">
                  <Skeleton className="aspect-[5/7] rounded-2xl" />
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
          <Empty className="rounded-2xl border-dashed border-border bg-surface-light/50 py-20">
            <EmptyMedia variant="icon">
              <Package className="w-8 h-8 text-brand" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('market.empty')}</EmptyTitle>
              <EmptyDescription>{t('market.emptyDesc')}</EmptyDescription>
            </EmptyHeader>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" className="border-border" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            )}
          </Empty>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-fr">
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
  return (
    <div className="flex items-center gap-4 bg-surface-light rounded-xl p-3 border border-border hover:border-brand/30 transition cursor-pointer"
      onClick={() => onQuickView?.(listing)}
    >
      <div className="w-16 aspect-[5/7] rounded-lg overflow-hidden bg-surface-lighter shrink-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
        {listing.card.code}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono text-muted-foreground">{listing.card.code}</p>
          {listing.vaultVerified && (
            <span className="text-[10px] font-mono bg-brand/10 text-brand px-1.5 rounded">VERIFIED</span>
          )}
        </div>
        <p className="text-sm font-semibold truncate">{listing.card.nameEn}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-[10px] font-mono bg-surface-lighter px-1.5 rounded">{listing.shelf}</span>
          <span className="text-[10px] font-mono bg-surface-lighter px-1.5 rounded">{listing.listingType}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold font-mono">{listing.listingType === 'TRADE' ? 'Trade' : `฿${listing.price.toLocaleString()}`}</p>
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
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-surface-light p-6 shadow-xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Filters</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-surface-lighter">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Game</h3>
            <div className="space-y-1">
              {GAMES.map((game) => (
                <button
                  key={game}
                  onClick={() => setActiveGame(activeGame === game ? null : game)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                    activeGame === game
                      ? 'bg-brand/10 font-medium text-brand'
                      : 'text-muted-foreground hover:bg-surface-lighter'
                  }`}
                >
                  {game}
                  {activeGame === game && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Type</h3>
            <div className="space-y-1">
              {LISTING_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(activeType === type ? null : type)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                    activeType === type
                      ? 'bg-brand/10 font-medium text-brand'
                      : 'text-muted-foreground hover:bg-surface-lighter'
                  }`}
                >
                  {type}
                  {activeType === type && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sort</h3>
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
                  {opt.label}
                  {activeSort === opt.id && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Price Range</h3>
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
                  {range.label}
                  {activePriceRange === range.id && <div className="h-1.5 w-1.5 rounded-full bg-brand" />}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-lighter">
            <input
              type="checkbox"
              checked={showVerifiedOnly}
              onChange={(e) => setShowVerifiedOnly(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm text-muted-foreground">Verified sellers only</span>
            <ShieldCheck className="ml-auto w-4 h-4 text-brand" />
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={clearAll}
            className="flex-1 rounded-xl border border-border bg-surface-light py-3 text-sm font-medium text-muted-foreground hover:bg-surface-lighter transition-colors"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-brand py-3 text-sm font-medium text-white hover:bg-brand-light transition-colors"
          >
            Show {resultCount} results
          </button>
        </div>
      </div>
    </>
  );
}
