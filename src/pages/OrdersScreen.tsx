import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useOrders } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import {
  Package, Truck, CheckCircle2, XCircle, Clock, ClipboardList,
  ChevronRight, Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';

export function OrdersScreen() {
  const { t } = useTranslation();
  const { data: orders, isLoading } = useOrders();
  const [activeTab, setActiveTab] = useState('ALL');

  const statusConfig = getStatusConfig(t);
  const tabs = [
    { key: 'ALL', label: t('orders.tabs.all') },
    { key: 'ACTIVE', label: t('orders.tabs.active') },
    { key: 'COMPLETED', label: t('orders.tabs.completed') },
    { key: 'CANCELLED', label: t('orders.tabs.cancelled') },
  ];

  const filtered = orders?.filter((order) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return ['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED'].includes(order.status);
    if (activeTab === 'COMPLETED') return order.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return order.status === 'CANCELLED';
    return true;
  });

  return (
    <PageContainer className="py-6">
      <PageHeader
        title={t('orders.title')}
        icon={<ClipboardList className="w-6 h-6 text-brand" />}
        description={t('orders.description')}
      />

      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-surface-light border border-border">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="data-[state=active]:bg-brand data-[state=active]:text-white">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && (!filtered || filtered.length === 0) && (
          <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
            <EmptyMedia variant="icon">
              <Package className="w-10 h-10 text-brand" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('orders.empty')}</EmptyTitle>
              <EmptyDescription>{t('orders.emptyDesc', { defaultValue: 'Browse the market to find your next card.' })}</EmptyDescription>
            </EmptyHeader>
            <Button asChild className="bg-brand hover:bg-brand-light">
              <Link to="/market">Browse market</Link>
            </Button>
          </Empty>
        )}

        <div className="space-y-4">
          {filtered?.map((order) => {
            const config = statusConfig[order.status];
            const Icon = config.icon;
            return (
              <Link
                key={order.id}
                to="/orders/$orderId"
                params={{ orderId: order.id }}
                className="block group"
              >
                <Card className="bg-surface-light border-border hover:border-brand/40 hover:bg-surface-lighter transition cursor-pointer overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-14 h-[72px] rounded-lg flex items-center justify-center text-2xl shrink-0', config.bg)}>
                        {order.listing.card.game === 'one-piece' ? '⚓' : '⚔'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-xs font-mono text-muted-foreground">{order.id.slice(0, 8)}</p>
                          <Badge className={cn('text-xs border-0', config.badge)}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                          <DeliveryBadge delivery={order.deliveryPreference} />
                        </div>
                        <p className="font-semibold truncate">{order.listing.card.nameEn}</p>
                        <p className="text-sm text-muted-foreground">{order.listing.card.rarity} · {order.listing.card.condition}</p>
                        <OrderProgress status={order.status} />
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-semibold">฿{order.total.toLocaleString()}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground inline-block mt-1 group-hover:text-brand transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}

function getStatusConfig(t: (key: string) => string) {
  return {
    PENDING_PAYMENT: {
      label: t('orders.status.PENDING_PAYMENT'),
      icon: Clock,
      badge: 'text-warning bg-warning/10',
      bg: 'text-warning bg-warning/10',
    },
    PAID: {
      label: t('orders.status.PAID'),
      icon: CheckCircle2,
      badge: 'text-cyan bg-cyan/10',
      bg: 'text-cyan bg-cyan/10',
    },
    SHIPPED: {
      label: t('orders.status.SHIPPED'),
      icon: Truck,
      badge: 'text-brand bg-brand/10',
      bg: 'text-brand bg-brand/10',
    },
    DELIVERED: {
      label: t('orders.status.DELIVERED'),
      icon: Package,
      badge: 'text-plup bg-plup/10',
      bg: 'text-plup bg-plup/10',
    },
    COMPLETED: {
      label: t('orders.status.COMPLETED'),
      icon: CheckCircle2,
      badge: 'text-plup bg-plup/10',
      bg: 'text-plup bg-plup/10',
    },
    CANCELLED: {
      label: t('orders.status.CANCELLED'),
      icon: XCircle,
      badge: 'text-pldown bg-pldown/10',
      bg: 'text-pldown bg-pldown/10',
    },
  } as Record<Order['status'], { label: string; icon: typeof Clock; badge: string; bg: string }>;
}

function DeliveryBadge({ delivery }: { delivery?: 'SHIP' | 'VAULT_STORE' }) {
  if (delivery === 'SHIP') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Truck className="w-3 h-3" /> Ship
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Warehouse className="w-3 h-3" /> Vault
    </span>
  );
}

function OrderProgress({ status }: { status: Order['status'] }) {
  const steps = ['PENDING_PAYMENT', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
  const index = steps.indexOf(status);
  if (status === 'CANCELLED') return null;

  return (
    <div className="flex items-center gap-1 mt-3">
      {steps.map((step, i) => {
        const completed = i <= index;
        return (
          <div key={step} className="flex-1 flex items-center gap-1">
            <div className={cn('h-1.5 flex-1 rounded-full', completed ? 'bg-brand' : 'bg-border')} />
          </div>
        );
      })}
    </div>
  );
}
