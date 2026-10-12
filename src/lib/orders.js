import fs from 'node:fs';
import path from 'node:path';

const ORDERS_FILE = path.join(process.cwd(), 'public', 'orders.json');

const globalForOrders = globalThis;

/**
 * Load initial orders from public/orders.json if present.
 */
function loadOrdersFromDisk() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const fileContents = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(fileContents);
      if (Array.isArray(parsed)) {
        const orderMap = new Map();
        for (const order of parsed) {
          if (order && order.id) {
            orderMap.set(order.id, order);
          }
        }
        return orderMap;
      }
    }
  } catch (error) {
    console.error('Error loading orders.json:', error);
  }
  return new Map();
}

/**
 * Persist current orders map to public/orders.json.
 */
function saveOrdersToDisk(ordersMap) {
  try {
    const list = Array.from(ordersMap.values());
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving orders.json:', error);
    return false;
  }
}

/**
 * Ensure in-memory cache is populated from public/orders.json.
 */
function getOrdersMap() {
  if (!globalForOrders.__addis_orders__) {
    globalForOrders.__addis_orders__ = loadOrdersFromDisk();
  }
  return globalForOrders.__addis_orders__;
}

export function saveOrder(order) {
  const orders = getOrdersMap();
  orders.set(order.id, order);
  saveOrdersToDisk(orders);
  return order;
}

export function getOrder(id) {
  const orders = getOrdersMap();
  return orders.get(id) || null;
}

export function getOrdersForUser(userId) {
  const orders = getOrdersMap();
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
  const orders = getOrdersMap();
  return Array.from(orders.values());
}

export function updateOrderStatus(id, status) {
  const orders = getOrdersMap();
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
  saveOrdersToDisk(orders);
  return updatedOrder;
}