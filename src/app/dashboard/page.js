import Link from 'next/link';
import { redirect } from 'next/navigation';
import RevenueChart from './RevenueChart';
import OrdersChart from './OrdersChart';
import { getOrdersByDay, getRevenueByArea, getAllOrders, hydrateAllOrders } from '@/lib/orders';
import { getSession } from '@/lib/session';
import { etb } from '@/lib/format';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Staff Analytics Dashboard · Addis Eats',
  description: 'Revenue and order activity overview across Addis Ababa for staff members.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/signin?next=/dashboard');
  }

  if (session.role !== 'staff') {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-rose-200/90 dark:border-rose-900/60 p-8 sm:p-12 shadow-xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-2xl border border-rose-200 dark:border-rose-900/60">
            &times;
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
            Staff Access Required
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed mb-6">
            The analytics dashboard is restricted to Addis Eats staff members. Your account (&quot;{session.id}&quot;) does not currently have administrative staff permissions.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/menu"
              className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-sm transition-colors no-underline"
            >
              Back to Menu
            </Link>
            <Link
              href="/signin?next=/dashboard"
              className="px-5 py-2.5 rounded-full border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors no-underline"
            >
              Sign In as Staff
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Hydrate all orders from cookie for serverless persistence
  const cookieStore = await cookies();
  await hydrateAllOrders(cookieStore);

  // Server-side aggregations: only summarised rows cross to the client
  const revenueByArea = getRevenueByArea();
  const ordersByDay = getOrdersByDay();
  const allOrders = getAllOrders();

  const totalRevenue = revenueByArea.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrdersCount = allOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  const topArea = [...revenueByArea].sort((a, b) => b.revenue - a.revenue)[0]?.area || 'N/A';

  const hasRevenueData =
    revenueByArea.length > 0 && revenueByArea.some((item) => item.revenue > 0);
  const hasOrdersData = ordersByDay.length > 0;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400 font-bold block">
              Staff Business Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-[10px] font-bold uppercase">
              Live Metrics
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Analytics & Reports
          </h1>

          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5">
            Revenue breakdown and order activity across Addis Ababa delivery sectors.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/kitchen"
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-xs transition-colors no-underline border border-transparent dark:border-stone-700"
          >
            Kitchen Queue &rarr;
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-xs transition-colors no-underline shadow-xs"
          >
            Manage Dishes &rarr;
          </Link>
        </div>
      </header>

      {/* KPI Highlight Cards */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
            Total Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {etb(totalRevenue)}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1 block">
            Across all neighbourhoods
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
            Total Orders
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {totalOrdersCount}
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-1 block">
            Customer submissions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
            Average Ticket
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            {etb(avgOrderValue)}
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-1 block">
            Average per customer order
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
            Top Sector
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 dark:text-amber-400 mt-1 truncate">
            {topArea}
          </div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-1 block">
            Highest cumulative sales
          </span>
        </div>
      </section>

      {/* Main Charts & Accompanying Accessible Tables */}
      <section className="space-y-10">
        {/* Chart 1: Revenue by Neighbourhood */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Revenue by Neighbourhood
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                Total cumulative sales distribution across delivery locations in ETB.
              </p>
            </div>
            <span className="text-xs font-medium text-amber-900 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/50 self-start sm:self-auto">
              Currency: ETB · Baseline at 0
            </span>
          </div>

          {!hasRevenueData ? (
            <div className="py-16 text-center rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800">
              <p className="text-stone-500 dark:text-stone-400 text-sm font-semibold">
                No revenue data recorded yet.
              </p>
              <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">
                Completed customer orders will populate neighbourhood revenue automatically.
              </p>
            </div>
          ) : (
            <>
              {/* Client Recharts Component */}
              <RevenueChart data={revenueByArea} />

              {/* Accompanying Accessible Table */}
              <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Tabular Data Breakdown
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    Accessible table for screen readers & spreadsheets
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                  <table className="w-full text-sm border-collapse">
                    <caption className="sr-only">
                      Revenue by neighbourhood table representation
                    </caption>

                    <thead className="bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
                      <tr>
                        <th scope="col" className="py-3 px-4 text-left font-semibold">
                          Neighbourhood
                        </th>
                        <th scope="col" className="py-3 px-4 text-right font-semibold">
                          Total Revenue (ETB)
                        </th>
                        <th scope="col" className="py-3 px-4 text-right font-semibold hidden sm:table-cell">
                          Share of Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {revenueByArea.map((item) => {
                        const sharePercent =
                          totalRevenue > 0
                            ? ((item.revenue / totalRevenue) * 100).toFixed(1)
                            : '0.0';

                        return (
                          <tr
                            key={item.area}
                            className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                          >
                            <td className="py-3 px-4 font-medium text-stone-800 dark:text-stone-200">
                              {item.area}
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums font-bold text-stone-900 dark:text-stone-100">
                              {etb(item.revenue)}
                            </td>
                            <td className="py-3 px-4 text-right tabular-nums text-stone-500 dark:text-stone-400 text-xs hidden sm:table-cell">
                              {sharePercent}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Chart 2: Orders Over Time */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
                Orders Over Time
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                Daily incoming order volume across all registered customer accounts.
              </p>
            </div>
            <span className="text-xs font-medium text-amber-900 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/50 self-start sm:self-auto">
              Unit: Orders / Day
            </span>
          </div>

          {!hasOrdersData ? (
            <div className="py-16 text-center rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800">
              <p className="text-stone-500 dark:text-stone-400 text-sm font-semibold">
                No order history available yet.
              </p>
              <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">
                Incoming orders will be automatically tracked daily on this timeline.
              </p>
            </div>
          ) : (
            <>
              {/* Client Recharts Component */}
              <OrdersChart data={ordersByDay} />

              {/* Accompanying Accessible Table */}
              <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Daily Volume Breakdown
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    Accessible table representation of timeline
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                  <table className="w-full text-sm border-collapse">
                    <caption className="sr-only">
                      Orders per day table representation
                    </caption>

                    <thead className="bg-stone-50 dark:bg-stone-800/70 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
                      <tr>
                        <th scope="col" className="py-3 px-4 text-left font-semibold">
                          Date
                        </th>
                        <th scope="col" className="py-3 px-4 text-right font-semibold">
                          Total Orders
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {ordersByDay.map((item) => (
                        <tr
                          key={item.date}
                          className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-stone-800 dark:text-stone-200">
                            {item.date}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums font-bold text-stone-900 dark:text-stone-100">
                            {item.orders}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
