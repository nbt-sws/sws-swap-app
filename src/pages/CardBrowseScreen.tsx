import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Search, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { CATALOG_PAGE_SIZE, useCatalogCards, useCatalogGames } from '@/hooks/useCatalog';

interface BrowseSearch {
  game?: string;
  q?: string;
  rarity?: string;
  page?: number;
  card?: string;
}

/**
 * /cards/browse — URL-driven paginated catalog grid (24/page).
 * Search (q) + game + rarity filters all live in the query string so views
 * are shareable; clicking a tile opens the detail modal via ?card=<code>.
 */
export function CardBrowseScreen() {
  const search = useSearch({ from: '/cards/browse' }) as BrowseSearch;
  const navigate = useNavigate();

  const game = search.game ?? '';
  const rarity = search.rarity ?? '';
  const page = search.page && search.page > 0 ? search.page : 1;
  const openCard = search.card ?? null;

  const [queryInput, setQueryInput] = useState(search.q ?? '');

  // Keep the local input in sync when the URL changes externally (back/forward).
  useEffect(() => {
    setQueryInput(search.q ?? '');
  }, [search.q]);

  const patchSearch = (patch: Partial<BrowseSearch>, replace = true) => {
    navigate({
      to: '/cards/browse',
      search: {
        game: patch.game !== undefined ? patch.game || undefined : game || undefined,
        q: patch.q !== undefined ? patch.q || undefined : (search.q ?? undefined),
        rarity: patch.rarity !== undefined ? patch.rarity || undefined : rarity || undefined,
        page: patch.page !== undefined ? (patch.page > 1 ? patch.page : undefined) : (page > 1 ? page : undefined),
        card: patch.card !== undefined ? patch.card || undefined : openCard ?? undefined,
      },
      replace,
    });
  };

  // Debounce the search box into the URL (resets to page 1).
  useEffect(() => {
    const current = search.q ?? '';
    if (queryInput === current) return;
    const t = setTimeout(() => {
      patchSearch({ q: queryInput.trim(), page: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  const cardsQuery = useCatalogCards({ game, q: search.q, rarity, page });
  const gamesQuery = useCatalogGames();

  const total = cardsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const cards = cardsQuery.data?.cards ?? [];

  // Rarity options: derived from the current result set (backend has no
  // rarity-list endpoint); always keep the active filter selectable.
  const rarityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of cards) if (c.rarity) set.add(c.rarity);
    if (rarity) set.add(rarity);
    return [...set].sort();
  }, [cards, rarity]);

  const resetFilters = () => {
    setQueryInput('');
    navigate({ to: '/cards/browse', search: {}, replace: true });
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Card Catalog"
        icon={<LayoutGrid className="w-6 h-6 text-cyan" />}
        back={{ to: '/cards' }}
        description={
          total > 0
            ? `${total.toLocaleString()} cards${game ? ` · ${game.replace(/-/g, ' ')}` : ''}`
            : 'Search the full card catalog'
        }
      />

      <div className="space-y-5">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search code or name…"
              aria-label="Search cards"
              className="pl-9 bg-surface-light border-border"
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={game || 'all'}
              onValueChange={(v) => patchSearch({ game: v === 'all' ? '' : v, page: 1 })}
            >
              <SelectTrigger className="w-[150px] bg-surface-light border-border" aria-label="Filter by game">
                <SelectValue placeholder="All games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All games</SelectItem>
                {(gamesQuery.data?.games ?? []).map((g) => (
                  <SelectItem key={g.game} value={g.game}>
                    {g.game.replace(/-/g, ' ')} ({g.count.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={rarity || 'all'}
              onValueChange={(v) => patchSearch({ rarity: v === 'all' ? '' : v, page: 1 })}
            >
              <SelectTrigger className="w-[130px] bg-surface-light border-border" aria-label="Filter by rarity">
                <SelectValue placeholder="All rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rarities</SelectItem>
                {rarityOptions.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid */}
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
        ) : cards.length === 0 ? (
          <Empty className="border border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>No cards found</EmptyTitle>
              <EmptyDescription>
                Nothing matches the current search and filters.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={resetFilters} className="rounded-full border-border">
                Reset filters
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
                className="group block text-left bg-surface-light rounded-xl overflow-hidden border border-border hover:border-cyan/40 transition-colors"
              >
                <div className="aspect-[5/7] overflow-hidden bg-surface-lighter">
                  <ImageWithFallback src={card.imageUrl ?? ''} alt={card.nameEn ?? card.code} />
                </div>
                <div className="p-3">
                  <p className="text-xs font-mono text-muted-foreground">{card.code}</p>
                  <h3 className="font-semibold text-sm truncate group-hover:text-cyan transition-colors">
                    {card.nameEn}
                  </h3>
                  {card.rarity && (
                    <div className="mt-1.5">
                      <Badge variant="pixel" className="pxl-chip--cyan">
                        {card.rarity}
                      </Badge>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
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
              Prev
            </Button>
            <p className="text-xs text-muted-foreground font-mono" aria-live="polite">
              Page {page} of {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || cardsQuery.isFetching}
              onClick={() => patchSearch({ page: page + 1 }, false)}
              className="rounded-full border-border"
            >
              Next
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
