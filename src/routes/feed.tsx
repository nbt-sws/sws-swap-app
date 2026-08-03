import { createFileRoute } from '@tanstack/react-router';
import { FeedScreen } from '@/pages/FeedScreen';

export const Route = createFileRoute('/feed')({
  component: FeedScreen,
});
