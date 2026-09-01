'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/restaurants', label: 'Restaurants' },
    { href: '/offers', label: 'Offers' },
    { href: '/track', label: 'Track Order' },
    { href: '/about', label: 'About' },
  ];

  if (loading) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-xl">
        <div className="flex items-center justify-between px-6 py-3 max-w-container-max mx-auto">
          <span className="font-display-lg text-display-lg text-primary tracking-tight">FoodDelivery LK</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 max-w-container-max mx-auto">
        <Link href="/" className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight hover:scale-105 transition-transform duration-200">
          FoodDelivery LK
        </Link>

        <div className="hidden md:flex items-center gap-6 font-body-md text-body-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? 'text-tertiary border-b-2 border-tertiary pb-1 font-bold hover:scale-105 transition-transform duration-200 hover:text-secondary'
                    : 'text-on-surface-variant hover:scale-105 transition-transform duration-200 hover:text-secondary'
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="text-primary hover:text-secondary transition-colors font-body-md text-body-md">
                {user?.name}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-error text-on-error px-4 py-2 rounded-full font-label-bold text-label-bold hover:bg-error/80 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/login')}
                className="font-body-md text-body-md text-primary hover:text-secondary transition-colors hidden md:block"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-bold text-label-bold hover:bg-secondary transition-colors hidden md:block"
              >
                Sign Up
              </button>
            </div>
          )}

          <button className="text-primary hover:text-secondary transition-colors relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute -top-1 -right-1 bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              0
            </span>
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-primary"
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-white/20 px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? 'bg-tertiary/10 text-tertiary font-bold py-2 px-3 rounded-lg'
                    : 'text-on-surface-variant hover:bg-surface-variant/20 py-2 px-3 rounded-lg'
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="py-2 px-3 text-on-surface-variant hover:bg-surface-variant/20 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                Profile
              </Link>
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="py-2 px-3 text-error text-left hover:bg-error/10 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { router.push('/login'); setIsMenuOpen(false); }}
                className="py-2 px-3 text-primary hover:bg-surface-variant/20 rounded-lg text-left"
              >
                Sign In
              </button>
              <button
                onClick={() => { router.push('/register'); setIsMenuOpen(false); }}
                className="py-2 px-3 bg-primary text-on-primary rounded-lg text-center"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}