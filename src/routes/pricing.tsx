import { createFileRoute } from '@tanstack/react-router';
import { PricingScreen } from '@/pages/PricingScreen';

export const Route = createFileRoute('/pricing')({
  component: PricingScreen,
});
