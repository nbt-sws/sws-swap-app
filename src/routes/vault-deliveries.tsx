import { createFileRoute } from '@tanstack/react-router';
import { VaultDeliveriesScreen } from '@/pages/VaultDeliveriesScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/vault-deliveries')({
  component: VaultDeliveriesScreen,
  beforeLoad: requireAuth,
});
