import { createFileRoute } from '@tanstack/react-router';
import { SettingsScreen } from '@/pages/SettingsScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/settings')({
  component: SettingsScreen,
  beforeLoad: requireAuth,
});
