import { createFileRoute } from '@tanstack/react-router';
import { StoresScreen } from '@/pages/StoresScreen';

export const Route = createFileRoute('/stores')({
  component: StoresScreen,
});
