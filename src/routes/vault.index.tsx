import { createFileRoute } from '@tanstack/react-router';
import { VaultScreen } from '@/pages/VaultScreen';

interface VaultSearch {
  action?: 'register';
}

export const Route = createFileRoute('/vault/')({
  component: VaultScreen,
  validateSearch: (search: Record<string, unknown>): VaultSearch => ({
    action: search.action === 'register' ? 'register' : undefined,
  }),
});
