export type CartItem = {
  id: string;
  restaurantId: number;
  restaurantName: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderStatus = 'confirmed' | 'preparing' | 'on_the_way' | 'delivered';

export type Order = {
  id: string;
  items: CartItem[];
  restaurantId: number;
  restaurantName: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  phone: string;
  customerName: string;
  payment: 'cod';
  status: OrderStatus;
  createdAt: string;
};

const CART_KEY = 'fdlk-cart';
const ORDERS_KEY = 'fdlk-orders';

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function loadOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function deriveStatus(createdAt: string): OrderStatus {
  const elapsedMin = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (elapsedMin < 2) return 'confirmed';
  if (elapsedMin < 8) return 'preparing';
  if (elapsedMin < 20) return 'on_the_way';
  return 'delivered';
}

export function getOrderStatus(order: Pick<Order, 'status' | 'createdAt'>): OrderStatus {
  return order.status ?? deriveStatus(order.createdAt);
}

export const statusCopy: Record<OrderStatus, { label: string; detail: string }> = {
  confirmed: { label: 'Order confirmed', detail: 'The restaurant just received your order.' },
  preparing: { label: 'Preparing', detail: 'Your food is on the stove.' },
  on_the_way: { label: 'On the way', detail: 'A rider is heading to your address.' },
  delivered: { label: 'Delivered', detail: 'Enjoy your meal.' },
};
