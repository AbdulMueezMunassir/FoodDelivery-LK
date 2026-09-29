'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getRestaurant, Restaurant, restaurants as seedRestaurants } from '@/lib/data';
import {
  CartItem,
  Order,
  cartCount,
  cartSubtotal,
  loadCart,
  loadOrders,
  saveCart,
  saveOrders,
} from '@/lib/orders';

type CartContextValue = {
  items: CartItem[];
  orders: Order[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  restaurantName: string | null;
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => boolean;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  placeOrder: (details: { address: string; phone: string; customerName: string }) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantCatalog, setRestaurantCatalog] = useState<Restaurant[]>(seedRestaurants);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedCart = loadCart();
    setItems(savedCart);
    setReady(true);

    fetch('/api/restaurants')
      .then((response) => (response.ok ? response.json() : seedRestaurants))
      .then((data) => setRestaurantCatalog(data))
      .catch(() => setRestaurantCatalog(seedRestaurants));

    const loadOrdersFromApi = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = (await response.json()) as Order[];
          setOrders(data);
          return;
        }
      } catch {
        // fall through to localStorage fallback
      }

      setOrders(loadOrders());
    };

    void loadOrdersFromApi();
  }, []);

  useEffect(() => {
    if (ready) saveCart(items);
  }, [items, ready]);

  useEffect(() => {
    if (ready) saveOrders(orders);
  }, [orders, ready]);

  const restaurantId = items[0]?.restaurantId;
  const restaurant = restaurantId
    ? restaurantCatalog.find((entry) => entry.id === restaurantId) ?? getRestaurant(restaurantId)
    : undefined;
  const deliveryFee = items.length ? restaurant?.deliveryFee ?? 0 : 0;
  const subtotal = cartSubtotal(items);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      orders,
      count: cartCount(items),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      restaurantName: items[0]?.restaurantName ?? null,
      addItem: (item, qty = 1) => {
        if (items.length && items[0].restaurantId !== item.restaurantId) {
          const replace = window.confirm(
            `Your cart has items from ${items[0].restaurantName}. Replace it with ${item.restaurantName}?`
          );
          if (!replace) return false;
          setItems([{ ...item, qty }]);
          return true;
        }

        setItems((current) => {
          const existing = current.find((entry) => entry.id === item.id);
          if (existing) {
            return current.map((entry) =>
              entry.id === item.id ? { ...entry, qty: entry.qty + qty } : entry
            );
          }
          return [...current, { ...item, qty }];
        });
        return true;
      },
      setQty: (id, qty) => {
        setItems((current) =>
          qty <= 0 ? current.filter((entry) => entry.id !== id) : current.map((entry) => (entry.id === id ? { ...entry, qty } : entry))
        );
      },
      removeItem: (id) => setItems((current) => current.filter((entry) => entry.id !== id)),
      clearCart: () => setItems([]),
      placeOrder: async ({ address, phone, customerName }) => {
        if (!items.length || !restaurant) return null;

        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              subtotal,
              deliveryFee,
              total: subtotal + deliveryFee,
              address,
              phone,
              customerName,
            }),
          });

          if (!response.ok) {
            const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
            console.error(errorData?.error ?? 'Unable to place order');
            return null;
          }

          const result = (await response.json()) as { order: Order };
          const order = result.order;
          setOrders((current) => [order, ...current]);
          setItems([]);
          return order;
        } catch (error) {
          console.error('Order submission failed:', error);
          return null;
        }
      },
      updateOrderStatus: async (id, status) => {
        const response = await fetch(`/api/orders/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (response.ok) {
          const data = (await response.json()) as { order: Order };
          setOrders((current) => current.map((order) => (order.id === id ? data.order : order)));
          return;
        }

        setOrders((current) =>
          current.map((order) => (order.id === id ? { ...order, status } : order))
        );
      },
    }),
    [deliveryFee, items, orders, restaurant, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
