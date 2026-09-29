'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { restaurants, formatLkr } from '@/lib/data';

export default function Restaurants() {
  const [restaurantList, setRestaurantList] = useState(restaurants);

  useEffect(() => {
    fetch('/api/restaurants')
      .then((response) => (response.ok ? response.json() : restaurants))
      .then((data) => setRestaurantList(data))
      .catch(() => setRestaurantList(restaurants));
  }, []);

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">
        Restaurants Near You
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
        Discover authentic Sri Lankan restaurants in Colombo
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurantList.map((restaurant) => (
          <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="glass-card rounded-xl overflow-hidden group">
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-headline-md text-headline-md text-primary">{restaurant.name}</h3>
                <span className="flex items-center gap-1 text-tertiary-fixed-dim">
                  ⭐ {restaurant.rating}
                </span>
              </div>
              <p className="text-on-surface-variant text-sm mb-2">{restaurant.cuisine}</p>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>🕐 {restaurant.deliveryTime}</span>
                <span>🚚 {restaurant.deliveryFee === 0 ? 'Free' : formatLkr(restaurant.deliveryFee)}</span>
              </div>
              <span className="block w-full mt-3 bg-tertiary-fixed-dim text-on-tertiary-fixed py-2 rounded-lg font-label-bold text-label-bold text-center group-hover:brightness-110 transition-all">
                View Menu
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
