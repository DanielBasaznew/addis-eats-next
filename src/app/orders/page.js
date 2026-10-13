import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getOrdersForUser } from '@/lib/orders';
import { getSession } from '@/lib/session';
import { etb, when } from '@/lib/format';
import CsvExportButton from '@/components/CsvExportButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Order History · Addis Eats',
  description: 'View your previous and current orders with Addis Eats.',
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 5;

function getSortValue(order, sort) {
  if (sort === 'status') return order.status || '';
  if (sort === 'total') return Number(order.total || 0);
  return new Date(order.createdAt).getTime() || 0;
}

const STATUS_THEMES = {
  Preparing: 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
  Cooking: 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60',
  Ready: 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
  Delivered: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
  Cancelled: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60',
};

export default async function OrdersPage({ searchParams }) {
  const session = await getSession();

  if (!session) {
    redirect('/signin?next=/orders');
  }

  const resolvedParams = searchParams ? await searchParams : {};

  const sort = ['createdAt', 'status', 'total'].includes(resolvedParams.sort)
    ? resolvedParams.sort
    : 'createdAt';

  const dir = resolvedParams.dir === 'asc' ? 'asc' : 'desc';

  const requestedPage = Number(resolvedParams.page || 1);
  const page = Number.isInteger(requestedPage) && requestedPage > 0
    ? requestedPage
    : 1;

  const allOrders = getOrdersForUser(session.id);

  const sortedOrders = [...allOrders].sort((a, b) => {
    const aValue = getSortValue(a, sort);
    const bValue = getSortValue(b, sort);

    if (aValue < bValue) return dir === 'asc' ? -1 : 1;
    if (aValue > bValue) return dir === 'asc' ? 1 : -1;

    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const orders = sortedOrders.slice(start, start + PAGE_SIZE);

  const buildUrl = (nextPage, nextSort = sort, nextDir = dir) => {
    const query = new URLSearchParams();

    query.set('page', String(nextPage));
    query.set('sort', nextSort);
    query.set('dir', nextDir);

    return `/orders?${query.toString()}`;
  };

  const getNextSortDirection = (column) => {
    if (sort !== column) return column === 'createdAt' ? 'desc' : 'asc';
    return dir === 'asc' ? 'desc' : 'asc';
  };

  const getAriaSort = (column) => {
    if (sort !== column) return 'none';
    return dir === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-900 dark:text-amber-400 font-bold block mb-1">
            Customer Dashboard
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Order History
          </h1>

          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">
            Orders belonging to session: <strong className="text-stone-800 dark:text-stone-200">{session.id}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {allOrders.length > 0 && <CsvExportButton orders={allOrders} />}
          <Link
            href="/menu"
            className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-xs transition-colors no-underline shadow-xs"
          >
            + Place New Order
          </Link>
        </div>
      </header>

      {/* State 1: Empty state */}
      {allOrders.length === 0 ? (
        <section
          aria-labelledby="empty-orders-heading"
          className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-8 sm:p-12 text-center shadow-xs"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold text-2xl border border-amber-200/60 dark:border-amber-800/60">
            📦
          </div>
          <h2 id="empty-orders-heading" className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 mb-2">
            No orders placed yet
          </h2>
          <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6">
            Browse our authentic Ethiopian menu of slow-simmered wots, sizzling tibs, and fresh daily teff injera to place your first order.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-sm transition-colors no-underline shadow-sm"
          >
            Browse Menu &rarr;
          </Link>
        </section>
      ) : (
        /* State 2: Loaded state with accessible table */
        <>
          <div className="overflow-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <caption className="sr-only">
                  Your orders, sorted by {sort} {dir === 'asc' ? 'ascending' : 'descending'}, page {currentPage} of {totalPages}
                </caption>

                <thead className="bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-300">
                  <tr>
                    {/* Order column (sorted by createdAt) */}
                    <th
                      scope="col"
                      aria-sort={getAriaSort('createdAt')}
                      className="text-left px-5 py-4"
                    >
                      <Link
                        href={buildUrl(1, 'createdAt', getNextSortDirection('createdAt'))}
                        className="group inline-flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 hover:text-amber-900 dark:hover:text-amber-400 transition-colors no-underline"
                        title="Sort by date"
                      >
                        <span>Order & Date</span>
                        <span
                          aria-hidden="true"
                          className={`text-[10px] transition-transform ${
                            sort === 'createdAt'
                              ? 'text-amber-900 dark:text-amber-400 font-bold'
                              : 'text-stone-400 opacity-60 group-hover:opacity-100'
                          }`}
                        >
                          {sort === 'createdAt' ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      </Link>
                    </th>

                    {/* Delivery Area */}
                    <th scope="col" className="text-left px-5 py-4 font-bold text-stone-900 dark:text-stone-100 hidden sm:table-cell">
                      Area
                    </th>

                    {/* Status column */}
                    <th
                      scope="col"
                      aria-sort={getAriaSort('status')}
                      className="text-left px-5 py-4"
                    >
                      <Link
                        href={buildUrl(1, 'status', getNextSortDirection('status'))}
                        className="group inline-flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 hover:text-amber-900 dark:hover:text-amber-400 transition-colors no-underline"
                        title="Sort by status"
                      >
                        <span>Status</span>
                        <span
                          aria-hidden="true"
                          className={`text-[10px] transition-transform ${
                            sort === 'status'
                              ? 'text-amber-900 dark:text-amber-400 font-bold'
                              : 'text-stone-400 opacity-60 group-hover:opacity-100'
                          }`}
                        >
                          {sort === 'status' ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      </Link>
                    </th>

                    {/* Total column (right aligned) */}
                    <th
                      scope="col"
                      aria-sort={getAriaSort('total')}
                      className="text-right px-5 py-4"
                    >
                      <Link
                        href={buildUrl(1, 'total', getNextSortDirection('total'))}
                        className="group inline-flex items-center justify-end gap-1.5 font-bold text-stone-900 dark:text-stone-100 hover:text-amber-900 dark:hover:text-amber-400 transition-colors no-underline ml-auto"
                        title="Sort by total amount"
                      >
                        <span>Total (ETB)</span>
                        <span
                          aria-hidden="true"
                          className={`text-[10px] transition-transform ${
                            sort === 'total'
                              ? 'text-amber-900 dark:text-amber-400 font-bold'
                              : 'text-stone-400 opacity-60 group-hover:opacity-100'
                          }`}
                        >
                          {sort === 'total' ? (dir === 'asc' ? '▲' : '▼') : '⇅'}
                        </span>
                      </Link>
                    </th>

                    {/* Action column (right aligned) */}
                    <th scope="col" className="text-right px-5 py-4 font-bold text-stone-900 dark:text-stone-100">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {orders.map((order) => {
                    const statusClass =
                      STATUS_THEMES[order.status] ||
                      'bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700';

                    const itemCount = Array.isArray(order.items)
                      ? order.items.reduce((s, i) => s + (i.quantity || 1), 0)
                      : 0;

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors"
                      >
                        {/* Order identifier & date */}
                        <td className="px-5 py-4 align-middle">
                          <div className="font-bold text-stone-900 dark:text-stone-100 font-mono text-sm">
                            {order.id}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {when(order.createdAt)}
                            {itemCount > 0 && ` · ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                          </div>
                        </td>

                        {/* Area */}
                        <td className="px-5 py-4 align-middle hidden sm:table-cell text-stone-700 dark:text-stone-300">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                            📍 {order.area || 'Addis Ababa'}
                          </span>
                        </td>

                        {/* Status chip */}
                        <td className="px-5 py-4 align-middle">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClass}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Total amount (right aligned with tabular figures) */}
                        <td className="px-5 py-4 text-right align-middle tabular-nums font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                          {etb(order.total)}
                        </td>

                        {/* Action link */}
                        <td className="px-5 py-4 text-right align-middle">
                          <Link
                            href={`/track/${order.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 transition-colors no-underline"
                          >
                            <span>Track</span>
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Accessible Footer with Summary Info */}
            <div className="px-5 py-3 bg-stone-50/70 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>
                Showing <strong className="text-stone-700 dark:text-stone-300">{orders.length}</strong> of{' '}
                <strong className="text-stone-700 dark:text-stone-300">{allOrders.length}</strong> total orders
              </span>
              <span>
                Sorted by <strong className="text-stone-700 dark:text-stone-300">{sort}</strong> ({dir})
              </span>
            </div>
          </div>

          {/* Accessible Pagination Navigation */}
          <nav
            aria-label="Order history pagination"
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
          >
            <span className="text-sm text-stone-500 dark:text-stone-400">
              Page <strong className="text-stone-800 dark:text-stone-200">{currentPage}</strong> of{' '}
              <strong className="text-stone-800 dark:text-stone-200">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              {currentPage > 1 ? (
                <Link
                  href={buildUrl(currentPage - 1)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs sm:text-sm font-semibold transition-colors no-underline shadow-2xs"
                >
                  &larr; Previous
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600 text-xs sm:text-sm font-medium cursor-not-allowed select-none"
                >
                  &larr; Previous
                </span>
              )}

              {/* Numbered Page Links */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isCurrent = pNum === currentPage;

                  return (
                    <Link
                      key={pNum}
                      href={buildUrl(pNum)}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-colors no-underline ${
                        isCurrent
                          ? 'bg-amber-900 dark:bg-amber-600 text-white shadow-xs'
                          : 'border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {pNum}
                    </Link>
                  );
                })}
              </div>

              {/* Next Button */}
              {currentPage < totalPages ? (
                <Link
                  href={buildUrl(currentPage + 1)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs sm:text-sm font-semibold transition-colors no-underline shadow-2xs"
                >
                  Next &rarr;
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600 text-xs sm:text-sm font-medium cursor-not-allowed select-none"
                >
                  Next &rarr;
                </span>
              )}
            </div>
          </nav>
        </>
      )}
    </main>
  );
}