import { createFileRoute } from '@tanstack/react-router';
import { AddToVaultScreen } from '@/pages/AddToVaultScreen';

export const Route = createFileRoute('/add-to-vault')({
  component: AddToVaultScreen,
});
