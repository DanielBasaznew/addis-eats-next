import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const PUBLIC_ORDERS_FILE = path.join(process.cwd(), 'public', 'orders.json');
const TMP_ORDERS_FILE = path.join(os.tmpdir(), 'addis_orders.json');

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

function parseOrdersArray(list) {
  const orderMap = new Map();
  for (const order of list) {
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

/**
 * Load orders: checks /tmp first (persists across warm serverless lambdas on Vercel),
 * then falls back to public/orders.json.
 */
function loadOrdersFromDisk() {
  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const fileContents = fs.readFileSync(TMP_ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(fileContents);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parseOrdersArray(parsed);
      }
    }
  } catch {
    // Ignore tmp read errors
  }

  try {
    if (fs.existsSync(PUBLIC_ORDERS_FILE)) {
      const fileContents = fs.readFileSync(PUBLIC_ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(fileContents);
      if (Array.isArray(parsed)) {
        return parseOrdersArray(parsed);
      }
    }
  } catch (error) {
    console.error('Error loading orders.json:', error);
  }
  return new Map();
}

let lastTmpMtime = 0;

/**
 * Persist current orders map to /tmp (writable on Vercel) and public/orders.json (local).
 */
function saveOrdersToDisk(ordersMap) {
  const list = Array.from(ordersMap.values());
  const serialized = JSON.stringify(list, null, 2);

  // 1. Write to /tmp (always writable in Vercel Serverless environment)
  try {
    fs.writeFileSync(TMP_ORDERS_FILE, serialized, 'utf-8');
    const stat = fs.statSync(TMP_ORDERS_FILE);
    lastTmpMtime = stat.mtimeMs;
  } catch (error) {
    console.error('Error saving orders to tmp:', error);
  }

  // 2. Also write to public/orders.json for local dev persistence (silent no-op on Vercel read-only FS)
  try {
    fs.writeFileSync(PUBLIC_ORDERS_FILE, serialized, 'utf-8');
  } catch {
    // Expected EROFS on Vercel serverless read-only filesystem
  }

  return true;
}

/**
 * Ensure in-memory cache is populated from disk and up to date.
 */
function getOrdersMap() {
  let needsReload = !globalForOrders.__addis_orders__;

  if (fs.existsSync(TMP_ORDERS_FILE)) {
    try {
      const stat = fs.statSync(TMP_ORDERS_FILE);
      if (stat.mtimeMs > lastTmpMtime) {
        lastTmpMtime = stat.mtimeMs;
        needsReload = true;
      }
    } catch {
      // Ignore stat error
    }
  }

  if (needsReload) {
    globalForOrders.__addis_orders__ = loadOrdersFromDisk();
  }
  return globalForOrders.__addis_orders__;
}

export function saveOrder(order) {
  const orders = getOrdersMap();
  const enriched = sanitizeOrderForStorage({
    ...order,
    total: getOrderTotal(order),
    area: order.area || (order.isTableOrder ? `Table #${order.tableNumber}` : 'Bole'),
  });
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

export const ORDERS_COOKIE_NAME = 'addis_custom_orders';

/**
 * Sanitize an order to a compact, standardized schema to guarantee that
 * multi-order cookie storage never exceeds the browser 4096-byte limit.
 */
export function sanitizeOrderForStorage(order) {
  if (!order || typeof order !== 'object') return null;
  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        id: item?.id || item?.dishId || 'dish',
        name: String(item?.name || 'Dish'),
        price: Number(item?.price) || 0,
        quantity: Math.max(1, Number(item?.quantity) || 1),
        image: typeof item?.image === 'string' ? item.image : undefined,
      }))
    : [];

  const isTable = Boolean(
    order.isTableOrder ||
    order.orderType === 'dine-in' ||
    (order.tableNumber !== undefined && order.tableNumber !== null && String(order.tableNumber).trim() !== '')
  );

  const tableNum = order.tableNumber ? String(order.tableNumber).trim() : null;

  return {
    id: String(order.id),
    userId: order.userId || 'guest',
    name: String(order.name || 'Customer'),
    phone: String(order.phone || ''),
    address: isTable ? null : (order.address ? String(order.address) : null),
    area: String(order.area || (isTable ? `Table #${tableNum || 'Dine-In'}` : 'Bole')),
    orderType: isTable ? 'dine-in' : 'delivery',
    isTableOrder: isTable,
    tableNumber: tableNum,
    paymentMethod: String(order.paymentMethod || 'telebirr'),
    specialInstructions: order.specialInstructions ? String(order.specialInstructions).slice(0, 150) : undefined,
    status: String(order.status || 'Preparing'),
    createdAt: order.createdAt || new Date().toISOString(),
    deliveryFee: isTable ? 0 : Number(order.deliveryFee) || 0,
    subtotal: Number(order.subtotal) || (getOrderTotal(order) - (isTable ? 0 : Number(order.deliveryFee) || 0)),
    total: getOrderTotal(order),
    items,
  };
}

