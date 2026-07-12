import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import {
  useVault, useListingsBySeller, useDelistListing,
  useItemAuditHistory, useVaultDelivery, useCreateRedemption,
} from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp, TrendingDown, Tag, Award,
  Package, Clock, Truck, ListChecks, User, Shield,
  Calendar, ShoppingBag,
} from 'lucide-react';
import { cn, getCardImageUrl } from '@/lib/utils';
import { ListItemModal } from '@/components/vault/ListItemModal';
import { ShippingAddressModal } from '@/components/domain/ShippingAddressModal';
import { toast } from 'sonner';
import type { AuditRecord } from '@/services/mockApi';
import type { ShippingAddress } from '@/types';

const EVENT_LABELS: Record<string, string> = {
  ITEM_REGISTERED: 'Item registered',
  PRICE_UPDATED: 'Price updated',
  ITEM_LISTED: 'Listed for sale',
  ITEM_DELISTED: 'Delisted',
  ITEM_SOLD: 'Sold',
  STATUS_CHANGED: 'Status changed',
};

export function VaultItemDetailScreen() {
  const { itemId } = useParams({ from: '/vault/items/$itemId' });
  const navigate = useNavigate();
  const { data: vault, isLoading } = useVault();
  const { data: listings } = useListingsBySeller('u1');
  const delistListing = useDelistListing();
  const vaultDelivery = useVaultDelivery();
  const createRedemption = useCreateRedemption();
  const itemAudit = useItemAuditHistory(itemId);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState<'delivery' | 'redemption' | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  const item = vault?.find((v) => v.id === itemId);
  const listing = listings?.find((l) => l.card.code === item?.card.code);
  const isListed = !!listing;

  const handleDelist = useCallback(() => {
    if (listing) {
      delistListing.mutate(listing.id);
    }
  }, [listing, delistListing]);

  const handleDeliverySubmit = useCallback(
    (address: ShippingAddress) => {
      vaultDelivery.mutate(
        { itemId: item?.id ?? '', shippingAddress: address },
        {
          onSuccess: () => {
            toast.success('Vault delivery requested');
            setAddressModalMode(null);
          },
          onError: () => toast.error('Failed to request delivery'),
        }
      );
    },
    [item?.id, vaultDelivery]
  );

  const handleRedemptionSubmit = useCallback(
    (address: ShippingAddress) => {
      createRedemption.mutate(
        { itemId: item?.id ?? '', shippingAddress: address },
        {
          onSuccess: () => {
            toast.success('Redemption requested');
            setAddressModalMode(null);
          },
          onError: () => toast.error('Failed to request redemption'),
        }
      );
    },
    [item?.id, createRedemption]
  );

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  if (!item) {
    return (
      <PageContainer className="py-6">
        <p className="text-muted-foreground">Vault item not found.</p>
        <Button asChild className="mt-4 bg-brand hover:bg-brand-light">
          <Link to="/vault">Back to vault</Link>
        </Button>
      </PageContainer>
    );
  }

  const isPositive = item.plPercent >= 0;

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Vault item"
        description={item.card.code}
        back={{ to: '/vault' }}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image */}
          <Card className="bg-surface-light border-border overflow-hidden">
            <CardContent className="p-0 aspect-[4/5] relative flex items-center justify-center">
              <img
                src={getCardImageUrl(item.card)}
                alt={item.card.nameEn}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className={cn(
                'absolute inset-0 flex items-center justify-center -z-10',
                item.card.game === 'one-piece' ? 'bg-brand/10' : 'bg-periwinkle/10'
              )}>
                <span className="text-6xl">{item.card.game === 'one-piece' ? '⚓' : '⚔'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="space-y-5">
            {/* Title + Badges */}
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">{item.card.code}</p>
              <h1 className="text-2xl font-bold">{item.card.nameEn}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center rounded-full bg-surface-lighter px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.card.rarity}
                </span>
                <span className="inline-flex items-center rounded-full bg-surface-lighter px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.condition}
                </span>
                <span className="inline-flex items-center rounded-full bg-surface-lighter px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.card.language}
                </span>
                <span className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
                  item.status === 'held' ? 'bg-plup/10 text-plup' :
                  item.status === 'sold' ? 'bg-cyan/10 text-cyan' :
                  'bg-brand/10 text-brand'
                )}>
                  {item.status.toUpperCase()}
                </span>
                {isListed && (
                  <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
                    LISTED
                  </span>
                )}
              </div>
            </div>

            {/* Price Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-surface-light border-border">
                <CardContent className="p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Paid</p>
                  <p className="font-mono font-bold">฿{item.paidPrice.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-surface-light border-border">
                <CardContent className="p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current</p>
                  <p className="font-mono font-bold">฿{item.currentPrice.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* P/L Card */}
            <Card className={cn(
              'border',
              isPositive ? 'bg-plup/10 border-plup/30' : 'bg-pldown/10 border-pldown/30'
            )}>
              <CardContent className="p-4 flex items-center gap-3">
                {isPositive ? (
                  <TrendingUp className="w-6 h-6 text-plup" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-pldown" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">All-time P/L</p>
                  <p className={cn(
                    'text-xl font-bold font-mono',
                    isPositive ? 'text-plup' : 'text-pldown'
                  )}>
                    {isPositive ? '+' : ''}฿{item.plAmount.toLocaleString()} ({item.plPercent}%)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ownership Card */}
            <Card className="bg-surface-light border-border">
              <CardContent className="p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Ownership
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-plup/10 text-plup">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="font-medium truncate">You</p>
                    </div>
                    <span className="rounded-full bg-plup/10 px-2 py-0.5 text-xs font-semibold text-plup">
                      You
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-periwinkle/10 text-periwinkle">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Holder</p>
                      <p className="font-medium truncate">You</p>
                    </div>
                    <span className="rounded-full bg-periwinkle/10 px-2 py-0.5 text-xs font-semibold text-periwinkle">
                      You
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Details</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-xs">Item ID</dt>
                    <dd className="font-medium">{item.id.slice(0, 8)}…</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-xs">Status</dt>
                    <dd className="font-medium">{item.status}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-xs">Acquired</dt>
                    <dd className="font-medium">{item.dateAcquired}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-xs">Source</dt>
                    <dd className="font-medium truncate">{item.source}</dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isListed ? (
                <Button
                  className="flex-1 bg-pldown hover:bg-pldown/90 h-12"
                  onClick={handleDelist}
                  disabled={delistListing.isPending}
                >
                  <ListChecks className="w-4 h-4 mr-2" />
                  {delistListing.isPending ? 'Delisting...' : 'Delist'}
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-brand hover:bg-brand-light h-12"
                  onClick={() => setListModalOpen(true)}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  List for sale
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 border-border h-12"
                onClick={() => navigate({ to: '/pregrade', search: { category: 'PREGRADE' } })}
              >
                <Award className="w-4 h-4 mr-2" />
                Grade
              </Button>
            </div>

            {item.status === 'held' && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-border h-12"
                  onClick={() => setAddressModalMode('delivery')}
                  disabled={vaultDelivery.isPending}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Request delivery
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-border h-12"
                  onClick={() => setAddressModalMode('redemption')}
                  disabled={createRedemption.isPending}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Redeem
                </Button>
              </div>
            )}
          </div>

          <ShippingAddressModal
            open={addressModalMode === 'delivery'}
            onClose={() => setAddressModalMode(null)}
            onSubmit={handleDeliverySubmit}
            title="Request vault delivery"
            description="We'll ship this card to your address."
            isPending={vaultDelivery.isPending}
          />
          <ShippingAddressModal
            open={addressModalMode === 'redemption'}
            onClose={() => setAddressModalMode(null)}
            onSubmit={handleRedemptionSubmit}
            title="Redeem card"
            description="We'll process this card and send cash equivalent to your address."
            isPending={createRedemption.isPending}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-4">
            <TabButton
              active={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
              icon={<Package className="w-4 h-4 inline mr-1" />}
              label="Details"
            />
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon={<Clock className="w-4 h-4 inline mr-1" />}
              label="Audit History"
            />
          </div>
        </div>

        {/* Audit History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {itemAudit.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                <span className="ml-2 text-sm text-muted-foreground">Loading history...</span>
              </div>
            ) : itemAudit.data && itemAudit.data.length > 0 ? (
              itemAudit.data.map((record: AuditRecord) => (
                <AuditRecordCard key={record.id} record={record} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No audit history yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ListItemModal
        open={listModalOpen}
        onClose={() => setListModalOpen(false)}
        item={item}
      />
    </PageContainer>
  );
}

/* ─── Subcomponents ─── */

function TabButton({
  active, onClick, icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
        active
          ? 'border-brand text-brand'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function AuditRecordCard({ record }: { record: AuditRecord }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-surface-light p-4">
      <div className="mt-0.5 h-2 w-2 rounded-full bg-brand" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{EVENT_LABELS[record.eventType] || record.eventType}</span>
          <span className="text-xs text-muted-foreground">
            {record.occurredAt ? new Date(record.occurredAt).toLocaleString() : '-'}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          by {record.actorId?.slice(0, 12) || 'system'}…
        </p>
        {record.previousState != null && record.newState != null && (
          <div className="mt-2 rounded-lg bg-surface p-2 text-xs font-mono">
            {JSON.stringify(record.previousState)} → {JSON.stringify(record.newState)}
          </div>
        )}
      </div>
    </div>
  );
}
