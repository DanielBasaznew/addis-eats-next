const globalForOrders = globalThis;
const orders = globalForOrders.__addis_orders__ || new Map();
if (!globalForOrders.__addis_orders__) {
  globalForOrders.__addis_orders__ = orders;
}

export function saveOrder(order) {
  orders.set(order.id, order);
  return order;
}

export function getOrder(id) {
  return orders.get(id) || null;
}

export function getOrdersForUser(userId) {
  return Array.from(orders.values()).filter(
    (order) => order.userId === userId
  );
}

export const getOrdersFor = getOrdersForUser;

export const ALLOWED_ORDER_STATUSES = [
  'Preparing',
  'Cooking',
  'Ready',
  'Delivered',
  'Cancelled',
];

export function getAllOrders() {
  return Array.from(orders.values());
}

export function updateOrderStatus(id, status) {
  const order = orders.get(id);
  if (!order) {
    return null;
  }

  const updatedOrder = {
    ...order,
    status,
    updatedAt: new Date().toISOString(),
  };

  orders.set(id, updatedOrder);
  return updatedOrder;
}