import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Layers, CheckCircle, Package, Tag, Truck, Gift, CheckSquare, Lock,
} from 'lucide-react';

export type VaultFilter =
  | 'ALL'
  | 'AVAILABLE'
  | 'VAULT_HELD'
  | 'LISTED'
  | 'IN_TRANSIT'
  | 'REDEEMING'
  | 'COMPLETED'
  | 'LOCKED';

interface VaultFilterTabsProps {
  activeFilter: VaultFilter;
  onFilterChange: (filter: VaultFilter) => void;
  counts: Record<VaultFilter, number>;
  isOwner?: boolean;
}

const FILTER_CONFIG: { id: VaultFilter; labelKey: string; icon: React.ElementType; ownerOnly?: boolean }[] = [
  { id: 'ALL', labelKey: 'filters.all', icon: Layers },
  { id: 'AVAILABLE', labelKey: 'filters.available', icon: CheckCircle },
  { id: 'VAULT_HELD', labelKey: 'filters.held', icon: Package },
  { id: 'LISTED', labelKey: 'filters.listed', icon: Tag },
  { id: 'IN_TRANSIT', labelKey: 'filters.inTransit', icon: Truck },
  { id: 'REDEEMING', labelKey: 'filters.redeeming', icon: Gift },
  { id: 'COMPLETED', labelKey: 'filters.completed', icon: CheckSquare },
  { id: 'LOCKED', labelKey: 'filters.locked', icon: Lock },
];

export function VaultFilterTabs({ activeFilter, onFilterChange, counts, isOwner }: VaultFilterTabsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_CONFIG.map((f) => {
        if (f.ownerOnly && !isOwner) return null;
        const Icon = f.icon;
        const count = counts[f.id] ?? 0;
        const active = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all',
              active
                ? 'bg-brand text-white shadow-sm'
                : 'bg-surface-light text-muted-foreground hover:text-foreground hover:bg-surface'
            )}
            aria-pressed={active}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{t(f.labelKey)}</span>
            <span
              className={cn(
                'ml-0.5 min-w-[1.25rem] rounded-full px-1.5 py-0 text-[11px] text-center',
                active ? 'bg-white/20 text-white' : 'bg-surface-lighter text-muted-foreground'
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
