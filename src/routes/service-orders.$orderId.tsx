import { createFileRoute } from '@tanstack/react-router';
import { ServiceOrderDetailScreen } from '@/pages/ServiceOrderDetailScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/service-orders/$orderId')({
  component: ServiceOrderDetailScreen,
  beforeLoad: requireAuth,
});
