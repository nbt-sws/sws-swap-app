import { createFileRoute } from '@tanstack/react-router';
import { StatusHubScreen } from '@/pages/StatusHubScreen';

export const Route = createFileRoute('/status')({
  component: StatusHubScreen,
});
