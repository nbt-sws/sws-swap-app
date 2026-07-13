import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import {
  Award,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Package,
  Upload,
  Check,
  ChevronDown,
  ChevronUp,
  Store,
  ArrowLeft,
  Star,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { cn } from '@/lib/utils';
import { useServiceProvider } from '@/hooks/useServices';
import type { ServicePackage, ServiceProvider, GradingService } from '@/types';
import { GRADER_STYLES, GRADER_IMAGE_URLS } from '@/lib/graderAssets';

const DELIVERY_ICON: Record<ServiceProvider['deliveryMode'], typeof Upload> = {
  PHOTO_UPLOAD: Upload,
  PHYSICAL_DROP_OFF: Package,
  PHYSICAL_SHIP: Package,
};

const COLOR_STYLES: Record<
  ServiceProvider['color'],
  { bg: string; text: string; badge: string }
> = {
  brand: { bg: 'bg-brand/10', text: 'text-brand', badge: 'bg-brand/10 text-brand' },
  periwinkle: { bg: 'bg-periwinkle/10', text: 'text-periwinkle', badge: 'bg-periwinkle/10 text-periwinkle' },
  cyan: { bg: 'bg-cyan/10', text: 'text-cyan', badge: 'bg-cyan/10 text-cyan' },
  pregrade: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400' },
  plup: { bg: 'bg-violet-500/10', text: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-400' },
};



export function ServiceProviderScreen() {
  const { providerId } = useParams({ from: '/service-provider/$providerId' });
  const navigate = useNavigate();
  const { data: provider, isLoading } = useServiceProvider(providerId);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const packages = useMemo(
    () => provider?.packages.filter((p) => p.enabled) ?? [],
    [provider]
  );
  const groupedPackages = useMemo(() => {
    const groups = new Map<GradingService | 'other', ServicePackage[]>();
    packages.forEach((pkg) => {
      const key = pkg.grader ?? 'other';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(pkg);
    });
    return Array.from(groups.entries());
  }, [packages]);
  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) || packages[0],
    [packages, selectedPackageId]
  );

  if (isLoading) {
    return (
      <PageContainer className="py-6">
        <Skeleton className="h-48 w-full rounded-xl mb-4" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </PageContainer>
    );
  }

  if (!provider) {
    return (
      <PageContainer className="py-6 text-center">
        <Award className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <h1 className="text-xl font-bold">Provider not found</h1>
        <p className="text-muted-foreground mb-4">This service provider does not exist or is inactive.</p>
        <Button asChild className="bg-brand hover:bg-brand-light">
          <Link to="/services">Browse services</Link>
        </Button>
      </PageContainer>
    );
  }

  const styles = COLOR_STYLES[provider.color];
  const DeliveryIcon = DELIVERY_ICON[provider.deliveryMode];

  const handleOrder = () => {
    if (!selectedPackage) return;
    navigate({
      to: '/pregrade',
      search: {
        category: provider.category,
        provider: provider.id,
        package: selectedPackage.id,
      },
    });
  };

  return (
    <PageContainer className="py-6">
      {/* Back */}
      <button
        onClick={() => navigate({ to: '/services' })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to services
      </button>

      {/* Banner */}
      <div
        className={cn(
          'h-48 sm:h-56 rounded-2xl bg-cover bg-center relative overflow-hidden mb-6',
          !provider.storeBannerUrl && 'bg-gradient-to-br from-surface-lighter via-surface-light to-surface-dark'
        )}
        style={provider.storeBannerUrl ? { backgroundImage: `url(${provider.storeBannerUrl})` } : undefined}
      >
        <div className={cn(
          'absolute inset-0 bg-gradient-to-t',
          provider.storeBannerUrl ? 'from-black/70 via-black/25 to-transparent' : 'from-surface-dark/60 via-surface-dark/20 to-transparent'
        )} />
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 -mt-16 mb-6 relative">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-surface-light bg-surface-lighter overflow-hidden shadow-lg flex items-center justify-center">
          {provider.storeAvatarUrl ? (
            <img src={provider.storeAvatarUrl} alt={provider.storeName} className="w-full h-full object-cover" />
          ) : (
            <Store className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
        <div className="pt-16 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{provider.storeName}</h1>
            <Badge className={cn(styles.badge, 'text-xs')}>
              {provider.category === 'PREGRADE' ? 'Pre-grade' : 'Grade'}
            </Badge>
            {provider.scoreLabel && (
              <Badge className={cn(styles.badge, 'text-xs inline-flex items-center gap-1')}>
                <Star className="w-3 h-3 fill-current" />
                {provider.scoreLabel}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {provider.turnaround}
            </span>
            <span className="flex items-center gap-1">
              <DeliveryIcon className="w-3.5 h-3.5" />
              {provider.deliveryMode.replace(/_/g, ' ').toLowerCase()}
            </span>
            <span className="font-mono">
              {provider.currency} {provider.pricePerCard.toLocaleString()} / card from
            </span>
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {provider.serviceTypes.map((type) => (
              <span key={type} className="text-[10px] px-2 py-1 rounded-full glass-card text-muted-foreground">
                {type}
              </span>
            ))}
          </div>
          {provider.acceptedGraders && provider.acceptedGraders.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {provider.acceptedGraders.map((grader) => (
                <span
                  key={grader}
                  className={cn(
                    'text-[10px] px-2 py-1 rounded-full border font-medium',
                    GRADER_STYLES[grader]
                  )}
                >
                  {grader}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Contact */}
        {(provider.contactPhone || provider.contactEmail || provider.contactLine) && (
          <div className="flex flex-wrap gap-2">
            {provider.contactPhone && (
              <a
                href={`tel:${provider.contactPhone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card glass-card-hover text-xs font-medium"
              >
                <Phone className="w-3.5 h-3.5" />
                {provider.contactPhone}
              </a>
            )}
            {provider.contactEmail && (
              <a
                href={`mailto:${provider.contactEmail}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl glass-card glass-card-hover text-xs font-medium"
              >
                <Mail className="w-3.5 h-3.5" />
                {provider.contactEmail}
              </a>
            )}
            {provider.contactLine && (
              <a
                href={`https://line.me/R/ti/p/${encodeURIComponent(provider.contactLine)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-light text-xs font-medium hover:bg-surface-lighter transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {provider.contactLine}
              </a>
            )}
          </div>
        )}

        {/* Description */}
        <section>
          <h2 className="text-sm font-semibold mb-2">About this service</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {provider.description}
          </p>
        </section>

        {/* Gallery */}
        {provider.galleryUrls && provider.galleryUrls.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {provider.galleryUrls.map((url, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-light"
                >
                  <img src={url} alt={`gallery-${i}`} className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Packages */}
        <section>
          <h2 className="text-sm font-semibold mb-3">Packages</h2>
          {packages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No packages available.</p>
          ) : (
            <div className="space-y-6">
              {groupedPackages.map(([grader, pkgs]) => (
                <div key={grader} className="space-y-3">
                  {grader !== 'other' && (
                    <div className="flex items-center gap-3">
                      <img
                        src={GRADER_IMAGE_URLS[grader]}
                        alt={grader}
                        className="h-8 w-auto object-contain rounded bg-surface-light px-2 py-1"
                        loading="lazy"
                      />
                      <h3 className={cn('text-sm font-bold', GRADER_STYLES[grader].split(' ')[1])}>
                        {grader}
                      </h3>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-fr">
                    {pkgs.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        provider={provider}
                        selected={selectedPackage?.id === pkg.id}
                        onSelect={() => setSelectedPackageId(pkg.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FAQ */}
        {provider.faq && provider.faq.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3">FAQ</h2>
            <div className="space-y-2">
              {provider.faq.map((item, i) => {
                const open = openFaqIndex === i;
                return (
                  <div key={i} className="bg-surface-light rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(open ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="text-sm font-medium pr-4">{item.q}</span>
                      {open ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                    </button>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-4 pb-4"
                      >
                        <p className="text-sm text-muted-foreground">{item.a}</p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Sticky order CTA */}
        {selectedPackage && (
          <div className="sticky bottom-4 bg-surface-light border border-border rounded-2xl p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Selected package</p>
                <p className="text-sm font-bold">
                  {selectedPackage.name} · {selectedPackage.currency} {selectedPackage.pricePerCard.toLocaleString()} / card
                </p>
              </div>
              <Button onClick={handleOrder} className="bg-brand hover:bg-brand-light w-full sm:w-auto">
                Order {provider.category === 'PREGRADE' ? 'Pre-grade' : 'Grade'} →
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function PackageCard({
  pkg,
  provider,
  selected,
  onSelect,
}: {
  pkg: ServicePackage;
  provider: ServiceProvider;
  selected: boolean;
  onSelect: () => void;
}) {
  const styles = COLOR_STYLES[provider.color];
  const DeliveryIcon = DELIVERY_ICON[pkg.deliveryMode];

  return (
    <button
      onClick={onSelect}
      className={cn(
        'text-left rounded-xl border overflow-hidden glass-card glass-card-hover flex flex-col h-full',
        selected
          ? 'ring-2 ring-brand/60 ring-offset-2 ring-offset-surface border-transparent shadow-lg shadow-brand/10'
          : 'border-border/50'
      )}
    >
      <div className="aspect-[16/9] overflow-hidden bg-surface flex items-center justify-center p-3">
        <ImageWithFallback
          src={pkg.imageUrl ?? ''}
          alt={pkg.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          fallbackClassName="text-xl"
        />
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0">
            <h3 className="font-bold text-xs truncate">{pkg.name}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{pkg.description}</p>
          </div>
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              selected ? 'bg-brand border-brand' : 'border-muted-foreground/30'
            )}
          >
            {selected && <Check className="w-2.5 h-2.5 text-white" />}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {pkg.turnaround}
          </span>
          <span className="flex items-center gap-0.5">
            <DeliveryIcon className="w-3 h-3" />
            {pkg.deliveryMode.replace(/_/g, ' ').toLowerCase()}
          </span>
        </p>
        <ul className="space-y-0.5 mb-2">
          {pkg.includes.slice(0, 3).map((inc) => (
            <li key={inc} className="text-[10px] text-muted-foreground flex items-start gap-1">
              <Check className={cn('w-3 h-3 mt-0.5 shrink-0', styles.text)} />
              <span className="truncate">{inc}</span>
            </li>
          ))}
          {pkg.includes.length > 3 && (
            <li className="text-[10px] text-muted-foreground pl-4">+{pkg.includes.length - 3} more</li>
          )}
        </ul>
        <p className={cn('text-sm font-bold font-mono mt-auto', styles.text)}>
          {pkg.currency} {pkg.pricePerCard.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">/ card</span>
        </p>
      </div>
    </button>
  );
}
