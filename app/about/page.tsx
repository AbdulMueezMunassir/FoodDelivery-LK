export default function About() {
  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-container-max mx-auto">
      <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4">
        About FoodDelivery LK
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-6">
        FoodDelivery LK is Sri Lanka's premier food delivery platform, connecting food lovers with the best local restaurants.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🍛</div>
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Authentic Cuisine</h3>
          <p className="text-on-surface-variant">Discover genuine Sri Lankan flavors from trusted local restaurants.</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Fast Delivery</h3>
          <p className="text-on-surface-variant">Hot, fresh food delivered to your doorstep in under 30 minutes.</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">💚</div>
          <h3 className="font-headline-md text-headline-md text-primary mb-2">Support Local</h3>
          <p className="text-on-surface-variant">Supporting Sri Lankan restaurants and local food businesses.</p>
        </div>
      </div>
    </div>
  );
}
