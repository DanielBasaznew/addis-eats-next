import { notFound, redirect } from 'next/navigation';
import { getOrder } from '@/lib/orders';
import { getSession } from '@/lib/session';
import OrderStatus from '@/components/OrderStatus';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Track Order',
  description: 'Live order tracking and preparation status for Addis Eats.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderPage({ params }) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    redirect(`/signin?next=/orders/${id}`);
  }

  const order = getOrder(id);

  if (!order || (order.userId !== session.id && session.role !== 'staff')) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 md:py-14">
      <OrderStatus initialOrder={order} />
    </main>
  );
}
