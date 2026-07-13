import { useState } from 'react';
import { useParams, useSearch, useNavigate, Link } from '@tanstack/react-router';
import { useListing, useCreateOrder } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeliveryPreferenceSelector } from '@/components/domain/DeliveryPreferenceSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, ShieldCheck, MapPin, CheckCircle, Store } from 'lucide-react';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { getCardImageUrl, isPlatformHeld } from '@/lib/utils';
import { useAuthStore, isMember } from '@/stores/auth';
import type { ShippingAddress } from '@/types';

const ADDRESS_KEY = 'sws-shipping-address';

function loadSavedAddress(): Partial<ShippingAddress> {
  try {
    const raw = localStorage.getItem(ADDRESS_KEY);
    return raw ? (JSON.parse(raw) as Partial<ShippingAddress>) : {};
  } catch {
    return {};
  }
}

function saveAddress(address: ShippingAddress) {
  try {
    localStorage.setItem(ADDRESS_KEY, JSON.stringify(address));
  } catch {
    // ignore
  }
}

export function CheckoutScreen() {
  const { listingId } = useParams({ from: '/checkout/$listingId' });
  const navigate = useNavigate();
  const search = useSearch({ from: '/checkout/$listingId' });
  const { user } = useAuthStore();
  const isUserMember = isMember(user);

  const { data: listing, isLoading } = useListing(listingId);
  const createOrder = useCreateOrder();
  const initialDelivery = (search as { delivery?: 'SHIP' | 'VAULT_STORE' }).delivery;
  const [delivery, setDelivery] = useState<'SHIP' | 'VAULT_STORE'>(initialDelivery ?? 'SHIP');
  const savedAddress = loadSavedAddress();
  const [address, setAddress] = useState<Partial<ShippingAddress>>({
    ...savedAddress,
    name: savedAddress.name ?? user?.fullName ?? '',
  });
  const [touched, setTouched] = useState(false);

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-40 w-full mb-4" />
        <Skeleton className="h-40 w-full" />
      </PageContainer>
    );
  }

  if (!listing) {
    return (
      <PageContainer className="py-6">
        <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
          <EmptyMedia variant="icon">
            <Store className="w-8 h-8 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Listing not found</EmptyTitle>
            <EmptyDescription>This listing may have been removed or sold.</EmptyDescription>
          </EmptyHeader>
          <Button asChild className="bg-brand hover:bg-brand-light">
            <Link to="/market">Back to market</Link>
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  const fee = Math.round(listing.price * 0.05);
  const shipping = delivery === 'SHIP' ? 120 : 0;
  const platformFee = isPlatformHeld(listing) ? Math.round(listing.price * 0.025) : 0;
  const total = listing.price + fee + shipping + platformFee;

  const shippingErrors: Partial<Record<keyof ShippingAddress, string>> = {};
  if (delivery === 'SHIP') {
    if (!address.name?.trim()) shippingErrors.name = 'Full name is required';
    if (!address.phone?.trim()) shippingErrors.phone = 'Phone number is required';
    if (!address.address?.trim()) shippingErrors.address = 'Address is required';
    if (!address.province?.trim()) shippingErrors.province = 'Province is required';
    if (!address.postalCode?.trim()) shippingErrors.postalCode = 'Postal code is required';
  }

  const canCheckout = delivery === 'VAULT_STORE' || Object.keys(shippingErrors).length === 0;

  const handleCheckout = () => {
    setTouched(true);
    if (!canCheckout) return;

    const shippingAddress: ShippingAddress | undefined =
      delivery === 'SHIP'
        ? {
            name: address.name?.trim() ?? '',
            phone: address.phone?.trim() ?? '',
            address: address.address?.trim() ?? '',
            district: address.district?.trim(),
            province: address.province?.trim() ?? '',
            postalCode: address.postalCode?.trim() ?? '',
          }
        : undefined;

    if (shippingAddress) saveAddress(shippingAddress);

    createOrder.mutate(
      {
        listingId: listing.id,
        deliveryType: delivery,
        shippingAddress,
      },
      {
        onSuccess: (data) => {
          navigate({ to: '/orders/$orderId', params: { orderId: data.id } });
        },
      }
    );
  };

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <PageContainer className="py-6">
      <PageHeader title="Checkout" back={{ to: '/market/$listingId', params: { listingId } }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item */}
          <Card className="bg-surface-light border-border">
            <CardHeader>
              <CardTitle className="text-base">Item</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="w-24 h-32 rounded-lg overflow-hidden shrink-0">
                <img
                  src={getCardImageUrl(listing.card)}
                  alt={listing.card.nameEn}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-muted-foreground">{listing.card.code}</p>
                <p className="font-semibold truncate">{listing.card.nameEn}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{listing.card.rarity}</Badge>
                  <Badge variant="outline">{listing.card.condition}</Badge>
                  <Badge variant="outline">{listing.card.language}</Badge>
                </div>
                <p className="mt-3 font-mono font-semibold text-brand">฿{listing.price.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery */}
          <Card className="bg-surface-light border-border">
            <CardHeader>
              <CardTitle className="text-base">Delivery preference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DeliveryPreferenceSelector value={delivery} onChange={setDelivery} isMember={isUserMember} />

              {delivery === 'SHIP' && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Shipping address
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="name" className="text-xs text-muted-foreground">
                        Full name
                      </Label>
                      <Input
                        id="name"
                        value={address.name ?? ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="Full name"
                        className="bg-surface border-border"
                      />
                      {touched && shippingErrors.name && (
                        <p className="text-xs text-pldown">{shippingErrors.name}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs text-muted-foreground">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={address.phone ?? ''}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="Phone number"
                        className="bg-surface border-border"
                      />
                      {touched && shippingErrors.phone && (
                        <p className="text-xs text-pldown">{shippingErrors.phone}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="postalCode" className="text-xs text-muted-foreground">
                        Postal code
                      </Label>
                      <Input
                        id="postalCode"
                        value={address.postalCode ?? ''}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                        placeholder="Postal code"
                        className="bg-surface border-border"
                      />
                      {touched && shippingErrors.postalCode && (
                        <p className="text-xs text-pldown">{shippingErrors.postalCode}</p>
                      )}
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label htmlFor="address" className="text-xs text-muted-foreground">
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={address.address ?? ''}
                        onChange={(e) => updateField('address', e.target.value)}
                        placeholder="Street address"
                        className="bg-surface border-border"
                      />
                      {touched && shippingErrors.address && (
                        <p className="text-xs text-pldown">{shippingErrors.address}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="district" className="text-xs text-muted-foreground">
                        District (optional)
                      </Label>
                      <Input
                        id="district"
                        value={address.district ?? ''}
                        onChange={(e) => updateField('district', e.target.value)}
                        placeholder="District / Sub-district"
                        className="bg-surface border-border"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="province" className="text-xs text-muted-foreground">
                        Province
                      </Label>
                      <Input
                        id="province"
                        value={address.province ?? ''}
                        onChange={(e) => updateField('province', e.target.value)}
                        placeholder="Province"
                        className="bg-surface border-border"
                      />
                      {touched && shippingErrors.province && (
                        <p className="text-xs text-pldown">{shippingErrors.province}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="bg-surface-light border-border">
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-brand bg-brand/10 text-left">
                <CreditCard className="w-5 h-5 text-brand" />
                <div>
                  <p className="font-medium text-sm">Credit / Debit card</p>
                  <p className="text-xs text-muted-foreground">Mock payment</p>
                </div>
                <CheckCircle className="w-4 h-4 text-brand ml-auto" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="bg-surface-light border-border sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>฿{listing.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service fee (5%)</span>
                <span>฿{fee.toLocaleString()}</span>
              </div>
              {platformFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SWS fulfillment fee (2.5%)</span>
                  <span>฿{platformFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span>{shipping > 0 ? '฿120' : 'Free'}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="font-mono">฿{total.toLocaleString()}</span>
              </div>

              <Button
                className="w-full bg-brand hover:bg-brand-light h-12"
                onClick={handleCheckout}
                disabled={createOrder.isPending || (delivery === 'SHIP' && !canCheckout)}
              >
                {createOrder.isPending ? 'Processing...' : 'Confirm & Pay'}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="w-3 h-3" />
                Secured by SWS Swap Vault
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
