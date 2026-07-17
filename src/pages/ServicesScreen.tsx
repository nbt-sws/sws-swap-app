import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Award, Building2, Clock, Package, Star, Store, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useServiceProviders } from '@/hooks/useServices';
import type { ServiceCategory, ServiceProvider } from '@/types';
import { GRADER_STYLES } from '@/lib/graderAssets';

type TabValue = 'pregrade' | 'grade' | 'partner';

const TAB_TO_CATEGORY: Record<'pregrade' | 'grade', ServiceCategory> = {
  pregrade: 'PREGRADE',
  grade: 'GRADE',
};

const DELIVERY_ICON: Record<ServiceProvider['deliveryMode'], typeof Upload> = {
  PHOTO_UPLOAD: Upload,
  PHYSICAL_DROP_OFF: Package,
  PHYSICAL_SHIP: Package,
};

const COLOR_STYLES: Record<
  ServiceProvider['color'],
  { bg: string; text: string; badge: string; ring: string }
> = {
  brand: { bg: 'bg-brand/10', text: 'text-brand', badge: 'bg-brand/10 text-brand', ring: 'ring-brand/30' },
  periwinkle: { bg: 'bg-periwinkle/10', text: 'text-periwinkle', badge: 'bg-periwinkle/10 text-periwinkle', ring: 'ring-periwinkle/30' },
  cyan: { bg: 'bg-cyan/10', text: 'text-cyan', badge: 'bg-cyan/10 text-cyan', ring: 'ring-cyan/30' },
  pregrade: { bg: 'bg-success/10', text: 'text-success', badge: 'bg-success/10 text-success', ring: 'ring-success/30' },
  plup: { bg: 'bg-periwinkle/10', text: 'text-periwinkle', badge: 'bg-periwinkle/10 text-periwinkle', ring: 'ring-periwinkle/30' },
};

const HOW_IT_WORKS: Record<ServiceCategory, { num: string; title: string; desc: string }[]> = {
  PREGRADE: [
    { num: '1', title: 'Pick from vault', desc: 'Choose raw cards to score' },
    { num: '2', title: 'Send or upload', desc: 'Drop-off, ship, or scan photos' },
    { num: '3', title: 'Score lands', desc: 'Tag added to your vault card' },
    { num: '4', title: '→', desc: 'Unlocks the PRE-GRADED shelf' },
  ],
  GRADE: [
    { num: '1', title: 'Pick from vault', desc: 'Choose raw cards to grade' },
    { num: '2', title: 'Ship to lab', desc: 'Insured courier or drop-off' },
    { num: '3', title: 'Grade & slab', desc: 'Professional encapsulation' },
    { num: '4', title: '→', desc: 'List as GRADED on the market' },
  ],
};

