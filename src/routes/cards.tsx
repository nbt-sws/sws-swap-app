import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/cards')({
  component: () => <Outlet />,
  beforeLoad: requireAuth,
});
