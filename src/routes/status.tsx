import { createFileRoute } from '@tanstack/react-router';
import { StatusHubScreen } from '@/pages/StatusHubScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/status')({
  component: StatusHubScreen,
  beforeLoad: requireAuth,
});
