import { createFileRoute } from '@tanstack/react-router';
import { ScanScreen } from '@/pages/ScanScreen';

export const Route = createFileRoute('/scanner')({
  component: ScanScreen,
});
