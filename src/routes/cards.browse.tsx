import { createFileRoute } from '@tanstack/react-router';
import { CardBrowseScreen } from '@/pages/CardBrowseScreen';

interface CardsBrowseSearch {
  game?: string;
  q?: string;
  rarity?: string;
  page?: number;
  card?: string;
}

const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);

export const Route = createFileRoute('/cards/browse')({
  component: CardBrowseScreen,
  validateSearch: (search: Record<string, unknown>): CardsBrowseSearch => ({
    game: str(search.game),
    q: str(search.q),
    rarity: str(search.rarity),
    page:
      typeof search.page === 'number' && Number.isFinite(search.page) && search.page > 0
        ? Math.floor(search.page)
        : undefined,
    card: str(search.card),
  }),
});
