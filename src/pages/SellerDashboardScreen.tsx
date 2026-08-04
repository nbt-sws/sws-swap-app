import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useMyListings, useUpdateListingStatus, useDeleteListing } from '@/hooks/useApi';
import { useAuthStore } from '@/stores/auth';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import {
  Plus,
  Eye,
  Heart,
  Tag,
  Pause,
  Play,
  CheckCircle,
  Trash2,
  ArrowRightLeft,
  TrendingUp,
  Package,
  Award,
  Megaphone,
  Store,
} from 'lucide-react';
import { cn, getCardImageUrl } from '@/lib/utils';
import type { MarketListing } from '@/types';

const statusConfig: Record<NonNullable<MarketListing['status']>, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-plup bg-plup/10' },
  paused: { label: 'Paused', color: 'text-warning bg-warning/10' },
  sold: { label: 'Sold', color: 'text-cyan bg-cyan/10' },
};

export function SellerDashboardScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: listings, isLoading } = useMyListings();
  const updateStatus = useUpdateListingStatus();
  const deleteListing = useDeleteListing();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'paused' | 'sold'>('active');

  const filtered = listings?.filter((l) => (activeTab === 'all' ? true : l.status === activeTab)) ?? [];
  const activeCount = listings?.filter((l) => l.status === 'active').length ?? 0;
  const totalViews = listings?.reduce((sum, l) => sum + (l.views ?? 0), 0) ?? 0;
  const totalWatchers = listings?.reduce((sum, l) => sum + (l.watchers ?? 0), 0) ?? 0;
  const tradeCount = listings?.filter((l) => l.listingType === 'TRADE').length ?? 0;

  const handleStatus = (id: string, status: 'active' | 'paused' | 'sold') => {
    updateStatus.mutate({ listingId: id, status });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this listing?')) deleteListing.mutate(id);
  };

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Seller Dashboard"
        icon={<Store className="text-brand" />}
        description="Your listings and stats"
        action={
          <Button asChild className="bg-brand hover:bg-brand-light font-bold shadow-glow">
            <Link to="/seller/new">
              <Plus className="w-4 h-4 mr-2" />
              New listing
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="neon-card bg-surface-light border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-plup/10 text-plup">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold mono-num">{activeCount}</p>
                <p className="ticket-label mt-0.5">Active listings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="neon-card bg-surface-light border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10 text-brand">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold mono-num">{totalViews.toLocaleString()}</p>
                <p className="ticket-label mt-0.5">Total views</p>
              </div>
            </CardContent>
          </Card>
          <Card className="neon-card bg-surface-light border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-periwinkle/10 text-periwinkle">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold mono-num">{totalWatchers}</p>
                <p className="ticket-label mt-0.5">Watchers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="neon-card bg-surface-light border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan/10 text-cyan">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold mono-num">{tradeCount}</p>
                <p className="ticket-label mt-0.5">Trade listings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/seller/orders">
              <Award className="w-4 h-4" />
              Service orders
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="bg-surface-light border border-border">
            {[
              { key: 'active', label: 'Active' },
              { key: 'paused', label: 'Paused' },
              { key: 'sold', label: 'Sold' },
              { key: 'all', label: 'All' },
            ].map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="data-[state=active]:bg-brand data-[state=active]:text-white"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Listings */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        )}

        {/* First-run seller onboarding — shown only when the shop has zero listings */}
        {!isLoading && (listings?.length ?? 0) === 0 && (
          <Card className="relative overflow-hidden border-border/60 bg-surface-light/60">
            <div className="surreal-mesh absolute inset-0 pointer-events-none" />
            <CardContent className="relative p-5 sm:p-7 space-y-5">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight neon-text-brand">
                  {t('sellerOnboarding.title')}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{t('sellerOnboarding.subtitle')}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Tag, title: t('sellerOnboarding.step1Title'), desc: t('sellerOnboarding.step1Desc'), cta: t('sellerOnboarding.step1Cta'), to: '/seller/new' },
                  { icon: Megaphone, title: t('sellerOnboarding.step2Title'), desc: t('sellerOnboarding.step2Desc'), cta: t('sellerOnboarding.step2Cta'), to: '/feed' },
                  { icon: Store, title: t('sellerOnboarding.step3Title'), desc: t('sellerOnboarding.step3Desc'), cta: t('sellerOnboarding.step3Cta'), to: `/seller/${user?.id ?? ''}` },
                ].map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex flex-col rounded-2xl border border-border/60 bg-surface/70 p-4">
                      <div className="flex items-center gap-2">
                        <span className="pxl-num text-xs text-brand">{`0${i + 1}`}</span>
                        <Icon className="w-4 h-4 text-brand" />
                      </div>
                      <p className="mt-2.5 text-sm font-bold">{step.title}</p>
                      <p className="mt-1 flex-1 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                      <Button asChild size="sm" className="mt-3 bg-brand hover:bg-brand-light h-8 text-xs">
                        {step.to.startsWith('/seller/') && i === 2 ? (
                          <Link to="/seller/$sellerId" params={{ sellerId: user?.id ?? '' }}>{step.cta}</Link>
                        ) : (
                          <Link to={step.to}>{step.cta}</Link>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && (listings?.length ?? 0) > 0 && filtered.length === 0 && (
          <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-12">
            <EmptyMedia variant="icon">
              <Package className="w-8 h-8 text-brand" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No listings here yet</EmptyTitle>
              <EmptyDescription>Create your first listing to start selling.</EmptyDescription>
            </EmptyHeader>
            <Button asChild className="bg-brand hover:bg-brand-light">
              <Link to="/seller/new">Create your first listing</Link>
            </Button>
          </Empty>
        )}

        <div className="space-y-4">
          {filtered.map((listing) => {
            const status = listing.status ?? 'active';
            const config = statusConfig[status];
            return (
              <Card key={listing.id} className="neon-card bg-surface-light border-border hover:bg-surface-lighter transition">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/market/$listingId"
                      params={{ listingId: listing.id }}
                      className={cn(
                        'w-full sm:w-24 h-32 sm:h-28 rounded-lg overflow-hidden shrink-0',
                        listing.card.game === 'one-piece' ? 'bg-brand/10' : 'bg-periwinkle/10'
                      )}
                    >
                      <img
                        src={getCardImageUrl(listing.card)}
                        alt={listing.card.nameEn}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-xs mono-num text-muted-foreground">{listing.card.code}</p>
                        <Badge className={cn('text-xs', config.color)}>{config.label}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {listing.listingType === 'TRADE' ? 'TRADE' : 'SALE'}
                        </Badge>
                      </div>
                      <Link
                        to="/market/$listingId"
                        params={{ listingId: listing.id }}
                        className="font-semibold hover:text-brand transition line-clamp-1"
                      >
                        {listing.card.nameEn}
                      </Link>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{listing.card.rarity}</span>
                        <span>·</span>
                        <span>{listing.card.condition}</span>
                        <span>·</span>
                        <span>{listing.shelf}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {listing.views ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {listing.watchers ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {listing.vaultVerified ? 'Vault verified' : 'Not verified'}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-3 min-w-[140px]">
                      <p className="text-xl font-bold mono-num">
                        {listing.listingType === 'TRADE' ? (
                          <span className="text-cyan neon-text-cyan">Trade</span>
                        ) : (
                          `฿${listing.price.toLocaleString()}`
                        )}
                      </p>
                      <div className="flex flex-wrap sm:flex-col gap-2">
                        {status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border"
                            onClick={() => handleStatus(listing.id, 'paused')}
                            disabled={updateStatus.isPending}
                          >
                            <Pause className="w-3 h-3 mr-1" />
                            Pause
                          </Button>
                        )}
                        {status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border"
                            onClick={() => handleStatus(listing.id, 'active')}
                            disabled={updateStatus.isPending}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Resume
                          </Button>
                        )}
                        {status !== 'sold' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border"
                            onClick={() => handleStatus(listing.id, 'sold')}
                            disabled={updateStatus.isPending}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Sold
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-pldown hover:text-pldown hover:bg-pldown/10"
                          onClick={() => handleDelete(listing.id)}
                          disabled={deleteListing.isPending}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
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
