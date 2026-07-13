import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Award, Package, ChevronRight } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import { useServiceOrders } from '@/hooks/useServices';
import { GRADER_STYLES } from '@/lib/graderAssets';
import type { ServiceOrder } from '@/types';

const STATUS_COLORS: Record<ServiceOrder['status'], string> = {
  PENDING: 'bg-amber-500/10 text-amber-400',
  RECEIVED: 'bg-cyan-500/10 text-cyan-400',
  IN_PROGRESS: 'bg-brand/10 text-brand',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
};

export function ServiceOrdersScreen() {
  const { data: orders, isLoading } = useServiceOrders();

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Service orders"
        icon={<Award className="w-6 h-6 text-brand" />}
        description="Track your Pre-grade and Grade submissions"
        back={{ to: '/services' }}
      />

      {isLoading ? (
        <div className="space-y-3 mt-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <Empty className="mt-12 rounded-xl border-dashed border-border bg-surface-light/50 py-16">
          <EmptyMedia variant="icon">
            <Package className="w-10 h-10 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No service orders yet</EmptyTitle>
            <EmptyDescription>Browse providers and submit your first order.</EmptyDescription>
          </EmptyHeader>
          <Button asChild className="bg-brand hover:bg-brand-light">
            <Link to="/services">Browse services</Link>
          </Button>
        </Empty>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order, i) => {
            const currentStage = [...order.stages].reverse().find((s) => s.completed);
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to="/service-orders/$orderId"
                  params={{ orderId: order.id }}
                  className="block bg-surface-light border border-border rounded-xl p-4 hover:border-brand/30 hover:bg-surface-lighter transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
                        <Badge className={cn('text-[10px]', STATUS_COLORS[order.status])}>{order.status}</Badge>
                        {order.grader && (
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', GRADER_STYLES[order.grader])}>
                            {order.grader === 'OTHER' ? 'Other' : order.grader}
                          </span>
                        )}
                      </div>
                      <p className="font-medium truncate">{order.providerName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.packageName ?? (order.category === 'PREGRADE' ? 'Pre-grade' : 'Grade')} · {order.cardIds.length} card(s)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Latest: <span className="text-foreground font-medium">{currentStage?.label ?? 'Ordered'}</span>
                        {order.lotNumber && <> · Lot {order.lotNumber}</>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold font-mono">
                        {order.currency} {order.totalAmount.toLocaleString()}
                      </p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-1 group-hover:text-brand transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
