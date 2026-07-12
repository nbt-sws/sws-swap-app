import { createFileRoute } from '@tanstack/react-router';
import { ServicesScreen } from '@/pages/ServicesScreen';

export const Route = createFileRoute('/services')({
  component: ServicesScreen,
});
