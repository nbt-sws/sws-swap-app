import { createFileRoute } from '@tanstack/react-router';
import { VaultScreen } from '@/pages/VaultScreen';

export const Route = createFileRoute('/vault/')({
  component: VaultScreen,
});
