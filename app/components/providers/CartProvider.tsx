'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Restaurant } from '@/lib/data';
import { CartItem, Order, cartCount, cartSubtotal, loadCart, saveCart } from '@/lib/orders';

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
  refreshOrders: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantFee, setRestaurantFee] = useState(0);
  const [ready, setReady] = useState(false);

  const refreshOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders', { cache: 'no-store' });
      setOrders(response.ok ? ((await response.json()) as Order[]) : []);
    } catch {
      // Network error: keep what is on screen. The server is the only source of truth.
    }
  }, []);

  // Cart lives in the browser (guest cart), everything else comes from the server.
  useEffect(() => {
    setItems(loadCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveCart(items);
  }, [items, ready]);

  // Reload orders on every navigation, so login/logout never leaves stale orders behind.
  useEffect(() => {
    void refreshOrders();
  }, [pathname, refreshOrders]);

  const restaurantId = items[0]?.restaurantId;

  useEffect(() => {
    if (!restaurantId) {
      setRestaurantFee(0);
      return;
    }

    let active = true;
    fetch(`/api/restaurants/${restaurantId}`)
      .then((response) => (response.ok ? (response.json() as Promise<Restaurant>) : null))
      .then((data) => {
        if (active && data) setRestaurantFee(data.deliveryFee);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [restaurantId, pathname]);

  const subtotal = cartSubtotal(items);
  const deliveryFee = items.length ? restaurantFee : 0;

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
          qty <= 0
            ? current.filter((entry) => entry.id !== id)
            : current.map((entry) => (entry.id === id ? { ...entry, qty } : entry))
        );
      },
      removeItem: (id) => setItems((current) => current.filter((entry) => entry.id !== id)),
      clearCart: () => setItems([]),
      placeOrder: async ({ address, phone, customerName }) => {
        if (!items.length) return null;

        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // Prices are never sent. The server prices the order from the menu.
              items: items.map((item) => ({ id: item.id, qty: item.qty })),
              restaurantId: items[0].restaurantId,
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
          setOrders((current) => [result.order, ...current]);
          setItems([]);
          return result.order;
        } catch (error) {
          console.error('Order submission failed:', error);
          return null;
        }
      },
      updateOrderStatus: async (id, status) => {
        try {
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
        } catch (error) {
          console.error('Order status update failed:', error);
        }

        // The update failed: show what the server actually has, not a guess.
        await refreshOrders();
      },
      refreshOrders,
    }),
    [deliveryFee, items, orders, refreshOrders, subtotal]
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