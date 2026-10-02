import { OrderStatus } from '@/lib/orders';

export type CartItem = {
  id: string;
  restaurantId: number;
  restaurantName: string;
  name: string;
  price: number;
  qty: number;
};

export type Order = {
  id: string;
  userId?: string | null;
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

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getOrderStatus(order: Pick<Order, 'status'>): OrderStatus {
  return order.status;
}

export const statusCopy: Record<OrderStatus, { label: string; detail: string }> = {
  confirmed: { label: 'Order confirmed', detail: 'The restaurant just received your order.' },
  preparing: { label: 'Preparing', detail: 'Your food is on the stove.' },
  on_the_way: { label: 'On the way', detail: 'A rider is heading to your address.' },
  delivered: { label: 'Delivered', detail: 'Enjoy your meal.' },
  cancelled: { label: 'Cancelled', detail: 'This order was cancelled.' },
};