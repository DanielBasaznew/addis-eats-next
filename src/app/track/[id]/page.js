import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getOrder, syncOrderOverrides, fetchRemoteOrderOverrides } from '@/lib/orders';
import { getSession } from '@/lib/session';
import { etb, when } from '@/lib/format';
import { cookies } from 'next/headers';
import TrackInteractiveView from './TrackInteractiveView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // Hydrate memory from cookie if cold start occurred on Vercel
  const cookieStore = await cookies();
  const cookieVal = cookieStore.get('order_status_overrides')?.value;
  if (cookieVal) {
    try {
      syncOrderOverrides(JSON.parse(cookieVal));
    } catch {}
  } else {
    // Cross-browser fallback sync on Vercel
    await fetchRemoteOrderOverrides();
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
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-900/60">
            <svg className="w-7 h-7 text-rose-600 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
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

      {/* Live SSE Order Status Component & Real-Time Map */}
      <TrackInteractiveView initialOrder={order}>

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

          <dl className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Kitchen Origin
              </dt>
              <dd className="font-bold text-stone-900 dark:text-stone-100 mt-1 text-base flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>Bole Kitchen</span>
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Destination
              </dt>
              <dd className="font-bold text-stone-900 dark:text-stone-100 mt-1 text-base flex items-center gap-1.5">
                <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{order.area || 'Addis Ababa'}</span>
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Customer Name
              </dt>
              <dd className="font-bold text-stone-900 dark:text-stone-100 mt-1 text-base truncate">
                {order.name || session.id}
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
              <strong>Courier Telemetry:</strong> Courier departs from Addis Eats Main Kitchen in{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">Bole</span> traveling along the route towards{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">{order.area || 'Addis Ababa'}</span>.
            </p>
            <p className="text-stone-500 dark:text-stone-400">
              Demonstration note: Coordinates and route simulation follow the Day 47 curriculum standard.
            </p>
          </div>
        </div>
      </TrackInteractiveView>
    </main>
  );
}
