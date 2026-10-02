import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { serializeOrder } from '@/lib/serialize-order';
import {
  OrderStatus,
  StatusActor,
  allowedTransitions,
  isOrderStatus,
  toDbStatus,
} from '@/lib/order-status';

export const dynamic = 'force-dynamic';

function blockedMessage(actor: StatusActor, current: OrderStatus, requested: OrderStatus) {
  if (current === 'delivered' || current === 'cancelled') {
    return `This order is already ${current} and can't be changed.`;
  }
  if (actor === 'customer') {
    return 'You can only cancel an order while it is still confirmed.';
  }
  if (requested === 'cancelled') {
    return 'An order can only be cancelled before it is on the way.';
  }
  return 'Orders must move one step at a time, in order.';
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const requested = String(body.status ?? '').toLowerCase();

    if (!isOrderStatus(requested)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id: params.id } });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Work out who this person is *for this order*.
    let actor: StatusActor | null = null;

    if (sessionUser.role === 'admin') {
      actor = 'admin';
    } else {
      if (sessionUser.role === 'owner') {
        const restaurant = await prisma.restaurant.findUnique({ where: { id: existing.restaurantId } });
        if (restaurant?.ownerUserId === sessionUser.id) actor = 'owner';
      }
      if (!actor && existing.userId === sessionUser.id) actor = 'customer';
    }

    if (!actor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const current = String(existing.status).toLowerCase();
    if (!isOrderStatus(current)) {
      return NextResponse.json({ error: 'Order has an unknown status.' }, { status: 409 });
    }

    if (!allowedTransitions(actor, current).includes(requested)) {
      return NextResponse.json(
        { error: blockedMessage(actor, current, requested) },
        { status: actor === 'customer' ? 403 : 409 }
      );
    }

    // Only update if nobody changed the order since we read it.
    const result = await prisma.order.updateMany({
      where: { id: existing.id, status: existing.status },
      data: { status: toDbStatus(requested) },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'This order was just updated by someone else. Please refresh.' },
        { status: 409 }
      );
    }

    const updated = await prisma.order.findUnique({ where: { id: existing.id } });
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: serializeOrder(updated) });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Unable to update order status' }, { status: 500 });
  }
}