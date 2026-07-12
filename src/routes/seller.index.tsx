import { createFileRoute } from '@tanstack/react-router';
import { SellerDashboardScreen } from '@/pages/SellerDashboardScreen';

export const Route = createFileRoute('/seller/')({
  component: SellerDashboardScreen,
});
