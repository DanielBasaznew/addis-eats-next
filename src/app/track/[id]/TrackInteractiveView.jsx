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
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-900 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/50 self-start sm:self-auto">
            <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Sector: {currentOrder.area || 'Addis Ababa'}</span>
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
