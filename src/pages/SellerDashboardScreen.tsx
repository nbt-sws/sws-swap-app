import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useMyListings, useUpdateListingStatus, useDeleteListing } from '@/hooks/useApi';
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
} from 'lucide-react';
import { cn, getCardImageUrl } from '@/lib/utils';
import type { MarketListing } from '@/types';

const statusConfig: Record<NonNullable<MarketListing['status']>, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-plup bg-plup/10' },
  paused: { label: 'Paused', color: 'text-warning bg-warning/10' },
  sold: { label: 'Sold', color: 'text-cyan bg-cyan/10' },
};

export function SellerDashboardScreen() {
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
        description="Manage your listings and track performance"
        action={
          <Button asChild className="bg-brand hover:bg-brand-light">
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
          <Card className="bg-surface-light border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-plup/10 text-plup">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active listings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-surface-light border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand/10 text-brand">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total views</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-surface-light border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-periwinkle/10 text-periwinkle">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalWatchers}</p>
                <p className="text-xs text-muted-foreground">Watchers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-surface-light border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan/10 text-cyan">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tradeCount}</p>
                <p className="text-xs text-muted-foreground">Trade listings</p>
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

        {!isLoading && filtered.length === 0 && (
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
              <Card key={listing.id} className="bg-surface-light border-border hover:border-brand/30 hover:bg-surface-lighter transition">
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
                        <p className="text-xs font-mono text-muted-foreground">{listing.card.code}</p>
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
                      <p className="text-xl font-bold font-mono">
                        {listing.listingType === 'TRADE' ? (
                          <span className="text-cyan">Trade</span>
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
