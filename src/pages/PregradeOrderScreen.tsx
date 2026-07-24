import { useState, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useVault } from '@/hooks/useApi';
import { useServiceProviders, useServiceProvider, useCreateServiceOrder } from '@/hooks/useServices';
import { motion } from 'framer-motion';
import { ScrollablePage } from '@/components/layout/ScrollablePage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Check, Clock, Package, Store, Upload, FlaskConical } from 'lucide-react';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ServiceCategory, ServiceProvider } from '@/types';
import { GRADER_STYLES } from '@/lib/graderAssets';

const COURIERS = ['Kerry', 'Flash', 'ThaiPost'];

const DELIVERY_ICON: Record<ServiceProvider['deliveryMode'], typeof Upload> = {
  PHOTO_UPLOAD: Upload,
  PHYSICAL_DROP_OFF: Package,
  PHYSICAL_SHIP: Package,
};

const COLOR_RING: Record<ServiceProvider['color'], string> = {
  brand: 'ring-2 ring-brand/50 border-brand/50 bg-brand/10',
  periwinkle: 'ring-2 ring-periwinkle/50 border-periwinkle/50 bg-periwinkle/10',
  cyan: 'ring-2 ring-cyan/50 border-cyan/50 bg-cyan/10',
  pregrade: 'ring-2 ring-success/50 border-success/50 bg-success/10',
  plup: 'ring-2 ring-periwinkle/50 border-periwinkle/50 bg-periwinkle/10',
};

