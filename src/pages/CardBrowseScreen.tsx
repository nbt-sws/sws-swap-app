import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Search, LayoutGrid, ChevronLeft, ChevronRight, X, SlidersHorizontal,
  ArrowDownWideNarrow, Tag,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { CardDetailModal } from '@/components/domain/CardDetailModal';
import { GameMark } from '@/components/domain/GameMark';
import { cn } from '@/lib/utils';
import {
  CATALOG_PAGE_SIZE, useCatalogCards, useCatalogGames, useCatalogFilters,
} from '@/hooks/useCatalog';
import type { CatalogSort } from '@/lib/api';

interface BrowseSearch {
  game?: string;
  q?: string;
  rarity?: string;
  type?: string;
  band?: string;
  sort?: string;
  page?: number;
  card?: string;
}

/* Price bands — keys live in the URL, min/max map to API params. */
const PRICE_BANDS: Record<string, { min?: number; max?: number }> = {
  under500: { max: 499 },
  '500-1000': { min: 500, max: 1000 },
  '1000-5000': { min: 1000, max: 5000 },
  over5000: { min: 5000 },
};

const SORTS: { value: CatalogSort }[] = [
  { value: 'code' },
  { value: 'name' },
  { value: 'price_asc' },
  { value: 'price_desc' },
];

/**
 * /cards/browse — URL-driven catalog grid (24/page).
 * Full filter set: game chips, rarity + type facets (complete lists from
 * /catalog/filters), price bands on the SWS floor, and sort. Every tile shows
 * the SWS market floor + active listing count so collectors can judge price
 * at a glance; clicking a tile opens the detail modal via ?card=<code>.
 */
