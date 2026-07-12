import { createFileRoute } from '@tanstack/react-router';
import { OrdersScreen } from '@/pages/OrdersScreen';

export const Route = createFileRoute('/orders/')({
  component: OrdersScreen,
});
