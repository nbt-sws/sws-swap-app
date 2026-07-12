import { createFileRoute } from '@tanstack/react-router';
import { CampaignsScreen } from '@/pages/CampaignsScreen';

export const Route = createFileRoute('/campaigns/')({
  component: CampaignsScreen,
});
