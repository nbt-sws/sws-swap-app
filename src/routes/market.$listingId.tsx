import { createFileRoute } from '@tanstack/react-router';
import { ListingDetailScreen } from '@/pages/ListingDetailScreen';

export const Route = createFileRoute('/market/$listingId')({
  component: ListingDetailScreen,
});
