import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Small accessible "what is this?" affordance — opens on hover AND keyboard
 * focus (Radix Tooltip). Pair it with micro-labels and status badges that
 * need a plain-language explanation (confidence, identification source, …).
 *
 * Note: TooltipContent renders at z-[70] so it stays above bottom sheets
 * that sit at z-[60] (e.g. ScanResultSheet).
 */
export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex items-center justify-center rounded-full p-0.5 -my-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Info className="w-3 h-3" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      {/* z-[70]: sheets sit at z-[60] — the default z-50 would render beneath them */}
      <TooltipContent side="top" sideOffset={6} className="z-[70] max-w-60 text-left leading-relaxed">
        {children}
      </TooltipContent>
    </Tooltip>
  );
}
