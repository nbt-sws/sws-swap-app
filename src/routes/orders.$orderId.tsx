import { createFileRoute } from '@tanstack/react-router';
import { OrderDetailScreen } from '@/pages/OrderDetailScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetailScreen,
  beforeLoad: requireAuth,
});
