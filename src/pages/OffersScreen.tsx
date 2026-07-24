import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useOffers, useRespondOffer, useCounterOffer, useWithdrawOffer } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Check, X, Clock, ChevronRight, Handshake, Undo2 } from 'lucide-react';
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
  const counter = useCounterOffer();
  const withdraw = useWithdrawOffer();

  // [P1-2] Counter dialog state (incoming PENDING offers)
  const [counterTarget, setCounterTarget] = useState<Offer | null>(null);
  const [counterPrice, setCounterPrice] = useState('');

  const openCounter = (offer: Offer) => {
    setCounterTarget(offer);
    setCounterPrice(String(offer.offerPrice));
  };

  const counterPriceNum = Number(counterPrice);
  const counterValid = counterPrice !== '' && Number.isFinite(counterPriceNum) && counterPriceNum > 0;

  const submitCounter = () => {
    if (!counterTarget || !counterValid) return;
    counter.mutate(
      { offerId: counterTarget.id, offerPrice: Math.max(0, Math.round(counterPriceNum)) },
      {
        onSettled: () => {
          setCounterTarget(null);
          setCounterPrice('');
        },
      }
    );
  };

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
                          onClick={() => openCounter(offer)}
                          disabled={respond.isPending || counter.isPending}
                        >
                          <ArrowRightLeft className="w-4 h-4 mr-1" />
                          Counter
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border text-pldown hover:text-pldown"
                            disabled={withdraw.isPending}
                          >
                            <Undo2 className="w-4 h-4 mr-1" />
                            Withdraw
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-surface-light border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Withdraw this offer?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Your offer of ฿{offer.offerPrice.toLocaleString()} on &quot;{offer.listing.card.nameEn}&quot; will be withdrawn. This can&apos;t be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border">Keep offer</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-pldown hover:bg-pldown/90 text-white"
                              onClick={() => withdraw.mutate(offer.id)}
                            >
                              Withdraw offer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Counter offer dialog */}
      <Dialog open={!!counterTarget} onOpenChange={(v) => !v && setCounterTarget(null)}>
        <DialogContent className="bg-surface-light border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Counter offer</DialogTitle>
            <DialogDescription>
              {counterTarget
                ? `Send a counter offer to @${counterTarget.fromUser.name} for "${counterTarget.listing.card.nameEn}". Their offer: ฿${counterTarget.offerPrice.toLocaleString()} · Listed: ฿${counterTarget.listing.price.toLocaleString()}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="counter-price">Counter price (฿)</Label>
            <Input
              id="counter-price"
              type="number"
              min={1}
              value={counterPrice}
              onChange={(e) => setCounterPrice(e.target.value)}
              className="bg-surface border-border"
              autoFocus
            />
            {!counterValid && counterPrice !== '' && (
              <p className="text-xs text-pldown">Price must be greater than 0</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-border" onClick={() => setCounterTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand hover:bg-brand-light"
              onClick={submitCounter}
              disabled={!counterValid || counter.isPending}
            >
              Send counter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
