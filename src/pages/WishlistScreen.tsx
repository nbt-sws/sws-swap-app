import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useApi';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Heart, Search, X } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

export function WishlistScreen() {
  const { t } = useTranslation();
  const { data: items, isLoading } = useWishlist();
  const remove = useRemoveFromWishlist();

  return (
    <PageContainer className="py-6">
      <PageHeader
        title={t('nav.wishlist')}
        icon={<Heart className="w-6 h-6 text-brand" />}
        description={t('wishlist.description')}
        action={
          <Button asChild variant="outline" size="sm" className="border-border">
            <Link to="/market">
              <Search className="w-4 h-4 mr-2" />
              Browse market
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        )}

        {!isLoading && (!items || items.length === 0) && (
          <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
            <EmptyMedia variant="icon">
              <Heart className="w-10 h-10 text-brand" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>{t('wishlist.empty')}</EmptyTitle>
              <EmptyDescription>{t('wishlist.emptyDesc')}</EmptyDescription>
            </EmptyHeader>
            <Button asChild className="bg-brand hover:bg-brand-light">
              <Link to="/market">Discover cards</Link>
            </Button>
          </Empty>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items?.map((item) => (
            <Card key={item.id} className="bg-surface-light border-border overflow-hidden group">
              <CardContent className="p-0 relative">
                <button
                  onClick={() => remove.mutate(item.listingId)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-surface/80 text-muted-foreground hover:text-pldown transition z-10"
                  disabled={remove.isPending}
                >
                  <X className="w-4 h-4" />
                </button>
                <Link to="/market/$listingId" params={{ listingId: item.listingId }}>
                  <div className="aspect-[3/4] overflow-hidden bg-surface-lighter">
                    <ImageWithFallback
                      src={item.imageUrl ?? ''}
                      alt={item.cardName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="p-3">
                  {item.cardCode && (
                    <p className="text-xs font-mono text-muted-foreground truncate">{item.cardCode}</p>
                  )}
                  <p className="font-medium text-sm truncate">{item.cardName}</p>
                  <div className="flex items-center justify-between mt-1">
                    {item.currentPrice > 0 ? (
                      <p className="text-sm font-bold font-mono text-brand">฿{item.currentPrice.toLocaleString()}</p>
                    ) : <span />}
                    <p className="text-xs text-muted-foreground">
                      {item.addedAt ? new Date(item.addedAt).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
