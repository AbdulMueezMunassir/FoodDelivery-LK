'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/components/providers/CartProvider';
import { formatLkr } from '@/lib/data';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, restaurantName, placeOrder } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((user) => {
        if (user?.name) setCustomerName(user.name);
      })
      .catch(() => {});
  }, []);

  if (!items.length) {
    return (
      <div className="pt-24 pb-12 px-4 text-center">
        <h1 className="font-headline-md text-primary mb-3">Nothing to checkout</h1>
        <Link href="/restaurants" className="text-secondary font-label-bold">
          Browse restaurants
        </Link>
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError('Name, phone, and delivery address are required.');
      return;
    }

    const order = await placeOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });

    if (!order) {
      setError('Could not place the order. Try again.');
      return;
    }

    router.push(`/track?order=${order.id}`);
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 glass-panel rounded-xl p-6 flex flex-col gap-5">
          {error ? <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">{error}</div> : null}
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Full name"
            className="w-full bg-transparent border-b-2 border-outline-variant focus:border-secondary pt-4 pb-1 px-2 outline-none"
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Phone number"
            className="w-full bg-transparent border-b-2 border-outline-variant focus:border-secondary pt-4 pb-1 px-2 outline-none"
          />
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Delivery address"
            rows={3}
            className="w-full bg-transparent border-b-2 border-outline-variant focus:border-secondary pt-4 pb-1 px-2 outline-none resize-none"
          />
          <p className="text-sm text-on-surface-variant">Payment: Cash on delivery</p>
          <button type="submit" className="bg-tertiary-fixed-dim text-on-tertiary-fixed py-3 rounded-lg font-label-bold">
            Place order · {formatLkr(total)}
          </button>
        </form>

        <aside className="glass-card rounded-xl p-6 h-fit">
          <h2 className="font-headline-md text-headline-md text-primary mb-3">{restaurantName}</h2>
          <ul className="text-sm text-on-surface-variant flex flex-col gap-2 mb-4">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.qty}× {item.name}
                </span>
                <span>{formatLkr(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between text-on-surface-variant">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? 'Free' : formatLkr(deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-label-bold text-primary mt-3">
            <span>Total</span>
            <span>{formatLkr(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
