import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getOrder } from '@/lib/orders';
import { getSession } from '@/lib/session';
import { etb, when } from '@/lib/format';
import OrderStatus from '@/components/OrderStatus';
import MapPanel from './MapPanel';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  return {
    title: `Track Order #${id || ''} · Addis Eats`,
    description: `Live delivery map and preparation status for order #${id || ''}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function TrackPage({ params }) {
  const session = await getSession();
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!session) {
    redirect(`/signin?next=/track/${encodeURIComponent(id)}`);
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
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl mb-4 border border-rose-200 dark:border-rose-900/60 font-bold">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
            Order Access Restricted
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
            Order <span className="font-mono font-bold text-stone-900 dark:text-stone-100">#{id}</span> belongs to another customer account. You are currently signed in as <span className="font-semibold text-stone-900 dark:text-stone-100">&quot;{session.id}&quot;</span>.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/orders"
              className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-sm transition-colors no-underline"
            >
              Back to My Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const itemsList = Array.isArray(order.items) ? order.items : [];
  const totalItemCount = itemsList.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14 space-y-10">
      {/* Navigation breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors no-underline"
        >
          <span>&larr;</span>
          <span>Back to Order History</span>
        </Link>

        <span className="text-xs text-stone-400">
          Addis Eats Courier Tracking
        </span>
      </div>

      {/* Live SSE Order Status Component */}
      <OrderStatus initialOrder={order} />

      {/* Main Delivery Tracking & Map Section */}
      <section aria-labelledby="delivery-tracking-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <div>
            <h2 id="delivery-tracking-heading" className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Live Delivery Route Map
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              Real-time courier progress across the Addis Ababa street network to your doorstep.
            </p>
          </div>
          <span className="text-xs font-medium text-amber-900 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/50 self-start sm:self-auto">
            📍 Sector: {order.area || 'Addis Ababa'}
          </span>
        </div>

        {/* The Leaflet Map (loaded with ssr: false) */}
        <MapPanel
          area={order.area || 'Bole'}
          orderId={order.id}
          status={order.status}
        />

        {/* Textual Delivery Information (Day 47 Accessibility Requirement: Map alternative for screen readers) */}
        <div
          role="region"
          aria-label="Textual delivery information and courier details"
          className="rounded-3xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-xs"
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100 dark:border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Delivery Details & Accessible Summary
            </h3>
            <span className="text-[11px] text-stone-400">
              Verified Addis Eats Order
            </span>
          </div>

          <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Customer Name
              </dt>
              <dd className="font-bold text-stone-900 dark:text-stone-100 mt-1 text-base">
                {order.name || session.id}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Delivery Area
              </dt>
              <dd className="font-bold text-stone-900 dark:text-stone-100 mt-1 text-base">
                📍 {order.area || 'Bole, Addis Ababa'}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Order Placed
              </dt>
              <dd className="font-bold text-stone-900 dark:text-stone-100 mt-1 text-sm">
                {when(order.createdAt)}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Total Payment
              </dt>
              <dd className="font-extrabold text-amber-900 dark:text-amber-400 mt-1 text-base tabular-nums">
                {etb(order.total)}
              </dd>
            </div>
          </dl>

          {/* Items Breakdown */}
          {itemsList.length > 0 && (
            <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-3">
                Included Dishes ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
              </h4>
              <ul className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
                {itemsList.map((item, idx) => (
                  <li key={idx} className="py-2.5 flex items-center justify-between">
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {item.name} <span className="text-stone-400 text-xs">x{item.quantity || 1}</span>
                    </span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {etb((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Accessible summary note */}
          <div className="mt-6 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/80 text-xs text-stone-600 dark:text-stone-300 space-y-1">
            <p>
              <strong>Courier Telemetry:</strong> Courier dispatch departing kitchen in Addis Ababa towards{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">{order.area || 'Addis Ababa'}</span>.
            </p>
            <p className="text-stone-500 dark:text-stone-400">
              Demonstration note: Coordinates and route simulation follow the Day 47 curriculum standard.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
