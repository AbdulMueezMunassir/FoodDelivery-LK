'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/app/components/providers/CartProvider';
import { formatLkr } from '@/lib/data';
import { getOrderStatus, statusCopy } from '@/lib/orders';

const orderSteps = ['confirmed', 'preparing', 'on_the_way', 'delivered'] as const;

export default function AdminPage() {
  const { orders, updateOrderStatus } = useCart();
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | (typeof orderSteps)[number]>('all');
  const [restaurantFilter, setRestaurantFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
        <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
        <div className="glass-panel rounded-xl p-8 text-center max-w-xl mx-auto">
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-3">Access denied</h1>
          <p className="text-on-surface-variant mb-6">This admin dashboard is restricted to administrators only.</p>
          <Link href="/login" className="bg-primary text-on-primary px-5 py-3 rounded-full font-label-bold inline-block">
            Sign in as admin
          </Link>
        </div>
      </div>
    );
  }

  const restaurantOptions = Array.from(new Set(orders.map((order) => order.restaurantName))).sort();

  const filteredOrders = orders.filter((order) => {
    const currentStatus = getOrderStatus(order);
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    const matchesRestaurant = restaurantFilter === 'all' || order.restaurantName === restaurantFilter;
    const keyword = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !keyword ||
      order.id.toLowerCase().includes(keyword) ||
      order.customerName.toLowerCase().includes(keyword) ||
      order.phone.toLowerCase().includes(keyword) ||
      order.address.toLowerCase().includes(keyword);

    return matchesStatus && matchesRestaurant && matchesSearch;
  });

  const revenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = filteredOrders.length ? revenue / filteredOrders.length : 0;
  const deliveredCount = filteredOrders.filter((order) => getOrderStatus(order) === 'delivered').length;
  const activeCount = filteredOrders.filter((order) => getOrderStatus(order) !== 'delivered').length;

  const statusBreakdown: Record<(typeof orderSteps)[number], number> = {
    confirmed: 0,
    preparing: 0,
    on_the_way: 0,
    delivered: 0,
  };

  filteredOrders.forEach((order) => {
    const status = getOrderStatus(order);
    statusBreakdown[status] += 1;
  });

  const menuSales = filteredOrders.reduce<Record<string, number>>((acc, order) => {
    order.items.forEach((item) => {
      acc[item.name] = (acc[item.name] ?? 0) + item.qty;
    });
    return acc;
  }, {});

  const popularItems = Object.entries(menuSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([name, qty]) => ({ name, qty }));

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <div className="glass-panel rounded-xl p-6 mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-secondary mb-2">Admin access</p>
        <h1 className="font-display-lg-mobile md:font-headline-md text-display-lg-mobile md:text-headline-md text-primary">
          Welcome back, {user.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-on-surface-variant">Total orders</p>
          <p className="font-display-lg text-display-lg text-primary mt-2">{filteredOrders.length}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-on-surface-variant">Revenue</p>
          <p className="font-display-lg text-display-lg text-primary mt-2">{formatLkr(revenue)}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-on-surface-variant">Avg. order</p>
          <p className="font-display-lg text-display-lg text-primary mt-2">{formatLkr(averageOrderValue)}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-on-surface-variant">Active now</p>
          <p className="font-display-lg text-display-lg text-primary mt-2">{activeCount}</p>
        </div>
      </div>

      <div className="mb-8 flex justify-end">
        <Link href="/admin/restaurants" className="bg-primary text-on-primary px-5 py-3 rounded-full font-label-bold inline-block">
          Manage restaurants
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 mb-8">
        <section className="glass-panel rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline-md text-headline-md text-primary">Order pipeline</h2>
            <span className="text-sm text-on-surface-variant">{deliveredCount} delivered</span>
          </div>

          <div className="space-y-4">
            {orderSteps.map((step) => {
              const count = statusBreakdown[step];
              const percent = filteredOrders.length ? (count / filteredOrders.length) * 100 : 0;

              return (
                <div key={step}>
                  <div className="mb-1 flex items-center justify-between text-sm text-on-surface-variant">
                    <span>{statusCopy[step].label}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-variant/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-secondary to-primary"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass-panel rounded-xl p-6">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Popular items</h2>
          <div className="space-y-3">
            {popularItems.length ? (
              popularItems.map(({ name, qty }, index) => (
                <div key={name} className="flex items-center justify-between rounded-lg bg-surface-variant/50 px-3 py-2">
                  <div>
                    <p className="font-label-bold text-primary">#{index + 1} {name}</p>
                  </div>
                  <span className="rounded-full bg-secondary-container text-on-secondary-container px-2 py-1 text-xs font-label-bold">
                    {qty} sold
                  </span>
                </div>
              ))
            ) : (
              <p className="text-on-surface-variant">No sales data yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="glass-panel rounded-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <h2 className="font-headline-md text-headline-md text-primary">Order filters</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by customer, order, phone"
              className="bg-transparent border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-secondary min-w-[220px]"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | (typeof orderSteps)[number])}
              className="bg-transparent border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-secondary"
            >
              <option value="all">All statuses</option>
              {orderSteps.map((step) => (
                <option key={step} value={step}>{statusCopy[step].label}</option>
              ))}
            </select>
            <select
              value={restaurantFilter}
              onChange={(event) => setRestaurantFilter(event.target.value)}
              className="bg-transparent border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-secondary"
            >
              <option value="all">All restaurants</option>
              {restaurantOptions.map((restaurantName) => (
                <option key={restaurantName} value={restaurantName}>{restaurantName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <p className="text-on-surface-variant">No orders match the current filters.</p>
          ) : (
            filteredOrders.map((order) => {
              const currentStatus = getOrderStatus(order);
              const currentIndex = orderSteps.indexOf(currentStatus);

              return (
                <div key={order.id} className="rounded-xl border border-outline-variant/50 p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <div>
                      <p className="font-label-bold text-primary">{order.id}</p>
                      <p className="text-sm text-on-surface-variant">{order.customerName} · {order.phone}</p>
                    </div>
                    <div className="text-sm text-on-surface-variant md:text-right">
                      <p>{order.restaurantName}</p>
                      <p>{formatLkr(order.total)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {orderSteps.map((step, index) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => updateOrderStatus(order.id, step)}
                        className={
                          'rounded-lg px-2 py-2 text-xs font-label-bold transition-colors ' +
                          (index <= currentIndex
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-variant/60 text-outline')
                        }
                      >
                        {statusCopy[step].label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-sm text-on-surface-variant">
                    <p>{order.address}</p>
                    <p className="font-label-bold text-secondary">{statusCopy[currentStatus].label}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
