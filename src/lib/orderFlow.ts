import type { ApiOrderStatus } from '@/types/api';

/**
 * Single source for the marketplace order state machine.
 * Mirrors the backend transitions (api/src/routes/orders.ts).
 */

export const ORDER_STEPS: { key: ApiOrderStatus; label: string }[] = [
  { key: 'CREATED', label: 'Order placed' },
  { key: 'PAYMENT_PENDING', label: 'Payment sent' },
  { key: 'PAYMENT_CONFIRMED', label: 'Payment confirmed' },
  { key: 'SHIPPING_ARRANGED', label: 'Shipped' },
  { key: 'COMPLETED', label: 'Completed' },
];

export function orderStepIndex(raw?: ApiOrderStatus): number {
  const i = ORDER_STEPS.findIndex((s) => s.key === raw);
  return i === -1 ? 0 : i;
}

export interface OrderAction {
  label: string;
  next: ApiOrderStatus;
}

/** The action available to the current viewer for this order state, if any. */
export function getOrderAction(
  raw: ApiOrderStatus | undefined,
  isBuyer: boolean,
  isSeller: boolean
): OrderAction | null {
  switch (raw) {
    case 'CREATED':
      return isBuyer ? { label: 'Mark as paid', next: 'PAYMENT_PENDING' } : null;
    case 'PAYMENT_PENDING':
      return isSeller ? { label: 'Confirm payment received', next: 'PAYMENT_CONFIRMED' } : null;
    case 'PAYMENT_CONFIRMED':
      return isSeller ? { label: 'Mark as shipped', next: 'SHIPPING_ARRANGED' } : null;
    case 'SHIPPING_ARRANGED':
      return isBuyer ? { label: 'Confirm received', next: 'COMPLETED' } : null;
    default:
      return null;
  }
}

/** Buyer can cancel before the order is shipped. */
export function canCancelOrder(raw: ApiOrderStatus | undefined, isBuyer: boolean): boolean {
  return isBuyer && (raw === 'CREATED' || raw === 'PAYMENT_PENDING' || raw === 'PAYMENT_CONFIRMED');
}

/** Hint shown when the order is waiting on the other party. */
export function waitingHint(raw: ApiOrderStatus | undefined, isBuyer: boolean): string | null {
  switch (raw) {
    case 'CREATED':
      return isBuyer ? null : 'Waiting for the buyer to pay';
    case 'PAYMENT_PENDING':
      return isBuyer ? 'Waiting for the seller to confirm your payment' : null;
    case 'PAYMENT_CONFIRMED':
      return isBuyer ? 'Waiting for the seller to ship' : null;
    case 'SHIPPING_ARRANGED':
      return isBuyer ? null : 'Waiting for the buyer to confirm delivery';
    default:
      return null;
  }
}
