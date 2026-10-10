import { getOrder } from '@/lib/orders';
import { getSession } from '@/lib/session';

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
