import { Link, useRouterState } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, Package, User, Scan } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

const LEFT_TABS = [
  { to: '/', label: 'nav.home', icon: Home },
  { to: '/market', label: 'nav.market', icon: ShoppingBag },
];

const RIGHT_TABS = [
  { to: '/vault', label: 'nav.vault', icon: Package },
  { to: '/profile', label: 'nav.profile', icon: User },
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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface/90 backdrop-blur-md border-t border-border/80 pb-[env(safe-area-inset-bottom)]">
      <div className="h-full flex items-center justify-around px-2 relative">
        {LEFT_TABS.map((tab) => {
          const active = isActive(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
            >
              <div className={cn('p-1 rounded-lg transition-all', active && 'bg-brand/10')}>
                <Icon className={cn('w-[18px] h-[18px] transition-colors', active ? 'text-brand' : 'text-muted-foreground')} />
              </div>
              <span className={cn('text-xs transition-colors', active ? 'text-brand font-medium' : 'text-muted-foreground')}>
                {t(tab.label)}
              </span>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[2px] bg-brand rounded-full"
                />
              )}
            </Link>
          );
        })}

        {/* Scan FAB */}
        <Link to="/scan" className="relative -mt-5">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center shadow-glow"
          >
            <Scan className="w-5 h-5 text-white" />
          </motion.div>
        </Link>

        {RIGHT_TABS.map((tab) => {
          const active = isActive(tab.to);
          const Icon = tab.icon;
          const to = !isAuthenticated && tab.to === '/vault' ? '/login' : tab.to;
          return (
            <Link
              key={tab.to}
              to={to}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
            >
              <div className={cn('p-1 rounded-lg transition-all', active && 'bg-brand/10')}>
                <Icon className={cn('w-[18px] h-[18px] transition-colors', active ? 'text-brand' : 'text-muted-foreground')} />
              </div>
              <span className={cn('text-xs transition-colors', active ? 'text-brand font-medium' : 'text-muted-foreground')}>
                {t(tab.label)}
              </span>
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-[2px] bg-brand rounded-full"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
