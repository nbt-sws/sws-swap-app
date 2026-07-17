import { cn } from '@/lib/utils';

/**
 * Compact game identifier — replaces emoji (⚓/⚔) with a designed mono mark.
 * OP = One Piece (brand hue), YGO = Yu-Gi-Oh! (periwinkle hue).
 */
export function GameMark({ game, size = 'md' }: { game?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const isOP = game === 'one-piece';
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-mono font-bold tracking-tight shrink-0',
        isOP ? 'bg-brand/15 text-brand' : 'bg-periwinkle/15 text-periwinkle',
        size === 'sm' && 'text-[9px] px-1 py-0.5',
        size === 'md' && 'text-[10px] px-1.5 py-0.5',
        size === 'lg' && 'text-sm px-2.5 py-1',
        size === 'xl' && 'text-3xl px-4 py-2 rounded-xl'
      )}
    >
      {isOP ? 'OP' : 'YGO'}
    </span>
  );
}
