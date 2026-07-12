import { createFileRoute } from '@tanstack/react-router';
import { RatingsScreen } from '@/pages/RatingsScreen';

export const Route = createFileRoute('/ratings')({
  component: RatingsScreen,
});
