import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { Suspense, useEffect, useRef } from 'react';
import i18n from '@/i18n';
import { AppShell } from '@/components/layout/AppShell';
import { PageLoader } from '@/components/ui/page-loader';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootProviders() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const initTheme = useThemeStore((s) => s.initTheme);

  useEffect(() => {
    initAuth();
    initTheme();
  }, [initAuth, initTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AppShell />
        <Toaster position="top-center" richColors />
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootProviders,
  notFoundComponent: () => (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground">This page doesn't exist.</p>
      </div>
    </div>
  ),
});

export function ScrollableOutlet() {
  const router = useRouterState();
  const pathname = router.location.pathname;
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <main
      ref={mainRef}
      className="flex-1 overflow-y-auto min-h-0 pt-14 lg:pt-16 pb-20 md:pb-10"
    >
      <div key={pathname} className="page-transition-enter">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </main>
  );
}
