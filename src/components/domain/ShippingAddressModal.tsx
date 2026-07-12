import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface ShippingAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (address: ShippingAddress) => void;
  title: string;
  description?: string;
  isPending?: boolean;
}

export function ShippingAddressModal({
  open,
  onClose,
  onSubmit,
  title,
  description,
  isPending,
}: ShippingAddressModalProps) {
  const saved = loadSavedAddress();
  const [address, setAddress] = useState<Partial<ShippingAddress>>(saved);
  const [touched, setTouched] = useState(false);

  const errors: Partial<Record<keyof ShippingAddress, string>> = {};
  if (!address.name?.trim()) errors.name = 'Required';
  if (!address.phone?.trim()) errors.phone = 'Required';
  if (!address.address?.trim()) errors.address = 'Required';
  if (!address.province?.trim()) errors.province = 'Required';
  if (!address.postalCode?.trim()) errors.postalCode = 'Required';

  const canSubmit = Object.keys(errors).length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    const full: ShippingAddress = {
      name: address.name!.trim(),
      phone: address.phone!.trim(),
      address: address.address!.trim(),
      district: address.district?.trim(),
      province: address.province!.trim(),
      postalCode: address.postalCode!.trim(),
    };
    saveAddress(full);
    onSubmit(full);
  };

  const update = (field: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface-light border-border max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="sa-name">Full name</Label>
              <Input id="sa-name" value={address.name ?? ''} onChange={(e) => update('name', e.target.value)} className="bg-surface border-border" />
              {touched && errors.name && <p className="text-xs text-pldown">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="sa-phone">Phone</Label>
              <Input id="sa-phone" value={address.phone ?? ''} onChange={(e) => update('phone', e.target.value)} className="bg-surface border-border" />
              {touched && errors.phone && <p className="text-xs text-pldown">{errors.phone}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="sa-postal">Postal code</Label>
              <Input id="sa-postal" value={address.postalCode ?? ''} onChange={(e) => update('postalCode', e.target.value)} className="bg-surface border-border" />
              {touched && errors.postalCode && <p className="text-xs text-pldown">{errors.postalCode}</p>}
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="sa-address">Address</Label>
              <Input id="sa-address" value={address.address ?? ''} onChange={(e) => update('address', e.target.value)} className="bg-surface border-border" />
              {touched && errors.address && <p className="text-xs text-pldown">{errors.address}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="sa-district">District (optional)</Label>
              <Input id="sa-district" value={address.district ?? ''} onChange={(e) => update('district', e.target.value)} className="bg-surface border-border" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sa-province">Province</Label>
              <Input id="sa-province" value={address.province ?? ''} onChange={(e) => update('province', e.target.value)} className="bg-surface border-border" />
              {touched && errors.province && <p className="text-xs text-pldown">{errors.province}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-border">
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isPending} className="bg-brand hover:bg-brand-light">
              {isPending ? 'Submitting...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
