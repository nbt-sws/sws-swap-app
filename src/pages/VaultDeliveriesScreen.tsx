import { Link } from '@tanstack/react-router';
import { useVaultDeliveries } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from '@/components/ui/empty';
import { Truck, Package, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-warning bg-warning/10' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'text-cyan bg-cyan/10' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-brand bg-brand/10' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-plup bg-plup/10' },
};

function formatAddress(addr: { name: string; address: string; district?: string; province: string; postalCode: string }) {
  return `${addr.name}, ${addr.address}${addr.district ? `, ${addr.district}` : ''}, ${addr.province} ${addr.postalCode}`;
}

export function VaultDeliveriesScreen() {
  const { data: deliveries, isLoading } = useVaultDeliveries();

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <PageHeader title="Vault deliveries" icon={<Truck className="w-6 h-6 text-brand" />} back={{ to: '/vault' }} />

      <div className="space-y-6">
        <div className="space-y-3">
          {deliveries?.map((d) => {
            const config = statusConfig[d.status];
            const Icon = config.icon;
            return (
              <Card key={d.id} className="bg-surface-light border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{d.id}</span>
                    <Badge className={cn('text-xs', config.color)}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    {formatAddress(d.shippingAddress)}
                  </div>
                  {d.trackingNumber && (
                    <p className="text-xs text-muted-foreground">Tracking: {d.trackingNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Requested {new Date(d.createdAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {deliveries?.length === 0 && (
          <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
            <EmptyMedia variant="icon">
              <Truck className="w-10 h-10 text-brand" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No deliveries yet</EmptyTitle>
              <EmptyDescription>Request delivery of vault items to your address.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <Button asChild variant="outline" className="w-full border-border">
          <Link to="/vault">Back to vault</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
