import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SocialFooter } from './SocialFooter';
import { ScrollableOutlet } from '@/routes/__root';

export function AppShell() {
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
