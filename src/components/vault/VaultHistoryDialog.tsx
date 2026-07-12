import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserAuditHistory } from '@/hooks/useApi';
import { Clock, Package } from 'lucide-react';
import type { AuditRecord } from '@/services/mockApi';

interface VaultHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export function VaultHistoryDialog({ open, onClose, userId }: VaultHistoryDialogProps) {
  const { t } = useTranslation();
  const { data: history, isLoading } = useUserAuditHistory(userId);

  const getEventLabel = (eventType: string) =>
    t(`vault.eventLabels.${eventType}` as const, { defaultValue: eventType });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-surface-light border-border max-w-lg max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand" />
            {t('vault.history.title')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-5 py-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4">
                  <Skeleton className="h-2 w-2 rounded-full mt-1.5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((record) => (
                <AuditRecordCard key={record.id} record={record} getEventLabel={getEventLabel} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">{t('vault.history.empty')}</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function AuditRecordCard({ record, getEventLabel }: { record: AuditRecord; getEventLabel: (type: string) => string }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="mt-1.5 h-2 w-2 rounded-full bg-brand shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm">{getEventLabel(record.eventType)}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {record.occurredAt ? new Date(record.occurredAt).toLocaleString() : '-'}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          by {record.actorId?.slice(0, 12) || 'system'}…
        </p>
        {record.previousState != null && record.newState != null && (
          <div className="mt-2 rounded-lg bg-surface-light p-2 text-xs font-mono break-all">
            {JSON.stringify(record.previousState)} → {JSON.stringify(record.newState)}
          </div>
        )}
      </div>
    </div>
  );
}
