import { createFileRoute } from '@tanstack/react-router';
import { WishlistScreen } from '@/pages/WishlistScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/wishlist')({
  component: WishlistScreen,
  beforeLoad: requireAuth,
});
