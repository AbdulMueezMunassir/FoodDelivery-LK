'use client';

import { useState } from 'react';
import { useCart } from '@/app/components/providers/CartProvider';
import { ORDER_FLOW, OrderStatus, StatusActor, allowedTransitions } from '@/lib/order-status';
import { Order, getOrderStatus, statusCopy } from '@/lib/orders';

const actionLabel: Record<OrderStatus, string> = {
  confirmed: 'Confirm order',
  preparing: 'Start preparing',
  on_the_way: 'Send out for delivery',
  delivered: 'Mark as delivered',
  cancelled: 'Cancel order',
};

export default function OrderActions({
  order,
  actor,
  showProgress = true,
}: {
  order: Order;
  actor: StatusActor;
  showProgress?: boolean;
}) {
  const { updateOrderStatus } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const status = getOrderStatus(order);
  const actions = allowedTransitions(actor, status);
  const activeIndex = status === 'cancelled' ? -1 : ORDER_FLOW.indexOf(status);

  const run = async (next: OrderStatus) => {
    if (next === 'cancelled' && !window.confirm('Cancel this order? This cannot be undone.')) return;

    setBusy(true);
    setError('');
    const message = await updateOrderStatus(order.id, next);
    if (message) setError(message);
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {showProgress ? (
        status === 'cancelled' ? (
          <p className="rounded-lg bg-error-container text-on-error-container px-3 py-2 text-sm font-label-bold">
            {statusCopy.cancelled.label}
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ORDER_FLOW.map((step, index) => (
              <div
                key={step}
                className={
                  'rounded-lg px-2 py-2 text-xs font-label-bold text-center ' +
                  (index <= activeIndex
                    ? 'bg-secondary-container text-on-secondary-container'
                    : 'bg-surface-variant/60 text-outline')
                }
              >
                {statusCopy[step].label}
              </div>
            ))}
          </div>
        )
      ) : null}

      {actions.length ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((next) => (
            <button
              key={next}
              type="button"
              disabled={busy}
              onClick={() => void run(next)}
              className={
                'rounded-lg px-4 py-2 text-sm font-label-bold transition-all disabled:opacity-50 ' +
                (next === 'cancelled'
                  ? 'border border-error text-error hover:bg-error-container'
                  : 'bg-primary text-on-primary hover:brightness-110')
              }
            >
              {actionLabel[next]}
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}