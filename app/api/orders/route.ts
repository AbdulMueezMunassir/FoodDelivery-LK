import { NextResponse } from 'next/server';
import type { Promo } from '@prisma/client';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { priceCart } from '@/lib/pricing';
import { checkPromo, normalizeCode } from '@/lib/promo';
import { serializeOrder } from '@/lib/serialize-order';

export const dynamic = 'force-dynamic';

class PromoUnavailableError extends Error {}

export async function GET() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json([], { status: 200 });
  }

  let where = {};
  if (sessionUser.role === 'owner') {
    const ownedRestaurants = await prisma.restaurant.findMany({
      where: { ownerUserId: sessionUser.id },
      select: { id: true },
    });
    where = { restaurantId: { in: ownedRestaurants.map((restaurant) => restaurant.id) } };
  } else if (sessionUser.role !== 'admin') {
    where = { userId: sessionUser.id };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders.map((order) => serializeOrder(order)));
}

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Please sign in to place an order.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const restaurantId = Number(body.restaurantId);
    const address = String(body.address ?? '').trim();
    const phone = String(body.phone ?? '').trim();
    const customerName = String(body.customerName ?? '').trim();

    if (!address || !phone || !customerName) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    if (
      address.length > 300 ||
      customerName.length > 100 ||
      !/^[0-9+()\-\s]{7,20}$/.test(phone)
    ) {
      return NextResponse.json({ error: 'Please check your name, phone number and address.' }, { status: 400 });
    }

    const priced = await priceCart(restaurantId, body.items);
    if (!priced.ok) {
      return NextResponse.json({ error: priced.error }, { status: priced.status });
    }

    const { restaurant, lines, subtotal, deliveryFee } = priced;

    let promo: Promo | null = null;
    let discount = 0;
    const promoCode = normalizeCode(body.promoCode);

    if (promoCode) {
      const check = await checkPromo({
        code: promoCode,
        userId: sessionUser.id,
        restaurantId: restaurant.id,
        subtotal,
        deliveryFee,
      });

      if (!check.ok) {
        return NextResponse.json({ error: check.error }, { status: 400 });
      }

      promo = check.promo;
      discount = check.discount;
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const appliedPromo = promo;

    const order = await prisma.$transaction(async (tx) => {
      if (appliedPromo) {
        // Claim one use. Fails if the limit was reached since we checked.
        const claimed = await tx.promo.updateMany({
          where:
            appliedPromo.usageLimit === null
              ? { id: appliedPromo.id, active: true }
              : { id: appliedPromo.id, active: true, usedCount: { lt: appliedPromo.usageLimit } },
          data: { usedCount: { increment: 1 } },
        });

        if (claimed.count === 0) {
          throw new PromoUnavailableError('This promo code is no longer available.');
        }
      }

      return tx.order.create({
        data: {
          userId: sessionUser.id,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          subtotal,
          deliveryFee,
          discount,
          promoCode: appliedPromo?.code ?? null,
          total,
          address,
          phone,
          customerName,
          payment: 'cod',
          status: 'CONFIRMED',
          items: JSON.stringify(lines),
        },
      });
    });

    return NextResponse.json({ success: true, order: serializeOrder(order) }, { status: 201 });
  } catch (error) {
    if (error instanceof PromoUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}