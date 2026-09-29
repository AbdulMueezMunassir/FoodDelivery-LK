import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

const statusMap: Record<string, 'CONFIRMED' | 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED'> = {
  confirmed: 'CONFIRMED',
  preparing: 'PREPARING',
  on_the_way: 'ON_THE_WAY',
  delivered: 'DELIVERED',
};

function serializeOrder(order: {
  id: string;
  userId: string | null;
  restaurantId: number;
  restaurantName: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: string;
  phone: string;
  customerName: string;
  payment: string;
  status: string;
  items: string | unknown;
  createdAt: Date;
}) {
  let parsedItems: unknown[] = [];

  try {
    parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : Array.isArray(order.items) ? order.items : [];
  } catch {
    parsedItems = [];
  }

  return {
    id: order.id,
    userId: order.userId,
    restaurantId: order.restaurantId,
    restaurantName: order.restaurantName,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    address: order.address,
    phone: order.phone,
    customerName: order.customerName,
    payment: order.payment,
    status: String(order.status).toLowerCase(),
    items: parsedItems,
    createdAt: order.createdAt.toISOString(),
  };
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const nextStatus = String(body.status ?? '').toLowerCase();

    if (!statusMap[nextStatus]) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const existingOrder = await prisma.order.findUnique({ where: { id: params.id } });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (sessionUser.role === 'owner') {
      const restaurant = await prisma.restaurant.findUnique({ where: { id: existingOrder.restaurantId } });
      if (restaurant?.ownerUserId !== sessionUser.id) {
        return NextResponse.json({ error: 'You can only manage orders for your own restaurants.' }, { status: 403 });
      }
    } else if (sessionUser.role !== 'admin' && existingOrder.userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status: statusMap[nextStatus] },
    });

    return NextResponse.json({ success: true, order: serializeOrder(updatedOrder) });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ error: 'Unable to update order status' }, { status: 500 });
  }
}
