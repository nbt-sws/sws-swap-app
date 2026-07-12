import { createFileRoute } from '@tanstack/react-router';
import { PregradeOrderScreen } from '@/pages/PregradeOrderScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/pregrade')({
  component: PregradeOrderScreen,
  beforeLoad: requireAuth,
});
