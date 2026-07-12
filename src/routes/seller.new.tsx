import { createFileRoute } from '@tanstack/react-router';
import { CreateListingScreen } from '@/pages/CreateListingScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/seller/new')({
  component: CreateListingScreen,
  beforeLoad: requireAuth,
});
