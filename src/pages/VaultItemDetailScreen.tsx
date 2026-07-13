import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/auth';
import { useState, useCallback } from 'react';
import {
  useVault, useListingsBySeller, useDelistListing,
  useItemAuditHistory, useVaultDelivery, useCreateRedemption,
  useConsignToPlatform,
} from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageLoader } from '@/components/ui/page-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import {
  TrendingUp, TrendingDown, Tag, Award,
  Package, Clock, Truck, ListChecks, User, Shield,
  Calendar, ShoppingBag, ClipboardList,
} from 'lucide-react';
import { cn, getCardImageUrl } from '@/lib/utils';
import { ListItemModal } from '@/components/vault/ListItemModal';
import { ShippingAddressModal } from '@/components/domain/ShippingAddressModal';
import { toast } from 'sonner';
import type { AuditRecord } from '@/services/mockApi';
import type { ShippingAddress } from '@/types';



export function VaultItemDetailScreen() {
  const { t } = useTranslation();
  const { itemId } = useParams({ from: '/vault/items/$itemId' });
  const navigate = useNavigate();
  const { data: vault, isLoading } = useVault();
  const { user } = useAuthStore();
  const { data: listings } = useListingsBySeller(user?.id);
  const delistListing = useDelistListing();
  const vaultDelivery = useVaultDelivery();
  const createRedemption = useCreateRedemption();
  const consign = useConsignToPlatform();
  const itemAudit = useItemAuditHistory(itemId);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState<'delivery' | 'redemption' | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  const item = vault?.find((v) => v.id === itemId);
  const listing = listings?.find((l) => l.card.code === item?.card.code);
  const isListed = !!listing;
  const isOwner = !!item && item.ownerId === user?.id;
  const canList = isOwner && item?.itemStatus !== 'REDEEMING' && item?.itemStatus !== 'REDEEMED' && item?.itemStatus !== 'LOCKED';
  const canConsign = isOwner && item?.holderId === user?.id;
  const canRequestDelivery = isOwner && item?.itemStatus === 'VAULT_HELD';
  const canRedeem = isOwner && item?.holderId === user?.id && item?.itemStatus === 'AVAILABLE';

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
            toast.success(t('vault.item.requestDelivery'));
            setAddressModalMode(null);
          },
          onError: () => toast.error(t('common.error')),
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
            toast.success(t('vault.item.redeemCard'));
            setAddressModalMode(null);
          },
          onError: () => toast.error(t('common.error')),
        }
      );
    },
    [item?.id, createRedemption]
  );

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <PageLoader />
      </PageContainer>
    );
  }

  if (!item) {
    return (
      <PageContainer className="py-6">
        <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-20">
          <EmptyMedia variant="icon">
            <Package className="w-8 h-8 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>{t('vault.item.notFound')}</EmptyTitle>
            <EmptyDescription>{t('vault.item.backToVault')}</EmptyDescription>
          </EmptyHeader>
          <Button asChild className="bg-brand hover:bg-brand-light">
            <Link to="/vault">{t('vault.item.backToVault')}</Link>
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  const isPositive = item.plPercent >= 0;

  return (
    <PageContainer className="py-6">
      <PageHeader
        title={t('vault.item.title')}
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
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('vault.item.paid')}</p>
                  <p className="font-mono font-bold">฿{item.paidPrice.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-surface-light border-border">
                <CardContent className="p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('vault.item.current')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('vault.item.allTimePL')}</p>
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
                  {t('vault.item.ownership')}
                </h3>
                <div className="space-y-3 text-sm">
                  <OwnershipRow
                    label={t('vault.item.owner')}
                    id={item.ownerId}
                    currentUserId={user?.id}
                    icon={<User className="w-4 h-4" />}
                    color="plup"
                  />
                  <div className="h-px bg-border" />
                  <OwnershipRow
                    label={t('vault.item.holder')}
                    id={item.holderId}
                    currentUserId={user?.id}
                    icon={<Shield className="w-4 h-4" />}
                    color="periwinkle"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service order */}
            {item.serviceOrderId && (
              <Card className="bg-brand/5 border-brand/20">
                <CardContent className="p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-brand mb-3 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5" /> Service order
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Order</span>
                      <Link
                        to="/service-orders/$orderId"
                        params={{ orderId: item.serviceOrderId }}
                        className="font-mono text-brand hover:underline"
                      >
                        {item.serviceOrderId}
                      </Link>
                    </div>
                    {item.serviceOrderStatus && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="font-medium">{item.serviceOrderStatus}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <div>
              <h3 className="text-sm font-semibold mb-3">{t('vault.item.details')}</h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-xs">{t('common.itemId')}</dt>
                    <dd className="font-medium">{item.id.slice(0, 8)}…</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-xs">{t('common.status')}</dt>
                    <dd className="font-medium">{item.status}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-xs">{t('common.acquired')}</dt>
                    <dd className="font-medium">{item.dateAcquired}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <dt className="text-muted-foreground text-xs">{t('common.source')}</dt>
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
                  {delistListing.isPending ? t('common.delisting') : t('common.delist')}
                </Button>
              ) : canList ? (
                <Button
                  className="flex-1 bg-brand hover:bg-brand-light h-12"
                  onClick={() => setListModalOpen(true)}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {t('common.listForSale')}
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-surface-lighter text-muted-foreground h-12 cursor-not-allowed"
                  disabled
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Not available to list
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1 border-border h-12"
                onClick={() => navigate({ to: '/pregrade', search: { category: 'PREGRADE', cardId: item.id, cardCode: item.card.code, cardName: item.card.nameEn } })}
              >
                <Award className="w-4 h-4 mr-2" />
                {t('common.grade')}
              </Button>
            </div>

            {canConsign && (
              <Button
                variant="outline"
                className="w-full border-brand text-brand hover:bg-brand/10 h-12"
                onClick={() => consign.mutate(item.id)}
                disabled={consign.isPending}
              >
                <Package className="w-4 h-4 mr-2" />
                {consign.isPending ? 'Depositing...' : 'Deposit to SWS Vault'}
              </Button>
            )}

            {(canRequestDelivery || canRedeem) && (
              <div className="flex gap-3">
                {canRequestDelivery && (
                  <Button
                    variant="outline"
                    className="flex-1 border-border h-12"
                    onClick={() => setAddressModalMode('delivery')}
                    disabled={vaultDelivery.isPending}
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    {t('common.requestDelivery')}
                  </Button>
                )}
                {canRedeem && (
                  <Button
                    variant="outline"
                    className="flex-1 border-border h-12"
                    onClick={() => setAddressModalMode('redemption')}
                    disabled={createRedemption.isPending}
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    {t('common.redeem')}
                  </Button>
                )}
              </div>
            )}
          </div>

          <ShippingAddressModal
            open={addressModalMode === 'delivery'}
            onClose={() => setAddressModalMode(null)}
            onSubmit={handleDeliverySubmit}
            title={t('vault.item.requestDelivery')}
            description={t('vault.item.deliveryDescription')}
            isPending={vaultDelivery.isPending}
          />
          <ShippingAddressModal
            open={addressModalMode === 'redemption'}
            onClose={() => setAddressModalMode(null)}
            onSubmit={handleRedemptionSubmit}
            title={t('vault.item.redeemCard')}
            description={t('vault.item.redeemDescription')}
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
              label={t('vault.item.details')}
            />
            <TabButton
              active={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              icon={<Clock className="w-4 h-4 inline mr-1" />}
              label={t('vault.item.auditHistory')}
            />
          </div>
        </div>

        {/* Audit History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {itemAudit.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                <span className="ml-2 text-sm text-muted-foreground">{t('common.loadingHistory')}</span>
              </div>
            ) : itemAudit.data && itemAudit.data.length > 0 ? (
              itemAudit.data.map((record: AuditRecord) => (
                <AuditRecordCard key={record.id} record={record} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">{t('common.noHistory')}</p>
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

function OwnershipRow({
  label,
  id,
  currentUserId,
  icon,
  color,
}: {
  label: string;
  id?: string;
  currentUserId?: string;
  icon: React.ReactNode;
  color: 'plup' | 'periwinkle';
}) {
  const { t } = useTranslation();
  const isCurrentUser = !!id && id === currentUserId;
  const displayId = id ? `${id.slice(0, 8)}…` : t('common.unknown');
  const colorClasses = {
    plup: 'bg-plup/10 text-plup',
    periwinkle: 'bg-periwinkle/10 text-periwinkle',
  };

  return (
    <div className="flex items-center gap-3">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-full', colorClasses[color])}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{isCurrentUser ? t('common.you') : displayId}</p>
      </div>
      {isCurrentUser && (
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', colorClasses[color])}>
          {t('common.you')}
        </span>
      )}
    </div>
  );
}

function AuditRecordCard({ record }: { record: AuditRecord }) {
  const { t } = useTranslation();
  const eventLabel = t(`vault.eventLabels.${record.eventType}` as const, { defaultValue: record.eventType });
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-surface-light p-4">
      <div className="mt-0.5 h-2 w-2 rounded-full bg-brand" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{eventLabel}</span>
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
