'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TrackInteractiveView from './TrackInteractiveView';
import { etb, when } from '@/lib/format';

export default function TrackClientFallback({ orderId, session }) {
  const router = useRouter();
  const [resolvedOrder, setResolvedOrder] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let found = null;

    // 1. Check localStorage for placed orders
    try {
      const stored = localStorage.getItem('addis_placed_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          found = parsed.find((o) => o && String(o.id).trim() === String(orderId).trim()) || null;
        }
      }
    } catch {}

    // 2. Check document.cookie as secondary fallback
    if (!found && typeof document !== 'undefined') {
      try {
        const match = document.cookie.match(/addis_custom_orders=([^;]+)/);
        if (match) {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          if (Array.isArray(parsed)) {
            found = parsed.find((o) => o && String(o.id).trim() === String(orderId).trim()) || null;
          }
        }
      } catch {}
    }

    if (found) {
      setResolvedOrder(found);
      // Ensure the cookie is written so subsequent server loads succeed
      try {
        const stored = localStorage.getItem('addis_placed_orders');
        let orderList = [found];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) orderList = parsed;
          } catch {}
        }
        const lean = orderList.slice(0, 5).map((o) => ({
          id: o.id,
          userId: o.userId,
          name: o.name,
          phone: o.phone,
          area: o.area,
          address: o.address,
          orderType: o.orderType,
          tableNumber: o.tableNumber,
          isTableOrder: o.isTableOrder,
          paymentMethod: o.paymentMethod,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          items: Array.isArray(o.items)
            ? o.items.map((i) => ({
                id: i.id || i.dishId,
                name: i.name,
                price: i.price,
                quantity: i.quantity,
              }))
            : [],
        }));
        document.cookie = `addis_custom_orders=${encodeURIComponent(
          JSON.stringify(lean)
        )}; path=/; max-age=2592000; SameSite=Lax`;

        // Refresh server components in background now that cookie is set
        setTimeout(() => {
          router.refresh();
        }, 500);
      } catch {}
    }

    setIsChecking(false);
  }, [orderId, router]);

  if (isChecking) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200">
          Locating Order #{orderId}...
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Synchronizing order tracking status with kitchen telemetry.
        </p>
      </main>
    );
  }

  if (!resolvedOrder) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-800 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-900/60 font-black text-2xl">
            ?
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mb-2">
            Order Not Found
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
            We couldn&apos;t locate an order with ID <span className="font-mono font-bold text-stone-900 dark:text-stone-100">#{orderId}</span>.
            It may have expired or was placed in a different browser session.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/orders"
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white font-semibold text-sm transition-colors no-underline"
            >
              View Order History
            </Link>
            <Link
              href="/menu"
              className="px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-semibold text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors no-underline"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const itemsList = Array.isArray(resolvedOrder.items) ? resolvedOrder.items : [];
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
      <TrackInteractiveView initialOrder={resolvedOrder}>
        {/* Textual Delivery Information */}
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
                <span>
                  {resolvedOrder.isTableOrder || resolvedOrder.tableNumber
                    ? `Table #${resolvedOrder.tableNumber} (Dine-In)`
                    : resolvedOrder.area || 'Addis Ababa'}
                </span>
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Customer Name
              </dt>
              <dd className="font-bold text-stone-900 dark:text-stone-100 mt-1 text-base truncate">
                {resolvedOrder.name || session?.id || 'Customer'}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Order Placed
              </dt>
              <dd className="font-bold text-stone-900 dark:text-stone-100 mt-1 text-sm">
                {when(resolvedOrder.createdAt)}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Total Payment
              </dt>
              <dd className="font-extrabold text-amber-900 dark:text-amber-400 mt-1 text-base tabular-nums">
                {etb(resolvedOrder.total)}
              </dd>
            </div>
          </dl>

          {/* Items Breakdown */}
          {itemsList.length > 0 && (
            <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
              <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-3">
                Included Dishes ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
              </h4>
              <ul className="divide-y divide-stone-100 dark:border-stone-800 text-sm">
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
        </div>
      </TrackInteractiveView>
    </main>
  );
}
