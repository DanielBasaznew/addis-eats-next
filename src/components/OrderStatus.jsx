'use client';

import { useState, useTransition } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { cancelOrder } from '@/app/actions';

export default function OrderStatus({ initialOrder }) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/orders?id=${initialOrder.id}`,
    fetcher,
    {
      fallbackData: {
        success: true,
        order: initialOrder,
      },
      refreshInterval: 5000,
    }
  );

  const [isPending, startTransition] = useTransition();
  const [cancelError, setCancelError] = useState(null);

  const order = data?.order || initialOrder;
  const isPreparing = order.status === 'Preparing';
  const isCancelled = order.status === 'Cancelled';

  async function handleCancel(formData) {
    setCancelError(null);
    startTransition(async () => {
      const result = await cancelOrder(formData);
      if (!result?.success) {
        setCancelError(result?.error || 'Failed to cancel order.');
      } else {
        await mutate();
      }
    });
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest opacity-60">
          Order Status
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          {order.id}
        </h1>
      </div>

      {error && (
        <p className="text-sm text-rose-600">
          Unable to refresh order status.
        </p>
      )}

      {cancelError && (
        <div
          role="alert"
          className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm"
        >
          <strong>Cancellation Failed:</strong> {cancelError}
        </div>
      )}

      <div
        className={`rounded-2xl border p-6 ${
          isCancelled ? 'border-rose-200 bg-rose-50/40' : 'border-stone-200 bg-white'
        }`}
      >
        <p className="text-sm opacity-60">Current status</p>

        <div className="mt-2 flex items-center justify-between">
          <p
            className={`text-2xl font-semibold ${
              isCancelled ? 'text-rose-700' : 'text-stone-900'
            }`}
          >
            {order.status}
          </p>

          {isCancelled && (
            <span className="text-xs px-3 py-1 rounded-full font-semibold bg-rose-100 text-rose-800 border border-rose-200">
              Cancelled
            </span>
          )}
        </div>

        <p className="mt-4 text-sm opacity-60">
          {isCancelled
            ? 'This order has been cancelled and will not be prepared.'
            : isLoading
            ? 'Checking for updates...'
            : 'Status updates automatically every 5 seconds.'}
        </p>

        {isPreparing && (
          <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-stone-800 m-0">
                Need to cancel?
              </p>
              <p className="text-xs text-stone-500 m-0">
                You can cancel while the order is still in the preparing stage.
              </p>
            </div>

            <form action={handleCancel}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}