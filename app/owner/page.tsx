'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import OrderActions from '@/app/components/OrderActions';
import { useCart } from '@/app/components/providers/CartProvider';
import { formatLkr, Restaurant } from '@/lib/data';
import { getOrderStatus } from '@/lib/orders';

export default function OwnerDashboard() {
  const { orders } = useCart();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const authResponse = await fetch('/api/auth/me');
        const currentUser = authResponse.ok ? await authResponse.json() : null;
        if (!active) return;
        setUser(currentUser);
        if (currentUser?.role === 'owner') {
          const restaurantResponse = await fetch('/api/restaurants?scope=manage');
          if (restaurantResponse.ok) setRestaurants(await restaurantResponse.json());
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadDashboard();
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin" /></div>;
  }

  if (user?.role !== 'owner') {
    return (
      <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto text-center">
        <h1 className="font-headline-md text-headline-md text-primary mb-3">Owner access required</h1>
        <p className="text-on-surface-variant mb-6">This dashboard is available to restaurant owners.</p>
        <Link href={user?.role === 'admin' ? '/admin' : '/login'} className="text-secondary font-label-bold">
          {user?.role === 'admin' ? 'Go to admin dashboard' : 'Sign in'}
        </Link>
      </div>
    );
  }

  const ownerOrders = orders.filter((order) => restaurants.some((restaurant) => restaurant.id === order.restaurantId));
  const activeOrders = ownerOrders.filter((order) => {
    const status = getOrderStatus(order);
    return status !== 'delivered' && status !== 'cancelled';
  });
  const revenue = ownerOrders
    .filter((order) => getOrderStatus(order) !== 'cancelled')
    .reduce((total, order) => total + order.total, 0);
  const menuCount = restaurants.reduce((total, restaurant) => total + restaurant.menu.length, 0);

  return (
    <main className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-secondary mb-2">Restaurant operations</p>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">Welcome, {user.name}</h1>
        </div>
        <Link href="/admin/restaurants" className="bg-primary text-on-primary px-5 py-3 rounded-full font-label-bold text-center">
          Manage restaurants and menus
        </Link>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5"><p className="text-sm text-on-surface-variant">Your restaurants</p><p className="font-display-lg text-display-lg text-primary mt-2">{restaurants.length}</p></div>
        <div className="glass-card rounded-xl p-5"><p className="text-sm text-on-surface-variant">Menu items</p><p className="font-display-lg text-display-lg text-primary mt-2">{menuCount}</p></div>
        <div className="glass-card rounded-xl p-5"><p className="text-sm text-on-surface-variant">Active orders</p><p className="font-display-lg text-display-lg text-primary mt-2">{activeOrders.length}</p></div>
        <div className="glass-card rounded-xl p-5"><p className="text-sm text-on-surface-variant">Order sales</p><p className="font-display-lg text-display-lg text-primary mt-2">{formatLkr(revenue)}</p></div>
      </section>

      <section className="glass-panel rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="font-headline-md text-headline-md text-primary">Assigned restaurants</h2>
          <span className="text-sm text-on-surface-variant">{restaurants.length} total</span>
        </div>
        {restaurants.length ? (
          <div className="divide-y divide-outline-variant/50">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-label-bold text-primary">{restaurant.emoji} {restaurant.name}</p>
                  <p className="text-sm text-on-surface-variant">{restaurant.cuisine} · {restaurant.menu.length} menu items · ⭐ {restaurant.rating}</p>
                </div>
                <Link href="/admin/restaurants" className="text-secondary font-label-bold text-sm">Edit listing and menu</Link>
              </div>
            ))}
          </div>
        ) : <p className="text-on-surface-variant">No restaurants are assigned to this account yet.</p>}
      </section>

      <section className="glass-panel rounded-xl p-6">
        <h2 className="font-headline-md text-headline-md text-primary mb-5">Recent orders</h2>
        <div className="space-y-4">
          {ownerOrders.length ? ownerOrders.slice(0, 12).map((order) => (
            <article key={order.id} className="rounded-lg border border-outline-variant/60 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div><p className="font-label-bold text-primary">{order.id}</p><p className="text-sm text-on-surface-variant">{order.customerName} · {order.restaurantName}</p></div>
                <p className="font-label-bold text-primary">{formatLkr(order.total)}</p>
              </div>
              <OrderActions order={order} actor="owner" />
            </article>
          )) : <p className="text-on-surface-variant">No orders for your restaurants yet.</p>}
        </div>
      </section>
    </main>
  );
}