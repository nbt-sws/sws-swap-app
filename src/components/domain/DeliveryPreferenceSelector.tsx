import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Warehouse, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

interface DeliveryPreferenceSelectorProps {
  value: 'SHIP' | 'VAULT_STORE' | null;
  onChange: (value: 'SHIP' | 'VAULT_STORE') => void;
  isMember?: boolean;
  disabled?: boolean;
}

export function DeliveryPreferenceSelector({
  value,
  onChange,
  isMember = false,
  disabled = false,
}: DeliveryPreferenceSelectorProps) {
  const { t } = useTranslation();
  const [showMemberDialog, setShowMemberDialog] = useState(false);

  const handleSelect = (method: 'SHIP' | 'VAULT_STORE') => {
    if (disabled) return;
    if (method === 'VAULT_STORE' && !isMember) {
      setShowMemberDialog(true);
      return;
    }
    onChange(method);
  };

  const handleDialogClose = () => {
    setShowMemberDialog(false);
    if (value === 'VAULT_STORE') onChange('SHIP');
  };

  const options = [
    {
      id: 'SHIP' as const,
      label: t('delivery.option.ship'),
      description: t('delivery.option.shipDesc'),
      icon: Truck,
    },
    {
      id: 'VAULT_STORE' as const,
      label: t('delivery.option.vaultStore'),
      description: isMember ? t('delivery.option.vaultStoreDescMember') : t('delivery.option.vaultStoreDescNonMember'),
      icon: Warehouse,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.id;
          const isVaultLocked = option.id === 'VAULT_STORE' && !isMember;
          const Icon = option.icon;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option.id)}
              disabled={disabled || isVaultLocked}
              className={cn(
                'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all text-left',
                isSelected
                  ? 'border-brand bg-brand/10'
                  : 'border-border bg-surface-light hover:bg-surface-lighter',
                (disabled || isVaultLocked) && 'cursor-not-allowed opacity-60'
              )}
            >
              <Icon size={24} className={isSelected ? 'text-brand' : 'text-muted-foreground'} />
              <span className="text-sm font-semibold text-foreground">{option.label}</span>
              <span className="text-xs text-muted-foreground text-center">{option.description}</span>
              {isVaultLocked && (
                <span className="absolute -top-2 right-3 rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-white shadow-sm flex items-center gap-1">
                  <Lock size={10} /> {t('delivery.memberOnlyBadge')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent className="bg-surface-light border-border">
          <DialogHeader>
            <DialogTitle>{t('delivery.dialog.title')}</DialogTitle>
            <DialogDescription>{t('delivery.dialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <Button asChild className="bg-brand hover:bg-brand-light">
              <Link to="/profile/kyc">{t('delivery.dialog.goToKyc')}</Link>
            </Button>
            <Button variant="ghost" onClick={handleDialogClose}>
              {t('delivery.dialog.chooseShipping')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
