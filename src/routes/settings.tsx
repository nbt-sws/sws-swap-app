import { createFileRoute } from '@tanstack/react-router';
import { SettingsScreen } from '@/pages/SettingsScreen';

export const Route = createFileRoute('/settings')({
  component: SettingsScreen,
});
