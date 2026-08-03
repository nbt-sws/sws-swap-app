import { createFileRoute, redirect } from '@tanstack/react-router';

// /following is superseded by the unified feed's "following" tab.
// Keep the URL alive as a redirect so old links/bookmarks don't break.
export const Route = createFileRoute('/following')({
  beforeLoad: () => {
    throw redirect({ to: '/feed' });
  },
});
