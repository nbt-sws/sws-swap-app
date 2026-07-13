import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Award, Building2, Check, Clock, Package, Star, Store, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useServiceProviders, useSubmitPartnerApplication, usePartnerApplications } from '@/hooks/useServices';
import type { ServiceCategory, ServiceProvider, PartnerApplicationInput, GradingService, ProposedPackage } from '@/types';
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
  pregrade: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400', ring: 'ring-emerald-500/30' },
  plup: { bg: 'bg-violet-500/10', text: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-400', ring: 'ring-violet-500/30' },
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
          <div key={i} className="glass-card rounded-xl p-4 h-40 animate-pulse" />
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
              <p className="text-[10px] font-medium mb-0.5">{step.title}</p>
              <p className="text-[9px] text-muted-foreground">{step.desc}</p>
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
      className="glass-card glass-card-hover rounded-xl p-4"
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
            <span key={type} className="text-[10px] px-2 py-0.5 rounded-full glass-effect border border-border text-muted-foreground">
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
                'text-[10px] px-2 py-0.5 rounded-full border font-medium',
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
              <p className="text-[9px] font-mono text-muted-foreground mb-1">{sub.label}</p>
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
            'flex-1 py-3 rounded-xl text-sm font-medium text-center transition-all glass-effect border border-border text-foreground hover:bg-white/10'
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
  const submit = useSubmitPartnerApplication();
  const { data: applications } = usePartnerApplications();
  const [form, setForm] = useState<PartnerApplicationInput>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    serviceCategories: [],
    serviceTypes: [],
    acceptedGraders: [],
    customGraderNote: '',
    proposedPackages: [],
    message: '',
  });

  const toggleCategory = (cat: ServiceCategory) => {
    setForm((prev) => {
      const set = new Set(prev.serviceCategories);
      if (set.has(cat)) set.delete(cat);
      else set.add(cat);
      return { ...prev, serviceCategories: Array.from(set) };
    });
  };

  const toggleType = (type: string) => {
    setForm((prev) => {
      const set = new Set(prev.serviceTypes);
      if (set.has(type)) set.delete(type);
      else set.add(type);
      return { ...prev, serviceTypes: Array.from(set) };
    });
  };

  const toggleGrader = (grader: GradingService) => {
    setForm((prev) => {
      const set = new Set(prev.acceptedGraders);
      if (set.has(grader)) set.delete(grader);
      else set.add(grader);
      return { ...prev, acceptedGraders: Array.from(set) };
    });
  };

  const addPackage = () => {
    setForm((prev) => ({
      ...prev,
      proposedPackages: [
        ...(prev.proposedPackages ?? []),
        { name: '', description: '', pricePerCard: 0, currency: 'THB', turnaround: '', includes: [] },
      ],
    }));
  };

  const removePackage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      proposedPackages: prev.proposedPackages?.filter((_, i) => i !== index),
    }));
  };

  const updatePackage = <K extends keyof ProposedPackage>(index: number, field: K, value: ProposedPackage[K]) => {
    setForm((prev) => ({
      ...prev,
      proposedPackages: prev.proposedPackages?.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg)),
    }));
  };

  const togglePackageGrader = (index: number, grader: GradingService) => {
    setForm((prev) => ({
      ...prev,
      proposedPackages: prev.proposedPackages?.map((pkg, i) =>
        i === index ? { ...pkg, grader: pkg.grader === grader ? undefined : grader } : pkg
      ),
    }));
  };

  const canSubmit =
    form.companyName.trim() &&
    form.contactName.trim() &&
    form.email.trim() &&
    form.serviceCategories.length > 0 &&
    form.serviceTypes.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    submit.mutate(form, {
      onSuccess: () => {
        setForm({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          website: '',
          serviceCategories: [],
          serviceTypes: [],
          acceptedGraders: [],
          customGraderNote: '',
          proposedPackages: [],
          message: '',
        });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-periwinkle/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-periwinkle" />
          </div>
          <div>
            <h3 className="font-bold">Open a service store</h3>
            <p className="text-xs text-muted-foreground">Register your shop, get a whitelabel store page, and accept Pre-grade / Grade orders.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={form.companyName}
              onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
              placeholder="e.g. RAWLITY Labs"
              className="bg-surface-light border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactName">Contact name</Label>
            <Input
              id="contactName"
              value={form.contactName}
              onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
              placeholder="e.g. Jane Doe"
              className="bg-surface-light border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="partner@example.com"
                className="bg-surface-light border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+66 ..."
                className="bg-surface-light border-border"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://..."
              className="bg-surface-light border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Service categories</Label>
          <div className="flex gap-2 flex-wrap">
            {(['PREGRADE', 'GRADE'] as ServiceCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2',
                  form.serviceCategories.includes(cat)
                    ? 'bg-brand/10 border-brand/30 text-brand'
                    : 'bg-surface-light border-border text-muted-foreground'
                )}
              >
                {form.serviceCategories.includes(cat) && <Check className="w-3 h-3" />}
                {cat === 'PREGRADE' ? 'Pre-grade' : 'Grade'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Service types you offer</Label>
          <div className="flex gap-2 flex-wrap">
            {['Photo review', 'Physical pre-grade', 'Professional grading', 'Sub-grades', 'AI scoring', 'Slab authentication'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2',
                  form.serviceTypes.includes(type)
                    ? 'bg-periwinkle/10 border-periwinkle/30 text-periwinkle'
                    : 'bg-surface-light border-border text-muted-foreground'
                )}
              >
                {form.serviceTypes.includes(type) && <Check className="w-3 h-3" />}
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Accepted graders</Label>
          <div className="flex gap-2 flex-wrap">
            {(['PSA', 'BGS', 'CGC', 'TAG', 'RAWLITY', 'BLACKLENS', 'OTHER'] as GradingService[]).map((grader) => (
              <button
                key={grader}
                type="button"
                onClick={() => toggleGrader(grader)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2',
                  form.acceptedGraders?.includes(grader)
                    ? GRADER_STYLES[grader]
                    : 'bg-surface-light border-border text-muted-foreground'
                )}
              >
                {form.acceptedGraders?.includes(grader) && <Check className="w-3 h-3" />}
                {grader === 'OTHER' ? 'Other grader' : grader}
              </button>
            ))}
          </div>
          {form.acceptedGraders?.includes('OTHER') && (
            <Input
              value={form.customGraderNote ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, customGraderNote: e.target.value }))}
              placeholder="e.g. SGC, HGA, local Thai grader..."
              className="bg-surface-light border-border text-xs mt-2"
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Proposed packages</Label>
            <span className="text-[10px] text-muted-foreground">{form.proposedPackages?.length ?? 0} package(s)</span>
          </div>
          <p className="text-xs text-muted-foreground">Add the packages you plan to offer. You can edit these later after approval.</p>
          <div className="space-y-3">
            {form.proposedPackages?.map((pkg, index) => (
              <div key={index} className="bg-surface-light rounded-xl p-3 space-y-3 border border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Package {index + 1}</Label>
                  <button
                    type="button"
                    onClick={() => removePackage(index)}
                    className="text-[10px] text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={pkg.name}
                    onChange={(e) => updatePackage(index, 'name', e.target.value)}
                    placeholder="Package name"
                    className="bg-surface border-border text-xs"
                  />
                  <Input
                    value={pkg.turnaround}
                    onChange={(e) => updatePackage(index, 'turnaround', e.target.value)}
                    placeholder="Turnaround e.g. 2-3 weeks"
                    className="bg-surface border-border text-xs"
                  />
                </div>
                <Input
                  value={pkg.description}
                  onChange={(e) => updatePackage(index, 'description', e.target.value)}
                  placeholder="Short description"
                  className="bg-surface border-border text-xs"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    value={pkg.pricePerCard || ''}
                    onChange={(e) => updatePackage(index, 'pricePerCard', parseFloat(e.target.value) || 0)}
                    placeholder="Price per card"
                    className="bg-surface border-border text-xs"
                  />
                  <Input
                    value={pkg.currency}
                    onChange={(e) => updatePackage(index, 'currency', e.target.value.toUpperCase())}
                    placeholder="THB"
                    className="bg-surface border-border text-xs"
                  />
                </div>
                <Textarea
                  value={pkg.includes.join('\n')}
                  onChange={(e) =>
                    updatePackage(
                      index,
                      'includes',
                      e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Includes (one per line)"
                  className="bg-surface border-border text-xs min-h-[60px]"
                />
                <div className="flex gap-2 flex-wrap">
                  {(['PSA', 'BGS', 'CGC', 'TAG', 'RAWLITY', 'BLACKLENS', 'OTHER'] as GradingService[]).map((grader) => (
                    <button
                      key={grader}
                      type="button"
                      onClick={() => togglePackageGrader(index, grader)}
                      className={cn(
                        'text-[10px] px-2 py-1 rounded border transition-all',
                        pkg.grader === grader
                          ? GRADER_STYLES[grader]
                          : 'bg-surface border-border text-muted-foreground'
                      )}
                    >
                      {pkg.grader === grader && <Check className="w-2.5 h-2.5 inline mr-1" />}
                      {grader === 'OTHER' ? 'Other' : grader}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPackage}
            className="w-full border-border text-xs"
          >
            + Add package
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            placeholder="Tell us about your experience, turnaround times, and certifications."
            className="bg-surface-light border-border min-h-[100px]"
          />
        </div>

        <Button
          type="submit"
          disabled={!canSubmit || submit.isPending}
          className="w-full bg-brand-gradient disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submit.isPending ? 'Submitting…' : 'Submit partner application'}
        </Button>

        {submit.isSuccess && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-center text-emerald-400"
          >
            Application received. Our partnerships team will reach out within 2 business days.
          </motion.p>
        )}
      </form>

      {applications && applications.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Your applications</h4>
          <div className="space-y-2">
            {applications.map((app) => (
              <div key={app.id} className="bg-surface-light rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {app.storeId ? (
                      <Link to="/seller/$sellerId" params={{ sellerId: app.storeId }} className="hover:text-brand">
                        {app.storeName || app.companyName}
                      </Link>
                    ) : (
                      app.companyName
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {app.serviceCategories.map((c) => (c === 'PREGRADE' ? 'Pre-grade' : 'Grade')).join(', ')}
                    {app.serviceTypes.length > 0 && ` · ${app.serviceTypes.join(', ')}`}
                    {app.acceptedGraders && app.acceptedGraders.length > 0 && ` · ${app.acceptedGraders.map((g) => (g === 'OTHER' ? 'Other' : g)).join(', ')}`}
                    {app.customGraderNote && ` (${app.customGraderNote})`}
                    {app.proposedPackages && app.proposedPackages.length > 0 && ` · ${app.proposedPackages.length} proposed package(s)`}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    app.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : app.status === 'REJECTED'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-amber-500/10 text-amber-400'
                  )}
                >
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

