import { createFileRoute } from '@tanstack/react-router';
import { BrowseScreen } from '@/pages/BrowseScreen';

export const Route = createFileRoute('/browse')({
  component: BrowseScreen,
});
