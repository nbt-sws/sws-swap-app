import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { Bell, ShoppingBag, MessageSquare, Heart, ArrowRightLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Real backend event types look like ORDER_CREATED / ORDER_STATUS /
// ORDER_COMPLETED / OFFER_RECEIVED / OFFER_ACCEPTED / OFFER_DECLINED —
// normalize to a lowercase category for icons and colors.
function categoryOf(type: string): string {
  return type.split('_')[0].toLowerCase();
}

const ICONS: Record<string, React.ElementType> = {
  order: ShoppingBag,
  offer: ArrowRightLeft,
  like: Heart,
  message: MessageSquare,
};

const COLORS: Record<string, string> = {
  order: 'bg-brand/10 text-brand',
  offer: 'bg-cyan/10 text-cyan',
  like: 'bg-pldown/10 text-pldown',
  message: 'bg-pregrade/10 text-pregrade',
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAll = () => {
    const unreadIds = notifications?.filter((n) => !n.read).map((n) => n.id) ?? [];
    if (unreadIds.length) markAll.mutate(unreadIds);
  };

  // [P2-3] Click-through: route by notification event type. The notification
  // payload carries no related entity id, so order notifications land on the
  // orders list rather than a specific order detail (backend gap).
  const handleOpen = (n: { id: string; type: string }) => {
    handleMarkRead(n.id);
    if (n.type.startsWith('ORDER')) {
      navigate({ to: '/orders' });
    } else if (n.type.startsWith('OFFER')) {
      navigate({ to: '/offers' });
    }
  };

  if (isLoading) {
    return (
      <PageContainer size="sm" className="py-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="sm" className="py-6">
      <PageHeader
        title={t('notifications.title')}
        icon={<Bell className="w-6 h-6 text-brand" />}
        description={unread > 0 ? t('notifications.unread', { count: unread }) : t('notifications.description')}
        action={
          <Button variant="ghost" size="sm" onClick={handleMarkAll} disabled={unread === 0 || markAll.isPending}>
            <Check className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        }
      />

      <div className="space-y-6">
        <div className="space-y-3">
          {notifications?.map((n) => {
            const category = categoryOf(n.type);
            const Icon = ICONS[category] ?? Bell;
            const navigates = n.type.startsWith('ORDER') || n.type.startsWith('OFFER');
            return (
              <Card
                key={n.id}
                role={navigates ? 'button' : undefined}
                tabIndex={navigates ? 0 : undefined}
                onKeyDown={
                  navigates
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleOpen(n);
                        }
                      }
                    : undefined
                }
                className={cn(
                  'bg-surface-light border-border transition',
                  navigates && 'cursor-pointer hover:border-brand/40',
                  !n.read && 'border-brand/30'
                )}
                onClick={() => handleOpen(n)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', COLORS[category] ?? 'bg-surface-lighter text-muted-foreground')}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn('font-medium text-sm', !n.read && 'text-brand')}>{n.title}</h3>
                      <span className="text-xs text-muted-foreground">{relativeTime(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-brand mt-2" />}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {notifications?.length === 0 && (
          <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
            <EmptyMedia variant="icon">
              <Bell className="w-10 h-10 text-brand" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('notifications.empty')}</EmptyTitle>
              <EmptyDescription>{t('notifications.emptyDesc')}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <Button asChild variant="outline" className="w-full border-border">
          <Link to="/market">Browse market</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
