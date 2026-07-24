import { createFileRoute } from '@tanstack/react-router';
import { RatingsScreen } from '@/pages/RatingsScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/ratings')({
  component: RatingsScreen,
  beforeLoad: requireAuth,
  validateSearch: (search: Record<string, unknown>) => ({
    submissionId: typeof search.submissionId === 'string' ? search.submissionId : undefined,
  }),
});
