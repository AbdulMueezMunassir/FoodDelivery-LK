import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { normalizeMenuItems } from '@/lib/restaurant-validation';

export const dynamic = 'force-dynamic';

function serializeRestaurant(restaurant: {
  id: number;
  ownerUserId: string | null;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  emoji: string;
  image: string;
  description: string;
  menu: string;
  owner?: { email: string } | null;
}, includeOwner = false) {
  let menu = [];
  try {
    menu = JSON.parse(restaurant.menu);
  } catch {
    menu = [];
  }

  const { owner, ownerUserId, ...publicFields } = restaurant;
  return { ...publicFields, menu, ...(includeOwner ? { owner, ownerUserId } : {}) };
}

export async function GET(request: Request) {
  try {
    
    const url = new URL(request.url);
    const manage = url.searchParams.get('scope') === 'manage';
    const sessionUser = manage ? await getSessionUser() : null;

    if (manage && !sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (manage && sessionUser?.role !== 'admin' && sessionUser?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ownedBy = manage && sessionUser?.role === 'owner' ? { ownerUserId: sessionUser.id } : {};
    const result = await prisma.restaurant.findMany({
      where: ownedBy,
      include: { owner: { select: { email: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(result.map((restaurant) => serializeRestaurant(restaurant, manage && sessionUser?.role === 'admin')));
  } catch (error) {
    console.error('Restaurant list error:', error);
    return NextResponse.json({ error: 'Unable to load restaurants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const cuisine = String(body.cuisine ?? '').trim();
    const description = String(body.description ?? '').trim();
    const menu = normalizeMenuItems(body.menu);
    const rating = Number(body.rating);
    const deliveryFee = Number(body.deliveryFee);

    if (!name || !cuisine || !description || !String(body.deliveryTime ?? '').trim() || !menu) {
      return NextResponse.json({ error: 'Name, cuisine, delivery time, and description are required.' }, { status: 400 });
    }
    if (!Number.isFinite(rating) || rating < 0 || rating > 5 || !Number.isFinite(deliveryFee) || deliveryFee < 0) {
      return NextResponse.json({ error: 'Rating or delivery fee is invalid.' }, { status: 400 });
    }

    const ownerEmail = String(body.ownerEmail ?? '').trim().toLowerCase();
    const owner = ownerEmail ? await prisma.user.findUnique({ where: { email: ownerEmail } }) : null;
    if (ownerEmail && (!owner || owner.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Choose an existing non-admin user as restaurant owner.' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        ownerUserId: owner?.id ?? null,
        name,
        cuisine,
        description,
        rating,
        deliveryTime: String(body.deliveryTime).trim(),
        deliveryFee,
        emoji: String(body.emoji ?? '🍽️').trim() || '🍽️',
        image: String(body.image ?? '').trim(),
        menu: JSON.stringify(menu),
      },
      include: { owner: { select: { email: true } } },
    });

    if (owner && owner.role !== 'OWNER') {
      await prisma.user.update({ where: { id: owner.id }, data: { role: 'OWNER' } });
    }

    return NextResponse.json(serializeRestaurant(restaurant, true), { status: 201 });
  } catch (error) {
    console.error('Restaurant creation error:', error);
    return NextResponse.json({ error: 'Unable to create restaurant' }, { status: 500 });
  }
}