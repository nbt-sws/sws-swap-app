import { createFileRoute } from '@tanstack/react-router';
import { MarketScreen } from '@/pages/MarketScreen';

export const Route = createFileRoute('/market/')({
  component: MarketScreen,
});
