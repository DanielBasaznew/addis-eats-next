import Link from 'next/link';
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

  if (!order) {
    notFound();
  }

  const isOwner = order.userId === session.id;
  const isStaff = session.role === 'staff';

  if (!isOwner && !isStaff) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-lg">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-2xl mb-4 shadow-xs">
            🔒
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 mb-3">
            403 • Access Denied
          </span>

          <h1 className="text-2xl font-bold text-stone-900 tracking-tight mb-2">
            Private Order Access Restricted
          </h1>

          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            Order <span className="font-mono font-bold text-stone-900">#{id}</span> belongs to another customer account. You are currently signed in as <span className="font-semibold text-stone-900">&quot;{session.id}&quot;</span>.
          </p>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 mb-6 text-left space-y-1.5">
            <p className="font-semibold text-stone-800">Security & Privacy Policy:</p>
            <ul className="list-disc list-inside space-y-1 text-stone-500">
              <li>Orders can only be tracked by the customer who placed them.</li>
              <li>Kitchen and admin staff can manage all orders using staff access.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors no-underline shadow-xs"
            >
              View My Orders
            </Link>
            <Link
              href={`/signin?next=/orders/${id}`}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors no-underline"
            >
              Switch Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 md:py-14">
      <OrderStatus initialOrder={order} />
    </main>
  );
}
