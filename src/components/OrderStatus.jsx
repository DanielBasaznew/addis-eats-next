'use client';

import { useEffect, useState, useTransition } from 'react';
import { cancelOrder } from '@/app/actions';
import { when } from '@/lib/format';

const STATUS_STEPS = ['Preparing', 'Cooking', 'Ready', 'Delivered'];

export default function OrderStatus({ initialOrder, onStatusChange }) {
  const [order, setOrder] = useState(initialOrder);
  const [connectionState, setConnectionState] = useState(
    initialOrder?.status === 'Delivered' || initialOrder?.status === 'Cancelled'
      ? 'Terminal'
      : 'Connecting'
  );
  const [isPending, startTransition] = useTransition();
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    // If order is already completed or cancelled, no need to maintain an SSE connection
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      setConnectionState('Terminal');
      return;
    }

    let active = true;
    const streamUrl = `/api/orders/${encodeURIComponent(initialOrder.id)}/stream`;
    const source = new EventSource(streamUrl);

    source.onopen = () => {
      if (active) setConnectionState('Connected');
    };

    // Listen for custom "status" event sent by route handler
    source.addEventListener('status', (event) => {
      if (!active) return;
      try {
        const update = JSON.parse(event.data);
        if (update && update.status) {
          setOrder((prev) => {
            const next = {
              ...prev,
              status: update.status,
              updatedAt: update.updatedAt || prev.updatedAt,
            };
            if (onStatusChange) onStatusChange(next);
            return next;
          });

          if (update.status === 'Delivered' || update.status === 'Cancelled') {
            setConnectionState('Terminal');
            source.close();
          }
        }
      } catch (err) {
        console.error('Error parsing SSE status message:', err);
      }
    });

    source.onerror = () => {
      if (active) {
        // EventSource will automatically attempt reconnection
        setConnectionState('Reconnecting');
      }
    };

    // Cleanup: essential to close stream on unmount to prevent server connection leaks
    return () => {
      active = false;
      source.close();
    };
  }, [initialOrder.id, order.status, onStatusChange]);

  async function handleCancel(formData) {
    setCancelError(null);
    startTransition(async () => {
      const result = await cancelOrder(formData);
      if (!result?.success) {
        setCancelError(result?.error || 'Failed to cancel order.');
      } else {
        setOrder((prev) => ({
          ...prev,
          status: 'Cancelled',
          updatedAt: new Date().toISOString(),
        }));
      }
    });
  }

  const isPreparing = order.status === 'Preparing';
  const isCancelled = order.status === 'Cancelled';
  const isDelivered = order.status === 'Delivered';

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <section className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-amber-900 dark:text-amber-400 font-bold block">
              Live Order Telemetry
            </span>

            {/* Connection State Badge */}
            {connectionState === 'Connected' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live SSE Active
              </span>
            )}
            {connectionState === 'Connecting' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Connecting stream…
              </span>
            )}
            {connectionState === 'Reconnecting' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Reconnecting…
              </span>
            )}
            {connectionState === 'Terminal' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {isCancelled ? 'Order Cancelled' : 'Completed'}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight mt-1">
            Order #{order.id}
          </h1>
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400">
          Last status update: <span className="font-semibold text-stone-700 dark:text-stone-300">{when(order.updatedAt || order.createdAt)}</span>
        </div>
      </div>

      {cancelError && (
        <div
          role="alert"
          className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-800 dark:text-rose-300 text-xs sm:text-sm"
        >
          <strong>Cancellation Failed:</strong> {cancelError}
        </div>
      )}

      {/* Main Status & Progress Panel */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`rounded-3xl border p-6 sm:p-8 shadow-xs transition-colors ${
          isCancelled
            ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/40'
            : isDelivered
            ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
            : 'border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 block">
              Current Kitchen & Delivery Stage
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 flex items-center gap-3">
              <span>{order.status}</span>
              {isDelivered && <span>🎉</span>}
              {order.status === 'Ready' && <span>🛵</span>}
              {order.status === 'Cooking' && <span>🍲</span>}
              {order.status === 'Preparing' && <span>👨‍🍳</span>}
            </div>
          </div>

          <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
            {isCancelled && 'This order has been cancelled and will not be prepared.'}
            {isPreparing && 'Kitchen is reading the ticket and prepping fresh ingredients.'}
            {order.status === 'Cooking' && 'Dishes are simmering on high heat in our clay wot cookware.'}
            {order.status === 'Ready' && 'Packed hot with fresh injera. Courier is en route for delivery.'}
            {isDelivered && 'Order successfully delivered! Enjoy your traditional Ethiopian meal.'}
          </div>
        </div>

        {/* 4-Stage Progress Timeline */}
        {!isCancelled && (
          <div className="relative mb-6">
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-stone-100 dark:bg-stone-800 -translate-y-1/2 z-0" />
            <div
              className="hidden sm:block absolute top-1/2 left-0 h-1 bg-amber-900 dark:bg-amber-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%`,
              }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
              {STATUS_STEPS.map((step, idx) => {
                const isComplete = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={step}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isCurrent
                        ? 'border-amber-900 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 font-bold shadow-xs'
                        : isComplete
                        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    <div className="text-xs uppercase tracking-wider font-semibold">
                      Step {idx + 1}
                    </div>
                    <div className="text-sm font-bold mt-0.5">{step}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancel Action (Only allowable when still in Preparing status) */}
        {isPreparing && (
          <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 m-0">
                Need to cancel this order?
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 m-0">
                You can freely cancel while the order is in the initial preparation phase.
              </p>
            </div>

            <form action={handleCancel}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
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