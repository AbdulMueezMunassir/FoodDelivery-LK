type OrderRow = {
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
  items: string;
  createdAt: Date;
};

export function serializeOrder(order: OrderRow) {
  let items: unknown[] = [];

  try {
    const parsed = JSON.parse(order.items);
    items = Array.isArray(parsed) ? parsed : [];
  } catch {
    items = [];
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
    items,
    createdAt: order.createdAt.toISOString(),
  };
}