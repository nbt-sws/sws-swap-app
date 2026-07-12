import type { AuthUser, UserRole } from '@/types/auth';

export interface NavLinkDef {
  to: string;
  label: string;
  icon: string;
  requiresAuth?: boolean;
  requiresMember?: boolean;
  requiresAdmin?: boolean;
}

export function getNavLinks(role: UserRole): NavLinkDef[] {
  const links: NavLinkDef[] = [
    { to: '/', label: 'nav.home', icon: 'Home' },
    { to: '/market', label: 'nav.market', icon: 'ShoppingBag' },
    { to: '/vault', label: 'nav.vault', icon: 'Package', requiresAuth: true },
    { to: '/services', label: 'nav.services', icon: 'Award' },
  ];

  if (role !== 'GUEST') {
    links.push({ to: '/orders', label: 'nav.orders', icon: 'ClipboardList', requiresAuth: true });
    links.push({ to: '/wishlist', label: 'nav.wishlist', icon: 'Heart', requiresAuth: true });
  }

  return links;
}

export function canAccessRoute(
  user: AuthUser | null,
  route: { requiresAuth?: boolean; requiresMember?: boolean; requiresAdmin?: boolean }
): boolean {
  if (route.requiresAdmin) return user?.tier === 'ADMIN';
  if (route.requiresMember) return user?.tier === 'MEMBER' || user?.tier === 'ADMIN';
  if (route.requiresAuth) return !!user;
  return true;
}

export function authGuard(user: AuthUser | null): boolean {
  return !!user;
}

export function memberGuard(user: AuthUser | null): boolean {
  return user?.tier === 'MEMBER' || user?.tier === 'ADMIN';
}

export function adminGuard(user: AuthUser | null): boolean {
  return user?.tier === 'ADMIN';
}
