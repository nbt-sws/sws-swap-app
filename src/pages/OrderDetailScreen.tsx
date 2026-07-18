import { useParams, Link } from '@tanstack/react-router';
import { useOrder, useCancelOrder, useUpdateOrderStatus } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, Truck, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { cn } from '@/lib/utils';

import { GameMark } from '@/components/domain/GameMark';
import { useAuthStore } from '@/stores/auth';
import type { Order } from '@/types';

const statusConfig: Record<Order['status'], { label: string; icon: typeof Clock; color: string; step: number }> = {
  PENDING_PAYMENT: { label: 'Pending payment', icon: Clock, color: 'text-warning bg-warning/10', step: 1 },
  PAID: { label: 'Paid', icon: CheckCircle2, color: 'text-cyan bg-cyan/10', step: 2 },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-brand bg-brand/10', step: 3 },
  DELIVERED: { label: 'Delivered', icon: Package, color: 'text-plup bg-plup/10', step: 4 },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-plup bg-plup/10', step: 5 },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-pldown bg-pldown/10', step: 0 },
};

import { ORDER_STEPS, orderStepIndex, getOrderAction, canCancelOrder, waitingHint } from '@/lib/orderFlow';

export function OrderDetailScreen() {
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
            <EmptyTitle>Order not found</EmptyTitle>
            <EmptyDescription>We couldn't find this order.</EmptyDescription>
          </EmptyHeader>
          <Button asChild className="bg-brand hover:bg-brand-light">
            <Link to="/orders">Back to orders</Link>
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
  const hint = waitingHint(order.rawStatus, isBuyer);

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
                {isBuyer ? 'Buyer' : 'Seller'}
              </Badge>
            )}
            <Badge className={cn('text-sm', config.color)}>
              <Icon className="w-4 h-4 mr-1" />
              {config.label}
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
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition',
                          done || current
                            ? 'bg-brand text-white'
                            : 'bg-surface-lighter text-muted-foreground'
                        )}
                      >
                        {done ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <span
                        className={cn(
                          'text-xs hidden sm:block text-center',
                          done || current ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
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
                <CardTitle className="text-base">Item details</CardTitle>
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
                    Shipping address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.shippingAddress || 'No address provided'}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="bg-surface-light border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>฿{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span>฿{order.fee.toLocaleString()}</span>
                </div>
                {order.platformFee ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SWS fulfillment fee</span>
                    <span>฿{order.platformFee.toLocaleString()}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{order.shipping > 0 ? `฿${order.shipping.toLocaleString()}` : 'Free'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="font-mono">฿{order.total.toLocaleString()}</span>
                </div>

                <div className="pt-2 space-y-2">
                  {primaryAction && order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                    <Button
                      className="w-full bg-brand hover:bg-brand-light"
                      onClick={handlePrimary}
                      disabled={updateStatus.isPending}
                    >
                      {updateStatus.isPending ? 'Updating...' : primaryAction.label}
                    </Button>
                  )}
                  {hint && order.status !== 'CANCELLED' && !primaryAction && (
                    <p className="text-xs text-muted-foreground text-center py-1 flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {hint}
                    </p>
                  )}
                  {canCancel && (
                    <Button
                      variant="outline"
                      className="w-full border-border"
                      onClick={handleCancel}
                      disabled={cancelOrder.isPending}
                    >
                      Cancel order
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
