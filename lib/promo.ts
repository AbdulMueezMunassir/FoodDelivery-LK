import type { Promo } from '@prisma/client';
import { prisma } from '@/lib/db';

export type PromoCheck =
  | { ok: true; promo: Promo; discount: number }
  | { ok: false; error: string };

export function normalizeCode(raw: unknown): string {
  return String(raw ?? '')
    .replace(/\s+/g, '')
    .toUpperCase()
    .slice(0, 40);
}

const lkr = (amount: number) => `LKR ${Math.round(amount).toLocaleString('en-US')}`;

export function calculateDiscount(
  promo: Pick<Promo, 'type' | 'value' | 'maxDiscount'>,
  subtotal: number,
  deliveryFee: number
): number {
  let discount = 0;

  if (promo.type === 'PERCENT') {
    discount = Math.round((subtotal * promo.value) / 100);
    if (promo.maxDiscount !== null) discount = Math.min(discount, promo.maxDiscount);
  } else if (promo.type === 'FIXED') {
    discount = Math.min(promo.value, subtotal);
  } else if (promo.type === 'FREE_DELIVERY') {
    discount = deliveryFee;
  }

  return Math.max(0, Math.round(discount));
}

export async function checkPromo(params: {
  code: string;
  userId: string;
  restaurantId: number;
  subtotal: number;
  deliveryFee: number;
}): Promise<PromoCheck> {
  const { code, userId, restaurantId, subtotal, deliveryFee } = params;
  const promo = await prisma.promo.findUnique({ where: { code } });
  const now = new Date();

  if (!promo || !promo.active) {
    return { ok: false, error: "That promo code isn't valid." };
  }
  if (promo.startsAt && promo.startsAt > now) {
    return { ok: false, error: "This promo code isn't active yet." };
  }
  if (promo.expiresAt && promo.expiresAt < now) {
    return { ok: false, error: 'This promo code has expired.' };
  }
  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
    return { ok: false, error: 'This promo code has been fully redeemed.' };
  }
  if (promo.restaurantId !== null && promo.restaurantId !== restaurantId) {
    return { ok: false, error: 'This code is only valid at a specific restaurant.' };
  }
  if (subtotal < promo.minSubtotal) {
    return { ok: false, error: `Add ${lkr(promo.minSubtotal - subtotal)} more to use this code.` };
  }

  const usedBefore = await prisma.order.count({
    where: { userId, promoCode: promo.code, status: { not: 'CANCELLED' } },
  });
  if (usedBefore > 0) {
    return { ok: false, error: "You've already used this code." };
  }

  if (promo.firstOrderOnly) {
    const previousOrders = await prisma.order.count({
      where: { userId, status: { not: 'CANCELLED' } },
    });
    if (previousOrders > 0) {
      return { ok: false, error: 'This code is for first orders only.' };
    }
  }

  const discount = calculateDiscount(promo, subtotal, deliveryFee);
  if (discount <= 0) {
    return { ok: false, error: 'This code gives no discount on this order.' };
  }

  return { ok: true, promo, discount };
}