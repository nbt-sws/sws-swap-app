import { createFileRoute } from '@tanstack/react-router';
import { SellerDashboardScreen } from '@/pages/SellerDashboardScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/seller/')({
  component: SellerDashboardScreen,
  beforeLoad: requireAuth,
});
