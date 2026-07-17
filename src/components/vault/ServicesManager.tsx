import { useState } from 'react';
import {
  useMyProvider, useBecomeProvider, useUpdateProvider,
  useMyPackages, useAddPackage, useUpdatePackage,
  useReceivedServiceOrders, useUpdateServiceOrder,
} from '@/hooks/useServices';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Award, Plus, Loader2, ChevronRight, CheckCircle2, Clock, Store,
  ClipboardList, ChevronDown, User, Package,
} from 'lucide-react';
import type { ServiceOrder } from '@/types';

const DELIVERY_MODES = [
  { value: 'PHYSICAL_SHIP', label: 'Ship-in (customers ship cards to you)' },
  { value: 'PHYSICAL_DROP_OFF', label: 'Drop-off (customers bring cards to your shop)' },
  { value: 'PHOTO_UPLOAD', label: 'Photo upload (online review only)' },
];

export function ServicesManager() {
  const { data: provider, isLoading } = useMyProvider();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!provider) {
    return <ProviderOnboarding />;
  }

  return (
    <div className="space-y-5">
      <ProviderStatusCard provider={provider} />
      <OrdersQueue />
      <PackagesSection />
      <ProviderProfileSection />
    </div>
  );
}

/* ─── Onboarding ─── */

function ProviderOnboarding() {
  const becomeProvider = useBecomeProvider();
  const [form, setForm] = useState({
    category: 'PREGRADE' as 'PREGRADE' | 'GRADE',
    deliveryMode: 'PHOTO_UPLOAD',
    pricePerCard: '',
    turnaround: '',
    description: '',
    contactLine: '',
  });

  const canSubmit = !!form.pricePerCard && !!form.turnaround.trim() && !becomeProvider.isPending;

  const handleSubmit = () => {
    becomeProvider.mutate(
      {
        category: form.category,
        deliveryMode: form.deliveryMode,
        pricePerCard: Number(form.pricePerCard) || 0,
        turnaround: form.turnaround.trim(),
        description: form.description.trim(),
        contactLine: form.contactLine.trim() || undefined,
      },
      {
        onSuccess: () => toast.success('Your service is live! Add packages to start receiving orders.'),
        onError: () => toast.error('Failed to create provider profile'),
      }
    );
  };

  return (
    <Card className="bg-surface-light border-border">
      <CardContent className="p-5 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 text-brand" />
          </div>
          <div>
            <h3 className="font-semibold">Offer grading services</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Turn your store into a service provider — review or grade cards for other collectors and earn per card.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Service category</label>
          <div className="grid grid-cols-2 gap-2">
            {(['PREGRADE', 'GRADE'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm((p) => ({ ...p, category: cat }))}
                className={cn(
                  'px-3 py-2.5 rounded-xl text-sm font-medium border transition',
                  form.category === cat
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-border bg-surface text-muted-foreground hover:text-foreground'
                )}
              >
                {cat === 'PREGRADE' ? 'Pre-grade (review)' : 'Grade (lab submission)'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">How customers get cards to you</label>
          <Select value={form.deliveryMode} onValueChange={(v) => setForm((p) => ({ ...p, deliveryMode: v }))}>
            <SelectTrigger className="bg-surface border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-light border-border">
              {DELIVERY_MODES.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Price per card (฿)</label>
            <Input
              type="number"
              min={0}
              value={form.pricePerCard}
              onChange={(e) => setForm((p) => ({ ...p, pricePerCard: e.target.value }))}
              placeholder="e.g. 300"
              className="bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Turnaround</label>
            <Input
              value={form.turnaround}
              onChange={(e) => setForm((p) => ({ ...p, turnaround: e.target.value }))}
              placeholder="e.g. Same day – 3 days"
              className="bg-surface border-border"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">optional</span></label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Tell collectors what you check and why they should choose you..."
            className="bg-surface border-border min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">LINE contact <span className="text-muted-foreground font-normal">optional</span></label>
          <Input
            value={form.contactLine}
            onChange={(e) => setForm((p) => ({ ...p, contactLine: e.target.value }))}
            placeholder="e.g. @yourshop"
            className="bg-surface border-border"
          />
        </div>

        <Button className="w-full bg-brand hover:bg-brand-light h-11" onClick={handleSubmit} disabled={!canSubmit}>
          {becomeProvider.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Go live as a provider
        </Button>
      </CardContent>
    </Card>
  );
}

/* ─── Provider status header ─── */

function ProviderStatusCard({ provider }: { provider: NonNullable<ReturnType<typeof useMyProvider>['data']> }) {
  const updateProvider = useUpdateProvider();

  return (
    <Card className="bg-surface-light border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-periwinkle/10 flex items-center justify-center shrink-0">
          <Store className="w-5 h-5 text-periwinkle" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{provider.storeName}</p>
            <Badge className={cn('text-xs', provider.category === 'PREGRADE' ? 'bg-periwinkle/10 text-periwinkle' : 'bg-cyan/10 text-cyan')}>
              {provider.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            ฿{provider.pricePerCard.toLocaleString()}/card · {provider.turnaround || 'Turnaround not set'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{provider.enabled ? 'Accepting orders' : 'Paused'}</span>
          <Switch
            checked={provider.enabled}
            onCheckedChange={(v) =>
              updateProvider.mutate(
                { enabled: v },
                { onSuccess: () => toast.success(v ? 'Accepting orders' : 'Order intake paused') }
              )
            }
            aria-label="Accept orders"
          />
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Incoming orders queue ─── */

function OrdersQueue() {
  const { data: orders, isLoading } = useReceivedServiceOrders();
  const updateOrder = useUpdateServiceOrder();
  const [completing, setCompleting] = useState<ServiceOrder | null>(null);

  const activeOrders = orders?.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED') ?? [];
  const closedOrders = orders?.filter((o) => o.status === 'COMPLETED' || o.status === 'CANCELLED') ?? [];

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-brand" />
        <h3 className="text-sm font-semibold">Incoming orders</h3>
        {activeOrders.length > 0 && (
          <span className="rounded-full bg-brand/15 text-brand text-xs font-bold px-2 py-0.5">{activeOrders.length}</span>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : activeOrders.length === 0 && closedOrders.length === 0 ? (
        <Card className="bg-surface-light border-border">
          <CardContent className="py-10 text-center space-y-1.5">
            <Package className="w-7 h-7 mx-auto text-muted-foreground" />
            <p className="font-medium text-sm">No orders yet</p>
            <p className="text-xs text-muted-foreground">
              Share your store link so collectors can send cards your way.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} onComplete={() => setCompleting(order)} />
          ))}
          {closedOrders.slice(0, 5).map((order) => (
            <OrderCard key={order.id} order={order} closed />
          ))}
        </div>
      )}

      {/* Complete order dialog (final stage) */}
      <CompleteOrderDialog
        order={completing}
        onClose={() => setCompleting(null)}
        onSubmit={(gradeResult, trackingNumber) => {
          if (!completing) return;
          updateOrder.mutate(
            { orderId: completing.id, action: 'advance', gradeResult: gradeResult || undefined, trackingNumber: trackingNumber || undefined },
            {
              onSuccess: () => {
                toast.success('Order completed — cards returned to the customer');
                setCompleting(null);
              },
              onError: () => toast.error('Failed to complete order'),
            }
          );
        }}
        isPending={updateOrder.isPending}
      />
    </section>
  );
}

function OrderCard({ order, closed, onComplete }: { order: ServiceOrder; closed?: boolean; onComplete?: () => void }) {
  const updateOrder = useUpdateServiceOrder();
  const nextStage = order.stages.find((s) => !s.completed);
  const doneCount = order.stages.filter((s) => s.completed).length;
  const isFinalStep = !closed && doneCount === order.stages.length - 1;

  return (
    <Card className={cn('bg-surface-light border-border', closed && 'opacity-60')}>
      <CardContent className="p-3.5 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-mono text-muted-foreground">{order.orderNo}</p>
            <Badge className={cn(
              'text-xs',
              order.status === 'COMPLETED' ? 'bg-success/10 text-success'
                : order.status === 'CANCELLED' ? 'bg-pldown/10 text-pldown'
                : 'bg-warning/10 text-warning'
            )}>
              {closed ? order.status : nextStage ? `Next: ${nextStage.label}` : order.status}
            </Badge>
          </div>
          <p className="text-sm font-medium mt-1 truncate">
            {order.packageName ?? order.category} · {order.cardIds.length} card{order.cardIds.length > 1 ? 's' : ''}
            {order.gradeResult && <span className="text-cyan"> · {order.gradeResult}</span>}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <User className="w-3 h-3" />
            {order.customerName ?? 'Customer'} · ฿{order.totalAmount.toLocaleString()} · {doneCount}/{order.stages.length} stages
          </p>
        </div>
        {!closed && nextStage && (
          isFinalStep ? (
            <Button size="sm" className="bg-success hover:bg-success/90 text-white shrink-0" onClick={onComplete}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Complete
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-brand hover:bg-brand-light shrink-0"
              onClick={() =>
                updateOrder.mutate(
                  { orderId: order.id, action: 'advance' },
                  { onError: () => toast.error('Failed to update stage') }
                )
              }
              disabled={updateOrder.isPending}
            >
              {updateOrder.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="ml-1 max-w-[110px] truncate">{nextStage.label}</span>
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}

function CompleteOrderDialog({
  order, onClose, onSubmit, isPending,
}: {
  order: ServiceOrder | null;
  onClose: () => void;
  onSubmit: (gradeResult: string, trackingNumber: string) => void;
  isPending: boolean;
}) {
  const [gradeResult, setGradeResult] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-surface-light border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>Complete order</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <p className="text-sm text-muted-foreground">
            This marks the final stage and returns the cards to the customer's vault.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Grade result <span className="text-muted-foreground font-normal">optional</span></label>
            <Input
              value={gradeResult}
              onChange={(e) => setGradeResult(e.target.value)}
              placeholder="e.g. PSA 10, RAWLITY 9"
              className="bg-surface border-border"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Return tracking no. <span className="text-muted-foreground font-normal">optional</span></label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. TH123456789"
              className="bg-surface border-border"
            />
          </div>
          <Button className="w-full bg-success hover:bg-success/90 h-11" onClick={() => onSubmit(gradeResult.trim(), trackingNumber.trim())} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Complete & return cards
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Packages manager ─── */

function PackagesSection() {
  const { data: packages, isLoading } = useMyPackages();
  const addPackage = useAddPackage();
  const updatePackage = useUpdatePackage();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', grader: '', pricePerCard: '', turnaround: '' });

  const canAdd = !!form.name.trim() && !!form.pricePerCard && !addPackage.isPending;

  const handleAdd = () => {
    addPackage.mutate(
      {
        name: form.name.trim(),
        grader: form.grader || undefined,
        pricePerCard: Number(form.pricePerCard) || 0,
        turnaround: form.turnaround.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Package added');
          setForm({ name: '', grader: '', pricePerCard: '', turnaround: '' });
          setShowForm(false);
        },
        onError: () => toast.error('Failed to add package'),
      }
    );
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-brand" />
          <h3 className="text-sm font-semibold">Packages</h3>
          <span className="text-xs text-muted-foreground">{packages?.length ?? 0}</span>
        </div>
        <Button size="sm" variant="secondary" className="gap-1 h-8 rounded-lg" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {showForm && (
        <Card className="bg-surface-light border-brand/30 animate-fade-in">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Package name e.g. PSA Regular"
                className="bg-surface border-border col-span-2"
              />
              <Select value={form.grader} onValueChange={(v) => setForm((p) => ({ ...p, grader: v === 'none' ? '' : v }))}>
                <SelectTrigger className="bg-surface border-border">
                  <SelectValue placeholder="Grader (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-surface-light border-border">
                  <SelectItem value="none">No specific grader</SelectItem>
                  {['PSA', 'BGS', 'CGC', 'TAG', 'RAWLITY', 'BLACKLENS'].map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                value={form.pricePerCard}
                onChange={(e) => setForm((p) => ({ ...p, pricePerCard: e.target.value }))}
                placeholder="Price/card ฿"
                className="bg-surface border-border"
              />
              <Input
                value={form.turnaround}
                onChange={(e) => setForm((p) => ({ ...p, turnaround: e.target.value }))}
                placeholder="Turnaround e.g. 10–15 days"
                className="bg-surface border-border col-span-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" className="bg-brand hover:bg-brand-light" onClick={handleAdd} disabled={!canAdd}>
                {addPackage.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                Add package
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-20 w-full rounded-xl" />
      ) : packages?.length === 0 ? (
        <Card className="bg-surface-light border-border">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No packages yet — add one so customers know what to pick.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {packages?.map((pkg) => (
            <Card key={pkg.id} className={cn('bg-surface-light border-border', !pkg.enabled && 'opacity-55')}>
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {pkg.name}
                    {pkg.grader && <span className="text-muted-foreground"> · {pkg.grader}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ฿{pkg.pricePerCard.toLocaleString()}/card{pkg.turnaround ? ` · ${pkg.turnaround}` : ''}
                  </p>
                </div>
                <Switch
                  checked={pkg.enabled}
                  onCheckedChange={(v) =>
                    updatePackage.mutate(
                      { id: pkg.id, data: { enabled: v } },
                      { onError: () => toast.error('Failed to update package') }
                    )
                  }
                  aria-label={`Enable ${pkg.name}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Provider profile edit ─── */

function ProviderProfileSection() {
  const { data: provider } = useMyProvider();
  const updateProvider = useUpdateProvider();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: '', turnaround: '', pricePerCard: '', contactLine: '' });

  if (!provider) return null;

  const startEdit = () => {
    setForm({
      description: provider.description ?? '',
      turnaround: provider.turnaround ?? '',
      pricePerCard: String(provider.pricePerCard ?? 0),
      contactLine: provider.contactLine ?? '',
    });
    setOpen((v) => !v);
  };

  const handleSave = () => {
    updateProvider.mutate(
      {
        description: form.description.trim(),
        turnaround: form.turnaround.trim(),
        pricePerCard: Number(form.pricePerCard) || 0,
        contactLine: form.contactLine.trim(),
      },
      {
        onSuccess: () => {
          toast.success('Provider profile saved');
          setOpen(false);
        },
        onError: () => toast.error('Failed to save profile'),
      }
    );
  };

  return (
    <section className="rounded-xl border border-border/60 bg-surface/40">
      <button
        type="button"
        onClick={startEdit}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Provider profile
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-border/60 px-3.5 py-3 animate-fade-in">
          <Textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Service description"
            className="bg-surface border-border min-h-[70px]"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              min={0}
              value={form.pricePerCard}
              onChange={(e) => setForm((p) => ({ ...p, pricePerCard: e.target.value }))}
              placeholder="Default price/card ฿"
              className="bg-surface border-border"
            />
            <Input
              value={form.turnaround}
              onChange={(e) => setForm((p) => ({ ...p, turnaround: e.target.value }))}
              placeholder="Turnaround"
              className="bg-surface border-border"
            />
          </div>
          <Input
            value={form.contactLine}
            onChange={(e) => setForm((p) => ({ ...p, contactLine: e.target.value }))}
            placeholder="LINE contact"
            className="bg-surface border-border"
          />
          <div className="flex justify-end">
            <Button size="sm" className="bg-brand hover:bg-brand-light" onClick={handleSave} disabled={updateProvider.isPending}>
              {updateProvider.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
              Save profile
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
