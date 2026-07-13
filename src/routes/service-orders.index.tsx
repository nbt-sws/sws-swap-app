import { createFileRoute } from '@tanstack/react-router';
import { ServiceOrdersScreen } from '@/pages/ServiceOrdersScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/service-orders/')({
  component: ServiceOrdersScreen,
  beforeLoad: requireAuth,
});
