'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-surface-variant border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-8 pb-12 px-4 md:px-8">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center opacity-90"
            style={{
              backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBLeGPX_Fzvw5LJQ6izgxwhMATeRVjxH-Kfm1D7luEyriixSeV7daXe2IaAv7m_1CBpdMiGgGK8_CANF3nQq_UqLg0TY-0C3UEhKr-uTd138ezhPMR_Lkst4ZMOq95Uyrol7fAgWudb2JBwScCtsOIc4JPsl6oRpScT_T9Nos9jOun0BePqto1iKN9rJYm2dJ7ov6eniQqiIFkxw0u6Un9ivEyOtxEbuTp0936T2CgKeNIhgTY4HLI')",
            }}
          />
          <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 glass-panel rounded-xl p-6 md:p-8 max-w-3xl w-full text-center mx-auto">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
            Authentic Sri Lankan Food, Delivered to Your Door
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 max-w-xl mx-auto">
            Experience the rich flavors of Sri Lanka from the comfort of your home. Fresh, hot, and fast delivery.
          </p>
          
          <div className="flex flex-col md:flex-row gap-3 bg-surface/80 p-3 rounded-lg border border-outline-variant/30 mb-6">
            <div className="flex items-center flex-1 bg-surface px-3 py-2 rounded border-b-2 border-secondary focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-outline mr-2">location_on</span>
              <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline" placeholder="Enter delivery address..." type="text" />
            </div>
            <div className="flex items-center flex-1 bg-surface px-3 py-2 rounded border-b-2 border-secondary focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-outline mr-2">search</span>
              <input className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline" placeholder="Search for food, restaurants..." type="text" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-8 py-3 rounded-lg font-label-bold text-label-bold hover:brightness-110 transition-all shadow-md">
              Order Now
            </button>
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-label-bold text-label-bold hover:bg-primary/5 transition-all">
              Explore Restaurants
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4 md:px-8 max-w-container-max mx-auto">
        <h2 className="font-headline-md text-headline-md text-primary mb-6 text-center md:text-left">
          Explore Categories
        </h2>
        <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar snap-x snap-mandatory">
          {[
            { name: 'Rice & Curry', icon: '🍛' },
            { name: 'Kottu', icon: '🍲' },
            { name: 'Hoppers', icon: '🥞' },
            { name: 'String Hoppers', icon: '🍜' },
            { name: 'Short Eats', icon: '🍢' },
            { name: 'Biryani', icon: '🍚' },
          ].map((category) => (
            <div key={category.name} className="flex-none w-[120px] sm:w-[150px] snap-start group cursor-pointer text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full overflow-hidden mb-2 border-4 border-surface-container shadow-sm group-hover:border-secondary transition-colors bg-surface-container flex items-center justify-center text-4xl">
                {category.icon}
              </div>
              <span className="font-label-bold text-label-bold text-on-surface group-hover:text-secondary">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
