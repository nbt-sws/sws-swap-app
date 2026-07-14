import { Link, useRouterState } from '@tanstack/react-router';
import {
  Home, ShoppingBag, Store, Users,
  ClipboardList, Heart, Scan, Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore, isAdmin } from '@/stores/auth';
import { Button } from '@/components/ui/button';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
}

// ── Public nav (guest + auth) ──
const PUBLIC_NAV: NavItem[] = [
  { to: '/', label: 'nav.home', icon: Home },
  { to: '/market', label: 'nav.market', icon: ShoppingBag },
  { to: '/stores', label: 'nav.stores', icon: Store },
  { to: '/following', label: 'nav.following', icon: Users },
];

// ── Auth-only nav (Vault/Services/Campaigns moved to TopBar) ──
const AUTH_NAV: NavItem[] = [
  { to: '/orders', label: 'nav.orders', icon: ClipboardList, requiresAuth: true },
  { to: '/wishlist', label: 'nav.wishlist', icon: Heart, requiresAuth: true },
];

export function Sidebar() {
  const { t } = useTranslation();
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { isAuthenticated, user, logout } = useAuthStore();
  const userIsAdmin = isAdmin(user);

  const isActive = (to: string) => {
    if (to === '/') return currentPath === '/';
    return currentPath.startsWith(to);
  };

  return (
    <aside className="hidden md:flex w-64 flex-col h-screen sticky top-0 z-[60] border-r border-border bg-surface-dark">
      {/* Brand */}
      <div className="p-6 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="SwibSwap"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="font-bold text-lg tracking-tight">SwibSwap</span>
        </Link>
      </div>

      {/* Scrollable nav */}
      <div className="flex-1 px-3 space-y-1 overflow-y-auto min-h-0">
        {/* Public */}
        {PUBLIC_NAV.map((item) => {
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-light'
              )}
            >
              <Icon className={cn('w-5 h-5', active ? 'text-brand' : 'text-muted-foreground')} />
              {t(item.label)}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-2 border-t border-border/50" />

        {/* Auth-only */}
        {AUTH_NAV.map((item) => {
          if (item.requiresAuth && !isAuthenticated) return null;
          const active = isActive(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-light'
              )}
            >
              <Icon className={cn('w-5 h-5', active ? 'text-brand' : 'text-muted-foreground')} />
              {t(item.label)}
            </Link>
          );
        })}

        {/* Scan CTA */}
        <Link
          to="/scan"
          className={cn(
            'mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            isActive('/scan')
              ? 'bg-brand text-white shadow-glow'
              : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
          )}
        >
          <Scan className="w-5 h-5" />
          {t('nav.scan')}
        </Link>

        {userIsAdmin && (
          <>
            <div className="my-2 border-t border-border/50" />
            <Link
              to="/admin"
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive('/admin')
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-light'
              )}
            >
              <Shield className={cn('w-5 h-5', isActive('/admin') ? 'text-brand' : 'text-muted-foreground')} />
              Admin
            </Link>
          </>
        )}
      </div>

      {/* Bottom: authenticated user + logout (login is now in TopBar) */}
      {isAuthenticated && (
        <div className="p-4 border-t border-border shrink-0">
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-surface-lighter flex items-center justify-center text-sm font-semibold">
                {user?.fullName?.charAt(0) ?? 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName ?? user?.email}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={logout}>
              {t('nav.logout')}
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}
