import { createFileRoute } from '@tanstack/react-router';
import { KycScreen } from '@/pages/KycScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/profile/kyc')({
  component: KycScreen,
  beforeLoad: requireAuth,
});
