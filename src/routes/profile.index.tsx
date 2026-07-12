import { createFileRoute } from '@tanstack/react-router';
import { ProfileScreen } from '@/pages/ProfileScreen';

export const Route = createFileRoute('/profile/')({
  component: ProfileScreen,
});
