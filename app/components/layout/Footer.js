export default function Footer() {
  return (
    <footer className="bg-primary w-full mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 px-4 md:px-6 py-6 max-w-container-max mx-auto">
        <div className="col-span-1 md:col-span-1 flex flex-col justify-center">
          <span className="font-display-lg-mobile text-display-lg-mobile text-primary-fixed mb-2">
            FoodDelivery LK
          </span>
          <p className="font-body-md text-body-md text-primary-fixed-dim">
            Authentic Sri Lankan Flavors.
          </p>
        </div>
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-3 md:gap-6 justify-center items-center">
          <a href="#" className="font-body-md text-body-md text-primary-fixed-dim hover:text-tertiary-fixed transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="font-body-md text-body-md text-primary-fixed-dim hover:text-tertiary-fixed transition-colors">
            Terms of Service
          </a>
          <a href="#" className="font-body-md text-body-md text-primary-fixed-dim hover:text-tertiary-fixed transition-colors">
            Contact Us
          </a>
          <a href="#" className="font-body-md text-body-md text-primary-fixed-dim hover:text-tertiary-fixed transition-colors">
            Partner with Us
          </a>
        </div>
        <div className="col-span-1 md:col-span-1 flex flex-col justify-center items-end text-right">
          <p className="font-body-md text-body-md text-primary-fixed-dim">
            &copy; 2024 FoodDelivery LK
          </p>
        </div>
      </div>
    </footer>
  );
}