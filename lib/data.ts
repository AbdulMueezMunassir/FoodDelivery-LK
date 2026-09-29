export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
};

export type Restaurant = {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  emoji: string;
  image: string;
  description: string;
  menu: MenuItem[];
};

const RESTAURANTS_STORAGE_KEY = 'fdlk-restaurants';

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: 'Ceylon Spice House',
    cuisine: 'Sri Lankan',
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: 150,
    emoji: '🍛',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    description: 'Home-style rice and curry with roasted spices from Colombo kitchens.',
    menu: [
      { id: 'csh-1', name: 'Chicken Curry Rice Pack', description: 'Red rice, chicken curry, dhal, mallung, papadam', price: 890, category: 'Rice & Curry' },
      { id: 'csh-2', name: 'Fish Ambul Thiyal Pack', description: 'Sour fish curry with coconut sambol and tempered potatoes', price: 980, category: 'Rice & Curry' },
      { id: 'csh-3', name: 'Jackfruit Curry Veg Pack', description: 'Polos curry, dhal, brinjal moju, and seeni sambol', price: 750, category: 'Rice & Curry' },
      { id: 'csh-4', name: 'Watalappan', description: 'Jaggery coconut pudding with cashews', price: 320, category: 'Dessert' },
    ],
  },
  {
    id: 2,
    name: 'Colombo Kottu Hut',
    cuisine: 'Street Food',
    rating: 4.6,
    deliveryTime: '15-25 min',
    deliveryFee: 0,
    emoji: '🍲',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    description: 'Late-night kottu chopped to order on a hot iron sheet.',
    menu: [
      { id: 'ckh-1', name: 'Chicken Kottu', description: 'Godamba roti, leeks, egg, and spicy chicken', price: 850, category: 'Kottu' },
      { id: 'ckh-2', name: 'Cheese Kottu', description: 'Extra mozzarella melt with chilli paste', price: 990, category: 'Kottu' },
      { id: 'ckh-3', name: 'Seafood Kottu', description: 'Prawns, cuttlefish, and garlic butter', price: 1290, category: 'Kottu' },
      { id: 'ckh-4', name: 'Iced Milo', description: 'Tall glass of iced milo', price: 280, category: 'Drinks' },
    ],
  },
  {
    id: 3,
    name: 'The Hopper Bowl',
    cuisine: 'Sri Lankan',
    rating: 4.9,
    deliveryTime: '30-45 min',
    deliveryFee: 200,
    emoji: '🥞',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    description: 'Crisp hoppers and milk hoppers made fresh for breakfast and dinner.',
    menu: [
      { id: 'thb-1', name: 'Egg Hopper Trio', description: 'Three hoppers with egg, lunu miris, and coconut sambol', price: 720, category: 'Hoppers' },
      { id: 'thb-2', name: 'Milk Hopper Set', description: 'Four milk hoppers with treacle and kiri hodi', price: 680, category: 'Hoppers' },
      { id: 'thb-3', name: 'String Hopper Kiri Hodi', description: 'Idiyappam with coconut gravy and pol sambol', price: 640, category: 'String Hoppers' },
      { id: 'thb-4', name: 'Pol Roti & Lunu Miris', description: 'Coconut roti with onion chilli relish', price: 420, category: 'Short Eats' },
    ],
  },
  {
    id: 4,
    name: 'Galle Face Seafood',
    cuisine: 'Seafood',
    rating: 4.7,
    deliveryTime: '25-35 min',
    deliveryFee: 180,
    emoji: '🦐',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80',
    description: 'Coastal seafood grills inspired by the Galle Face evening breeze.',
    menu: [
      { id: 'gfs-1', name: 'Devilled Prawns', description: 'Hot-sweet prawns with capsicum and onion', price: 1450, category: 'Seafood' },
      { id: 'gfs-2', name: 'Garlic Butter Fish', description: 'Pan-seared thalapath with lemon butter', price: 1380, category: 'Seafood' },
      { id: 'gfs-3', name: 'Crab Curry', description: 'Jaffna-style crab in roasted chilli gravy', price: 1890, category: 'Seafood' },
      { id: 'gfs-4', name: 'Lime Soda', description: 'Fresh lime, soda, and a pinch of salt', price: 250, category: 'Drinks' },
    ],
  },
  {
    id: 5,
    name: 'Kandy Spice House',
    cuisine: 'Sri Lankan',
    rating: 4.5,
    deliveryTime: '30-40 min',
    deliveryFee: 120,
    emoji: '🍚',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80',
    description: 'Hill-country biryani and lamprais with a Kandy family recipe.',
    menu: [
      { id: 'ksh-1', name: 'Chicken Biryani', description: 'Fragrant basmati, boiled egg, and mint raita', price: 1100, category: 'Biryani' },
      { id: 'ksh-2', name: 'Mutton Lamprais', description: 'Dutch Burgher lamprais with ash plantain and frikkadel', price: 1650, category: 'Rice' },
      { id: 'ksh-3', name: 'Egg Cutlets (4)', description: 'Crispy short eats with spicy potato filling', price: 480, category: 'Short Eats' },
      { id: 'ksh-4', name: 'Ceylon Tea', description: 'Strong black tea with milk', price: 180, category: 'Drinks' },
    ],
  },
];

export function loadRestaurants(): Restaurant[] {
  if (typeof window === 'undefined') return restaurants;

  try {
    const raw = localStorage.getItem(RESTAURANTS_STORAGE_KEY);
    if (!raw) return restaurants;
    const parsed = JSON.parse(raw) as Restaurant[];
    return parsed.length ? parsed : restaurants;
  } catch {
    return restaurants;
  }
}

export function saveRestaurants(restaurantList: Restaurant[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(restaurantList));
}

export function getRestaurant(id: number) {
  return loadRestaurants().find((restaurant) => restaurant.id === id);
}

export function formatLkr(amount: number) {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
}
