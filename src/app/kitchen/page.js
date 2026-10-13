import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getAllOrders, ALLOWED_ORDER_STATUSES } from '@/lib/orders';
import { updateOrderStatus } from '@/app/actions';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kitchen Dashboard',
  description: 'Manage incoming kitchen orders and preparation status.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function KitchenPage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin?next=/kitchen');
  }

  if (session.role !== 'staff') {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
          Access Denied
        </h1>

        <p className="mt-2 text-stone-500 dark:text-stone-400">
          This area is for staff only.
        </p>
      </main>
    );
  }

  const orders = getAllOrders();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <span className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold">
        Staff Area
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
        Kitchen Dashboard
      </h1>

      <p className="text-stone-500 dark:text-stone-400 mt-2">
        Welcome, staff. You can manage incoming orders here.
      </p>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-4">
          All Incoming Orders
        </h2>

        {orders.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400 text-sm">No incoming orders right now.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="border border-stone-200 dark:border-stone-800 rounded-xl p-5 bg-white dark:bg-stone-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                    {order.id}
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {order.name} · {order.phone} (Session: {order.userId})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {order.status}
                  </span>

                  <form action={updateOrderStatus} className="flex items-center gap-1.5">
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      aria-label={`Update status for ${order.id}`}
                      className="text-xs border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-medium focus:outline-none focus:ring-1 focus:ring-amber-800 dark:focus:ring-amber-500 cursor-pointer"
                    >
                      {ALLOWED_ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="text-xs bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Update
                    </button>
                  </form>

                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-transparent dark:border-stone-700 px-3 py-1.5 rounded-lg no-underline font-medium transition-colors"
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}