'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { cancelOrder } from '@/app/actions';
import { when } from '@/lib/format';

const STATUS_STEPS = [
  {
    key: 'Preparing',
    name: 'Preparing',
    icon: '👨‍🍳',
    shortDesc: 'Prepping ingredients',
    detail: 'Kitchen received your ticket and is prepping fresh traditional ingredients.',
    eta: 'Est. 10–15 min prep',
  },
  {
    key: 'Cooking',
    name: 'Cooking',
    icon: '🍲',
    shortDesc: 'Clay pot simmering',
    detail: 'Dishes are simmering to perfection over slow heat in authentic clay pots.',
    eta: 'Est. 15–20 min cooking',
  },
  {
    key: 'Ready',
    name: 'Out for Delivery',
    icon: '🛵',
    shortDesc: 'Courier en route',
    detail: 'Packed hot with fresh teff injera. Courier is en route through Addis Ababa.',
    eta: 'Est. 15–25 min courier transit',
  },
  {
    key: 'Delivered',
    name: 'Delivered',
    icon: '🎉',
    shortDesc: 'Arrived at doorstep',
    detail: 'Order successfully delivered! Enjoy your authentic Ethiopian culinary feast.',
    eta: 'Delivery complete',
  },
];

export default function OrderStatus({ initialOrder, onStatusChange }) {
  const [order, setOrder] = useState(initialOrder);
  const [connectionState, setConnectionState] = useState(
    initialOrder?.status === 'Delivered' || initialOrder?.status === 'Cancelled'
      ? 'Terminal'
      : 'Connecting'
  );
  const [isPending, startTransition] = useTransition();
  const [cancelError, setCancelError] = useState(null);

  const onStatusChangeRef = useRef(onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  // Sync state if server passes updated initialOrder (e.g. upon page refresh)
  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
      if (initialOrder.status === 'Delivered' || initialOrder.status === 'Cancelled') {
        setConnectionState('Terminal');
      }
    }
  }, [initialOrder]);

  useEffect(() => {
    // If order is already completed or cancelled, do not keep an SSE connection open
    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      setConnectionState('Terminal');
      return;
    }

    let active = true;
    const streamUrl = `/api/orders/${encodeURIComponent(initialOrder.id)}/stream`;
    const source = new EventSource(streamUrl);

    let pollInterval = null;

    source.onopen = () => {
      if (active) {
        setConnectionState('Connected');
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      }
    };

    function handleIncomingData(dataString) {
      if (!active) return;
      try {
        const update = JSON.parse(dataString);
        if (update && update.status) {
          setOrder((prev) => ({
            ...prev,
            status: update.status,
            updatedAt: update.updatedAt || prev.updatedAt,
          }));

          // Call parent callback outside of setState to keep the updater pure
          if (onStatusChangeRef.current) {
            onStatusChangeRef.current(update);
          }

          if (update.status === 'Delivered' || update.status === 'Cancelled') {
            setConnectionState('Terminal');
            if (pollInterval) clearInterval(pollInterval);
            source.close();
          }
        }
      } catch (err) {
        console.error('Error parsing SSE status update:', err);
      }
    }

    source.onmessage = (event) => handleIncomingData(event.data);
    source.addEventListener('status', (event) => handleIncomingData(event.data));

    source.onerror = () => {
      if (active) {
        setConnectionState('Reconnecting');
        // Day 47 standard fallback: If serverless hosting terminates the stream, poll every 5s
        if (!pollInterval) {
          pollInterval = setInterval(async () => {
            if (!active) return;
            try {
              const res = await fetch(`/api/orders/${encodeURIComponent(initialOrder.id)}`);
              if (res.ok) {
                const data = await res.json();
                if (data?.order) {
                  setOrder((prev) => ({
                    ...prev,
                    status: data.order.status,
                    updatedAt: data.order.updatedAt || prev.updatedAt,
                  }));
                  if (onStatusChangeRef.current) {
                    onStatusChangeRef.current(data.order);
                  }
                  if (data.order.status === 'Delivered' || data.order.status === 'Cancelled') {
                    setConnectionState('Terminal');
                    if (pollInterval) clearInterval(pollInterval);
                    source.close();
                  }
                }
              }
            } catch {
              // Ignore transient network errors
            }
          }, 5000);
        }
      }
    };

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      source.close();
    };
  }, [initialOrder.id]);

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

  // Find step index (defaulting to 0)
  const currentStepIndex = Math.max(
    0,
    STATUS_STEPS.findIndex((s) => s.key === order.status)
  );

  const activeStepConfig = STATUS_STEPS[currentStepIndex] || STATUS_STEPS[0];
  const progressPercent = Math.round(((currentStepIndex + 1) / STATUS_STEPS.length) * 100);

  return (
    <section className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-widest text-amber-900 dark:text-amber-400 font-extrabold block">
              Live Order Telemetry
            </span>

            {/* Connection State Indicator */}
            {connectionState === 'Connected' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live SSE Active
              </span>
            )}
            {connectionState === 'Connecting' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Connecting stream…
              </span>
            )}
            {connectionState === 'Reconnecting' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/80">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Reconnecting…
              </span>
            )}
            {connectionState === 'Terminal' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {isCancelled ? 'Order Cancelled' : 'Delivery Complete'}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Order #{order.id}
          </h1>
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400 self-start sm:self-auto bg-stone-50 dark:bg-stone-800/60 px-3 py-1.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
          Last status update: <span className="font-semibold text-stone-800 dark:text-stone-200">{when(order.updatedAt || order.createdAt)}</span>
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

      {/* Main Order Tracker Card */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`rounded-3xl border shadow-sm transition-all overflow-hidden ${
          isCancelled
            ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30'
            : isDelivered
            ? 'border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-stone-900'
            : 'border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900'
        }`}
      >
        {/* Stage Hero Banner */}
        <div className="p-6 sm:p-8 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-800/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-400 block mb-1">
                Current Kitchen & Delivery Stage
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{activeStepConfig.icon}</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                    {order.status}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                    {activeStepConfig.eta}
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:text-right max-w-sm">
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                {isCancelled
                  ? 'This order has been cancelled and will not be prepared.'
                  : activeStepConfig.detail}
              </p>
            </div>
          </div>
        </div>

        {/* 4-Stage Connected Stepper (Clean connecting lines between circle centers, never crossing text!) */}
        {!isCancelled && (
          <div className="p-6 sm:p-8">
            <div className="flex items-start w-full">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isLast = idx === STATUS_STEPS.length - 1;

                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center">
                    {/* Top Row: Left Half-Line + Circle + Right Half-Line */}
                    <div className="w-full flex items-center">
                      {/* Left half-line (invisible on first step) */}
                      <div
                        className={`h-1 flex-1 rounded-l-full transition-colors duration-500 ${
                          idx === 0
                            ? 'invisible'
                            : isCompleted || isCurrent
                            ? 'bg-emerald-500 dark:bg-emerald-500'
                            : 'bg-stone-200 dark:bg-stone-800'
                        }`}
                      />

                      {/* Step Circle Node */}
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base shrink-0 transition-all duration-300 shadow-sm relative ${
                          isCompleted
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/80'
                            : isCurrent
                            ? 'bg-amber-600 text-white ring-4 ring-amber-200 dark:ring-amber-900/80 scale-110 shadow-amber-500/20'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 border-2 border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : isCurrent ? (
                          <span className="text-lg sm:text-xl">{step.icon}</span>
                        ) : (
                          <span className="text-xs sm:text-sm font-semibold">{idx + 1}</span>
                        )}
                      </div>

                      {/* Right half-line (invisible on last step) */}
                      <div
                        className={`h-1 flex-1 rounded-r-full transition-colors duration-500 ${
                          isLast
                            ? 'invisible'
                            : isCompleted
                            ? 'bg-emerald-500 dark:bg-emerald-500'
                            : 'bg-stone-200 dark:bg-stone-800'
                        }`}
                      />
                    </div>

                    {/* Step Labels cleanly BELOW the line */}
                    <div className="mt-3 text-center px-1">
                      <span
                        className={`text-[10px] sm:text-xs uppercase font-extrabold tracking-wider block ${
                          isCurrent
                            ? 'text-amber-900 dark:text-amber-400'
                            : isCompleted
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-stone-400 dark:text-stone-600'
                        }`}
                      >
                        Step {idx + 1}
                      </span>

                      <span
                        className={`text-xs sm:text-sm font-bold block mt-0.5 ${
                          isCurrent
                            ? 'text-stone-900 dark:text-stone-100'
                            : isCompleted
                            ? 'text-stone-800 dark:text-stone-200'
                            : 'text-stone-400 dark:text-stone-600'
                        }`}
                      >
                        {step.name}
                      </span>

                      <span className="hidden md:block text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 max-w-[130px] leading-tight mx-auto">
                        {step.shortDesc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Progress Bar Card */}
            <div className="mt-8 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Overall Completion:
                </span>
                <span className="text-xs font-extrabold text-amber-900 dark:text-amber-400 tabular-nums">
                  {progressPercent}%
                </span>
              </div>

              <div className="w-full sm:w-64 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Section (Only allowed in Preparing state) */}
        {isPreparing && (
          <div className="p-6 sm:p-8 border-t border-stone-100 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-stone-100 m-0">
                Need to cancel this order?
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 m-0 mt-0.5">
                Cancellations are accepted while the kitchen is still in initial preparation.
              </p>
            </div>

            <form action={handleCancel}>
              <input type="hidden" name="orderId" value={order.id} />
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
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