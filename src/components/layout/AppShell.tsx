import { Suspense, useEffect } from 'react';
import { Outlet, useRouterState } from '@tanstack/react-router';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SocialFooter } from './SocialFooter';
import { ScrollableOutlet } from '@/routes/__root';
import { PageLoader } from '@/components/ui/page-loader';
import { prefetchRouteData } from '@/lib/prefetch';

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Idle warm-up: cache the most common destinations' data right after load,
  // so the first navigation renders from cache instead of skeletons.
  useEffect(() => {
    const warm = () => {
      prefetchRouteData('/');
      prefetchRouteData('/market');
    };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, 1500);
    return () => window.clearTimeout(id);
  }, []);

  // Public landing renders bare — no sidebar, topbar, bottomnav, or footer chrome.
  if (pathname.startsWith('/welcome')) {
    return (
      <div className="min-h-screen text-text-primary">
        <main className="min-h-screen">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text-primary flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <ScrollableOutlet />
        {/* Mobile: sticky BottomNav only, hide SocialFooter */}
        <BottomNav />
        {/* Desktop: sticky SocialFooter */}
        <div className="hidden md:block md:sticky md:bottom-0 md:z-40">
          <SocialFooter />
        </div>
      </div>
    </div>
  );
}
