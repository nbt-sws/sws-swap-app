import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Search, Bell, Menu, Package, Sun, Moon, Globe,
  Award, Megaphone, House, Store, Users, ClipboardList,
  Heart, User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  requiresAuth?: boolean;
}

// Mobile hamburger menu — mirrors the remaining Sidebar nav + top nav items
const MOBILE_NAV: NavItem[] = [
  { to: '/', label: 'nav.home', icon: House },
  { to: '/market', label: 'nav.market', icon: Search },
  { to: '/stores', label: 'nav.stores', icon: Store },
  { to: '/following', label: 'nav.following', icon: Users },
  { to: '/vault', label: 'nav.vault', icon: Package, requiresAuth: true },
  { to: '/services', label: 'nav.services', icon: Award },
  { to: '/campaigns', label: 'nav.campaigns', icon: Megaphone },
  { to: '/orders', label: 'nav.orders', icon: ClipboardList, requiresAuth: true },
  { to: '/wishlist', label: 'nav.wishlist', icon: Heart, requiresAuth: true },
  { to: '/profile', label: 'nav.profile', icon: User },
];

// Desktop top nav — moved from Sidebar
const TOP_NAV: NavItem[] = [
  { to: '/vault', label: 'nav.vault', icon: Package, requiresAuth: true },
  { to: '/services', label: 'nav.services', icon: Award },
  { to: '/campaigns', label: 'nav.campaigns', icon: Megaphone },
];

export function TopBar() {
  const { t, i18n } = useTranslation();
  const router = useRouterState();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const currentPath = router.location.pathname;
  const { isAuthenticated, user } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();

  const isActive = (to: string) => {
    if (to === '/') return currentPath === '/';
    return currentPath.startsWith(to);
  };

  const toggleLanguage = () => {
    const next = i18n.language === 'th' ? 'en' : 'th';
    i18n.changeLanguage(next);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 lg:h-16 border-b border-border/80 bg-surface/85 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-4 md:pl-64 lg:px-6 lg:pl-64">
        {/* Left: mobile hamburger */}
        <div className="flex items-center gap-4">
          {/* Mobile: hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('common.open')}>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-surface-dark border-r border-border p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="SwibSwap"
                      className="w-8 h-8 rounded-lg object-contain"
                    />
                    <span className="font-bold text-lg">SwibSwap</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="p-3 space-y-1">
                  {MOBILE_NAV.map((item) => {
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
                        <Icon className="w-5 h-5" />
                        {t(item.label)}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

        </div>

        {/* Center: search */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  navigate({ to: '/browse', search: { q: query.trim() } });
                }
              }}
              placeholder={t('common.search')}
              aria-label={t('common.search')}
              className="w-full pl-9 bg-surface-light border-border focus-visible:ring-brand"
            />
          </div>
        </div>

        {/* Right actions: top nav → notifications → theme → language → login/profile */}
        <div className="flex items-center gap-1">
          <nav className="hidden lg:flex items-center gap-1 mr-2">
            {TOP_NAV.map((item) => {
              if (item.requiresAuth && !isAuthenticated) return null;
              const active = isActive(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand/10 text-brand'
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-light'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {t(item.label)}
                </Link>
              );
            })}
          </nav>

          <Button variant="ghost" size="icon" asChild className="relative">
            <Link to="/notifications" aria-label={t('nav.notifications')}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={resolvedTheme === 'dark' ? t('common.lightMode') : t('common.darkMode')}>
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label={t('common.switchLanguage')}>
            <Globe className="w-4 h-4" />
          </Button>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="ml-1 flex items-center gap-2 rounded-full bg-surface-light px-3 py-1.5 text-sm font-medium hover:bg-surface-lighter transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold">
                {user?.fullName?.charAt(0) ?? 'C'}
              </div>
              <span className="hidden lg:inline">{user?.fullName ?? user?.email}</span>
            </Link>
          ) : (
            <Button asChild className="ml-2 bg-brand hover:bg-brand-light">
              <Link to="/login">{t('nav.login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
