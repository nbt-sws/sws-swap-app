import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmissions, useApproveSubmissionConsent } from '@/hooks/useApi';
import { motion } from 'framer-motion';
import { ScrollablePage } from '@/components/layout/ScrollablePage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Check, Clock, Truck, Package, ArrowRight, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const STATUS_CONFIG: Record<string, { icon: typeof Check; color: string }> = {
  ready: { icon: Check, color: 'text-plup' },
  'in-lab': { icon: Clock, color: 'text-cyan' },
  grading: { icon: Clock, color: 'text-pregrade' },
  qa: { icon: Package, color: 'text-periwinkle' },
  shipped: { icon: Truck, color: 'text-brand' },
  delivered: { icon: Check, color: 'text-plup' },
};

// Official cert/report lookup pages per grading service. PSA supports deep
// links by cert number; the others land on their public verification pages.
const REPORT_URLS: Record<string, string> = {
  PSA: 'https://www.psacard.com/cert',
  BGS: 'https://www.beckett.com/grading/card-lookup',
  CGC: 'https://www.cgccards.com/cert-lookup/',
  TAG: 'https://www.taggrading.com',
};

function reportUrlFor(sub: { service: string; labOrderNumber?: string }): string | null {
  if (sub.service === 'PSA' && sub.labOrderNumber) {
    return `https://www.psacard.com/cert/${encodeURIComponent(sub.labOrderNumber)}`;
  }
  return REPORT_URLS[sub.service] ?? null;
}

const FILTER_KEYS = ['all', 'pregrade', 'grading'] as const;

export function StatusHubScreen() {
  const { t } = useTranslation();
  const { data: submissions, isLoading } = useSubmissions();
  const approveConsent = useApproveSubmissionConsent();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTER_KEYS)[number]>('all');
  const [consentId, setConsentId] = useState<string | null>(null);
  const [qrSub, setQrSub] = useState<typeof filtered[0] | null>(null);

  const filtered = (submissions || []).filter((s) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pregrade') return s.service === 'RAWLITY' || s.service === 'BLACKLENS';
    if (activeFilter === 'grading') return s.service === 'PSA' || s.service === 'BGS' || s.service === 'CGC' || s.service === 'TAG';
    return true;
  });

  const countFor = (f: (typeof FILTER_KEYS)[number]) => {
    if (f === 'all') return submissions?.length || 0;
    return submissions?.filter((s) => {
      if (f === 'pregrade') return s.service === 'RAWLITY' || s.service === 'BLACKLENS';
      return s.service === 'PSA' || s.service === 'BGS' || s.service === 'CGC' || s.service === 'TAG';
    }).length || 0;
  };

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
          title={t('statusHub.title')}
          description={t('statusHub.description')}
          back={{ to: '/services' }}
        />
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <div>
          <div className="flex gap-2">
            {FILTER_KEYS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-brand text-white shadow-glow'
                    : 'bg-surface-light text-muted-foreground hover:text-white border border-border/60'
                }`}
              >
                {t(`statusHub.filters.${f}`)} · {countFor(f)}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions */}
        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-surface-light rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
            <EmptyMedia variant="icon">
              <Package className="w-8 h-8 text-brand" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('statusHub.emptyTitle')}</EmptyTitle>
              <EmptyDescription>
                {activeFilter === 'all'
                  ? t('statusHub.emptyDesc')
                  : t('statusHub.emptyFiltered', { filter: t(`statusHub.filters.${activeFilter}`).toLowerCase() })}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
        <div className="space-y-4">
          {filtered.map((sub, i) => {
            const statusConfig = STATUS_CONFIG[sub.status] || STATUS_CONFIG['in-lab'];

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="neon-card bg-surface-light rounded-xl p-4 border border-border/60"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`pxl-chip ${
                        sub.service === 'RAWLITY' ? 'pxl-chip--brand' :
                        sub.service === 'BLACKLENS' ? 'pxl-chip--peri' :
                        sub.service === 'PSA' ? 'pxl-chip--cyan' :
                        sub.service === 'BGS' ? 'border-warning/50 text-warning bg-warning/10' :
                        sub.service === 'TAG' ? 'pxl-chip--cyan' :
                        sub.service === 'OTHER' ? '' :
                        'pxl-chip--peri'
                      }`}>
                        {sub.service}
                      </span>
                      <span className={`text-xs font-mono ${statusConfig.color}`}>
                        {t(`statusHub.status.${sub.status}`, { defaultValue: t('statusHub.status.in-lab') })}
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
                    {t('statusHub.forwardCta')} <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {sub.status === 'ready' && (
                  <button
                    onClick={() => {
                      const url = reportUrlFor(sub);
                      if (url) {
                        window.open(url, '_blank', 'noopener,noreferrer');
                      } else {
                        setQrSub(sub);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-cyan/10 text-cyan text-xs font-medium hover:bg-cyan/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {t('statusHub.viewReport')}
                  </button>
                )}

                {/* ETA */}
                {sub.estimatedDays && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('statusHub.eta', { days: sub.estimatedDays, service: sub.service })}
                  </p>
                )}

                {/* Delivery info */}
                {sub.status === 'delivered' && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-plup text-xs">✓</span>
                    <span className="text-xs text-plup">{t('statusHub.deliveredLabel', { service: sub.service, num: sub.labOrderNumber })}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        )}

        {/* Update channels */}
        <div>
          <div className="bg-surface-light rounded-xl p-4 border border-border/60">
            <p className="ticket-label mb-3">
              {t('statusHub.updatesVia')}
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
            <DialogTitle>{t('statusHub.consentTitle')}</DialogTitle>
            <DialogDescription>
              {t('statusHub.consentDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-border" onClick={() => setConsentId(null)}>{t('statusHub.cancel')}</Button>
            <Button
              className="bg-brand hover:bg-brand-light"
              onClick={handleApproveConsent}
              disabled={approveConsent.isPending}
            >
              {approveConsent.isPending ? t('statusHub.confirming') : t('statusHub.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report fallback dialog — shown only for services without an online report page */}
      <Dialog open={!!qrSub} onOpenChange={(open) => !open && setQrSub(null)}>
        <DialogContent className="bg-surface-light border-border">
          <DialogHeader>
            <DialogTitle>{t('statusHub.reportTitle')}</DialogTitle>
            <DialogDescription>
              {t('statusHub.reportDesc', { service: qrSub?.service, num: qrSub?.orderNumber })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <p className="text-sm text-muted-foreground text-center">
              {t('statusHub.reportBody', { card: qrSub?.cardName })}
            </p>
            <p className="text-xs text-muted-foreground mt-3 font-mono">{qrSub?.orderNumber}</p>
          </div>
          <DialogFooter>
            <Button className="w-full bg-brand hover:bg-brand-light" onClick={() => setQrSub(null)}>{t('statusHub.close')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollablePage>
  );
}
