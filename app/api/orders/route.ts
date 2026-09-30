import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      items,
      restaurantId,
      address,
      phone,
      customerName,
    } = body;

    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    if (!Number.isInteger(Number(restaurantId)) || !address || !phone || !customerName) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id: Number(restaurantId) } });
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    let menu: { id: string; name: string; price: number }[];
    try {
      menu = JSON.parse(restaurant.menu);
    } catch {
      return NextResponse.json({ error: 'Restaurant menu is unavailable' }, { status: 409 });
    }

    const pricedItems = [];
    for (const item of items) {
      const qty = Number(item?.qty);
      const menuItem = menu.find((entry) => entry.id === item?.id);
      if (!menuItem || !Number.isInteger(qty) || qty < 1) {
        return NextResponse.json({ error: 'One or more cart items are no longer available.' }, { status: 400 });
      }
      pricedItems.push({
        id: menuItem.id,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        name: menuItem.name,
        price: menuItem.price,
        qty,
      });
    }

    const subtotal = pricedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const deliveryFee = restaurant.deliveryFee;
    const total = subtotal + deliveryFee;

    const order = await prisma.order.create({
      data: {
        userId: sessionUser.id,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        subtotal,
        deliveryFee,
        total,
        address,
        phone,
        customerName,
        payment: 'cod',
        status: 'CONFIRMED',
        items: JSON.stringify(pricedItems),
      },
    });

    return NextResponse.json({ success: true, order: serializeOrder(order) }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}
