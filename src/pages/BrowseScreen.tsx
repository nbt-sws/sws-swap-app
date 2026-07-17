import { useState } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { useMarketListings } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal } from 'lucide-react';
import { getCardImageUrl } from '@/lib/utils';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'one-piece', label: 'One Piece' },
  { key: 'digimon', label: 'Digimon' },
  { key: 'pokemon', label: 'Pokémon' },
  { key: 'yu-gi-oh', label: 'Yu-Gi-Oh!' },
  { key: 'union-arena', label: 'Union Arena' },
];

const SORTS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Most watched'];

export function BrowseScreen() {
  const { data: listings, isLoading } = useMarketListings();
  const search = useSearch({ from: '/browse' }) as { q?: string };
  const [query, setQuery] = useState(search.q || '');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState(SORTS[0]);

  const filtered = listings
    ?.filter((l) => {
      const matchesQuery =
        l.card.nameEn.toLowerCase().includes(query.toLowerCase()) ||
        l.card.code.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || l.card.game === category;
      return matchesQuery && matchesCategory;
    })
    .sort((a, b) => {
      if (sort === 'Price: Low to High') return a.price - b.price;
      if (sort === 'Price: High to Low') return b.price - a.price;
      if (sort === 'Most watched') return (b.watchers ?? 0) - (a.watchers ?? 0);
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Browse"
        icon={<Search className="w-6 h-6 text-brand" />}
        description="Search cards, sets, and sellers"
      />

      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards, sets, sellers..."
            className="pl-9 bg-surface-light border-border"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                category === c.key ? 'bg-brand text-white' : 'bg-surface-light text-muted-foreground hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filtered?.length ?? 0} results</p>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-surface-light border border-border rounded-lg text-xs px-2 py-1.5"
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[5/7] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered?.map((listing) => (
              <Link
                key={listing.id}
                to="/market/$listingId"
                params={{ listingId: listing.id }}
                className="group block bg-surface-light rounded-xl overflow-hidden border border-border hover:border-brand/30 transition"
              >
                <div className="aspect-[5/7] overflow-hidden">
                  <img
                    src={getCardImageUrl(listing.card)}
                    alt={listing.card.nameEn}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-mono text-muted-foreground">{listing.card.code}</p>
                  <h3 className="font-semibold text-sm truncate group-hover:text-brand transition">{listing.card.nameEn}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {listing.card.rarity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {listing.card.condition}
                    </Badge>
                  </div>
                  <p className="text-brand font-bold mt-2">
                    {listing.listingType === 'TRADE' ? 'Trade' : `฿${listing.price.toLocaleString()}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
