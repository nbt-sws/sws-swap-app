import { createFileRoute } from '@tanstack/react-router';
import { VaultItemDetailScreen } from '@/pages/VaultItemDetailScreen';

export const Route = createFileRoute('/vault/items/$itemId')({
  component: VaultItemDetailScreen,
});
