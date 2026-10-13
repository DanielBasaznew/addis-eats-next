'use client';

import dynamic from 'next/dynamic';
import { Component } from 'react';

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="status"
          className="flex h-[340px] sm:h-[400px] w-full items-center justify-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 p-6 text-center text-sm text-stone-600 dark:text-stone-400"
        >
          <div>
            <div className="text-3xl mb-2">🗺️</div>
            <p className="font-semibold text-stone-800 dark:text-stone-200">
              Interactive map view currently unavailable.
            </p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Please refer to the written delivery address and courier timeline beside the map.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Dynamic import with ssr: false ensures Leaflet never runs on the server (Day 47 principle)
const DeliveryMap = dynamic(() => import('./DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[340px] sm:h-[400px] w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex items-center justify-center"
      aria-label="Loading delivery route map"
      role="status"
    >
      <div className="text-center text-stone-400 dark:text-stone-500">
        <div className="inline-block animate-spin text-xl mb-2">⏳</div>
        <p className="text-xs font-medium">Initializing Addis Ababa delivery map...</p>
      </div>
    </div>
  ),
});

export default function MapPanel(props) {
  return (
    <MapErrorBoundary>
      <DeliveryMap {...props} />
    </MapErrorBoundary>
  );
}
