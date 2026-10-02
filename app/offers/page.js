'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatLkr } from '@/lib/data';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [tab, setTab] = useState('All Deals');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let active = true;

    fetch('/api/promos')
      .then((response) => {
        if (!response.ok) throw new Error('Request failed');
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setOffers(data);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  const tabs = useMemo(() => ['All Deals', ...Array.from(new Set(offers.map((offer) => offer.badge)))], [offers]);
  const visible = tab === 'All Deals' ? offers : offers.filter((offer) => offer.badge === tab);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // clipboard blocked: the code is still visible on the card
    }
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <header className="mb-8 text-center md:text-left">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-gradient-tropical mb-2">
          Exclusive Offers
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Copy a code and apply it at checkout. Discounts are checked when you place your order.
        </p>
      </header>

      {tabs.length > 2 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 mb-6 snap-x no-scrollbar">
          {tabs.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setTab(name)}
              className={
                'snap-start shrink-0 font-label-bold text-label-bold px-6 py-2 rounded-full shadow-md ' +
                (tab === name ? 'bg-primary text-on-primary' : 'glass-card text-on-surface hover:bg-primary-fixed/20')
              }
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin" />
        </div>
      ) : null}

      {status === 'error' ? (
        <p className="text-on-surface-variant py-8">Could not load offers. Please refresh and try again.</p>
      ) : null}

      {status === 'ready' && !offers.length ? (
        <p className="text-on-surface-variant py-8">No offers right now. Check back soon.</p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {visible.map((offer) => (
          <div key={offer.id} className="glass-card rounded-xl p-4 md:p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-fixed-dim/20 rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-500"></div>

            <div className="flex justify-between items-start mb-4">
              <div className="bg-surface-container-high p-2 rounded-lg text-primary">
                <span className="material-symbols-outlined text-3xl">local_offer</span>
              </div>
              <span className="bg-secondary-container text-on-secondary-container font-label-bold text-label-bold px-2 py-1 rounded text-xs uppercase tracking-wider">
                {offer.badge}
              </span>
            </div>

            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{offer.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-3">{offer.description}</p>

            <ul className="text-xs text-on-surface-variant mb-4 flex-grow flex flex-col gap-1">
              {offer.minSubtotal > 0 ? <li>Minimum order {formatLkr(offer.minSubtotal)}</li> : null}
              {offer.restaurantName ? <li>Valid at {offer.restaurantName} only</li> : null}
              {offer.expiresAt ? (
                <li>Ends {new Date(offer.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</li>
              ) : null}
            </ul>

            <div className="mt-auto pt-4 border-t border-outline-variant/30 flex items-center justify-between">
              <div className="border-2 border-dashed border-primary/30 bg-surface-container-lowest px-3 py-1.5 rounded-lg">
                <span className="font-label-bold text-label-bold text-primary font-mono tracking-widest">{offer.code}</span>
              </div>
              <button
                type="button"
                onClick={() => copyCode(offer.code)}
                className="text-secondary font-label-bold text-label-bold hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                {copied === offer.code ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}