export function ServicesScreen() {
  const [tab, setTab] = useState<TabValue>('pregrade');
  const category = tab === 'partner' ? undefined : TAB_TO_CATEGORY[tab];
  const { data: providers, isLoading } = useServiceProviders(category);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Services"
        icon={<Award className="w-6 h-6 text-brand" />}
        description="Pre-grade, grade, and vault-to-market services from partner stores"
        action={
          <Link
            to="/service-orders"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-light border border-border text-sm font-medium hover:border-brand/30 transition-colors"
          >
            My orders
          </Link>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6 bg-surface-light">
          <TabsTrigger value="pregrade">Pre-grade</TabsTrigger>
          <TabsTrigger value="grade">Grade</TabsTrigger>
          <TabsTrigger value="partner">Partner</TabsTrigger>
        </TabsList>

        <TabsContent value="pregrade" className="mt-0">
          <ServiceCatalog category="PREGRADE" providers={providers} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="grade" className="mt-0">
          <ServiceCatalog category="GRADE" providers={providers} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="partner" className="mt-0">
          <PartnerTab />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function ServiceCatalog({
  category,
  providers,
  isLoading,
}: {
  category: ServiceCategory;
  providers?: ServiceProvider[];
  isLoading: boolean;
}) {
  const steps = HOW_IT_WORKS[category];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="surface-card rounded-xl p-4 h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {providers?.length ? (
          providers.map((provider, i) => (
            <ProviderCard key={provider.id} provider={provider} index={i} />
          ))
        ) : (
          <div className="text-center py-10 bg-surface-light rounded-xl">
            <p className="text-sm text-muted-foreground">No {category === 'PREGRADE' ? 'pre-grade' : 'grading'} providers available right now.</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold">HOW IT WORKS</h2>
        <div className="grid grid-cols-4 gap-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-center"
            >
              <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-brand">{step.num}</span>
              </div>
              <p className="text-xs font-medium mb-0.5">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-cyan/5 border border-cyan/20 rounded-xl p-4 flex items-center gap-3">
        <span className="text-cyan text-lg">→</span>
        <div>
          <p className="text-sm font-medium text-cyan">Market unlock</p>
          <p className="text-xs text-cyan/70">
            {category === 'PREGRADE'
              ? 'Scored cards list under PRE-GRADED on SwibSwap Market'
              : 'Graded slabs list under GRADED and trade at a premium'}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  index,
}: {
  provider: ServiceProvider;
  index: number;
}) {
  const styles = COLOR_STYLES[provider.color];
  const DeliveryIcon = DELIVERY_ICON[provider.deliveryMode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="surface-card surface-card-hover rounded-xl p-4"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold overflow-hidden shrink-0', styles.bg, styles.text)}>
          {provider.storeAvatarUrl ? (
            <img src={provider.storeAvatarUrl} alt={provider.storeName} className="w-full h-full object-cover" />
          ) : (
            <Store className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold">{provider.storeName}</h3>
            {provider.scoreLabel && (
              <span className={cn('inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded', styles.badge)}>
                <Star className="w-3 h-3 fill-current" />
                {provider.scoreLabel}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {provider.turnaround}
            </span>
            <span className="flex items-center gap-1">
              <DeliveryIcon className="w-3 h-3" />
              {provider.deliveryMode.replace(/_/g, ' ').toLowerCase()}
            </span>
            <span className="font-mono">
              {provider.currency} {provider.pricePerCard.toLocaleString()} / card
            </span>
          </p>
        </div>
      </div>

      {provider.serviceTypes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {provider.serviceTypes.map((type) => (
            <span key={type} className="text-xs px-2 py-0.5 rounded-full surface-card border border-border text-muted-foreground">
              {type}
            </span>
          ))}
        </div>
      )}
      {provider.acceptedGraders && provider.acceptedGraders.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {provider.acceptedGraders.map((grader) => (
            <span
              key={grader}
              className={cn(
                'text-xs px-2 py-0.5 rounded-full border font-medium',
                GRADER_STYLES[grader]
              )}
            >
              {grader === 'OTHER' ? 'Other' : grader}
            </span>
          ))}
        </div>
      )}

      {provider.subScores && provider.subScores.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {provider.subScores.map((sub) => (
            <div key={sub.label} className="text-center">
              <p className="text-xs font-mono text-muted-foreground mb-1">{sub.label}</p>
              <p className={cn('text-sm font-bold font-mono', styles.text)}>{sub.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Link
          to="/seller/$sellerId"
          params={{ sellerId: provider.storeId }}
          className={cn(
            'flex-1 py-3 rounded-xl text-sm font-medium text-center transition-all surface-card border border-border text-foreground hover:bg-white/10'
          )}
        >
          View store
        </Link>
        <Link
          to="/service-provider/$providerId"
          params={{ providerId: provider.id }}
          className={cn(
            'flex-1 py-3 rounded-xl text-sm font-medium text-center transition-all',
            styles.bg,
            styles.text,
            'hover:brightness-110'
          )}
        >
          View packages →
        </Link>
      </div>
    </motion.div>
  );
}

function PartnerTab() {
  return (
    <div className="space-y-4">
      <div className="surface-card rounded-xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-periwinkle/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-periwinkle" />
          </div>
          <div>
            <h3 className="font-bold">Open a service store</h3>
            <p className="text-xs text-muted-foreground">Offer pre-grade / grade services to other collectors and earn per card.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          You can go live in minutes — set your category, price per card, turnaround and packages,
          then manage incoming orders from your own dashboard. No application needed.
        </p>
        <Link
          to="/vault"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-light transition-colors"
        >
          <Store className="w-4 h-4" />
          Open Vault → Store → Services tab
        </Link>
      </div>
    </div>
  );
}

