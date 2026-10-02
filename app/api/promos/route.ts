import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();

    const promos = await prisma.promo.findMany({
      where: {
        active: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    const available = promos.filter((promo) => promo.usageLimit === null || promo.usedCount < promo.usageLimit);

    const restaurantIds = Array.from(
      new Set(available.map((promo) => promo.restaurantId).filter((id): id is number => id !== null))
    );
    const restaurants = restaurantIds.length
      ? await prisma.restaurant.findMany({
          where: { id: { in: restaurantIds } },
          select: { id: true, name: true },
        })
      : [];
    const restaurantNames = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant.name]));

    return NextResponse.json(
      available.map((promo) => ({
        id: promo.id,
        code: promo.code,
        title: promo.title,
        description: promo.description,
        badge: promo.badge,
        minSubtotal: promo.minSubtotal,
        restaurantName: promo.restaurantId !== null ? restaurantNames.get(promo.restaurantId) ?? null : null,
        expiresAt: promo.expiresAt ? promo.expiresAt.toISOString() : null,
      }))
    );
  } catch (error) {
    console.error('Promo list error:', error);
    return NextResponse.json({ error: 'Unable to load offers' }, { status: 500 });
  }
}