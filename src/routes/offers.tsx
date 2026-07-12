import { createFileRoute } from '@tanstack/react-router';
import { OffersScreen } from '@/pages/OffersScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/offers')({
  component: OffersScreen,
  beforeLoad: requireAuth,
});
