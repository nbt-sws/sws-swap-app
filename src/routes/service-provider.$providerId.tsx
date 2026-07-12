import { createFileRoute } from '@tanstack/react-router';
import { ServiceProviderScreen } from '@/pages/ServiceProviderScreen';

export const Route = createFileRoute('/service-provider/$providerId')({
  component: ServiceProviderScreen,
});