export function CardBrowseScreen() {
  const { t } = useTranslation();
  const search = useSearch({ from: '/cards/browse' }) as BrowseSearch;
  const navigate = useNavigate();

  const game = search.game ?? '';
  const rarity = search.rarity ?? '';
  const type = search.type ?? '';
  const band = search.band ?? '';
  const sort = (SORTS.some((s) => s.value === search.sort) ? search.sort : 'code') as CatalogSort;
  const page = search.page && search.page > 0 ? search.page : 1;
  const openCard = search.card ?? null;

  const [queryInput, setQueryInput] = useState(search.q ?? '');

  // Keep the local input in sync when the URL changes externally (back/forward).
  useEffect(() => {
    setQueryInput(search.q ?? '');
  }, [search.q]);

  const patchSearch = (patch: Partial<BrowseSearch>, replace = true) => {
    const next: Record<string, unknown> = {
      game: patch.game !== undefined ? patch.game || undefined : game || undefined,
      q: patch.q !== undefined ? patch.q || undefined : (search.q ?? undefined),
      rarity: patch.rarity !== undefined ? patch.rarity || undefined : rarity || undefined,
      type: patch.type !== undefined ? patch.type || undefined : type || undefined,
      band: patch.band !== undefined ? patch.band || undefined : band || undefined,
      sort: patch.sort !== undefined ? (patch.sort && patch.sort !== 'code' ? patch.sort : undefined) : (sort !== 'code' ? sort : undefined),
      page: patch.page !== undefined ? (patch.page > 1 ? patch.page : undefined) : (page > 1 ? page : undefined),
      card: patch.card !== undefined ? patch.card || undefined : openCard ?? undefined,
    };
    navigate({ to: '/cards/browse', search: next, replace });
  };

  // Debounce the search box into the URL (resets to page 1).
  useEffect(() => {
    const current = search.q ?? '';
    if (queryInput === current) return;
    const timer = setTimeout(() => {
      patchSearch({ q: queryInput.trim(), page: 1 });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  const bandRange = PRICE_BANDS[band] ?? {};
  const cardsQuery = useCatalogCards({
    game, q: search.q, rarity, type,
    minPrice: bandRange.min, maxPrice: bandRange.max,
    sort, page,
  });
  const gamesQuery = useCatalogGames();
  const filtersQuery = useCatalogFilters(game);

  const total = cardsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const cards = cardsQuery.data?.cards ?? [];

  const rarityOptions = filtersQuery.data?.rarities ?? [];
  const typeOptions = filtersQuery.data?.types ?? [];
  const gameRows = gamesQuery.data?.games ?? [];

  const activeFilters: { key: string; label: string; clear: () => void }[] = [];
  if (search.q) activeFilters.push({ key: 'q', label: `“${search.q}”`, clear: () => { setQueryInput(''); patchSearch({ q: '', page: 1 }); } });
  if (rarity) activeFilters.push({ key: 'rarity', label: rarity, clear: () => patchSearch({ rarity: '', page: 1 }) });
  if (type) activeFilters.push({ key: 'type', label: type, clear: () => patchSearch({ type: '', page: 1 }) });
  if (band) activeFilters.push({ key: 'band', label: t(`cardsBrowse.bands.${band}`), clear: () => patchSearch({ band: '', page: 1 }) });

  const resetFilters = () => {
    setQueryInput('');
    navigate({ to: '/cards/browse', search: {}, replace: true });
  };

  return (
    <PageContainer size="xl" className="py-6">
      <PageHeader
        title={t('cardsBrowse.title')}
        icon={<LayoutGrid className="w-6 h-6 text-cyan" />}
        back={{ to: '/cards' }}
        description={
          total > 0
            ? t('cardsBrowse.subtitleCount', { count: total.toLocaleString() })
            : t('cardsBrowse.subtitle')
        }
      />

      <div className="space-y-4">
        {/* ── Sticky filter zone ── */}
        <div className="sticky top-14 lg:top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-12 px-4 sm:px-6 lg:px-10 xl:px-12 py-3 bg-surface/90 backdrop-blur-md border-b border-border/60 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder={t('cardsBrowse.searchPlaceholder')}
              aria-label={t('cardsBrowse.searchPlaceholder')}
              className="pl-9 bg-surface-light border-border"
            />
          </div>

          {/* Game chips — complete categories with counts */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1" role="tablist" aria-label={t('cardsBrowse.games')}>
            <button
              role="tab"
              aria-selected={!game}
              onClick={() => patchSearch({ game: '', page: 1 })}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
                !game
                  ? 'bg-cyan/15 text-cyan border-cyan/40'
                  : 'bg-surface-light text-muted-foreground border-border hover:text-foreground hover:border-cyan/30'
              )}
            >
              {t('cardsBrowse.allGames')}
            </button>
            {gameRows.map((g) => (
              <button
                key={g.game}
                role="tab"
                aria-selected={game === g.game}
                onClick={() => patchSearch({ game: game === g.game ? '' : g.game, page: 1 })}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
                  game === g.game
                    ? 'bg-cyan/15 text-cyan border-cyan/40'
                    : 'bg-surface-light text-muted-foreground border-border hover:text-foreground hover:border-cyan/30'
                )}
              >
                <GameMark game={g.game} size="sm" />
                <span className="capitalize">{g.game.replace(/-/g, ' ')}</span>
                <span className="mono-num text-[10px] opacity-70">{g.count.toLocaleString()}</span>
              </button>
            ))}
          </div>

          {/* Filter row: rarity, type, price band, sort */}
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />

            <Select
              value={rarity || 'all'}
              onValueChange={(v) => patchSearch({ rarity: v === 'all' ? '' : v, page: 1 })}
            >
              <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs bg-surface-light border-border" aria-label={t('cardsBrowse.rarity')}>
                <SelectValue placeholder={t('cardsBrowse.allRarities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('cardsBrowse.allRarities')}</SelectItem>
                {rarityOptions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.value} ({r.count.toLocaleString()})
                  </SelectItem>
                ))}
                {rarity && !rarityOptions.some((r) => r.value === rarity) && (
                  <SelectItem value={rarity}>{rarity}</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select
              value={type || 'all'}
              onValueChange={(v) => patchSearch({ type: v === 'all' ? '' : v, page: 1 })}
            >
              <SelectTrigger className="w-auto min-w-[120px] h-8 text-xs bg-surface-light border-border" aria-label={t('cardsBrowse.type')}>
                <SelectValue placeholder={t('cardsBrowse.allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('cardsBrowse.allTypes')}</SelectItem>
                {typeOptions.map((tp) => (
                  <SelectItem key={tp.value} value={tp.value}>
                    {tp.value} ({tp.count.toLocaleString()})
                  </SelectItem>
                ))}
                {type && !typeOptions.some((tp) => tp.value === type) && (
                  <SelectItem value={type}>{type}</SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Price bands */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
              {Object.keys(PRICE_BANDS).map((key) => (
                <button
                  key={key}
                  onClick={() => patchSearch({ band: band === key ? '' : key, page: 1 })}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors border',
                    band === key
                      ? 'bg-cyan/15 text-cyan border-cyan/40'
                      : 'bg-surface-light text-muted-foreground border-border hover:text-foreground hover:border-cyan/30'
                  )}
                >
                  {t(`cardsBrowse.bands.${key}`)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-1.5">
              <ArrowDownWideNarrow className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              <Select
                value={sort}
                onValueChange={(v) => patchSearch({ sort: v, page: 1 })}
              >
                <SelectTrigger className="w-auto min-w-[130px] h-8 text-xs bg-surface-light border-border" aria-label={t('cardsBrowse.sortLabel')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {t(`cardsBrowse.sorts.${s.value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters + result count */}
          {(activeFilters.length > 0 || total > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground mono-num" aria-live="polite">
                {t('cardsBrowse.results', { count: total.toLocaleString() })}
              </span>
              {activeFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={f.clear}
                  className="flex items-center gap-1 rounded-full bg-cyan/10 border border-cyan/30 px-2.5 py-0.5 text-[11px] text-cyan hover:bg-cyan/20 transition-colors"
                >
                  {f.label}
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              ))}
              {activeFilters.length > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  {t('cardsBrowse.clearAll')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Grid ── */}
        {cardsQuery.isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[5/7] rounded-xl" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : cardsQuery.isError ? (
          <Empty className="border border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>{t('cardsBrowse.errorTitle')}</EmptyTitle>
              <EmptyDescription>{t('cardsBrowse.errorDesc')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => cardsQuery.refetch()} className="rounded-full border-border">
                {t('cardsBrowse.retry')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : cards.length === 0 ? (
          <Empty className="border border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>{t('cardsBrowse.emptyTitle')}</EmptyTitle>
              <EmptyDescription>{t('cardsBrowse.emptyDesc')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={resetFilters} className="rounded-full border-border">
                {t('cardsBrowse.clearAll')}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {cards.map((card) => (
              <button
                key={card.code}
                type="button"
                onClick={() => patchSearch({ card: card.code }, false)}
                className="group flex flex-col text-left bg-surface-light rounded-xl overflow-hidden border border-border hover:border-cyan/40 transition-colors"
              >
                <div className="aspect-[5/7] overflow-hidden bg-surface-lighter">
                  <ImageWithFallback src={card.imageUrl ?? ''} alt={card.nameEn ?? card.code} />
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-xs font-mono text-muted-foreground">{card.code}</p>
                  <h3 className="font-semibold text-sm truncate group-hover:text-cyan transition-colors">
                    {card.nameEn}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {card.rarity && (
                      <Badge variant="pixel" className="pxl-chip--cyan">
                        {card.rarity}
                      </Badge>
                    )}
                    {card.type && (
                      <Badge variant="pixel">{card.type}</Badge>
                    )}
                  </div>
                  {/* Price footer — SWS floor + listing count */}
                  <div className="mt-auto pt-2.5">
                    {card.swsFloor != null ? (
                      <div className="flex items-baseline justify-between gap-2 border-t border-border/40 pt-2">
                        <p className="text-sm font-bold mono-num text-cyan whitespace-nowrap">
                          ฿{card.swsFloor.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {t('cardsBrowse.listings', { count: card.listingCount ?? 0 })}
                        </p>
                      </div>
                    ) : (
                      <div className="border-t border-border/40 pt-2">
                        <p className="text-[11px] text-muted-foreground">{t('cardsBrowse.noListings')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {total > CATALOG_PAGE_SIZE && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || cardsQuery.isFetching}
              onClick={() => patchSearch({ page: page - 1 }, false)}
              className="rounded-full border-border"
            >
              <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
              {t('cardsBrowse.prev')}
            </Button>
            <p className="text-xs text-muted-foreground font-mono" aria-live="polite">
              {t('cardsBrowse.pageOf', { page, totalPages })}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || cardsQuery.isFetching}
              onClick={() => patchSearch({ page: page + 1 }, false)}
              className="rounded-full border-border"
            >
              {t('cardsBrowse.next')}
              <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>

      <CardDetailModal
        code={openCard}
        onClose={() => patchSearch({ card: '' }, false)}
        onSelectCode={(code) => patchSearch({ card: code }, false)}
      />
    </PageContainer>
  );
}
