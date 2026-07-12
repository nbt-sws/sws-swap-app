import { createFileRoute, redirect } from '@tanstack/react-router';
import { DevLoginScreen } from '@/pages/DevLoginScreen';

const allowed = import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_API === 'true';

export const Route = createFileRoute('/dev-login')({
  component: allowed ? DevLoginScreen : () => null,
  beforeLoad: () => {
    if (!allowed) throw redirect({ to: '/' });
  },
});
