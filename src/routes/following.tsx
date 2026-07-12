import { createFileRoute } from '@tanstack/react-router';
import { FollowingScreen } from '@/pages/FollowingScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/following')({
  component: FollowingScreen,
  beforeLoad: requireAuth,
});
