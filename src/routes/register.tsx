import { createFileRoute } from '@tanstack/react-router';
import { RegisterScreen } from '@/pages/RegisterScreen';

export const Route = createFileRoute('/register')({
  component: RegisterScreen,
});
