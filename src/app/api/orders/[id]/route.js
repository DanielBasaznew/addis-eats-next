import { getOrder, syncOrderOverrides, fetchRemoteOrderOverrides } from '@/lib/orders';
import { getSession } from '@/lib/session';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
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
    // Cross-browser fallback sync for Vercel serverless
    await fetchRemoteOrderOverrides();
  }

  const { id } = await params;
  const order = getOrder(id);

  if (!order) {
    return Response.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  }

  if (order.userId !== session.id && session.role !== 'staff') {
    return Response.json(
      {
        success: false,
        error: `Access Denied: Order #${id} belongs to another account. You are signed in as "${session.id}".`,
      },
      { status: 403 }
    );
  }

  return Response.json({
    success: true,
    order,
  });
}
