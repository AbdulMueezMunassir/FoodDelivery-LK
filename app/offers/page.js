'use client';

export default function Offers() {
  const offers = [
    {
      id: 1,
      title: '20% OFF First Order',
      subtitle: 'New Users',
      description: 'Experience the vibrant taste of Colombo with a special discount on your first culinary journey.',
      code: 'WELCOME20',
      type: 'New Users'
    },
    {
      id: 2,
      title: 'Free Delivery',
      subtitle: 'Weekend Special',
      description: 'Enjoy free delivery all weekend on orders over LKR 3,000.',
      code: 'FREEDEL',
      type: 'Weekend Special'
    },
    {
      id: 3,
      title: 'LKR 500 Off',
      subtitle: 'Restaurant Deal',
      description: "On orders from 'Ministry of Crab' over LKR 5,000.",
      code: 'CRAB500',
      type: 'Restaurant Deal'
    },
    {
      id: 4,
      title: 'Buy 1 Get 1 Free',
      subtitle: 'Morning Fix',
      description: 'On all Ceylon Teas and Coffees from 7 AM to 10 AM.',
      code: 'WAKEUP',
      type: 'Morning Fix'
    },
    {
      id: 5,
      title: '15% Off Kottu',
      subtitle: 'Spicy Deal',
      description: 'Valid on all Kottu Roti orders across selected restaurants.',
      code: 'KOTTU15',
      type: 'Spicy Deal'
    },
    {
      id: 6,
      title: 'Avurudu Feast',
      subtitle: 'Seasonal',
      description: 'LKR 1,000 off on traditional sweetmeat platters.',
      code: 'AVURUDU',
      type: 'Seasonal'
    },
  ];

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('✅ Code copied: ' + code);
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <header className="mb-8 text-center md:text-left">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-gradient-tropical mb-2">
          Exclusive Offers
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
          Discover authentic Sri Lankan flavors with our premium deals and seasonal promotions.
        </p>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-6 snap-x no-scrollbar">
        {['All Deals', 'New Users', 'Restaurant Deals', 'Seasonal'].map((tab) => (
          <button
            key={tab}
            className={'snap-start shrink-0 font-label-bold text-label-bold px-6 py-2 rounded-full shadow-md ' + (tab === 'All Deals' ? 'bg-primary text-on-primary' : 'glass-card text-on-surface hover:bg-primary-fixed/20')}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {offers.map((offer) => (
          <div key={offer.id} className="glass-card rounded-xl p-4 md:p-6 flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-fixed-dim/20 rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-500"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="bg-surface-container-high p-2 rounded-lg text-primary">
                <span className="material-symbols-outlined text-3xl">local_offer</span>
              </div>
              <span className="bg-secondary-container text-on-secondary-container font-label-bold text-label-bold px-2 py-1 rounded text-xs uppercase tracking-wider">
                {offer.type}
              </span>
            </div>
            
            <h3 className="font-headline-md text-headline-md text-on-surface mb-1">{offer.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4 flex-grow">{offer.description}</p>
            
            <div className="mt-auto pt-4 border-t border-outline-variant/30 flex items-center justify-between">
              <div className="border-2 border-dashed border-primary/30 bg-surface-container-lowest px-3 py-1.5 rounded-lg">
                <span className="font-label-bold text-label-bold text-primary font-mono tracking-widest">{offer.code}</span>
              </div>
              <button 
                onClick={() => copyCode(offer.code)}
                className="text-secondary font-label-bold text-label-bold hover:text-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span> Copy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
