import { createFileRoute } from '@tanstack/react-router';
import { PickerScreen } from '@/pages/PickerScreen';

export const Route = createFileRoute('/scan')({
  component: PickerScreen,
});
