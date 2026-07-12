import { redirect } from '@tanstack/react-router';
import { useAuthStore, isAdmin } from '@/stores/auth';

export function requireAuth() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: '/login' });
  }
}

export function requireAdmin() {
  const { user, isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: '/login' });
  }
  if (!isAdmin(user)) {
    throw redirect({ to: '/' });
  }
}
