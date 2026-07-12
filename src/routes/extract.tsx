import { createFileRoute } from '@tanstack/react-router';
import { ExtractScreen } from '@/pages/ExtractScreen';

export const Route = createFileRoute('/extract')({
  component: ExtractScreen,
});
