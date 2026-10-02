'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/components/providers/CartProvider';
import { formatLkr } from '@/lib/data';

type AuthState = 'checking' | 'guest' | 'user';

const AFTER_LOGIN_KEY = 'fdlk-after-login';
const PHONE_PATTERN = /^[0-9+()\-\s]{7,20}$/;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, restaurantName, placeOrder } = useCart();
  const [auth, setAuth] = useState<AuthState>('checking');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((user) => {
        if (user) {
          setAuth('user');
          if (user.name) setCustomerName((current) => current || user.name);
        } else {
          setAuth('guest');
        }
      })
      .catch(() => setAuth('guest'));
  }, []);

  // Remember where to come back to after the guest signs in.
  useEffect(() => {
    if (auth !== 'guest') return;
    try {
      sessionStorage.setItem(AFTER_LOGIN_KEY, '/checkout');
    } catch {
      // sessionStorage unavailable: login will simply return to the home page
    }
  }, [auth]);

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
    if (submitting) return;
    setError('');

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError('Name, phone, and delivery address are required.');
      return;
    }

    if (!PHONE_PATTERN.test(phone.trim())) {
      setError('Enter a valid phone number, for example 0771234567.');
      return;
    }

    setSubmitting(true);

    const order = await placeOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });

    if (!order) {
      // Find out whether the session expired, or whether it was something else.
      const me = await fetch('/api/auth/me').catch(() => null);
      if (!me || !me.ok) {
        setAuth('guest');
      } else {
        setError('We could not place your order. Please check your details and try again.');
      }
      setSubmitting(false);
      return;
    }

    router.push(`/track?order=${order.id}`);
  };

  const inputClass =
    'w-full bg-transparent border-b-2 border-outline-variant focus:border-secondary pt-4 pb-1 px-2 outline-none';

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {auth === 'checking' ? (
          <div className="lg:col-span-2 glass-panel rounded-xl p-6 flex items-center justify-center min-h-[240px]">
            <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin" />
          </div>
        ) : null}

        {auth === 'guest' ? (
          <div className="lg:col-span-2 glass-panel rounded-xl p-6 flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md text-primary">Sign in to place your order</h2>
            <p className="text-on-surface-variant">
              Your cart is saved. Sign in or create an account and you will come straight back here to finish.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="bg-primary text-on-primary px-6 py-3 rounded-full font-label-bold hover:brightness-110 transition-all"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="border border-primary text-primary px-6 py-3 rounded-full font-label-bold hover:bg-surface-variant/40 transition-all"
              >
                Create account
              </Link>
            </div>
          </div>
        ) : null}

        {auth === 'user' ? (
          <form onSubmit={handleSubmit} className="lg:col-span-2 glass-panel rounded-xl p-6 flex flex-col gap-5">
            {error ? (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm">{error}</div>
            ) : null}
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Full name"
              maxLength={100}
              className={inputClass}
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone number"
              inputMode="tel"
              maxLength={20}
              className={inputClass}
            />
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Delivery address"
              rows={3}
              maxLength={300}
              className={inputClass + ' resize-none'}
            />
            <p className="text-sm text-on-surface-variant">Payment: Cash on delivery</p>
            <button
              type="submit"
              disabled={submitting}
              className="bg-tertiary-fixed-dim text-on-tertiary-fixed py-3 rounded-lg font-label-bold disabled:opacity-60"
            >
              {submitting ? 'Placing order…' : `Place order · ${formatLkr(total)}`}
            </button>
          </form>
        ) : null}

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