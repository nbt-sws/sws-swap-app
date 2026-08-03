import { createFileRoute } from '@tanstack/react-router';
import { WtbScreen } from '@/pages/WtbScreen';

export const Route = createFileRoute('/wtb')({
  component: WtbScreen,
});
