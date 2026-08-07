import { QueryClient } from '@tanstack/react-query';

// Shared QueryClient — exported so non-React code (e.g. route prefetch)
// can warm the same cache the app renders from.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});
