'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/app/components/providers/CartProvider';
import { getOrderStatus, statusCopy } from '@/lib/orders';
import { formatLkr } from '@/lib/data';

type AuthUser = { name: string; email: string; role?: string };

export default function ProfilePage() {
  const { orders } = useCart();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-6">Profile</h1>

      {user ? (
        <div className="glass-panel rounded-xl p-6 mb-8">
          <h2 className="font-headline-md text-headline-md text-primary">{user.name}</h2>
          <p className="text-on-surface-variant mt-1">{user.email}</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <p className="text-sm text-outline capitalize">{user.role || 'customer'}</p>
            {user.role === 'admin' ? (
              <Link href="/admin" className="bg-secondary text-on-secondary px-4 py-2 rounded-full font-label-bold text-sm">
                Admin dashboard
              </Link>
            ) : user.role === 'owner' ? (
              <Link href="/owner" className="bg-secondary text-on-secondary px-4 py-2 rounded-full font-label-bold text-sm">
                Owner dashboard
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-xl p-6 mb-8">
          <p className="text-on-surface-variant mb-4">Sign in to save your details for faster checkout.</p>
          <Link href="/login" className="bg-primary text-on-primary px-5 py-2 rounded-full font-label-bold inline-block">
            Sign in
          </Link>
        </div>
      )}

      <h2 className="font-headline-md text-headline-md text-primary mb-4">Order history</h2>
      {!orders.length ? (
        <p className="text-on-surface-variant">
          No orders yet.{' '}
          <Link href="/restaurants" className="text-secondary font-label-bold">
            Start an order
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/track?order=${order.id}`} className="glass-card rounded-xl p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-label-bold text-on-surface">{order.restaurantName}</p>
                  <p className="text-sm text-on-surface-variant">
                    {order.id} · {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-label-bold text-primary">{formatLkr(order.total)}</p>
                  <p className="text-sm text-secondary">{statusCopy[getOrderStatus(order)].label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
