import { useParams, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useOrder, useCancelOrder, useUpdateOrderStatus } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Truck, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

import { GameMark } from '@/components/domain/GameMark';
import { useAuthStore } from '@/stores/auth';
import type { Order } from '@/types';

const statusConfig: Record<Order['status'], { icon: typeof Clock; color: string; step: number }> = {
  PENDING_PAYMENT: { icon: Clock, color: 'text-warning bg-warning/10', step: 1 },
  PAID: { icon: CheckCircle2, color: 'text-cyan bg-cyan/10', step: 2 },
  SHIPPED: { icon: Truck, color: 'text-brand bg-brand/10', step: 3 },
  DELIVERED: { icon: Package, color: 'text-plup bg-plup/10', step: 4 },
  COMPLETED: { icon: CheckCircle2, color: 'text-plup bg-plup/10', step: 5 },
  CANCELLED: { icon: XCircle, color: 'text-pldown bg-pldown/10', step: 0 },
};

import { ORDER_STEPS, orderStepIndex, getOrderAction, canCancelOrder, waitingHintKey } from '@/lib/orderFlow';

export function OrderDetailScreen() {
  const { t } = useTranslation();
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const { data: order, isLoading } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const updateStatus = useUpdateOrderStatus();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-48 w-full" />
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer className="py-6">
        <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
          <EmptyMedia variant="icon">
            <Package className="w-8 h-8 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('orders.notFound')}</EmptyTitle>
            <EmptyDescription>{t('orders.notFoundDesc')}</EmptyDescription>
          </EmptyHeader>
          <Button asChild className="bg-brand hover:bg-brand-light">
            <Link to="/orders">{t('orders.backToOrders')}</Link>
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  const config = statusConfig[order.status];
  const Icon = config.icon;

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  // Flow is driven by the raw backend status (display status is lossy)
  const primaryAction = getOrderAction(order.rawStatus, isBuyer, isSeller);
  const canCancel = canCancelOrder(order.rawStatus, isBuyer);
  const hintKey = waitingHintKey(order.rawStatus, isBuyer);

  const handlePrimary = () => {
    if (!primaryAction) return;
    updateStatus.mutate({ orderId: order.id, status: primaryAction.next });
  };

  const handleCancel = () => {
    cancelOrder.mutate(order.id);
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title={order.listing.card.nameEn}
        description={`ORDER ${order.id.slice(0, 8)}`}
        back={{ to: '/orders' }}
        action={
          <div className="flex items-center gap-2">
            {(isBuyer || isSeller) && (
              <Badge variant="outline" className="text-xs">
                {isBuyer ? t('orders.buyer') : t('orders.seller')}
              </Badge>
            )}
            <Badge className={cn('text-sm', config.color)}>
              <Icon className="w-4 h-4 mr-1" />
              {t(`orders.status.${order.status}`)}
            </Badge>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Progress — driven by the raw backend status */}
        {order.status !== 'CANCELLED' && (
          <Card className="bg-surface-light border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {ORDER_STEPS.map((step, index) => {
                  const current = index === orderStepIndex(order.rawStatus);
                  const done = index < orderStepIndex(order.rawStatus);
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs transition pxl-num',
                          done
                            ? 'bg-success/20 text-success'
                            : current
                              ? 'bg-brand text-white shadow-glow'
                              : 'bg-surface-lighter text-muted-foreground'
                        )}
                      >
                        {done ? <CheckCircle2 className="w-4 h-4" /> : `0${index + 1}`}
                      </div>
                      <span
                        className={cn(
                          'text-xs hidden sm:block text-center',
                          current ? 'text-foreground font-semibold' : done ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {t(step.labelKey)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-surface-light border-border">
              <CardHeader>
                <CardTitle className="text-base">{t('orders.itemDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                <div
                  className={cn(
                    'w-24 h-32 rounded-lg flex items-center justify-center text-2xl shrink-0',
                    order.listing.card.game === 'one-piece' ? 'bg-brand/10' : 'bg-periwinkle/10'
                  )}
                >
                  <GameMark game={order.listing.card.game} />
                </div>
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{order.listing.card.code}</p>
                  <p className="font-semibold">{order.listing.card.nameEn}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">{order.listing.card.rarity}</Badge>
                    <Badge variant="outline">{order.listing.card.condition}</Badge>
                    <Badge variant="outline">{order.listing.card.language}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {order.deliveryPreference === 'SHIP' && (
              <Card className="bg-surface-light border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t('checkout.shippingAddress')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress || t('orders.noAddress')}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="bg-surface-light border-border sticky top-24 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t('checkout.summary')}</CardTitle>
                  <span className="pxl-chip pxl-chip--peri">{order.id.slice(0, 8)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="ticket-label pt-0.5">{t('checkout.subtotal')}</span>
                  <span className="mono-num">฿{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="ticket-label pt-0.5">{t('checkout.serviceFee')}</span>
                  <span className="mono-num">฿{order.fee.toLocaleString()}</span>
                </div>
                {order.platformFee ? (
                  <div className="flex justify-between text-sm">
                    <span className="ticket-label pt-0.5">{t('checkout.platformFee')}</span>
                    <span className="mono-num">฿{order.platformFee.toLocaleString()}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm">
                  <span className="ticket-label pt-0.5">{t('checkout.deliveryLabel')}</span>
                  <span className="mono-num">{order.shipping > 0 ? `฿${order.shipping.toLocaleString()}` : t('checkout.free')}</span>
                </div>

                {/* Perforated tear-off line */}
                <div className="ticket-dash mt-4" aria-hidden="true" />

                <div className="flex justify-between items-end pt-1">
                  <span className="ticket-label">{t('checkout.total')}</span>
                  <span className="mono-num text-xl font-bold neon-text-brand">฿{order.total.toLocaleString()}</span>
                </div>

                <div className="pt-2 space-y-2">
                  {primaryAction && order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                    <Button
                      className="w-full bg-brand hover:bg-brand-light font-bold shadow-glow"
                      onClick={handlePrimary}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? t('orders.updating') : t(primaryAction.labelKey)}
                    </Button>
                  )}
                  {hintKey && order.status !== 'CANCELLED' && !primaryAction && (
                    <p className="text-xs text-muted-foreground text-center py-1 flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {t(hintKey)}
                    </p>
                  )}
                  {canCancel && (
                    <Button
                      variant="outline"
                      className="w-full border-border"
                      onClick={handleCancel}
                      disabled={cancelOrder.isPending}
                    >
                      {t('orders.cancelOrder')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
