import { Link, useRouterState } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Package, User, Scan, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

// R3 category wayfinding accents — same color = same section, app-wide.
// Scan = brand magenta, Market = cyan, Vault = periwinkle; brand is the
// default active accent for neutral sections (home, feed, profile).
const NAV_ACCENTS = {
  brand: { pill: 'bg-brand/15', text: 'text-brand', bar: 'bg-brand' },
  cyan: { pill: 'bg-cyan/15', text: 'text-cyan', bar: 'bg-cyan' },
  peri: { pill: 'bg-periwinkle/15', text: 'text-periwinkle', bar: 'bg-periwinkle' },
} as const;

type NavAccent = keyof typeof NAV_ACCENTS;

interface NavTab {
  to: string;
  label: string;
  icon: React.ElementType;
  accent: NavAccent;
}

const LEFT_TABS: NavTab[] = [
  { to: '/', label: 'nav.home', icon: Home, accent: 'brand' },
  { to: '/feed', label: 'nav.feed', icon: Megaphone, accent: 'brand' },
];

const RIGHT_TABS: NavTab[] = [
  { to: '/market', label: 'nav.market', icon: ShoppingBag, accent: 'cyan' },
  { to: '/vault', label: 'nav.vault', icon: Package, accent: 'peri' },
  { to: '/profile', label: 'nav.profile', icon: User, accent: 'brand' },
];

export function BottomNav() {
  const { t } = useTranslation();
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { isAuthenticated } = useAuthStore();

  const isActive = (to: string) => {
    if (to === '/') return currentPath === '/';
    return currentPath.startsWith(to);
  };

  // Always show the guest-style menu on mobile: Home, Feed, Scan, Market, Vault.
  // Profile is reachable from the top bar / vault instead.
  const leftTabs = LEFT_TABS;
  const rightTabs = RIGHT_TABS.filter((tab) => tab.to !== '/profile');
  const colCount = leftTabs.length + 1 + rightTabs.length; // tabs + scan FAB

  const renderTab = (tab: NavTab) => {
    const active = isActive(tab.to);
    const Icon = tab.icon;
    const accent = NAV_ACCENTS[tab.accent];
    const to = !isAuthenticated && tab.to === '/vault' ? '/login' : tab.to;
    return (
      <Link
        key={tab.to}
        to={to}
        aria-current={active ? 'page' : undefined}
        className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-0.5"
      >
        <div className={cn('p-1 rounded-lg transition-all', active && cn('pxl-corner', accent.pill))}>
          <Icon className={cn('w-[18px] h-[18px] transition-colors', active ? accent.text : 'text-muted-foreground')} />
        </div>
        <span className={cn('text-xs transition-colors', active ? cn(accent.text, 'font-medium') : 'text-muted-foreground')}>
          {t(tab.label)}
        </span>
        {active && (
          <motion.div
            layoutId="bottomNavIndicator"
            className={cn('absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[2px]', accent.bar)}
          />
        )}
      </Link>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface-dark/85 backdrop-blur-xl border-t border-border/60 pb-[env(safe-area-inset-bottom)]">
      {/* Neon hairline — super-app chrome accent */}
      <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
      <div
        className="relative grid h-full min-w-0 items-center px-2"
        style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
      >
        {leftTabs.map(renderTab)}

        {/* Scan FAB */}
        <Link to="/scan" className="relative z-0 flex h-full w-full items-center justify-center -mt-5">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center shadow-glow"
          >
            <Scan className="w-5 h-5 text-white" />
          </motion.div>
        </Link>

        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}
