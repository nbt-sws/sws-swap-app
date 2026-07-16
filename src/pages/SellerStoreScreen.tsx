import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from '@tanstack/react-router';
import {
  useMarketListings,
  useFollowedSellers,
  useFollowSeller,
  useUnfollowSeller,
  useStoreProfile,
  useStoreGroups,
  useStoreReviews,
} from '@/hooks/useApi';
import { useServiceProviders } from '@/hooks/useServices';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star, Package, Heart, MapPin, Store, FolderOpen, Search, ShieldCheck, SlidersHorizontal,
  Award, ArrowLeft, Calendar, Link as LinkIcon, ExternalLink, Clock, Sparkles,
} from 'lucide-react';
import { cn, getCardImageUrl } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import type { MarketListing, ServiceProvider } from '@/types';

const SOCIAL_ICONS: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  facebook: FacebookIcon,
  website: ExternalLink,
};

export function SellerStoreScreen() {
  const { t } = useTranslation();
  const { sellerId } = useParams({ from: '/seller/$sellerId' });
  const { user } = useAuthStore();
  const { data: listings, isLoading: listingsLoading } = useMarketListings();
  const { data: profile, isLoading: profileLoading } = useStoreProfile(sellerId);
  const { data: groups } = useStoreGroups(sellerId);
  const { data: followedIds } = useFollowedSellers();
  const follow = useFollowSeller();
  const unfollow = useUnfollowSeller();
  const [justFollowed, setJustFollowed] = useState(false);

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sale' | 'trade'>('all');
  const [sort, setSort] = useState<'featured' | 'price-low' | 'price-high'>('featured');

  const isOwner = user?.id === sellerId;

  const activeListings = useMemo(
    () => listings?.filter((l) => l.seller?.id === sellerId && (l.status === 'active' || l.status === 'paused')) || [],
    [listings, sellerId]
  );

  const filteredListings = useMemo(() => {
    const q = query.trim().toLowerCase();
    let next = activeListings.filter((l) => {
      const matchesQuery = !q || l.card.nameEn.toLowerCase().includes(q) || l.card.code.toLowerCase().includes(q);
      const matchesType = typeFilter === 'all' || (typeFilter === 'sale' ? l.listingType === 'SALE' : l.listingType === 'TRADE');
      return matchesQuery && matchesType;
    });
    next = [...next].sort((a, b) => {
      if (sort === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sort === 'price-high') return (b.price || 0) - (a.price || 0);
      return 0;
    });
    return next;
  }, [activeListings, query, typeFilter, sort]);

  const listingSeller = activeListings[0]?.seller;
  const storeSeller = useMemo(() => {
    if (listingSeller) return listingSeller;
    if (!profile) return undefined;
    return {
      id: profile.userId,
      name: profile.displayName || profile.name,
      rating: profile.rating,
    };
  }, [listingSeller, profile]);

  const displayName = profile?.displayName || profile?.name || storeSeller?.name || sellerId;
  const handle = `@${displayName}`;
  const isFollowing = followedIds?.includes(sellerId) || justFollowed;

  const seed = hashStringToInt(sellerId);
  const sales = profile?.sales ?? seed % 50;
  const followers = profile?.followers ?? (seed * 7) % 200;
  const rating = profile?.rating ?? storeSeller?.rating ?? 0;
  const memberSince = useMemo(() => {
    const d = profile?.createdAt ? new Date(profile.createdAt) : new Date('2024-01-01');
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }, [profile]);

  const { data: providers } = useServiceProviders();
  const storeProviders = providers?.filter((p) => p.storeId === sellerId && p.enabled) ?? [];

  const { data: reviews } = useStoreReviews(sellerId);
  const featuredListings = activeListings.filter((l) => l.isFeatured).slice(0, 6);
  const reviewCount = reviews?.length ?? 0;
  const averageReview = reviewCount > 0
    ? reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : rating;

  const [userTab, setUserTab] = useState<'listings' | 'services' | 'reviews' | 'about' | null>(null);
  const tabValue = userTab ?? (storeProviders.length > 0 ? 'services' : 'listings');

  if (listingsLoading || profileLoading) {
    return (
      <PageContainer className="py-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="flex justify-center -mt-12 mb-6">
          <Skeleton className="w-24 h-24 rounded-xl border-4 border-surface-light" />
        </div>
        <Skeleton className="h-8 w-1/2 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/3 mx-auto mb-6" />
      </PageContainer>
    );
  }

  if (!storeSeller) {
    return (
      <PageContainer className="py-6">
        <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
          <EmptyMedia variant="icon">
            <Store className="w-8 h-8 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Store not found</EmptyTitle>
            <EmptyDescription>This seller does not exist or has no active listings.</EmptyDescription>
          </EmptyHeader>
          <Button asChild className="bg-brand hover:bg-brand-light">
            <Link to="/stores">Browse stores</Link>
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  const toggleFollow = () => {
    if (isFollowing) {
      unfollow.mutate(sellerId);
      setJustFollowed(false);
    } else {
      follow.mutate(sellerId);
      setJustFollowed(true);
    }
  };

  return (
    <PageContainer className="py-6">
      {/* Hero */}
      <div className="relative mb-8">
        <div
          className={cn(
            'h-48 sm:h-64 rounded-xl bg-cover bg-center relative overflow-hidden',
            !profile?.bannerUrl && 'bg-gradient-to-br from-surface-lighter via-surface-light to-surface-dark'
          )}
          style={profile?.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})` } : undefined}
        >
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t',
            profile?.bannerUrl ? 'from-black/60 via-black/20 to-transparent' : 'from-surface-dark/60 via-surface-dark/20 to-transparent'
          )} />
          <Link
            to="/stores"
            className="absolute top-4 left-4 z-10 inline-flex items-center gap-1 rounded-lg bg-black/30 px-2.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-black/40 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('nav.stores')}
          </Link>
        </div>

        <div className="flex flex-col items-center -mt-16 px-4 text-center">
          <Avatar className="w-32 h-32 rounded-xl border-4 border-surface-light shadow-xl bg-surface-lighter">
            <AvatarImage src={profile?.avatarUrl} alt={displayName} className="object-cover" />
            <AvatarFallback className="rounded-xl text-3xl font-bold bg-surface-lighter text-foreground">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="mt-3">
            <h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
            <p className="text-sm text-muted-foreground">{handle}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="w-4 h-4 text-pregrade fill-pregrade" />
              <span className="font-medium text-foreground">{averageReview.toFixed(1)}</span>
              {reviewCount > 0 ? `(${reviewCount} reviews)` : 'rating'}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {profile?.location || 'Bangkok, Thailand'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Since {memberSince}
            </span>
          </div>

          {profile?.bio && (
            <p className="mt-3 text-sm text-text-secondary max-w-xl line-clamp-3">
              {profile.bio}
            </p>
          )}

          <div className="flex items-center gap-2 mt-4">
            {isOwner ? (
              <Button variant="secondary" className="bg-surface-light border border-border hover:bg-surface-lighter" asChild>
                <Link to="/vault">Edit store</Link>
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                className={cn(
                  'min-w-[120px]',
                  isFollowing ? 'border-border' : 'bg-brand hover:bg-brand-light'
                )}
                onClick={toggleFollow}
                disabled={follow.isPending || unfollow.isPending}
              >
                <Heart className={cn('w-4 h-4 mr-2', isFollowing && 'fill-current')} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
            <Button variant="secondary" className="bg-surface-light border border-border hover:bg-surface-lighter" asChild>
              <Link to="/market">Browse market</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard value={activeListings.length} label="Listings" icon={<Package className="w-4 h-4 text-brand" />} />
        <StatCard value={sales} label="Sales" icon={<Star className="w-4 h-4 text-pregrade" />} />
        <StatCard value={followers} label="Followers" icon={<Heart className="w-4 h-4 text-periwinkle" />} />
        <StatCard value={averageReview.toFixed(1)} label={reviewCount > 0 ? 'Avg. review' : 'Rating'} icon={<ShieldCheck className="w-4 h-4 text-cyan" />} />
      </div>

      {/* Highlights */}
      {featuredListings.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-semibold">Featured</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {featuredListings.map((listing) => (
              <Link
                key={listing.id}
                to="/market/$listingId"
                params={{ listingId: listing.id }}
                className="group shrink-0 w-36 sm:w-40 rounded-xl border border-border overflow-hidden hover:border-brand/40 transition bg-gradient-to-br from-surface-light via-surface to-surface-lighter/30"
              >
                <div className="aspect-[5/7] overflow-hidden relative">
                  <img
                    src={getCardImageUrl(listing.card)}
                    alt={listing.card.nameEn}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-mono text-text-tertiary">{listing.card.code}</p>
                  <p className="text-xs font-semibold line-clamp-1 group-hover:text-brand transition">{listing.card.nameEn}</p>
                  <p className="text-brand font-bold text-xs mt-1">
                    {listing.listingType === 'TRADE' ? 'Trade' : `฿${listing.price.toLocaleString()}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tabs */}
      <Tabs value={tabValue} onValueChange={(v) => setUserTab(v as NonNullable<typeof userTab>)} className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-6 bg-surface-light">
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="services" disabled={storeProviders.length === 0}>
            Services
          </TabsTrigger>
          <TabsTrigger value="reviews" disabled={reviewCount === 0}>
            Reviews
          </TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-0 space-y-5">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cards in this store"
                className="pl-9 bg-surface-light border-border h-11"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <div className="inline-flex items-center rounded-xl border border-border bg-surface-light p-1 shrink-0">
                {(['all', 'sale', 'trade'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize',
                      typeFilter === t ? 'bg-surface text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {t === 'all' ? 'All types' : t}
                  </button>
                ))}
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="h-10 gap-2 bg-surface-light border-border text-sm font-medium">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-text-tertiary" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-surface-light border-border">
                  <SelectItem value="featured" className="text-sm">Featured</SelectItem>
                  <SelectItem value="price-low" className="text-sm">Price: low to high</SelectItem>
                  <SelectItem value="price-high" className="text-sm">Price: high to low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grouped listings */}
          {groups && groups.length > 0 && (
            <section className="space-y-5">
              {groups.map((group) => {
                const groupListings = filteredListings.filter((l) => group.cardCodes.includes(l.card.code));
                if (groupListings.length === 0) return null;
                return (
                  <div key={group.id} className="space-y-3">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-brand" />
                      {group.name}
                      <span className="text-text-tertiary font-normal">({groupListings.length})</span>
                    </h2>
                    <ListingGrid listings={groupListings} />
                  </div>
                );
              })}
            </section>
          )}

          {/* All / ungrouped listings */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Package className="w-4 h-4 text-brand" />
              {groups && groups.length > 0 ? 'Ungrouped' : 'All listings'}
              <span className="text-text-tertiary font-normal">({filteredListings.length})</span>
            </h2>
            {filteredListings.length === 0 ? (
              <Card className="bg-surface-light border-border">
                <CardContent className="py-14 text-center space-y-2">
                  <Search className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="font-semibold">{query ? 'No cards match your search' : 'No active listings'}</p>
                  <p className="text-sm text-muted-foreground">
                    {query ? 'Try a different keyword or filter.' : 'This seller has not listed any cards yet.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ListingGrid listings={filteredListings} />
            )}
          </section>
        </TabsContent>

        <TabsContent value="services" className="mt-0 space-y-4">
          {storeProviders.length === 0 ? (
            <EmptyState icon={<Award className="w-8 h-8" />} title="No services" description="This store is not offering grading or pre-grade services yet." />
          ) : (
            storeProviders.map((provider) => (
              <ProviderRow key={provider.id} provider={provider} />
            ))
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-0 space-y-4">
          <Card className="bg-surface-light border-border">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{averageReview.toFixed(1)}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3.5 h-3.5',
                        i < Math.round(averageReview) ? 'text-pregrade fill-pregrade' : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{reviewCount} reviews</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <p className="text-sm text-muted-foreground flex-1">
                Based on verified buyers and service customers on SwibSwap.
              </p>
            </CardContent>
          </Card>

          {reviews?.map((review) => (
            <Card key={review.id} className="bg-surface-light border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 rounded-lg">
                      <AvatarImage src={review.reviewerAvatarUrl} alt={review.reviewerName} />
                      <AvatarFallback className="rounded-lg text-xs font-bold bg-surface-lighter">
                        {review.reviewerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{review.reviewerName}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3 h-3',
                        i < review.rating ? 'text-pregrade fill-pregrade' : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="about" className="mt-0 space-y-6">
          <Card className="bg-surface-light border-border">
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold">About the store</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile?.bio || `${displayName} is a collector and seller on SwibSwap.`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {profile?.location || 'Bangkok, Thailand'}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Member since {memberSince}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4" />
                  {activeListings.length} active listings
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="w-4 h-4" />
                  {averageReview.toFixed(1)} {reviewCount > 0 ? `from ${reviewCount} reviews` : 'rating'}
                </div>
              </div>
            </CardContent>
          </Card>

          {profile?.socialLinks && profile.socialLinks.length > 0 && (
            <Card className="bg-surface-light border-border">
              <CardContent className="p-5 space-y-3">
                <h2 className="font-semibold">Social & links</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.socialLinks.map((link) => {
                    const Icon = SOCIAL_ICONS[link.platform.toLowerCase()] || LinkIcon;
                    return (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium hover:border-brand/30 hover:text-brand transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {link.platform}
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function StatCard({ value, label, icon }: { value: number | string; label: string; icon: React.ReactNode }) {
  return (
    <div className="bg-surface-light border border-border rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0">{icon}</div>
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function ProviderRow({ provider }: { provider: ServiceProvider }) {
  const DeliveryIcon = provider.deliveryMode === 'PHOTO_UPLOAD' ? UploadIcon : PackageIcon;
  return (
    <Card className="bg-surface-light border-border overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold">{provider.category === 'PREGRADE' ? 'Pre-grade' : 'Grading'}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">
                {provider.packages.length} packages
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{provider.description}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {provider.turnaround}
              </span>
              <span className="flex items-center gap-0.5">
                <DeliveryIcon className="w-3 h-3" />
                {provider.deliveryMode.replace(/_/g, ' ').toLowerCase()}
              </span>
            </p>
          </div>
        </div>
        <Button asChild className="w-full bg-brand hover:bg-brand-light">
          <Link to="/service-provider/$providerId" params={{ providerId: provider.id }}>
            View packages & pricing
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ListingGrid({ listings }: { listings: MarketListing[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {listings.map((listing) => (
        <Link
          key={listing.id}
          to="/market/$listingId"
          params={{ listingId: listing.id }}
          className="group block bg-surface-light rounded-xl overflow-hidden border border-border hover:border-brand/40 hover-lift transition"
        >
          <div className="aspect-[5/7] overflow-hidden relative">
            <img
              src={getCardImageUrl(listing.card)}
              alt={listing.card.nameEn}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />

            {listing.listingType === 'TRADE' && (
              <span className="absolute top-1.5 right-1.5 text-xs font-medium bg-periwinkle/90 text-white px-1.5 py-0.5 rounded-full">
                Trade
              </span>
            )}
          </div>
          <div className="p-2.5">
            <p className="text-xs font-mono text-text-tertiary">{listing.card.code}</p>
            <h3 className="font-semibold text-xs leading-tight line-clamp-2 group-hover:text-brand transition min-h-[2rem]">{listing.card.nameEn}</h3>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs font-mono bg-surface-lighter px-1 py-0.5 rounded">{listing.card.rarity}</span>
              <span className="text-xs font-mono bg-surface-lighter px-1 py-0.5 rounded">{listing.card.condition}</span>
            </div>
            <p className="text-brand font-bold text-xs mt-1.5">
              {listing.listingType === 'TRADE' ? 'Trade' : `฿${listing.price.toLocaleString()}`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-surface-light border-border">
      <CardContent className="py-14 text-center space-y-2">
        <div className="text-muted-foreground">{icon}</div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function hashStringToInt(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Simple icon helpers
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
