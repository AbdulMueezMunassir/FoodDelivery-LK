'use client';

import Link from 'next/link';
import { useCart } from '@/app/components/providers/CartProvider';
import { formatLkr } from '@/lib/data';

export default function CartPage() {
  const { items, setQty, removeItem, subtotal, deliveryFee, total, restaurantName } = useCart();

  if (!items.length) {
    return (
      <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto text-center">
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-3">Your cart is empty</h1>
        <p className="text-on-surface-variant mb-6">Add a few dishes from a restaurant nearby.</p>
        <Link
          href="/restaurants"
          className="inline-block bg-tertiary-fixed-dim text-on-tertiary-fixed px-8 py-3 rounded-lg font-label-bold"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <h1 className="font-display-lg-mobile md:font-headline-md text-display-lg-mobile md:text-headline-md text-primary mb-2">
        Cart
      </h1>
      <p className="text-on-surface-variant mb-6">From {restaurantName}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.id} className="glass-card rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-label-bold text-on-surface">{item.name}</h3>
                <p className="text-sm text-on-surface-variant">{formatLkr(item.price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(item.id, item.qty - 1)}
                  className="w-8 h-8 rounded-full border border-outline-variant text-primary"
                >
                  −
                </button>
                <span className="w-6 text-center font-label-bold">{item.qty}</span>
                <button
                  onClick={() => setQty(item.id, item.qty + 1)}
                  className="w-8 h-8 rounded-full border border-outline-variant text-primary"
                >
                  +
                </button>
                <button onClick={() => removeItem(item.id)} className="text-error text-sm font-label-bold ml-2">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="glass-panel rounded-xl p-6 h-fit">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Summary</h2>
          <div className="flex justify-between text-on-surface-variant mb-2">
            <span>Subtotal</span>
            <span>{formatLkr(subtotal)}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant mb-4">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? 'Free' : formatLkr(deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-label-bold text-primary border-t border-outline-variant/30 pt-4 mb-6">
            <span>Total</span>
            <span>{formatLkr(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="block text-center bg-tertiary-fixed-dim text-on-tertiary-fixed py-3 rounded-lg font-label-bold hover:brightness-110"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
