import { createFileRoute } from '@tanstack/react-router';
import { NotificationsScreen } from '@/pages/NotificationsScreen';

export const Route = createFileRoute('/notifications')({
  component: NotificationsScreen,
});
