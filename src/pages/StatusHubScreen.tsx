import { useState } from 'react';
import { useSubmissions, useApproveSubmissionConsent } from '@/hooks/useApi';
import { motion } from 'framer-motion';
import { ScrollablePage } from '@/components/layout/ScrollablePage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Check, Clock, Truck, Package, QrCode, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const FILTERS = ['All', 'Pre-grade', 'Grading'];

const STATUS_CONFIG: Record<string, { icon: typeof Check; color: string; label: string }> = {
  ready: { icon: Check, color: 'text-plup', label: 'READY' },
  'in-lab': { icon: Clock, color: 'text-cyan', label: 'IN LAB' },
  grading: { icon: Clock, color: 'text-pregrade', label: 'GRADING' },
  qa: { icon: Package, color: 'text-periwinkle', label: 'QA' },
  shipped: { icon: Truck, color: 'text-brand', label: 'SHIPPED' },
  delivered: { icon: Check, color: 'text-plup', label: 'DELIVERED ✓' },
};

export function StatusHubScreen() {
  const { data: submissions } = useSubmissions();
  const approveConsent = useApproveSubmissionConsent();
  const [activeFilter, setActiveFilter] = useState('All');
  const [consentId, setConsentId] = useState<string | null>(null);
  const [qrSub, setQrSub] = useState<typeof filtered[0] | null>(null);

  const filtered = (submissions || []).filter((s) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Pre-grade') return s.service === 'RAWLITY' || s.service === 'BLACKLENS';
    if (activeFilter === 'Grading') return s.service === 'PSA' || s.service === 'BGS' || s.service === 'CGC' || s.service === 'TAG';
    return true;
  });

  const handleApproveConsent = () => {
    if (!consentId) return;
    approveConsent.mutate(consentId, {
      onSuccess: () => setConsentId(null),
    });
  };

  return (
    <ScrollablePage
      header={
        <PageHeader
          title="Submissions"
          description="grading & pre-grading status · live from lab + grader APIs"
          back={{ to: '/services' }}
        />
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-brand text-white'
                    : 'bg-surface-light text-muted-foreground hover:text-white'
                }`}
              >
                {f} · {f === 'All' ? (submissions?.length || 0) : submissions?.filter(s => {
                  if (f === 'Pre-grade') return s.service === 'RAWLITY' || s.service === 'BLACKLENS';
                  if (f === 'Grading') return s.service === 'PSA' || s.service === 'BGS' || s.service === 'CGC' || s.service === 'TAG';
                  return true;
                }).length || 0}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions */}
        <div className="space-y-4">
          {filtered.map((sub, i) => {
            const statusConfig = STATUS_CONFIG[sub.status] || STATUS_CONFIG['in-lab'];

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-light rounded-xl p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        sub.service === 'RAWLITY' ? 'bg-brand/10 text-brand' :
                        sub.service === 'BLACKLENS' ? 'bg-periwinkle/10 text-periwinkle' :
                        sub.service === 'PSA' ? 'bg-cyan/10 text-cyan' :
                        sub.service === 'BGS' ? 'bg-warning/10 text-warning' :
                        sub.service === 'TAG' ? 'bg-success/10 text-success' :
                        sub.service === 'OTHER' ? 'bg-muted/10 text-muted-foreground' :
                        'bg-pregrade/10 text-pregrade'
                      }`}>
                        {sub.service}
                      </span>
                      <span className={`text-xs font-mono ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <h3 className="font-semibold">{sub.cardName}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {sub.cardCode} · {sub.orderNumber}
                    </p>
                  </div>
                </div>

                {/* Stages timeline */}
                <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide">
                  {sub.stages.map((stage, si) => (
                    <div key={stage.name} className="flex items-center flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        stage.completed ? 'bg-plup/20' : 'bg-surface-lighter'
                      }`}>
                        {stage.completed ? (
                          <Check className="w-3 h-3 text-plup" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        )}
                      </div>
                      <div className="ml-1 mr-2">
                        <p className={`text-xs font-mono whitespace-nowrap ${
                          stage.completed ? 'text-white' : 'text-muted-foreground'
                        }`}>
                          {stage.name}
                        </p>
                      </div>
                      {si < sub.stages.length - 1 && (
                        <div className={`w-4 h-px flex-shrink-0 ${
                          stage.completed ? 'bg-plup/30' : 'bg-border'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {sub.consentRequired && (
                  <button
                    onClick={() => setConsentId(sub.id)}
                    className="w-full py-2.5 rounded-xl bg-brand/10 text-brand text-xs font-medium mb-2 hover:bg-brand/20 transition-colors flex items-center justify-center gap-2"
                  >
                    Forward to PSA <ArrowRight className="w-3 h-3" /> (consent)
                  </button>
                )}

                {sub.status === 'ready' && (
                  <button
                    onClick={() => setQrSub(sub)}
                    className="w-full py-2.5 rounded-xl bg-cyan/10 text-cyan text-xs font-medium hover:bg-cyan/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-3 h-3" />
                    View report (QR)
                  </button>
                )}

                {/* ETA */}
                {sub.estimatedDays && (
                  <p className="text-xs text-muted-foreground mt-2">
                    est. {sub.estimatedDays} days · updated 2h ago via {sub.service} API
                  </p>
                )}

                {/* Delivery info */}
                {sub.status === 'delivered' && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-plup text-xs">✓</span>
                    <span className="text-xs text-plup">{sub.service} #{sub.labOrderNumber} · slab delivered</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Update channels */}
        <div>
          <div className="bg-surface-light rounded-xl p-4">
            <p className="text-xs font-mono tracking-wider text-muted-foreground mb-3">
              UPDATES VIA
            </p>
            <div className="flex gap-4">
              {[
                { name: 'LINE', active: true },
                { name: 'Push', active: true },
                { name: 'Email', active: true },
                { name: 'SMS', active: false },
              ].map((ch) => (
                <div key={ch.name} className="flex items-center gap-1.5">
                  <span className={ch.active ? 'text-cyan text-xs' : 'text-muted-foreground text-xs'}>
                    {ch.active ? '✓' : '—'}
                  </span>
                  <span className={`text-xs ${ch.active ? 'text-white' : 'text-muted-foreground'}`}>
                    {ch.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Consent dialog */}
      <Dialog open={!!consentId} onOpenChange={(open) => !open && setConsentId(null)}>
        <DialogContent className="bg-surface-light border-border">
          <DialogHeader>
            <DialogTitle>Forward to PSA?</DialogTitle>
            <DialogDescription>
              This confirms you want to send this card from RAWLITY pre-grade to PSA for official grading. Shipping and grading fees will apply.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-border" onClick={() => setConsentId(null)}>Cancel</Button>
            <Button
              className="bg-brand hover:bg-brand-light"
              onClick={handleApproveConsent}
              disabled={approveConsent.isPending}
            >
              {approveConsent.isPending ? 'Confirming…' : 'Yes, forward'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR dialog */}
      <Dialog open={!!qrSub} onOpenChange={(open) => !open && setQrSub(null)}>
        <DialogContent className="bg-surface-light border-border">
          <DialogHeader>
            <DialogTitle>Report QR</DialogTitle>
            <DialogDescription>
              Scan to open the official {qrSub?.service} report for {qrSub?.cardName}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="w-48 h-48 bg-white rounded-xl p-3 flex items-center justify-center">
              <QrCode className="w-32 h-32 text-surface-dark" />
            </div>
            <p className="text-xs text-muted-foreground mt-3 font-mono">{qrSub?.orderNumber}</p>
          </div>
          <DialogFooter>
            <Button className="w-full bg-brand hover:bg-brand-light" onClick={() => setQrSub(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollablePage>
  );
}
