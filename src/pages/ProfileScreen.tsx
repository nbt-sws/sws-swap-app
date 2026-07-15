import { Link, useNavigate } from '@tanstack/react-router';
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
  CreditCard,
  Settings,
  Trophy,
  Zap,
  HelpCircle,
  LogOut,
  Crown,
  AlertCircle,
  ChevronRight,
  Loader2,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: ShoppingBag, label: 'Orders', description: 'Track your purchases', to: '/orders' },
  { icon: Package, label: 'Vault', description: 'Manage your collection', to: '/vault' },
  { icon: Shield, label: 'KYC Verification', description: 'Verify your identity', to: '/profile/kyc' },
  { icon: Bell, label: 'Notifications', description: 'Offers, orders, and alerts', to: '/notifications' },
  { icon: CreditCard, label: 'Payment Methods', description: 'Cards and wallets', to: '/settings' },
  { icon: Settings, label: 'Settings', description: 'Language, theme, security', to: '/settings' },
  { icon: Trophy, label: 'Achievements', description: 'Badges and milestones', to: '/achievements' },
  { icon: Zap, label: 'Campaigns', description: 'Promotions and events', to: '/campaigns' },
  { icon: HelpCircle, label: 'Help & Support', description: 'FAQs and contact', to: '#' },
];

export function ProfileScreen() {
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

  // Derive KYC status from user data
  const kycStatus = (user as any)?.kycStatus ?? 'PENDING';
  const tier = (user as any)?.tier ?? 'REGULAR';

  return (
    <PageContainer size="md" className="py-6">
      <PageHeader
        title="Profile"
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
                <h1 className="mt-4 text-xl font-bold">{(displayUser as any)?.fullName ?? 'Guest'}</h1>
                <p className="text-sm text-muted-foreground">{(displayUser as any)?.email ?? 'Sign in to access your account'}</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Badge className="bg-brand/10 text-brand">
                    <Crown className="w-3 h-3 mr-1" />
                    {tier}
                  </Badge>
                  {kycStatus !== 'APPROVED' && (
                    <Badge variant="outline" className="text-pldown border-pldown/30">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      KYC {kycStatus}
                    </Badge>
                  )}
                  {kycStatus === 'APPROVED' && (
                    <Badge variant="outline" className="text-plup border-plup/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Orders</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/wishlist">
            <Card className="surface-card surface-card-hover">
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold">{wishlistLoading ? '-' : wishlistCount}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Wishlist</p>
              </CardContent>
            </Card>
          </Link>
          <Card className="surface-card surface-card-hover">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold">{ordersLoading ? '-' : `฿${totalSpent.toLocaleString()}`}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExternal = item.to === '#';
            const badge = item.label === 'Notifications' && unreadNotifications > 0
              ? String(unreadNotifications)
              : item.label === 'KYC Verification'
                ? (kycStatus === 'APPROVED' ? 'Verified' : 'Required')
                : undefined;

            const content = (
              <div className="flex items-center gap-3 p-3 rounded-xl surface-card surface-card-hover">
                <div className="p-2 rounded-lg bg-surface text-brand">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                </div>
                {badge && (
                  <Badge className={cn(
                    'text-xs',
                    badge === 'Required' ? 'bg-pldown/10 text-pldown' :
                    badge === 'Verified' ? 'bg-plup/10 text-plup' :
                    'bg-brand/10 text-brand'
                  )}>
                    {badge}
                  </Badge>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            );

            if (isExternal) {
              return <div key={item.label}>{content}</div>;
            }

            return (
              <Link key={item.label} to={item.to}>
                {content}
              </Link>
            );
          })}
        </div>

        {isAuthenticated && (
          <Button variant="ghost" className="w-full text-pldown hover:text-pldown hover:bg-pldown/10" onClick={() => { logout(); navigate({ to: '/login' }); }}>
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
