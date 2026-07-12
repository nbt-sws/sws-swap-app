import { createFileRoute } from '@tanstack/react-router';
import { ScannerScreen } from '@/pages/ScannerScreen';

export const Route = createFileRoute('/scanner')({
  component: ScannerScreen,
});
