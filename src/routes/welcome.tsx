import { createFileRoute } from '@tanstack/react-router';
import { WelcomeScreen } from '@/features/landing/WelcomeScreen';

export const Route = createFileRoute('/welcome')({
  component: WelcomeScreen,
});
