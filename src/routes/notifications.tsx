import { createFileRoute } from '@tanstack/react-router';
import { NotificationsScreen } from '@/pages/NotificationsScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/notifications')({
  component: NotificationsScreen,
  beforeLoad: requireAuth,
});
