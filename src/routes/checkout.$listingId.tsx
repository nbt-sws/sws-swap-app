import { createFileRoute } from '@tanstack/react-router';
import { CheckoutScreen } from '@/pages/CheckoutScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/checkout/$listingId')({
  component: CheckoutScreen,
  beforeLoad: requireAuth,
});
