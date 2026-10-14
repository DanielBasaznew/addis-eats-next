import { orderSchema } from '@/lib/schema';
import {
  getOrder,
  getOrdersForUser,
  saveOrder,
  hydrateAllOrders,
  saveCustomOrderToCookie,
} from '@/lib/orders';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const session = await getSession();

  if (!session) {
    return Response.json(
      { success: false, error: 'Not signed in' },
      { status: 401 }
    );
  }

  // Hydrate all orders and overrides from cookies for serverless persistence
  const cookieStore = await cookies();
  await hydrateAllOrders(cookieStore);

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const order = getOrder(id);

    if (!order || (order.userId !== session.id && session.role !== 'staff')) {
      return Response.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      order,
    });
  }

  return Response.json({
    success: true,
    orders: getOrdersForUser(session.id),
  });
}

export async function POST(request) {
  const session = await getSession();

  if (!session) {
    return Response.json(
      { success: false, error: 'Not signed in' },
      { status: 401 }
    );
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        success: false,
        error: 'Invalid JSON body',
      },
      { status: 400 }
    );
  }

  const result = orderSchema.safeParse(body);

  if (!result.success) {
    const { fieldErrors, formErrors } = result.error.flatten();

    return Response.json(
      {
        success: false,
        message: 'Validation failed',
        fieldErrors,
        errors: fieldErrors,
        formErrors,
      },
      { status: 422 }
    );
  }

  const order = saveOrder({
    id: `ORD-${Date.now()}`,
    userId: session.id,
    name: result.data.name,
    phone: result.data.phone,
    items: result.data.items || [],
    status: 'Preparing',
    createdAt: new Date().toISOString(),
  });

  try {
    const cookieStore = await cookies();
    saveCustomOrderToCookie(cookieStore, order);
  } catch {}

  return Response.json(
    {
      success: true,
      message: 'Order placed successfully',
      order,
    },
    { status: 201 }
  );
}