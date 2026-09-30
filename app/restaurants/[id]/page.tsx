'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '@/app/components/providers/CartProvider';
import { formatLkr, Restaurant } from '@/lib/data';

type LoadState = 'loading' | 'ready' | 'missing' | 'error';

export default function RestaurantMenu({ params }: { params: { id: string } }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const { addItem } = useCart();
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    setLoadState('loading');

    fetch(`/api/restaurants/${params.id}`)
      .then(async (response) => {
        if (response.status === 404) {
          if (active) setLoadState('missing');
          return;
        }
        if (!response.ok) throw new Error('Request failed');

        const data = (await response.json()) as Restaurant;
        if (active) {
          setRestaurant(data);
          setLoadState('ready');
        }
      })
      .catch(() => {
        if (active) setLoadState('error');
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  const categories = useMemo(() => {
    if (!restaurant) return [];
    return Array.from(new Set(restaurant.menu.map((item) => item.category)));
  }, [restaurant]);

  if (loadState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (loadState !== 'ready' || !restaurant) {
    return (
      <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto text-center">
        <h1 className="font-headline-md text-headline-md text-primary mb-3">
          {loadState === 'error' ? 'Could not load this restaurant' : 'Restaurant not found'}
        </h1>
        <Link href="/restaurants" className="text-secondary font-label-bold">
          Back to restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <Link href="/restaurants" className="font-label-bold text-label-bold text-secondary hover:text-primary">
        ← All restaurants
      </Link>

      <div className="glass-panel rounded-xl p-6 md:p-8 mt-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border border-outline-variant bg-surface-container shrink-0 flex items-center justify-center text-4xl">
            {restaurant.image ? (
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <span>{restaurant.emoji}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-display-lg-mobile md:font-headline-md text-display-lg-mobile md:text-headline-md text-primary">
              {restaurant.name}
            </h1>
            <p className="text-on-surface-variant mt-1">{restaurant.description}</p>
            <p className="text-sm text-on-surface-variant mt-2">
              {restaurant.cuisine} · ⭐ {restaurant.rating} · 🕐 {restaurant.deliveryTime} · 🚚{' '}
              {restaurant.deliveryFee === 0 ? 'Free delivery' : formatLkr(restaurant.deliveryFee)}
            </p>
          </div>
        </div>
        {notice ? <p className="mt-4 text-sm text-secondary font-label-bold">{notice}</p> : null}
      </div>

      {categories.map((category) => (
        <section key={category} className="mb-8">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurant.menu
              .filter((item) => item.category === category)
              .map((item) => (
                <div key={item.id} className="glass-card rounded-xl p-4 flex flex-col">
                  <div className="flex justify-between gap-3">
                    <h3 className="font-label-bold text-label-bold text-on-surface">{item.name}</h3>
                    <span className="font-label-bold text-primary whitespace-nowrap">{formatLkr(item.price)}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1 mb-4 flex-grow">{item.description}</p>
                  <button
                    onClick={() => {
                      const added = addItem({
                        id: item.id,
                        restaurantId: restaurant.id,
                        restaurantName: restaurant.name,
                        name: item.name,
                        price: item.price,
                      });
                      if (added) setNotice(`${item.name} added to cart`);
                    }}
                    className="bg-tertiary-fixed-dim text-on-tertiary-fixed py-2 rounded-lg font-label-bold text-label-bold hover:brightness-110 transition-all"
                  >
                    Add to cart
                  </button>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}