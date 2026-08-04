import { Link, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth';
import { useUser, useOrders, useWishlist, useNotifications } from '@/hooks/useApi';
import type { Notification } from '@/types';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Package,
  Shield,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Crown,
  AlertCircle,
  ChevronRight,
  Loader2,
  User,
  Truck,
  Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: ShoppingBag, key: 'orders', to: '/orders' },
  { icon: Package, key: 'vault', to: '/vault' },
  { icon: Truck, key: 'submissions', to: '/status' },
  { icon: Shield, key: 'kyc', to: '/profile/kyc' },
  { icon: Bell, key: 'notifications', to: '/notifications' },
  { icon: Store, key: 'myShop', to: '/seller' },
  // TODO(deferred): Payment Methods hidden — payment is deferred by the owner and
  // /settings has no payment section yet. Restore when payments ship.
  // { icon: CreditCard, key: 'payments', to: '/settings' },
  { icon: Settings, key: 'settings', to: '/settings' },
  { icon: HelpCircle, key: 'help', to: 'mailto:support@swibswap.app' },
];

export function ProfileScreen() {
  const { t } = useTranslation();
  const { user: authUser, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useUser();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: wishlist, isLoading: wishlistLoading } = useWishlist();
  const { data: notifications } = useNotifications();

  const displayUser = user ?? authUser;
  const orderCount = orders?.length ?? 0;
  const wishlistCount = wishlist?.length ?? 0;
  const totalSpent = orders?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;
  const unreadNotifications = notifications?.filter((n: Notification) => !n.read).length ?? 0;

  // Derive KYC status from user data — users who never submitted KYC are NONE, not PENDING
  const kycStatus = (user as any)?.kycStatus ?? 'NONE';
  const tier = (user as any)?.tier ?? 'REGULAR';

  return (
    <PageContainer size="md" className="py-6">
      <PageHeader
        title={t('profileMenu.title')}
        icon={<User className="w-6 h-6 text-brand" />}
      />

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="surface-card surface-card-hover text-center">
          <CardContent className="p-6">
            {userLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-brand-gradient mx-auto flex items-center justify-center text-2xl font-bold text-white border-4 border-surface-lighter">
                  {(displayUser as any)?.fullName?.charAt(0) ?? (displayUser as any)?.email?.charAt(0) ?? 'G'}
                </div>
                <h1 className="mt-4 text-xl font-bold">{(displayUser as any)?.fullName ?? t('profileMenu.guest')}</h1>
                <p className="text-sm text-muted-foreground">{(displayUser as any)?.email ?? t('profileMenu.guestHint')}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Badge variant="pixel" className="pxl-chip--brand">
                    <Crown className="w-3 h-3 mr-1" aria-hidden="true" />
                    {tier}
                  </Badge>
                  {kycStatus !== 'APPROVED' && kycStatus !== 'NONE' && (
                    <Badge variant="outline" className="text-pldown border-pldown/30">
                      <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                      KYC {kycStatus}
                    </Badge>
                  )}
                  {kycStatus === 'APPROVED' && (
                    <Badge variant="pixel" className="pxl-chip--peri">
                      <Shield className="w-3 h-3 mr-1" aria-hidden="true" />
                      {t('profileMenu.verified')}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Link to="/orders">
            <Card className="surface-card surface-card-hover">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">{ordersLoading ? '-' : orderCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('profileMenu.stats.orders')}</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/wishlist">
            <Card className="surface-card surface-card-hover">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">{wishlistLoading ? '-' : wishlistCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('profileMenu.stats.wishlist')}</p>
              </CardContent>
            </Card>
          </Link>
          <Card className="surface-card surface-card-hover">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{ordersLoading ? '-' : `฿${totalSpent.toLocaleString()}`}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('profileMenu.stats.spent')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isMailto = item.to.startsWith('mailto:');
            const badge = item.key === 'notifications' && unreadNotifications > 0
              ? String(unreadNotifications)
              : item.key === 'kyc'
                ? (kycStatus === 'APPROVED' ? t('profileMenu.verified') : t('profileMenu.kycRequired'))
                : undefined;

            const content = (
              <div className="flex items-center gap-3 p-3 rounded-xl surface-card surface-card-hover">
                <div className="p-2 rounded-lg bg-surface text-brand">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{t(`profileMenu.menu.${item.key}.label`)}</p>
                  <p className="text-xs text-muted-foreground truncate">{t(`profileMenu.menu.${item.key}.desc`)}</p>
                </div>
                {badge && (
                  <Badge className={cn(
                    'text-xs',
                    badge === t('profileMenu.kycRequired') ? 'bg-pldown/10 text-pldown' :
                    badge === t('profileMenu.verified') ? 'bg-plup/10 text-plup' :
                    'bg-brand/10 text-brand'
                  )}>
                    {badge}
                  </Badge>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            );

            if (isMailto) {
              return (
                <a key={item.key} href={item.to}>
                  {content}
                </a>
              );
            }

            return (
              <Link key={item.key} to={item.to}>
                {content}
              </Link>
            );
          })}
        </div>

        {isAuthenticated && (
          <Button variant="ghost" className="w-full text-pldown hover:text-pldown hover:bg-pldown/10" onClick={() => { logout(); navigate({ to: '/login' }); }}>
            <LogOut className="w-4 h-4 mr-2" />
            {t('profileMenu.logout')}
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
