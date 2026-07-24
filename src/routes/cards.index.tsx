import { createFileRoute } from '@tanstack/react-router';
import { CatalogScreen } from '@/pages/CatalogScreen';

export const Route = createFileRoute('/cards/')({
  component: CatalogScreen,
});
