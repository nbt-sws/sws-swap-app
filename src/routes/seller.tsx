import { createFileRoute, Outlet } from '@tanstack/react-router';

// Public layout: /seller/$sellerId (store page) is guest-accessible.
// Owner-only children (index, new, orders) guard themselves.
export const Route = createFileRoute('/seller')({
  component: () => <Outlet />,
});
