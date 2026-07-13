import { Link } from '@tanstack/react-router';
import { useRedemptions } from '@/hooks/useApi';
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
import { Gift, Package, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-amber-400 bg-amber-400/10' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'text-cyan bg-cyan/10' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-brand bg-brand/10' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2, color: 'text-plup bg-plup/10' },
};

function formatAddress(addr: { name: string; address: string; district?: string; province: string; postalCode: string }) {
  return `${addr.name}, ${addr.address}${addr.district ? `, ${addr.district}` : ''}, ${addr.province} ${addr.postalCode}`;
}

export function RedemptionsScreen() {
  const { data: redemptions, isLoading } = useRedemptions();

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
      <PageHeader title="Redemptions" icon={<Gift className="w-6 h-6 text-brand" />} back={{ to: '/vault' }} />

      <div className="space-y-6">
        <div className="space-y-3">
          {redemptions?.map((r) => {
            const config = statusConfig[r.status];
            const Icon = config.icon;
            return (
              <Card key={r.id} className="bg-surface-light border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">{r.id}</span>
                    <Badge className={cn('text-xs', config.color)}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    {formatAddress(r.shippingAddress)}
                  </div>
                  {r.trackingNumber && (
                    <p className="text-xs text-muted-foreground">Tracking: {r.trackingNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Requested {new Date(r.createdAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {redemptions?.length === 0 && (
          <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
            <EmptyMedia variant="icon">
              <Gift className="w-10 h-10 text-brand" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No redemptions yet</EmptyTitle>
              <EmptyDescription>Redeem vault items for cash or store credit.</EmptyDescription>
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
