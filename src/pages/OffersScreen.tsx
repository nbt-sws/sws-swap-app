import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useOffers, useRespondOffer } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Check, X, Clock, ChevronRight, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Offer } from '@/types';

const statusConfig: Record<Offer['status'], { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'text-warning bg-warning/10' },
  ACCEPTED: { label: 'Accepted', color: 'text-plup bg-plup/10' },
  DECLINED: { label: 'Declined', color: 'text-pldown bg-pldown/10' },
  COUNTERED: { label: 'Countered', color: 'text-cyan bg-cyan/10' },
};

export function OffersScreen() {
  const { t } = useTranslation();
  const { data: offers, isLoading } = useOffers();
  const [tab, setTab] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const respond = useRespondOffer();

  const filtered = offers?.filter((offer) => {
    if (tab === 'incoming') return offer.direction === 'INCOMING';
    if (tab === 'outgoing') return offer.direction === 'OUTGOING';
    return true;
  });

  return (
    <PageContainer className="py-6">
      <PageHeader
        title={t('offers.title')}
        icon={<ArrowRightLeft className="w-6 h-6 text-brand" />}
        description={t('offers.description')}
      />

      <div className="space-y-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="bg-surface-light border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-brand data-[state=active]:text-white">All</TabsTrigger>
            <TabsTrigger value="incoming" className="data-[state=active]:bg-brand data-[state=active]:text-white">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing" className="data-[state=active]:bg-brand data-[state=active]:text-white">Outgoing</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {!isLoading && (!filtered || filtered.length === 0) && (
          <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
            <EmptyMedia variant="icon">
              <Handshake className="w-10 h-10 text-brand" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('offers.empty')}</EmptyTitle>
              <EmptyDescription>{t('offers.emptyDesc')}</EmptyDescription>
            </EmptyHeader>
            <Button asChild className="bg-brand hover:bg-brand-light">
              <Link to="/market">Browse market</Link>
            </Button>
          </Empty>
        )}

        <div className="space-y-4">
          {filtered?.map((offer) => {
            const config = statusConfig[offer.status];
            const isIncoming = offer.direction === 'INCOMING';
            return (
              <Card key={offer.id} className="bg-surface-light border-border">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={cn(
                      'w-14 h-18 rounded-lg flex items-center justify-center text-xl shrink-0',
                      config.color
                    )}>
                      {isIncoming ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-mono text-muted-foreground">{offer.id.slice(0, 8)}</p>
                        <Badge className={cn('text-xs', config.color)}>
                          {offer.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                          {config.label}
                        </Badge>
                      </div>
                      <p className="font-semibold truncate">{offer.listing.card.nameEn}</p>
                      {offer.tradeCards && offer.tradeCards.length > 0 ? (
                        <div className="mt-1">
                          <p className="text-xs text-cyan mb-1">Trade offer:</p>
                          <div className="flex flex-wrap gap-2">
                            {offer.tradeCards.map((card) => (
                              <Badge key={card.code} variant="outline" className="text-xs">
                                {card.nameEn} ({card.condition})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>Listed: ฿{offer.listing.price.toLocaleString()}</span>
                          <ChevronRight className="w-3 h-3" />
                          <span className="font-medium text-foreground">Offer: ฿{offer.offerPrice.toLocaleString()}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {isIncoming ? `From @${offer.fromUser.name}` : `To @${offer.toUser.name}`}
                      </p>
                    </div>

                    {isIncoming && offer.status === 'PENDING' && (
                      <div className="flex sm:flex-col gap-2">
                        <Button
                          size="sm"
                          className="bg-plup hover:bg-plup/90"
                          onClick={() => respond.mutate({ offerId: offer.id, action: 'accept' })}
                          disabled={respond.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border"
                          onClick={() => respond.mutate({ offerId: offer.id, action: 'decline' })}
                          disabled={respond.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}

                    {!isIncoming && offer.status === 'PENDING' && (
                      <Button size="sm" variant="outline" className="border-border" disabled>
                        Awaiting response
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
