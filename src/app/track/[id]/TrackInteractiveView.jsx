'use client';

import { useCallback, useEffect, useState } from 'react';
import OrderStatus from '@/components/OrderStatus';
import MapPanel from './MapPanel';

/**
 * TrackInteractiveView coordinates real-time status updates between
 * the OrderStatus telemetry progress bar and the Leaflet DeliveryMap.
 */
export default function TrackInteractiveView({ initialOrder, children }) {
  const [currentOrder, setCurrentOrder] = useState(initialOrder);

  useEffect(() => {
    if (initialOrder) {
      setCurrentOrder(initialOrder);
    }
  }, [initialOrder]);

  const handleStatusChange = useCallback((updated) => {
    setCurrentOrder((prev) => ({
      ...prev,
      status: updated?.status || prev.status,
      updatedAt: updated?.updatedAt || prev.updatedAt,
    }));
  }, []);

  return (
    <>
      {/* Live SSE Order Status Component */}
      <OrderStatus
        key={`order-status-${initialOrder.id}`}
        initialOrder={initialOrder}
        onStatusChange={handleStatusChange}
      />

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
            📍 Sector: {currentOrder.area || 'Addis Ababa'}
          </span>
        </div>

        {/* The Leaflet Map updates live whenever order status changes via SSE */}
        <MapPanel
          area={currentOrder.area || 'Bole'}
          orderId={currentOrder.id}
          status={currentOrder.status}
        />

        {/* Textual Delivery Information and Accessible Summary passed as children */}
        {children}
      </section>
    </>
  );
}
