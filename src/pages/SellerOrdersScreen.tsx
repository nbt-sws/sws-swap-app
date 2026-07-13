import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronDown, ChevronUp, Save, Truck, Hash, FileDigit, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useServiceOrders, useUpdateServiceOrder, useServiceProviders } from '@/hooks/useServices';
import { GRADER_STYLES } from '@/lib/graderAssets';
import type { ServiceOrder, ServiceOrderStage } from '@/types';

const STATUS_COLORS: Record<ServiceOrder['status'], string> = {
  PENDING: 'bg-amber-500/10 text-amber-400',
  RECEIVED: 'bg-cyan-500/10 text-cyan-400',
  IN_PROGRESS: 'bg-brand/10 text-brand',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
};

export function SellerOrdersScreen() {
  const { user } = useAuthStore();
  const { data: orders, isLoading } = useServiceOrders();
  const { data: providers } = useServiceProviders();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const myProviderIds = useMemo(
    () => new Set((providers ?? []).filter((p) => p.storeId === user?.id).map((p) => p.id)),
    [providers, user?.id]
  );

  const filtered = useMemo(
    () => (orders ?? []).filter((o) => myProviderIds.has(o.providerId)),
    [orders, myProviderIds]
  );

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Service orders"
        description="Update statuses, lot numbers and progress for customer submissions"
        icon={<Award className="w-6 h-6 text-brand" />}
      />

      {isLoading ? (
        <div className="space-y-3 mt-6">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h2 className="text-lg font-bold">No orders to manage</h2>
          <p className="text-sm text-muted-foreground">Customer service orders will appear here.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {filtered.map((order) => (
            <OrderManager
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId((id) => (id === order.id ? null : order.id))}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function OrderManager({
  order,
  expanded,
  onToggle,
}: {
  order: ServiceOrder;
  expanded: boolean;
  onToggle: () => void;
}) {
  const update = useUpdateServiceOrder();
  const [lotNumber, setLotNumber] = useState(order.lotNumber ?? '');
  const [labOrderNumber, setLabOrderNumber] = useState(order.labOrderNumber ?? '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '');
  const [stages, setStages] = useState<ServiceOrderStage[]>(() =>
    [...order.stages].map((s) => ({ ...s }))
  );

  const toggleStage = (index: number) => {
    setStages((prev) => {
      const next = prev.map((s) => ({ ...s }));
      const target = next[index];
      const completed = !target.completed;
      for (let i = 0; i < next.length; i++) {
        if (completed) {
          if (i <= index) {
            next[i].completed = true;
            if (!next[i].timestamp) next[i].timestamp = new Date().toISOString();
          }
        } else {
          if (i >= index) {
            next[i].completed = false;
            next[i].timestamp = undefined;
          }
        }
      }
      return next;
    });
  };

  const handleSave = () => {
    update.mutate(
      {
        orderId: order.id,
        update: {
          lotNumber: lotNumber || undefined,
          labOrderNumber: labOrderNumber || undefined,
          trackingNumber: trackingNumber || undefined,
          stages,
        },
      },
      {
        onSuccess: () => toast.success('Order updated'),
        onError: () => toast.error('Failed to update order'),
      }
    );
  };

  const currentStage = [...stages].reverse().find((s) => s.completed);

  return (
    <Card className="bg-surface-light border-border overflow-hidden">
      <CardContent className="p-0">
        <button
          onClick={onToggle}
          className="w-full p-4 text-left flex items-start justify-between gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono text-muted-foreground">{order.id}</span>
              <Badge className={cn('text-[10px]', STATUS_COLORS[order.status])}>{order.status}</Badge>
              {order.grader && (
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', GRADER_STYLES[order.grader])}>
                  {order.grader}
                </span>
              )}
            </div>
            <p className="font-medium truncate">{order.packageName ?? order.category}</p>
            <p className="text-xs text-muted-foreground truncate">
              {order.providerName} · {order.cardIds.length} card(s) · {order.currency} {order.totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Latest: <span className="text-foreground font-medium">{currentStage?.label ?? 'Ordered'}</span>
            </p>
          </div>
          <div className="shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <Separator />
              <div className="p-4 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Hash className="w-3 h-3" /> Store lot #
                    </Label>
                    <Input
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      placeholder="e.g. LOT-2026-07-A"
                      className="h-9 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileDigit className="w-3 h-3" /> Lab order #
                    </Label>
                    <Input
                      value={labOrderNumber}
                      onChange={(e) => setLabOrderNumber(e.target.value)}
                      placeholder="e.g. PSA-12345678"
                      className="h-9 bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Truck className="w-3 h-3" /> Tracking #
                    </Label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. TH1234567890"
                      className="h-9 bg-background"
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Progress</p>
                  <div className="space-y-2">
                    {stages.map((stage, idx) => (
                      <label
                        key={stage.key}
                        className={cn(
                          'flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors',
                          stage.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-background border-border'
                        )}
                      >
                        <Checkbox
                          checked={stage.completed}
                          onCheckedChange={() => toggleStage(idx)}
                        />
                        <div className="flex-1">
                          <p className={cn('text-sm font-medium', stage.completed ? 'text-foreground' : 'text-muted-foreground')}>
                            {stage.label}
                          </p>
                          {stage.timestamp && (
                            <p className="text-[10px] text-muted-foreground">{new Date(stage.timestamp).toLocaleString()}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={update.isPending}
                  className="w-full bg-brand hover:bg-brand-light"
                >
                  {update.isPending ? (
                    'Saving…'
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save update
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
