import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ORDERS_FILE = path.join(process.cwd(), 'public', 'orders.json');
const TMP_ORDERS_FILE = path.join(os.tmpdir(), 'orders.json');

const globalForOrders = globalThis;

/**
 * Calculate total price for an order, either from existing total or sum of items.
 */
export function getOrderTotal(order) {
  if (typeof order?.total === 'number' && !isNaN(order.total)) {
    return order.total;
  }
  if (Array.isArray(order?.items)) {
    return order.items.reduce(
      (sum, item) => sum + (Number(item?.price || 0) * Number(item?.quantity || 1)),
      0
    );
  }
  return 0;
}

/**
 * Load initial orders from /tmp/orders.json or public/orders.json.
 */
function loadOrdersFromDisk() {
  try {
    const targetFile = fs.existsSync(TMP_ORDERS_FILE) ? TMP_ORDERS_FILE : ORDERS_FILE;
    if (fs.existsSync(targetFile)) {
      const fileContents = fs.readFileSync(targetFile, 'utf-8');
      const parsed = JSON.parse(fileContents);
      if (Array.isArray(parsed)) {
        const orderMap = new Map();
        for (const order of parsed) {
          if (order && order.id) {
            const enriched = {
              ...order,
              total: getOrderTotal(order),
              area: order.area || 'Bole',
            };
            orderMap.set(order.id, enriched);
          }
        }
        return orderMap;
      }
    }
  } catch (error) {
    console.error('Error loading orders:', error);
  }
  return new Map();
}

/**
 * Persist current orders map to /tmp and public/orders.json.
 */
function saveOrdersToDisk(ordersMap) {
  const list = Array.from(ordersMap.values());
  const serialized = JSON.stringify(list, null, 2);
  let saved = false;

  // Always write to /tmp (writable on Vercel Serverless)
  try {
    fs.writeFileSync(TMP_ORDERS_FILE, serialized, 'utf-8');
    saved = true;
  } catch (err) {
    console.error('Error saving to /tmp:', err);
  }

  // Also write to public/orders.json if filesystem permits (e.g. localhost)
  try {
    fs.writeFileSync(ORDERS_FILE, serialized, 'utf-8');
    globalForOrders.__addis_orders_mtime__ = fs.statSync(ORDERS_FILE).mtimeMs;
    saved = true;
  } catch {
    // Expected on read-only serverless filesystems (e.g. Vercel)
  }

  return saved;
}

/**
 * Ensure in-memory cache is populated from public/orders.json and synchronized with disk.
 */
function getOrdersMap() {
  try {
    const targetFile = fs.existsSync(TMP_ORDERS_FILE) ? TMP_ORDERS_FILE : ORDERS_FILE;
    if (fs.existsSync(targetFile)) {
      const stats = fs.statSync(targetFile);
      if (
        !globalForOrders.__addis_orders__ ||
        stats.mtimeMs > (globalForOrders.__addis_orders_mtime__ || 0)
      ) {
        globalForOrders.__addis_orders__ = loadOrdersFromDisk();
        globalForOrders.__addis_orders_mtime__ = stats.mtimeMs;
      }
    }
  } catch {
    if (!globalForOrders.__addis_orders__) {
      globalForOrders.__addis_orders__ = loadOrdersFromDisk();
    }
  }
  return globalForOrders.__addis_orders__;
}

export function saveOrder(order) {
  const orders = getOrdersMap();
  const enriched = {
    ...order,
    total: getOrderTotal(order),
    area: order.area || 'Bole',
  };
  orders.set(enriched.id, enriched);
  saveOrdersToDisk(orders);
  return enriched;
}

export function getOrder(id) {
  const orders = getOrdersMap();
  const order = orders.get(id);
  if (!order) return null;
  return {
    ...order,
    total: getOrderTotal(order),
  };
}

export function getOrdersForUser(userId) {
  const orders = getOrdersMap();
  return Array.from(orders.values())
    .filter((order) => order.userId === userId)
    .map((order) => ({
      ...order,
      total: getOrderTotal(order),
    }));
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
  return Array.from(orders.values()).map((order) => ({
    ...order,
    total: getOrderTotal(order),
  }));
}

export function getRevenueByArea() {
  const orders = getOrdersMap();
  const totals = new Map();

  for (const order of orders.values()) {
    if (!order) continue;
    const area =
      typeof order.area === 'string' && order.area.trim()
        ? order.area.trim()
        : 'Unknown';
    const current = totals.get(area) || 0;
    const validTotal = getOrderTotal(order);

    totals.set(area, current + validTotal);
  }

  return Array.from(totals, ([area, revenue]) => ({
    area,
    revenue,
  }));
}

export function getOrdersByDay() {
  const orders = getOrdersMap();
  const totals = new Map();

  for (const order of orders.values()) {
    if (!order || !order.createdAt) continue;
    try {
      const parsedDate = new Date(order.createdAt);
      if (isNaN(parsedDate.getTime())) continue;

      const date = parsedDate.toISOString().slice(0, 10);
      const current = totals.get(date) || 0;

      totals.set(date, current + 1);
    } catch {
      continue;
    }
  }

  return Array.from(totals, ([date, count]) => ({
    date,
    orders: count,
  })).sort((a, b) => a.date.localeCompare(b.date));
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
    total: getOrderTotal(order),
  };

  orders.set(id, updatedOrder);
  saveOrdersToDisk(orders);
  return updatedOrder;
}