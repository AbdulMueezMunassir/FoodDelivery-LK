'use client';

export default function Restaurants() {
  const restaurants = [
    { id: 1, name: 'Ceylon Spice House', cuisine: 'Sri Lankan', rating: 4.8, deliveryTime: '20-30 min', deliveryFee: 150 },
    { id: 2, name: 'Colombo Kottu Hut', cuisine: 'Street Food', rating: 4.6, deliveryTime: '15-25 min', deliveryFee: 0 },
    { id: 3, name: 'The Hopper Bowl', cuisine: 'Sri Lankan', rating: 4.9, deliveryTime: '30-45 min', deliveryFee: 200 },
    { id: 4, name: 'Galle Face Seafood', cuisine: 'Seafood', rating: 4.7, deliveryTime: '25-35 min', deliveryFee: 180 },
    { id: 5, name: 'Kandy Spice House', cuisine: 'Sri Lankan', rating: 4.5, deliveryTime: '30-40 min', deliveryFee: 120 },
  ];

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">
        Restaurants Near You
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
        Discover authentic Sri Lankan restaurants in Colombo
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="glass-card rounded-xl overflow-hidden group cursor-pointer">
            <div className="h-48 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center text-6xl">
              🍽️
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
                <span>🚚 {restaurant.deliveryFee === 0 ? 'Free' : 'Rs. ' + restaurant.deliveryFee}</span>
              </div>
              <button className="w-full mt-3 bg-tertiary-fixed-dim text-on-tertiary-fixed py-2 rounded-lg font-label-bold text-label-bold hover:brightness-110 transition-all">
                View Menu
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
