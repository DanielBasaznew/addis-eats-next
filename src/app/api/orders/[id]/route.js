import { getOrder } from '@/lib/orders';
import { getSession } from '@/lib/session';

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
