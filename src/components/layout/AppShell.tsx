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
        <BottomNav />
        <SocialFooter />
      </div>
    </div>
  );
}
