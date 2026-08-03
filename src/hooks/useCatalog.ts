import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { catalogApi, scannerApi } from '@/lib/api';
import type {
  CatalogCardDetail,
  CatalogCards,
  CatalogCardsParams,
  CatalogFilters,
  CatalogGames,
  ScannerSampleCatalogs,
} from '@/lib/api';

// Contract per .impeccable/scanner-integration-spec.md §A/§B:
//   scannerApi.sampleCatalogs() → { ok, configured, catalogs: [{ id, title, count, items }] }
//   catalogApi.games()          → { ok, games: [{ game, count }] }
//   catalogApi.cards(params)    → { ok, total, page, pageSize, cards: [...] }
//   catalogApi.filters(params)  → { ok, rarities: [{value,count}], types: [...] }
//   catalogApi.card(code)       → { ok, code, nameEn, ..., variants: [...], marketplacePrices: [...] }
// Every integration must degrade quietly when the scanner/catalog backend
// is unconfigured or down — the UI hides optional sections, never blocks.

export type { CatalogCardsParams };

export const CATALOG_PAGE_SIZE = 24;

/** Official sample collections (DON!! / CN-anniv) from the scanner service. */
export function useSampleCatalogs() {
  return useQuery<ScannerSampleCatalogs>({
    queryKey: ['scanner', 'sample-catalogs'],
    queryFn: () => scannerApi.sampleCatalogs(),
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });
}

/** Games list with card counts from public.cards. */
export function useCatalogGames() {
  return useQuery<CatalogGames>({
    queryKey: ['catalog', 'games'],
    queryFn: () => catalogApi.games(),
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });
}

/** Paginated card catalog search. */
export function useCatalogCards(params: CatalogCardsParams) {
  const normalized: CatalogCardsParams = {
    game: params.game || undefined,
    q: params.q || undefined,
    rarity: params.rarity || undefined,
    type: params.type || undefined,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sort: params.sort && params.sort !== 'code' ? params.sort : undefined,
    page: params.page && params.page > 0 ? params.page : 1,
    pageSize: params.pageSize ?? CATALOG_PAGE_SIZE,
  };
  return useQuery<CatalogCards>({
    queryKey: ['catalog', 'cards', normalized],
    queryFn: () => catalogApi.cards(normalized),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    retry: 0,
  });
}

/** Full rarity/type facet lists for filter dropdowns (optionally per game). */
export function useCatalogFilters(game?: string) {
  return useQuery<CatalogFilters>({
    queryKey: ['catalog', 'filters', game || 'all'],
    queryFn: () => catalogApi.filters({ game: game || undefined }),
    staleTime: 1000 * 60 * 10,
    retry: 0,
  });
}

/** Single card detail + related variants. */
export function useCatalogCard(code: string | null | undefined) {
  return useQuery<CatalogCardDetail>({
    queryKey: ['catalog', 'card', code],
    queryFn: () => catalogApi.card(code as string),
    enabled: !!code,
    staleTime: 1000 * 60 * 5,
    retry: 0,
  });
}
