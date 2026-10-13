import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrdersForUser } from '@/lib/orders';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Order History',
  description: 'View your previous and current orders with Addis Eats.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrdersPage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin?next=/orders');
  }

  const orders = getOrdersForUser(session.id);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <header className="mb-8">
        <span className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
          Your Orders
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mt-1">
          Order History
        </h1>

        <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
          Orders belonging to session: {session.id}
        </p>
      </header>

      {orders.length === 0 ? (
        <p className="text-stone-500 dark:text-stone-400">
          You have no orders yet.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="border border-stone-200 dark:border-stone-800 rounded-xl p-5 bg-white dark:bg-stone-900 flex items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                  {order.id}
                </h2>

                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {order.name} · {order.phone}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                  {order.status}
                </span>
                <Link
                  href={`/orders/${order.id}`}
                  className="text-xs bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-transparent dark:border-amber-800/60 px-3 py-1.5 rounded-lg no-underline font-medium transition-colors"
                >
                  Track
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}