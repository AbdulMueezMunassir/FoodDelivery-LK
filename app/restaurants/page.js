'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SafeImage from '@/app/components/SafeImage';
import { formatLkr } from '@/lib/data';

export default function Restaurants() {
  const [restaurantList, setRestaurantList] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');

  // Coming from the home page: /restaurants?q=kottu
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    let active = true;

    fetch('/api/restaurants')
      .then((response) => {
        if (!response.ok) throw new Error('Request failed');
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setRestaurantList(data);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const cuisines = useMemo(
    () => ['All', ...Array.from(new Set(restaurantList.map((restaurant) => restaurant.cuisine))).sort()],
    [restaurantList]
  );

  const visible = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return restaurantList.filter((restaurant) => {
      if (cuisine !== 'All' && restaurant.cuisine !== cuisine) return false;
      if (!words.length) return true;

      const haystack = [
        restaurant.name,
        restaurant.cuisine,
        restaurant.description,
        ...restaurant.menu.flatMap((item) => [item.name, item.category]),
      ]
        .join(' ')
        .toLowerCase();

      return words.every((word) => haystack.includes(word));
    });
  }, [restaurantList, query, cuisine]);

  const filtersActive = query.trim() !== '' || cuisine !== 'All';

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">
        Restaurants Near You
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
        Discover authentic Sri Lankan restaurants in Colombo
      </p>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center bg-surface px-3 py-2 rounded-lg border border-outline-variant focus-within:border-primary transition-colors max-w-xl">
          <span className="material-symbols-outlined text-outline mr-2">search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search restaurants or dishes, e.g. kottu"
            className="w-full bg-transparent border-none focus:ring-0 outline-none text-on-surface placeholder:text-outline"
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} className="text-outline hover:text-primary px-1" aria-label="Clear search">
              ✕
            </button>
          ) : null}
        </div>

        {cuisines.length > 2 ? (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {cuisines.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCuisine(name)}
                className={
                  'shrink-0 px-4 py-2 rounded-full text-sm font-label-bold transition-colors ' +
                  (cuisine === name
                    ? 'bg-primary text-on-primary'
                    : 'glass-card text-on-surface hover:bg-primary-fixed/20')
                }
              >
                {name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {status === 'loading' ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : null}

      {status === 'error' ? (
        <p className="text-on-surface-variant py-8">Could not load restaurants. Please refresh and try again.</p>
      ) : null}

      {status === 'ready' && !restaurantList.length ? (
        <p className="text-on-surface-variant py-8">No restaurants are available yet.</p>
      ) : null}

      {status === 'ready' && restaurantList.length > 0 ? (
        <p className="text-sm text-on-surface-variant mb-4">
          {visible.length} {visible.length === 1 ? 'restaurant' : 'restaurants'}
          {filtersActive ? (
            <>
              {' '}·{' '}
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setCuisine('All');
                }}
                className="text-secondary font-label-bold"
              >
                Clear filters
              </button>
            </>
          ) : null}
        </p>
      ) : null}

      {status === 'ready' && restaurantList.length > 0 && !visible.length ? (
        <p className="text-on-surface-variant py-8">Nothing matches your search. Try a different word or clear the filters.</p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((restaurant) => (
          <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`} className="glass-card rounded-xl overflow-hidden group">
            <div className="relative h-48 w-full overflow-hidden bg-surface-container">
              <SafeImage
                src={restaurant.image}
                alt={restaurant.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                fallback={
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">{restaurant.emoji}</div>
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-headline-md text-headline-md text-primary">{restaurant.name}</h3>
                <span className="flex items-center gap-1 text-tertiary-fixed-dim">⭐ {restaurant.rating}</span>
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