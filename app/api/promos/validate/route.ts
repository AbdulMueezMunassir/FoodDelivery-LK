import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { priceCart } from '@/lib/pricing';
import { checkPromo, normalizeCode } from '@/lib/promo';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Please sign in to use a promo code.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const code = normalizeCode(body.code);

    if (!code) {
      return NextResponse.json({ error: 'Enter a promo code.' }, { status: 400 });
    }

    const priced = await priceCart(Number(body.restaurantId), body.items);
    if (!priced.ok) {
      return NextResponse.json({ error: priced.error }, { status: priced.status });
    }

    const check = await checkPromo({
      code,
      userId: sessionUser.id,
      restaurantId: priced.restaurant.id,
      subtotal: priced.subtotal,
      deliveryFee: priced.deliveryFee,
    });

    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    return NextResponse.json({
      code: check.promo.code,
      title: check.promo.title,
      discount: check.discount,
      subtotal: priced.subtotal,
      deliveryFee: priced.deliveryFee,
      total: Math.max(0, priced.subtotal + priced.deliveryFee - check.discount),
    });
  } catch (error) {
    console.error('Promo validation error:', error);
    return NextResponse.json({ error: 'Could not check that code.' }, { status: 500 });
  }
}