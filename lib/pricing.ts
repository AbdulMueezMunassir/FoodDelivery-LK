import type { Restaurant } from '@prisma/client';
import { prisma } from '@/lib/db';

const MAX_LINES = 40;
const MAX_QTY = 50;

export type PricedLine = {
  id: string;
  restaurantId: number;
  restaurantName: string;
  name: string;
  price: number;
  qty: number;
};

export type PriceResult =
  | { ok: true; restaurant: Restaurant; lines: PricedLine[]; subtotal: number; deliveryFee: number }
  | { ok: false; status: number; error: string };

function fail(status: number, error: string): PriceResult {
  return { ok: false, status, error };
}

/** Prices a cart from the menu stored in the database. Client-sent prices are never used. */
export async function priceCart(restaurantId: number, items: unknown): Promise<PriceResult> {
  if (!Array.isArray(items) || !items.length) {
    return fail(400, 'Cart is empty');
  }
  if (items.length > MAX_LINES) {
    return fail(400, 'Too many items in one order.');
  }
  if (!Number.isInteger(restaurantId)) {
    return fail(400, 'Missing order details');
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
  if (!restaurant) {
    return fail(404, 'Restaurant not found');
  }

  let menu: { id: string; name: string; price: number }[];
  try {
    menu = JSON.parse(restaurant.menu);
  } catch {
    return fail(409, 'Restaurant menu is unavailable');
  }

  const lines: PricedLine[] = [];
  for (const item of items) {
    const qty = Number(item?.qty);
    const menuItem = menu.find((entry) => entry.id === item?.id);

    if (!menuItem || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return fail(400, 'One or more cart items are no longer available.');
    }

    lines.push({
      id: menuItem.id,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      name: menuItem.name,
      price: menuItem.price,
      qty,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);

  return { ok: true, restaurant, lines, subtotal, deliveryFee: restaurant.deliveryFee };
}