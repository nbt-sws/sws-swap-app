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

const FILTER_CONFIG: { id: VaultFilter; label: string; icon: React.ElementType; ownerOnly?: boolean }[] = [
  { id: 'ALL', label: 'All', icon: Layers },
  { id: 'AVAILABLE', label: 'Available', icon: CheckCircle },
  { id: 'VAULT_HELD', label: 'Vault held', icon: Package },
  { id: 'LISTED', label: 'Listed', icon: Tag },
  { id: 'IN_TRANSIT', label: 'In transit', icon: Truck },
  { id: 'REDEEMING', label: 'Redeeming', icon: Gift },
  { id: 'COMPLETED', label: 'Completed', icon: CheckSquare },
  { id: 'LOCKED', label: 'Locked', icon: Lock },
];

export function VaultFilterTabs({ activeFilter, onFilterChange, counts, isOwner }: VaultFilterTabsProps) {
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
              'inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition-all',
              active
                ? 'bg-brand text-white shadow-sm'
                : 'bg-surface-light text-muted-foreground hover:text-white'
            )}
            aria-pressed={active}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{f.label}</span>
            <span
              className={cn(
                'ml-0.5 min-w-[1.25rem] rounded-full px-1 py-0 text-[10px] text-center',
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
