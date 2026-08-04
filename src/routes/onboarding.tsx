import { createFileRoute } from '@tanstack/react-router';
import { OnboardingScreen } from '@/pages/OnboardingScreen';
import { requireAuth } from '@/lib/route-guards';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingScreen,
  beforeLoad: requireAuth,
});
