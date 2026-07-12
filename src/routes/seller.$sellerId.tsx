import { createFileRoute } from '@tanstack/react-router';
import { SellerStoreScreen } from '@/pages/SellerStoreScreen';

export const Route = createFileRoute('/seller/$sellerId')({
  component: SellerStoreScreen,
});
