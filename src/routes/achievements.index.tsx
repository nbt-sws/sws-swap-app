import { createFileRoute } from '@tanstack/react-router';
import { AchievementsScreen } from '@/pages/AchievementsScreen';

export const Route = createFileRoute('/achievements/')({
  component: AchievementsScreen,
});
