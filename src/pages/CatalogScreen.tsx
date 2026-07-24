import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Layers, ChevronRight, Database } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { GameMark } from '@/components/domain/GameMark';
import { SampleCardModal, type SampleCardItem } from '@/components/domain/SampleCardModal';
import { useSampleCatalogs, useCatalogGames } from '@/hooks/useCatalog';

/**
 * /cards — catalog home.
 * Section 1 "Official Samples": scanner sample collections (DON!! / CN-anniv),
 * hidden entirely when the scanner is unconfigured or returns nothing.
 * Section 2 "Card Catalog": games with card counts → /cards/browse?game=<slug>.
 * Catalog is a data surface → cyan wayfinding accent (spec R3).
 */
export function CatalogScreen() {
  const samples = useSampleCatalogs();
  const games = useCatalogGames();

  const [sampleSelection, setSampleSelection] = useState<{ item: SampleCardItem; title: string } | null>(null);

  // Hide the whole Official Samples section unless configured with content —
  // scanner integration must degrade quietly (contract spec intro + §C.1).
  const catalogs = samples.data?.catalogs ?? [];
  const showSamples = !!samples.data?.configured && catalogs.length > 0;

  const gameRows = useMemo(() => games.data?.games ?? [], [games.data]);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Cards"
        icon={<Layers className="w-6 h-6 text-cyan" />}
        description="Official samples and the full card catalog"
      />

      <div className="space-y-8">
        {/* ── Official Samples ── */}
        {samples.isLoading ? (
          <section aria-label="Official samples loading">
            <Skeleton className="h-4 w-40 mb-3" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="w-24 aspect-[5/7] rounded-lg shrink-0" />
              ))}
            </div>
          </section>
        ) : (
          showSamples &&
          catalogs.map((catalog) => (
            <section key={catalog.id} aria-label={catalog.title}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
                  Official Samples · {catalog.title}
                </h2>
                <Badge variant="pixel" className="pxl-chip--cyan">
                  {catalog.count}
                </Badge>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {catalog.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSampleSelection({ item, title: catalog.title })}
                    className="group w-24 sm:w-28 shrink-0 text-left"
                  >
                    <div className="aspect-[5/7] rounded-lg overflow-hidden border border-border group-hover:border-cyan/40 transition-colors bg-surface-lighter">
                      <ImageWithFallback src={item.imageUrl} alt={item.name ?? item.id} />
                    </div>
                    <p className="mt-1 text-xs truncate text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.name ?? item.id}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}

        {/* ── Card Catalog (games) ── */}
        <section aria-label="Card catalog">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Card Catalog
          </h2>

          {games.isLoading ? (
            <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-none" />
              ))}
            </div>
          ) : gameRows.length === 0 ? (
            <Empty className="border border-border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Database />
                </EmptyMedia>
                <EmptyTitle>No catalog data yet</EmptyTitle>
                <EmptyDescription>
                  The card catalog is empty or unavailable right now. Try again later.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
              {gameRows.map((g) => (
                <Link
                  key={g.game}
                  to="/cards/browse"
                  search={{ game: g.game }}
                  className="group flex items-center gap-3 px-4 h-14 hover:bg-surface-light transition-colors"
                >
                  <GameMark game={g.game} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize truncate group-hover:text-cyan transition-colors">
                      {g.game.replace(/-/g, ' ')}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">
                    {g.count.toLocaleString()} cards
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan transition-colors shrink-0" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <SampleCardModal
        item={sampleSelection?.item ?? null}
        catalogTitle={sampleSelection?.title}
        onClose={() => setSampleSelection(null)}
      />
    </PageContainer>
  );
}
