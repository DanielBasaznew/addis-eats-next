import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getAllOrders, ALLOWED_ORDER_STATUSES, hydrateAllOrders } from '@/lib/orders';
import { updateOrderStatus } from '@/app/actions';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // Hydrate all orders and overrides from cookies for serverless persistence
  const cookieStore = await cookies();
  await hydrateAllOrders(cookieStore);

  const orders = getAllOrders();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold block mb-1">
            Staff Area
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Kitchen Dashboard
          </h1>

          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1.5">
            Real-time queue of incoming customer orders and preparation status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-xs transition-colors no-underline shadow-xs"
          >
            📊 Analytics & Charts &rarr;
          </Link>
        </div>
      </header>

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
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                      {order.id}
                    </h3>
                    {order.isTableOrder || order.tableNumber ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Table #{order.tableNumber} (Dine-In)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                        Delivery {order.area ? `· ${order.area}` : ''}
                      </span>
                    )}

                    {order.paymentMethod && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        {order.paymentMethod === 'cash'
                          ? order.isTableOrder
                            ? 'Cash at Table'
                            : 'Cash on Delivery'
                          : order.paymentMethod.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {order.name} · {order.phone}
                    {order.address && !order.isTableOrder ? ` · ${order.address}` : ''}
                  </p>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {order.items.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium"
                        >
                          <span className="font-bold text-amber-900 dark:text-amber-400">
                            {item.quantity}×
                          </span>
                          <span>{item.name || `Dish #${item.dishId}`}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {order.specialInstructions && (
                    <p className="mt-2 text-xs italic text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
                      <strong>Note:</strong> {order.specialInstructions}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    {order.status}
                  </span>

                  <form
                    key={`form-${order.id}-${order.status}`}
                    action={updateOrderStatus}
                    className="flex items-center gap-1.5"
                  >
                    <input type="hidden" name="orderId" value={order.id} />
                    <select
                      key={`select-${order.id}-${order.status}`}
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