import { createFileRoute } from '@tanstack/react-router';
import { HomeScreen } from '@/pages/HomeScreen';

export const Route = createFileRoute('/')({
  component: HomeScreen,
});
