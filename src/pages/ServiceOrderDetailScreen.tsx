import { useParams, Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  Box,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  Package,
  Truck,
  User,
  Hash,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import { useServiceOrder, useUpdateServiceOrder } from '@/hooks/useServices';
import { useVault } from '@/hooks/useApi';
import { toast } from 'sonner';
import { GRADER_STYLES } from '@/lib/graderAssets';
import type { ServiceOrder } from '@/types';

const STATUS_COLORS: Record<ServiceOrder['status'], string> = {
  PENDING: 'bg-warning/10 text-warning',
  RECEIVED: 'bg-cyan/10 text-cyan',
  IN_PROGRESS: 'bg-brand/10 text-brand',
  COMPLETED: 'bg-success/10 text-success',
  CANCELLED: 'bg-danger/10 text-danger',
};

export function ServiceOrderDetailScreen() {
  const { orderId } = useParams({ from: '/service-orders/$orderId' });
  const { data: order, isLoading: orderLoading } = useServiceOrder(orderId);
  const { data: vault, isLoading: vaultLoading } = useVault();
  const updateOrder = useUpdateServiceOrder();

  if (orderLoading) {
    return (
      <PageContainer className="py-6">
        <Skeleton className="h-8 w-40 mb-6" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64 mt-4" />
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
            <EmptyDescription>We couldn't find this service order.</EmptyDescription>
          </EmptyHeader>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/service-orders">
              <ArrowLeft className="w-4 h-4" /> Back to orders
            </Link>
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  // Cards are matched by the order's cardIds (vault item ids)
  const linkedCards = (vault ?? []).filter((item) => order.cardIds.includes(item.id));
  const stages = order.stages ?? [];

  return (
    <PageContainer className="py-6">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground">
          <Link to="/service-orders">
            <ArrowLeft className="w-4 h-4" /> Back to orders
          </Link>
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-light border border-border rounded-xl p-5 mb-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-1">{order.orderNo ?? order.id}</p>
            <h1 className="text-xl font-bold">{order.packageName ?? (order.category === 'PREGRADE' ? 'Pre-grade' : 'Grade')} order</h1>
          </div>
          <Badge className={cn('text-xs', STATUS_COLORS[order.status])}>{order.status}</Badge>
        </div>

        {order.gradeResult && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan/10 border border-cyan/30 px-3 py-2">
            <Award className="w-4 h-4 text-cyan" />
            <span className="text-sm font-semibold text-cyan">Result: {order.gradeResult}</span>
          </div>
        )}

        {order.status === 'PENDING' && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="border-pldown/40 text-pldown hover:bg-pldown/10"
              onClick={() => {
                if (confirm('Cancel this order? Your cards will be released back to your vault.')) {
                  updateOrder.mutate(
                    { orderId: order.id, action: 'cancel' },
                    {
                      onSuccess: () => toast.success('Order cancelled — cards released'),
                      onError: () => toast.error('Failed to cancel order'),
                    }
                  );
                }
              }}
              disabled={updateOrder.isPending}
            >
              Cancel order
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <div className="flex items-center gap-3 rounded-xl bg-background p-3">
            <div className="p-2 rounded-lg bg-surface">
              <User className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Provider</p>
              <p className="text-sm font-medium">{order.providerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-background p-3">
            <div className="p-2 rounded-lg bg-surface">
              <Award className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Grader</p>
              <p className="text-sm font-medium">
                {order.grader ? (
                  <span className={cn('px-1.5 py-0.5 rounded border text-xs', GRADER_STYLES[order.grader])}>
                    {order.grader}
                  </span>
                ) : (
                  '—'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-background p-3">
            <div className="p-2 rounded-lg bg-surface">
              <CreditCard className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-medium font-mono">
                {order.currency} {order.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-background p-3">
            <div className="p-2 rounded-lg bg-surface">
              <Clock className="w-4 h-4 text-brand" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="text-sm font-medium">{format(new Date(order.createdAt), 'PPP')}</p>
            </div>
          </div>
        </div>

        {(order.trackingNumber || order.lotNumber || order.labOrderNumber) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {order.trackingNumber && (
              <div className="flex items-center gap-3 rounded-xl bg-background p-3">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tracking</p>
                  <p className="text-sm font-mono">{order.trackingNumber}</p>
                </div>
              </div>
            )}
            {order.lotNumber && (
              <div className="flex items-center gap-3 rounded-xl bg-background p-3">
                <Package className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Store lot #</p>
                  <p className="text-sm font-mono">{order.lotNumber}</p>
                </div>
              </div>
            )}
            {order.labOrderNumber && (
              <div className="flex items-center gap-3 rounded-xl bg-background p-3">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Lab order #</p>
                  <p className="text-sm font-mono">{order.labOrderNumber}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface-light border border-border rounded-xl p-5 mb-4"
      >
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand" /> Progress
        </h2>
        {stages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Progress tracking will appear once the provider updates the order.</p>
        ) : (
          <div className="relative pl-4">
            <div className="absolute left-[1.125rem] top-2 bottom-2 w-px bg-border" />
            <ul className="space-y-5">
              {stages.map((stage, idx) => (
                <li key={stage.key} className="relative flex items-start gap-3">
                  <div className="relative z-10 mt-0.5">
                    {stage.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : idx === stages.findIndex((s) => !s.completed) ? (
                      <Circle className="w-5 h-5 text-brand" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn('text-sm font-medium', stage.completed ? 'text-foreground' : 'text-muted-foreground')}>
                      {stage.label}
                    </p>
                    {stage.timestamp && (
                      <p className="text-xs text-muted-foreground">{format(new Date(stage.timestamp), 'PPp')}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-light border border-border rounded-xl p-5"
      >
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <Box className="w-4 h-4 text-brand" /> Cards
        </h2>
        {vaultLoading ? (
          <Skeleton className="h-20" />
        ) : linkedCards.length === 0 ? (
          <p className="text-sm text-muted-foreground">{order.cardIds.length} card(s) submitted.</p>
        ) : (
          <div className="space-y-2">
            {linkedCards.map((item) => (
              <Link
                key={item.id}
                to="/vault/items/$itemId"
                params={{ itemId: item.id }}
                className="flex items-center gap-3 rounded-xl bg-background p-3 hover:border-brand/30 border border-transparent transition-colors"
              >
                <img
                  src={item.card.imageUrl}
                  alt={item.card.nameEn}
                  className="w-12 h-16 object-cover rounded-md bg-surface"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.card.nameEn}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.card.code} · {item.condition}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {item.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </PageContainer>
  );
}
