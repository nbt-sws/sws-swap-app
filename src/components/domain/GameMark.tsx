import { cn } from '@/lib/utils';

const MARKS: Record<string, { label: string; className: string }> = {
  'one-piece': { label: 'OP', className: 'bg-brand/15 text-brand' },
  'yu-gi-oh': { label: 'YGO', className: 'bg-periwinkle/15 text-periwinkle' },
  pokemon: { label: 'POK', className: 'bg-warning/15 text-warning' },
  lorcana: { label: 'LOR', className: 'bg-cyan/15 text-cyan' },
  conan: { label: 'CON', className: 'bg-success/15 text-success' },
  others: { label: 'OTH', className: 'bg-surface-lighter text-muted-foreground' },
};

/**
 * Compact game identifier — designed mono marks instead of emoji.
 */
export function GameMark({ game, size = 'md' }: { game?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const mark = MARKS[game ?? ''] ?? MARKS.others;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-mono font-bold tracking-tight shrink-0',
        mark.className,
        size === 'sm' && 'text-[9px] px-1 py-0.5',
        size === 'md' && 'text-[10px] px-1.5 py-0.5',
        size === 'lg' && 'text-sm px-2.5 py-1',
        size === 'xl' && 'text-3xl px-4 py-2 rounded-xl'
      )}
    >
      {mark.label}
    </span>
  );
}
