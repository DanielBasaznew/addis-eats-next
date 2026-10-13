import { orderSchema } from '@/lib/schema';
import {
  getOrder,
  getOrdersForUser,
  saveOrder,
  syncOrderOverrides,
  fetchRemoteOrderOverrides,
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

  // Hydrate memory from cookie if cold start occurred on Vercel
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get('order_status_overrides')?.value;
  if (cookieVal) {
    try {
      syncOrderOverrides(JSON.parse(cookieVal));
    } catch {}
  } else {
    // Cross-browser fallback sync on Vercel
    await fetchRemoteOrderOverrides();
  }

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

  return Response.json(
    {
      success: true,
      message: 'Order placed successfully',
      order,
    },
    { status: 201 }
  );
}