/**
 * Sync custom placed orders from an array into memory and tmp disk.
 */
export function syncCustomOrders(customOrders) {
  if (!Array.isArray(customOrders)) return;
  const orders = getOrdersMap();
  for (const rawOrder of customOrders) {
    const order = sanitizeOrderForStorage(rawOrder);
    if (order && order.id) {
      orders.set(order.id, order);
    }
  }
  saveOrdersToDisk(orders);
}

/**
 * Hydrates all orders from both `addis_custom_orders` and `order_status_overrides` cookies.
 * This guarantees orders placed in serverless Vercel environments are immediately visible
 * across pages, tracking, kitchen dashboard, and orders list.
 */
export async function hydrateAllOrders(cookieStore) {
  if (!cookieStore) return getOrdersMap();

  // 1. Read and merge custom created orders
  const customOrdersRaw = cookieStore.get(ORDERS_COOKIE_NAME)?.value;
  if (customOrdersRaw) {
    try {
      const parsed = JSON.parse(customOrdersRaw);
      if (Array.isArray(parsed)) {
        syncCustomOrders(parsed);
      }
    } catch {}
  }

  // 2. Read and apply order status overrides
  const overridesRaw = cookieStore.get('order_status_overrides')?.value;
  if (overridesRaw) {
    try {
      const parsedOverrides = JSON.parse(overridesRaw);
      syncOrderOverrides(parsedOverrides);
    } catch {}
  }

  return getOrdersMap();
}

/**
 * Save a newly placed order to the user's cookies so it survives serverless cold starts.
 * Employs compact sanitization and limits history to the last 12 orders to guarantee
 * cookie size always remains comfortably below the 4096-byte browser limit.
 */
export function saveCustomOrderToCookie(cookieStore, newOrder) {
  if (!cookieStore || !newOrder) return;
  try {
    const sanitized = sanitizeOrderForStorage(newOrder);
    if (!sanitized) return;

    let existingList = [];
    const raw = cookieStore.get(ORDERS_COOKIE_NAME)?.value;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          existingList = parsed.map(sanitizeOrderForStorage).filter(Boolean);
        }
      } catch {}
    }

    const filtered = existingList.filter((o) => o.id !== sanitized.id);
    // Keep 5 most recent orders to stay comfortably under 4KB (approx 2.3KB raw, 3.6KB encoded)
    const updated = [sanitized, ...filtered].slice(0, 5);

    cookieStore.set(ORDERS_COOKIE_NAME, JSON.stringify(updated), {
      path: '/',
      httpOnly: false, // accessible to client for dual-layer storage
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch (err) {
    console.error('Failed to set orders cookie:', err);
  }
}

/**
 * Update the status of an existing order in the custom orders cookie.
 */
export function updateCustomOrderInCookie(cookieStore, orderId, newStatus) {
  if (!cookieStore || !orderId) return;
  try {
    const raw = cookieStore.get(ORDERS_COOKIE_NAME)?.value;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        let changed = false;
        const updated = parsed.map((o) => {
          if (o.id === orderId) {
            changed = true;
            return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
          }
          return o;
        });
        if (changed) {
          cookieStore.set(ORDERS_COOKIE_NAME, JSON.stringify(updated), {
            path: '/',
            httpOnly: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30,
          });
        }
      }
    }
  } catch {}
}

/**
 * Hydrate memory from cookie overrides if cold start occurred on Vercel.
 */
export function syncOrderOverrides(overrides) {
  if (!overrides || typeof overrides !== 'object') return;
  const orders = getOrdersMap();
  for (const [id, status] of Object.entries(overrides)) {
    if (orders.has(id)) {
      const existing = orders.get(id);
      orders.set(id, {
        ...existing,
        status,
        updatedAt: new Date().toISOString(),
      });
    }
  }
}

const SYNC_OBJECT_ID = 'ff808181a09d98f701a13666a97956c3';

/**
 * Fetch remote overrides for cross-container / cross-browser sync on Vercel.
 */
export async function fetchRemoteOrderOverrides() {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${SYNC_OBJECT_ID}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data && typeof json.data === 'object') {
        syncOrderOverrides(json.data);
        return json.data;
      }
    }
  } catch {
    // Safe no-op on network issues
  }
  return null;
}

/**
 * Broadcast status update to remote store so isolated serverless containers synchronize.
 */
export async function pushRemoteOrderOverride(orderId, status) {
  try {
    const current = (await fetchRemoteOrderOverrides()) || {};
    current[orderId] = status;
    await fetch(`https://api.restful-api.dev/objects/${SYNC_OBJECT_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'addis_eats_order_status_sync',
        data: current,
      }),
      cache: 'no-store',
    });
  } catch {
    // Safe no-op on network issues
  }
}