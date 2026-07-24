import { Link, useRouterState } from '@tanstack/react-router';
import {
  Home, ShoppingBag, Store, Users,
  ClipboardList, Heart, Scan, Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore, isAdmin } from '@/stores/auth';

// R3 category wayfinding accents — shared active-state language with
// BottomNav/TopBar: accent-tinted text + low-alpha background + a hard
// square 2px indicator bar (left edge) in the category color.
// Market family = cyan; brand is the default for neutral sections.
const NAV_ACCENTS = {
  brand: { bg: 'bg-brand/10', text: 'text-brand', bar: 'bg-brand' },
  cyan: { bg: 'bg-cyan/10', text: 'text-cyan', bar: 'bg-cyan' },
  peri: { bg: 'bg-periwinkle/10', text: 'text-periwinkle', bar: 'bg-periwinkle' },
} as const;

type NavAccent = keyof typeof NAV_ACCENTS;

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
  accent?: NavAccent;
}

// ── Public nav (guest + auth) ──
const PUBLIC_NAV: NavItem[] = [
  { to: '/', label: 'nav.home', icon: Home },
  { to: '/market', label: 'nav.market', icon: ShoppingBag, accent: 'cyan' },
  // Catalog = data surface → cyan wayfinding (spec R3). Auth-guarded route;
  // guests are redirected to /login by requireAuth, same as other guards.
  // { to: '/cards', label: 'nav.cards', icon: Layers, accent: 'cyan' },
  { to: '/stores', label: 'nav.stores', icon: Store, accent: 'cyan' },
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
  const { isAuthenticated, user } = useAuthStore();
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
          const accent = NAV_ACCENTS[item.accent ?? 'brand'];
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? cn(accent.bg, accent.text)
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-light'
              )}
            >
              {active && (
                <span aria-hidden="true" className={cn('absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px]', accent.bar)} />
              )}
              <Icon className={cn('w-5 h-5', active ? accent.text : 'text-muted-foreground')} />
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
          const accent = NAV_ACCENTS[item.accent ?? 'brand'];
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? cn(accent.bg, accent.text)
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-light'
              )}
            >
              {active && (
                <span aria-hidden="true" className={cn('absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px]', accent.bar)} />
              )}
              <Icon className={cn('w-5 h-5', active ? accent.text : 'text-muted-foreground')} />
              {t(item.label)}
            </Link>
          );
        })}

        {/* Scan CTA — pixel-notched corners; stays the one filled hero action */}
        <Link
          to="/scan"
          aria-current={isActive('/scan') ? 'page' : undefined}
          className={cn(
            'pxl-corner mt-4 flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
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
              aria-current={isActive('/admin') ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive('/admin')
                  ? 'bg-brand/10 text-brand'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-light'
              )}
            >
              {isActive('/admin') && (
                <span aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-brand" />
              )}
              <Shield className={cn('w-5 h-5', isActive('/admin') ? 'text-brand' : 'text-muted-foreground')} />
              Admin
            </Link>
          </>
        )}
      </div>

      {/* Bottom: authenticated user info only */}
      {isAuthenticated && (
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-surface-lighter flex items-center justify-center text-sm font-semibold">
              {user?.fullName?.charAt(0) ?? 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName ?? user?.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
