import type { ApiOrderStatus } from '@/types/api';

/**
 * Single source for the marketplace order state machine.
 * Mirrors the backend transitions (api/src/routes/orders.ts).
 * Labels are i18n keys under the `orders.*` namespace — screens call t().
 */

export const ORDER_STEPS: { key: ApiOrderStatus; labelKey: string }[] = [
  { key: 'CREATED', labelKey: 'orders.steps.CREATED' },
  { key: 'PAYMENT_PENDING', labelKey: 'orders.steps.PAYMENT_PENDING' },
  { key: 'PAYMENT_CONFIRMED', labelKey: 'orders.steps.PAYMENT_CONFIRMED' },
  { key: 'SHIPPING_ARRANGED', labelKey: 'orders.steps.SHIPPING_ARRANGED' },
  { key: 'COMPLETED', labelKey: 'orders.steps.COMPLETED' },
];

export function orderStepIndex(raw?: ApiOrderStatus): number {
  const i = ORDER_STEPS.findIndex((s) => s.key === raw);
  return i === -1 ? 0 : i;
}

export interface OrderAction {
  labelKey: string;
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
      return isBuyer ? { labelKey: 'orders.actions.markPaid', next: 'PAYMENT_PENDING' } : null;
    case 'PAYMENT_PENDING':
      return isSeller ? { labelKey: 'orders.actions.confirmPayment', next: 'PAYMENT_CONFIRMED' } : null;
    case 'PAYMENT_CONFIRMED':
      return isSeller ? { labelKey: 'orders.actions.markShipped', next: 'SHIPPING_ARRANGED' } : null;
    case 'SHIPPING_ARRANGED':
      return isBuyer ? { labelKey: 'orders.actions.confirmReceived', next: 'COMPLETED' } : null;
    default:
      return null;
  }
}

/** Buyer can cancel before the order is shipped. */
export function canCancelOrder(raw: ApiOrderStatus | undefined, isBuyer: boolean): boolean {
  return isBuyer && (raw === 'CREATED' || raw === 'PAYMENT_PENDING' || raw === 'PAYMENT_CONFIRMED');
}

/** Hint (i18n key) shown when the order is waiting on the other party. */
export function waitingHintKey(raw: ApiOrderStatus | undefined, isBuyer: boolean): string | null {
  switch (raw) {
    case 'CREATED':
      return isBuyer ? null : 'orders.hints.waitBuyerPay';
    case 'PAYMENT_PENDING':
      return isBuyer ? 'orders.hints.waitSellerConfirm' : null;
    case 'PAYMENT_CONFIRMED':
      return isBuyer ? 'orders.hints.waitSellerShip' : null;
    case 'SHIPPING_ARRANGED':
      return isBuyer ? null : 'orders.hints.waitBuyerConfirm';
    default:
      return null;
  }
}
