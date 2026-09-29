import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ensureRestaurantCatalog } from '@/lib/restaurant-store';
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
}) {
  let menu = [];
  try {
    menu = JSON.parse(restaurant.menu);
  } catch {
    menu = [];
  }

  const { owner, ownerUserId, ...publicFields } = restaurant;
  return { ...publicFields, menu };
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  await ensureRestaurantCatalog();
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: Number(params.id) },
    include: { owner: { select: { email: true } } },
  });
  if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  return NextResponse.json(serializeRestaurant(restaurant));
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'owner')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const id = Number(params.id);
    const existing = await prisma.restaurant.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    if (sessionUser.role === 'owner' && existing.ownerUserId !== sessionUser.id) {
      return NextResponse.json({ error: 'You can only manage your own restaurants.' }, { status: 403 });
    }

    const body = await request.json();
    const name = String(body.name ?? '').trim();
    const cuisine = String(body.cuisine ?? '').trim();
    const description = String(body.description ?? '').trim();
    const deliveryTime = String(body.deliveryTime ?? '').trim();
    const rating = Number(body.rating);
    const deliveryFee = Number(body.deliveryFee);
    const menu = normalizeMenuItems(body.menu);

    if (!name || !cuisine || !description || !deliveryTime || !menu) {
      return NextResponse.json({ error: 'Restaurant details and a valid menu are required.' }, { status: 400 });
    }
    if (!Number.isFinite(rating) || rating < 0 || rating > 5 || !Number.isFinite(deliveryFee) || deliveryFee < 0) {
      return NextResponse.json({ error: 'Rating or delivery fee is invalid.' }, { status: 400 });
    }

    let ownerUserId = existing.ownerUserId;
    let nextOwner = null;
    if (sessionUser.role === 'admin') {
      const ownerEmail = String(body.ownerEmail ?? '').trim().toLowerCase();
      nextOwner = ownerEmail ? await prisma.user.findUnique({ where: { email: ownerEmail } }) : null;
      if (ownerEmail && (!nextOwner || nextOwner.role === 'ADMIN')) {
        return NextResponse.json({ error: 'Choose an existing non-admin user as restaurant owner.' }, { status: 400 });
      }
      ownerUserId = nextOwner?.id ?? null;
    }

    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        ownerUserId,
        name,
        cuisine,
        description,
        deliveryTime,
        rating,
        deliveryFee,
        emoji: String(body.emoji ?? '🍽️').trim() || '🍽️',
        image: String(body.image ?? '').trim(),
        menu: JSON.stringify(menu),
      },
      include: { owner: { select: { email: true } } },
    });

    if (nextOwner && nextOwner.role !== 'OWNER') {
      await prisma.user.update({ where: { id: nextOwner.id }, data: { role: 'OWNER' } });
    }
    if (existing.ownerUserId && existing.ownerUserId !== ownerUserId) {
      const remaining = await prisma.restaurant.count({ where: { ownerUserId: existing.ownerUserId } });
      const formerOwner = await prisma.user.findUnique({ where: { id: existing.ownerUserId } });
      if (!remaining && formerOwner?.role === 'OWNER') {
        await prisma.user.update({ where: { id: formerOwner.id }, data: { role: 'CUSTOMER' } });
      }
    }

    return NextResponse.json(serializeRestaurant(updated));
  } catch (error) {
    console.error('Restaurant update error:', error);
    return NextResponse.json({ error: 'Unable to update restaurant' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Only administrators can delete restaurants.' }, { status: 403 });
  }

  const id = Number(params.id);
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  await prisma.restaurant.delete({ where: { id } });
  if (existing.ownerUserId) {
    const remaining = await prisma.restaurant.count({ where: { ownerUserId: existing.ownerUserId } });
    const formerOwner = await prisma.user.findUnique({ where: { id: existing.ownerUserId } });
    if (!remaining && formerOwner?.role === 'OWNER') {
      await prisma.user.update({ where: { id: formerOwner.id }, data: { role: 'CUSTOMER' } });
    }
  }
  return NextResponse.json({ success: true });
}