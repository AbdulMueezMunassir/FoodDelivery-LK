'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import OrderActions from '@/app/components/OrderActions';
import { useCart } from '@/app/components/providers/CartProvider';
import { ORDER_FLOW } from '@/lib/order-status';
import { getOrderStatus, statusCopy } from '@/lib/orders';
import { formatLkr } from '@/lib/data';

export default function TrackOrder() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('order');
  const { orders } = useCart();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((user) => setUserId(user?.id ?? null))
      .catch(() => setUserId(null));
  }, []);

  const selected = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? orders[0],
    [orders, selectedId]
  );

  if (!orders.length) {
    return (
      <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto text-center">
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-3">No orders yet</h1>
        <p className="text-on-surface-variant mb-6">Place an order and you can follow it here in real time.</p>
        <Link href="/restaurants" className="text-secondary font-label-bold">
          Order food
        </Link>
      </div>
    );
  }

  const status = getOrderStatus(selected);
  const activeIndex = status === 'cancelled' ? -1 : ORDER_FLOW.indexOf(status);
  const isMine = Boolean(userId) && selected.userId === userId;

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-2">Track order</h1>
      <p className="text-on-surface-variant mb-6">
        {selected.id} · {selected.restaurantName}
      </p>

      <div className="glass-panel rounded-xl p-6 mb-8">
        <p className="font-headline-md text-headline-md text-primary">{statusCopy[status].label}</p>
        <p className="text-on-surface-variant mt-1 mb-6">{statusCopy[status].detail}</p>

        {status === 'cancelled' ? null : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ORDER_FLOW.map((step, index) => (
              <div
                key={step}
                className={
                  'rounded-lg px-3 py-3 text-sm font-label-bold ' +
                  (index <= activeIndex ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant/40 text-outline')
                }
              >
                {statusCopy[step].label}
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-on-surface-variant mt-6">
          Delivering to {selected.address} · {selected.phone}
        </p>
        <p className="font-label-bold text-primary mt-2">{formatLkr(selected.total)} · Cash on delivery</p>

        {isMine ? (
          <div className="mt-4">
            <OrderActions order={selected} actor="customer" showProgress={false} />
          </div>
        ) : null}
      </div>

      {orders.length > 1 ? (
        <section>
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Recent orders</h2>
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/track?order=${order.id}`}
                className="glass-card rounded-xl p-4 flex justify-between"
              >
                <span>
                  {order.id} · {order.restaurantName}
                </span>
                <span className="text-secondary font-label-bold">{statusCopy[getOrderStatus(order)].label}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}