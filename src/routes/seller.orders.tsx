import { createFileRoute } from '@tanstack/react-router';
import { SellerOrdersScreen } from '@/pages/SellerOrdersScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/seller/orders')({
  component: SellerOrdersScreen,
  beforeLoad: requireAuth,
});
