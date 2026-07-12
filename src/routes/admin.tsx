import { createFileRoute } from '@tanstack/react-router';
import { AdminScreen } from '@/pages/AdminScreen';
import { requireAdmin } from '@/lib/route-guards';

export const Route = createFileRoute('/admin')({
  component: AdminScreen,
  beforeLoad: requireAdmin,
});
