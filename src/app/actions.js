'use server';

import { revalidatePath } from 'next/cache';
import { orderSchema, dishSchema } from '@/lib/schema';
import {
  saveOrder,
  getOrder,
  updateOrderStatus as updateOrderStatusInStore,
  ALLOWED_ORDER_STATUSES,
  syncOrderOverrides,
  pushRemoteOrderOverride,
} from '@/lib/orders';
import {
  getDishById,
  createDish as createDishInStore,
  updateDish as updateDishInStore,
  deleteDish as deleteDishInStore,
  toggleDishAvailability as toggleDishAvailabilityInStore,
} from '@/lib/dishes';
import {
  toggleFavorite as toggleFavoriteInStore,
  isDishFavorite,
  getFavoriteIds,
  syncFavoritesFromList,
} from '@/lib/favorites';
import { getSession, createSession, deleteSession } from '@/lib/session';
import { cookies } from 'next/headers';

export async function placeOrder(prevState, formData, maybeInjectedSession) {
  const session =
    maybeInjectedSession !== undefined ? maybeInjectedSession : await getSession();

  if (!session) {
    return {
      success: false,
      authorized: false,
      error: 'Unauthorized: You must be authenticated to place an order.',
      fieldErrors: {},
    };
  }

  const actualFormData =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
        ? prevState
        : null;

  const rawData = actualFormData
    ? Object.fromEntries(actualFormData.entries())
    : typeof prevState === 'object' && prevState !== null
      ? prevState
      : {};

  const parseResult = orderSchema.safeParse({
    name: rawData.name,
    phone: rawData.phone,
  });

  if (!parseResult.success) {
    const { fieldErrors, formErrors } = parseResult.error.flatten();

    return {
      success: false,
      authorized: true,
      error: 'Validation failed. Please check the fields below.',
      fieldErrors,
      formErrors,
    };
  }

  const order = saveOrder({
    id: `ORD-${Date.now()}`,
    userId: session.id,
    name: parseResult.data.name,
    phone: parseResult.data.phone,
    status: 'Preparing',
    createdAt: new Date().toISOString(),
  });

  return {
    success: true,
    authorized: true,
    orderId: order.id,
    message: 'Order placed successfully!',
    order,
  };
}