export function PregradeOrderScreen() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/pregrade' }) as { category?: ServiceCategory; provider?: string; package?: string; cardId?: string; cardCode?: string; cardName?: string };
  const category: ServiceCategory = search.category ?? 'PREGRADE';
  const preferredProviderId = search.provider;
  const preferredPackageId = search.package;

  const { data: vault } = useVault();
  const { data: providers, isLoading: providersLoading } = useServiceProviders(category);
  const createOrder = useCreateServiceOrder();

  // PHOTO_UPLOAD providers are hidden: the backend has no endpoint to attach
  // photos to a service order, so that delivery mode is a dead end for buyers.
  const filteredProviders = useMemo(
    () => providers?.filter((p) => p.category === category && p.deliveryMode !== 'PHOTO_UPLOAD') ?? [],
    [providers, category]
  );

  const [selectedProviderId, setSelectedProviderId] = useState<string>(preferredProviderId ?? '');

  const provider = useMemo(() => {
    if (filteredProviders.length === 0) return undefined;
    const bySelection = filteredProviders.find((p) => p.id === selectedProviderId);
    if (bySelection) return bySelection;
    const byPreference = preferredProviderId ? filteredProviders.find((p) => p.id === preferredProviderId) : undefined;
    return byPreference ?? filteredProviders[0];
  }, [filteredProviders, selectedProviderId, preferredProviderId]);

  // The providers list has no packages — fetch the selected provider's detail
  const { data: providerDetail } = useServiceProvider(provider?.id ?? '');

  const [selectedPackageId, setSelectedPackageId] = useState<string>(preferredPackageId ?? '');

  const packages = useMemo(
    () => providerDetail?.packages.filter((p) => p.enabled && p.deliveryMode !== 'PHOTO_UPLOAD') ?? [],
    [providerDetail]
  );

  const selectedPackage = useMemo(() => {
    if (packages.length === 0) return undefined;
    return packages.find((p) => p.id === selectedPackageId) || packages[0];
  }, [packages, selectedPackageId]);

  const [selectedCards, setSelectedCards] = useState<Set<string>>(
    () => new Set(search.cardId ? [search.cardId] : [])
  );
  const [selectedCourier, setSelectedCourier] = useState('Kerry');

  // Only raw, AVAILABLE cards can be submitted (listed/locked/in-service cards are excluded)
  const heldCards = useMemo(
    () => vault?.filter((v) => v.itemStatus === 'AVAILABLE' && v.condition === 'Raw') || [],
    [vault]
  );
  const cardCount = selectedCards.size;
  const pricePerCard = selectedPackage?.pricePerCard ?? provider?.pricePerCard ?? 0;
  const currency = selectedPackage?.currency ?? provider?.currency ?? 'THB';
  const subtotal = cardCount * pricePerCard;
  const shipping = cardCount > 0 ? 120 : 0;
  const total = subtotal + shipping;

  const activeDeliveryMode = selectedPackage?.deliveryMode ?? provider?.deliveryMode;

  const toggleCard = (id: string) => {
    const next = new Set(selectedCards);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCards(next);
  };

  const handleSubmit = () => {
    if (!provider || cardCount === 0) return;
    createOrder.mutate(
      {
        category,
        providerId: provider.id,
        packageId: selectedPackage?.id,
        cardIds: Array.from(selectedCards),
        deliveryMode: activeDeliveryMode,
      },
      {
        onSuccess: (order) => {
          toast.success('Order created — your cards are now locked for this service');
          if (order?.id) {
            navigate({ to: '/service-orders/$orderId', params: { orderId: order.id } });
          } else {
            navigate({ to: '/service-orders' });
          }
        },
        onError: () => toast.error('Failed to create order. Please try again.'),
      }
    );
  };

  const title = category === 'PREGRADE' ? 'Pre-grade order' : 'Grading order';

  return (
    <ScrollablePage
      header={
        <PageHeader
          title={title}
          description={`${cardCount} cards selected · ${category === 'PREGRADE' ? 'pre-grade' : 'grade'} service`}
          back={{ to: '/services' }}
        />
      }
      footer={
        <button
          onClick={handleSubmit}
          disabled={cardCount === 0 || !provider || createOrder.isPending}
          className={cn(
            'w-full py-4 rounded-xl font-semibold text-sm transition-all',
            cardCount > 0 && provider && !createOrder.isPending
              ? 'bg-brand-gradient shadow-glow active:scale-[0.98]'
              : 'bg-surface-lighter text-muted-foreground cursor-not-allowed'
          )}
        >
          {createOrder.isPending ? 'Creating order…' : 'Create shipping tag →'}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Provider selection */}
        <div>
          <p className="text-xs font-mono tracking-wider text-muted-foreground mb-2">
            {category === 'PREGRADE' ? 'PRE-GRADE PROVIDER' : 'GRADING PROVIDER'}
          </p>
          {providersLoading ? (
            <div className="h-24 bg-surface-light rounded-xl animate-pulse" />
          ) : filteredProviders.length === 0 ? (
            <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-10">
              <EmptyMedia variant="icon">
                <FlaskConical className="w-8 h-8 text-brand" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No labs available</EmptyTitle>
                <EmptyDescription>There are no grading providers for this category right now.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredProviders.map((p) => {
                const DeliveryIcon = DELIVERY_ICON[p.deliveryMode];
                const selected = provider?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProviderId(p.id)}
                    className={cn(
                      'w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3',
                      selected
                        ? `bg-surface-light ring-1 ${COLOR_RING[p.color]}`
                        : 'bg-surface-light border-transparent'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden',
                        selected ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {p.storeAvatarUrl ? (
                        <img src={p.storeAvatarUrl} alt={p.storeName} className="w-full h-full object-cover" />
                      ) : (
                        <Store className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{p.storeName}</span>
                        {selected && <Check className="w-3 h-3 text-brand" />}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {p.turnaround}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <DeliveryIcon className="w-3 h-3" />
                          {p.deliveryMode.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <span className="font-mono">
                          {p.currency} {p.pricePerCard.toLocaleString()} / card
                        </span>
                      </p>
                      {p.serviceTypes.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {p.serviceTypes.join(' · ')}
                        </p>
                      )}
                      {p.acceptedGraders && p.acceptedGraders.length > 0 && (
                        <p className="flex flex-wrap gap-1 mt-0.5">
                          {p.acceptedGraders.map((grader) => (
                            <span
                              key={grader}
                              className={cn(
                                'text-xs px-1.5 py-0.5 rounded border font-medium',
                                GRADER_STYLES[grader]
                              )}
                            >
                              {grader === 'OTHER' ? 'Other' : grader}
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Package selection — sticky & compact */}
        {provider && packages.length > 0 && (
          <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-surface-dark/95 backdrop-blur border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono tracking-wider text-muted-foreground">PACKAGE</p>
              <p className="text-xs text-muted-foreground truncate">
                Selected: <span className="text-foreground font-medium">{selectedPackage?.name}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {packages.map((pkg) => {
                const selected = selectedPackage?.id === pkg.id;
                const DeliveryIcon = DELIVERY_ICON[pkg.deliveryMode];
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={cn(
                      'text-left p-2 rounded-lg border transition-all bg-surface-light flex items-center gap-2',
                      selected ? 'border-brand/50 ring-2 ring-brand/50 bg-brand/10' : 'border-transparent hover:bg-surface-lighter'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border flex items-center justify-center shrink-0',
                        selected ? 'bg-brand border-brand' : 'border-muted-foreground/30'
                      )}
                    >
                      {selected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{pkg.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {pkg.turnaround}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <DeliveryIcon className="w-2.5 h-2.5" />
                          {pkg.deliveryMode.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </p>
                      <p className="text-xs font-mono font-bold text-brand">
                        {pkg.currency} {pkg.pricePerCard.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/ card</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Card selection */}
        <div>
          <p className="text-xs font-mono tracking-wider text-muted-foreground mb-2">
            FROM YOUR VAULT · {cardCount} OF {heldCards.length} SELECTED
          </p>
          <div className="space-y-2">
            {heldCards.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCard(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                  selectedCards.has(item.id)
                    ? 'bg-brand/5 border-brand/30'
                    : 'bg-surface-light border-transparent'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                    selectedCards.has(item.id) ? 'bg-brand border-brand' : 'border-muted-foreground/30'
                  )}
                >
                  {selectedCards.has(item.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.card.nameEn}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {item.condition} · {item.card.language}
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {provider ? `${currency} ${pricePerCard.toLocaleString()}` : '—'}
                </span>
              </button>
            ))}
            {heldCards.length === 0 && (
              <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-10">
                <EmptyMedia variant="icon">
                  <Package className="w-8 h-8 text-brand" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No raw cards available</EmptyTitle>
                  <EmptyDescription>Only raw cards with AVAILABLE status can be submitted. Add cards to your vault first.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </div>

        {/* Order summary */}
        {cardCount > 0 && provider && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-surface-light rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm">
                  {cardCount} × {selectedPackage?.name ?? (category === 'PREGRADE' ? 'pre-grade' : 'grade')} ({provider.storeName})
                </span>
                <span className="text-sm font-mono font-bold">
                  {currency} {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-muted-foreground">insured shipping ({selectedCourier} Express)</span>
                <span className="text-sm font-mono">{currency} {shipping}</span>
              </div>
              <div className="h-px bg-border mb-3" />
              <div className="flex justify-between">
                <span className="font-bold">TOTAL</span>
                <span className="font-bold font-mono text-lg">
                  {currency} {total.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Shipping destination */}
        {cardCount > 0 && provider && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-surface-light rounded-xl p-4">
              <p className="text-xs font-mono tracking-wider text-muted-foreground mb-2">
                SHIP TO · {provider.storeName.toUpperCase()}
              </p>
              <p className="text-sm">88 Sukhumvit 24, Klongton</p>
              <p className="text-sm text-muted-foreground">Bangkok 10110</p>
            </div>
          </motion.div>
        )}

        {/* Courier selection */}
        {cardCount > 0 && provider && (
          <div>
            <p className="text-xs font-mono tracking-wider text-muted-foreground mb-2">COURIER</p>
            <div className="flex gap-2">
              {COURIERS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCourier(c)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-xs font-medium transition-all',
                    selectedCourier === c ? 'bg-brand text-white' : 'bg-surface-light text-muted-foreground'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollablePage>
  );
}
