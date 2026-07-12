import { createFileRoute } from '@tanstack/react-router';
import { SignInScreen } from '@/pages/SignInScreen';

export const Route = createFileRoute('/login')({
  component: SignInScreen,
});
