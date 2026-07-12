import { createFileRoute } from '@tanstack/react-router';
import { RedemptionsScreen } from '@/pages/RedemptionsScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/redemptions')({
  component: RedemptionsScreen,
  beforeLoad: requireAuth,
});
