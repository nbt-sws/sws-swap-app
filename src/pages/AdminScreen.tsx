import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  usePlatformStats,
  useListings,
  useOrders,
  useDelistListing,
  useUpdateListingStatus,
  useUpdateOrderStatus,
  useCancelOrder,
  useItemAuditHistory,
  useUserAuditHistory,
} from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import {
  Shield,
  Users,
  ShoppingBag,
  Package,
  Search,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order, MarketListing } from '@/types';

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <Card className="bg-surface-light border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const orderStatusConfig: Record<Order['status'], { label: string; color: string }> = {
  PENDING_PAYMENT: { label: 'Pending', color: 'text-warning bg-warning/10' },
  PAID: { label: 'Paid', color: 'text-cyan bg-cyan/10' },
  SHIPPED: { label: 'Shipped', color: 'text-brand bg-brand/10' },
  DELIVERED: { label: 'Delivered', color: 'text-plup bg-plup/10' },
  COMPLETED: { label: 'Completed', color: 'text-plup bg-plup/10' },
  CANCELLED: { label: 'Cancelled', color: 'text-pldown bg-pldown/10' },
};

function ListingRow({ listing }: { listing: MarketListing }) {
  const { t } = useTranslation();
  const delist = useDelistListing();
  const updateStatus = useUpdateListingStatus();
  const isActive = listing.status === 'active';

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
      <div className="min-w-0">
        <p className="text-xs font-mono text-muted-foreground">{listing.card.code}</p>
        <p className="font-medium truncate">{listing.card.nameEn}</p>
        <p className="text-xs text-muted-foreground">฿{listing.price.toLocaleString()} · {listing.seller.name}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="capitalize">{listing.status}</Badge>
        <Button
          size="sm"
          variant={isActive ? 'outline' : 'default'}
          className={cn(isActive ? 'border-border' : 'bg-brand hover:bg-brand-light')}
          onClick={() => updateStatus.mutate({ listingId: listing.id, status: isActive ? 'sold' : 'active' })}
          disabled={updateStatus.isPending}
        >
          {isActive ? 'Mark sold' : 'Activate'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-border text-pldown hover:text-pldown"
          onClick={() => delist.mutate(listing.id, {
            onSuccess: () => toast.success(t('common.delistSuccess')),
            onError: () => toast.error(t('common.delistError')),
          })}
          disabled={delist.isPending}
        >
          Delist
        </Button>
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const cancel = useCancelOrder();
  const config = orderStatusConfig[order.status];

  // Advance through the backend state machine (rawStatus, not the display status)
  const nextStatus: import('@/types/api').ApiOrderStatus | null =
    order.rawStatus === 'CREATED'
      ? 'PAYMENT_PENDING'
      : order.rawStatus === 'PAYMENT_PENDING'
        ? 'PAYMENT_CONFIRMED'
        : order.rawStatus === 'PAYMENT_CONFIRMED'
          ? 'SHIPPING_ARRANGED'
          : order.rawStatus === 'SHIPPING_ARRANGED'
            ? 'COMPLETED'
            : null;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
      <div className="min-w-0">
        <p className="text-xs font-mono text-muted-foreground">{order.id.slice(0, 8)}</p>
        <p className="font-medium truncate">{order.listing.card.nameEn}</p>
        <p className="text-xs text-muted-foreground">฿{order.total.toLocaleString()}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={cn('text-xs', config.color)}>{config.label}</Badge>
        {nextStatus && (
          <Button
            size="sm"
            className="bg-brand hover:bg-brand-light"
            onClick={() => updateStatus.mutate({ orderId: order.id, status: nextStatus })}
            disabled={updateStatus.isPending}
          >
            {({
              PAYMENT_PENDING: 'Payment sent',
              PAYMENT_CONFIRMED: 'Payment confirmed',
              SHIPPING_ARRANGED: 'Shipped',
              COMPLETED: 'Completed',
            } as Record<string, string>)[nextStatus]}
          </Button>
        )}
        {['PENDING_PAYMENT', 'PAID'].includes(order.status) && (
          <Button
            size="sm"
            variant="outline"
            className="border-border text-pldown hover:text-pldown"
            onClick={() => cancel.mutate(order.id)}
            disabled={cancel.isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export function AdminScreen() {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: listingsData, isLoading: listingsLoading } = useListings({ limit: 100 });
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const listings = listingsData?.results;

  const [auditItemId, setAuditItemId] = useState('');
  const [auditUserId, setAuditUserId] = useState('');
  const itemAudit = useItemAuditHistory(auditItemId);
  const userAudit = useUserAuditHistory(auditUserId);

  return (
    <PageContainer className="py-6">
      <PageHeader title="Admin" icon={<Shield className="w-6 h-6 text-brand" />} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-surface-light border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {statsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Users" value={stats?.totalUsers?.toLocaleString() ?? '-'} />
              <StatCard icon={ShoppingBag} label="Listings" value={stats?.totalListings?.toLocaleString() ?? '-'} />
              <StatCard icon={Package} label="Orders" value={stats?.totalOrders?.toLocaleString() ?? '-'} />
              <StatCard icon={Clock} label="Active" value={listings?.filter((l) => l.status === 'active').length ?? '-'} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="listings" className="space-y-4">
          {listingsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-3">
              {listings?.map((l) => <ListingRow key={l.id} listing={l} />)}
              {listings?.length === 0 && (
                <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-10">
                  <EmptyMedia variant="icon">
                    <Package className="w-8 h-8 text-brand" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No listings found</EmptyTitle>
                    <EmptyDescription>There are no marketplace listings to review.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {ordersLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-3">
              {orders?.map((o) => <OrderRow key={o.id} order={o} />)}
              {orders?.length === 0 && <p className="text-sm text-muted-foreground">No orders found.</p>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="bg-surface-light border-border">
            <CardHeader>
              <CardTitle className="text-base">Item audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={auditItemId}
                  onChange={(e) => setAuditItemId(e.target.value)}
                  placeholder="Item ID"
                  className="bg-surface border-border"
                />
                <Button onClick={() => itemAudit.refetch()} disabled={!auditItemId}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              {itemAudit.isLoading && <Skeleton className="h-20 w-full" />}
              {itemAudit.data?.map((r) => (
                <div key={r.id} className="text-sm border-l-2 border-brand pl-3 py-1">
                  <p className="font-medium">{r.eventType}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.occurredAt).toLocaleString()}</p>
                </div>
              ))}
              {itemAudit.data?.length === 0 && <p className="text-sm text-muted-foreground">No audit records.</p>}
            </CardContent>
          </Card>

          <Card className="bg-surface-light border-border">
            <CardHeader>
              <CardTitle className="text-base">User audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={auditUserId}
                  onChange={(e) => setAuditUserId(e.target.value)}
                  placeholder="User ID"
                  className="bg-surface border-border"
                />
                <Button onClick={() => userAudit.refetch()} disabled={!auditUserId}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              {userAudit.isLoading && <Skeleton className="h-20 w-full" />}
              {userAudit.data?.map((r) => (
                <div key={r.id} className="text-sm border-l-2 border-brand pl-3 py-1">
                  <p className="font-medium">{r.eventType}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.occurredAt).toLocaleString()}</p>
                </div>
              ))}
              {userAudit.data?.length === 0 && <p className="text-sm text-muted-foreground">No audit records.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