export async function updateOrderStatus(prevStateOrFormData, maybeFormData, maybeInjectedSession) {
  const session =
    maybeInjectedSession !== undefined ? maybeInjectedSession : await getSession();

  if (!session) {
    return {
      success: false,
      authorized: false,
      error: 'Unauthorized: You must be authenticated to update order status.',
    };
  }

  if (session.role !== 'staff') {
    return {
      success: false,
      authorized: false,
      error: 'Forbidden: Only staff members can update order status.',
    };
  }

  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
        ? prevStateOrFormData
        : null;

  const rawData = formData
    ? Object.fromEntries(formData.entries())
    : typeof prevStateOrFormData === 'object' && prevStateOrFormData !== null
      ? prevStateOrFormData
      : {};

  const orderId = typeof rawData.orderId === 'string' ? rawData.orderId.trim() : '';
  const status = typeof rawData.status === 'string' ? rawData.status.trim() : '';

  if (!orderId) {
    return {
      success: false,
      authorized: true,
      error: 'Order ID is required.',
    };
  }

  if (!ALLOWED_ORDER_STATUSES.includes(status)) {
    return {
      success: false,
      authorized: true,
      error: `Invalid status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}`,
    };
  }

  const existingOrder = getOrder(orderId);
  if (!existingOrder) {
    return {
      success: false,
      authorized: true,
      error: 'Order not found.',
    };
  }

  const updatedOrder = updateOrderStatusInStore(orderId, status);

  // Hydrate memory from cookie if cold start occurred on Vercel, and persist updated order status
  try {
    const cookieStore = await cookies();
    let overrides = {};
    const existingCookie = cookieStore.get('order_status_overrides')?.value;
    if (existingCookie) {
      try {
        overrides = JSON.parse(existingCookie);
      } catch {}
    }
    overrides[orderId] = status;

    // Persist updated order status in cookie to survive serverless instance changes
    cookieStore.set('order_status_overrides', JSON.stringify(overrides), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch {
    // Safe no-op if cookies cannot be modified
  }

  // Cross-browser remote sync for Vercel serverless
  pushRemoteOrderOverride(orderId, status).catch(() => {});

  try {
    revalidatePath('/kitchen');
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath(`/track/${orderId}`);
    revalidatePath('/analytics');
  } catch {
    // Safe no-op when executed outside a Next.js request context (e.g. in unit tests)
  }

  return {
    success: true,
    authorized: true,
    orderId,
    status,
    message: `Order ${orderId} updated to ${status}.`,
    order: updatedOrder,
  };
}

export async function cancelOrder(prevStateOrFormData, maybeFormData, maybeInjectedSession) {
  const session =
    maybeInjectedSession !== undefined ? maybeInjectedSession : await getSession();

  if (!session) {
    return {
      success: false,
      authorized: false,
      error: 'Unauthorized: You must be authenticated to cancel an order.',
    };
  }

  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
        ? prevStateOrFormData
        : null;

  const rawData = formData
    ? Object.fromEntries(formData.entries())
    : typeof prevStateOrFormData === 'object' && prevStateOrFormData !== null
      ? prevStateOrFormData
      : {};

  const orderId = typeof rawData.orderId === 'string' ? rawData.orderId.trim() : '';

  if (!orderId) {
    return {
      success: false,
      authorized: true,
      error: 'Order ID is required.',
    };
  }

  const existingOrder = getOrder(orderId);
  if (!existingOrder) {
    return {
      success: false,
      authorized: true,
      error: 'Order not found.',
    };
  }

  // Ownership verification: user must own the order (or hold staff role)
  if (existingOrder.userId !== session.id && session.role !== 'staff') {
    return {
      success: false,
      authorized: false,
      error: 'Forbidden: You do not have permission to cancel this order.',
    };
  }

  // Status verification: only orders currently in "Preparing" status can be cancelled
  if (existingOrder.status !== 'Preparing') {
    return {
      success: false,
      authorized: true,
      error: `Cannot cancel order in '${existingOrder.status}' status. Only orders in 'Preparing' status can be cancelled.`,
    };
  }

  const updatedOrder = updateOrderStatusInStore(orderId, 'Cancelled');

  // Hydrate memory from cookie if cold start occurred on Vercel, and persist updated order status
  try {
    const cookieStore = await cookies();
    let overrides = {};
    const existingCookie = cookieStore.get('order_status_overrides')?.value;
    if (existingCookie) {
      try {
        overrides = JSON.parse(existingCookie);
      } catch {}
    }
    overrides[orderId] = 'Cancelled';

    // Persist updated order status in cookie to survive serverless instance changes
    cookieStore.set('order_status_overrides', JSON.stringify(overrides), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch {
    // Safe no-op if cookies cannot be modified
  }

  // Cross-browser remote sync for Vercel serverless
  pushRemoteOrderOverride(orderId, 'Cancelled').catch(() => {});

  try {
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    revalidatePath(`/track/${orderId}`);
    revalidatePath('/kitchen');
    revalidatePath('/analytics');
  } catch {
    // Safe no-op when executed outside a Next.js request context (e.g. in unit tests)
  }

  return {
    success: true,
    authorized: true,
    orderId,
    status: 'Cancelled',
    message: `Order ${orderId} has been successfully cancelled.`,
    order: updatedOrder,
  };
}

/**
 * Toggle a dish in the authenticated user's favorites.
 */
export async function toggleFavorite(prevStateOrDishId, maybeDishId, maybeInjectedSession) {
  const session =
    maybeInjectedSession !== undefined ? maybeInjectedSession : await getSession();

  if (!session) {
    return {
      success: false,
      authorized: false,
      error: 'Unauthorized: You must be authenticated to manage favorites.',
    };
  }

  let dishId = null;
  if (typeof prevStateOrDishId === 'number' || typeof prevStateOrDishId === 'string') {
    dishId = Number(prevStateOrDishId);
  } else if (typeof maybeDishId === 'number' || typeof maybeDishId === 'string') {
    dishId = Number(maybeDishId);
  } else if (prevStateOrDishId instanceof FormData) {
    dishId = Number(prevStateOrDishId.get('dishId'));
  } else if (maybeDishId instanceof FormData) {
    dishId = Number(maybeDishId.get('dishId'));
  } else if (typeof prevStateOrDishId === 'object' && prevStateOrDishId?.dishId) {
    dishId = Number(prevStateOrDishId.dishId);
  }

  if (isNaN(dishId) || !dishId) {
    return {
      success: false,
      authorized: true,
      error: 'Invalid dish ID provided.',
    };
  }

  const dish = await getDishById(dishId);
  if (!dish) {
    return {
      success: false,
      authorized: true,
      error: 'Dish not found.',
    };
  }

  // Hydrate memory from cookie if cold start occurred on Vercel
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get(`favorites_${session.id}`)?.value;
  if (cookieVal) {
    try {
      const parsed = JSON.parse(cookieVal);
      syncFavoritesFromList(session.id, parsed);
    } catch {
      // Ignore JSON parse errors on invalid cookie values
    }
  }

  const isFavorite = toggleFavoriteInStore(session.id, dishId);

  // Persist updated favorite IDs in user's cookie to survive serverless instance changes
  const updatedIds = Array.from(getFavoriteIds(session.id));
  try {
    cookieStore.set(`favorites_${session.id}`, JSON.stringify(updatedIds), {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch {
    // Safe no-op if cookies cannot be modified
  }

  try {
    revalidatePath('/favorites');
    revalidatePath('/menu');
    revalidatePath(`/menu/${dishId}`);
  } catch {
    // Safe no-op outside Next.js request context
  }

  return {
    success: true,
    authorized: true,
    dishId,
    isFavorite,
    message: isFavorite
      ? `${dish.name} added to your favorites.`
      : `${dish.name} removed from your favorites.`,
  };
}

/**
 * Create a new dish (Staff only).
 */
export async function createDish(prevState, formData, maybeInjectedSession) {
  const session =
    maybeInjectedSession !== undefined ? maybeInjectedSession : await getSession();

  if (!session) {
    return {
      success: false,
      authorized: false,
      error: 'Unauthorized: You must be authenticated as staff to create dishes.',
      fieldErrors: {},
    };
  }

  if (session.role !== 'staff') {
    return {
      success: false,
      authorized: false,
      error: 'Forbidden: Only staff members are authorized to create dishes.',
      fieldErrors: {},
    };
  }

  const rawData =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : prevState instanceof FormData
        ? Object.fromEntries(prevState.entries())
        : typeof formData === 'object' && formData !== null
          ? formData
          : typeof prevState === 'object' && prevState !== null
            ? prevState
            : {};

  const parseResult = dishSchema.safeParse({
    name: rawData.name,
    category: rawData.category,
    price: rawData.price,
    vegetarian: rawData.vegetarian === 'true' || rawData.vegetarian === 'on' || rawData.vegetarian === true,
    available: rawData.available !== undefined ? (rawData.available === 'true' || rawData.available === 'on' || rawData.available === true) : true,
    image: rawData.image || undefined,
    description: rawData.description || undefined,
  });

  if (!parseResult.success) {
    const { fieldErrors, formErrors } = parseResult.error.flatten();
    return {
      success: false,
      authorized: true,
      error: 'Validation failed. Please verify the dish attributes.',
      fieldErrors,
      formErrors,
    };
  }

  const createdDish = await createDishInStore(parseResult.data);

  try {
    revalidatePath('/menu');
    revalidatePath('/admin');
    revalidatePath('/api/dishes');
  } catch {
    // Safe no-op outside Next.js request context
  }

  return {
    success: true,
    authorized: true,
    message: `Dish "${createdDish.name}" created successfully!`,
    dish: createdDish,
  };
}

/**
 * Update an existing dish (Staff only).
 */
export async function updateDish(prevState, formData, maybeInjectedSession) {
  const session =
    maybeInjectedSession !== undefined ? maybeInjectedSession : await getSession();

  if (!session) {
    return {
      success: false,
      authorized: false,
      error: 'Unauthorized: You must be authenticated as staff to update dishes.',
      fieldErrors: {},
    };
  }

  if (session.role !== 'staff') {
    return {
      success: false,
      authorized: false,
      error: 'Forbidden: Only staff members are authorized to update dishes.',
      fieldErrors: {},
    };
  }

  const rawData =
    formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : prevState instanceof FormData
        ? Object.fromEntries(prevState.entries())
        : typeof formData === 'object' && formData !== null
          ? formData
          : typeof prevState === 'object' && prevState !== null
            ? prevState
            : {};

  const dishId = Number(rawData.id);
  if (isNaN(dishId) || !dishId) {
    return {
      success: false,
      authorized: true,
      error: 'Invalid dish ID.',
    };
  }

  const parseResult = dishSchema.safeParse({
    name: rawData.name,
    category: rawData.category,
    price: rawData.price,
    vegetarian: rawData.vegetarian === 'true' || rawData.vegetarian === 'on' || rawData.vegetarian === true,
    available: rawData.available !== undefined ? (rawData.available === 'true' || rawData.available === 'on' || rawData.available === true) : true,
    image: rawData.image || undefined,
    description: rawData.description || undefined,
  });

  if (!parseResult.success) {
    const { fieldErrors, formErrors } = parseResult.error.flatten();
    return {
      success: false,
      authorized: true,
      error: 'Validation failed. Please verify the dish attributes.',
      fieldErrors,
      formErrors,
    };
  }

  const updatedDish = await updateDishInStore(dishId, parseResult.data);
  if (!updatedDish) {
    return {
      success: false,
      authorized: true,
      error: `Dish with ID ${dishId} was not found.`,
    };
  }

  try {
    revalidatePath('/menu');
    revalidatePath(`/menu/${dishId}`);
    revalidatePath('/admin');
    revalidatePath('/api/dishes');
  } catch {
    // Safe no-op outside Next.js request context
  }

  return {
    success: true,
    authorized: true,
    message: `Dish "${updatedDish.name}" updated successfully!`,
    dish: updatedDish,
  };
}

/**
 * Toggle a dish's availability between Available and Sold Out (Staff only).
 */
export async function toggleDishAvailability(dishIdInput, maybeInjectedSession) {
  const session =
    maybeInjectedSession !== undefined ? maybeInjectedSession : await getSession();

  if (!session) {
    return {
      success: false,
      authorized: false,
      error: 'Unauthorized: You must be authenticated as staff to toggle availability.',
    };
  }

  if (session.role !== 'staff') {
    return {
      success: false,
      authorized: false,
      error: 'Forbidden: Only staff members are authorized to toggle dish availability.',
    };
  }

  const dishId = Number(dishIdInput);
  if (isNaN(dishId) || !dishId) {
    return {
      success: false,
      authorized: true,
      error: 'Invalid dish ID provided.',
    };
  }

  const updatedDish = await toggleDishAvailabilityInStore(dishId);
  if (!updatedDish) {
    return {
      success: false,
      authorized: true,
      error: `Dish with ID ${dishId} was not found.`,
    };
  }

  try {
    revalidatePath('/menu');
    revalidatePath('/admin');
    revalidatePath(`/menu/${encodeURIComponent(updatedDish.name)}`);
    revalidatePath('/api/dishes');
  } catch {
    // Safe no-op outside Next.js request context
  }

  const statusText = updatedDish.available !== false ? 'Available' : 'Sold Out';
  return {
    success: true,
    authorized: true,
    dish: updatedDish,
    available: updatedDish.available !== false,
    message: `"${updatedDish.name}" is now marked as ${statusText}.`,
  };
}

/**
 * Delete a dish (Staff only).
 */
export async function deleteDish(prevStateOrId, maybeId, maybeInjectedSession) {
  const session =
    maybeInjectedSession !== undefined ? maybeInjectedSession : await getSession();

  if (!session) {
    return {
      success: false,
      authorized: false,
      error: 'Unauthorized: You must be authenticated as staff to delete dishes.',
    };
  }

  if (session.role !== 'staff') {
    return {
      success: false,
      authorized: false,
      error: 'Forbidden: Only staff members are authorized to delete dishes.',
    };
  }

  let dishId = null;
  if (typeof prevStateOrId === 'number' || typeof prevStateOrId === 'string') {
    dishId = Number(prevStateOrId);
  } else if (typeof maybeId === 'number' || typeof maybeId === 'string') {
    dishId = Number(maybeId);
  } else if (prevStateOrId instanceof FormData) {
    dishId = Number(prevStateOrId.get('id'));
  } else if (maybeId instanceof FormData) {
    dishId = Number(maybeId.get('id'));
  }

  if (isNaN(dishId) || !dishId) {
    return {
      success: false,
      authorized: true,
      error: 'Invalid dish ID.',
    };
  }

  const success = await deleteDishInStore(dishId);
  if (!success) {
    return {
      success: false,
      authorized: true,
      error: `Dish with ID ${dishId} not found or could not be deleted.`,
    };
  }

  try {
    revalidatePath('/menu');
    revalidatePath(`/menu/${dishId}`);
    revalidatePath('/admin');
    revalidatePath('/api/dishes');
    revalidatePath('/favorites');
  } catch {
    // Safe no-op outside Next.js request context
  }

  return {
    success: true,
    authorized: true,
    dishId,
    message: `Dish ${dishId} has been successfully deleted.`,
  };
}

export async function signOutAction() {
  await deleteSession();
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/menu');
    revalidatePath('/orders');
    revalidatePath('/favorites');
    revalidatePath('/kitchen');
    revalidatePath('/admin');
  } catch {
    // Safe no-op outside Next.js request context
  }
  return { success: true };
}

export async function signInAction(prevState, formData) {
  const actualFormData =
    formData instanceof FormData
      ? formData
      : prevState instanceof FormData
        ? prevState
        : null;

  const rawData = actualFormData
    ? Object.fromEntries(actualFormData.entries())
    : typeof prevState === 'object' && prevState !== null
      ? prevState
      : {};

  const rawSessionId = rawData.sessionId?.toString().trim();
  const staffCode = rawData.staffCode?.toString().trim();
  const rawNext = rawData.next?.toString() || '/';

  if (!rawSessionId) {
    return { success: false, error: 'Session ID is required.' };
  }

  const safeTarget =
    typeof rawNext === 'string' &&
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    !rawNext.includes('\\')
      ? rawNext.trim()
      : '/';

  const expectedStaffCode = process.env.STAFF_ACCESS_CODE || 'addis-kitchen-2026';

  let role = 'customer';
  if (staffCode) {
    if (staffCode === expectedStaffCode) {
      role = 'staff';
    } else {
      return { success: false, error: 'Invalid staff passcode. Please check and try again.' };
    }
  }

  await createSession(rawSessionId, role);

  try {
    revalidatePath('/', 'layout');
    revalidatePath('/menu');
    revalidatePath('/orders');
    revalidatePath('/favorites');
    revalidatePath('/kitchen');
    revalidatePath('/admin');
  } catch {
    // Safe no-op outside Next.js request context
  }

  return { success: true, target: safeTarget };
}