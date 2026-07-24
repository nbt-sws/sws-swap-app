import { useState } from 'react';
import { useNavigate, useSearch, Link } from '@tanstack/react-router';
import { useServiceOrder, useStoreReviews, useSubmitStoreReview } from '@/hooks/useServices';
import { ScrollablePage } from '@/components/layout/ScrollablePage';
import { PageHeader } from '@/components/layout/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { Star, Package } from 'lucide-react';
import { toast } from 'sonner';

export function RatingsScreen() {
  const navigate = useNavigate();
  const { submissionId } = useSearch({ from: '/ratings' });
  const { data: order, isLoading: orderLoading } = useServiceOrder(submissionId);
  const { data: storeReviews } = useStoreReviews(order?.storeId);
  const submitReview = useSubmitStoreReview();

  const [score, setScore] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (score === 0 || !order) return;
    submitReview.mutate(
      { storeId: order.storeId, rating: score, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Thanks — your rating was submitted');
          navigate({ to: '/service-orders/$orderId', params: { orderId: order.id } });
        },
        onError: (err) => {
          toast.error(err instanceof Error && err.message ? err.message : 'Failed to submit rating. Please try again.');
        },
      }
    );
  };

  if (!submissionId) {
    return (
      <ScrollablePage
        header={
          <PageHeader
            title="Rate your service"
            description="no order selected"
            back={{ to: '/status' }}
          />
        }
      >
        <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
          <EmptyMedia variant="icon">
            <Star className="w-8 h-8 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Nothing to rate</EmptyTitle>
            <EmptyDescription>
              Open a completed service order and tap “Rate this service” to leave a rating.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild variant="outline">
            <Link to="/service-orders">Go to my service orders</Link>
          </Button>
        </Empty>
      </ScrollablePage>
    );
  }

  if (orderLoading) {
    return (
      <ScrollablePage
        header={
          <PageHeader title="Rate your service" back={{ to: '/status' }} />
        }
      >
        <div className="space-y-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-16" />
          <Skeleton className="h-32" />
        </div>
      </ScrollablePage>
    );
  }

  if (!order) {
    return (
      <ScrollablePage
        header={
          <PageHeader
            title="Rate your service"
            description="order not found"
            back={{ to: '/status' }}
          />
        }
      >
        <Empty className="rounded-xl border-dashed border-border bg-surface-light/50 py-16">
          <EmptyMedia variant="icon">
            <Package className="w-8 h-8 text-brand" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Order not found</EmptyTitle>
            <EmptyDescription>We couldn't find this service order.</EmptyDescription>
          </EmptyHeader>
          <Button asChild variant="outline">
            <Link to="/service-orders">Back to my service orders</Link>
          </Button>
        </Empty>
      </ScrollablePage>
    );
  }

  return (
    <ScrollablePage
      header={
        <PageHeader
          title="Rate your service"
          description={`order ${order.orderNo ?? order.id} · ${order.status.toLowerCase().replace('_', ' ')}`}
          back={{ to: '/service-orders/$orderId', params: { orderId: order.id } }}
        />
      }
      footer={
        <button
          onClick={handleSubmit}
          disabled={score === 0 || submitReview.isPending || order.status !== 'COMPLETED'}
          className={`w-full py-4 rounded-xl font-semibold text-sm transition-all ${
            score > 0 && !submitReview.isPending && order.status === 'COMPLETED'
              ? 'bg-brand-gradient shadow-glow active:scale-[0.98]'
              : 'bg-surface-lighter text-muted-foreground cursor-not-allowed'
          }`}
        >
          {submitReview.isPending ? 'Submitting…' : 'Submit rating'}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Order info */}
        <div>
          <div className="bg-surface-light rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center">
              <span className="text-brand font-bold">{order.providerName.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <p className="font-semibold">{order.providerName}</p>
              <p className="text-xs text-muted-foreground">
                {order.category === 'PREGRADE' ? 'pre-grade' : 'grade'} · {order.cardIds.length} card(s) · ฿{order.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
          {order.status !== 'COMPLETED' && (
            <p className="text-xs text-warning mt-2">
              You can rate this service once the order is completed.
            </p>
          )}
        </div>

        {/* Star rating */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setScore(s)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    s <= (hoveredStar || score)
                      ? 'text-pregrade fill-pregrade'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-sm font-mono text-muted-foreground">
            {score > 0 ? `${score} / 5` : 'Tap to rate'}
          </p>
        </div>

        {/* Comment */}
        <div>
          <p className="text-xs font-mono tracking-wider text-muted-foreground mb-2">
            COMMENT (OPTIONAL)
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the turnaround, communication and accuracy?"
            rows={4}
            maxLength={1000}
            className="w-full bg-surface-light rounded-xl p-4 text-sm outline-none resize-none placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Public scorecard (live store review stats) */}
        {storeReviews && storeReviews.count > 0 && (
          <div>
            <div className="bg-pregrade/5 border border-pregrade/20 rounded-xl p-4">
              <p className="text-xs font-mono text-pregrade mb-2">
                {order.providerName.toUpperCase()} PUBLIC SCORECARD
              </p>
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-pregrade fill-pregrade" />
                <span className="font-bold">{storeReviews.average?.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  · {storeReviews.count} review{storeReviews.count === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollablePage>
  );
}
