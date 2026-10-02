export const ORDER_FLOW = ['confirmed', 'preparing', 'on_the_way', 'delivered'] as const;

export type FlowStatus = (typeof ORDER_FLOW)[number];
export type OrderStatus = FlowStatus | 'cancelled';
export type StatusActor = 'customer' | 'owner' | 'admin';

const ALL_STATUSES: readonly string[] = [...ORDER_FLOW, 'cancelled'];

export function isOrderStatus(value: string): value is OrderStatus {
  return ALL_STATUSES.includes(value);
}

export function toDbStatus(status: OrderStatus): string {
  return status.toUpperCase(); // on_the_way -> ON_THE_WAY
}

export function nextFlowStatus(current: OrderStatus): FlowStatus | null {
  if (current === 'cancelled') return null;
  return ORDER_FLOW[ORDER_FLOW.indexOf(current) + 1] ?? null;
}

export function allowedTransitions(actor: StatusActor, current: OrderStatus): OrderStatus[] {
  if (current === 'delivered' || current === 'cancelled') return [];

  if (actor === 'customer') {
    return current === 'confirmed' ? ['cancelled'] : [];
  }

  // Owners and admins: one step forward, or cancel before the order is on its way.
  const options: OrderStatus[] = [];
  const next = nextFlowStatus(current);
  if (next) options.push(next);
  if (current === 'confirmed' || current === 'preparing') options.push('cancelled');
  return options;
}